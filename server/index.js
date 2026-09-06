/**
 * PodChat API
 *
 * Replaces the frontend's fake authentication with real accounts:
 * bcrypt-hashed passwords, JWT sessions, and an admin role that lives
 * in the database rather than a hardcoded array shipped to every browser.
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const PORT = process.env.PORT || 4100
const DATA_DIR = process.env.DATA_DIR || './data'
fs.mkdirSync(DATA_DIR, { recursive: true })

/* ── secrets ─────────────────────────────────────────────────────────
   Generated once and persisted. If JWT_SECRET is set in the environment
   that wins, which matters if you ever run more than one instance.     */
function loadOrCreateSecret(name) {
  if (process.env[name]) return process.env[name]
  const file = path.join(DATA_DIR, `${name.toLowerCase()}.key`)
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim()
  const secret = crypto.randomBytes(48).toString('hex')
  fs.writeFileSync(file, secret, { mode: 0o600 })
  return secret
}
const JWT_SECRET = loadOrCreateSecret('JWT_SECRET')

/* ── database ────────────────────────────────────────────────────── */
const db = new Database(path.join(DATA_DIR, 'podchat.db'))
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'listener',
  account_type  TEXT NOT NULL DEFAULT 'listener',
  pod_coins     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS shows (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL DEFAULT 'show',
  title        TEXT NOT NULL,
  host         TEXT,
  category     TEXT,
  description  TEXT,
  img_url      TEXT,
  color        TEXT,
  subscribers  INTEGER NOT NULL DEFAULT 0,
  episode_count INTEGER NOT NULL DEFAULT 0,
  published    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS episodes (
  id           TEXT PRIMARY KEY,
  show_id      TEXT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  audio_url    TEXT,
  duration_sec INTEGER,
  plays        INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_id    TEXT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, show_id)
);

CREATE TABLE IF NOT EXISTS plays (
  id         TEXT PRIMARY KEY,
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  seconds    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_episodes_show ON episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_shows_kind    ON shows(kind, published);
`)

const now = () => new Date().toISOString()
const id = (p) => `${p}_${crypto.randomBytes(9).toString('hex')}`

/* ── first admin ─────────────────────────────────────────────────────
   Created from env vars on first boot only. No hardcoded keys, and
   nothing about admin ever reaches the browser bundle.                */
function seedAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (exists) return
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, role, account_type, created_at)
    VALUES (?, ?, ?, ?, 'admin', 'creator', ?)
  `).run(id('user'), email.toLowerCase(), 'Admin', bcrypt.hashSync(password, 12), now())
  console.log(`[podchat] admin account created for ${email}`)
}
seedAdmin()

/* ── app ─────────────────────────────────────────────────────────── */
const app = express()
app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json({ limit: '1mb' }))

const origin = process.env.FRONTEND_ORIGIN
app.use(cors({ origin: origin || true, credentials: true }))

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }))
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many attempts. Try again in fifteen minutes.' },
})

/* ── helpers ─────────────────────────────────────────────────────── */
function sign(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, type: user.account_type },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function publicUser(u) {
  return {
    id: u.id, email: u.email, name: u.name,
    role: u.role, type: u.account_type,
    podCoins: u.pod_coins, createdAt: u.created_at,
  }
}

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      if (!required) return next()
      return res.status(401).json({ error: 'Sign in to continue.' })
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      // Role is read from the database, not the token, so a demoted
      // admin loses access immediately rather than when the token expires.
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub)
      if (!user) return res.status(401).json({ error: 'Account not found.' })
      req.user = user
      next()
    } catch {
      if (!required) return next()
      res.status(401).json({ error: 'Session expired. Sign in again.' })
    }
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    // Vague on purpose: do not confirm the route exists to a non-admin.
    return res.status(404).json({ error: 'Not found' })
  }
  next()
}

