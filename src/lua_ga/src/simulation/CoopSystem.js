import { isCircleInsideRect } from "../math/geometry.js";
import { clamp, normalize } from "../math/vector.js";

function getGateBounds(coop) {
  const centerY = coop.y + coop.height / 2;
  const halfGate = coop.gateWidth / 2;

  return {
    x: coop.x,
    y: centerY - halfGate,
    width: coop.wallThickness,
    height: coop.gateWidth,
    top: centerY - halfGate,
    bottom: centerY + halfGate
  };
}

function getCoopWallRects(coop) {
  const thickness = coop.wallThickness;
  const gate = getGateBounds(coop);
  const walls = [
    { x: coop.x, y: coop.y - thickness / 2, width: coop.width, height: thickness },
    { x: coop.x, y: coop.y + coop.height - thickness / 2, width: coop.width, height: thickness },
    { x: coop.x + coop.width - thickness / 2, y: coop.y, width: thickness, height: coop.height },
    { x: coop.x - thickness / 2, y: coop.y, width: thickness, height: gate.top - coop.y },
    {
      x: coop.x - thickness / 2,
      y: gate.bottom,
      width: thickness,
      height: coop.y + coop.height - gate.bottom
    }
  ];

  if (coop.closed) {
    walls.push({
      x: coop.x - thickness / 2,
      y: gate.top,
      width: thickness,
      height: coop.gateWidth
    });
  }

  return walls;
}

function resolveCircleRectCollision(entity, rect) {
  const closestX = clamp(entity.x, rect.x, rect.x + rect.width);
  const closestY = clamp(entity.y, rect.y, rect.y + rect.height);
  let offsetX = entity.x - closestX;
  let offsetY = entity.y - closestY;
  let distanceSquared = offsetX * offsetX + offsetY * offsetY;

  if (distanceSquared > entity.radius * entity.radius) {
    return false;
  }

  if (distanceSquared <= 0.0001) {
    const distances = [
      { value: Math.abs(entity.x - rect.x), x: -1, y: 0, targetX: rect.x - entity.radius, targetY: entity.y },
      {
        value: Math.abs(rect.x + rect.width - entity.x),
        x: 1,
        y: 0,
        targetX: rect.x + rect.width + entity.radius,
        targetY: entity.y
      },
      { value: Math.abs(entity.y - rect.y), x: 0, y: -1, targetX: entity.x, targetY: rect.y - entity.radius },
      {
        value: Math.abs(rect.y + rect.height - entity.y),
        x: 0,
        y: 1,
        targetX: entity.x,
        targetY: rect.y + rect.height + entity.radius
      }
    ].sort((a, b) => a.value - b.value);

    const push = distances[0];
    entity.x = push.targetX;
    entity.y = push.targetY;
    offsetX = push.x;
    offsetY = push.y;
  } else {
    const dist = Math.sqrt(distanceSquared);
    const push = entity.radius - dist;
    offsetX /= dist;
    offsetY /= dist;
    entity.x += offsetX * push;
    entity.y += offsetY * push;
  }

  const dotProduct = entity.directionX * offsetX + entity.directionY * offsetY;
  entity.directionX -= 2 * dotProduct * offsetX;
  entity.directionY -= 2 * dotProduct * offsetY;
  const next = normalize(entity.directionX, entity.directionY);
  entity.directionX = next.x;
  entity.directionY = next.y;

  return true;
}

export function resolveCoopWallCollisions(entity, coop) {
  let collided = false;

  for (const wall of getCoopWallRects(coop)) {
    if (resolveCircleRectCollision(entity, wall)) {
      collided = true;
    }
  }

  return collided;
}

export function updateCoop(world, settings, deltaTime) {
  const coop = world.coop;
  coop.requiredStayTime = settings.coopRequiredStayTime;
  coop.gateWidth = settings.coopGateWidth;
  coop.wallThickness = settings.coopWallThickness;

  for (const chicken of world.chickens) {
    if (chicken.secured) {
      if (coop.closed) {
        chicken.state = "SECURED";
        chicken.speed = 0;
        continue;
      }

      if (!isCircleInsideRect(chicken, coop)) {
        chicken.secured = false;
        chicken.state = "COOP_RELEASED";
        chicken.coopStayTime = 0;
        world.stats.coopBailed += 1;
      } else if (!["ESCAPE", "PANIC", "CLAP_PANIC"].includes(chicken.state)) {
        chicken.state = "COOP_OPEN";
      }

      continue;
    }

    const inside = isCircleInsideRect(chicken, coop);

    if (inside && coop.closed) {
      chicken.coopStayTime += deltaTime;

      if (!["ESCAPE", "PANIC"].includes(chicken.state)) {
        chicken.state = "ENTERING_COOP";
      }

      if (chicken.coopStayTime >= coop.requiredStayTime) {
        chicken.secured = true;
        chicken.state = "SECURED";
        chicken.speed = 0;
        chicken.x = Math.max(coop.x + chicken.radius + 4, Math.min(coop.x + coop.width - chicken.radius - 4, chicken.x));
        chicken.y = Math.max(coop.y + chicken.radius + 4, Math.min(coop.y + coop.height - chicken.radius - 4, chicken.y));
      }
    } else if (chicken.coopStayTime > 0) {
      chicken.coopStayTime = 0;
      world.stats.coopBailed += 1;
    }
  }

  const allSecured = world.chickens.every((chicken) => chicken.secured);
  if (allSecured && !world.completed) {
    world.completed = true;
    world.paused = true;
    coop.closed = true;
  }
}
