/**
 * PodChat API client.
 *
 * Everything the frontend needs to talk to the real backend. Import from
 * PodChat.jsx and the hardcoded catalogue can go.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'https://podchat.wittyhub.co'

/* ── token handling ──────────────────────────────────────────────── */

export function getToken() {
  try { return localStorage.getItem('podchat_token') } catch { return null }
}

export function setToken(t) {
  try { t ? localStorage.setItem('podchat_token', t) : localStorage.removeItem('podchat_token') } catch {}
}

async function request(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })

  // 204 has no body
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

/* ── auth ────────────────────────────────────────────────────────── */

export const api = {
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login:  (body) => request('/api/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  me:     ()     => request('/api/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  /* ── content ───────────────────────────────────────────────────── */

  shows:     (kind) => request(`/api/shows${kind ? `?kind=${encodeURIComponent(kind)}` : ''}`),
  show:      (showId) => request(`/api/shows/${showId}`),
  createShow: (body) => request('/api/shows', { method: 'POST', body: JSON.stringify(body) }),

  addEpisode: (showId, body) =>
    request(`/api/shows/${showId}/episodes`, { method: 'POST', body: JSON.stringify(body) }),

  subscribe: (showId) => request(`/api/shows/${showId}/subscribe`, { method: 'POST' }),

  logPlay: (episodeId, seconds = 0) =>
    request(`/api/episodes/${episodeId}/play`, {
      method: 'POST',
      body: JSON.stringify({ seconds }),
    }),

  /* ── admin ─────────────────────────────────────────────────────── */

  adminStats: () => request('/api/admin/stats'),
  adminUsers: () => request('/api/admin/users'),
  setUserRole: (userId, role) =>
    request(`/api/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
}

/* ── media upload ────────────────────────────────────────────────────
   Audio and cover art go straight from the browser to Cloudinary, so
   large files never pass through the server. Returns the CDN URL.      */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadMedia(file, onProgress) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Media uploads are not configured yet.')
  }

  const kind = file.type.startsWith('audio') || file.type.startsWith('video') ? 'video' : 'image'
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)

  // XHR rather than fetch, because fetch cannot report upload progress
  // and podcast files are large enough that people need to see it moving.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${kind}/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: res.secure_url, durationSec: Math.round(res.duration || 0) })
        } else {
          reject(new Error(res.error?.message || 'Upload failed.'))
        }
      } catch {
        reject(new Error('Upload failed.'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
    xhr.send(form)
  })
}

/* ── image key mapping ───────────────────────────────────────────────
   The database stores a key like 'MIC_NEON'; the frontend maps it to
   the imported asset. Keeps bundled images working while the rest of
   the record lives in the database.                                    */

export function resolveImage(key, images) {
  return images[key] || images.STUDIO_BLUE || ''
}
