export type GameLoopCallback = (deltaSeconds: number, fps: number) => void;

export class GameLoop {
  private animationFrameId = 0;
  private lastTime = 0;
  private smoothedFps = 60;
  private running = false;

  constructor(private readonly onFrame: GameLoopCallback) {}

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  private readonly tick = (time: number) => {
    if (!this.running) {
      return;
    }

    const deltaSeconds = Math.min((time - this.lastTime) / 1000, 1 / 30);
    this.lastTime = time;
    const currentFps = deltaSeconds > 0 ? 1 / deltaSeconds : 60;
    this.smoothedFps += (currentFps - this.smoothedFps) * 0.08;
    this.onFrame(deltaSeconds, this.smoothedFps);
    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}
