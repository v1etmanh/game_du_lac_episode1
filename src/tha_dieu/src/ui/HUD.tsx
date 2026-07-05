import type { GameSnapshot } from "../engine/types";

interface HUDProps {
  snapshot: GameSnapshot;
}

export function HUD({ snapshot }: HUDProps) {
  return (
    <aside className="hud" aria-live="polite">
      {snapshot.completed && <div className="completion-banner">Bạn đã hoàn thành thử thách!</div>}
      <div className="hud-group">
        <Metric label="Wind" value={`${snapshot.windDirectionDegrees.toFixed(0)} deg`} />
        <Metric label="Strength" value={`${snapshot.windStrength.toFixed(2)}`} />
        <Metric label="Rope" value={`${snapshot.ropeLength.toFixed(0)} m`} />
        <Metric label="Distance" value={`${Math.floor(snapshot.distance)} / ${snapshot.goalDistance} m`} />
        <Metric label="Notes" value={`${snapshot.noteCount}`} />
        <Metric label="Lift" value={snapshot.windLiftTimer > 0 ? `${snapshot.windLiftTimer.toFixed(1)} s` : "Ready"} />
        <Metric label="Lives" value={"🪁".repeat(snapshot.lives) + "·".repeat(snapshot.maxLives - snapshot.lives)} />
      </div>
      <div className="hud-panel compact">
        <div className="hud-label">FPS</div>
        <div className="hud-value">{Math.round(snapshot.fps)}</div>
      </div>
      {snapshot.jumpChargeLevel > 0 && (
        <div className={`jump-charge-panel${snapshot.readyForHighJump ? " ready" : ""}`}>
          <div className="hud-label">
            {snapshot.readyForHighJump ? "Sẵn sàng nhảy cao!" : "Giữ chuột phải để tích lực…"}
          </div>
          <div className="jump-charge-track">
            <div
              className="jump-charge-fill"
              style={{ width: `${Math.round(snapshot.jumpChargeLevel * 100)}%` }}
            />
          </div>
        </div>
      )}
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
