import { Kite } from "../entities/Kite";
import { Player } from "../entities/Player";
import { Vector2 } from "../engine/math/Vector2";
import type { KiteAssist } from "../engine/types";

const noAssist: KiteAssist = {
  horizontalAcceleration: 0,
  speedLimitBonus: 0,
  runSpeedMultiplier: 1,
  speedLimitBase: 520,
  jumpBoost: 0,
  gravityRelief: 0,
  drag: 0,
};

export class Rope {
  length = 220;
  readonly minLength = 90;
  readonly absoluteMaxLength = 390;
  maxLength = 390;
  tension = 0;
  reelDirection = 0;
  reelEffect = 0;
  reelPhase = 0;

  updateMaxLengthForViewport(viewportHeight: number): void {
    const playableRange = viewportHeight * 0.74 + 44;
    this.maxLength = clamp(playableRange, 350, this.absoluteMaxLength);
  }

  getAnchor(player: Player): Vector2 {
    return new Vector2(player.position.x + player.width * 0.48, player.position.y + player.height * 0.2);
  }

  getPlayerAssist(player: Player, kite: Kite): KiteAssist {
    const anchor = this.getAnchor(player);
    const offset = Vector2.subtract(kite.position, anchor);
    const distance = offset.length();
    const engagement = clamp(distance / (this.length * 0.8), 0, 1);

    if (engagement <= 0) {
      return noAssist;
    }

    const heightAbovePlayer = anchor.y - kite.position.y;
    const highKite = clamp((heightAbovePlayer - 65) / 240, 0, 1);
    const lowKite = clamp((105 - heightAbovePlayer) / 190, 0, 1);
    const horizontalPosition = clamp(offset.x / 300, -1, 1);
    const kiteAhead = Math.max(0, horizontalPosition) * engagement;
    const kiteBehind = Math.max(0, -horizontalPosition) * engagement;
    const lengthRatio = this.getLengthRatio();
    const shortRopeDrag = Math.pow(1 - lengthRatio, 2) * 0.12;

    return {
      horizontalAcceleration: kiteAhead * 1180 - kiteBehind * 760,
      speedLimitBonus: kiteAhead * 190,
      runSpeedMultiplier: 0.2 + Math.pow(lengthRatio, 1.35) * 1.12,
      speedLimitBase: 135 + Math.pow(lengthRatio, 1.22) * 485,
      jumpBoost: -lowKite * engagement * 90,
      gravityRelief: highKite * engagement * 90,
      drag: kiteBehind * 0.07 + lowKite * engagement * 0.035 + shortRopeDrag,
    };
  }

  getLengthRatio(): number {
    return clamp((this.length - this.minLength) / Math.max(1, this.maxLength - this.minLength), 0, 1);
  }

  applyTension(player: Player, kite: Kite, isShortening = false): void {
    const anchor = this.getAnchor(player);
    const offset = Vector2.subtract(kite.position, anchor);
    const distance = offset.length();

    if (distance <= this.length) {
      this.tension = isShortening ? Math.min(1, this.tension + 0.22) : Math.max(0, this.tension - 0.05);
      return;
    }

    const stretch = distance - this.length;
    const direction = offset.normalize();
    const spring = Math.min(stretch * 13.5, 2450);
    const damping = (kite.velocity.x * direction.x + kite.velocity.y * direction.y) * 1.8;
    const force = Math.max(0, spring + damping);
    const computedTension = Math.min(1, stretch / 130);
    const nextTension = isShortening ? Math.max(computedTension, 0.92) : computedTension;

    kite.acceleration.x -= direction.x * force;
    kite.acceleration.y -= direction.y * force;
    kite.acceleration.x += player.velocity.x * nextTension * 0.75;
    kite.acceleration.y -= Math.abs(player.velocity.x) * nextTension * 0.36;

    player.velocity.x += direction.x * Math.min(stretch * 0.0072, 3.2);
    this.tension = nextTension;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
