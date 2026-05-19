import { AI_MODEL_OPTIONS } from '@/types/user'
import { useUserSettings } from '@/context/UserSettingsContext'
import styles from '../UserCenterPage.module.scss'

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      className={styles.toggle}
      data-on={on}
      aria-label={label}
      aria-pressed={on}
      onClick={() => onChange(!on)}
    >
      <span className={styles.toggleKnob} />
    </button>
  )
}

export function PreferencesSection() {
  const { settings, updateSettings } = useUserSettings()

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>个性化设置</h2>
      <p className={styles.panelDesc}>对话偏好与通知开关，设置将同步至全局</p>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>对话设置</h3>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>默认对话模型</p>
            <p className={styles.settingHint}>新建对话时优先使用的 AI 模型</p>
          </div>
          <select
            className={styles.select}
            value={settings.defaultModel}
            onChange={(e) =>
              updateSettings({
                defaultModel: e.target.value as typeof settings.defaultModel,
              })
            }
          >
            {AI_MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>消息显示密度</p>
            <p className={styles.settingHint}>紧凑或宽松的消息气泡间距</p>
          </div>
          <select
            className={styles.select}
            value={settings.messageDensity}
            onChange={(e) =>
              updateSettings({
                messageDensity: e.target.value as 'compact' | 'comfortable',
              })
            }
          >
            <option value="comfortable">宽松</option>
            <option value="compact">紧凑</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>暗黑模式</p>
            <p className={styles.settingHint}>与全局主题联动，立即生效</p>
          </div>
          <Toggle
            label="暗黑模式"
            on={settings.darkMode}
            onChange={(darkMode) => updateSettings({ darkMode })}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>通知设置</h3>
        <p className={styles.settingHint} style={{ marginBottom: '0.75rem' }}>
          接入 Socket.io 后可推送实时通知，当前为偏好开关预留
        </p>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>对话回复通知</p>
            <p className={styles.settingHint}>AI 回复完成时提醒</p>
          </div>
          <Toggle
            label="对话回复通知"
            on={settings.notifyChatReply}
            onChange={(notifyChatReply) => updateSettings({ notifyChatReply })}
          />
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>文档上传完成通知</p>
            <p className={styles.settingHint}>知识库文档处理完成时提醒</p>
          </div>
          <Toggle
            label="文档上传完成通知"
            on={settings.notifyDocUpload}
            onChange={(notifyDocUpload) => updateSettings({ notifyDocUpload })}
          />
        </div>
      </div>
    </div>
  )
}
