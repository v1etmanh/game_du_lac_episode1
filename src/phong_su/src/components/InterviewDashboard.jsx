const METRICS = [
  ['trust', 'Tin tuong'],
  ['openness', 'Mo chu de'],
  ['depth', 'Do sau'],
  ['verification', 'Kiem chung'],
  ['ethics', 'Dao duc'],
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
        <span>Bo chi so phong van</span>
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
        <span>{summary.evidenceCount} bang chung</span>
        <span>{summary.contradictionCount} mau thuan</span>
        <span>{summary.quoteCount} trich dan</span>
      </div>
      <div className={`ready-chip ${summary.readyToWrite ? 'ready' : ''}`}>
        {summary.readyToWrite ? 'Ho so da du chat lieu viet bai' : 'Can them bang chung / cau hoi sau'}
      </div>
    </div>
  )
}
