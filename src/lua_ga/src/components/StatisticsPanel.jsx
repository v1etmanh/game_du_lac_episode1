import React from "react";

function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function StatisticsPanel({ snapshot }) {
  const stats = snapshot?.stats ?? {};
  const chickens = snapshot?.chickens ?? [];

  return (
    <aside className="panel statsPanel">
      <section>
        <h2>Run Stats</h2>
        <div className="metricGrid">
          <Metric label="Time" value={formatTime(snapshot?.elapsedTime)} />
          <Metric label="Secured" value={`${snapshot?.securedCount ?? 0}/${snapshot?.chickenCount ?? 0}`} />
          <Metric label="Drops left" value={snapshot?.grainDropsRemaining ?? 0} />
          <Metric
            label="Next drop"
            value={(snapshot?.grainDropsRemaining ?? 0) > 0 ? "Ready" : `${(snapshot?.grainRechargeRemaining ?? 0).toFixed(1)}s`}
          />
          <Metric label="Grain left" value={(snapshot?.grainRemaining ?? 0).toFixed(0)} />
          <Metric label="Coop" value={snapshot?.coopClosed ? "Closed" : "Open"} />
          <Metric
            label="Sprint"
            value={
              snapshot?.playerSprint?.active
                ? `${snapshot.playerSprint.activeTime.toFixed(1)}s`
                : snapshot?.playerSprint?.cooldownRemaining > 0
                  ? `${snapshot.playerSprint.cooldownRemaining.toFixed(1)}s`
                  : "Ready"
            }
          />
          <Metric label="Claps" value={stats.clapsUsed ?? 0} />
          <Metric label="Panics" value={stats.panicCount ?? 0} />
          <Metric label="Obstacle hits" value={stats.obstacleCollisions ?? 0} />
          <Metric label="Coop bails" value={stats.coopBailed ?? 0} />
          <Metric label="Player path" value={`${Math.round(stats.playerDistance ?? 0)}px`} />
          <Metric label="Avg chicken path" value={`${Math.round(stats.averageChickenDistance ?? 0)}px`} />
        </div>
      </section>

      <section>
        <h2>Flock State</h2>
        <div className="chickenList">
          {chickens.map((chicken) => (
            <div className="chickenRow" key={chicken.id}>
              <span className={chicken.type === "rooster" ? "dot rooster" : "dot"} />
              <span>{chicken.id}</span>
              <strong>{chicken.state}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="helpBox">
        <h2>Controls</h2>
        <p>WASD or arrows move. Shift sprints. Space drops grain. L opens or closes the coop. K claps. P pauses.</p>
      </section>
    </aside>
  );
}
