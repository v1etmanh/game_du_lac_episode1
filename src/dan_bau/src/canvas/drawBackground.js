// Vietnamese candlelit interior room — background.png photo layer + dynamic light overlays

const W = 900, H = 600;
const CEIL_Y  = 82;
const FLOOR_Y = 478;
const WALL_L  = 192;   // x where left structure ends
const WALL_R  = 714;   // x where right structure starts

const bgImage = new Image();
let bgLoaded = false;
bgImage.onload = () => { bgLoaded = true; };
bgImage.src = '/dan-bau-background.png';

// Mimics CSS `object-fit: cover` — crops the source image to the dest box's ratio.
function drawCoverImage(ctx, img, dx, dy, dw, dh) {
  const destRatio = dw / dh;
  const srcRatio  = img.width / img.height;
  let sx, sy, sw, sh;
  if (srcRatio > destRatio) {
    sh = img.height;
    sw = sh * destRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / destRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export function drawBackground(ctx, songTime) {
  if (bgLoaded) {
    drawCoverImage(ctx, bgImage, 0, 0, W, H);
  } else {
    drawBase(ctx);
  }

  // Procedural room render — superseded by background.png above.
  // Kept here (disabled) for comparison before merging for good.
  // drawCeiling(ctx);
  // drawFloor(ctx);
  // drawLeftColumn(ctx);
  // drawAltar(ctx);
  // drawRightColumn(ctx);
  // drawGarden(ctx);
  // drawWall(ctx);
  // drawCalligraphyScroll(ctx);

  drawCandlelight(ctx, songTime);
  drawVignette(ctx);
}

// ─── Base fill ───────────────────────────────────────
function drawBase(ctx) {
  ctx.fillStyle = '#0a0604';
  ctx.fillRect(0, 0, W, H);
}

// ─── Ceiling with beams ──────────────────────────────
function drawCeiling(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CEIL_Y);
  g.addColorStop(0, '#060402');
  g.addColorStop(1, '#1c0e06');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, CEIL_Y);

  // Main ceiling beams
  const beams = [160, 400, 640];
  for (const bx of beams) {
    const bg = ctx.createLinearGradient(bx - 22, 0, bx + 22, 0);
    bg.addColorStop(0, '#120a04');
    bg.addColorStop(0.4, '#2a1408');
    bg.addColorStop(1, '#0e0704');
    ctx.fillStyle = bg;
    ctx.fillRect(bx - 22, 0, 44, CEIL_Y + 8);
    // Beam shadow underside
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(bx - 22, CEIL_Y, 44, 8);
    // Beam edge highlight
    ctx.strokeStyle = 'rgba(196,149,58,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx - 22, 0); ctx.lineTo(bx - 22, CEIL_Y);
    ctx.stroke();
  }

  // Ceiling grain lines
  ctx.strokeStyle = 'rgba(255,200,100,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const y = 6 + i * 6;
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(W, y);
    ctx.stroke();
  }
}

// ─── Floor with lacquered planks ─────────────────────
function drawFloor(ctx) {
  const g = ctx.createLinearGradient(0, FLOOR_Y, 0, H);
  g.addColorStop(0, '#2a1206');
  g.addColorStop(0.4, '#1a0c04');
  g.addColorStop(1, '#080402');
  ctx.fillStyle = g;
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);

  // Perspective planks — lines converge toward center horizon
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 6; i++) {
    const t  = i / 7;
    const y  = FLOOR_Y + t * (H - FLOOR_Y);
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(W, y);
    ctx.stroke();
  }
  // Floor reflection glow
  const rg = ctx.createRadialGradient(W / 2, FLOOR_Y, 10, W / 2, FLOOR_Y, 300);
  rg.addColorStop(0, 'rgba(180,100,20,0.07)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
}

