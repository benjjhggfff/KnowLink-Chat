export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  pinned?: boolean
  updatedAt?: Date
}

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  source: string
  score: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export * from './user'
