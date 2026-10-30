import * as Tone from 'tone';

// Инструменты по голосам. Для каждого — вариант 2005 и 2017, см. SPEC.md.
// Все инструменты существуют постоянно, при прыжке переключается, какие играют.
export function createVoiceInstruments() {
  const voice2005 = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 4, spread: 30 },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.25, release: 0.3 },
  });
  const voice2017 = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.5, sustain: 0.35, release: 0.9 },
  });
  // «второй, расстроенный голос» в эхе, появляется при следе >= 1
  const voiceGhost = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth', detune: 9 },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 0.5 },
  });

  const minus2005 = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsquare', count: 2, spread: 20 },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.05 },
  });
  const minus2017 = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2,
    modulationIndex: 3,
    envelope: { attack: 0.02, decay: 1.5, sustain: 0, release: 1.5 },
  });
  [voice2005, voice2017, voiceGhost, minus2005, minus2017].forEach((s) => (s.maxPolyphony = 64));

  const bass2005 = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.3 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.8, baseFrequency: 80, octaves: 3 },
  });
  const bass2017 = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.8, release: 0.5 },
    filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 1, baseFrequency: 200, octaves: 1 },
  });

  const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6, envelope: { attack: 0.001, decay: 0.35, sustain: 0 } });
  const snareFilter = new Tone.Filter({ type: 'bandpass', frequency: 1800 });
  const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0 } });
  snare.connect(snareFilter);
  const tambFilter = new Tone.Filter({ type: 'highpass', frequency: 7000 });
  const tamb = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.09, sustain: 0 } });
  tamb.connect(tambFilter);
  const hat = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, resonance: 4000 });
  const tick = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 } });

  return {
    voice: { y2005: voice2005, y2017: voice2017, ghost: voiceGhost },
    minus: { y2005: minus2005, y2017: minus2017 },
    bass: { y2005: bass2005, y2017: bass2017 },
    drums: { kick, snare, snareFilter, tamb, tambFilter, hat, tick },
  };
}

export const hz = (midi) => Tone.Frequency(midi, 'midi').toFrequency();
