import { parseBody } from './_lib/auth.js'
import {
  createPlayerRecord,
  getPlayerRecord,
  issuePlayerToken,
  normalizeUsername,
  savePlayerProgress,
  verifyPassword,
} from './_lib/playerStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = parseBody(req)
  const action = body.action || 'login'
  const username = normalizeUsername(body.username)
  const password = String(body.password || '').trim()
  const displayName = String(body.displayName || body.username || '').trim()

  if (!username || username.length < 2) {
    return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 2 ký tự.' })
  }
  if (!password || password.length < 3) {
    return res.status(400).json({ error: 'Mật khẩu / mã PIN phải có ít nhất 3 ký tự.' })
  }

  try {
    if (action === 'register') {
      const existing = await getPlayerRecord(username)
      if (existing) {
        return res.status(409).json({
          error: 'Tên tài khoản này đã được đăng ký. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.',
        })
      }

      const record = await createPlayerRecord({
        username,
        displayName: displayName || username,
        password,
        initialProgress: body.progress || {},
      })

      const token = issuePlayerToken(username)
      return res.status(200).json({
        ok: true,
        token,
        user: {
          username: record.username,
          displayName: record.displayName,
        },
        progress: record.progress,
      })
    }

    if (action === 'login') {
      const existing = await getPlayerRecord(username)
      if (!existing) {
        return res.status(404).json({
          error: 'Chưa tìm thấy tài khoản này. Bạn hãy bấm sang tab "Đăng ký mới" để tạo hành trình nhé!',
        })
      }

      if (!verifyPassword(password, existing.salt, existing.passwordHash)) {
        return res.status(401).json({
          error: 'Mật khẩu / mã PIN chưa đúng. Vui lòng kiểm tra lại.',
        })
      }

      let progress = existing.progress
      if (body.progress && typeof body.progress === 'object') {
        progress = await savePlayerProgress(username, body.progress)
      }

      const token = issuePlayerToken(username)
      return res.status(200).json({
        ok: true,
        token,
        user: {
          username: existing.username,
          displayName: existing.displayName,
        },
        progress,
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (err) {
    console.error('[player-auth] failed', err)
    return res.status(500).json({
      error: 'Không thể kết nối máy chủ lưu trữ, hệ thống sẽ tạm lưu trên trình duyệt của bạn.',
      detail: String(err.message || err),
    })
  }
}

