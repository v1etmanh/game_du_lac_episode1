import { randomBetween, randomDirection } from "../math/random.js";

const START_POSITIONS = [
  { x: 430, y: 165 },
  { x: 520, y: 250 },
  { x: 390, y: 410 },
  { x: 610, y: 390 },
  { x: 315, y: 290 },
  { x: 560, y: 145 }
];

export function createChicken(index, type, settings) {
  const direction = randomDirection();
  const position = START_POSITIONS[index % START_POSITIONS.length];
  const isRooster = type === "rooster";

  return {
    id: `chicken-${String(index + 1).padStart(2, "0")}`,
    type,

    x: position.x + randomBetween(-24, 24),
    y: position.y + randomBetween(-24, 24),
    radius: isRooster ? 10 : 8,

    state: "WANDER",
    previousState: "WANDER",
    directionX: direction.x,
    directionY: direction.y,
    speed: settings.chickenWanderSpeed,

    alertRadius: settings.chickenAlertRadius,
    pressureRadius: settings.chickenPressureRadius,
    panicRadius: settings.chickenPanicRadius,

    wanderSpeed: settings.chickenWanderSpeed,
    escapeSpeed: isRooster ? settings.roosterEscapeSpeed : settings.chickenEscapeSpeed,
    panicSpeed: isRooster ? settings.roosterPanicSpeed : settings.chickenPanicSpeed,
    clapPanicSpeed: settings.clapPanicSpeed,

    wanderTimer: randomBetween(0.8, 2.2),
    peckTimer: 0,
    alertTimer: 0,
    escapeDistanceRemaining: 0,
    directionLockRemaining: 0,
    lastEscapeBase: { x: direction.x, y: direction.y },

    targetFoodId: null,
    eatTimer: 0,

    coopStayTime: 0,
    secured: false,
    distanceTravelled: 0
  };
}
