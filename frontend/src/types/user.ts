export type MessageDensity = 'compact' | 'comfortable'
export type AiModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5' | 'deepseek-v3'

export interface UserProfile {
  email: string
  username: string
  registeredAt: string
}

export interface LoginRecord {
  id: string
  loggedInAt: string
  device: string
  ip: string
}

export interface UserDocument {
  id: string
  name: string
  type: 'txt' | 'md'
  content: string
  uploadedAt: string
  size: number
}

export interface UserSettings {
  defaultModel: AiModel
  messageDensity: MessageDensity
  darkMode: boolean
  notifyChatReply: boolean
  notifyDocUpload: boolean
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultModel: 'gpt-4o-mini',
  messageDensity: 'comfortable',
  darkMode: false,
  notifyChatReply: true,
  notifyDocUpload: true,
}

export const AI_MODEL_OPTIONS: { value: AiModel; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5', label: 'Claude 3.5' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
]
