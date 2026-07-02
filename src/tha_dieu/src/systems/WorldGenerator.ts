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
    const minGap = 520 - difficulty * 150;
    const maxGap = 860 - difficulty * 210;
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

    if (distance < 1400) {
      return roll < 0.7 ? "rock" : "tree";
    }

    if (distance < 3000) {
      if (roll < 0.5) {
        return "rock";
      }
      if (roll < 0.72) {
        return "tree";
      }
      return roll < 0.9 ? "rollingRock" : "windmill";
    }

    if (roll < 0.34) {
      return "rock";
    }
    if (roll < 0.6) {
      return "tree";
    }
    if (roll < 0.78) {
      return "rollingRock";
    }
    if (roll < 0.92) {
      return "windmill";
    }
    return "powerline";
  }
}
