import { setTone } from '../../audio/transport.js';
import { setBusLevel } from '../../audio/engine.js';
import Fader from './Fader.jsx';

export default function Desk({ state }) {
  const a = state.y === 2005;
  return (
    <div className="desk">
      <div className="row"><span className="lbl">пульт</span><span className="tag" style={{ background: 'var(--cy)' }}>караоке-машина</span></div>
      <div>
        <div className="row"><span className="lbl">тон</span><span className="m">← →</span></div>
        <div className="tone" style={{ marginTop: 8 }}>
          <span id="tdn" onClick={() => setTone(-1)}>♭</span>
          <span className="tv" id="tonev">{state.tone > 0 ? `+${state.tone}` : state.tone}</span>
          <span id="tup" onClick={() => setTone(1)}>♯</span>
        </div>
      </div>
      <div>
        <div className="row"><span className="lbl">эхо</span><span className="m" id="echot">{a ? 'слэпбэк 120 мс' : 'хвост, 6 шестнадцатых'}</span></div>
        <Fader value={state.echo} color="var(--ac)" onSet={(x) => setBusLevel('echo', x)} />
      </div>
      <div>
        <div className="row"><span className="lbl">музыка</span><span className="m">минус, пол, бубен</span></div>
        <Fader value={state.music} color="var(--ac)" onSet={(x) => setBusLevel('music', x)} />
      </div>
      <div>
        <div className="row"><span className="lbl">микрофон</span><span className="m">голос</span></div>
        <Fader value={state.mic} color="var(--ac)" onSet={(x) => setBusLevel('mic', x)} />
      </div>
      <div>
        <div className="row"><span className="lbl">темп</span><span className="m">не меняется</span></div>
        <div className="m" style={{ marginTop: 6 }}>время меняется. темп — нет</div>
      </div>
      <div className="keys m">
        пробел — играть / стоп<br />5 / 7 — прыжок в 2005 / 2017<br />← → — тон<br />z x c v — заглушить голос
      </div>
    </div>
  );
}
