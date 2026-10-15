import { getQuery, isAuthorized } from './_lib/auth.js'
import { fetchEvents, storageMode } from './_lib/store.js'
import { buildStats } from './_lib/stats.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const query = getQuery(req)
  const to = query.to && !Number.isNaN(Date.parse(query.to)) ? new Date(query.to).toISOString() : new Date().toISOString()
  const from = query.from && !Number.isNaN(Date.parse(query.from))
    ? new Date(query.from).toISOString()
    : new Date(Date.parse(to) - 7 * 86400000).toISOString()

  try {
    const events = await fetchEvents(from, to)
    return res.status(200).json({ storage: storageMode(), ...buildStats(events, { from, to }) })
  } catch (err) {
    console.error('[admin-stats] failed', err)
    return res.status(500).json({ error: 'Không đọc được dữ liệu sự kiện', detail: String(err.message || err) })
  }
}
