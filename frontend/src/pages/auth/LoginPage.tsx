import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '@/utils/auth'
import { notifyAuthChange } from '@/context/UserSettingsContext'
import styles from './AuthPage.module.scss'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = login(email, password)
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
          <h1 className={styles.title}>欢迎回来</h1>
          <p className={styles.subtitle}>使用邮箱和密码登录</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              邮箱
            </label>
            <input
              id="login-email"
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
            <label className={styles.label} htmlFor="login-password">
              密码
            </label>
            <input
              id="login-password"
              type="password"
              className={styles.input}
              placeholder="请输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className={styles.footer}>
          还没有账号？
          <Link to="/register" className={styles.link}>
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
