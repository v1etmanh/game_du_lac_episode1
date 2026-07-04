import { useState, useCallback } from 'react'

/**
 * Manages notebook state for a given NPC.
 * @param {Object} npcData
 */
export function useNotebook(npcData) {
  const [unlockedSections, setUnlockedSections] = useState(new Set())
  const [recentlyUnlocked, setRecentlyUnlocked] = useState([])
  // Tracks the id of the most recently unlocked section, kept even after
  // the 3s "recently unlocked" flash clears — used to pick which milestone
  // background image to show (see npcAssets.js).
  const [currentSectionId, setCurrentSectionId] = useState(null)

  const unlockSections = useCallback((sectionIds) => {
    if (!sectionIds || sectionIds.length === 0) return

    setUnlockedSections(prev => {
      const newSet = new Set(prev)
      const newlyAdded = []
      sectionIds.forEach(id => {
        if (!newSet.has(id)) {
          newSet.add(id)
          newlyAdded.push(id)
        }
      })
      if (newlyAdded.length > 0) {
        setRecentlyUnlocked(newlyAdded)
        setCurrentSectionId(newlyAdded[newlyAdded.length - 1])
        // Clear "recently unlocked" flash after 3 seconds
        setTimeout(() => setRecentlyUnlocked([]), 3000)
      }
      return newSet
    })
  }, [])

  const totalSections = npcData?.notebook?.sections?.length ?? 0
  const unlockedCount = unlockedSections.size
  const completionPct = totalSections > 0
    ? Math.round((unlockedCount / totalSections) * 100)
    : 0
  const isComplete = unlockedCount === totalSections && totalSections > 0

  return {
    unlockedSections,
    recentlyUnlocked,
    currentSectionId,
    unlockSections,
    completionPct,
    isComplete,
    unlockedCount,
    totalSections
  }
}
