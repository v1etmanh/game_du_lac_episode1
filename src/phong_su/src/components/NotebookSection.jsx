import { useEffect, useRef, useState } from 'react'

/**
 * Single accordion row inside the notebook sidebar. Content reveals
 * character-by-character like it's being handwritten, only the first
 * time a section becomes unlocked.
 */
export default function NotebookSection({ section, unlocked, recentlyUnlocked, defaultOpen }) {
  const isNew = recentlyUnlocked?.includes(section.id)
  const [open, setOpen] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const hasAnimatedRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (defaultOpen && unlocked) setOpen(true)
  }, [defaultOpen, unlocked])

  useEffect(() => {
    clearTimeout(timerRef.current)

    if (!unlocked) {
      setDisplayedText('')
      hasAnimatedRef.current = false
      return
    }
    if (hasAnimatedRef.current) {
      setDisplayedText(section.content)
      return
    }

    hasAnimatedRef.current = true
    const full = section.content
    let i = 0
    const step = () => {
      i += 2
      setDisplayedText(full.slice(0, i))
      if (i < full.length) {
        timerRef.current = setTimeout(step, 16)
      }
    }
    timerRef.current = setTimeout(step, 16)

    return () => clearTimeout(timerRef.current)
  }, [unlocked, section.content])

  const isWriting = unlocked && displayedText.length < section.content.length

  return (
    <div className={`notebook-section ${unlocked ? 'unlocked' : 'locked'} ${isNew ? 'is-new' : ''}`}>
      <button
        className="notebook-section-header"
        onClick={() => unlocked && setOpen(v => !v)}
        disabled={!unlocked}
      >
        <span className="notebook-section-icon">{unlocked ? section.icon : '🔒'}</span>
        <span className="notebook-section-label">{section.label}</span>
        {isNew && <span className="notebook-section-badge">MỚI</span>}
        {!unlocked && <span className="notebook-section-hint">Chưa khám phá</span>}
        {unlocked && (
          <span className={`notebook-section-chevron ${open ? 'open' : ''}`}>▾</span>
        )}
      </button>

      {unlocked && open && (
        <div className="notebook-section-content">
          {displayedText}
          {isWriting && <span className="ink-cursor" />}
        </div>
      )}
    </div>
  )
}
