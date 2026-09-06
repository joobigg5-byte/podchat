/**
 * Seeds the database with PodChat's starting catalogue.
 *
 * This is the content that used to be hardcoded in the frontend. Moving
 * it here means the CMS can edit it, counts can change, and nothing is
 * pretending to be dynamic while sitting in a constant.
 *
 * Safe to run more than once: it skips anything already present.
 */
import Database from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || './data'
const db = new Database(path.join(DATA_DIR, 'podchat.db'))

const now = () => new Date().toISOString()
const id = (p) => `${p}_${crypto.randomBytes(9).toString('hex')}`

/* Images live in the frontend bundle, referenced by key so the client
   maps them to its imported assets. */
const SHOWS = [
  { kind:'show', title:'Future Forward',    host:'Erika Lindholm',      category:'Tech',     subscribers:1200000, episode_count:148, img:'MIC_NEON',          color:'#7FA6F0', description:'Weekly deep dives into emerging technology and the future of human civilization.' },
  { kind:'show', title:'Money Moves',       host:'James Whitaker',      category:'Finance',  subscribers:3400000, episode_count:210, img:'MIC_GOLD_SILVER',   color:'#7FA6F0', description:'Practical financial advice for the next generation of wealth builders.' },
  { kind:'show', title:'Mind Matters',      host:'Dr. Sofia Marchetti', category:'Health',   subscribers:980000,  episode_count:89,  img:'STUDIO_LETS_TALK',  color:'#5A78C8', description:'Science-backed mental health conversations that actually help.' },
  { kind:'show', title:'Culture Crash',     host:'The Crew',            category:'Culture',  subscribers:2100000, episode_count:305, img:'LIVE_CROWD',        color:'#8FA8DE', description:'Where pop culture, politics and real life crash into each other.' },
  { kind:'show', title:'Startup Grind',     host:'Callum Reyes',        category:'Business', subscribers:1800000, episode_count:167, img:'STUDIO_TABLE',      color:'#9FB6DC', description:'From idea to exit — the unfiltered founder journey.' },
  { kind:'show', title:'The History Files', host:'Prof. Lin Wei',       category:'History',  subscribers:4100000, episode_count:421, img:'MIC_RED',           color:'#D2687A', description:'The stories history class never taught you, told the way they actually happened.' },

  { kind:'comedy', title:'Marcus Bright',         host:'Marcus Bright', category:'Observational',    subscribers:2100000, episode_count:84,  img:'COMEDY_NIGHT',    color:'#D2687A', description:'Raw, real, relatable. Marcus finds comedy in everyday madness.' },
  { kind:'comedy', title:'The Roast Room',        host:'The Roast Room', category:'Celebrity Roasts', subscribers:4700000, episode_count:210, img:'COMEDY_NEON',     color:'#7FA6F0', description:'No one is safe. The internet\u2019s most savage roast show.' },
  { kind:'comedy', title:'Open Mic Universe',     host:'Various',       category:'Stand-Up Sets',    subscribers:1300000, episode_count:340, img:'COMEDY_NIGHT',    color:'#8FA8DE', description:'New voices. Raw sets. The future of stand-up.' },
  { kind:'comedy', title:'Sketch Lab',            host:'Sketch Lab',    category:'Sketch Comedy',    subscribers:890000,  episode_count:127, img:'COMEDY_NEON',     color:'#5A78C8', description:'Absurdist sketches that go viral every single week.' },
  { kind:'comedy', title:'Pod Wars Comedy',       host:'Various',       category:'Debate & Roast',   subscribers:3200000, episode_count:96,  img:'STUDIO_PODCAST',  color:'#7FA6F0', description:'Two comedians. One hot topic. Audience decides who wins.' },
  { kind:'comedy', title:'Late Night Unfiltered', host:'Various',       category:'Talk Show',        subscribers:5600000, episode_count:412, img:'STUDIO_LETS_TALK', color:'#9FB6DC', description:'The show that starts where others are afraid to go.' },

  { kind:'interview', title:'The Mars Blueprint',        host:'Nina Calder', category:'Rafael Voss',  subscribers:0, episode_count:1, img:'STUDIO_BLUE',      color:'#7FA6F0', description:'An hour on what it actually takes to build somewhere new.' },
  { kind:'interview', title:'Music, Money & Motherhood', host:'Devon Marsh', category:'Aria Sloane',  subscribers:0, episode_count:1, img:'COMEDY_NEON',      color:'#D2687A', description:'Three careers, one life, no filter.' },
  { kind:'interview', title:'AI & the Future of Work',   host:'Tech Talks',  category:'Priya Anand',  subscribers:0, episode_count:1, img:'STUDIO_DESK',      color:'#8FA8DE', description:'What changes, what does not, and who decides.' },
  { kind:'interview', title:'Legacy & Leadership',       host:'Pod Legends', category:'Marisol Vega', subscribers:0, episode_count:1, img:'STUDIO_LETS_TALK', color:'#5A78C8', description:'Building something that outlives you.' },
]

const HIGHLIGHTS = [
  { kind:'live', title:'The AI Comedy Takeover',    host:'Marcus Bright \u00d7 Dr. Elena Vance', category:'Comedy \u00b7 Live Debate', subscribers:92100, episode_count:0, img:'STUDIO_DRAMATIC', color:'#D2687A', description:'Two worlds collide \u2014 stand-up comedy meets artificial intelligence in the most explosive live debate of the year.' },
  { kind:'live', title:'Open Mic: Midnight Sessions', host:'5 Comedians \u00b7 The Vault',       category:'Stand-Up \u00b7 Open Mic',  subscribers:67400, episode_count:0, img:'COMEDY_NIGHT',    color:'#9FB6DC', description:'The biggest open mic night returns. Five comedians, one stage, zero script.' },
  { kind:'live', title:'Wall Street Unfiltered',     host:'Zara Lindqvist',                      category:'Finance \u00b7 Podcast',    subscribers:31700, episode_count:0, img:'STUDIO_BLUE',     color:'#7FA6F0', description:'The finance podcast that Wall Street does not want you to hear.' },
  { kind:'live', title:'Pod Wars: Tech vs Humanity', host:'Various Hosts',                       category:'Debate \u00b7 Live',        subscribers:55900, episode_count:0, img:'LIVE_CROWD',      color:'#8FA8DE', description:'The most controversial debate format on the internet. Audience votes decide the winner live.' },
]

const insert = db.prepare(`
  INSERT INTO shows (id, owner_id, kind, title, host, category, description, img_url, color, subscribers, episode_count, published, created_at)
  VALUES (@id, NULL, @kind, @title, @host, @category, @description, @img_url, @color, @subscribers, @episode_count, 1, @created_at)
`)

const exists = db.prepare('SELECT id FROM shows WHERE title = ? AND kind = ?')

let added = 0
for (const row of [...SHOWS, ...HIGHLIGHTS]) {
  if (exists.get(row.title, row.kind)) continue
  insert.run({
    id: id('show'),
    kind: row.kind,
    title: row.title,
    host: row.host,
    category: row.category,
    description: row.description,
    img_url: row.img,
    color: row.color,
    subscribers: row.subscribers,
    episode_count: row.episode_count,
    created_at: now(),
  })
  added++
}

console.log(`[seed] added ${added} entries, skipped ${SHOWS.length + HIGHLIGHTS.length - added} already present`)
db.close()
