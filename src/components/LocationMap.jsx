import { useState } from 'react'
import { getLocations } from '../data/locations.js'
import LocationCard from './LocationCard.jsx'
import './LocationMap.css'

const BG_IMAGE = '/background/Gemini_Generated_Image_493p7z493p7z493p.png'

export default function LocationMap({ onBack, onEnterLocation, unlockAll = false, locations: providedLocations }) {
  const locations = providedLocations || getLocations(unlockAll)
  const [selectedId, setSelectedId] = useState(locations[0]?.id)
  const [shakingId, setShakingId] = useState(null)

  const handleCardClick = (location) => {
    if (!location.unlocked) {
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
        <button className="back-btn" onClick={onBack} aria-label="Quay lại">
          ←
        </button>
        <div>
          <h1>✦ CHỌN ĐỊA ĐIỂM ✦</h1>
          <p>Mỗi địa điểm là một trò chơi dân gian và một mảnh ký ức cần được kiểm chứng.</p>
        </div>
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
