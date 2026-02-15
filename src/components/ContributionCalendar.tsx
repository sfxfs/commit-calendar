import { useMemo } from 'react'
import { format, startOfWeek, eachDayOfInterval, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  contributions: Record<string, number>
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

const LEVEL_COLORS = [
  '#161b22', // 0 - no contribution
  '#0e4429', // 1 - low
  '#006d32', // 2 - medium
  '#26a641', // 3 - high
  '#39d353', // 4 - max
]

export default function ContributionCalendar({ contributions }: Props) {
  const weeks = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, 364)
    const adjustedStart = startOfWeek(startDate, { weekStartsOn: 0 })

    const days = eachDayOfInterval({
      start: adjustedStart,
      end: today,
    })

    const result: Date[][] = []
    let currentWeek: Date[] = []

    for (const day of days) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [])

  const months = useMemo(() => {
    const monthStarts: { date: Date; label: string }[] = []
    let currentMonth = -1

    for (let week = 0; week < weeks.length; week++) {
      const firstDayOfWeek = weeks[week][0]
      const month = firstDayOfWeek.getMonth()

      if (month !== currentMonth) {
        currentMonth = month
        monthStarts.push({
          date: firstDayOfWeek,
          label: format(firstDayOfWeek, 'MMM', { locale: zhCN }),
        })
      }
    }

    return monthStarts
  }, [weeks])

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

  const totalContributions = Object.values(contributions).reduce((a, b) => a + b, 0)
  const activeDays = Object.keys(contributions).filter((d) => contributions[d] > 0).length
  const maxContributions = Math.max(...Object.values(contributions), 1)

  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ color: '#8b949e', fontSize: '0.9em' }}>
          {totalContributions} contributions in the last year
        </span>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75em', color: '#8b949e' }}>Total</div>
          <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{totalContributions}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75em', color: '#8b949e' }}>Active Days</div>
          <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{activeDays}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75em', color: '#8b949e' }}>Best Day</div>
          <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{maxContributions}</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5em', marginBottom: '0.5em' }}>
          <div style={{ width: '2em' }}></div>
          {months.map((month, i) => (
            <div
              key={i}
              style={{
                fontSize: '0.75em',
                color: '#8b949e',
                width: `${weeks.filter((w) => w[0] >= month.date).length * 14}px`,
              }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5em' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {dayLabels.map((day, i) => (
              <div
                key={i}
                style={{
                  height: '12px',
                  fontSize: '0.65em',
                  color: '#8b949e',
                  display: i % 2 === 1 ? 'block' : 'none',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const count = contributions[dateStr] || 0
                  const level = getContributionLevel(count)

                  return (
                    <div
                      key={dateStr}
                      title={`${dateStr}: ${count} contributions`}
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: LEVEL_COLORS[level],
                        borderRadius: '2px',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75em', color: '#8b949e' }}>Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                borderRadius: '2px',
              }}
            />
          ))}
          <span style={{ fontSize: '0.75em', color: '#8b949e' }}>More</span>
        </div>
      </div>
    </div>
  )
}
