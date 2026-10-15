import { checkCredentials, issueToken, parseBody } from './_lib/auth.js'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { username, password } = parseBody(req)
  if (!checkCredentials(username || '', password || '')) {
    return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' })
  }
  return res.status(200).json({ token: issueToken() })
}
