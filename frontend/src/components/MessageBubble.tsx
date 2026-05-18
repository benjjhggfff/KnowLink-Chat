import type { Message } from '@/types'
import { formatDate } from '@/utils'
import styles from './MessageBubble.module.scss'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={[styles.row, isUser && styles.rowUser].filter(Boolean).join(' ')}>
      <div
        className={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant].join(' ')}
        aria-hidden
      >
        {isUser ? '我' : 'AI'}
      </div>
      <div
        className={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant].join(' ')}
      >
        <p className={styles.content}>{message.content}</p>
        <p className={[styles.time, isUser ? styles.timeUser : styles.timeAssistant].join(' ')}>
          {formatDate(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
