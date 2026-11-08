import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {SCENES, TEXTS} from '../src/scenes';
import timing from '../data/timing.json';

const TOTAL = 608.84;
const OUT = path.resolve('out/storyboard');
const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(1, '0')}m${String(Math.floor(t % 60)).padStart(2, '0')}s`;
const strip = (s: string) => s.replace(/\*/g, '');

const main = async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const bundled = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
  const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
  const browser = await openBrowser('chrome', {browserExecutable: exe, chromiumOptions: {gl: 'swangle'}});
  const comp = await selectComposition({serveUrl: bundled, id: 'Orche', puppeteerInstance: browser});
  const list: any[] = [];
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    const e = i + 1 < SCENES.length ? SCENES[i + 1].t : TOTAL;
    const mid = i === 0 ? 2.8 : s.t + (e - s.t) * 0.55;
    const frame = Math.min(comp.durationInFrames - 1, Math.round(mid * 30));
    const file = `${String(i + 1).padStart(3, '0')}_${fmt(s.t)}.jpg`;
    if (!only || only.includes(i)) {
      await renderStill({composition: comp, serveUrl: bundled, output: path.join(OUT, file), frame, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
    }
    const items = [...(s.items ?? []), ...((s.p && s.p.items) || [])];
    const hasFull = s.k === 'open' || items.some((x: any) => x.k === 'full');
    const hasCard = items.some((x: any) => x.k === 'media');
    const tipo = hasFull ? 'vídeo real em tela cheia' : hasCard ? 'cartão com imagem real' : 'animação';
    const nar = (timing as any[]).filter((x) => Math.min(x.end, e) - Math.max(x.start, s.t) > 0.25).map((x) => x.text).join(' ');
    const txt = TEXTS.filter((x) => mid >= x.t && mid < x.t + x.d).map((x) => strip(x.s));
    const extra: string[] = [];
    if (s.k === 'chapter') extra.push(`${s.p.num} / ${s.p.title}`);
    if (s.k === 'counter') extra.push(`${s.p.label ? s.p.label + ': ' : ''}${s.p.to}${s.p.unit ? ' ' + s.p.unit : ''}`);
    if (s.k === 'study') extra.push(`STUDIO: ${s.p.big} (${s.p.author} ${s.p.year})`);
    if (s.k === 'end') extra.push('LA VITA ESTREMA, SPIEGATA. / ISCRIVITI');
    if (s.k === 'cards') extra.push(`Carta 0${s.p.reveal}: ${s.p.name}`);
    const trn = s.tr ?? (i === 0 ? 'cut' : i % 11 === 4 ? 'flash' : i % 3 === 1 ? 'whip' : 'cut');
    const som: string[] = [trn === 'whip' ? 'whoosh' : trn === 'flash' ? 'flash + boom grave' : trn === 'dip' ? 'queda breve da música antes da revelação' : 'clique de corte'];
    if (TEXTS.some((x) => x.t >= s.t - 0.01 && x.t < e)) som.push('pop do texto');
    if (s.k === 'counter') som.push('cliques do contador');
    if (s.k === 'cards' || s.k === 'chapter') som.push('boom grave + whoosh da carta (silêncio de 0,5 s antes)');
    if (items.some((x: any) => x.k === 'stamp')) som.push('boom do carimbo');
    if (items.some((x: any) => x.k === 'rings') || s.k === 'map') som.push('ping de sonar');
    if (items.some((x: any) => x.k === 'media' || x.k === 'full')) som.push('whoosh leve da entrada do cartão');
    list.push({n: i + 1, arquivo: file, inicio_s: +s.t.toFixed(2), fim_s: +e.toFixed(2), narracao: nar, visual: s.v, texto_tela: [...txt, ...extra].join(' | '), tipo, som: som.join('; ') + '; música ambiente contínua (-24 dB)'});
    if (i % 20 === 0) console.log('cena', i + 1, '/', SCENES.length);
  }
  if (!only) fs.writeFileSync(path.join(OUT, 'storyboard.json'), JSON.stringify(list, null, 1));
  await browser.close({silent: true} as any);
};
main().catch((e) => { console.error(e); process.exit(1); });