// ─── Left structural column ───────────────────────────
function drawLeftColumn(ctx) {
  const g = ctx.createLinearGradient(0, 0, WALL_L, 0);
  g.addColorStop(0, '#0e0704');
  g.addColorStop(0.55, '#221208');
  g.addColorStop(1, '#3d1e0a');
  ctx.fillStyle = g;
  ctx.fillRect(0, CEIL_Y, WALL_L, FLOOR_Y - CEIL_Y);

  // Vertical wood grain
  ctx.strokeStyle = 'rgba(255,160,40,0.04)';
  ctx.lineWidth = 1;
  for (let x = 8; x < WALL_L; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, CEIL_Y); ctx.lineTo(x + 4, FLOOR_Y);
    ctx.stroke();
  }

  // Right-edge gold trim
  ctx.strokeStyle = 'rgba(196,149,58,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(WALL_L, CEIL_Y); ctx.lineTo(WALL_L, FLOOR_Y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196,149,58,0.15)';
  ctx.lineWidth = 4;
  ctx.stroke();
}

// ─── Altar cabinet ────────────────────────────────────
function drawAltar(ctx) {
  const AX1 = 20, AX2 = 172;
  const shelf1 = CEIL_Y + (FLOOR_Y - CEIL_Y) * 0.28;
  const shelf2 = CEIL_Y + (FLOOR_Y - CEIL_Y) * 0.55;
  const shelf3 = CEIL_Y + (FLOOR_Y - CEIL_Y) * 0.78;

  // Cabinet body
  const cg = ctx.createLinearGradient(AX1, 0, AX2, 0);
  cg.addColorStop(0, '#0d0704');
  cg.addColorStop(0.5, '#1e1006');
  cg.addColorStop(1, '#2e1a0a');
  ctx.fillStyle = cg;
  ctx.fillRect(AX1, CEIL_Y + 10, AX2 - AX1, FLOOR_Y - CEIL_Y - 10);

  // Cabinet border
  ctx.strokeStyle = 'rgba(196,149,58,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(AX1, CEIL_Y + 10, AX2 - AX1, FLOOR_Y - CEIL_Y - 10);

  // Shelves
  for (const sy of [shelf1, shelf2, shelf3]) {
    ctx.fillStyle = '#c4953a44';
    ctx.fillRect(AX1, sy - 2, AX2 - AX1, 5);
    ctx.fillStyle = '#00000044';
    ctx.fillRect(AX1, sy + 3, AX2 - AX1, 3);
  }

  // ── Top shelf: incense burner + candles ──
  drawCandle(ctx, 42, shelf1 - 14);
  drawIncenseBurner(ctx, 95, shelf1 - 6);
  drawCandle(ctx, 148, shelf1 - 14);

  // ── Middle shelf: small shrine ──
  drawShrine(ctx, 95, shelf2 - 8);

  // ── Bottom shelf: offering bowl ──
  drawOfferingBowl(ctx, 95, shelf3 - 6);
  drawSmallCandle(ctx, 50, shelf3 - 10);
  drawSmallCandle(ctx, 140, shelf3 - 10);
}

