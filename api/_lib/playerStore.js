// Journey progress of players signed in with Google.
// Uses Supabase (via the existing `public.events` table with session_id = '__account__')
// when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured; otherwise falls back to
// a local JSON file `.data/players.json` for local development.
import './env.js'
import fs from 'fs/promises'
import path from 'path'

const LOCAL_PLAYERS_FILE = path.join(process.cwd(), '.data', 'players.json')
const ACCOUNT_SESSION_ID = '__account__'
const EVENT_PROGRESS = 'account_progress'

export const DEFAULT_PROGRESS = {
  unlockedLocations: ['cong_lang'],
  completedLocations: [],
  journalUnlockedIds: [],
  lastLocationId: null,
  introCompleted: false,
  updatedAt: null,
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url: url.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, ''), key: key.trim() }
}

function headers(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export function normalizeUsername(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .slice(0, 32)
}

// Storage key (player_id column) for a Google account.
export function playerKey(googleId) {
  return normalizeUsername(`g_${googleId}`)
}

function sanitizeArray(arr, maxLen = 50) {
  if (!Array.isArray(arr)) return []
  const unique = new Set()
  for (const item of arr) {
    if (typeof item === 'string' && item.trim()) {
      unique.add(item.trim().slice(0, 48))
    }
    if (unique.size >= maxLen) break
  }
  return [...unique]
}

export function sanitizeProgress(raw = {}, previous = DEFAULT_PROGRESS) {
  const prev = previous || DEFAULT_PROGRESS
  const unlocked = new Set([
    'cong_lang',
    ...(prev.unlockedLocations || []),
    ...sanitizeArray(raw.unlockedLocations),
  ])
  const completed = new Set([
    ...(prev.completedLocations || []),
    ...sanitizeArray(raw.completedLocations),
  ])
  const journal = new Set([
    ...(prev.journalUnlockedIds || []),
    ...sanitizeArray(raw.journalUnlockedIds),
  ])

  // If raw explicitly requests a reset (reset === true), replace instead of union
  if (raw.reset === true) {
    return {
      unlockedLocations: sanitizeArray(raw.unlockedLocations).length
        ? sanitizeArray(raw.unlockedLocations)
        : ['cong_lang'],
      completedLocations: sanitizeArray(raw.completedLocations),
      journalUnlockedIds: sanitizeArray(raw.journalUnlockedIds),
      lastLocationId:
        typeof raw.lastLocationId === 'string' ? raw.lastLocationId.slice(0, 40) : null,
      introCompleted: Boolean(raw.introCompleted),
      updatedAt: new Date().toISOString(),
    }
  }

  return {
    unlockedLocations: [...unlocked],
    completedLocations: [...completed],
    journalUnlockedIds: [...journal],
    lastLocationId:
      raw.lastLocationId !== undefined
        ? typeof raw.lastLocationId === 'string'
          ? raw.lastLocationId.slice(0, 40)
          : null
        : prev.lastLocationId || null,
    introCompleted: Boolean(raw.introCompleted || prev.introCompleted),
    updatedAt: new Date().toISOString(),
  }
}

async function readLocalStore() {
  try {
    const raw = await fs.readFile(LOCAL_PLAYERS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function writeLocalStore(data) {
  await fs.mkdir(path.dirname(LOCAL_PLAYERS_FILE), { recursive: true })
  await fs.writeFile(LOCAL_PLAYERS_FILE, JSON.stringify(data, null, 2), 'utf8')
}

export async function getPlayerRecord(username) {
  const userKey = normalizeUsername(username)
  if (!userKey) return null

  const cfg = supabaseConfig()
  if (cfg) {
    const query = [
      'select=created_at,event,props',
      `session_id=eq.${encodeURIComponent(ACCOUNT_SESSION_ID)}`,
      `player_id=eq.${encodeURIComponent(userKey)}`,
      'order=created_at.desc',
      'limit=50',
    ].join('&')

    const response = await fetch(`${cfg.url}/rest/v1/events?${query}`, {
      headers: headers(cfg.key),
    })
    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status} ${await response.text()}`)
    }
    const rows = await response.json()
    if (!Array.isArray(rows) || rows.length === 0) return null

    const progressRows = rows.filter((r) => r.event === EVENT_PROGRESS).reverse()
    if (progressRows.length === 0) return null
    let mergedProgress = { ...DEFAULT_PROGRESS }
    for (const row of progressRows) {
      mergedProgress = sanitizeProgress(row.props || {}, mergedProgress)
      if (row.props?.updatedAt) mergedProgress.updatedAt = row.props.updatedAt
    }

    return { username: userKey, progress: mergedProgress }
  }

  const store = await readLocalStore()
  const record = store[userKey]
  if (!record) return null
  return {
    ...record,
    progress: sanitizeProgress(record.progress || {}, DEFAULT_PROGRESS),
  }
}

export async function savePlayerProgress(username, incomingProgress) {
  const userKey = normalizeUsername(username)
  if (!userKey) throw new Error('Invalid username')

  const existing = await getPlayerRecord(userKey)
  const merged = sanitizeProgress(incomingProgress, existing?.progress || DEFAULT_PROGRESS)
  const now = new Date().toISOString()

  const cfg = supabaseConfig()
  if (cfg) {
    const row = {
      created_at: now,
      session_id: ACCOUNT_SESSION_ID,
      player_id: userKey,
      event: EVENT_PROGRESS,
      location_id: merged.lastLocationId,
      props: merged,
    }
    const response = await fetch(`${cfg.url}/rest/v1/events`, {
      method: 'POST',
      headers: headers(cfg.key, { Prefer: 'return=minimal' }),
      body: JSON.stringify([row]),
    })
    if (!response.ok) {
      throw new Error(`Supabase progress save failed: ${response.status} ${await response.text()}`)
    }
    return merged
  }

  const store = await readLocalStore()
  if (!store[userKey]) {
    store[userKey] = {
      username: userKey,
      displayName: userKey,
      createdAt: now,
      progress: merged,
    }
  } else {
    store[userKey].progress = merged
  }
  await writeLocalStore(store)
  return merged
}

