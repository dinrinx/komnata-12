import { playTransport, stopTransport, toggleAuto } from '../../audio/transport.js';

export default function TopBar({ state }) {
  const onPlay = () => (state.play ? stopTransport() : playTransport());
  return (
    <div className="top">
      <div className="logo">комната 12</div>
      <div className={`btn play${state.play ? ' on' : ''}`} id="play" title="пробел" onClick={onPlay}>{state.play ? '❚❚' : '▶'}</div>
      <div className="btn" id="stop" onClick={stopTransport}>■</div>
      <div className="grow">
        <span className="m">песня</span>
        <span className="big" id="title" style={{ '--w': `${state.titleProgress}%` }}>«сорок восемь станций»</span>
        <span className="m">e minor · 64 такта</span>
      </div>
      <div className={`mode${!state.auto ? ' man' : ''}`} id="mode" onClick={toggleAuto}>
        <span className="m">режим</span>
        <b id="modev">{state.auto ? 'по сценарию' : 'руками'}</b>
      </div>
      <div><span className="m">темп</span><span className="big">140</span><span className="tag" style={{ background: '#fff' }}>закреплён</span></div>
      <div><span className="m">такт</span><span className="big" id="bar">{String(state.bar).padStart(2, '0')}/64</span></div>
    </div>
  );
}
