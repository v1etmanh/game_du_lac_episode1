import { Input } from "../engine/Input";
import { Kite } from "../entities/Kite";
import { Player } from "../entities/Player";
import { Rope } from "../physics/Rope";

export class RopeSystem {
  constructor(private readonly rope: Rope) {}

  updateLength(input: Input, deltaSeconds: number): void {
    const changeSpeed = 128;
    if (input.isShortenPressed()) {
      this.rope.length -= changeSpeed * deltaSeconds;
    }
    if (input.isReleasePressed()) {
      this.rope.length += changeSpeed * deltaSeconds;
    }
    this.rope.length = Math.max(this.rope.minLength, Math.min(this.rope.maxLength, this.rope.length));
  }

  apply(player: Player, kite: Kite): void {
    this.rope.applyTension(player, kite);
  }
}
