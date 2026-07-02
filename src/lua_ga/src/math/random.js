export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export function randomDirection() {
  const angle = randomBetween(0, Math.PI * 2);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

export function randomEscapeAngle(coneAngleDegrees, distribution) {
  const halfAngle = (coneAngleDegrees * Math.PI) / 360;

  if (distribution === "center") {
    return (randomBetween(-halfAngle, halfAngle) + randomBetween(-halfAngle, halfAngle)) / 2;
  }

  return randomBetween(-halfAngle, halfAngle);
}
