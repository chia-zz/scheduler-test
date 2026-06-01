import { SHIFT_MAP, SHIFT_TYPES, shiftHours } from './constants'
import { isWeekend, listDates } from './dateutils'

export const WEEKDAY_SLOT_KEYS = ['weekday_day', 'weekday_evening']
export const HOLIDAY_SLOT_KEYS = ['holiday_day', 'holiday_mid', 'holiday_evening']

export const monthDefaults = () => ({
  holidaysConfirmed: false,
  holidays: [], // [{date, name}] 已採用的國定假日(×2)
  closedDays: [], // ['YYYY-MM-DD'] 全天公休
  businessHours: {}, // { date: { shiftKey: {enabled?:bool, start?, end?} } }
  unavailable: {}, // { empId: { date: 'all' | [shiftKey...] } }
  fulltimeRest: {}, // { empId: ['YYYY-MM-DD'...] }
  fulltimeRestTarget: {}, // { empId: number } 預設 8
  schedule: {}, // { date: { shiftKey: {empId, start, end, manual} } }
  balanceMode: true,
})

export function getMonth(data, key) {
  return { ...monthDefaults(), ...(data.months?.[key] || {}) }
}

export function presetTime(data, shiftKey) {
  const p = data.shiftPresets?.[shiftKey]?.[0]
  if (p) return { start: p.start, end: p.end }
  const s = SHIFT_MAP[shiftKey]
  return { start: s.defaultStart, end: s.defaultEnd }
}

export function isNationalHoliday(month, dateStr) {
  return month.holidays.some((h) => h.date === dateStr)
}

export function getDayType(month, dateStr) {
  if (isWeekend(dateStr)) return 'holiday'
  if (isNationalHoliday(month, dateStr)) return 'holiday'
  return 'weekday'
}

// required slots for a day: [{shiftKey, start, end, hours}]  (empty if closed)
export function getDaySlots(data, month, dateStr) {
  if (month.closedDays.includes(dateStr)) return []
  const dayType = getDayType(month, dateStr)
  const baseKeys = dayType === 'weekday' ? WEEKDAY_SLOT_KEYS : HOLIDAY_SLOT_KEYS
  const override = month.businessHours[dateStr] || {}
  const slots = []
  for (const key of baseKeys) {
    const ov = override[key]
    if (ov && ov.enabled === false) continue
    const def = presetTime(data, key)
    const start = ov?.start ?? def.start
    const end = ov?.end ?? def.end
    slots.push({ shiftKey: key, start, end, hours: shiftHours(start, end) })
  }
  return slots
}

function availableFor(month, empId, dateStr, shiftKey) {
  const u = month.unavailable?.[empId]?.[dateStr]
  if (u === 'all') return false
  if (Array.isArray(u) && u.includes(shiftKey)) return false
  return true
}

function isResting(month, empId, dateStr) {
  return (month.fulltimeRest?.[empId] || []).includes(dateStr)
}

// Evenly choose `target` rest days for a full-timer across the month's working days.
export function autoFulltimeRest(data, month, monthKey, empId) {
  const dates = listDates(monthKey).filter((d) => !month.closedDays.includes(d))
  const target = month.fulltimeRestTarget?.[empId] ?? 8
  if (target <= 0 || dates.length === 0) return []
  const rest = []
  const step = dates.length / target
  for (let i = 0; i < target; i++) {
    const idx = Math.min(dates.length - 1, Math.round(i * step + step / 2))
    if (!rest.includes(dates[idx])) rest.push(dates[idx])
  }
  return rest
}

