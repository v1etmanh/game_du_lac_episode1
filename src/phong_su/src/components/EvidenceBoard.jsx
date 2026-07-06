const STATUS_LABELS = {
  unverified: 'Chưa kiểm chứng',
  one_source: 'Đã có 1 nguồn',
  two_sources: 'Đã có 2 nguồn',
  contradiction: 'Mâu thuẫn',
  quotable: 'Có thể trích dẫn',
}

const KIND_LABELS = {
  testimony: 'Lời kể',
  observation: 'Quan sát',
  hidden_detail: 'Chi tiết ẩn',
  object: 'Vật chứng',
  comparison: 'Đối chiếu',
}

function EvidenceItem({ item }) {
  return (
    <article className={`evidence-item status-${item.status || item.reliability || 'unverified'}`}>
      <div className="evidence-item-top">
        <span>{KIND_LABELS[item.kind] || 'Bằng chứng'}</span>
        <b>{STATUS_LABELS[item.status || item.reliability] || 'Chưa kiểm chứng'}</b>
      </div>
      <p>{item.text}</p>
      <small>{item.source || 'Nguồn chưa rõ'} · {item.sensitivity || 'low'}</small>
    </article>
  )
}

export default function EvidenceBoard({ caseFile }) {
  const evidence = caseFile?.evidence || []
  const contradictions = caseFile?.contradictions || []
  const quotes = caseFile?.quotes || []

  return (
    <div className="evidence-board">
      <div className="evidence-board-head">
        <span>Sổ tay bằng chứng</span>
        <strong>{evidence.length}</strong>
      </div>
      <div className="evidence-list">
        {evidence.length === 0 && <p className="evidence-empty">Chưa có bằng chứng nào.</p>}
        {evidence.map(item => <EvidenceItem key={item.id} item={item} />)}
      </div>

      {(contradictions.length > 0 || quotes.length > 0) && (
        <div className="evidence-special">
          {contradictions.map(item => (
            <div key={item.id} className="evidence-alert">
              <b>Mâu thuẫn:</b> {item.text}
            </div>
          ))}
          {quotes.map(item => (
            <div key={item.id} className="evidence-quote">
              <b>Trích dẫn:</b> "{item.text}"
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
