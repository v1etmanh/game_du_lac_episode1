import { useState, useCallback } from 'react'
import {
  createInitialCaseFile,
  createInitialInterviewState,
  runInterviewTurn,
  summarizeInterview,
} from '../engine/investigationEngine.js'

let msgId = 100
const INTERVIEW_API_URL = import.meta.env.VITE_INTERVIEW_API_URL || '/api/interview-turn'

async function requestInterviewTurn(npcId, message, options, interviewState, caseFile, history) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 18000)
  let res

  try {
    res = await fetch(INTERVIEW_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        npcId,
        message,
        options,
        interviewState,
        caseFile,
        history,
      }),
    })
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!res.ok) {
    throw new Error(`Interview API returned ${res.status}`)
  }

  return res.json()
}

export function useConversation(npcData, unlockSections) {
  const [interviewState, setInterviewState] = useState(() => createInitialInterviewState(npcData))
  const [caseFile, setCaseFile] = useState(() => createInitialCaseFile(npcData))
  const [messages, setMessages] = useState([
    {
      id: msgId++,
      sender: 'npc',
      text: npcData.greeting,
      timestamp: Date.now(),
      meta: { tags: ['mo dau'] },
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(async (userText, options = {}) => {
    const trimmed = userText.trim()
    if (!trimmed || isTyping) return

    const localTurn = runInterviewTurn(npcData, interviewState, caseFile, trimmed, options)
    const userMsg = {
      id: msgId++,
      sender: 'player',
      text: trimmed,
      timestamp: Date.now(),
      meta: {
        questionType: localTurn.response.meta.questionType,
        score: localTurn.response.meta.score,
      },
    }

    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    const delay = 700 + Math.random() * 700
    await new Promise(resolve => setTimeout(resolve, delay))

    let turn = localTurn
    try {
      const serverTurn = await requestInterviewTurn(
        npcData.id,
        trimmed,
        options,
        interviewState,
        caseFile,
        messages.slice(-8).map(item => ({
          sender: item.sender,
          text: item.text,
          meta: item.meta,
        })),
      )

      if (serverTurn?.response && serverTurn?.nextState && serverTurn?.nextCaseFile) {
        turn = {
          response: serverTurn.response,
          nextState: serverTurn.nextState,
          nextCaseFile: serverTurn.nextCaseFile,
        }
      }
    } catch (err) {
      console.warn('[Interview] Server khong san sang, dung engine local:', err.message)
      turn = {
        ...localTurn,
        response: {
          ...localTurn.response,
          meta: {
            ...localTurn.response.meta,
            tags: [...(localTurn.response.meta?.tags || []), 'local-fallback'],
          },
        },
      }
    }

    const npcMsg = {
      id: msgId++,
      sender: 'npc',
      text: turn.response.text,
      timestamp: Date.now(),
      meta: turn.response.meta,
    }

    setMessages(prev => [...prev, npcMsg])
    setInterviewState(turn.nextState)
    setCaseFile(turn.nextCaseFile)
    setIsTyping(false)

    if (turn.response.unlock?.length > 0) {
      unlockSections(turn.response.unlock)
    }
  }, [npcData, unlockSections, isTyping, interviewState, caseFile, messages])

  return {
    messages,
    sendMessage,
    isTyping,
    interviewState,
    caseFile,
    interviewSummary: summarizeInterview(interviewState, caseFile),
  }
}
