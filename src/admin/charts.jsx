import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS_PROPS, COLORS, CURSOR, ChartTooltip, Empty, Legend, formatDay, formatNumber, formatPct } from './ui.jsx'

export function SessionsTrend({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="adm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDay} minTickGap={16} {...AXIS_PROPS} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
        <Tooltip
          content={<ChartTooltip labelFormat={formatDay} />}
          cursor={{ stroke: 'var(--axis)', strokeDasharray: '3 3' }}
        />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="sessions"
          name="Phiên chơi"
          stroke={COLORS.s1}
          strokeWidth={2}
          fill="url(#adm-area)"
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
        />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="players"
          name="Người chơi"
          stroke={COLORS.s2}
          strokeWidth={2}
          fill="none"
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const TREND_LEGEND = [
  { name: 'Phiên chơi', color: COLORS.s1 },
  { name: 'Người chơi', color: COLORS.s2 },
]

export function RatingChart({ data, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" {...AXIS_PROPS} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
        <Tooltip cursor={CURSOR} content={<ChartTooltip />} />
        <Bar
          isAnimationActive={false}
          dataKey="value"
          name="Phản hồi"
          fill={COLORS.s1}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          label={{ position: 'top', fill: 'var(--ink-2)', fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Funnel({ steps, limit }) {
  const rows = limit ? steps.slice(0, limit) : steps
  const max = Math.max(...steps.map((s) => s.entered), 1)
  if (steps.every((s) => s.entered === 0)) return <Empty>Chưa có ai vào địa điểm nào</Empty>
  return (
    <>
      <Legend
        items={[
          { name: 'Đã vào', color: 'var(--series-1-soft)' },
          { name: 'Hoàn thành', color: COLORS.s1 },
        ]}
      />
      <div className="adm-funnel" style={{ marginTop: 10 }}>
        {rows.map((s, i) => (
          <div
            className="adm-funnel-row"
            key={s.id}
            title={`${s.name}: ${s.entered} phiên vào, ${s.completed} phiên hoàn thành`}
          >
            <span className="adm-funnel-step">{i + 1}</span>
            <span className="adm-funnel-name">{s.name}</span>
            <div className="adm-funnel-track">
              <div className="entered" style={{ width: `${(s.entered / max) * 100}%` }} />
              <div className="completed" style={{ width: `${(s.completed / max) * 100}%` }} />
            </div>
            <span className="adm-funnel-nums">
              <b>{formatNumber(s.entered)}</b> vào · {formatNumber(s.completed)} xong
              {s.entered > 0 && <> ({formatPct(s.completed / s.entered)})</>}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
