import type { ChatSession, Message } from '@/types'
import { readJson, userScopedKey, writeJson } from './storage'

const PREFIX = 'ai_chat_sessions'

interface StoredMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

interface StoredSession {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: string
  updatedAt?: string
  pinned?: boolean
}

function toStored(session: ChatSession): StoredSession {
  return {
    id: session.id,
    title: session.title,
    pinned: session.pinned,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt?.toISOString(),
    messages: session.messages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      timestamp: m.timestamp.toISOString(),
    })),
  }
}

function fromStored(s: StoredSession): ChatSession {
  return {
    id: s.id,
    title: s.title,
    pinned: s.pinned,
    createdAt: new Date(s.createdAt),
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    messages: s.messages.map(
      (m): Message => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: new Date(m.timestamp),
      })
    ),
  }
}

function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.updatedAt ?? a.createdAt
    const bTime = b.updatedAt ?? b.createdAt
    return bTime.getTime() - aTime.getTime()
  })
}

export function getChatSessions(email: string): ChatSession[] {
  const raw = readJson<StoredSession[]>(userScopedKey(PREFIX, email), [])
  return sortSessions(raw.map(fromStored))
}

export function saveChatSessions(email: string, sessions: ChatSession[]) {
  writeJson(userScopedKey(PREFIX, email), sortSessions(sessions).map(toStored))
}

export function clearChatSessions(email: string) {
  localStorage.removeItem(userScopedKey(PREFIX, email))
}

export function exportSessionsAsJson(sessions: ChatSession[]): string {
  return JSON.stringify(
    sessions.map((s) => ({
      id: s.id,
      title: s.title,
      pinned: s.pinned,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
      messages: s.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    })),
    null,
    2
  )
}

export function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
