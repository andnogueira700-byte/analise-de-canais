// Exporta os cues de som (cortes, textos, entradas) para o mixer em Python
import fs from 'fs';
import {SCENES, TEXTS} from '../src/scenes';
const T = 608.84;
const cues: {t: number; type: string}[] = [];
SCENES.forEach((s, i) => {
  const tr = s.tr ?? (i === 0 ? 'cut' : i % 11 === 4 ? 'flash' : i % 3 === 1 ? 'whip' : 'cut');
  if (i > 0 && tr !== 'cut' && !['cards', 'chapter'].includes(s.k)) cues.push({t: s.t, type: 'whoosh'});
  const items = [...(s.items ?? []), ...((s.p && s.p.items) || [])];
  items.forEach((it: any) => { if (it.k === 'media') cues.push({t: s.t + (it.at ?? 0), type: 'whoosh'}); });
  if (s.k === 'study' || s.k === 'timeline') cues.push({t: s.t + 0.1, type: 'paper'});
});
TEXTS.forEach((x) => cues.push({t: x.t, type: 'pop'}));
cues.sort((a, b) => a.t - b.t);
fs.writeFileSync('out/cues.json', JSON.stringify(cues));
console.log(cues.length, 'cues', T);
