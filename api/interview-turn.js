import { createRequire } from 'module'
import {
  createInitialCaseFile,
  createInitialInterviewState,
  runInterviewTurn,
  summarizeInterview,
} from '../src/phong_su/src/engine/investigationEngine.js'

const require = createRequire(import.meta.url)
const ongBaData = require('../src/phong_su/src/data/npc_oanquan.json')
const hungData = require('../src/phong_su/src/data/npc_hung.json')
const baTuData = require('../src/phong_su/src/data/npc_danbau.json')
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const NPCS = [ongBaData, hungData, baTuData].reduce((byId, npc) => {
  byId[npc.id] = npc
  return byId
}, {})

const NPC_PERSONAS = {
  ong_ba: [
    'Mot ong gia lang cham rai, hay can nhac truoc khi noi.',
    'Thuong ke bang hinh anh san den, tieng soi, tieng tre con tranh luat.',
    'Khong noi qua chac ve truyen thuyet neu khong co bang chung.',
  ],
  hung: [
    'Mot nguoi tre lam nghe tre, noi thang, it van ve nhung co tinh cam.',
    'Hay lien he ky niem tuoi tho voi mui tre, vet duc, do nghe trong xuong.',
    'Co ranh gioi rieng tu ve Tinh va gia dinh, nhung se mem hon khi duoc hoi tu te.',
  ],
  ba_tu: [
    'Mot ba cu am ap, cham, noi nhu dang gat mot not dan moi tiep tuc.',
    'Noi ve dan bau bang ky uc rieng: nguoi chong, dua con chua kip goi ten, can nha bot im.',
    'Khong bien noi dau thanh bi luy; ba tu te, kin dao, nhung co chieu sau.',
  ],
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload)
}

function parseBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function compactLines(items, formatter) {
  return (items || []).map(formatter).filter(Boolean).join('\n')
}

function buildPersona(npc) {
  return compactLines([
    ...(NPC_PERSONAS[npc.id] || []),
    npc.tagline ? `Tagline nhan vat: ${npc.tagline}` : null,
    npc.greeting ? `Cach mo dau cua nhan vat: ${npc.greeting}` : null,
  ], (line) => line)
}

function buildNpcKnowledge(npc) {
  const sectionsById = (npc?.notebook?.sections || []).reduce((byId, section) => {
    byId[section.id] = section
    return byId
  }, {})

  return compactLines(Object.entries(npc?.responses || {}), ([topicId, response], index) => {
    const section = sectionsById[topicId]
    const keywords = (response.keywords || []).slice(0, 8).join(', ')
    return `[Chu de ${index + 1}: ${section?.label || topicId}]
Kien thuc dung: ${section?.content || response.text}
Chi tiet co the dung: ${response.text}
Cau hoi mau cua chu de: ${response.sampleQuestion || 'Khong co.'}
Tu khoa: ${keywords || 'Khong co.'}`
  })
}

function buildHistory(history) {
  return compactLines((history || []).slice(-8), (item) => {
    const speaker = item.sender === 'player' ? 'Nguoi choi' : 'Nhan vat'
    return `${speaker}: ${item.text}`
  })
}

function buildInterviewPrompt(npc, userQuestion, draftReply, turnMeta, caseFile, history) {
  const persona = buildPersona(npc)
  const npcKnowledge = buildNpcKnowledge(npc)
  const recentHistory = buildHistory(history)
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

TINH CACH VA GIONG NOI:
${persona || 'Nhan vat noi tu nhien, co ky uc rieng, khong giong sach giao khoa.'}

LUAT NHAP VAI:
- Hay tra loi nhu mot con nguoi dang duoc phong van, khong nhu dang doc dap an mau.
- Duoc tu sap xep y, chen mot vai cam giac, ngap ngung nhe, hinh anh doi thuong, va cach xung ho phu hop.
- Duoc noi them nhung cau noi tu nhien de lam nhan vat co tinh cach, mien la khong tao su kien lon trai voi KIEN THUC DUNG.
- Khong bi bat buoc lap lai "goi y tien do game"; neu goi y do lech cau hoi, hay uu tien cau hoi cua nguoi choi.
- Khong noi "theo ho so", "theo du lieu", "AI", hoac ghi chu ngoai loi thoai.
- Tra loi 3-7 cau. Neu cau hoi cham vao ky uc rieng, uu tien cam xuc va chi tiet doi song hon giai thich sach vo.

Cau hoi nguoi choi: "${userQuestion}"
Loai cau hoi: ${turnMeta?.questionType || 'open'}
Diem cau hoi: ${turnMeta?.score ?? 'khong ro'}
Nhan meta: ${(turnMeta?.tags || []).join(', ') || 'khong co'}

HO SO NHAN VAT:
${npcKnowledge || 'Khong co ho so nhan vat.'}

Lich su hoi dap gan nhat:
${recentHistory || 'Chua co lich su.'}

Goi y tien do game, chi de tham khao va co the bo qua neu lech cau hoi:
${draftReply}

Ho so da co:
${evidence || 'Chua co bang chung moi.'}
${contradictions ? `\n${contradictions}` : ''}
${quotes ? `\n${quotes}` : ''}

Tra loi:`
}

async function generateInterviewReply(npc, userQuestion, draftReply, turnMeta, caseFile, history) {
  if (!GEMINI_API_KEY) return null

  const prompt = buildInterviewPrompt(npc, userQuestion, draftReply, turnMeta, caseFile, history)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.15,
          topP: 0.95,
          maxOutputTokens: 850,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!response.ok) {
      console.error('[API] Gemini interview loi:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch (err) {
    console.error('[API] Goi Gemini interview that bai:', err.message)
    return null
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const { npcId, message, options = {}, interviewState, caseFile, history = [] } = parseBody(req)

    if (!npcId || !message?.trim()) {
      return sendJson(res, 400, { error: 'Thieu npcId hoac message' })
    }

    const npc = NPCS[npcId]
    if (!npc) {
      return sendJson(res, 404, { error: `Khong tim thay NPC "${npcId}"` })
    }

    const currentState = interviewState || createInitialInterviewState(npc)
    const currentCaseFile = caseFile || createInitialCaseFile(npc)
    const turn = runInterviewTurn(npc, currentState, currentCaseFile, message, options)
    const generated = await generateInterviewReply(
      npc,
      message,
      turn.response.text,
      turn.response.meta,
      turn.nextCaseFile,
      history,
    )

    const response = {
      ...turn.response,
      text: generated || turn.response.text,
      meta: {
        ...turn.response.meta,
        tags: [
          ...(turn.response.meta?.tags || []),
          generated ? 'server-ai' : 'server-rule',
        ],
      },
    }

    return sendJson(res, 200, {
      response,
      nextState: turn.nextState,
      nextCaseFile: turn.nextCaseFile,
      interviewSummary: summarizeInterview(turn.nextState, turn.nextCaseFile),
      usedLLM: Boolean(generated),
    })
  } catch (err) {
    console.error('[API] /api/interview-turn loi:', err)
    return sendJson(res, 500, { error: 'Loi server' })
  }
}
