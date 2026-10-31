import { getQuery, isAuthorized } from './_lib/auth.js'
import { fetchEvents, fetchUsers, storageMode } from './_lib/store.js'
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
    let usersError = null
    const [events, users] = await Promise.all([
      fetchEvents(from, to),
      fetchUsers().catch((err) => {
        // Missing users table should not take down the whole dashboard.
        console.error('[admin-stats] users failed', err)
        usersError = String(err.message || err)
        return []
      }),
    ])
    return res.status(200).json({ storage: storageMode(), usersError, ...buildStats(events, { from, to }, users) })
  } catch (err) {
    console.error('[admin-stats] failed', err)
    return res.status(500).json({ error: 'Không đọc được dữ liệu sự kiện', detail: String(err.message || err) })
  }
}
