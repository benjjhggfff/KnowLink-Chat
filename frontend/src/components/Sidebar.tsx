import type { ChatSession } from '@/types'
import { formatDate } from '@/utils'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  sessions: ChatSession[]
  activeSession: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
}

export function Sidebar({ sessions, activeSession, onSelectSession, onNewSession }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI 对话平台</h1>
        <p className={styles.subtitle}>会话历史</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.newBtn} onClick={onNewSession}>
          + 新建对话
        </button>
      </div>
      <div className={styles.list}>
        {sessions.length === 0 ? (
          <p className={styles.empty}>暂无历史对话</p>
        ) : (
          sessions.map((session) => {
            const isActive = activeSession === session.id
            return (
              <button
                key={session.id}
                type="button"
                className={[styles.sessionBtn, isActive && styles.sessionBtnActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectSession(session.id)}
              >
                <h3
                  className={[styles.sessionTitle, isActive && styles.sessionTitleActive]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {session.title}
                </h3>
                <p className={styles.sessionDate}>{formatDate(session.createdAt)}</p>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
