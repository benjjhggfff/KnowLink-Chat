const USERS_KEY = 'ai_chat_users'
const SESSION_KEY = 'ai_chat_session'
const CODE_PREFIX = 'ai_chat_code_'
const CODE_TTL_MS = 5 * 60 * 1000

export interface StoredUser {
  email: string
  password: string
}

export interface AuthSession {
  email: string
  loggedInAt: string
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function codeKey(email: string) {
  return `${CODE_PREFIX}${email.toLowerCase()}`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function sendVerificationCode(email: string): string {
  const normalized = email.trim().toLowerCase()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  sessionStorage.setItem(
    codeKey(normalized),
    JSON.stringify({ code, expiresAt: Date.now() + CODE_TTL_MS })
  )
  return code
}

export function verifyCode(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase()
  const raw = sessionStorage.getItem(codeKey(normalized))
  if (!raw) return false

  try {
    const { code: stored, expiresAt } = JSON.parse(raw) as {
      code: string
      expiresAt: number
    }
    if (Date.now() > expiresAt) return false
    return stored === code.trim()
  } catch {
    return false
  }
}

export function register(email: string, code: string, password: string): { ok: true } | { ok: false; message: string } {
  const normalized = email.trim().toLowerCase()

  if (!isValidEmail(normalized)) {
    return { ok: false, message: '请输入有效的邮箱地址' }
  }
  if (password.length < 6) {
    return { ok: false, message: '密码至少 6 位' }
  }
  if (!verifyCode(normalized, code)) {
    return { ok: false, message: '验证码错误或已过期' }
  }

  const users = getUsers()
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, message: '该邮箱已注册' }
  }

  users.push({ email: normalized, password })
  saveUsers(users)
  sessionStorage.removeItem(codeKey(normalized))

  const session: AuthSession = { email: normalized, loggedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return { ok: true }
}

export function login(email: string, password: string): { ok: true } | { ok: false; message: string } {
  const normalized = email.trim().toLowerCase()

  if (!isValidEmail(normalized)) {
    return { ok: false, message: '请输入有效的邮箱地址' }
  }

  const user = getUsers().find((u) => u.email === normalized)
  if (!user || user.password !== password) {
    return { ok: false, message: '邮箱或密码错误' }
  }

  const session: AuthSession = { email: normalized, loggedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return { ok: true }
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
