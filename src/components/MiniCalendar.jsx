import { WEEKDAY_SHORT } from '../constants'
import { buildWeeks, dayOfMonth, isWeekend } from '../dateutils'

// renderCell(dateStr) -> { content?, className?, badge? }
export default function MiniCalendar({ monthKey, onPick, renderCell }) {
  const weeks = buildWeeks(monthKey)
  return (
    <div className="select-none">
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_SHORT.map((w, i) => (
          <div key={w} className={`text-center text-[11px] font-medium ${i >= 5 ? 'text-error' : 'text-sub'}`}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} />
          const r = renderCell?.(d) || {}
          return (
            <button
              key={d}
              onClick={() => onPick?.(d)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition ${
                r.className || 'border-line bg-surface hover:bg-bg'
              } ${isWeekend(d) && !r.className ? 'text-error' : ''}`}
            >
              <span className="leading-none">{dayOfMonth(d)}</span>
              {r.content}
              {r.badge && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: r.badge }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
