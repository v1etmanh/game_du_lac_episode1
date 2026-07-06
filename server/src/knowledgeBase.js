import { loadKnowledgeBase } from './data.js'
import { embed, cosineSimilarity } from './embeddings.js'

let ready = null

/**
 * Tính embedding cho toàn bộ chunks 1 lần khi server khởi động,
 * giữ trong bộ nhớ (dataset rất nhỏ, ~25-30 đoạn -> vài giây là xong).
 */
async function build() {
  const { npcs, chunks } = loadKnowledgeBase()

  for (const chunk of chunks) {
    // Nhúng cả keywords lẫn text để bắt được câu hỏi ngắn/gần nghĩa
    const doc = `${chunk.keywords.join(', ')}. ${chunk.text}`
    chunk.vector = await embed(doc, { isQuery: false })
  }

  console.log(`[KB] Đã embed xong ${chunks.length} đoạn tri thức cho ${Object.keys(npcs).length} NPC.`)
  return { npcs, chunks }
}

export function getKnowledgeBase() {
  if (!ready) ready = build()
  return ready
}

/**
 * Tìm top-k đoạn liên quan nhất tới câu hỏi, trong phạm vi 1 NPC.
 */
export async function search(npcId, query, topK = 2) {
  const { chunks } = await getKnowledgeBase()
  const qVector = await embed(query, { isQuery: true })

  const scored = chunks
    .filter(c => c.npcId === npcId)
    .map(c => ({ ...c, score: cosineSimilarity(qVector, c.vector) }))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, topK)
}
