import { forwardRef } from 'react'
import { SHIFT_MAP, WEEKDAY_SHORT, shiftHours } from '../constants'
import { buildWeeks, dayOfMonth, weekdayMon } from '../dateutils'
import { getDaySlots, isNationalHoliday } from '../scheduler'

const C = {
  surface: '#FCFAF4',
  bg: '#F2F6F3',
  line: '#D9E4E2',
  text: '#32414C',
  sub: '#7D8F97',
  error: '#C66A6A',
  errorBg: '#F8ECEB',
}

const ExportSheet = forwardRef(function ExportSheet({ data, month, monthKey, title, showLegend }, ref) {
  const weeks = buildWeeks(monthKey)
  const empById = Object.fromEntries(data.employees.map((e) => [e.id, e]))
  const restingFulltimers = (date) =>
    data.employees.filter((e) => e.role === 'fulltime' && (month.fulltimeRest?.[e.id] || []).includes(date))

  const cellWrap = {
    border: `1px solid ${C.line}`,
    background: '#fff',
    borderRadius: 8,
    padding: 5,
    minHeight: 96,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  }

  function ShiftLine({ date, slot }) {
    const cell = month.schedule?.[date]?.[slot.shiftKey]
    const emp = cell?.empId ? empById[cell.empId] : null
    const start = cell?.start ?? slot.start
    const end = cell?.end ?? slot.end
    const doubled = isNationalHoliday(month, date) && emp?.role === 'parttime'
    const label = SHIFT_MAP[slot.shiftKey].short
    if (!emp) {
      return (
        <div style={{ border: `1px dashed ${C.error}`, background: C.errorBg, color: C.error, borderRadius: 5, padding: '2px 5px', fontSize: 11 }}>
          {label}·未排
        </div>
      )
    }
    return (
      <div style={{ background: emp.color, color: C.text, borderRadius: 5, padding: '3px 5px', fontSize: 11, lineHeight: 1.25 }}>
        <div style={{ fontWeight: 700 }}>
          {label} {emp.emoji} {emp.name}
        </div>
        <div style={{ opacity: 0.85 }}>
          {start}–{end} ({shiftHours(start, end)}{doubled ? '×2' : ''})
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        width: 1240,
        background: C.surface,
        color: C.text,
        padding: 24,
        fontFamily: "'Outfit','Noto Sans TC',sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{title}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
        {WEEKDAY_SHORT.map((w, i) => (
          <div key={w} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: i >= 5 ? C.error : C.sub }}>
            星期{w}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {week.map((d, di) => {
              if (!d) return <div key={di} />
              const closed = month.closedDays.includes(d)
              const holiday = month.holidays.find((h) => h.date === d)
              const slots = getDaySlots(data, month, d)
              const weekend = weekdayMon(d) >= 5
              const resting = restingFulltimers(d)
              return (
                <div key={d} style={cellWrap}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: holiday || weekend ? C.error : C.text }}>{dayOfMonth(d)}</span>
                    {holiday && <span style={{ fontSize: 9, color: C.error, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{holiday.name}</span>}
                  </div>
                  {closed ? (
                    <div style={{ background: C.errorBg, color: C.error, borderRadius: 5, padding: '6px 5px', textAlign: 'center', fontSize: 11 }}>公休</div>
                  ) : (
                    <>
                      {slots.map((s) => (
                        <ShiftLine key={s.shiftKey} date={d} slot={s} />
                      ))}
                      {resting.map((e) => (
                        <div key={e.id} style={{ background: C.bg, color: C.sub, borderRadius: 5, padding: '1px 5px', fontSize: 10 }}>
                          {e.emoji} {e.name} 休
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
          {data.employees.map((e) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: e.color, display: 'inline-block' }} />
              {e.emoji} {e.name}
              <span style={{ color: C.sub, fontSize: 10 }}>{e.role === 'fulltime' ? '正' : '兼'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default ExportSheet
