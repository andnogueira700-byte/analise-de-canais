// Roteiro de cenas do vídeo "Por que as Filipinas não falam espanhol", sincronizado pela legenda.
// Mesmo estilo do vídeo 3: mapa intercalado com imagens reais em tela cheia, clipes, motion graphics e linha do tempo 1540–2015.
const MOS_USE = ['mundo', 'asia', 'europa', 'iberia', 'pacifico', 'filipinas', 'luzon', 'manila', 'cebu', 'mindanao', 'zamboanga'];
const FOTO_KEYS = ['r_filipe2', 'm_murillo', 'r_claveria', 'd_catalogo', 'd_doctrina', 'f_sanagustin', 'r_rizal', 'd_noli', 'p_manilabay', 'r_dewey',
  'f_tratado', 'r_aguinaldo', 'f_tropas', 'f_thomas', 'f_marco_thomasites', 'r_quezon', 'f_pilar', 'f_pilar_antigo', 'f_cebu'];
const FOTOS = FOTO_KEYS.map(k => [k, `fotos/${k}.jpg`]);
Object.assign(MK, { escola: 'school', lei: 'scale', placa: 'signpost', navio: 'ship', livro: 'book-open', grupo: 'users', espada: 'swords', idiomas: 'languages',
  papel: 'scroll', igreja: 'church', forte: 'castle', coroa: 'crown', mensagem: 'message-circle', governo: 'landmark', formatura: 'graduation-cap', negocio: 'briefcase',
  sobe: 'trending-up', casa: 'house', moeda: 'coins', bandeira: 'flag', martelo: 'gavel', camadas: 'layers', documento: 'file-text', crianca: 'baby', dinheiro: 'dollar-sign', ancora: 'anchor' });
