import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageBubble } from '@/components/MessageBubble'
import { ChatInput } from '@/components/ChatInput'
import type { ChatSession, Message } from '@/types'
import { generateId } from '@/utils'
import { chatApi } from '@/api'
import styles from './ChatPage.module.scss'

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getActiveSession = () => {
    return sessions.find((s) => s.id === activeSession)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [getActiveSession()?.messages])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
    }
    setSessions([newSession, ...sessions])
    setActiveSession(newSession.id)
  }

  const handleSendMessage = async (content: string) => {
    if (!activeSession) {
      createNewSession()
      return
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession
          ? { ...s, messages: [...s.messages, userMessage], title: content.slice(0, 20) }
          : s
      )
    )

    try {
      const response = await chatApi.sendMessage(content)
      const assistantMessage: Message = {
        id: generateId(),
        content: response.data || '收到消息',
        role: 'assistant',
        timestamp: new Date(),
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession ? { ...s, messages: [...s.messages, assistantMessage] } : s
        )
      )
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        content: '服务器错误，请稍后重试',
        role: 'assistant',
        timestamp: new Date(),
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession ? { ...s, messages: [...s.messages, errorMessage] } : s
        )
      )
    }
  }

  const activeMessages = getActiveSession()?.messages || []

  return (
    <div className={styles.layout}>
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={setActiveSession}
        onNewSession={createNewSession}
      />
      <div className={styles.main}>
        {activeSession ? (
          <>
            <header className={styles.header}>
              <h2 className={styles.headerTitle}>{getActiveSession()?.title || '对话'}</h2>
            </header>
            <div className={styles.messages}>
              <div className={styles.messagesInner}>
                {activeMessages.length === 0 ? (
                  <div className={styles.emptyChat}>
                    <div className={styles.emptyChatIcon}>💬</div>
                    <p className={styles.emptyChatTitle}>发送第一条消息开始对话</p>
                    <p className={styles.emptyChatHint}>Enter 发送，Shift + Enter 换行</p>
                  </div>
                ) : (
                  activeMessages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <ChatInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className={styles.welcome}>
            <div className={styles.welcomeInner}>
              <div className={styles.welcomeIcon}>✨</div>
              <h2 className={styles.welcomeTitle}>开始新对话</h2>
              <p className={styles.welcomeText}>
                点击左侧「新建对话」创建会话，或直接在下方输入消息
              </p>
              <button type="button" className={styles.welcomeBtn} onClick={createNewSession}>
                新建对话
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
