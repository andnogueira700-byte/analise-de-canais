// Roteiro de cenas do vídeo "Por que Montevidéu não fala português (Cisplatina)", sincronizado pela legenda.
// Novidade deste vídeo: o mapa se intercala com imagens reais em tela cheia (pinturas, fotos, clipes) e uma linha do tempo 1680–1830.
const MOS_USE = ['mundo', 'atlantico', 'brasil', 'europa', 'iberia', 'nordeste', 'pe', 'sul', 'prata', 'uy', 'montevideo', 'rivera', 'colonia'];
const FOTO_KEYS = ['p_33', 'r_lecor', 'p_sarandi', 'p_las_piedras', 'p_jura_1830', 'r_artigas', 'r_artigas_velho', 'p_naval', 'd_guerra', 'b_bandeira_cis',
  'f_obelisco', 'f_marco_fronteira', 'f_rivera_rua', 'f_plaza_int', 'p_ituzaingo', 'f_colonia_portao', 'p_montevideo_1700', 'r_larranaga', 'r_lavalleja', 'r_rivera',
  'r_varela', 'r_joao6', 'p_corte_rio', 'p_independencia', 'p_abdicacao', 'p_frei_caneca', 'r_pedro1', 'f_cabildo', 'f_matriz', 'f_florida', 'p_saladero',
  'm_prata_antigo', 'm_colonia_1777', 'f_chuy', 'f_quarai', 'r_zabala', 'r_rivadavia', 'r_ponsonby', 'p_gauchos'];
const FOTOS = FOTO_KEYS.map(k => [k, `fotos/${k}.jpg`]);
Object.assign(MK, { boi: 'x-boi', ouro: 'coins', moeda: 'hand-coins', bandeira: 'flag', forte: 'castle', coroa: 'crown', soldado: 'shield', espada: 'swords',
  canhao: 'flame', idiomas: 'languages', livro: 'book-open', papel: 'scroll', aperto: 'handshake', igreja: 'church', ancora: 'anchor', festa: 'party-popper',
  medalha: 'medal', terra: 'map', cargo: 'landmark', lei: 'scale', casamento: 'heart', escola: 'school', grupo: 'users', queda: 'trending-down', cristal: 'gem',
  navio: 'sailboat', voto: 'vote', fogo: 'flame', jornal: 'newspaper', mensagem: 'message-circle' });
for (const n of ['heart-handshake', 'flag', 'shield', 'landmark', 'users', 'scroll', 'gem', 'school', 'trending-down', 'swords']) MK[n] = n;
CIDADES = true;
const P = { // lugares [lon, lat]
  montevideo: [-56.19, -34.88], colonia: [-57.84, -34.46], buenosAires: [-58.42, -34.6], rio: [-43.2, -22.9], lisboa: [-9.14, 38.72],
  lasPiedras: [-56.22, -34.73], tacuarembo: [-55.98, -31.71], assuncao: [-57.6, -25.3], florida: [-56.21, -34.1], agraciada: [-58.25, -33.8],
  sarandi: [-56.33, -33.73], rosario: [-54.92, -30.25], rivera: [-55.55, -30.9], livramento: [-55.52, -30.86], artigas: [-56.47, -30.41],
  quarai: [-56.45, -30.37], chuy: [-53.46, -33.69], portoAlegre: [-51.2, -30.03], londres: [-0.12, 51.5], recife: [-34.88, -8.06],
  uyCentro: [-56.0, -32.8], missoes: [-54.6, -28.6], uyNorte: [-55.9, -31.1]
};

// ---------- camadas novas deste vídeo ----------
// imagem em tela cheia com movimento lento (Ken Burns) e legenda; clipe de vídeo quadro a quadro; linha do tempo
const CLIPDIR = 'file:///tmp/claude-0/clips/';
const CLIPS = { // id: [arquivo, segundo inicial no clipe]
  drone: ['px128113-montevideu-drone-rambla.mp4', 1], ondas: ['px22387-montevideu-rambla-ondas.mp4', 3], coloniaSol: ['px21207-por-do-sol-rio-da-prata-colonia.mp4', 2],
  ba: ['px19309-buenos-aires-puerto-madero.mp4', 1], pena: ['px107189-pena-escrevendo-vela.mp4', 4], pena2: ['px107189-pena-escrevendo-vela.mp4', 24], gado: ['px311223-gado-pampa-drone.mp4', 2],
  vaca: ['px187065-vaca-campo-drone.mp4', 1], costa: ['px30009-costa-uruguai-praia.mp4', 5], mate: ['px252998-cuia-mate-chimarrao.mp4', 0.5],
  aula: ['px106699-criancas-sala-de-aula.mp4', 1], ondasFim: ['px22387-montevideu-rambla-ondas.mp4', 14], solFim: ['px21207-por-do-sol-rio-da-prata-colonia.mp4', 14]
};
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
// ----- linha do tempo 1680–1830 -----
const TLX = y => y <= 1810 ? 150 + (y - 1680) / 130 * 700 : 850 + (y - 1810) / 20 * 920;
const TL_EV = [ // ano, rótulo curto, frase do cartão, imagem, nível (A/B acima, C/D abaixo)
  [1680, 'Colônia do Sacramento', 'Portugal funda a Colônia do Sacramento', 'f_colonia_portao', 'C'],
  [1726, 'Montevidéu', 'A Espanha funda Montevidéu', 'p_montevideo_1700', 'A'],
  [1777, 'Tratado', 'Um tratado deixa a região com a Espanha', 'm_colonia_1777', 'B'],
  [1811, 'Las Piedras', 'Artigas vence os espanhóis em Las Piedras', 'p_las_piedras', 'A'],
  [1816, 'Invasão', 'Dom João VI manda invadir a Banda Oriental', 'r_joao6', 'B'],
  [1817, 'Montevidéu tomada', 'Lecor entra em Montevidéu sem lutar', 'r_lecor', 'C'],
  [1821, 'Cisplatina', 'O Congresso cria o Estado Cisplatino', 'b_bandeira_cis', 'A'],
  [1822, 'Independência', 'O Brasil se separa de Portugal', 'p_independencia', 'D'],
  [1825, 'Os 33', 'Os 33 Orientais desembarcam', 'p_33', 'B'],
  [1827, 'Passo do Rosário', 'A maior batalha da guerra', 'p_ituzaingo', 'C'],
  [1828, 'Uruguai', 'Nasce a República Oriental do Uruguai', 'f_obelisco', 'A'],
  [1830, 'Constituição', 'O Uruguai jura a sua Constituição', 'p_jura_1830', 'D']
];
const TL_BANDS = [[1680, 1777, 'Portugal × Espanha', 'hatch'], [1777, 1811, 'Espanha', C.urucum], [1811, 1817, 'Artigas', '#3B82C4'], [1817, 1822, 'Portugal', C.verde],
  [1822, 1828, 'Brasil', '#7AA52A'], [1828, 1830.6, 'Uruguai', C.turq]];
