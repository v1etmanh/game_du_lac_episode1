import { insertEvents } from './_lib/store.js'
import { parseBody } from './_lib/auth.js'

const ALLOWED_EVENTS = new Set([
  'session_start',
  'session_hidden',
  'session_end',
  'heartbeat',
  'screen_view',
  'intro_finish',
  'location_enter',
  'location_locked_click',
  'location_complete',
  'dialog_finish',
  'interview_start',
  'interview_complete',
  'interview_exit',
  'minigame_start',
  'minigame_exit',
  'journal_open',
  'ui_click',
])

const MAX_EVENTS = 50
const MAX_SKEW_MS = 24 * 60 * 60 * 1000

function cleanString(value, max = 80) {
  if (value === undefined || value === null) return null
  return String(value).slice(0, max)
}

function cleanProps(props) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return {}
  const out = {}
  for (const [key, value] of Object.entries(props).slice(0, 20)) {
    if (value === undefined) continue
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      out[key.slice(0, 40)] = value
    } else {
      out[key.slice(0, 40)] = String(value).slice(0, 120)
    }
  }
  return out
}

function eventTime(ts) {
  const now = Date.now()
  const parsed = Date.parse(ts)
  if (Number.isNaN(parsed) || Math.abs(parsed - now) > MAX_SKEW_MS) return new Date(now).toISOString()
  return new Date(parsed).toISOString()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { events } = parseBody(req)
  if (!Array.isArray(events)) return res.status(400).json({ error: 'events must be an array' })

  const rows = events
    .slice(0, MAX_EVENTS)
    .filter((e) => e && ALLOWED_EVENTS.has(e.event) && e.session_id && e.player_id)
    .map((e) => ({
      created_at: eventTime(e.ts),
      session_id: cleanString(e.session_id, 64),
      player_id: cleanString(e.player_id, 64),
      event: e.event,
      location_id: cleanString(e.location_id, 40),
      props: cleanProps(e.props),
    }))

  try {
    await insertEvents(rows)
    return res.status(200).json({ ok: true, stored: rows.length })
  } catch (err) {
    console.error('[track] failed to store events', err)
    return res.status(500).json({ error: 'Failed to store events' })
  }
}
