// Audio engine: real đàn bầu samples + live pitch bend.

import { SampleDanBau } from '../helpers/sampleDanBau.js';

const KEY_NOTE = {
  a: 'F4',
  w: 'G4',
  e: 'A4',
  d: 'C5',
  x: 'D5',
  z: 'F5',
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sampler = null;
    this.actives = new Map(); // key -> { control, cleanupTimer }
    this.initPromise = null;
    this.ready = false;
  }

  async init() {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextCtor();
      this.sampler = new SampleDanBau(this.ctx);
      await this.sampler.loadAll();
      this.sampler.setVolume(0.9);
      this.ready = true;
    })();

    return this.initPromise;
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  playNote(note, bendSemitones = 0) {
    const noteData = typeof note === 'string' ? { key: note } : note;
    const key = noteData.key;
    const duration = noteData.duration ?? 2.8;
    const sampleNote = noteData.noteName ?? KEY_NOTE[key];
    if (!this.ready || !this.sampler || !sampleNote) return;

    this.stopNote(key);

    const control = this.sampler.play(sampleNote, {
      bendSemitones,
      duration,
      bend: noteData.isBend ?? false,
      vibrato: noteData.vibrato ?? false,
      volume: 0.95,
    });
    if (!control) return;

    const cleanupTimer = window.setTimeout(() => {
      const active = this.actives.get(key);
      if (active?.control === control) this.actives.delete(key);
    }, (duration + 0.35) * 1000);

    this.actives.set(key, { control, cleanupTimer });
  }

  setBend(key, bendSemitones) {
    const active = this.actives.get(key);
    if (!active) return;
    active.control.setBend(bendSemitones);
  }

  setBendAll(bendSemitones) {
    for (const key of this.actives.keys()) this.setBend(key, bendSemitones);
  }

  stopNote(key) {
    const active = this.actives.get(key);
    if (!active) return;

    window.clearTimeout(active.cleanupTimer);
    active.control.stop();
    this.actives.delete(key);
  }

  stopAll() {
    for (const key of [...this.actives.keys()]) this.stopNote(key);
  }

  setVolume(value) {
    this.sampler?.setVolume(value);
  }
}

export const audioEngine = new AudioEngine();
