// Механика следа: сколько тактов проведено в 2005, и сколько фрагментов
// приносится обратно в 2017 (максимум 4, не стирается).
export const cap = (R, i) => (R.y === 2005 || i === 0 ? 2 : ([0, R.trace >= 3, R.trace >= 4, R.trace >= 2][i] ? 1 : 0));
export const effPattern = (R, i) => Math.min(R.p[i], cap(R, i));

export function onLeap(state, toYear) {
  if (toYear === 2017 && state.y === 2005) {
    state.trace = Math.min(4, state.trace + Math.floor(state.in05 / 8));
    state.in05 = 0;
  }
  state.y = toYear;
}
