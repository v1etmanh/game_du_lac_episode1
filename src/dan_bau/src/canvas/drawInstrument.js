import { C } from '../constants/colors.js';
import {
  STRING_Y, CAN_DAN_X, MAX_BEND_ANGLE, NODES,
  INSTRUMENT_IMG_SRC, INSTRUMENT_NATURAL_W, INSTRUMENT_NATURAL_H,
  INSTRUMENT_DEST_X, INSTRUMENT_DEST_Y, INSTRUMENT_DEST_W, INSTRUMENT_DEST_H,
  ROD_ERASE_RECT, ROD_ATTACH_X, ROD_ATTACH_Y, ROD_LEN, ROD_ANGLE_OFFSET,
  NOTE_LABEL_Y, INSTRUMENT_SHADOW_Y,
} from '../constants/layout.js';

// ── 3D perspective geometry (superseded by the instrument PNG below — kept
// for the procedural body functions, disabled further down, for comparison) ──
// Top surface corners — instrument viewed from slightly below-front
const TS = {
  tl: { x: 44,  y: 295 },   // far-left
  tr: { x: 857, y: 288 },   // far-right
  br: { x: 865, y: 390 },   // near-right
  bl: { x: 38,  y: 396 },   // near-left
};
// Front face (depth strip below playing surface)
const FF = {
  tl: { x: 38,  y: 396 },
  tr: { x: 865, y: 390 },
  br: { x: 865, y: 430 },
  bl: { x: 38,  y: 434 },
};

function lerp2(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Perspective y on the string centerline at a given x
function strY(x) {
  const t  = Math.max(0, Math.min(1, (x - TS.tl.x) / (TS.tr.x - TS.tl.x)));
  const lY = (TS.tl.y + TS.bl.y) * 0.5;  // 345.5
  const rY = (TS.tr.y + TS.br.y) * 0.5;  // 339
  return lY + (rY - lY) * t;
}

// Build quadrilateral path
function quad(ctx, a, b, c, d) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
}

// ── Instrument PNG — body, gourd, badges and string are baked into the
// image. Its own baked-in cần đàn (rod) is erased on load (ROD_ERASE_RECT)
// so drawCanDan() below can draw a rod that actually rotates with pitch bend.
const instrumentImage = new Image();
let instrumentProcessed = null; // offscreen canvas: source image with rod erased
instrumentImage.onload = () => {
  const off = document.createElement('canvas');
  off.width  = INSTRUMENT_NATURAL_W;
  off.height = INSTRUMENT_NATURAL_H;
  const offCtx = off.getContext('2d');
  offCtx.drawImage(instrumentImage, 0, 0);
  offCtx.clearRect(ROD_ERASE_RECT.x, ROD_ERASE_RECT.y, ROD_ERASE_RECT.w, ROD_ERASE_RECT.h);
  instrumentProcessed = off;
};
instrumentImage.src = INSTRUMENT_IMG_SRC;

function drawInstrumentImage(ctx) {
  if (!instrumentProcessed) return;
  ctx.drawImage(
    instrumentProcessed,
    INSTRUMENT_DEST_X, INSTRUMENT_DEST_Y, INSTRUMENT_DEST_W, INSTRUMENT_DEST_H,
  );
}

// ── Public API ────────────────────────────────────────
export function drawInstrument(ctx, bendSemitones, activeKeys, songTime) {
  drawDropShadow(ctx);
  // drawBody(ctx);                          // superseded by drawInstrumentImage
  // drawString(ctx, bendSemitones, songTime); // string is baked into the image
  drawInstrumentImage(ctx);
  drawNodes(ctx, activeKeys);
  // drawQuaBau(ctx, bendSemitones);        // gourd is baked into the image
  drawCanDan(ctx, bendSemitones);
}