let HATCH;
function drawTL(t, S) {
  for (const l of S.tl) {
    const a = vis(t, l.t0, l.t1, 0.3, 0.3); if (!a) continue;
    // ano corrente: anda de "from" até "y" no primeiro 1,4 s
    const from = l.from ?? 1680, p = (l.intro ? ease : easeOut)(clamp((t - l.t0 - (l.intro ? 2.1 : 0.2)) / (l.intro ? 2.6 : 1.4))), cur = lerp(from, l.y, p);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = C.areia; ctx.fillRect(0, 0, W, H);
    if (!HATCH) { const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); g.fillStyle = C.verde; g.fillRect(0, 0, 24, 24); g.strokeStyle = C.urucum; g.lineWidth = 9; g.beginPath(); for (let k = -24; k < 48; k += 24) { g.moveTo(k, 24); g.lineTo(k + 24, 0); } g.stroke(); HATCH = ctx.createPattern(c, 'repeat'); }
    // título
    ctx.fillStyle = C.tinta; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = '700 26px Figtree'; ctx.letterSpacing = '6px';
    ctx.fillText('LINHA DO TEMPO', 150, 110); ctx.letterSpacing = '2px'; ctx.font = '700 22px Figtree'; ctx.fillStyle = '#6b5a3a'; ctx.fillText('QUEM MANDA NA REGIÃO', 150, 178);
    ctx.fillText('LÍNGUA DE MONTEVIDÉU', 150, 786); ctx.letterSpacing = '0px';
    const xc = TLX(cur);
    // faixa de quem manda, revelada até o ano corrente
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xc, H); ctx.clip();
    for (const [y0, y1, txt, col] of TL_BANDS) {
      const x0 = TLX(y0), x1 = Math.min(TLX(y1), 1790); ctx.fillStyle = col === 'hatch' ? HATCH : col; rr(x0, 192, x1 - x0 - 3, 64, 8); ctx.fill();
      ctx.fillStyle = C.branco; ctx.font = '800 26px "Bricolage Grotesque"'; const tw = ctx.measureText(txt).width;
      if (tw < x1 - x0 - 24) { ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(6,18,47,0.35)'; ctx.strokeText(txt, x0 + 14, 234); ctx.fillText(txt, x0 + 14, 234); }
    }
    // língua: antes de 1726 a cidade não existe; depois, espanhol o tempo todo
    ctx.fillStyle = 'rgba(107,90,58,0.25)'; rr(TLX(1680), 800, TLX(1726) - TLX(1680) - 3, 64, 8); ctx.fill();
    ctx.fillStyle = '#6b5a3a'; fit('cidade não existe', TLX(1726) - TLX(1680) - 30, 'italic 600 {}px Figtree', 24, 14); ctx.fillText('cidade não existe', TLX(1680) + 14, 841);
    ctx.fillStyle = C.ipe; rr(TLX(1726), 800, 1790 - TLX(1726), 64, 8); ctx.fill();
    ctx.fillStyle = C.tinta; ctx.font = '800 30px "Bricolage Grotesque"'; ctx.letterSpacing = '8px';
    for (let x = TLX(1726) + 24; x < 1760; x += 300) ctx.fillText('ESPAÑOL', x, 844);
    ctx.letterSpacing = '0px'; ctx.restore();
    // eixo, com a quebra de escala em 1810 (o trecho 1811–1830 aparece de perto)
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, 540); ctx.lineTo(1790, 540); ctx.stroke();
    ctx.fillStyle = C.areia; ctx.fillRect(TLX(1810) - 9, 526, 18, 28); ctx.strokeRect(TLX(1810) - 9, 526, 18, 28);
    ctx.fillStyle = '#6b5a3a'; ctx.font = '700 18px Figtree'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillText('ZOOM', TLX(1810), 588); ctx.letterSpacing = '0px';
    const LV = { A: [440, 472], B: [352, 384], C: [628, 660], D: [708, 740] };
    let newest = null;
    for (const ev of TL_EV) {
      const [yr, lab, , , lv] = ev, x = TLX(yr), on = cur >= yr - 0.01, [yy, ly] = LV[lv], up = lv === 'A' || lv === 'B';
      ctx.globalAlpha = a * (on ? 1 : 0.35);
      ctx.strokeStyle = 'rgba(6,18,47,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, up ? ly + 14 : yy - 34); ctx.lineTo(x, 540); ctx.stroke();
      const isNew = on && yr === l.y; if (on) newest = ev;
      const sc = isNew ? 1.3 : 1;
      ctx.fillStyle = on ? C.ipe : C.areia; ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, 540, 12 * sc, 0, 7); ctx.fill(); ctx.stroke();
      const anc = yr === 1680 ? 'left' : 'center', lx = yr === 1680 ? x - 12 : x;
      ctx.textAlign = anc; ctx.fillStyle = C.tinta; ctx.font = '800 38px "Bricolage Grotesque"'; ctx.fillText(String(yr), lx, yy);
      ctx.font = '600 27px Figtree'; ctx.fillStyle = '#3a3324'; ctx.fillText(lab, lx, ly);
    }
    ctx.globalAlpha = a;
    // agulha do ano corrente
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(xc, 180); ctx.lineTo(xc, 876); ctx.stroke(); ctx.setLineDash([]);
    // cartão do acontecimento mais novo: ano grande, frase e a imagem real
    if (newest && cur >= l.y - 0.01 && !l.intro) {
      const ca = clamp((t - l.t0 - (l.intro ? 1.9 : 0.2) - 1.3) / 0.4), [yr, , txt, img] = newest;
      ctx.globalAlpha = a * ca; const y0 = 900 + (1 - easeOut(ca)) * 30;
      ctx.fillStyle = C.tinta; rr(150, y0, 1640, 132, 18); ctx.fill();
      let tx = 190; const im = IMG[img];
      if (im) { ctx.save(); rr(162, y0 + 12, 190, 108, 10); ctx.clip(); const k = Math.max(190 / im.width, 108 / im.height); ctx.drawImage(im, 257 - im.width * k / 2, y0 + 66 - im.height * k / 2, im.width * k, im.height * k); ctx.restore(); tx = 384; }
      ctx.textAlign = 'left'; ctx.fillStyle = C.ipe; ctx.font = '800 72px "Bricolage Grotesque"'; ctx.fillText(String(yr), tx, y0 + 92);
      ctx.fillStyle = C.branco; fit(txt, 1790 - tx - 240 - 40, '700 {}px Figtree', 44, 24); ctx.fillText(txt, tx + 240, y0 + 82);
    }
    ctx.restore();
    // abertura: contador rebobinando de 2026 até 1680 sobre fundo escuro, depois a linha entra por uma cortina
    if (l.intro) {
      const q = clamp((t - l.t0) / 1.7), cover = 1 - easeOut(clamp((t - l.t0 - 1.7) / 0.45));
      if (cover > 0) {
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.tinta; ctx.fillRect(0, 0, W * cover, H);
        ctx.beginPath(); ctx.rect(0, 0, W * cover, H); ctx.clip();
        const yv = Math.round(lerp(2026, 1680, ease(q)));
        for (let k = 1; k <= 3; k++) { ctx.globalAlpha = a * (0.12 / k) * (q < 1 ? 1 : 0); ctx.fillStyle = C.ipe; ctx.font = '800 300px "Bricolage Grotesque"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(yv + k * 7), W / 2, H / 2 - k * 46); }
        ctx.globalAlpha = a; ctx.fillStyle = C.ipe; ctx.font = '800 300px "Bricolage Grotesque"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(yv), W / 2, H / 2);
        ctx.fillStyle = C.branco; ctx.font = '700 30px Figtree'; ctx.letterSpacing = '10px'; ctx.fillText('VOLTANDO NO TEMPO', W / 2, H / 2 + 200); ctx.letterSpacing = '0px';
        ctx.restore();
      }
    }
  }
}
// contador das 9 razões no canto de baixo
function drawRazao(t, S) {
  const R = S.razoes; let cur = null; for (const r of R) if (r.t <= t) cur = r; if (!cur || cur.hide) return;
  const a = clamp((t - cur.t) / 0.4) * (1 - fullAlpha(t, S));
  if (a <= 0) return;
  const x = 70, y = H - 128, w = 360, h = 62;
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = C.tinta; rr(x, y, w, h, 31); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.ipe; ctx.font = '800 26px "Bricolage Grotesque"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`RAZÃO ${cur.n}/9`, x + 26, y + h / 2 + 1);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x + 186 + i * 18, y + h / 2, 6, 0, 7); ctx.fillStyle = i < cur.n ? C.ipe : 'rgba(255,255,255,0.25)'; ctx.fill(); }
  ctx.restore(); BOXES.push(Object.assign([x, y, x + w, y + h], { k: 'capítulo' }));
}
const _render = render;
render = function (t) {
  const S = SCENE, fa = fullAlpha(t, S);
  if (fa < 1) _render(t); else { BOXES = []; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H); mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.fillStyle = C.tinta; mctx.fillRect(0, 0, MW, MH); }
  drawRazao(t, S);
  if (fa > 0) { drawFulls(t, S); drawTL(t, S); drawPills(t, S); drawQuotes(t, S); drawTitle(t, S); drawEnd(t, S); }
};

