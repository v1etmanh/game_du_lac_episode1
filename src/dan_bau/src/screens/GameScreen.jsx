import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import { audioEngine }   from '../engine/audioEngine.js';
import { beoDatMayTroiFullBeatmap, SONG_TITLE } from '../engine/songData.js';
import { drawInstrument }  from '../canvas/drawInstrument.js';
import { drawNotes }       from '../canvas/drawNotes.js';
import { drawHUD }         from '../canvas/drawHUD.js';
import { drawBackground }  from '../canvas/drawBackground.js';
import { CANVAS_W, CANVAS_H } from '../constants/layout.js';

export default function GameScreen({ onGameEnd }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);
  const activeKeys = useRef(new Set());
  const [ready, setReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStateUpdate = useCallback((s) => {
    stateRef.current = s;
  }, []);

  const handleEnd = useCallback((stats) => {
    onGameEnd(stats);
  }, [onGameEnd]);

  const { start, stop, pause, resume, handleKeyDown, handleMouseDown, handleMouseMove, handleMouseUp }
    = useGameEngine(beoDatMayTroiFullBeatmap, handleStateUpdate, handleEnd);

  const handleRestart = useCallback(() => {
    audioEngine.stopAll();
    setIsPaused(false);
    start();
  }, [start]);

  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      resume();
      setIsPaused(false);
    } else {
      pause();
      setIsPaused(true);
    }
  }, [isPaused, pause, resume]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const frame = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const songTime = s?.songTime ?? 0;
      drawBackground(ctx, songTime);

      if (s) {
        drawInstrument(ctx, s.bendSemitones, activeKeys.current, s.songTime);
        drawNotes(ctx, s.songTime, s.notes, s.ripples, s.flash);
        drawHUD(ctx, s, SONG_TITLE);
      }
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Start game + audio
  useEffect(() => {
    let cancelled = false;

    audioEngine.init().then(async () => {
      if (cancelled) return;
      await start();
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [start, stop]);

  // Keyboard
  useEffect(() => {
    const VALID = new Set(['a','s','d','j','k','l']);
    const onDown = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (!VALID.has(k)) return;
      activeKeys.current.add(k);
      handleKeyDown(k);
    };
    const onUp = (e) => {
      activeKeys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [handleKeyDown]);

  const onMouseDown = useCallback((e) => handleMouseDown(e, canvasRef.current, activeKeys), [handleMouseDown]);
  const onMouseMove = useCallback((e) => handleMouseMove(e), [handleMouseMove]);
  const onMouseUp   = useCallback(() => handleMouseUp(), [handleMouseUp]);

  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch) handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY }, canvasRef.current, activeKeys);
  }, [handleMouseDown]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch) handleMouseMove({ clientY: touch.clientY });
  }, [handleMouseMove]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <div className="screen game-screen">
      <div className="game-frame">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas"
          style={{ touchAction: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 15, display: 'flex', gap: 8 }}>
          <button
            onClick={handlePauseToggle}
            style={{
              background: 'rgba(10,5,2,0.88)',
              border: '1px solid rgba(196,149,58,0.55)',
              borderRadius: 4,
              color: '#c4953a',
              fontFamily: "'Merriweather', serif",
              fontSize: 11,
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0d060'}
            onMouseLeave={e => e.currentTarget.style.color = '#c4953a'}
          >
            {isPaused ? '▶ Tiếp tục' : '⏸ Dừng'}
          </button>
          <button
            onClick={handleRestart}
            style={{
              background: 'rgba(10,5,2,0.88)',
              border: '1px solid rgba(196,149,58,0.55)',
              borderRadius: 4,
              color: '#c4953a',
              fontFamily: "'Merriweather', serif",
              fontSize: 11,
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0d060'}
            onMouseLeave={e => e.currentTarget.style.color = '#c4953a'}
          >
            ↺ Chơi lại
          </button>
        </div>
        {!ready && (
          <div className="loading-overlay">
            <span>Đang tải âm thanh...</span>
          </div>
        )}
      </div>
    </div>
  );
}
