import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, LogIn, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import {
  AXIS_PROPS,
  BarList,
  COLORS,
  CURSOR,
  Card,
  ChartTooltip,
  Empty,
  Kpi,
  formatDateTime,
  formatDay,
  formatDuration,
  formatNumber,
  formatPct,
} from './ui.jsx'

const FILTERS = [
  { id: 'active', label: 'Hoạt động' },
  { id: 'new', label: 'Mới' },
  { id: 'finished', label: 'Phá đảo' },
  { id: 'all', label: 'Tất cả' },
]

export function UserAvatar({ user, size = 28 }) {
  if (user.picture) {
    return <img className="adm-avatar" src={user.picture} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  }
  return (
    <span className="adm-avatar" style={{ width: size, height: size }} aria-hidden="true">
      {(user.name || user.email || '?').charAt(0).toUpperCase()}
    </span>
  )
}

export default function UsersPage({ stats }) {
  const u = stats.users
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('active')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return u.list.filter((user) => {
      if (filter === 'active' && !user.active) return false
      if (filter === 'new' && !user.isNew) return false
      if (filter === 'finished' && !user.finished) return false
      if (!q) return true
      return [user.name, user.email].join(' ').toLowerCase().includes(q)
    })
  }, [u.list, query, filter])

  return (
    <>
      {stats.usersError && (
        <div className="adm-banner error" role="alert">
          Không đọc được bảng <code>users</code>: {stats.usersError}. Hãy chạy lại <code>supabase/schema.sql</code>.
        </div>
      )}

      <div className="adm-kpis">
        <Kpi icon={Users} label="Tổng tài khoản" value={formatNumber(u.total)} foot="Đăng nhập Google từ trước tới nay" />
        <Kpi
          icon={UserPlus}
          tone="green"
          label="Tài khoản mới"
          value={formatNumber(u.newUsers)}
          foot="Đăng ký trong khoảng đã chọn"
        />
        <Kpi
          icon={UserCheck}
          tone="amber"
          label="Người dùng hoạt động"
          value={formatNumber(u.activeUsers)}
          foot={`${u.returningUsers} tài khoản cũ quay lại`}
        />
        <Kpi
          icon={LogIn}
          tone="rose"
          label="Phiên đã đăng nhập"
          value={formatPct(u.loggedSessionShare)}
          foot={`${formatNumber(u.loggedSessions)}/${formatNumber(stats.kpis.sessions)} phiên`}
        />
        <Kpi
          icon={Clock}
          tone="green"
          label="Thời gian / người"
          value={formatDuration(u.avgPlaySecPerUser)}
          foot={`${u.avgSessionsPerUser} phiên mỗi người`}
        />
        <Kpi
          icon={UserCheck}
          tone="blue"
          label="Người dùng phá đảo"
          value={formatNumber(u.finishedUsers)}
          foot={`${formatPct(u.activeUsers ? u.finishedUsers / u.activeUsers : 0)} người hoạt động`}
        />
      </div>

      <div className="adm-grid">
        <Card title="Tài khoản mới theo ngày" hint="Giờ Việt Nam" className="span-6">
          {u.newUsers ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={u.signupsDaily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDay} minTickGap={16} {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
                <Tooltip cursor={CURSOR} content={<ChartTooltip labelFormat={formatDay} />} />
                <Bar isAnimationActive={false} dataKey="value" name="Tài khoản mới" fill={COLORS.s3} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty>Chưa có tài khoản mới trong khoảng này</Empty>
          )}
        </Card>
        <Card title="Số lần đăng nhập" hint="Tất cả tài khoản" className="span-3">
          <BarList items={u.total ? u.loginBuckets : []} color={COLORS.s1} />
        </Card>
        <Card title="Tên miền email" hint="Tất cả tài khoản" className="span-3">
          <BarList items={u.emailDomains} total={u.total} color={COLORS.s2} />
        </Card>

        <Card
          title="Danh sách người dùng"
          hint="Phiên, thời gian chơi và tiến độ tính trong khoảng đã chọn"
          className="span-12"
          flush
          action={
            <div className="adm-actions">
              <label className="adm-search">
                <Search size={15} aria-hidden="true" />
                <input
                  className="adm-input"
                  placeholder="Tìm theo tên, email..."
                  aria-label="Tìm người dùng"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="adm-seg" role="group" aria-label="Lọc người dùng">
                {FILTERS.map((f) => (
                  <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {rows.length === 0 ? (
            <Empty icon={Users}>Không có người dùng nào khớp bộ lọc</Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Đăng ký</th>
                    <th>Hoạt động gần nhất</th>
                    <th className="num">Lần đăng nhập</th>
                    <th className="num">Phiên</th>
                    <th className="num">Thời gian chơi</th>
                    <th className="num">Địa điểm xong</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="adm-user">
                          <UserAvatar user={user} />
                          <span>
                            <b>{user.name || 'Không rõ'}</b>
                            <small>{user.email || user.id}</small>
                          </span>
                        </span>
                      </td>
                      <td>
                        {formatDateTime(user.createdAt, true)} {user.isNew && <span className="adm-pill blue">Mới</span>}
                      </td>
                      <td>{formatDateTime(user.lastSeenAt, true)}</td>
                      <td className="num">{formatNumber(user.loginCount)}</td>
                      <td className="num">{formatNumber(user.sessions)}</td>
                      <td className="num">{user.playSec ? formatDuration(user.playSec) : '–'}</td>
                      <td className="num">
                        {user.finished ? <span className="adm-pill good">Phá đảo</span> : user.maxCompleted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
