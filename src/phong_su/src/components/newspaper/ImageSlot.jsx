/**
 * Một ô ảnh trên trang báo. Không tự mở popover chọn ảnh — theo mô hình
 * "chọn ảnh trong khay bên sườn trước, rồi bấm vào ô muốn đặt" (đơn giản
 * hơn popover riêng từng ô, không cần thư viện kéo-thả). Nếu đang có 1 ảnh
 * được chọn trong khay (`hasPendingPick`), ô sẽ sáng viền để gợi ý "bấm vào
 * đây để đặt ảnh".
 */
export default function ImageSlot({ src, caption, onCaptionChange, onClick, hasPendingPick, ratio = '4/3', label }) {
  return (
    <div className="np-imgslot" style={{ aspectRatio: ratio }}>
      <button
        type="button"
        className={`np-imgslot-btn ${hasPendingPick ? 'np-imgslot-pending' : ''}`}
        onClick={onClick}
        title={hasPendingPick ? 'Bấm để đặt ảnh đã chọn vào đây' : 'Bấm để chọn ảnh khác từ khay bên sườn'}
      >
        {src
          ? <img src={src} alt={label || 'ảnh báo'} />
          : <span className="np-imgslot-empty">🖼️<br />{label || 'Chọn ảnh'}</span>}
      </button>
      <input
        className="np-caption-input"
        value={caption}
        placeholder="Chú thích ảnh..."
        onChange={(e) => onCaptionChange(e.target.value)}
      />
    </div>
  )
}
