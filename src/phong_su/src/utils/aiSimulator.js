/**
 * Fake AI simulator using keyword matching.
 * Normalizes Vietnamese text by stripping diacritics for fuzzy matching,
 * while also checking raw input for exact Vietnamese keyword matches.
 */

function normalizeVietnamese(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {Object} npcData - Loaded NPC JSON
 * @param {string} userInput - The player's typed question
 * @returns {{ text: string, unlock: string[] }}
 */
export function getResponse(npcData, userInput) {
  if (!userInput || userInput.trim().length === 0) {
    return {
      text: 'Cháu hỏi gì vậy? Ông chưa nghe rõ lắm...',
      unlock: []
    }
  }

  const rawInput = userInput.toLowerCase()
  const normInput = normalizeVietnamese(userInput)

  for (const [, response] of Object.entries(npcData.responses)) {
    for (const keyword of response.keywords) {
      const rawKeyword = keyword.toLowerCase()
      const normKeyword = normalizeVietnamese(keyword)

      if (rawInput.includes(rawKeyword) || normInput.includes(normKeyword)) {
        return {
          text: response.text,
          unlock: response.unlock || []
        }
      }
    }
  }

  // Random fallback
  const fallbacks = npcData.fallback
  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    unlock: []
  }
}
