/* ========================================
   RechenStar Web — Sounds (Web Audio API)
   Prozedural generierte Töne wie in der iOS-App
   ======================================== */

const Sounds = {
  _ctx: null,

  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  _playTone(freq, duration, type = 'sine', volume = 0.3) {
    try {
      const ctx = this._getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.008);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio nicht verfügbar — kein Problem
    }
  },

  correct() {
    this._playTone(880, 0.15);
  },

  incorrect() {
    this._playTone(280, 0.25);
  },

  tap() {
    this._playTone(600, 0.05, 'sine', 0.1);
  },

  sessionComplete() {
    const ctx = this._getContext();
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.2, 'sine', 0.25), i * 120);
    });
  },

  levelUp() {
    const notes = [659, 831, 988, 1319]; // E5, G#5, B5, E6
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.25, 'sine', 0.25), i * 140);
    });
  },
};
