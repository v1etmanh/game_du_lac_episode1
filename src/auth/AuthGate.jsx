import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
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
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Du Lạc</h1>
        <p>Đăng nhập để bắt đầu hành trình qua từng ngõ làng và lưu lại dấu chân của bạn.</p>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        {enabled ? (
          <a className="auth-google" href="/api/auth?action=login" data-track="Đăng nhập Google">
            <GoogleIcon />
            Đăng nhập với Google
          </a>
        ) : (
          <div className="auth-error">Máy chủ chưa cấu hình GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.</div>
        )}
      </div>
    </div>
  )
}

function Avatar({ user, className }) {
  if (user.picture) return <img className={className} src={user.picture} alt="" referrerPolicy="no-referrer" />
  return (
    <span className={className} aria-hidden="true">
      {(user.name || user.email || '?').charAt(0).toUpperCase()}
    </span>
  )
}

// Avatar button next to the journal button (top-right); opens a small account menu.
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="auth-user" ref={rootRef}>
      <button
        type="button"
        className="auth-user-fab"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
        title={user.name}
      >
        <Avatar user={user} className="auth-avatar" />
      </button>
      {open && (
        <div className="auth-user-menu" role="menu">
          <div className="auth-user-info">
            <Avatar user={user} className="auth-avatar auth-avatar-lg" />
            <div>
              <div className="auth-user-name">{user.name}</div>
              {user.email && <div className="auth-user-email">{user.email}</div>}
            </div>
          </div>
          <button type="button" role="menuitem" className="auth-user-logout" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      )}
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

  if (state.loading) return <div className="auth-screen" />
  if (!state.user) return <LoginScreen error={error} enabled={state.enabled} />
  return (
    <>
      <UserMenu user={state.user} onLogout={logout} />
      {children}
    </>
  )
}
