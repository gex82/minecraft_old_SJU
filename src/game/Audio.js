import { Howler } from "howler";

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oceanGain = null;
    this.oceanSource = null;

    this.initialized = false;
    this.nextCoqui = 0;
    this.footstepAccumulator = 0;
  }

  async unlock() {
    if (this.initialized) {
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      return;
    }

    this.ctx = Howler.ctx;
    await this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.2;
    this.masterGain.connect(this.ctx.destination);

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.value = 0.012;
    this.oceanGain.connect(this.masterGain);

    this.startOceanBed();
    this.initialized = true;
    this.nextCoqui = 0.5;
  }

  update(deltaSeconds, state) {
    if (!this.initialized) {
      return;
    }

    const nightFactor = state.nightFactor ?? 0;
    const targetOcean = 0.012 + nightFactor * 0.012;
    this.oceanGain.gain.linearRampToValueAtTime(targetOcean, this.ctx.currentTime + 0.2);

    if (state.isGrounded) {
      this.footstepAccumulator += state.stepDistance ?? 0;
      const stride = state.speed > 7.2 ? 1.25 : 1.58;
      while (this.footstepAccumulator >= stride) {
        this.playFootstep(state.speed);
        this.footstepAccumulator -= stride;
      }
    } else {
      this.footstepAccumulator = 0;
    }

    this.nextCoqui -= deltaSeconds;
    if (nightFactor > 0.45 && this.nextCoqui <= 0) {
      this.playCoqui(nightFactor);
      this.nextCoqui = 1.25 + Math.random() * 2.1;
    }
  }

  startOceanBed() {
    const frameCount = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, frameCount, this.ctx.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const lowPass = this.ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 560;
    lowPass.Q.value = 0.2;

    const highPass = this.ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 70;

    source.connect(lowPass);
    lowPass.connect(highPass);
    highPass.connect(this.oceanGain);
    source.start(0);
    this.oceanSource = source;
  }

  playFootstep(speed) {
    const duration = 0.08;
    const frameCount = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, frameCount, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      const envelope = 1 - i / frameCount;
      channel[i] = (Math.random() * 2 - 1) * envelope * 0.35;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 190 + speed * 24;
    filter.Q.value = 0.7;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
    source.stop(this.ctx.currentTime + duration + 0.02);
  }

  playCoqui(nightFactor) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(1470, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1260, now + 0.16);

    const gain = this.ctx.createGain();
    const amplitude = 0.035 + nightFactor * 0.04;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(amplitude, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}
