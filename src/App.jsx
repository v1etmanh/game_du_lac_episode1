import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GAME_CONFIG } from './config/gameConfig'
import AuthScreen from './components/AuthScreen.jsx'
import IntroSequence from './components/IntroSequence.jsx'
import LocationMap from './components/LocationMap.jsx'
import DialogScreen from './components/DialogScreen.jsx'
import JournalWidget from './components/JournalWidget.jsx'
import KiteFieldGame from './components/KiteFieldGame.jsx'
import OAnQuanGame from './games/oanquan/OAnQuanGame.jsx'
import HaiQuaGame from './games/hai_qua/HaiQuaGame.jsx'
import BanHangGame from './games/ban_hang/BanHangGame.jsx'
import DanBauGame from './games/dan_bau/DanBauGame.jsx'
import NhaCuQuest from './games/nha_cu/NhaCuQuest.jsx'
import PhongSuGame from './games/phong_su/PhongSuGame.jsx'
import LuaGaGame from './games/lua_ga/LuaGaGame.jsx'
import { LOCATIONS } from './data/locations.js'
import { setPlayerAccount, setScreen as trackScreen, track } from './analytics/track.js'
import {
  clearSession,
  fetchRemoteProgress,
  getLocalProgress,
  getSavedSession,
  LOCATION_TO_JOURNAL_IDS,
  syncProgress,
} from './services/playerStorage.js'
import './App.css'

const INTERVIEW_BY_LOCATION = {
  den_lang: 'ong_ba',
  nha_hung: 'hung',
  nha_ba_tu: 'ba_tu',
}

const MINIGAME_LOCATIONS = new Set([
  'vuon_cay',
  'cho',
  'ruong',
  'nha_ba_tu',
  'nha_cu',
  'den_lang',
  'nha_ba_ngan',
])
const DIALOG_ONLY_LOCATIONS = new Set(['cong_lang', 'nha_minh'])
const POST_GAME_DIALOG_LOCATIONS = new Set(['nha_cu', 'den_lang', 'nha_ba_ngan'])

function getUnlocksAfter(locationId) {
  switch (locationId) {
    case 'cong_lang':
      return ['vuon_cay']
    case 'vuon_cay':
      return ['cho']
    case 'cho':
      return ['nha_ba_tu']
    case 'nha_ba_tu':
      return ['nha_minh', 'ruong']
    case 'nha_minh':
      return ['nha_hung']
    case 'nha_hung':
      return ['nha_ba_ngan']
    case 'nha_ba_ngan':
      return ['nha_cu']
    case 'nha_cu':
      return ['den_lang']
    default:
      return []
  }
}

function deriveUnlockedFromCompleted(unlockedList = [], completedList = []) {
  const nextUnlocked = new Set(['cong_lang', ...unlockedList])
  for (const locId of completedList) {
    nextUnlocked.add(locId)
    for (const u of getUnlocksAfter(locId)) {
      nextUnlocked.add(u)
    }
  }
  return nextUnlocked
}

