import { getQuery } from './_lib/auth.js'
import { upsertUser } from './_lib/store.js'
import {
  STATE_COOKIE,
  clearCookie,
  googleConfig,
  parseCookies,
  redirect,
  redirectUri,
  sessionCookie,
} from './_lib/userAuth.js'

export default async function handler(req, res) {
  const { code, state, error } = getQuery(req)
  const fail = (reason) => redirect(res, `/?login_error=${encodeURIComponent(reason)}`, [clearCookie(req, STATE_COOKIE)])

  if (error) return fail(error)
  const cfg = googleConfig()
  if (!cfg) return fail('not_configured')
  const expectedState = parseCookies(req)[STATE_COOKIE]
  if (!code || !state || !expectedState || state !== expectedState) return fail('invalid_state')

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: redirectUri(req),
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json().catch(() => ({}))
    if (!tokenRes.ok || !tokens.access_token) {
      throw new Error(`token exchange failed: ${tokenRes.status} ${tokens.error || ''}`)
    }

    const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const info = await infoRes.json().catch(() => ({}))
    if (!infoRes.ok || !info.sub) throw new Error(`userinfo failed: ${infoRes.status}`)

    const profile = {
      id: String(info.sub),
      email: info.email || null,
      name: info.name || info.email || 'Người chơi',
      picture: info.picture || null,
      email_verified: Boolean(info.email_verified),
      locale: info.locale || null,
    }

    try {
      await upsertUser(profile)
    } catch (err) {
      // Still let the player in; only the admin user list is affected.
      console.error('[auth-callback] failed to store user', err)
    }

    return redirect(res, '/', [sessionCookie(req, profile), clearCookie(req, STATE_COOKIE)])
  } catch (err) {
    console.error('[auth-callback] login failed', err)
    return fail('google_failed')
  }
}
