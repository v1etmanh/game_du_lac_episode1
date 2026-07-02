import type { GameSnapshot } from "../engine/types";

interface HUDProps {
  snapshot: GameSnapshot;
}

export function HUD({ snapshot }: HUDProps) {
  return (
    <aside className="hud" aria-live="polite">
      <div className="hud-group">
        <Metric label="Wind" value={`${snapshot.windDirectionDegrees.toFixed(0)} deg`} />
        <Metric label="Strength" value={`${snapshot.windStrength.toFixed(2)}`} />
        <Metric label="Rope" value={`${snapshot.ropeLength.toFixed(0)} m`} />
        <Metric label="Distance" value={`${Math.floor(snapshot.distance)} / ${snapshot.goalDistance} m`} />
        <Metric label="Lives" value={"🪁".repeat(snapshot.lives) + "·".repeat(snapshot.maxLives - snapshot.lives)} />
      </div>
      <div className="hud-panel compact">
        <div className="hud-label">FPS</div>
        <div className="hud-value">{Math.round(snapshot.fps)}</div>
      </div>
    </aside>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="hud-panel">
      <div className="hud-label">{label}</div>
      <div className="hud-value">{value}</div>
    </div>
  );
}
