import { SEC } from '../../music/score.js';

export default function FormStrip({ state }) {
  const si = SEC.findIndex((s) => state.bar >= s[0] && state.bar <= s[1]);
  return (
    <div className="form" id="form">
      {SEC.map((s, i) => (
        <div key={i} className={`${i === si ? 'now' : ''} ${!state.auto && i === si + 1 ? 'cue' : ''}`}>
          <span className="m">такты {s[0]}–{s[1]} · {s[3]}</span>
          <b>{s[2]}</b>
        </div>
      ))}
    </div>
  );
}
