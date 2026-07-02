import { Wind } from "../physics/Wind";
import { Rope } from "../physics/Rope";

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private windOscillator: OscillatorNode | null = null;
  private flutterOscillator: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  private flutterGain: GainNode | null = null;

  private windSample: HTMLAudioElement | null = null;
  private stoneSample: HTMLAudioElement | null = null;
  private jumpSample: HTMLAudioElement | null = null;
  private musicSample: HTMLAudioElement | null = null;

  private readonly windSampleMaxVolume = 0.16;
  private readonly stoneSampleMaxVolume = 0.18;
  private readonly musicVolume = 0.1;

  start(): void {
    if (this.audioContext) {
      return;
    }

    const context = new AudioContext();
    const windGain = context.createGain();
    const flutterGain = context.createGain();
    const windOscillator = context.createOscillator();
    const flutterOscillator = context.createOscillator();

    windOscillator.type = "sine";
    windOscillator.frequency.value = 90;
    windGain.gain.value = 0.0001;
    windOscillator.connect(windGain).connect(context.destination);
    windOscillator.start();

    flutterOscillator.type = "triangle";
    flutterOscillator.frequency.value = 260;
    flutterGain.gain.value = 0.0001;
    flutterOscillator.connect(flutterGain).connect(context.destination);
    flutterOscillator.start();

    this.audioContext = context;
    this.windOscillator = windOscillator;
    this.flutterOscillator = flutterOscillator;
    this.windGain = windGain;
    this.flutterGain = flutterGain;

    this.windSample = this.createLoopingSample("/tha_dieu/wind_sound.mp3", 0);
    this.stoneSample = this.createLoopingSample("/tha_dieu/stone_rolling_sound.ogg", 0);
    this.musicSample = this.createLoopingSample("/tha_dieu/nhac_nen.MP3", this.musicVolume);
    this.jumpSample = new Audio("/tha_dieu/jump_sound.ogg");
    this.jumpSample.preload = "auto";
  }

  private createLoopingSample(src: string, volume: number): HTMLAudioElement {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {
      // Autoplay may be blocked until a user gesture; start() is already
      // called from a gesture handler, so this is only a safety net.
    });
    return audio;
  }

  playJump(): void {
    if (!this.jumpSample) {
      return;
    }

    const clip = this.jumpSample.cloneNode(true) as HTMLAudioElement;
    clip.volume = 0.5;
    clip.play().catch(() => {});
  }

  update(wind: Wind, rope: Rope, rollingRockProximity = 0): void {
    if (this.windSample) {
      this.windSample.volume = 0.03 + wind.strength * this.windSampleMaxVolume;
    }

    if (this.stoneSample) {
      this.stoneSample.volume = Math.min(1, rollingRockProximity) * this.stoneSampleMaxVolume;
    }

    if (!this.audioContext || !this.windGain || !this.flutterGain || !this.windOscillator || !this.flutterOscillator) {
      return;
    }

    const now = this.audioContext.currentTime;
    this.windOscillator.frequency.setTargetAtTime(70 + wind.strength * 95, now, 0.2);
    this.windGain.gain.setTargetAtTime(0.015 + wind.strength * 0.035, now, 0.25);
    this.flutterOscillator.frequency.setTargetAtTime(190 + rope.tension * 160 + wind.strength * 90, now, 0.09);
    this.flutterGain.gain.setTargetAtTime(rope.tension * 0.025, now, 0.08);
  }

  stop(): void {
    this.windOscillator?.stop();
    this.flutterOscillator?.stop();
    this.audioContext?.close();
    this.audioContext = null;
    this.windOscillator = null;
    this.flutterOscillator = null;
    this.windGain = null;
    this.flutterGain = null;

    this.windSample?.pause();
    this.stoneSample?.pause();
    this.musicSample?.pause();
    this.windSample = null;
    this.stoneSample = null;
    this.jumpSample = null;
    this.musicSample = null;
  }
}
