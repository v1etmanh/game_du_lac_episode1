// Player login with Google (OAuth 2.0 authorization code flow).
// The signed-in user is kept in an HttpOnly cookie signed with AUTH_SECRET.
// Admin login (auth.js) is separate and unaffected.
import './env.js'
import crypto from 'crypto'

export const SESSION_COOKIE = 'dl_user'
export const STATE_COOKIE = 'dl_oauth_state'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const STATE_TTL_SEC = 10 * 60

export function googleConfig() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

function secret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_TOKEN_SECRET ||
    `du-lac-user:${process.env.GOOGLE_CLIENT_SECRET || 'dev'}`
  )
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

export function siteOrigin(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.trim().replace(/\/+$/, '')
  const h = req.headers || {}
  const proto = String(h['x-forwarded-proto'] || (req.socket?.encrypted ? 'https' : 'http')).split(',')[0].trim()
  const host = String(h['x-forwarded-host'] || h.host || 'localhost:5173').split(',')[0].trim()
  return `${proto}://${host}`
}

export function redirectUri(req) {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || `${siteOrigin(req)}/api/auth-callback`
}

export function parseCookies(req) {
  const out = {}
  for (const part of String(req.headers?.cookie || '').split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const key = part.slice(0, idx).trim()
    if (!key) continue
    try {
      out[key] = decodeURIComponent(part.slice(idx + 1).trim())
    } catch {
      out[key] = part.slice(idx + 1).trim()
    }
  }
  return out
}

export function cookie(req, name, value, maxAgeSec) {
  const secure = siteOrigin(req).startsWith('https://')
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function newState() {
  return crypto.randomBytes(24).toString('base64url')
}

export function stateCookie(req, state) {
  return cookie(req, STATE_COOKIE, state, STATE_TTL_SEC)
}

export function sessionCookie(req, user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      exp: Date.now() + SESSION_TTL_MS,
    }),
  ).toString('base64url')
  return cookie(req, SESSION_COOKIE, `${payload}.${sign(payload)}`, Math.floor(SESSION_TTL_MS / 1000))
}

export function clearCookie(req, name) {
  return cookie(req, name, '', 0)
}

export function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE] || ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof user.exp !== 'number' || user.exp <= Date.now() || !user.id) return null
    return { id: user.id, email: user.email, name: user.name, picture: user.picture }
  } catch {
    return null
  }
}

export function redirect(res, location, cookies = []) {
  if (cookies.length) res.setHeader('Set-Cookie', cookies)
  res.setHeader('Location', location)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(302).end()
}
