import { useState } from 'react';
import { VO } from '../../music/score.js';
import { cap } from '../../audio/trace.js';
import { toggleMute, toggleSolo, setLevel, setPan } from '../../audio/engine.js';
import { setPattern } from '../../audio/transport.js';
import Fader from './Fader.jsx';
import FxRack from './FxRack.jsx';

const LETTERS = ['а', 'б', 'в'];
const COLOR_VARS = ['--mg', '--cy', '--or', '--li'];

export default function VoiceCard({ i, state }) {
  const [open, setOpen] = useState(false);
  const v = VO[i];
  const R = state;
  const a = R.y === 2005;
  const isGhost = !a && cap(R, i) === 0 && i > 0;
  const level = R.meters[i] ?? 0;

  return (
    <div className={`v${isGhost ? ' ghost' : ''}`} style={{ '--c': `var(${v.c})` }}>
      <div className="vh">
        <div>
          <h3 className={R.beatPulseVoice ? 'beat' : ''}>{v.n}</h3>
          <span className="m">{v.r}</span>
        </div>
        <div className="vt">
          <span className={`tag${R.mute[i] ? ' on' : ''}`} onClick={() => toggleMute(i)}>mute</span>
          <span className={`tag${R.solo === i ? ' on' : ''}`} onClick={() => toggleSolo(i)}>solo</span>
        </div>
      </div>
      <div className="pat">
        {v.pt.map((label, k) => (
          <div key={k}
            className={`${R.p[i] === k ? 'on' : ''} ${k > cap(R, i) ? 'lock' : ''}`}
            onClick={() => setPattern(i, k)}>
            {LETTERS[k]}
            <span className="m">{label}</span>
          </div>
        ))}
      </div>
      <div className="st">{v.s(R)}</div>
      <Fader className="bar lv" value={R.lvl[i]} color={`var(${v.c})`} onSet={(x) => setLevel(i, x)} renderFill={false}>
        <i style={{ width: `${Math.min(100, level * 100)}%`, background: `var(${v.c})` }} />
        <b style={{ left: `${R.lvl[i] * 100}%` }} />
      </Fader>
      <div className="row">
        <span className="m">панорама</span>
        <input type="range" min={-1} max={1} step={0.05} value={R.pan[i]} onChange={(e) => setPan(i, Number(e.target.value))} />
      </div>
      <div className="chain">{v.ch}</div>
      <div className="fxrack-toggle" onClick={() => setOpen((o) => !o)}>{open ? 'свернуть стойку' : 'стойка эффектов'}</div>
      {open && <FxRack voiceId={['voice', 'minus', 'bass', 'drums'][i]} slots={R.fxByYear[R.y][['voice', 'minus', 'bass', 'drums'][i]]} />}
    </div>
  );
}
