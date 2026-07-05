import React, { useRef, useState } from "react";
import SimulationCanvas from "./components/SimulationCanvas.jsx";
import CompletionModal from "./components/CompletionModal.jsx";
import { DEFAULT_SETTINGS } from "./config/defaultSettings.js";

export default function App() {
  const [snapshot, setSnapshot] = useState(null);
  const simulationRef = useRef(null);

  return (
    <main className="appShell">
      <section className="playArea" aria-label="Simulation">
        <SimulationCanvas ref={simulationRef} settings={DEFAULT_SETTINGS} onSnapshot={setSnapshot} />
      </section>

      <CompletionModal snapshot={snapshot} onReset={() => simulationRef.current?.reset()} />
    </main>
  );
}
