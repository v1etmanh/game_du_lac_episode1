// Journey progress: cached in localStorage per account and synced to /api/player-progress,
// which identifies the player from the Google login cookie.
const PROGRESS_PREFIX = 'dl_user_progress_v1:'

export const LOCATION_TO_JOURNAL_IDS = {
  cong_lang: ['mien-bac'],
  vuon_cay: ['mien-bac'],
  cho: ['cho-viet-nam'],
  nha_ba_tu: ['dan-bau'],
  nha_cu: ['hoi-lang'],
  den_lang: ['den-lang', 'o-an-quan'],
}

export const DEFAULT_PROGRESS = {
  unlockedLocations: ['cong_lang'],
  completedLocations: [],
  journalUnlockedIds: [],
  lastLocationId: null,
  introCompleted: false,
  updatedAt: null,
}

function safeReadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function safeWriteJson(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // ignore storage errors
  }
}

export function normalizeUsername(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .slice(0, 32)
}

export function mergeProgress(a = DEFAULT_PROGRESS, b = DEFAULT_PROGRESS) {
  if (b?.reset === true) {
    return {
      unlockedLocations: Array.isArray(b.unlockedLocations) && b.unlockedLocations.length
        ? [...new Set(b.unlockedLocations)]
        : ['cong_lang'],
      completedLocations: Array.isArray(b.completedLocations)
        ? [...new Set(b.completedLocations)]
        : [],
      journalUnlockedIds: Array.isArray(b.journalUnlockedIds)
        ? [...new Set(b.journalUnlockedIds)]
        : [],
      lastLocationId: b.lastLocationId || null,
      introCompleted: Boolean(b.introCompleted),
      updatedAt: new Date().toISOString(),
    }
  }

  const unlocked = new Set([
    'cong_lang',
    ...(a?.unlockedLocations || []),
    ...(b?.unlockedLocations || []),
  ])
  const completed = new Set([
    ...(a?.completedLocations || []),
    ...(b?.completedLocations || []),
  ])
  const journal = new Set([
    ...(a?.journalUnlockedIds || []),
    ...(b?.journalUnlockedIds || []),
  ])

  for (const locId of completed) {
    const mapped = LOCATION_TO_JOURNAL_IDS[locId]
    if (mapped) mapped.forEach((jId) => journal.add(jId))
  }

  return {
    unlockedLocations: [...unlocked],
    completedLocations: [...completed],
    journalUnlockedIds: [...journal],
    lastLocationId: b?.lastLocationId !== undefined ? b.lastLocationId : a?.lastLocationId || null,
    introCompleted: Boolean(a?.introCompleted || b?.introCompleted),
    updatedAt: b?.updatedAt || a?.updatedAt || new Date().toISOString(),
  }
}

export function getLocalProgress(username) {
  const key = normalizeUsername(username)
  if (!key) return { ...DEFAULT_PROGRESS }
  const stored = safeReadJson(`${PROGRESS_PREFIX}${key}`, null)
  return mergeProgress(DEFAULT_PROGRESS, stored || {})
}

export function setLocalProgress(username, progress) {
  const key = normalizeUsername(username)
  if (!key) return { ...DEFAULT_PROGRESS }
  const current = getLocalProgress(key)
  const merged = mergeProgress(current, progress)
  safeWriteJson(`${PROGRESS_PREFIX}${key}`, merged)
  return merged
}

// Google account id -> local cache key (matches playerKey() on the server).
export function playerKey(googleId) {
  return normalizeUsername(`g_${googleId}`)
}

export async function fetchRemoteProgress(username) {
  const local = getLocalProgress(username)
  try {
    const response = await fetch('/api/player-progress', { credentials: 'same-origin' })
    if (!response.ok) return local
    const data = await response.json()
    return setLocalProgress(username, data.progress || {})
  } catch {
    return local
  }
}

export async function syncProgress(username, progressUpdate) {
  const merged = setLocalProgress(username, progressUpdate)
  try {
    const response = await fetch('/api/player-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ progress: progressUpdate?.reset ? progressUpdate : merged }),
      keepalive: true,
    })
    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      if (data?.progress) return setLocalProgress(username, data.progress)
    }
  } catch {
    // Local progress is already saved; ignore network failure
  }
  return merged
}
