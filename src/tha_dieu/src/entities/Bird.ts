import { Vector2 } from "../engine/math/Vector2";
import type { Bounds } from "../engine/types";

export class Bird {
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly baseY: number;
  age = 0;
  radius = 50;

  constructor(x: number, y: number, speed: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(-speed, 0);
    this.baseY = y;
  }

  update(deltaSeconds: number): void {
    this.age += deltaSeconds;
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y = this.baseY + Math.sin(this.age * 2.4) * 26;
  }

  getBounds(): Bounds {
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius * 0.7,
      width: this.radius * 2,
      height: this.radius * 1.4,
    };
  }
}
