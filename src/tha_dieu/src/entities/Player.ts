import { Input } from "../engine/Input";
import { Vector2 } from "../engine/math/Vector2";
import type { Bounds, KiteAssist } from "../engine/types";

const noKiteAssist: KiteAssist = {
  horizontalAcceleration: 0,
  speedLimitBonus: 0,
  runSpeedMultiplier: 1,
  speedLimitBase: 600,
  jumpBoost: 0,
  gravityRelief: 0,
  drag: 0,
};

export class Player {
  readonly position = new Vector2(120, 0);
  readonly previousPosition = new Vector2(120, 0);
  readonly velocity = new Vector2();
  readonly acceleration = new Vector2();
  readonly width = 34;
  readonly height = 58;
  grounded = false;
  facingDirection = 1;
  stunTimer = 0;
  justJumped = false;
  // Cơ chế nhảy cao: giữ chuột phải (thu dây diều) để tích lực, sau đó nhảy
  // (chuột trái / Space) sẽ đạt độ cao lớn hơn — cần thiết để vượt qua các
  // chướng ngại vật cao như cối xay gió và cây cao.
  jumpChargeLevel = 0;
  readonly baseJumpVelocity = 465;
  readonly maxJumpChargeVelocity = 380;
  // Thêm một chút sức bật tức thời khi người chơi bấm nhảy ngay trong lúc vẫn
  // đang giữ chuột phải (thu dây) — cộng thêm vào lực tích lũy thông thường.
  readonly comboHoldJumpBonus = 130;
  lastJumpWasCharged = false;

  reset(groundY: number): void {
    this.position.set(120, groundY - this.height);
    this.previousPosition.copy(this.position);
    this.velocity.set(0, 0);
    this.acceleration.set(0, 0);
    this.grounded = true;
    this.facingDirection = 1;
    this.stunTimer = 0;
    this.justJumped = false;
    this.jumpChargeLevel = 0;
    this.lastJumpWasCharged = false;
  }

  update(input: Input, deltaSeconds: number, groundY: number, kiteAssist: KiteAssist = noKiteAssist, windLiftTimer = 0): void {
    const moveLeft = input.isLeftPressed();
    const moveRight = input.isRightPressed();
    const movement = Number(moveRight) - Number(moveLeft);
    const windLiftActive = windLiftTimer > 0;
    this.stunTimer = Math.max(0, this.stunTimer - deltaSeconds);
    this.justJumped = false;
    this.previousPosition.copy(this.position);

    // Tích lực nhảy cao: chỉ cần giữ chuột phải (thu dây diều) trong lúc đang ở
    // trên mặt đất — không bắt buộc phải đứng yên. Nhả chuột phải sẽ làm lực tụt
    // nhanh, nên vẫn cần giữ đến lúc nhảy mới tận dụng được độ cao.
    const isChargingHighJump = this.grounded && input.isShortenPressed();

    if (isChargingHighJump) {
      this.jumpChargeLevel = Math.min(1, this.jumpChargeLevel + deltaSeconds / 0.9);
    } else {
      this.jumpChargeLevel = Math.max(0, this.jumpChargeLevel - deltaSeconds * 2.5);
    }

    const acceleration = this.stunTimer > 0 ? 0 : this.grounded ? 4550 : 2150;
    const friction = Math.max(0.84, (this.grounded ? 0.92 : 0.99) - kiteAssist.drag);
    const heightAboveGround = groundY - (this.position.y + this.height);
    const liftGravity = heightAboveGround < 170 ? -120 : heightAboveGround < 250 ? 40 : 260;
    const gravity = windLiftActive ? liftGravity : Math.max(760, 1120 - kiteAssist.gravityRelief);

    const windBoostAcceleration = windLiftActive ? 5200 : 0;
    this.acceleration.set(
      movement * acceleration * kiteAssist.runSpeedMultiplier + kiteAssist.horizontalAcceleration + windBoostAcceleration,
      gravity,
    );
    if (movement !== 0 || windLiftActive) {
      this.facingDirection = movement;
      if (windLiftActive) {
        this.facingDirection = 1;
      }
    }

    this.velocity.x += this.acceleration.x * deltaSeconds;
    this.velocity.x *= Math.pow(friction, deltaSeconds * 60);
    const maxForwardSpeed = windLiftActive ? 920 : kiteAssist.speedLimitBase + kiteAssist.speedLimitBonus;
    const maxBackwardSpeed = Math.max(115, maxForwardSpeed * 0.7);
    this.velocity.x = Math.max(-maxBackwardSpeed, Math.min(maxForwardSpeed, this.velocity.x));
    if (windLiftActive) {
      const windCruiseSpeed = 820;
      const windSmoothing = 1 - Math.exp(-deltaSeconds * 6.5);
      this.velocity.x += (windCruiseSpeed - this.velocity.x) * windSmoothing;
    }

    if (input.isJumpPressed() && this.grounded) {
      const chargeBoost = this.jumpChargeLevel * this.maxJumpChargeVelocity;
      // Nếu vẫn đang giữ chuột phải đúng lúc bấm nhảy (combo giữ + nhảy), cộng
      // thêm một chút sức bật tức thời, ngoài phần đã tích lũy theo thời gian.
      const comboBonus = input.isShortenPressed() ? this.comboHoldJumpBonus : 0;
      // Giảm lực nhảy cơ bản: nhảy suông (không tích dây) không còn đủ cao để
      // vượt cây/cối xay gió — bắt buộc phải thu dây trước khi nhảy.
      this.velocity.y = -this.baseJumpVelocity - kiteAssist.jumpBoost - chargeBoost - comboBonus;
      this.grounded = false;
      this.justJumped = true;
      this.lastJumpWasCharged = chargeBoost + comboBonus > this.maxJumpChargeVelocity * 0.5;
      this.jumpChargeLevel = 0;
    }

    if (windLiftActive) {
      this.grounded = false;
    }

    this.velocity.y += this.acceleration.y * deltaSeconds;
    if (windLiftActive) {
      const liftAltitude = groundY - (this.position.y + this.height);
      const targetRiseSpeed = liftAltitude < 160 ? -155 : liftAltitude < 240 ? -85 : 20;
      const liftSmoothing = 1 - Math.exp(-deltaSeconds * 5.5);
      this.velocity.y += (targetRiseSpeed - this.velocity.y) * liftSmoothing;
      this.velocity.y = Math.max(this.velocity.y, -210);
    }
    this.velocity.y = Math.min(this.velocity.y, windLiftActive ? 300 : 780);
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;

    if (this.position.y + this.height >= groundY) {
      this.position.y = groundY - this.height;
      this.velocity.y = 0;
      this.grounded = true;
    }

    this.position.x = Math.max(0, this.position.x);
  }

