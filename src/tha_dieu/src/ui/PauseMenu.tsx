interface PauseMenuProps {
  paused: boolean;
  crashed: boolean;
  completed: boolean;
  distance: number;
  onResume: () => void;
  onRestart: () => void;
  onExit?: () => void;
}

export function PauseMenu({ paused, crashed, completed, distance, onResume, onRestart, onExit }: PauseMenuProps) {
  if (!paused && !crashed && !completed) {
    return null;
  }

  const title = completed ? "Đã bay xong chặng đường!" : crashed ? "Flight Lost" : "Paused";

  return (
    <section className="pause-backdrop" role="dialog" aria-modal="true">
      <div className="pause-panel">
        <h1 className="pause-title">{title}</h1>
        <p className="pause-distance">{Math.floor(distance)} m</p>
        <div className="pause-actions">
          {completed && onExit ? (
            <button className="pause-button" type="button" onClick={onExit}>
              Quay lại bản đồ
            </button>
          ) : (
            <>
              <button className="pause-button secondary" type="button" onClick={onRestart}>
                Restart
              </button>
              {!crashed && (
                <button className="pause-button" type="button" onClick={onResume}>
                  Resume
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
