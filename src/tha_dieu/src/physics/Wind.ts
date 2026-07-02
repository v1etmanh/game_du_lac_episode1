import { Vector2 } from "../engine/math/Vector2";

export class Wind {
  directionRadians = (20 * Math.PI) / 180;
  strength = 0.35;
  turbulence = 0.12;

  get directionDegrees(): number {
    return (this.directionRadians * 180) / Math.PI;
  }

  getVelocity(): Vector2 {
    const baseSpeed = 480 * this.strength;
    return new Vector2(Math.cos(this.directionRadians) * baseSpeed, -Math.sin(this.directionRadians) * baseSpeed);
  }
}
