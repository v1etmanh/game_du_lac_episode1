import { Vector2 } from "../engine/math/Vector2";

export type ParticleKind = "dust" | "leaf" | "rope" | "feather";

export class Particle {
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly maxLife: number;
  life: number;

  constructor(
    public readonly kind: ParticleKind,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    life: number,
    public readonly size: number,
  ) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(velocityX, velocityY);
    this.life = life;
    this.maxLife = life;
  }

  update(deltaSeconds: number, windX: number): boolean {
    this.velocity.x += windX * deltaSeconds * (this.kind === "leaf" || this.kind === "feather" ? 0.6 : 0.15);
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;
    this.velocity.y += (this.kind === "dust" ? -12 : 22) * deltaSeconds;
    this.life -= deltaSeconds;
    return this.life > 0;
  }

  get alpha(): number {
    return Math.max(0, this.life / this.maxLife);
  }
}
