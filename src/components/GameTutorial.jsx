import './GameTutorial.css'

/**
 * Overlay hướng dẫn hiển thị TRƯỚC khi một minigame thực sự bắt đầu.
 * Dùng chung cho lua_ga, tha_dieu, hai_qua (và có thể tái sử dụng cho các game khác).
 *
 * Props:
 * - title: tên minigame (vd: "Lùa gà vào chuồng")
 * - tagline: mô tả ngắn 1 dòng dưới tên
 * - objective: mục tiêu chính của màn chơi (string)
 * - controls: mảng { key, label } - key hiển thị dạng phím bấm, label mô tả hành động
 * - tips: mảng string - mẹo chơi ngắn (tuỳ chọn)
 * - accent: màu nhấn theo chủ đề từng game (tuỳ chọn, mặc định vàng đất)
 * - startLabel: chữ trên nút bắt đầu (mặc định "Bắt đầu")
 * - onStart: callback khi bấm nút bắt đầu
 * - onExit: callback khi bấm "Quay lại bản đồ" (tuỳ chọn, không truyền thì ẩn nút)
 */
export default function GameTutorial({
  title,
  tagline,
  objective,
  controls = [],
  tips = [],
  accent = '#c88a2e',
  startLabel = 'Bắt đầu',
  onStart,
  onExit,
}) {
  return (
    <div className="game-tutorial-backdrop" style={{ '--tutorial-accent': accent }}>
      <div className="game-tutorial-card">
        <div className="game-tutorial-header">
          <p className="game-tutorial-eyebrow">Hướng dẫn chơi</p>
          <h1>{title}</h1>
          {tagline && <p className="game-tutorial-tagline">{tagline}</p>}
        </div>

        {objective && (
          <div className="game-tutorial-section game-tutorial-objective">
            <h2>Mục tiêu</h2>
            <p>{objective}</p>
          </div>
        )}

        {controls.length > 0 && (
          <div className="game-tutorial-section">
            <h2>Cách điều khiển</h2>
            <div className="game-tutorial-controls">
              {controls.map((control) => (
                <div className="game-tutorial-control-row" key={control.key}>
                  <span className="game-tutorial-key">{control.key}</span>
                  <span className="game-tutorial-control-label">{control.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tips.length > 0 && (
          <div className="game-tutorial-section game-tutorial-tips">
            <h2>Mẹo nhỏ</h2>
            <ul>
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="game-tutorial-actions">
          {onExit && (
            <button type="button" className="game-tutorial-secondary" onClick={onExit}>
              ← Quay lại bản đồ
            </button>
          )}
          <button type="button" className="game-tutorial-start" onClick={onStart} autoFocus>
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