for (const n of ['school', 'scale', 'swords', 'landmark', 'users', 'scroll', 'layers', 'church', 'castle']) MK[n] = n;
CIDADES = true;
const P = { // lugares [lon, lat]
  manila: [120.98, 14.6], cebu: [123.89, 10.31], zamboanga: [122.07, 6.91], madrid: [-3.7, 40.42], paris: [2.35, 48.86],
  sfP: [237.58, 37.77], washington: [-77.0, 38.9], hongkong: [114.17, 22.3], cavite: [120.89, 14.48],
  phC: [122.3, 12.4], luzonC: [121.3, 16.3], visayasC: [123.6, 11.0], mindanaoC: [125.1, 7.9], tagalog: [121.15, 14.3], sebuano: [124.0, 9.9],
  bisaya: [123.0, 10.6], ilocano: [120.6, 17.4], bicol: [123.4, 13.4], palawan: [118.6, 9.5]
};
const CLIPDIR0 = 'file:///tmp/claude-0/fil/px/';
const CLIPS = { // id: [arquivo, segundo inicial no clipe]
  manilaNoite: ['px116681-manila-noite.mp4', 0.5], prefeitura: ['px298215-manila-prefeitura-drone.mp4', 1], correios: ['px298212-manila-correios-intramuros.mp4', 1],
  binondo: ['px298216-binondo-ponte-drone.mp4', 1], baia: ['px278802-baia-manila-por-do-sol.mp4', 1], baiaFim: ['px278802-baia-manila-por-do-sol.mp4', 9],
  ilhas: ['px288665-hundred-islands-drone.mp4', 1], ilhas2: ['px288663-ilhas-mar-drone.mp4', 1], pesca: ['px218785-barcos-pesca-costa.mp4', 2],
  aula: ['px215471-sala-de-aula.mp4', 0.5], alunos: ['px215475-alunos-estudando.mp4', 0.5], bandeira: ['px24686-bandeira-filipinas.mp4', 2],
  cebuRua: ['px380571-rua-cebu.mp4', 1], motos: ['px218362-motos-estrada.mp4', 1], menino: ['px218793-menino-praia.mp4', 2], prefeitura2: ['px298215-manila-prefeitura-drone.mp4', 7]
};
// ---------- camadas novas deste vídeo ----------
// imagem em tela cheia com movimento lento (Ken Burns) e legenda; clipe de vídeo quadro a quadro; linha do tempo
const CLIPDIR = 'file:///tmp/claude-0/clips/';
const FRAMES = {};
const frameKey = (c, t) => `${c.id}/${String(Math.floor((t - c.t0) * 30) + 1).padStart(5, '0')}`;
// carrega antes do quadro os quadros dos clipes visíveis (render.js chama prep antes de render)
async function prep(t) {
  const need = SCENE.clips.filter(c => t >= c.t0 - 0.05 && t <= c.t1 + 0.4).map(c => frameKey(c, clamp(t, c.t0, c.t1)));
  await Promise.all(need.filter(k => !FRAMES[k]).map(k => new Promise(res => { const im = new Image(); im.onload = () => { FRAMES[k] = im; res(); }; im.onerror = () => res(); im.src = CLIPDIR + k + '.jpg'; })));
  for (const k of Object.keys(FRAMES)) if (!need.includes(k)) delete FRAMES[k];
}
function coverDraw(im, kb, p, a) {
  const z = lerp(kb[2], kb[5], p), fx = lerp(kb[0], kb[3], p), fy = lerp(kb[1], kb[4], p);
  const k = Math.max(W / im.width, H / im.height) * z, iw = im.width * k, ih = im.height * k;
  const x = clamp(W / 2 - fx * iw, W - iw, 0), y = clamp(H / 2 - fy * ih, H - ih, 0);
  ctx.globalAlpha = a; ctx.drawImage(im, x, y, iw, ih);
}
function fullAlpha(t, S) {
  let m = 0;
  for (const f of S.fulls) if (IMG[f.img]) m = Math.max(m, vis(t, f.t0, f.t1, f.fin ?? 0.25, f.fout ?? 0.25));
  for (const c of S.clips) m = Math.max(m, vis(t, c.t0, c.t1, 0.25, 0.25));
  for (const l of S.tl) m = Math.max(m, vis(t, l.t0, l.t1, 0.3, 0.3));
  return m;
}
function caption(cap, sub, a, side) {
  if (!cap) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = '800 44px "Bricolage Grotesque"'; const w1 = ctx.measureText(cap).width;
  ctx.font = '500 26px Figtree'; const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.min(Math.max(w1, w2) + 70, W - 160), h = sub ? 124 : 84, x = side === 'right' ? W - 80 - w : 80, y = H - 80 - h;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = C.tinta; rr(x, y, w, h, 16); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.ipe; rr(x, y, 10, h, [16, 0, 0, 16]); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.branco; fit(cap, w - 70, '800 {}px "Bricolage Grotesque"', 44, 22); ctx.fillText(cap, x + 36, y + 56);
  if (sub) { ctx.fillStyle = '#C9D2E3'; fit(sub, w - 70, '500 {}px Figtree', 26, 14); ctx.fillText(sub, x + 36, y + 98); }
  ctx.restore();
}
function drawFulls(t, S) {
  for (const f of S.fulls) {
    const a = vis(t, f.t0, f.t1, f.fin ?? 0.25, f.fout ?? 0.25); if (!a) continue; const im = IMG[f.img]; if (!im) continue;
    const p = clamp((t - f.t0) / Math.max(1, f.t1 - f.t0 + 0.25));
    ctx.save(); ctx.fillStyle = C.tinta; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H);
    if (f.fit) { // imagem que não pode ser cortada (mapa antigo, documento): inteira sobre fundo desfocado
      ctx.filter = 'blur(28px) brightness(0.55)'; coverDraw(im, [0.5, 0.5, 1.2, 0.5, 0.5, 1.25], p, a); ctx.filter = 'none';
      const z = 1 + 0.06 * p, k = Math.min((W - 160) / im.width, (H - 120) / im.height) * z, iw = im.width * k, ih = im.height * k;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.drawImage(im, W / 2 - iw / 2, H / 2 - ih / 2, iw, ih); ctx.shadowColor = 'transparent';
    } else coverDraw(im, f.kb || [0.5, 0.45, 1.04, 0.5, 0.45, 1.14], easeOut(p) * 0.4 + p * 0.6, a);
    // vinheta e grão por cima, iguais aos do mapa
    ctx.globalAlpha = a; ctx.drawImage(OVER, 0, 0); ctx.restore();
    caption(f.cap, f.sub, a * clamp((t - f.t0 - 0.35) / 0.35), f.side);
  }
  for (const c of S.clips) {
    const a = vis(t, c.t0, c.t1, 0.25, 0.25); if (!a) continue; const im = FRAMES[frameKey(c, clamp(t, c.t0, c.t1))]; if (!im) continue;
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(im, 0, 0, W, H); if (c.dark) { ctx.fillStyle = `rgba(6,18,47,${c.dark})`; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(OVER, 0, 0); ctx.restore();
    caption(c.cap, c.sub, a * clamp((t - c.t0 - 0.35) / 0.35), c.side);
  }
}
// ----- linha do tempo 1540–2015 (com zoom a partir de 1890) -----
const TLX = y => y <= 1890 ? 150 + (y - 1540) / 350 * 610 : 760 + (y - 1890) / 125 * 1030;
const TL_EV = [ // ano, rótulo curto, frase do cartão, imagem, nível (A/B acima, C/D abaixo)
  [1543, 'Felipinas', 'Uma expedição espanhola batiza as ilhas', 'r_filipe2', 'C'],
  [1565, 'Cebu', 'Frades agostinianos abrem uma escola em Cebu', 'f_cebu', 'A'],
  [1635, 'Zamboanga', 'Os espanhóis erguem um forte em Zamboanga', 'f_pilar_antigo', 'B'],
  [1849, 'Sobrenomes', 'Clavería manda distribuir sobrenomes', 'd_catalogo', 'D'],
  [1863, 'Escolas', 'Lei: escola de espanhol em cada cidade', 'f_sanagustin', 'C'],
  [1887, 'Noli', 'Rizal publica Noli Me Tángere, em espanhol', 'd_noli', 'A'],
  [1898, 'EUA', 'A Espanha entrega as Filipinas aos EUA', 'p_manilabay', 'B'],
  [1901, 'Thomas', 'Chegam os professores do navio Thomas', 'f_thomas', 'D'],
  [1918, 'Censo', 'Censo: o inglês já passa o espanhol', null, 'C'],
  [1935, 'Língua nacional', 'A Constituição pede uma língua nacional', 'r_quezon', 'A'],
  [1987, 'Constituição', 'Filipino e inglês: as línguas oficiais', null, 'B'],
  [2013, 'Língua de casa', 'As crianças aprendem na língua de casa', null, 'C']
];
const TL_BANDS = [[1565, 1898, 'Espanha', C.urucum], [1898, 1946, 'EUA', C.turq], [1946, 2015, 'Filipinas independentes', '#3B82C4']];
function drawTL(t, S) {
  for (const l of S.tl) {
    const a = vis(t, l.t0, l.t1, 0.3, 0.3); if (!a) continue;
    const from = l.from ?? 1540, p = (l.intro ? ease : easeOut)(clamp((t - l.t0 - (l.intro ? 2.1 : 0.2)) / (l.intro ? 2.6 : 1.4))), cur = lerp(from, l.y, p);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = C.areia; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.tinta; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = '700 26px Figtree'; ctx.letterSpacing = '6px';
    ctx.fillText('LINHA DO TEMPO', 150, 110); ctx.letterSpacing = '2px'; ctx.font = '700 22px Figtree'; ctx.fillStyle = '#6b5a3a'; ctx.fillText('QUEM MANDA NAS ILHAS', 150, 178);
    ctx.fillText('LÍNGUA DO POVO', 150, 786); ctx.letterSpacing = '0px';
    const xc = TLX(cur);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xc, H); ctx.clip();
    ctx.fillStyle = 'rgba(107,90,58,0.25)'; rr(TLX(1540), 192, TLX(1565) - TLX(1540) - 3, 64, 8); ctx.fill();
    for (const [y0, y1, txt, col] of TL_BANDS) {
      const x0 = TLX(y0), x1 = Math.min(TLX(y1), 1790); ctx.fillStyle = col; rr(x0, 192, x1 - x0 - 3, 64, 8); ctx.fill();
      ctx.fillStyle = C.branco; ctx.font = '800 26px "Bricolage Grotesque"'; const tw = ctx.measureText(txt).width;
      if (tw < x1 - x0 - 24) { ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(6,18,47,0.35)'; ctx.strokeText(txt, x0 + 14, 234); ctx.fillText(txt, x0 + 14, 234); }
    }
    // a língua do povo nunca mudou: tagálog, sebuano e mais de 130 línguas o tempo todo
    ctx.fillStyle = C.lilas; rr(TLX(1540), 800, 1790 - TLX(1540), 64, 8); ctx.fill();
    ctx.fillStyle = C.tinta; ctx.font = '800 26px "Bricolage Grotesque"'; ctx.letterSpacing = '5px';
    for (let x = TLX(1540) + 24; x < 1700; x += 560) ctx.fillText('TAGÁLOG · SEBUANO · +130 LÍNGUAS', x, 842);
    ctx.letterSpacing = '0px'; ctx.restore();
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, 540); ctx.lineTo(1790, 540); ctx.stroke();
    ctx.fillStyle = C.areia; ctx.fillRect(TLX(1890) - 9, 526, 18, 28); ctx.strokeRect(TLX(1890) - 9, 526, 18, 28);
    ctx.fillStyle = '#6b5a3a'; ctx.font = '700 18px Figtree'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillText('ZOOM', TLX(1890), 588); ctx.letterSpacing = '0px';
    const LV = { A: [440, 472], B: [352, 384], C: [628, 660], D: [708, 740] };
    let newest = null;
    for (const ev of TL_EV) {
      const [yr, lab, , , lv] = ev, x = TLX(yr), on = cur >= yr - 0.01, [yy, ly] = LV[lv], up = lv === 'A' || lv === 'B';
      ctx.globalAlpha = a * (on ? 1 : 0.35);
      ctx.strokeStyle = 'rgba(6,18,47,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, up ? ly + 14 : yy - 34); ctx.lineTo(x, 540); ctx.stroke();
      const isNew = on && yr === l.y; if (on) newest = ev;
      ctx.fillStyle = on ? C.ipe : C.areia; ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, 540, 12 * (isNew ? 1.3 : 1), 0, 7); ctx.fill(); ctx.stroke();
      const anc = yr === 1543 ? 'left' : yr === 2013 ? 'right' : 'center', lx = yr === 1543 ? x - 12 : yr === 2013 ? x + 12 : x;
      ctx.textAlign = anc; ctx.fillStyle = C.tinta; ctx.font = '800 38px "Bricolage Grotesque"'; ctx.fillText(String(yr), lx, yy);
      ctx.font = '600 25px Figtree'; ctx.fillStyle = '#3a3324'; ctx.fillText(lab, lx, ly);
    }
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(xc, 180); ctx.lineTo(xc, 876); ctx.stroke(); ctx.setLineDash([]);
    if (newest && cur >= l.y - 0.01 && !l.intro) {
      const ca = clamp((t - l.t0 - 0.2 - 1.3) / 0.4), [yr, , txt, img] = newest;
      ctx.globalAlpha = a * ca; const y0 = 900 + (1 - easeOut(ca)) * 30;
      ctx.fillStyle = C.tinta; rr(150, y0, 1640, 132, 18); ctx.fill();
      let tx = 190; const im = img && IMG[img];
      if (im) { ctx.save(); rr(162, y0 + 12, 190, 108, 10); ctx.clip(); const k = Math.max(190 / im.width, 108 / im.height); ctx.drawImage(im, 257 - im.width * k / 2, y0 + 66 - im.height * k / 2, im.width * k, im.height * k); ctx.restore(); tx = 384; }
      ctx.textAlign = 'left'; ctx.fillStyle = C.ipe; ctx.font = '800 72px "Bricolage Grotesque"'; ctx.fillText(String(yr), tx, y0 + 92);
      ctx.fillStyle = C.branco; fit(txt, 1790 - tx - 240 - 40, '700 {}px Figtree', 44, 24); ctx.fillText(txt, tx + 240, y0 + 82);
    }
    ctx.restore();
    if (l.intro) { // abertura: contador rebobinando de 2026 até 1543, depois a linha entra por uma cortina
      const q = clamp((t - l.t0) / 1.7), cover = 1 - easeOut(clamp((t - l.t0 - 1.7) / 0.45));
      if (cover > 0) {
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.tinta; ctx.fillRect(0, 0, W * cover, H);
        ctx.beginPath(); ctx.rect(0, 0, W * cover, H); ctx.clip();
        const yv = Math.round(lerp(2026, 1543, ease(q)));
        for (let k = 1; k <= 3; k++) { ctx.globalAlpha = a * (0.12 / k) * (q < 1 ? 1 : 0); ctx.fillStyle = C.ipe; ctx.font = '800 300px "Bricolage Grotesque"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(yv + k * 9), W / 2, H / 2 - k * 46); }
        ctx.globalAlpha = a; ctx.fillStyle = C.ipe; ctx.font = '800 300px "Bricolage Grotesque"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(yv), W / 2, H / 2);
        ctx.fillStyle = C.branco; ctx.font = '700 30px Figtree'; ctx.letterSpacing = '10px'; ctx.fillText('VOLTANDO NO TEMPO', W / 2, H / 2 + 200); ctx.letterSpacing = '0px';
        ctx.restore();
      }
    }
  }
}
// contador no canto de baixo: 3 marcas da Espanha, depois 6 razões
function drawRazao(t, S) {
  const R = S.razoes; let cur = null; for (const r of R) if (r.t <= t) cur = r; if (!cur || cur.hide) return;
  const a = clamp((t - cur.t) / 0.4) * (1 - fullAlpha(t, S));
  if (a <= 0) return;
  const tot = cur.tot, x = 70, y = H - 128, w = 210 + tot * 18, h = 62;
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = C.tinta; rr(x, y, w, h, 31); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.ipe; ctx.font = '800 26px "Bricolage Grotesque"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${cur.word} ${cur.n}/${tot}`, x + 26, y + h / 2 + 1);
  for (let i = 0; i < tot; i++) { ctx.beginPath(); ctx.arc(x + 186 + i * 18, y + h / 2, 6, 0, 7); ctx.fillStyle = i < cur.n ? C.ipe : 'rgba(255,255,255,0.25)'; ctx.fill(); }
  ctx.restore(); BOXES.push(Object.assign([x, y, x + w, y + h], { k: 'capítulo' }));
}
const _render = render;
render = function (t) {
  const S = SCENE, fa = fullAlpha(t, S);
  if (fa < 1) _render(t); else { BOXES = []; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H); mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.fillStyle = C.tinta; mctx.fillRect(0, 0, MW, MH); }
  drawRazao(t, S);
  if (fa > 0) { drawFulls(t, S); drawTL(t, S); drawPills(t, S); drawQuotes(t, S); drawTitle(t, S); drawEnd(t, S); }
};
// partes das Filipinas (ilhas) a partir do contorno do país: Luzon, Visayas, Mindanao, Cebu
function addParts() {
  for (const lod of ['fine', 'coarse']) {
    const rings = GEO[lod].countries.Philippines.map(r => {
      let x = 0, y = 0, A = 0; for (let i = 0; i < r.length; i += 2) { x += r[i]; y += r[i + 1]; const j = (i + 2) % r.length; A += r[i] * r[j + 1] - r[j] * r[i + 1]; }
      const n = r.length / 2; return { r, cx: x / n, cy: y / n, A: Math.abs(A / 2) };
    });
    const big = f => { const c = rings.filter(f).sort((a, b) => b.A - a.A); return c.length ? [c[0].r] : []; };
    const all = f => rings.filter(f).map(o => o.r);
    const parts = {
      Luzon: big(o => o.cy > 12.8 && o.cx < 124.6 && o.cx > 119.5),
      Mindanao: big(o => o.cy < 9.9 && o.cx > 121.8),
      Visayas: all(o => o.cy > 9.0 && o.cy < 12.8 && o.cx > 121.7 && o.A > 0.02),
      Cebu: big(o => o.cx > 123.3 && o.cx < 124.1 && o.cy > 9.4 && o.cy < 11.4 && o.A > 0.05)
    };
    for (const [n, rs] of Object.entries(parts)) if (rs.length) LODS[lod].land.push({ name: n, kind: 'state', ...mkPath(rs) });
  }
  LAND = LODS.fine.land;
}

