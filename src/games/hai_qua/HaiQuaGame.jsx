import { useState } from 'react'
import HaiQuaApp from '../../hai_qua/src/main.jsx'
import GameTutorial from '../../components/GameTutorial.jsx'
import './HaiQuaGame.css'

const CONTROLS = [
  { key: '↑←↓→ / WASD', label: 'Di chuyển Lan Anh quanh vườn cây' },
  { key: 'Shift (giữ)', label: 'Chạy nhanh hơn' },
  { key: 'Space', label: 'Nhảy qua luống rau' },
  { key: 'Q (đứng gần cây)', label: 'Rung cây cho quả rơi nhanh hơn' },
  { key: 'Chạm vào quả rơi', label: 'Bắt quả (đứng gần gốc cây để vào tư thế bắt)' },
]

const TIPS = [
  'Quả rơi sẽ biến mất nếu chạm đất — canh vị trí đứng dưới tán cây trước khi rung.',
  'Càng về sau, cây ra nhiều quả hơn và quả rơi nhanh hơn — ưu tiên cây gần nhất.',
  'Nhảy qua luống rau để rút ngắn đường chạy giữa các gốc cây.',
]

export default function HaiQuaGame({ onExit }) {
  const [resetKey, setResetKey] = useState(0)
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <GameTutorial
        title="Hái quả vườn nhà"
        tagline="Nhanh tay hứng trọn mùa quả chín."
        objective="Thu hoạch đủ số lượng quả yêu cầu trước khi hết giờ."
        controls={CONTROLS}
        tips={TIPS}
        accent="#7fae3f"
        onExit={onExit}
        onStart={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="hai-qua-wrap">
      <div className="hai-qua-exitHeader">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
        <button type="button" className="secondaryButton" onClick={() => setResetKey((value) => value + 1)}>
          Reset
        </button>
      </div>
      <div className="hai-qua-frame">
        <HaiQuaApp key={resetKey} />
      </div>
    </div>
  )
}
