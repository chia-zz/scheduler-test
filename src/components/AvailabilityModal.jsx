import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Avatar, Modal } from './Avatar'
import MiniCalendar from './MiniCalendar'
import { listDates } from '../dateutils'

export default function AvailabilityModal({ open, onClose }) {
  const { data, monthKey, currentMonth, setMonth } = useApp()
  const [empId, setEmpId] = useState(data.employees[0]?.id || null)
  const month = currentMonth
  const emp = data.employees.find((e) => e.id === empId)

  const forEmp = month.unavailable?.[empId] || {}
  const offCount = Object.keys(forEmp).length

  function writeForEmp(map) {
    setMonth(monthKey, (m) => {
      const all = { ...m.unavailable }
      if (!map || Object.keys(map).length === 0) delete all[empId]
      else all[empId] = map
      return { ...m, unavailable: all }
    })
  }

  function toggleDate(date) {
    const next = { ...forEmp }
    if (next[date]) delete next[date]
    else next[date] = 'all'
    writeForEmp(next)
  }

  function selectAll() {
    const map = {}
    listDates(monthKey).forEach((d) => (map[d] = 'all'))
    writeForEmp(map)
  }
  function clearAll() {
    writeForEmp(null)
  }

  function cellRender(d) {
    if (forEmp[d]) return { className: 'border-error bg-error-bg text-error font-semibold' }
    return {}
  }

  return (
    <Modal open={open} onClose={onClose} title="設定每人當月不可上班" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {data.employees.map((e) => (
            <button
              key={e.id}
              onClick={() => setEmpId(e.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition ${
                empId === e.id ? 'border-primary bg-primary text-primary-txt' : 'border-line bg-surface text-main hover:bg-bg'
              }`}
            >
              <Avatar emoji={e.emoji} color={e.color} size={20} />
              {e.name}
            </button>
          ))}
        </div>

        {emp && (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-sub">
                點日期切換「整天不可上」（紅色）。班別層級的限制請用「班別順序」調整。
              </p>
              <div className="flex shrink-0 gap-1.5">
                <button className="btn-ghost px-2.5 py-1 text-xs" onClick={selectAll}>全選</button>
                <button className="btn-ghost px-2.5 py-1 text-xs" onClick={clearAll}>清除</button>
              </div>
            </div>

            <MiniCalendar monthKey={monthKey} onPick={toggleDate} renderCell={cellRender} />

            <p className="text-xs text-sub">
              {emp.name} 本月不可上班 <b className="text-main">{offCount}</b> 天
            </p>
          </>
        )}

        <div className="flex justify-end">
          <button className="btn-primary" onClick={onClose}>完成</button>
        </div>
      </div>
    </Modal>
  )
}
