import { Camera } from "./Camera";
import { GameLoop } from "./GameLoop";
import { Input } from "./Input";
import { Renderer } from "./Renderer";
import type { GameSnapshot } from "./types";
import { Bird } from "../entities/Bird";
import { Kite } from "../entities/Kite";
import { Obstacle } from "../entities/Obstacle";
import { Player } from "../entities/Player";
import { intersects, pointInBounds } from "../physics/Collision";
import { Rope } from "../physics/Rope";
import { Wind } from "../physics/Wind";
import { AudioSystem } from "../systems/AudioSystem";
import { BirdSystem } from "../systems/BirdSystem";
import { ParticleSystem } from "../systems/ParticleSystem";
import { PhysicsSystem } from "../systems/PhysicsSystem";
import { RopeSystem } from "../systems/RopeSystem";
import { WindSystem } from "../systems/WindSystem";
import { WorldGenerator } from "../systems/WorldGenerator";

export class Game {
  private readonly input = new Input();
  private readonly renderer: Renderer;
  private readonly loop: GameLoop;
  private readonly camera = new Camera();
  private readonly player = new Player();
  private readonly kite = new Kite();
  private readonly rope = new Rope();
  private readonly wind = new Wind();
  private readonly windSystem = new WindSystem(this.wind);
  private readonly ropeSystem = new RopeSystem(this.rope);
  private readonly physicsSystem = new PhysicsSystem();
  private readonly particleSystem = new ParticleSystem();
  private readonly audioSystem = new AudioSystem();
  private readonly worldGenerator = new WorldGenerator();
  private readonly obstacles: Obstacle[] = [];
  private readonly birdSystem = new BirdSystem();
  private readonly birds: Bird[] = [];
  private readonly groundY = 430;
  private readonly maxLives = 3;
  private readonly goalDistance = 2400;
  private lives = this.maxLives;
  private hitInvulnerableTimer = 0;
  private paused = false;
  private crashed = false;
  private completed = false;
  private fps = 60;
  private hasStartedAudio = false;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly onSnapshot: (snapshot: GameSnapshot) => void,
  ) {
    this.renderer = new Renderer(canvas);
    this.loop = new GameLoop((deltaSeconds, fps) => this.tick(deltaSeconds, fps));
    this.restart();
  }

  start(): void {
    this.input.attach();
    window.addEventListener("resize", this.handleResize);
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    this.audioSystem.stop();
    window.removeEventListener("resize", this.handleResize);
  }

  restart(): void {
    this.player.reset(this.groundY);
    this.kite.reset(this.player.position.x, this.groundY);
    this.rope.length = 260;
    this.rope.tension = 0;
    this.windSystem.reset();
    this.particleSystem.reset();
    this.obstacles.length = 0;
    this.worldGenerator.reset();
    this.birds.length = 0;
    this.birdSystem.reset();
    this.lives = this.maxLives;
    this.hitInvulnerableTimer = 0;
    this.paused = false;
    this.crashed = false;
    this.completed = false;
    this.camera.position.set(0, 0);
    this.updateWorld();
    this.emitSnapshot();
  }

  setPaused(paused: boolean): void {
    if (this.crashed || this.completed) {
      return;
    }

    this.paused = paused;
    this.emitSnapshot();
  }

  private tick(deltaSeconds: number, fps: number): void {
    this.fps = fps;

    if (this.input.wasRestartPressed()) {
      this.restart();
    }

    if (this.input.wasPausePressed()) {
      this.setPaused(!this.paused);
    }

    if (!this.hasStartedAudio && (this.input.isLeftPressed() || this.input.isRightPressed() || this.input.isJumpPressed())) {
      this.audioSystem.start();
      this.hasStartedAudio = true;
    }

    if (!this.paused && !this.crashed) {
      this.update(deltaSeconds);
    }

    this.render();
    this.emitSnapshot();
    this.input.endFrame();
  }

  private update(deltaSeconds: number): void {
    this.windSystem.update(deltaSeconds);
    this.ropeSystem.updateLength(this.input, deltaSeconds);
    const kiteAssist = this.rope.getPlayerAssist(this.player, this.kite);
    this.player.update(this.input, deltaSeconds, this.groundY, kiteAssist);
    if (this.player.justJumped) {
      this.audioSystem.playJump();
    }
    this.physicsSystem.prepareKite(this.kite, this.wind);
    this.ropeSystem.apply(this.player, this.kite);
    this.physicsSystem.integrateKite(this.kite, deltaSeconds, this.groundY);
    this.updateObstacles(deltaSeconds);
    this.birdSystem.update(this.birds, deltaSeconds, this.player.position.x, this.renderer.width, this.groundY, this.distance);
    this.hitInvulnerableTimer = Math.max(0, this.hitInvulnerableTimer - deltaSeconds);
    this.handleCollisions();
    this.handleBirdCollisions();
    this.updateWorld();
    this.particleSystem.update(deltaSeconds, this.player, this.kite, this.rope, this.wind);
    this.camera.update(this.player.position, this.player.facingDirection, this.renderer.width, this.renderer.height, deltaSeconds);
    this.audioSystem.update(this.wind, this.rope, this.getRollingRockProximity());

    if (!this.completed && this.distance >= this.goalDistance) {
      this.completed = true;
      this.paused = false;
    }
  }

  private render(): void {
    this.renderer.render({
      camera: this.camera,
      player: this.player,
      kite: this.kite,
      rope: this.rope,
      wind: this.wind,
      obstacles: this.obstacles,
      birds: this.birds,
      particles: this.particleSystem.particles,
      distance: this.distance,
      groundY: this.groundY,
      paused: this.paused,
      crashed: this.crashed,
    });
  }

  private handleCollisions(): void {
    const kiteBounds = this.kite.getBounds();

    for (const obstacle of this.obstacles) {
      const bounds = obstacle.getBounds();

      if (intersects(this.player.getBounds(), bounds)) {
        this.player.bumpFromObstacle(bounds);
      }

      if (intersects(kiteBounds, bounds) || pointInBounds(this.kite.position.x, this.kite.position.y, bounds)) {
        const pushDirection = this.kite.position.x < bounds.x + bounds.width * 0.5 ? -1 : 1;
        this.kite.velocity.x = pushDirection * Math.max(260, Math.abs(this.kite.velocity.x) * 0.7);
        this.kite.velocity.y = Math.min(this.kite.velocity.y + 340, 520);
        this.rope.tension = 1;

        if (obstacle.type === "powerline") {
          this.crashed = true;
          this.paused = false;
          return;
        }
      }
    }
  }

  private handleBirdCollisions(): void {
    if (this.hitInvulnerableTimer > 0) {
      return;
    }

    const kiteBounds = this.kite.getBounds();

    for (let index = this.birds.length - 1; index >= 0; index -= 1) {
      const bird = this.birds[index];

      if (intersects(kiteBounds, bird.getBounds())) {
        this.birds.splice(index, 1);
        this.registerBirdHit(bird);
        return;
      }
    }
  }

  private registerBirdHit(bird: Bird): void {
    this.hitInvulnerableTimer = 1.1;
    this.lives = Math.max(0, this.lives - 1);

    const pushDirection = this.kite.position.x < bird.position.x ? -1 : 1;
    this.kite.velocity.x = pushDirection * Math.max(240, Math.abs(this.kite.velocity.x) * 0.6);
    this.kite.velocity.y -= 190;
    this.rope.tension = Math.min(1, this.rope.tension + 0.5);
    this.particleSystem.spawnFeathers(bird.position.x, bird.position.y);

    if (this.lives <= 0) {
      this.crashed = true;
      this.paused = false;
    }
  }

  private updateWorld(): void {
    this.worldGenerator.update(this.obstacles, this.player.position.x, this.renderer.width, this.groundY);
  }

  private getRollingRockProximity(): number {
    const hearingRange = 620;
    let closest = Infinity;

    for (const obstacle of this.obstacles) {
      if (obstacle.type !== "rollingRock") {
        continue;
      }

      const distance = Math.abs(obstacle.x - this.player.position.x);
      if (distance < closest) {
        closest = distance;
      }
    }

    if (closest === Infinity) {
      return 0;
    }

    return Math.max(0, 1 - closest / hearingRange);
  }

  private updateObstacles(deltaSeconds: number): void {
    this.obstacles.forEach((obstacle) => obstacle.update(deltaSeconds));
  }

  private emitSnapshot(): void {
    this.onSnapshot({
      windDirectionDegrees: this.wind.directionDegrees,
      windStrength: this.wind.strength,
      ropeLength: this.rope.length,
      minRopeLength: this.rope.minLength,
      maxRopeLength: this.rope.maxLength,
      distance: this.distance,
      fps: this.fps,
      paused: this.paused,
      crashed: this.crashed,
      completed: this.completed,
      lives: this.lives,
      maxLives: this.maxLives,
      goalDistance: this.goalDistance,
    });
  }

  private get distance(): number {
    return Math.max(0, this.player.position.x - 120);
  }

  private readonly handleResize = () => {
    this.renderer.resize();
  };
}
