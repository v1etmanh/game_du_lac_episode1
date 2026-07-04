import { useState } from 'react'
import NPCPortrait from '../components/NPCPortrait.jsx'
import MessageList from '../components/MessageList.jsx'
import TextInput from '../components/TextInput.jsx'
import Notebook from '../components/Notebook.jsx'
import { useNotebook } from '../hooks/useNotebook.js'
import { useConversation } from '../hooks/useConversation.js'

function NotebookBadge({ unlockedCount, totalSections, recentlyUnlocked, npcData, onChooseQuestion }) {
  // Câu hỏi gợi ý lấy trực tiếp từ `npcData.responses[sectionId].sampleQuestion`
  // — do người viết nội dung soạn sẵn riêng cho từng nhân vật/mốc, đúng
  // giọng văn và xưng hô của nhân vật đó. TRƯỚC ĐÂY hàm này đoán câu hỏi
  // bằng cách dò regex trên `label` (vd "nguồn", "kỹ", "kỷ"...) rồi trả về
  // câu hỏi hard-code sẵn nội dung về ĐÀN BẦU — nên hễ label của NPC khác
  // (Ông Ba, Hùng...) chỉ cần trùng regex là bị gán nhầm câu hỏi về đàn
  // bầu, dù đang phỏng vấn nhân vật khác. Đọc thẳng dữ liệu theo `s.id`
  // giải quyết triệt để lỗi này và tự đúng với mọi NPC thêm sau này.
  const suggestions = (npcData?.notebook?.sections || []).map(s => {
    const response = npcData?.responses?.[s.id]
    const q = response?.sampleQuestion || `Bạn có thể kể về ${(s.label || '').toLowerCase()} không?`
    return { id: s.id, q }
  })

  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Gợi ý câu hỏi"
        style={{
          background: recentlyUnlocked.length > 0
            ? 'linear-gradient(135deg, #d4a054, #f0c060)'
            : 'rgba(253,243,227,0.1)',
          border: '1.5px solid rgba(212,160,84,0.5)',
          color: recentlyUnlocked.length > 0 ? '#3d1f0a' : '#f0d090',
          borderRadius: 8,
          padding: '7px 12px',
          fontSize: '0.83rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        📔 {unlockedCount}/{totalSections}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: 8,
          width: 320,
          background: 'rgba(12,6,2,0.92)',
          color: '#f6e8cf',
          border: '1px solid rgba(255,240,200,0.06)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          borderRadius: 10,
          padding: 10,
          zIndex: 30,
        }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Gợi ý câu hỏi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s.id} onClick={() => { onChooseQuestion?.(s.q); setOpen(false) }} style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                color: 'inherit',
                border: 'none',
                cursor: 'pointer',
              }}>{s.q}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function InterviewScene({ npcData, onBack, onComplete }) {
  const {
    unlockedSections,
    recentlyUnlocked,
    currentSectionId,
    unlockSections,
    completionPct,
    isComplete,
    unlockedCount,
    totalSections,
  } = useNotebook(npcData)

  const { messages, sendMessage, isTyping } = useConversation(npcData, (ids) => {
    unlockSections(ids)
  })

  const [prefill, setPrefill] = useState(undefined)

  const handleChooseQuestion = (q) => {
    setPrefill(q)
    setTimeout(() => setPrefill(undefined), 2000)
    // also auto-send after a short delay if desired — leave commented
    // setTimeout(() => sendMessage(q), 600)
  }

  // Trigger completion callback once
  const [completionFired, setCompletionFired] = useState(false)
  if (isComplete && !completionFired) {
    setCompletionFired(true)
    // Truyền kèm `messages` (lịch sử chat thật) để màn "Biên Tập Báo" có
    // thêm nguồn đoạn trích ngoài `notebook.sections` — xem NewspaperScene.jsx.
    setTimeout(() => onComplete(npcData, messages), 1200)
  }

  return (
    <div className="interview-scene">

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="interview-topbar">
        <button
          onClick={onBack}
          style={{
            background: 'rgba(253,243,227,0.1)',
            border: '1.5px solid rgba(212,160,84,0.4)',
            color: '#f0d090',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(253,243,227,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(253,243,227,0.1)' }}
        >
          ← Làng
        </button>

        <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f0d090', fontWeight: 700, fontSize: '0.95rem' }}>
            {npcData.name}
          </div>
          <div style={{ color: 'rgba(240,208,144,0.6)', fontSize: '0.72rem' }}>
            {npcData.topic}
          </div>
        </div>

        <NotebookBadge
          unlockedCount={unlockedCount}
          totalSections={totalSections}
          recentlyUnlocked={recentlyUnlocked}
          npcData={npcData}
          onChooseQuestion={handleChooseQuestion}
        />
      </div>

      {/* ── Main content: 2 cột ───────────────────────── */}
      <div className="interview-main">

        {/* Cột trái: nhân vật + sổ ghi chép */}
        <div className="interview-left">
          <div className="interview-portrait-wrap">
            <NPCPortrait
              portraitId={npcData.portrait}
              currentSectionId={currentSectionId}
              width="100%"
              height="100%"
            />
          </div>

          <div className="interview-progress">
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: completionPct === 100 ? '#27ae60' : completionPct >= 60 ? 'var(--gold)' : 'var(--wood-light)',
            }}>
              📔 {completionPct}%
            </span>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${completionPct}%`,
                background: completionPct === 100
                  ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
                  : 'linear-gradient(90deg, var(--wood-light), var(--gold))',
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }} />
            </div>
            {isComplete && (
              <span style={{ fontSize: '0.72rem', color: '#27ae60', fontWeight: 700, whiteSpace: 'nowrap' }}>
                ✓
              </span>
            )}
          </div>

          <Notebook
            npcData={npcData}
            unlockedSections={unlockedSections}
            recentlyUnlocked={recentlyUnlocked}
            currentSectionId={currentSectionId}
            completionPct={completionPct}
          />
        </div>

        {/* Cột phải: hội thoại — khung nhỏ, canh giữa, không chiếm hết vùng */}
        <div className="interview-right">
          <div className="interview-dialog-box">
            <div className="interview-chat-panel">
              <MessageList
                messages={messages}
                isTyping={isTyping}
                npcName={npcData.name}
              />
            </div>

            <div className="interview-input-wrap">
              <TextInput onSend={sendMessage} disabled={isTyping} prefill={prefill} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
