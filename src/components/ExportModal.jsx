import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { useApp } from '../context/AppContext'
import { Modal } from './Avatar'
import { IconDownload } from './Icons'
import { monthLabel } from '../storage'
import ExportSheet from './ExportSheet'

export default function ExportModal({ open, onClose }) {
  const { data, monthKey, currentMonth } = useApp()
  const sheetRef = useRef(null)
  const [title, setTitle] = useState(`${monthLabel(monthKey)} 班表`)
  const [showLegend, setShowLegend] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function download() {
    if (!sheetRef.current) return
    setBusy(true)
    setErr('')
    const opts = { pixelRatio: 2, backgroundColor: '#FCFAF4', cacheBust: true }
    try {
      let dataUrl
      try {
        dataUrl = await toPng(sheetRef.current, opts)
      } catch {
        // retry without embedding web fonts (more robust on some networks)
        dataUrl = await toPng(sheetRef.current, { ...opts, skipFonts: true })
      }
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `班表_${monthKey}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      setErr(`匯出失敗：${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="匯出班表圖" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="label">標題</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-main">
            <input type="checkbox" className="h-4 w-4 accent-[var(--c-primary)]" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
            顯示員工色彩圖例
          </label>
        </div>

        {err && <p className="text-sm text-error">{err}</p>}

        <div className="overflow-auto rounded-xl border border-line bg-bg p-2" style={{ maxHeight: '58vh' }}>
          <ExportSheet ref={sheetRef} data={data} month={currentMonth} monthKey={monthKey} title={title} showLegend={showLegend} />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>關閉</button>
          <button className="btn-primary" onClick={download} disabled={busy}>
            <IconDownload width={16} height={16} /> {busy ? '產生中…' : '下載 PNG'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
