import * as Tone from 'tone';
import { createVoiceInstruments, hz } from './voices.js';
import { FxRack } from './effects/rack.js';
import { EFFECTS } from './effects/registry.js';
import { VOICE_FX_PRESETS, MASTER_FX_PRESET } from './effects/presets.js';
import { useStore } from '../state/store.js';

const SEND_LEVEL = { voice: 0.5, minus: 0.25, bass: 0, drums: 0.1 };

let built = false;
export const nodes = {};

function dbFromFader(v) {
  return Tone.gainToDb(Math.max(0.0001, v));
}

function step(label, fn) {
  try {
    return fn();
  } catch (err) {
    console.error('[engine]', label, err);
    throw err;
  }
}

export function initEngine() {
  if (built) return nodes;
  built = true;

  nodes.instruments = step('instruments', () => createVoiceInstruments());

  step('master chain', () => {
    nodes.master = new Tone.Gain(1);
    nodes.masterFx = new FxRack();
    nodes.limiter = new Tone.Limiter(-1);
    nodes.master.connect(nodes.masterFx.input);
    nodes.masterFx.output.connect(nodes.limiter);
    nodes.limiter.toDestination();
  });
  MASTER_FX_PRESET.forEach((s, i) => step(`masterFx slot ${i} ${s.key}`, () => nodes.masterFx.setSlot(i, s.key, s)));

  step('buses', () => {
    nodes.busMic = new Tone.Gain(useStore.getState().mic);
    nodes.busMusic = new Tone.Gain(useStore.getState().music);
    nodes.busMic.connect(nodes.master);
    nodes.busMusic.connect(nodes.master);
  });

  step('echo', () => {
    nodes.echoSend = new Tone.Gain(useStore.getState().echo);
    nodes.echoDelay = new Tone.FeedbackDelay({ delayTime: 0.12, feedback: 0.3, maxDelay: 2 });
    nodes.echoLP = new Tone.Filter({ type: 'lowpass', frequency: 3500 });
    nodes.echoSend.connect(nodes.echoDelay);
    nodes.echoDelay.connect(nodes.echoLP);
    nodes.echoLP.connect(nodes.master);
  });

  nodes.racks = {};
  nodes.channels = {};
  nodes.sends = {};
  nodes.meters = {};
  nodes.inputs = {};

  ['voice', 'minus', 'bass', 'drums'].forEach((id) => {
    step(`voice chain ${id}`, () => {
      const input = new Tone.Gain();
      const rack = new FxRack();
      const channel = new Tone.Channel({ volume: dbFromFader(useStore.getState().lvl[idx(id)]), pan: useStore.getState().pan[idx(id)] });
      const meter = new Tone.Meter({ smoothing: 0.6 });
      const send = new Tone.Gain(SEND_LEVEL[id]);

      input.connect(rack.input);
      rack.output.connect(channel);
      channel.connect(meter);
      channel.connect(id === 'voice' ? nodes.busMic : nodes.busMusic);
      channel.connect(send);
      send.connect(nodes.echoSend);

      nodes.inputs[id] = input;
      nodes.racks[id] = rack;
      nodes.channels[id] = channel;
      nodes.meters[id] = meter;
      nodes.sends[id] = send;
    });

    const preset = VOICE_FX_PRESETS[useStore.getState().y][id];
    preset.forEach((s, i) => step(`rack ${id} slot ${i} ${s.key}`, () => nodes.racks[id].setSlot(i, s.key, s)));
  });

  step('ghost send', () => {
    nodes.ghostSend = new Tone.Gain(0.35);
    nodes.instruments.voice.ghost.connect(nodes.ghostSend);
    nodes.ghostSend.connect(nodes.echoSend);
  });

  step('wire instruments', () => wireInstruments());
  return nodes;
}

function wireInstruments() {
  const { voice, minus, bass, drums } = nodes.instruments;
  voice.y2005.connect(nodes.inputs.voice);
  voice.y2017.connect(nodes.inputs.voice);
  minus.y2005.connect(nodes.inputs.minus);
  minus.y2017.connect(nodes.inputs.minus);
  bass.y2005.connect(nodes.inputs.bass);
  bass.y2017.connect(nodes.inputs.bass);
  drums.kick.connect(nodes.inputs.drums);
  drums.snareFilter.connect(nodes.inputs.drums);
  drums.tambFilter.connect(nodes.inputs.drums);
  drums.hat.connect(nodes.inputs.drums);
  drums.tick.connect(nodes.inputs.drums);
}

function idx(id) {
  return { voice: 0, minus: 1, bass: 2, drums: 3 }[id];
}

export function applyFxYear(year) {
  ['voice', 'minus', 'bass', 'drums'].forEach((id) => {
    const slots = useStore.getState().fxByYear[year][id];
    const rack = nodes.racks[id];
    slots.forEach((s, i) => rack.setSlot(i, s.key, s));
  });
}

