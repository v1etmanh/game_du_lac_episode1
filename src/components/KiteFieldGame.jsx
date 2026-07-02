import { App as KiteGame } from '../tha_dieu/src/App.tsx'
import '../tha_dieu/src/styles.css'

// Wrapper nhúng minigame "Thả diều" (tha_dieu) vào game chính, dùng cho địa điểm
// 'ruong' (Diều sáo trên đồng quê) sau khi hội thoại kết thúc.
// onExit được gọi khi người chơi bay đủ khoảng cách mục tiêu và bấm "Quay lại bản đồ".
export default function KiteFieldGame({ onExit }) {
  return <KiteGame onExit={onExit} />
}
