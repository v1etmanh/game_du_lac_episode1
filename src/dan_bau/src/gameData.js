// Keyboard keys used by the dan bau string.
export const PLAY_KEYS = ['a', 's', 'd', 'j', 'k', 'l'];

// Key -> note name mapping.
export const KEY_MAP = {
  a: { note: 'C4', label: 'C', freq: 261.63 },
  s: { note: 'D4', label: 'D', freq: 293.66 },
  d: { note: 'E4', label: 'E', freq: 329.63 },
  j: { note: 'G4', label: 'G', freq: 392.00 },
  k: { note: 'A4', label: 'A', freq: 440.00 },
  l: { note: 'C5', label: 'C5', freq: 523.25 },
};

// Gesture types.
export const GESTURE = {
  HOLD: 'hold',
  UP: 'up',
  DOWN: 'down',
};

// BPM and timing.
export const BPM = 72;
export const BEAT_SEC = 60 / BPM;
export const SCROLL_SPEED = 200;

// Hit window in seconds.
export const HIT_WINDOW_PERFECT = 0.12;
export const HIT_WINDOW_GOOD = 0.22;

// Joystick.
export const CIRCLE_RADIUS = 80;
export const SPRING_SPEED = 3.5;

// Gesture tolerance, normalized 0..1.
export const GESTURE_TOLERANCE = 0.30;

// Demo song. `time` is when the note reaches the pluck line.
export const DEMO_SONG = [
  { id: 0, time: 2.0, key: 'a', gesture: GESTURE.HOLD, duration: 0.8 },
  { id: 1, time: 3.2, key: 'd', gesture: GESTURE.HOLD, duration: 0.8 },
  { id: 2, time: 4.4, key: 's', gesture: GESTURE.UP, duration: 1.2 },
  { id: 3, time: 6.0, key: 'j', gesture: GESTURE.HOLD, duration: 0.8 },
  { id: 4, time: 7.2, key: 'k', gesture: GESTURE.DOWN, duration: 1.2 },
  { id: 5, time: 9.0, key: 'd', gesture: GESTURE.UP, duration: 1.4 },
  { id: 6, time: 11.0, key: 'a', gesture: GESTURE.DOWN, duration: 1.2 },
  { id: 7, time: 13.0, key: 'l', gesture: GESTURE.UP, duration: 1.6 },
];

export const SONG_END_TIME = 16.0;
