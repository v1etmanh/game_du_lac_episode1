import type { GameSnapshot } from "../engine/types";

interface HUDProps {
  snapshot: GameSnapshot;
  onExit?: () => void;
}

export function HUD({ snapshot, onExit }: HUDProps) {
  const ropeStatus = getRopeStatus(snapshot);

  return (
    <aside className="hud" aria-live="polite">
      {onExit && (
        <button type="button" className="hud-exit-btn" onClick={onExit}>
          ← Quay lại làng
        </button>
      )}
      {snapshot.completed && <div className="completion-banner">Bạn đã hoàn thành thử thách!</div>}
      <div className="hud-group">
        <Metric label="Score" value={`${snapshot.score}`} />
        <Metric label="Wind" value={`${snapshot.windDirectionDegrees.toFixed(0)} deg`} />
        <Metric label="Strength" value={`${snapshot.windStrength.toFixed(2)}`} />
        <Metric label="Rope" value={`${snapshot.ropeLength.toFixed(0)} m`} />
        <Metric label="Rope Ctrl" value={ropeStatus} />
        <Metric label="Distance" value={`${Math.floor(snapshot.distance)} / ${snapshot.goalDistance} m`} />
        <Metric label="Notes" value={`${snapshot.noteCount}`} />
        <Metric label="Pressure" value={`${Math.round(snapshot.difficulty * 100)}%`} />
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
            {snapshot.readyForHighJump ? "Sẵn sàng nhảy cao!" : "Giữ chuột phải để tích lực..."}
          </div>
          <div className="jump-charge-track">
            <div
              className="jump-charge-fill"
              style={{ width: `${Math.round(snapshot.jumpChargeLevel * 100)}%` }}
            />
          </div>
        </div>
      )}
      {snapshot.ropeCommand && (
        <div className={`rope-state-panel${snapshot.ropeLimit ? " blocked" : ""}`}>
          <div className="hud-label">{snapshot.ropeLimit ? "Day bi chan" : "Day dang phan hoi"}</div>
          <div className="hud-value">{ropeStatus}</div>
        </div>
      )}
      {snapshot.stallWarning > 0.15 && (
        <div className={`stall-panel${snapshot.stallPenaltyActive ? " active" : ""}`}>
          <div className="hud-label">{snapshot.stallPenaltyActive ? "Đang trừ điểm" : "Giữ nhịp chạy"}</div>
          <div className="stall-track">
            <div className="stall-fill" style={{ width: `${Math.round(snapshot.stallWarning * 100)}%` }} />
          </div>
        </div>
      )}
    </aside>
  );
}

function getRopeStatus(snapshot: GameSnapshot): string {
  if (snapshot.ropeLimit === "min") {
    return "Ngan het";
  }
  if (snapshot.ropeLimit === "max") {
    return "Dai het";
  }
  if (snapshot.ropeCommand === "shorten") {
    return `Thu ${Math.abs(snapshot.ropeSpeed).toFixed(0)}`;
  }
  if (snapshot.ropeCommand === "release") {
    return `Tha ${Math.abs(snapshot.ropeSpeed).toFixed(0)}`;
  }
  return "Nha";
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
