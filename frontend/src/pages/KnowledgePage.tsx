import { useState } from 'react'
import { knowledgeApi } from '@/api'
import type { KnowledgeItem } from '@/types'
import styles from './KnowledgePage.module.scss'

export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const response = await knowledgeApi.search(query)
      setResults(response.data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>知识库搜索</h1>
          <p className={styles.subtitle}>在知识库中检索文档与片段，支持关键词匹配</p>
        </header>

        <div className={styles.searchCard}>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="输入关键词搜索知识库..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>正在检索...</p>
          </div>
        )}

        {!loading && (
          <div className={styles.results}>
            {results.map((item) => (
              <article key={item.id} className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultTitle}>{item.title}</h3>
                  <span className={styles.badge}>{item.source}</span>
                </div>
                <p className={styles.resultContent}>{item.content}</p>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreFill}
                      style={{ width: `${Math.min(100, item.score)}%` }}
                    />
                  </div>
                  <span className={styles.scoreLabel}>匹配度 {item.score}%</span>
                </div>
              </article>
            ))}

            {searched && results.length === 0 && (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>未找到相关结果</p>
                <p className={styles.emptyHint}>试试更换关键词或缩短搜索词</p>
              </div>
            )}

            {!searched && (
              <div className={styles.emptyStateMuted}>
                <p className={styles.emptyPlaceholder}>输入关键词后点击搜索</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
