import { useState, useEffect } from 'react'
import { format, addDays, eachDayOfInterval, parseISO } from 'date-fns'
import { useAuth } from '../auth/AuthContext'
import { fetchUserRepositories, Repository, createCommit, getCurrentUser } from '../api/github'

const PRESET_PATTERNS: Record<string, number[][]> = {
  heart: [
    [0, 0, 1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  '1': [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
  ],
  '0': [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
  ],
  smiley: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  star: [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
  ],
}

export default function PatternDesigner() {
  const { token } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [selectedPattern, setSelectedPattern] = useState<string>('heart')
  const [customPattern, setCustomPattern] = useState<number[][]>(
    Array(8).fill(null).map(() => Array(8).fill(0))
  )
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (token) {
      fetchUserRepositories(token)
        .then(setRepositories)
        .catch(console.error)
    }
  }, [token])

  const pattern = selectedPattern === 'custom' ? customPattern : PRESET_PATTERNS[selectedPattern]

  const calculateCommitDates = () => {
    const dates: string[] = []
    const start = parseISO(startDate)
    const days = eachDayOfInterval({ start, end: addDays(start, 364) })

    // Map pattern to dates (start from top-left of pattern)
    const patternRows = pattern.length
    const patternCols = pattern[0].length

    for (let row = 0; row < patternRows; row++) {
      for (let col = 0; col < patternCols; col++) {
        if (pattern[row][col] === 1) {
          const dayIndex = col * patternRows + row

          if (dayIndex < days.length) {
            dates.push(format(days[dayIndex], 'yyyy-MM-dd'))
          }
        }
      }
    }

    return [...new Set(dates)].sort()
  }

  const commitDates = calculateCommitDates()

  const handlePatternCellToggle = (row: number, col: number) => {
    const newPattern = customPattern.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? (cell ? 0 : 1) : cell))
    )
    setCustomPattern(newPattern)
  }

  const handleGenerate = async () => {
    if (!token || !selectedRepo) {
      setMessage({ type: 'error', text: '请选择仓库' })
      return
    }

    const [, repo] = selectedRepo.split('/')
    setGenerating(true)
    setProgress({ current: 0, total: commitDates.length })
    setMessage(null)

    try {
      const username = await getCurrentUser(token)

      for (let i = 0; i < commitDates.length; i++) {
        const date = commitDates[i]
        await createCommit(
          token,
          username,
          repo,
          `Contributions: ${date}`,
          date,
          'main'
        )
        setProgress({ current: i + 1, total: commitDates.length })

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setMessage({ type: 'success', text: `成功创建 ${commitDates.length} 个 commits!` })
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: '创建 commits 失败，请检查仓库权限和分支名称' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <h2>生成贡献图案</h2>

      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card">
            <h3>1. 选择仓库</h3>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <option value="">选择仓库...</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name} {repo.private ? '(私有)' : ''}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.85em', color: '#8b949e' }}>
              需要有写权限的仓库，建议使用测试仓库
            </p>
          </div>

          <div className="card">
            <h3>2. 选择图案</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {Object.keys(PRESET_PATTERNS).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedPattern(name)}
                  style={{
                    backgroundColor: selectedPattern === name ? '#388bfd' : '#1f6feb',
                    opacity: selectedPattern === name ? 1 : 0.7,
                  }}
                >
                  {name}
                </button>
              ))}
              <button
                onClick={() => setSelectedPattern('custom')}
                style={{
                  backgroundColor: selectedPattern === 'custom' ? '#388bfd' : '#1f6feb',
                  opacity: selectedPattern === 'custom' ? 1 : 0.7,
                }}
              >
                自定义
              </button>
            </div>

            {selectedPattern === 'custom' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 30px)',
                  gap: '2px',
                }}
              >
                {customPattern.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handlePatternCellToggle(rowIndex, colIndex)}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: cell ? '#39d353' : '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h3>3. 设置开始日期</h3>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.85em', color: '#8b949e', marginTop: '0.5rem' }}>
              图案将从这个日期开始，最多展示 365 天
            </p>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>预览</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '2px',
                marginBottom: '1rem',
              }}
            >
              {pattern.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      aspectRatio: '1',
                      backgroundColor: cell ? '#39d353' : '#161b22',
                      borderRadius: '2px',
                    }}
                  />
                ))
              )}
            </div>
            <p style={{ fontSize: '0.9em', color: '#8b949e' }}>
              将创建 <strong>{commitDates.length}</strong> 个 commits
            </p>
          </div>

          <div className="card">
            <h3>生成 commits</h3>
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedRepo || commitDates.length === 0}
              style={{ width: '100%', padding: '1rem' }}
            >
              {generating ? `生成中... ${progress.current}/${progress.total}` : '开始生成'}
            </button>
            <p style={{ fontSize: '0.85em', color: '#8b949e', marginTop: '0.5rem' }}>
              警告: 批量创建 commits 可能会触发 GitHub 速率限制
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
