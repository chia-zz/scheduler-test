import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Avatar, Modal } from '../components/Avatar'
import { IconEdit, IconPlus, IconTrash } from '../components/Icons'
import { COLOR_SWATCHES, EMOJI_CHOICES, ROLE_LABEL } from '../constants'
import { uid } from '../storage'

function EmployeeEditor({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [role, setRole] = useState(initial?.role || 'parttime')
  const [color, setColor] = useState(initial?.color || COLOR_SWATCHES[0])
  const [emoji, setEmoji] = useState(initial?.emoji || EMOJI_CHOICES[0])
  const [error, setError] = useState('')

  function save() {
    if (!name.trim()) return setError('請輸入名稱')
    onSave({ name: name.trim(), role, color, emoji })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar emoji={emoji} color={color} size={56} />
        <div className="flex-1">
          <label className="label">顯示名稱</label>
          <input
            className="input"
            value={name}
            autoFocus
            maxLength={4}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：樂"
          />
        </div>
      </div>

      <div>
        <label className="label">身分</label>
        <div className="grid grid-cols-2 gap-2">
          {['fulltime', 'parttime'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                role === r
                  ? 'border-primary bg-primary text-primary-txt'
                  : 'border-line bg-surface text-sub hover:bg-bg'
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        {role === 'fulltime' && (
          <p className="mt-1.5 text-xs text-sub">正職只會被排到白天開店班（不排中班 / 晚班）。</p>
        )}
      </div>

      <div>
        <label className="label">顏色</label>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition hover:scale-110"
              style={{
                background: c,
                boxShadow: color === c ? '0 0 0 2px var(--c-surface), 0 0 0 4px var(--c-primary)' : 'none',
              }}
              aria-label={c}
            />
          ))}
          <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-line">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="label">頭像 Emoji</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                emoji === e ? 'ring-2 ring-primary' : 'hover:bg-bg'
              }`}
              style={emoji === e ? { background: 'var(--c-success-bg)' } : undefined}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          className="input mt-2"
          value={emoji}
          maxLength={4}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="或自行貼上任意 emoji"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button className="btn-ghost" onClick={onCancel}>取消</button>
        <button className="btn-primary" onClick={save}>儲存</button>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const { data, addEmployee, updateEmployee, removeEmployee } = useApp()
  const [editing, setEditing] = useState(null) // employee object or 'new' or null
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fulltime = data.employees.filter((e) => e.role === 'fulltime')
  const parttime = data.employees.filter((e) => e.role === 'parttime')

  function handleSave(patch) {
    if (editing === 'new') addEmployee({ id: uid(), ...patch })
    else updateEmployee(editing.id, patch)
    setEditing(null)
  }

  const Section = ({ title, list }) => (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-sub">
        {title}
        <span className="tag bg-bg text-sub">{list.length}</span>
      </h2>
      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-sub">
          尚無{title}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <div key={e.id} className="card flex items-center gap-3 p-3">
              <Avatar emoji={e.emoji} color={e.color} size={44} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-base font-semibold text-main">{e.name}</div>
                <div className="text-xs text-sub">{ROLE_LABEL[e.role]}</div>
              </div>
              <button className="btn-icon" onClick={() => setEditing(e)} aria-label="編輯">
                <IconEdit width={15} height={15} />
              </button>
              <button
                className="btn-icon hover:text-error"
                onClick={() => setConfirmDelete(e)}
                aria-label="刪除"
              >
                <IconTrash width={15} height={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-main">員工設定</h1>
          <p className="text-sm text-sub">管理員工的名稱、身分、顏色與頭像。</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          <IconPlus width={16} height={16} /> 新增員工
        </button>
      </div>

      <Section title="正職" list={fulltime} />
      <Section title="兼職" list={parttime} />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? '新增員工' : '編輯員工'}
      >
        {editing && (
          <EmployeeEditor
            initial={editing === 'new' ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="刪除員工">
        {confirmDelete && (
          <div className="space-y-4">
            <p className="text-sm text-main">
              確定要刪除「{confirmDelete.name}」嗎？此員工會從所有班別順序中移除。
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>取消</button>
              <button
                className="btn-danger"
                onClick={() => {
                  removeEmployee(confirmDelete.id)
                  setConfirmDelete(null)
                }}
              >
                刪除
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
