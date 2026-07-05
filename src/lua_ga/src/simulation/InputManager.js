export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.dropPressed = false;
    this.pausePressed = false;
    this.toggleCoopPressed = false;
    this.clapPressed = false;
    this.dashPressed = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  detach() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
    }

    if (key === " " && !this.keys.has(key)) {
      this.dropPressed = true;
    }

    if (key === "p" && !this.keys.has(key)) {
      this.pausePressed = true;
    }

    if (key === "l" && !this.keys.has(key)) {
      this.toggleCoopPressed = true;
    }

    if (key === "k" && !this.keys.has(key)) {
      this.clapPressed = true;
    }

    if (key === "b" && !this.keys.has(key)) {
      this.dashPressed = true;
    }

    this.keys.add(key);
  }

  handleKeyUp(event) {
    this.keys.delete(event.key.toLowerCase());
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
}
