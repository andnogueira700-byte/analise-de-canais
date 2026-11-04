// ===== v4: S06 (carta náutica detalhada), S20 (mignatta no padrão), S21 (navio com proa certa) =====
const _T = () => (window.ANIM ? ANIM.t : 0);

// vista superior de um navio (proa para a DIREITA)
function shipTop(ctx, x, y, len, wid, col, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); const L = len / 2, Wd = wid / 2;
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(3, 4, L + 2, Wd + 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-L, -Wd * .8); ctx.lineTo(L * .55, -Wd); ctx.quadraticCurveTo(L * .95, -Wd * .5, L, 0); ctx.quadraticCurveTo(L * .95, Wd * .5, L * .55, Wd); ctx.lineTo(-L, Wd * .8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-L * .85, -Wd * .25, L * 1.7, Wd * .5);
  if (!o.small) { ctx.fillStyle = 'rgba(0,0,0,.45)'; for (const tx of [-.55, -.3, .3, .55]) { ctx.beginPath(); ctx.ellipse(L * tx, 0, Wd * .42, Wd * .42, 0, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-L * .12, -Wd * .35, L * .24, Wd * .7); }
  ctx.restore();
}

function harborChart(ctx, o = {}) {
  const t = _T();
  // papel de carta náutica envelhecido
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#d9cfae'); bg.addColorStop(1, '#cdbf98'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // mar (água rasa/funda)
  const sea0 = ctx.createLinearGradient(0, 0, 0, 420); sea0.addColorStop(0, '#a9c3c4'); sea0.addColorStop(1, '#c4d6cf');
  const coast = () => { ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(150, 352); ctx.quadraticCurveTo(300, 345, 420, 360); ctx.lineTo(600, 372); ctx.quadraticCurveTo(700, 360, 735, 300); ctx.lineTo(760, 260); ctx.quadraticCurveTo(775, 235, 800, 250); ctx.lineTo(830, 320); ctx.lineTo(960, 350); ctx.lineTo(960, 0); ctx.lineTo(0, 0); ctx.closePath(); };
  ctx.fillStyle = sea0; coast(); ctx.fill();
  // isóbatas (linhas de profundidade) e soundings
  ctx.strokeStyle = 'rgba(70,110,120,.4)'; ctx.lineWidth = 1.1; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(0, 300 - k * 70); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, 300 - k * 70 + Math.sin(x * .012 + k) * 14); ctx.stroke(); }
  const r = rng(31); ctx.fillStyle = 'rgba(40,80,90,.7)'; ctx.font = '500 11px CormI'; for (let i = 0; i < 46; i++) { const px = r() * W, py = r() * 330; ctx.fillText(String(8 + (r() * 70 | 0)), px, py); }
  // costa: terra com hachuras
  ctx.save(); coast(); ctx.clip(); ctx.fillStyle = '#e8d9a8'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(150, 352); ctx.quadraticCurveTo(300, 345, 420, 360); ctx.lineTo(600, 372); ctx.quadraticCurveTo(700, 360, 735, 300); ctx.lineTo(760, 260); ctx.quadraticCurveTo(775, 235, 800, 250); ctx.lineTo(830, 320); ctx.lineTo(960, 350); ctx.lineTo(960, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#e8d9a8'; ctx.fill(); ctx.clip();
  // quarteirões da cidade
  const rr = rng(77); for (let gx = 0; gx < W; gx += 34) for (let gy = 392; gy < H; gy += 30) { if (rr() < .12) continue; ctx.fillStyle = rr() < .5 ? '#cdb98a' : '#bfa974'; ctx.fillRect(gx + 2, gy + 2, 28 + rr() * 4, 22 + rr() * 4); }
  ctx.restore();
  ctx.strokeStyle = '#6b5a38'; ctx.lineWidth = 2.2; coast(); ctx.stroke();
  // cais / molhes (lado interno do porto)
  ctx.strokeStyle = '#8a7650'; ctx.lineWidth = 5; ctx.lineCap = 'butt'; for (const [x0, y0, x1, y1] of [[150, 352, 150, 332], [210, 350, 210, 330], [330, 352, 330, 330], [450, 360, 450, 338], [540, 366, 540, 344]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  // quebra-mar (diga foranea): da península para oeste, com abertura de entrada
  ctx.strokeStyle = '#4f4a40'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(748, 262); ctx.lineTo(560, 228); ctx.lineTo(330, 212); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(262, 214); ctx.lineTo(150, 240); ctx.lineTo(90, 275); ctx.stroke();
  ctx.strokeStyle = '#d9cfae'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(748, 262); ctx.lineTo(560, 228); ctx.lineTo(330, 212); ctx.moveTo(262, 214); ctx.lineTo(150, 240); ctx.lineTo(90, 275); ctx.stroke(); ctx.setLineDash([]);
  // rede anti-torpedo na entrada (com boias)
  ctx.strokeStyle = '#7a1f1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(330, 212); ctx.lineTo(262, 214); ctx.stroke();
  ctx.fillStyle = '#fff'; for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.arc(330 - i * 13.6, 212 + i * .4, 3.2, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a1f1a'; ctx.lineWidth = 1; ctx.stroke(); }
  // navios fundeados no porto (vista superior), balançando levemente
  const bob = (a) => Math.sin(t * 1.1 + a) * 1.2;
  shipTop(ctx, 468, 296 + bob(0), 118, 24, '#59656f'); shipTop(ctx, 590, 300 + bob(1), 118, 24, '#59656f');
  shipTop(ctx, 360, 308 + bob(2), 60, 12, '#6a747d', { small: true }); shipTop(ctx, 672, 296 + bob(3), 56, 11, '#6a747d', { small: true }); shipTop(ctx, 244, 318 + bob(4), 90, 17, '#4f4a45', { small: true });
  // farol (símbolo de farol náutico com raios) no cabo Ras el-Tin
  const lx = 792, ly = 262; ctx.save(); ctx.translate(lx, ly); ctx.fillStyle = '#fff4c8'; ctx.strokeStyle = '#7a1f1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(122,31,26,.8)'; ctx.lineWidth = 1.6; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + t * .4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.stroke(); } ctx.restore();
  // moldura e graduação
  ctx.strokeStyle = '#3a2d1a'; ctx.lineWidth = 3; ctx.strokeRect(14, 14, W - 28, H - 28); ctx.lineWidth = 1; ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.fillStyle = '#3a2d1a'; for (let x = 22; x < W - 22; x += 24) { ctx.fillRect(x, 14, 1.4, 8); ctx.fillRect(x, H - 22, 1.4, 8); } for (let y = 22; y < H - 22; y += 24) { ctx.fillRect(14, y, 8, 1.4); ctx.fillRect(W - 22, y, 8, 1.4); }
  // rosa dos ventos
  ctx.save(); ctx.translate(886, 96); ctx.strokeStyle = '#3a2d1a'; ctx.fillStyle = '#3a2d1a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(7, 0); ctx.lineTo(0, 42); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(0, 6); ctx.lineTo(42, 0); ctx.lineTo(0, -6); ctx.closePath(); ctx.stroke(); txt(ctx, 'N', 0, -48, { font: '700 14px FiraEC', col: '#3a2d1a', align: 'center', shadow: false }); ctx.restore();
  // rótulos (texto fino, sem cartões)
  const lab = (s, x, y, o2 = {}) => txt(ctx, s, x, y, { font: o2.font || '700 12px FiraEC', ls: o2.ls || '2px', col: o2.col || '#4a3a22', align: o2.align || 'center', shadow: false });
  lab('PORTO OCCIDENTALE', 430, 262, { ls: '4px', font: '700 14px FiraEC' }); lab('ALESSANDRIA', 480, 470, { ls: '8px', font: '700 20px FiraEC', col: '#6b5632' });
  lab('DIGA FORANEA', 470, 206, { col: '#4f4a40' }); lab('SBARRAMENTO', 296, 196, { col: '#7a1f1a', font: '700 11px FiraEC' }); lab('RAS EL-TIN', 806, 296, { align: 'left' }); lab('FARO', 806, 310, { align: 'left', col: '#7a1f1a' });
  lab('QUEEN ELIZABETH', 468, 330, { font: '600 italic 12px CormI', ls: '1px' }); lab('VALIANT', 590, 334, { font: '600 italic 12px CormI', ls: '1px' });
  lab('MAR MEDITERRANEO', 380, 80, { ls: '10px', font: '700 18px FiraEC', col: '#5d7f82' });
  // escala gráfica (1 km = 209 px)
  const km = 209; ctx.fillStyle = '#3a2d1a'; ctx.fillRect(40, 492, km, 4); ctx.fillStyle = '#e8d9a8'; ctx.fillRect(40 + km / 2, 492, km / 2, 4); ctx.strokeStyle = '#3a2d1a'; ctx.lineWidth = 1.2; ctx.strokeRect(40, 492, km, 4); for (const q of [0, .5, 1]) { ctx.beginPath(); ctx.moveTo(40 + q * km, 486); ctx.lineTo(40 + q * km, 498); ctx.stroke(); }
  lab('0', 40, 482, { font: '700 11px FiraEC', ls: '0px' }); lab('1 km', 40 + km, 482, { font: '700 11px FiraEC', ls: '0px' });
  // rota dos operadores: do ponto ao largo até a entrada, depois para dentro
  const P = [[336, 92], [318, 150], [296, 206], [300, 250], [380, 290], [450, 288]];
  const prog = Math.min(1, (o.p == null ? 0 : o.p)); const seg = [];
  ctx.save(); ctx.strokeStyle = '#b3261c'; ctx.lineWidth = 2.6; ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t * 18; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  // medição de 2 km, em linha fina com cota ao lado (nunca sobre a linha)
  ctx.save(); ctx.strokeStyle = '#2b4a6a'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(lx - 10, ly - 6); ctx.stroke(); ctx.setLineDash([]);
  const mx = (P[0][0] + lx) / 2, my = (P[0][1] + ly) / 2; lab('≈ 2 km', mx + 6, my - 16, { col: '#2b4a6a', font: '700 13px FiraEC', ls: '1.4px' }); ctx.restore();
  // os dois homens (ponto + torpedo), indicador pulsante
  const pulse = 1 + .25 * Math.sin(t * 3.2); ctx.save(); ctx.strokeStyle = 'rgba(179,38,28,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P[0][0], P[0][1], 16 * pulse, 0, 7); ctx.stroke(); ctx.fillStyle = '#b3261c'; ctx.beginPath(); ctx.arc(P[0][0], P[0][1], 6, 0, 7); ctx.arc(P[0][0] + 11, P[0][1] + 3, 4.4, 0, 7); ctx.fill(); ctx.restore();
  lab('OPERATORI', P[0][0] + 24, P[0][1] - 10, { align: 'left', col: '#b3261c' }); lab('2 UOMINI · 1 SLC', P[0][0] + 24, P[0][1] + 4, { align: 'left', col: '#6b2a1f', font: '600 11px FiraEC', ls: '1.4px' });
  // legenda
  ctx.fillStyle = 'rgba(230,218,176,.92)'; ctx.fillRect(40, 400, 190, 66); ctx.strokeStyle = '#3a2d1a'; ctx.lineWidth = 1; ctx.strokeRect(40, 400, 190, 66);
  lab('LEGENDA', 52, 416, { align: 'left', font: '700 11px FiraEC', ls: '2px' });
  ctx.strokeStyle = '#b3261c'; ctx.lineWidth = 2.2; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.moveTo(52, 430); ctx.lineTo(88, 430); ctx.stroke(); ctx.setLineDash([]); lab('rotta degli operatori', 96, 434, { align: 'left', font: '500 11px FiraEC', ls: '.6px' });
  ctx.strokeStyle = '#7a1f1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(52, 446); ctx.lineTo(88, 446); ctx.stroke(); lab('rete antisiluro', 96, 450, { align: 'left', font: '500 11px FiraEC', ls: '.6px' });
}

sc2('S06', 'ABERTURA', 7, 7, 'Carta náutica do porto de Alexandria (papel envelhecido, isóbatas, cidade, quebra-mar, rede anti-torpedo na entrada, os dois couraçados fundeados). O ponto vermelho (os dois homens + o SLC) está ~2 km ao largo do farol de Ras el-Tin; a cota "≈ 2 km" fica ao lado da linha de medição, nunca por cima. Os "cartões bege" da versão anterior eram só os quarteirões da cidade desenhados de forma tosca; agora são a cidade de verdade e a carta tem legenda e escala.', 'Vista superior; câmera desce lentamente do mar aberto em direção à entrada do porto.', 'Rótulos finos de carta (sem cartões): farol, diga foranea, rede, Queen Elizabeth, Valiant', 'Sonar baixo, ondas leves.', 'Reescrita: precisão de carta náutica. Geografia esquemática (escala indicativa).', (ctx) => { harborChart(ctx, { p: 0 }); });

// ---------- S20: mignatta no MESMO padrão visual do Maiale (corpo oliva, mergulhadores iguais, de perna só, braços retos) ----------
function mignatta(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? 1 : -1), s); // proa à direita
  const body = '#8d9b82', dk = '#5f6d59', lt = '#b9c6a9', iron = '#3f4a3c';
  // cauda e hélice
  ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(-190, -10); ctx.lineTo(-232, -24); ctx.lineTo(-232, 24); ctx.lineTo(-190, 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = iron; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(-234, 0, 5, 24, 0, 0, 7); ctx.stroke();
  // corpo cilíndrico com aros de cobre
  const g = ctx.createLinearGradient(0, -28, 0, 28); g.addColorStop(0, lt); g.addColorStop(.45, body); g.addColorStop(1, dk); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-196, -28, 372, 56, 26); ctx.fill();
  ctx.strokeStyle = '#a97a44'; ctx.lineWidth = 3.4; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(-170 + i * 25, -28); ctx.lineTo(-170 + i * 25, 28); ctx.stroke(); }
  // duas cargas em tandem na proa
  for (const cx of [180, 262]) { const wg = ctx.createLinearGradient(0, -24, 0, 24); wg.addColorStop(0, '#d38a6c'); wg.addColorStop(.5, '#c8664a'); wg.addColorStop(1, '#6c2a1b'); ctx.fillStyle = wg; ctx.beginPath(); ctx.roundRect(cx - 8, -24, 82, 48, [14, 20, 20, 14]); ctx.fill(); ctx.strokeStyle = iron; ctx.lineWidth = 2; ctx.stroke(); }
  // leme e volante simples
  ctx.strokeStyle = iron; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -28); ctx.lineTo(-60, -44); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-60, -48, 9, 3.4, 0, 0, 7); ctx.stroke();
  ctx.restore();
  // operadores iguais aos do Maiale: montados, só a perna próxima, braços retos, sem respirador visível
  const sg = (o.flip ? 1 : -1);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sg, s);
  diver(ctx, -10, -26, .95, { flip: true, hand: [30, -30], lean: .3 }); diver(ctx, -104, -26, .95, { flip: true, hand: [30, -30], lean: .22 });
  ctx.restore();
}

