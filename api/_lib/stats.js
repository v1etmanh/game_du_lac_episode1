import { LOCATIONS } from '../../src/data/locations.js'

const TZ_OFFSET_MS = 7 * 60 * 60 * 1000 // Asia/Ho_Chi_Minh

export const FUNNEL_ORDER = [
  'cong_lang',
  'vuon_cay',
  'cho',
  'nha_ba_tu',
  'nha_minh',
  'ruong',
  'nha_hung',
  'nha_ba_ngan',
  'nha_cu',
  'den_lang',
]

const MINIGAME_LOCATIONS = ['vuon_cay', 'cho', 'nha_ba_tu', 'ruong', 'nha_ba_ngan', 'nha_cu', 'den_lang']
const MINIGAME_NAMES = {
  vuon_cay: 'Hái quả',
  cho: 'Bán hàng',
  nha_ba_tu: 'Đàn bầu',
  ruong: 'Thả diều',
  nha_ba_ngan: 'Lùa gà',
  nha_cu: 'Giải đố nhà cũ',
  den_lang: 'Ô ăn quan',
}
const INTERVIEW_LOCATIONS = ['nha_ba_tu', 'nha_hung', 'den_lang']

const SCREEN_NAMES = {
  intro: 'Intro',
  map: 'Bản đồ',
  dialog: 'Hội thoại',
  interview: 'Phỏng vấn',
  postInterviewDialog: 'Hội thoại sau phỏng vấn',
  postGameDialog: 'Hội thoại sau minigame',
  minigame: 'Minigame',
}

const locationName = (id) => LOCATIONS.find((l) => l.id === id)?.name || id

