let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return null;
  if (!audioContext) {
    audioContext = new Context();
  }
  return audioContext;
}

function playTone(frequency: number, durationMs: number, volume: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export function playMoveSound() {
  playTone(520, 70, 0.05);
}

export function playCaptureSound() {
  playTone(360, 90, 0.06);
}
