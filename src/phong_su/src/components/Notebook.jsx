import { useEffect, useState } from 'react'
import DiaryCanvas from './DiaryCanvas.jsx'

/**
 * Sổ ghi chép: dữ liệu mỗi mục được "viết" trực tiếp lên ảnh diary.png
 * bằng canvas (xem DiaryCanvas.jsx) — icon + tên mục ở trang trái, nội
 * dung NPC kể ở trang phải. Có thể lật qua các mục bằng mũi tên hoặc
 * chấm điều hướng bên dưới; mục mới mở khoá sẽ tự lật tới.
 */
export default function Notebook({ npcData, unlockedSections, recentlyUnlocked, currentSectionId, completionPct }) {
  const { sections } = npcData.notebook
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!currentSectionId) return
    const idx = sections.findIndex(s => s.id === currentSectionId)
    if (idx >= 0) setActiveIndex(idx)
  }, [currentSectionId, sections])

  const activeSection = sections[activeIndex]
  const isUnlocked = unlockedSections.has(activeSection.id)

  const goPrev = () => setActiveIndex(i => (i - 1 + sections.length) % sections.length)
  const goNext = () => setActiveIndex(i => (i + 1) % sections.length)

  return (
    <div className="notebook-panel">
      <div className="notebook-panel-header">
        <span className="notebook-panel-title">📔 Sổ Ghi Chép</span>
        <div style={{ flex: 1 }} />
        <span
          className="notebook-panel-pct"
          style={{ color: completionPct === 100 ? '#6fe0a0' : 'var(--gold-light)' }}
        >
          {completionPct}%
        </span>
      </div>

      <div className="notebook-panel-progress">
        <div
          className="notebook-panel-progress-fill"
          style={{
            width: `${completionPct}%`,
            background: completionPct === 100
              ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
              : 'linear-gradient(90deg, var(--wood-light), var(--gold))',
          }}
        />
      </div>

      <div className="diary-wrap">
        <button className="diary-nav diary-nav-prev" onClick={goPrev} aria-label="Trang trước">‹</button>
        <DiaryCanvas section={activeSection} unlocked={isUnlocked} />
        <button className="diary-nav diary-nav-next" onClick={goNext} aria-label="Trang sau">›</button>
      </div>

      <div className="diary-dots">
        {sections.map((s, i) => {
          const unlocked = unlockedSections.has(s.id)
          const isNew = recentlyUnlocked?.includes(s.id)
          return (
            <button
              key={s.id}
              className={[
                'diary-dot',
                unlocked ? 'unlocked' : 'locked',
                i === activeIndex ? 'active' : '',
                isNew ? 'is-new' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setActiveIndex(i)}
              title={unlocked ? s.label : 'Chưa khám phá'}
            >
              {unlocked ? s.icon : '🔒'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
