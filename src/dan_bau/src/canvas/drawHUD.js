import { C } from '../constants/colors.js';
import { CANVAS_W, CANVAS_H, HUD_H } from '../constants/layout.js';

export function drawHUD(ctx, state, songTitle) {
  drawTopBar(ctx, state, songTitle);
  drawScorePanel(ctx, state);
  drawCountdown(ctx, state.songTime);
  drawStreakEffect(ctx, state);
}

function drawTopBar(ctx, state, songTitle) {
  // Frosted dark bar with slight warm tint
  const bg = ctx.createLinearGradient(0, 0, 0, HUD_H);
  bg.addColorStop(0, 'rgba(6,3,1,0.97)');
  bg.addColorStop(1, 'rgba(14,7,2,0.82)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);

  // Bottom separator
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(CANVAS_W, HUD_H);
  ctx.strokeStyle = 'rgba(196,149,58,0.42)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  const cy = HUD_H / 2;
  ctx.textBaseline = 'middle';

  // Note count — left
  const hit   = state.notes?.filter(n => n.hit).length ?? 0;
  const total = state.notes?.length ?? 0;
  ctx.fillStyle = 'rgba(196,149,58,0.65)';
  ctx.font      = '11px "Merriweather", serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${hit} / ${total}`, 16, cy);

  // Ornamental brackets flanking title
  ctx.fillStyle = 'rgba(196,149,58,0.38)';
  ctx.font      = '11px serif';
  ctx.textAlign = 'right';
  ctx.fillText('❧ ─', CANVAS_W / 2 - 6, cy + 1);
  ctx.textAlign = 'left';
  ctx.fillText('─ ❧', CANVAS_W / 2 + 6, cy + 1);

  // Song title
  ctx.fillStyle    = '#e8c86a';
  ctx.font         = '13px "Merriweather", serif';
  ctx.textAlign    = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText((songTitle ?? '').toUpperCase(), CANVAS_W / 2, cy);
  ctx.letterSpacing = '0px';

  // Streak multiplier badge — appears at 5+
  const streak = state.streak ?? 0;
  if (streak >= 5) {
    const mult  = streak >= 10 ? '×2.0' : '×1.5';
    const icon  = streak >= 10 ? '✦✦' : '✦';
    ctx.fillStyle = streak >= 10 ? '#f0d060' : '#c4953a';
    ctx.font      = 'bold 10px "Merriweather", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${icon} ${mult}`, CANVAS_W / 2 + 132, cy);
  }

  // Timer — right
  const t   = Math.max(state.songTime ?? 0, 0);
  const dur = state.duration ?? 0;
  const rem = Math.max(dur - t, 0);
  const mm  = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss  = String(Math.floor(rem % 60)).padStart(2, '0');
  ctx.fillStyle = 'rgba(196,149,58,0.65)';
  ctx.font      = '11px "Merriweather", serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, CANVAS_W - 16, cy);
}

// Bordered score panel — bottom-right corner
function drawScorePanel(ctx, state) {
  const PW = 104, PH = 64;
  const PX = CANVAS_W - PW - 10;
  const PY = CANVAS_H - 44 - PH - 6;

  // Outer shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = 'rgba(10,5,2,0.90)';
  ctx.beginPath();
  ctx.roundRect(PX, PY, PW, PH, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Outer gold border
  ctx.beginPath();
  ctx.roundRect(PX, PY, PW, PH, 4);
  ctx.strokeStyle = 'rgba(196,149,58,0.65)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Inner inset border
  ctx.beginPath();
  ctx.roundRect(PX + 3, PY + 3, PW - 6, PH - 6, 2);
  ctx.strokeStyle = 'rgba(196,149,58,0.18)';
  ctx.lineWidth   = 0.5;
  ctx.stroke();

  // "ĐIỂM" label
  ctx.fillStyle    = 'rgba(196,149,58,0.60)';
  ctx.font         = '9px "Merriweather", serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = '2px';
  ctx.fillText('ĐIỂM', PX + PW / 2, PY + 9);
  ctx.letterSpacing = '0px';

  // Hairline divider below label
  ctx.beginPath();
  ctx.moveTo(PX + 12, PY + 23);
  ctx.lineTo(PX + PW - 12, PY + 23);
  ctx.strokeStyle = 'rgba(196,149,58,0.22)';
  ctx.lineWidth   = 0.5;
  ctx.stroke();

  // Score number
  const score = state.score ?? 0;
  const fs    = score >= 10000 ? '22px' : '26px';
  ctx.fillStyle    = '#e8c86a';
  ctx.font         = `bold ${fs} "Merriweather", serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(212,165,74,0.6)';
  ctx.shadowBlur   = 10;
  ctx.fillText(score.toLocaleString(), PX + PW / 2, PY + PH * 0.63);
  ctx.shadowBlur   = 0;
}

function drawBottomBar(ctx, state) {
  const BY = CANVAS_H - 40;

  // Background
  const bg = ctx.createLinearGradient(0, BY, 0, CANVAS_H);
  bg.addColorStop(0, 'rgba(8,4,1,0.82)');
  bg.addColorStop(1, 'rgba(4,2,0,0.96)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, BY, CANVAS_W, 40);

  // Top border
  ctx.beginPath();
  ctx.moveTo(0, BY);
  ctx.lineTo(CANVAS_W, BY);
  ctx.strokeStyle = 'rgba(196,149,58,0.32)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Progress track
  const t    = Math.max(state.songTime ?? 0, 0);
  const dur  = state.duration ?? 1;
  const prog = Math.min(t / dur, 1);
  const BX   = 16;
  const BW   = CANVAS_W - 32 - 136; // leave room for score panel

  ctx.fillStyle = 'rgba(196,149,58,0.11)';
  ctx.beginPath();
  ctx.roundRect(BX, BY + 13, BW, 6, 3);
  ctx.fill();

  // Fill
  if (prog > 0) {
    const fill = ctx.createLinearGradient(BX, 0, BX + BW * prog, 0);
    fill.addColorStop(0,   '#6b3e10');
    fill.addColorStop(0.5, '#c4953a');
    fill.addColorStop(1,   '#f0d060');
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(BX, BY + 13, BW * prog, 6, 3);
    ctx.fill();
  }

  // Playhead knob
  const kx = BX + BW * prog;
  const kg  = ctx.createRadialGradient(kx - 1.5, BY + 14.5, 0, kx, BY + 16, 6.5);
  kg.addColorStop(0, '#fff8d0');
  kg.addColorStop(0.5, '#f0d060');
  kg.addColorStop(1,   '#c4953a');
  ctx.beginPath();
  ctx.arc(kx, BY + 16, 6.5, 0, Math.PI * 2);
  ctx.fillStyle   = kg;
  ctx.shadowColor = '#f0d060';
  ctx.shadowBlur  = 7;
  ctx.fill();
  ctx.shadowBlur  = 0;

  // Timestamp
  const cur = formatTime(t);
  const tot = formatTime(dur);
  ctx.fillStyle    = 'rgba(196,149,58,0.52)';
  ctx.font         = '10px "Merriweather", serif';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${cur} / ${tot}`, BX + BW + 74, BY + 16);
}

function drawCountdown(ctx, songTime) {
  if (songTime >= 0) return;

  const count = Math.ceil(-songTime);
  const frac  = (-songTime) % 1;
  const alpha = Math.min(frac * 2, 1) * Math.max(1 - (1 - frac) * 3, 0.2);
  const size  = 64 + (1 - frac) * 20;

  ctx.save();
  ctx.globalAlpha  = Math.min(alpha * 1.5, 1);
  ctx.fillStyle    = '#e8c86a';
  ctx.font         = `bold ${size}px "Merriweather", serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = '#d4a54a';
  ctx.shadowBlur   = 22;
  ctx.fillText(String(count), CANVAS_W / 2, CANVAS_H / 2 - 60);
  ctx.restore();
}

function drawStreakEffect(ctx, state) {
  const streak = state.streak ?? 0;
  if (streak < 10) return;

  ctx.globalAlpha = 0.06 + 0.03 * Math.sin((state.songTime ?? 0) * 5);
  ctx.fillStyle   = '#c4953a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.globalAlpha = 1;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
