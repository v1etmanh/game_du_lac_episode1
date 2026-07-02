import { useRef, useState } from 'react'
import SimulationCanvas from '../../lua_ga/src/components/SimulationCanvas.jsx'
import ControlPanel from '../../lua_ga/src/components/ControlPanel.jsx'
import StatisticsPanel from '../../lua_ga/src/components/StatisticsPanel.jsx'
import CompletionModal from '../../lua_ga/src/components/CompletionModal.jsx'
import { DEFAULT_SETTINGS } from '../../lua_ga/src/config/defaultSettings.js'
import './LuaGaGame.css'

export default function LuaGaGame({ onExit }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
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
        <ControlPanel
          settings={settings}
          setSettings={setSettings}
          snapshot={snapshot}
          onReset={() => simulationRef.current?.reset()}
          onPause={() => simulationRef.current?.pause()}
          onResume={() => simulationRef.current?.resume()}
        />

        <section className="playArea" aria-label="Simulation">
          <SimulationCanvas ref={simulationRef} settings={settings} onSnapshot={setSnapshot} />
        </section>

        <StatisticsPanel snapshot={snapshot} />
      </main>

      <CompletionModal snapshot={snapshot} onReset={() => simulationRef.current?.reset()} />

      {snapshot?.completed && (
        <div className="completionExitRow">
          <button type="button" onClick={onExit}>
            Quay lại bản đồ
          </button>
        </div>
      )}
    </div>
  )
}
