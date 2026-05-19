export function parseDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS 设备'
  if (/android/.test(ua)) return 'Android 设备'
  if (/macintosh|mac os/.test(ua)) return 'macOS'
  if (/windows/.test(ua)) return 'Windows'
  if (/linux/.test(ua)) return 'Linux'
  return '未知设备'
}

export function mockClientIp(): string {
  const octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 200) + 10)
  return octets.join('.')
}
