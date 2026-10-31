import { cloneElement, useEffect, useState } from 'react'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { identify } from '../analytics/track.js'
import './AuthGate.css'

const LOGIN_ERRORS = {
  not_configured: 'Đăng nhập Google chưa được cấu hình trên máy chủ.',
  invalid_state: 'Phiên đăng nhập đã hết hạn, vui lòng thử lại.',
  access_denied: 'Bạn đã huỷ đăng nhập.',
  google_failed: 'Không đăng nhập được với Google, vui lòng thử lại.',
}

function readLoginError() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('login_error')
  if (!code) return ''
  params.delete('login_error')
  const query = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  return LOGIN_ERRORS[code] || 'Đăng nhập thất bại, vui lòng thử lại.'
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

function LoginScreen({ error, enabled }) {
  return (
    <div className="auth-screen-root">
      <div className="auth-screen-backdrop" />

      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-badge">
            <BookOpen size={16} />
            <span>DU LẠC DIARY · EPISODE 1</span>
          </div>
          <h1>Sổ Lưu Hành Trình</h1>
          <p>Đăng nhập để lưu lại các chặng đường làng đã đi qua và những trang sổ nhật ký đã mở khóa.</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {enabled ? (
          <a className="auth-google-btn" href="/api/auth?action=login" data-track="Đăng nhập Google">
            <span className="auth-google-icon">
              <GoogleIcon />
            </span>
            Đăng nhập với Google
          </a>
        ) : (
          <div className="auth-error">Máy chủ chưa cấu hình GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.</div>
        )}

        <div className="auth-footer-note">
          <CheckCircle2 size={15} />
          <span>Hành trình được lưu theo tài khoản Google. Thoát ra vào lại hay đổi thiết bị đều không mất.</span>
        </div>
      </div>
    </div>
  )
}

export default function AuthGate({ children }) {
  const [state, setState] = useState({ loading: true, user: null, enabled: true })
  const [error] = useState(readLoginError)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth?action=me', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setState({ loading: false, user: json.user || null, enabled: json.enabled !== false })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, user: null, enabled: true })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state.user) identify(state.user.id)
  }, [state.user])

  const logout = async () => {
    try {
      await fetch('/api/auth?action=logout', { method: 'POST', credentials: 'same-origin' })
    } catch {
      // ignore: reload shows the login screen if the cookie is gone
    }
    window.location.reload()
  }

  if (state.loading) return <div className="auth-screen-root" />
  if (!state.user) return <LoginScreen error={error} enabled={state.enabled} />
  // The game shows the account (name, avatar, logout) in its own map header.
  return cloneElement(children, { user: state.user, onLogout: logout })
}
