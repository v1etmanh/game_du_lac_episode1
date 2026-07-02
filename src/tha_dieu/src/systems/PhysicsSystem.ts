import { Kite } from "../entities/Kite";
import { Physics } from "../physics/Physics";
import { Wind } from "../physics/Wind";

export class PhysicsSystem {
  private readonly physics = new Physics();

  prepareKite(kite: Kite, wind: Wind): void {
    this.physics.prepareKiteForces(kite, wind);
  }

  integrateKite(kite: Kite, deltaSeconds: number, groundY: number): void {
    this.physics.integrateKite(kite, deltaSeconds);

    if (kite.position.y > groundY - kite.radius) {
      kite.position.y = groundY - kite.radius;
      kite.velocity.y *= -0.22;
      kite.velocity.x *= 0.78;
    }
  }
}
