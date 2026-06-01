import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { sha256 } from '../crypto'
import { IconCoffee, IconLock } from './Icons'

export default function Login({ onUnlock }) {
  const { data, update } = useApp()
  const isFirstRun = !data.auth.passwordHash

  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (isFirstRun) {
      if (pw.length < 4) return setError('密碼至少 4 個字')
      if (pw !== pw2) return setError('兩次輸入的密碼不一致')
      setBusy(true)
      const hash = await sha256(pw)
      update((d) => ({ ...d, auth: { ...d.auth, passwordHash: hash } }))
      setBusy(false)
      onUnlock()
    } else {
      setBusy(true)
      const hash = await sha256(pw)
      setBusy(false)
      if (hash === data.auth.passwordHash) onUnlock()
      else setError('密碼錯誤')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-txt shadow-card">
            <IconCoffee width={30} height={30} />
          </div>
          <h1 className="font-display text-2xl font-bold text-main">咖啡廳排班</h1>
          <p className="mt-1 text-sm text-sub">
            {isFirstRun ? '首次使用，請設定一組管理密碼' : '請輸入管理密碼'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <label className="label">{isFirstRun ? '設定密碼' : '密碼'}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sub">
                <IconLock width={16} height={16} />
              </span>
              <input
                type="password"
                className="input pl-9"
                value={pw}
                autoFocus
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••"
              />
            </div>
          </div>

          {isFirstRun && (
            <div>
              <label className="label">再次輸入密碼</label>
              <input
                type="password"
                className="input"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="••••••"
              />
            </div>
          )}

          {error && <p className="text-sm text-error">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {isFirstRun ? '設定並進入' : '進入'}
          </button>

          {isFirstRun && (
            <p className="text-center text-xs leading-relaxed text-sub">
              提醒：這是純前端的密碼鎖，只能擋住一般人隨手點進來看，
              無法阻擋懂技術的人翻原始碼，請勿存放高度機密資訊。
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
