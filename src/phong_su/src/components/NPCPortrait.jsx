import { useEffect, useRef, useState } from 'react'
import { CHARACTER_IMAGES, SECTION_BACKGROUNDS, getBackgroundSrc } from '../data/npcAssets.js'

/**
 * Renders an NPC portrait as a real illustrated character (transparent PNG)
 * composited over a background image that changes per unlocked knowledge
 * milestone (currentSectionId). Backgrounds crossfade with CSS opacity.
 */
export default function NPCPortrait({ portraitId, currentSectionId, width = 280, height = 360 }) {
  const bgMap = SECTION_BACKGROUNDS[portraitId] || {}
  const bgEntries = Object.entries(bgMap) // [ [sectionId, src], ... ]
  const activeSrc = getBackgroundSrc(portraitId, currentSectionId)
  const charSrc = CHARACTER_IMAGES[portraitId]

  const [breathe, setBreathe] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts
      const t = (ts - startRef.current) / 1000
      setBreathe(Math.sin(t * 0.9) * 3)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        background: '#2a1408',
      }}
    >
      {/* All milestone backgrounds are stacked and crossfaded via opacity,
          so switching sections never causes a jarring reload/flash. */}
      {bgEntries.map(([sectionId, src]) => (
        <img
          key={sectionId}
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: src === activeSrc ? 1 : 0,
            transition: 'opacity 0.7s ease',
          }}
        />
      ))}

      {/* Character cutout, gently "breathing" via translateY */}
      {charSrc && (
        <img
          src={charSrc}
          alt=""
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            height: '94%',
            transform: `translate(-50%, ${breathe}px)`,
            filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.45))',
          }}
        />
      )}
    </div>
  )
}