function buildScene() {
  addParts();
  const S = { highlights: [], blobs: [], swarms: [], labels: [], icons: [], iconSwarms: [], pins: [], years: [], chapters: [], pills: [], numbers: [], words: [], people: [], dots: [], rows: [], lists: [], quotes: [], titles: [], ends: [], photos: [],
    fulls: [], clips: [], tl: [], razoes: [] };
  const cam = (t, place, span, d = 1.4) => (span = Math.max(span, 0.5), CAM.push(Array.isArray(place) ? { t, lon: place[0], lat: place[1], span, d } : { t, ...place, span, d }));
  const pin = (t, place, label, o = {}) => S.pins.push({ t, lon: place[0], lat: place[1], label, ...o });
  const unpin = t => S.pins.push({ t, hide: true });
  const year = (t, y, from) => S.years.push({ t, y, from });
  const noYear = t => S.years.push({ t, hide: true });
  const marca = (t, num, title) => (S.chapters.push({ t0: t, num, title }), S.razoes.push({ t, n: +num, tot: 3, word: 'MARCA' }));
  const chap = (t, num, title) => (S.chapters.push({ t0: t, num, title }), S.razoes.push({ t, n: +num, tot: 6, word: 'RAZÃO' }));
  const pill = (t0, t1, text, color) => S.pills.push({ t0, t1, text, color });
  const num = (t0, t1, value, label, o = {}) => S.numbers.push({ t0, t1, value, label, ...o });
  const hl = (t0, t1, name, color, o = {}) => S.highlights.push({ t0, t1, name, color, ...o });
  const blob = (t0, t1, place, r, color, o = {}) => S.blobs.push({ t0, t1, lon: place[0], lat: place[1], r, color, ...o });
  const icon = (t0, t1, img, place, o = {}) => S.icons.push({ t0, t1, img, lon: place[0], lat: place[1], ...o });
  const label = (t0, t1, place, text, o = {}) => S.labels.push({ t0, t1, lon: place[0], lat: place[1], text, ...o });
  const route = (id, t0, t1, pts, o = {}) => ROUTES[id] = buildRoute({ t0, t1, pts, hide: t1 + 5, ...o });
  const person = (t0, t1, name, role, o = {}) => S.people.push({ t0, t1, name, role, ...o });
  const word = (t0, t1, lang, wordTxt, o = {}) => S.words.push({ t0, t1, lang, word: wordTxt, ...o });
  const row = (t0, t1, items, o = {}) => S.rows.push({ t0, t1, items, ...o });
  const list = (t0, t1, title, items, o = {}) => S.lists.push({ t0, t1, title, items, ...o });
  const photo = (t0, t1, img, cap, o = {}) => S.photos.push({ t0, t1, img, caption: cap, ...o });
  const quote = (t0, t1, text, o = {}) => S.quotes.push({ t0, t1, text, ...o });
  const dots = (t0, t1, title, colored, color, legend, o = {}) => S.dots.push({ t0, t1, title, total: 100, colored, color, legend, cols: 10, cell: 44, ...o });
  const swarm = (t0, t1, place, r, n, color, dur, seed, o = {}) => S.swarms.push({ t0, t1, lon: place[0], lat: place[1], r, n: Math.ceil(n * 0.45), color, dur, seed, people: true, ...o });
  const full = (t0, t1, img, cap, o = {}) => S.fulls.push({ t0, t1, img, cap, ...o });
  const clip = (t0, t1, id, o = {}) => S.clips.push({ t0, t1, id: id + '_' + S.clips.length, src: id, ...o });
  const tl = (t0, t1, y, o = {}) => S.tl.push({ t0, t1, y, ...o });
  const A = at;
  // cores: espanhol vermelho-urucum, inglês turquesa, Filipinas amarelo-ipê, línguas filipinas em tons próprios
  const ES = C.urucum, EN = C.turq, PH = C.ipe, US = '#3B82C4', TG = C.lilas, CB = C.caju, CH = C.acai, GR = C.verde;

  // ===== GANCHO =====
  cam(0, [122, 12.5], 22, 0.1); cam(0.1, [122, 12.2], 18, 3.2);
  hl(0.2, A('e ficaram mais') - 0.1, 'Philippines', PH, { solid: true });
  label(0.6, A('e ficaram mais') - 0.1, [121.2, 12.6], 'Filipinas', { size: 40 });
  full(A('em homenagem a um rei'), A('e ficaram mais') + 0.4, 'r_filipe2', 'Filipe II da Espanha', { sub: 'o rei que deu nome às ilhas · Sofonisba Anguissola', kb: [0.5, 0.25, 1.05, 0.5, 0.25, 1.2] });
  const tTrez = A('e ficaram mais') + 0.4;
  cam(tTrez, [58, 18], 175, 1.6);
  hl(tTrez + 0.2, A('mesmo assim hoje') - 0.1, 'Spain', ES, { solid: true }); hl(tTrez + 0.3, A('mesmo assim hoje') - 0.1, 'Philippines', ES, { solid: true });
  route('esp', tTrez + 0.3, tTrez + 2.6, [P.madrid, [-15, 20], [15, -37], [70, -15], [108, -2], P.manila], { color: ES, icon: 'navio', hide: tTrez + 3.6 });
  num(A('mais de trezentos anos') - 0.2, A('mesmo assim hoje') - 0.1, 300, 'anos sob a Espanha', { prefix: '+', color: ES, y: 120 });
  clip(A('mesmo assim hoje'), A('nas escolas nos tribunais') - 0.05, 'manilaNoite', { cap: 'Manila, hoje', sub: 'quase ninguém fala espanhol' });
  const tEsc = A('nas escolas nos tribunais');
  cam(tEsc - 0.2, [121.0, 14.6], 2.4, 0.1); cam(tEsc, [121.0, 14.6], 1.8, 3.5);
  pin(tEsc, P.manila, 'Manila');
  row(tEsc, A('a lingua de um pais') - 0.1, [
    { img: 'escola', label: 'Escolas', at: tEsc + 0.1 }, { img: 'lei', label: 'Tribunais', at: A('nos tribunais') }, { img: 'placa', label: 'Placas de rua', at: A('e nos letreiros') }], { y: 600 });
  word(A('o que voce ve e ingles'), A('a lingua de um pais') + 0.6, 'O QUE VOCÊ LÊ', 'English', { icon: 'mensagem' });
  const tPais = A('a lingua de um pais'); unpin(tPais + 0.6);
  cam(tPais + 0.6, [-98, 38], 62, 1.8);
  hl(tPais + 0.8, A('calma') - 0.1, 'United States of America', US, { solid: true });
  year(A('so chegou la em') + 0.3, 1898, 1850);
  pill(A('calma'), A('como e que mais de tres') - 0.1, 'Calma. Isso não faz sentido.');
  noYear(A('como e que mais de tres'));
  const tComo = A('como e que mais de tres');
  cam(tComo, [122, 12.2], 16, 1.8);
  hl(tComo + 0.2, A('e a resposta nao e') - 0.1, 'Philippines', ES, { solid: true });
  num(tComo + 0.2, A('perderam para algumas') - 0.1, 333, 'anos de Espanha', { color: ES, x: 560 });
  num(A('perderam para algumas'), A('e a resposta nao e') - 0.1, 0, 'décadas de escola americana', { raw: 'algumas', color: EN, x: 1360 });
  const tResp = A('e a resposta nao e');
  pill(tResp, A('nao foi so forca') - 0.1, 'A resposta não é a que você está pensando');
  row(A('nao foi so forca'), A('neste video eu vou') - 0.1, [
    { img: 'espada', label: 'Só força', at: A('nao foi so forca'), cross: A('nao foi so forca') + 0.8 },
    { img: 'escola', label: 'Só escola', at: A('e tambem nao foi so escola'), cross: A('e tambem nao foi so escola') + 0.9 }]);
  full(A('um navio lotado de professores'), A('e um sobrenome que engana') - 0.05, 'f_thomas', 'Um navio lotado de professores', { sub: 'o transporte Thomas, em São Francisco · U.S. Army Signal Corps', kb: [0.5, 0.5, 1.04, 0.55, 0.5, 1.15] });
  full(A('e um sobrenome que engana'), A('e uma cidade onde o espanhol') - 0.05, 'd_catalogo', 'Um sobrenome que engana', { fit: true });
  full(A('e uma cidade onde o espanhol'), A('mas antes uma pergunta') - 0.05, 'f_pilar', 'Uma cidade onde o espanhol virou outra língua', { sub: 'Forte Pilar, Zamboanga · foto de Dennison Uy (CC BY-SA 3.0)', kb: [0.5, 0.5, 1.04, 0.5, 0.45, 1.16] });
  const tPerg = A('mas antes uma pergunta');
  cam(tPerg, [20, 20], 280, 2.2);
  pill(tPerg + 0.2, A('quem governa uma terra') - 0.1, 'Uma pergunta que vale para o mundo inteiro');
  quote(A('quem governa uma terra'), A('guarda essa pergunta') - 0.1, 'Quem governa uma terra\nescolhe a língua do povo?', { icon: 'idiomas' });
  S.titles.push({ t0: A('guarda essa pergunta'), t1: A('primeiro o que a espanha') - 0.15, text: 'Por que as Filipinas\nnão falam espanhol?' });
  const tPrim = A('primeiro o que a espanha');
  tl(tPrim, A('a primeira marca') - 0.05, 2013, { intro: true, from: 1540 });

  // ===== MARCA 1: O NOME =====
  const tM1 = A('a primeira marca');
  marca(tM1, '1', 'O nome');
  cam(tM1 - 0.2, [122, 12.3], 17, 0.1); cam(tM1, [122.2, 12], 15, 2.5);
  hl(tM1 + 0.2, A('em mil quinhentos e quarenta e tres') - 0.1, 'Philippines', PH, { solid: true });
  label(tM1 + 0.5, A('em mil quinhentos e quarenta e tres') - 0.1, [121.2, 12.6], 'Filipinas', { size: 36 });
  const t1543 = A('em mil quinhentos e quarenta e tres');
  tl(t1543, t1543 + 2.4, 1543, { from: 1540 });
  const tExp = t1543 + 2.4;
  cam(tExp, [128, 12], 30, 0.2); cam(tExp + 0.2, [126, 11], 22, 3);
  route('vila', tExp + 0.2, tExp + 4.2, [[150, 14], [135, 10], [127, 9.5], [125.4, 10.8], P.visayasC], { icon: 'navio', color: ES, hide: tExp + 6 });
  person(A('ela era comandada por'), A('dizem que foi ele') + 0.3, 'Ruy López de Villalobos', 'Comandante espanhol', { icon: 'navio', side: 'right' });
  full(A('dizem que foi ele') + 0.3, A('era uma homenagem ao principe') - 0.05, 'm_murillo', 'O arquipélago no mapa espanhol de 1734', { sub: 'Pedro Murillo Velarde · cópia exposta em Intramuros', kb: [0.5, 0.5, 1.03, 0.5, 0.5, 1.14] });
  const tHom = A('era uma homenagem ao principe');
  cam(tHom, [122, 12.2], 15, 1.6);
  word(tHom, A('no comeco o nome') - 0.1, 'FELIPINAS', 'de Felipe', { meaning: 'o príncipe que virou o rei Filipe II', icon: 'coroa' });
  const tCom = A('no comeco o nome');
  cam(tCom, P.visayasC, 7, 2);
  hl(tCom + 0.1, A('com o tempo a espanha') - 0.1, 'Visayas', PH);
  label(tCom + 0.4, A('com o tempo a espanha') - 0.1, [123.3, 11.6], 'só as ilhas do meio', { size: 26 });
  const tTempo = A('com o tempo a espanha');
  cam(tTempo, [122, 12.2], 16, 2.4);
  hl(tTempo, A('a segunda marca') + 0.3, 'Visayas', PH);
  hl(tTempo + 0.6, A('a segunda marca') + 0.3, 'Luzon', ES); hl(tTempo + 1.1, A('a segunda marca') + 0.3, 'Mindanao', CB);
  hl(A('e o nome foi junto'), A('a segunda marca') + 0.3, 'Philippines', PH, { solid: true, alpha: 0.7 });

  // ===== MARCA 2: O SOBRENOME =====
  const tM2 = A('a segunda marca');
  marca(tM2, '2', 'O sobrenome');
  cam(tM2, P.manila, 2.2, 2); pin(tM2 + 0.3, P.manila, 'Manila');
  list(A('santos cruz bautista') - 0.2, A('sera que todos eles') - 0.1, 'Sobrenomes comuns', [
    { name: 'Santos', sub: '', color: ES, at: A('santos cruz bautista') - 0.1 }, { name: 'Cruz', sub: '', color: PH, at: A('cruz bautista') },
    { name: 'Bautista', sub: '', color: EN, at: A('bautista del rosario') }, { name: 'Del Rosario', sub: '', color: TG, at: A('del rosario') }]);
  pill(A('sera que todos eles'), A('no dia vinte e um de novembro') - 0.1, 'Todos eles têm sangue espanhol? Não.');
  const t1849 = A('no dia vinte e um de novembro');
  tl(t1849, t1849 + 2.4, 1849, { from: 1543 });
  full(t1849 + 2.4, A('era uma bagunca') - 0.05, 'r_claveria', 'Narciso Clavería', { sub: 'governador das Filipinas · Museo del Prado', kb: [0.5, 0.25, 1.04, 0.5, 0.25, 1.18] });
  const tBag = A('era uma bagunca');
  cam(tBag, P.manila, 1.6, 2.4); year(tBag, 1849);
  pill(tBag + 0.1, A('gente da mesma familia') - 0.1, 'Era uma bagunça');
  row(A('gente da mesma familia'), A('entao o governo fez') - 0.1, [
    { img: 'grupo', label: 'Mesma família', at: A('gente da mesma familia') }, { img: 'documento', label: 'Censo', at: A('atrapalhava o censo') },
    { img: 'moeda', label: 'Imposto', at: A('e a cobranca de imposto') }]);
  full(A('entao o governo fez'), A('cada familia recebia') - 0.05, 'd_catalogo', 'Catálogo Alfabético de Sobrenomes, 1849', { fit: true });
  const tCada = A('cada familia recebia');
  cam(tCada, [121.3, 15.0], 4.5, 2.5); noYear(tCada);
  unpin(tCada);
  [[120.98, 14.6, 'Manila'], [120.6, 15.15, 'Pampanga'], [121.3, 14.1, 'Laguna'], [120.95, 15.6, 'Nueva Ecija']].forEach(([lo, la, n], i) =>
    icon(tCada + 0.3 + i * 0.35, A('ou seja muitas vezes') - 0.1, 'livro', [lo, la], { size: 70 }));
  pill(A('e cada sobrenome so podia'), A('ou seja muitas vezes') - 0.1, 'Um sobrenome por família em cada cidade');
  word(A('ou seja muitas vezes'), A('ele e uma marca da espanha') - 0.1, 'O SOBRENOME VEIO DE', 'um livro', { meaning: 'e não de um avô de Madri', icon: 'livro' });
  cam(A('ou seja muitas vezes'), P.manila, 2.4, 2.4);
  pill(A('ele e uma marca da espanha'), A('a terceira marca') - 0.1, 'Marca da Espanha, sim. Prova de que falava espanhol, não.');

  // ===== MARCA 3: A PALAVRA =====
  const tM3 = A('a terceira marca');
  marca(tM3, '3', 'A palavra');
  cam(tM3, [121.2, 14.6], 5, 2);
  blob(tM3 + 0.3, A('ouve so') + 0.5, P.tagalog, 1.0, TG, { r1: 1.3 });
  num(A('estudos dizem que umas'), A('o tagalog e a lingua') - 0.1, 20, 'de cada 100 palavras do tagálog vêm do espanhol', { color: ES });
  label(A('o tagalog e a lingua'), A('ouve so') + 0.5, [121.6, 14.0], 'Tagálog', { size: 30 });
  pill(A('o tagalog e a lingua') + 0.2, A('ouve so') - 0.1, 'A língua materna mais falada do país', TG);
  const tOuve = A('ouve so');
  const pares = [['janela em espanhol', 'JANELA', 'ventana → bintana'], ['cadeira em espanhol', 'CADEIRA', 'silla → silya'], ['colher em espanhol', 'COLHER', 'cuchara → kutsara'],
    ['queijo em espanhol', 'QUEIJO', 'queso → keso'], ['e o nosso como vai voce', 'COMO VAI VOCÊ?', '¿cómo está? → kumusta']];
  pares.forEach(([ph, pt, w], i) => word(A(ph), i < 4 ? A(pares[i + 1][0]) - 0.1 : A('entao ficou claro') - 0.1, pt, w, { langColor: i % 2 ? ES : TG, x: 1180, y: 280 }));
  cam(tOuve, [121.1, 14.65], 1.4, 3); pin(tOuve + 0.2, P.manila, 'Manila');
  const tClaro = A('entao ficou claro'); unpin(tClaro);
  row(tClaro, A('mas repara numa coisa') - 0.1, [
    { img: 'mensagem', label: 'O nome', at: A('deixou marca no nome') }, { img: 'documento', label: 'O sobrenome', at: A('no sobrenome') },
    { img: 'idiomas', label: 'As palavras', at: A('e nas palavras') }]);
  cam(tClaro, [122, 12.2], 15, 2);
  hl(tClaro, A('e e ai que a historia') - 0.1, 'Philippines', TG, { solid: true });
  pill(A('uma palavra emprestada'), A('o povo inteiro falar') - 0.1, 'Palavra emprestada é uma coisa…');
  pill(A('o povo inteiro falar'), A('e e ai que a historia') - 0.1, '…o povo inteiro falar a língua é outra', ES);
  clip(A('e e ai que a historia'), A('a primeira razao') - 0.05, 'binondo', { cap: 'E é aí que a história fica estranha', dark: 0.1 });

  // ===== RAZÃO 1: MUITAS LÍNGUAS =====
  const tR1 = A('a primeira razao');
  chap(tR1, '1', 'Muitas ilhas, muitas línguas');
  cam(tR1, [122, 12.2], 17, 2);
  hl(tR1, A('sao mais de sete mil') - 0.1, 'Philippines', PH, { solid: true, alpha: 0.6 });
  clip(A('sao mais de sete mil'), A('e dependendo de como') - 0.05, 'ilhas', { cap: 'Mais de 7 mil ilhas' });
  const tDep = A('e dependendo de como');
  cam(tDep, [122, 12], 16, 3);
  const LANGS = [[P.tagalog, TG], [P.sebuano, CB], [P.ilocano, GR], [P.bicol, C.jambo], [[122.4, 11.0], C.turq], [[124.9, 11.3], '#3B82C4'], [[122.5, 10.3], C.acai],
    [P.palawan, '#7AA52A'], [[124.6, 7.2], C.urucum], [[125.6, 7.1], C.lilas], [[121.0, 17.8], C.caju], [[121.9, 6.9], C.acai], [[120.7, 16.4], '#3B82C4'], [[123.1, 7.9], C.jambo], [[121.0, 12.8], C.verde]];
  LANGS.forEach(([p, c], i) => blob(tDep + 0.2 + i * 0.18, A('agora pensa no tamanho') - 0.1, p, i < 2 ? 0.9 : 0.55, c));
  num(A('mais de cento e trinta'), A('nao sao sotaques') - 0.1, 130, 'línguas', { prefix: '+', color: TG, x: 1500, y: 140 });
  pill(A('nao sao sotaques'), A('hoje as maiores') - 0.1, 'Não são sotaques: são línguas diferentes');
  const tMai = A('hoje as maiores');
  label(tMai + 0.2, A('agora pensa no tamanho') - 0.1, [121.5, 15.2], 'Tagálog', { size: 30 });
  num(tMai + 0.2, A('e o sebuano') - 0.1, 0, 'falantes de tagálog', { raw: '+40 milhões', color: TG, x: 1500, y: 140 });
  label(A('e o sebuano'), A('agora pensa no tamanho') - 0.1, [124.3, 9.4], 'Sebuano', { size: 30 });
  num(A('e o sebuano'), A('agora pensa no tamanho') - 0.1, 0, 'falantes de sebuano', { raw: '+25 milhões', color: CB, x: 1500, y: 140 });
  const tPensa = A('agora pensa no tamanho');
  cam(tPensa, [123.5, 10.6], 6, 2.5);
  icon(A('vila por vila'), A('guarda essa dificuldade') + 1, 'escola', [122.9, 10.5], { size: 70 });
  icon(A('ilha por ilha'), A('guarda essa dificuldade') + 1, 'escola', [123.9, 10.4], { size: 70 });
  icon(A('ilha por ilha') + 0.4, A('guarda essa dificuldade') + 1, 'escola', [124.9, 11.3], { size: 70 });
  row(A('isso da trabalho'), A('guarda essa dificuldade') - 0.1, [{ img: 'grupo', label: 'Trabalho', at: A('isso da trabalho') }, { img: 'moeda', label: 'Custa caro', at: A('e custa caro') }]);
  pill(A('guarda essa dificuldade'), A('a segunda razao') - 0.1, 'Guarda essa dificuldade: ela volta com os americanos');

  // ===== RAZÃO 2: OS FRADES =====
  const tR2 = A('a segunda razao');
  chap(tR2, '2', 'Os frades');
  full(A('quem chegou primeiro foram'), A('e eles aprendiam') - 0.05, 'f_sanagustin', 'Igreja de San Agustín, Manila', { sub: 'dos frades agostinianos · foto de alfonsoereve (CC BY 3.0)', kb: [0.5, 0.5, 1.03, 0.5, 0.4, 1.15] });
  word(A('e eles aprendiam'), A('em mil quinhentos e sessenta e cinco') - 0.1, 'OS FRADES APRENDIAM', 'a língua do povo', { icon: 'igreja' });
  cam(A('e eles aprendiam'), [122.5, 11.5], 9, 2);
  const t1565 = A('em mil quinhentos e sessenta e cinco');
  tl(t1565, t1565 + 2.3, 1565, { from: 1543 });
  cam(t1565 + 2.2, P.cebu, 1.8, 0.3); cam(t1565 + 2.5, P.cebu, 1.4, 3);
  pin(t1565 + 2.4, P.cebu, 'Cebu'); year(t1565 + 2.4, 1565);
  icon(A('eles queriam ensinar'), A('a terceira razao') - 0.1, 'igreja', P.cebu, { dx: -110, dy: -40 });
  full(A('e para isso primeiro'), A('a terceira razao') - 0.05, 'd_doctrina', 'Doctrina Christiana, 1593', { sub: 'um dos primeiros livros impressos nas ilhas: em espanhol e em tagálog', fit: true });

  // ===== RAZÃO 3: A ESCOLA CHEGOU TARDE =====
  const tR3 = A('a terceira razao'); unpin(tR3); noYear(tR3);
  chap(tR3, '3', 'A escola chegou tarde');
  cam(tR3, [121.5, 14.8], 6, 2);
  const t1863 = A('so em mil oitocentos e sessenta e tres');
  tl(t1863, t1863 + 2.4, 1863, { from: 1565 });
  cam(t1863 + 2.4, [121.4, 15], 5, 2.5); year(t1863 + 2.4, 1863);
  icon(A('para meninos'), A('isso foi quase trezentos') - 0.1, 'escola', [120.8, 15.3], { size: 80 });
  icon(A('e outra para meninas'), A('isso foi quase trezentos') - 0.1, 'escola', [121.4, 14.4], { size: 80 });
  num(A('isso foi quase trezentos'), A('e mesmo depois da lei') - 0.1, 300, 'anos depois da chegada dos espanhóis', { prefix: '~', color: ES });
  const t1892 = A('em mil oitocentos e noventa e dois');
  cam(t1892, [122, 12.2], 16, 2); year(t1892, 1892, 1863);
  num(t1892, A('em mil oitocentos e noventa e oito os alunos') - 0.1, 2000, 'escolas', { prefix: '+', color: ES });
  swarm(t1892 + 0.4, A('e alguns padres') - 0.1, P.luzonC, 1.6, 22, ES, 2, 5);
  year(A('em mil oitocentos e noventa e oito os alunos'), 1898, 1892);
  num(A('em mil oitocentos e noventa e oito os alunos'), A('e gente de verdade') + 0.8, 0, 'alunos', { raw: '+200 mil', color: ES });
  pill(A('mas para um pais de milhoes'), A('e alguns padres') - 0.1, 'Para um país de milhões, era pouco');
  pill(A('e alguns padres'), A('o resultado foi esse') - 0.1, 'Alguns padres nem queriam ensinar todo mundo');
  noYear(A('o resultado foi esse'));
  row(A('o espanhol virou a lingua do governo') - 0.3, A('quem aprendia bem') - 0.1, [
    { img: 'governo', label: 'Governo', at: A('a lingua do governo') }, { img: 'igreja', label: 'Igreja', at: A('da igreja') }, { img: 'documento', label: 'Papéis', at: A('e dos papeis') }]);
  cam(A('o resultado foi esse'), P.manila, 2.2, 2); pin(A('quem aprendia bem') + 0.5, P.manila, 'Manila');
  word(A('esse grupo ganhou'), A('um deles foi jose') - 0.1, 'OS', 'ilustrados', { meaning: 'os filipinos com mais estudo', icon: 'formatura', langColor: ES, x: 1180 });
  person(A('um deles foi jose'), A('ele escreveu em espanhol') + 0.4, 'José Rizal', 'Herói nacional', { img: 'r_rizal', years: '1861–1896', side: 'right', zoom: 1.6, top: 0.02 });
  const t1887 = A('ele escreveu em espanhol') + 0.4;
  tl(t1887, t1887 + 2.3, 1887, { from: 1863 });
  photo(t1887 + 2.3, A('agora eu quero a sua ajuda') - 0.1, 'd_noli', 'Noli Me Tángere, 1887', { sub: 'escrito em espanhol por Rizal', w: 380 });
  pill(A('ou seja ele usou'), A('agora eu quero a sua ajuda') - 0.1, 'A língua do dono da terra para falar da terra');

  // ===== QUIZ =====
  const tQuiz = A('agora eu quero a sua ajuda'); unpin(tQuiz);
  cam(tQuiz, [122, 12.2], 17, 2);
  hl(tQuiz, A('ja sao tres razoes') - 0.1, 'Philippines', PH, { solid: true });
  pill(A('pausa o video'), A('em mil novecentos e dezoito o governo') - 0.1, 'Pausa o vídeo e chuta!', PH);
  year(A('em mil novecentos e dezoito o governo'), 1918, 1898);
  dots(A('de cada cem filipinos'), A('a resposta vem daqui') - 0.1, 'Quantos em 100 falavam espanhol?', 0, ES, [[C.cinza, '?']]);
  pill(A('escreve o seu palpite'), A('ja sao tres razoes') - 0.1, 'Escreve o seu palpite nos comentários', PH);
  noYear(A('ja sao tres razoes'));
  list(A('ja sao tres razoes'), A('agora vamos para a virada') + 0.3, '3 razões até aqui', [
    { name: 'Muitas línguas', sub: '7 mil ilhas, +130 línguas', color: TG, at: A('ja sao tres razoes') + 0.2 },
    { name: 'Os frades', sub: 'aprendiam a língua do povo', color: CB, at: A('ja sao tres razoes') + 0.5 },
    { name: 'A escola chegou tarde', sub: 'só em 1863', color: ES, at: A('ja sao tres razoes') + 0.8 }]);

  // ===== A VIRADA: 1898 =====
  const tMaio = A('no dia primeiro de maio');
  tl(tMaio, tMaio + 2.3, 1898, { from: 1887 });
  full(tMaio + 2.3, A('no dia dez de dezembro') - 0.05, 'p_manilabay', 'Batalha da Baía de Manila, 1º de maio de 1898', { sub: 'James Gale Tyler', kb: [0.3, 0.5, 1.06, 0.7, 0.5, 1.18] });
  person(A('navios americanos derrotaram') + 0.4, A('no dia dez de dezembro') - 0.1, 'George Dewey', 'Comandante americano', { img: 'r_dewey', side: 'right', zoom: 1.5, top: 0.03 });
  const tDez = A('no dia dez de dezembro');
  cam(tDez, [-40, 40], 110, 2); year(tDez, 1898);
  pin(tDez + 0.4, P.paris, 'Paris', { city: true });
  hl(A('espanha e estados unidos'), A('a espanha entregou') + 1, 'Spain', ES, { solid: true }); hl(A('e estados unidos'), A('a espanha entregou') + 1, 'United States of America', US, { solid: true });
  full(A('a espanha entregou'), A('e os americanos pagaram') - 0.05, 'f_tratado', 'O Tratado de Paris', { sub: 'o embaixador Jules Cambon assina pela Espanha · Frances B. Johnston', kb: [0.5, 0.5, 1.03, 0.5, 0.45, 1.15] });
  num(A('e os americanos pagaram'), A('repara na cena') - 0.1, 20000000, 'de dólares', { prefix: 'US$ ', raw: '20 milhões', color: US });
  const tCena = A('repara na cena'); unpin(tCena);
  cam(tCena, [122, 12.2], 16, 2);
  hl(tCena, A('por isso houve guerra'), 'Philippines', PH, { solid: true });
  swarm(A('dois paises combinaram') + 0.3, A('por isso houve guerra'), P.luzonC, 1.3, 30, PH, 1.6, 3);
  pill(A('dois paises combinaram'), A('e os filipinos que ja lutavam') - 0.1, 'Dois países decidiram o futuro de milhões');
  person(A('e os filipinos que ja lutavam'), A('por isso houve guerra') - 0.1, 'Emilio Aguinaldo', 'Líder filipino', { img: 'r_aguinaldo', years: 'já lutava por um país próprio', zoom: 1.5, top: 0.04 });
  full(A('por isso houve guerra'), A('se o video esta te mostrando') - 0.05, 'f_tropas', 'Guerra Filipino-Americana, 1899', { sub: 'soldados filipinos', kb: [0.5, 0.5, 1.04, 0.5, 0.45, 1.16] });
  clip(A('se o video esta te mostrando'), A('agora a quarta razao') - 0.05, 'bandeira');
  pill(A('se o video esta te mostrando') + 0.3, A('agora a quarta razao') - 0.1, 'Gostando? Deixa o seu like', PH);

  // ===== RAZÃO 4: ESCOLA EM MASSA =====
  const tR4 = A('agora a quarta razao');
  chap(tR4, '4', 'Escola em massa');
  cam(tR4, [121.2, 15.2], 5, 2);
  hl(tR4, A('so que faltava professor') - 0.1, 'Luzon', EN);
  swarm(A('os primeiros professores de ingles'), A('em mil oitocentos e noventa e nove as aulas') - 0.1, [121.0, 15.3], 0.7, 16, US, 1.4, 8);
  year(A('em mil oitocentos e noventa e nove as aulas'), 1899, 1898);
  num(A('com vinte e quatro professores'), A('em janeiro de mil novecentos e um') - 0.1, 24, 'professores e uns 4.500 alunos', { color: EN });
  const t1901 = A('em janeiro de mil novecentos e um');
  year(t1901, 1901);
  clip(t1901 + 0.3, A('so que faltava professor') - 0.05, 'aula', { cap: 'Uma lei de 1901: escola pública no país inteiro', sub: 'e o inglês vira a língua das aulas', dark: 0.1 });
  pill(A('so que faltava professor'), A('e e aqui que entra o navio') - 0.1, 'Só que faltava professor. Faltava muito.');
  const tNav = A('e e aqui que entra o navio');
  tl(tNav, tNav + 2.3, 1901, { from: 1898 });
  full(tNav + 2.3, A('o navio tomas saiu') + 0.8, 'f_thomas', 'O navio Thomas', { sub: 'U.S. Army Signal Corps', kb: [0.4, 0.5, 1.05, 0.6, 0.5, 1.16] });
  const tSai = A('o navio tomas saiu') + 0.8;
  cam(tSai, P.sfP, 30, 0.3); cam(tSai + 0.3, { follow: 'thomas' }, 55, 1.2);
  label(tSai + 0.2, tSai + 2.5, [236, 41.5], 'São Francisco', { size: 26 });
  year(tSai, 1901);
  route('thomas', tSai + 0.4, A('chegou a manila') + 1.4, [P.sfP, [205, 28], [170, 20], [140, 15], P.manila], { icon: 'navio', color: EN });
  const tChe = A('chegou a manila') + 1.4;
  cam(tChe, P.manila, 3, 1.6); pin(tChe, P.manila, 'Manila');
  num(A('a bordo quase quinhentos'), A('eles ficaram conhecidos') - 0.1, 500, 'professores a bordo', { prefix: '~', color: EN });
  num(A('vindos de quarenta e tres estados'), A('eles ficaram conhecidos') - 0.1, 43, 'estados americanos', { color: US, x: 1500, y: 420 });
  word(A('eles ficaram conhecidos'), A('foram espalhados') - 0.1, 'OS', 'Thomasites', { meaning: 'por causa do nome do navio', icon: 'navio', langColor: EN });
  const tEsp = A('foram espalhados'); unpin(tEsp);
  cam(tEsp, [122.5, 11.8], 15, 2.4);
  S.iconSwarms.push({ t0: tEsp + 0.2, t1: A('agora a quinta razao') - 0.1, img: 'escola', lon: 122.6, lat: 11.5, r: 5.5, n: 30, size: 60, dur: 3, seed: 3 });
  num(A('ao todo mais de mil'), A('agora a quinta razao') - 0.1, 1000, 'professores americanos até 1902', { prefix: '+', color: EN });

  // ===== RAZÃO 5: PROFESSORES FILIPINOS =====
  const tR5 = A('agora a quinta razao');
  chap(tR5, '5', 'Professores filipinos'); noYear(tR5);
  cam(tR5, P.manila, 2.4, 2); pin(tR5 + 0.4, P.manila, 'Manila');
  icon(A('a mesma lei criou'), A('pensa comigo') + 1, 'formatura', P.manila, { dx: 110, dy: -50 });
  word(A('a mesma lei criou'), A('pensa comigo') - 0.1, 'ESCOLA NORMAL', 'formar professores', { meaning: 'professores filipinos, ensinando em inglês', icon: 'formatura', langColor: EN });
  const tPC = A('pensa comigo'); unpin(tPC);
  cam(tPC, [122.2, 12], 16, 2);
  swarm(A('mil americanos nunca') - 0.2, A('por isso o ingles passou') - 0.1, P.manila, 0.4, 14, US, 1, 2);
  hl(A('um pais de milhoes', A('mil americanos nunca')), A('e a sexta razao') - 0.1, 'Philippines', PH, { solid: true, alpha: 0.6 });
  swarm(A('por isso o ingles passou'), A('e a sexta razao') - 0.1, [122.4, 11.8], 5.5, 70, PH, 3, 9);
  clip(A('que levaram as aulas'), A('e a sexta razao') - 0.05, 'alunos', { cap: 'Professores filipinos', sub: 'levaram as aulas para onde o navio não chegava', dark: 0.1 });

  // ===== RAZÃO 6: OPORTUNIDADE =====
  const tR6 = A('e a sexta razao');
  chap(tR6, '6', 'Oportunidade');
  cam(tR6, P.manila, 2, 2); pin(tR6 + 0.3, P.manila, 'Manila');
  word(A('oportunidade'), A('aprender uma lingua da') - 0.1, 'A MAIS FORTE', 'Oportunidade', { icon: 'sobe' });
  pill(A('aprender uma lingua da'), A('e o ingles foi passando') - 0.1, 'Só se aprende uma língua quando vale a pena');
  row(A('com o tempo virou a lingua da lei') - 0.3, A('hoje as leis do pais') - 0.1, [
    { img: 'lei', label: 'Lei', at: A('a lingua da lei') }, { img: 'martelo', label: 'Tribunais', at: A('dos tribunais') },
    { img: 'negocio', label: 'Negócios', at: A('dos negocios') }, { img: 'formatura', label: 'Faculdades', at: A('e das faculdades') }]);
  clip(A('hoje as leis do pais'), A('quem queria subir') - 0.05, 'prefeitura', { cap: 'Leis e decisões da Justiça', sub: 'escritas em inglês, com raras exceções' });
  pill(A('quem queria subir'), A('ja sao seis razoes') - 0.1, 'Quem queria subir na vida precisava do inglês', EN);
  icon(A('quem queria subir'), A('ja sao seis razoes') - 0.1, 'sobe', P.manila, { dx: 120, dy: -40 });
  const tSeis = A('ja sao seis razoes'); unpin(tSeis);
  cam(tSeis, [122, 12.2], 16, 2);
  list(tSeis, A('agora a resposta do quiz') - 0.1, 'As 6 razões', [
    { name: 'Muitas línguas', sub: 'seguraram o espanhol', color: ES, at: A('tres que seguraram') },
    { name: 'Os frades', sub: 'seguraram o espanhol', color: ES, at: A('tres que seguraram') + 0.3 },
    { name: 'Escola tarde', sub: 'seguraram o espanhol', color: ES, at: A('tres que seguraram') + 0.6 },
    { name: 'Escola em massa', sub: 'empurraram o inglês', color: EN, at: A('e tres que empurraram') },
    { name: 'Professores filipinos', sub: 'empurraram o inglês', color: EN, at: A('e tres que empurraram') + 0.3 },
    { name: 'Oportunidade', sub: 'empurraram o inglês', color: EN, at: A('e tres que empurraram') + 0.6 }], { y: 60 });

  // ===== RESPOSTA DO QUIZ =====
  const tQ = A('agora a resposta do quiz');
  tl(tQ, tQ + 2.3, 1918, { from: 1901 });
  cam(tQ + 2.3, [122, 12.2], 17, 2); year(tQ + 2.3, 1918);
  hl(tQ + 2.3, A('e a lingua do proprio povo') - 0.1, 'Philippines', PH, { solid: true, alpha: 0.5 });
  dots(A('pouco mais de sete'), A('e o ingles', A('pouco mais de sete')) - 0.1, 'Sabiam espanhol (1918)', 7, ES, [[ES, '~7 em 100']]);
  dots(A('e o ingles', A('pouco mais de sete')), A('mas repara no que isso') - 0.1, 'Sabiam inglês (1918)', 9, EN, [[EN, 'quase 9 em 100']]);
  pill(A('menos de vinte anos depois'), A('mas repara no que isso') - 0.1, 'Em menos de 20 anos, o inglês passou o espanhol', EN);
  pill(A('ninguem trocou'), A('mais de oitenta em cada') - 0.1, 'Ninguém trocou uma língua pela outra');
  dots(A('mais de oitenta em cada'), A('o ingles foi chegando') - 0.1, 'Nem espanhol, nem inglês', 80, TG, [[TG, '+80 em 100: língua de casa']]);
  word(A('o ingles foi chegando'), A('e um aviso') - 0.1, 'O INGLÊS CHEGOU COMO', 'segunda língua', { meaning: 'pela escola', icon: 'escola', langColor: EN });
  pill(A('e um aviso'), A('mas mostra o rumo') - 0.1, 'Censo é gente dizendo o que sabe falar: o número não é exato');
  pill(A('mas mostra o rumo'), A('e a lingua do proprio povo') - 0.1, 'Mas mostra o rumo', EN);

  // ===== A LÍNGUA DO POVO =====
  const tPovo = A('e a lingua do proprio povo'); noYear(tPovo);
  cam(tPovo, [121.3, 14.6], 5, 2);
  blob(tPovo + 0.2, A('em mil novecentos e trinta e sete') + 3, P.tagalog, 1.0, TG, { r1: 1.4 });
  label(A('ela nao sumiu'), A('em mil novecentos e trinta e cinco a constituicao') - 0.1, [121.6, 14.0], 'Tagálog', { size: 30 });
  const t1935 = A('em mil novecentos e trinta e cinco a constituicao');
  tl(t1935, t1935 + 2.3, 1935, { from: 1918 });
  full(t1935 + 2.3, A('ela deveria nascer') + 0.6, 'r_quezon', 'Manuel Quezon', { sub: 'presidente da Commonwealth das Filipinas', kb: [0.5, 0.3, 1.04, 0.5, 0.3, 1.16] });
  const t1937 = A('em mil novecentos e trinta e sete');
  cam(A('ela deveria nascer') + 0.6, [121.3, 14.6], 4.5, 2.4); year(t1937, 1937, 1935);
  label(t1937 + 0.6, A('com o tempo ela mudou') - 0.1, [121.6, 14.0], 'Tagálog', { size: 30 });
  word(A('com o tempo ela mudou'), A('desde mil novecentos e oitenta e sete a constituicao') - 0.1, 'HOJE SE CHAMA', 'Filipino', { meaning: 'a língua nacional, com base no tagálog', langColor: TG, icon: 'idiomas' });
  const t1987 = A('desde mil novecentos e oitenta e sete a constituicao');
  tl(t1987, t1987 + 2.3, 1987, { from: 1937 });
  cam(t1987 + 2.3, [122, 12.2], 16, 2); year(t1987 + 2.3, 1987);
  hl(t1987 + 2.3, A('e o povo mistura') + 0.3, 'Philippines', PH, { solid: true });
  row(t1987 + 2.4, A('e o povo mistura') - 0.1, [{ img: 'bandeira', label: 'Filipino', at: t1987 + 2.5 }, { img: 'mensagem', label: 'Inglês', at: t1987 + 2.9 }]);
  clip(A('e o povo mistura'), A('e as outras linguas') - 0.05, 'cebuRua', { cap: 'E o povo mistura', sub: 'tagálog e inglês na mesma frase' });
  word(A('existe ate nome para isso') + 0.6, A('e as outras linguas') - 0.1, 'TAGÁLOG + ENGLISH', 'Taglish', { meaning: 'as duas línguas na mesma frase', icon: 'idiomas', langColor: TG });
  const tOut = A('e as outras linguas');
  tl(tOut, tOut + 2.3, 2013, { from: 1987 });
  clip(tOut + 2.3, A('se voce e filipino') - 0.05, 'aula', { cap: 'Desde 2013: as crianças aprendem primeiro', sub: 'na língua que falam em casa', dark: 0.1 });
  const tFil = A('se voce e filipino');
  cam(tFil, [122, 12.2], 16, 2); year(tFil, 2013);
  LANGS.forEach(([p, c], i) => blob(tFil + i * 0.1, A('entao nao foi uma troca') - 0.1, p, i < 2 ? 0.9 : 0.55, c));
  pill(tFil + 0.3, A('entao nao foi uma troca') - 0.1, 'Comenta: em que língua vocês falam em casa?', PH);
  noYear(A('entao nao foi uma troca'));
  quote(A('entao nao foi uma troca'), A('e o espanhol', A('foi uma camada')) - 0.1, 'O inglês chegou por cima.\nA língua de casa continuou embaixo.', { icon: 'camadas', by: 'uma camada em cima da outra' });

  // ===== E O ESPANHOL? =====
  const tEs = A('e o espanhol', A('foi uma camada'));
  cam(tEs, P.manila, 3, 2);
  pill(A('ele nao sumiu'), A('a constituicao de mil novecentos e oitenta e sete deixou') - 0.1, 'O espanhol não sumiu, mas perdeu espaço', ES);
  word(A('a constituicao de mil novecentos e oitenta e sete deixou'), A('hoje uma estimativa') - 0.1, 'NA CONSTITUIÇÃO DE 1987', 'Español', { meaning: 'língua opcional e voluntária', langColor: ES });
  num(A('hoje uma estimativa'), A('e menos de meio por cento') - 0.1, 0, 'filipinos se viram bem em espanhol', { raw: '~400 mil', color: ES });
  num(A('e menos de meio por cento'), A('agora o lugar que eu prometi') - 0.1, 0, 'do país. Mas não é zero.', { raw: '< 0,5%', color: ES });

  // ===== ZAMBOANGA =====
  const tZ = A('agora o lugar que eu prometi');
  cam(tZ, [124, 8], 9, 2.2);
  hl(A('na ilha de mindanao') - 0.6, A('la mais de quatrocentas') - 0.1, 'Mindanao', CH);
  label(A('na ilha de mindanao'), A('la mais de quatrocentas') - 0.1, P.mindanaoC, 'Mindanao', { size: 32 });
  const tLa = A('la mais de quatrocentas');
  cam(tLa - 0.4, P.zamboanga, 1.2, 1.6); pin(tLa - 0.4, P.zamboanga, 'Zamboanga');
  num(tLa, A('parece espanhol') - 0.1, 0, 'falam chabacano', { raw: '+400 mil', color: CH });
  pill(A('parece espanhol'), A('ouve esta frase') - 0.1, 'Parece espanhol. Mas não é.', CH);
  word(A('ouve esta frase'), A('so que ninguem fala assim') - 0.1, 'CHABACANO', '¿Dónde tú ay anda?', { pt: 'para onde você vai?', langColor: CH });
  word(A('so que ninguem fala assim'), A('como isso nasceu') - 0.1, 'EM ESPANHOL SERIA', '¿Adónde vas?', { meaning: 'ninguém fala “dónde tú ay anda” em espanhol', langColor: ES });
  row(A('a maior parte das palavras'), A('como isso nasceu') - 0.1, [{ img: 'idiomas', label: 'Palavras: espanhol', at: A('a maior parte das palavras') }, { img: 'camadas', label: 'Frase: filipina', at: A('mas o jeito de montar') }], { y: 620 });
  const t1635 = A('em mil seiscentos e trinta e cinco');
  tl(t1635, t1635 + 2.3, 1635, { from: 2013 });
  full(t1635 + 2.3, A('vieram trabalhadores') + 0.5, 'f_pilar_antigo', 'Forte Pilar, Zamboanga', { sub: 'construído pelos espanhóis em 1635 · cartão-postal dos anos 1910', kb: [0.5, 0.5, 1.04, 0.5, 0.45, 1.16] });
  const tVie = A('vieram trabalhadores') + 0.5;
  cam(tVie, P.zamboanga, 1.0, 2.4); year(tVie, 1635); pin(tVie, P.zamboanga, 'Zamboanga');
  swarm(tVie + 0.2, A('no comeco era um jeito') - 0.1, [122.12, 7.0], 0.12, 10, ES, 1, 3); swarm(tVie + 0.6, A('no comeco era um jeito') - 0.1, [122.0, 7.05], 0.12, 10, TG, 1, 6);
  swarm(tVie + 1.0, A('no comeco era um jeito') - 0.1, [121.98, 6.95], 0.1, 8, CB, 1, 9);
  pill(A('as ordens eram dadas'), A('no comeco era um jeito') - 0.1, 'Ordens em espanhol para gente de muitas línguas');
  pill(A('no comeco era um jeito'), A('com o tempo virou uma lingua completa') - 0.1, 'No começo, um jeito improvisado de se entender');
  noYear(A('com o tempo virou uma lingua completa'));
  full(A('com o tempo virou uma lingua completa'), A('entao voltando a pergunta') - 0.05, 'f_pilar', 'Chabacano: uma língua completa', { sub: 'falada desde o berço · Forte Pilar hoje, foto de Dennison Uy (CC BY-SA 3.0)', kb: [0.6, 0.5, 1.15, 0.45, 0.5, 1.04] });

  // ===== FECHAMENTO =====
  const tVolt = A('entao voltando a pergunta'); unpin(tVolt);
  cam(tVolt, [122, 12.2], 17, 2);
  quote(A('quem governa uma terra tambem escolhe'), A('a espanha governou por mais') - 0.1, 'Quem governa uma terra\nescolhe a língua do povo?', { icon: 'idiomas' });
  const tGov = A('a espanha governou por mais');
  cam(tGov, [122, 12.2], 16, 2);
  hl(tGov, A('os americanos governaram') - 0.1, 'Philippines', ES, { solid: true });
  row(A('mas o espanhol ficou'), A('os americanos governaram') - 0.1, [
    { img: 'idiomas', label: 'Muitas línguas', at: A('porque eram muitas linguas') }, { img: 'igreja', label: 'Os frades', at: A('os frades usavam') },
    { img: 'escola', label: 'Pouca escola', at: A('e a escola chegou pouco') }]);
  hl(A('os americanos governaram'), A('e o povo', A('os americanos governaram')) - 0.1, 'Philippines', EN, { solid: true });
  row(A('mas fizeram escola em massa'), A('e o povo', A('os americanos governaram')) - 0.1, [
    { img: 'escola', label: 'Escola em massa', at: A('mas fizeram escola em massa') }, { img: 'formatura', label: 'Professores', at: A('formaram professores filipinos') },
    { img: 'sobe', label: 'Portas abertas', at: A('e o ingles abriu portas') }]);
  const tPv = A('e o povo', A('os americanos governaram'));
  clip(tPv, A('e ainda criou outras') - 0.05, 'menino', { cap: 'E o povo continuou com as suas línguas' });
  row(A('e ainda criou outras'), A('entao a resposta e essa') - 0.1, [
    { img: 'bandeira', label: 'Filipino', at: A('como o filipino') }, { img: 'mensagem', label: 'Taglish', at: A('o taglish', A('e ainda criou outras')) }, { img: 'ancora', label: 'Chabacano', at: A('e o tchabacano') }]);
  cam(A('e ainda criou outras'), [122, 11], 18, 2);
  LANGS.forEach(([p, c], i) => blob(A('e ainda criou outras') + i * 0.08, A('nenhuma causa sozinha') - 0.1, p, i < 2 ? 0.9 : 0.55, c));
  pill(A('governar ajuda'), A('o que muda uma lingua') - 0.1, 'Governar ajuda, mas não basta');
  row(A('o que muda uma lingua'), A('nenhuma causa sozinha') - 0.1, [
    { img: 'escola', label: 'A escola', at: A('e a escola', A('o que muda uma lingua')) }, { img: 'formatura', label: 'O professor', at: A('o professor', A('o que muda uma lingua')) },
    { img: 'sobe', label: 'A vantagem', at: A('e a vantagem de falar') }]);
  pill(A('nenhuma causa sozinha'), A('agora me diz') - 0.1, 'Nenhuma causa sozinha explica tudo');
  clip(A('agora me diz'), A('se voce gosta de ver') - 0.05, 'baia', { cap: 'Qual pesou mais?', sub: 'a escola, o professor ou a vantagem de falar inglês' });
  pill(A('qual pesou mais') + 0.4, A('se voce gosta de ver') - 0.1, 'Comenta: qual pesou mais?', PH);
  const tInsc = A('se voce gosta de ver'); S.razoes.push({ t: tInsc, hide: true });
  cam(tInsc, [100, 15], 70, 2.4);
  hl(tInsc, A('no proximo video'), 'Philippines', PH, { solid: true });
  pill(tInsc + 0.2, A('a raiz de tudo') - 0.1, 'Inscreva-se para não perder os próximos mapas', PH);
  const tProx = A('no proximo video');
  cam(tProx, [100, 9], 72, 2.4);
  hl(A('macau goa'), A('e se um dia voce') - 0.1, 'Macao', GR, { solid: true, lift: 26 });
  blob(A('goa e timor'), A('e se um dia voce') - 0.1, [73.9, 15.4], 1.2, GR, { minPx: 22 });
  hl(A('e timor leste'), A('e se um dia voce') - 0.1, 'Timor-Leste', GR, { solid: true });
  label(A('macau goa') + 0.2, A('e se um dia voce') - 0.1, [113.5, 23.6], 'Macau', { size: 26 });
  label(A('goa e timor') + 0.2, A('e se um dia voce') - 0.1, [76.5, 15.4], 'Goa', { size: 26 });
  label(A('e timor leste') + 0.2, A('e se um dia voce') - 0.1, [125.8, -10.2], 'Timor-Leste', { size: 26 });
  S.ends.push({ t0: A('o que sobrou dele hoje'), t1: A('e se um dia voce') - 0.1, next: 'Macau, Goa e Timor-Leste:\no português na Ásia' });
  clip(A('e se um dia voce'), A('aquilo e o que sobrou') - 0.05, 'baiaFim', { cap: '¿Dónde tú ay anda?', sub: 'Zamboanga' });
  S.ends.push({ t0: A('aquilo e o que sobrou') + 3 });
  full(A('aquilo e o que sobrou'), A('aquilo e o que sobrou') + 3.1, 'f_pilar', '', { kb: [0.5, 0.5, 1.1, 0.5, 0.5, 1.2] });
  CAM.sort((a, b) => a.t - b.t); S.pins.sort((a, b) => a.t - b.t); S.years.sort((a, b) => a.t - b.t); S.razoes.sort((a, b) => a.t - b.t);
  return S;
}
