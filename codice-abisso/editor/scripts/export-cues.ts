// Exporta os "cues" de som (cortes, textos, entradas) para o gerador de áudio em Python
import fs from 'fs';
import {SCENES, TEXTS} from '../src/scenes';
const T = 608.84;
const cues: {t: number; type: string}[] = [];
SCENES.forEach((s, i) => {
  const e = i + 1 < SCENES.length ? SCENES[i + 1].t : T;
  const tr = s.tr ?? (i === 0 ? 'cut' : i % 11 === 4 ? 'flash' : i % 3 === 1 ? 'whip' : 'cut');
  if (i > 0) cues.push({t: s.t, type: tr === 'whip' ? 'whoosh' : tr === 'flash' ? 'boom' : tr === 'dip' ? 'swell' : 'click'});
  const items = [...(s.items ?? []), ...((s.p && s.p.items) || [])];
  items.forEach((it: any) => {
    if (it.k === 'media') cues.push({t: s.t + (it.at ?? 0), type: 'whoosh_soft'});
    if (it.k === 'rings') cues.push({t: s.t + 0.1, type: 'ping'});
  });
  if (s.k === 'map') cues.push({t: s.t + 0.3, type: 'ping'});
  if (s.k === 'counter') for (let k = 0; k < 6; k++) cues.push({t: s.t + (s.p.delay ?? 0) + k * 0.2, type: 'tick'});
  if (s.k === 'cards' || s.k === 'chapter') cues.push({t: s.t, type: 'boom'});
  if (s.k === 'study') cues.push({t: s.t + 0.1, type: 'whoosh_soft'});
  // ambiente de água: bolhas e deslocamento de água a cada ~3 s dentro da cena
  for (let q = s.t + 1.2; q < e - 0.5; q += 3.1) cues.push({t: q, type: Math.floor(q * 7) % 2 ? 'bubbles' : 'water'});
});
TEXTS.forEach((x) => cues.push({t: x.t, type: 'pop'}));
cues.sort((a, b) => a.t - b.t);
fs.writeFileSync('out/cues.json', JSON.stringify(cues));
console.log(cues.length, 'cues');
