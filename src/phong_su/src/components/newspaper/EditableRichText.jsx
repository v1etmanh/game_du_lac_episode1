import { useRef, useState, useCallback, useEffect } from 'react'

// Vài màu highlight cố định — đủ dùng cho "bôi màu" mà không cần color picker
const HIGHLIGHT_COLORS = [
  { name: 'Vàng', value: '#fff59d' },
  { name: 'Cam', value: '#ffd6a5' },
  { name: 'Xanh', value: '#b8f2c9' },
]

/**
 * Khung chữ có thể chọn-từng-từ để in đậm / bôi màu (dùng Selection API +
 * document.execCommand — vẫn hoạt động tốt trên Chromium dù đã deprecated,
 * đủ cho nhu cầu 1 project nhỏ này). Nội dung CHỈ được đồng bộ ra ngoài lúc
 * onBlur (không đồng bộ theo từng phím gõ) để tránh lỗi kinh điển của
 * contentEditable trong React: set lại innerHTML khi đang gõ làm mất vị trí
 * con trỏ. Component tự đăng ký DOM node của mình vào `registerRef(id, node)`
 * do component cha truyền xuống, để cha có thể: (1) đọc nội dung mới nhất
 * bất cứ lúc nào (lúc xuất ảnh/lưu nháp), (2) focus + chèn đoạn trích vào
 * đúng khung đang được chọn.
 */
export default function EditableRichText({
  id,
  defaultHtml = '',
  placeholder = '',
  className = '',
  style = {},
  registerRef,
  onFocusBlock,
  onBlurSync,
}) {
  const ref = useRef(null)
  const [toolbarPos, setToolbarPos] = useState(null)

  useEffect(() => {
    if (ref.current) registerRef?.(id, ref.current)
  }, [id, registerRef])

  const updateToolbar = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !ref.current || sel.rangeCount === 0) {
      setToolbarPos(null)
      return
    }
    const range = sel.getRangeAt(0)
    if (!ref.current.contains(range.commonAncestorContainer)) {
      setToolbarPos(null)
      return
    }
    const rect = range.getBoundingClientRect()
    const parentRect = ref.current.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) { setToolbarPos(null); return }
    setToolbarPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 38,
    })
  }, [])

  const withPreservedSelection = (fn) => (e) => {
    e.preventDefault() // giữ selection không bị mất khi bấm nút trong toolbar
    fn()
    updateToolbar()
  }

  const applyBold = () => document.execCommand('bold')
  const applyHighlight = (color) => document.execCommand('hiliteColor', false, color)
  const clearFormat = () => document.execCommand('removeFormat')

  return (
    <div className={`rt-field ${className}`} style={{ position: 'relative', ...style }}>
      {toolbarPos && (
        <div
          className="rt-toolbar"
          style={{ left: toolbarPos.x, top: toolbarPos.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button title="In đậm" onMouseDown={withPreservedSelection(applyBold)}><b>B</b></button>
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              title={`Bôi màu ${c.name}`}
              className="rt-toolbar-swatch"
              style={{ background: c.value }}
              onMouseDown={withPreservedSelection(() => applyHighlight(c.value))}
            />
          ))}
          <button title="Xoá định dạng" onMouseDown={withPreservedSelection(clearFormat)}>✕</button>
        </div>
      )}
      <div
        ref={ref}
        className="rt-editable"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: defaultHtml }}
        onFocus={() => onFocusBlock?.(id)}
        onMouseUp={updateToolbar}
        onKeyUp={updateToolbar}
        onBlur={() => {
          setToolbarPos(null)
          if (ref.current) onBlurSync?.(id, ref.current.innerHTML)
        }}
      />
    </div>
  )
}
