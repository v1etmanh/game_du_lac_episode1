import { Vector2 } from "../engine/math/Vector2";
import type { Bounds } from "../engine/types";

export class Kite {
  readonly position = new Vector2();
  readonly velocity = new Vector2();
  readonly acceleration = new Vector2();
  lift = 0;
  drag = 0;
  windInfluence = 0;
  rotation = 0;
  radius = 22;

  reset(playerX: number, groundY: number): void {
    this.position.set(playerX + 140, groundY - 270);
    this.velocity.set(120, -80);
    this.acceleration.set(0, 0);
    this.lift = 0;
    this.drag = 0;
    this.windInfluence = 0;
    this.rotation = -0.1;
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
