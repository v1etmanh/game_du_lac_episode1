import type { Bounds } from "../engine/types";

export type ObstacleType =
  | "tree"
  | "rock"
  | "rollingRock"
  | "windmill"
  | "powerline"
  | "bambooPole"
  | "lowBranch"
  | "hayStack"
  | "woodenCart"
  | "lowPowerline"
  | "stormGust";

export class Obstacle {
  rotation = 0;

  constructor(
    public readonly type: ObstacleType,
    public x: number,
    public readonly groundY: number,
    private readonly velocityX =
      type === "rollingRock" ? -135 - Math.random() * 70 : type === "woodenCart" ? -70 - Math.random() * 38 : 0,
  ) {}

  update(deltaSeconds: number): void {
    if (this.type !== "rollingRock" && this.type !== "woodenCart") {
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
      case "bambooPole":
        return 42;
      case "lowBranch":
        return 170;
      case "hayStack":
        return 86;
      case "woodenCart":
        return 128;
      case "lowPowerline":
        return 174;
      case "stormGust":
        return 104;
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
      case "bambooPole":
        return 172;
      case "lowBranch":
        return 138;
      case "hayStack":
        return 72;
      case "woodenCart":
        return 68;
      case "lowPowerline":
        return 118;
      case "stormGust":
        return 230;
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

    if (this.type === "lowPowerline") {
      return { x: this.x + 8, y: this.groundY - 118, width: this.width - 16, height: 20 };
    }

    if (this.type === "lowBranch") {
      return { x: this.x + 14, y: this.groundY - 140, width: this.width - 20, height: 34 };
    }

    if (this.type === "bambooPole") {
      return { x: this.x + 12, y: this.groundY - this.height, width: this.width - 24, height: this.height };
    }

    if (this.type === "hayStack") {
      return { x: this.x + 10, y: this.groundY - this.height + 14, width: this.width - 20, height: this.height - 14 };
    }

    if (this.type === "woodenCart") {
      return { x: this.x + 12, y: this.groundY - this.height + 10, width: this.width - 24, height: this.height - 10 };
    }

    if (this.type === "stormGust") {
      return { x: this.x + 16, y: this.groundY - this.height + 16, width: this.width - 32, height: this.height - 30 };
    }

    return { x: this.x + this.width * 0.28, y: this.groundY - this.height, width: this.width * 0.44, height: this.height };
  }
}
