import type { SoundCue } from '../types/show';

let audioCtx: AudioContext | null = null;
let masterOut: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
const unlockListeners = new Set<(unlocked: boolean) => void>();

function notifyUnlockState(unlocked: boolean) {
  for (const listener of unlockListeners) {
    listener(unlocked);
  }
}

function getAudioEngine(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtx) {
    audioCtx = new Ctx();
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
    compressor.knee.setValueAtTime(16, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(6, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.004, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.18, audioCtx.currentTime);

    masterOut = audioCtx.createGain();
    masterOut.gain.setValueAtTime(0.95, audioCtx.currentTime);
    masterOut.connect(compressor);
    compressor.connect(audioCtx.destination);

    audioCtx.onstatechange = () => {
      notifyUnlockState(audioCtx?.state === 'running');
    };
  }

  if (!masterOut) return null;
  return { ctx: audioCtx, out: masterOut };
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
    return noiseBuffer;
  }
  const length = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

export function isAudioUnlocked(): boolean {
  return Boolean(audioCtx && audioCtx.state === 'running');
}

export function subscribeAudioUnlock(listener: (unlocked: boolean) => void): () => void {
  unlockListeners.add(listener);
  listener(isAudioUnlocked());
  return () => {
    unlockListeners.delete(listener);
  };
}

export async function unlockAudio(): Promise<boolean> {
  try {
    const engine = getAudioEngine();
    if (!engine) return false;
    if (engine.ctx.state !== 'running') {
      await engine.ctx.resume();
    }
    const unlocked = engine.ctx.state === 'running';
    notifyUnlockState(unlocked);
    return unlocked;
  } catch {
    return false;
  }
}

function playTone(
  engine: { ctx: AudioContext; out: GainNode },
  freq: number,
  startOffset: number,
  duration: number,
  options: {
    type?: OscillatorType;
    volume?: number;
    endFreq?: number;
    attack?: number;
    lowpassHz?: number;
  } = {}
) {
  const { ctx, out } = engine;
  const {
    type = 'triangle',
    volume = 0.16,
    endFreq,
    attack = 0.01,
    lowpassHz,
  } = options;

  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
  }

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + Math.min(attack, duration * 0.4));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  if (lowpassHz) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, t0);
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(out);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

