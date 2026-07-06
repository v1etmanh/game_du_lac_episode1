import { useMemo, useState } from 'react'
import { GAME_CONFIG } from './config/gameConfig'
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
import { LOCATIONS } from './data/locations.js'
import './App.css'

const INTERVIEW_BY_LOCATION = {
  den_lang: 'ong_ba',
  nha_hung: 'hung',
  nha_ba_tu: 'ba_tu',
}

const MINIGAME_LOCATIONS = new Set(['vuon_cay', 'cho', 'ruong', 'nha_ba_tu', 'nha_cu', 'den_lang'])
const DIALOG_ONLY_LOCATIONS = new Set(['cong_lang', 'nha_ba_ngan', 'nha_minh'])
const POST_GAME_DIALOG_LOCATIONS = new Set(['nha_cu', 'den_lang'])

function getUnlocksAfter(locationId, completed) {
  switch (locationId) {
    case 'cong_lang':
      return ['vuon_cay']
    case 'vuon_cay':
      return ['cho']
    case 'cho':
      return ['nha_ba_ngan', 'nha_ba_tu']
    case 'nha_ba_tu':
      return completed.has('nha_hung') ? ['ruong', 'nha_minh', 'nha_cu'] : ['ruong', 'nha_minh']
    case 'nha_minh':
      return ['nha_hung']
    case 'nha_hung':
      return completed.has('nha_ba_tu') ? ['nha_cu'] : ['nha_ba_tu']
    case 'nha_cu':
      return ['den_lang']
    default:
      return []
  }
}

export default function App() {
  const [screen, setScreen] = useState(GAME_CONFIG.SKIP_INTRO ? 'map' : 'intro')
  const [activeLocation, setActiveLocation] = useState(null)
  const [unlockedLocations, setUnlockedLocations] = useState(() => new Set(['cong_lang']))
  const [completedLocations, setCompletedLocations] = useState(() => new Set())

  const locations = useMemo(() => {
    const forceUnlock = GAME_CONFIG.UNLOCK_ALL_LOCATIONS
    return LOCATIONS.map((location) => ({
      ...location,
      unlocked: forceUnlock || unlockedLocations.has(location.id),
      completed: completedLocations.has(location.id),
    }))
  }, [completedLocations, unlockedLocations])

  const completeLocation = (locationId) => {
    setCompletedLocations((previousCompleted) => {
      const nextCompleted = new Set(previousCompleted)
      nextCompleted.add(locationId)
      const nextUnlocks = getUnlocksAfter(locationId, nextCompleted)

      if (nextUnlocks.length > 0) {
        setUnlockedLocations((previousUnlocked) => {
          const nextUnlocked = new Set(previousUnlocked)
          nextUnlocks.forEach((id) => nextUnlocked.add(id))
          return nextUnlocked
        })
      }

      return nextCompleted
    })
  }

  const handleEnterLocation = (location) => {
    setActiveLocation(location)
    setScreen('dialog')
  }

  const handleDialogFinish = () => {
    if (!activeLocation) return
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
    if (MINIGAME_LOCATIONS.has(activeLocation.id)) {
      setScreen('minigame')
      return
    }

    completeLocation(activeLocation.id)
    setScreen('map')
  }

  const handleMinigameExit = () => {
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
      completeLocation(activeLocation.id)
    }
    setScreen('map')
  }

  return (
    <div className="app-root">
      <JournalWidget />
      {screen === 'intro' && (
        <IntroSequence onFinish={() => setScreen('map')} />
      )}
      {screen === 'map' && (
        <LocationMap
          onBack={() => setScreen('intro')}
          onEnterLocation={handleEnterLocation}
          locations={locations}
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
          onExit={() => setScreen('map')}
          onComplete={() => setScreen('postInterviewDialog')}
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
    </div>
  )
}
