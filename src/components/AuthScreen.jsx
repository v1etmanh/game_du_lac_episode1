import { useState } from 'react'
import { BookOpen, CheckCircle2, KeyRound, LogIn, Sparkles, UserCheck, UserPlus } from 'lucide-react'
import { loginOrRegister } from '../services/playerStorage.js'
import './AuthScreen.css'

export default function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginOrRegister({
        action: mode,
        username,
        password,
        displayName: mode === 'register' ? displayName || username : username,
      })
      onSuccess(result)
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

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
          <p>
            Đăng nhập để lưu lại các chặng đường làng đã đi qua và những trang sổ nhật ký đã mở khóa.
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            <LogIn size={16} />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            <UserPlus size={16} />
            <span>Đăng ký mới</span>
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Tên đăng nhập</span>
            <div className="auth-input-wrap">
              <UserCheck size={17} className="auth-input-icon" />
              <input
                type="text"
                placeholder="VD: minh_dulac, nhom1..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                minLength={2}
                maxLength={32}
                autoFocus
              />
            </div>
          </label>

          {mode === 'register' && (
            <label className="auth-field">
              <span>Tên hiển thị trên sổ (tuỳ chọn)</span>
              <div className="auth-input-wrap">
                <Sparkles size={17} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="VD: Minh Anh (bỏ trống sẽ dùng tên đăng nhập)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                />
              </div>
            </label>
          )}

          <label className="auth-field">
            <span>Mật khẩu / Mã PIN</span>
            <div className="auth-input-wrap">
              <KeyRound size={17} className="auth-input-icon" />
              <input
                type="password"
                placeholder="Nhập mật khẩu hoặc mã PIN (từ 3 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={3}
              />
            </div>
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? 'Đang đồng bộ hành trình...'
              : mode === 'login'
                ? 'Tiếp tục hành trình ▸'
                : 'Tạo sổ & Bắt đầu ▸'}
          </button>
        </form>

        <div className="auth-footer-note">
          <CheckCircle2 size={15} />
          <span>
            Tự động đồng bộ trên hệ thống dữ liệu & bộ nhớ trình duyệt. Thoát ra vào lại không mất hành trình.
          </span>
        </div>
      </div>
    </div>
  )
}
