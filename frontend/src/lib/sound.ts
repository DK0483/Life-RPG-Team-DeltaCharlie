/**
 * Web Audio API synthesized sound effects engine.
 * Generates authentic retro/fantasy RPG audio effects with automatic browser autoplay unlocking.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("life_rpg_muted");
      this.isMuted = savedMute === "true";

      // Auto-unlock AudioContext on first user interaction anywhere
      const unlockHandler = () => {
        this.unlock();
        if (this.isUnlocked) {
          window.removeEventListener("click", unlockHandler);
          window.removeEventListener("keydown", unlockHandler);
          window.removeEventListener("touchstart", unlockHandler);
          window.removeEventListener("pointerdown", unlockHandler);
        }
      };

      window.addEventListener("click", unlockHandler, { passive: true });
      window.addEventListener("keydown", unlockHandler, { passive: true });
      window.addEventListener("touchstart", unlockHandler, { passive: true });
      window.addEventListener("pointerdown", unlockHandler, { passive: true });
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === "running") {
      this.isUnlocked = true;
    }

    return this.ctx;
  }

  /**
   * Explicitly resumes the AudioContext synchronously during user gestures.
   */
  public unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.unlock();
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("life_rpg_muted", String(this.isMuted));
    }
    // If unmuted, play a quick preview chime so user knows sound works
    if (!this.isMuted) {
      setTimeout(() => this.playCoin(), 50);
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  private getDestination(): AudioNode | null {
    const ctx = this.getContext();
    if (!ctx) return null;
    return this.masterGain || ctx.destination;
  }

  /**
   * Bright, crystal chime for quest completion
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.45);
    });
  }

  /**
   * Heroic level-up fanfare
   */
  public playLevelUp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const chords = [
      { notes: [440, 554.37, 659.25], duration: 0.16, time: 0 },
      { notes: [493.88, 622.25, 739.99], duration: 0.16, time: 0.17 },
      { notes: [554.37, 698.46, 830.61], duration: 0.22, time: 0.34 },
      { notes: [659.25, 830.61, 987.77, 1318.5], duration: 0.75, time: 0.56 },
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + chord.time);

        gain.gain.setValueAtTime(0, ctx.currentTime + chord.time);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + chord.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + chord.time + chord.duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(ctx.currentTime + chord.time);
        osc.stop(ctx.currentTime + chord.time + chord.duration);
      });
    });
  }

  /**
   * High-pitched metallic coin chime
   */
  public playCoin() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.38);
  }

  /**
   * Dynamic boss impact sound
   */
  public playBossHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  }

  /**
   * Gear equip click
   */
  public playEquip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
  }

  /**
   * Potion drinking sound
   */
  public playPotion() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const freqs = [330, 440, 550, 660, 880];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.16);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
    });
  }

  /**
   * Error buzz
   */
  public playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  }
}

export const sounds = new SoundEngine();
