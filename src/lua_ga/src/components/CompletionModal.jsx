import React from "react";

function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function CompletionModal({ snapshot, onReset }) {
  if (!snapshot?.completed && !snapshot?.failed) {
    return null;
  }

  const failed = snapshot.failed;
  const title = failed
    ? "Thử thách thất bại"
    : "All chickens are secured";
  const reason = snapshot.failureReason === "time"
    ? "Hết 8 phút mà chưa đưa toàn bộ gà vào chuồng"
    : "Người chơi đã mất hết 5 mạng";

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="completionModal">
        <p className="eyebrow">{failed ? "Failed" : "Complete"}</p>
        <h2 id="completion-title">{title}</h2>
        {failed && (
          <div className="summaryLine">
            <span>Lý do</span>
            <strong>{reason}</strong>
          </div>
        )}
        <div className="summaryLine">
          <span>Time</span>
          <strong>{formatTime(snapshot.elapsedTime)}</strong>
        </div>
        <div className="summaryLine">
          <span>Lives</span>
          <strong>{snapshot.playerLives}/{snapshot.maxPlayerLives}</strong>
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
          Try again
        </button>
      </div>
    </div>
  );
}
