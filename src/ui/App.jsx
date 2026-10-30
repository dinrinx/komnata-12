import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../state/store.js';
import { MEL, CHO, VO } from '../music/score.js';
import { effPattern } from '../audio/trace.js';
import { getMeterLevels, toggleMute } from '../audio/engine.js';
import { playTransport, stopTransport, jumpYear, setTone, toggleAuto } from '../audio/transport.js';
import TopBar from './components/TopBar.jsx';
import YearScreen from './components/YearScreen.jsx';
import LeapPanel from './components/LeapPanel.jsx';
import Desk from './components/Desk.jsx';
import FormStrip from './components/FormStrip.jsx';
import VoiceCard from './components/VoiceCard.jsx';

function buildLine(bar, y, p, step) {
  const ci = (bar - 1) % 4;
  const pg = effPattern({ y, p, trace: 0 }, 0);
  const mel = pg < 2 ? (pg ? CHO : MEL)[ci] : [];
  const h = Array(16).fill(0);
  mel.forEach((n) => {
    for (let k = n[0]; k < n[0] + n[2] && k < 16; k++) h[k] = n[1];
  });
  return h.map((v, k) => ({ v, n: !!v, on: k <= step && !!v }));
}

export default function App() {
  const state = useStore();
  const [meters, setMeters] = useState([0, 0, 0, 0]);
  const scrambleRef = useRef(null);
  const [scrambleDigits, setScrambleDigits] = useState(null);

  // уровни по каналам, независимо от шага секвенсора
  useEffect(() => {
    let raf;
    const loop = () => {
      try {
        setMeters(getMeterLevels());
      } catch {
        /* движок ещё не создан */
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // прокрутка цифр года при прыжке
  useEffect(() => {
    if (state.scramble == null) return;
    let n = 0;
    const target = String(state.scramble).slice(2);
    const t = setInterval(() => {
      setScrambleDigits(n < 7 ? String((Math.random() * 90 + 10) | 0) : target);
      if (++n > 7) {
        clearInterval(t);
        setScrambleDigits(null);
      }
    }, 45);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.scramble]);

  useEffect(() => {
    document.body.className = state.y === 2005 ? '' : 'y17';
  }, [state.y]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === ' ') {
        e.preventDefault();
        state.play ? stopTransport() : playTransport();
      } else if (k === '5') jumpYear(2005);
      else if (k === '7') jumpYear(2017);
      else if (k === 'ArrowLeft') setTone(-1);
      else if (k === 'ArrowRight') setTone(1);
      else {
        const i = 'zxcv'.indexOf(k.toLowerCase());
        if (i >= 0) toggleMute(i);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.play]);

  const titleProgress = useMemo(() => (((state.bar - 1) % 4) * 16 + Math.max(state.step, 0)) / 63 * 100, [state.bar, state.step]);
  const line = useMemo(() => buildLine(state.bar, state.y, state.p, state.step), [state.bar, state.y, state.p, state.step]);

  const full = { ...state, titleProgress, line, meters, scrambleDigits };

  return (
    <div className="app">
      <TopBar state={full} />
      <div className="hero">
        <YearScreen state={full} />
        <LeapPanel state={full} />
      </div>
      <Desk state={full} />
      <FormStrip state={full} />
      <div className="voices" id="voices">
        {VO.map((_, i) => <VoiceCard key={i} i={i} state={full} />)}
      </div>
    </div>
  );
}
