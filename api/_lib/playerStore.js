// Player account & journey progress storage.
// Uses Supabase (via the existing `public.events` table with session_id = '__account__')
// when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured; otherwise falls back to
// a local JSON file `.data/players.json` for local development.
import './env.js'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const LOCAL_PLAYERS_FILE = path.join(process.cwd(), '.data', 'players.json')
const ACCOUNT_SESSION_ID = '__account__'
const EVENT_REGISTER = 'account_register'
const EVENT_PROGRESS = 'account_progress'
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

const DEFAULT_PROGRESS = {
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

function tokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || 'du-lac-player-secret-key-2026'
}

export function normalizeUsername(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .slice(0, 32)
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) return false
  const { hash } = hashPassword(password, salt)
  const bufA = Buffer.from(hash, 'hex')
  const bufB = Buffer.from(expectedHash, 'hex')
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

export function issuePlayerToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: normalizeUsername(username), exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url')
  const sig = crypto.createHmac('sha256', tokenSecret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyPlayerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expectedSig = crypto.createHmac('sha256', tokenSecret()).update(payload).digest('base64url')
  const bufA = Buffer.from(signature)
  const bufB = Buffer.from(expectedSig)
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.u || typeof data.exp !== 'number' || data.exp <= Date.now()) return null
    return data.u
  } catch {
    return null
  }
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

    const registerRow = rows.find((r) => r.event === EVENT_REGISTER)
    if (!registerRow) return null

    const progressRows = rows.filter((r) => r.event === EVENT_PROGRESS).reverse()
    let mergedProgress = { ...DEFAULT_PROGRESS }
    for (const row of progressRows) {
      mergedProgress = sanitizeProgress(row.props || {}, mergedProgress)
      if (row.props?.updatedAt) mergedProgress.updatedAt = row.props.updatedAt
    }

    return {
      username: userKey,
      displayName: registerRow.props?.displayName || userKey,
      salt: registerRow.props?.salt,
      passwordHash: registerRow.props?.passwordHash,
      createdAt: registerRow.created_at,
      progress: mergedProgress,
    }
  }

  const store = await readLocalStore()
  const record = store[userKey]
  if (!record) return null
  return {
    ...record,
    progress: sanitizeProgress(record.progress || {}, DEFAULT_PROGRESS),
  }
}

export async function createPlayerRecord({ username, displayName, password, initialProgress }) {
  const userKey = normalizeUsername(username)
  const cleanDisplayName = String(displayName || username || '')
    .trim()
    .slice(0, 40)
  const { salt, hash } = hashPassword(password)
  const now = new Date().toISOString()
  const progress = sanitizeProgress(initialProgress || {}, DEFAULT_PROGRESS)

  const cfg = supabaseConfig()
  if (cfg) {
    const rows = [
      {
        created_at: now,
        session_id: ACCOUNT_SESSION_ID,
        player_id: userKey,
        event: EVENT_REGISTER,
        location_id: null,
        props: {
          username: userKey,
          displayName: cleanDisplayName,
          salt,
          passwordHash: hash,
          createdAt: now,
        },
      },
      {
        created_at: now,
        session_id: ACCOUNT_SESSION_ID,
        player_id: userKey,
        event: EVENT_PROGRESS,
        location_id: progress.lastLocationId,
        props: progress,
      },
    ]

    const response = await fetch(`${cfg.url}/rest/v1/events`, {
      method: 'POST',
      headers: headers(cfg.key, { Prefer: 'return=minimal' }),
      body: JSON.stringify(rows),
    })
    if (!response.ok) {
      throw new Error(`Supabase register failed: ${response.status} ${await response.text()}`)
    }

    return {
      username: userKey,
      displayName: cleanDisplayName,
      createdAt: now,
      progress,
    }
  }

  const store = await readLocalStore()
  store[userKey] = {
    username: userKey,
    displayName: cleanDisplayName,
    salt,
    passwordHash: hash,
    createdAt: now,
    progress,
  }
  await writeLocalStore(store)

  return {
    username: userKey,
    displayName: cleanDisplayName,
    createdAt: now,
    progress,
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

