import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Gamepad2,
  Info,
  LayoutDashboard,
  ListTree,
  Lock,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Users,
} from 'lucide-react'
import OverviewPage from './OverviewPage.jsx'
import BehaviorPage from './BehaviorPage.jsx'
import SessionsPage from './SessionsPage.jsx'
import FeedbackPage from './FeedbackPage.jsx'
import UsersPage from './UsersPage.jsx'
import { PageSkeleton, formatTime } from './ui.jsx'
import './admin.css'

const TOKEN_KEY = 'dl_admin_token'
const REFRESH_MS = 60 * 1000
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'

const PAGES = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, title: 'Tổng quan', desc: 'Toàn cảnh người chơi và phản hồi khảo sát' },
  { id: 'behavior', label: 'Hành vi', icon: Activity, title: 'Hành vi người chơi', desc: 'Tiến độ, điểm rơi, minigame, thiết bị' },
  { id: 'users', label: 'Người dùng', icon: Users, title: 'Người dùng', desc: 'Tài khoản đăng nhập Google và mức độ hoạt động' },
  { id: 'sessions', label: 'Phiên chơi', icon: ListTree, title: 'Phiên chơi', desc: 'Xem lại từng phiên và từng thao tác' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareText, title: 'Feedback khảo sát', desc: 'Tổng hợp từ Google Form “Feedback về trải nghiệm game Du Lạc”' },
]

const RANGES = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'all', label: 'Tất cả' },
]

