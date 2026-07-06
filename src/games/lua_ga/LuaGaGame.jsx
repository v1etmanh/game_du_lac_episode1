import { useRef, useState } from 'react'
import SimulationCanvas from '../../lua_ga/src/components/SimulationCanvas.jsx'
import CompletionModal from '../../lua_ga/src/components/CompletionModal.jsx'
import { DEFAULT_SETTINGS } from '../../lua_ga/src/config/defaultSettings.js'
import GameTutorial from '../../components/GameTutorial.jsx'
import './luaGaGame.css'

const CONTROLS = [
  { key: 'WASD / ↑←↓→', label: 'Di chuyển nhân vật trong sân' },
  { key: 'Shift (giữ)', label: 'Chạy nước rút trong 3 giây, sau đó cần thời gian hồi' },
  { key: 'Z', label: 'Thả thóc để dụ gà (số lượt thả có giới hạn, hồi theo thời gian)' },
  { key: 'X', label: 'Lướt nhanh (dash) theo hướng đang quay mặt' },
  { key: 'C', label: 'Vỗ tay tạo sóng, đẩy gà gần đó chạy tán loạn' },
  { key: 'F', label: 'Mở / đóng cổng chuồng gà' },
]

const TIPS = [
  'Gà hoảng sẽ chạy khó đoán hơn — nên dùng thóc để dụ thay vì đuổi ép sát.',
  'Chỉ tính là "đã vào chuồng" khi gà ở yên trong chuồng và cổng đã đóng đủ lâu.',
  'Cẩn thận gà trống: nó có thể tấn công nếu bị dồn ép quá lâu.',
  'Đừng thả thóc quá sát cổng chuồng — gà sẽ bỏ qua bãi thóc đó.',
]

export default function LuaGaGame({ onExit }) {
  const [snapshot, setSnapshot] = useState(null)
  const [started, setStarted] = useState(false)
  const simulationRef = useRef(null)

  if (!started) {
    return (
      <GameTutorial
        title="Lùa gà vào chuồng"
        tagline="Bình tĩnh dẫn dụ, đừng để đàn gà hoảng loạn."
        objective="Đưa toàn bộ đàn gà vào chuồng và đóng cổng trước khi hết thời gian."
        controls={CONTROLS}
        tips={TIPS}
        accent="#c8952e"
        onExit={onExit}
        onStart={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="lua-ga-wrap">
      <div className="lua-ga-exitHeader">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
      </div>

      <main className="appShell">
        <section className="playArea" aria-label="Simulation">
          <SimulationCanvas ref={simulationRef} settings={DEFAULT_SETTINGS} onSnapshot={setSnapshot} />
        </section>
      </main>

      <CompletionModal snapshot={snapshot} onReset={() => simulationRef.current?.reset()} />

      {(snapshot?.completed || snapshot?.failed) && (
        <div className="completionExitRow">
          <button type="button" onClick={onExit}>
            Quay lại bản đồ
          </button>
        </div>
      )}
    </div>
  )
}
