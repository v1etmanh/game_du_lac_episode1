/**
 * Đàn Bầu audio engine
 * Simulates monochord string + resonator with pitch-bend via cần đàn.
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

/**
 * Play a note with live pitch-bend control.
 * Returns a controller object { setBend(amount), stop() }
 *
 * @param {number} baseFreq  - base frequency in Hz
 * @param {number} duration  - maximum duration in seconds
 */
export function playNote(baseFreq, duration = 2) {
  const ac = getCtx();
  if (ac.state === 'suspended') ac.resume();

  const t = ac.currentTime;

  // ── Oscillator chain mimicking đàn bầu timbre ──
  // Primary: slight detuned pair for "string" warmth
  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(baseFreq, t);
  osc2.frequency.setValueAtTime(baseFreq * 1.003, t); // slight detune

  // Harmonic overtone (2nd partial — đàn bầu is rich in harmonics)
  const osc3 = ac.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(baseFreq * 2.01, t);

  // Gain for each partial
  const g1 = ac.createGain();
  const g2 = ac.createGain();
  const g3 = ac.createGain();
  g1.gain.setValueAtTime(0.45, t);
  g2.gain.setValueAtTime(0.35, t);
  g3.gain.setValueAtTime(0.15, t);

  // Master envelope  (pluck attack + long decay — monochord feel)
  const master = ac.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(0.6, t + 0.015);
  master.gain.exponentialRampToValueAtTime(0.35, t + 0.25);
  master.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.8);

  // Soft highpass — remove mud
  const hpf = ac.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 180;

  // Wire up
  osc1.connect(g1).connect(master);
  osc2.connect(g2).connect(master);
  osc3.connect(g3).connect(master);
  master.connect(hpf).connect(ac.destination);

  osc1.start(t);
  osc2.start(t);
  osc3.start(t);
  osc1.stop(t + duration + 1.2);
  osc2.stop(t + duration + 1.2);
  osc3.stop(t + duration + 1.2);

  // ── Bend control ──
  // bendAmount: -1 (full down) … 0 (neutral) … +1 (full up)
  // Maps to ±1 semitone range (can widen)
  const SEMITONE = Math.pow(2, 1 / 12);
  const MAX_BEND_RATIO = SEMITONE - 1; // ~0.0595

  let currentBend = 0;

  function setBend(amount) {
    currentBend = Math.max(-1, Math.min(1, amount));
    const ratio = 1 + currentBend * MAX_BEND_RATIO;
    const now = ac.currentTime;
    osc1.frequency.setTargetAtTime(baseFreq * ratio, now, 0.04);
    osc2.frequency.setTargetAtTime(baseFreq * ratio * 1.003, now, 0.04);
    osc3.frequency.setTargetAtTime(baseFreq * ratio * 2.01, now, 0.04);
  }

  function stop() {
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.08);
  }

  return { setBend, stop };
}

/** Resume AudioContext on first user gesture */
export function resumeAudio() {
  getCtx().resume();
}
