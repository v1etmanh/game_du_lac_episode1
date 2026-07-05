import { Vector2 } from "../engine/math/Vector2";
import type { Bounds } from "../engine/types";

export class MusicNote {
  readonly position: Vector2;
  readonly radius = 18;
  private age = Math.random() * Math.PI * 2;

  constructor(
    x: number,
    private readonly baseY: number,
  ) {
    this.position = new Vector2(x, baseY);
  }

  update(deltaSeconds: number): void {
    this.age += deltaSeconds;
    this.position.y = this.baseY + Math.sin(this.age * 2.7) * 9;
  }

  getBounds(): Bounds {
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }
}
