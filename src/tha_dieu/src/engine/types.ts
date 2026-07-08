export interface GameSnapshot {
  windDirectionDegrees: number;
  windStrength: number;
  ropeLength: number;
  minRopeLength: number;
  maxRopeLength: number;
  ropeCommand: "shorten" | "release" | null;
  ropeLimit: "min" | "max" | null;
  ropeSpeed: number;
  distance: number;
  fps: number;
  paused: boolean;
  crashed: boolean;
  completed: boolean;
  lives: number;
  maxLives: number;
  goalDistance: number;
  // Mức tích lực nhảy cao (0..1): giữ chuột phải để thu dây diều trong lúc đứng yên.
  jumpChargeLevel: number;
  // true khi lực đã tích đủ để thực hiện cú nhảy cao vượt cây/cối xay gió.
  readyForHighJump: boolean;
  windLiftTimer: number;
  noteCount: number;
  score: number;
  stallWarning: number;
  stallPenaltyActive: boolean;
  difficulty: number;
}

export interface KiteAssist {
  horizontalAcceleration: number;
  speedLimitBonus: number;
  runSpeedMultiplier: number;
  speedLimitBase: number;
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
