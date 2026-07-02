import { Input } from "../engine/Input";
import { Vector2 } from "../engine/math/Vector2";
import type { Bounds, KiteAssist } from "../engine/types";

const noKiteAssist: KiteAssist = {
  horizontalAcceleration: 0,
  speedLimitBonus: 0,
  jumpBoost: 0,
  gravityRelief: 0,
  drag: 0,
};

export class Player {
  readonly position = new Vector2(120, 0);
  readonly velocity = new Vector2();
  readonly acceleration = new Vector2();
  readonly width = 34;
  readonly height = 58;
  grounded = false;
  facingDirection = 1;
  stunTimer = 0;
  justJumped = false;

  reset(groundY: number): void {
    this.position.set(120, groundY - this.height);
    this.velocity.set(0, 0);
    this.acceleration.set(0, 0);
    this.grounded = true;
    this.facingDirection = 1;
    this.stunTimer = 0;
    this.justJumped = false;
  }

  update(input: Input, deltaSeconds: number, groundY: number, kiteAssist: KiteAssist = noKiteAssist): void {
    const moveLeft = input.isLeftPressed();
    const moveRight = input.isRightPressed();
    const movement = Number(moveRight) - Number(moveLeft);
    this.stunTimer = Math.max(0, this.stunTimer - deltaSeconds);
    this.justJumped = false;

    const acceleration = this.stunTimer > 0 ? 0 : this.grounded ? 4000 : 1900;
    const friction = Math.max(0.84, (this.grounded ? 0.92 : 0.99) - kiteAssist.drag);
    const gravity = Math.max(760, 1120 - kiteAssist.gravityRelief);

    this.acceleration.set(movement * acceleration + kiteAssist.horizontalAcceleration, gravity);
    if (movement !== 0) {
      this.facingDirection = movement;
    }

    this.velocity.x += this.acceleration.x * deltaSeconds;
    this.velocity.x *= Math.pow(friction, deltaSeconds * 60);
    this.velocity.x = Math.max(-360, Math.min(520 + kiteAssist.speedLimitBonus, this.velocity.x));

    if (input.isJumpPressed() && this.grounded) {
      this.velocity.y = -440 - kiteAssist.jumpBoost;
      this.grounded = false;
      this.justJumped = true;
    }

    this.velocity.y += this.acceleration.y * deltaSeconds;
    this.velocity.y = Math.min(this.velocity.y, 780);
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;

    if (this.position.y + this.height >= groundY) {
      this.position.y = groundY - this.height;
      this.velocity.y = 0;
      this.grounded = true;
    }

    this.position.x = Math.max(0, this.position.x);
  }

  bumpFromObstacle(obstacleBounds: Bounds): void {
    const bounds = this.getBounds();
    const playerCenterX = bounds.x + bounds.width * 0.5;
    const obstacleCenterX = obstacleBounds.x + obstacleBounds.width * 0.5;
    const pushLeft = playerCenterX < obstacleCenterX;
    const separationPadding = 1.5;

    if (pushLeft) {
      this.position.x = obstacleBounds.x - (bounds.x - this.position.x) - bounds.width - separationPadding;
      this.velocity.x = Math.min(this.velocity.x, -90);
    } else {
      this.position.x = obstacleBounds.x + obstacleBounds.width - (bounds.x - this.position.x) + separationPadding;
      this.velocity.x = Math.max(this.velocity.x, 90);
    }

    this.velocity.x *= 0.35;
    this.stunTimer = 0.12;
  }

  getBounds(): Bounds {
    return {
      x: this.position.x + 6,
      y: this.position.y + 4,
      width: this.width - 12,
      height: this.height - 4,
    };
  }
}
