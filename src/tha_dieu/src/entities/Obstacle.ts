import type { Bounds } from "../engine/types";

export type ObstacleType = "tree" | "rock" | "rollingRock" | "windmill" | "powerline";

export class Obstacle {
  rotation = 0;

  constructor(
    public readonly type: ObstacleType,
    public x: number,
    public readonly groundY: number,
    private readonly velocityX = type === "rollingRock" ? -135 - Math.random() * 70 : 0,
  ) {}

  update(deltaSeconds: number): void {
    if (this.type !== "rollingRock") {
      return;
    }

    this.x += this.velocityX * deltaSeconds;
    this.rotation += (this.velocityX / Math.max(1, this.width * 0.5)) * deltaSeconds;
  }

  get width(): number {
    switch (this.type) {
      case "tree":
        return 74;
      case "rock":
        return 58;
      case "rollingRock":
        return 48;
      case "windmill":
        return 82;
      case "powerline":
        return 150;
    }
  }

  get height(): number {
    switch (this.type) {
      case "tree":
        return 148;
      case "rock":
        return 42;
      case "rollingRock":
        return 48;
      case "windmill":
        return 190;
      case "powerline":
        return 165;
    }
  }

  getBounds(): Bounds {
    if (this.type === "rock") {
      return { x: this.x + 8, y: this.groundY - this.height + 10, width: this.width - 16, height: this.height - 10 };
    }

    if (this.type === "rollingRock") {
      return { x: this.x + 5, y: this.groundY - this.height + 5, width: this.width - 10, height: this.height - 8 };
    }

    if (this.type === "powerline") {
      return { x: this.x, y: this.groundY - this.height, width: this.width, height: 28 };
    }

    return { x: this.x + this.width * 0.28, y: this.groundY - this.height, width: this.width * 0.44, height: this.height };
  }
}
