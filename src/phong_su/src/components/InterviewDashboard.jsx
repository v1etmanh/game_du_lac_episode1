const METRICS = [
  ['trust', 'Tin tưởng'],
  ['openness', 'Mở chủ đề'],
  ['depth', 'Độ sâu'],
  ['verification', 'Kiểm chứng'],
  ['ethics', 'Đạo đức'],
]

function metricColor(value) {
  if (value >= 72) return '#42b883'
  if (value >= 45) return '#d4a054'
  return '#d95d4f'
}

export default function InterviewDashboard({ summary }) {
  return (
    <div className="interview-dashboard">
      <div className="interview-dashboard-head">
        <span>Bộ chỉ số phỏng vấn</span>
        <strong>{summary.overall}/100</strong>
      </div>
      <div className="interview-metric-grid">
        {METRICS.map(([key, label]) => {
          const value = Math.round(summary[key] || 0)
          return (
            <div className="interview-metric" key={key}>
              <div className="interview-metric-label">
                <span>{label}</span>
                <b>{value}</b>
              </div>
              <div className="interview-metric-track">
                <div
                  className="interview-metric-fill"
                  style={{ width: `${value}%`, background: metricColor(value) }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="interview-dashboard-foot">
        <span>{summary.evidenceCount} bằng chứng</span>
        <span>{summary.contradictionCount} mâu thuẫn</span>
        <span>{summary.quoteCount} trích dẫn</span>
      </div>
      <div className={`ready-chip ${summary.readyToWrite ? 'ready' : ''}`}>
        {summary.readyToWrite ? 'Hồ sơ đã đủ chất liệu viết bài' : 'Cần thêm bằng chứng / câu hỏi sâu'}
      </div>
    </div>
  )
}
