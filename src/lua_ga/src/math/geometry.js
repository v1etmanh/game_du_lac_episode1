export function isCircleInsideRect(circle, rect) {
  return (
    circle.x - circle.radius >= rect.x &&
    circle.x + circle.radius <= rect.x + rect.width &&
    circle.y - circle.radius >= rect.y &&
    circle.y + circle.radius <= rect.y + rect.height
  );
}

export function closestPointOnRect(point, rect) {
  return {
    x: Math.max(rect.x, Math.min(rect.x + rect.width, point.x)),
    y: Math.max(rect.y, Math.min(rect.y + rect.height, point.y))
  };
}
