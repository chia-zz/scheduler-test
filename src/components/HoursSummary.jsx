import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Avatar } from './Avatar'
import { ROLE_LABEL } from '../constants'
import { hoursSummary, listConflicts } from '../scheduler'

export default function HoursSummary() {
  const { data, monthKey, currentMonth } = useApp()
  const month = currentMonth
  const summary = useMemo(() => hoursSummary(data, monthKey, month), [data, monthKey, month])
  const conflicts = useMemo(() => listConflicts(monthKey, month), [monthKey, month])

  return (
    <div className="card p-4">
      <h3 className="mb-3 font-display text-base font-semibold text-main">時數統整</h3>
      <div className="space-y-1.5">
        {data.employees.map((e) => {
          const s = summary[e.id] || { weighted: 0, raw: 0, days: 0 }
          const restCount = e.role === 'fulltime' ? (month.fulltimeRest?.[e.id]?.length || 0) : null
          return (
            <div key={e.id} className="flex items-center gap-2 rounded-xl bg-bg px-2.5 py-1.5">
              <Avatar emoji={e.emoji} color={e.color} size={28} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-main">
                  {e.name} <span className="text-[10px] text-sub">{ROLE_LABEL[e.role]}</span>
                </div>
                <div className="text-[11px] text-sub">
                  {s.days} 天{restCount !== null ? ` · 休 ${restCount} 天` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-semibold text-main">{s.weighted}h</div>
                {s.weighted !== s.raw && <div className="text-[10px] text-sub">原始 {s.raw}h</div>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-sub">時數已含國定假日兼職 ×2（正職不加倍）。</p>
      {conflicts.length > 0 && (
        <div className="mt-3 rounded-xl bg-error-bg px-3 py-2 text-xs text-error">
          有 {conflicts.length} 個班別未排到人（紅色格子），請調整可上班設定或手動指派。
        </div>
      )}
    </div>
  )
}
