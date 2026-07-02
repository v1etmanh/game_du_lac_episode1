import { KEY_MAP, PLAY_KEYS, SCROLL_SPEED, GESTURE } from './gameData.js';

const HIT_Y_RATIO = 0.78;
const KEY_BOX_W = 48;
const KEY_BOX_H = 38;

const COLORS = {
  hold: '#c8902a',
  up: '#4ab8e8',
  down: '#e8724a',
};

export function drawNoteTrack(canvas, songTime, notes, activeKeys, hitResults) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const hitY = H * HIT_Y_RATIO;
  const stringX = W * 0.5;
  const bodyX = 54;
  const bodyY = 28;
  const bodyW = W - 108;
  const bodyH = H - 72;

  ctx.clearRect(0, 0, W, H);
  drawStage(ctx, W, H);
  drawDanBauBody(ctx, bodyX, bodyY, bodyW, bodyH, stringX, hitY, activeKeys);
  drawNotes(ctx, notes, songTime, stringX, hitY, H);
  drawHitResults(ctx, hitResults, stringX, hitY);
  drawKeyControls(ctx, W, H, activeKeys);
}

function drawStage(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0703');
  bg.addColorStop(0.55, '#151007');
  bg.addColorStop(1, '#070502');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.05, W / 2, H * 0.45, H * 0.72);
  vignette.addColorStop(0, 'rgba(240,192,64,0.04)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawDanBauBody(ctx, x, y, w, h, stringX, hitY, activeKeys) {
  const bodyGrad = ctx.createLinearGradient(x, y, x + w, y);
  bodyGrad.addColorStop(0, 'rgba(42,26,10,0.92)');
  bodyGrad.addColorStop(0.5, 'rgba(24,15,6,0.98)');
  bodyGrad.addColorStop(1, 'rgba(54,34,12,0.9)');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200,144,42,0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.stroke();

  drawWoodGrain(ctx, x, y, w, h);
  drawResonator(ctx, x + w * 0.72, y + h * 0.72, w * 0.24, h * 0.17);
  drawString(ctx, stringX, y + 42, hitY + 82, activeKeys.size > 0);
  drawPluckLine(ctx, x + 24, x + w - 24, hitY);
  drawBridge(ctx, stringX, hitY + 80);
  drawHead(ctx, stringX, y + 34);
}

function drawWoodGrain(ctx, x, y, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 11; i += 1) {
    const gx = x + 24 + i * (w - 48) / 10;
    const grad = ctx.createLinearGradient(gx - 18, y, gx + 18, y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, '#c8902a');
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.7;
    ctx.beginPath();
    ctx.moveTo(gx, y + 14);
    ctx.bezierCurveTo(gx - 10, y + h * 0.28, gx + 12, y + h * 0.58, gx - 6, y + h - 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawResonator(ctx, cx, cy, rx, ry) {
  const grad = ctx.createRadialGradient(cx - rx * 0.25, cy - ry * 0.35, 4, cx, cy, rx);
  grad.addColorStop(0, 'rgba(240,192,64,0.12)');
  grad.addColorStop(0.55, 'rgba(97,60,18,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200,144,42,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawString(ctx, x, topY, bottomY, isActive) {
  const glowWidth = isActive ? 10 : 7;
  const lineWidth = isActive ? 2.2 : 1.4;

  const glow = ctx.createLinearGradient(0, topY, 0, bottomY);
  glow.addColorStop(0, 'rgba(240,192,64,0)');
  glow.addColorStop(0.18, 'rgba(240,192,64,0.2)');
  glow.addColorStop(0.78, 'rgba(240,192,64,0.26)');
  glow.addColorStop(1, 'rgba(240,192,64,0)');

  ctx.strokeStyle = glow;
  ctx.lineWidth = glowWidth;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, bottomY);
  ctx.stroke();

  const stringGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
  stringGrad.addColorStop(0, 'rgba(212,168,67,0.35)');
  stringGrad.addColorStop(0.48, '#f0c040');
  stringGrad.addColorStop(1, 'rgba(212,168,67,0.48)');

  ctx.strokeStyle = stringGrad;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, bottomY);
  ctx.stroke();
}

function drawPluckLine(ctx, leftX, rightX, y) {
  const grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.34, '#c8902a');
  grad.addColorStop(0.5, '#f0c040');
  grad.addColorStop(0.66, '#c8902a');
  grad.addColorStop(1, 'transparent');

  ctx.strokeStyle = 'rgba(240,192,64,0.12)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(rightX, y);
  ctx.stroke();

  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(rightX, y);
  ctx.stroke();

  ctx.fillStyle = 'rgba(200,144,42,0.5)';
  ctx.font = '10px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('PLUCK', (leftX + rightX) / 2, y - 10);
}

