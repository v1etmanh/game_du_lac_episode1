import { GAME_ASSETS } from "../assets/gameAssetManifest.js";

const FLYING_STATES = new Set(["ESCAPE", "PANIC", "CLAP_PANIC"]);

export class Renderer {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.settings = settings;
    this.images = new Map();
    this.startedAt = typeof performance === "undefined" ? Date.now() : performance.now();

    this.loadAssets();
  }

  setSettings(settings) {
    this.settings = settings;
  }

  render(world) {
    const ctx = this.context;
    const settings = this.settings;

    ctx.clearRect(0, 0, settings.worldWidth, settings.worldHeight);
    this.drawField(ctx, settings);
    this.drawDecorations(ctx, world.decorations);
    this.drawCoop(ctx, world.coop);
    this.drawGrain(ctx, world.grainPiles);
    this.drawClapWaves(ctx, world.clapWaves);
    this.drawObstacles(ctx, world.obstacles);

    for (const chicken of world.chickens) {
      this.drawChicken(ctx, chicken, world.player);
    }

    this.drawPlayer(ctx, world.player);
  }

  loadAssets() {
    if (typeof Image === "undefined") {
      return;
    }

    const assetEntries = {
      hen: GAME_ASSETS.chickens.sheets.hen,
      rooster: GAME_ASSETS.chickens.sheets.rooster,
      ...Object.fromEntries(
        Object.entries(GAME_ASSETS.player.animations).map(([animation, src]) => [`player_${animation}`, src])
      ),
      background: GAME_ASSETS.environment.background,
      coopOpen: GAME_ASSETS.environment.coopOpen,
      coopClosed: GAME_ASSETS.environment.coopClosed,
      strawPile: GAME_ASSETS.environment.strawPile,
      fenceSegment: GAME_ASSETS.environment.fenceSegment,
      bananaTree: GAME_ASSETS.environment.bananaTree
    };

    for (const [key, src] of Object.entries(assetEntries)) {
      const image = new Image();
      image.src = src;
      this.images.set(key, image);
    }
  }

  getImage(key) {
    const image = this.images.get(key);
    return image && image.complete && image.naturalWidth > 0 ? image : null;
  }

  drawField(ctx, settings) {
    const background = this.getImage("background");

    if (background) {
      ctx.drawImage(background, 0, 0, settings.worldWidth, settings.worldHeight);
      return;
    }

    ctx.fillStyle = "#879f5a";
    ctx.fillRect(0, 0, settings.worldWidth, settings.worldHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= settings.worldWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, settings.worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= settings.worldHeight; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(settings.worldWidth, y);
      ctx.stroke();
    }
  }

  drawDecorations(ctx, decorations = []) {
    for (const decoration of decorations) {
      const image = this.getImage(decoration.kind === "bananaTree" ? "bananaTree" : "fenceSegment");

      if (!image) {
        continue;
      }

      ctx.save();
      ctx.translate(decoration.x, decoration.y);
      ctx.rotate(decoration.rotation ?? 0);
      ctx.drawImage(
        image,
        -decoration.width / 2,
        -decoration.height / 2,
        decoration.width,
        decoration.height
      );
      ctx.restore();
    }
  }

  drawCoop(ctx, coop) {
    // Vẽ chuồng bằng canvas thuần, không cần ảnh
    const thickness = coop.wallThickness;
    const gateCenterY = coop.y + coop.height / 2;
    const gateTop = gateCenterY - coop.gateWidth / 2;
    const gateBottom = gateCenterY + coop.gateWidth / 2;

    ctx.save();
    ctx.fillStyle = "rgba(220, 245, 205, 0.2)";
    ctx.fillRect(coop.x, coop.y, coop.width, coop.height);

    ctx.strokeStyle = "rgba(82, 53, 30, 0.55)";
    ctx.lineWidth = 2;
    for (let x = coop.x + 18; x < coop.x + coop.width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, coop.y);
      ctx.lineTo(x, coop.y + coop.height);
      ctx.stroke();
    }

    ctx.fillStyle = "#52351e";
    ctx.fillRect(coop.x, coop.y - thickness / 2, coop.width, thickness);
    ctx.fillRect(coop.x, coop.y + coop.height - thickness / 2, coop.width, thickness);
    ctx.fillRect(coop.x + coop.width - thickness / 2, coop.y, thickness, coop.height);
    ctx.fillRect(coop.x - thickness / 2, coop.y, thickness, gateTop - coop.y);
    ctx.fillRect(coop.x - thickness / 2, gateBottom, thickness, coop.y + coop.height - gateBottom);

    if (coop.closed) {
      ctx.fillStyle = "#2f1c13";
      ctx.fillRect(coop.x - thickness / 2, gateTop, thickness, coop.gateWidth);
    } else {
      ctx.strokeStyle = "#f2cd5c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(coop.x - thickness, gateTop);
      ctx.lineTo(coop.x - thickness - 28, gateTop - 20);
      ctx.moveTo(coop.x - thickness, gateBottom);
      ctx.lineTo(coop.x - thickness - 28, gateBottom + 20);
      ctx.stroke();
    }

    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#102018";
    ctx.fillText(coop.closed ? "LOCKED" : "OPEN", coop.x + 44, coop.y + coop.height + 22);
    ctx.restore();
  }

  drawCoopGameplayZone(ctx, coop) {
    const gateCenterY = coop.y + coop.height / 2;
    const gateTop = gateCenterY - coop.gateWidth / 2;
    const gateBottom = gateCenterY + coop.gateWidth / 2;

    ctx.save();
    ctx.fillStyle = "rgba(246, 220, 107, 0.16)";
    ctx.strokeStyle = "rgba(44, 30, 18, 0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.fillRect(coop.x, coop.y, coop.width, coop.height);
    ctx.strokeRect(coop.x, coop.y, coop.width, coop.height);

    ctx.setLineDash([]);
    ctx.strokeStyle = coop.closed ? "rgba(78, 35, 18, 0.9)" : "rgba(246, 211, 83, 0.95)";
    ctx.lineWidth = coop.closed ? 7 : 9;
    ctx.beginPath();
    ctx.moveTo(coop.x, gateTop);
    ctx.lineTo(coop.x, gateBottom);
    ctx.stroke();

    if (!coop.closed) {
      ctx.strokeStyle = "rgba(246, 211, 83, 0.75)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(coop.x - 36, gateCenterY);
      ctx.lineTo(coop.x + 20, gateCenterY);
      ctx.moveTo(coop.x + 6, gateCenterY - 10);
      ctx.lineTo(coop.x + 20, gateCenterY);
      ctx.lineTo(coop.x + 6, gateCenterY + 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawClapWaves(ctx, waves) {
    for (const wave of waves) {
      const alpha = Math.max(0, 1 - wave.radius / wave.maxRadius);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 245, 180, ${0.65 * alpha})`;
      ctx.lineWidth = wave.width;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(70, 45, 20, ${0.45 * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawGrain(ctx, piles) {
    for (const pile of piles) {
      ctx.save();
      ctx.fillStyle = pile.tooCloseToCoopGate ? "rgba(150, 75, 55, 0.12)" : "rgba(169, 116, 51, 0.16)";
      ctx.beginPath();
      ctx.arc(pile.x, pile.y, pile.attractionRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pile.tooCloseToCoopGate ? "#8d6c56" : "#d6ad62";
      const grainCount = Math.max(3, Math.ceil(pile.amount));
      for (let i = 0; i < grainCount; i += 1) {
        const angle = (i / grainCount) * Math.PI * 2;
        const radius = 3 + (i % 4) * 2.2;
        ctx.beginPath();
        ctx.arc(pile.x + Math.cos(angle) * radius, pile.y + Math.sin(angle) * radius, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (pile.tooCloseToCoopGate) {
        ctx.strokeStyle = "rgba(80, 35, 20, 0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pile.x, pile.y, pile.radius + 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pile.x - 8, pile.y - 8);
        ctx.lineTo(pile.x + 8, pile.y + 8);
        ctx.moveTo(pile.x + 8, pile.y - 8);
        ctx.lineTo(pile.x - 8, pile.y + 8);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawObstacles(ctx, obstacles) {
    for (const obstacle of obstacles) {
      if (obstacle.kind === "hay") {
        const strawPile = this.getImage("strawPile");

        if (strawPile) {
          const size = obstacle.radius * 2.6;
          ctx.save();
          ctx.drawImage(strawPile, obstacle.x - size / 2, obstacle.y - size * 0.38, size, size * 0.74);

          if (this.settings.debugShowCollision) {
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
          continue;
        }
      }

      ctx.save();
      ctx.fillStyle = obstacle.kind === "hay" ? "#3b3525" : "#202322";
      ctx.strokeStyle = obstacle.kind === "hay" ? "#b89d52" : "#111";
      ctx.lineWidth = obstacle.kind === "hay" ? 4 : 2;
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawChicken(ctx, chicken, player) {
    const settings = this.settings;

    if (settings.debugShowRadii && !chicken.secured) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      for (const radius of [chicken.alertRadius, chicken.pressureRadius, chicken.panicRadius]) {
        ctx.beginPath();
        ctx.arc(chicken.x, chicken.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (settings.debugShowCone && ["ESCAPE", "PANIC"].includes(chicken.state)) {
      const half = ((chicken.state === "PANIC" ? Math.min(150, settings.escapeConeAngle + 35) : settings.escapeConeAngle) * Math.PI) / 360;
      const base = Math.atan2(chicken.lastEscapeBase.y, chicken.lastEscapeBase.x);
      ctx.save();
      ctx.fillStyle = chicken.state === "PANIC" ? "rgba(226, 85, 55, 0.18)" : "rgba(242, 205, 92, 0.18)";
      ctx.beginPath();
      ctx.moveTo(chicken.x, chicken.y);
      ctx.arc(chicken.x, chicken.y, 82, base - half, base + half);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const hasChickenSprite = Boolean(this.getImage(chicken.type === "rooster" ? "rooster" : "hen"));

    if (settings.debugShowDirection && !hasChickenSprite) {
      ctx.save();
      ctx.strokeStyle = "#1d2630";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chicken.x, chicken.y);
      ctx.lineTo(chicken.x + chicken.directionX * 30, chicken.y + chicken.directionY * 30);
      ctx.stroke();
      ctx.restore();
    }

    const renderedSprite = this.drawChickenSprite(ctx, chicken);

    if (!renderedSprite) {
      ctx.save();
      ctx.fillStyle = chicken.secured ? "#9bd67b" : chicken.type === "rooster" ? "#c83232" : "#44b65a";
      ctx.strokeStyle = "#142117";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(chicken.x, chicken.y, chicken.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(chicken.x + chicken.directionX * chicken.radius * 0.55, chicken.y + chicken.directionY * chicken.radius * 0.55, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (renderedSprite && chicken.secured) {
      ctx.save();
      ctx.strokeStyle = "rgba(155, 214, 123, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(chicken.x, chicken.y, chicken.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (settings.debugShowState) {
      ctx.save();
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = "#102018";
      ctx.fillText(chicken.state, chicken.x + 12, chicken.y - 10);
      ctx.restore();
    }

    if (settings.debugShowCollision) {
      ctx.save();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.arc(chicken.x, chicken.y, chicken.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (settings.debugShowCone && ["ESCAPE", "PANIC"].includes(chicken.state)) {
      ctx.save();
      ctx.strokeStyle = "rgba(60, 20, 20, 0.45)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(chicken.x, chicken.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawChickenSprite(ctx, chicken) {
    const image = this.getImage(chicken.type === "rooster" ? "rooster" : "hen");

    if (!image) {
      return false;
    }

    const { frameWidth, frameHeight, framesPerRow, rows } = GAME_ASSETS.chickens;
    const direction = this.getChickenDirection(chicken);
    const action = FLYING_STATES.has(chicken.state) ? "fly" : "walk";
    const row = rows[`${action}_${direction}`];
    const size = chicken.type === "rooster" ? 46 : 40;
    const now = typeof performance === "undefined" ? Date.now() : performance.now();
    const elapsedSeconds = (now - this.startedAt) / 1000;
    const fps = action === "fly" ? 11 : 7;
    const frameOffset = Number(chicken.id.slice(-2)) || 0;
    const frame = chicken.speed > 0 ? Math.floor(elapsedSeconds * fps + frameOffset) % framesPerRow : 0;

    ctx.save();
    ctx.drawImage(
      image,
      frame * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      chicken.x - size / 2,
      chicken.y - size / 2,
      size,
      size
    );
    ctx.restore();

    return true;
  }

  getChickenDirection(chicken) {
    if (Math.abs(chicken.directionX) > Math.abs(chicken.directionY)) {
      return chicken.directionX < 0 ? "left" : "right";
    }

    return chicken.directionY < 0 ? "up" : "down";
  }

  drawPlayer(ctx, player) {
    const sprinting = player.sprintActiveTime > 0;

    if (sprinting) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 245, 180, 0.75)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.drawPixelPlayer(ctx, player);
  }

  drawPixelPlayer(ctx, player) {
    const sprinting = player.sprintActiveTime > 0;
    const direction = this.getPlayerDirection(player);
    const ps = 3;

    const _ = null;
    const H = "#4a2c0a";
    const S = "#f5c89a";
    const E = "#120500";
    const G = "#d4aa30";
    const D = "#b89020";
    const B = sprinting ? "#72beff" : "#3a7fd5";
    const P = "#2c4a8c";
    const O = "#2a1a0a";
    const K = "#ffb0a0";

    const maps = {
      down: [
        [_,_,G,G,G,G,G,G,_,_],
        [_,G,G,G,G,G,G,G,G,_],
        [D,D,D,D,D,D,D,D,D,D],
        [_,H,H,S,S,S,S,H,H,_],
        [_,H,S,S,S,S,S,S,H,_],
        [_,H,S,E,S,S,E,S,H,_],
        [_,H,S,S,S,S,S,S,H,_],
        [_,H,S,K,S,S,K,S,H,_],
        [_,_,H,S,S,S,S,H,_,_],
        [B,B,B,B,B,B,B,B,B,B],
        [B,B,B,B,B,B,B,B,B,B],
        [B,B,B,B,B,B,B,B,B,B],
        [_,_,P,P,P,P,P,P,_,_],
        [_,_,P,P,_,_,P,P,_,_],
        [_,_,P,P,_,_,P,P,_,_],
        [_,_,O,O,_,_,O,O,_,_],
      ],
      up: [
        [_,_,G,G,G,G,G,G,_,_],
        [_,G,G,G,G,G,G,G,G,_],
        [D,D,D,D,D,D,D,D,D,D],
        [_,H,H,H,H,H,H,H,H,_],
        [_,H,H,H,H,H,H,H,H,_],
        [_,H,H,H,H,H,H,H,H,_],
        [_,H,H,H,H,H,H,H,H,_],
        [_,H,H,H,H,H,H,H,H,_],
        [_,_,H,H,H,H,H,H,_,_],
        [B,B,B,B,B,B,B,B,B,B],
        [B,B,B,B,B,B,B,B,B,B],
        [B,B,B,B,B,B,B,B,B,B],
        [_,_,P,P,P,P,P,P,_,_],
        [_,_,P,P,_,_,P,P,_,_],
        [_,_,P,P,_,_,P,P,_,_],
        [_,_,O,O,_,_,O,O,_,_],
      ],
      right: [
        [_,_,G,G,G,G,_,_,_,_],
        [_,G,G,G,G,G,G,_,_,_],
        [G,G,G,G,G,G,G,G,_,_],
        [_,H,H,H,H,H,H,_,_,_],
        [_,H,S,S,S,S,H,H,_,_],
        [_,H,S,E,S,S,H,_,_,_],
        [_,H,S,S,S,S,H,_,_,_],
        [_,H,S,K,S,S,H,_,_,_],
        [_,_,H,S,S,H,_,_,_,_],
        [_,B,B,B,B,B,B,B,B,_],
        [_,B,B,B,B,B,B,B,B,_],
        [_,B,B,B,B,B,B,B,B,_],
        [_,_,P,P,P,P,P,_,_,_],
        [_,_,_,P,P,P,_,_,_,_],
        [_,_,_,P,P,P,_,_,_,_],
        [_,_,_,O,O,O,_,_,_,_],
      ],
    };
    maps.left = maps.right.map((row) => [...row].reverse());

    const map = maps[direction] ?? maps.down;
    const startX = Math.round(player.x - (10 * ps) / 2);
    const startY = Math.round(player.y - 12 * ps);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 10; c++) {
        const color = map[r][c];
        if (color === null) continue;
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * ps, startY + r * ps, ps, ps);
      }
    }
    if (sprinting) {
      const lineDir = direction === "right" ? -1 : direction === "left" ? 1 : 0;
      if (lineDir !== 0) {
        ctx.strokeStyle = "rgba(255, 245, 120, 0.85)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const ly = startY + (8 + i * 2) * ps;
          ctx.beginPath();
          ctx.moveTo(player.x + lineDir * 18, ly);
          ctx.lineTo(player.x + lineDir * 28, ly);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawPlayerSprite(ctx, player) {
    const direction = this.getPlayerDirection(player);
    const isMoving = player.velocityX !== 0 || player.velocityY !== 0;
    const action = isMoving ? (player.sprintActiveTime > 0 ? "run" : "walk") : "idle";
    const animation = action === "idle" ? "idle" : `${action}_${direction}`;
    const image = this.getImage(`player_${animation}`);

    if (!image) {
      return false;
    }

    const { frameWidth, frameHeight, framesPerRow, idleDirections } = GAME_ASSETS.player;
    const now = typeof performance === "undefined" ? Date.now() : performance.now();
    const elapsedSeconds = (now - this.startedAt) / 1000;
    const fps = action === "run" ? 12 : 7;
    const frame = action === "idle"
      ? idleDirections.indexOf(direction)
      : Math.floor(elapsedSeconds * fps) % framesPerRow;
    const size = 46;

    ctx.save();
    ctx.drawImage(
      image,
      frame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      player.x - size / 2,
      player.y - size / 2,
      size,
      size
    );
    ctx.restore();

    return true;
  }

  getPlayerDirection(player) {
    if (Math.abs(player.directionX) > Math.abs(player.directionY)) {
      return player.directionX < 0 ? "left" : "right";
    }

    return player.directionY < 0 ? "up" : "down";
  }
}
