import { useRef, useCallback } from 'react';
import { createGameEngine } from '../engine/gameEngine.js';
import {
  SPRING_SPEED, MAX_BEND_SEMITONES,
  NODES, TAP_BTN_Y, TAP_BTN_R, CANVAS_W, CANVAS_H,
} from '../constants/layout.js';

export function useGameEngine(song, onStateUpdate, onGameEnd) {
  const engineRef  = useRef(null);
  const mouseRef   = useRef({ down: false, startY: 0, currentBend: 0 });
  const canvasRef  = useRef(null);

  const start = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = createGameEngine(song, onStateUpdate, onGameEnd);
    return engineRef.current.start();
  }, [song, onStateUpdate, onGameEnd]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const handleKeyDown = useCallback((key) => {
    engineRef.current?.handleKeyDown(key);
  }, []);

  const handleMouseDown = useCallback((e, canvas, activeKeysRef) => {
    canvasRef.current = canvas;

    // Map client coords to canvas coords
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;

    // Detect tap on a button
    for (const node of NODES) {
      if (Math.hypot(cx - node.x, cy - TAP_BTN_Y) <= TAP_BTN_R + 8) {
        activeKeysRef?.current.add(node.key);
        engineRef.current?.handleKeyDown(node.key);
        setTimeout(() => activeKeysRef?.current.delete(node.key), 150);
        return;
      }
    }

    // Otherwise start string bend
    mouseRef.current.down   = true;
    mouseRef.current.startY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!mouseRef.current.down) return;
    const dy   = mouseRef.current.startY - e.clientY; // up = positive
    const semi = (dy / 120) * MAX_BEND_SEMITONES;     // 120px = full range
    const clamped = Math.max(-MAX_BEND_SEMITONES, Math.min(MAX_BEND_SEMITONES, semi));
    mouseRef.current.currentBend = clamped;
    engineRef.current?.setBend(clamped);
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.down = false;
    // Spring back to zero
    const release = () => {
      const cur = mouseRef.current.currentBend;
      if (Math.abs(cur) < 0.02) {
        mouseRef.current.currentBend = 0;
        engineRef.current?.setBend(0);
        return;
      }
      const next = cur * (1 - SPRING_SPEED * 0.016);
      mouseRef.current.currentBend = next;
      engineRef.current?.setBend(next);
      requestAnimationFrame(release);
    };
    requestAnimationFrame(release);
  }, []);

  return { start, stop, pause, resume, handleKeyDown, handleMouseDown, handleMouseMove, handleMouseUp };
}