function vnDate(iso) {
  return new Date(new Date(iso).getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

function vnHour(iso) {
  return new Date(new Date(iso).getTime() + TZ_OFFSET_MS).getUTCHours()
}

function countBy(items, keyFn) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (key === undefined || key === null || key === '') continue
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function describe(e) {
  const p = e.props || {}
  switch (e.event) {
    case 'screen_view':
      return SCREEN_NAMES[p.screen] || p.screen
    case 'ui_click':
      return p.label
    case 'minigame_exit':
      return p.duration_ms ? `${Math.round(p.duration_ms / 1000)}s` : ''
    case 'session_start':
      return [p.device, p.os, p.browser, p.referrer].filter(Boolean).join(' · ')
    default:
      return ''
  }
}

export function buildStats(rawEvents, { from, to }) {
  const events = rawEvents.filter((e) => e && e.session_id && e.session_id !== '__account__')
  const sessions = new Map()
  for (const e of events) {
    if (!e.session_id || e.session_id === '__account__') continue
    let s = sessions.get(e.session_id)
    if (!s) {
      s = { id: e.session_id, player: e.player_id, events: [], info: {} }
      sessions.set(e.session_id, s)
    }
    s.events.push(e)
    if (e.event === 'session_start') s.info = e.props || {}
  }

  const sessionList = [...sessions.values()].map((s) => {
    const first = s.events[0]
    const last = s.events[s.events.length - 1]
    const durationSec = Math.max(0, (new Date(last.created_at) - new Date(first.created_at)) / 1000)
    const entered = new Set()
    const completed = new Set()
    let lastScreen = null
    let lastLocation = null
    for (const e of s.events) {
      if (e.event === 'location_enter') entered.add(e.location_id)
      if (e.event === 'location_complete') completed.add(e.location_id)
      if (e.event === 'screen_view') {
        lastScreen = e.props?.screen
        lastLocation = e.location_id
      }
    }
    return {
      ...s,
      start: first.created_at,
      end: last.created_at,
      durationSec,
      entered,
      completed,
      lastScreen,
      lastLocation,
      finished: completed.has('den_lang'),
    }
  })

  const players = new Map()
  for (const s of sessionList) {
    if (!players.has(s.player)) players.set(s.player, { returning: false })
    if (s.info.is_returning) players.get(s.player).returning = true
  }
  const returningPlayers = [...players.values()].filter((p) => p.returning).length

  const durations = sessionList.map((s) => s.durationSec)
  const totalPlaySec = durations.reduce((a, b) => a + b, 0)

  // Daily series covering the whole range
  const daily = new Map()
  const fromDay = vnDate(from)
  const toDay = vnDate(to)
  const rangeDays = (new Date(toDay) - new Date(fromDay)) / 86400000
  if (rangeDays <= 120) {
    for (let d = new Date(fromDay); d <= new Date(toDay); d.setUTCDate(d.getUTCDate() + 1)) {
      daily.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), sessions: 0, players: new Set() })
    }
  }
  for (const s of sessionList) {
    const day = vnDate(s.start)
    if (!daily.has(day)) daily.set(day, { date: day, sessions: 0, players: new Set() })
    const bucket = daily.get(day)
    bucket.sessions += 1
    bucket.players.add(s.player)
  }
  const dailySeries = [...daily.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, sessions: d.sessions, players: d.players.size }))

  const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour: `${hour}h`, sessions: 0 }))
  for (const s of sessionList) hourly[vnHour(s.start)].sessions += 1

  const funnel = FUNNEL_ORDER.map((id) => ({
    id,
    name: locationName(id),
    entered: sessionList.filter((s) => s.entered.has(id)).length,
    completed: sessionList.filter((s) => s.completed.has(id)).length,
  }))

  const dropoff = countBy(
    sessionList.filter((s) => !s.finished),
    (s) => {
      const screen = SCREEN_NAMES[s.lastScreen] || 'Chưa vào game'
      return s.lastLocation && s.lastScreen !== 'map' ? `${screen} · ${locationName(s.lastLocation)}` : screen
    },
  ).slice(0, 12)

  const minigames = MINIGAME_LOCATIONS.map((id) => {
    const starts = events.filter((e) => e.event === 'minigame_start' && e.location_id === id)
    const exits = events.filter((e) => e.event === 'minigame_exit' && e.location_id === id)
    const durs = exits.map((e) => Number(e.props?.duration_ms) || 0).filter((v) => v > 0)
    return {
      id,
      name: MINIGAME_NAMES[id],
      location: locationName(id),
      starts: starts.length,
      exits: exits.length,
      avgSec: durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length / 1000) : 0,
      medianSec: Math.round(median(durs) / 1000),
    }
  })

  const interviews = INTERVIEW_LOCATIONS.map((id) => ({
    id,
    name: locationName(id),
    starts: events.filter((e) => e.event === 'interview_start' && e.location_id === id).length,
    completes: events.filter((e) => e.event === 'interview_complete' && e.location_id === id).length,
    exits: events.filter((e) => e.event === 'interview_exit' && e.location_id === id).length,
  }))

  const clicks = events.filter((e) => e.event === 'ui_click')
  const recentSessions = [...sessionList]
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, 50)
    .map((s) => ({
      id: s.id,
      player: s.player,
      start: s.start,
      durationSec: Math.round(s.durationSec),
      device: s.info.device || '?',
      os: s.info.os || '?',
      browser: s.info.browser || '?',
      referrer: s.info.referrer || '',
      returning: Boolean(s.info.is_returning),
      completedCount: s.completed.size,
      finished: s.finished,
      lastScreen: SCREEN_NAMES[s.lastScreen] || '-',
      lastLocation: s.lastLocation ? locationName(s.lastLocation) : '',
      timeline: s.events
        .filter((e) => e.event !== 'heartbeat')
        .slice(-200)
        .map((e) => ({
          t: e.created_at,
          event: e.event,
          location: e.location_id ? locationName(e.location_id) : '',
          detail: describe(e),
        })),
    }))

  const sessionInfos = sessionList.map((s) => s.info)

  return {
    range: { from, to },
    totalEvents: events.length,
    kpis: {
      sessions: sessionList.length,
      players: players.size,
      newPlayers: players.size - returningPlayers,
      returningPlayers,
      avgSessionSec: sessionList.length ? Math.round(totalPlaySec / sessionList.length) : 0,
      medianSessionSec: Math.round(median(durations)),
      totalPlaySec: Math.round(totalPlaySec),
      finishedSessions: sessionList.filter((s) => s.finished).length,
      avgLocationsCompleted: sessionList.length
        ? Number((sessionList.reduce((a, s) => a + s.completed.size, 0) / sessionList.length).toFixed(1))
        : 0,
      lockedClicks: events.filter((e) => e.event === 'location_locked_click').length,
      journalOpens: events.filter((e) => e.event === 'journal_open').length,
    },
    daily: dailySeries,
    hourly,
    devices: countBy(sessionInfos, (i) => i.device),
    os: countBy(sessionInfos, (i) => i.os),
    browsers: countBy(sessionInfos, (i) => i.browser),
    referrers: countBy(sessionInfos, (i) => i.referrer).slice(0, 10),
    funnel,
    dropoff,
    minigames,
    interviews,
    topClicks: countBy(clicks, (e) => e.props?.label).slice(0, 20),
    recentSessions,
  }
}