function buildScene() {
  const S = { highlights: [], blobs: [], swarms: [], labels: [], icons: [], iconSwarms: [], pins: [], years: [], chapters: [], pills: [], numbers: [], words: [], people: [], dots: [], rows: [], lists: [], quotes: [], titles: [], ends: [], photos: [],
    fulls: [], clips: [], tl: [], razoes: [] };
  const cam = (t, place, span, d = 1.4) => (span = Math.max(span, 0.5), CAM.push(Array.isArray(place) ? { t, lon: place[0], lat: place[1], span, d } : { t, ...place, span, d }));
  const pin = (t, place, label, o = {}) => S.pins.push({ t, lon: place[0], lat: place[1], label, ...o });
  const unpin = t => S.pins.push({ t, hide: true });
  const year = (t, y, from) => S.years.push({ t, y, from });
  const noYear = t => S.years.push({ t, hide: true });
  const chap = (t, num, title) => (S.chapters.push({ t0: t, num, title }), S.razoes.push({ t, n: +num }));
  const pill = (t0, t1, text, color) => S.pills.push({ t0, t1, text, color });
  const num = (t0, t1, value, label, o = {}) => S.numbers.push({ t0, t1, value, label, ...o });
  const hl = (t0, t1, name, color, o = {}) => S.highlights.push({ t0, t1, name, color, solid: name === 'Brazil', ...o });
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
  const swarm = (t0, t1, place, r, n, color, dur, seed, o = {}) => S.swarms.push({ t0, t1, lon: place[0], lat: place[1], r, n: Math.ceil(n * 0.45), color, dur, seed, people: true, ...o });
  const full = (t0, t1, img, cap, o = {}) => S.fulls.push({ t0, t1, img, cap, ...o });
  const clip = (t0, t1, id, o = {}) => S.clips.push({ t0, t1, id: id + '_' + S.clips.length, src: id, ...o });
  const tl = (t0, t1, y, o = {}) => S.tl.push({ t0, t1, y, ...o });
  const A = at;
  // cores: cada lugar citado em sequência tem uma cor diferente da anterior
  const BR = C.verde, ES = C.urucum, UY = C.turq, AR = '#3B82C4', PT = C.acai, BA = C.caju, RS = C.ipe, GB = C.jambo;

  // ===== GANCHO =====
  clip(0, A('do brasil') - 0.1, 'drone', { cap: 'Montevidéu, capital do Uruguai' });
  const tMapa = A('do brasil');
  cam(0, [-54, -30], 34, 0.1); cam(tMapa, [-54, -29], 30, 3.5);
  hl(tMapa + 0.2, A('agora me responde') - 0.2, 'Brazil', BR, { alpha: 0.8 });
  hl(tMapa + 0.5, A('agora me responde') - 0.2, 'Uruguay', BR, { lift: 22 });
  label(tMapa + 0.8, A('nao foi so uma passagem') + 1, P.uyCentro, 'Uruguai', { size: 30 });
  pill(A('nao foi so uma passagem'), A('ela virou parte') - 0.1, 'Não foi só uma passagem de soldados');
  const tProv = A('ela virou parte');
  cam(tProv, [-56, -32.6], 9, 1.4);
  icon(A('com governador'), A('agora me responde') - 0.2, 'coroa', P.uyCentro, { dx: -110, dy: -30 });
  icon(A('com leis'), A('agora me responde') - 0.2, 'lei', P.uyCentro, { dx: 10, dy: -30 });
  icon(A('e com nome novo'), A('agora me responde') - 0.2, 'papel', P.uyCentro, { dx: 130, dy: -30 });
  label(A('esse nome era cisplatina'), A('agora me responde') - 0.2, [-56, -33.9], 'Cisplatina', { size: 40 });
  full(A('agora me responde'), A('se montevideu ja foi') - 0.05, 'p_montevideo_1700', 'Montevidéu no fim do século XVIII', { sub: 'pintura de Leonie Matthis', kb: [0.5, 0.5, 1.02, 0.55, 0.5, 1.15] });
  clip(A('se montevideu ja foi'), A('eu sempre achei') - 0.05, 'ondas');
  pill(A('se montevideu ja foi') + 0.3, A('eu sempre achei') - 0.1, 'Por que lá se fala espanhol, e não português?');
  const tAchei = A('eu sempre achei');
  cam(tAchei - 0.3, [-56.6, -33.2], 8, 0.4); cam(tAchei, [-56.4, -33.6], 6.5, 3.5);
  hl(tAchei, A('e a explicacao passa') - 0.2, 'Uruguay', UY);
  hl(tAchei + 0.3, A('e a explicacao passa') - 0.2, 'RS', BR);
  label(tAchei + 0.5, A('mas descobri que o portugues'), P.uyCentro, 'Uruguai', { size: 30 });
  pin(A('mas descobri que o portugues'), P.montevideo, 'Montevidéu');
  word(A('mas descobri que o portugues') + 0.4, A('e a explicacao passa') - 0.1, 'A LÍNGUA DE MONTEVIDÉU', 'Español', { meaning: 'nem quando a cidade estava no mapa do Brasil', icon: 'mensagem' });
  const tTres = A('e a explicacao passa');
  cam(tTres, P.montevideo, 3, 2);
  row(tTres + 0.2, A('no final eu te mostro') - 0.1, [
    { img: 'casamento', label: 'Um casamento', at: A('por um casamento') }, { img: 'grupo', label: '33 homens', at: A('por trinta e tres homens') },
    { img: 'escola', label: 'Uma lei da escola', at: A('por uma lei da escola') }]);
  unpin(A('no final eu te mostro'));
  full(A('no final eu te mostro'), A('la voce atravessa') - 0.05, 'f_obelisco', 'Rivera e Santana do Livramento', { sub: 'Uruguai e Brasil, colados', kb: [0.5, 0.4, 1.05, 0.5, 0.35, 1.18] });
  full(A('la voce atravessa'), A('fica comigo ate la') - 0.05, 'f_marco_fronteira', 'Uma rua, dois países', { sub: 'sem passaporte', kb: [0.45, 0.5, 1.15, 0.55, 0.5, 1.04] });
  S.titles.push({ t0: A('fica comigo ate la'), t1: A('para entender vamos voltar') - 0.15, text: 'Por que Montevidéu\nnão fala português?' });
  const tVolta = A('para entender vamos voltar');
  tl(tVolta, A('banda quer dizer lado') - 0.05, 1830, { intro: true, from: 1680 }); // abertura: rebobina e mostra a linha inteira

  // ===== BANDA ORIENTAL, 1680–1777 =====
  const tBanda = A('banda quer dizer lado');
  cam(tBanda - 0.3, [-57, -33], 11, 0.1); cam(tBanda, [-56.5, -33], 9, 3);
  hl(tBanda, A('de um lado a espanha') - 0.2, 'Uruguay', RS);
  label(tBanda + 0.3, A('de um lado a espanha') - 0.2, P.uyCentro, 'Banda Oriental', { size: 34 });
  word(A('banda quer dizer lado') + 0.4, A('era uma terra de disputa') - 0.1, 'BANDA', 'lado', { meaning: 'o lado leste do rio Uruguai', x: 1180 });
  label(A('era o lado leste'), A('de um lado a espanha'), [-58.3, -31.2], 'rio Uruguai', { size: 22 });
  const tLados = A('de um lado a espanha');
  cam(tLados, [-57, -30], 26, 1.6);
  hl(tLados + 0.2, A('em mil seiscentos e oitenta') - 0.1, 'Argentina', ES); label(tLados + 0.4, A('em mil seiscentos e oitenta') - 0.1, [-63, -33], 'Espanha', { size: 34 });
  hl(A('do outro portugal'), A('em mil seiscentos e oitenta') - 0.1, 'Brazil', PT); label(A('do outro portugal') + 0.2, A('em mil seiscentos e oitenta') - 0.1, [-50, -25], 'Portugal', { size: 34 });
  const t1680 = A('em mil seiscentos e oitenta');
  tl(t1680, t1680 + 2.5, 1680, { from: 1678 });
  clip(t1680 + 2.5, A('bem em frente a buenos aires') - 0.05, 'coloniaSol', { cap: 'Colônia do Sacramento', sub: 'fundada pelos portugueses em 1680' });
  const tFrente = A('bem em frente a buenos aires');
  cam(tFrente - 0.2, [-58.1, -34.5], 2.2, 0.2); cam(tFrente, [-58.1, -34.5], 1.8, 3);
  pin(tFrente, P.colonia, 'Colônia do Sacramento');
  label(tFrente + 0.4, A('os espanhois nao gostaram') - 0.1, P.buenosAires, 'Buenos Aires', { size: 28 });
  route('nav', A('era um jeito de entrar'), A('era um jeito de entrar') + 2.8, [P.colonia, [-58.1, -34.62], P.buenosAires], { icon: 'ship', color: PT });
  clip(A('os espanhois nao gostaram'), A('em mil setecentos e vinte e seis') - 0.05, 'ba', { cap: 'Buenos Aires, do outro lado do rio', dark: 0.1 });
  const t1726 = A('em mil setecentos e vinte e seis');
  tl(t1726, t1726 + 2.4, 1726, { from: 1680 });
  cam(t1726 + 2.3, [-57.2, -34.6], 3.2, 0.3); cam(t1726 + 2.6, [-56.8, -34.6], 2.6, 3);
  unpin(t1726); pin(t1726 + 2.5, P.montevideo, 'Montevidéu');
  person(t1726 + 2.7, A('montevideu nasceu espanhola') + 2.2, 'Bruno de Zabala', 'Fundador de Montevidéu', { img: 'r_zabala', years: 'governador espanhol', side: 'right' });
  hl(A('montevideu nasceu espanhola'), A('por quase cem anos') - 0.1, 'Uruguay', ES, { alpha: 0.6 });
  word(A('desde o primeiro dia'), A('por quase cem anos') - 0.1, 'A LÍNGUA DA CIDADE', 'Español', { meaning: 'desde o primeiro dia', x: 1180, y: 240 });
  const t1777 = A('em mil setecentos e setenta e sete');
  cam(A('por quase cem anos'), [-56.5, -33], 9, 2);
  hl(A('por quase cem anos') + 0.1, t1777, 'Uruguay', PT, { pulse: C.urucum });
  pill(A('por quase cem anos') + 0.2, t1777 - 0.1, 'Quase 100 anos de briga entre as duas coroas');
  tl(t1777, t1777 + 2.4, 1777, { from: 1726 });
  full(t1777 + 2.4, A('guarde essa informacao') - 0.05, 'm_colonia_1777', 'Mapa espanhol de 1777, o ano do tratado', { fit: true });
  const tGuarde = A('guarde essa informacao');
  cam(tGuarde, P.montevideo, 2.4, 2); hl(tGuarde, A('os anos passaram') - 0.2, 'Uruguay', ES);
  pin(tGuarde, P.montevideo, 'Montevidéu');
  num(A('montevideu ja tinha mais de noventa'), A('os anos passaram') - 0.1, 90, 'anos de vida, todos em espanhol', { prefix: '+', color: ES });

  // ===== ARTIGAS =====
  const tAnos = A('os anos passaram'); unpin(tAnos);
  cam(tAnos, [-62, -22], 60, 2);
  [['Argentina', '#3B82C4'], ['Chile', C.jambo], ['Peru', C.caju], ['Bolivia', C.acai], ['Paraguay', C.ipe], ['Colombia', C.turq], ['Venezuela', C.urucum], ['Ecuador', C.lilas]]
    .forEach(([n, c], i) => hl(A('comecaram a se separar') + i * 0.22, A('na banda oriental o grande') - 0.1, n, c));
  full(A('na banda oriental o grande'), A('em mil oitocentos e onze') - 0.05, 'r_artigas', 'José Gervasio Artigas', { sub: 'nascido em Montevidéu · pintura de Juan Manuel Blanes', kb: [0.5, 0.3, 1.05, 0.5, 0.28, 1.2] });
  const t1811 = A('em mil oitocentos e onze');
  tl(t1811, t1811 + 2.2, 1811, { from: 1777 });
  full(t1811 + 2.2, A('artigas queria que cada') - 0.05, 'p_las_piedras', 'Batalha de Las Piedras, 1811', { sub: 'Artigas vence os espanhóis', kb: [0.3, 0.5, 1.08, 0.7, 0.5, 1.2] });
  const tLiga = A('artigas queria que cada');
  cam(tLiga, [-59, -31], 16, 1.6);
  hl(tLiga + 0.2, A('e aqui entra o brasil') - 0.2, 'Uruguay', RS);
  hl(tLiga + 0.6, A('e aqui entra o brasil') - 0.2, 'Argentina', AR, { alpha: 0.55 });
  pill(A('dentro de uma liga'), A('isso assustou muita gente') - 0.1, 'Cada região mandando em si mesma');
  pin(A('inclusive em buenos aires'), P.buenosAires, 'Buenos Aires');
  icon(A('isso assustou muita gente'), A('e aqui entra o brasil') - 0.2, 'shield', [-59.5, -34], { dx: -60, dy: -80 });
  const tBrasil = A('e aqui entra o brasil'); unpin(tBrasil);
  cam(tBrasil, [-48, -24], 28, 1.8);
  hl(tBrasil + 0.2, A('ele tinha fugido de napoleao'), 'Brazil', BR);
  pin(A('morava no rio de janeiro'), P.rio, 'Rio de Janeiro');
  full(A('dom joao sexto'), A('ele tinha fugido de napoleao') - 0.05, 'r_joao6', 'Dom João VI', { sub: 'rei de Portugal, morando no Rio · retrato de Debret', kb: [0.5, 0.3, 1.05, 0.5, 0.3, 1.18] });
  const tNap = A('ele tinha fugido de napoleao'); unpin(tNap);
  cam(tNap, [-25, 5], 110, 1.6);
  route('corte', tNap + 0.2, tNap + 2.6, [P.lisboa, [-20, 25], [-30, 0], P.rio], { icon: 'ship', color: PT });
  full(A('e levado a corte inteira'), A('em mil oitocentos e dezesseis') - 0.05, 'p_corte_rio', 'A corte portuguesa chega ao Brasil', { sub: '1808', kb: [0.4, 0.5, 1.05, 0.6, 0.5, 1.15] });
  const t1816 = A('em mil oitocentos e dezesseis');
  tl(t1816, t1816 + 2.2, 1816, { from: 1811 });
  cam(t1816 + 2.2, [-54, -31], 13, 0.2); cam(t1816 + 2.4, [-55, -32], 10, 3);
  route('exercito', t1816 + 2.5, t1816 + 5.5, [P.portoAlegre, [-53, -32.5], [-54.8, -34.2], P.montevideo], { icon: 'shield', color: BR });
  swarm(A('eram milhares de soldados'), A('antes de eu continuar'), [-54.7, -32.4], 0.7, 34, BR, 1.6, 7);
  person(A('o comandante era'), A('antes de eu continuar') + 0.2, 'Carlos Frederico Lecor', 'General português', { img: 'r_lecor', side: 'right' });
  const t1817 = A('em janeiro de mil oitocentos e dezessete');
  tl(t1817, t1817 + 2.2, 1817, { from: 1816 });
  cam(t1817 + 2.2, P.montevideo, 2.6, 0.3); cam(t1817 + 2.5, P.montevideo, 2.2, 3);
  pin(t1817 + 2.3, P.montevideo, 'Montevidéu');
  num(A('quantas batalhas voce acha'), A('a cidade se rendeu') + 1.2, 0, 'batalhas', { from: 9, color: ES });
  icon(A('a cidade se rendeu'), A('e esse e o primeiro') + 1, 'bandeira', P.montevideo, { dx: 90, dy: -40 });
  pill(A('a cidade se rendeu'), A('e esse e o primeiro segredo') + 1, 'A cidade se rendeu sem lutar');
  const tResist = A('artigas continuou resistindo'); unpin(tResist);
  cam(tResist, [-56, -32], 8, 1.6);
  pin(A('em mil oitocentos e vinte suas forcas'), P.tacuarembo, 'Tacuarembó');
  year(A('em mil oitocentos e vinte suas forcas'), 1820, 1817);
  icon(A('foram derrotadas em tacuarembo'), A('o grande heroi'), 'espada', P.tacuarembo, { dx: 100, dy: 20 });
  const tHeroi = A('o grande heroi'); unpin(tHeroi); noYear(tHeroi);
  cam(tHeroi, [-57, -29], 14, 1.4);
  route('exilio', tHeroi + 0.2, tHeroi + 2.4, [P.tacuarembo, [-57.5, -28], P.assuncao], { icon: 'user', color: RS });
  full(A('no exilio no paraguai') + 0.3, A('a primeira razao') - 0.05, 'r_artigas_velho', 'Artigas no exílio, no Paraguai', { sub: 'o inimigo comum tinha sumido · retrato de Demersay', kb: [0.5, 0.3, 1.05, 0.5, 0.3, 1.15] });

  // ===== RAZÃO 1: ENTREGUE SEM LUTA =====
  const tR1 = A('a primeira razao');
  chap(tR1, '1', 'Entregue sem luta');
  cam(tR1, P.montevideo, 1.6, 1.8); pin(tR1 + 0.3, P.montevideo, 'Montevidéu');
  icon(A('lecor conversou com os chefes'), A('o cabildo que era') - 0.1, 'aperto', P.montevideo, { dx: -120, dy: -60 });
  full(A('o cabildo que era'), A('gente importante da cidade') - 0.05, 'f_cabildo', 'O Cabildo de Montevidéu', { sub: 'a câmara da cidade · foto de 1858', kb: [0.5, 0.5, 1.03, 0.5, 0.45, 1.15] });
  const tGente = A('gente importante da cidade');
  cam(tGente, P.montevideo, 1.4, 3);
  icon(tGente + 0.2, A('por que fizeram isso') - 0.1, 'cargo', P.montevideo, { dx: 120, dy: -50 });
  const tPq = A('por que fizeram isso');
  row(A('controlada por espanhois') - 0.3, A('um dos politicos da epoca') - 0.1, [
    { img: 'bandeira', label: 'Espanhóis', at: A('controlada por espanhois') }, { img: 'bandeira', label: 'Buenos Aires', at: A('por gente de buenos aires') },
    { img: 'bandeira', label: 'Artigas', at: A('por seguidores de artigas') }, { img: 'bandeira', label: 'Portugueses', at: A('pelos portugueses') }]);
  pill(tPq + 0.3, A('controlada por espanhois') - 0.4, 'Montevidéu estava cansada');
  num(A('mais da metade da populacao'), A('o medo de mais guerra') - 0.1, 0, 'da população destruída pelas guerras', { raw: '+ da metade', color: ES });
  pill(A('o medo de mais guerra'), A('repare no que isso') - 0.1, 'O medo da guerra pesou mais que a língua');
  full(A('os portugueses nao chegaram'), A('mas e o governador') - 0.05, 'p_montevideo_1700', 'Uma elite que queria paz', { sub: 'e que falava espanhol', kb: [0.7, 0.5, 1.2, 0.4, 0.5, 1.1] });
  // ===== RAZÃO 2: O GOVERNADOR =====
  const tGov = A('mas e o governador');
  cam(tGov, P.montevideo, 1.3, 2);
  person(tGov + 0.2, A('a segunda razao') - 0.1, 'Lecor', 'Governador da província', { img: 'r_lecor' });
  pill(A('a resposta envolve'), A('a segunda razao') - 0.1, 'Festas, títulos e um casamento');
  const tR2 = A('a segunda razao');
  chap(tR2, '2', 'O governador esperto');
  cam(tR2, [-56.3, -34.6], 2.2, 3);
  pill(A('sabia que nao ia mandar'), A('entao fez politica') - 0.1, 'Poucos soldados, cidade cansada');
  row(A('entao fez politica'), A('em mil oitocentos e dezoito ele') - 0.1, [
    { img: 'festa', label: 'Festas', at: A('dava festas') }, { img: 'cargo', label: 'Cargos', at: A('colocava gente da terra') },
    { img: 'medalha', label: 'Títulos', at: A('distribuiu titulos') }, { img: 'terra', label: 'Terras', at: A('e repartiu terras') }]);
  const t1818 = A('em mil oitocentos e dezoito ele');
  year(t1818, 1818, 1817); cam(t1818, P.montevideo, 1.2, 2.4);
  icon(t1818 + 0.3, A('pois e com isso') - 0.1, 'casamento', P.montevideo, { dx: -100, dy: -60 });
  pill(A('o governador da provincia se casou'), A('qual lingua voce acha') - 0.1, 'O governador casou com uma montevideana');
  word(A('qual lingua voce acha'), A('pois e com isso') + 0.8, 'NA MESA DE JANTAR', 'Español', { icon: 'mensagem' });
  noYear(A('pois e com isso'));
  pill(A('nao tentou mudar a lingua'), A('a cidade continuou escrevendo') - 0.1, 'Não tentou mudar a língua de ninguém');
  full(A('a cidade continuou escrevendo'), A('essa foi a parte que mais me surpreendeu') + 1.2, 'f_matriz', 'Escrevendo, discutindo e rezando em espanhol', { sub: 'Igreja Matriz de Montevidéu', kb: [0.5, 0.4, 1.05, 0.5, 0.35, 1.18] });
  const tGen = A('o general que veio conquistar');
  cam(tGen, P.montevideo, 1.6, 2);
  const tSul = A('se voce e do sul do brasil');
  cam(tSul, [-53.5, -30], 9, 1.6);
  hl(tSul + 0.2, A('e a coisa fica ainda mais curiosa') - 0.2, 'RS', RS); label(tSul + 0.4, A('e a coisa fica ainda mais curiosa') - 0.2, [-53.3, -29.6], 'Rio Grande do Sul', { size: 26 });
  pill(A('escreve nos comentarios'), A('e a coisa fica ainda mais curiosa') - 0.1, 'Comente: essa história passou na sua escola?', RS);

  // ===== RAZÃO 3: O CONGRESSO =====
  const tCur = A('e a coisa fica ainda mais curiosa');
  cam(tCur, P.montevideo, 2, 1.6); year(A('porque em mil oitocentos e vinte e um'), 1821, 1818);
  icon(A('a elite de montevideu votou'), A('a terceira razao') - 0.1, 'voto', P.montevideo, { dx: 100, dy: -60 });
  const tR3 = A('a terceira razao');
  chap(tR3, '3', 'O Congresso de 1821'); noYear(tR3);
  word(A('um congresso aqui era'), A('em abril daquele ano') - 0.1, 'CONGRESSO', 'reunião', { meaning: 'representantes decidindo o futuro da região', x: 1180 });
  const tAbril = A('em abril daquele ano');
  tl(tAbril, tAbril + 2.4, 1821, { from: 1817 });
  cam(tAbril + 2.4, [-25, 5], 110, 0.3); cam(tAbril + 2.6, [-22, 10], 100, 2.4);
  route('volta', A('dez dias depois'), A('dez dias depois') + 2.4, [P.rio, [-30, 0], [-20, 25], P.lisboa], { icon: 'ship', color: PT });
  const tJul = A('em julho os deputados');
  cam(tJul, P.montevideo, 1.6, 1.8); pin(tJul + 0.3, P.montevideo, 'Montevidéu'); year(tJul, 1821, 1820);
  num(A('eram doze no comeco'), A('entre eles havia') - 0.1, 12, 'deputados, todos da Banda Oriental', { color: UY });
  person(A('chamado larranhaga') - 0.4, A('no dia dezoito de julho') - 0.1, 'Dámaso Larrañaga', 'Padre respeitado', { img: 'r_larranaga', side: 'right' });
  const t18 = A('no dia dezoito de julho'); unpin(t18);
  cam(t18, [-50, -24], 34, 1.8);
  pill(t18 + 0.2, A('a banda oriental passaria') - 0.1, '18 de julho: todos votam do mesmo lado');
  hl(A('a banda oriental passaria'), A('ninguem se levantou') + 1.5, 'Brazil', BR, { alpha: 0.8 });
  hl(A('a banda oriental passaria') + 0.3, A('ninguem se levantou') + 1.5, 'Uruguay', BR, { lift: 22 });
  hl(A('reino unido de portugal'), A('ninguem se levantou') + 1.5, 'Portugal', PT, { solid: true });
  pill(A('reino unido de portugal'), A('ninguem se levantou') + 1.5, 'Parte do Reino Unido de Portugal, Brasil e Algarves');
  const tArg = A('os argumentos deles eram praticos');
  cam(tArg, P.montevideo, 1.8, 2); noYear(tArg);
  hl(tArg, A('na hora de se unir'), 'Uruguay', UY, { alpha: 0.7 });
  icon(A('temia que os ricos fossem embora'), A('mas atencao') - 0.1, 'ouro', P.montevideo, { dx: -110, dy: -50 });
  icon(A('faria os negocios voltarem'), A('mas atencao') - 0.1, 'moeda', P.montevideo, { dx: 110, dy: -50 });
  list(A('eles so aceitaram com condicoes'), A('na hora de se unir') - 0.1, 'As condições do Congresso', [
    { name: 'O espanhol continua', sub: 'a língua da região', color: ES, at: A('a regiao manteria o espanhol') },
    { name: 'Leis e costumes locais', sub: 'nada de leis de fora', color: UY, at: A('junto com as leis') },
    { name: 'Cargos para gente da terra', sub: 'a maior parte do governo', color: RS, at: A('a maior parte dos cargos') },
    { name: 'Recrutas só na região', sub: 'jovens não iam para longe', color: BR, at: A('e os jovens recrutados') }]);
  word(A('na hora de se unir'), A('ate os registros') - 0.1, 'A PRIMEIRA GARANTIA', 'Español', { meaning: 'a língua veio antes de tudo', icon: 'idiomas' });
  clip(A('ate os registros'), A('a provincia ganhou um nome novo') - 0.05, 'pena', { cap: 'Até as atas do Congresso', sub: 'escritas em espanhol', dark: 0.15 });
  photo(A('a provincia ganhou um nome novo'), A('provincia aqui e como') + 1.5, 'b_bandeira_cis', 'Estado Cisplatino', { sub: 'bandeira da província', w: 520 });
  cam(A('a provincia ganhou um nome novo'), [-56, -33], 8, 2);
  hl(A('a provincia ganhou um nome novo'), A('quantas pessoas voce acha') - 0.2, 'Uruguay', BR);
  word(A('cis quer dizer'), A('platina vem do rio da prata') + 0.1, 'CIS', 'do lado de cá', { x: 90, y: 250 });
  word(A('platina vem do rio da prata'), A('cisplatina quer dizer entao') + 2.5, 'PLATINA', 'rio da Prata', { x: 90, y: 250 });
  const tAbr = A('se voce abrisse um mapa');
  cam(tAbr, [-56, -32.5], 9.5, 1.6);
  label(tAbr + 0.3, A('quantas pessoas voce acha') - 0.2, P.uyCentro, 'Cisplatina', { size: 34 });
  label(A('o limite norte era'), A('quantas pessoas voce acha') - 0.2, [-56.9, -30.15], 'rio Quaraí', { size: 22 });
  label(A('ao sul ficava'), A('quantas pessoas voce acha') - 0.2, [-56.6, -35.4], 'rio da Prata', { size: 22, light: true });
  label(A('ao oeste o rio uruguai'), A('quantas pessoas voce acha') - 0.2, [-58.9, -32.2], 'rio Uruguai', { size: 22 });
  label(A('e ao leste o oceano'), A('quantas pessoas voce acha') - 0.2, [-52.6, -34.3], 'Oceano Atlântico', { size: 22, light: true });
  const tQnt = A('quantas pessoas voce acha');
  num(tQnt, A('quinhentas mil') - 0.1, 1000000, 'habitantes?', { color: C.cinza, raw: '1 milhão?' });
  num(A('quinhentas mil'), A('os historiadores falam') - 0.1, 500000, 'habitantes?', { color: C.cinza, raw: '500 mil?' });
  num(A('os historiadores falam'), A('e nao era so o governo') - 0.1, 75000, 'habitantes em toda a Cisplatina', { from: 500000, color: UY });
  pill(A('isso e menos gente'), A('e nao era so o governo') - 0.1, 'Menos que muitas cidades médias do Brasil');
  clip(A('os jornais e os documentos'), A('ate a edicao vinda') - 0.05, 'pena2', { cap: 'Jornais e documentos', sub: 'quase todos em espanhol', dark: 0.15 });
  const tEd = A('ate a edicao vinda');
  cam(tEd, [-48, -28], 26, 1.6); route('noticia', tEd + 0.2, tEd + 2.4, [P.rio, [-49, -30], P.montevideo], { icon: 'jornal', color: BR });
  pill(A('foi lida em portugues'), A('com tao pouca gente') - 0.1, 'A exceção: a notícia da independência, em português');
  const tPouca = A('com tao pouca gente');
  cam(tPouca, P.montevideo, 2.5, 2.5); hl(tPouca, A('a quarta razao') - 0.2, 'Uruguay', ES);
  pill(A('trocar a lingua seria'), A('a quarta razao') - 0.1, 'Trocar a língua seria quase impossível');

  // ===== RAZÃO 4: O BRASIL OCUPADO =====
  const tR4 = A('a quarta razao');
  chap(tR4, '4', 'O Brasil estava ocupado');
  const t1822 = A('em mil oitocentos e vinte e dois o brasil');
  tl(t1822, t1822 + 2.3, 1822, { from: 1821 });
  full(t1822 + 2.3, A('e em montevideu a confusao') - 0.05, 'p_independencia', 'Independência ou Morte', { sub: 'Pedro Américo, 1888', kb: [0.6, 0.45, 1.04, 0.45, 0.45, 1.18] });
  person(A('dom pedro primeiro virou imperador') - 0.2, A('e em montevideu a confusao') - 0.1, 'Dom Pedro I', 'Imperador do Brasil', { img: 'r_pedro1', side: 'right' });
  const tConf = A('e em montevideu a confusao');
  cam(tConf, P.montevideo, 1.8, 2); pin(tConf + 0.2, P.montevideo, 'Montevidéu');
  swarm(A('soldados portugueses e soldados'), A('em marco de mil oitocentos') - 0.2, [-56.0, -34.55], 0.25, 18, PT, 1.2, 3);
  swarm(A('e soldados brasileiros'), A('em marco de mil oitocentos') - 0.2, [-55.5, -34.55], 0.25, 18, BR, 1.2, 5);
  pill(A('os dois lados viraram inimigos'), A('em marco de mil oitocentos') - 0.1, 'Portugueses × brasileiros', ES);
  year(A('em marco de mil oitocentos'), 1822, 1821);
  word(A('motim e quando'), A('o proprio lecor teve') - 0.1, 'MOTIM', 'soldados contra os chefes', { x: 1180 });
  pill(A('em outubro ele declarou'), A('em mil oitocentos e vinte e tres as tropas') - 0.1, 'Lecor fica com Dom Pedro', BR);
  const t1823 = A('em mil oitocentos e vinte e tres as tropas');
  year(t1823, 1823); cam(t1823, [-56.1, -34.85], 1.6, 2.5);
  icon(A('cercada por terra'), A('em fevereiro de mil') - 0.1, 'soldado', [-56.1, -34.75], { dx: 0, dy: -40 });
  icon(A('e por mar'), A('em fevereiro de mil') - 0.1, 'navio', [-56.15, -35.05], { sea: true });
  const t1824 = A('em fevereiro de mil');
  year(t1824, 1824); cam(t1824, [-35, -10], 95, 1.6); unpin(t1824);
  route('saida', t1824 + 0.4, t1824 + 3, [P.montevideo, [-40, -25], [-20, 15], P.lisboa], { icon: 'ship', color: PT });
  const tMaio = A('em maio do mesmo ano');
  cam(tMaio, [-52, -22], 40, 1.6);
  hl(tMaio + 0.1, A('veja o que isso significa'), 'Brazil', BR, { alpha: 0.8 });
  hl(tMaio + 0.6, A('veja o que isso significa'), 'Uruguay', BR, { lift: 24, pulse: C.ipe });
  pill(A('foi a ultima provincia'), A('veja o que isso significa') - 0.1, 'A última província a aceitar Dom Pedro');
  noYear(A('veja o que isso significa'));
  const tVeja = A('veja o que isso significa');
  cam(tVeja, P.montevideo, 2.2, 2);
  pill(A('quase nao sobrou tempo'), A('ao mesmo tempo o imperio') - 0.1, 'Sem tempo para ensinar português');
  const tImp = A('ao mesmo tempo o imperio');
  cam(tImp, [-45, -20], 42, 2.2);
  hl(A('no nordeste tambem'), A('um governo que vive') + 0.5, 'PE', ES); label(A('no nordeste tambem') + 0.3, A('a confederacao do equador') - 0.1, [-37.8, -8.4], 'Pernambuco', { size: 26 });
  icon(A('estourou uma revolta'), A('a confederacao do equador') - 0.1, 'fogo', P.recife, { dx: -80, dy: 0 });
  full(A('a confederacao do equador'), A('um governo que vive') - 0.05, 'p_frei_caneca', 'Confederação do Equador, 1824', { sub: 'A execução de Frei Caneca · Murillo La Greca', fit: true });
  const tApag = A('um governo que vive');
  cam(tApag, [-50, -26], 34, 2);
  pill(tApag + 0.2, A('se o video esta valendo') - 0.1, 'Governo apagando incêndio não troca língua');
  pill(A('se o video esta valendo'), A('agora vem a parte do bolso') - 0.1, 'Gostando? Deixa o seu like', RS);

  // ===== RAZÃO 5: O DINHEIRO =====
  const tBolso = A('agora vem a parte do bolso');
  cam(tBolso, P.montevideo, 3, 2);
  const tR5 = A('a quinta razao');
  chap(tR5, '5', 'O dinheiro');
  icon(A('deixou promessas sem cumprir'), A('e o comercio de couro') - 0.1, 'papel', P.montevideo, { dx: 100, dy: -60, cross: A('deixou promessas sem cumprir') + 1 });
  clip(A('e o comercio de couro'), A('couro e a pele do boi') - 0.05, 'gado', { cap: 'Couro: uma das maiores riquezas da região' });
  word(A('couro e a pele do boi'), A('naquela terra de campos') + 0.3, 'COURO', 'a pele do boi', { icon: 'boi' });
  cam(A('couro e a pele do boi'), [-55, -32], 9, 2);
  clip(A('naquela terra de campos'), A('se o negocio do couro') - 0.05, 'vaca', { cap: 'Campos enormes, gado por toda parte' });
  full(A('se o negocio do couro'), A('o descontentamento cresceu') - 0.05, 'p_saladero', 'Saladero no século XIX', { sub: 'onde o boi virava couro e charque · Charles Pellegrini', kb: [0.4, 0.5, 1.05, 0.6, 0.5, 1.15] });
  const tDesc = A('o descontentamento cresceu');
  cam(tDesc, [-54.5, -32], 9.5, 2);
  route('couro', tDesc - 0.1, tDesc + 2.6, [P.montevideo, [-54, -33], [-52.5, -31.5], P.portoAlegre], { icon: 'boi', color: RS });
  label(tDesc + 0.4, A('nao deu certo') + 1, [-52.2, -29.6], 'Rio Grande do Sul', { size: 24 });
  year(A('em mil oitocentos e vinte e tres uma sociedade'), 1823);
  pill(A('os cavaleiros orientais'), A('nao deu certo') + 0.6, 'Cavaleiros Orientais: um golpe secreto');
  icon(A('tentou dar um golpe'), A('mas a semente') + 1, 'espada', [-56.2, -34.5], { dx: 60, dy: -60, cross: A('nao deu certo') });
  noYear(A('pense no que isso significava'));
  const tPense = A('pense no que isso significava');
  cam(tPense, P.montevideo, 1.6, 2.5); pin(tPense, P.montevideo, 'Montevidéu');
  pill(A('era como se o governo prometesse'), A('percebe o padrao') - 0.1, 'Prometia uma coisa e levava o negócio embora');
  row(A('percebe o padrao'), A('e o outro lado tinha') - 0.1, [
    { img: 'heart-handshake', label: 'Precisava de paz', at: A('quando precisava de paz') - 0.3 },
    { img: 'papel', label: 'Promessas', at: A('nao entregou o que prometeu') - 0.3, cross: A('nao entregou o que prometeu') + 0.6 },
    { img: 'bandeira', label: 'Outro lado', at: A('ela comecou a olhar') }]);
  const tOutro = A('ela comecou a olhar'); unpin(tOutro);
  cam(tOutro, [-57.5, -34.3], 4, 2); route('olhar', tOutro + 0.2, tOutro + 2, [P.montevideo, [-57.4, -34.95], P.buenosAires], { color: AR });

  // ===== RAZÃO 6: OS 33 =====
  const tR6 = A('a sexta razao');
  chap(tR6, '6', 'Os 33');
  num(A('trinta e tres', tR6), A('no dia dezenove de abril') - 0.1, 33, 'homens', { color: UY });
  const t1825 = A('no dia dezenove de abril');
  tl(t1825, t1825 + 2.2, 1825, { from: 1822 });
  full(t1825 + 2.2, A('o lider era') - 0.05, 'p_33', 'O Juramento dos 33 Orientais', { sub: 'Juan Manuel Blanes, 1877', kb: [0.15, 0.5, 1.12, 0.85, 0.5, 1.12], fin: 0.4 });
  const tLid = A('o lider era');
  cam(tLid - 0.6, [-58.1, -33.6], 2.6, 0.1); cam(tLid, [-58.0, -33.65], 2.2, 3); pin(tLid + 0.2, P.agraciada, 'Praia da Agraciada');
  person(tLid + 0.1, A('e tem um detalhe curioso') - 0.1, 'Juan Antonio Lavalleja', 'Líder dos 33', { img: 'r_lavalleja', side: 'right' });
  pill(A('libertar a banda oriental'), A('e tem um detalhe curioso') - 0.1, 'Missão: libertar a Banda Oriental', UY);
  person(A('frutuoso rivera'), A('isso mostra o tamanho') - 0.1, 'Fructuoso Rivera', 'Mudou de lado', { img: 'r_rivera', side: 'right', years: '1º presidente do Uruguai' });
  const tTam = A('isso mostra o tamanho'); unpin(tTam);
  cam(tTam, [-56.2, -34.1], 2.2, 2);
  const tFlo = A('em agosto de mil oitocentos e vinte e cinco uma');
  year(tFlo, 1825); pin(tFlo + 0.2, P.florida, 'Florida');
  full(A('declarou a independencia em relacao'), A('e pediu para a regiao') - 0.05, 'f_florida', 'Piedra Alta, em Florida', { sub: 'onde a independência foi declarada · cartão-postal antigo', kb: [0.5, 0.5, 1.05, 0.5, 0.45, 1.15] });
  const tUnir = A('e pediu para a regiao');
  cam(tUnir, [-59, -32], 16, 1.6); unpin(tUnir); noYear(tUnir);
  hl(tUnir + 0.2, A('queriam se unir a quem') + 2, 'Argentina', AR); hl(tUnir + 0.5, A('queriam se unir a quem') + 2, 'Uruguay', AR);
  label(tUnir + 0.6, A('repare nisso') + 0.5, [-62, -31], 'Províncias Unidas', { size: 26 });
  pill(A('repare nisso'), A('queriam se unir a quem') - 0.1, 'Eles não queriam virar brasileiros');
  word(A('queriam se unir a quem'), A('o dia vinte e cinco de agosto') - 0.1, 'A MESMA LÍNGUA', 'Español', { x: 1180, icon: 'idiomas' });
  num(A('o dia vinte e cinco de agosto'), A('mas a guerra so estava') - 0.1, 0, 'Dia da Independência do Uruguai', { raw: '25 de agosto', color: UY });

  // ===== RAZÃO 7: A GUERRA =====
  const tR7 = A('a setima razao');
  chap(tR7, '7', 'A guerra'); cam(tR7, [-56.3, -33.4], 6, 1.6); hl(tR7, A('em outubro de mil oitocentos e vinte e cinco os rebeldes') + 0.3, 'Uruguay', UY); pin(tR7 + 1.7, P.sarandi, 'Sarandí');
  const tSar = A('em outubro de mil oitocentos e vinte e cinco os rebeldes');
  full(tSar, A('em dezembro o brasil') - 0.05, 'p_sarandi', 'Batalha de Sarandí, 1825', { sub: 'Juan Manuel Blanes', kb: [0.3, 0.5, 1.06, 0.6, 0.5, 1.2] });
  num(A('com mais de quinhentas perdas'), A('em dezembro o brasil') - 0.1, 500, 'perdas do lado brasileiro', { prefix: '+', color: ES });
  const tDez = A('em dezembro o brasil');
  cam(tDez, [-55, -31], 16, 1.6);
  photo(tDez + 0.1, A('dom pedro primeiro mandou a marinha') - 0.1, 'd_guerra', 'Declaração de guerra', { sub: 'Império do Brasil, dezembro de 1825', side: 'right', w: 500 });
  hl(tDez + 0.3, A('dom pedro primeiro mandou a marinha'), 'Brazil', BR, { alpha: 0.7 }); hl(tDez + 0.5, A('dom pedro primeiro mandou a marinha'), 'Argentina', AR);
  full(A('dom pedro primeiro mandou a marinha'), A('era um jeito de apertar') + 1.2, 'p_naval', 'A esquadra brasileira diante de Buenos Aires', { sub: 'Gaston Roullet', kb: [0.5, 0.5, 1.03, 0.5, 0.5, 1.15] });
  const tAp = A('impedindo os navios');
  cam(tAp - 1.6, [-57.8, -34.7], 2.2, 0.1); cam(tAp - 1.4, [-57.85, -34.72], 1.8, 3); pin(tAp - 1.3, P.buenosAires, 'Buenos Aires');
  for (const [k, lon] of [[0, -57.95], [1, -57.75], [2, -57.55]]) icon(tAp - 1.2 + k * 0.25, A('a maior batalha') - 0.1, 'navio', [lon, -34.82], { sea: true, size: 80 });
  const t1827 = A('a maior batalha'); unpin(t1827);
  tl(t1827, t1827 + 2.3, 1827, { from: 1825 });
  full(t1827 + 2.3, A('cerca de cinco mil') - 0.05, 'p_ituzaingo', 'Passo do Rosário (Ituzaingó), 1827', { sub: 'José Wasth Rodrigues', kb: [0.5, 0.5, 1.04, 0.5, 0.4, 1.16] });
  const tCinco = A('cerca de cinco mil');
  cam(tCinco, P.rosario, 2.6, 2); pin(tCinco, P.rosario, 'Passo do Rosário');
  swarm(tCinco + 0.2, A('mas nenhum dos dois') - 0.2, [-55.25, -30.3], 0.18, 10, BR, 1, 3);
  swarm(A('cerca de oito mil'), A('mas nenhum dos dois') - 0.2, [-54.6, -30.3], 0.2, 16, AR, 1.2, 9);
  pill(A('levou a vitoria no campo'), A('mas nenhum dos dois') - 0.1, 'Vitória das Províncias Unidas no campo', AR);
  pill(A('mas nenhum dos dois'), A('quando vi isso') - 0.1, 'Ninguém tinha força para acabar a guerra');
  const tVi = A('quando vi isso'); unpin(tVi);
  cam(tVi, [-55, -30], 18, 2);
  icon(A('o brasil perdeu dinheiro'), A('em buenos aires a coisa') - 0.1, 'queda', [-51.5, -29.5], { dx: 0, dy: -40 });
  hl(A('o rio grande do sul foi o mais'), A('em buenos aires a coisa') - 0.1, 'RS', RS);
  swarm(A('chamava homens a forca'), A('em buenos aires a coisa') - 0.1, [-53, -29.8], 0.9, 18, BR, 1.2, 4);
  const tBA = A('em buenos aires a coisa');
  cam(tBA, P.buenosAires, 2.6, 2); pin(tBA, P.buenosAires, 'Buenos Aires');
  num(A('a renda da alfandega'), A('o presidente rivadavia') - 0.1, 0, 'da renda da alfândega restou', { raw: 'menos de 1/5', color: ES });
  person(A('o presidente rivadavia'), A('e para dom pedro primeiro') - 0.1, 'Bernardino Rivadavia', 'Renunciou', { img: 'r_rivadavia', side: 'right' });
  pill(A('e para dom pedro primeiro'), A('em mil oitocentos e trinta e um ele') - 0.1, 'E Dom Pedro I também pagou o preço');
  full(A('em mil oitocentos e trinta e um ele'), A('para acabar com tudo isso') - 0.05, 'p_abdicacao', 'Dom Pedro I abdica, 1831', { sub: 'Aurélio de Figueiredo', kb: [0.5, 0.45, 1.04, 0.5, 0.45, 1.16] });

  // ===== RAZÃO 8: A INGLATERRA =====
  const tFim = A('para acabar com tudo isso'); unpin(tFim);
  cam(tFim, [-30, 10], 115, 2);
  const tR8 = A('a oitava razao');
  chap(tR8, '8', 'A Inglaterra');
  hl(A('da inglaterra'), A('a ideia deles era criar') - 0.2, 'United Kingdom', GB, { solid: true });
  route('ingleses', A('os ingleses queriam'), A('os ingleses queriam') + 3, [P.londres, [-15, 30], [-30, 0], [-50, -30], [-56.5, -35.2]], { icon: 'ship', color: GB });
  pill(A('nao gostavam da ideia'), A('entao entraram como') - 0.1, 'Ninguém podia mandar em tudo');
  person(A('entao entraram como'), A('a ideia deles era criar') + 0.4, 'Lord Ponsonby', 'Diplomata inglês', { img: 'r_ponsonby' });
  const tIdeia = A('a ideia deles era criar');
  cam(tIdeia, [-56, -30], 22, 2);
  hl(tIdeia + 0.2, A('em agosto de mil oitocentos e vinte e oito') - 0.1, 'Brazil', BR); hl(tIdeia + 0.4, A('em agosto de mil oitocentos e vinte e oito') - 0.1, 'Argentina', AR);
  hl(A('um pais pequeno no meio'), A('em agosto de mil oitocentos e vinte e oito') - 0.1, 'Uruguay', C.branco, { lift: 26 });
  word(A('um amortecedor'), A('diz a tradicao') - 0.1, 'AMORTECEDOR', 'um país no meio', { meaning: 'para o Brasil e a Argentina não se baterem', x: 1180, icon: 'shield' });
  quote(A('chamou isso de um algodao'), A('em agosto de mil oitocentos e vinte e oito') - 0.1, 'Um algodão entre\ndois cristais', { by: 'frase atribuída a um diplomata inglês', icon: 'cristal' });
  const t1828 = A('em agosto de mil oitocentos e vinte e oito');
  tl(t1828, t1828 + 2.3, 1828, { from: 1827 });
  const tNovo = A('a cisplatina virou um pais');
  cam(t1828 + 2.3, [-56, -32.6], 10, 0.2); cam(t1828 + 2.5, [-56, -32.8], 8.5, 3);
  hl(t1828 + 2.4, A('o novo pais aprovou') - 0.1, 'Uruguay', UY, { lift: 26 });
  label(tNovo, A('o brasil tambem garantiu') + 0.2, P.uyCentro, 'Uruguai', { size: 40 });
  pill(tNovo + 0.4, A('o brasil tambem garantiu') - 0.1, 'República Oriental do Uruguai', UY);
  const tGar = A('o brasil tambem garantiu');
  cam(tGar, [-56, -31], 14, 2);
  for (const [k, lon] of [[0, -57.4], [1, -56.9]]) icon(tGar + 0.3 + k * 0.3, A('e segundo os historiadores') + 0.6, 'navio', [lon, -35.0], { sea: true, size: 80 });
  blob(A('missoes jesuiticas'), A('o novo pais aprovou') - 0.1, P.missoes, 1.1, BR); label(A('missoes jesuiticas') + 0.3, A('o novo pais aprovou') - 0.1, P.missoes, 'Missões', { size: 24 });
  const t1830 = A('o novo pais aprovou');
  tl(t1830, t1830 + 2.5, 1830, { from: 1828 });
  full(t1830 + 2.5, A('resumindo') - 0.05, 'p_jura_1830', 'Jura da Constituição, 18 de julho de 1830', { sub: 'feriado no Uruguai até hoje · estudo de Juan Manuel Blanes', kb: [0.5, 0.5, 1.03, 0.5, 0.45, 1.15] });
  const tRes = A('resumindo');
  cam(tRes, [-55, -31], 15, 2);
  hl(tRes, A('vamos fazer uma pausa') - 0.2, 'Uruguay', UY); hl(tRes, A('vamos fazer uma pausa') - 0.2, 'Brazil', BR, { alpha: 0.6 });
  pill(A('montevideu saiu do mapa'), A('mas a lingua nunca') - 0.1, 'O Brasil perdeu uma guerra que não ganhava');
  pill(A('mas a lingua nunca'), A('e o sonho brasileiro') - 0.1, 'A língua nunca saiu do lugar', ES);
  pill(A('ainda tinha vontade'), A('vamos fazer uma pausa') - 0.1, 'Dom Pedro II ainda sonhava com o Uruguai');

  // ===== RECAPITULANDO =====
  const tRec = A('vamos fazer uma pausa');
  cam(tRec, [-56, -32.5], 11, 3);
  list(A('ja sao oito razoes'), A('mas falta a razao') - 0.1, 'As 8 razões até aqui', [
    { name: 'Entregue sem luta', sub: 'Montevidéu se rendeu', color: ES, at: A('a cidade foi entregue sem luta') },
    { name: 'Virou parente da elite', sub: 'o casamento de Lecor', color: RS, at: A('o governador virou parente') },
    { name: 'O Congresso garantiu o espanhol', sub: '1821', color: UY, at: A('o congresso garantiu') },
    { name: 'O Brasil ocupado', sub: 'outras brigas', color: BR, at: A('o brasil estava ocupado') },
    { name: 'O comércio desviado', sub: 'o couro foi para o Sul', color: BA, at: A('o comercio foi desviado') },
    { name: 'Os 33', sub: '1825', color: AR, at: A('trinta e tres homens se levantaram') },
    { name: 'A guerra', sub: 'esgotou todo mundo', color: PT, at: A('a guerra esgotou') },
    { name: 'A Inglaterra', sub: 'um país no meio', color: GB, at: A('e a inglaterra criou') }], { y: 70 });

  // ===== RAZÃO 9: A ESCOLA =====
  const tR9 = A('a nona razao');
  chap(tR9, '9', 'A escola');
  cam(tR9, [-56, -32], 9, 2);
  hl(tR9, A('mas no norte do uruguai') + 0.3, 'Uruguay', ES, { alpha: 0.7 }); label(tR9 + 0.4, A('mas no norte do uruguai'), [-56.2, -34.3], 'Montevidéu', { size: 26 });
  const tNorte = A('mas no norte do uruguai');
  cam(tNorte, [-55.6, -31.2], 5.5, 2);
  hl(tNorte, A('para eles a fronteira') + 1, 'RS', BR, { alpha: 0.75 });
  blob(tNorte + 0.4, A('e essa escola era toda') + 0.5, P.uyNorte, 0.9, BR);
  label(A('ali o portugues era'), A('em mil oitocentos e setenta e sete') + 0.2, [-55.9, -31.6], 'Português', { size: 28 });
  pill(A('para eles a fronteira'), A('em mil oitocentos e setenta e sete') - 0.1, 'A fronteira era só uma linha no mapa');
  const t1877 = A('em mil oitocentos e setenta e sete');
  year(t1877, 1877, 1830);
  person(A('o uruguai criou a escola'), A('e essa escola era toda') - 0.1, 'José Pedro Varela', 'Criou a escola pública', { img: 'r_varela', years: 'gratuita e obrigatória' });
  const tToda = A('e essa escola era toda');
  icon(tToda, A('se voce viu o video sobre o alemao') - 0.2, 'escola', [-55.7, -31.0], { dx: -80, dy: 0 });
  blob(tToda + 0.3, A('se voce viu o video sobre o alemao') - 0.1, [-56.3, -33.3], 1.6, ES, { r1: 2.4 });
  pill(A('o principal lugar onde o espanhol'), A('ou seja o governo do uruguai') - 0.1, 'A escola levou o espanhol até a fronteira', ES);
  noYear(A('ou seja o governo do uruguai'));
  const tAlem = A('se voce viu o video sobre o alemao');
  cam(tAlem, [-51.5, -28.5], 12, 2);
  hl(tAlem + 0.2, A('quem controla a escola') - 0.1, 'RS', RS); hl(tAlem + 0.4, A('quem controla a escola') - 0.1, 'SC', C.lilas);
  pill(tAlem + 0.4, A('quem controla a escola') - 0.1, 'No Sul do Brasil, a escola também foi a chave');
  quote(A('quem controla a escola'), A('eu achava que a lingua') - 0.1, 'Quem controla a escola\ncontrola a língua das crianças.', { icon: 'escola' });
  pill(A('eu achava que a lingua'), A('e agora o que eu prometi') - 0.1, 'A língua se decide na sala de aula');

  // ===== A FRONTEIRA DA PAZ =====
  const tProm = A('e agora o que eu prometi');
  cam(tProm, [-55.6, -31], 3.5, 2);
  const tGem = A('existem cidades gemeas');
  cam(tGem, [-55.53, -30.89], 0.6, 2.4);
  label(A('rivera no uruguai'), A('nao tem muro') + 0.3, [-55.6, -30.93], 'Rivera', { size: 30 });
  label(A('e santana do livramento'), A('nao tem muro') + 0.3, [-55.46, -30.86], 'Santana do Livramento', { size: 26 });
  full(A('nao tem muro'), A('existem outros pares') - 0.05, 'f_plaza_int', 'Praça Internacional', { sub: 'é só atravessar a rua', kb: [0.5, 0.5, 1.04, 0.5, 0.45, 1.16] });
  const tPares = A('existem outros pares');
  cam(tPares, [-55, -32], 7, 2);
  pin(A('como artigas e quarai'), P.quarai, 'Artigas | Quaraí', { city: false });
  pin(A('e chuy e chui') - 0.2, P.chuy, 'Chuy | Chuí', { city: false });
  full(A('e chuy e chui') + 0.6, A('nessa regiao cerca de') - 0.05, 'f_quarai', 'Fronteira da Paz', { sub: 'Quaraí e Artigas · sem barreira para cruzar', kb: [0.5, 0.5, 1.05, 0.55, 0.45, 1.16] });
  const tTrinta = A('nessa regiao cerca de'); unpin(tTrinta);
  cam(tTrinta, [-55.5, -31.2], 4, 2);
  blob(tTrinta, A('nas cidades os mais jovens') + 1, P.uyNorte, 0.8, BR);
  num(A('cerca de trinta mil pessoas'), A('os linguistas chamam') - 0.1, 30000, 'falam português como língua materna', { color: BR });
  word(A('os linguistas chamam'), A('e uma fala parecida') - 0.1, 'OS LINGUISTAS CHAMAM', 'Fronteiriço', { pt: 'o povo chama de portunhol', x: 1180 });
  clip(A('e uma fala parecida'), A('nas cidades os mais jovens') - 0.05, 'mate', { cap: 'Igual ao campo do Rio Grande do Sul' });
  const tJov = A('nas cidades os mais jovens');
  cam(tJov, [-53.5, -30.6], 8, 2.4);
  pill(tJov + 0.2, A('ja a fala do campo') - 0.1, 'Os jovens falam cada vez mais como o resto do Brasil');
  pill(A('ja a fala do campo'), A('em mil novecentos e oitenta e sete') - 0.1, 'No campo, o jeito antigo de falar', RS);
  quote(A('em mil novecentos e oitenta e sete'), A('hoje existem escolas') - 0.1, 'Nós falemo brasilero', { by: 'título de um livro de 1987' });
  clip(A('hoje existem escolas'), A('em dois mil e tres') - 0.05, 'aula', { cap: 'Hoje: escolas com as duas línguas', dark: 0.1 });
  const t2003 = A('em dois mil e tres');
  cam(t2003, [-55.7, -31.6], 5, 2);
  num(t2003, A('em dois mil e nove') - 0.1, 5, 'escolas experimentais em 2003', { color: UY });
  num(A('em dois mil e nove'), A('a lingua que a escola') - 0.1, 36, 'escolas e mais de 7 mil crianças em 2009', { from: 5, color: BR });
  pill(A('a lingua que a escola'), A('essa foi a parte que mais me impressionou') + 0.6, 'A língua que a escola calou volta para a sala de aula', BR);

  // ===== FECHAMENTO =====
  const tPais = A('um pais inteiro de lingua');
  cam(tPais, [-56, -32.6], 9, 2.4);
  hl(tPais, A('e tem mais uma prova') - 0.1, 'Uruguay', ES);
  blob(tPais + 0.4, A('e tem mais uma prova') - 0.1, P.uyNorte, 0.9, BR);
  label(A('o portugues ficou no norte'), A('e tem mais uma prova') - 0.1, [-55.9, -31.6], 'Português', { size: 26 });
  label(A('e o espanhol ficou'), A('e tem mais uma prova') - 0.1, [-56.2, -33.6], 'Español', { size: 30 });
  const tProva = A('e tem mais uma prova');
  hl(tProva, A('no fim das contas') - 0.1, 'Uruguay', UY);
  label(A('o nome oficial e'), A('no fim das contas') - 0.1, P.uyCentro, 'República Oriental', { size: 30 });
  word(A('oriental quer dizer'), A('todo documento uruguaio') + 0.6, 'ORIENTAL', 'do lado leste', { meaning: 'a velha Banda Oriental, do começo do vídeo', x: 1180 });
  clip(A('no fim das contas'), A('a elite de montevideu aceitou') - 0.05, 'ondasFim', { cap: 'O espanhol continuou porque nunca saiu' });
  const tElite = A('a elite de montevideu aceitou');
  cam(tElite, P.montevideo, 2.2, 2.5); pin(tElite, P.montevideo, 'Montevidéu');
  pill(A('o brasil nao teve tempo'), A('se voce viu o video sobre pernambuco') - 0.1, 'Nem tempo, nem gente, nem escola');
  const tPE = A('se voce viu o video sobre pernambuco'); unpin(tPE);
  cam(tPE, [-45, -20], 44, 2.4);
  hl(tPE + 0.3, A('e a lingua e do povo') + 1, 'PE', C.caju); label(tPE + 0.5, A('aqui montevideu foi governada') - 0.1, [-37.8, -8.4], 'Pernambuco', { size: 26 });
  pill(A('os holandeses governaram'), A('aqui montevideu foi governada') - 0.1, '24 anos de holandeses: o português ficou');
  hl(A('aqui montevideu foi governada'), A('e a lingua e do povo') + 1, 'Uruguay', UY); label(A('aqui montevideu foi governada') + 0.3, A('e a lingua e do povo') + 1, P.uyCentro, 'Uruguai', { size: 26 });
  pill(A('aqui montevideu foi governada') + 0.2, A('nos dois casos') - 0.1, 'Governo brasileiro: o espanhol ficou');
  pill(A('nos dois casos'), A('e a lingua e do povo') - 0.1, 'Quem mandava era só uma camada por cima do povo');
  clip(A('e a lingua e do povo'), A('agora eu quero saber') - 0.05, 'solFim');
  pill(A('bandeira e fronteira mudam'), A('agora eu quero saber') - 0.1, 'Bandeira e fronteira mudam. A língua, não.');
  const tSaber = A('agora eu quero saber');
  cam(tSaber, [-55.53, -30.89], 1.2, 2.4);
  label(tSaber + 0.3, A('se voce gostou') - 0.1, [-55.6, -30.93], 'Rivera', { size: 28 });
  label(tSaber + 0.5, A('se voce gostou') - 0.1, [-55.46, -30.86], 'Livramento', { size: 26 });
  pill(A('ja foi a santana'), A('se voce gostou') - 0.1, 'Já atravessou essa rua? Conta nos comentários', RS);
  const tInsc = A('se voce gostou'); S.razoes.push({ t: tInsc, hide: true });
  cam(tInsc, [-56, -10], 60, 2.6);
  hl(tInsc, A('no proximo video'), 'Uruguay', UY); hl(tInsc + 0.2, A('no proximo video'), 'Brazil', BR, { alpha: 0.7 });
  pill(tInsc, A('no proximo video') - 0.1, 'Inscreva-se para não perder os próximos mapas', RS);
  const tProx = A('no proximo video');
  cam(tProx, [-56, 4], 12, 2.4);
  hl(tProx + 0.4, 1e9, 'Suriname', C.acai); hl(tProx + 0.6, 1e9, 'Guyana', C.caju); hl(tProx + 0.8, 1e9, 'French Guiana', C.turq, { solid: true });
  S.ends.push({ t0: A('por que o suriname'), t1: A('porque a raiz') - 0.1, next: 'Por que as Guianas não falam\nespanhol nem português?' });
  S.ends.push({ t0: A('porque a raiz') });
  CAM.sort((a, b) => a.t - b.t); S.pins.sort((a, b) => a.t - b.t); S.years.sort((a, b) => a.t - b.t); S.razoes.sort((a, b) => a.t - b.t);
  return S;
}