  resolveObstacleCollision(obstacleBounds: Bounds): void {
    const bounds = this.getBounds();
    const previousBounds = this.getPreviousBounds();
    const previousBottom = previousBounds.y + previousBounds.height;
    const previousTop = previousBounds.y;
    const obstacleBottom = obstacleBounds.y + obstacleBounds.height;
    const skin = 1.5;

    if (previousBottom <= obstacleBounds.y + skin && this.velocity.y >= 0) {
      this.position.y = obstacleBounds.y - (bounds.y - this.position.y) - bounds.height - skin;
      this.velocity.y = 0;
      this.grounded = true;
      return;
    }

    if (previousTop >= obstacleBottom - skin && this.velocity.y < 0) {
      this.position.y = obstacleBottom - (bounds.y - this.position.y) + skin;
      this.velocity.y = Math.max(this.velocity.y, 70);
      return;
    }

    if (previousBounds.x + previousBounds.width <= obstacleBounds.x + skin) {
      this.pushLeftOfObstacle(bounds, obstacleBounds, skin);
      return;
    }

    if (previousBounds.x >= obstacleBounds.x + obstacleBounds.width - skin) {
      this.pushRightOfObstacle(bounds, obstacleBounds, skin);
      return;
    }

    this.resolveEmbeddedObstacle(bounds, obstacleBounds, skin);
  }

  private resolveEmbeddedObstacle(bounds: Bounds, obstacleBounds: Bounds, skin: number): void {
    const overlapLeft = bounds.x + bounds.width - obstacleBounds.x;
    const overlapRight = obstacleBounds.x + obstacleBounds.width - bounds.x;
    const overlapTop = bounds.y + bounds.height - obstacleBounds.y;
    const overlapBottom = obstacleBounds.y + obstacleBounds.height - bounds.y;

    const smallestOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (smallestOverlap === overlapTop && this.velocity.y >= 0) {
      this.position.y = obstacleBounds.y - (bounds.y - this.position.y) - bounds.height - skin;
      this.velocity.y = 0;
      this.grounded = true;
      return;
    }

    if (smallestOverlap === overlapBottom && this.velocity.y <= 0) {
      this.position.y = obstacleBounds.y + obstacleBounds.height - (bounds.y - this.position.y) + skin;
      this.velocity.y = Math.max(this.velocity.y, 70);
      return;
    }

    const playerCenterX = bounds.x + bounds.width * 0.5;
    const obstacleCenterX = obstacleBounds.x + obstacleBounds.width * 0.5;
    if (playerCenterX < obstacleCenterX) {
      this.pushLeftOfObstacle(bounds, obstacleBounds, skin);
    } else {
      this.pushRightOfObstacle(bounds, obstacleBounds, skin);
    }
  }

  private pushLeftOfObstacle(bounds: Bounds, obstacleBounds: Bounds, skin: number): void {
    this.position.x = obstacleBounds.x - (bounds.x - this.position.x) - bounds.width - skin;
    this.velocity.x = Math.min(this.velocity.x, -90);
    this.velocity.x *= 0.35;
    this.stunTimer = 0.08;
  }

  private pushRightOfObstacle(bounds: Bounds, obstacleBounds: Bounds, skin: number): void {
    this.position.x = obstacleBounds.x + obstacleBounds.width - (bounds.x - this.position.x) + skin;
    this.velocity.x = Math.max(this.velocity.x, 90);
    this.velocity.x *= 0.35;
    this.stunTimer = 0.08;
  }

  getBounds(): Bounds {
    return {
      x: this.position.x + 6,
      y: this.position.y + 4,
      width: this.width - 12,
      height: this.height - 4,
    };
  }

  getPreviousBounds(): Bounds {
    return {
      x: this.previousPosition.x + 6,
      y: this.previousPosition.y + 4,
      width: this.width - 12,
      height: this.height - 4,
    };
  }
}
