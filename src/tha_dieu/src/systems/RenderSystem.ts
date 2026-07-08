import { AssetLoader } from "../engine/AssetLoader";
import { Camera } from "../engine/Camera";
import { Bird } from "../entities/Bird";
import { Kite } from "../entities/Kite";
import { MusicNote } from "../entities/MusicNote";
import { Obstacle } from "../entities/Obstacle";
import { Particle } from "../entities/Particle";
import { Player } from "../entities/Player";
import { WindGust } from "../entities/WindGust";
import { Rope } from "../physics/Rope";
import { Wind } from "../physics/Wind";

export interface RenderFrame {
  camera: Camera;
  player: Player;
  kite: Kite;
  rope: Rope;
  wind: Wind;
  obstacles: Obstacle[];
  birds: Bird[];
  windGusts: WindGust[];
  musicNotes: MusicNote[];
  particles: Particle[];
  distance: number;
  groundY: number;
  paused: boolean;
  crashed: boolean;
}

export class RenderSystem {
  private readonly rollingRockVariants = new WeakMap<Obstacle, boolean>();

  render(context: CanvasRenderingContext2D, width: number, height: number, frame: RenderFrame): void {
    context.clearRect(0, 0, width, height);
    this.drawSky(context, width, height);
    this.drawClouds(context, width, height, frame.camera.position.x * 0.4);
    this.drawMountains(context, width, height, frame.groundY - frame.camera.position.y+50, frame.camera.position.x * 0.7);
    this.withWorld(context, frame.camera, () => {
      this.drawGround(context, width, frame.groundY, frame.camera.position.x);
      frame.windGusts.forEach((gust) => this.drawWindGust(context, gust));
      frame.musicNotes.forEach((note) => this.drawMusicNote(context, note));
      frame.obstacles.forEach((obstacle) => this.drawObstacle(context, obstacle));
      this.drawPlayerSpeedTrail(context, frame.player);
      this.drawPlayer(context, frame.player);
      this.drawJumpChargeIndicator(context, frame.player);
      this.drawRope(context, frame.player, frame.kite, frame.rope);
      this.drawKite(context, frame.kite, frame.wind);
      frame.birds.forEach((bird) => this.drawBird(context, bird));
      frame.particles.forEach((particle) => this.drawParticle(context, particle));
    });
  }

  private withWorld(context: CanvasRenderingContext2D, camera: Camera, draw: () => void): void {
    context.save();
    context.translate(-camera.position.x, -camera.position.y);
    draw();
    context.restore();
  }

  private drawSky(context: CanvasRenderingContext2D, width: number, height: number): void {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#a8d7ee");
    gradient.addColorStop(0.62, "#e2f3eb");
    gradient.addColorStop(1, "#f5ecd6");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(255, 248, 217, 0.56)";
    context.beginPath();
    context.arc(width - 130, 92, 36, 0, Math.PI * 2);
    context.fill();
  }