// Main auto-scheduler. Returns a new `schedule` object.
// options: { balance: bool, respectManual: bool }
export function runAutoSchedule(data, monthKey, month, options = {}) {
  const { balance = true, respectManual = true } = options
  const employees = data.employees
  const empById = Object.fromEntries(employees.map((e) => [e.id, e]))
  const priorities = data.priorities

  const dates = listDates(monthKey)
  const acc = {} // empId -> accumulated raw hours (for balancing)
  employees.forEach((e) => (acc[e.id] = 0))

  const newSchedule = {}

  for (const date of dates) {
    const slots = getDaySlots(data, month, date)
    if (slots.length === 0) continue
    const assignedToday = new Set()
    const dayCells = {}

    for (const slot of slots) {
      const prev = month.schedule?.[date]?.[slot.shiftKey]
      // keep manually locked cells
      if (respectManual && prev && prev.manual) {
        dayCells[slot.shiftKey] = { ...prev }
        if (prev.empId) {
          assignedToday.add(prev.empId)
          acc[prev.empId] = (acc[prev.empId] || 0) + shiftHours(prev.start, prev.end)
        }
        continue
      }

      const order = priorities[slot.shiftKey] || []
      const candidates = order.filter((id) => {
        const e = empById[id]
        if (!e) return false
        if (assignedToday.has(id)) return false
        if (!availableFor(month, id, date, slot.shiftKey)) return false
        if (e.role === 'fulltime' && isResting(month, id, date)) return false
        return true
      })

      let pick = null
      const fulltimers = candidates.filter((id) => empById[id].role === 'fulltime')
      if (fulltimers.length > 0) {
        // 正職一律優先吃下白天班（依優先順序）
        pick = fulltimers[0]
      } else if (candidates.length > 0) {
        if (balance) {
          // 可上的人中，挑累積時數最少者；同時數則照優先順序
          pick = candidates.reduce((best, id) =>
            acc[id] < acc[best] - 1e-9 ? id : best,
          candidates[0])
        } else {
          pick = candidates[0]
        }
      }

      if (pick) {
        dayCells[slot.shiftKey] = { empId: pick, start: slot.start, end: slot.end, manual: false }
        assignedToday.add(pick)
        acc[pick] += slot.hours
      } else {
        dayCells[slot.shiftKey] = { empId: null, start: slot.start, end: slot.end, manual: false, conflict: true }
      }
    }
    newSchedule[date] = dayCells
  }
  return newSchedule
}

// ---- analysis: warnings + hours summary -----------------------------------

// returns map empId -> Set(dateStr) of days flagged for >5 consecutive work
export function continuousWarnings(monthKey, month) {
  const dates = listDates(monthKey)
  const worked = {} // empId -> Set(date)
  dates.forEach((d) => {
    const day = month.schedule[d]
    if (!day) return
    Object.values(day).forEach((c) => {
      if (c.empId) {
        ;(worked[c.empId] ||= new Set()).add(d)
      }
    })
  })
  const flags = {}
  Object.entries(worked).forEach(([empId, set]) => {
    let run = []
    const flagged = new Set()
    for (const d of dates) {
      if (set.has(d)) {
        run.push(d)
      } else {
        if (run.length > 5) run.forEach((x) => flagged.add(x))
        run = []
      }
    }
    if (run.length > 5) run.forEach((x) => flagged.add(x))
    if (flagged.size) flags[empId] = flagged
  })
  return flags
}

export function listConflicts(monthKey, month) {
  const dates = listDates(monthKey)
  const out = []
  dates.forEach((d) => {
    const day = month.schedule[d]
    if (!day) return
    Object.entries(day).forEach(([shiftKey, c]) => {
      if (c.conflict || (!c.empId && !c.manual)) out.push({ date: d, shiftKey })
    })
  })
  return out
}

// per-employee summary. Part-timers get ×2 hours on national holidays; full-timers do not.
export function hoursSummary(data, monthKey, month) {
  const dates = listDates(monthKey)
  const summary = {}
  data.employees.forEach((e) => {
    summary[e.id] = { id: e.id, raw: 0, weighted: 0, days: 0 }
  })
  dates.forEach((d) => {
    const day = month.schedule[d]
    if (!day) return
    const holiday = isNationalHoliday(month, d)
    const seen = new Set()
    Object.values(day).forEach((c) => {
      if (!c.empId || !summary[c.empId]) return
      const e = data.employees.find((x) => x.id === c.empId)
      const h = shiftHours(c.start, c.end)
      const mult = holiday && e.role === 'parttime' ? 2 : 1
      summary[c.empId].raw += h
      summary[c.empId].weighted += h * mult
      if (!seen.has(c.empId)) {
        summary[c.empId].days += 1
        seen.add(c.empId)
      }
    })
  })
  // round
  Object.values(summary).forEach((s) => {
    s.raw = Math.round(s.raw * 100) / 100
    s.weighted = Math.round(s.weighted * 100) / 100
  })
  return summary
}

export const ALL_SLOT_KEYS = SHIFT_TYPES.map((s) => s.key)
