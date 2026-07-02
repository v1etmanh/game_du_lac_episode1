import React, { useRef, useState } from "react";
import SimulationCanvas from "./components/SimulationCanvas.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import StatisticsPanel from "./components/StatisticsPanel.jsx";
import CompletionModal from "./components/CompletionModal.jsx";
import { DEFAULT_SETTINGS } from "./config/defaultSettings.js";

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [snapshot, setSnapshot] = useState(null);
  const simulationRef = useRef(null);

  return (
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
      <CompletionModal snapshot={snapshot} onReset={() => simulationRef.current?.reset()} />
    </main>
  );
}
