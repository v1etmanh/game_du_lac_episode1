import { useRef, useState } from 'react'
import SimulationCanvas from '../../lua_ga/src/components/SimulationCanvas.jsx'
import CompletionModal from '../../lua_ga/src/components/CompletionModal.jsx'
import { DEFAULT_SETTINGS } from '../../lua_ga/src/config/defaultSettings.js'
import './LuaGaGame.css'

export default function LuaGaGame({ onExit }) {
  const [snapshot, setSnapshot] = useState(null)
  const simulationRef = useRef(null)

  return (
    <div className="lua-ga-wrap">
      <div className="lua-ga-exitHeader">
        <button type="button" className="secondaryButton" onClick={onExit}>
          ← Quay lại bản đồ
        </button>
      </div>

      <main className="appShell">
        <section className="playArea" aria-label="Simulation">
          <SimulationCanvas ref={simulationRef} settings={DEFAULT_SETTINGS} onSnapshot={setSnapshot} />
        </section>
      </main>

      <CompletionModal snapshot={snapshot} onReset={() => simulationRef.current?.reset()} />

      {(snapshot?.completed || snapshot?.failed) && (
        <div className="completionExitRow">
          <button type="button" onClick={onExit}>
            Quay lại bản đồ
          </button>
        </div>
      )}
    </div>
  )
}
