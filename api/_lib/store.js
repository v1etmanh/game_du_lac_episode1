// Event storage. Uses Supabase (PostgREST) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// are set; otherwise falls back to a local JSONL file (only for local development).
import './env.js'
import fs from 'fs/promises'
import path from 'path'

const LOCAL_FILE = path.join(process.cwd(), '.data', 'events.jsonl')
const PAGE_SIZE = 1000
const MAX_ROWS = 100000

function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  // Accept both "https://x.supabase.co" and the REST URL "https://x.supabase.co/rest/v1/"
  return { url: url.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, ''), key: key.trim() }
}

export function storageMode() {
  if (supabaseConfig()) return 'supabase'
  return process.env.VERCEL ? 'none' : 'local'
}

function headers(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export async function insertEvents(rows) {
  if (rows.length === 0) return
  const cfg = supabaseConfig()
  if (cfg) {
    const response = await fetch(`${cfg.url}/rest/v1/events`, {
      method: 'POST',
      headers: headers(cfg.key, { Prefer: 'return=minimal' }),
      body: JSON.stringify(rows),
    })
    if (!response.ok) {
      throw new Error(`Supabase insert failed: ${response.status} ${await response.text()}`)
    }
    return
  }
  if (storageMode() === 'none') throw new Error('Storage is not configured')

  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true })
  await fs.appendFile(LOCAL_FILE, rows.map((row) => JSON.stringify(row)).join('\n') + '\n', 'utf8')
}

export async function fetchEvents(fromIso, toIso) {
  const cfg = supabaseConfig()
  if (cfg) {
    const rows = []
    const filters = [`created_at=gte.${encodeURIComponent(fromIso)}`, `created_at=lte.${encodeURIComponent(toIso)}`]
    for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
      const query = `select=created_at,session_id,player_id,event,location_id,props&${filters.join('&')}&order=created_at.asc&limit=${PAGE_SIZE}&offset=${offset}`
      const response = await fetch(`${cfg.url}/rest/v1/events?${query}`, { headers: headers(cfg.key) })
      if (!response.ok) {
        throw new Error(`Supabase select failed: ${response.status} ${await response.text()}`)
      }
      const page = await response.json()
      rows.push(...page)
      if (page.length < PAGE_SIZE) break
    }
    return rows
  }
  if (storageMode() === 'none') return []

  let raw = ''
  try {
    raw = await fs.readFile(LOCAL_FILE, 'utf8')
  } catch {
    return []
  }
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter((row) => row && row.created_at >= fromIso && row.created_at <= toIso)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

// --- Users signed in with Google (table public.users, or .data/users.json locally) ---
const LOCAL_USERS_FILE = path.join(process.cwd(), '.data', 'users.json')

async function readLocalUsers() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_USERS_FILE, 'utf8'))
  } catch {
    return []
  }
}

// Creates the user on first login, otherwise refreshes the profile and bumps login_count.
export async function upsertUser(profile) {
  const now = new Date().toISOString()
  const cfg = supabaseConfig()
  if (cfg) {
    const existingRes = await fetch(
      `${cfg.url}/rest/v1/users?id=eq.${encodeURIComponent(profile.id)}&select=created_at,login_count`,
      { headers: headers(cfg.key) },
    )
    if (!existingRes.ok) {
      throw new Error(`Supabase select users failed: ${existingRes.status} ${await existingRes.text()}`)
    }
    const [existing] = await existingRes.json()
    const row = {
      ...profile,
      created_at: existing?.created_at || now,
      last_login_at: now,
      login_count: (existing?.login_count || 0) + 1,
    }
    const response = await fetch(`${cfg.url}/rest/v1/users?on_conflict=id`, {
      method: 'POST',
      headers: headers(cfg.key, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(row),
    })
    if (!response.ok) {
      throw new Error(`Supabase upsert user failed: ${response.status} ${await response.text()}`)
    }
    return row
  }
  if (storageMode() === 'none') throw new Error('Storage is not configured')

  const users = await readLocalUsers()
  const index = users.findIndex((u) => u.id === profile.id)
  const existing = users[index]
  const row = {
    ...profile,
    created_at: existing?.created_at || now,
    last_login_at: now,
    login_count: (existing?.login_count || 0) + 1,
  }
  if (index >= 0) users[index] = row
  else users.push(row)
  await fs.mkdir(path.dirname(LOCAL_USERS_FILE), { recursive: true })
  await fs.writeFile(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
  return row
}

export async function fetchUsers() {
  const cfg = supabaseConfig()
  if (cfg) {
    const rows = []
    for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
      const query = `select=id,email,name,picture,created_at,last_login_at,login_count&order=created_at.asc&limit=${PAGE_SIZE}&offset=${offset}`
      const response = await fetch(`${cfg.url}/rest/v1/users?${query}`, { headers: headers(cfg.key) })
      if (!response.ok) {
        throw new Error(`Supabase select users failed: ${response.status} ${await response.text()}`)
      }
      const page = await response.json()
      rows.push(...page)
      if (page.length < PAGE_SIZE) break
    }
    return rows
  }
  if (storageMode() === 'none') return []
  return readLocalUsers()
}
