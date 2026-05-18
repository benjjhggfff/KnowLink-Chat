export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
