import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSession, logout } from '@/utils/auth'
import styles from '../App.module.scss'

export function MainLayout() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.brand}>AI Chat</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(' ')
            }
          >
            对话
          </NavLink>
          <NavLink
            to="/knowledge"
            className={({ isActive }) =>
              [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(' ')
            }
          >
            知识库
          </NavLink>
          <div className={styles.navAuth}>
            {session ? (
              <>
                <span className={styles.userEmail}>{session.email}</span>
                <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(' ')
                }
              >
                登录
              </NavLink>
            )}
          </div>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