sc2('S20', 'AS ORIGENS', 37, 38, 'A MIGNATTA (Rossetti e Paolucci, 1918), agora no mesmo padrão visual do Maiale: corpo oliva, os mesmos dois operadores montados (só a perna próxima, braços retos), indo para a DIREITA com a carga (duas ogivas em tandem, 2×170 kg) À FRENTE e a esteira atrás. Torpedo quase todo submerso; só tronco e cabeça fora d\'água. O couraçado austríaco cresce ao fundo.', 'Plano baixo na água, deriva lenta para a direita; o couraçado cresce ao fundo.', 'ROSSETTI · PAOLUCCI · LA «MIGNATTA» · 1918 (legenda no canto, com fade)', 'Água batendo, ar comprimido sibilando baixo, respiração.', 'Precursor do SLC: mantive a mesma linguagem visual (cor, operadores, direção). Diferença histórica preservada: sem escudo/bancos, cilíndrico com aros de cobre e 2 cargas.', (ctx) => { const hy = nightHarbor(ctx, { horizon: 250, seed: 12, glow: '#6a5a50', skyline: true }); austrianBB(ctx, 740, hy + 70, 1.05, { col: '#16222f', reflect: false, flip: false }); mignatta(ctx, 370, 420, 1.2, { flip: true }); waterOver(ctx, 410, .78); ctx.strokeStyle = 'rgba(210,235,245,.4)'; ctx.lineWidth = 2; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(300 - i * 6, 436, 150 + i * 40, 6 + i * 3, 0, 0, 7); ctx.stroke(); } bubbles(ctx, 110, 440, 6, 5, 1); lowerThird(ctx, 'ROSSETTI · PAOLUCCI', 'LA «MIGNATTA» · 1918'); });

