import {SCENES} from '../src/scenes';
let prev = -1;
SCENES.forEach((s, i) => {
  const e = i + 1 < SCENES.length ? SCENES[i + 1].t : 608.84;
  if (s.t <= prev) console.log('ORDEM', i, s.t);
  if (e - s.t > 5.05) console.log('LONGA', i, s.t, (e - s.t).toFixed(1));
  prev = s.t;
});
console.log('cenas', SCENES.length);
