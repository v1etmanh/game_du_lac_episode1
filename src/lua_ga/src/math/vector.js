export function length(x, y) {
  return Math.hypot(x, y);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(x, y) {
  const len = length(x, y);
  if (len <= 0.0001) {
    return { x: 1, y: 0 };
  }

  return { x: x / len, y: y / len };
}

export function rotate(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}