export default function App() {
  const [session, setSession] = useState(() => getSavedSession())
  const initialProgress = useMemo(() => {
    const saved = getSavedSession()
    return saved?.user?.username
      ? getLocalProgress(saved.user.username)
      : {
          unlockedLocations: ['cong_lang'],
          completedLocations: [],
          journalUnlockedIds: [],
          lastLocationId: null,
          introCompleted: false,
        }
  }, [])

  const [screen, setScreen] = useState(() => {
    const saved = getSavedSession()
    if (!saved) return 'auth'
    if (GAME_CONFIG.SKIP_INTRO || initialProgress.introCompleted) return 'map'
    return 'intro'
  })
  const [activeLocation, setActiveLocation] = useState(null)
  const [lastLocationId, setLastLocationId] = useState(() => initialProgress.lastLocationId || null)
  const [unlockedLocations, setUnlockedLocations] = useState(() =>
    deriveUnlockedFromCompleted(
      initialProgress.unlockedLocations,
      initialProgress.completedLocations,
    ),
  )
  const [completedLocations, setCompletedLocations] = useState(
    () => new Set(initialProgress.completedLocations || []),
  )
  const [journalUnlockedIds, setJournalUnlockedIds] = useState(
    () => new Set(initialProgress.journalUnlockedIds || []),
  )
  const [syncStatus, setSyncStatus] = useState('saved')
  const minigameStartRef = useRef(null)

  const applyProgress = useCallback((progress) => {
    if (!progress) return
    const completed = progress.completedLocations || []
    const unlocked = progress.unlockedLocations || ['cong_lang']
    setCompletedLocations(new Set(completed))
    setUnlockedLocations(deriveUnlockedFromCompleted(unlocked, completed))
    setJournalUnlockedIds(new Set(progress.journalUnlockedIds || []))
    if (progress.lastLocationId !== undefined) {
      setLastLocationId(progress.lastLocationId)
    }
  }, [])

  // Sync from cloud on startup when a saved session exists
  useEffect(() => {
    if (!session?.user?.username) return
    setPlayerAccount(session.user.username)
    let cancelled = false
    fetchRemoteProgress(session).then((merged) => {
      if (!cancelled && merged) {
        applyProgress(merged)
      }
    })
    return () => {
      cancelled = true
    }
  }, [session, applyProgress])

  const persistProgress = useCallback(
    async (partialUpdate) => {
      if (!session?.user?.username) return
      setSyncStatus('saving')
      const merged = await syncProgress(session, partialUpdate)
      setSyncStatus('saved')
      return merged
    },
    [session],
  )

  useEffect(() => {
    trackScreen(screen, screen === 'map' ? null : activeLocation?.id)
    if (screen === 'minigame' && activeLocation) {
      minigameStartRef.current = Date.now()
      track('minigame_start', activeLocation.id)
    }
    if (screen === 'interview' && activeLocation) {
      track('interview_start', activeLocation.id)
    }
  }, [screen, activeLocation])

  const locations = useMemo(() => {
    const forceUnlock = GAME_CONFIG.UNLOCK_ALL_LOCATIONS
    return LOCATIONS.map((location) => ({
      ...location,
      unlocked: forceUnlock || location.unlocked || unlockedLocations.has(location.id),
      completed: completedLocations.has(location.id),
    }))
  }, [completedLocations, unlockedLocations])

  const handleAuthSuccess = ({ session: nextSession, progress }) => {
    setSession(nextSession)
    setPlayerAccount(nextSession.user.username)
    applyProgress(progress)
    const shouldSkipIntro = GAME_CONFIG.SKIP_INTRO || progress?.introCompleted
    setScreen(shouldSkipIntro ? 'map' : 'intro')
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setActiveLocation(null)
    setScreen('auth')
  }

  const handleResetProgress = async () => {
    if (!window.confirm('Bạn có muốn đặt lại toàn bộ hành trình để khám phá lại từ đầu không?')) {
      return
    }
    const fresh = {
      reset: true,
      unlockedLocations: ['cong_lang'],
      completedLocations: [],
      journalUnlockedIds: [],
      lastLocationId: 'cong_lang',
      introCompleted: true,
    }
    applyProgress(fresh)
    await persistProgress(fresh)
  }

  const completeLocation = (locationId) => {
    track('location_complete', locationId)

    const nextCompleted = new Set(completedLocations)
    nextCompleted.add(locationId)

    const nextUnlocked = deriveUnlockedFromCompleted([...unlockedLocations], [...nextCompleted])
    const nextUnlocks = getUnlocksAfter(locationId)
    nextUnlocks.forEach((id) => nextUnlocked.add(id))

    const nextJournal = new Set(journalUnlockedIds)
    const mappedJournalIds = LOCATION_TO_JOURNAL_IDS[locationId] || []
    mappedJournalIds.forEach((jId) => nextJournal.add(jId))

    const nextFocusLocation = nextUnlocks[0] || locationId

    setCompletedLocations(nextCompleted)
    setUnlockedLocations(nextUnlocked)
    setJournalUnlockedIds(nextJournal)
    setLastLocationId(nextFocusLocation)

    persistProgress({
      unlockedLocations: [...nextUnlocked],
      completedLocations: [...nextCompleted],
      journalUnlockedIds: [...nextJournal],
      lastLocationId: nextFocusLocation,
      introCompleted: true,
    })
  }

  const handleJournalChange = (nextSet) => {
    const normalized = nextSet instanceof Set ? nextSet : new Set(nextSet || [])
    setJournalUnlockedIds(normalized)
    persistProgress({
      reset: normalized.size === 0 && journalUnlockedIds.size > 0,
      unlockedLocations: [...unlockedLocations],
      completedLocations: [...completedLocations],
      journalUnlockedIds: [...normalized],
      lastLocationId,
      introCompleted: true,
    })
  }

  const handleEnterLocation = (location) => {
    track('location_enter', location.id)
    setActiveLocation(location)
    setLastLocationId(location.id)
    setScreen('dialog')
    persistProgress({
      unlockedLocations: [...unlockedLocations],
      completedLocations: [...completedLocations],
      journalUnlockedIds: [...journalUnlockedIds],
      lastLocationId: location.id,
    })
  }

  const handleDialogFinish = () => {
    if (!activeLocation) return
    track('dialog_finish', activeLocation.id, { phase: 'main' })
    if (INTERVIEW_BY_LOCATION[activeLocation.id]) {
      setScreen('interview')
      return
    }
    if (MINIGAME_LOCATIONS.has(activeLocation.id) && !DIALOG_ONLY_LOCATIONS.has(activeLocation.id)) {
      setScreen('minigame')
      return
    }

    completeLocation(activeLocation.id)
    setScreen('map')
  }

  const handlePostInterviewFinish = () => {
    if (!activeLocation) return
    track('dialog_finish', activeLocation.id, { phase: 'after_interview' })
    if (MINIGAME_LOCATIONS.has(activeLocation.id)) {
      setScreen('minigame')
      return
    }

    completeLocation(activeLocation.id)
    setScreen('map')
  }

  const handleMinigameExit = () => {
    if (activeLocation) {
      const startedAt = minigameStartRef.current
      track('minigame_exit', activeLocation.id, {
        duration_ms: startedAt ? Date.now() - startedAt : null,
      })
      minigameStartRef.current = null
    }
    if (!activeLocation) {
      setScreen('map')
      return
    }
    if (POST_GAME_DIALOG_LOCATIONS.has(activeLocation.id)) {
      setScreen('postGameDialog')
      return
    }

    completeLocation(activeLocation.id)
    setScreen('map')
  }

  const handlePostGameDialogFinish = () => {
    if (activeLocation) {
      track('dialog_finish', activeLocation.id, { phase: 'after_game' })
      completeLocation(activeLocation.id)
    }
    setScreen('map')
  }

  return (
    <div className="app-root">
      {screen !== 'auth' && (
        <JournalWidget
          unlockedIds={journalUnlockedIds}
          onChangeUnlockedIds={handleJournalChange}
        />
      )}
      {screen === 'auth' && <AuthScreen onSuccess={handleAuthSuccess} />}
      {screen === 'intro' && (
        <IntroSequence
          onFinish={() => {
            track('intro_finish')
            persistProgress({ introCompleted: true })
            setScreen('map')
          }}
        />
      )}
      {screen === 'map' && (
        <LocationMap
          onBack={() => setScreen('intro')}
          onEnterLocation={handleEnterLocation}
          locations={locations}
          user={session?.user}
          lastLocationId={lastLocationId}
          syncStatus={syncStatus}
          onLogout={handleLogout}
          onResetProgress={handleResetProgress}
        />
      )}
      {screen === 'dialog' && activeLocation && (
        <DialogScreen
          locationId={activeLocation.id}
          onBack={() => setScreen('map')}
          onFinish={handleDialogFinish}
        />
      )}
      {screen === 'interview' && activeLocation && INTERVIEW_BY_LOCATION[activeLocation.id] && (
        <PhongSuGame
          npcId={INTERVIEW_BY_LOCATION[activeLocation.id]}
          onExit={() => {
            track('interview_exit', activeLocation.id)
            setScreen('map')
          }}
          onComplete={() => {
            track('interview_complete', activeLocation.id)
            setScreen('postInterviewDialog')
          }}
        />
      )}
      {screen === 'postInterviewDialog' && activeLocation && (
        <DialogScreen
          locationId={activeLocation.id}
          dialogueKey="afterInterviewDialogues"
          onBack={() => setScreen('map')}
          onFinish={handlePostInterviewFinish}
        />
      )}
      {screen === 'postGameDialog' && activeLocation && (
        <DialogScreen
          locationId={activeLocation.id}
          dialogueKey="afterGameDialogues"
          onBack={() => setScreen('map')}
          onFinish={handlePostGameDialogFinish}
        />
      )}
      {screen === 'minigame' && activeLocation?.id === 'ruong' && (
        <KiteFieldGame onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'den_lang' && (
        <OAnQuanGame onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'vuon_cay' && (
        <HaiQuaGame onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'cho' && (
        <BanHangGame onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_ba_tu' && (
        <DanBauGame onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_cu' && (
        <NhaCuQuest onExit={handleMinigameExit} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_ba_ngan' && (
        <LuaGaGame onExit={handleMinigameExit} />
      )}
    </div>
  )
}
