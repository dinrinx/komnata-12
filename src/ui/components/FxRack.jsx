import { EFFECT_OPTIONS, EFFECTS } from '../../audio/effects/registry.js';
import { setFxSlotKey, setFxSlotWet, setFxSlotValue } from '../../audio/engine.js';

export default function FxRack({ voiceId, slots }) {
  return (
    <div className="fxrack">
      {slots.map((slot, i) => {
        const def = slot.key ? EFFECTS[slot.key] : null;
        return (
          <div className="fxslot" key={i}>
            <select value={slot.key} onChange={(e) => setFxSlotKey(voiceId, i, e.target.value)}>
              {EFFECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {def && (
              <>
                <div className="row">
                  <span className="plabel">wet</span>
                  <input type="range" min={0} max={1} step={0.01} value={slot.wet}
                    onChange={(e) => setFxSlotWet(voiceId, i, Number(e.target.value))} />
                </div>
                <div className="row">
                  <span className="plabel">{def.param.label} · {def.tech} / {def.param.key}</span>
                  <input type="range" min={def.param.min} max={def.param.max} step={def.param.step ?? (def.param.max - def.param.min) / 100}
                    value={slot.value ?? def.param.default}
                    onChange={(e) => setFxSlotValue(voiceId, i, Number(e.target.value))} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
