import { useCallback, useEffect, useState } from 'react'
import type { ChatSession, Message } from '@/types'
import { getSession } from '@/utils/auth'
import { getChatSessions, saveChatSessions } from '@/utils/chatStorage'
import { generateId } from '@/utils'

export function useChatSessions() {
  const email = getSession()?.email ?? null
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)

  const persist = useCallback(
    (updater: (prev: ChatSession[]) => ChatSession[]) => {
      setSessions((prev) => {
        const next = updater(prev)
        if (email) saveChatSessions(email, next)
        return next
      })
      window.dispatchEvent(new Event('ai-chat-sessions-change'))
    },
    [email]
  )

  useEffect(() => {
    if (email) {
      const loaded = getChatSessions(email)
      setSessions(loaded)
      setActiveSession(loaded[0]?.id ?? null)
    } else {
      setSessions([])
      setActiveSession(null)
    }
  }, [email])

  useEffect(() => {
    const onChange = () => {
      if (email) setSessions(getChatSessions(email))
    }
    window.addEventListener('ai-chat-sessions-change', onChange)
    return () => window.removeEventListener('ai-chat-sessions-change', onChange)
  }, [email])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    persist((prev) => [newSession, ...prev])
    setActiveSession(newSession.id)
    return newSession.id
  }

  const updateSessionMessages = (sessionId: string, updater: (messages: Message[]) => Message[]) => {
    persist((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        return { ...s, messages: updater(s.messages), updatedAt: new Date() }
      })
    )
  }

  const updateSessionMeta = (sessionId: string, patch: Partial<ChatSession>) => {
    persist((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch, updatedAt: new Date() } : s))
    )
  }

  const deleteSessions = (ids: string[]) => {
    const idSet = new Set(ids)
    persist((prev) => {
      const next = prev.filter((s) => !idSet.has(s.id))
      if (activeSession && idSet.has(activeSession)) {
        setActiveSession(next[0]?.id ?? null)
      }
      return next
    })
  }

  const togglePin = (id: string) => {
    persist((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned, updatedAt: new Date() } : s))
    )
  }

  const getActiveSession = () => sessions.find((s) => s.id === activeSession)

  return {
    sessions,
    activeSession,
    setActiveSession,
    createNewSession,
    updateSessionMessages,
    updateSessionMeta,
    deleteSessions,
    togglePin,
    getActiveSession,
    email,
  }
}
