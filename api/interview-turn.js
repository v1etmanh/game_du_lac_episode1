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

async function generateInterviewReply(npc, userQuestion, draftReply, turnMeta, caseFile) {
  if (!GEMINI_API_KEY) return null

  const prompt = buildInterviewPrompt(npc, userQuestion, draftReply, turnMeta, caseFile)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 700,
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
    const { npcId, message, options = {}, interviewState, caseFile } = parseBody(req)

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
