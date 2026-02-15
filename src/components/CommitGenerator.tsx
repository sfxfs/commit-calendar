import { useState } from 'react'

interface Props {
  dates: string[]
  repo: string
  token: string
  onComplete: (count: number) => void
}

export default function CommitGenerator({ dates, repo: _repo, token: _token, onComplete }: Props) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setGenerating(true)
    setProgress({ current: 0, total: dates.length })
    setError(null)

    // Actual implementation would call the API here
    // For now, just simulate progress
    try {
      for (let i = 0; i < dates.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress({ current: i + 1, total: dates.length })
      }
      onComplete(dates.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  return { generating, progress, error, generate }
}
