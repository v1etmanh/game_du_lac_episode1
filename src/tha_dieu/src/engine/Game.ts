import { Camera } from "./Camera";
import { GameLoop } from "./GameLoop";
import { Input } from "./Input";
import { Renderer } from "./Renderer";
import type { GameSnapshot } from "./types";
import { Bird } from "../entities/Bird";
import { Kite } from "../entities/Kite";
import { MusicNote } from "../entities/MusicNote";
import { Obstacle } from "../entities/Obstacle";
import { Player } from "../entities/Player";
import { WindGust } from "../entities/WindGust";
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
  private readonly input: Input;
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
  private readonly windGusts: WindGust[] = [];
  private readonly musicNotes: MusicNote[] = [];
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
  private windGustSpawnTimer = 1.5;
  private windLiftTimer = 0;
  private nextMusicNoteX = 520;
  private noteCount = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly onSnapshot: (snapshot: GameSnapshot) => void,
  ) {
    this.input = new Input(canvas);
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
    this.rope.reelDirection = 0;
    this.rope.reelEffect = 0;
    this.rope.reelPhase = 0;
    this.windSystem.reset();
    this.particleSystem.reset();
    this.obstacles.length = 0;
    this.worldGenerator.reset();
    this.birds.length = 0;
    this.birdSystem.reset();
    this.windGusts.length = 0;
    this.musicNotes.length = 0;
    this.windGustSpawnTimer = 1.5;
    this.windLiftTimer = 0;
    this.nextMusicNoteX = 520;
    this.noteCount = 0;
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
    this.ropeSystem.updateLength(this.input, deltaSeconds, this.renderer.height);
    this.windLiftTimer = Math.max(0, this.windLiftTimer - deltaSeconds);
    this.updateWindGusts(deltaSeconds);
    this.handleWindGustCapture();
    const kiteAssist = this.rope.getPlayerAssist(this.player, this.kite);
    this.player.update(this.input, deltaSeconds, this.groundY, kiteAssist, this.windLiftTimer);
    if (this.player.justJumped) {
      this.audioSystem.playJump();
    }
    this.physicsSystem.prepareKite(this.kite, this.wind);
    if (this.windLiftTimer > 0) {
      this.kite.acceleration.y -= 380;
      this.kite.acceleration.x += 70;
    }
    this.ropeSystem.apply(this.player, this.kite);
    this.physicsSystem.integrateKite(this.kite, deltaSeconds, this.groundY);
    this.handleWindGustCapture();
    this.updateMusicNotes(deltaSeconds);
    this.handleMusicNoteCollisions();
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
      windGusts: this.windGusts,
      musicNotes: this.musicNotes,
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
    this.ensureMusicNotes();
  }

  private updateWindGusts(deltaSeconds: number): void {
    this.windGustSpawnTimer -= deltaSeconds;

    if (this.windGustSpawnTimer <= 0 && this.windGusts.length === 0) {
      this.spawnWindGust();
      this.windGustSpawnTimer += 5;
    }

    for (let index = this.windGusts.length - 1; index >= 0; index -= 1) {
      const gust = this.windGusts[index];
      gust.update(deltaSeconds);

      if (gust.expired || gust.getBounds().x + gust.getBounds().width < this.player.position.x - 260) {
        this.windGusts.splice(index, 1);
      }
    }
  }

  private spawnWindGust(): void {
    const baseX = this.player.position.x + this.renderer.width * 0.58 + 100 + Math.random() * 90;
    const baseY = this.groundY - 250 - Math.random() * 60;
    const length = 1;
    const offsets = [
      { x: 0, y: -44 },
      { x: 70, y: 0 },
      { x: 140, y: 44 },
    ];

    offsets.forEach((offset) => {
      const angleRadians = ((-12 + Math.random() * 8) * Math.PI) / 180;
      this.windGusts.push(new WindGust(baseX + offset.x, baseY + offset.y, length, angleRadians));
    });
  }

  private handleWindGustCapture(): void {
    for (const gust of this.windGusts) {
      if (gust.catches(this.kite.position)) {
        gust.used = true;
        this.triggerWindLift();
        return;
      }
    }
  }

  private triggerWindLift(): void {
    this.windLiftTimer = 3;
    this.player.grounded = false;
    this.player.facingDirection = 1;
    this.player.velocity.x = Math.max(this.player.velocity.x, 760);
    this.player.velocity.y = Math.min(this.player.velocity.y, -170);
    this.kite.velocity.y = Math.min(this.kite.velocity.y, -260);
    this.kite.velocity.x = Math.max(this.kite.velocity.x + 180, 520);
    this.rope.tension = 1;
  }

  private updateMusicNotes(deltaSeconds: number): void {
    this.musicNotes.forEach((note) => note.update(deltaSeconds));

    for (let index = this.musicNotes.length - 1; index >= 0; index -= 1) {
      if (this.musicNotes[index].position.x < this.player.position.x - 320) {
        this.musicNotes.splice(index, 1);
      }
    }
  }

  private ensureMusicNotes(): void {
    const spawnUntilX = this.player.position.x + this.renderer.width * 1.8;

    while (this.nextMusicNoteX < spawnUntilX && this.nextMusicNoteX < this.goalDistance + 680) {
      const clusterSize = Math.random() < 0.35 ? 2 : 1;

      for (let index = 0; index < clusterSize; index += 1) {
        const x = this.nextMusicNoteX + index * 58;
        const y = this.groundY - 315 - Math.random() * 155 - index * 24;
        this.musicNotes.push(new MusicNote(x, y));
      }

      this.nextMusicNoteX += 320 + Math.random() * 250;
    }
  }

  private handleMusicNoteCollisions(): void {
    const playerBounds = this.player.getBounds();

    for (let index = this.musicNotes.length - 1; index >= 0; index -= 1) {
      if (intersects(playerBounds, this.musicNotes[index].getBounds())) {
        this.musicNotes.splice(index, 1);
        this.noteCount += 1;
      }
    }
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
      jumpChargeLevel: this.player.jumpChargeLevel,
      readyForHighJump: this.player.jumpChargeLevel >= 0.999,
      windLiftTimer: this.windLiftTimer,
      noteCount: this.noteCount,
    });
  }

  private get distance(): number {
    return Math.max(0, this.player.position.x - 120);
  }

  private readonly handleResize = () => {
    this.renderer.resize();
  };
}
