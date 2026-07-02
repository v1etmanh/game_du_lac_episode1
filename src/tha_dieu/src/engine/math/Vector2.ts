export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(value: Vector2): this {
    this.x = value.x;
    this.y = value.y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(value: Vector2): this {
    this.x += value.x;
    this.y += value.y;
    return this;
  }

  subtract(value: Vector2): this {
    this.x -= value.x;
    this.y -= value.y;
    return this;
  }

  scale(value: number): this {
    this.x *= value;
    this.y *= value;
    return this;
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): this {
    const currentLength = this.length();
    if (currentLength > 0.0001) {
      this.x /= currentLength;
      this.y /= currentLength;
    }
    return this;
  }

  limit(max: number): this {
    const currentLength = this.length();
    if (currentLength > max && currentLength > 0.0001) {
      this.scale(max / currentLength);
    }
    return this;
  }

  static subtract(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static distance(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
