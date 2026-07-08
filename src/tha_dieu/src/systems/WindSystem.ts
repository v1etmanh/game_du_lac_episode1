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

  update(deltaSeconds: number, difficulty = 0): void {
    this.retargetTimer -= deltaSeconds;
    this.turbulenceClock += deltaSeconds;

    if (this.retargetTimer <= 0) {
      const minTimer = 2.25 + (1 - difficulty) * 1.15;
      const maxTimer = 4.25 + (1 - difficulty) * 2.35;
      this.retargetTimer = minTimer + Math.random() * (maxTimer - minTimer);
      const directionSpread = 70 + difficulty * 24;
      this.targetDirectionRadians = ((-22 + Math.random() * directionSpread) * Math.PI) / 180;
      this.targetStrength = 0.26 + Math.random() * (0.78 + difficulty * 0.24);
      this.wind.turbulence = 0.09 + Math.random() * (0.18 + difficulty * 0.1);
    }

    const turbulence = Math.sin(this.turbulenceClock * 3.1) * this.wind.turbulence;
    const directionSmoothing = 1 - Math.exp(-deltaSeconds * 0.55);
    const strengthSmoothing = 1 - Math.exp(-deltaSeconds * 0.7);

    this.wind.directionRadians += (this.targetDirectionRadians + turbulence - this.wind.directionRadians) * directionSmoothing;
    this.wind.strength += (this.targetStrength - this.wind.strength) * strengthSmoothing;
    this.wind.strength = Math.max(0.15, Math.min(1.18, this.wind.strength));
  }
}
