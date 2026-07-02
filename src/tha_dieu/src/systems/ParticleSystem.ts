import { Particle } from "../entities/Particle";
import { Player } from "../entities/Player";
import { Rope } from "../physics/Rope";
import { Wind } from "../physics/Wind";
import { Kite } from "../entities/Kite";

export class ParticleSystem {
  readonly particles: Particle[] = [];
  private leafTimer = 0;
  private ropeTimer = 0;

  reset(): void {
    this.particles.length = 0;
    this.leafTimer = 0;
    this.ropeTimer = 0;
  }

  update(deltaSeconds: number, player: Player, kite: Kite, rope: Rope, wind: Wind): void {
    const windVelocity = wind.getVelocity();

    if (player.grounded && Math.abs(player.velocity.x) > 80) {
      this.spawnDust(player.position.x + player.width * 0.5, player.position.y + player.height);
    }

    this.leafTimer -= deltaSeconds;
    if (this.leafTimer <= 0) {
      this.leafTimer = 0.08 + Math.random() * 0.18;
      this.particles.push(
        new Particle(
          "leaf",
          player.position.x + 300 + Math.random() * 700,
          130 + Math.random() * 260,
          windVelocity.x * 0.35,
          -20 + Math.random() * 40,
          4 + Math.random() * 2,
          3 + Math.random() * 3,
        ),
      );
    }

    this.ropeTimer -= deltaSeconds;
    if (rope.tension > 0.35 && this.ropeTimer <= 0) {
      this.ropeTimer = 0.045;
      this.particles.push(
        new Particle("rope", kite.position.x, kite.position.y, -windVelocity.x * 0.04, 16, 0.45, 2 + rope.tension * 3),
      );
    }

    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      if (!this.particles[index].update(deltaSeconds, windVelocity.x)) {
        this.particles.splice(index, 1);
      }
    }
  }

  spawnFeathers(x: number, y: number): void {
    for (let index = 0; index < 7; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 90;
      this.particles.push(
        new Particle(
          "feather",
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 40,
          0.5 + Math.random() * 0.4,
          3 + Math.random() * 3,
        ),
      );
    }
  }

  private spawnDust(x: number, y: number): void {
    if (Math.random() > 0.45) {
      return;
    }

    this.particles.push(
      new Particle(
        "dust",
        x - 14 + Math.random() * 28,
        y - 4,
        -45 + Math.random() * 28,
        -24 - Math.random() * 24,
        0.45 + Math.random() * 0.2,
        4 + Math.random() * 3,
      ),
    );
  }
}