// ---------- S21: Viribus Unitis; proa à DIREITA, popa (bandeira) à esquerda; afunda de popa, proa levantada ----------
sc2('S21', 'AS ORIGENS', 39, 40, 'O couraçado Viribus Unitis (proa à DIREITA, bandeira na popa à ESQUERDA) assentando pela POPA, com a proa se erguendo, mar calmo ao amanhecer; a bandeira da popa já toca a água. Etiqueta de identificação entra e sai; "il precedente" no fim da frase.', 'Câmera recua do casco inclinado.', 'VIRIBUS UNITIS (etiqueta com fade)', 'Estrondo abafado, metal.', 'Corrigido: antes a proa afundava e a bandeira ficava no alto, parecendo ir de ré. Agora proa para a direita e popa afundando.', (ctx) => { const hy = nightHarbor(ctx, { horizon: 330, seed: 14, glow: '#8a5a44', skyline: false }); ctx.save(); ctx.translate(500, hy + 54); ctx.rotate(-.075); austrianBB(ctx, 0, 0, .98, { col: '#34434f', reflect: false }); ctx.restore(); sea(ctx, hy + 40, { top: 'rgba(14,38,58,.85)', bot: '#03090f' }); ctx.strokeStyle = 'rgba(210,235,245,.4)'; ctx.lineWidth = 1.6; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(300 - i * 5, hy + 70 + i * 5, 40 + i * 24, 3 + i * 1.2, 0, 0, 7); ctx.stroke(); } tag(ctx, 'VIRIBUS UNITIS', 60, 50); });
