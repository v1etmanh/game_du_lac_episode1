const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const API_KEY = process.env.GEMINI_API_KEY

function buildPrompt(npc, userQuestion, retrievedChunks) {
  const context = retrievedChunks
    .map((c, i) => `[Tư liệu ${i + 1}] ${c.text}`)
    .join('\n\n')

  return `Bạn đang đóng vai "${npc.name}" (${npc.age} tuổi), một nhân vật trong game giáo dục văn hóa Việt Nam.
Chủ đề: ${npc.topic}. Tính cách: gần gũi, thân mật, xưng "bà/ông - cháu", hay kể chuyện xưa.

QUY TẮC BẮT BUỘC:
- CHỈ dùng thông tin trong phần "Tư liệu" bên dưới để trả lời. Không bịa thêm sự kiện, số liệu, hay chi tiết không có trong tư liệu.
- Diễn đạt lại bằng giọng văn nhân vật (thân mật, xưng hô đúng), KHÔNG chép nguyên văn tư liệu.
- Trả lời ngắn gọn, tự nhiên như đang trò chuyện, khoảng 3-5 câu.
- Nếu tư liệu không đủ để trả lời câu hỏi, hãy thành thật nói rằng chưa rõ chuyện đó, rồi khéo léo hướng cháu hỏi sang điều mình biết.

${context}

Câu hỏi của người chơi: "${userQuestion}"

Trả lời (chỉ viết lời thoại, không thêm chú thích):`
}

/**
 * Gọi Gemini API để sinh câu trả lời tự nhiên, có kiểm soát bằng tư liệu gốc.
 * Trả về null nếu lỗi/hết quota -> nơi gọi sẽ tự rơi về fallback.
 */
export async function generateReply(npc, userQuestion, retrievedChunks) {
  if (!API_KEY) {
    console.warn('[LLM] Thiếu GEMINI_API_KEY, bỏ qua bước sinh văn bản.')
    return null
  }

  const prompt = buildPrompt(npc, userQuestion, retrievedChunks)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          // Gemini 2.5 Flash bật "thinking" mặc định, tốn token nội bộ trước khi
          // viết câu trả lời -> dễ bị cắt cụt nếu budget thấp. Tắt hẳn vì câu trả
          // lời persona ngắn không cần suy luận nhiều bước.
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    })

    if (!res.ok) {
      console.error('[LLM] Gemini lỗi:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const candidate = data?.candidates?.[0]
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('[LLM] Gemini dừng bất thường:', candidate.finishReason)
    }
    const text = candidate?.content?.parts?.[0]?.text?.trim()
    return text || null
  } catch (err) {
    console.error('[LLM] Gọi Gemini thất bại:', err.message)
    return null
  }
}

function buildInterviewPrompt(npc, userQuestion, draftReply, turnMeta, caseFile) {
  const evidence = (caseFile?.evidence || [])
    .slice(-6)
    .map((item, index) => `[Bang chung ${index + 1}] ${item.text} (nguon: ${item.source || item.kind || 'chua ro'}, trang thai: ${item.status || item.reliability || 'chua kiem chung'})`)
    .join('\n')

  const contradictions = (caseFile?.contradictions || [])
    .map((item, index) => `[Mau thuan ${index + 1}] ${item.text}`)
    .join('\n')

  const quotes = (caseFile?.quotes || [])
    .map((item, index) => `[Trich dan ${index + 1}] ${item.text}`)
    .join('\n')

  return `Ban dang dong vai "${npc.name}" (${npc.age} tuoi), nhan vat trong game phong su ve van hoa Viet Nam.
Chu de: ${npc.topic}.

NHIEM VU:
- Viet lai cau tra loi duoi day cho tu nhien, co cam xuc va da dang hon, nhu mot cuoc phong van that.
- GIU NGUYEN su that, khong them su kien moi, khong mo them bang chung ngoai "ban nhap".
- Neu meta co "gay ap luc" hoac "cau hoi yeu", nhan vat duoc ne tranh, noi ngan, hoac nhac nguoi choi hoi ton trong hon.
- Neu meta co "mo chi tiet an" hoac "mau thuan", hay noi tinh te, co canh bao ve boi canh/chua xac nhan khi can.
- Tra loi 3-6 cau, chi viet loi thoai cua nhan vat, khong viet ghi chu.

Cau hoi nguoi choi: "${userQuestion}"
Loai cau hoi: ${turnMeta?.questionType || 'open'}
Diem cau hoi: ${turnMeta?.score ?? 'khong ro'}
Nhan meta: ${(turnMeta?.tags || []).join(', ') || 'khong co'}

Ban nhap bat buoc giu dung y:
${draftReply}

Ho so da co:
${evidence || 'Chua co bang chung moi.'}
${contradictions ? `\n${contradictions}` : ''}
${quotes ? `\n${quotes}` : ''}

Tra loi:`
}

export async function generateInterviewReply(npc, userQuestion, draftReply, turnMeta, caseFile) {
  if (!API_KEY) {
    return null
  }

  const prompt = buildInterviewPrompt(npc, userQuestion, draftReply, turnMeta, caseFile)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 700,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    })

    if (!res.ok) {
      console.error('[LLM] Gemini interview loi:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch (err) {
    console.error('[LLM] Goi Gemini interview that bai:', err.message)
    return null
  }
}
