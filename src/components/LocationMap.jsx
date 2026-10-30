import { useEffect, useState } from 'react'
import { CheckCircle2, LogOut, RotateCcw, User } from 'lucide-react'
import { getLocations } from '../data/locations.js'
import LocationCard from './LocationCard.jsx'
import { track } from '../analytics/track.js'
import './LocationMap.css'

const BG_IMAGE = '/background/Gemini_Generated_Image_493p7z493p7z493p.png'

export default function LocationMap({
  onBack,
  onEnterLocation,
  unlockAll = false,
  locations: providedLocations,
  user,
  lastLocationId,
  syncStatus = 'saved',
  onLogout,
  onResetProgress,
}) {
  const locations = providedLocations || getLocations(unlockAll)
  const [selectedId, setSelectedId] = useState(
    () => lastLocationId || locations[0]?.id,
  )
  const [shakingId, setShakingId] = useState(null)

  useEffect(() => {
    if (lastLocationId && locations.some((l) => l.id === lastLocationId)) {
      setSelectedId(lastLocationId)
    }
  }, [lastLocationId, locations])

  const completedCount = locations.filter((loc) => loc.completed).length

  const handleCardClick = (location) => {
    if (!location.unlocked) {
      track('location_locked_click', location.id)
      setShakingId(location.id)
      setTimeout(() => setShakingId(null), 350)
      return
    }

    if (selectedId === location.id) {
      onEnterLocation(location)
    } else {
      setSelectedId(location.id)
    }
  }

  const rowTop = locations.slice(0, 6)
  const rowBottom = locations.slice(6, 12)

  return (
    <div
      className="location-map-root"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      <div className="location-map-header">
        <div className="location-map-title-group">
          <button className="back-btn" onClick={onBack} aria-label="Xem lại Intro">
            ←
          </button>
          <div>
            <h1>✦ CHỌN ĐỊA ĐIỂM ✦</h1>
            <p>Mỗi địa điểm là một trò chơi dân gian và một mảnh ký ức cần được kiểm chứng.</p>
          </div>
        </div>

        {user && (
          <div className="player-journey-bar">
            <div className="player-journey-info">
              <span className="player-journey-avatar">
                <User size={15} />
              </span>
              <div className="player-journey-text">
                <div className="player-journey-name">
                  {user.displayName || user.username}
                </div>
                <div className="player-journey-meta">
                  <span>
                    Hành trình: <strong>{completedCount}/{locations.length}</strong> chặng
                  </span>
                  <span className="player-sync-pill">
                    <CheckCircle2 size={12} />
                    {syncStatus === 'saving' ? 'Đang lưu...' : 'Đã lưu hành trình'}
                  </span>
                </div>
              </div>
            </div>

            <div className="player-journey-actions">
              {completedCount > 0 && onResetProgress && (
                <button
                  type="button"
                  className="player-action-btn"
                  onClick={onResetProgress}
                  title="Chơi lại từ đầu"
                >
                  <RotateCcw size={14} />
                  <span>Đi lại</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  className="player-action-btn logout"
                  onClick={onLogout}
                  title="Đăng xuất / Đổi tài khoản"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="location-map-cards">
        <div className="loc-row">
          {rowTop.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              isSelected={selectedId === loc.id}
              isShaking={shakingId === loc.id}
              onClick={handleCardClick}
            />
          ))}
        </div>
        <div className="loc-row">
          {rowBottom.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              isSelected={selectedId === loc.id}
              isShaking={shakingId === loc.id}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
