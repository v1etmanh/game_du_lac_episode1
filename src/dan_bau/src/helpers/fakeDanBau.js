export class FakeDanBau {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.masterGain = audioCtx.createGain();
    this.reverb = this.createSimpleReverb();

    this.masterGain.gain.value = 0.8;

    this.masterGain.connect(this.reverb.input);
    this.reverb.output.connect(audioCtx.destination);
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  bendRatio(semitones) {
    return Math.pow(2, semitones / 12);
  }

  setFrequencyTarget(param, value, time, constant = 0.04) {
    if (typeof param.cancelAndHoldAtTime === "function") {
      param.cancelAndHoldAtTime(time);
    } else {
      param.cancelScheduledValues(time);
      param.setValueAtTime(param.value, time);
    }
    param.setTargetAtTime(value, time, constant);
  }

  createSimpleReverb() {
    const input = this.audioCtx.createGain();
    const output = this.audioCtx.createGain();

    const delay1 = this.audioCtx.createDelay();
    const delay2 = this.audioCtx.createDelay();
    const feedback1 = this.audioCtx.createGain();
    const feedback2 = this.audioCtx.createGain();
    const wet = this.audioCtx.createGain();
    const dry = this.audioCtx.createGain();

    delay1.delayTime.value = 0.09;
    delay2.delayTime.value = 0.17;

    feedback1.gain.value = 0.28;
    feedback2.gain.value = 0.22;

    wet.gain.value = 0.25;
    dry.gain.value = 0.85;

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

  play(midi, options = {}) {
    const now = this.audioCtx.currentTime;

    const duration = options.duration ?? 2.8;
    const bendFrom = options.bendFrom ?? -35;
    const bendTo = options.bendTo ?? 0;
    const bendSemitones = options.bendSemitones ?? 0;
    const vibrato = options.vibrato ?? true;
    const volume = options.volume ?? 0.8;

    const baseFreq = this.midiToFreq(midi);

    const osc = this.audioCtx.createOscillator();
    const subOsc = this.audioCtx.createOscillator();

    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = "sine";
    subOsc.type = "triangle";

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + duration);

    const baseBendRatio = this.bendRatio(bendSemitones);
    const bendStartFreq = baseFreq * baseBendRatio * Math.pow(2, bendFrom / 1200);
    const bendEndFreq = baseFreq * baseBendRatio * Math.pow(2, bendTo / 1200);

    osc.frequency.setValueAtTime(bendStartFreq, now);
    osc.frequency.exponentialRampToValueAtTime(bendEndFreq, now + 0.12);

    subOsc.frequency.setValueAtTime(bendStartFreq * 0.5, now);
    subOsc.frequency.exponentialRampToValueAtTime(bendEndFreq * 0.5, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    let vibratoOsc = null;

    if (vibrato) {
      vibratoOsc = this.audioCtx.createOscillator();
      const vibratoGain = this.audioCtx.createGain();

      vibratoOsc.type = "sine";
      vibratoOsc.frequency.setValueAtTime(5.2, now);

      vibratoGain.gain.setValueAtTime(0, now);
      vibratoGain.gain.linearRampToValueAtTime(5, now + 0.25);
      vibratoGain.gain.linearRampToValueAtTime(9, now + duration);

      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibratoGain.connect(subOsc.frequency);

      vibratoOsc.start(now);
      vibratoOsc.stop(now + duration);
    }

    this.playPluckNoise(now, volume);

    osc.start(now);
    subOsc.start(now);

    osc.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);

    let stopped = false;

    const setBend = (semitones) => {
      if (stopped) return;
      const time = this.audioCtx.currentTime;
      const ratio = this.bendRatio(semitones);
      this.setFrequencyTarget(osc.frequency, baseFreq * ratio, time);
      this.setFrequencyTarget(subOsc.frequency, baseFreq * 0.5 * ratio, time);
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      const time = this.audioCtx.currentTime;

      gain.gain.cancelScheduledValues(time);
      gain.gain.setTargetAtTime(0.0001, time, 0.06);

      const stopAt = time + 0.35;
      try {
        osc.stop(stopAt);
        subOsc.stop(stopAt);
        if (vibratoOsc) vibratoOsc.stop(stopAt);
      } catch {
        // The note may already have reached its scheduled stop time.
      }
    };

    return { setBend, stop };
  }

  playPluckNoise(now, volume = 0.8) {
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.04);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.audioCtx.createBufferSource();
    const noiseGain = this.audioCtx.createGain();
    const noiseFilter = this.audioCtx.createBiquadFilter();

    noise.buffer = buffer;

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1800;
    noiseFilter.Q.value = 5;

    noiseGain.gain.setValueAtTime(volume * 0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.05);
  }
}
