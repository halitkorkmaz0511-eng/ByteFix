// Simple sound system using Web Audio API
// Uses procedurally generated sounds instead of audio files

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Generate a simple click/tap sound
  playClick() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Success sound - ascending tones
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.1);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.1 + 0.3);
      
      osc.start(this.audioContext.currentTime + i * 0.1);
      osc.stop(this.audioContext.currentTime + i * 0.1 + 0.3);
    });
  }

  // Error sound - descending tones
  playError() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Money sound - coin-like
  playMoney() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(1400, this.audioContext.currentTime + 0.05);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  // Level up sound - fanfare
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.15);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.4);
      
      osc.start(this.audioContext.currentTime + i * 0.15);
      osc.stop(this.audioContext.currentTime + i * 0.15 + 0.4);
    });
  }

  // Customer arrival sound
  playCustomerArrival() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Upgrade purchase sound
  playUpgrade() {
    if (!this.enabled) return;
    this.init();
    
    const notes = [392, 523.25, 659.25]; // G4, C5, E5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.12);
      osc.type = 'square';
      
      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.12 + 0.25);
      
      osc.start(this.audioContext.currentTime + i * 0.12);
      osc.stop(this.audioContext.currentTime + i * 0.12 + 0.25);
    });
  }

  // Customer leaving sound
  playCustomerLeave() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.5);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Mini-game tick sound
  playTick() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }
}

export const soundSystem = new SoundSystem();
