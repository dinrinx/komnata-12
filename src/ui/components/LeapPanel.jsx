import { jumpYear } from '../../audio/transport.js';

export default function LeapPanel({ state }) {
  return (
    <div className="leap">
      <div className="row">
        <span className="lbl">набери год</span>
        <span className={`tag${state.pend ? ' wait' : ''}`} id="leaptag">прыжок на следующем такте</span>
      </div>
      <div className="yrs">
        <div className={`yt${state.y === 2005 ? ' on' : ''}${state.pend === 2005 ? ' pend' : ''}`} data-y="2005" onClick={() => jumpYear(2005)}>
          <span className="m">прошлое · 5</span><b>2005</b>
        </div>
        <div className={`yt${state.y === 2017 ? ' on' : ''}${state.pend === 2017 ? ' pend' : ''}`} data-y="2017" onClick={() => jumpYear(2017)}>
          <span className="m">настоящее · 7</span><b>2017</b>
        </div>
      </div>
      <div className="row"><span className="lbl">след</span><span className="m" id="tracev">{state.trace} / 4 вернулось</span></div>
      <div className="trace" id="trace">
        {[0, 1, 2, 3].map((i) => <i key={i} className={i < state.trace ? 'on' : ''} />)}
      </div>
      <div className="m" id="tracehint">
        {state.y === 2005
          ? `в прошлом ${state.in05} такт. → вернётся ${Math.floor(state.in05 / 8)} при возврате`
          : 'каждые 8 тактов в 2005-м возвращают в 2017-й один фрагмент. стереть нельзя'}
      </div>
    </div>
  );
}
