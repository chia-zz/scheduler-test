// ---- Shift types -----------------------------------------------------------
// dayType: 'weekday' | 'holiday'  (假日 = 週六日 或 國定假日)
// isDayShift: true => 正職可上的「白天開店班」(其餘班別正職不排)
export const SHIFT_TYPES = [
  { key: 'weekday_day',     label: '平日白天', short: '白', dayType: 'weekday', isDayShift: true,  defaultStart: '10:30', defaultEnd: '18:30' },
  { key: 'weekday_evening', label: '平日晚上', short: '晚', dayType: 'weekday', isDayShift: false, defaultStart: '18:15', defaultEnd: '24:15' },
  { key: 'holiday_day',     label: '假日白天', short: '白', dayType: 'holiday', isDayShift: true,  defaultStart: '09:50', defaultEnd: '17:50' },
  { key: 'holiday_mid',     label: '假日中班', short: '中', dayType: 'holiday', isDayShift: false, defaultStart: '12:00', defaultEnd: '16:00' },
  { key: 'holiday_evening', label: '假日晚上', short: '晚', dayType: 'holiday', isDayShift: false, defaultStart: '16:15', defaultEnd: '24:15' },
]

export const SHIFT_MAP = Object.fromEntries(SHIFT_TYPES.map((s) => [s.key, s]))

// 各班別「常用時間預設」(設定頁可增刪)，自動排班用第一筆當預設值
export const DEFAULT_SHIFT_PRESETS = {
  weekday_day:     [{ start: '10:30', end: '18:30' }],
  weekday_evening: [{ start: '18:15', end: '24:15' }],
  holiday_day:     [{ start: '09:50', end: '17:50' }],
  holiday_mid:     [{ start: '12:00', end: '16:00' }, { start: '12:00', end: '17:00' }, { start: '11:00', end: '16:00' }],
  holiday_evening: [{ start: '16:15', end: '24:15' }, { start: '16:45', end: '24:15' }, { start: '18:15', end: '24:15' }],
}

// ---- Default roster --------------------------------------------------------
export const DEFAULT_EMPLOYEES = [
  { name: '樂', role: 'fulltime', color: '#E29B9B', emoji: '🎵' },
  { name: '咪', role: 'parttime', color: '#A8C7A0', emoji: '🐱' },
  { name: '誼', role: 'parttime', color: '#ECCF7D', emoji: '🤝' },
  { name: '畢', role: 'parttime', color: '#9DB8D8', emoji: '📖' },
  { name: '妘', role: 'parttime', color: '#C3A8DC', emoji: '☁️' },
  { name: '毛', role: 'parttime', color: '#E2B58C', emoji: '🐑' },
  { name: '君', role: 'parttime', color: '#8FC7C0', emoji: '👑' },
]

// ---- Pickers ---------------------------------------------------------------
export const COLOR_SWATCHES = [
  '#E29B9B', '#E2B58C', '#ECCF7D', '#A8C7A0', '#8FC7C0',
  '#9DB8D8', '#C3A8DC', '#D8A0BE', '#B0A99A', '#88A0A8',
]

export const EMOJI_CHOICES = [
  '🎵', '🐱', '🤝', '📖', '☁️', '🐑', '👑', '🌿', '🍵', '☕',
  '🐰', '🦊', '🐻', '🐼', '🐨', '🦉', '🌸', '🐝', '⭐', '🍀',
  '🍩', '🧋', '🥐', '🌙', '🔆', '🐧', '🦄', '🐢', '🦔', '🌷',
]

// ---- Roles -----------------------------------------------------------------
export const ROLE_LABEL = { fulltime: '正職', parttime: '兼職' }

// ---- Time helpers ----------------------------------------------------------
// 支援跨午夜表示法，例如 "24:15" = 隔天 00:15
export function timeToMinutes(t) {
  const [h, m] = String(t).split(':').map(Number)
  return h * 60 + m
}

export function shiftHours(start, end) {
  const mins = timeToMinutes(end) - timeToMinutes(start)
  return Math.round((mins / 60) * 100) / 100 // 兩位小數
}

export function formatHours(h) {
  // 8 -> "8" ; 7.5 -> "7.5"
  return Number.isInteger(h) ? String(h) : String(h)
}

// ---- Misc ------------------------------------------------------------------
export const WEEKDAY_LABELS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
export const WEEKDAY_SHORT = ['一', '二', '三', '四', '五', '六', '日']

// Normalize loose time input into "HH:MM". Accepts "815","8:5","0815","24:15" etc.
// Supports hours up to 29 (for past-midnight notation like 24:15). Returns
// the original string if it can't be parsed at all.
export function normalizeTime(input) {
  if (input == null) return ''
  const s = String(input).trim()
  if (s === '') return ''
  let h, m
  if (s.includes(':')) {
    const [a, b] = s.split(':')
    h = parseInt(a, 10)
    m = parseInt(b, 10)
  } else {
    const digits = s.replace(/\D/g, '')
    if (digits.length === 0) return s
    if (digits.length <= 2) {
      h = parseInt(digits, 10)
      m = 0
    } else {
      m = parseInt(digits.slice(-2), 10)
      h = parseInt(digits.slice(0, -2), 10)
    }
  }
  if (Number.isNaN(h) || Number.isNaN(m)) return s
  h = Math.max(0, Math.min(29, h))
  m = Math.max(0, Math.min(59, m))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