// ── Drop shadow ───────────────────────────────────────
function drawDropShadow(ctx) {
  const sx = INSTRUMENT_DEST_X;
  const ex = INSTRUMENT_DEST_X + INSTRUMENT_DEST_W;
  const y  = INSTRUMENT_SHADOW_Y;
  const g  = ctx.createLinearGradient(0, y - 8, 0, y + 28);
  g.addColorStop(0, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.beginPath();
  ctx.ellipse((sx + ex) / 2, y, (ex - sx) * 0.52, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// ── Main body ─────────────────────────────────────────
function drawBody(ctx) {
  drawLeftEndCap(ctx);
  drawTopSurface(ctx);
  drawFrontFace(ctx);
}

function drawTopSurface(ctx) {
  // Base fill — warm lacquered wood
  quad(ctx, TS.tl, TS.tr, TS.br, TS.bl);
  const faceGrad = ctx.createLinearGradient(TS.tl.x, TS.tl.y, TS.bl.x, TS.bl.y);
  faceGrad.addColorStop(0,    '#3a1a07');
  faceGrad.addColorStop(0.20, '#5c2a0d');
  faceGrad.addColorStop(0.45, '#6b3010');
  faceGrad.addColorStop(0.72, '#5c2a0d');
  faceGrad.addColorStop(1,    '#3d1a08');
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // ── Clip to surface for all interior detail ──────
  ctx.save();
  quad(ctx, TS.tl, TS.tr, TS.br, TS.bl);
  ctx.clip();

  // Wood grain lines (perspective-mapped)
  for (let i = 0; i < 32; i++) {
    const t  = i / 31;
    const pl = lerp2(TS.tl, TS.bl, t);
    const pr = lerp2(TS.tr, TS.br, t);
    const a  = 0.03 + 0.07 * Math.abs(Math.sin(i * 0.63 + 0.4));
    ctx.beginPath();
    const N = 24;
    for (let j = 0; j <= N; j++) {
      const s  = j / N;
      const gx = pl.x + (pr.x - pl.x) * s;
      const gy = pl.y + (pr.y - pl.y) * s + Math.sin(s * Math.PI * 2.8 + i * 0.9) * 0.7;
      j === 0 ? ctx.moveTo(gx, gy) : ctx.lineTo(gx, gy);
    }
    ctx.strokeStyle = `rgba(0,0,0,${a})`;
    ctx.lineWidth   = 0.7;
    ctx.stroke();
  }

  // Lateral highlights (lacquer sheen strip)
  const sheenY = TS.tl.y + (TS.bl.y - TS.tl.y) * 0.22;
  const sheen  = ctx.createLinearGradient(0, sheenY - 14, 0, sheenY + 14);
  sheen.addColorStop(0,   'rgba(255,200,120,0)');
  sheen.addColorStop(0.5, 'rgba(255,200,120,0.12)');
  sheen.addColorStop(1,   'rgba(255,200,120,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(TS.tl.x - 2, sheenY - 14, TS.tr.x - TS.tl.x + 4, 28);

  // Ambient occlusion at edges (darkened borders)
  const aoL = ctx.createLinearGradient(TS.tl.x, 0, TS.tl.x + 40, 0);
  aoL.addColorStop(0, 'rgba(0,0,0,0.30)');
  aoL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aoL;
  ctx.fillRect(TS.tl.x - 2, TS.tl.y - 2, 42, TS.bl.y - TS.tl.y + 4);

  const aoR = ctx.createLinearGradient(TS.tr.x, 0, TS.tr.x - 40, 0);
  aoR.addColorStop(0, 'rgba(0,0,0,0.30)');
  aoR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aoR;
  ctx.fillRect(TS.tr.x - 40, TS.tr.y - 2, 42, TS.br.y - TS.tr.y + 4);

  // Khảm xà cừ — mother-of-pearl inlay diamonds below string
  const inlayY = STRING_Y + 26;
  const inlays = [155, 305, 455, 605, 755];
  for (const ix of inlays) {
    const iy = inlayY + (strY(ix) - STRING_Y);
    const g  = ctx.createRadialGradient(ix - 3, iy - 2, 0, ix, iy, 11);
    g.addColorStop(0, 'rgba(220,240,255,0.50)');
    g.addColorStop(0.4, 'rgba(180,210,255,0.28)');
    g.addColorStop(1, 'rgba(150,190,255,0)');
    ctx.beginPath();
    ctx.ellipse(ix, iy, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  ctx.restore(); // release clip

  // Surface border trim
  quad(ctx, TS.tl, TS.tr, TS.br, TS.bl);
  ctx.strokeStyle = 'rgba(196,149,58,0.65)';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Inner inset border
  const INSET = 5;
  const itl = lerp2(lerp2(TS.tl, TS.tr, INSET / (TS.tr.x - TS.tl.x)), lerp2(TS.bl, TS.br, INSET / (TS.br.x - TS.bl.x)), 0.12);
  const itr = lerp2(lerp2(TS.tr, TS.tl, INSET / (TS.tr.x - TS.tl.x)), lerp2(TS.br, TS.bl, INSET / (TS.br.x - TS.bl.x)), 0.12);
  const ibr = lerp2(lerp2(TS.br, TS.bl, INSET / (TS.br.x - TS.bl.x)), lerp2(TS.tr, TS.tl, INSET / (TS.tr.x - TS.tl.x)), 0.88);
  const ibl = lerp2(lerp2(TS.bl, TS.br, INSET / (TS.br.x - TS.bl.x)), lerp2(TS.tl, TS.tr, INSET / (TS.tr.x - TS.tl.x)), 0.88);
  quad(ctx, itl, itr, ibr, ibl);
  ctx.strokeStyle = 'rgba(196,149,58,0.20)';
  ctx.lineWidth   = 0.8;
  ctx.stroke();
}

function drawFrontFace(ctx) {
  quad(ctx, FF.tl, FF.tr, FF.br, FF.bl);
  const fg = ctx.createLinearGradient(0, FF.tl.y, 0, FF.br.y);
  fg.addColorStop(0,   '#2a1208');
  fg.addColorStop(0.4, '#3d1a08');
  fg.addColorStop(1,   '#180a04');
  ctx.fillStyle = fg;
  ctx.fill();

  ctx.strokeStyle = 'rgba(196,149,58,0.40)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Recessed bevel line near bottom
  ctx.beginPath();
  ctx.moveTo(FF.bl.x + 4, FF.bl.y - 5);
  ctx.lineTo(FF.br.x - 4, FF.br.y - 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth   = 1;
  ctx.stroke();
}

function drawLeftEndCap(ctx) {
  const depth = 9;
  ctx.beginPath();
  ctx.moveTo(TS.tl.x, TS.tl.y);
  ctx.lineTo(TS.tl.x - depth, TS.tl.y + 6);
  ctx.lineTo(TS.bl.x - depth, TS.bl.y + 5);
  ctx.lineTo(FF.bl.x - depth, FF.bl.y + 3);
  ctx.lineTo(FF.bl.x, FF.bl.y);
  ctx.lineTo(TS.bl.x, TS.bl.y);
  ctx.closePath();
  ctx.fillStyle = '#160904';
  ctx.fill();
  ctx.strokeStyle = 'rgba(196,149,58,0.22)';
  ctx.lineWidth   = 1;
  ctx.stroke();
}

// ── String ────────────────────────────────────────────
function drawString(ctx, bendSemitones, songTime) {
  const bend    = Math.abs(bendSemitones) > 0.05;
  const vibFreq = 18;
  const vibAmp  = bend ? 1.8 : 0;
  const phase   = songTime * vibFreq * Math.PI * 2;

  // Glow pass (blurred)
  ctx.beginPath();
  ctx.moveTo(TS.tl.x + 14, strY(TS.tl.x + 14));
  for (let x = TS.tl.x + 14; x <= TS.tr.x - 14; x += 6) {
    const t  = (x - TS.tl.x - 14) / (TS.tr.x - TS.tl.x - 28);
    const vy = vibAmp * Math.sin(t * Math.PI * 3 + phase) * t * (1 - t) * 4;
    ctx.lineTo(x, strY(x) + vy);
  }
  ctx.strokeStyle = 'rgba(240,208,96,0.20)';
  ctx.lineWidth   = 5;
  ctx.stroke();

  // Main string
  ctx.beginPath();
  ctx.moveTo(TS.tl.x + 14, strY(TS.tl.x + 14));
  for (let x = TS.tl.x + 14; x <= TS.tr.x - 14; x += 4) {
    const t  = (x - TS.tl.x - 14) / (TS.tr.x - TS.tl.x - 28);
    const vy = vibAmp * Math.sin(t * Math.PI * 3 + phase) * t * (1 - t) * 4;
    ctx.lineTo(x, strY(x) + vy);
  }
  ctx.strokeStyle = C.goldString;
  ctx.lineWidth   = 1.6;
  ctx.shadowColor = C.goldString;
  ctx.shadowBlur  = bend ? 7 : 3;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // Bridge pins (anchors at each end)
  for (const px of [TS.tl.x + 14, TS.tr.x - 14]) {
    const py = strY(px);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle   = '#e8b84a';
    ctx.shadowColor = '#f0d060';
    ctx.shadowBlur  = 4;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }
}

// ── Nodes ─────────────────────────────────────────────
// The instrument image already bakes in the idle-state badge + string dot for
// each node, so only the active (key-pressed) glow/highlight is drawn here —
// on top of the image, at the same string row (STRING_Y) the image was
// aligned to. The note-name label has no baked equivalent, so it's always
// drawn, regardless of active state.
function drawNodes(ctx, activeKeys) {
  for (const node of NODES) {
    const isActive = activeKeys?.has(node.key);
    const nx = node.x;
    const ny = STRING_Y;

    if (isActive) {
      // Glow ring
      const glow = ctx.createRadialGradient(nx, ny, 2, nx, ny, 22);
      glow.addColorStop(0, 'rgba(240,208,96,0.40)');
      glow.addColorStop(1, 'rgba(240,208,96,0)');
      ctx.beginPath();
      ctx.arc(nx, ny, 22, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Node circle
      const nr = 8;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      const ng = ctx.createRadialGradient(nx - nr * 0.3, ny - nr * 0.3, 0, nx, ny, nr);
      ng.addColorStop(0, '#fff8d0');
      ng.addColorStop(0.5, '#f0d060');
      ng.addColorStop(1, '#b87820');
      ctx.fillStyle   = ng;
      ctx.strokeStyle = 'rgba(255,248,200,0.8)';
      ctx.lineWidth   = 1.2;
      ctx.shadowColor = '#f0d060';
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur  = 0;

      drawKeyBadge(ctx, node, nx, ny, isActive);
    }

    // Note name below the instrument image
    ctx.fillStyle    = 'rgba(138,112,80,0.55)';
    ctx.font         = '9px Merriweather, serif';
    ctx.textBaseline = 'top';
    ctx.fillText(node.note, nx, NOTE_LABEL_Y);
  }
}

function drawKeyBadge(ctx, node, nx, ny, isActive) {
  const badgeY = ny - 27;
  const badgeR = isActive ? 13 : 11;

  ctx.save();
  ctx.beginPath();
  ctx.arc(nx, badgeY, badgeR, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(nx - 3, badgeY - 4, 1, nx, badgeY, badgeR);
  bg.addColorStop(0, isActive ? '#fff8d0' : 'rgba(240,208,96,0.36)');
  bg.addColorStop(0.62, isActive ? '#d8a83d' : 'rgba(92,45,14,0.82)');
  bg.addColorStop(1, isActive ? '#7a4010' : 'rgba(42,18,8,0.92)');
  ctx.fillStyle = bg;
  ctx.strokeStyle = isActive ? 'rgba(255,248,200,0.95)' : 'rgba(196,149,58,0.65)';
  ctx.lineWidth = isActive ? 1.6 : 1;
  ctx.shadowColor = isActive ? C.goldString : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = isActive ? 10 : 3;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = isActive ? '#1b0d04' : C.textPrimary;
  ctx.font = `${isActive ? 'bold ' : ''}12px Merriweather, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, nx, badgeY + 0.5);
  ctx.restore();
}

// ── Quả bầu (resonator gourd — drawn before cần đàn so rod overlaps) ──
function drawQuaBau(ctx, bendSemitones) {
  // Gourd sits at the right end of the instrument body, at the base of the cần đàn.
  // Center is just outside the right edge of the body so it's fully visible.
  const bendOff = (bendSemitones / 1.5) * 2;
  const bx = 868;
  const by = strY(CAN_DAN_X) + 10 + bendOff; // just below string level (~349)
  const rx = 22;  // half-width  (portrait oval matches a real gourd)
  const ry = 32;  // half-height

  // Drop shadow on the surface
  ctx.beginPath();
  ctx.ellipse(bx + 4, by + ry * 0.55, rx * 0.85, ry * 0.28, 0.05, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.fill();

  // Gourd body
  const bg = ctx.createRadialGradient(bx - rx * 0.28, by - ry * 0.22, rx * 0.05,
                                       bx, by, Math.max(rx, ry));
  bg.addColorStop(0,    '#8a4218');
  bg.addColorStop(0.35, '#4a2008');
  bg.addColorStop(0.72, '#2e1208');
  bg.addColorStop(1,    '#160804');
  ctx.beginPath();
  ctx.ellipse(bx, by, rx, ry, 0.08, 0, Math.PI * 2);
  ctx.fillStyle   = bg;
  ctx.strokeStyle = 'rgba(196,149,58,0.45)';
  ctx.lineWidth   = 1.2;
  ctx.fill();
  ctx.stroke();

  // Highlight
  const hl = ctx.createRadialGradient(bx - rx * 0.4, by - ry * 0.32, 0,
                                       bx - rx * 0.2, by - ry * 0.15, rx * 0.75);
  hl.addColorStop(0, 'rgba(220,160,60,0.32)');
  hl.addColorStop(0.55, 'rgba(180,120,40,0.10)');
  hl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.ellipse(bx, by, rx, ry, 0.08, 0, Math.PI * 2);
  ctx.fillStyle = hl;
  ctx.fill();

  // Specular spot
  ctx.beginPath();
  ctx.ellipse(bx - rx * 0.30, by - ry * 0.30, rx * 0.28, ry * 0.18, -0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,240,200,0.28)';
  ctx.fill();

  // Neck at top (where the cần đàn exits)
  const neckTopY = by - ry;
  const neckW    = 5;
  ctx.beginPath();
  ctx.moveTo(bx - neckW, neckTopY + 10);
  ctx.bezierCurveTo(bx - neckW - 1, neckTopY + 3, bx - neckW + 1, neckTopY - 4, bx - 3, neckTopY - 7);
  ctx.lineTo(bx + 3,    neckTopY - 7);
  ctx.bezierCurveTo(bx + neckW - 1, neckTopY - 4, bx + neckW + 1, neckTopY + 3, bx + neckW, neckTopY + 10);
  ctx.closePath();
  ctx.fillStyle = '#5c2a0d';
  ctx.fill();
  ctx.strokeStyle = 'rgba(196,149,58,0.30)';
  ctx.lineWidth   = 0.8;
  ctx.stroke();
}

// ── Cần đàn (flexible tuning rod — drawn on top of quả bầu) ──────────
function drawCanDan(ctx, bendSemitones) {
  const bendAngle = (bendSemitones / 1.5) * MAX_BEND_ANGLE;
  const attachX   = ROD_ATTACH_X;   // top of the mounting stub left after erasing the baked rod
  const attachY   = ROD_ATTACH_Y;

  ctx.save();
  ctx.translate(attachX, attachY);
  ctx.rotate(bendAngle);

  // The cần đàn rises nearly straight up from the body (traditional design).
  // rodAngle: measured from positive-x axis. -π/2 = straight up; ROD_ANGLE_OFFSET = slight right lean,
  // matching the lean of the (now erased) rod baked into the instrument image.
  const rodLen   = ROD_LEN;
  const rodAngle = -Math.PI / 2 + ROD_ANGLE_OFFSET;

  const tipX = Math.cos(rodAngle) * rodLen; // ≈ +10.8
  const tipY = Math.sin(rodAngle) * rodLen; // ≈ -89.4

  // Unit direction & perpendicular for tapered body polygon
  const ux = tipX / rodLen;
  const uy = tipY / rodLen;
  const px = -uy;   // perpendicular (rotated 90° left)
  const py =  ux;

  const baseHW = 4.5;
  const tipHW  = 1.0;

  // Rod body (tapered polygon: thick at base, thin at tip)
  ctx.beginPath();
  ctx.moveTo( px * baseHW,  py * baseHW);
  ctx.lineTo(tipX + px * tipHW, tipY + py * tipHW);
  ctx.lineTo(tipX - px * tipHW, tipY - py * tipHW);
  ctx.lineTo(-px * baseHW, -py * baseHW);
  ctx.closePath();

  const rodGrad = ctx.createLinearGradient(0, 0, tipX, tipY);
  rodGrad.addColorStop(0,    '#6b3010');
  rodGrad.addColorStop(0.12, '#c4953a');
  rodGrad.addColorStop(0.55, '#e8b84a');
  rodGrad.addColorStop(1,    '#9a6818');
  ctx.fillStyle = rodGrad;
  ctx.fill();

  // Surface highlight (specular stripe along near-edge)
  ctx.beginPath();
  ctx.moveTo( px * baseHW * 0.55,  py * baseHW * 0.55);
  ctx.lineTo(tipX + px * tipHW * 0.55, tipY + py * tipHW * 0.55);
  ctx.strokeStyle = 'rgba(255,240,180,0.22)';
  ctx.lineWidth   = 0.9;
  ctx.stroke();

  // Edge outline for crispness
  ctx.beginPath();
  ctx.moveTo( px * baseHW,  py * baseHW);
  ctx.lineTo(tipX + px * tipHW, tipY + py * tipHW);
  ctx.lineTo(tipX - px * tipHW, tipY - py * tipHW);
  ctx.lineTo(-px * baseHW, -py * baseHW);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(30,10,0,0.32)';
  ctx.lineWidth   = 0.6;
  ctx.stroke();

  // Base collar (where rod enters the body surface)
  const colGrad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 9);
  colGrad.addColorStop(0,   '#f0d060');
  colGrad.addColorStop(0.5, '#8b5a18');
  colGrad.addColorStop(1,   '#3d1a08');
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fillStyle   = colGrad;
  ctx.strokeStyle = 'rgba(196,149,58,0.70)';
  ctx.lineWidth   = 1.2;
  ctx.fill();
  ctx.stroke();

  // Tip cap (string-attachment point, glowing gold)
  const tipGrad = ctx.createRadialGradient(tipX - 1.5, tipY - 1.5, 0, tipX, tipY, 5.5);
  tipGrad.addColorStop(0,   '#fff8d0');
  tipGrad.addColorStop(0.5, '#f0d060');
  tipGrad.addColorStop(1,   '#8b5a18');
  ctx.beginPath();
  ctx.arc(tipX, tipY, 5.5, 0, Math.PI * 2);
  ctx.fillStyle   = tipGrad;
  ctx.shadowColor = '#f0d060';
  ctx.shadowBlur  = 8;
  ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(196,149,58,0.55)';
  ctx.lineWidth   = 0.9;
  ctx.stroke();

  ctx.restore();
}
