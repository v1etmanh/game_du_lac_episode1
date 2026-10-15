import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, MessageSquareText, Search, Star, Wallet } from 'lucide-react'
import { RatingChart } from './charts.jsx'
import {
  AXIS_PROPS,
  BarList,
  COLORS,
  CURSOR,
  Card,
  ChartTooltip,
  Empty,
  Kpi,
  Legend,
  Stars,
  formatDateTime,
  formatDay,
  formatPct,
} from './ui.jsx'

const PAY_COLORS = [COLORS.s1, COLORS.s2, COLORS.s3, COLORS.s4]
const RATING_FILTERS = [
  { id: 0, label: 'Tất cả' },
  { id: 5, label: '5★' },
  { id: 4, label: '4★' },
  { id: 3, label: '≤3★' },
]

export default function FeedbackPage({ data }) {
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState(0)

  const comments = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.comments.filter((c) => {
      if (rating === 3 && !(c.rating && c.rating <= 3)) return false
      if (rating > 3 && c.rating !== rating) return false
      return !q || c.text.toLowerCase().includes(q)
    })
  }, [data.comments, query, rating])

  const payLegend = data.payOptions.map((name, i) => ({ name, color: PAY_COLORS[i % PAY_COLORS.length] }))

  return (
    <>
      <div className="adm-kpis">
        <Kpi
          icon={MessageSquareText}
          label="Số phản hồi"
          value={data.total}
          foot={data.lastResponseAt ? `Mới nhất ${formatDateTime(data.lastResponseAt, true)}` : null}
        />
        <Kpi
          icon={Star}
          tone="amber"
          label="Điểm trung bình"
          value={data.avgRating}
          unit="/5"
          foot={`${formatPct(data.satisfiedShare)} chấm 4–5 sao`}
        />
        <Kpi
          icon={Download}
          tone="green"
          label="Chắc chắn tải game"
          value={formatPct(data.downloadSureShare)}
          foot="khi ra bản chính thức"
        />
        <Kpi
          icon={Wallet}
          tone="rose"
          label="Sẵn sàng chi trả"
          value={formatPct(data.payWillingShare)}
          foot="mức cao hoặc hợp lý"
        />
      </div>

      <div className="adm-grid">
        <Card title="Phân bố điểm trải nghiệm" hint="1 = Chưa tốt · 5 = Xuất sắc" className="span-6">
          <RatingChart data={data.ratingDistribution} />
        </Card>

        <Card title="Yếu tố hài lòng nhất" hint="Mỗi người chọn một yếu tố" className="span-6">
          <BarList items={data.favorite} total={data.total} />
        </Card>

        <Card title="Sẵn sàng tải khi ra mắt?" className="span-6">
          <BarList items={data.download} total={data.total} color={COLORS.s3} />
        </Card>

        <Card title="Sẵn sàng chi trả (nạp thẻ, vật phẩm)?" className="span-6">
          <BarList items={data.pay} total={data.total} color={COLORS.s2} />
        </Card>

        <Card
          title="Điểm trải nghiệm × mức sẵn sàng chi trả"
          hint="Mỗi cột là một mức điểm, chia theo câu trả lời về chi trả"
          className="span-8"
        >
          <Legend items={payLegend} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.ratingByPay} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="name" {...AXIS_PROPS} />
              <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
              <Tooltip cursor={CURSOR} content={<ChartTooltip />} />
              {payLegend.map((p, i) => (
                <Bar
                  isAnimationActive={false}
                  key={p.name}
                  dataKey={(row) => row[p.name]}
                  name={p.name}
                  stackId="pay"
                  fill={p.color}
                  stroke="var(--surface)"
                  strokeWidth={1}
                  maxBarSize={44}
                  radius={i === payLegend.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Phản hồi theo ngày" hint="Giờ Việt Nam" className="span-4">
          <ResponsiveContainer width="100%" height={286}>
            <BarChart data={data.byDay} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDay} {...AXIS_PROPS} />
              <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
              <Tooltip cursor={CURSOR} content={<ChartTooltip labelFormat={formatDay} />} />
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
        </Card>

        <Card
          title={`Ý kiến đóng góp · ${data.comments.length}`}
          hint="Đã bỏ các câu trả lời trống/“không”. Không hiển thị email người gửi."
          className="span-12"
          action={
            <div className="adm-actions">
              <label className="adm-search">
                <Search size={15} aria-hidden="true" />
                <input
                  className="adm-input"
                  placeholder="Tìm trong ý kiến..."
                  aria-label="Tìm trong ý kiến"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="adm-seg" role="group" aria-label="Lọc theo điểm">
                {RATING_FILTERS.map((f) => (
                  <button key={f.id} className={rating === f.id ? 'on' : ''} onClick={() => setRating(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {comments.length === 0 ? (
            <Empty icon={MessageSquareText}>Không có ý kiến nào khớp</Empty>
          ) : (
            <div className="adm-comments">
              {comments.map((c, i) => (
                <article className="adm-comment" key={i}>
                  <div className="meta">
                    {c.rating ? <Stars value={c.rating} /> : <span>Chưa chấm</span>}
                    <span>· {formatDateTime(c.time)}</span>
                  </div>
                  <p>{c.text}</p>
                  {c.favorite && (
                    <div className="meta">
                      <span className="adm-pill">{c.favorite}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
