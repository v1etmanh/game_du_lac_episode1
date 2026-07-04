import { getAllBackgrounds } from './npcAssets.js'

const VI_MONTHS = ['Một', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Mười Hai']

function todayVi() {
  const d = new Date()
  return `Ngày ${d.getDate()} Tháng ${VI_MONTHS[d.getMonth()]} Năm ${d.getFullYear()}`
}

/**
 * Tạo bản nháp tờ báo mặc định cho 1 NPC — dùng khi chưa có bản lưu trong
 * localStorage. Lấy sẵn 5 ảnh milestone + nội dung 3 mục đầu của notebook
 * làm gợi ý khởi điểm (người dùng thay thế thoải mái qua khay ảnh / ngân
 * hàng đoạn trích trong lúc biên tập).
 */
export function buildDefaultDraft(npcData) {
  const sections = npcData?.notebook?.sections || []
  const bg = getAllBackgrounds(npcData.portrait)
  const pick = (i) => bg[i] || bg[0] || ''
  const sec = (i) => sections[i]

  return {
    layout: 'classic',
    masthead: 'BÁO LÀNG NGÀY XƯA',
    issueLabel: `Số Đặc Biệt · Chuyên Đề: ${npcData.topic}`,
    date: todayVi(),
    headline: `${npcData.topic}: Chuyện Kể Từ ${npcData.name}`,
    byline: `Phóng viên: ______ · Nhân vật phỏng vấn: ${npcData.name}`,
    images: {
      hero: { src: pick(0), caption: sec(0)?.label || '' },
      quote: { src: pick(1), caption: sec(1)?.label || '' },
      thumb1: { src: pick(2), caption: sec(2)?.label || '' },
      thumb2: { src: pick(3), caption: sec(3)?.label || '' },
      thumb3: { src: pick(4), caption: sec(4)?.label || '' },
    },
    texts: {
      col1: sec(0)?.content ? `<p>${sec(0).content}</p>` : '',
      col2: sec(1)?.content ? `<p>${sec(1).content}</p>` : '',
      quote: sec(2)?.content ? `<p>${sec(2).content}</p>` : '',
    },
  }
}

export function loadDraft(npcId) {
  try {
    const raw = localStorage.getItem(`newspaper_${npcId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Bản nháp lưu trước khi có tính năng nhiều layout sẽ thiếu `layout`
    // — mặc định về 'classic' để không vỡ CSS grid khi load lại.
    return { layout: 'classic', ...parsed }
  } catch {
    return null
  }
}

export function saveDraft(npcId, draft) {
  try {
    localStorage.setItem(`newspaper_${npcId}`, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}
