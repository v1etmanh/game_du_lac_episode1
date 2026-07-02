import React, { useState } from 'react'
import BanHangApp from '../../ban_hang/src/App.jsx'
import './BanHangGame.css'

export default function BanHangGame({ onExit }) {
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="ban-hang-wrap">
      <div className="ban-hang-topbar">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
        <button type="button" className="secondaryButton" onClick={() => setResetKey((value) => value + 1)}>
          Reset
        </button>
      </div>
      <div className="ban-hang-frame">
        <BanHangApp key={resetKey} />
      </div>
    </div>
  )
}
