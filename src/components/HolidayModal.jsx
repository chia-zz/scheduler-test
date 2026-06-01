import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Modal } from './Avatar'
import { IconCheck, IconPlus, IconX } from './Icons'
import { bundledHolidaysForMonth, fetchHolidays, fetchHolidaysForMonth } from '../holidays'

export default function HolidayModal({ open, onClose }) {
  const { monthKey, currentMonth, setMonth } = useApp()
  const [fetched, setFetched] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState('')
  const [newDate, setNewDate] = useState(`${monthKey}-01`)
  const [newName, setNewName] = useState('')

  const proposed = useMemo(() => {
    const year = monthKey.split('-')[0]
    const base = fetched ? fetchHolidaysForMonth(fetched, monthKey) : bundledHolidaysForMonth(monthKey)
    return base
  }, [monthKey, fetched])

  const selected = currentMonth.holidays
  const isOn = (date) => selected.some((h) => h.date === date)

  function toggle(h) {
    setMonth(monthKey, (m) => {
      const exists = m.holidays.some((x) => x.date === h.date)
      return {
        ...m,
        holidays: exists ? m.holidays.filter((x) => x.date !== h.date) : [...m.holidays, h].sort((a, b) => a.date.localeCompare(b.date)),
      }
    })
  }

  function applyAllProposed() {
    setMonth(monthKey, (m) => {
      const map = new Map(m.holidays.map((h) => [h.date, h]))
      proposed.forEach((h) => map.set(h.date, h))
      return { ...m, holidays: [...map.values()].sort((a, b) => a.date.localeCompare(b.date)) }
    })
  }

  async function doFetch() {
    setFetching(true)
    setFetchMsg('')
    try {
      const year = monthKey.split('-')[0]
      const all = await fetchHolidays(year)
      setFetched(all)
      setFetchMsg('已從網路更新，請核對下方清單')
    } catch (err) {
      setFetchMsg(`線上抓取失敗（${err.message}），可改用內建資料或手動新增`)
    } finally {
      setFetching(false)
    }
  }

  function addManual() {
    if (!newName.trim()) return
    toggle({ date: newDate, name: newName.trim() })
    setNewName('')
  }

  function confirm() {
    setMonth(monthKey, (m) => ({ ...m, holidaysConfirmed: true }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="確認本月國定假日" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-sub">
          勾選的日期會視為國定假日：當天套用假日班別，且<b className="text-main">兼職時數 ×2</b>（正職不加倍）。
          請正職核對後按「確認」。
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost" onClick={applyAllProposed}>套用建議清單</button>
          <button className="btn-ghost" onClick={doFetch} disabled={fetching}>
            {fetching ? '抓取中…' : '從網路更新'}
          </button>
        </div>
        {fetchMsg && <p className="text-xs text-sub">{fetchMsg}</p>}

        <div>
          <div className="label">建議的國定假日（{proposed.length}）</div>
          {proposed.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-sm text-sub">
              本月無內建國定假日，可手動新增
            </p>
          ) : (
            <div className="space-y-1">
              {proposed.map((h) => (
                <label
                  key={h.date}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                    isOn(h.date) ? 'border-warning bg-warning-bg' : 'border-line bg-surface'
                  }`}
                >
                  <input type="checkbox" checked={isOn(h.date)} onChange={() => toggle(h)} className="h-4 w-4 accent-[var(--c-warning)]" />
                  <span className="font-medium text-main">{h.date.slice(5)}</span>
                  <span className="text-sub">{h.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* manually added that aren't in proposed */}
        {selected.filter((h) => !proposed.some((p) => p.date === h.date)).length > 0 && (
          <div>
            <div className="label">手動加入</div>
            <div className="space-y-1">
              {selected
                .filter((h) => !proposed.some((p) => p.date === h.date))
                .map((h) => (
                  <div key={h.date} className="flex items-center gap-3 rounded-xl border border-warning bg-warning-bg px-3 py-2 text-sm">
                    <span className="font-medium text-main">{h.date.slice(5)}</span>
                    <span className="flex-1 text-sub">{h.name}</span>
                    <button className="btn-icon h-7 w-7 hover:text-error" onClick={() => toggle(h)}>
                      <IconX width={14} height={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-line p-3">
          <div className="label">手動新增假日</div>
          <div className="flex flex-wrap items-end gap-2">
            <input type="date" className="input w-auto" value={newDate} min={`${monthKey}-01`} max={`${monthKey}-31`} onChange={(e) => setNewDate(e.target.value)} />
            <input className="input w-auto flex-1" placeholder="名稱，如：颱風假" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn-ghost" onClick={addManual}><IconPlus width={14} height={14} /> 加入</button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>稍後</button>
          <button className="btn-primary" onClick={confirm}><IconCheck width={16} height={16} /> 確認</button>
        </div>
      </div>
    </Modal>
  )
}
