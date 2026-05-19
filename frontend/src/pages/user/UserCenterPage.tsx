import { useState } from 'react'
import { ProfileSection } from './sections/ProfileSection'
import { SecuritySection } from './sections/SecuritySection'
import { ConversationsSection } from './sections/ConversationsSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { PreferencesSection } from './sections/PreferencesSection'
import { HelpSection } from './sections/HelpSection'
import styles from './UserCenterPage.module.scss'

type SectionId = 'profile' | 'security' | 'conversations' | 'documents' | 'preferences' | 'help'

const MENU: { id: SectionId; label: string }[] = [
  { id: 'profile', label: '个人资料' },
  { id: 'security', label: '账号安全' },
  { id: 'conversations', label: '我的对话' },
  { id: 'documents', label: '我的知识库' },
  { id: 'preferences', label: '个性化设置' },
  { id: 'help', label: '帮助中心' },
]

export function UserCenterPage() {
  const [section, setSection] = useState<SectionId>('profile')

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return <ProfileSection />
      case 'security':
        return <SecuritySection />
      case 'conversations':
        return <ConversationsSection />
      case 'documents':
        return <DocumentsSection />
      case 'preferences':
        return <PreferencesSection />
      case 'help':
        return <HelpSection />
      default:
        return null
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>用户中心</h1>
        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            className={[styles.menuBtn, section === item.id && styles.menuBtnActive]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </aside>
      <div className={styles.content}>{renderSection()}</div>
    </div>
  )
}
