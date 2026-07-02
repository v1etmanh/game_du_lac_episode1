export class BackingTrackPlayer {
  constructor(src) {
    this.audio = new Audio(src);
    this.audio.preload = 'auto';
    this.audio.volume = 0.42;
  }

  async play() {
    this.audio.currentTime = 0;
    await this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  resume() {
    this.audio.play().catch(() => {});
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  getCurrentTimeMs() {
    return this.audio.currentTime * 1000;
  }

  getDurationMs() {
    return Number.isFinite(this.audio.duration)
      ? this.audio.duration * 1000
      : 0;
  }

  setVolume(value) {
    this.audio.volume = Math.max(0, Math.min(1, value));
  }
}
