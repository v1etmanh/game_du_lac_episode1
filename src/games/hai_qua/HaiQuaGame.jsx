import { useState } from 'react'
import HaiQuaApp from '../../hai_qua/src/main.jsx'
import './HaiQuaGame.css'

export default function HaiQuaGame({ onExit }) {
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="hai-qua-wrap">
      <div className="hai-qua-exitHeader">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
        <button type="button" className="secondaryButton" onClick={() => setResetKey((value) => value + 1)}>
          Reset
        </button>
      </div>
      <div className="hai-qua-frame">
        <HaiQuaApp key={resetKey} />
      </div>
    </div>
  )
}
