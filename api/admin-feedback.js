import { env } from './_lib/env.js'
import { isAuthorized } from './_lib/auth.js'
import { parseCsv } from './_lib/csv.js'

const SHEET_ID = env('FEEDBACK_SHEET_ID', '10kfOze17QGdbVMlkLss7nTCKJsCXPTNX7-auCFvlGds')
const SHEET_GID = env('FEEDBACK_SHEET_GID', '922517834')
const CSV_URL = env('FEEDBACK_CSV_URL', `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`)
const SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`
const CACHE_MS = 60 * 1000

const EMPTY_COMMENTS = new Set([
  '', 'null', 'none', 'no', 'nope', 'k', 'ko', 'khong', 'không', 'không có', 'ko có', 'khong co',
  'dạ không', 'da khong', 'không ạ', 'ko ạ', 'n/a', 'na', '.', '-', '...',
])

let cache = null

function findColumn(headers, ...keywords) {
  const lower = headers.map((h) => h.normalize('NFC').toLowerCase())
  return lower.findIndex((h) => keywords.some((k) => h.includes(k)))
}

// "30/06/2026 14:05:09" (Asia/Ho_Chi_Minh) -> ISO string
function parseTimestamp(value) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value.trim())
  if (!m) return null
  const [, d, mo, y, h, mi, s = '0'] = m
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 7, +mi, +s)).toISOString()
}

function countValues(values) {
  const map = new Map()
  for (const v of values) {
    const key = v.trim()
    if (!key) continue
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

function summarize(rows) {
  const [headers, ...data] = rows
  const col = {
    time: findColumn(headers, 'dấu thời gian', 'timestamp'),
    rating: findColumn(headers, 'chấm điểm', 'điểm'),
    favorite: findColumn(headers, 'hài lòng'),
    download: findColumn(headers, 'tải'),
    pay: findColumn(headers, 'chi trả'),
    comment: findColumn(headers, 'ý kiến', 'góp ý'),
  }
  const get = (row, key) => (col[key] >= 0 ? (row[col[key]] || '').trim() : '')

  const responses = data.map((row) => ({
    time: parseTimestamp(get(row, 'time')),
    rating: Number.parseInt(get(row, 'rating'), 10) || null,
    favorite: get(row, 'favorite'),
    download: get(row, 'download'),
    pay: get(row, 'pay'),
    comment: get(row, 'comment'),
  }))

  const ratings = responses.map((r) => r.rating).filter((r) => r >= 1 && r <= 5)
  const ratingDistribution = [1, 2, 3, 4, 5].map((score) => ({
    name: `${score} ★`,
    score,
    value: ratings.filter((r) => r === score).length,
  }))

  const byDay = new Map()
  for (const r of responses) {
    if (!r.time) continue
    const day = new Date(Date.parse(r.time) + 7 * 3600000).toISOString().slice(0, 10)
    byDay.set(day, (byDay.get(day) || 0) + 1)
  }

  const payOptions = countValues(responses.map((r) => r.pay)).map((o) => o.name)
  const ratingByPay = [1, 2, 3, 4, 5].map((score) => {
    const entry = { name: `${score} ★` }
    for (const option of payOptions) {
      entry[option] = responses.filter((r) => r.rating === score && r.pay === option).length
    }
    return entry
  })

  const download = countValues(responses.map((r) => r.download))
  const pay = countValues(responses.map((r) => r.pay))
  const share = (list, keyword) => {
    const hit = list.find((o) => o.name.toLowerCase().includes(keyword))
    return responses.length && hit ? hit.value / responses.length : 0
  }
  const payWilling = pay
    .filter((o) => !o.name.toLowerCase().startsWith('không'))
    .reduce((sum, o) => sum + o.value, 0)

  return {
    total: responses.length,
    avgRating: ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0,
    satisfiedShare: ratings.length ? ratings.filter((r) => r >= 4).length / ratings.length : 0,
    downloadSureShare: share(download, 'chắc chắn'),
    payWillingShare: responses.length ? payWilling / responses.length : 0,
    ratingDistribution,
    favorite: countValues(responses.map((r) => r.favorite)),
    download,
    pay,
    payOptions,
    ratingByPay,
    byDay: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value })),
    comments: responses
      .filter((r) => !EMPTY_COMMENTS.has(r.comment.normalize('NFC').toLowerCase().replace(/[.!\s]+$/, '')))
      .map((r) => ({ time: r.time, rating: r.rating, favorite: r.favorite, text: r.comment }))
      .sort((a, b) => (b.time || '').localeCompare(a.time || '')),
    lastResponseAt: responses.map((r) => r.time).filter(Boolean).sort().pop() || null,
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const refresh = (req.url || '').includes('refresh=1')
  if (!refresh && cache && Date.now() - cache.at < CACHE_MS) {
    return res.status(200).json(cache.data)
  }

  try {
    const response = await fetch(CSV_URL, { redirect: 'follow' })
    if (!response.ok) throw new Error(`Google Sheets trả về ${response.status}`)
    const text = await response.text()
    if (text.trimStart().startsWith('<')) {
      throw new Error('Sheet không công khai: hãy bật "Bất kỳ ai có đường liên kết đều có thể xem"')
    }
    const data = { sheetUrl: SHEET_EDIT_URL, fetchedAt: new Date().toISOString(), ...summarize(parseCsv(text)) }
    cache = { at: Date.now(), data }
    return res.status(200).json(data)
  } catch (err) {
    console.error('[admin-feedback] failed', err)
    return res.status(502).json({ error: 'Không đọc được Google Sheet', detail: String(err.message || err) })
  }
}
