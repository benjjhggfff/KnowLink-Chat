import bcrypt from 'bcryptjs'
import type { LoginRecord, UserProfile } from '@/types/user'
import { mockClientIp, parseDevice } from './device'
import { clearChatSessions } from './chatStorage'
import { clearUserDocuments } from './documentStorage'
import { clearUserSettings } from './settingsStorage'
import { readJson, removeKey, userScopedKey, writeJson } from './storage'
import { generateId } from './index'

const USERS_KEY = 'ai_chat_users'
const SESSION_KEY = 'ai_chat_session'
const CODE_PREFIX = 'ai_chat_code_'
const LOGIN_LOG_PREFIX = 'ai_chat_login_logs'
const CODE_TTL_MS = 5 * 60 * 1000
const BCRYPT_ROUNDS = 10
const MAX_LOGIN_LOGS = 5

export interface StoredUser {
  email: string
  passwordHash: string
  username: string
  registeredAt: string
}

export interface AuthSession {
  email: string
  loggedInAt: string
}

function getUsers(): StoredUser[] {
  const raw = readJson<(StoredUser & { password?: string })[]>(USERS_KEY, [])
  return raw.map((u) => {
    if (!u.passwordHash && u.password) {
      return { email: u.email, username: u.username ?? u.email.split('@')[0], registeredAt: u.registeredAt ?? new Date().toISOString(), passwordHash: u.password }
    }
    if (!u.username) {
      return { ...u, username: u.email.split('@')[0] }
    }
    if (!u.registeredAt) {
      return { ...u, registeredAt: new Date().toISOString() }
    }
    return u
  })
}

function saveUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users)
}

function codeKey(email: string) {
  return `${CODE_PREFIX}${email.toLowerCase()}`
}

function loginLogKey(email: string) {
  return userScopedKey(LOGIN_LOG_PREFIX, email)
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): boolean {
  if (hash.startsWith('$2')) {
    return bcrypt.compareSync(password, hash)
  }
  return password === hash
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

function appendLoginLog(email: string) {
  const logs = getLoginLogs(email)
  const record: LoginRecord = {
    id: generateId(),
    loggedInAt: new Date().toISOString(),
    device: parseDevice(navigator.userAgent),
    ip: mockClientIp(),
  }
  const next = [record, ...logs].slice(0, MAX_LOGIN_LOGS)
  writeJson(loginLogKey(email), next)
}

function createSession(email: string) {
  const session: AuthSession = { email, loggedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  appendLoginLog(email)
}

export function register(
  email: string,
  code: string,
  password: string,
  username?: string
): { ok: true } | { ok: false; message: string } {
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

  const name = username?.trim() || normalized.split('@')[0]
  users.push({
    email: normalized,
    passwordHash: hashPassword(password),
    username: name,
    registeredAt: new Date().toISOString(),
  })
  saveUsers(users)
  sessionStorage.removeItem(codeKey(normalized))
  createSession(normalized)

  return { ok: true }
}

export function login(email: string, password: string): { ok: true } | { ok: false; message: string } {
  const normalized = email.trim().toLowerCase()

  if (!isValidEmail(normalized)) {
    return { ok: false, message: '请输入有效的邮箱地址' }
  }

  const user = getUsers().find((u) => u.email === normalized)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, message: '邮箱或密码错误' }
  }

  if (!user.passwordHash.startsWith('$2')) {
    user.passwordHash = hashPassword(password)
    saveUsers(getUsers().map((u) => (u.email === normalized ? user : u)))
  }

  createSession(normalized)
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

export function getCurrentUser(): StoredUser | null {
  const session = getSession()
  if (!session) return null
  return getUsers().find((u) => u.email === session.email) ?? null
}

export function getProfile(): UserProfile | null {
  const user = getCurrentUser()
  if (!user) return null
  return {
    email: user.email,
    username: user.username,
    registeredAt: user.registeredAt,
  }
}

export function updateProfile(
  username: string,
  newEmail: string,
  emailCode: string
): { ok: true } | { ok: false; message: string } {
  const session = getSession()
  if (!session) {
    return { ok: false, message: '请先登录' }
  }

  const trimmedName = username.trim()
  if (!trimmedName) {
    return { ok: false, message: '用户名不能为空' }
  }

  const normalizedNew = newEmail.trim().toLowerCase()
  if (!isValidEmail(normalizedNew)) {
    return { ok: false, message: '请输入有效的邮箱地址' }
  }

  const users = getUsers()
  const index = users.findIndex((u) => u.email === session.email)
  if (index < 0) {
    return { ok: false, message: '用户不存在' }
  }

  const current = users[index]

  if (normalizedNew !== current.email) {
    if (!verifyCode(normalizedNew, emailCode)) {
      return { ok: false, message: '新邮箱验证码错误或已过期' }
    }
    if (users.some((u) => u.email === normalizedNew && u.email !== current.email)) {
      return { ok: false, message: '该邮箱已被其他账号绑定' }
    }
  }

  const oldEmail = current.email
  current.username = trimmedName
  current.email = normalizedNew
  users[index] = current
  saveUsers(users)

  if (oldEmail !== normalizedNew) {
    migrateUserData(oldEmail, normalizedNew)
    sessionStorage.removeItem(codeKey(normalizedNew))
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: normalizedNew, loggedInAt: session.loggedInAt })
  )
  return { ok: true }
}

function migrateUserData(from: string, to: string) {
  const prefixes = ['ai_chat_sessions', 'ai_chat_docs', 'ai_chat_settings', 'ai_chat_login_logs']
  prefixes.forEach((prefix) => {
    const fromKey = userScopedKey(prefix, from)
    const toKey = userScopedKey(prefix, to)
    const data = localStorage.getItem(fromKey)
    if (data) {
      localStorage.setItem(toKey, data)
      localStorage.removeItem(fromKey)
    }
  })
  const session = getSession()
  if (session?.email === from) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, email: to }))
  }
}

export function changePassword(
  oldPassword: string,
  newPassword: string
): { ok: true } | { ok: false; message: string } {
  const user = getCurrentUser()
  if (!user) {
    return { ok: false, message: '请先登录' }
  }
  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return { ok: false, message: '原密码错误' }
  }
  if (newPassword.length < 6) {
    return { ok: false, message: '新密码至少 6 位' }
  }

  const users = getUsers()
  const index = users.findIndex((u) => u.email === user.email)
  users[index].passwordHash = hashPassword(newPassword)
  saveUsers(users)
  return { ok: true }
}

export function getLoginLogs(email?: string): LoginRecord[] {
  const target = email ?? getSession()?.email
  if (!target) return []
  return readJson<LoginRecord[]>(loginLogKey(target), [])
}

export function deleteAccount(password: string): { ok: true } | { ok: false; message: string } {
  const user = getCurrentUser()
  if (!user) {
    return { ok: false, message: '请先登录' }
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, message: '密码错误，无法注销账号' }
  }

  const email = user.email
  saveUsers(getUsers().filter((u) => u.email !== email))
  clearChatSessions(email)
  clearUserDocuments(email)
  clearUserSettings(email)
  removeKey(loginLogKey(email))
  logout()
  return { ok: true }
}

export function logout() {
  removeKey(SESSION_KEY)
}
