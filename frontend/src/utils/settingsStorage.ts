import { DEFAULT_USER_SETTINGS, type UserSettings } from '@/types/user'
import { readJson, userScopedKey, writeJson } from './storage'

const PREFIX = 'ai_chat_settings'

export function getUserSettings(email: string): UserSettings {
  return { ...DEFAULT_USER_SETTINGS, ...readJson(userScopedKey(PREFIX, email), DEFAULT_USER_SETTINGS) }
}

export function saveUserSettings(email: string, settings: UserSettings) {
  writeJson(userScopedKey(PREFIX, email), settings)
}

export function clearUserSettings(email: string) {
  localStorage.removeItem(userScopedKey(PREFIX, email))
}
