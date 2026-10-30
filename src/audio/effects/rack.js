import * as Tone from 'tone';
import { createEffectInstance, EFFECTS } from './registry.js';

// Стойка эффектов: 4 слота, пустой слот — просто провод.
// input -> stage0 -> stage1 -> stage2 -> stage3(=output)
export class FxRack {
  constructor() {
    this.stages = [new Tone.Gain(), new Tone.Gain(), new Tone.Gain(), new Tone.Gain(), new Tone.Gain()];
    this.input = this.stages[0];
    this.output = this.stages[4];
    this.slots = [null, null, null, null]; // { key, node }
    for (let i = 0; i < 4; i++) this.stages[i].connect(this.stages[i + 1]);
  }

  setSlot(i, key, { wet, value } = {}) {
    const prev = this.slots[i];
    // убираем текущую проводку этого этажа (либо прямой провод, либо через эффект)
    this.stages[i].disconnect();
    if (prev?.node) {
      prev.node.disconnect();
      prev.node.dispose();
      this.slots[i] = null;
    }
    if (!key) {
      this.stages[i].connect(this.stages[i + 1]);
      return null;
    }
    const node = createEffectInstance(key, value);
    if (!node) {
      this.stages[i].connect(this.stages[i + 1]);
      return null;
    }
    this.stages[i].connect(node);
    node.connect(this.stages[i + 1]);
    if (wet != null && node.wet) node.wet.value = wet;
    this.slots[i] = { key, node };
    // reverb уже получил нужное значение через конструктор (generate() async, повторный
    // вызов сразу после создания может гонка с InvalidAccessError)
    if (value != null && key !== 'reverb') this.setParam(i, value);
    return node;
  }

  setWet(i, wet) {
    const s = this.slots[i];
    if (s?.node?.wet) s.node.wet.value = wet;
  }

  setParam(i, value) {
    const s = this.slots[i];
    if (!s) return;
    const def = EFFECTS[s.key];
    if (def?.param) def.param.apply(s.node, value);
  }

  dispose() {
    this.slots.forEach((s) => s?.node?.dispose());
    this.stages.forEach((g) => g.dispose());
  }
}
