import type { UserDocument } from '@/types/user'
import { generateId } from './index'
import { readJson, userScopedKey, writeJson } from './storage'
import { downloadText } from './chatStorage'

const PREFIX = 'ai_chat_docs'

export function getUserDocuments(email: string): UserDocument[] {
  const docs = readJson<UserDocument[]>(userScopedKey(PREFIX, email), [])
  return [...docs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
}

export function saveUserDocuments(email: string, docs: UserDocument[]) {
  writeJson(userScopedKey(PREFIX, email), docs)
}

export function clearUserDocuments(email: string) {
  localStorage.removeItem(userScopedKey(PREFIX, email))
}

export function parseUploadedFile(file: File): Promise<UserDocument | { error: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'txt' && ext !== 'md') {
    return Promise.resolve({ error: '仅支持 TXT、MD 格式' })
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result ?? '')
      resolve({
        id: generateId(),
        name: file.name,
        type: ext as 'txt' | 'md',
        content,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      })
    }
    reader.onerror = () => resolve({ error: '文件读取失败' })
    reader.readAsText(file)
  })
}

export function downloadDocument(doc: UserDocument) {
  const mime = doc.type === 'md' ? 'text/markdown' : 'text/plain'
  const blob = new Blob([doc.content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = doc.name
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadDocumentsBatch(docs: UserDocument[]) {
  docs.forEach((doc) => downloadText(doc.name, doc.content))
}
