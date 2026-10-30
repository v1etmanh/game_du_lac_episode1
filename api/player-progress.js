import { getQuery, parseBody } from './_lib/auth.js'
import {
  getPlayerRecord,
  normalizeUsername,
  savePlayerProgress,
  verifyPlayerToken,
} from './_lib/playerStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'GET') {
      const query = getQuery(req)
      const tokenUser = verifyPlayerToken(req)
      const username = normalizeUsername(tokenUser || query.username)
      if (!username) {
        return res.status(401).json({ error: 'Chưa xác thực người chơi' })
      }

      const record = await getPlayerRecord(username)
      if (!record) {
        return res.status(404).json({ error: 'Không tìm thấy dữ liệu hành trình' })
      }

      return res.status(200).json({
        ok: true,
        user: {
          username: record.username,
          displayName: record.displayName,
        },
        progress: record.progress,
      })
    }

    if (req.method === 'POST') {
      const body = parseBody(req)
      const tokenUser = verifyPlayerToken(req)
      const username = normalizeUsername(tokenUser || body.username)
      if (!username) {
        return res.status(401).json({ error: 'Chưa xác thực người chơi' })
      }

      const progress = await savePlayerProgress(username, body.progress || {})
      return res.status(200).json({ ok: true, progress })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[player-progress] failed', err)
    return res.status(500).json({
      error: 'Không lưu được dữ liệu lên máy chủ',
      detail: String(err.message || err),
    })
  }
}

