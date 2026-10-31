// Player auth: GET ?action=login (→ Google), GET ?action=me, POST ?action=logout.
// Google redirects back to /api/auth-callback.
import { getQuery } from './_lib/auth.js'
import {
  SESSION_COOKIE,
  clearCookie,
  currentUser,
  googleConfig,
  newState,
  redirect,
  redirectUri,
  stateCookie,
} from './_lib/userAuth.js'

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const { action } = getQuery(req)

  if (action === 'me') {
    return res.status(200).json({ user: currentUser(req), enabled: Boolean(googleConfig()) })
  }

  if (action === 'logout') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    res.setHeader('Set-Cookie', clearCookie(req, SESSION_COOKIE))
    return res.status(200).json({ ok: true })
  }

  if (action === 'login') {
    const cfg = googleConfig()
    if (!cfg) return redirect(res, '/?login_error=not_configured')
    const state = newState()
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: redirectUri(req),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    })
    return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${params}`, [stateCookie(req, state)])
  }

  return res.status(400).json({ error: 'Unknown action' })
}
