import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadData, saveData, shiftMonthKey } from '../storage'
import { SHIFT_TYPES } from '../constants'
import { autoFulltimeRest, getMonth, monthDefaults, runAutoSchedule } from '../scheduler'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [data, setDataState] = useState(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  // immutable update helper: update(prev => next) or update(nextObject)
  const update = useCallback((updater) => {
    setDataState((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  const setSelectedMonth = useCallback(
    (key) => update((d) => ({ ...d, ui: { ...d.ui, selectedMonth: key } })),
    [update],
  )
  const stepMonth = useCallback(
    (n) =>
      update((d) => ({
        ...d,
        ui: { ...d.ui, selectedMonth: shiftMonthKey(d.ui.selectedMonth, n) },
      })),
    [update],
  )

  // ---- employee actions ----
  const addEmployee = useCallback(
    (emp) =>
      update((d) => {
        const employees = [...d.employees, emp]
        // 預設把新員工加進所有「可上」的班別清單末端
        const priorities = { ...d.priorities }
        SHIFT_TYPES.forEach((st) => {
          if (emp.role === 'parttime' || st.isDayShift) {
            priorities[st.key] = [...(priorities[st.key] || []), emp.id]
          }
        })
        return { ...d, employees, priorities }
      }),
    [update],
  )

  const updateEmployee = useCallback(
    (id, patch) =>
      update((d) => {
        const employees = d.employees.map((e) => (e.id === id ? { ...e, ...patch } : e))
        let priorities = d.priorities
        // 若身分改為正職，從非白天班清單移除；改為兼職則補進非白天班清單
        if (patch.role) {
          priorities = { ...d.priorities }
          SHIFT_TYPES.forEach((st) => {
            const list = priorities[st.key] || []
            const inList = list.includes(id)
            if (patch.role === 'fulltime' && !st.isDayShift && inList) {
              priorities[st.key] = list.filter((x) => x !== id)
            }
            if (patch.role === 'parttime' && !inList) {
              priorities[st.key] = [...list, id]
            }
          })
        }
        return { ...d, employees, priorities }
      }),
    [update],
  )

  const removeEmployee = useCallback(
    (id) =>
      update((d) => {
        const employees = d.employees.filter((e) => e.id !== id)
        const priorities = {}
        Object.keys(d.priorities).forEach((k) => {
          priorities[k] = d.priorities[k].filter((x) => x !== id)
        })
        return { ...d, employees, priorities }
      }),
    [update],
  )

  // ---- priority actions ----
  const setPriorityList = useCallback(
    (shiftKey, ids) =>
      update((d) => ({ ...d, priorities: { ...d.priorities, [shiftKey]: ids } })),
    [update],
  )

  // ---- month data ----
  const monthKey = data.ui.selectedMonth
  const currentMonth = useMemo(() => getMonth(data, monthKey), [data, monthKey])

  const setMonth = useCallback(
    (key, updater) =>
      update((d) => {
        const cur = { ...monthDefaults(), ...(d.months[key] || {}) }
        const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater }
        return { ...d, months: { ...d.months, [key]: next } }
      }),
    [update],
  )

  // Ensure full-timer rest days exist, then run the auto-scheduler.
  const autoSchedule = useCallback(
    (key, options = {}) =>
      update((d) => {
        const month = { ...monthDefaults(), ...(d.months[key] || {}) }
        const fulltimeRest = { ...month.fulltimeRest }
        d.employees
          .filter((e) => e.role === 'fulltime')
          .forEach((e) => {
            if (!fulltimeRest[e.id]) fulltimeRest[e.id] = autoFulltimeRest(d, month, key, e.id)
          })
        const withRest = { ...month, fulltimeRest }
        const schedule = runAutoSchedule(d, key, withRest, {
          balance: options.balance ?? month.balanceMode,
          respectManual: options.respectManual ?? true,
        })
        return {
          ...d,
          months: { ...d.months, [key]: { ...withRest, schedule } },
        }
      }),
    [update],
  )

  const value = useMemo(
    () => ({
      data,
      update,
      setSelectedMonth,
      stepMonth,
      addEmployee,
      updateEmployee,
      removeEmployee,
      setPriorityList,
      employeeById: (id) => data.employees.find((e) => e.id === id),
      monthKey,
      currentMonth,
      setMonth,
      autoSchedule,
    }),
    [data, update, setSelectedMonth, stepMonth, addEmployee, updateEmployee, removeEmployee, setPriorityList, monthKey, currentMonth, setMonth, autoSchedule],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
