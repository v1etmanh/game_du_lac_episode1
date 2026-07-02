export class Input {
  private readonly pressed = new Set<string>();
  private readonly pressedThisFrame = new Set<string>();
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isGameplayKey(event.code)) {
      event.preventDefault();
    }

    if (!this.pressed.has(event.code)) {
      this.pressedThisFrame.add(event.code);
    }

    this.pressed.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (this.isGameplayKey(event.code)) {
      event.preventDefault();
    }
    this.pressed.delete(event.code);
  };

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  isLeftPressed(): boolean {
    return this.pressed.has("KeyA") || this.pressed.has("ArrowLeft");
  }

  isRightPressed(): boolean {
    return this.pressed.has("KeyD") || this.pressed.has("ArrowRight");
  }

  isJumpPressed(): boolean {
    return this.pressed.has("Space");
  }

  isShortenPressed(): boolean {
    return this.pressed.has("KeyQ");
  }

  isReleasePressed(): boolean {
    return this.pressed.has("KeyE");
  }

  wasRestartPressed(): boolean {
    return this.pressedThisFrame.has("KeyR");
  }

  wasPausePressed(): boolean {
    return this.pressedThisFrame.has("Escape");
  }

  endFrame(): void {
    this.pressedThisFrame.clear();
  }

  private isGameplayKey(code: string): boolean {
    return [
      "KeyA",
      "KeyD",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyQ",
      "KeyE",
      "KeyR",
      "Escape",
    ].includes(code);
  }
}
