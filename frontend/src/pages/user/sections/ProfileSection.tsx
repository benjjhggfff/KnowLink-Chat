import { useState, useEffect, type FormEvent } from 'react'
import { formatDate } from '@/utils'
import { getProfile, isValidEmail, sendVerificationCode, updateProfile } from '@/utils/auth'
import { notifyAuthChange } from '@/context/UserSettingsContext'
import styles from '../UserCenterPage.module.scss'

export function ProfileSection() {
  const profile = getProfile()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile?.username ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [code, setCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  if (!profile) return null

  const emailChanged = email.trim().toLowerCase() !== profile.email

  const handleSendCode = () => {
    setError('')
    if (!isValidEmail(email)) {
      setError('请输入有效的新邮箱')
      return
    }
    const generated = sendVerificationCode(email)
    setDemoCode(generated)
    setCountdown(60)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (emailChanged && !code.trim()) {
      setError('修改绑定邮箱需填写验证码')
      return
    }
    const result = updateProfile(username, email, code)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setSuccess('资料已更新')
    setEditing(false)
    setCode('')
    setDemoCode('')
    notifyAuthChange()
  }

  const cancelEdit = () => {
    setUsername(profile.username)
    setEmail(profile.email)
    setCode('')
    setDemoCode('')
    setError('')
    setEditing(false)
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>个人资料</h2>
      <p className={styles.panelDesc}>仅本人可查看和编辑个人资料</p>

      {!editing ? (
        <div className={styles.card}>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>用户名</span>
              <span className={styles.infoValue}>{profile.username}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>绑定邮箱</span>
              <span className={styles.infoValue}>{profile.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>注册时间</span>
              <span className={styles.infoValue}>{formatDate(new Date(profile.registeredAt))}</span>
            </div>
          </div>
          <div className={styles.btnRow} style={{ marginTop: '1rem' }}>
            <button type="button" className={styles.btnPrimary} onClick={() => setEditing(true)}>
              编辑资料
            </button>
          </div>
        </div>
      ) : (
        <form className={styles.card} onSubmit={handleSubmit}>
          <h3 className={styles.cardTitle}>编辑资料</h3>
          

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-username">
              用户名
            </label>
            <input
              id="profile-username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-email">
              绑定邮箱
            </label>
            <input
              id="profile-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {emailChanged && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-code">
                  新邮箱验证码
                </label>
                <div className={styles.codeRow}>
                  <input
                    id="profile-code"
                    className={styles.input}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6 位验证码"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className={styles.codeBtn}
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>
              {demoCode && (
                <p className={styles.demoHint}>
                  演示模式：验证码为 <strong>{demoCode}</strong>
                </p>
              )}
            </>
          )}

          <div className={styles.btnRow}>
            <button type="submit" className={styles.btnPrimary}>
              保存
            </button>
            <button type="button" className={styles.btnSecondary} onClick={cancelEdit}>
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
