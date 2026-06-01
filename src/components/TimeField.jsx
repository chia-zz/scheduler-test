import { useEffect, useState } from 'react'
import { normalizeTime } from '../constants'

export default function TimeField({ value, onChange, className = '' }) {
  const [local, setLocal] = useState(value || '')
  useEffect(() => {
    setLocal(value || '')
  }, [value])

  function commit() {
    const n = normalizeTime(local)
    setLocal(n)
    if (n !== value) onChange(n)
  }

  return (
    <input
      className={className}
      value={local}
      inputMode="numeric"
      placeholder="HH:MM"
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}
