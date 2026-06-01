import { useApp } from '../context/AppContext'
import { Avatar, Modal } from './Avatar'
import TimeField from './TimeField'
import { ROLE_LABEL, SHIFT_MAP, shiftHours } from '../constants'

export default function CellEditor({ open, date, shiftKey, defaultStart, defaultEnd, onClose }) {
  const { data, monthKey, currentMonth, setMonth } = useApp()
  if (!date || !shiftKey) return null
  const month = currentMonth
  const shift = SHIFT_MAP[shiftKey]
  const cell = month.schedule?.[date]?.[shiftKey]
  const start = cell?.start ?? defaultStart
  const end = cell?.end ?? defaultEnd

  const candidates = (data.priorities[shiftKey] || []).map((id) => data.employees.find((e) => e.id === id)).filter(Boolean)
  const assignedTodayElsewhere = new Set(
    Object.entries(month.schedule?.[date] || {})
      .filter(([k, c]) => k !== shiftKey && c.empId)
      .map(([, c]) => c.empId),
  )
  const isUnavailable = (id) => {
    const u = month.unavailable?.[id]?.[date]
    return u === 'all' || (Array.isArray(u) && u.includes(shiftKey))
  }
  const isResting = (id) => (month.fulltimeRest?.[id] || []).includes(date)

  function writeCell(patch, manual = true) {
    setMonth(monthKey, (m) => {
      const sched = { ...m.schedule }
      const day = { ...(sched[date] || {}) }
      const cur = day[shiftKey] || { empId: null, start: defaultStart, end: defaultEnd }
      day[shiftKey] = { ...cur, ...patch, manual }
      delete day[shiftKey].conflict
      sched[date] = day
      return { ...m, schedule: sched }
    })
  }

  function toggleRest(empId) {
    setMonth(monthKey, (m) => {
      const fr = { ...m.fulltimeRest }
      const list = fr[empId] || []
      fr[empId] = list.includes(date) ? list.filter((x) => x !== date) : [...list, date]
      return { ...m, fulltimeRest: fr }
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={`${date.slice(5)} · ${shift.label}`}>
      <div className="space-y-5">
        {/* time */}
        <div>
          <div className="label">時間（{shiftHours(start, end)} 小時）</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(data.shiftPresets[shiftKey] || []).map((p, i) => (
              <button
                key={i}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  p.start === start && p.end === end ? 'border-primary bg-primary text-primary-txt' : 'border-line bg-surface hover:bg-bg'
                }`}
                onClick={() => writeCell({ start: p.start, end: p.end })}
              >
                {p.start}–{p.end}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <TimeField className="input w-24 px-2 py-1" value={start} onChange={(v) => writeCell({ start: v })} />
            <span className="text-sub">–</span>
            <TimeField className="input w-24 px-2 py-1" value={end} onChange={(v) => writeCell({ end: v })} />
          </div>
        </div>

        {/* assign */}
        <div>
          <div className="label">指派員工</div>
          <div className="grid grid-cols-2 gap-1.5">
            {candidates.map((e) => {
              const selected = cell?.empId === e.id
              const busy = assignedTodayElsewhere.has(e.id)
              const un = isUnavailable(e.id)
              const rest = e.role === 'fulltime' && isResting(e.id)
              return (
                <button
                  key={e.id}
                  onClick={() => writeCell({ empId: e.id })}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-sm transition ${
                    selected ? 'border-primary bg-primary-txt ring-2 ring-primary' : 'border-line bg-surface hover:bg-bg'
                  }`}
                >
                  <Avatar emoji={e.emoji} color={e.color} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-main">{e.name}</span>
                    {(busy || un || rest) && (
                      <span className="block text-[10px] text-warning">
                        {un ? '當天不可上 ' : ''}{busy ? '已排他班 ' : ''}{rest ? '休假中' : ''}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => writeCell({ empId: null })}>留空</button>
            {cell?.manual && (
              <button className="btn-ghost flex-1" onClick={() => writeCell({}, false)}>交還自動排班</button>
            )}
          </div>
          {cell?.manual && <p className="mt-1 text-[11px] text-sub">此格為手動鎖定，重新自動排班時不會被覆蓋。</p>}
        </div>

        {/* full-timer rest (day shifts only) */}
        {shift.isDayShift && data.employees.some((e) => e.role === 'fulltime') && (
          <div>
            <div className="label">正職本日休假</div>
            <div className="flex flex-wrap gap-1.5">
              {data.employees
                .filter((e) => e.role === 'fulltime')
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => toggleRest(e.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm ${
                      isResting(e.id) ? 'border-success bg-success-bg text-success' : 'border-line bg-surface'
                    }`}
                  >
                    <Avatar emoji={e.emoji} color={e.color} size={20} />
                    {e.name} {isResting(e.id) ? '休假中' : '上班'}
                  </button>
                ))}
            </div>
            <p className="mt-1 text-[11px] text-sub">設為休假後，記得重新自動排班讓白天班改由他人遞補。</p>
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn-primary" onClick={onClose}>完成</button>
        </div>
      </div>
    </Modal>
  )
}
