import { Input } from "../engine/Input";
import { Kite } from "../entities/Kite";
import { Player } from "../entities/Player";
import { Rope } from "../physics/Rope";

export class RopeSystem {
  private isShorteningNow = false;

  constructor(private readonly rope: Rope) {}

  updateLength(input: Input, deltaSeconds: number, viewportHeight: number): void {
    const changeSpeed = 128;
    this.isShorteningNow = input.isShortenPressed();

    // Co giãn giới hạn tối đa theo chiều cao màn hình thật mỗi khung hình, để khi người
    // chơi giữ phím S/E thả dây dài ra, dây không bao giờ kéo diều vượt quá mép trên màn hình.
    this.rope.updateMaxLengthForViewport(viewportHeight);

    if (this.isShorteningNow) {
      this.rope.length -= changeSpeed * deltaSeconds;
    }
    if (input.isReleasePressed()) {
      this.rope.length += changeSpeed * deltaSeconds;
    }
    this.rope.length = Math.max(this.rope.minLength, Math.min(this.rope.maxLength, this.rope.length));
  }

  apply(player: Player, kite: Kite): void {
    this.rope.applyTension(player, kite, this.isShorteningNow);
  }
}
