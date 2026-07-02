import { useRef, useEffect, useCallback } from 'react';
import {
  DEMO_SONG, SONG_END_TIME, KEY_MAP, GESTURE,
  HIT_WINDOW_PERFECT, HIT_WINDOW_GOOD,
  SPRING_SPEED, CIRCLE_RADIUS, GESTURE_TOLERANCE,
} from './gameData.js';
import { playNote, resumeAudio } from './audioEngine.js';

/**
 * Returns refs/callbacks for the game loop.
 * @param {function} onStateChange - called with game state snapshots for React rendering
 */
export function useGameEngine(onStateChange) {
  // ── Mutable game state (not React state — lives in refs for rAF) ──
  const songTimeRef    = useRef(-2);       // -2 = countdown before song
  const playingRef     = useRef(false);
  const lastTimestampRef = useRef(null);

  const notesRef       = useRef([...DEMO_SONG].map(n => ({ ...n, hit: false, missed: false })));
  const activeKeysRef  = useRef(new Set());
  const hitResultsRef  = useRef([]);       // { key, perfect, alpha }

  // Joystick state
  const leverRef       = useRef({ x: 0, y: 0 });   // normalised -1..1
  const mouseDownRef   = useRef(false);
  const circleCenterRef = useRef({ x: 0, y: 0 });  // set by canvas layout

  // Active note being "held"
  const activeNoteRef    = useRef(null);  // note currently in gesture phase
  const noteControlRef   = useRef(null);  // audioEngine controller { setBend, stop }
  const gestureStartRef  = useRef(0);     // songTime when gesture started
  const gestureSuccessRef = useRef(false);

  const rafRef = useRef(null);

  const notify = useCallback(() => {
    onStateChange({
      songTime:       songTimeRef.current,
      playing:        playingRef.current,
      notes:          notesRef.current,
      activeKeys:     new Set(activeKeysRef.current),
      hitResults:     [...hitResultsRef.current],
      lever:          { ...leverRef.current },
      activeNote:     activeNoteRef.current,
      gestureSuccess: gestureSuccessRef.current,
    });
  }, [onStateChange]);

  // ── Main loop ──
  const tick = useCallback(function tickFrame(timestamp) {
    if (!playingRef.current) return;

    const dt = lastTimestampRef.current
      ? Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05)
      : 0;
    lastTimestampRef.current = timestamp;

    songTimeRef.current += dt;
    const t = songTimeRef.current;

    // ── Spring return when mouse released ──
    if (!mouseDownRef.current) {
      const lx = leverRef.current.x;
      const ly = leverRef.current.y;
      const len = Math.sqrt(lx * lx + ly * ly);
      if (len > 0.001) {
        const step = SPRING_SPEED * dt;
        if (step >= len) {
          leverRef.current = { x: 0, y: 0 };
        } else {
          leverRef.current = {
            x: lx - (lx / len) * step,
            y: ly - (ly / len) * step,
          };
        }
      }
    }

    // ── Check for missed notes (passed hit window) ──
    notesRef.current.forEach(note => {
      if (!note.hit && !note.missed && t > note.time + HIT_WINDOW_GOOD + 0.1) {
        note.missed = true;
      }
    });

    // ── Update active gesture ──
    if (activeNoteRef.current) {
      const note = activeNoteRef.current;
      const elapsed = t - gestureStartRef.current;
      const progress = Math.min(elapsed / note.duration, 1);

      // Compute target lever position for this gesture
      const targetLever = getTargetLever(note.gesture, progress);

      // Check if player is within tolerance
      const dx = leverRef.current.x - targetLever.x;
      const dy = leverRef.current.y - targetLever.y;
      const err = Math.sqrt(dx * dx + dy * dy);
      gestureSuccessRef.current = err < GESTURE_TOLERANCE;

      // Live pitch bend
      if (noteControlRef.current) {
        // bend amount: y axis, inverted (up = positive bend)
        const bend = -leverRef.current.y;
        noteControlRef.current.setBend(bend * 0.8);
      }

      // End gesture
      if (progress >= 1) {
        if (noteControlRef.current) noteControlRef.current.stop();
        activeNoteRef.current   = null;
        noteControlRef.current  = null;
        gestureSuccessRef.current = false;
      }
    }

    // ── Fade hit results ──
    hitResultsRef.current = hitResultsRef.current
      .map(r => ({ ...r, alpha: r.alpha - dt * 1.8 }))
      .filter(r => r.alpha > 0);

    // ── Song end ──
    if (t >= SONG_END_TIME) {
      playingRef.current = false;
    }

    notify();
    rafRef.current = requestAnimationFrame(tickFrame);
  }, [notify]);

  // ── Key press ──
  const handleKeyDown = useCallback((key) => {
    if (!playingRef.current) return;
    if (activeKeysRef.current.has(key)) return;
    if (!KEY_MAP[key]) return;
    resumeAudio();

    activeKeysRef.current.add(key);

    const t = songTimeRef.current;

    // Find closest unhit note matching this key
    let best = null;
    let bestDt = Infinity;
    notesRef.current.forEach(note => {
      if (note.hit || note.missed) return;
      if (note.key !== key) return;
      const diff = Math.abs(t - note.time);
      if (diff < bestDt) { bestDt = diff; best = note; }
    });

    if (best && bestDt <= HIT_WINDOW_GOOD) {
      best.hit = true;
      const perfect = bestDt <= HIT_WINDOW_PERFECT;

      hitResultsRef.current.push({ key, perfect, alpha: 1 });

      // Start gesture phase
      activeNoteRef.current   = best;
      gestureStartRef.current = t;
      gestureSuccessRef.current = false;

      // Play sound
      const ctrl = playNote(KEY_MAP[key].freq, best.duration + 0.8);
      noteControlRef.current = ctrl;
    }

    notify();
  }, [notify]);

  const handleKeyUp = useCallback((key) => {
    activeKeysRef.current.delete(key);
    notify();
  }, [notify]);

  const updateLeverXY = useCallback((clientX, clientY, canvasEl) => {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;
    const cc = circleCenterRef.current;
    let dx = mx - cc.x;
    let dy = my - cc.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > CIRCLE_RADIUS) {
      dx = (dx / len) * CIRCLE_RADIUS;
      dy = (dy / len) * CIRCLE_RADIUS;
    }
    leverRef.current = { x: dx / CIRCLE_RADIUS, y: dy / CIRCLE_RADIUS };
  }, []);

  const updateLever = useCallback((e, canvasEl) => {
    updateLeverXY(e.clientX, e.clientY, canvasEl);
  }, [updateLeverXY]);

  const setCircleCenter = useCallback((center) => {
    circleCenterRef.current = center;
  }, []);

  // ── Mouse ──
  const handleMouseDown = useCallback((e, canvasEl) => {
    resumeAudio();
    mouseDownRef.current = true;
    updateLever(e, canvasEl);
  }, [updateLever]);

  const handleMouseMove = useCallback((e, canvasEl) => {
    if (!mouseDownRef.current) return;
    updateLever(e, canvasEl);
  }, [updateLever]);

  const handleMouseUp = useCallback(() => {
    mouseDownRef.current = false;
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e, canvasEl) => {
    resumeAudio();
    mouseDownRef.current = true;
    const touch = e.touches[0];
    updateLeverXY(touch.clientX, touch.clientY, canvasEl);
  }, [updateLeverXY]);

  const handleTouchMove = useCallback((e, canvasEl) => {
    if (!mouseDownRef.current) return;
    const touch = e.touches[0];
    updateLeverXY(touch.clientX, touch.clientY, canvasEl);
  }, [updateLeverXY]);

  const handleTouchEnd = useCallback(() => {
    mouseDownRef.current = false;
  }, []);

  // ── Start / Reset ──
  const startGame = useCallback(() => {
    notesRef.current     = [...DEMO_SONG].map(n => ({ ...n, hit: false, missed: false }));
    songTimeRef.current  = -1.5;
    playingRef.current   = true;
    activeNoteRef.current = null;
    noteControlRef.current = null;
    hitResultsRef.current = [];
    lastTimestampRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    notify();
  }, [tick, notify]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    startGame,
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setCircleCenter,
    leverRef,
    circleCenterRef,
    activeNoteRef,
    gestureSuccessRef,
    songTimeRef,
    playingRef,
    notesRef,
    activeKeysRef,
    hitResultsRef,
  };
}

/** Get normalised target lever position for a gesture at a given progress 0..1 */
function getTargetLever(gesture, progress) {
  if (gesture === GESTURE.HOLD) return { x: 0, y: 0 };

  const targetY = gesture === GESTURE.UP   ? -0.72
               : gesture === GESTURE.DOWN  ?  0.72
               : 0;

  // Ease in to target over first 40%, hold, ease back last 20%
  const y = progress < 0.4
    ? targetY * (progress / 0.4)
    : progress < 0.8
      ? targetY
      : targetY * (1 - (progress - 0.8) / 0.2);
  return { x: 0, y };
}
