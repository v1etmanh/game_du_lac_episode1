import { useState, useRef, useEffect } from 'react'

export default function TextInput({ onSend, disabled, prefill }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (prefill === undefined) return
    setValue(prefill || '')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [prefill])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '12px 16px',
      borderTop: '2px solid var(--wood-light)',
      background: 'linear-gradient(to bottom, #fdf3e3, #fae8cc)',
    }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={disabled ? 'Đang chờ trả lời...' : 'Hỏi về văn hóa truyền thống...'}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 24,
          border: '2px solid var(--wood-light)',
          background: disabled ? 'rgba(200,180,150,0.3)' : '#fff8ee',
          color: 'var(--text)',
          fontSize: '0.95rem',
          fontFamily: 'var(--font)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: 'inset 0 1px 4px rgba(90,50,10,0.08)',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--wood)'
          e.target.style.boxShadow = '0 0 0 3px rgba(139,94,60,0.18), inset 0 1px 4px rgba(90,50,10,0.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--wood-light)'
          e.target.style.boxShadow = 'inset 0 1px 4px rgba(90,50,10,0.08)'
        }}
        autoFocus
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={{
          padding: '10px 22px',
          borderRadius: 24,
          background: disabled || !value.trim()
            ? 'rgba(139,94,60,0.3)'
            : 'linear-gradient(135deg, #8b5e3c, #5c3d1e)',
          color: disabled || !value.trim() ? 'rgba(253,243,227,0.5)' : '#fdf3e3',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: disabled || !value.trim() ? 'none' : '0 2px 8px rgba(90,50,10,0.3)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          if (!disabled && value.trim()) e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
      >
        Gửi ✉
      </button>
    </div>
  )
}
