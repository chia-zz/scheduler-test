import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Modal } from './Avatar'
import MiniCalendar from './MiniCalendar'
import TimeField from './TimeField'
import { SHIFT_MAP, shiftHours } from '../constants'
import {
  HOLIDAY_SLOT_KEYS,
  WEEKDAY_SLOT_KEYS,
  getDayType,
  presetTime,
} from '../scheduler'

export default function SpecialDaysModal({ open, onClose }) {
  const { data, monthKey, currentMonth, setMonth } = useApp()
  const [picked, setPicked] = useState(null)
  const month = currentMonth

  const baseKeysFor = (date) =>
    getDayType(month, date) === 'weekday' ? WEEKDAY_SLOT_KEYS : HOLIDAY_SLOT_KEYS

  function toggleClosed(date) {
    setMonth(monthKey, (m) => {
      const closed = m.closedDays.includes(date)
      return { ...m, closedDays: closed ? m.closedDays.filter((d) => d !== date) : [...m.closedDays, date] }
    })
  }

  function setOverride(date, shiftKey, patch) {
    setMonth(monthKey, (m) => {
      const bh = { ...m.businessHours }
      const day = { ...(bh[date] || {}) }
      day[shiftKey] = { ...(day[shiftKey] || {}), ...patch }
      bh[date] = day
      return { ...m, businessHours: bh }
    })
  }
  function clearOverride(date) {
    setMonth(monthKey, (m) => {
      const bh = { ...m.businessHours }
      delete bh[date]
      return { ...m, businessHours: bh }
    })
  }

  const hasSpecial = (date) =>
    month.closedDays.includes(date) || (month.businessHours[date] && Object.keys(month.businessHours[date]).length > 0)

  return (
    <Modal open={open} onClose={onClose} title="特殊日：公休 / 調整營業時段" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-sub">點選日期後設定。標記點代表該日有特殊設定。</p>
        <MiniCalendar
          monthKey={monthKey}
          onPick={(d) => setPicked(d)}
          renderCell={(d) => {
            if (month.closedDays.includes(d))
              return { className: 'border-error bg-error-bg text-error', content: <span className="text-[9px]">休</span> }
            if (hasSpecial(d)) return { badge: 'var(--c-warning)' }
            if (picked === d) return { className: 'border-primary bg-primary text-primary-txt' }
            return {}
          }}
        />

        {picked && (
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display font-semibold text-main">{picked.slice(5)} 設定</h4>
              <button className="text-xs text-sub underline" onClick={() => clearOverride(picked)}>清除時段調整</button>
            </div>

            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--c-error)]"
                checked={month.closedDays.includes(picked)}
                onChange={() => toggleClosed(picked)}
              />
              全天公休（不排任何班）
            </label>

            {!month.closedDays.includes(picked) && (
              <div className="space-y-2">
                <div className="label">營業班別（可關閉或改時間，留空白用預設）</div>
                {baseKeysFor(picked).map((key) => {
                  const ov = month.businessHours[picked]?.[key] || {}
                  const def = presetTime(data, key)
                  const enabled = ov.enabled !== false
                  const start = ov.start ?? def.start
                  const end = ov.end ?? def.end
                  return (
                    <div key={key} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-main">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--c-primary)]"
                          checked={enabled}
                          onChange={(e) => setOverride(picked, key, { enabled: e.target.checked })}
                        />
                        {SHIFT_MAP[key].label}
                      </label>
                      {enabled && (
                        <div className="flex items-center gap-1.5">
                          <TimeField
                            className="input w-24 px-2 py-1"
                            value={start}
                            onChange={(v) => setOverride(picked, key, { start: v })}
                          />
                          <span className="text-sub">–</span>
                          <TimeField
                            className="input w-24 px-2 py-1"
                            value={end}
                            onChange={(v) => setOverride(picked, key, { end: v })}
                          />
                          <span className="text-xs text-sub">{shiftHours(start, end)}h</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <p className="text-[11px] text-sub">例：晚上提早打烊→關閉晚班；平日下午才開門→把白天班改成 13:00–18:30。跨午夜用 24:15 表示。</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn-primary" onClick={onClose}>完成</button>
        </div>
      </div>
    </Modal>
  )
}
