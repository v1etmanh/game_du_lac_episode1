import { GESTURE, CIRCLE_RADIUS, GESTURE_TOLERANCE } from './gameData.js';

/**
 * Draw the cần đàn joystick circle.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {Object|null} activeNote - current note being held
 * @param {Object} leverInput - {x, y} normalised -1..1
 * @param {number} gestureProgress - 0..1 (how far through gesture phase)
 * @param {boolean} gestureSuccess - whether player is on track
 */
export function drawJoystick(ctx, cx, cy, activeNote, leverInput, gestureProgress, gestureSuccess) {
  const R = CIRCLE_RADIUS;

  // ── Outer ring shadow / atmosphere ──
  const atmo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.8);
  atmo.addColorStop(0, 'transparent');
  atmo.addColorStop(1, 'rgba(200,144,42,0.06)');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // ── Circle background ──
  const bg = ctx.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R);
  bg.addColorStop(0, 'rgba(40,28,10,0.95)');
  bg.addColorStop(1, 'rgba(10,7,2,0.98)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // ── Outer ring ──
  ctx.strokeStyle = 'rgba(200,144,42,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // ── Tick marks (compass) ──
  [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach(angle => {
    const ix = cx + Math.cos(angle) * (R - 8);
    const iy = cy + Math.sin(angle) * (R - 8);
    const ox = cx + Math.cos(angle) * R;
    const oy = cy + Math.sin(angle) * R;
    ctx.strokeStyle = 'rgba(200,144,42,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  });

  // ── Direction labels ──
  ctx.fillStyle = 'rgba(200,144,42,0.5)';
  ctx.font = '10px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('↑', cx, cy - R + 14);
  ctx.fillText('↓', cx, cy + R - 14);

  // ── Center cross-hair ──
  ctx.strokeStyle = 'rgba(200,144,42,0.2)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Gesture guide path ──
  if (activeNote) {
    drawGesturePath(ctx, cx, cy, R, activeNote.gesture, gestureProgress, gestureSuccess);
  }

  // ── Center dot (neutral position) ──
  ctx.fillStyle = 'rgba(200,144,42,0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  // ── Knob (player position) ──
  const kx = cx + leverInput.x * R;
  const ky = cy + leverInput.y * R;

  // Knob trail
  const trailGrad = ctx.createRadialGradient(kx, ky, 0, kx, ky, 22);
  const knobColor = gestureSuccess
    ? 'rgba(74,184,232,'
    : 'rgba(200,144,42,';
  trailGrad.addColorStop(0, knobColor + '0.3)');
  trailGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = trailGrad;
  ctx.beginPath();
  ctx.arc(kx, ky, 22, 0, Math.PI * 2);
  ctx.fill();

  // Knob body
  const knobGrad = ctx.createRadialGradient(kx - 3, ky - 3, 1, kx, ky, 10);
  knobGrad.addColorStop(0, '#fff');
  knobGrad.addColorStop(0.4, gestureSuccess ? '#4ab8e8' : '#f0c040');
  knobGrad.addColorStop(1, gestureSuccess ? '#1a5a7a' : '#7a5518');
  ctx.fillStyle = knobGrad;
  ctx.beginPath();
  ctx.arc(kx, ky, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = gestureSuccess ? '#4ab8e8' : '#c8902a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(kx, ky, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Line from center to knob
  ctx.strokeStyle = gestureSuccess
    ? 'rgba(74,184,232,0.4)'
    : 'rgba(200,144,42,0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(kx, ky);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Label ──
  ctx.fillStyle = 'rgba(200,144,42,0.6)';
  ctx.font = '11px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('CẦN ĐÀN', cx, cy + R + 10);

  // ── Active note indicator ──
  if (activeNote) {
    const noteInfo = {
      [GESTURE.HOLD]: { label: 'GIỮ', color: '#c8902a' },
      [GESTURE.UP]:   { label: 'NHẤN LÊN ↑', color: '#4ab8e8' },
      [GESTURE.DOWN]: { label: 'NHẤN XUỐNG ↓', color: '#e8724a' },
    }[activeNote.gesture];

    ctx.fillStyle = noteInfo.color;
    ctx.font = 'bold 12px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(noteInfo.label, cx, cy - R - 10);
  }
}

function drawGesturePath(ctx, cx, cy, R, gesture, progress, success) {
  if (gesture === GESTURE.HOLD) {
    // Pulsing center ring
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
    ctx.strokeStyle = `rgba(200,144,42,${0.2 + pulse * 0.25})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const targetY = gesture === GESTURE.UP   ? -0.72
               : gesture === GESTURE.DOWN  ?  0.72
               : 0;

  // Tolerance band
  const tol = GESTURE_TOLERANCE * R;
  const tx = cx;
  const ty = cy + targetY * R;

  // Guide line
  ctx.strokeStyle = success ? 'rgba(74,184,232,0.5)' : 'rgba(200,144,42,0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);

  // Target zone (tolerance circle)
  ctx.strokeStyle = success ? 'rgba(74,184,232,0.8)' : 'rgba(200,144,42,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, tol, 0, Math.PI * 2);
  ctx.stroke();

  // Target diamond
  ctx.fillStyle = success ? '#4ab8e8' : '#f0c040';
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  // Progress fill on guide line
  if (progress > 0) {
    const px = cx + (tx - cx) * progress;
    const py = cy + (ty - cy) * progress;
    ctx.strokeStyle = 'rgba(74,184,232,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
}
