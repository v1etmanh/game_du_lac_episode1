import { Vector2 } from "./math/Vector2";

export class Camera {
  readonly position = new Vector2();

  update(target: Vector2, facingDirection: number, viewportWidth: number, viewportHeight: number, deltaSeconds: number): void {
    const lookAhead = 150 * facingDirection;
    const desiredX = target.x + lookAhead - viewportWidth * 0.36;
    const desiredY = target.y - viewportHeight * 0.58;
    const smoothing = 1 - Math.exp(-deltaSeconds * 4.5);

    this.position.x += (desiredX - this.position.x) * smoothing;
    this.position.y += (desiredY - this.position.y) * smoothing;
    this.position.y = Math.max(-70, Math.min(this.position.y, 160));
  }
}
