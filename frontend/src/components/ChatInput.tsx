import { useState, type KeyboardEvent } from 'react'
import styles from './ChatInput.module.scss'

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.composer}>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.footer}>
            <span className={styles.hint}>AI 可能会出错，请核实重要信息</span>
            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSubmit}
              disabled={!message.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
