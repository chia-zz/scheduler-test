import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Avatar'
import { IconDownload, IconPlus, IconUpload, IconX } from '../components/Icons'
import { SHIFT_TYPES, shiftHours } from '../constants'
import { sha256 } from '../crypto'
import { buildDefaultData, exportData, importDataFromFile } from '../storage'

function PasswordChanger() {
  const { data, update } = useApp()
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [next2, setNext2] = useState('')
  const [msg, setMsg] = useState(null) // {type, text}

  async function change() {
    setMsg(null)
    if ((await sha256(cur)) !== data.auth.passwordHash) return setMsg({ type: 'error', text: '目前密碼錯誤' })
    if (next.length < 4) return setMsg({ type: 'error', text: '新密碼至少 4 個字' })
    if (next !== next2) return setMsg({ type: 'error', text: '兩次新密碼不一致' })
    const hash = await sha256(next)
    update((d) => ({ ...d, auth: { ...d.auth, passwordHash: hash } }))
    setCur(''); setNext(''); setNext2('')
    setMsg({ type: 'success', text: '密碼已更新' })
  }

  return (
    <div className="card p-5">
      <h2 className="mb-1 font-display text-base font-semibold text-main">變更管理密碼</h2>
      <p className="mb-4 text-xs text-sub">純前端密碼鎖，僅供擋住一般人，並非真正的安全機制。</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">目前密碼</label>
          <input type="password" className="input" value={cur} onChange={(e) => setCur(e.target.value)} />
        </div>
        <div>
          <label className="label">新密碼</label>
          <input type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div>
          <label className="label">確認新密碼</label>
          <input type="password" className="input" value={next2} onChange={(e) => setNext2(e.target.value)} />
        </div>
      </div>
      {msg && (
        <p className={`mt-3 text-sm ${msg.type === 'error' ? 'text-error' : 'text-success'}`}>{msg.text}</p>
      )}
      <div className="mt-4">
        <button className="btn-primary" onClick={change}>更新密碼</button>
      </div>
    </div>
  )
}

function ShiftPresetsEditor() {
  const { data, update } = useApp()

  function setPresets(key, presets) {
    update((d) => ({ ...d, shiftPresets: { ...d.shiftPresets, [key]: presets } }))
  }

  return (
    <div className="card p-5">
      <h2 className="mb-1 font-display text-base font-semibold text-main">班別常用時間</h2>
      <p className="mb-4 text-xs text-sub">
        每個班別可設定多組常用時間，第一組為自動排班的預設值；排班時也能逐格自訂任意時間。時數依起訖自動計算。
      </p>
      <div className="space-y-4">
        {SHIFT_TYPES.map((s) => {
          const presets = data.shiftPresets[s.key] || []
          return (
            <div key={s.key} className="rounded-xl border border-line p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-main">{s.label}</span>
                {presets.length > 0 && (
                  <span className="tag bg-bg text-sub">預設 {presets[0].start}–{presets[0].end}</span>
                )}
              </div>
              <div className="space-y-2">
                {presets.map((p, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      className="input w-auto"
                      value={p.start}
                      onChange={(e) => {
                        const np = [...presets]
                        np[idx] = { ...np[idx], start: e.target.value }
                        setPresets(s.key, np)
                      }}
                    />
                    <span className="text-sub">–</span>
                    <input
                      type="time"
                      className="input w-auto"
                      value={p.end}
                      onChange={(e) => {
                        const np = [...presets]
                        np[idx] = { ...np[idx], end: e.target.value }
                        setPresets(s.key, np)
                      }}
                    />
                    <span className="text-xs text-sub">
                      {presets.length ? `${shiftHours(p.start, p.end)} 小時` : ''}
                      {idx === 0 && <span className="ml-1 text-primary">(預設)</span>}
                    </span>
                    <button
                      className="btn-icon h-7 w-7 hover:text-error"
                      onClick={() => setPresets(s.key, presets.filter((_, i) => i !== idx))}
                      aria-label="移除"
                    >
                      <IconX width={14} height={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn-ghost mt-2 py-1.5 text-xs"
                onClick={() => setPresets(s.key, [...presets, { start: s.defaultStart, end: s.defaultEnd }])}
              >
                <IconPlus width={14} height={14} /> 新增時段
              </button>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-sub">提示：「24:15」代表跨午夜到隔天 00:15。原生時間選擇器若無法輸入 24 點，可改用 00:15 並自行記得。</p>
    </div>
  )
}

function BackupSection() {
  const { data, update } = useApp()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  async function onImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importDataFromFile(file)
      update(imported)
      setMsg({ type: 'success', text: '已匯入備份資料' })
    } catch (err) {
      setMsg({ type: 'error', text: `匯入失敗：${err.message}` })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="card p-5">
      <h2 className="mb-1 font-display text-base font-semibold text-main">資料備份</h2>
      <p className="mb-4 text-xs text-sub">
        資料只存在這個瀏覽器。建議定期匯出備份；換電腦或換瀏覽器時，匯出後到另一台匯入即可。
      </p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => exportData(data)}>
          <IconDownload width={16} height={16} /> 匯出 JSON 備份
        </button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          <IconUpload width={16} height={16} /> 匯入 JSON 備份
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
      </div>
      {msg && (
        <p className={`mt-3 text-sm ${msg.type === 'error' ? 'text-error' : 'text-success'}`}>{msg.text}</p>
      )}
      <p className="mt-2 text-xs text-sub">匯入會覆蓋目前所有資料（員工、順序、設定、各月份班表）。</p>
    </div>
  )
}

function ResetSection() {
  const { update } = useApp()
  const [open, setOpen] = useState(false)
  return (
    <div className="card p-5">
      <h2 className="mb-1 font-display text-base font-semibold text-main">重設資料</h2>
      <p className="mb-4 text-xs text-sub">清除所有資料並還原為預設員工與設定（密碼也會被清除）。</p>
      <button className="btn-danger" onClick={() => setOpen(true)}>重設為預設值</button>
      <Modal open={open} onClose={() => setOpen(false)} title="確認重設">
        <div className="space-y-4">
          <p className="text-sm text-main">這會刪除目前所有資料且無法復原，確定要繼續嗎？建議先匯出備份。</p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>取消</button>
            <button
              className="btn-danger"
              onClick={() => {
                update(buildDefaultData())
                setOpen(false)
              }}
            >
              確認重設
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-main">設定</h1>
        <p className="text-sm text-sub">密碼、班別時間預設與資料備份。</p>
      </div>
      <PasswordChanger />
      <ShiftPresetsEditor />
      <BackupSection />
      <ResetSection />
    </div>
  )
}