function drawCandle(ctx, x, y) {
  // Body
  ctx.fillStyle = '#d4bc8088';
  ctx.fillRect(x - 4, y, 8, 22);
  ctx.strokeStyle = '#8a705044';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - 4, y, 8, 22);
  // Wick
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y - 4);
  ctx.stroke();
  // Flame
  const fy = y - 12 + Math.sin(Date.now() * 0.005) * 1.5;
  const fg = ctx.createRadialGradient(x, fy, 0, x, fy, 12);
  fg.addColorStop(0, 'rgba(255,240,140,0.9)');
  fg.addColorStop(0.3, 'rgba(255,140,20,0.6)');
  fg.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(x, fy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,200,0.9)';
  ctx.beginPath();
  ctx.ellipse(x, fy + 1, 2.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSmallCandle(ctx, x, y) {
  ctx.fillStyle = '#d4bc8055';
  ctx.fillRect(x - 3, y, 6, 14);
  const fy = y - 8;
  const fg = ctx.createRadialGradient(x, fy, 0, x, fy, 8);
  fg.addColorStop(0, 'rgba(255,200,80,0.7)');
  fg.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(x, fy, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawIncenseBurner(ctx, x, y) {
  // Bronze bowl
  ctx.fillStyle = '#8b6020';
  ctx.beginPath();
  ctx.ellipse(x, y, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c4953a';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Highlight
  ctx.fillStyle = 'rgba(220,180,80,0.25)';
  ctx.beginPath();
  ctx.ellipse(x - 5, y - 2, 8, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Incense sticks
  for (let i = -1; i <= 1; i++) {
    ctx.strokeStyle = 'rgba(180,140,60,0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + i * 7, y - 3);
    ctx.lineTo(x + i * 9, y - 45);
    ctx.stroke();
    // Smoke
    ctx.strokeStyle = 'rgba(200,190,170,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let j = 0; j < 14; j++) {
      const px = x + i * 9 + Math.sin(j * 0.8 + i * 1.5) * 5;
      const py = y - 47 - j * 4;
      j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function drawShrine(ctx, x, y) {
  const w = 55, h = 50;
  // Pedestal
  ctx.fillStyle = '#1e1006';
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.strokeStyle = '#c4953a44';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2, y - h, w, h);
  // Roof
  ctx.fillStyle = '#3d1e0a';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 6, y - h);
  ctx.lineTo(x, y - h - 18);
  ctx.lineTo(x + w / 2 + 6, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c4953a55';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Glow inside shrine
  const sg = ctx.createRadialGradient(x, y - h * 0.5, 0, x, y - h * 0.5, 20);
  sg.addColorStop(0, 'rgba(255,180,40,0.15)');
  sg.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(x - w / 2, y - h, w, h);
}

function drawOfferingBowl(ctx, x, y) {
  // Bowl shape
  ctx.fillStyle = '#5c3010';
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c4953a55';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Fruit/offering
  ctx.fillStyle = '#8b2020';
  ctx.beginPath();
  ctx.arc(x - 6, y - 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b4010';
  ctx.beginPath();
  ctx.arc(x + 6, y - 5, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Right structural column ──────────────────────────
function drawRightColumn(ctx) {
  const g = ctx.createLinearGradient(WALL_R, 0, W, 0);
  g.addColorStop(0, '#3d1e0a');
  g.addColorStop(0.45, '#221208');
  g.addColorStop(1, '#0e0704');
  ctx.fillStyle = g;
  ctx.fillRect(WALL_R, CEIL_Y, W - WALL_R, FLOOR_Y - CEIL_Y);

  // Left-edge gold trim
  ctx.strokeStyle = 'rgba(196,149,58,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(WALL_R, CEIL_Y); ctx.lineTo(WALL_R, FLOOR_Y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196,149,58,0.15)';
  ctx.lineWidth = 4;
  ctx.stroke();
}

// ─── Garden door/opening ──────────────────────────────
function drawGarden(ctx) {
  const DX1 = WALL_R + 22, DX2 = W - 8;
  const DY1 = CEIL_Y + 12, DY2 = FLOOR_Y - 8;

  // Exterior sky (dusk/night, slight moonlight)
  const sky = ctx.createLinearGradient(0, DY1, 0, DY2);
  sky.addColorStop(0, '#1a2a40');
  sky.addColorStop(0.45, '#0f1e30');
  sky.addColorStop(0.7, '#0a1408');
  sky.addColorStop(1, '#050a04');
  ctx.fillStyle = sky;
  ctx.fillRect(DX1, DY1, DX2 - DX1, DY2 - DY1);

  // Moon
  const mx = DX1 + (DX2 - DX1) * 0.55, my = DY1 + 38;
  ctx.fillStyle = 'rgba(220,230,255,0.22)';
  ctx.beginPath();
  ctx.arc(mx, my, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,215,255,0.14)';
  ctx.beginPath();
  ctx.arc(mx, my, 28, 0, Math.PI * 2);
  ctx.fill();

  // Star hints
  const stars = [[DX1+15,DY1+20],[DX1+40,DY1+12],[DX1+90,DY1+8],[DX1+130,DY1+25],[DX1+60,DY1+40]];
  for (const [sx,sy] of stars) {
    ctx.fillStyle = 'rgba(200,220,255,0.5)';
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground level
  const groundY = DY2 - 55;
  ctx.fillStyle = '#0a1206';
  ctx.fillRect(DX1, groundY, DX2 - DX1, DY2 - groundY);

  // Tree silhouettes (bamboo-style)
  drawGardenTrees(ctx, DX1, DY1, DX2, DY2);

  // Moonlight reflection on ground
  const mg = ctx.createRadialGradient(mx, groundY, 0, mx, groundY, 80);
  mg.addColorStop(0, 'rgba(140,160,200,0.1)');
  mg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(DX1, groundY - 10, DX2 - DX1, DY2 - groundY + 10);

  // Door frame overlay
  ctx.strokeStyle = '#2a1408';
  ctx.lineWidth = 18;
  ctx.strokeRect(DX1 - 9, DY1 - 9, DX2 - DX1 + 18, DY2 - DY1 + 18);
  ctx.strokeStyle = '#c4953a33';
  ctx.lineWidth = 1;
  ctx.strokeRect(DX1, DY1, DX2 - DX1, DY2 - DY1);
}

function drawGardenTrees(ctx, x1, y1, x2, y2) {
  const groundY = y2 - 55;

  // Bamboo stalks
  const bamboos = [
    { x: x1 + 18, h: (y2 - y1) * 0.72, w: 4 },
    { x: x1 + 48, h: (y2 - y1) * 0.88, w: 5 },
    { x: x1 + 78, h: (y2 - y1) * 0.65, w: 4 },
    { x: x1 + 112, h: (y2 - y1) * 0.78, w: 5 },
    { x: x1 + 140, h: (y2 - y1) * 0.60, w: 3 },
    { x: x1 + 158, h: (y2 - y1) * 0.55, w: 4 },
  ];

  for (const b of bamboos) {
    const treeTop = groundY - b.h;
    const sg = ctx.createLinearGradient(b.x, treeTop, b.x + b.w, treeTop);
    sg.addColorStop(0, '#0a1a08');
    sg.addColorStop(1, '#0d2008');
    ctx.fillStyle = sg;
    ctx.fillRect(b.x, treeTop, b.w, b.h);
    // Bamboo nodes
    for (let j = 0; j < 8; j++) {
      const ny = treeTop + j * b.h / 8;
      ctx.fillStyle = 'rgba(15,35,10,0.8)';
      ctx.fillRect(b.x - 1, ny, b.w + 2, 2);
    }
    // Leaf cluster at top
    ctx.fillStyle = 'rgba(8,28,8,0.85)';
    ctx.beginPath();
    ctx.ellipse(b.x + b.w / 2, treeTop - 8, b.w * 2.5 + 8, 22, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(b.x + b.w / 2 - 12, treeTop - 4, b.w * 2 + 4, 16, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground shrubs
  ctx.fillStyle = 'rgba(8,22,6,0.8)';
  ctx.beginPath();
  ctx.ellipse((x1 + x2) / 2, groundY + 10, (x2 - x1) * 0.55, 20, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Main wall (center area) ─────────────────────────
function drawWall(ctx) {
  const WX1 = WALL_L + 1, WX2 = WALL_R - 1;
  const WY1 = CEIL_Y, WY2 = FLOOR_Y;

  const wg = ctx.createLinearGradient(WX1, WY1, WX1, WY2);
  wg.addColorStop(0, '#221008');
  wg.addColorStop(0.4, '#2e1a0a');
  wg.addColorStop(0.75, '#221008');
  wg.addColorStop(1, '#140a04');
  ctx.fillStyle = wg;
  ctx.fillRect(WX1, WY1, WX2 - WX1, WY2 - WY1);

  // Subtle horizontal plank lines
  ctx.strokeStyle = 'rgba(255,150,50,0.03)';
  ctx.lineWidth = 1;
  for (let y = WY1 + 20; y < WY2; y += 22) {
    ctx.beginPath();
    ctx.moveTo(WX1, y); ctx.lineTo(WX2, y);
    ctx.stroke();
  }
}

// ─── Calligraphy scroll ──────────────────────────────
function drawCalligraphyScroll(ctx) {
  const SX = 400, SY = 96, SW = 112, SH = 145;

  // Bamboo top rod
  ctx.fillStyle = '#8b6020';
  ctx.beginPath();
  ctx.roundRect(SX - 10, SY - 4, SW + 20, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#c4953a88';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Paper
  const pg = ctx.createLinearGradient(SX, SY, SX + SW, SY);
  pg.addColorStop(0, '#d4c090');
  pg.addColorStop(0.5, '#e8d4a0');
  pg.addColorStop(1, '#d0b878');
  ctx.fillStyle = pg;
  ctx.fillRect(SX, SY + 4, SW, SH);

  // Paper edges
  ctx.strokeStyle = '#a08040';
  ctx.lineWidth = 1;
  ctx.strokeRect(SX, SY + 4, SW, SH);

  // Inner border line
  ctx.strokeStyle = '#8a6020';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(SX + 6, SY + 10, SW - 12, SH - 12);

  // Chinese/Vietnamese characters (brushstroke style)
  ctx.fillStyle = '#1a0e04ee';
  ctx.font = 'bold 38px "Merriweather", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('琴', SX + SW / 2, SY + 4 + SH * 0.32);
  ctx.fillText('音', SX + SW / 2, SY + 4 + SH * 0.7);

  // Bottom rod
  ctx.fillStyle = '#8b6020';
  ctx.beginPath();
  ctx.roundRect(SX - 10, SY + SH + 2, SW + 20, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#c4953a88';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Hanging strings
  for (const hx of [SX - 2, SX + SW + 2]) {
    ctx.strokeStyle = 'rgba(196,149,58,0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(hx, SY - 4);
    ctx.lineTo(hx, SY - 22);
    ctx.stroke();
  }

  // Scroll shadow / aged effect
  const shadow = ctx.createLinearGradient(SX, SY, SX, SY + SH);
  shadow.addColorStop(0, 'rgba(100,60,10,0.15)');
  shadow.addColorStop(0.5, 'rgba(0,0,0,0)');
  shadow.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = shadow;
  ctx.fillRect(SX, SY + 4, SW, SH);
}

// ─── Candlelight ambient glow ─────────────────────────
function drawCandlelight(ctx, songTime) {
  // Main warm glow from below center (where candles are)
  const cx = W / 2 + 30, cy = H * 0.62;

  const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420);
  g1.addColorStop(0, 'rgba(180,90,15,0.18)');
  g1.addColorStop(0.35, 'rgba(140,65,10,0.09)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Left altar candle glow
  const ag = ctx.createRadialGradient(95, CEIL_Y + (FLOOR_Y - CEIL_Y) * 0.25, 0,
    95, CEIL_Y + (FLOOR_Y - CEIL_Y) * 0.25, 160);
  ag.addColorStop(0, 'rgba(255,180,40,0.18)');
  ag.addColorStop(0.4, 'rgba(220,120,20,0.08)');
  ag.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, W, H);

  // Flicker
  const f = Math.sin(songTime * 6.7) * 0.007 + Math.sin(songTime * 13.3) * 0.004;
  if (Math.abs(f) > 0.002) {
    const fg = ctx.createRadialGradient(95, 220, 0, 95, 220, 100);
    fg.addColorStop(0, `rgba(255,200,60,${Math.abs(f)})`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, W, H);
  }
}

// ─── Vignette ─────────────────────────────────────────
function drawVignette(ctx) {
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.88);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}
