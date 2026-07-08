export class Input {
  private readonly pressed = new Set<string>();
  private readonly pressedThisFrame = new Set<string>();
  private mouseJumpDown = false;
  private mouseShortenDown = false;
  private lastRopeCommand: "shorten" | "release" | null = null;

  constructor(private readonly mouseTarget: HTMLElement | null = null) {}

  private clearControls(): void {
    this.mouseJumpDown = false;
    this.mouseShortenDown = false;
    this.lastRopeCommand = null;
    this.pressed.clear();
    this.pressedThisFrame.clear();
  }

  private readonly onMouseDown = (event: MouseEvent) => {
    // Chuột trái = nhảy, chuột phải = thu dây diều ngắn lại (giữ để tích lực).
    if (event.button === 0) {
      event.preventDefault();
      this.mouseJumpDown = true;
    } else if (event.button === 2) {
      event.preventDefault();
      this.mouseShortenDown = true;
      this.lastRopeCommand = "shorten";
    }
  };

  private readonly onMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      event.preventDefault();
      this.mouseJumpDown = false;
    } else if (event.button === 2) {
      event.preventDefault();
      this.mouseShortenDown = false;
      this.reconcileRopeCommand();
    }
  };

  private readonly onMouseMove = (event: MouseEvent) => {
    if ((event.buttons & 2) !== 0) {
      event.preventDefault();
      this.mouseShortenDown = true;
      this.lastRopeCommand = "shorten";
    } else if (this.mouseShortenDown) {
      this.mouseShortenDown = false;
      this.reconcileRopeCommand();
    }
  };

  private readonly onGlobalMouseDown = (event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault();
      this.mouseShortenDown = true;
      this.lastRopeCommand = "shorten";
    }
  };

  private readonly onMouseLeaveOrBlur = () => {
    this.clearControls();
  };

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.clearControls();
    }
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
    this.updateRopeCommandFromKey(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (this.isGameplayKey(event.code)) {
      event.preventDefault();
    }
    this.pressed.delete(event.code);
    this.reconcileRopeCommand();
  };

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("keyup", this.onKeyUp, true);

    const target = this.mouseTarget ?? window;
    target.addEventListener("mousedown", this.onMouseDown as EventListener, true);
    target.addEventListener("contextmenu", this.onContextMenu, true);
    // Bắt mouseup/mouseleave trên window để không bị "kẹt" trạng thái nhấn
    // nếu người chơi thả chuột ngoài canvas.
    window.addEventListener("mousemove", this.onMouseMove as EventListener, true);
    window.addEventListener("mousedown", this.onGlobalMouseDown as EventListener, true);
    window.addEventListener("mouseup", this.onMouseUp as EventListener, true);
    window.addEventListener("contextmenu", this.onContextMenu, true);
    window.addEventListener("blur", this.onMouseLeaveOrBlur);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("keyup", this.onKeyUp, true);

    const target = this.mouseTarget ?? window;
    target.removeEventListener("mousedown", this.onMouseDown as EventListener, true);
    target.removeEventListener("contextmenu", this.onContextMenu, true);
    window.removeEventListener("mousemove", this.onMouseMove as EventListener, true);
    window.removeEventListener("mousedown", this.onGlobalMouseDown as EventListener, true);
    window.removeEventListener("mouseup", this.onMouseUp as EventListener, true);
    window.removeEventListener("contextmenu", this.onContextMenu, true);
    window.removeEventListener("blur", this.onMouseLeaveOrBlur);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.clearControls();
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
    return this.pressed.has("KeyW") || this.pressed.has("KeyQ") || this.mouseShortenDown;
  }

  isReleasePressed(): boolean {
    return this.pressed.has("KeyS");
  }

  getRopeCommand(): "shorten" | "release" | null {
    const wantsShorten = this.isShortenPressed();
    const wantsRelease = this.isReleasePressed();

    if (wantsShorten && wantsRelease) {
      return this.lastRopeCommand;
    }
    if (wantsShorten) {
      return "shorten";
    }
    if (wantsRelease) {
      return "release";
    }
    return null;
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
      "KeyW",
      "KeyQ",
      "KeyS",
      "KeyR",
      "Escape",
    ].includes(code);
  }

  private updateRopeCommandFromKey(code: string): void {
    if (code === "KeyW" || code === "KeyQ") {
      this.lastRopeCommand = "shorten";
    } else if (code === "KeyS") {
      this.lastRopeCommand = "release";
    }
  }

  private reconcileRopeCommand(): void {
    const wantsShorten = this.isShortenPressed();
    const wantsRelease = this.isReleasePressed();

    if (wantsShorten && wantsRelease) {
      return;
    }
    if (wantsShorten) {
      this.lastRopeCommand = "shorten";
      return;
    }
    if (wantsRelease) {
      this.lastRopeCommand = "release";
      return;
    }
    this.lastRopeCommand = null;
  }
}
