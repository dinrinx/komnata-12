import * as Tone from 'tone';

// Стойка эффектов: 18 эффектов Tone.js. У каждого — создание, один главный
// параметр (метафора мира + техническое название) и флаг LFO-эффекта,
// который нужно .start()-ить и синхронизировать с Transport.
export const EFFECT_LIST = [
  'autoFilter', 'autoPanner', 'autoWah', 'bitCrusher', 'chebyshev', 'chorus',
  'distortion', 'feedbackDelay', 'freeverb', 'frequencyShifter', 'jcReverb',
  'phaser', 'pingPongDelay', 'pitchShift', 'reverb', 'stereoWidener',
  'tremolo', 'vibrato',
];

export const EFFECTS = {
  autoFilter: {
    label: 'стена', tech: 'AutoFilter', lfo: true,
    create: () => new Tone.AutoFilter({ frequency: 1, baseFrequency: 200, octaves: 4 }),
    param: { key: 'frequency', label: 'качание стены', min: 0.05, max: 10, default: 1, apply: (fx, v) => (fx.frequency.value = v) },
  },
  autoPanner: {
    label: 'метание', tech: 'AutoPanner', lfo: true,
    create: () => new Tone.AutoPanner({ frequency: 1 }),
    param: { key: 'frequency', label: 'скорость метания', min: 0.05, max: 10, default: 1, apply: (fx, v) => (fx.frequency.value = v) },
  },
  autoWah: {
    label: 'квак', tech: 'AutoWah', lfo: false,
    create: () => new Tone.AutoWah({ baseFrequency: 100, octaves: 6, sensitivity: 0 }),
    param: { key: 'sensitivity', label: 'чувствительность кваканья', min: -40, max: 0, default: 0, apply: (fx, v) => (fx.sensitivity = v) },
  },
  bitCrusher: {
    label: 'раздробление', tech: 'BitCrusher', lfo: false,
    create: () => new Tone.BitCrusher({ bits: 8 }),
    param: { key: 'bits', label: 'битность', min: 1, max: 16, step: 1, default: 8, apply: (fx, v) => (fx.bits.value = v) },
  },
  chebyshev: {
    label: 'надрыв', tech: 'Chebyshev', lfo: false,
    create: () => new Tone.Chebyshev({ order: 20 }),
    param: { key: 'order', label: 'порядок надрыва', min: 1, max: 100, step: 1, default: 20, apply: (fx, v) => (fx.order = v) },
  },
  chorus: {
    label: 'хорус толпы', tech: 'Chorus', lfo: true,
    create: () => new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7 }),
    param: { key: 'depth', label: 'глубина хоруса', min: 0, max: 1, default: 0.7, apply: (fx, v) => (fx.depth = v) },
  },
  distortion: {
    label: 'перегруз', tech: 'Distortion', lfo: false,
    create: () => new Tone.Distortion({ distortion: 0.4 }),
    param: { key: 'distortion', label: 'уровень перегруза', min: 0, max: 1, default: 0.4, apply: (fx, v) => (fx.distortion = v) },
  },
  feedbackDelay: {
    label: 'эхо', tech: 'FeedbackDelay', lfo: false,
    create: () => new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.3 }),
    param: { key: 'feedback', label: 'повторы эха', min: 0, max: 0.95, default: 0.3, apply: (fx, v) => (fx.feedback.value = v) },
  },
  freeverb: {
    label: 'комната', tech: 'Freeverb', lfo: false,
    create: () => new Tone.Freeverb({ roomSize: 0.7, dampening: 3000 }),
    param: { key: 'roomSize', label: 'размер комнаты', min: 0, max: 0.99, default: 0.7, apply: (fx, v) => (fx.roomSize.value = v) },
  },
  frequencyShifter: {
    label: 'сдвиг', tech: 'FrequencyShifter', lfo: false,
    create: () => new Tone.FrequencyShifter({ frequency: 0 }),
    param: { key: 'frequency', label: 'сдвиг частоты', min: -200, max: 200, default: 0, apply: (fx, v) => (fx.frequency.value = v) },
  },
  jcReverb: {
    label: 'зал', tech: 'JCReverb', lfo: false,
    create: () => new Tone.JCReverb({ roomSize: 0.5 }),
    param: { key: 'roomSize', label: 'размер зала', min: 0, max: 1, default: 0.5, apply: (fx, v) => (fx.roomSize.value = v) },
  },
  phaser: {
    label: 'фазовое дрожание', tech: 'Phaser', lfo: true,
    create: () => new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 350 }),
    param: { key: 'frequency', label: 'скорость фейзера', min: 0.05, max: 10, default: 0.5, apply: (fx, v) => (fx.frequency.value = v) },
  },
  pingPongDelay: {
    label: 'отскок между стен', tech: 'PingPongDelay', lfo: false,
    create: () => new Tone.PingPongDelay({ delayTime: 0.2, feedback: 0.3 }),
    param: { key: 'feedback', label: 'повторы отскока', min: 0, max: 0.95, default: 0.3, apply: (fx, v) => (fx.feedback.value = v) },
  },
  pitchShift: {
    label: 'расстройка', tech: 'PitchShift', lfo: false,
    create: () => new Tone.PitchShift({ pitch: 0 }),
    param: { key: 'pitch', label: 'сдвиг тона', min: -12, max: 12, step: 1, default: 0, apply: (fx, v) => (fx.pitch = v) },
  },
  reverb: {
    label: 'хвост помещения', tech: 'Reverb', lfo: false,
    create: (v) => new Tone.Reverb({ decay: v ?? 2 }),
    param: { key: 'decay', label: 'длина хвоста', min: 0.1, max: 10, default: 2, apply: (fx, v) => { fx.decay = v; fx.generate(); } },
  },
  stereoWidener: {
    label: 'ширина стен', tech: 'StereoWidener', lfo: false,
    create: () => new Tone.StereoWidener({ width: 0.5 }),
    param: { key: 'width', label: 'ширина стерео', min: 0, max: 1, default: 0.5, apply: (fx, v) => (fx.width.value = v) },
  },
  tremolo: {
    label: 'вибрация колонок', tech: 'Tremolo', lfo: true,
    create: () => new Tone.Tremolo({ frequency: 4, depth: 0.5 }),
    param: { key: 'depth', label: 'глубина тремоло', min: 0, max: 1, default: 0.5, apply: (fx, v) => (fx.depth.value = v) },
  },
  vibrato: {
    label: 'дрожь', tech: 'Vibrato', lfo: true,
    create: () => new Tone.Vibrato({ frequency: 5, depth: 0.3 }),
    param: { key: 'depth', label: 'дрожь', min: 0, max: 1, default: 0.3, apply: (fx, v) => (fx.depth.value = v) },
  },
};

export const EFFECT_OPTIONS = [{ value: '', label: 'пусто' }, ...EFFECT_LIST.map((k) => ({ value: k, label: `${EFFECTS[k].label} · ${EFFECTS[k].tech}` }))];

export function createEffectInstance(key, value) {
  if (!key || !EFFECTS[key]) return null;
  const def = EFFECTS[key];
  const fx = def.create(value);
  if (def.lfo && typeof fx.start === 'function') {
    fx.sync().start(0);
  }
  return fx;
}
