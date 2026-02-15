import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import ContributionCalendar from './ContributionCalendar'
import { fetchContributions } from '../api/github'

export default function Dashboard() {
  const { token } = useAuth()
  const [contributions, setContributions] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      setLoading(true)
      fetchContributions(token)
        .then(setContributions)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [token])

  if (loading) {
    return <div className="loading">加载贡献数据中...</div>
  }

  if (error) {
    return <div className="error">错误: {error}</div>
  }

  return (
    <div>
      <h2>贡献日历</h2>
      <ContributionCalendar contributions={contributions} />
      <div style={{ marginTop: '2rem' }}>
        <h3>统计信息</h3>
        <div className="card">
          <p>总贡献天数: {Object.keys(contributions).length}</p>
          <p>总贡献次数: {Object.values(contributions).reduce((a, b) => a + b, 0)}</p>
        </div>
      </div>
    </div>
  )
}
