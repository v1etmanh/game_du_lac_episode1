import { Vector2 } from "../engine/math/Vector2";
import type { Bounds } from "../engine/types";

export class WindGust {
  age = 0;
  used = false;
  readonly captureRadius = 30;
  readonly duration = 4.2;

  constructor(
    public x: number,
    public y: number,
    public readonly length: number,
    public readonly angleRadians: number,
  ) {}

  update(deltaSeconds: number): void {
    this.age += deltaSeconds;
    this.x -= deltaSeconds * 54;
    this.y += Math.sin(this.age * 4.2) * deltaSeconds * 6;
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

    return distanceToSegment(point, this.getStart(), this.getEnd()) <= this.captureRadius;
  }

  getBounds(): Bounds {
    const end = this.getEnd();
    const minX = Math.min(this.x, end.x) - this.captureRadius;
    const minY = Math.min(this.y, end.y) - this.captureRadius;
    const maxX = Math.max(this.x, end.x) + this.captureRadius;
    const maxY = Math.max(this.y, end.y) + this.captureRadius;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}

function distanceToSegment(point: Vector2, start: Vector2, end: Vector2): number {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared <= 0.0001) {
    return Vector2.distance(point, start);
  }

  const projection = ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared;
  const t = Math.max(0, Math.min(1, projection));
  const closestX = start.x + segmentX * t;
  const closestY = start.y + segmentY * t;

  return Math.hypot(point.x - closestX, point.y - closestY);
}
