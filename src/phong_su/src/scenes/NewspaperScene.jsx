import { useState, useRef, useCallback, useMemo } from 'react'
import EditableRichText from '../components/newspaper/EditableRichText.jsx'
import ImageSlot from '../components/newspaper/ImageSlot.jsx'
import { buildDefaultDraft, loadDraft, saveDraft } from '../data/newspaperDefaults.js'
import { NEWSPAPER_LAYOUTS } from '../data/newspaperLayouts.js'
import { getAllBackgrounds } from '../data/npcAssets.js'

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

async function nodeToPng(node, { pixelRatio = 2 } = {}) {
  const rect = node.getBoundingClientRect()
  const width = Math.ceil(rect.width)
  const height = Math.ceil(rect.height)
  const clone = node.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')

  const styleText = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  const html = new XMLSerializer().serializeToString(clone)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <style>${styleText}</style>
        ${html}
      </foreignObject>
    </svg>
  `

  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  const image = new Image()
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
    image.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  const ctx = canvas.getContext('2d')
  ctx.scale(pixelRatio, pixelRatio)
  ctx.drawImage(image, 0, 0, width, height)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/png')
}

/**
 * Màn "Biên Tập Báo" — trang báo giấy kiểu thật, CÓ NHIỀU BỐ CỤC để chọn
 * (xem `newspaperLayouts.js`). Cả 4 bố cục dùng chung 1 bộ dữ liệu (5 ảnh +
 * 3 khung chữ + masthead/headline/byline) — chỉ khác cách SẮP XẾP các
 * vùng đó trên trang, làm bằng CSS Grid `grid-template-areas` (class
 * `.layout-<id>` trong index.css). Nhờ vậy đổi qua lại bố cục không làm
 * mất nội dung đã nhập.
 * Nội dung chữ được chọn từ "ngân hàng đoạn trích" (dữ liệu notebook +
 * lịch sử chat thật của cuộc phỏng vấn) thay vì gõ tay. Ảnh lấy từ 5 ảnh
 * milestone có sẵn của NPC, hoặc dán URL ảnh ngoài. Xuất file PNG bằng
 * canvas/SVG nội bộ, lưu nháp vào localStorage theo từng NPC.
 */
export default function NewspaperScene({ npcData, messages, onBack, onFinish }) {
  const [draft, setDraft] = useState(() => loadDraft(npcData.id) || buildDefaultDraft(npcData))
  const [trayExtra, setTrayExtra] = useState([])
  const [pendingPick, setPendingPick] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [toast, setToast] = useState('')

  const paperRef = useRef(null)
  const textRefs = useRef({})
  const activeBlockId = useRef(null)

  const flashToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const defaultTray = useMemo(() => {
    const sections = npcData?.notebook?.sections || []
    return getAllBackgrounds(npcData.portrait).map((src, i) => ({
      src, label: sections[i]?.label || `Ảnh ${i + 1}`,
    }))
  }, [npcData])

  const trayImages = [...defaultTray, ...trayExtra]

  // Ngân hàng đoạn trích: mục sổ ghi chép (tóm tắt) + lời NPC thật trong
  // đoạn hội thoại (nếu có truyền `messages` xuống từ InterviewScene).
  const snippets = useMemo(() => {
    const fromSections = (npcData?.notebook?.sections || []).map(s => ({
      id: `sec-${s.id}`, label: `📔 ${s.label}`, text: s.content,
    }))
    const fromChat = (messages || [])
      .filter(m => m.sender === 'npc')
      .map((m, i) => ({ id: `msg-${m.id ?? i}`, label: `💬 Lời kể #${i + 1}`, text: m.text }))
    return [...fromSections, ...fromChat]
  }, [npcData, messages])

  const updateField = (key, value) => setDraft(d => ({ ...d, [key]: value }))
  const setLayout = (id) => updateField('layout', id)

  const registerTextRef = useCallback((id, node) => { textRefs.current[id] = node }, [])
  const handleFocusBlock = useCallback((id) => { activeBlockId.current = id }, [])
  const handleBlurSync = useCallback((id, html) => {
    setDraft(d => ({ ...d, texts: { ...d.texts, [id]: html } }))
  }, [])

  const setImageSlot = (slotKey, src) => {
    setDraft(d => ({ ...d, images: { ...d.images, [slotKey]: { ...d.images[slotKey], src } } }))
  }
  const setCaption = (slotKey, caption) => {
    setDraft(d => ({ ...d, images: { ...d.images, [slotKey]: { ...d.images[slotKey], caption } } }))
  }
  const handleSlotClick = (slotKey) => {
    if (!pendingPick) { flashToast('Chọn 1 ảnh trong khay bên trái trước nhé.'); return }
    setImageSlot(slotKey, pendingPick)
    setPendingPick(null)
  }

  const handleAddUrlImage = () => {
    const url = urlInput.trim()
    if (!/^https?:\/\//i.test(url)) { flashToast('URL ảnh phải bắt đầu bằng http(s)://'); return }
    setTrayExtra(prev => [...prev, { src: url, label: 'Ảnh URL' }])
    setUrlInput('')
  }

  const insertSnippet = (text) => {
    const id = activeBlockId.current
    const node = id && textRefs.current[id]
    if (!node) { flashToast('Bấm vào 1 khung chữ trên trang báo trước, rồi mới chèn đoạn trích.'); return }
    node.focus()
    const range = document.createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    document.execCommand('insertHTML', false, `<p>${escapeHtml(text)}</p>`)
    setDraft(d => ({ ...d, texts: { ...d.texts, [id]: node.innerHTML } }))
  }

  const syncAllTextRefs = () => {
    setDraft(d => {
      const texts = { ...d.texts }
      Object.entries(textRefs.current).forEach(([id, node]) => {
        if (node) texts[id] = node.innerHTML
      })
      return { ...d, texts }
    })
  }

  const handleSaveDraft = () => {
    syncAllTextRefs()
    // setDraft là async — đợi 1 tick rồi lưu bản mới nhất từ ref trực tiếp
    // để không lưu thiếu nội dung khung đang focus lúc bấm nút.
    const texts = { ...draft.texts }
    Object.entries(textRefs.current).forEach(([id, node]) => { if (node) texts[id] = node.innerHTML })
    const finalDraft = { ...draft, texts }
    saveDraft(npcData.id, finalDraft)
    flashToast('💾 Đã lưu nháp vào trình duyệt.')
  }

  const handleExportPng = async () => {
    if (!paperRef.current) return
    flashToast('⏳ Đang tạo ảnh...')
    try {
      const dataUrl = await nodeToPng(paperRef.current, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `bao-${npcData.id}.png`
      a.click()
      flashToast('✅ Đã tải tờ báo về máy.')
    } catch (err) {
      console.error('[Newspaper] Xuất ảnh lỗi:', err)
      flashToast('❌ Xuất ảnh lỗi, thử lại nhé.')
    }
  }

  return (
    <div className="np-editor">
      <div className="np-topbar">
        <button className="np-btn" onClick={onBack}>← Quay lại</button>
        <div className="np-topbar-title">📰 Biên Tập Báo — {npcData.name}</div>
        <div className="np-topbar-actions">
          <button className="np-btn" onClick={handleSaveDraft}>💾 Lưu nháp</button>
          <button className="np-btn np-btn-primary" onClick={handleExportPng}>⬇️ Tải PNG</button>
          <button className="np-btn np-btn-primary" onClick={onFinish}>Hoàn tất bài báo</button>
        </div>
      </div>

      {toast && <div className="np-toast">{toast}</div>}

      <div className="np-workspace">
        <aside className="np-sidebar">
          <section className="np-panel">
            <h4>📐 Bố Cục</h4>
            <p className="np-hint">Đổi bố cục không làm mất nội dung đã chọn/nhập.</p>
            <div className="np-layout-list">
              {NEWSPAPER_LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  className={`np-layout-item ${draft.layout === l.id ? 'active' : ''}`}
                  onClick={() => setLayout(l.id)}
                  title={l.desc}
                >
                  <span className="np-layout-icon">{l.icon}</span>
                  <span className="np-layout-name">{l.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="np-panel">
            <h4>🖼️ Khay Ảnh</h4>
            <p className="np-hint">Bấm chọn 1 ảnh, rồi bấm vào ô ảnh trên trang báo để đặt vào đó.</p>
            <div className="np-tray-grid">
              {trayImages.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  className={`np-tray-thumb ${pendingPick === img.src ? 'active' : ''}`}
                  onClick={() => setPendingPick(img.src)}
                  title={img.label}
                >
                  <img src={img.src} alt={img.label} />
                </button>
              ))}
            </div>
            <div className="np-url-add">
              <input
                placeholder="Dán URL ảnh..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrlImage()}
              />
              <button className="np-btn" onClick={handleAddUrlImage}>+ Thêm</button>
            </div>
          </section>

          <section className="np-panel">
            <h4>✂️ Đoạn Trích</h4>
            <p className="np-hint">Bấm vào 1 khung chữ trên trang báo trước, rồi bấm "Chèn" để dán vào đó.</p>
            <div className="np-snippet-list">
              {snippets.map((s) => (
                <div key={s.id} className="np-snippet-item">
                  <div className="np-snippet-label">{s.label}</div>
                  <div className="np-snippet-text">{s.text}</div>
                  <button className="np-btn np-btn-sm" onClick={() => insertSnippet(s.text)}>Chèn ↳</button>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="np-paper-wrap">
          <div className={`np-paper layout-${draft.layout}`} ref={paperRef}>
            <div className="np-paper-grid">
              <div className="np-area-masthead">
                <input
                  className="np-masthead-input"
                  value={draft.masthead}
                  onChange={(e) => updateField('masthead', e.target.value)}
                />
                <div className="np-masthead-sub">
                  <input value={draft.date} onChange={(e) => updateField('date', e.target.value)} />
                  <span>·</span>
                  <input value={draft.issueLabel} onChange={(e) => updateField('issueLabel', e.target.value)} />
                </div>
              </div>

              <input
                className="np-headline np-area-headline"
                value={draft.headline}
                placeholder="Tiêu đề chính..."
                onChange={(e) => updateField('headline', e.target.value)}
              />
              <input
                className="np-byline np-area-byline"
                value={draft.byline}
                onChange={(e) => updateField('byline', e.target.value)}
              />

              <div className="np-area-hero">
                <ImageSlot
                  ratio="16/9"
                  label="Ảnh chính"
                  src={draft.images.hero.src}
                  caption={draft.images.hero.caption}
                  hasPendingPick={!!pendingPick}
                  onClick={() => handleSlotClick('hero')}
                  onCaptionChange={(v) => setCaption('hero', v)}
                />
              </div>

              <EditableRichText
                id="col1"
                defaultHtml={draft.texts.col1}
                placeholder="Chọn 1 đoạn trích bên sườn để chèn vào đây..."
                className="np-body-col np-area-col1"
                registerRef={registerTextRef}
                onFocusBlock={handleFocusBlock}
                onBlurSync={handleBlurSync}
              />
              <EditableRichText
                id="col2"
                defaultHtml={draft.texts.col2}
                placeholder="Chọn 1 đoạn trích bên sườn để chèn vào đây..."
                className="np-body-col np-area-col2"
                registerRef={registerTextRef}
                onFocusBlock={handleFocusBlock}
                onBlurSync={handleBlurSync}
              />

              <div className="np-quotebox np-area-quotebox">
                <span className="np-quote-mark">“</span>
                <EditableRichText
                  id="quote"
                  defaultHtml={draft.texts.quote}
                  placeholder="Trích 1 câu nói đáng nhớ..."
                  className="np-quote-text"
                  registerRef={registerTextRef}
                  onFocusBlock={handleFocusBlock}
                  onBlurSync={handleBlurSync}
                />
              </div>

              <div className="np-area-quoteimg">
                <ImageSlot
                  ratio="1/1"
                  label="Ảnh minh hoạ"
                  src={draft.images.quote.src}
                  caption={draft.images.quote.caption}
                  hasPendingPick={!!pendingPick}
                  onClick={() => handleSlotClick('quote')}
                  onCaptionChange={(v) => setCaption('quote', v)}
                />
              </div>

              <div className="np-thumbrow np-area-thumbs">
                <ImageSlot
                  ratio="4/3"
                  label="Ảnh 3"
                  src={draft.images.thumb1.src}
                  caption={draft.images.thumb1.caption}
                  hasPendingPick={!!pendingPick}
                  onClick={() => handleSlotClick('thumb1')}
                  onCaptionChange={(v) => setCaption('thumb1', v)}
                />
                <ImageSlot
                  ratio="4/3"
                  label="Ảnh 4"
                  src={draft.images.thumb2.src}
                  caption={draft.images.thumb2.caption}
                  hasPendingPick={!!pendingPick}
                  onClick={() => handleSlotClick('thumb2')}
                  onCaptionChange={(v) => setCaption('thumb2', v)}
                />
                <ImageSlot
                  ratio="4/3"
                  label="Ảnh 5"
                  src={draft.images.thumb3.src}
                  caption={draft.images.thumb3.caption}
                  hasPendingPick={!!pendingPick}
                  onClick={() => handleSlotClick('thumb3')}
                  onCaptionChange={(v) => setCaption('thumb3', v)}
                />
              </div>

              <div className="np-footer np-area-footer">Trích từ cuộc phỏng vấn — Dự Án Ghi Chép Làng Xưa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
