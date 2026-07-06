import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { loadKnowledgeBase } from './data.js'
import { getKnowledgeBase, search } from './knowledgeBase.js'
import { generateInterviewReply, generateReply } from './llm.js'
import {
  createInitialCaseFile,
  createInitialInterviewState,
  runInterviewTurn,
  summarizeInterview,
} from '../../src/phong_su/src/engine/investigationEngine.js'

const PORT = process.env.PORT || 3001
const THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD || 0.78)

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

let plainKnowledgeBase = null

function getPlainKnowledgeBase() {
  if (!plainKnowledgeBase) {
    plainKnowledgeBase = loadKnowledgeBase()
  }

  return plainKnowledgeBase
}

function pickFallback(npc) {
  const list = npc.fallback || []
  return list[Math.floor(Math.random() * list.length)] || 'Ba chua nghe ro cau hoi cua chau...'
}

app.post('/api/chat', async (req, res) => {
  try {
    const { npcId, message } = req.body || {}
    if (!npcId || !message?.trim()) {
      return res.status(400).json({ error: 'Thieu npcId hoac message' })
    }

    const { npcs } = await getKnowledgeBase()
    const npc = npcs[npcId]
    if (!npc) return res.status(404).json({ error: `Khong tim thay NPC "${npcId}"` })

    const matches = await search(npcId, message, 2)
    const best = matches[0]

    if (!best || best.score < THRESHOLD) {
      return res.json({ text: pickFallback(npc), unlock: [] })
    }

    const generated = await generateReply(npc, message, matches)
    const text = generated || best.text

    return res.json({ text, unlock: best.unlock, matchedScore: best.score })
  } catch (err) {
    console.error('[API] /api/chat loi:', err)
    res.status(500).json({ error: 'Loi server' })
  }
})

app.post('/api/interview-turn', async (req, res) => {
  try {
    const { npcId, message, options = {}, interviewState, caseFile } = req.body || {}
    if (!npcId || !message?.trim()) {
      return res.status(400).json({ error: 'Thieu npcId hoac message' })
    }

    const { npcs } = getPlainKnowledgeBase()
    const npc = npcs[npcId]
    if (!npc) return res.status(404).json({ error: `Khong tim thay NPC "${npcId}"` })

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

    return res.json({
      response,
      nextState: turn.nextState,
      nextCaseFile: turn.nextCaseFile,
      interviewSummary: summarizeInterview(turn.nextState, turn.nextCaseFile),
      usedLLM: Boolean(generated),
    })
  } catch (err) {
    console.error('[API] /api/interview-turn loi:', err)
    res.status(500).json({ error: 'Loi server' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[Server] Dang chay tai http://localhost:${PORT}`)
  if (process.env.WARMUP_KB === 'true') {
    getKnowledgeBase().catch((err) => {
      console.warn('[KB] Warm up that bai, server van chay va se thu lai khi co request:', err.message)
    })
  }
})
