export interface GameSnapshot {
  windDirectionDegrees: number;
  windStrength: number;
  ropeLength: number;
  minRopeLength: number;
  maxRopeLength: number;
  distance: number;
  fps: number;
  paused: boolean;
  crashed: boolean;
  completed: boolean;
  lives: number;
  maxLives: number;
  goalDistance: number;
}

export interface KiteAssist {
  horizontalAcceleration: number;
  speedLimitBonus: number;
  jumpBoost: number;
  gravityRelief: number;
  drag: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
