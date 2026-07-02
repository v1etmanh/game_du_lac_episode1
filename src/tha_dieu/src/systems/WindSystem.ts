import { Wind } from "../physics/Wind";

export class WindSystem {
  private targetDirectionRadians = (20 * Math.PI) / 180;
  private targetStrength = 0.35;
  private retargetTimer = 0;
  private turbulenceClock = 0;

  constructor(private readonly wind: Wind) {}

  reset(): void {
    this.wind.directionRadians = (20 * Math.PI) / 180;
    this.wind.strength = 0.35;
    this.wind.turbulence = 0.12;
    this.targetDirectionRadians = this.wind.directionRadians;
    this.targetStrength = this.wind.strength;
    this.retargetTimer = 1;
    this.turbulenceClock = 0;
  }

  update(deltaSeconds: number): void {
    this.retargetTimer -= deltaSeconds;
    this.turbulenceClock += deltaSeconds;

    if (this.retargetTimer <= 0) {
      this.retargetTimer = 3.4 + Math.random() * 3.2;
      this.targetDirectionRadians = ((-18 + Math.random() * 70) * Math.PI) / 180;
      this.targetStrength = 0.24 + Math.random() * 0.78;
      this.wind.turbulence = 0.08 + Math.random() * 0.18;
    }

    const turbulence = Math.sin(this.turbulenceClock * 3.1) * this.wind.turbulence;
    const directionSmoothing = 1 - Math.exp(-deltaSeconds * 0.55);
    const strengthSmoothing = 1 - Math.exp(-deltaSeconds * 0.7);

    this.wind.directionRadians += (this.targetDirectionRadians + turbulence - this.wind.directionRadians) * directionSmoothing;
    this.wind.strength += (this.targetStrength - this.wind.strength) * strengthSmoothing;
    this.wind.strength = Math.max(0.15, Math.min(1.05, this.wind.strength));
  }
}
