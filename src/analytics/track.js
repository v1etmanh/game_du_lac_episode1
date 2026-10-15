// Lightweight behaviour tracking. Events are batched and sent to /api/track.
// Every failure is swallowed: tracking must never break the game.

const ENDPOINT = '/api/track'
const FLUSH_INTERVAL_MS = 5000
const HEARTBEAT_INTERVAL_MS = 30000
const MAX_BATCH = 20

let queue = []
let sessionId = null
let playerId = null
let isReturning = false
let currentScreen = null
let enabled = false
let initialized = false

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function safeGet(storage, key) {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value)
  } catch {
    // storage unavailable (private mode etc.)
  }
}

function parseUserAgent(ua) {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|iPod|Android/i.test(ua)
      ? 'mobile'
      : 'desktop'

  let os = 'Khác'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Khác'
  if (/Zalo/i.test(ua)) browser = 'Zalo'
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) browser = 'Facebook'
  else if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera'
  else if (/CocCoc|coc_coc/i.test(ua)) browser = 'Cốc Cốc'
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung'
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox'
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua)) browser = 'Safari'

  return { device, os, browser }
}

function referrerHost() {
  try {
    if (!document.referrer) return 'Trực tiếp'
    const host = new URL(document.referrer).hostname
    return host === window.location.hostname ? 'Trực tiếp' : host
  } catch {
    return 'Trực tiếp'
  }
}

function send(events, useBeacon) {
  const body = JSON.stringify({ events })
  try {
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'text/plain' })
      if (navigator.sendBeacon(ENDPOINT, blob)) return
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}

function flush(useBeacon = false) {
  if (!enabled || queue.length === 0) return
  const batch = queue.splice(0, 50)
  send(batch, useBeacon)
  if (queue.length > 0) flush(useBeacon)
}

export function track(event, locationId = null, props = {}) {
  if (!enabled) return
  queue.push({
    event,
    session_id: sessionId,
    player_id: playerId,
    location_id: locationId,
    props: { ...props, screen: props.screen ?? currentScreen },
    ts: new Date().toISOString(),
  })
  if (queue.length >= MAX_BATCH) flush()
}

export function setScreen(screen, locationId = null) {
  if (screen === currentScreen) return
  currentScreen = screen
  track('screen_view', locationId, { screen })
}

function clickLabel(el) {
  const explicit = el.getAttribute('data-track')
  if (explicit) return explicit
  const aria = el.getAttribute('aria-label')
  if (aria) return aria.trim().slice(0, 60)
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 60)
  return el.className && typeof el.className === 'string'
    ? `.${el.className.split(' ')[0]}`
    : el.tagName.toLowerCase()
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const params = new URLSearchParams(window.location.search)
  if (window.location.pathname.startsWith('/admin') || params.has('notrack')) return
  enabled = true

  sessionId = safeGet(sessionStorage, 'dl_session_id')
  if (!sessionId) {
    sessionId = uuid()
    safeSet(sessionStorage, 'dl_session_id', sessionId)
  }
  playerId = safeGet(localStorage, 'dl_player_id')
  isReturning = Boolean(playerId)
  if (!playerId) {
    playerId = uuid()
    safeSet(localStorage, 'dl_player_id', playerId)
  }

  const { device, os, browser } = parseUserAgent(navigator.userAgent || '')
  track('session_start', null, {
    device,
    os,
    browser,
    referrer: referrerHost(),
    utm_source: params.get('utm_source') || undefined,
    screen_size: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    lang: navigator.language,
    is_returning: isReturning,
  })
  flush()

  setInterval(() => flush(), FLUSH_INTERVAL_MS)
  setInterval(() => {
    if (document.visibilityState === 'visible') track('heartbeat')
  }, HEARTBEAT_INTERVAL_MS)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      track('session_hidden')
      flush(true)
    }
  })
  window.addEventListener('pagehide', () => {
    track('session_end')
    flush(true)
  })

  document.addEventListener(
    'click',
    (e) => {
      const el = e.target?.closest?.('button, a, [role="button"], [data-track]')
      if (!el) return
      track('ui_click', null, { label: clickLabel(el) })
    },
    true,
  )
}