export function setFxSlotKey(voiceId, slotIndex, key) {
  const def = key ? EFFECTS[key] : null;
  const value = def?.param?.default;
  const slot = { key, wet: 1, value };
  nodes.racks[voiceId].setSlot(slotIndex, key, slot);
  useStore.setState((s) => {
    const fxByYear = structuredClone ? structuredClone(s.fxByYear) : JSON.parse(JSON.stringify(s.fxByYear));
    fxByYear[s.y][voiceId][slotIndex] = slot;
    return { fxByYear };
  });
}

export function setFxSlotWet(voiceId, slotIndex, wet) {
  nodes.racks[voiceId].setWet(slotIndex, wet);
  useStore.setState((s) => {
    const fxByYear = { ...s.fxByYear, [s.y]: { ...s.fxByYear[s.y], [voiceId]: s.fxByYear[s.y][voiceId].map((sl, i) => (i === slotIndex ? { ...sl, wet } : sl)) } };
    return { fxByYear };
  });
}

export function setFxSlotValue(voiceId, slotIndex, value) {
  nodes.racks[voiceId].setParam(slotIndex, value);
  useStore.setState((s) => {
    const fxByYear = { ...s.fxByYear, [s.y]: { ...s.fxByYear[s.y], [voiceId]: s.fxByYear[s.y][voiceId].map((sl, i) => (i === slotIndex ? { ...sl, value } : sl)) } };
    return { fxByYear };
  });
}

export function toggleMute(i) {
  useStore.setState((s) => ({ mute: s.mute.map((m, k) => (k === i ? m ^ 1 : m)) }));
  applyMix();
}

export function toggleSolo(i) {
  useStore.setState((s) => ({ solo: s.solo === i ? null : i }));
  applyMix();
}

export function setLevel(i, v) {
  useStore.setState((s) => ({ lvl: s.lvl.map((x, k) => (k === i ? v : x)) }));
  applyMix();
}

export function setPan(i, v) {
  useStore.setState((s) => ({ pan: s.pan.map((x, k) => (k === i ? v : x)) }));
  applyMix();
}

export function setBusLevel(key, v) {
  useStore.setState({ [key]: v });
  applyMix();
}

export function applyMix() {
  const s = useStore.getState();
  ['voice', 'minus', 'bass', 'drums'].forEach((id, i) => {
    const ch = nodes.channels[id];
    ch.volume.rampTo(dbFromFader(s.lvl[i]), 0.02);
    ch.pan.rampTo(s.pan[i], 0.02);
    ch.mute = !!s.mute[i];
    ch.solo = s.solo === i;
  });
  nodes.busMic.gain.rampTo(s.mic, 0.02);
  nodes.busMusic.gain.rampTo(s.music, 0.02);
  nodes.echoSend.gain.rampTo(s.echo, 0.02);
}

export function triggerVoiceNote(time, midi, lenSteps, ST) {
  const s = useStore.getState();
  const freq = hz(midi + s.tone);
  const dur = lenSteps * ST;
  if (s.y === 2005) {
    nodes.instruments.voice.y2005.triggerAttackRelease(freq, dur * 0.9, time, 0.8);
  } else {
    nodes.instruments.voice.y2017.triggerAttackRelease(freq, dur * 0.9, time, 0.7);
    if (s.trace >= 1) nodes.instruments.voice.ghost.triggerAttackRelease(hz(midi + s.tone + 0.09), dur * 0.8, time, 0.4);
  }
}

export function triggerMinusNote(time, midi, lenSteps, ST) {
  const s = useStore.getState();
  const freq = hz(midi + s.tone);
  if (s.y === 2005) nodes.instruments.minus.y2005.triggerAttackRelease(freq, Math.max(0.05, lenSteps * ST * 0.7), time, 0.6);
  else nodes.instruments.minus.y2017.triggerAttackRelease(freq, 0.08, time, 0.5);
}

export function triggerBassNote(time, midi, lenSteps, ST) {
  const s = useStore.getState();
  const freq = hz(midi + s.tone);
  if (s.y === 2005) nodes.instruments.bass.y2005.triggerAttackRelease(freq, lenSteps * ST * 0.85, time, 0.8);
  else nodes.instruments.bass.y2017.triggerAttackRelease(freq, lenSteps * ST * 0.85, time, 0.7);
}

export function triggerDrum(kind, time, vel = 1) {
  const d = nodes.instruments.drums;
  if (kind === 'kick') d.kick.triggerAttackRelease('C1', '8n', time, 0.9 * vel);
  else if (kind === 'tick') d.tick.triggerAttackRelease(1600, '32n', time, 0.3 * vel);
  else if (kind === 'snare') d.snare.triggerAttackRelease('16n', time, 0.6 * vel);
  else if (kind === 'tamb') d.tamb.triggerAttackRelease('32n', time, 0.4 * vel);
  else if (kind === 'hat') d.hat.triggerAttackRelease('C5', '32n', time, 0.25 * vel);
}

export function getMeterLevels() {
  return ['voice', 'minus', 'bass', 'drums'].map((id) => {
    const v = nodes.meters[id].getValue();
    const db = Array.isArray(v) ? v[0] : v;
    return Math.min(1, Math.max(0, (db + 60) / 60));
  });
}
