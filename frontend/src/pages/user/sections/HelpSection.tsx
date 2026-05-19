import styles from '../UserCenterPage.module.scss'

const HELP_ITEMS = [
  {
    q: '如何上传文档？',
    a: '进入「用户中心 → 我的知识库」，点击「上传文档」选择 TXT 或 MD 文件。上传后可在知识库搜索页检索文档内容。',
  },
  {
    q: '如何关联知识库对话？',
    a: '在对话页发送问题时，系统会检索您已上传的文档片段作为上下文（接入后端 RAG 后生效）。请先在知识库中上传相关文档，再在对话中提问。',
  },
  {
    q: '如何导出全部对话？',
    a: '在「用户中心 → 我的对话」点击「导出全部对话」，将下载 JSON 文件，包含所有会话与消息记录。',
  },
  {
    q: '如何修改绑定邮箱？',
    a: '在「个人资料」点击「编辑资料」，修改邮箱后需向新邮箱获取验证码并填写，仅本人可操作。',
  },
  {
    q: '如何开启暗黑模式？',
    a: '在「个性化设置 → 对话设置」中打开「暗黑模式」开关，全站主题将立即切换。',
  },
]

export function HelpSection() {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>帮助中心</h2>
      <p className={styles.panelDesc}>常见问题与使用指引</p>
      <div className={styles.card}>
        {HELP_ITEMS.map((item) => (
          <article key={item.q} className={styles.helpItem}>
            <h3 className={styles.helpQ}>{item.q}</h3>
            <p className={styles.helpA}>{item.a}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
