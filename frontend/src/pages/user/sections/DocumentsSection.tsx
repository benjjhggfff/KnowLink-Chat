import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils'
import { getSession } from '@/utils/auth'
import type { UserDocument } from '@/types/user'
import {
  downloadDocument,
  downloadDocumentsBatch,
  getUserDocuments,
  parseUploadedFile,
  saveUserDocuments,
} from '@/utils/documentStorage'
import styles from '../UserCenterPage.module.scss'

export function DocumentsSection() {
  const email = getSession()?.email
  const fileRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<UserDocument[]>(() => (email ? getUserDocuments(email) : []))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<UserDocument | null>(null)
  const [error, setError] = useState('')

  const persist = (next: UserDocument[]) => {
    if (!email) return
    saveUserDocuments(email, next)
    setDocs(next)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!email || !files?.length) return
    setError('')
    const next = [...docs]
    for (const file of Array.from(files)) {
      const result = await parseUploadedFile(file)
      if ('error' in result) {
        setError(result.error)
        continue
      }
      next.unshift(result)
    }
    persist(next)
    if (fileRef.current) fileRef.current.value = ''
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === docs.length) setSelected(new Set())
    else setSelected(new Set(docs.map((d) => d.id)))
  }

  const handleDelete = () => {
    if (selected.size === 0) return
    if (!window.confirm(`确定删除选中的 ${selected.size} 个文档？`)) return
    const idSet = new Set(selected)
    persist(docs.filter((d) => !idSet.has(d.id)))
    setSelected(new Set())
  }

  const handleBatchDownload = () => {
    const list = docs.filter((d) => selected.has(d.id))
    if (list.length === 0) return
    downloadDocumentsBatch(list)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>我的知识库</h2>
      <p className={styles.panelDesc}>
        管理已上传的 TXT / MD 文档，与
        <Link to="/knowledge" style={{ margin: '0 0.25rem', color: 'inherit', fontWeight: 600 }}>
          知识库搜索
        </Link>
        联动使用
      </p>

      <div className={styles.toolbar}>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          multiple
          hidden
          onChange={(e) => handleUpload(e.target.files)}
        />
        <button type="button" className={styles.btnPrimary} onClick={() => fileRef.current?.click()}>
          上传文档
        </button>
        <button
          type="button"
          className={styles.btnDanger}
          disabled={selected.size === 0}
          onClick={handleDelete}
        >
          批量删除
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          disabled={selected.size === 0}
          onClick={handleBatchDownload}
        >
          批量下载
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {docs.length === 0 ? (
        <p className={styles.empty}>暂无文档，点击上传 TXT 或 MD 文件</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.size === docs.length && docs.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>文件名</th>
                <th>类型</th>
                <th>大小</th>
                <th>上传时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selected.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                    />
                  </td>
                  <td>{doc.name}</td>
                  <td>{doc.type.toUpperCase()}</td>
                  <td>{formatSize(doc.size)}</td>
                  <td>{formatDate(new Date(doc.uploadedAt))}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => setDetail(doc)}
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => downloadDocument(doc)}
                    >
                      下载
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{detail.name}</h3>
            <p className={styles.panelDesc}>
              {detail.type.toUpperCase()} · {formatSize(detail.size)} ·{' '}
              {formatDate(new Date(detail.uploadedAt))}
            </p>
            <div className={styles.modalBody}>{detail.content}</div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setDetail(null)}>
                关闭
              </button>
              <button type="button" className={styles.btnPrimary} onClick={() => downloadDocument(detail)}>
                下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
