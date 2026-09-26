const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

// Function to write a valid 16-bit PCM Stereo WAV file
function writeWavFile(filename, durationSec, sampleRate, generatorFn) {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const totalSamples = Math.floor(durationSec * sampleRate);
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk Descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = generatorFn(t, durationSec, i);

    // Clamp between -1.0 and 1.0
    const clampedL = Math.max(-1.0, Math.min(1.0, left));
    const clampedR = Math.max(-1.0, Math.min(1.0, right));

    const intL = clampedL < 0 ? Math.floor(clampedL * 32768) : Math.floor(clampedL * 32767);
    const intR = clampedR < 0 ? Math.floor(clampedR * 32768) : Math.floor(clampedR * 32767);

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  const filePath = path.join(audioDir, filename);
  fs.writeFileSync(filePath, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`Generated: ${filename} (${sizeMb} MB)`);
}

const SAMPLE_RATE = 44100;

console.log('--- Generating HD Studio Audio Assets for WePlay ---');

// 1. BGM: Lounge Track (Voice Room Lounge Chillout) ~75 seconds (~13.2 MB)
writeWavFile('bgm_lounge.wav', 75, SAMPLE_RATE, (t, dur) => {
  // Chords: Cmaj7 -> Am7 -> Dm7 -> G7
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];
  const chordIdx = Math.floor((t / 3.0) % chords.length);
  const chord = chords[chordIdx];

  let l = 0;
  let r = 0;

  // Lush pad chords with chorus
  chord.forEach((freq, idx) => {
    const pan = (idx / chord.length) * 0.8 - 0.4;
    const wave = Math.sin(2 * Math.PI * freq * t) * 0.12;
    const detune = Math.sin(2 * Math.PI * (freq * 1.003) * t) * 0.08;
    const s = wave + detune;
    l += s * (0.5 - pan);
    r += s * (0.5 + pan);
  });

  // Soft bassline
  const bassFreq = chord[0] / 2;
  const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.2;
  l += bass * 0.5;
  r += bass * 0.5;

  // Gentle percussion kick & hihat
  const beat = (t * 2) % 1;
  const kick = beat < 0.1 ? Math.sin(2 * Math.PI * 60 * (1 - beat * 8) * beat) * 0.3 * Math.exp(-beat * 20) : 0;
  const hihat = (t * 4) % 1 < 0.05 ? (Math.random() * 2 - 1) * 0.08 : 0;

  l += kick + hihat * 0.7;
  r += kick + hihat * 0.3;

  return [l, r];
});

// 2. BGM: Lobby Track (Upbeat Funky Party) ~70 seconds (~12.3 MB)
writeWavFile('bgm_lobby.wav', 70, SAMPLE_RATE, (t, dur) => {
  // Groovy electronic bass and arpeggio
  const tempo = 124; // BPM
  const beat = (t * (tempo / 60));
  const subBeat = beat % 1;
  const bar = Math.floor(beat / 4) % 4;

  const rootFreqs = [130.81, 155.56, 174.61, 196.00]; // C, Eb, F, G
  const root = rootFreqs[bar];

  // Bass
  const bassWave = Math.sin(2 * Math.PI * (root / 2) * t);
  const bassEnv = Math.exp(-subBeat * 4);
  const bass = bassWave * bassEnv * 0.25;

  // Synth Arp
  const arpNotes = [root, root * 1.25, root * 1.5, root * 1.8];
  const arpIdx = Math.floor((beat * 2) % 4);
  const arpFreq = arpNotes[arpIdx];
  const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.15 * Math.exp(-((beat * 2) % 1) * 3);

  // Drums
  const isKick = (beat % 1) < 0.1;
  const kick = isKick ? Math.sin(2 * Math.PI * 80 * (1 - (beat % 1) * 6) * t) * 0.35 : 0;
  const isSnare = ((beat + 0.5) % 2) < 0.1;
  const snare = isSnare ? (Math.random() * 2 - 1) * 0.2 * Math.exp(-(((beat + 0.5) % 2)) * 10) : 0;

  const l = bass + arp * 0.7 + kick * 0.6 + snare * 0.5;
  const r = bass + arp * 0.3 + kick * 0.6 + snare * 0.5;
  return [l, r];
});

// 3. BGM: Werewolf Suspense Track ~60 seconds (~10.5 MB)
writeWavFile('bgm_werewolf.wav', 60, SAMPLE_RATE, (t, dur) => {
  // Low tension drone
  const drone = (Math.sin(2 * Math.PI * 55 * t) + Math.sin(2 * Math.PI * 57 * t) * 0.5) * 0.2;
  // Heartbeat pulse every 1.2s
  const heartT = t % 1.2;
  const pulse1 = heartT < 0.12 ? Math.sin(2 * Math.PI * 45 * heartT) * 0.35 * Math.exp(-heartT * 15) : 0;
  const pulse2 = (heartT > 0.2 && heartT < 0.32) ? Math.sin(2 * Math.PI * 40 * (heartT - 0.2)) * 0.25 * Math.exp(-(heartT - 0.2) * 15) : 0;

  // Eerie wind / whisper
  const wind = (Math.random() * 2 - 1) * 0.04 * (1 + Math.sin(t * 0.5));

  const l = drone + pulse1 + pulse2 + wind * 0.8;
  const r = drone + pulse1 + pulse2 + wind * 0.6;
  return [l, r];
});

