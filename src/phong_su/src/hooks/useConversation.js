import { useState, useCallback } from 'react'
import { getResponse } from '../utils/aiSimulator.js'

/**
 * Gọi backend RAG (embedding local + Gemini generation).
 * Nếu backend không phản hồi được (chưa bật server, mất mạng...),
 * ném lỗi để nơi gọi tự rơi về aiSimulator.js làm phương án dự phòng.
 */
async function fetchRagResponse(npcId, userText) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ npcId, message: userText })
  })
  if (!res.ok) throw new Error(`RAG API lỗi: ${res.status}`)
  const data = await res.json()
  return { text: data.text, unlock: data.unlock || [] }
}

let msgId = 100

/**
 * Manages conversation state for a given NPC.
 * @param {Object} npcData
 * @param {Function} unlockSections  - callback from useNotebook
 */
export function useConversation(npcData, unlockSections) {
  const [messages, setMessages] = useState([
    {
      id: msgId++,
      sender: 'npc',
      text: npcData.greeting,
      timestamp: Date.now()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(async (userText) => {
    const trimmed = userText.trim()
    if (!trimmed || isTyping) return

    const userMsg = {
      id: msgId++,
      sender: 'player',
      text: trimmed,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate NPC thinking
    const delay = 700 + Math.random() * 700
    await new Promise(resolve => setTimeout(resolve, delay))

    let response
    try {
      response = await fetchRagResponse(npcData.id, trimmed)
    } catch (err) {
      console.warn('[Chat] Backend RAG lỗi, dùng aiSimulator dự phòng:', err.message)
      response = getResponse(npcData, trimmed)
    }

    const npcMsg = {
      id: msgId++,
      sender: 'npc',
      text: response.text,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, npcMsg])
    setIsTyping(false)

    if (response.unlock?.length > 0) {
      unlockSections(response.unlock)
    }
  }, [npcData, unlockSections, isTyping])

  return { messages, sendMessage, isTyping }
}
