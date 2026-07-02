import { clamp, distance, normalize } from "../math/vector.js";
import { resolveCircleObstacle } from "../math/collision.js";

export function keepInsideWorld(entity, settings) {
  const previousX = entity.x;
  const previousY = entity.y;

  entity.x = clamp(entity.x, entity.radius, settings.worldWidth - entity.radius);
  entity.y = clamp(entity.y, entity.radius, settings.worldHeight - entity.radius);

  if (entity.x !== previousX) {
    entity.directionX *= -1;
  }

  if (entity.y !== previousY) {
    entity.directionY *= -1;
  }

  return entity.x !== previousX || entity.y !== previousY;
}

export function resolveObstacleCollisions(entity, world, statsKey) {
  let collided = false;

  for (const obstacle of world.obstacles) {
    if (resolveCircleObstacle(entity, obstacle)) {
      collided = true;
      if (statsKey) {
        world.stats[statsKey] += 1;
      }
    }
  }

  return collided;
}

export function resolveChickenSeparation(world) {
  const chickens = world.chickens.filter((chicken) => !chicken.secured);

  for (let i = 0; i < chickens.length; i += 1) {
    for (let j = i + 1; j < chickens.length; j += 1) {
      const a = chickens[i];
      const b = chickens[j];
      const minimumDistance = a.radius + b.radius + 2;
      const currentDistance = distance(a, b);

      if (currentDistance > 0 && currentDistance < minimumDistance) {
        const normal = normalize(a.x - b.x, a.y - b.y);
        const push = (minimumDistance - currentDistance) / 2;
        a.x += normal.x * push;
        a.y += normal.y * push;
        b.x -= normal.x * push;
        b.y -= normal.y * push;
      }
    }
  }
}
