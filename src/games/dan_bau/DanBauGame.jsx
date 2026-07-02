import { useState } from 'react'
import DanBauApp from '../../dan_bau/src/App.jsx'
import './DanBauGame.css'

export default function DanBauGame({ onExit }) {
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="dan-bau-wrap">
      <div className="dan-bau-topbar">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
        <button type="button" className="secondaryButton" onClick={() => setResetKey((value) => value + 1)}>
          Reset
        </button>
      </div>
      <div className="dan-bau-frame">
        <DanBauApp key={resetKey} />
      </div>
    </div>
  )
}
