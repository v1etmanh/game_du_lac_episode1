const STATUS_LABELS = {
  unverified: 'Chua kiem chung',
  one_source: 'Da co 1 nguon',
  two_sources: 'Da co 2 nguon',
  contradiction: 'Mau thuan',
  quotable: 'Co the trich dan',
}

const KIND_LABELS = {
  testimony: 'Loi ke',
  observation: 'Quan sat',
  hidden_detail: 'Chi tiet an',
  object: 'Vat chung',
  comparison: 'Doi chieu',
}

function EvidenceItem({ item }) {
  return (
    <article className={`evidence-item status-${item.status || item.reliability || 'unverified'}`}>
      <div className="evidence-item-top">
        <span>{KIND_LABELS[item.kind] || 'Bang chung'}</span>
        <b>{STATUS_LABELS[item.status || item.reliability] || 'Chua kiem chung'}</b>
      </div>
      <p>{item.text}</p>
      <small>{item.source || 'Nguon chua ro'} · {item.sensitivity || 'low'}</small>
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
        <span>So tay bang chung</span>
        <strong>{evidence.length}</strong>
      </div>
      <div className="evidence-list">
        {evidence.length === 0 && <p className="evidence-empty">Chua co bang chung nao.</p>}
        {evidence.map(item => <EvidenceItem key={item.id} item={item} />)}
      </div>

      {(contradictions.length > 0 || quotes.length > 0) && (
        <div className="evidence-special">
          {contradictions.map(item => (
            <div key={item.id} className="evidence-alert">
              <b>Mau thuan:</b> {item.text}
            </div>
          ))}
          {quotes.map(item => (
            <div key={item.id} className="evidence-quote">
              <b>Trich dan:</b> "{item.text}"
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
