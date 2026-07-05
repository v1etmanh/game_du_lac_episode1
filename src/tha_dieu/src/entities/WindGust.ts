import { Vector2 } from "../engine/math/Vector2";
import type { Bounds } from "../engine/types";

export class WindGust {
  age = 0;
  used = false;
  readonly captureRadius = 18;
  readonly duration = 3.6;

  constructor(
    public x: number,
    public y: number,
    public readonly length: number,
    public readonly angleRadians: number,
  ) {}

  update(deltaSeconds: number): void {
    this.age += deltaSeconds;
    this.x -= deltaSeconds * 42;
    this.y += Math.sin(this.age * 4.8) * deltaSeconds * 4;
  }

  get alpha(): number {
    const fadeIn = Math.min(1, this.age / 0.35);
    const fadeOut = Math.min(1, Math.max(0, this.duration - this.age) / 0.7);
    return fadeIn * fadeOut * (this.used ? 0.42 : 1);
  }

  get expired(): boolean {
    return this.age >= this.duration;
  }

  getStart(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  getEnd(): Vector2 {
    return new Vector2(
      this.x + Math.cos(this.angleRadians) * this.length,
      this.y + Math.sin(this.angleRadians) * this.length,
    );
  }

  catches(point: Vector2): boolean {
    if (this.used || this.expired) {
      return false;
    }

    return Vector2.distance(point, this.getCenter()) <= this.captureRadius;
  }

  getBounds(): Bounds {
    const center = this.getCenter();
    const visualRadius = 34;

    return {
      x: center.x - visualRadius,
      y: center.y - visualRadius,
      width: visualRadius * 2,
      height: visualRadius * 2,
    };
  }

  getCenter(): Vector2 {
    return new Vector2(
      this.x + Math.cos(this.angleRadians) * this.length * 0.5,
      this.y + Math.sin(this.angleRadians) * this.length * 0.5,
    );
  }
}
