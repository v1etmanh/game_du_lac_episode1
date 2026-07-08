import { Obstacle, type ObstacleType } from "../entities/Obstacle";

export class WorldGenerator {
  private nextObstacleX = 1180;

  reset(): void {
    this.nextObstacleX = 1180;
  }

  update(obstacles: Obstacle[], playerX: number, viewportWidth: number, groundY: number): void {
    const distance = Math.max(0, playerX - 120);
    const generateUntilX = playerX + viewportWidth + 1100;

    while (this.nextObstacleX < generateUntilX) {
      const gapOnly = distance > 900 && Math.random() < this.getRestChance(distance);
      if (!gapOnly) {
        obstacles.push(new Obstacle(this.pickObstacleType(distance), this.nextObstacleX, groundY));
      }

      this.nextObstacleX += this.getNextGap(distance);
    }

    for (let index = obstacles.length - 1; index >= 0; index -= 1) {
      if (obstacles[index].x + obstacles[index].width < playerX - 620) {
        obstacles.splice(index, 1);
      }
    }
  }

  private getNextGap(distance: number): number {
    const difficulty = Math.min(distance / 6000, 1);
    const minGap = 500 - difficulty * 135;
    const maxGap = 820 - difficulty * 195;
    return minGap + Math.random() * (maxGap - minGap);
  }

  private getRestChance(distance: number): number {
    if (distance < 1500) {
      return 0.28;
    }

    return Math.max(0.12, 0.25 - distance / 36000);
  }

  private pickObstacleType(distance: number): ObstacleType {
    const roll = Math.random();

    if (distance < 850) {
      if (roll < 0.38) {
        return "rock";
      }
      if (roll < 0.68) {
        return "bambooPole";
      }
      return roll < 0.86 ? "hayStack" : "tree";
    }

    if (distance < 1700) {
      if (roll < 0.28) {
        return "rock";
      }
      if (roll < 0.48) {
        return "bambooPole";
      }
      if (roll < 0.64) {
        return "hayStack";
      }
      if (roll < 0.78) {
        return "tree";
      }
      return roll < 0.9 ? "lowBranch" : "rollingRock";
    }

    if (distance < 3000) {
      if (roll < 0.22) {
        return "rock";
      }
      if (roll < 0.38) {
        return "tree";
      }
      if (roll < 0.52) {
        return "lowBranch";
      }
      if (roll < 0.66) {
        return "rollingRock";
      }
      if (roll < 0.78) {
        return "woodenCart";
      }
      if (roll < 0.9) {
        return "windmill";
      }
      return "stormGust";
    }

    if (roll < 0.16) {
      return "rock";
    }
    if (roll < 0.3) {
      return "tree";
    }
    if (roll < 0.43) {
      return "lowBranch";
    }
    if (roll < 0.56) {
      return "rollingRock";
    }
    if (roll < 0.68) {
      return "woodenCart";
    }
    if (roll < 0.8) {
      return "windmill";
    }
    if (roll < 0.9) {
      return "lowPowerline";
    }
    return roll < 0.96 ? "stormGust" : "powerline";
  }
}
