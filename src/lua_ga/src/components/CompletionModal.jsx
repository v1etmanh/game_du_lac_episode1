import React from "react";

function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function CompletionModal({ snapshot, onReset }) {
  if (!snapshot?.completed) {
    return null;
  }

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="completionModal">
        <p className="eyebrow">Complete</p>
        <h2 id="completion-title">All chickens are secured</h2>
        <div className="summaryLine">
          <span>Time</span>
          <strong>{formatTime(snapshot.elapsedTime)}</strong>
        </div>
        <div className="summaryLine">
          <span>Grain drops</span>
          <strong>{snapshot.grainDropsUsed}</strong>
        </div>
        <div className="summaryLine">
          <span>Panics</span>
          <strong>{snapshot.stats.panicCount}</strong>
        </div>
        <button type="button" onClick={onReset}>
          Run again
        </button>
      </div>
    </div>
  );
}
