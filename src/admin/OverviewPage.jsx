import { Clock, MessageSquareText, Star, Trophy, Users, Gamepad2 } from 'lucide-react'
import { Funnel, RatingChart, SessionsTrend, TREND_LEGEND } from './charts.jsx'
import { BarList, COLORS, Card, Empty, Kpi, Legend, Skeleton, formatDuration, formatNumber, formatPct } from './ui.jsx'

export default function OverviewPage({ stats, feedback, onNavigate }) {
  const k = stats?.kpis
  return (
    <>
      <div className="adm-kpis">
        {k ? (
          <>
            <Kpi icon={Gamepad2} label="Phiên chơi" value={formatNumber(k.sessions)} foot={`${formatNumber(stats.totalEvents)} sự kiện được ghi`} />
            <Kpi
              icon={Users}
              label="Người chơi"
              value={formatNumber(k.players)}
              foot={`${k.newPlayers} mới · ${k.returningPlayers} quay lại`}
            />
            <Kpi
              icon={Clock}
              tone="green"
              label="Thời gian / phiên"
              value={formatDuration(k.avgSessionSec)}
              foot={`Trung vị ${formatDuration(k.medianSessionSec)}`}
            />
            <Kpi
              icon={Trophy}
              tone="amber"
              label="Tỉ lệ phá đảo"
              value={formatPct(k.sessions ? k.finishedSessions / k.sessions : 0)}
              foot={`${k.finishedSessions} phiên xong Đền làng`}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} height={112} className="" />)
        )}
        {feedback ? (
          <>
            <Kpi icon={Star} tone="amber" label="Điểm feedback" value={feedback.avgRating} unit="/5" foot={`${formatPct(feedback.satisfiedShare)} chấm 4–5 sao`} />
            <Kpi icon={MessageSquareText} tone="rose" label="Phản hồi khảo sát" value={formatNumber(feedback.total)} foot={`${feedback.comments.length} ý kiến viết tay`} />
          </>
        ) : (
          [0, 1].map((i) => <Skeleton key={i} height={112} className="" />)
        )}
      </div>

      <div className="adm-grid">
        {stats ? (
          <Card title="Lượt chơi theo ngày" hint="Giờ Việt Nam" action={<Legend items={TREND_LEGEND} />} className="span-8">
            {k.sessions ? <SessionsTrend data={stats.daily} /> : <Empty>Chưa có phiên chơi trong khoảng này</Empty>}
          </Card>
        ) : (
          <Skeleton height={330} className="span-8" />
        )}

        {feedback ? (
          <Card
            title="Điểm trải nghiệm"
            hint={`${feedback.total} phản hồi · TB ${feedback.avgRating}/5`}
            className="span-4"
            action={
              <button className="adm-btn" onClick={() => onNavigate('feedback')}>
                Chi tiết
              </button>
            }
          >
            <RatingChart data={feedback.ratingDistribution} height={260} />
          </Card>
        ) : (
          <Skeleton height={330} className="span-4" />
        )}

        {stats ? (
          <>
            <Card
              title="Tiến độ cốt truyện"
              hint="Số phiên vào / hoàn thành từng địa điểm"
              className="span-7"
              action={
                <button className="adm-btn" onClick={() => onNavigate('behavior')}>
                  Xem thêm
                </button>
              }
            >
              <Funnel steps={stats.funnel} />
            </Card>
            <Card title="Người chơi dừng lại ở đâu" hint="Màn cuối của các phiên chưa phá đảo" className="span-5">
              <BarList items={stats.dropoff.slice(0, 8)} color={COLORS.s2} />
            </Card>
          </>
        ) : (
          <>
            <Skeleton height={380} className="span-7" />
            <Skeleton height={380} className="span-5" />
          </>
        )}
      </div>
    </>
  )
}
