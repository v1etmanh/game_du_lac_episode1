import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Funnel } from './charts.jsx'
import {
  AXIS_PROPS,
  BarList,
  COLORS,
  CURSOR,
  Card,
  ChartTooltip,
  formatDuration,
  formatNumber,
  formatPct,
} from './ui.jsx'

export default function BehaviorPage({ stats }) {
  const k = stats.kpis
  return (
    <div className="adm-grid">
      <Card title="Tiến độ qua từng địa điểm" hint="Theo thứ tự cốt truyện; % = tỉ lệ hoàn thành sau khi vào" className="span-7">
        <Funnel steps={stats.funnel} />
      </Card>

      <Card title="Người chơi dừng lại ở đâu" hint="Màn cuối cùng của các phiên chưa phá đảo" className="span-5">
        <BarList items={stats.dropoff} color={COLORS.s2} />
      </Card>

      <Card title="Minigame" hint="Lượt chơi và thời gian ở lại" className="span-7" flush>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Minigame</th>
                <th>Địa điểm</th>
                <th className="num">Lượt vào</th>
                <th className="num">Lượt thoát</th>
                <th className="num">Trung bình</th>
                <th className="num">Trung vị</th>
              </tr>
            </thead>
            <tbody>
              {stats.minigames.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.name}</b>
                  </td>
                  <td>{m.location}</td>
                  <td className="num">{formatNumber(m.starts)}</td>
                  <td className="num">{formatNumber(m.exits)}</td>
                  <td className="num">{m.exits ? formatDuration(m.avgSec) : '–'}</td>
                  <td className="num">{m.exits ? formatDuration(m.medianSec) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Phỏng vấn (Phóng sự)" hint="Bắt đầu, hoàn thành hay bỏ ngang" className="span-5" flush>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Địa điểm</th>
                <th className="num">Bắt đầu</th>
                <th className="num">Hoàn thành</th>
                <th className="num">Bỏ ngang</th>
                <th className="num">Tỉ lệ xong</th>
              </tr>
            </thead>
            <tbody>
              {stats.interviews.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.name}</b>
                  </td>
                  <td className="num">{formatNumber(m.starts)}</td>
                  <td className="num">{formatNumber(m.completes)}</td>
                  <td className="num">{formatNumber(m.exits)}</td>
                  <td className="num">{m.starts ? formatPct(m.completes / m.starts) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Giờ bắt đầu chơi" hint="Số phiên theo giờ trong ngày (giờ Việt Nam)" className="span-7">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.hourly} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="hour" interval={2} {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} axisLine={false} />
            <Tooltip cursor={CURSOR} content={<ChartTooltip />} />
            <Bar dataKey="sessions" name="Phiên chơi" fill={COLORS.s1} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title="Thao tác được bấm nhiều nhất"
        hint={`${k.lockedClicks} lần bấm địa điểm còn khoá · ${k.journalOpens} lần mở nhật kí`}
        className="span-5"
      >
        <BarList items={stats.topClicks.slice(0, 10)} showShare={false} />
      </Card>

      <Card title="Thiết bị" className="span-4">
        <BarList items={stats.devices} />
      </Card>
      <Card title="Hệ điều hành" className="span-4">
        <BarList items={stats.os} />
      </Card>
      <Card title="Trình duyệt & nguồn truy cập" className="span-4">
        <BarList items={stats.browsers} />
        <div style={{ height: 16 }} />
        <BarList items={stats.referrers} color={COLORS.s3} />
      </Card>
    </div>
  )
}
