import { useState } from 'react'
import PhongSuApp from '../../phong_su/src/App.jsx'
import '../../phong_su/src/index.css'
import GameTutorial from '../../components/GameTutorial.jsx'
import './PhongSuGame.css'

const CONTROLS = [
  { key: 'Nhấp chuột', label: 'Chọn nhân vật trong làng để bắt đầu phỏng vấn' },
  { key: 'Gõ câu hỏi', label: 'Nhập câu hỏi của riêng bạn vào ô chat rồi gửi' },
  { key: '📔 Sổ tay', label: 'Xem câu hỏi gợi ý và tiến độ các mục đã khai thác được' },
  { key: '📰 Làm Tờ Báo', label: 'Sau khi phỏng vấn đủ thông tin, biên tập bài báo từ các trích dẫn đã thu thập' },
]

const TIPS = [
  'Mỗi câu hỏi có thể mở khoá một mục mới trong sổ tay — hỏi càng đa dạng, thông tin thu được càng đầy đủ.',
  'Không biết hỏi gì? Bấm vào 📔 để xem gợi ý câu hỏi phù hợp với nhân vật đang phỏng vấn.',
  'Cần thu thập đủ chứng cứ/trích dẫn trước khi có thể chuyển sang viết bài báo.',
  'Lắng nghe kỹ câu trả lời của nhân vật — nhiều chi tiết nhỏ có thể trở thành nguồn tin quý cho bài báo.',
]

export default function PhongSuGame({ npcId, onExit, onComplete }) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <GameTutorial
        title="Phóng Sự Làng"
        tagline="Hoá thân thành phóng viên, khai thác câu chuyện và viết nên bài báo của riêng bạn."
        objective="Phỏng vấn nhân vật để thu thập đủ thông tin, chứng cứ rồi biên tập thành một bài báo hoàn chỉnh."
        controls={CONTROLS}
        tips={TIPS}
        accent="#a8433a"
        onExit={onExit}
        onStart={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="phong-su-game">
      <PhongSuApp initialNpcId={npcId} onExit={onExit} onComplete={onComplete} />
    </div>
  )
}
