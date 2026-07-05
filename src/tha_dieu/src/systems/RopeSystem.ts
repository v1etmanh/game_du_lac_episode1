import { Input } from "../engine/Input";
import { Kite } from "../entities/Kite";
import { Player } from "../entities/Player";
import { Rope } from "../physics/Rope";

export class RopeSystem {
  private isShorteningNow = false;

  constructor(private readonly rope: Rope) {}

  updateLength(input: Input, deltaSeconds: number, viewportHeight: number): void {
    const shortenSpeed = 140;
    const releaseSpeed = 190;
    const isReleasingNow = input.isReleasePressed();
    this.isShorteningNow = input.isShortenPressed() && !isReleasingNow;
    const previousLength = this.rope.length;

    // Co giãn giới hạn tối đa theo chiều cao màn hình thật mỗi khung hình, để khi người
    // chơi giữ phím S thả dây dài ra, dây không bao giờ kéo diều vượt quá mép trên màn hình.
    this.rope.updateMaxLengthForViewport(viewportHeight);

    if (this.isShorteningNow) {
      this.rope.length -= shortenSpeed * deltaSeconds;
    }
    if (isReleasingNow) {
      this.rope.length += releaseSpeed * deltaSeconds;
    }
    this.rope.length = Math.max(this.rope.minLength, Math.min(this.rope.maxLength, this.rope.length));

    const lengthDelta = this.rope.length - previousLength;
    if (Math.abs(lengthDelta) > 0.01) {
      this.rope.reelDirection = Math.sign(lengthDelta);
      this.rope.reelEffect = Math.min(1, this.rope.reelEffect + deltaSeconds * 10);
    } else {
      this.rope.reelEffect = Math.max(0, this.rope.reelEffect - deltaSeconds * 5);
      if (this.rope.reelEffect <= 0) {
        this.rope.reelDirection = 0;
      }
    }
    this.rope.reelPhase = (this.rope.reelPhase + deltaSeconds * 2.6 * (this.rope.reelDirection || 1)) % 1;
  }

  apply(player: Player, kite: Kite): void {
    this.rope.applyTension(player, kite, this.isShorteningNow);
  }
}
