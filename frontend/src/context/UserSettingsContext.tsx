import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '@/types/user'
import { getSession } from '@/utils/auth'
import { getUserSettings, saveUserSettings } from '@/utils/settingsStorage'

interface UserSettingsContextValue {
  settings: UserSettings
  email: string | null
  updateSettings: (patch: Partial<UserSettings>) => void
  refresh: () => void
}

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => getSession()?.email ?? null)
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS)

  const load = useCallback(() => {
    const session = getSession()
    const userEmail = session?.email ?? null
    setEmail(userEmail)
    if (userEmail) {
      setSettings(getUserSettings(userEmail))
    } else {
      setSettings(DEFAULT_USER_SETTINGS)
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('storage', load)
    window.addEventListener('ai-chat-auth-change', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('ai-chat-auth-change', load)
    }
  }, [load])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
    document.documentElement.setAttribute('data-density', settings.messageDensity)
  }, [settings.darkMode, settings.messageDensity])

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      if (!email) return
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        saveUserSettings(email, next)
        return next
      })
    },
    [email]
  )

  const value = useMemo(
    () => ({ settings, email, updateSettings, refresh: load }),
    [settings, email, updateSettings, load]
  )

  return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>
}

export function useUserSettings() {
  const ctx = useContext(UserSettingsContext)
  if (!ctx) {
    throw new Error('useUserSettings must be used within UserSettingsProvider')
  }
  return ctx
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event('ai-chat-auth-change'))
}
