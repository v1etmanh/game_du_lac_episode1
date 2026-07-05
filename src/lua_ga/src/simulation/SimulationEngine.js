import { createWorld, snapshotWorld } from "./World.js";
import { InputManager } from "./InputManager.js";
import { Renderer } from "./Renderer.js";
import { dropGrain, updateGrain } from "./GrainSystem.js";
import { updateChickens } from "./ChickenSystem.js";
import { resolveCoopWallCollisions, updateCoop } from "./CoopSystem.js";
import { createClapWave, updateClapWaves } from "./ClapSystem.js";
import { keepInsideWorld, resolveChickenSeparation, resolveObstacleCollisions } from "./CollisionSystem.js";
import { distance, normalize } from "../math/vector.js";

export class SimulationEngine {
  constructor(canvas, settings, onSnapshot) {
    this.canvas = canvas;
    this.settings = { ...settings };
    this.onSnapshot = onSnapshot;
    this.world = createWorld(this.settings);
    this.input = new InputManager(canvas);
    this.renderer = new Renderer(canvas, this.settings);
    this.animationFrame = null;
    this.lastTime = 0;
    this.snapshotAccumulator = 0;
    this.loop = this.loop.bind(this);
  }

  start() {
    this.input.attach();
    this.world.stats.startedAt = performance.now();
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  stop() {
    this.input.detach();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  reset(settings = this.settings) {
    this.settings = { ...settings };
    this.world = createWorld(this.settings);
    this.renderer.setSettings(this.settings);
    this.lastTime = performance.now();
    this.emitSnapshot();
  }

  setSettings(settings) {
    this.settings = { ...settings };
    this.renderer.setSettings(this.settings);
  }

  setPaused(paused) {
    if (!this.world.completed && !this.world.failed) {
      this.world.paused = paused;
      this.emitSnapshot();
    }
  }

  togglePaused() {
    this.setPaused(!this.world.paused);
  }

  loop(now) {
    const rawDelta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (this.input.consumePausePressed()) {
      this.togglePaused();
    }

    if (this.input.consumeToggleCoopPressed() && !this.world.completed && !this.world.failed) {
      this.world.coop.closed = !this.world.coop.closed;
      this.world.stats.coopToggles += 1;
      this.emitSnapshot();
    }

    if (!this.world.paused && !this.world.completed && !this.world.failed) {
      this.update(rawDelta);
    }

    this.renderer.render(this.world);
    this.snapshotAccumulator += rawDelta;
    if (this.snapshotAccumulator >= 0.12) {
      this.emitSnapshot();
      this.snapshotAccumulator = 0;
    }

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    this.world.stats.elapsedTime += deltaTime;

    if (this.input.consumeDropPressed()) {
      dropGrain(this.world, this.settings);
    }

    if (this.input.consumeClapPressed()) {
      createClapWave(this.world, this.settings);
    }

    this.updatePlayer(deltaTime);
    updateGrain(this.world, this.settings, deltaTime);
    updateClapWaves(this.world, this.settings, deltaTime);
    updateChickens(this.world, this.settings, deltaTime);
    resolveChickenSeparation(this.world);
    for (const chicken of this.world.chickens) {
      keepInsideWorld(chicken, this.settings);
      resolveCoopWallCollisions(chicken, this.world.coop);
    }
    updateCoop(this.world, this.settings, deltaTime);

    if (!this.world.completed && this.world.stats.elapsedTime >= this.settings.challengeDuration) {
      this.failChallenge("time");
    }
  }

  updatePlayer(deltaTime) {
    const player = this.world.player;
    const mouse = this.input.getMousePosition();

    player.sprintActiveTime = Math.max(0, player.sprintActiveTime - deltaTime);
    player.dashCooldownRemaining = Math.max(0, player.dashCooldownRemaining - deltaTime);
    player.dashEffectRemaining = Math.max(0, player.dashEffectRemaining - deltaTime);
    if (player.sprintActiveTime <= 0) {
      player.sprintCooldownRemaining = Math.max(0, player.sprintCooldownRemaining - deltaTime);
    }

    const previous = { x: player.x, y: player.y };
    const dashReleased = this.input.consumeDashReleased();
    const canAimDash = this.input.isDashHeld() && player.dashCooldownRemaining <= 0;

    if (canAimDash) {
      player.dashAiming = true;
      this.updateDashPreview(player, mouse);
    }

    if (dashReleased) {
      if (player.dashAiming && player.dashCooldownRemaining <= 0) {
        this.performPlayerDash(player);
      }
      player.dashAiming = false;
    } else if (!canAimDash) {
      player.dashAiming = false;
    }

    const moveToMouse = mouse.inside && !player.dashAiming;
    const targetOffsetX = mouse.x - player.x;
    const targetOffsetY = mouse.y - player.y;
    const targetDistance = Math.hypot(targetOffsetX, targetOffsetY);
    const direction = normalize(targetOffsetX, targetOffsetY);
    const isMoving = moveToMouse && targetDistance > player.radius * 0.45;
    const wantsSprint = this.input.isDown("shift") && isMoving;

    if (wantsSprint && player.sprintActiveTime <= 0 && player.sprintCooldownRemaining <= 0) {
      player.sprintActiveTime = this.settings.playerSprintDuration;
      player.sprintCooldownRemaining = this.settings.playerSprintCooldown;
    }

    const sprinting = player.sprintActiveTime > 0;
    const speed = sprinting ? this.settings.playerSpeed * this.settings.playerSprintMultiplier : this.settings.playerSpeed;
    player.speed = speed;
    const followSpeed = isMoving ? Math.min(speed, targetDistance / Math.max(deltaTime, 0.001)) : 0;
    player.velocityX = isMoving ? direction.x * followSpeed : 0;
    player.velocityY = isMoving ? direction.y * followSpeed : 0;
    if (isMoving) {
      player.directionX = direction.x;
      player.directionY = direction.y;
    }

    this.input.consumeDashPressed();

    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;

    keepInsideWorld(player, this.settings);
    resolveObstacleCollisions(player, this.world);
    resolveCoopWallCollisions(player, this.world.coop);
    this.world.stats.playerDistance += distance(previous, player);
  }

  updateDashPreview(player, mouse) {
    const offsetX = mouse.inside ? mouse.x - player.x : player.directionX;
    const offsetY = mouse.inside ? mouse.y - player.y : player.directionY;
    const direction = Math.hypot(offsetX, offsetY) > 8
      ? normalize(offsetX, offsetY)
      : normalize(player.directionX, player.directionY);

    player.dashAimDirectionX = direction.x;
    player.dashAimDirectionY = direction.y;
    player.directionX = direction.x;
    player.directionY = direction.y;
    player.dashPreviewX = player.x + direction.x * this.settings.playerDashDistance;
    player.dashPreviewY = player.y + direction.y * this.settings.playerDashDistance;
  }

  performPlayerDash(player) {
    player.dashStartX = player.x;
    player.dashStartY = player.y;
    player.x += player.dashAimDirectionX * this.settings.playerDashDistance;
    player.y += player.dashAimDirectionY * this.settings.playerDashDistance;
    player.dashEndX = player.x;
    player.dashEndY = player.y;
    player.dashEffectDuration = this.settings.playerDashEffectDuration;
    player.dashEffectRemaining = this.settings.playerDashEffectDuration;
    player.dashCooldownRemaining = this.settings.playerDashCooldown;
    keepInsideWorld(player, this.settings);
    resolveObstacleCollisions(player, this.world);
    resolveCoopWallCollisions(player, this.world.coop);
    player.dashEndX = player.x;
    player.dashEndY = player.y;
  }

  emitSnapshot() {
    this.onSnapshot(snapshotWorld(this.world, this.settings));
  }

  failChallenge(reason) {
    this.world.failed = true;
    this.world.failureReason = reason;
    this.world.paused = true;
    this.emitSnapshot();
  }
}
