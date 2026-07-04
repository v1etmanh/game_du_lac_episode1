import { useState } from 'react'
import { GAME_CONFIG } from './config/gameConfig'
import IntroSequence from './components/IntroSequence.jsx'
import LocationMap from './components/LocationMap.jsx'
import DialogScreen from './components/DialogScreen.jsx'
import JournalWidget from './components/JournalWidget.jsx'
import KiteFieldGame from './components/KiteFieldGame.jsx'
import OAnQuanGame from './games/oanquan/OAnQuanGame.jsx'
import LuaGaGame from './games/lua_ga/LuaGaGame.jsx'
import HaiQuaGame from './games/hai_qua/HaiQuaGame.jsx'
import BanHangGame from './games/ban_hang/BanHangGame.jsx'
import DanBauGame from './games/dan_bau/DanBauGame.jsx'
import NhaCuQuest from './games/nha_cu/NhaCuQuest.jsx'
import PhongSuGame from './games/phong_su/PhongSuGame.jsx'
import './App.css'

const INTERVIEW_BY_LOCATION = {
  den_lang: 'ong_ba',
  nha_hung: 'hung',
  nha_ba_tu: 'ba_nam',
}

// Các màn hình: 'intro' -> 'map' -> 'dialog' -> 'minigame' (sắp xây)
export default function App() {
  const [screen, setScreen] = useState(GAME_CONFIG.SKIP_INTRO ? 'map' : 'intro')
  const [activeLocation, setActiveLocation] = useState(null)

  const handleEnterLocation = (location) => {
    setActiveLocation(location)
    // Mọi địa điểm đều có file hội thoại trong src/dialog -> luôn đi qua màn dialog trước.
    setScreen('dialog')
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
          unlockAll={GAME_CONFIG.UNLOCK_ALL_LOCATIONS}
        />
      )}
      {screen === 'dialog' && activeLocation && (
        <DialogScreen
          locationId={activeLocation.id}
          onBack={() => setScreen('map')}
          onFinish={() => setScreen(INTERVIEW_BY_LOCATION[activeLocation.id] ? 'interview' : 'minigame')}
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
          onFinish={() => setScreen('minigame')}
        />
      )}
      {screen === 'minigame' && activeLocation?.id === 'ruong' && (
        <KiteFieldGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'den_lang' && (
        <OAnQuanGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_ba_ngan' && (
        <LuaGaGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'vuon_cay' && (
        <HaiQuaGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'cho' && (
        <BanHangGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_ba_tu' && (
        <DanBauGame onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id === 'nha_cu' && (
        <NhaCuQuest onExit={() => setScreen('map')} />
      )}
      {screen === 'minigame' && activeLocation?.id !== 'ruong' && activeLocation?.id !== 'den_lang' && activeLocation?.id !== 'nha_ba_ngan' && activeLocation?.id !== 'vuon_cay' && activeLocation?.id !== 'cho' && activeLocation?.id !== 'nha_ba_tu' && activeLocation?.id !== 'nha_cu' && (
        <div className="placeholder-screen">
          Đã trò chuyện xong tại "{activeLocation?.name}".
          <br />
          Màn minigame sẽ được xây ở bước tiếp theo.
          <br />
          <button className="back-to-map-btn" onClick={() => setScreen('map')}>
            ← Quay lại bản đồ
          </button>
        </div>
      )}
    </div>
  )
}
