// All date strings use "YYYY-MM-DD". Month keys use "YYYY-MM".
const pad = (n) => String(n).padStart(2, '0')

export function parseMonthKey(key) {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m } // month is 1-12
}

export function daysInMonth(key) {
  const { year, month } = parseMonthKey(key)
  return new Date(year, month, 0).getDate()
}

// list every date string in the month
export function listDates(key) {
  const { year, month } = parseMonthKey(key)
  const n = daysInMonth(key)
  return Array.from({ length: n }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`)
}

export function dayOfMonth(dateStr) {
  return Number(dateStr.split('-')[2])
}

// Monday-first weekday index: 0=Mon ... 6=Sun
export function weekdayMon(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const js = new Date(y, m - 1, d).getDay() // 0=Sun..6=Sat
  return (js + 6) % 7
}

export function isWeekend(dateStr) {
  const w = weekdayMon(dateStr)
  return w === 5 || w === 6 // Sat or Sun
}

// Build calendar weeks (arrays of 7), Monday-first, with null padding.
export function buildWeeks(key) {
  const dates = listDates(key)
  const lead = weekdayMon(dates[0])
  const cells = [...Array(lead).fill(null), ...dates]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

// add n days to a date string
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}