function drawBridge(ctx, x, y) {
  ctx.fillStyle = 'rgba(200,144,42,0.55)';
  ctx.beginPath();
  ctx.roundRect(x - 22, y - 6, 44, 12, 4);
  ctx.fill();
  ctx.strokeStyle = '#f0c040';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawHead(ctx, x, y) {
  ctx.fillStyle = 'rgba(200,144,42,0.55)';
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240,192,64,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200,144,42,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 28, y - 8);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 28, y - 8);
  ctx.stroke();
}

function drawNotes(ctx, notes, songTime, stringX, hitY, H) {
  notes.forEach((note) => {
    const noteY = hitY - (note.time - songTime) * SCROLL_SPEED;
    if (noteY < -44 || noteY > H + 44) return;

    const color = COLORS[note.gesture] || COLORS.hold;
    const radius = 20;

    const glow = ctx.createRadialGradient(stringX, noteY, 0, stringX, noteY, radius * 2.4);
    glow.addColorStop(0, color);
    glow.addColorStop(0.45, color + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(stringX, noteY, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    const bodyGrad = ctx.createRadialGradient(stringX - 5, noteY - 6, 2, stringX, noteY, radius);
    bodyGrad.addColorStop(0, '#fff6ce');
    bodyGrad.addColorStop(0.32, color);
    bodyGrad.addColorStop(1, '#2a1705');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(stringX, noteY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(stringX, noteY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getGestureMark(note.gesture), stringX, noteY - 3);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = 'bold 10px Georgia';
    ctx.fillText(note.key.toUpperCase(), stringX, noteY + 11);

    ctx.fillStyle = 'rgba(232,217,176,0.62)';
    ctx.font = '10px Georgia';
    ctx.textBaseline = 'middle';
    ctx.fillText(KEY_MAP[note.key]?.label || '', stringX + radius + 18, noteY);
  });
}

function drawHitResults(ctx, hitResults, stringX, hitY) {
  hitResults.forEach((result) => {
    const alpha = result.alpha;
    ctx.fillStyle = result.perfect
      ? `rgba(240,192,64,${alpha})`
      : `rgba(100,180,255,${alpha})`;
    ctx.font = `bold ${16 + (1 - alpha) * 8}px Georgia`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(result.perfect ? 'PERFECT' : 'GOOD', stringX, hitY - 38 - (1 - alpha) * 20);
  });
}

function drawKeyControls(ctx, W, H, activeKeys) {
  const totalW = PLAY_KEYS.length * KEY_BOX_W + (PLAY_KEYS.length - 1) * 8;
  const startX = (W - totalW) / 2;
  const y = H - 58;

  PLAY_KEYS.forEach((key, index) => {
    const x = startX + index * (KEY_BOX_W + 8);
    const active = activeKeys.has(key);

    ctx.fillStyle = active ? 'rgba(200,144,42,0.9)' : 'rgba(18,11,4,0.92)';
    ctx.strokeStyle = active ? '#f0c040' : 'rgba(200,144,42,0.42)';
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, KEY_BOX_W, KEY_BOX_H, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = active ? '#0d0a06' : '#f0c040';
    ctx.font = 'bold 15px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key.toUpperCase(), x + KEY_BOX_W / 2, y + 14);

    ctx.fillStyle = active ? '#0d0a06' : 'rgba(232,217,176,0.6)';
    ctx.font = '10px Georgia';
    ctx.fillText(KEY_MAP[key]?.label || '', x + KEY_BOX_W / 2, y + 29);
  });
}

function getGestureMark(gesture) {
  if (gesture === GESTURE.UP) return '^';
  if (gesture === GESTURE.DOWN) return 'v';
  return 'o';
}

export function getHitLineY(canvas) {
  return canvas.height * HIT_Y_RATIO;
}

export function getLaneX(canvas) {
  return canvas.width * 0.5;
}
