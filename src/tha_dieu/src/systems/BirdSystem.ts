import { Bird } from "../entities/Bird";

export class BirdSystem {
  private timer = 2.6;

  reset(): void {
    this.timer = 2.6;
  }

  update(
    birds: Bird[],
    deltaSeconds: number,
    playerX: number,
    viewportWidth: number,
    groundY: number,
    distance: number,
  ): void {
    this.timer -= deltaSeconds;

    if (this.timer <= 0) {
      this.timer = this.getSpawnInterval(distance);
      this.spawn(birds, playerX, viewportWidth, groundY, distance);
    }

    birds.forEach((bird) => bird.update(deltaSeconds));

    for (let index = birds.length - 1; index >= 0; index -= 1) {
      if (birds[index].position.x < playerX - 520) {
        birds.splice(index, 1);
      }
    }
  }

  private spawn(birds: Bird[], playerX: number, viewportWidth: number, groundY: number, distance: number): void {
    const spawnX = playerX + viewportWidth + 220 + Math.random() * 260;
    // Altitude band overlaps the "high kite" zone a player must reach to
    // clear tall obstacles, so lifting the kite for extra jump lift also
    // risks a bird strike.
    const minY = groundY - 370;
    const maxY = groundY - 150;
    const spawnY = minY + Math.random() * (maxY - minY);
    const difficultySpeed = Math.min(distance / 45, 130);
    const speed = 160 + Math.random() * 90 + difficultySpeed;
    birds.push(new Bird(spawnX, spawnY, speed));
  }

  private getSpawnInterval(distance: number): number {
    const difficulty = Math.min(distance / 5200, 1);
    const min = 3.6 - difficulty * 1.8;
    const max = 5.8 - difficulty * 2.4;
    return min + Math.random() * (max - min);
  }
}
