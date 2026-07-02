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
    if (!this.world.completed) {
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

    if (this.input.consumeToggleCoopPressed()) {
      this.world.coop.closed = !this.world.coop.closed;
      this.world.stats.coopToggles += 1;
      this.emitSnapshot();
    }

    if (!this.world.paused && !this.world.completed) {
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
  }

  updatePlayer(deltaTime) {
    const player = this.world.player;
    let x = 0;
    let y = 0;

    if (this.input.isDown("a", "arrowleft")) x -= 1;
    if (this.input.isDown("d", "arrowright")) x += 1;
    if (this.input.isDown("w", "arrowup")) y -= 1;
    if (this.input.isDown("s", "arrowdown")) y += 1;

    const direction = normalize(x, y);
    const isMoving = x !== 0 || y !== 0;
    const wantsSprint = this.input.isDown("shift") && isMoving;

    player.sprintActiveTime = Math.max(0, player.sprintActiveTime - deltaTime);
    if (player.sprintActiveTime <= 0) {
      player.sprintCooldownRemaining = Math.max(0, player.sprintCooldownRemaining - deltaTime);
    }

    if (wantsSprint && player.sprintActiveTime <= 0 && player.sprintCooldownRemaining <= 0) {
      player.sprintActiveTime = this.settings.playerSprintDuration;
      player.sprintCooldownRemaining = this.settings.playerSprintCooldown;
    }

    const sprinting = player.sprintActiveTime > 0;
    const speed = sprinting ? this.settings.playerSpeed * this.settings.playerSprintMultiplier : this.settings.playerSpeed;
    player.speed = speed;
    player.velocityX = isMoving ? direction.x * speed : 0;
    player.velocityY = isMoving ? direction.y * speed : 0;
    if (isMoving) {
      player.directionX = direction.x;
      player.directionY = direction.y;
    }

    const previous = { x: player.x, y: player.y };
    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;

    keepInsideWorld(player, this.settings);
    resolveObstacleCollisions(player, this.world);
    resolveCoopWallCollisions(player, this.world.coop);
    this.world.stats.playerDistance += distance(previous, player);
  }

  emitSnapshot() {
    this.onSnapshot(snapshotWorld(this.world, this.settings));
  }
}
