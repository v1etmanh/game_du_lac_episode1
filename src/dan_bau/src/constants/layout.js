export const CANVAS_W = 900;
export const CANVAS_H = 600;
export const HUD_H    = 44;

// Instrument body bounds (used for label placement; 3D geometry is in drawInstrument.js)
export const BODY_X1 = 36;
export const BODY_X2 = 866;
export const BODY_Y1 = 295;    // top surface back edge
export const BODY_Y2 = 434;    // front face bottom — label baseline
export const STRING_Y = 342;   // center of top surface (game hit-detection y)

// Cần đàn (tuning rod)
export const CAN_DAN_X     = 840;
export const CAN_DAN_LEN   = 110;
export const MAX_BEND_ANGLE = 0.38; // radians at ±1.5 semitones

// Instrument body PNG — replaces the procedural wood/gourd render.
// dan-bau image is 722x346; measured by scanning its pixels (badge/string-dot
// centroids, rod silhouette bounds) and mapped onto the 900x600 canvas so the
// string row lands on STRING_Y, matching the old procedural layout.
export const INSTRUMENT_IMG_SRC   = '/danbau-removebg-preview.png';
export const INSTRUMENT_NATURAL_W = 722;
export const INSTRUMENT_NATURAL_H = 346;
export const INSTRUMENT_DEST_X    = 28;
export const INSTRUMENT_DEST_Y    = 99.7;
export const INSTRUMENT_DEST_W    = 857;
export const INSTRUMENT_DEST_H    = 410.7;

// The image bakes in its own cần đàn (rod) at a fixed angle — erased (in
// natural image pixel space) so drawCanDan() can draw it rotating instead.
export const ROD_ERASE_RECT = { x: 645, y: 0, w: 77, h: 158 };

// Cần đàn attach point (canvas space) — top of the leftover mounting stub
// after the erase, so the procedural rod continues seamlessly from the image.
export const ROD_ATTACH_X     = 815.7;
export const ROD_ATTACH_Y     = 287.2;
export const ROD_LEN          = 144;
export const ROD_ANGLE_OFFSET = 0.195; // radians from straight-up, matches the erased rod's lean

// Note name label row, below the instrument image's bottom edge.
export const NOTE_LABEL_Y = 441;
// Drop-shadow row, just under the instrument image's visible (opaque) content.
export const INSTRUMENT_SHADOW_Y = 436;

// Harmonic nodes along the string — x measured from the badge/string-dot
// centroids baked into the instrument image, mapped to canvas space.
export const NODES = [
  { key: 'a', label: 'A', note: 'F4', x: 195.3 },
  { key: 's', label: 'S', note: 'G4', x: 308.1 },
  { key: 'd', label: 'D', note: 'A4', x: 418.5 },
  { key: 'j', label: 'J', note: 'C5', x: 534.8 },
  { key: 'k', label: 'K', note: 'D5', x: 647.6 },
  { key: 'l', label: 'L', note: 'F5', x: 754.4 },
];
export const NODE_MAP = Object.fromEntries(NODES.map(n => [n.key, n]));

// Note scroll
export const SCROLL_SPEED = 160;  // px/s
export const NOTE_R       = 13;

// Game timing
export const HIT_WINDOW_PERFECT = 0.25;   // seconds — easy mode
export const HIT_WINDOW_GOOD    = 0.55;   // seconds — easy mode
export const COUNTDOWN_SEC      = 1.5;
export const SONG_DURATION      = 52;     // seconds

// Physics
export const SPRING_SPEED        = 3.5;
export const MAX_BEND_SEMITONES  = 1.5;

// Tap buttons (clickable note triggers below instrument)
export const TAP_BTN_Y = 505;
export const TAP_BTN_R = 18;