/* ── auth routes ─────────────────────────────────────────────────── */
app.post('/api/auth/signup', authLimiter, (req, res) => {
  const { email, password, name, type } = req.body ?? {}

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Enter your name.' })
  }

  const lower = email.toLowerCase().trim()
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(lower)) {
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }

  const user = {
    id: id('user'),
    email: lower,
    name: name.trim().slice(0, 80),
    password_hash: bcrypt.hashSync(password, 12),
    // Never trust a client-supplied role. Type is a preference; admin
    // can only ever be set in the database.
    role: 'listener',
    account_type: type === 'creator' ? 'creator' : 'listener',
    pod_coins: 0,
    created_at: now(),
  }

  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, role, account_type, pod_coins, created_at)
    VALUES (@id, @email, @name, @password_hash, @role, @account_type, @pod_coins, @created_at)
  `).run(user)

  res.status(201).json({ token: sign(user), user: publicUser(user) })
})

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim())

  // Same response whether the email is unknown or the password is wrong,
  // so the endpoint cannot be used to discover which emails are registered.
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }

  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now(), user.id)
  res.json({ token: sign(user), user: publicUser(user) })
})

app.get('/api/auth/me', auth(), (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.post('/api/auth/password', auth(), (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}
  if (!bcrypt.compareSync(currentPassword ?? '', req.user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 12), req.user.id)
  res.json({ ok: true })
})

/* ── content ─────────────────────────────────────────────────────── */
app.get('/api/shows', (req, res) => {
  const kind = req.query.kind
  const rows = kind
    ? db.prepare('SELECT * FROM shows WHERE published = 1 AND kind = ? ORDER BY subscribers DESC').all(String(kind))
    : db.prepare('SELECT * FROM shows WHERE published = 1 ORDER BY subscribers DESC').all()
  res.json(rows)
})

app.get('/api/shows/:showId', (req, res) => {
  const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(req.params.showId)
  if (!show) return res.status(404).json({ error: 'Show not found.' })
  const episodes = db.prepare(
    'SELECT * FROM episodes WHERE show_id = ? ORDER BY published_at DESC'
  ).all(show.id)
  res.json({ ...show, episodes })
})

app.post('/api/shows', auth(), (req, res) => {
  const { title, host, category, description, imgUrl, color, kind } = req.body ?? {}
  if (!title?.trim()) return res.status(400).json({ error: 'A title is required.' })

  const show = {
    id: id('show'),
    owner_id: req.user.id,
    kind: ['show', 'comedy', 'interview', 'live'].includes(kind) ? kind : 'show',
    title: title.trim().slice(0, 140),
    host: host?.trim() ?? req.user.name,
    category: category?.trim() ?? null,
    description: description?.trim() ?? null,
    img_url: imgUrl ?? null,
    color: color ?? null,
    created_at: now(),
  }

  db.prepare(`
    INSERT INTO shows (id, owner_id, kind, title, host, category, description, img_url, color, created_at)
    VALUES (@id, @owner_id, @kind, @title, @host, @category, @description, @img_url, @color, @created_at)
  `).run(show)

  res.status(201).json(show)
})

app.post('/api/shows/:showId/episodes', auth(), (req, res) => {
  const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(req.params.showId)
  if (!show) return res.status(404).json({ error: 'Show not found.' })
  if (show.owner_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'That is not your show.' })
  }

  const { title, description, audioUrl, durationSec } = req.body ?? {}
  if (!title?.trim()) return res.status(400).json({ error: 'An episode title is required.' })

  const ep = {
    id: id('ep'),
    show_id: show.id,
    title: title.trim().slice(0, 200),
    description: description?.trim() ?? null,
    audio_url: audioUrl ?? null,
    duration_sec: Number(durationSec) || null,
    published_at: now(),
    created_at: now(),
  }

  db.prepare(`
    INSERT INTO episodes (id, show_id, title, description, audio_url, duration_sec, published_at, created_at)
    VALUES (@id, @show_id, @title, @description, @audio_url, @duration_sec, @published_at, @created_at)
  `).run(ep)

  db.prepare('UPDATE shows SET episode_count = episode_count + 1 WHERE id = ?').run(show.id)
  res.status(201).json(ep)
})

/* ── subscriptions and plays: real counts, not decoration ────────── */
app.post('/api/shows/:showId/subscribe', auth(), (req, res) => {
  const show = db.prepare('SELECT id FROM shows WHERE id = ?').get(req.params.showId)
  if (!show) return res.status(404).json({ error: 'Show not found.' })

  const existing = db.prepare(
    'SELECT 1 FROM subscriptions WHERE user_id = ? AND show_id = ?'
  ).get(req.user.id, show.id)

  if (existing) {
    db.prepare('DELETE FROM subscriptions WHERE user_id = ? AND show_id = ?').run(req.user.id, show.id)
    db.prepare('UPDATE shows SET subscribers = MAX(0, subscribers - 1) WHERE id = ?').run(show.id)
    return res.json({ subscribed: false })
  }

  db.prepare('INSERT INTO subscriptions (user_id, show_id, created_at) VALUES (?, ?, ?)')
    .run(req.user.id, show.id, now())
  db.prepare('UPDATE shows SET subscribers = subscribers + 1 WHERE id = ?').run(show.id)
  res.json({ subscribed: true })
})

app.post('/api/episodes/:episodeId/play', auth(false), (req, res) => {
  const ep = db.prepare('SELECT id FROM episodes WHERE id = ?').get(req.params.episodeId)
  if (!ep) return res.status(404).json({ error: 'Episode not found.' })

  db.prepare('INSERT INTO plays (id, episode_id, user_id, seconds, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id('play'), ep.id, req.user?.id ?? null, Number(req.body?.seconds) || 0, now())
  db.prepare('UPDATE episodes SET plays = plays + 1 WHERE id = ?').run(ep.id)

  res.json({ ok: true })
})

/* ── admin ───────────────────────────────────────────────────────── */
app.get('/api/admin/stats', auth(), requireAdmin, (req, res) => {
  const one = (sql) => db.prepare(sql).get().n
  res.json({
    users:    one('SELECT COUNT(*) n FROM users'),
    creators: one("SELECT COUNT(*) n FROM users WHERE account_type = 'creator'"),
    shows:    one('SELECT COUNT(*) n FROM shows'),
    episodes: one('SELECT COUNT(*) n FROM episodes'),
    plays:    one('SELECT COUNT(*) n FROM plays'),
  })
})

app.get('/api/admin/users', auth(), requireAdmin, (req, res) => {
  const rows = db.prepare(
    'SELECT id, email, name, role, account_type, created_at, last_login_at FROM users ORDER BY created_at DESC LIMIT 200'
  ).all()
  res.json(rows)
})

app.post('/api/admin/users/:userId/role', auth(), requireAdmin, (req, res) => {
  const { role } = req.body ?? {}
  if (!['listener', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' })
  }
  if (req.params.userId === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin access.' })
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.userId)
  res.json({ ok: true })
})

/* ── health ──────────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }))

app.use((err, req, res, next) => {
  console.error('[podchat]', err?.message ?? err)
  res.status(500).json({ error: 'Something went wrong.' })
})

app.listen(PORT, () => console.log(`[podchat] api listening on ${PORT}`))
