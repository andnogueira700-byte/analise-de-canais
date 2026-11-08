import {SCENES} from '../src/scenes';
let full = 0, card = 0, n = 0;
SCENES.forEach((s, i) => {
  const e = i + 1 < SCENES.length ? SCENES[i + 1].t : 608.84, d = e - s.t;
  const items = [...(s.items ?? []), ...((s.p && s.p.items) || [])];
  if (s.k === 'open' || items.some((x: any) => x.k === 'full')) full += d; else if (items.some((x: any) => x.k === 'media')) card += d;
});
console.log({full, card, pct: ((full + card) / 608.84 * 100).toFixed(1)});
