import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Avatar } from '../components/Avatar'
import { IconDown, IconPlus, IconUp, IconX } from '../components/Icons'
import { ROLE_LABEL, SHIFT_TYPES, SHIFT_MAP } from '../constants'

function move(arr, from, to) {
  if (to < 0 || to >= arr.length) return arr
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function ShiftCard({ shift }) {
  const { data, setPriorityList, employeeById } = useApp()
  const [adding, setAdding] = useState(false)
  const list = data.priorities[shift.key] || []

  // 可被加入的員工：尚未在清單中；若非白天班，正職不可加入
  const addable = data.employees.filter((e) => {
    if (list.includes(e.id)) return false
    if (!shift.isDayShift && e.role === 'fulltime') return false
    return true
  })

  const tagColor =
    shift.dayType === 'weekday'
      ? { background: 'var(--c-success-bg)', color: 'var(--c-success)' }
      : { background: 'var(--c-warning-bg)', color: 'var(--c-warning)' }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold text-main">{shift.label}</h3>
          <span className="tag" style={tagColor}>
            {shift.dayType === 'weekday' ? '平日' : '假日'}
          </span>
        </div>
        <span className="text-xs text-sub">
          {shift.defaultStart}–{shift.defaultEnd}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-5 text-center text-sm text-sub">
          尚未指定可上此班別的員工
        </p>
      ) : (
        <ol className="space-y-1.5">
          {list.map((id, idx) => {
            const e = employeeById(id)
            if (!e) return null
            return (
              <li key={id} className="flex items-center gap-2 rounded-xl bg-bg px-2.5 py-1.5">
                <span className="w-5 text-center font-display text-sm font-semibold text-sub">
                  {idx + 1}
                </span>
                <Avatar emoji={e.emoji} color={e.color} size={30} />
                <span className="flex-1 truncate text-sm font-medium text-main">{e.name}</span>
                <span className="text-[11px] text-sub">{ROLE_LABEL[e.role]}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    className="btn-icon h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => setPriorityList(shift.key, move(list, idx, idx - 1))}
                    aria-label="上移"
                  >
                    <IconUp width={14} height={14} />
                  </button>
                  <button
                    className="btn-icon h-7 w-7"
                    disabled={idx === list.length - 1}
                    onClick={() => setPriorityList(shift.key, move(list, idx, idx + 1))}
                    aria-label="下移"
                  >
                    <IconDown width={14} height={14} />
                  </button>
                  <button
                    className="btn-icon h-7 w-7 hover:text-error"
                    onClick={() => setPriorityList(shift.key, list.filter((x) => x !== id))}
                    aria-label="移除"
                  >
                    <IconX width={14} height={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-3">
        {adding ? (
          <div className="flex flex-wrap gap-1.5">
            {addable.length === 0 ? (
              <span className="text-xs text-sub">沒有可加入的員工了</span>
            ) : (
              addable.map((e) => (
                <button
                  key={e.id}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-sm hover:bg-bg"
                  onClick={() => {
                    setPriorityList(shift.key, [...list, e.id])
                  }}
                >
                  <Avatar emoji={e.emoji} color={e.color} size={20} />
                  {e.name}
                </button>
              ))
            )}
            <button className="btn-icon h-7 w-7" onClick={() => setAdding(false)} aria-label="完成">
              <IconX width={14} height={14} />
            </button>
          </div>
        ) : (
          <button
            className="btn-ghost py-1.5 text-xs"
            onClick={() => setAdding(true)}
            disabled={addable.length === 0}
          >
            <IconPlus width={14} height={14} /> 加入員工
          </button>
        )}
      </div>
    </div>
  )
}

export default function PrioritiesPage() {
  const weekday = SHIFT_TYPES.filter((s) => s.dayType === 'weekday')
  const holiday = SHIFT_TYPES.filter((s) => s.dayType === 'holiday')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-main">班別排班順序</h1>
        <p className="text-sm text-sub">
          數字越小越優先。自動排班會依此順序嘗試填入第一位「當天可上」的員工；
          沒被列入清單的員工，代表不排該班別。
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-sub">平日</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {weekday.map((s) => (
            <ShiftCard key={s.key} shift={s} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-sub">假日（週六日或國定假日）</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {holiday.map((s) => (
            <ShiftCard key={s.key} shift={s} />
          ))}
        </div>
      </div>
    </div>
  )
}
