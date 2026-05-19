import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils'
import { getSession } from '@/utils/auth'
import {
  downloadJson,
  exportSessionsAsJson,
  getChatSessions,
  saveChatSessions,
} from '@/utils/chatStorage'
import styles from '../UserCenterPage.module.scss'

export function ConversationsSection() {
  const email = getSession()?.email
  const [sessions, setSessions] = useState(() => (email ? getChatSessions(email) : []))
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const refresh = () => {
    if (email) setSessions(getChatSessions(email))
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === sessions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sessions.map((s) => s.id)))
    }
  }

  const handleDelete = () => {
    if (!email || selected.size === 0) return
    if (!window.confirm(`确定删除选中的 ${selected.size} 条对话？`)) return
    const next = sessions.filter((s) => !selected.has(s.id))
    saveChatSessions(email, next)
    setSelected(new Set())
    refresh()
    window.dispatchEvent(new Event('ai-chat-sessions-change'))
  }

  const handlePin = (id: string) => {
    if (!email) return
    const next = sessions.map((s) =>
      s.id === id ? { ...s, pinned: !s.pinned, updatedAt: new Date() } : s
    )
    saveChatSessions(email, next)
    refresh()
    window.dispatchEvent(new Event('ai-chat-sessions-change'))
  }

  const handleExportAll = () => {
    downloadJson(`conversations-${Date.now()}.json`, exportSessionsAsJson(sessions))
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>我的对话</h2>
      <p className={styles.panelDesc}>
        管理全部 AI 对话历史，与
        <Link to="/" style={{ margin: '0 0.25rem', color: 'inherit', fontWeight: 600 }}>
          对话页
        </Link>
        数据同步
      </p>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.btnDanger}
          disabled={selected.size === 0}
          onClick={handleDelete}
        >
          批量删除
        </button>
        <button type="button" className={styles.btnSecondary} onClick={handleExportAll}>
          导出全部对话
        </button>
        <Link to="/" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
          前往对话
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className={styles.empty}>暂无对话记录，去对话页开始聊天吧</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.size === sessions.length && sessions.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>标题</th>
                <th>消息数</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selected.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                  </td>
                  <td>
                    {s.title}
                    {s.pinned && <span className={styles.pinBadge}>置顶</span>}
                  </td>
                  <td>{s.messages.length}</td>
                  <td>{formatDate(s.updatedAt ?? s.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => handlePin(s.id)}
                    >
                      {s.pinned ? '取消置顶' : '置顶'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
