// 內建台灣國定假日（放假日，含補假）。國定假日當天兼職時數 ×2。
// 資料依行政院人事行政總處 115 年(2026)辦公日曆表。
// 其他年份可用 fetchHolidays() 線上抓取；皆可在 UI 手動增刪。
export const BUNDLED_HOLIDAYS = {
  '2026': [
    { date: '2026-01-01', name: '開國紀念日' },
    { date: '2026-02-15', name: '小年夜' },
    { date: '2026-02-16', name: '農曆除夕' },
    { date: '2026-02-17', name: '春節' },
    { date: '2026-02-18', name: '春節' },
    { date: '2026-02-19', name: '春節' },
    { date: '2026-02-20', name: '春節補假' },
    { date: '2026-02-27', name: '和平紀念日補假' },
    { date: '2026-02-28', name: '和平紀念日' },
    { date: '2026-04-03', name: '兒童節補假' },
    { date: '2026-04-04', name: '兒童節' },
    { date: '2026-04-05', name: '清明節' },
    { date: '2026-04-06', name: '清明節補假' },
    { date: '2026-05-01', name: '勞動節' },
    { date: '2026-06-19', name: '端午節' },
    { date: '2026-09-25', name: '中秋節' },
    { date: '2026-09-28', name: '教師節' },
    { date: '2026-10-09', name: '國慶日補假' },
    { date: '2026-10-10', name: '國慶日' },
    { date: '2026-10-25', name: '臺灣光復節' },
    { date: '2026-10-26', name: '臺灣光復節補假' },
    { date: '2026-12-25', name: '行憲紀念日' },
  ],
}

const pad = (n) => String(n).padStart(2, '0')

// holidays that fall within a given month key, from bundled data
export function bundledHolidaysForMonth(monthKey) {
  const year = monthKey.split('-')[0]
  return (BUNDLED_HOLIDAYS[year] || []).filter((h) => h.date.startsWith(monthKey))
}

// Live fetch from the TaiwanCalendar dataset (CORS-friendly CDN).
// Returns [{date:'YYYY-MM-DD', name}] of named national holidays for that year.
export async function fetchHolidays(year) {
  const url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar@master/data/${year}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`抓取失敗（HTTP ${res.status}）`)
  const data = await res.json()
  return data
    .filter((e) => e.isHoliday && e.description) // 放假且有名稱 = 國定假日(含補假)
    .map((e) => ({
      date: `${e.date.slice(0, 4)}-${e.date.slice(4, 6)}-${e.date.slice(6, 8)}`,
      name: e.description,
    }))
}

export function fetchHolidaysForMonth(allForYear, monthKey) {
  return allForYear.filter((h) => h.date.startsWith(monthKey))
}
