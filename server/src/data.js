import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../src/phong_su/src/data')

/**
 * Load all npc_*.json files from src/data and flatten each into
 * retrieval "chunks": one chunk per predefined response.
 *
 * Returns: {
 *   npcs: { [npcId]: fullNpcJson },
 *   chunks: [{ npcId, key, keywords, text, unlock }]
 * }
 */
export function loadKnowledgeBase() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('npc_') && f.endsWith('.json'))

  const npcs = {}
  const chunks = []

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')
    const npc = JSON.parse(raw)
    npcs[npc.id] = npc

    for (const [key, response] of Object.entries(npc.responses)) {
      chunks.push({
        npcId: npc.id,
        key,
        keywords: response.keywords || [],
        text: response.text,
        unlock: response.unlock || []
      })
    }
  }

  return { npcs, chunks }
}
