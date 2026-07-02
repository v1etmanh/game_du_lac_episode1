export function createObstacle(id, x, y, radius, kind = "rock") {
  return {
    id,
    x,
    y,
    radius,
    kind
  };
}
