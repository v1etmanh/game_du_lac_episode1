import { consumeGrain } from "./GrainSystem.js";
import { keepInsideWorld, resolveObstacleCollisions } from "./CollisionSystem.js";
import { distance, normalize, rotate } from "../math/vector.js";
import { randomBetween, randomDirection, randomEscapeAngle } from "../math/random.js";

const ROOSTER_ATTACK_STATES = new Set(["ROOSTER_AIM", "ROOSTER_CHARGE", "ROOSTER_RECOVER"]);

function setState(chicken, state) {
  chicken.previousState = chicken.state;
  chicken.state = state;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function getEscapeSpeed(chicken, playerDistance, settings, isPanic) {
  const baseSpeed = isPanic ? chicken.panicSpeed : chicken.escapeSpeed;
  const burstMultiplier = isPanic ? settings.chickenPanicBurstMultiplier : settings.chickenEscapeBurstMultiplier;
  const danger = 1 - clamp01(playerDistance / chicken.alertRadius);

  return baseSpeed * (burstMultiplier + danger * burstMultiplier * 0.75);
}

function chooseEscapeDirection(chicken, player, settings, isPanic, playerDistance) {
  const center = normalize(chicken.x - player.x, chicken.y - player.y);
  const coneAngle = isPanic ? Math.min(150, settings.escapeConeAngle + 35) : settings.escapeConeAngle;
  const angle = randomEscapeAngle(coneAngle, settings.escapeDistribution);
  const direction = rotate(center, angle);
  const distanceToLeaveInfluence = Math.max(
    0,
    settings.chickenAlertRadius + settings.escapeExitBuffer - playerDistance
  );

  chicken.directionX = direction.x;
  chicken.directionY = direction.y;
  chicken.lastEscapeBase = center;
  chicken.escapeDistanceRemaining = Math.max(
    randomBetween(settings.minimumEscapeDistance, settings.maximumEscapeDistance),
    distanceToLeaveInfluence
  );
  chicken.directionLockRemaining = randomBetween(settings.minimumDirectionLockTime, settings.maximumDirectionLockTime);
}

function findAvailableFood(chicken, world) {
  let bestPile = null;
  let bestDistance = Infinity;

  for (const pile of world.grainPiles) {
    const chickenDistance = distance(chicken, pile);
    const playerDistance = distance(world.player, pile);

    if (
      pile.active &&
      pile.amount > 0 &&
      !pile.tooCloseToCoopGate &&
      chickenDistance <= pile.attractionRadius &&
      playerDistance >= pile.playerExclusionRadius &&
      chickenDistance < bestDistance
    ) {
      bestPile = pile;
      bestDistance = chickenDistance;
    }
  }

  return bestPile;
}

function updateWanderAndPeck(chicken, settings, deltaTime) {
  if (chicken.state === "PECK") {
    chicken.peckTimer -= deltaTime;
    chicken.speed = 0;

    if (chicken.peckTimer <= 0) {
      const direction = randomDirection();
      chicken.directionX = direction.x;
      chicken.directionY = direction.y;
      chicken.wanderTimer = randomBetween(1, 3);
      setState(chicken, "WANDER");
    }

    return;
  }

  if (chicken.state !== "WANDER") {
    setState(chicken, "WANDER");
    chicken.wanderTimer = randomBetween(0.7, 2.3);
  }

  chicken.speed = settings.chickenWanderSpeed;
  chicken.wanderTimer -= deltaTime;

  if (chicken.wanderTimer <= 0) {
    if (Math.random() < 0.35) {
      setState(chicken, "PECK");
      chicken.peckTimer = randomBetween(0.5, 1.5);
      chicken.speed = 0;
    } else {
      const direction = randomDirection();
      chicken.directionX = direction.x;
      chicken.directionY = direction.y;
      chicken.wanderTimer = randomBetween(1, 3);
    }
  }
}

function updateChickenIntent(chicken, world, settings, deltaTime) {
  chicken.alertRadius = settings.chickenAlertRadius;
  chicken.pressureRadius = settings.chickenPressureRadius;
  chicken.panicRadius = settings.chickenPanicRadius;
  chicken.wanderSpeed = settings.chickenWanderSpeed;
  chicken.escapeSpeed = chicken.type === "rooster" ? settings.roosterEscapeSpeed : settings.chickenEscapeSpeed;
  chicken.panicSpeed = chicken.type === "rooster" ? settings.roosterPanicSpeed : settings.chickenPanicSpeed;
  chicken.directionLockRemaining = Math.max(0, chicken.directionLockRemaining - deltaTime);

  if (chicken.type === "rooster") {
    if (updateRoosterAttack(chicken, world, settings, deltaTime)) {
      return;
    }
  }

  const playerDistance = distance(chicken, world.player);
  const canContinueEscape =
    ["ESCAPE", "PANIC", "CLAP_PANIC"].includes(chicken.state) &&
    chicken.escapeDistanceRemaining > 0 &&
    chicken.directionLockRemaining > 0;

  if (playerDistance <= chicken.panicRadius) {
    if (chicken.state !== "PANIC" || chicken.directionLockRemaining <= 0) {
      chooseEscapeDirection(chicken, world.player, settings, true, playerDistance);
      world.stats.panicCount += 1;
    }
    setState(chicken, "PANIC");
    chicken.speed = getEscapeSpeed(chicken, playerDistance, settings, true);
    return;
  }

  if (canContinueEscape) {
    chicken.speed =
      chicken.state === "CLAP_PANIC"
        ? settings.clapPanicSpeed
        : getEscapeSpeed(chicken, playerDistance, settings, chicken.state === "PANIC");
    return;
  }

  if (playerDistance <= chicken.alertRadius) {
    if (chicken.state !== "ESCAPE" || chicken.escapeDistanceRemaining <= 0 || chicken.directionLockRemaining <= 0) {
      chooseEscapeDirection(chicken, world.player, settings, false, playerDistance);
    }
    setState(chicken, "ESCAPE");
    chicken.speed = getEscapeSpeed(chicken, playerDistance, settings, false);
    chicken.alertTimer += deltaTime;
    return;
  }

  const food = chicken.type === "rooster" ? null : findAvailableFood(chicken, world);
  if (food) {
    chicken.targetFoodId = food.id;
    const foodDistance = distance(chicken, food);

    if (foodDistance <= chicken.radius + 10) {
      setState(chicken, "EAT");
      chicken.speed = 0;
      consumeGrain(food, settings, deltaTime);
      return;
    }

    const direction = normalize(food.x - chicken.x, food.y - chicken.y);
    chicken.directionX = direction.x;
    chicken.directionY = direction.y;
    chicken.speed = 35;
    setState(chicken, "GO_TO_FOOD");
    return;
  }

  chicken.targetFoodId = null;
  updateWanderAndPeck(chicken, settings, deltaTime);
}

function scheduleNextRoosterAttack(chicken, world, settings) {
  chicken.nextAttackAt = world.stats.elapsedTime + randomBetween(settings.roosterAttackMinInterval, settings.roosterAttackMaxInterval);
}

function isPlayerInRoosterAttackRange(chicken, world) {
  return distance(chicken, world.player) <= chicken.alertRadius;
}

function startRoosterAttack(chicken, world, settings) {
  const direction = normalize(world.player.x - chicken.x, world.player.y - chicken.y);

  chicken.attackStarted = true;
  chicken.attackTelegraphRemaining = settings.roosterAttackTelegraphTime;
  chicken.attackDistanceRemaining = settings.roosterAttackDistance;
  chicken.attackRecoverRemaining = 0;
  chicken.attackTargetX = world.player.x;
  chicken.attackTargetY = world.player.y;
  chicken.directionX = direction.x;
  chicken.directionY = direction.y;
  chicken.speed = 0;
  setState(chicken, "ROOSTER_AIM");
}

function cancelRoosterAttack(chicken, world, settings) {
  chicken.attackStarted = false;
  chicken.attackTelegraphRemaining = 0;
  chicken.attackDistanceRemaining = 0;
  chicken.attackRecoverRemaining = 0;
  chicken.speed = 0;
  scheduleNextRoosterAttack(chicken, world, settings);
  setState(chicken, "WANDER");
  chicken.wanderTimer = randomBetween(0.7, 1.8);
}

function updateRoosterAttack(chicken, world, settings, deltaTime) {
  if (!chicken.attackStarted && world.stats.elapsedTime >= chicken.nextAttackAt) {
    if (isPlayerInRoosterAttackRange(chicken, world)) {
      startRoosterAttack(chicken, world, settings);
    } else {
      scheduleNextRoosterAttack(chicken, world, settings);
    }
  }

  if (chicken.state === "ROOSTER_AIM") {
    if (!isPlayerInRoosterAttackRange(chicken, world)) {
      cancelRoosterAttack(chicken, world, settings);
      return false;
    }

    const direction = normalize(world.player.x - chicken.x, world.player.y - chicken.y);
    chicken.attackTargetX = world.player.x;
    chicken.attackTargetY = world.player.y;
    chicken.directionX = direction.x;
    chicken.directionY = direction.y;
    chicken.attackTelegraphRemaining -= deltaTime;
    chicken.speed = 0;

    if (chicken.attackTelegraphRemaining <= 0) {
      setState(chicken, "ROOSTER_CHARGE");
      chicken.speed = settings.roosterAttackSpeed;
    }

    return true;
  }

  if (chicken.state === "ROOSTER_CHARGE") {
    chicken.speed = settings.roosterAttackSpeed;
    return true;
  }

  if (chicken.state === "ROOSTER_RECOVER") {
    chicken.attackRecoverRemaining -= deltaTime;
    chicken.speed = 0;

    if (chicken.attackRecoverRemaining <= 0) {
      chicken.attackStarted = false;
      scheduleNextRoosterAttack(chicken, world, settings);
      setState(chicken, "WANDER");
      chicken.wanderTimer = randomBetween(0.7, 1.8);
    }

    return true;
  }

  return false;
}

function knockPlayerFromRooster(chicken, world, settings) {
  const player = world.player;

  world.playerLives = Math.max(0, world.playerLives - 1);
  if (world.playerLives <= 0) {
    world.failed = true;
    world.failureReason = "lives";
    world.paused = true;
  }

  player.x += chicken.directionX * 70;
  player.y += chicken.directionY * 70;
  keepInsideWorld(player, settings);
  resolveObstacleCollisions(player, world);
  world.stats.roosterHits += 1;
}

function moveChicken(chicken, world, settings, deltaTime) {
  if (chicken.speed <= 0 || (chicken.secured && world.coop.closed)) {
    return;
  }

  const movement = chicken.speed * deltaTime;
  const previousX = chicken.x;
  const previousY = chicken.y;

  chicken.x += chicken.directionX * movement;
  chicken.y += chicken.directionY * movement;

  if (["ESCAPE", "PANIC", "CLAP_PANIC"].includes(chicken.state)) {
    chicken.escapeDistanceRemaining -= movement;
  }

  if (chicken.state === "ROOSTER_CHARGE") {
    chicken.attackDistanceRemaining -= movement;

    if (distance(chicken, world.player) <= chicken.radius + world.player.radius + 4) {
      knockPlayerFromRooster(chicken, world, settings);
      chicken.attackDistanceRemaining = 0;
    }
  }

  const hitBounds = keepInsideWorld(chicken, settings);
  const hitObstacle = resolveObstacleCollisions(chicken, world, "obstacleCollisions");

  if (chicken.state === "ROOSTER_CHARGE" && (chicken.attackDistanceRemaining <= 0 || hitBounds || hitObstacle)) {
    setState(chicken, "ROOSTER_RECOVER");
    chicken.speed = 0;
    chicken.attackRecoverRemaining = settings.roosterAttackRecoverTime;
  }

  if (hitBounds || hitObstacle) {
    if (!ROOSTER_ATTACK_STATES.has(chicken.state)) {
      chicken.escapeDistanceRemaining = 0;
      chicken.directionLockRemaining = 0;

      if (hitObstacle) {
        chicken.wanderTimer = Math.min(chicken.wanderTimer, 0.25);
      }
    }
  }

  chicken.distanceTravelled += distance({ x: previousX, y: previousY }, chicken);
}

export function updateChickens(world, settings, deltaTime) {
  for (const chicken of world.chickens) {
    if (chicken.secured && world.coop.closed) {
      chicken.state = "SECURED";
      chicken.speed = 0;
      chicken.attackStarted = false;
      continue;
    }

    updateChickenIntent(chicken, world, settings, deltaTime);
    moveChicken(chicken, world, settings, deltaTime);
  }
}