  private drawClouds(context: CanvasRenderingContext2D, width: number, height: number, offset: number): void {
    const cloudImage = AssetLoader.get("cloud");
    if (cloudImage) {
      const drawW = cloudImage.naturalWidth * 0.55;
      const drawH = cloudImage.naturalHeight * 0.55;
      const spacing = drawW + 110;
      const count = Math.ceil(width / spacing) + 3;
      const base = Math.floor(offset / spacing) * spacing;

      context.globalAlpha = 0.85;
      for (let index = -1; index < count; index += 1) {
        const x = index * spacing - (offset - base) + 40;
        const y = 60 + ((index * 47) % 85);
        context.drawImage(cloudImage, x, y, drawW, drawH);
      }
      context.globalAlpha = 1;
      return;
    }

    const count = Math.ceil(width / 260) + 3;
    const base = Math.floor(offset / 260) * 260;

    for (let index = -1; index < count; index += 1) {
      const x = index * 260 - (offset - base) + 40;
      const y = 70 + ((index * 47) % 85);
      context.fillStyle = "rgba(255, 255, 255, 0.64)";
      context.beginPath();
      context.ellipse(x, y, 42, 17, 0, 0, Math.PI * 2);
      context.ellipse(x + 34, y + 6, 55, 20, 0, 0, Math.PI * 2);
      context.ellipse(x - 36, y + 9, 32, 14, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  private drawMountains(context: CanvasRenderingContext2D, width: number, height: number, groundY: number, offset: number): void {
    const farImage = AssetLoader.get("farMountain");
    const nearImage = AssetLoader.get("nearMountain");

    if (farImage && nearImage) {
      this.drawMountainLayer(context, farImage, width, groundY, offset * 0.4, 350);
      this.drawMountainLayer(context, nearImage, width, groundY, offset * 0.7, 280);
      return;
    }

    context.save();
    context.translate(-offset % 520, 0);
    for (let x = -520; x < width + 1040; x += 520) {
      context.fillStyle = "#9fbea9";
      context.beginPath();
      context.moveTo(x, groundY + 90);
      context.lineTo(x + 150, groundY - 170);
      context.lineTo(x + 330, groundY + 90);
      context.closePath();
      context.fill();

      context.fillStyle = "#7fa58d";
      context.beginPath();
      context.moveTo(x + 210, groundY + 92);
      context.lineTo(x + 390, groundY - 132);
      context.lineTo(x + 610, groundY + 92);
      context.closePath();
      context.fill();
    }
    context.restore();

    context.fillStyle = "rgba(255, 255, 255, 0.16)";
    context.fillRect(0, groundY - 145, width, height);
  }

  private drawMountainLayer(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    groundY: number,
    offset: number,
    drawHeight: number,
  ): void {
    const aspect = image.naturalWidth / image.naturalHeight;
    const drawWidth = drawHeight * aspect;
    const y = groundY - drawHeight + 40;
    const startIndex = Math.floor(offset / drawWidth) - 1;
    const endX = width + drawWidth * 2;

    for (let index = startIndex; index * drawWidth - offset < endX; index += 1) {
      const x = index * drawWidth - offset;
      context.drawImage(image, x, y, drawWidth, drawHeight);
    }
  }

  private drawGround(context: CanvasRenderingContext2D, width: number, groundY: number, cameraX: number): void {
    const groundImage = AssetLoader.get("ground");
    if (groundImage) {
      const trim = AssetLoader.getTopTrim("ground");
      const sourceY = groundImage.naturalHeight * trim;
      const sourceHeight = groundImage.naturalHeight - sourceY;
      const aspect = groundImage.naturalWidth / sourceHeight;
      const drawHeight = 150;
      const drawWidth = drawHeight * aspect;
      const startX = Math.floor((cameraX - drawWidth) / drawWidth) * drawWidth;
      const endX = cameraX + width + drawWidth;

      for (let x = startX; x <= endX; x += drawWidth) {
        context.drawImage(
          groundImage,
          0,
          sourceY,
          groundImage.naturalWidth,
          sourceHeight,
          x,
          groundY - 12,
          drawWidth,
          drawHeight,
        );
      }
      return;
    }

    const startX = Math.floor((cameraX - 80) / 80) * 80;
    const endX = cameraX + width + 160;

    context.fillStyle = "#7cac6f";
    context.beginPath();
    context.moveTo(startX, groundY);
    for (let x = startX; x <= endX; x += 40) {
      const y = groundY + Math.sin(x * 0.015) * 5;
      context.lineTo(x, y);
    }
    context.lineTo(endX, groundY + 260);
    context.lineTo(startX, groundY + 260);
    context.closePath();
    context.fill();

    context.strokeStyle = "rgba(45, 93, 55, 0.28)";
    context.lineWidth = 2;
    for (let x = startX; x <= endX; x += 80) {
      context.beginPath();
      context.moveTo(x, groundY + 13);
      context.quadraticCurveTo(x + 18, groundY + 1, x + 36, groundY + 12);
      context.stroke();
    }
  }

  private drawFitHeightImage(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    centerX: number,
    bottomY: number,
    targetHeight: number,
    groundOverlap = 0,
  ): void {
    const aspect = image.naturalWidth / image.naturalHeight;
    const drawHeight = targetHeight;
    const drawWidth = drawHeight * aspect;
    context.drawImage(image, centerX - drawWidth / 2, bottomY + groundOverlap - drawHeight, drawWidth, drawHeight);
  }

  private drawObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle): void {
    const ground = obstacle.groundY;
    const centerX = obstacle.x + obstacle.width / 2;

    if (obstacle.type === "bambooPole") {
      const image = AssetLoader.get("bambooPole");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height, 0);
        return;
      }
      context.fillStyle = "#cda455";
      context.fillRect(centerX - 6, ground - obstacle.height, 12, obstacle.height);
      return;
    }

    if (obstacle.type === "lowBranch") {
      const image = AssetLoader.get("lowBranch");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground - 86, 84, 0);
        return;
      }
      context.strokeStyle = "#6d4429";
      context.lineWidth = 14;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(obstacle.x + 8, ground - 128);
      context.quadraticCurveTo(centerX, ground - 158, obstacle.x + obstacle.width - 10, ground - 120);
      context.stroke();
      return;
    }

    if (obstacle.type === "hayStack") {
      const image = AssetLoader.get("hayStack");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height * 1.28, 4);
        return;
      }
      context.fillStyle = "#d6a743";
      context.beginPath();
      context.moveTo(obstacle.x, ground);
      context.lineTo(centerX, ground - obstacle.height);
      context.lineTo(obstacle.x + obstacle.width, ground);
      context.closePath();
      context.fill();
      return;
    }

    if (obstacle.type === "woodenCart") {
      const image = AssetLoader.get("woodenCart");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height * 1.35, 7);
        return;
      }
      context.fillStyle = "#8b5528";
      context.fillRect(obstacle.x + 10, ground - 56, obstacle.width - 20, 38);
      context.fillStyle = "#4b321e";
      context.beginPath();
      context.arc(obstacle.x + obstacle.width * 0.68, ground - 18, 18, 0, Math.PI * 2);
      context.fill();
      return;
    }

    if (obstacle.type === "lowPowerline") {
      const image = AssetLoader.get("lowPowerline");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height, 0);
        return;
      }
      context.strokeStyle = "#30342f";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(obstacle.x, ground - 118);
      context.quadraticCurveTo(centerX, ground - 102, obstacle.x + obstacle.width, ground - 118);
      context.stroke();
      return;
    }

    if (obstacle.type === "stormGust") {
      const image = AssetLoader.get("stormGust");
      const bob = Math.sin(performance.now() * 0.006 + obstacle.x * 0.01) * 7;
      if (image) {
        context.save();
        context.globalAlpha = 0.92;
        context.translate(centerX, ground - obstacle.height * 0.5 + bob);
        context.rotate(Math.sin(performance.now() * 0.003) * 0.08);
        const drawHeight = obstacle.height * 0.9;
        const drawWidth = drawHeight * (image.naturalWidth / image.naturalHeight);
        context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        context.restore();
        return;
      }
      context.strokeStyle = "rgba(120, 170, 190, 0.78)";
      context.lineWidth = 8;
      context.beginPath();
      context.arc(centerX, ground - 120, 52, 0.4, Math.PI * 1.8);
      context.stroke();
      return;
    }

    if (obstacle.type === "tree") {
      const image = AssetLoader.get("tree");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height * 2.2, 37);
        return;
      }
      context.fillStyle = "#7b563f";
      context.fillRect(obstacle.x + 30, ground - 92, 16, 92);
      context.fillStyle = "#3f7d52";
      context.beginPath();
      context.arc(obstacle.x + 38, ground - 126, 42, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#2f6945";
      context.beginPath();
      context.arc(obstacle.x + 14, ground - 108, 30, 0, Math.PI * 2);
      context.arc(obstacle.x + 62, ground - 105, 32, 0, Math.PI * 2);
      context.fill();
      return;
    }

    if (obstacle.type === "rock") {
      const image = AssetLoader.get("rock");
      if (image) {
        this.drawFitHeightImage(context, image, centerX, ground, obstacle.height * 6, 100);
        return;
      }
      context.fillStyle = "#7f8780";
      context.beginPath();
      context.moveTo(obstacle.x + 8, ground);
      context.quadraticCurveTo(obstacle.x + 16, ground - 42, obstacle.x + 44, ground - 38);
      context.quadraticCurveTo(obstacle.x + 66, ground - 28, obstacle.x + 55, ground);
      context.closePath();
      context.fill();
      return;
    }

    if (obstacle.type === "rollingRock") {
      const baseRadius = obstacle.width * 0.7;
      const visualRadius = baseRadius * 2.5;
      let useBig = this.rollingRockVariants.get(obstacle);
      if (useBig === undefined) {
        useBig = Math.random() < 0.5;
        this.rollingRockVariants.set(obstacle, useBig);
      }
      const image = AssetLoader.get(useBig ? "rollingRockBig" : "rollingRock");
      if (image) {
        const aspect = image.naturalWidth / image.naturalHeight;
        const drawHeight = visualRadius * 2;
        const drawWidth = drawHeight * aspect;
        context.save();
        context.translate(obstacle.x + baseRadius, ground - baseRadius + 8);
        context.rotate(obstacle.rotation);
        context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        context.restore();
        return;
      }
      context.save();
      context.translate(obstacle.x + baseRadius, ground - baseRadius);
      context.rotate(obstacle.rotation);
      const radius = baseRadius;
      context.fillStyle = "#747c78";
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#545f5c";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-radius * 0.55, -radius * 0.1);
      context.lineTo(radius * 0.52, radius * 0.12);
      context.moveTo(-radius * 0.1, radius * 0.56);
      context.lineTo(radius * 0.18, -radius * 0.52);
      context.stroke();
      context.restore();
      return;
    }

    if (obstacle.type === "windmill") {
      const towerImage = AssetLoader.get("windmillTower");
      const fanImage = AssetLoader.get("windmillFan");
      if (towerImage && fanImage) {
        const drawHeight = obstacle.height * 1.4;
        const aspect = towerImage.naturalWidth / towerImage.naturalHeight;
        const drawWidth = drawHeight * aspect;
        const dx = centerX - drawWidth / 2;
        const dy = ground + 40 - drawHeight;
        context.drawImage(towerImage, dx, dy, drawWidth, drawHeight);

        const hubX = centerX;
        const hubY = dy + drawHeight * 0.2;
        const fanSize = drawWidth * 0.4;
        context.save();
        context.translate(hubX, hubY);
        context.rotate(performance.now() * 0.0014);
        context.drawImage(fanImage, -fanSize / 2, -fanSize / 2, fanSize, fanSize);
        context.restore();
        return;
      }
      const hubX = obstacle.x + 42;
      const hubY = ground - 150;
      context.strokeStyle = "#8b765e";
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(obstacle.x + 24, ground);
      context.lineTo(hubX, hubY);
      context.lineTo(obstacle.x + 62, ground);
      context.stroke();
      context.strokeStyle = "#f7f2dd";
      context.lineWidth = 4;
      for (let index = 0; index < 4; index += 1) {
        const angle = index * (Math.PI / 2) + performance.now() * 0.0014;
        context.beginPath();
        context.moveTo(hubX, hubY);
        context.lineTo(hubX + Math.cos(angle) * 42, hubY + Math.sin(angle) * 42);
        context.stroke();
      }
      context.fillStyle = "#4f6d68";
      context.beginPath();
      context.arc(hubX, hubY, 8, 0, Math.PI * 2);
      context.fill();
      return;
    }

    const powerlineImage = AssetLoader.get("powerline");
    if (powerlineImage) {
      this.drawFitHeightImage(context, powerlineImage, centerX, ground, obstacle.height * 1.3, 45);
      return;
    }
    context.strokeStyle = "#5b5b52";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(obstacle.x + 10, ground);
    context.lineTo(obstacle.x + 10, ground - 150);
    context.moveTo(obstacle.x + 140, ground);
    context.lineTo(obstacle.x + 140, ground - 150);
    context.stroke();
    context.strokeStyle = "#30342f";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(obstacle.x, ground - 150);
    context.quadraticCurveTo(obstacle.x + 75, ground - 132, obstacle.x + 150, ground - 150);
    context.stroke();
  }

  private drawJumpChargeIndicator(context: CanvasRenderingContext2D, player: Player): void {
    if (player.jumpChargeLevel <= 0) {
      return;
    }

    const centerX = player.position.x + player.width / 2;
    const barWidth = 40;
    const barY = player.position.y - 16;
    const ready = player.jumpChargeLevel >= 0.999;

    context.fillStyle = "rgba(19, 32, 34, 0.35)";
    context.fillRect(centerX - barWidth / 2, barY, barWidth, 5);

    context.fillStyle = ready ? "#1f5654" : "#e2574c";
    context.fillRect(centerX - barWidth / 2, barY, barWidth * player.jumpChargeLevel, 5);

    if (ready) {
      context.fillStyle = "rgba(31, 86, 84, 0.8)";
      context.beginPath();
      context.arc(centerX, barY - 8, 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  private drawPlayerSpeedTrail(context: CanvasRenderingContext2D, player: Player): void {
    const speed = Math.max(0, player.velocity.x);
    if (speed < 620) {
      return;
    }

    const strength = clamp01((speed - 620) / 260);
    const centerX = player.position.x + player.width * 0.5;
    const centerY = player.position.y + player.height * 0.48;
    const phase = performance.now() * 0.012;

    context.save();
    context.lineCap = "round";
    context.lineWidth = 2.5 + strength * 2;
    context.strokeStyle = `rgba(255, 249, 213, ${0.18 + strength * 0.34})`;
    context.shadowColor = "rgba(150, 226, 255, 0.55)";
    context.shadowBlur = 10;

    for (let index = 0; index < 8; index += 1) {
      const lane = index - 3.5;
      const offset = ((phase + index * 17) % 54) + 24;
      const y = centerY + lane * 7 + Math.sin(phase * 0.7 + index) * 3;
      const startX = centerX - offset - 46 * strength;
      const endX = startX + 20 + strength * 28;

      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(endX, y - 2);
      context.stroke();
    }
    context.restore();
  }

  private drawPlayer(context: CanvasRenderingContext2D, player: Player): void {
    const spriteSheet = AssetLoader.get("character");
    if (spriteSheet) {
      const frameCount = 4;
      const frameWidth = spriteSheet.naturalWidth / frameCount;
      const frameHeight = spriteSheet.naturalHeight;

      let frameIndex = 0;
      if (!player.grounded) {
        frameIndex = 3;
      } else if (Math.abs(player.velocity.x) > 40) {
        frameIndex = Math.floor(performance.now() / 110) % 2 === 0 ? 1 : 2;
      }

      const drawHeight = player.height * 1.9;
      const drawWidth = drawHeight * (frameWidth / frameHeight);

      context.save();
      context.translate(player.position.x + player.width / 2, player.position.y + player.height);
      context.scale(player.facingDirection, 1);
      context.drawImage(
        spriteSheet,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        -drawWidth / 2,
        -drawHeight,
        drawWidth,
        drawHeight,
      );
      context.restore();
      return;
    }

    const x = player.position.x;
    const y = player.position.y;
    context.save();
    context.translate(x + player.width / 2, y + player.height / 2);
    context.scale(player.facingDirection, 1);

    context.fillStyle = "#e7b66e";
    context.beginPath();
    context.arc(0, -22, 12, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#24575d";
    context.fillRect(-11, -9, 22, 29);

    context.strokeStyle = "#25353a";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-8, 18);
    context.lineTo(-13, 29);
    context.moveTo(8, 18);
    context.lineTo(16, 29);
    context.moveTo(9, 0);
    context.lineTo(22, -9);
    context.stroke();
    context.restore();
  }

  private drawBird(context: CanvasRenderingContext2D, bird: Bird): void {
    const spriteSheet = AssetLoader.get("bird");

    if (spriteSheet) {
      const frameCount = 4;
      const frameWidth = spriteSheet.naturalWidth / frameCount;
      const frameHeight = spriteSheet.naturalHeight;
      const frameIndex = Math.floor(performance.now() / 90) % frameCount;
      const drawHeight = bird.radius * 2.7;
      const drawWidth = drawHeight * (frameWidth / frameHeight);

      context.save();
      context.translate(bird.position.x, bird.position.y);
      context.rotate(Math.sin(bird.age * 2.4) * 0.06);
      context.scale(bird.velocity.x < 0 ? -1 : 1, 1);
      context.drawImage(
        spriteSheet,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight,
      );
      context.restore();
      return;
    }

    context.fillStyle = "#5c4433";
    context.beginPath();
    context.ellipse(bird.position.x, bird.position.y, bird.radius, bird.radius * 0.6, 0, 0, Math.PI * 2);
    context.fill();
  }

  private drawWindGust(context: CanvasRenderingContext2D, gust: WindGust): void {
    const windImage = AssetLoader.get("windGust");
    const center = gust.getCenter();
    const alpha = gust.alpha;
    const bob = Math.sin(performance.now() * 0.006 + gust.age * 4) * 4;
    const breathe = 0.94 + Math.sin(performance.now() * 0.008 + gust.age * 5) * 0.08;

    context.save();
    context.globalAlpha = alpha;
    context.translate(center.x, center.y + bob);
    context.rotate(gust.angleRadians);

    context.save();
    context.globalAlpha = alpha * 0.18;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(0, 0, gust.captureRadius * 1.3, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = alpha * 0.48;
    context.strokeStyle = "#f8fbf7";
    context.lineWidth = 2;
    context.setLineDash([6, 5]);
    context.beginPath();
    context.arc(0, 0, gust.captureRadius, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    context.restore();

    if (windImage) {
      const drawHeight = 54 * breathe;
      const drawWidth = drawHeight * (windImage.naturalWidth / windImage.naturalHeight);
      context.drawImage(windImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else {
      context.strokeStyle = "rgba(255, 255, 255, 0.52)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, 18, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  private drawMusicNote(context: CanvasRenderingContext2D, note: MusicNote): void {
    const x = note.position.x;
    const y = note.position.y;
    const glow = 0.55 + Math.sin(performance.now() * 0.006 + x * 0.02) * 0.18;

    context.save();
    context.translate(x, y);
    context.shadowColor = "rgba(255, 229, 119, 0.75)";
    context.shadowBlur = 10 + glow * 8;
    context.strokeStyle = "#1f5654";
    context.fillStyle = "#ffe577";
    context.lineWidth = 4;
    context.lineCap = "round";

    context.beginPath();
    context.ellipse(-5, 10, 9, 6, -0.45, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.beginPath();
    context.moveTo(4, 8);
    context.lineTo(4, -22);
    context.lineTo(20, -16);
    context.stroke();

    context.beginPath();
    context.moveTo(5, -20);
    context.quadraticCurveTo(13, -28, 23, -20);
    context.stroke();
    context.restore();
  }

  private drawRope(context: CanvasRenderingContext2D, player: Player, kite: Kite, rope: Rope): void {
    const anchor = rope.getAnchor(player);
    const midpointX = (anchor.x + kite.position.x) * 0.5;
    // Dây càng căng thì càng thẳng: sag giảm phi tuyến về gần 0 khi tension tiến tới 1,
    // thay vì bị chặn ở một mức sag tối thiểu như trước.
    const sag = 56 * Math.pow(Math.max(0, 1 - rope.tension), 1.6);
    const vibration = Math.sin(performance.now() * 0.03) * rope.tension * 4;
    const controlA = { x: midpointX - 30, y: anchor.y + sag + vibration };
    const controlB = { x: midpointX + 30, y: kite.position.y + sag - vibration };

    context.strokeStyle = `rgba(93, 74, 48, ${0.45 + rope.tension * 0.35})`;
    context.lineWidth = 2 + rope.tension * 1.2;
    context.beginPath();
    context.moveTo(anchor.x, anchor.y);
    context.bezierCurveTo(controlA.x, controlA.y, controlB.x, controlB.y, kite.position.x, kite.position.y);
    context.stroke();

    if (rope.reelEffect > 0.02 && rope.reelDirection !== 0) {
      const direction = rope.reelDirection;
      const effectAlpha = clamp01(rope.reelEffect);
      const color = direction < 0 ? "255, 229, 119" : "150, 226, 255";

      context.save();
      context.globalAlpha = effectAlpha;
      context.lineCap = "round";
      context.lineWidth = 3.2;
      context.strokeStyle = `rgba(${color}, 0.78)`;
      context.shadowColor = `rgba(${color}, 0.42)`;
      context.shadowBlur = 9;

      for (let index = 0; index < 6; index += 1) {
        const cycle = (rope.reelPhase + index / 6) % 1;
        const headT = direction < 0 ? 0.92 - cycle * 0.84 : 0.08 + cycle * 0.84;
        const tailT = clamp01(headT - direction * 0.055);
        const head = cubicPoint(anchor, controlA, controlB, kite.position, headT);
        const tail = cubicPoint(anchor, controlA, controlB, kite.position, tailT);

        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(head.x, head.y);
        context.stroke();
      }
      context.restore();
    }

    if (rope.tension > 0.82) {
      // Lõi sáng mảnh chạy dọc dây để nhấn mạnh cảm giác dây đang bị kéo căng hết cỡ.
      const highlight = clamp01((rope.tension - 0.82) / 0.18);
      context.strokeStyle = `rgba(255, 244, 214, ${highlight * 0.55})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(anchor.x, anchor.y);
      context.bezierCurveTo(controlA.x, controlA.y, controlB.x, controlB.y, kite.position.x, kite.position.y);
      context.stroke();
    }
  }

  private drawKite(context: CanvasRenderingContext2D, kite: Kite, wind: Wind): void {
    const bodyImage = AssetLoader.get("kiteBody");
    const tailImage = AssetLoader.get("kiteTail");

    if (bodyImage) {
      context.save();
      context.translate(kite.position.x, kite.position.y);
      context.rotate(kite.rotation);

      if (tailImage) {
        const tailWiggle = Math.sin(performance.now() * 0.008) * 0.12;
        const tailHeight = kite.radius * 3.2;
        const tailAspect = tailImage.naturalWidth / tailImage.naturalHeight;
        const tailWidth = tailHeight * tailAspect;
        context.save();
        context.translate(0, kite.radius * 0.35);
        context.rotate(tailWiggle);
        context.drawImage(tailImage, -tailWidth / 2, -kite.radius * 0.6, tailWidth, tailHeight);
        context.restore();
      }

      const bodySize = kite.radius * 2.6;
      context.drawImage(bodyImage, -bodySize / 2, -bodySize / 2, bodySize, bodySize);
      context.restore();
    } else {
      context.save();
      context.translate(kite.position.x, kite.position.y);
      context.rotate(kite.rotation);

      context.fillStyle = "#e2574c";
      context.beginPath();
      context.moveTo(0, -28);
      context.lineTo(24, 0);
      context.lineTo(0, 30);
      context.lineTo(-24, 0);
      context.closePath();
      context.fill();

      context.strokeStyle = "#f9f1d2";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(0, -28);
      context.lineTo(0, 30);
      context.moveTo(-24, 0);
      context.lineTo(24, 0);
      context.stroke();

      context.strokeStyle = "rgba(226, 87, 76, 0.5)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, 30);
      context.quadraticCurveTo(-8, 48, Math.sin(performance.now() * 0.008) * 10, 68);
      context.stroke();
      context.restore();
    }

    const windVelocity = wind.getVelocity();
    context.strokeStyle = "rgba(255, 255, 255, 0.36)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(kite.position.x - windVelocity.x * 0.1, kite.position.y - 42);
    context.lineTo(kite.position.x - windVelocity.x * 0.24, kite.position.y - 42 - windVelocity.y * 0.08);
    context.stroke();
  }

  private drawParticle(context: CanvasRenderingContext2D, particle: Particle): void {
    context.globalAlpha = particle.alpha;
    if (particle.kind === "dust") {
      context.fillStyle = "#d9c28f";
    } else if (particle.kind === "leaf") {
      context.fillStyle = "#d47d45";
    } else if (particle.kind === "feather") {
      context.fillStyle = "#c9a15a";
    } else {
      context.fillStyle = "#f6f0d9";
    }

    context.beginPath();
    context.ellipse(particle.position.x, particle.position.y, particle.size, particle.size * 0.58, 0.4, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function cubicPoint(
  start: { x: number; y: number },
  controlA: { x: number; y: number },
  controlB: { x: number; y: number },
  end: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  const inverse = 1 - t;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * t;
  const c = 3 * inverse * t * t;
  const d = t * t * t;

  return {
    x: start.x * a + controlA.x * b + controlB.x * c + end.x * d,
    y: start.y * a + controlA.y * b + controlB.y * c + end.y * d,
  };
}
