import { systemState } from './systemState.js';

class AudioService {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.1) {
    if (systemState.soundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  playClick() {
    this.playTone(800, 'sine', 0.05, 0.08);
  }

  playPlugIn() {
    if (systemState.soundMuted) return;
    this.playTone(520, 'triangle', 0.1, 0.15);
    setTimeout(() => this.playTone(780, 'sine', 0.15, 0.15), 80);
  }

  playRetract() {
    if (systemState.soundMuted) return;
    this.playTone(400, 'sawtooth', 0.25, 0.08);
    setTimeout(() => this.playTone(320, 'sine', 0.2, 0.08), 120);
  }

  playChargingStart() {
    if (systemState.soundMuted) return;
    this.playTone(440, 'sine', 0.12, 0.12);
    setTimeout(() => this.playTone(554.37, 'sine', 0.12, 0.12), 100);
    setTimeout(() => this.playTone(659.25, 'sine', 0.25, 0.15), 200);
  }

  playAlarm() {
    if (systemState.soundMuted) return;
    this.playTone(920, 'sawtooth', 0.2, 0.25);
    setTimeout(() => this.playTone(650, 'sawtooth', 0.2, 0.25), 180);
  }

  playWarning() {
    if (systemState.soundMuted) return;
    this.playTone(600, 'square', 0.15, 0.15);
    setTimeout(() => this.playTone(600, 'square', 0.15, 0.15), 180);
  }

  playSuccess() {
    if (systemState.soundMuted) return;
    this.playTone(523.25, 'sine', 0.12, 0.12);
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.12), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.15), 200);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.35, 0.18), 300);
  }
}

export const audioService = new AudioService();