function rangeToQuery(rangeId) {
  const now = new Date()
  let from
  if (rangeId === 'today') {
    const vn = new Date(now.getTime() + 7 * 3600000)
    from = new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - 7 * 3600000)
  } else if (rangeId === '7d') {
    from = new Date(now.getTime() - 7 * 86400000)
  } else if (rangeId === '30d') {
    from = new Date(now.getTime() - 30 * 86400000)
  } else {
    from = new Date('2026-01-01T00:00:00Z')
  }
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(now.toISOString())}`
}

function storageGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function pageFromHash() {
  const id = window.location.hash.replace('#', '')
  return PAGES.some((p) => p.id === id) ? id : 'overview'
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Đăng nhập thất bại')
      onLogin(json.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm adm-login">
      <aside className="adm-login-art">
        <div className="adm-brand">
          <span className="adm-brand-mark">
            <Gamepad2 size={18} />
          </span>
          <div>
            <div className="adm-brand-name">Du Lạc</div>
            <div className="adm-brand-sub">Analytics</div>
          </div>
        </div>
        <div>
          <h2>Theo dõi hành trình của người chơi qua từng ngõ làng.</h2>
          <p>Một nơi duy nhất để xem người chơi đi đến đâu, dừng lại ở đâu và họ nghĩ gì về game.</p>
        </div>
        <ul>
          <li>
            <BarChart3 size={16} /> Tiến độ & điểm rơi theo từng địa điểm
          </li>
          <li>
            <Users size={16} /> Phiên chơi, thiết bị, nguồn truy cập
          </li>
          <li>
            <MessageSquareText size={16} /> Tổng hợp feedback khảo sát tự động
          </li>
        </ul>
      </aside>
      <div className="adm-login-form">
        <form onSubmit={submit}>
          <h1>Đăng nhập quản trị</h1>
          <div className="sub">Chỉ dành cho nhóm phát triển Du Lạc</div>
          <label className="adm-field">
            Tài khoản
            <input
              className="adm-input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="adm-field">
            Mật khẩu
            <input
              className="adm-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <div className="err" role="alert">
              <AlertTriangle size={15} /> {error}
            </div>
          )}
          <button className="adm-btn primary" type="submit" disabled={busy}>
            <Lock size={15} /> {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [token, setToken] = useState(() => storageGet(TOKEN_KEY))
  const [page, setPage] = useState(pageFromHash)
  const [range, setRange] = useState(() => storageGet('dl_admin_range') || '7d')
  const [stats, setStats] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    document.documentElement.classList.add('admin-mode')
    document.title = 'Du Lạc · Admin'
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONT_HREF
      document.head.appendChild(link)
    }
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      document.documentElement.classList.remove('admin-mode')
    }
  }, [])

  const navigate = (id) => {
    window.location.hash = id
    setPage(id)
    window.scrollTo({ top: 0 })
  }

  const changeRange = (id) => {
    storageSet('dl_admin_range', id)
    setStats(null)
    setRange(id)
  }

  const logout = useCallback(() => {
    storageSet(TOKEN_KEY, null)
    setToken(null)
    setStats(null)
    setFeedback(null)
  }, [])

  const load = useCallback(
    async (forceFeedback = false) => {
      if (!token) return
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const nextErrors = []
      try {
        const [statsRes, feedbackRes] = await Promise.all([
          fetch(`/api/admin-stats?${rangeToQuery(range)}`, { headers }),
          fetch(`/api/admin-feedback${forceFeedback ? '?refresh=1' : ''}`, { headers }),
        ])
        if (statsRes.status === 401 || feedbackRes.status === 401) {
          logout()
          return
        }
        const statsJson = await statsRes.json().catch(() => ({ error: 'Phản hồi không hợp lệ' }))
        const feedbackJson = await feedbackRes.json().catch(() => ({ error: 'Phản hồi không hợp lệ' }))
        if (statsRes.ok) setStats(statsJson)
        else nextErrors.push(`Dữ liệu hành vi: ${statsJson.error}${statsJson.detail ? ` — ${statsJson.detail}` : ''}`)
        if (feedbackRes.ok) setFeedback(feedbackJson)
        else nextErrors.push(`Feedback: ${feedbackJson.error}${feedbackJson.detail ? ` — ${feedbackJson.detail}` : ''}`)
        setUpdatedAt(new Date().toISOString())
      } catch (err) {
        nextErrors.push(`Không kết nối được API: ${err.message}`)
      } finally {
        setErrors(nextErrors)
        setLoading(false)
      }
    },
    [token, range, logout],
  )

  useEffect(() => {
    load()
    const timer = setInterval(() => load(), REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  if (!token) {
    return (
      <Login
        onLogin={(t) => {
          storageSet(TOKEN_KEY, t)
          setToken(t)
        }}
      />
    )
  }

  const current = PAGES.find((p) => p.id === page)
  const storage = stats?.storage
  const counts = {
    sessions: stats?.kpis.sessions,
    users: stats?.users?.total,
    feedback: feedback?.total,
  }

  let content
  if (page === 'overview') content = <OverviewPage stats={stats} feedback={feedback} onNavigate={navigate} />
  else if (page === 'feedback') content = feedback ? <FeedbackPage data={feedback} /> : <PageSkeleton />
  else if (!stats) content = <PageSkeleton />
  else if (page === 'behavior') content = <BehaviorPage stats={stats} />
  else if (page === 'users') content = <UsersPage stats={stats} />
  else content = <SessionsPage stats={stats} />

  return (
    <div className="adm adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span className="adm-brand-mark">
            <Gamepad2 size={18} />
          </span>
          <div className="adm-brand-text">
            <div className="adm-brand-name">Du Lạc</div>
            <div className="adm-brand-sub">Analytics</div>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Điều hướng">
          <div className="adm-nav-label">Báo cáo</div>
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={page === p.id ? 'on' : ''}
              aria-current={page === p.id ? 'page' : undefined}
              onClick={() => navigate(p.id)}
            >
              <p.icon size={17} aria-hidden="true" />
              {p.label}
              {p.id === 'sessions' && counts.sessions !== undefined && <span className="count">{counts.sessions}</span>}
              {p.id === 'users' && counts.users !== undefined && <span className="count">{counts.users}</span>}
              {p.id === 'feedback' && counts.feedback !== undefined && <span className="count">{counts.feedback}</span>}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-status">
            <div className="adm-status-row">
              <span className={`adm-dot ${storage === 'supabase' ? '' : storage === 'local' ? 'warn' : storage ? 'bad' : 'warn'}`} />
              {storage === 'supabase' ? 'Supabase đã kết nối' : storage === 'local' ? 'Lưu file local (dev)' : storage ? 'Chưa cấu hình lưu trữ' : 'Đang kiểm tra...'}
            </div>
            <div className="adm-status-row">
              <span className={`adm-dot ${feedback ? '' : errors.some((e) => e.startsWith('Feedback')) ? 'bad' : 'warn'}`} />
              Google Sheet {feedback ? 'đã đồng bộ' : '...'}
            </div>
          </div>
          <button className="adm-btn ghost" onClick={logout}>
            <LogOut size={15} aria-hidden="true" /> <span className="adm-brand-text">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <div>
            <h1>{current.title}</h1>
            <p>{current.desc}</p>
          </div>
          <div className="adm-actions">
            {page !== 'feedback' && (
              <div className="adm-seg" role="group" aria-label="Khoảng thời gian">
                {RANGES.map((r) => (
                  <button key={r.id} className={range === r.id ? 'on' : ''} onClick={() => changeRange(r.id)}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
            {page === 'feedback' && feedback?.sheetUrl && (
              <a className="adm-btn" href={feedback.sheetUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={15} aria-hidden="true" /> Mở Google Sheet
              </a>
            )}
            <button className="adm-btn" onClick={() => load(true)} disabled={loading} aria-label="Làm mới dữ liệu">
              <RefreshCw size={15} className={loading ? 'spin' : ''} aria-hidden="true" />
              {updatedAt ? `Cập nhật ${formatTime(updatedAt)}` : 'Làm mới'}
            </button>
          </div>
        </div>

        {errors.map((e) => (
          <div className="adm-banner error" role="alert" key={e}>
            <AlertTriangle size={16} /> {e}
          </div>
        ))}
        {storage === 'local' && page !== 'feedback' && (
          <div className="adm-banner info">
            <Info size={16} />
            <span>
              Chưa điền <code>SUPABASE_URL</code> / <code>SUPABASE_SERVICE_ROLE_KEY</code> trong <code>.env</code> nên
              sự kiện đang lưu tạm vào <code>.data/events.jsonl</code> (chỉ dùng khi chạy local).
            </span>
          </div>
        )}
        {storage === 'none' && page !== 'feedback' && (
          <div className="adm-banner error">
            <AlertTriangle size={16} />
            <span>
              Server chưa có cấu hình Supabase nên không ghi được hành vi người chơi. Điền <code>SUPABASE_URL</code> và{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> vào <code>.env</code> hoặc Vercel.
            </span>
          </div>
        )}

        {content}
      </main>
    </div>
  )
}