function playNoiseSweep(
  engine: { ctx: AudioContext; out: GainNode },
  startOffset: number,
  duration: number,
  startHz: number,
  endHz: number,
  volume = 0.16
) {
  const { ctx, out } = engine;
  const t0 = ctx.currentTime + startOffset;

  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(1.8, t0);
  filter.frequency.setValueAtTime(startHz, t0);
  filter.frequency.exponentialRampToValueAtTime(endHz, t0 + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  src.start(t0);
  src.stop(t0 + duration + 0.03);
}

/**
 * Zero-dependency Web Audio API broadcast game show sound synthesizer.
 */
export function playBroadcastCue(cue: SoundCue): void {
  try {
    const engine = getAudioEngine();
    if (!engine) return;
    if (engine.ctx.state === 'suspended') {
      engine.ctx.resume().catch(() => {});
    }

    switch (cue) {
      case 'timerTick':
        // Crisp TV countdown woodblock + high clock click (last 5s)
        playTone(engine, 1180, 0, 0.055, { type: 'triangle', volume: 0.22, endFreq: 760, attack: 0.003 });
        playTone(engine, 2360, 0, 0.035, { type: 'sine', volume: 0.11, attack: 0.002 });
        break;

      case 'timeUp':
        // Classic bold game-show time's up horn/buzzer
        playTone(engine, 185.0, 0, 0.72, { type: 'sawtooth', volume: 0.2, lowpassHz: 1100, attack: 0.008 });
        playTone(engine, 180.5, 0, 0.72, { type: 'sawtooth', volume: 0.18, lowpassHz: 1100, attack: 0.008 });
        playTone(engine, 92.5, 0, 0.75, { type: 'square', volume: 0.14, lowpassHz: 600, attack: 0.01 });
        break;

      case 'cardFlip':
        // Crisp broadcast swoosh + snappy card pop
        playNoiseSweep(engine, 0, 0.17, 450, 3200, 0.2);
        playTone(engine, 360, 0.02, 0.12, { type: 'sine', volume: 0.15, endFreq: 840, attack: 0.005 });
        playTone(engine, 1046.5, 0.09, 0.09, { type: 'triangle', volume: 0.12, attack: 0.004 });
        break;

      case 'reveal':
        // Lush shimmering answer reveal swoosh + bright major lift
        playNoiseSweep(engine, 0, 0.2, 500, 3800, 0.16);
        playTone(engine, 523.25, 0.04, 0.16, { type: 'triangle', volume: 0.15 });
        playTone(engine, 659.25, 0.1, 0.18, { type: 'triangle', volume: 0.15 });
        playTone(engine, 1046.5, 0.17, 0.42, { type: 'sine', volume: 0.19 });
        break;

      case 'exactMatch':
      case 'scoreUp':
        // Sparkly Family Feud / game-show bright bell ding chime
        playTone(engine, 880.0, 0, 0.16, { type: 'triangle', volume: 0.18, attack: 0.004 });
        playTone(engine, 1108.73, 0.065, 0.2, { type: 'triangle', volume: 0.18, attack: 0.004 });
        playTone(engine, 1318.51, 0.13, 0.48, { type: 'sine', volume: 0.22, attack: 0.004 });
        playTone(engine, 2637.02, 0.13, 0.35, { type: 'sine', volume: 0.08, attack: 0.004 });
        break;

      case 'closeMatch':
        // Clean positive two-note ding
        playTone(engine, 659.25, 0, 0.15, { type: 'triangle', volume: 0.17, attack: 0.005 });
        playTone(engine, 987.77, 0.09, 0.36, { type: 'sine', volume: 0.2, attack: 0.005 });
        break;

      case 'miss':
      case 'scoreDown':
        // Iconic double-hit wrong buzzer ("BZZT-BZZT!")
        playTone(engine, 142, 0, 0.16, { type: 'sawtooth', volume: 0.18, lowpassHz: 780, attack: 0.006 });
        playTone(engine, 136, 0, 0.16, { type: 'square', volume: 0.12, lowpassHz: 680, attack: 0.006 });
        playTone(engine, 126, 0.19, 0.34, { type: 'sawtooth', volume: 0.19, lowpassHz: 720, attack: 0.006 });
        playTone(engine, 120, 0.19, 0.34, { type: 'square', volume: 0.13, lowpassHz: 620, attack: 0.006 });
        break;

      case 'fanfare':
        // Triumphant round-win brassy synth fanfare (C5 - E5 - G5 - C6 + warm chord)
        playTone(engine, 523.25, 0, 0.13, { type: 'sawtooth', volume: 0.14, lowpassHz: 2400 });
        playTone(engine, 659.25, 0.11, 0.13, { type: 'sawtooth', volume: 0.14, lowpassHz: 2600 });
        playTone(engine, 783.99, 0.22, 0.14, { type: 'sawtooth', volume: 0.15, lowpassHz: 2800 });
        // Big celebratory final chord
        playTone(engine, 1046.5, 0.34, 0.72, { type: 'sawtooth', volume: 0.16, lowpassHz: 3400 });
        playTone(engine, 783.99, 0.34, 0.7, { type: 'triangle', volume: 0.14 });
        playTone(engine, 523.25, 0.34, 0.7, { type: 'triangle', volume: 0.14 });
        playTone(engine, 2093.0, 0.36, 0.45, { type: 'sine', volume: 0.07 });
        break;

      case 'switch':
        // Subtle crisp broadcast wipe transition
        playNoiseSweep(engine, 0, 0.12, 350, 1800, 0.08);
        playTone(engine, 440, 0, 0.09, { type: 'sine', volume: 0.1 });
        playTone(engine, 659.25, 0.045, 0.14, { type: 'sine', volume: 0.11 });
        break;

      case 'pass':
        // Quick skip whoosh
        playNoiseSweep(engine, 0, 0.12, 2200, 600, 0.14);
        playTone(engine, 480, 0, 0.11, { type: 'sine', volume: 0.12, endFreq: 260 });
        break;

      case 'bidHit':
        // Punchy ascending hit counter blip
        playTone(engine, 698.46, 0, 0.07, { type: 'triangle', volume: 0.16, attack: 0.004 });
        playTone(engine, 1046.5, 0.045, 0.14, { type: 'sine', volume: 0.17, attack: 0.004 });
        break;

      case 'targetHit':
        // Jackpot target cleared burst
        playTone(engine, 523.25, 0, 0.1, { type: 'triangle', volume: 0.16 });
        playTone(engine, 659.25, 0.07, 0.1, { type: 'triangle', volume: 0.16 });
        playTone(engine, 783.99, 0.14, 0.12, { type: 'triangle', volume: 0.17 });
        playTone(engine, 1046.5, 0.21, 0.2, { type: 'sine', volume: 0.19 });
        playTone(engine, 1567.98, 0.28, 0.45, { type: 'sine', volume: 0.18 });
        break;

      case 'stampTruth':
        // Heavy stamp thud + bright emerald chime
        playTone(engine, 140, 0, 0.14, { type: 'triangle', volume: 0.24, endFreq: 55, attack: 0.004 });
        playTone(engine, 587.33, 0.05, 0.16, { type: 'triangle', volume: 0.17 });
        playTone(engine, 880.0, 0.12, 0.42, { type: 'sine', volume: 0.2 });
        break;

      case 'stampLie':
        // Heavy stamp slam + ominous red alarm sting
        playTone(engine, 120, 0, 0.18, { type: 'triangle', volume: 0.25, endFreq: 48, attack: 0.004 });
        playTone(engine, 164.81, 0.06, 0.22, { type: 'sawtooth', volume: 0.16, lowpassHz: 900 });
        playTone(engine, 123.47, 0.22, 0.42, { type: 'sawtooth', volume: 0.18, lowpassHz: 850 });
        break;
    }
  } catch {
    // Audio playback is best-effort and must never interrupt show operation
  }
}