// 4. BGM: Mic Grab / Stage Party ~60 seconds (~10.5 MB)
writeWavFile('bgm_mic_grab.wav', 60, SAMPLE_RATE, (t, dur) => {
  const beat = (t * 2.2) % 1;
  const leadFreq = 440 + Math.sin(t * 1.5) * 100;
  const lead = (Math.sin(2 * Math.PI * leadFreq * t) + ((t * leadFreq) % 1 - 0.5) * 0.3) * 0.15;
  const clap = (t * 2.2 % 2 > 0.95) ? (Math.random() * 2 - 1) * 0.15 : 0;
  const beatKick = beat < 0.1 ? Math.sin(2 * Math.PI * 90 * t) * 0.3 : 0;

  return [lead * 0.6 + beatKick + clap, lead * 0.4 + beatKick + clap];
});

// 5. SFX: Supercar Revving & Accelerating ~4.5 seconds (~800 KB)
writeWavFile('sfx_car_rev.wav', 4.5, SAMPLE_RATE, (t, dur) => {
  const rpm = 80 + Math.pow(t / dur, 1.8) * 450 + Math.sin(t * 30) * 15;
  const engine1 = (Math.sin(2 * Math.PI * rpm * t) > 0 ? 0.3 : -0.3);
  const engine2 = Math.sin(2 * Math.PI * (rpm * 2) * t) * 0.2;
  const exhaust = (Math.random() * 2 - 1) * 0.15 * (t / dur);
  const fade = Math.exp(-Math.max(0, t - 3.5) * 4);

  const sig = (engine1 + engine2 + exhaust) * fade * 0.6;
  return [sig * (0.8 + Math.sin(t * 10) * 0.2), sig * (0.8 - Math.sin(t * 10) * 0.2)];
});

// 6. SFX: Flame Dragon Roar ~5.0 seconds (~880 KB)
writeWavFile('sfx_dragon_roar.wav', 5.0, SAMPLE_RATE, (t, dur) => {
  const baseFreq = 140 * Math.exp(-t * 0.4);
  const growlMod = Math.sin(2 * Math.PI * 25 * t);
  const roar = (Math.sin(2 * Math.PI * (baseFreq + growlMod * 30) * t) + (Math.random() * 2 - 1) * 0.4) * 0.35;
  const fireHiss = (Math.random() * 2 - 1) * 0.25 * Math.sin(t * 2);
  const env = (1 - Math.exp(-t * 5)) * Math.exp(-t * 0.7);

  const sig = (roar + fireHiss) * env;
  return [sig, sig];
});

// 7. SFX: Fairy Tale Castle Magical Harp ~4.0 seconds (~700 KB)
writeWavFile('sfx_castle_harp.wav', 4.0, SAMPLE_RATE, (t, dur) => {
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]; // A Major scale
  let l = 0;
  let r = 0;
  notes.forEach((freq, idx) => {
    const noteStart = idx * 0.2;
    if (t >= noteStart) {
      const noteT = t - noteStart;
      const pan = idx / notes.length;
      const s = Math.sin(2 * Math.PI * freq * noteT) * Math.exp(-noteT * 2.5) * 0.25;
      const sparkle = Math.sin(2 * Math.PI * (freq * 3) * noteT) * Math.exp(-noteT * 4) * 0.1;
      l += (s + sparkle) * (1 - pan);
      r += (s + sparkle) * pan;
    }
  });
  return [l, r];
});

// 8. SFX: Live Applause & Cheers ~4.0 seconds (~700 KB)
writeWavFile('sfx_applause.wav', 4.0, SAMPLE_RATE, (t, dur) => {
  const noiseL = (Math.random() * 2 - 1) * 0.25;
  const noiseR = (Math.random() * 2 - 1) * 0.25;
  const burst = (1 + Math.sin(t * 12) * 0.4) * (1 + Math.sin(t * 5) * 0.3);
  const env = Math.min(1, t * 2) * Math.exp(-Math.max(0, t - 2.5) * 2);

  return [noiseL * burst * env, noiseR * burst * env];
});

// 9. SFX: Space Werewolf Alarm Siren ~3.0 seconds (~520 KB)
writeWavFile('sfx_alarm.wav', 3.0, SAMPLE_RATE, (t, dur) => {
  const mod = (Math.sin(2 * Math.PI * 2.5 * t) + 1) / 2; // Siren sweeps up and down
  const freq = 600 + mod * 500;
  const sig = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.25 : -0.25) * Math.exp(-t * 0.1);
  return [sig, sig];
});

// 10. SFX: Victory Fanfare ~4.0 seconds (~700 KB)
writeWavFile('sfx_victory.wav', 4.0, SAMPLE_RATE, (t, dur) => {
  const notes = [
    { start: 0.0, freq: 523.25 }, // C5
    { start: 0.2, freq: 523.25 }, // C5
    { start: 0.4, freq: 523.25 }, // C5
    { start: 0.6, freq: 659.25 }, // E5
    { start: 0.9, freq: 783.99 }, // G5
    { start: 1.3, freq: 1046.50 }, // C6
  ];
  let sig = 0;
  notes.forEach(n => {
    if (t >= n.start) {
      const dt = t - n.start;
      const horn = Math.sin(2 * Math.PI * n.freq * dt) + Math.sin(2 * Math.PI * n.freq * 2 * dt) * 0.5;
      sig += horn * 0.18 * Math.exp(-dt * 2.2);
    }
  });
  return [sig, sig];
});

// 11. SFX: 3D Dice Roll ~2.0 seconds (~350 KB)
writeWavFile('sfx_dice.wav', 2.0, SAMPLE_RATE, (t, dur) => {
  let sig = 0;
  [0.0, 0.15, 0.28, 0.42, 0.58, 0.72].forEach(rollT => {
    if (t >= rollT && t < rollT + 0.08) {
      const dt = t - rollT;
      sig += Math.sin(2 * Math.PI * (300 + Math.random() * 200) * dt) * Math.exp(-dt * 50) * 0.4;
    }
  });
  return [sig, sig];
});

console.log('--- All Studio Audio Assets Generated Successfully! ---');
