/**
 * Cathedral Soundscape Synthesizer
 * Uses Web Audio API to procedurally generate slow swelling, minor-modal echoes and soft wind.
 */
export class CathedralSoundscape {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }
      this.ctx = new AudioCtxClass();
      const ctx = this.ctx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      this.isRunning = true;

      // 1. Primary gain (low, ambient volume)
      this.primaryGain = ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0, ctx.currentTime);
      this.primaryGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 3.0); // smooth, soft fade-in

      // 2. Cathedral Reverb / Echo delay line to mimic stone corridors
      this.delayNode = ctx.createDelay(3.0);
      this.delayNode.delayTime.setValueAtTime(0.92, ctx.currentTime); // long echo spacing

      this.feedbackGain = ctx.createGain();
      this.feedbackGain.gain.setValueAtTime(0.62, ctx.currentTime); // feedback to create a rich reverb tail

      // Feedback loop
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);

      // Lowpass filter on delay line so echoes are muffled/warm like huge stone halls
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.setValueAtTime(550, ctx.currentTime);

      this.delayNode.connect(delayFilter);
      delayFilter.connect(this.primaryGain);

      // 3. Ambient Drone / Gregorian style chord
      // Root (A2) 110.00Hz, Fifth (E3) 164.81Hz, Root (A3) 220.00Hz, Minor Third (C4) 261.63Hz, Fifth (E4) 329.63Hz
      const frequencies = [110.00, 164.81, 220.00, 261.63, 329.63];
      const types: OscillatorType[] = ["triangle", "sine", "sine", "triangle", "sine"];
      const baseVolumes = [0.035, 0.025, 0.02, 0.015, 0.012];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = types[idx];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow pitch drift
        osc.detune.setValueAtTime((Math.random() - 0.5) * 6, ctx.currentTime);

        // Voice output gain
        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(baseVolumes[idx], ctx.currentTime);

        // Slow LFO to cause chanting voices to swell/breathe independently
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.03 + Math.random() * 0.04, ctx.currentTime); // very slow cycle (15-30s)

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(baseVolumes[idx] * 0.52, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(voiceGain.gain);

        // Route dry and wet paths
        osc.connect(voiceGain);
        voiceGain.connect(this.primaryGain!);
        voiceGain.connect(this.delayNode!); // Feed echo chamber

        osc.start();
        lfo.start();

        this.oscillators.push(osc);
        this.lfos.push(lfo);
      });

      // 4. Soft Wind generator
      const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Bandpass filter centered around 280Hz - sweeps centered to sound like gentle gusts
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.setValueAtTime(280, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.8, ctx.currentTime);

      const windLfo = ctx.createOscillator();
      windLfo.type = "sine";
      windLfo.frequency.setValueAtTime(0.06, ctx.currentTime); // slow sweeping

      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(80, ctx.currentTime);

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.008, ctx.currentTime); // extremely gentle muffle

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.primaryGain);
      windGain.connect(this.delayNode);

      noiseSource.start();
      windLfo.start();

      this.oscillators.push(noiseSource as any);
      this.lfos.push(windLfo);

      // Connect to destination
      this.primaryGain.connect(ctx.destination);
    } catch (e) {
      console.error("Failed starting cathedral soundscape:", e);
    }
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    try {
      if (this.primaryGain && this.ctx) {
        const ct = this.ctx.currentTime;
        this.primaryGain.gain.setValueAtTime(this.primaryGain.gain.value, ct);
        this.primaryGain.gain.linearRampToValueAtTime(0, ct + 2.2); // graceful 2.2s crossfade out

        const oscs = [...this.oscillators, ...this.lfos];
        setTimeout(() => {
          oscs.forEach(osc => {
            try { osc.stop(); } catch (e) {}
          });
          if (this.ctx) {
            try { this.ctx.close(); } catch (e) {}
          }
          this.ctx = null;
          this.oscillators = [];
          this.lfos = [];
          this.primaryGain = null;
          this.delayNode = null;
          this.feedbackGain = null;
        }, 2400);
      }
    } catch (e) {
      console.error("Error stopping cathedral soundscape:", e);
    }
  }
}
