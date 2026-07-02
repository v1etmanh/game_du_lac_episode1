import {
  HIT_WINDOW_PERFECT, HIT_WINDOW_GOOD,
  NODE_MAP,
} from '../constants/layout.js';
import { audioEngine } from './audioEngine.js';
import { BackingTrackPlayer } from './BackingTrackPlayer.js';

function getMultiplier(streak) {
  if (streak >= 10) return 2.0;
  if (streak >= 5)  return 1.5;
  return 1.0;
}

export function createGameEngine(song, onUpdate, onEnd) {
  let rafId = null;
  let wallStart = null;
  let state = null;
  let backing = null;
  let usingBackingClock = false;
  let runId = 0;
  let pauseStartWall = null;

  const songNotes = song.notes ?? song;
  const songDuration = song.duration ?? Math.max(...songNotes.map(n => n.time + n.duration), 0);

  function buildState() {
    return {
      songTime:     0,
      duration:     songDuration,
      playing:      true,
      paused:       false,
      notes:        songNotes.map(n => ({ ...n, hit: false, missed: false, hitType: null })),
      score:        0,
      streak:       0,
      maxStreak:    0,
      hitCount:     0,
      missCount:    0,
      perfectCount: 0,
      bendSemitones: 0,
      flash:        null,   // { text, x, y, t }
      ripples:      [],     // [{ x, y, t, key }]
      stringVib:    0,      // vibration amplitude 0-1
      stringVibT:   -999,
    };
  }

  async function start() {
    stop();
    const currentRun = ++runId;
    state     = buildState();
    wallStart = performance.now();
    usingBackingClock = false;
    backing = song.backingTrack ? new BackingTrackPlayer(song.backingTrack) : null;
    backing?.setVolume(0.42);

    onUpdate({ ...state, ripples: [...state.ripples] });

    if (backing) {
      try {
        await backing.play();
        if (currentRun !== runId) return;
        usingBackingClock = true;
      } catch (err) {
        if (currentRun !== runId) return;
        console.warn('Backing track could not autoplay; using fallback clock.', err);
        wallStart = performance.now();
      }
    }

    if (currentRun !== runId) return;
    loop();
  }

  function getSongTime() {
    if (usingBackingClock && backing) return backing.getCurrentTimeMs() / 1000;
    return (performance.now() - wallStart) / 1000;
  }

  function stopPlayback() {
    runId++;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    backing?.stop();
    backing = null;
    usingBackingClock = false;
    audioEngine.stopAll();
  }

  function finishGame() {
    if (!state?.playing) return;

    state.playing = false;
    stopPlayback();
    onUpdate({ ...state, ripples: [...state.ripples] });

    const total = state.notes.length;
    const acc = total > 0 ? Math.round((state.hitCount / total) * 100) : 0;
    onEnd({
      score:        state.score,
      accuracy:     acc,
      hitCount:     state.hitCount,
      missCount:    state.missCount,
      perfectCount: state.perfectCount,
      maxStreak:    state.maxStreak,
      total,
    });
  }

  function loop() {
    state.songTime = getSongTime();

    const t = state.songTime;

    // Expire old ripples
    state.ripples = state.ripples.filter(r => t - r.t < 0.6);

    // String vibration decay
    if (t - state.stringVibT > 0.5) {
      state.stringVib = Math.max(0, state.stringVib - 0.04);
    }

    // Check missed notes
    for (const note of state.notes) {
      if (!note.hit && !note.missed && t > note.time + HIT_WINDOW_GOOD) {
        note.missed    = true;
        state.streak   = 0;
        state.missCount++;
        const nx = NODE_MAP[note.key]?.x ?? 450;
        state.flash = { text: 'MISS', x: nx, y: 280, t };
      }
    }

    onUpdate({ ...state, ripples: [...state.ripples] });

    if (t < songDuration) {
      rafId = requestAnimationFrame(loop);
    } else {
      finishGame();
    }
  }

  function handleKeyDown(key) {
    if (!state?.playing || state.paused) return;
    audioEngine.resume();

    const t = state.songTime;
    const targetNote = state.notes.find(n =>
      !n.hit && !n.missed &&
      n.key === key &&
      Math.abs(n.time - t) <= HIT_WINDOW_GOOD
    );

    if (!targetNote) {
      const nx = NODE_MAP[key]?.x ?? 450;
      state.streak = 0;
      state.missCount++;
      state.flash = { text: 'MISS', x: nx, y: 280, t };
      finishGame();
      return;
    }

    if (targetNote) {
      const dt      = Math.abs(targetNote.time - t);
      const hitType = dt <= HIT_WINDOW_PERFECT ? 'PERFECT' : 'GOOD';
      const pts     = hitType === 'PERFECT' ? 100 : 50;
      const mult    = getMultiplier(state.streak);

      targetNote.hit     = true;
      targetNote.hitType = hitType;
      state.score       += Math.round(pts * mult);
      state.streak++;
      state.maxStreak    = Math.max(state.maxStreak, state.streak);
      state.hitCount++;
      if (hitType === 'PERFECT') state.perfectCount++;

      const nx = NODE_MAP[key]?.x ?? 450;
      state.flash      = { text: hitType, x: nx, y: 280, t };
      state.stringVib  = 1;
      state.stringVibT = t;
      state.ripples.push({ x: nx, y: 348, t, key });
    }

    audioEngine.playNote(targetNote, state.bendSemitones);
  }

  function setBend(semitones) {
    if (!state) return;
    state.bendSemitones = Math.max(-1.5, Math.min(1.5, semitones));
    audioEngine.setBendAll(state.bendSemitones);
  }

  function pause() {
    if (!state?.playing || state.paused) return;
    state.paused = true;
    pauseStartWall = performance.now();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    backing?.pause();
    onUpdate({ ...state, ripples: [...state.ripples] });
  }

  function resume() {
    if (!state?.playing || !state.paused) return;
    state.paused = false;
    if (pauseStartWall !== null && !usingBackingClock) {
      wallStart += performance.now() - pauseStartWall;
    }
    pauseStartWall = null;
    backing?.resume();
    loop();
    onUpdate({ ...state, ripples: [...state.ripples] });
  }

  function stop() {
    stopPlayback();
  }

  function getState() { return state; }

  return { start, stop, pause, resume, handleKeyDown, setBend, getState };
}
