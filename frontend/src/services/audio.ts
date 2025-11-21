class TonePlayer {
  private audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  play(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  }
}

const player = new TonePlayer();

export const AudioService = {
  click: () => player.play(600, 120, 'square'),
  success: () => player.play(900, 200, 'triangle'),
  defeat: () => player.play(200, 400, 'sawtooth'),
};
