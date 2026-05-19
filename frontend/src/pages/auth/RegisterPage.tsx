import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isValidEmail, register, sendVerificationCode } from '@/utils/auth'
import { notifyAuthChange } from '@/context/UserSettingsContext'
import styles from './AuthPage.module.scss'

const COUNTDOWN_SECONDS = 60

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoCode, setDemoCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const handleSendCode = () => {
    setError('')
    setDemoCode('')

    if (!isValidEmail(email)) {
      setError('请先输入有效的邮箱地址')
      return
    }

    const generated = sendVerificationCode(email)
    setDemoCode(generated)
    setCountdown(COUNTDOWN_SECONDS)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    const result = register(email, code, password)
    setLoading(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    notifyAuthChange()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}>✨</div>
          <h1 className={styles.title}>创建账号</h1>
          <p className={styles.subtitle}>邮箱验证码注册并设置密码</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              邮箱
            </label>
            <input
              id="register-email"
              type="email"
              className={styles.input}
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-code">
              验证码
            </label>
            <div className={styles.codeRow}>
              <input
                id="register-code"
                type="text"
                className={styles.codeInput}
                placeholder="6 位验证码"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <button
                type="button"
                className={styles.codeBtn}
                onClick={handleSendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
          </div>

          {demoCode && (
            <p className={styles.demoHint}>
              演示模式：验证码为 <strong>{demoCode}</strong>（5 分钟内有效，接入后端后将发送至邮箱）
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password">
              密码
            </label>
            <input
              id="register-password"
              type="password"
              className={styles.input}
              placeholder="至少 6 位"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-confirm">
              确认密码
            </label>
            <input
              id="register-confirm"
              type="password"
              className={styles.input}
              placeholder="再次输入密码"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className={styles.footer}>
          已有账号？
          <Link to="/login" className={styles.link}>
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
