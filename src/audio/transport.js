import * as Tone from 'tone';
import { BPM, BARS, CH, RT, MEL, CHO, SCORE } from '../music/score.js';
import { cap, effPattern, onLeap } from './trace.js';
import { initEngine, triggerVoiceNote, triggerMinusNote, triggerBassNote, triggerDrum, applyFxYear, applyMix } from './engine.js';
import { useStore } from '../state/store.js';

const ST = 60 / BPM / 4; // длина шестнадцатой при 140 bpm

// Внутренний мутируемый счётчик такта/шага — живёт отдельно от React,
// синхронизируется в store через Tone.Draw в момент звучания события.
let R = { y: 2017, trace: 0, in05: 0, tone: 0, bar: 1, step: 0, p: [0, 0, 0, 0], pend: null };
let loop = null;
let leapTimer = null;

function resetRuntime() {
  const s = useStore.getState();
  R = { y: s.y, trace: 0, in05: 0, tone: 0, bar: 1, step: 0, p: [0, 0, 0, 0], pend: null };
}

export function leap(year, time) {
  onLeap(R, year);
  applyFxYear(year);
  Tone.Draw.schedule(() => {
    useStore.setState({ y: R.y, trace: R.trace, in05: R.in05, scramble: R.y });
    setTimeout(() => useStore.setState((s) => (s.scramble === R.y ? { scramble: null } : {})), 400);
  }, time);
}

function doStep(time) {
  const st = R.step;
  const bar = R.bar;
  const ci = (bar - 1) % 4;
  const auto = useStore.getState().auto;
  let ev = 0;

  if (st === 0) {
    if (auto && SCORE[bar]) {
      const e = SCORE[bar];
      if (e.p) R.p = [...e.p];
      if (e.t != null) R.tone = e.t;
      if (e.y && e.y !== R.y) R.pend = e.y;
    }
    if (R.pend) {
      leap(R.pend, time);
      R.pend = null;
      ev = 1;
    }
    if (R.y === 2005) R.in05++;
  }

  const p = [0, 1, 2, 3].map((i) => effPattern(R, i));
  const a = R.y === 2005;

  if (p[0] < 2) {
    (p[0] ? CHO : MEL)[ci].forEach((n) => {
      if (n[0] === st) triggerVoiceNote(time, n[1], n[2], ST);
    });
  }
  if ((p[1] === 0 && st === 0) || (p[1] === 1 && st % 4 === 0) || (p[1] === 2 && st % 2 === 0)) {
    CH[ci].forEach((m) => triggerMinusNote(time, m, [16, 3, 1.5][p[1]], ST));
  }
  const r = RT[ci];
  if (p[2] === 0 && st === 0) triggerBassNote(time, r, 15, ST);
  else if (p[2] && st % 2 === 0) triggerBassNote(time, p[2] === 2 && st % 4 === 2 ? r + 12 : r, 1.6, ST);

  if (p[3] === 0) {
    if (st % 4 === 0) triggerDrum('tick', time, st ? 1 : 1.5);
  } else if (p[3] === 1) {
    if (a) {
      if (st % 2 === 0) triggerDrum('tamb', time);
      if (st % 8 === 0) triggerDrum('kick', time);
    } else {
      if (st % 4 === 0) triggerDrum('tick', time);
      if (st === 0) triggerDrum('tamb', time, 0.6);
    }
  } else {
    if ([0, 6, 8, 10].includes(st)) triggerDrum('kick', time);
    if (st % 8 === 4) triggerDrum('snare', time);
    if (st % 2 === 1) triggerDrum('hat', time, 0.5);
    if (st % 2 === 0) triggerDrum('tamb', time, st % 4 ? 0.6 : 1);
  }

  const snapshot = { bar, step: st, ev, y: R.y, p: [...R.p], tone: R.tone, trace: R.trace, in05: R.in05 };
  Tone.Draw.schedule(() => {
    useStore.setState({
      bar: snapshot.bar, step: snapshot.step, y: snapshot.y, p: snapshot.p, tone: snapshot.tone,
      trace: snapshot.trace, in05: snapshot.in05, beatPulse: snapshot.y === 2005 && snapshot.step % 8 === 0 ? Date.now() : useStore.getState().beatPulse,
    });
  }, time);

  R.step = (st + 1) % 16;
  if (R.step === 0) {
    R.bar++;
    if (R.bar > BARS) {
      R.bar = 1;
      if (auto) { R.trace = 0; R.in05 = 0; }
    }
  }
}

export function startEngine() {
  initEngine();
  Tone.Transport.bpm.value = BPM;
  Tone.Transport.timeSignature = 4;
  if (!loop) {
    loop = new Tone.Loop((time) => doStep(time), '16n');
  }
}

export async function playTransport() {
  await Tone.start();
  startEngine();
  resetRuntime();
  applyFxYear(R.y);
  applyMix();
  loop.start(0);
  Tone.Transport.start();
  useStore.setState({ play: true, bar: 1, step: 0 });
}

export function stopTransport() {
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  loop?.stop(0);
  const s = useStore.getState();
  const resetYear = s.auto ? 2017 : s.y;
  R = { y: resetYear, trace: 0, in05: 0, tone: s.auto ? 0 : s.tone, bar: 1, step: 0, p: s.auto ? [0, 0, 0, 0] : s.p, pend: null };
  applyFxYear(R.y);
  useStore.setState({ play: false, bar: 1, step: -1, trace: 0, in05: 0, y: R.y, tone: R.tone, p: R.p, pend: null });
}

export function jumpYear(year) {
  const s = useStore.getState();
  if (!s.play) {
    R.y = year;
    initEngine();
    applyFxYear(year);
    useStore.setState({ y: year, pend: null });
    return;
  }
  useStore.setState({ auto: false });
  R.pend = year === R.y ? null : year;
  useStore.setState({ pend: R.pend });
}

export function setTone(delta) {
  useStore.setState({ auto: false });
  R.tone = Math.max(-3, Math.min(3, R.tone + delta));
  useStore.setState({ tone: R.tone });
}

export function setPattern(voiceIndex, k) {
  useStore.setState({ auto: false });
  R.p[voiceIndex] = k;
  useStore.setState((s) => ({ p: [...s.p.slice(0, voiceIndex), k, ...s.p.slice(voiceIndex + 1)] }));
}

export function toggleAuto() {
  useStore.setState((s) => ({ auto: !s.auto }));
}

export function getCurrentRuntime() {
  return R;
}
