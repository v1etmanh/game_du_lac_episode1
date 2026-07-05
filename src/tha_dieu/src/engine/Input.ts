export class Input {
  private readonly pressed = new Set<string>();
  private readonly pressedThisFrame = new Set<string>();
  private mouseJumpDown = false;
  private mouseShortenDown = false;

  constructor(private readonly mouseTarget: HTMLElement | null = null) {}

  private readonly onMouseDown = (event: MouseEvent) => {
    // Chuột trái = nhảy, chuột phải = thu dây diều ngắn lại (giữ để tích lực).
    if (event.button === 0) {
      event.preventDefault();
      this.mouseJumpDown = true;
    } else if (event.button === 2) {
      event.preventDefault();
      this.mouseShortenDown = true;
    }
  };

  private readonly onMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      this.mouseJumpDown = false;
    } else if (event.button === 2) {
      this.mouseShortenDown = false;
    }
  };

  private readonly onMouseMove = (event: MouseEvent) => {
    if ((event.buttons & 2) !== 0) {
      event.preventDefault();
      this.mouseShortenDown = true;
    } else if (this.mouseShortenDown) {
      this.mouseShortenDown = false;
    }
  };

  private readonly onGlobalMouseDown = (event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault();
      this.mouseShortenDown = true;
    }
  };

  private readonly onMouseLeaveOrBlur = () => {
    this.mouseJumpDown = false;
    this.mouseShortenDown = false;
    this.pressed.clear();
    this.pressedThisFrame.clear();
  };

  private readonly onContextMenu = (event: Event) => {
    // Chặn menu chuột phải để dùng chuột phải làm thao tác thu dây diều trong game.
    event.preventDefault();
  };

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

    const target = this.mouseTarget ?? window;
    target.addEventListener("mousedown", this.onMouseDown as EventListener);
    target.addEventListener("contextmenu", this.onContextMenu);
    // Bắt mouseup/mouseleave trên window để không bị "kẹt" trạng thái nhấn
    // nếu người chơi thả chuột ngoài canvas.
    window.addEventListener("mousemove", this.onMouseMove as EventListener);
    window.addEventListener("mousedown", this.onGlobalMouseDown as EventListener);
    window.addEventListener("mouseup", this.onMouseUp as EventListener);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("blur", this.onMouseLeaveOrBlur);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);

    const target = this.mouseTarget ?? window;
    target.removeEventListener("mousedown", this.onMouseDown as EventListener);
    target.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("mousemove", this.onMouseMove as EventListener);
    window.removeEventListener("mousedown", this.onGlobalMouseDown as EventListener);
    window.removeEventListener("mouseup", this.onMouseUp as EventListener);
    window.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("blur", this.onMouseLeaveOrBlur);
  }

  isLeftPressed(): boolean {
    return this.pressed.has("KeyA") || this.pressed.has("ArrowLeft");
  }

  isRightPressed(): boolean {
    return this.pressed.has("KeyD") || this.pressed.has("ArrowRight");
  }

  isJumpPressed(): boolean {
    return this.pressed.has("Space") || this.mouseJumpDown;
  }

  isShortenPressed(): boolean {
    return this.pressed.has("KeyQ") || this.mouseShortenDown;
  }

  isReleasePressed(): boolean {
    return this.pressed.has("KeyS");
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
      "KeyS",
      "KeyR",
      "Escape",
    ].includes(code);
  }
}
