import { RenderSystem, type RenderFrame } from "../systems/RenderSystem";

export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly renderSystem = new RenderSystem();
  private pixelRatio = 1;
  width = 0;
  height = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    this.context = context;
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(320, rect.width);
    this.height = Math.max(420, rect.height);
    this.canvas.width = Math.floor(this.width * this.pixelRatio);
    this.canvas.height = Math.floor(this.height * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  render(frame: RenderFrame): void {
    this.renderSystem.render(this.context, this.width, this.height, frame);
  }
}
