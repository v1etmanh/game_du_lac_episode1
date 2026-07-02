import { Kite } from "../entities/Kite";
import { Vector2 } from "../engine/math/Vector2";
import { Wind } from "./Wind";

export class Physics {
  readonly gravity = 920;

  prepareKiteForces(kite: Kite, wind: Wind): void {
    kite.acceleration.set(0, this.gravity * 0.45);

    const windVelocity = wind.getVelocity();
    const relativeWind = Vector2.subtract(windVelocity, kite.velocity);
    const windPressure = relativeWind.length();
    const upwardWind = Math.max(-0.2, Math.sin(wind.directionRadians));
    const liftPower = Math.min(110 + wind.strength * 700 + windPressure * 2.2, 900);
    const liftTilt = upwardWind * 90;

    kite.lift = liftPower;
    kite.drag = Math.min(kite.velocity.length() * 0.24, 120);
    kite.windInfluence = wind.strength;

    kite.acceleration.x += relativeWind.x * 1.15;
    kite.acceleration.y -= liftPower + liftTilt;
    kite.acceleration.x -= kite.velocity.x * 0.7;
    kite.acceleration.y -= kite.velocity.y * 0.4;
  }

  integrateKite(kite: Kite, deltaSeconds: number): void {
    kite.velocity.x += kite.acceleration.x * deltaSeconds;
    kite.velocity.y += kite.acceleration.y * deltaSeconds;
    kite.velocity.limit(720);
    kite.position.x += kite.velocity.x * deltaSeconds;
    kite.position.y += kite.velocity.y * deltaSeconds;
    kite.rotation = Math.atan2(kite.velocity.y * 0.5, Math.max(80, Math.abs(kite.velocity.x))) * 0.8;
  }
}
