import { C } from '../constants/colors.js';
import {
  NODE_MAP, NODES, STRING_Y, NOTE_R, SCROLL_SPEED,
  HIT_WINDOW_GOOD, HIT_WINDOW_PERFECT, HUD_H,
  TAP_BTN_Y, TAP_BTN_R,
} from '../constants/layout.js';

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// Per-key identity colors matching the 6 playable nodes
const KEY_COLORS = {
  a: '#7ab8ff',  // sky blue
  s: '#6ee89a',  // mint
  d: '#f0d060',  // gold
  j: '#ff9966',  // amber
  k: '#ff7eb8',  // rose
  l: '#c8a0ff',  // violet
};

// Notes fall vertically onto their node position.
// y = STRING_Y - dt * SCROLL_SPEED
// dt=0 → note lands on string; dt>0 → note is above
function noteY(dt) {
  return STRING_Y - dt * SCROLL_SPEED;
}

export function drawNotes(ctx, songTime, notes, ripples, flash) {
  drawTapButtons(ctx, songTime, notes);
  drawLaneGuides(ctx, songTime, notes);
  drawHitZones(ctx, songTime, notes);
  drawMovingNotes(ctx, songTime, notes);
  drawRipples(ctx, songTime, ripples);
  drawFlash(ctx, songTime, flash);
}

// Clickable tap buttons below the instrument body
function drawTapButtons(ctx, songTime, notes) {
  for (const node of NODES) {
    const nx  = node.x;
    const ny  = TAP_BTN_Y;
    const col = KEY_COLORS[node.key] ?? C.goldString;

    const approaching = notes.some(n =>
      !n.hit && !n.missed &&
      n.key === node.key &&
      (n.time - songTime) > -HIT_WINDOW_GOOD &&
      (n.time - songTime) < 1.2
    );
    const inPerfect = notes.some(n =>
      !n.hit && !n.missed &&
      n.key === node.key &&
      Math.abs(n.time - songTime) <= HIT_WINDOW_PERFECT
    );

    const pulse = inPerfect
      ? 0.80 + 0.20 * Math.sin(songTime * 14)
      : approaching
      ? 0.45 + 0.20 * Math.sin(songTime * 8)
      : 0.25;

    const r = TAP_BTN_R + (inPerfect ? 2 : 0);

    // Outer glow when approaching
    if (approaching) {
      const og = ctx.createRadialGradient(nx, ny, r, nx, ny, r + 16);
      og.addColorStop(0, hexAlpha(col, pulse * 0.45));
      og.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(nx, ny, r + 16, 0, Math.PI * 2);
      ctx.fillStyle = og;
      ctx.fill();
    }

    // Button body
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    const bg = ctx.createRadialGradient(nx - r * 0.3, ny - r * 0.3, 0, nx, ny, r);
    bg.addColorStop(0, inPerfect ? hexAlpha(col, 0.35) : 'rgba(12,6,2,0.92)');
    bg.addColorStop(1, 'rgba(4,2,0,0.96)');
    ctx.fillStyle   = bg;
    ctx.shadowColor = hexAlpha(col, pulse * 0.8);
    ctx.shadowBlur  = approaching ? 10 : 3;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Border ring
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(col, pulse);
    ctx.lineWidth   = inPerfect ? 2.5 : 1.5;
    ctx.stroke();

    // Music note icon (top-right of button)
    ctx.fillStyle    = hexAlpha(col, approaching ? 0.85 : 0.38);
    ctx.font         = '9px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', nx + r * 0.58, ny - r * 0.58);

    // Key label (main)
    ctx.fillStyle    = approaching ? col : hexAlpha(col, 0.65);
    ctx.font         = `bold 13px "Merriweather", serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, nx, ny - 2);

    // Note name (sub-label)
    ctx.fillStyle    = hexAlpha(col, approaching ? 0.70 : 0.32);
    ctx.font         = '8px "Merriweather", serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(node.note, nx, ny + 7);
  }
}

// Vertical lane guides — appear when a note is approaching
function drawLaneGuides(ctx, songTime, notes) {
  for (const node of NODES) {
    const hasUpcoming = notes.some(n =>
      !n.hit && !n.missed &&
      n.key === node.key &&
      (n.time - songTime) > -HIT_WINDOW_GOOD &&
      (n.time - songTime) < 2.0
    );
    if (!hasUpcoming) continue;

    const col = KEY_COLORS[node.key] ?? C.goldString;
    const nx = node.x;

    const grad = ctx.createLinearGradient(nx, HUD_H + 8, nx, STRING_Y);
    grad.addColorStop(0,   hexAlpha(col, 0));
    grad.addColorStop(0.5, hexAlpha(col, 0.10));
    grad.addColorStop(1,   hexAlpha(col, 0.32));

    ctx.beginPath();
    ctx.moveTo(nx, HUD_H + 8);
    ctx.lineTo(nx, STRING_Y);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
}

// Pulsing hit-zone ring drawn at the node on the string
function drawHitZones(ctx, songTime, notes) {
  for (const note of notes) {
    if (note.hit || note.missed) continue;
    const dt = note.time - songTime;
    if (dt > 0.9 || dt < -HIT_WINDOW_GOOD) continue;

    const node = NODE_MAP[note.key];
    if (!node) continue;

    const col        = KEY_COLORS[note.key] ?? C.goldString;
    const nearPerfect = Math.abs(dt) <= HIT_WINDOW_PERFECT;
    const inWindow    = Math.abs(dt) <= HIT_WINDOW_GOOD;

    const pulse = nearPerfect
      ? 0.55 + 0.30 * Math.sin(songTime * 14)
      : inWindow
      ? 0.30 + 0.18 * Math.sin(songTime * 10)
      : 0.14 + 0.06 * Math.sin(songTime * 5);

    const ringR = nearPerfect ? 20 : inWindow ? 17 : 14;

    // Glow fill
    const glow = ctx.createRadialGradient(node.x, STRING_Y, 2, node.x, STRING_Y, ringR);
    glow.addColorStop(0, hexAlpha(col, pulse * 0.55));
    glow.addColorStop(1, hexAlpha(col, 0));
    ctx.beginPath();
    ctx.arc(node.x, STRING_Y, ringR, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Ring stroke
    ctx.beginPath();
    ctx.arc(node.x, STRING_Y, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(col, pulse);
    ctx.lineWidth   = nearPerfect ? 2.5 : 1.5;
    ctx.stroke();
  }
}

// Notes themselves — falling vertically with trail toward string
function drawMovingNotes(ctx, songTime, notes) {
  for (const note of notes) {
    if (note.hit || note.missed) continue;
    const node = NODE_MAP[note.key];
    if (!node) continue;

    const dt  = note.time - songTime;
    const nx  = node.x;
    const ny  = noteY(dt);

    if (ny < HUD_H - NOTE_R - 4 || ny > STRING_Y + NOTE_R * 2) continue;

    const col      = KEY_COLORS[note.key] ?? C.goldString;
    const inWindow = Math.abs(dt) <= HIT_WINDOW_GOOD;
    const r        = inWindow ? NOTE_R + 3 : NOTE_R;

    // Trail: fading beam from note's bottom edge down to the string
    if (dt > 0.02 && ny + r < STRING_Y - 2) {
      const trailGrad = ctx.createLinearGradient(nx, ny + r, nx, STRING_Y);
      trailGrad.addColorStop(0, hexAlpha(col, inWindow ? 0.65 : 0.40));
      trailGrad.addColorStop(1, hexAlpha(col, 0));
      ctx.beginPath();
      ctx.moveTo(nx, ny + r);
      ctx.lineTo(nx, STRING_Y);
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth   = inWindow ? 2 : 1.5;
      ctx.stroke();
    }

    // Outer soft glow halo
    const haloR = r + 15;
    const halo  = ctx.createRadialGradient(nx, ny, r * 0.3, nx, ny, haloR);
    halo.addColorStop(0, hexAlpha(col, inWindow ? 0.75 : 0.50));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(nx, ny, haloR, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Core — radial gradient for depth
    const core = ctx.createRadialGradient(nx - r * 0.28, ny - r * 0.28, 0, nx, ny, r);
    core.addColorStop(0,    inWindow ? '#ffffff' : hexAlpha(col, 1));
    core.addColorStop(0.38, col);
    core.addColorStop(1,    hexAlpha(col, 0.65));
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.fillStyle   = core;
    ctx.shadowColor = col;
    ctx.shadowBlur  = inWindow ? 18 : 8;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Crisp ring border
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.strokeStyle = inWindow ? 'rgba(255,255,255,0.9)' : hexAlpha(col, 0.85);
    ctx.lineWidth   = inWindow ? 2 : 1.5;
    ctx.stroke();

    // Key label — dark on bright, white on darker colors
    const labelDark = inWindow || note.key === 'd'; // gold core reads light
    ctx.save();
    ctx.fillStyle    = labelDark ? '#1a0d04' : '#ffffff';
    ctx.font         = `bold ${r >= NOTE_R + 2 ? 11 : 10}px "Merriweather", serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, nx, ny + 0.5);
    ctx.restore();

    // Bend / vibrato hint above the note
    if (dt < 0.9 && dt > 0.06) {
      if (note.bend === 'vibrato') drawVibratoHint(ctx, nx, ny - r - 10, col);
      else if (note.bend === 'up') drawBendArrow(ctx, nx, ny - r - 12, 'up', col);
    }
  }
}

