import { Star } from 'lucide-react'

export const COLORS = {
  s1: 'var(--series-1)',
  s2: 'var(--series-2)',
  s3: 'var(--series-3)',
  s4: 'var(--series-4)',
  grid: 'var(--grid)',
}

export const AXIS_PROPS = {
  stroke: 'var(--axis)',
  tick: { fill: 'var(--muted)', fontSize: 11 },
  tickLine: false,
}

export const CURSOR = { fill: 'var(--surface-2)' }

export function formatDuration(sec) {
  const s = Math.round(sec || 0)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}p ${String(s % 60).padStart(2, '0')}s`
  const h = Math.floor(m / 60)
  return `${h}g ${String(m % 60).padStart(2, '0')}p`
}

export function formatPct(ratio, digits = 0) {
  return `${((ratio || 0) * 100).toFixed(digits)}%`
}

export function formatNumber(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0)
}

export function formatDateTime(iso, withYear = false) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    ...(withYear ? { year: 'numeric' } : {}),
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDay(date) {
  const [, m, d] = String(date).split('-')
  return `${d}/${m}`
}

export function Card({ title, hint, action, className = 'span-6', flush = false, children }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || action) && (
        <header className="adm-card-head">
          <div>
            {title && <h3>{title}</h3>}
            {hint && <div className="hint">{hint}</div>}
          </div>
          {action}
        </header>
      )}
      <div className={`adm-card-body${flush ? ' flush' : ''}`}>{children}</div>
    </section>
  )
}

export function Kpi({ icon: Icon, tone = 'blue', label, value, unit, foot }) {
  return (
    <div className="adm-card adm-kpi">
      <div className="adm-kpi-top">
        <span>{label}</span>
        {Icon && (
          <span className={`adm-kpi-icon ${tone}`} aria-hidden="true">
            <Icon size={17} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="adm-kpi-value tnum">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {foot && <div className="adm-kpi-foot">{foot}</div>}
    </div>
  )
}

export function BarList({ items, total, color = COLORS.s1, empty = 'Chưa có dữ liệu', showShare = true }) {
  if (!items || items.length === 0) return <Empty>{empty}</Empty>
  const max = Math.max(...items.map((i) => i.value), 1)
  const sum = total ?? items.reduce((a, i) => a + i.value, 0)
  return (
    <div className="adm-barlist">
      {items.map((item) => (
        <div className="adm-barrow" key={item.name} title={`${item.name}: ${item.value}`}>
          <span className="name">{item.name}</span>
          <span className="num">
            <b>{formatNumber(item.value)}</b>
            {showShare && sum > 0 ? ` · ${formatPct(item.value / sum)}` : ''}
          </span>
          <div className="track">
            <div className="fill" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartTooltip({ active, payload, label, labelFormat, valueFormat }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="adm-tooltip">
      <div className="tl">{labelFormat ? labelFormat(label) : label}</div>
      {payload.map((p) => (
        <div className="row" key={p.name}>
          <i style={{ background: p.color || p.fill }} />
          {p.name}
          <b>{valueFormat ? valueFormat(p.value) : formatNumber(p.value)}</b>
        </div>
      ))}
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="adm-legend">
      {items.map((i) => (
        <span key={i.name}>
          <i style={{ background: i.color }} />
          {i.name}
        </span>
      ))}
    </div>
  )
}

export function Empty({ icon: Icon, children }) {
  return (
    <div className="adm-empty">
      {Icon && <Icon size={28} strokeWidth={1.5} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  )
}

export function Stars({ value }) {
  return (
    <span className="adm-stars" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= value ? '' : 'off'} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  )
}

export function Skeleton({ height = 120, className = 'span-12' }) {
  return <div className={`adm-skeleton ${className}`} style={{ height }} />
}

export function PageSkeleton() {
  return (
    <>
      <div className="adm-kpis">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="adm-skeleton" style={{ height: 112 }} />
        ))}
      </div>
      <div className="adm-grid">
        <Skeleton height={300} className="span-8" />
        <Skeleton height={300} className="span-4" />
        <Skeleton height={260} className="span-6" />
        <Skeleton height={260} className="span-6" />
      </div>
    </>
  )
}
