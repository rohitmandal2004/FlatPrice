// Web Audio API Sound Engine (No external assets required!)
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  
  // Resume context if suspended (browser auto-play policy)
  if (window.audioCtx.state === 'suspended') {
    window.audioCtx.resume();
  }
  
  return window.audioCtx;
};

// Snappy UI Click Sound
export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// Smooth Camera Fly-through Sound (Filtered Noise Sweep)
export const playWhooshSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.8;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate pink noise for a softer whoosh
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(100, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + (duration / 2));
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + (duration / 2));
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseSource.start();
};

// Ambient Rain Sound Generator
let rainSource = null;
let rainGain = null;

export const startRainSound = () => {
  const ctx = getAudioContext();
  if (!ctx || rainSource) return;

  // 2 second looping noise buffer
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  rainSource = ctx.createBufferSource();
  rainSource.buffer = buffer;
  rainSource.loop = true;

  // Low pass filter to make it sound like rain rather than static
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800; // Muffled rain

  rainGain = ctx.createGain();
  rainGain.gain.setValueAtTime(0, ctx.currentTime); // Start silent
  rainGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2); // Fade in over 2s

  rainSource.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(ctx.destination);

  rainSource.start();
};

export const stopRainSound = () => {
  if (!rainSource || !rainGain) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Fade out over 1 second
  rainGain.gain.cancelScheduledValues(ctx.currentTime);
  rainGain.gain.setValueAtTime(rainGain.gain.value, ctx.currentTime);
  rainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

  // Stop and cleanup after fade
  setTimeout(() => {
    if (rainSource) {
      rainSource.stop();
      rainSource.disconnect();
      rainSource = null;
    }
    if (rainGain) {
      rainGain.disconnect();
      rainGain = null;
    }
  }, 1000);
};
