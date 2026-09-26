// Studio HD Audio & Web Audio Procedural Fallback Engine
class SoundFX {
  private currentBgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;
  private ctx: AudioContext | null = null;
  private isMasterMuted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playAudioFile(path: string, volume: number = 0.8, fallbackFn?: () => void) {
    if (this.isMasterMuted) return;
    try {
      const audio = new Audio(path);
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('File audio play blocked or missing, using synth fallback:', path, e);
          if (fallbackFn) fallbackFn();
        });
      }
    } catch (e) {
      if (fallbackFn) fallbackFn();
    }
  }

  // Mobile Tactile Haptic Vibration Feedback Engine
  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
    try {
      switch (type) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate(22);
          break;
        case 'heavy':
          window.navigator.vibrate(40);
          break;
        case 'success':
          window.navigator.vibrate([15, 45, 20]);
          break;
        case 'warning':
          window.navigator.vibrate([25, 40, 25]);
          break;
        case 'error':
          window.navigator.vibrate([45, 30, 45, 30, 50]);
          break;
      }
    } catch (_) {}
  }

  // Play gift celebration fanfare
  playGiftFanfare() {
    this.haptic('success');
    this.playAudioFile('/assets/audio/sfx_victory.wav', 0.9, () => {
      try {
        const ctx = this.getContext();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      } catch (_) {}
    });
  }

  // Dragon Roar sound effect
  playDragonRoar() {
    this.haptic('heavy');
    this.playAudioFile('/assets/audio/sfx_dragon_roar.wav', 0.9, () => {
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch (_) {}
    });
  }

  // Supercar Engine Rev sound effect
  playCarRev() {
    this.haptic('medium');
    this.playAudioFile('/assets/audio/sfx_car_rev.wav', 0.9, () => {
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.6);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.0);
      } catch (_) {}
    });
  }

  // Castle Harp Arpeggio
  playCastleHarp() {
    this.haptic('light');
    this.playAudioFile('/assets/audio/sfx_castle_harp.wav', 0.9, () => {
      try {
        const ctx = this.getContext();
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
        });
      } catch (_) {}
    });
  }

  // Applause sound effect
  playApplause() {
    this.playAudioFile('/assets/audio/sfx_applause.wav', 0.8, () => {
      try {
        const ctx = this.getContext();
        const bufferSize = ctx.sampleRate * 0.8;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 2.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch (_) {}
    });
  }

  // Air horn
  playHorn() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  }

  // Pop / Click
  playPop() {
    this.haptic('light');
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  // Correct answer bell / victory
  playSuccess() {
    this.haptic('success');
    this.playAudioFile('/assets/audio/sfx_victory.wav', 0.85, () => {
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (_) {}
    });
  }

  // Emergency Siren (Space Werewolf)
  playAlarm() {
    this.playAudioFile('/assets/audio/sfx_alarm.wav', 0.85, () => {
      try {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (_) {}
    });
  }

  // Buzzer (Wrong or Mic Grab buzz)
  playBuzzer() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  }

  // Alias for error/buzzer
  playError() {
    this.playBuzzer();
  }

  // Dice roll sound
  playDiceRoll() {
    this.playAudioFile('/assets/audio/sfx_dice.wav', 0.8, () => {
      try {
        const ctx = this.getContext();
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200 + Math.random() * 200, ctx.currentTime + i * 0.05);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.05);
          osc.stop(ctx.currentTime + i * 0.05 + 0.07);
        }
      } catch (_) {}
    });
  }

  // 3D Card Flip / Deal sound
  playCardFlip() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  // 3D Pawn Hop / Step sound
  playPawnHop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch (_) {}
  }

  // 3D Stamp Slam / Heavy Hammer
  playStampSlam() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  // 3D Stage Buzzer
  playStageBuzzer() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (_) {}
  }

  // Ambient Party Background Music (BGM) Player & Looper
  toggleBGM(enable: boolean, track: 'lounge' | 'lobby' | 'werewolf' | 'mic_grab' = 'lounge') {
    if (!enable) {
      if (this.currentBgmAudio) {
        this.currentBgmAudio.pause();
        this.currentBgmAudio.currentTime = 0;
        this.currentBgmAudio = null;
      }
      this.isBgmPlaying = false;
      return;
    }

    if (this.isBgmPlaying && this.currentBgmAudio) return;

    try {
      const audioPath = `/assets/audio/bgm_${track}.wav`;
      const bgm = new Audio(audioPath);
      bgm.loop = true;
      bgm.volume = 0.45;
      bgm.play().then(() => {
        this.currentBgmAudio = bgm;
        this.isBgmPlaying = true;
      }).catch(err => {
        console.warn('BGM play blocked or file not found', err);
      });
    } catch (e) {
      console.warn('BGM error:', e);
    }
  }

  // Background music (single track) handling
  private backgroundAudio: HTMLAudioElement | null = null;

  playBackgroundMusic(url: string, volume: number = 0.45) {
    if (this.isMasterMuted) return;
    // Stop any existing background music
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = volume;
      audio.play().then(() => {
        this.backgroundAudio = audio;
        this.isBgmPlaying = true;
      }).catch(err => {
        console.warn('Background music play blocked or missing', err);
        this.backgroundAudio = null;
        this.isBgmPlaying = false;
      });
    } catch (e) {
      console.warn('Background music error', e);
      this.backgroundAudio = null;
      this.isBgmPlaying = false;
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
      this.backgroundAudio = null;
    }
    this.isBgmPlaying = false;
  }

  setMasterMuted(muted: boolean) {
    this.isMasterMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
      if (this.currentBgmAudio) {
        this.currentBgmAudio.pause();
      }
    }
  }

  isMuted() {
    return this.isMasterMuted;
  }

  getBgmState() {
    return this.isBgmPlaying;
  }

  // Floating heart reaction pop sound
  playHeartPop() {
    this.haptic('light');
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  }

  // Soundboard: Cheerful laugh / chuckle
  playLaugh() {
    try {
      const ctx = this.getContext();
      const pitches = [520, 480, 520, 480, 560];
      pitches.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, time + 0.08);
        gain.gain.setValueAtTime(0.16, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.11);
      });
    } catch (_) {}
  }

  // Soundboard: Upbeat celebratory chime / cheer
  playCheer() {
    try {
      const ctx = this.getContext();
      const chord = [440, 554.37, 659.25, 880];
      chord.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.16, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch (_) {}
  }
}

export const soundFX = new SoundFX();
