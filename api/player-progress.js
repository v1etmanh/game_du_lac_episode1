import { parseBody } from './_lib/auth.js'
import { DEFAULT_PROGRESS, getPlayerRecord, playerKey, savePlayerProgress } from './_lib/playerStore.js'
import { currentUser } from './_lib/userAuth.js'

// Journey progress of the player signed in with Google (identified by the session cookie only).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const user = currentUser(req)
  if (!user) return res.status(401).json({ error: 'Chưa đăng nhập' })
  const key = playerKey(user.id)

  try {
    if (req.method === 'GET') {
      const record = await getPlayerRecord(key)
      return res.status(200).json({ ok: true, progress: record?.progress || DEFAULT_PROGRESS })
    }

    if (req.method === 'POST') {
      const body = parseBody(req)
      const progress = await savePlayerProgress(key, body.progress || {})
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
