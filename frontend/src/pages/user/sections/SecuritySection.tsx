import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/utils'
import { changePassword, deleteAccount, getLoginLogs } from '@/utils/auth'
import { ProfileSection } from '../sections/ProfileSection'
import { notifyAuthChange } from '@/context/UserSettingsContext'
import styles from '../UserCenterPage.module.scss'

export function SecuritySection() {
  const navigate = useNavigate()
  const logs = getLoginLogs()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的新密码不一致')
      return
    }
    const result = changePassword(oldPassword, newPassword)
    if (!result.ok) {
      setPwdError(result.message)
      return
    }
    setPwdSuccess('密码已更新（bcrypt 加密存储）')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDelete = (e: FormEvent) => {
    e.preventDefault()
    setDeleteError('')
    const result = deleteAccount(deletePassword)
    if (!result.ok) {
      setDeleteError(result.message)
      return
    }
    notifyAuthChange()
    navigate('/register', { replace: true })
  }

  return (
  
    <div className={styles.panel}>
       <ProfileSection />
      <h2 className={styles.panelTitle}>账号安全</h2>
      <p className={styles.panelDesc}>管理密码与查看最近登录记录</p>

      <form className={styles.card} onSubmit={handlePasswordSubmit}>
        <h3 className={styles.cardTitle}>修改密码</h3>
        {pwdError && <p className={styles.error}>{pwdError}</p>}
        {pwdSuccess && <p className={styles.success}>{pwdSuccess}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="old-pwd">
            原密码
          </label>
          <input
            id="old-pwd"
            type="password"
            className={styles.input}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="new-pwd">
            新密码
          </label>
          <input
            id="new-pwd"
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirm-pwd">
            确认新密码
          </label>
          <input
            id="confirm-pwd"
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className={styles.btnPrimary}>
          更新密码
        </button>
      </form>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>登录记录（最近 5 次）</h3>
        {logs.length === 0 ? (
          <p className={styles.empty}>暂无登录记录</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>登录时间</th>
                  <th>设备</th>
                  <th>IP 地址</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(new Date(log.loggedInAt))}</td>
                    <td>{log.device}</td>
                    <td>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={[styles.card, styles.dangerCard].join(' ')}>
        <h3 className={styles.cardTitle}>账号注销</h3>
        <p className={styles.panelDesc} style={{ marginBottom: '1rem' }}>
          注销后将删除您的所有对话、文档与个人信息，且不可恢复。
        </p>
        {!showDelete ? (
          <button type="button" className={styles.btnDanger} onClick={() => setShowDelete(true)}>
            注销账号
          </button>
        ) : (
          <form onSubmit={handleDelete}>
            {deleteError && <p className={styles.error}>{deleteError}</p>}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="delete-pwd">
                输入密码确认注销
              </label>
              <input
                id="delete-pwd"
                type="password"
                className={styles.input}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.btnRow}>
              <button type="submit" className={styles.btnDanger}>
                确认注销
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setShowDelete(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
              >
                取消
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
