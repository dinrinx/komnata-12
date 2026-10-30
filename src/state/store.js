import { create } from 'zustand';
import { VOICE_IDS } from '../music/score.js';
import { VOICE_FX_PRESETS, MASTER_FX_PRESET } from '../audio/effects/presets.js';

const cloneFx = (preset) => preset.map((s) => ({ ...s }));

export const useStore = create(() => ({
  ready: false,
  play: false,
  auto: true,
  y: 2017,
  pend: null,
  trace: 0,
  in05: 0,
  tone: 0,
  bar: 1,
  step: -1,
  beatPulse: 0,
  scramble: null,
  p: [0, 0, 0, 0],
  lvl: [0.8, 0.6, 0.7, 0.8],
  pan: [0, -0.3, 0, 0.3],
  mute: [0, 0, 0, 0],
  solo: null,
  echo: 0.6,
  music: 0.8,
  mic: 0.85,
  meters: [0, 0, 0, 0],
  openVoice: null,
  fxByYear: {
    2005: {
      voice: cloneFx(VOICE_FX_PRESETS[2005].voice),
      minus: cloneFx(VOICE_FX_PRESETS[2005].minus),
      bass: cloneFx(VOICE_FX_PRESETS[2005].bass),
      drums: cloneFx(VOICE_FX_PRESETS[2005].drums),
    },
    2017: {
      voice: cloneFx(VOICE_FX_PRESETS[2017].voice),
      minus: cloneFx(VOICE_FX_PRESETS[2017].minus),
      bass: cloneFx(VOICE_FX_PRESETS[2017].bass),
      drums: cloneFx(VOICE_FX_PRESETS[2017].drums),
    },
  },
  masterFx: cloneFx(MASTER_FX_PRESET),
}));

export const voiceIndex = Object.fromEntries(VOICE_IDS.map((id, i) => [id, i]));
