export default function YearScreen({ state }) {
  const a = state.y === 2005;
  const yrDigits = state.scrambleDigits ?? String(state.y).slice(2);
  return (
    <div className="screen">
      <span className="tag" id="state">{a ? 'комната полная · 4 голоса' : `четыре утра · ты один · след ${state.trace}/4`}</span>
      <div className="year" id="yr">20<span>{yrDigits}</span></div>
      <div className="m" id="desc">{a ? 'пятница, лето. колонки выкручены, эхо на максимуме' : 'машина новая, минус тихий. сквозь стену бухает бас'}</div>
      <div className="line" id="line">
        {state.line.map((h, k) => (
          <i key={k}
            className={`${h.n ? 'n' : ''} ${h.on ? 'on' : ''} ${k === state.step ? 'now' : ''}`}
            style={{ height: h.n ? `${Math.max(6, (h.v - 58) * 3)}px` : '6px' }} />
        ))}
      </div>
    </div>
  );
}
