export const DAN_BAU_SAMPLE_MAP = {
  A3: "/notnhac/DanBau_A3.mp3",
  B3: "/notnhac/DanBau_B3.mp3",
  C3: "/notnhac/DanBau_C3.mp3",
  D3: "/notnhac/DanBau_D3.mp3",
  E3: "/notnhac/DanBau_E3.mp3",
  F3: "/notnhac/DanBau_F3.mp3",
  G3: "/notnhac/DanBau_G3.mp3",

  A4: "/notnhac/DanBau_A4.mp3",
  B4: "/notnhac/DanBau_B4.mp3",
  C4: "/notnhac/DanBau_C4.mp3",
  D4: "/notnhac/DanBau_D4.mp3",
  E4: "/notnhac/DanBau_E4.mp3",
  F4: "/notnhac/DanBau_F4.mp3",
  G4: "/notnhac/DanBau_G4.mp3",

  A5: "/notnhac/DanBau_A5.mp3",
  B5: "/notnhac/DanBau_B5.mp3",
  C5: "/notnhac/DanBau_C5.mp3",
  D5: "/notnhac/DanBau_D5.mp3",
  E5: "/notnhac/DanBau_E5.mp3",
  F5: "/notnhac/DanBau_F5.mp3",
  G5: "/notnhac/DanBau_G5.mp3"
};


export class SampleDanBau {
  constructor(audioCtx, sampleMap = DAN_BAU_SAMPLE_MAP) {
    this.audioCtx = audioCtx;
    this.sampleMap = sampleMap;
    this.buffers = {};

    this.masterGain = audioCtx.createGain();
    this.masterGain.gain.value = 0.85;

    this.reverb = this.createSimpleReverb();

    this.masterGain.connect(this.reverb.input);
    this.reverb.output.connect(audioCtx.destination);
  }

  async loadAll() {
    const entries = Object.entries(this.sampleMap);

    await Promise.all(
      entries.map(async ([noteName, url]) => {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        const buffer = await this.audioCtx.decodeAudioData(arr);
        this.buffers[noteName] = buffer;
      })
    );
  }

  createSimpleReverb() {
    const input = this.audioCtx.createGain();
    const output = this.audioCtx.createGain();

    const dry = this.audioCtx.createGain();
    const wet = this.audioCtx.createGain();

    const delay1 = this.audioCtx.createDelay();
    const delay2 = this.audioCtx.createDelay();
    const feedback1 = this.audioCtx.createGain();
    const feedback2 = this.audioCtx.createGain();

    dry.gain.value = 0.85;
    wet.gain.value = 0.22;

    delay1.delayTime.value = 0.09;
    delay2.delayTime.value = 0.16;

    feedback1.gain.value = 0.25;
    feedback2.gain.value = 0.18;

    input.connect(dry);
    dry.connect(output);

    input.connect(delay1);
    delay1.connect(feedback1);
    feedback1.connect(delay1);
    delay1.connect(wet);

    input.connect(delay2);
    delay2.connect(feedback2);
    feedback2.connect(delay2);
    delay2.connect(wet);

    wet.connect(output);

    return { input, output };
  }

  bendRatio(semitones) {
    return Math.pow(2, semitones / 12);
  }

  setVolume(value) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  play(noteName, options = {}) {
    const buffer = this.buffers[noteName];

    if (!buffer) {
      console.warn("Missing dan bau sample:", noteName);
      return null;
    }

    const now = this.audioCtx.currentTime;

    const source = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    source.buffer = buffer;

    const volume = options.volume ?? 0.9;
    const duration = options.duration ?? Math.min(buffer.duration, 2.5);
    const bendSemitones = options.bendSemitones ?? 0;

    if (options.bend) {
      source.playbackRate.setValueAtTime(this.bendRatio(bendSemitones - 0.22), now);
      source.playbackRate.linearRampToValueAtTime(
        this.bendRatio(bendSemitones),
        now + Math.min(duration * 0.35, 0.16)
      );
    } else {
      source.playbackRate.setValueAtTime(this.bendRatio(bendSemitones), now);
    }

    if (options.vibrato) {
      const vibratoOscillator = this.audioCtx.createOscillator();
      const vibratoDepth = this.audioCtx.createGain();
      vibratoOscillator.frequency.value = 5.5;
      vibratoDepth.gain.value = 0.015;
      vibratoOscillator.connect(vibratoDepth);
      vibratoDepth.connect(source.playbackRate);
      vibratoOscillator.start(now + 0.04);
      vibratoOscillator.stop(now + duration);
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);

    let stopped = false;

    const setBend = (semitones) => {
      if (stopped) return;
      source.playbackRate.setTargetAtTime(
        this.bendRatio(semitones),
        this.audioCtx.currentTime,
        0.04
      );
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      const time = this.audioCtx.currentTime;

      gain.gain.cancelScheduledValues(time);
      gain.gain.setTargetAtTime(0.0001, time, 0.06);

      try {
        source.stop(time + 0.35);
      } catch {
        // The sample may already have reached its scheduled stop time.
      }
    };

    return { setBend, stop };
  }
}
