import { randomDirection } from "../math/random.js";
import { distance } from "../math/vector.js";

export function createClapWave(world, settings) {
  if (world.completed) {
    return false;
  }

  world.clapSequence += 1;
  world.clapWaves.push({
    id: `clap-${world.clapSequence}`,
    x: world.player.x,
    y: world.player.y,
    radius: 0,
    maxRadius: settings.clapWaveRadius,
    speed: settings.clapWaveSpeed,
    width: settings.clapWaveWidth,
    hitChickenIds: new Set()
  });
  world.stats.clapsUsed += 1;

  return true;
}

export function updateClapWaves(world, settings, deltaTime) {
  for (const wave of world.clapWaves) {
    wave.radius += wave.speed * deltaTime;

    for (const chicken of world.chickens) {
      if (wave.hitChickenIds.has(chicken.id)) {
        continue;
      }

      const chickenDistance = distance(wave, chicken);
      const touchedByWave = Math.abs(chickenDistance - wave.radius) <= wave.width + chicken.radius;
      if (!touchedByWave) {
        continue;
      }

      wave.hitChickenIds.add(chicken.id);

      if (chicken.secured && world.coop.closed) {
        continue;
      }

      const direction = randomDirection();
      chicken.secured = false;
      chicken.coopStayTime = 0;
      chicken.state = "CLAP_PANIC";
      chicken.directionX = direction.x;
      chicken.directionY = direction.y;
      chicken.lastEscapeBase = direction;
      chicken.speed = settings.clapPanicSpeed;
      chicken.clapPanicSpeed = settings.clapPanicSpeed;
      chicken.escapeDistanceRemaining = settings.clapRunDistance;
      chicken.directionLockRemaining = settings.clapDirectionLockTime;
      world.stats.panicCount += 1;
    }
  }

  world.clapWaves = world.clapWaves.filter((wave) => wave.radius <= wave.maxRadius + wave.width);
}
