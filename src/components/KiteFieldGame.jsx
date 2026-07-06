import { useState } from 'react'
import { App as KiteGame } from '../tha_dieu/src/App.tsx'
import GameTutorial from './GameTutorial.jsx'
import '../tha_dieu/src/styles.css'

// Wrapper nhúng minigame "Thả diều" (tha_dieu) vào game chính, dùng cho địa điểm
// 'ruong' (Diều sáo trên đồng quê) sau khi hội thoại kết thúc.
// onExit được gọi khi người chơi bay đủ khoảng cách mục tiêu và bấm "Quay lại bản đồ".

const CONTROLS = [
  { key: 'A/D hoặc ←/→', label: 'Chạy trái / phải theo cánh đồng' },
  { key: 'Space / Chuột trái', label: 'Nhảy — nhảy xa hay gần phụ thuộc lực nâng của diều' },
  { key: 'Q / Chuột phải (giữ)', label: 'Thu dây diều — tăng lực kéo, cẩn thận dây quá căng' },
  { key: 'S', label: 'Thả dây diều — giảm lực kéo, tránh va chạm' },
  { key: 'R', label: 'Chơi lại từ đầu' },
  { key: 'Esc', label: 'Tạm dừng' },
]

const TIPS = [
  'Theo dõi độ căng của dây: quá chùng thì diều mất lực nâng, quá căng có thể đứt dây.',
  'Bắt gió thuận chiều để diều nâng người chơi nhảy xa hơn qua chướng ngại vật.',
  'Nếu sắp rơi, còn 2 giây để chạy ngược chiều gió và kéo lại thăng bằng.',
]

export default function KiteFieldGame({ onExit }) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <GameTutorial
        title="Thả diều trên đồng quê"
        tagline="Làm chủ dây diều, gió trời và cú nhảy đúng lúc."
        objective="Bay diều đủ khoảng cách mục tiêu qua cánh đồng mà không để diều rơi."
        controls={CONTROLS}
        tips={TIPS}
        accent="#3f8fae"
        onExit={onExit}
        onStart={() => setStarted(true)}
      />
    )
  }

  return <KiteGame onExit={onExit} />
}