function drawBendArrow(ctx, x, y, dir, col) {
  ctx.save();
  ctx.fillStyle    = col + 'cc';
  ctx.font         = '12px sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dir === 'up' ? '↑' : '↓', x, y);
  ctx.restore();
}

function drawVibratoHint(ctx, x, y, col) {
  ctx.save();
  ctx.strokeStyle = col + 'aa';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const px = x - 10 + i;
    const py = y + Math.sin(i * 0.9) * 3;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

function drawRipples(ctx, songTime, ripples) {
  for (const rip of ripples) {
    const age  = songTime - rip.t;
    if (age < 0 || age > 0.55) continue;
    const prog  = age / 0.55;
    const rad   = 14 + prog * 46;
    const alpha = (1 - prog) * 0.80;
    const col   = KEY_COLORS[rip.key] ?? C.goldString;

    ctx.beginPath();
    ctx.arc(rip.x, rip.y, rad, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(col, alpha);
    ctx.lineWidth   = 2.5 - prog * 2;
    ctx.stroke();

    if (prog > 0.15) {
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, (rad - 8) * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(col, alpha * 0.45);
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }
}

function drawFlash(ctx, songTime, flash) {
  if (!flash) return;
  const age = songTime - flash.t;
  if (age < 0 || age > 0.7) return;

  const alpha = Math.max(0, 1 - age / 0.5);
  const scale = 1 + age * 0.8;
  const color =
    flash.text === 'PERFECT' ? C.flashPerfect :
    flash.text === 'GOOD'    ? C.flashGood    :
    C.flashMiss;

  ctx.save();
  ctx.globalAlpha  = alpha;
  ctx.translate(flash.x, flash.y);
  ctx.scale(scale, scale);
  ctx.font         = 'bold 22px "Merriweather", serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = color;
  ctx.shadowColor  = color;
  ctx.shadowBlur   = 16;
  ctx.fillText(flash.text, 0, 0);
  ctx.restore();
}
