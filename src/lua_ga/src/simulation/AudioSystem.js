const SOUND_ASSETS = {
  music: "/sound/lua_ga/lua_ga_music.mp3",
  collision: "/sound/lua_ga/chicken_collision.wav",
  attack: "/sound/lua_ga/chicken_attack.wav",
  success: "/sound/lua_ga/success.wav"
};

const EFFECT_SETTINGS = {
  collision: { volume: 0.62, minIntervalMs: 90 },
  attack: { volume: 0.78, minIntervalMs: 650 },
  success: { volume: 0.76, minIntervalMs: 160 }
};

export class AudioSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ready = false;
    this.music = null;
    this.effects = {};
    this.lastPlayedAt = {};
    this.disposed = false;
    this.handleFirstGesture = this.handleFirstGesture.bind(this);
  }

  attach() {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("pointerdown", this.handleFirstGesture, { once: true });
    window.addEventListener("keydown", this.handleFirstGesture, { once: true });
    this.startMusic();
  }

  detach() {
    if (typeof window === "undefined") {
      return;
    }

    window.removeEventListener("pointerdown", this.handleFirstGesture);
    window.removeEventListener("keydown", this.handleFirstGesture);
  }

  handleFirstGesture() {
    this.startMusic();
  }

  ensureReady() {
    if (this.ready || typeof Audio === "undefined") {
      return this.ready;
    }

    this.music = new Audio(SOUND_ASSETS.music);
    this.music.loop = true;
    this.music.volume = 0.24;
    this.music.preload = "auto";

    this.effects = Object.fromEntries(
      Object.entries(EFFECT_SETTINGS).map(([name, settings]) => {
        const audio = new Audio(SOUND_ASSETS[name]);
        audio.volume = settings.volume;
        audio.preload = "auto";
        return [name, audio];
      })
    );

    this.ready = true;
    return true;
  }

  startMusic() {
    if (this.disposed || !this.ensureReady() || !this.music || !this.music.paused) {
      return;
    }

    this.music.play().catch(() => {});
  }

  playEffect(name) {
    if (this.disposed || !this.ensureReady()) {
      return;
    }

    this.startMusic();

    const source = this.effects[name];
    const settings = EFFECT_SETTINGS[name];
    if (!source || !settings) {
      return;
    }

    const now = performance.now();
    if (now - (this.lastPlayedAt[name] ?? 0) < settings.minIntervalMs) {
      return;
    }

    this.lastPlayedAt[name] = now;
    const instance = source.cloneNode();
    instance.volume = settings.volume;
    instance.currentTime = 0;
    instance.play().catch(() => {});
    instance.addEventListener("ended", () => {
      instance.src = "";
    });
  }

  dispose() {
    this.disposed = true;
    this.detach();

    if (this.music) {
      this.music.pause();
      this.music.src = "";
    }

    Object.values(this.effects).forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
  }
}
