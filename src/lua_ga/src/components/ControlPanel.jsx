import React from "react";

function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <label className="controlRow">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>
        {value}
        {unit}
      </output>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggleRow">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function ControlPanel({ settings, setSettings, snapshot, onReset, onPause, onResume }) {
  const setSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  };

  return (
    <aside className="panel controlPanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Prototype</p>
          <h1>Chicken Herding</h1>
        </div>
        <span className={snapshot?.paused ? "statusBadge paused" : "statusBadge"}>{snapshot?.paused ? "Paused" : "Live"}</span>
      </div>

      <div className="buttonRow">
        <button type="button" onClick={snapshot?.paused ? onResume : onPause}>
          {snapshot?.paused ? "Resume" : "Pause"}
        </button>
        <button type="button" className="secondaryButton" onClick={onReset}>
          Reset
        </button>
      </div>

      <section className="controlGroup">
        <h2>Player</h2>
        <Slider label="Speed" value={settings.playerSpeed} min={60} max={180} onChange={(value) => setSetting("playerSpeed", value)} />
        <Slider label="Sprint" value={settings.playerSprintMultiplier} min={1.2} max={4} step={0.1} unit="x" onChange={(value) => setSetting("playerSprintMultiplier", value)} />
        <Slider label="Sprint time" value={settings.playerSprintDuration} min={1} max={6} step={0.5} unit="s" onChange={(value) => setSetting("playerSprintDuration", value)} />
        <Slider label="Cooldown" value={settings.playerSprintCooldown} min={1} max={8} step={0.5} unit="s" onChange={(value) => setSetting("playerSprintCooldown", value)} />
      </section>

      <section className="controlGroup">
        <h2>Chicken</h2>
        <Slider label="Alert" value={settings.chickenAlertRadius} min={90} max={230} unit="px" onChange={(value) => setSetting("chickenAlertRadius", value)} />
        <Slider label="Pressure" value={settings.chickenPressureRadius} min={55} max={150} unit="px" onChange={(value) => setSetting("chickenPressureRadius", value)} />
        <Slider label="Panic" value={settings.chickenPanicRadius} min={20} max={80} unit="px" onChange={(value) => setSetting("chickenPanicRadius", value)} />
        <Slider label="Wander" value={settings.chickenWanderSpeed} min={10} max={55} unit="px/s" onChange={(value) => setSetting("chickenWanderSpeed", value)} />
        <Slider label="Escape" value={settings.chickenEscapeSpeed} min={50} max={145} unit="px/s" onChange={(value) => setSetting("chickenEscapeSpeed", value)} />
        <Slider label="Panic speed" value={settings.chickenPanicSpeed} min={80} max={190} unit="px/s" onChange={(value) => setSetting("chickenPanicSpeed", value)} />
        <Slider label="Escape burst" value={settings.chickenEscapeBurstMultiplier} min={1} max={6} step={0.1} unit="x" onChange={(value) => setSetting("chickenEscapeBurstMultiplier", value)} />
        <Slider label="Panic burst" value={settings.chickenPanicBurstMultiplier} min={2} max={8} step={0.1} unit="x" onChange={(value) => setSetting("chickenPanicBurstMultiplier", value)} />
      </section>

      <section className="controlGroup">
        <h2>Escape</h2>
        <Slider label="Cone" value={settings.escapeConeAngle} min={60} max={120} step={15} unit="deg" onChange={(value) => setSetting("escapeConeAngle", value)} />
        <label className="controlRow">
          <span>Distribution</span>
          <select value={settings.escapeDistribution} onChange={(event) => setSetting("escapeDistribution", event.target.value)}>
            <option value="center">Center weighted</option>
            <option value="uniform">Uniform</option>
          </select>
        </label>
        <Slider label="Exit buffer" value={settings.escapeExitBuffer} min={0} max={180} unit="px" onChange={(value) => setSetting("escapeExitBuffer", value)} />
        <Slider label="Min run" value={settings.minimumEscapeDistance} min={40} max={260} unit="px" onChange={(value) => setSetting("minimumEscapeDistance", value)} />
        <Slider label="Max run" value={settings.maximumEscapeDistance} min={80} max={360} unit="px" onChange={(value) => setSetting("maximumEscapeDistance", value)} />
      </section>

      <section className="controlGroup">
        <h2>Grain</h2>
        <Slider label="Amount" value={settings.grainAmountPerDrop} min={4} max={20} onChange={(value) => setSetting("grainAmountPerDrop", value)} />
        <Slider label="Max drops" value={settings.grainDropCount} min={1} max={6} onChange={(value) => setSetting("grainDropCount", value)} />
        <Slider label="Recharge" value={settings.grainRechargeInterval} min={3} max={20} unit="s" onChange={(value) => setSetting("grainRechargeInterval", value)} />
        <Slider label="Attract" value={settings.grainAttractionRadius} min={120} max={320} unit="px" onChange={(value) => setSetting("grainAttractionRadius", value)} />
        <Slider label="Safe range" value={settings.grainPlayerExclusionRadius} min={80} max={210} unit="px" onChange={(value) => setSetting("grainPlayerExclusionRadius", value)} />
        <Slider label="Gate avoid" value={settings.grainCoopGateExclusionRadius} min={20} max={150} unit="px" onChange={(value) => setSetting("grainCoopGateExclusionRadius", value)} />
      </section>

      <section className="controlGroup">
        <h2>Coop</h2>
        <Slider label="Hold time" value={settings.coopRequiredStayTime} min={0.3} max={1.2} step={0.1} unit="s" onChange={(value) => setSetting("coopRequiredStayTime", value)} />
        <Slider label="Gate" value={settings.coopGateWidth} min={32} max={90} unit="px" onChange={(value) => setSetting("coopGateWidth", value)} />
      </section>

      <section className="controlGroup">
        <h2>Clap</h2>
        <Slider label="Wave speed" value={settings.clapWaveSpeed} min={250} max={900} unit="px/s" onChange={(value) => setSetting("clapWaveSpeed", value)} />
        <Slider label="Wave range" value={settings.clapWaveRadius} min={160} max={650} unit="px" onChange={(value) => setSetting("clapWaveRadius", value)} />
        <Slider label="Panic speed" value={settings.clapPanicSpeed} min={120} max={560} unit="px/s" onChange={(value) => setSetting("clapPanicSpeed", value)} />
        <Slider label="Run" value={settings.clapRunDistance} min={60} max={280} unit="px" onChange={(value) => setSetting("clapRunDistance", value)} />
      </section>

      <section className="controlGroup">
        <h2>Debug</h2>
        <Toggle label="Detection radii" checked={settings.debugShowRadii} onChange={(value) => setSetting("debugShowRadii", value)} />
        <Toggle label="State labels" checked={settings.debugShowState} onChange={(value) => setSetting("debugShowState", value)} />
        <Toggle label="Escape cone" checked={settings.debugShowCone} onChange={(value) => setSetting("debugShowCone", value)} />
        <Toggle label="Direction rays" checked={settings.debugShowDirection} onChange={(value) => setSetting("debugShowDirection", value)} />
        <Toggle label="Collision circles" checked={settings.debugShowCollision} onChange={(value) => setSetting("debugShowCollision", value)} />
      </section>
    </aside>
  );
}
