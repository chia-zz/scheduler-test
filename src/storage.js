import {
  DEFAULT_EMPLOYEES,
  DEFAULT_SHIFT_PRESETS,
  SHIFT_TYPES,
} from './constants'

const STORAGE_KEY = 'cafe_scheduler_data_v1'
const DATA_VERSION = 1

export const uid = () => Math.random().toString(36).slice(2, 9)

export function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// shift the "YYYY-MM" key by n months
export function shiftMonthKey(key, n) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${y} 年 ${m} 月`
}

// ---- default dataset -------------------------------------------------------
export function buildDefaultData() {
  const employees = DEFAULT_EMPLOYEES.map((e) => ({ id: uid(), ...e }))
  const priorities = {}
  SHIFT_TYPES.forEach((st) => {
    // 正職只能上白天班 → 非白天班只放兼職
    priorities[st.key] = employees
      .filter((emp) => emp.role === 'parttime' || st.isDayShift)
      .map((emp) => emp.id)
  })
  return {
    version: DATA_VERSION,
    auth: { passwordHash: '' },
    employees,
    priorities,
    shiftPresets: structuredCloneSafe(DEFAULT_SHIFT_PRESETS),
    months: {}, // 每月資料：{ "2026-04": { ... } }  在 Phase 2 才填排班內容
    ui: { selectedMonth: currentMonthKey() },
  }
}

function structuredCloneSafe(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj)
  return JSON.parse(JSON.stringify(obj))
}

// ---- load / save -----------------------------------------------------------
// Fill in any missing top-level keys so old backups keep working.
function migrate(data) {
  const base = buildDefaultData()
  const merged = {
    ...base,
    ...data,
    auth: { ...base.auth, ...(data.auth || {}) },
    ui: { ...base.ui, ...(data.ui || {}) },
  }
  if (!merged.priorities) merged.priorities = base.priorities
  if (!merged.shiftPresets) merged.shiftPresets = base.shiftPresets
  if (!merged.months) merged.months = {}
  return merged
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultData()
    return migrate(JSON.parse(raw))
  } catch (err) {
    console.error('讀取資料失敗，改用預設資料：', err)
    return buildDefaultData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('儲存資料失敗：', err)
  }
}

// ---- export / import -------------------------------------------------------
export function exportData(data) {
  const month = data?.ui?.selectedMonth || currentMonthKey()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `班表備份_${month}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importDataFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.employees)) {
          throw new Error('檔案格式不正確')
        }
        resolve(migrate(parsed))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('讀取檔案失敗'))
    reader.readAsText(file)
  })
}

export { STORAGE_KEY }
