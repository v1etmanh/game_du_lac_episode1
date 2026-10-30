const SESSION_STORAGE_KEY = 'dl_auth_session_v1'
const LOCAL_ACCOUNTS_KEY = 'dl_local_accounts_v1'
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

export function getSavedSession() {
  return safeReadJson(SESSION_STORAGE_KEY, null)
}

export function saveSession(session) {
  safeWriteJson(SESSION_STORAGE_KEY, session)
}

export function clearSession() {
  safeWriteJson(SESSION_STORAGE_KEY, null)
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

export async function loginOrRegister({ action, username, password, displayName }) {
  const cleanUser = normalizeUsername(username)
  const localProgress = getLocalProgress(cleanUser)

  try {
    const response = await fetch('/api/player-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        username: cleanUser,
        password,
        displayName: displayName || username,
        progress: localProgress,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      // If server storage is unconfigured on static hosting (500), fall back to local account store
      if (response.status >= 500) {
        return handleOfflineAuth({ action, username: cleanUser, password, displayName, localProgress })
      }
      throw new Error(data.error || 'Không thể xử lý yêu cầu đăng nhập.')
    }

    const mergedProgress = setLocalProgress(cleanUser, data.progress || {})
    const session = {
      token: data.token,
      user: data.user || { username: cleanUser, displayName: displayName || cleanUser },
      storage: 'cloud',
    }
    saveSession(session)
    return { session, progress: mergedProgress }
  } catch (err) {
    if (err.name === 'TypeError' || /fetch|network/i.test(err.message)) {
      return handleOfflineAuth({ action, username: cleanUser, password, displayName, localProgress })
    }
    throw err
  }
}

function handleOfflineAuth({ action, username, password, displayName, localProgress }) {
  const accounts = safeReadJson(LOCAL_ACCOUNTS_KEY, {})
  const existing = accounts[username]

  if (action === 'register') {
    if (existing) {
      throw new Error(
        'Tên tài khoản này đã được đăng ký trên trình duyệt này. Vui lòng chuyển sang Đăng nhập.',
      )
    }
    accounts[username] = {
      username,
      displayName: String(displayName || username).trim(),
      password,
      createdAt: new Date().toISOString(),
    }
    safeWriteJson(LOCAL_ACCOUNTS_KEY, accounts)
  } else {
    if (!existing) {
      throw new Error(
        'Chưa tìm thấy tài khoản này. Bạn hãy bấm sang tab "Đăng ký mới" để tạo hành trình nhé!',
      )
    }
    if (existing.password !== password) {
      throw new Error('Mật khẩu / mã PIN chưa đúng. Vui lòng kiểm tra lại.')
    }
  }

  const acc = accounts[username]
  const progress = setLocalProgress(username, localProgress)
  const session = {
    token: `local.${username}`,
    user: { username: acc.username, displayName: acc.displayName },
    storage: 'local',
  }
  saveSession(session)
  return { session, progress }
}

export async function fetchRemoteProgress(session) {
  const username = normalizeUsername(session?.user?.username)
  if (!username) return { ...DEFAULT_PROGRESS }
  const local = getLocalProgress(username)

  try {
    const headers = {}
    if (session?.token && !session.token.startsWith('local.')) {
      headers.Authorization = `Bearer ${session.token}`
    }
    const response = await fetch(
      `/api/player-progress?username=${encodeURIComponent(username)}`,
      { headers },
    )
    if (!response.ok) return local
    const data = await response.json()
    return setLocalProgress(username, data.progress || {})
  } catch {
    return local
  }
}

export async function syncProgress(session, progressUpdate) {
  const username = normalizeUsername(session?.user?.username)
  if (!username) return { ...DEFAULT_PROGRESS }

  const merged = setLocalProgress(username, progressUpdate)

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (session?.token && !session.token.startsWith('local.')) {
      headers.Authorization = `Bearer ${session.token}`
    }
    const response = await fetch('/api/player-progress', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username,
        progress: progressUpdate?.reset ? progressUpdate : merged,
      }),
      keepalive: true,
    })
    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      if (data?.progress) {
        return setLocalProgress(username, data.progress)
      }
    }
  } catch {
    // Local progress is already saved; ignore network failure
  }

  return merged
}

