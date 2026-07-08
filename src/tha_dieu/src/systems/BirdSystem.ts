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
      const difficulty = Math.min(distance / 5200, 1);
      const maxBirds = 2 + Math.floor(difficulty * 4);
      if (birds.length < maxBirds) {
        this.spawn(birds, playerX, viewportWidth, groundY, distance);
        if (difficulty > 0.72 && birds.length < maxBirds && Math.random() < 0.22) {
          this.spawn(birds, playerX, viewportWidth, groundY, distance);
        }
      }
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
    const difficultySpeed = Math.min(distance / 32, 180);
    const speed = 170 + Math.random() * 95 + difficultySpeed;
    birds.push(new Bird(spawnX, spawnY, speed));
  }

  private getSpawnInterval(distance: number): number {
    const difficulty = Math.min(distance / 5200, 1);
    const min = 3.35 - difficulty * 1.55;
    const max = 5.45 - difficulty * 2.25;
    return min + Math.random() * (max - min);
  }
}
