export default function Fader({ className = 'bar fx', value, color, onSet, children, renderFill = true }) {
  const handle = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    onSet(x);
  };
  return (
    <div className={className} onClick={handle}>
      {renderFill && <i style={{ width: `${value * 100}%`, background: color }} />}
      {children}
    </div>
  );
}
