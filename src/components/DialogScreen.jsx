import { useState } from 'react'
import { CHARACTERS } from '../data/npcs.js'
import './DialogScreen.css'

// Đọc trước toàn bộ file json trong src/dialog lúc build (Vite glob import).
const dialogModules = import.meta.glob('../dialog/*.json', { eager: true })

function loadDialogData(locationId) {
  for (const path in dialogModules) {
    if (path.endsWith(`/${locationId}.json`)) {
      const mod = dialogModules[path]
      return mod.default ?? mod
    }
  }
  return null
}

// Màn hình hội thoại: nền = ảnh landscape của địa điểm, hộp thoại kiểu giấy cũ phía dưới,
// chân dung nhân vật đang nói nổi bên trái (Lan Anh/Tính) hoặc bên phải (NPC).
export default function DialogScreen({ locationId, onFinish, onBack }) {
  const data = loadDialogData(locationId)
  const [lineIndex, setLineIndex] = useState(0)

  if (!data || !data.dialogues?.length) {
    return (
      <div className="dialog-screen dialog-empty">
        <p>Chưa có hội thoại cho địa điểm này.</p>
        <button className="dialog-back-btn static" onClick={onBack}>← Quay lại bản đồ</button>
      </div>
    )
  }

  const line = data.dialogues[lineIndex]
  const character = CHARACTERS[line.speaker] || { name: line.speakerName, avatar: null }
  const isPlayerSide = line.speaker === 'lan_anh' || line.speaker === 'tinh'
  const isLast = lineIndex === data.dialogues.length - 1
  const bgImage = `/landscape/${locationId}.png`

  const handleAdvance = () => {
    if (isLast) {
      onFinish(data)
    } else {
      setLineIndex((i) => i + 1)
    }
  }

  return (
    <div
      className="dialog-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
      onClick={handleAdvance}
    >
      <button
        className="dialog-back-btn"
        onClick={(e) => {
          e.stopPropagation()
          onBack()
        }}
        aria-label="Quay lại"
      >
        ←
      </button>

      <div className="dialog-location-tag">{data.locationName}</div>

      <div className={`dialog-portrait ${isPlayerSide ? 'left' : 'right'}`}>
        {character.avatar ? (
          <img src={character.avatar} alt={character.name} />
        ) : (
          <div className="dialog-portrait-fallback">{character.name.charAt(0)}</div>
        )}
      </div>

      <div className="dialog-box">
        <div className="dialog-speaker-name">{line.speakerName}</div>
        <div className="dialog-text">{line.text}</div>
        <div className="dialog-footer">
          <span className="dialog-progress">{lineIndex + 1} / {data.dialogues.length}</span>
          <span className="dialog-next-hint">
            {isLast ? 'Nhấn để bắt đầu ▸' : 'Nhấn để tiếp ▸'}
          </span>
        </div>
      </div>
    </div>
  )
}
