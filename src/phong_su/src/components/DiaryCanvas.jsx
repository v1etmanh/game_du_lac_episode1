import { useEffect, useRef, useState } from 'react'
import { DIARY_IMAGE } from '../data/npcAssets.js'

// Cache ảnh diary.png + trạng thái font đã load, dùng chung cho mọi lần vẽ.
let cachedImage = null
function loadDiaryImage() {
  if (cachedImage) return Promise.resolve(cachedImage)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { cachedImage = img; resolve(img) }
    img.onerror = reject
    img.src = DIARY_IMAGE
  })
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Vẽ đè icon + tên mục lên trang trái, nội dung NPC kể lên trang phải
 * của ảnh public/diary.png bằng canvas, mô phỏng cảm giác "viết tay vào
 * sổ" thay vì hiện chữ trong 1 khung UI rời rạc.
 */
export default function DiaryCanvas({ section, unlocked }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const hasAnimatedRef = useRef({})
  const typeTimerRef = useRef(null)

  // Nạp ảnh diary + đợi web font sẵn sàng (tránh canvas vẽ nhầm font hệ thống)
  useEffect(() => {
    let cancelled = false
    Promise.all([
      loadDiaryImage(),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]).then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  // Hiệu ứng "viết tay" hiện dần chữ — chỉ chạy lần đầu mục được mở khoá
  useEffect(() => {
    clearTimeout(typeTimerRef.current)
    if (!unlocked || !section) { setDisplayedText(''); return }

    const key = section.id
    if (hasAnimatedRef.current[key]) {
      setDisplayedText(section.content)
      return
    }
    hasAnimatedRef.current[key] = true
    const full = section.content
    let i = 0
    const step = () => {
      i += 2
      setDisplayedText(full.slice(0, i))
      if (i < full.length) typeTimerRef.current = setTimeout(step, 16)
    }
    typeTimerRef.current = setTimeout(step, 16)
    return () => clearTimeout(typeTimerRef.current)
  }, [unlocked, section])

  // Vẽ lại canvas mỗi khi: ảnh/font sẵn sàng, đổi mục, đổi trạng thái khoá,
  // hoặc chữ đang được "viết" thêm.
  useEffect(() => {
    if (!ready || !section) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const availW = wrap.clientWidth
      const availH = wrap.clientHeight

      // "Contain-fit": co canvas đúng theo tỉ lệ ảnh diary.png gốc, để
      // toạ độ leftPage/rightPage (tính theo % của canvas) luôn khớp đúng
      // vị trí 2 trang sách trong ảnh — tránh chữ bị lệch/tràn ra ngoài
      // như khi ép ảnh lấp đầy khung theo "cover-fit". Khung .diary-canvas-wrap
      // đã có sẵn align-items/justify-content: center nên canvas tự canh giữa.
      const imgAspect = cachedImage.naturalWidth / cachedImage.naturalHeight
      let cssW, cssH
      if (availW / availH > imgAspect) {
        cssH = availH
        cssW = availH * imgAspect
      } else {
        cssW = availW
        cssH = availW / imgAspect
      }

      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)

      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.drawImage(cachedImage, 0, 0, cssW, cssH)

      // Vùng nội dung trang trái / trang phải (ước lượng theo tỉ lệ khung ảnh)
      const leftPage = { x: cssW * 0.10, y: cssH * 0.15, w: cssW * 0.34, h: cssH * 0.70 }
      const rightPage = { x: cssW * 0.3, y: cssH * 0.3, w: cssW * 0.34, h: cssH * 0.70 }

      ctx.textBaseline = 'top'

      if (unlocked) {
        // Trang trái — icon lớn + tên mục
        ctx.textAlign = 'center'
        ctx.font = `${Math.round(cssW * 0.0425)}px serif`
        ctx.fillText(section.icon, leftPage.x + leftPage.w / 2, leftPage.y + leftPage.h * 0.30)

        ctx.fillStyle = '#5c3d1e'
        ctx.font = `700 ${Math.round(cssW * 0.015)}px "Noto Serif", Georgia, serif`
        const titleLines = wrapText(ctx, section.label, leftPage.w)
        titleLines.forEach((line, i) => {
          ctx.fillText(line, leftPage.x + leftPage.w / 2, leftPage.y + leftPage.h * 0.50 + i * cssW * 0.019)
        })

        // Trang phải — nội dung NPC kể, hiện dần như đang viết
        ctx.textAlign = 'left'
        ctx.fillStyle = '#3d1f0a'
        const fontSize = Math.max(6, Math.round(cssW * 0.01225))
        ctx.font = `${fontSize}px "Noto Serif", Georgia, serif`
        const lineHeight = fontSize * 1.55
        const lines = wrapText(ctx, displayedText, rightPage.w)
        const maxLines = Math.max(1, Math.floor(rightPage.h / lineHeight))
        lines.slice(0, maxLines).forEach((line, i) => {
          ctx.fillText(line, rightPage.x, rightPage.y + i * lineHeight)
        })

        // Con trỏ mực nhấp nháy khi đang "viết"
        if (displayedText.length < section.content.length && lines.length) {
          const lastVisible = Math.min(lines.length, maxLines) - 1
          if (lastVisible >= 0) {
            const lastLine = lines[lastVisible]
            const lw = ctx.measureText(lastLine).width
            const blink = Math.floor(Date.now() / 450) % 2 === 0
            if (blink) {
              ctx.fillRect(rightPage.x + lw + 2, rightPage.y + lastVisible * lineHeight + 2, 2, fontSize)
            }
          }
        }
      } else {
        // Trang phải — mục chưa khám phá
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(61,31,10,0.4)'
        ctx.font = `${Math.round(cssW * 0.075)}px serif`
        ctx.fillText('🔒', rightPage.x + rightPage.w / 2, rightPage.y + rightPage.h * 0.32)
        ctx.font = `600 ${Math.round(cssW * 0.026)}px "Noto Serif", Georgia, serif`
        ctx.fillText('Chưa khám phá', rightPage.x + rightPage.w / 2, rightPage.y + rightPage.h * 0.46)

        ctx.fillStyle = 'rgba(61,31,10,0.25)'
        ctx.font = `${Math.round(cssW * 0.07)}px serif`
        ctx.fillText(section.icon, leftPage.x + leftPage.w / 2, leftPage.y + leftPage.h * 0.32)
      }
    }

    draw()

    const ro = new ResizeObserver(() => draw())
    ro.observe(wrap)

    let blinkInterval = null
    if (unlocked && displayedText.length < (section.content?.length || 0)) {
      blinkInterval = setInterval(draw, 450)
    }

    return () => {
      ro.disconnect()
      if (blinkInterval) clearInterval(blinkInterval)
    }
  }, [ready, section, unlocked, displayedText])

  return (
    <div ref={wrapRef} className="diary-canvas-wrap">
      <canvas ref={canvasRef} className="diary-canvas" />
    </div>
  )
}
