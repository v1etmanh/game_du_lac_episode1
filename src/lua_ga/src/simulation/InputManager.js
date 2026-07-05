export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.dropPressed = false;
    this.pausePressed = false;
    this.toggleCoopPressed = false;
    this.clapPressed = false;
    this.dashPressed = false;
    this.dashReleased = false;
    this.mouse = {
      x: 150,
      y: 320,
      inside: false
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerdown", this.handlePointerMove);
    this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
  }

  detach() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerdown", this.handlePointerMove);
    this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
    }

    if (key === "z" && !this.keys.has(key)) {
      this.dropPressed = true;
    }

    if (key === "p" && !this.keys.has(key)) {
      this.pausePressed = true;
    }

    if (key === "f" && !this.keys.has(key)) {
      this.toggleCoopPressed = true;
    }

    if (key === "c" && !this.keys.has(key)) {
      this.clapPressed = true;
    }

    if (key === "x" && !this.keys.has(key)) {
      this.dashPressed = true;
    }

    this.keys.add(key);
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "x" && this.keys.has(key)) {
      this.dashReleased = true;
    }
    this.keys.delete(key);
  }

  handlePointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / Math.max(1, rect.width);
    const scaleY = this.canvas.height / Math.max(1, rect.height);
    this.mouse.x = (event.clientX - rect.left) * scaleX;
    this.mouse.y = (event.clientY - rect.top) * scaleY;
    this.mouse.inside = true;
  }

  handlePointerLeave() {
    this.mouse.inside = false;
  }

  isDown(...keys) {
    return keys.some((key) => this.keys.has(key));
  }

  consumeDropPressed() {
    const wasPressed = this.dropPressed;
    this.dropPressed = false;
    return wasPressed;
  }

  consumePausePressed() {
    const wasPressed = this.pausePressed;
    this.pausePressed = false;
    return wasPressed;
  }

  consumeToggleCoopPressed() {
    const wasPressed = this.toggleCoopPressed;
    this.toggleCoopPressed = false;
    return wasPressed;
  }

  consumeClapPressed() {
    const wasPressed = this.clapPressed;
    this.clapPressed = false;
    return wasPressed;
  }

  consumeDashPressed() {
    const wasPressed = this.dashPressed;
    this.dashPressed = false;
    return wasPressed;
  }

  consumeDashReleased() {
    const wasReleased = this.dashReleased;
    this.dashReleased = false;
    return wasReleased;
  }

  isDashHeld() {
    return this.keys.has("x");
  }

  getMousePosition() {
    return this.mouse;
  }
}
