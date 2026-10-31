import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Monitor, Search, Smartphone, Tablet, Users } from 'lucide-react'
import { Card, Empty, formatDateTime, formatDuration } from './ui.jsx'
import { UserAvatar } from './UsersPage.jsx'

const EVENT_NAMES = {
  session_start: 'Mở game',
  session_hidden: 'Rời tab',
  session_end: 'Đóng trang',
  screen_view: 'Chuyển màn',
  intro_finish: 'Xong intro',
  location_enter: 'Vào địa điểm',
  location_locked_click: 'Bấm địa điểm còn khoá',
  location_complete: 'Hoàn thành địa điểm',
  dialog_finish: 'Xong hội thoại',
  interview_start: 'Bắt đầu phỏng vấn',
  interview_complete: 'Xong phỏng vấn',
  interview_exit: 'Thoát phỏng vấn',
  minigame_start: 'Bắt đầu minigame',
  minigame_exit: 'Thoát minigame',
  journal_open: 'Mở nhật kí',
  ui_click: 'Bấm',
  user_identify: 'Đăng nhập Google',
}

const KEY_EVENTS = new Set(['location_enter', 'minigame_start', 'interview_start', 'session_start'])
const DONE_EVENTS = new Set(['location_complete', 'interview_complete'])

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'finished', label: 'Phá đảo' },
  { id: 'mobile', label: 'Di động' },
  { id: 'returning', label: 'Quay lại' },
]

function DeviceIcon({ device }) {
  const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
  return <Icon size={14} aria-hidden="true" />
}

function Timeline({ session }) {
  const start = new Date(session.timeline[0]?.t || session.start).getTime()
  return (
    <div className="adm-timeline">
      {session.timeline.map((e, i) => (
        <div className="adm-tl-item" key={i}>
          <span className="t">+{formatDuration((new Date(e.t).getTime() - start) / 1000)}</span>
          <span className={`dot ${DONE_EVENTS.has(e.event) ? 'done' : KEY_EVENTS.has(e.event) ? 'key' : ''}`} />
          <span className="what">
            <b>{EVENT_NAMES[e.event] || e.event}</b>
            {(e.location || e.detail) && <span> — {[e.location, e.detail].filter(Boolean).join(' · ')}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SessionsPage({ stats }) {
  const [open, setOpen] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const sessions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return stats.recentSessions.filter((s) => {
      if (filter === 'finished' && !s.finished) return false
      if (filter === 'mobile' && s.device === 'desktop') return false
      if (filter === 'returning' && !s.returning) return false
      if (!q) return true
      return [s.player, s.user?.name, s.user?.email, s.os, s.browser, s.referrer, s.lastScreen, s.lastLocation]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [stats.recentSessions, query, filter])

  return (
    <Card
      title="Phiên chơi gần đây"
      hint={`${stats.recentSessions.length} phiên mới nhất trong khoảng đã chọn. Bấm một dòng để xem từng thao tác.`}
      className="span-12"
      flush
      action={
        <div className="adm-actions">
          <label className="adm-search">
            <Search size={15} aria-hidden="true" />
            <input
              className="adm-input"
              placeholder="Tìm theo email, ID, thiết bị..."
              aria-label="Tìm phiên chơi"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="adm-seg" role="group" aria-label="Lọc phiên">
            {FILTERS.map((f) => (
              <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {sessions.length === 0 ? (
        <Empty icon={Users}>Không có phiên nào khớp bộ lọc</Empty>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="chev" aria-label="Mở rộng" />
                <th>Bắt đầu</th>
                <th>Người chơi</th>
                <th>Thiết bị</th>
                <th>Nguồn</th>
                <th className="num">Thời lượng</th>
                <th className="num">Địa điểm xong</th>
                <th>Màn cuối</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const isOpen = open === s.id
                return (
                  <Fragment key={s.id}>
                    <tr
                      className={`click${isOpen ? ' open' : ''}`}
                      onClick={() => setOpen(isOpen ? null : s.id)}
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setOpen(isOpen ? null : s.id)
                        }
                      }}
                    >
                      <td className="chev">{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td>{formatDateTime(s.start)}</td>
                      <td>
                        {s.user ? (
                          <span className="adm-user" title={s.user.email}>
                            <UserAvatar user={s.user} size={22} />
                            <span>{s.user.name || s.user.email}</span>
                          </span>
                        ) : (
                          <span className="adm-mono">{s.player.slice(0, 8)}</span>
                        )}{' '}
                        {s.returning ? <span className="adm-pill blue">Quay lại</span> : <span className="adm-pill">Mới</span>}
                      </td>
                      <td>
                        <span className="adm-device">
                          <DeviceIcon device={s.device} />
                          {s.os} · {s.browser}
                        </span>
                      </td>
                      <td>{s.referrer}</td>
                      <td className="num">{formatDuration(s.durationSec)}</td>
                      <td className="num">
                        {s.finished ? <span className="adm-pill good">Phá đảo</span> : s.completedCount}
                      </td>
                      <td>{[s.lastScreen, s.lastLocation].filter(Boolean).join(' · ')}</td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={8} style={{ background: 'var(--surface-2)' }}>
                          <Timeline session={s} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
