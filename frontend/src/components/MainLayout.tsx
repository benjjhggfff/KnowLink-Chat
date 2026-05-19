import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSession, logout, getProfile } from '@/utils/auth'
import { notifyAuthChange } from '@/context/UserSettingsContext'
import styles from '../App.module.scss'

export function MainLayout() {
  const navigate = useNavigate()
  const session = getSession()
  const profile = getProfile()

  const handleLogout = () => {
    logout()
    notifyAuthChange()
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
          <NavLink
            to="/user"
            className={({ isActive }) =>
              [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(' ')
            }
          >
            用户中心
          </NavLink>
          <div className={styles.navAuth}>
            {session ? (
              <>
                <span className={styles.userEmail}>{profile?.username ?? session.email}</span>
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
