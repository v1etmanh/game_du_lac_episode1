import { distance, normalize } from "./vector.js";

export function resolveCircleObstacle(entity, obstacle) {
  const minimumDistance = entity.radius + obstacle.radius;
  const currentDistance = distance(entity, obstacle);

  if (currentDistance >= minimumDistance) {
    return false;
  }

  const push = normalize(entity.x - obstacle.x, entity.y - obstacle.y);
  entity.x = obstacle.x + push.x * minimumDistance;
  entity.y = obstacle.y + push.y * minimumDistance;

  const dotProduct = entity.directionX * push.x + entity.directionY * push.y;
  entity.directionX -= 2 * dotProduct * push.x;
  entity.directionY -= 2 * dotProduct * push.y;

  const next = normalize(entity.directionX, entity.directionY);
  entity.directionX = next.x;
  entity.directionY = next.y;

  return true;
}
