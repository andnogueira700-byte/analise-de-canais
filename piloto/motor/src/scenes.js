// ===== marcos de tempo (absolutos, vem da narracao real) =====
const tS2 = T[4] - 0.55;            // encosta entra
const tS3 = T[13] + 3.6;            // confronto entra
const tStop = T[14];                // "Si fermarono"
const SP = 54;                      // espacamento da coluna

// ===== MAPA =====
const EURO = ['United Kingdom', 'Ireland', 'France', 'Belgium', 'Netherlands', 'Germany', 'Luxembourg', 'Switzerland', 'Spain', 'Italy', 'Denmark', 'Austria', 'Czechia', 'Poland', 'Norway', 'Sweden', 'Portugal'];
let mapFeats = null, proj, pathGen, grat;
function initMap(ctx) {
  mapFeats = topojson.feature(WORLD, WORLD.objects.countries).features.filter(f => EURO.includes(f.properties.name));
  proj = d3.geoConicConformal().parallels([49, 52]).rotate([-4.2, 0]).clipExtent([[-200, -200], [W + 200, H + 200]]);
  grat = d3.geoGraticule().step([1, 1])();
}
const FONT = [3.4797, 50.5775];
function drawMap(ctx, t) {
  if (!mapFeats) initMap(ctx);
  const z = easeIO(t / (T[5] + 0.2));
  const sc = Math.exp(lerp(Math.log(2300), Math.log(15500), z));
  const ctr = [lerp(3.2, FONT[0] + 0.15, z), lerp(51.8, FONT[1] + 0.05, z)];
  proj.translate([0, 0]).scale(sc);
  const p0 = proj(ctr); proj.translate([W / 2 - p0[0], H / 2 - p0[1]]);
  const path = d3.geoPath(proj, ctx);
  const sea = ctx.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#3a6a86'); sea.addColorStop(1, '#264d68');
  ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.beginPath(); path(grat); ctx.stroke();
  // terra
  for (const f of mapFeats) {
    const be = f.properties.name === 'Belgium';
    ctx.beginPath(); path(f);
    ctx.fillStyle = be ? '#dcb872' : '#e6d8b6'; ctx.fill();
    ctx.lineWidth = be ? 2.6 : 1.4; ctx.strokeStyle = be ? '#7a5a26' : '#b19a68'; ctx.stroke();
  }
  // sombra suave da costa
  ctx.save(); ctx.globalAlpha = .25; ctx.shadowColor = '#0b2230'; ctx.shadowBlur = 14;
  for (const f of mapFeats) { ctx.beginPath(); path(f); ctx.strokeStyle = 'rgba(0,0,0,0)'; ctx.stroke(); }
  ctx.restore();
  // rotulos
  const lab = (txt, ll, a, col = '#6b5632', size = 20) => { const p = proj(ll); if (!p) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = `700 ${size}px FiraEC`; ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.fillText(txt, p[0], p[1]); ctx.restore(); };
  const la = sm(0.35, 0.8, z);
  lab('BELGIO', [4.75, 50.55], la, '#5a4220', 26);
  lab('FRANCIA', [2.2, 49.7], la, '#7b6a46', 24);
  lab('OLANDA', [5.5, 52.0], la, '#7b6a46', 20);
  lab('GERMANIA', [7.6, 50.4], la, '#7b6a46', 20);
  lab('MARE DEL NORD', [2.6, 52.0], la, '#cfe0ea', 16);
  lab('MANICA', [1.0, 50.6], la * .8, '#cfe0ea', 16);
  // Fontenoy
  const mp = proj(FONT); const ma = sm(T[2] - 0.2, T[2] + 0.5, t);
  if (ma > 0 && mp) {
    ctx.save(); ctx.globalAlpha = ma;
    for (let k = 0; k < 3; k++) { const u = ((t * 0.7 + k / 3) % 1); ctx.strokeStyle = `rgba(190,40,34,${(1 - u) * .8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mp[0], mp[1], 10 + u * 48, 0, 7); ctx.stroke(); }
    ctx.fillStyle = '#b8231d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mp[0], mp[1], 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(214,176,110,.10)'; ctx.fillRect(0, 0, W, H);
}

// ===== ENCOSTA (aproximacao) =====
function G(x) { return 628 - 215 * sm(150, 3000, x) + Math.sin(x * 0.0045) * 7 + Math.sin(x * 0.013) * 2.5; }
const MOUNDS = [{ x0: 2410, x1: 3010, h: 30 }, { x0: 2225, x1: 2320, h: 18 }];
function moundH(x) { let h = 0; for (const m of MOUNDS) { if (x > m.x0 && x < m.x1) { const e = Math.min((x - m.x0) / 28, (m.x1 - x) / 28, 1); h = Math.max(h, m.h * clamp(e)); } } return h; }
const CANN = { A: { x: 2475, face: -1 }, B: { x: 2770, face: -1 }, C: { x: 2268, face: -1 }, D: { x: 3050, face: -1 } };
const SHOTS = [{ t: T[7] + 0.28, w: 'A' }, { t: T[7] + 0.62, w: 'B' }, { t: T[8] + 0.2, w: 'C' }, { t: T[8] + 0.55, w: 'D' }, { t: T[9] + 0.45, w: 'A' }, { t: T[9] + 0.95, w: 'B' }];
const HITS = [{ t: T[11] + 0.55, lane: 1, i: 2 }, { t: T[11] + 1.1, lane: 0, i: 4 }, { t: T[11] + 1.6, lane: 2, i: 3 }];
const FLIGHT = 0.8;
const CLOSE0 = T[12] + 0.7, CLOSE1 = CLOSE0 + 1.7;
const LANES = [{ dy: -24, sc: 1.2, off: 0 }, { dy: 0, sc: 1.34, off: 16 }, { dy: 24, sc: 1.48, off: 32 }];
function camY2(cx) { return 0.42 * (G(cx + 640) - 600); }

function xf(t) { return 820 + 1430 * clamp((t - tS2) / (tS3 + 0.25 - tS2)); }
const tFollow = T[10] + 1.3;
function camX2(t) {
  const keys = [[tS2, 0], [T[4] + 0.9, 260], [T[6] + 0.55, 2020], [E[9] - 0.8, 2170], [tFollow, xf(tFollow) - 760]];
  if (t >= tFollow) return xf(t) - 760;
  for (let i = 0; i < keys.length - 1; i++) { const [a, x0] = keys[i], [b, x1] = keys[i + 1]; if (t < b) return lerp(x0, x1, easeIO((t - a) / (b - a))); }
  return keys[0][1];
}
function lanePos(lane, i, t) {
  const L = LANES[lane]; let removedAhead = 0;
  for (const h of HITS) if (h.lane === lane && h.i < i) removedAhead++;
  const cp = easeIO((t - CLOSE0) / (CLOSE1 - CLOSE0));
  return xf(t) - i * SP - L.off + SP * removedAhead * cp;
}

function farHills(ctx, camX, f, base, amp, col, seed, freq) {
  const r = rng(seed); const ph = r() * 9;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 8; x += 8) { const wx = x + camX * f; ctx.lineTo(x, base + Math.sin(wx * freq + ph) * amp + Math.sin(wx * freq * 2.7 + ph * 2) * amp * .35); }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function poplars(ctx, camX, f, base, col, seed) {
  const r = rng(seed);
  for (let i = 0; i < 60; i++) { const wx = i * 97 + r() * 60; const x = wx - camX * f; if (x < -30 || x > W + 30) continue; const h = 34 + r() * 26;
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, base - h / 2 + 4, 7, h / 2, 0, 0, 7); ctx.fill(); }
}

function drawSlope(ctx, t) {
  const camX = camX2(t);
  const zoom = 1 + 0.05 * sm(tS3 - 3, tS3 + .3, t);
  // ceu
  const sky = ctx.createLinearGradient(0, 0, 0, 470); sky.addColorStop(0, '#8fb0c8'); sky.addColorStop(.6, '#cfdcd8'); sky.addColorStop(1, '#f2e6c8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const sunx = 960 - camX * .03; const sg = ctx.createRadialGradient(sunx, 130, 8, sunx, 130, 190); sg.addColorStop(0, 'rgba(255,248,214,.95)'); sg.addColorStop(.25, 'rgba(255,238,190,.5)'); sg.addColorStop(1, 'rgba(255,238,190,0)');
  ctx.fillStyle = sg; ctx.fillRect(sunx - 200, -70, 400, 400); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(sunx, 130, 24, 0, 7); ctx.fill();
  for (let i = 0; i < 6; i++) { const cx = ((i * 330 + t * 9) % 1900) - 200 - camX * .06; cloud(ctx, cx, 90 + (i % 3) * 52, 1 + (i % 2) * .3, 'rgba(255,255,255,.88)'); }
  ctx.save(); ctx.translate(W / 2, H * .72); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H * .72);
  farHills(ctx, camX, .18, 360, 22, '#b9c5c7', 3, .0042);
  farHills(ctx, camX, .32, 400, 20, '#a3b5a8', 8, .0055); poplars(ctx, camX, .32, 404, '#8da28a', 5);
  farHills(ctx, camX, .55, 438, 16, '#8aa37f', 11, .006); poplars(ctx, camX, .55, 442, '#6f8a68', 12);
  // fumaca longe (ao fundo)
  for (let i = 0; i < 3; i++) { const sx = 700 + i * 380 - camX * .5; for (let k = 0; k < 9; k++) { const px = sx + k * 7 + Math.sin(t * .4 + k) * 5, py = 438 - k * 17, rr = 16 + k * 5; const g = ctx.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, 'rgba(112,112,118,.30)'); g.addColorStop(1, 'rgba(112,112,118,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rr, 0, 7); ctx.fill(); } }
  const camY = camY2(camX);
  ctx.save(); ctx.translate(-camX, -camY);
  // chao
  ctx.beginPath(); ctx.moveTo(camX - 60, H + 300);
  for (let x = camX - 60; x <= camX + W + 60; x += 16) ctx.lineTo(x, G(x));
  ctx.lineTo(camX + W + 60, H + 300); ctx.closePath();
  const gr = ctx.createLinearGradient(0, 300, 0, H + 200); gr.addColorStop(0, '#9bb35f'); gr.addColorStop(.35, '#7f9a50'); gr.addColorStop(1, '#52703a'); ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = 'rgba(214,226,140,.55)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = camX - 60; x <= camX + W + 60; x += 16) (x === camX - 60 ? ctx.moveTo(x, G(x)) : ctx.lineTo(x, G(x))); ctx.stroke();
  // sulcos
  for (let k = 1; k < 7; k++) { ctx.strokeStyle = `rgba(60,86,40,${.10 + k * .02})`; ctx.lineWidth = 2 + k * .4; ctx.beginPath(); for (let x = camX - 60; x <= camX + W + 60; x += 24) { const y = G(x) + k * 26 + k * k * 1.5; (x === camX - 60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); } ctx.stroke(); }
  // trilha de terra
  ctx.beginPath(); for (let x = camX - 60; x <= camX + W + 60 && x < 2400; x += 20) { const y = G(x) - 8 - 6 * Math.sin(x * .02); (x === camX - 60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); }
  for (let x = Math.min(camX + W + 60, 2400); x >= camX - 60; x -= 20) ctx.lineTo(x, G(x) + 58 + 4 * Math.sin(x * .017));
  ctx.closePath(); ctx.fillStyle = 'rgba(176,148,98,.55)'; ctx.fill();
  // arbustos e arvores
  { const rb = rng(4242); for (let i = 0; i < 60; i++) { const bx = i * 85 + rb() * 60, by = G(bx) - 14 - rb() * 44 * (i % 2); if (bx < camX - 80 || bx > camX + W + 80) continue; const s0 = 0.7 + rb() * 0.8;
      ctx.fillStyle = i % 3 === 0 ? '#5f7d3f' : '#6c8a48'; ctx.beginPath(); ctx.ellipse(bx, by, 30 * s0, 17 * s0, 0, 0, 7); ctx.ellipse(bx + 20 * s0, by + 3, 22 * s0, 14 * s0, 0, 0, 7); ctx.fill();
      if (i % 5 === 2) { ctx.fillStyle = '#6b4c30'; ctx.fillRect(bx - 3, by - 40 * s0, 6, 40 * s0); ctx.fillStyle = '#58783a'; ctx.beginPath(); ctx.arc(bx, by - 56 * s0, 34 * s0, 0, 7); ctx.arc(bx + 22 * s0, by - 44 * s0, 26 * s0, 0, 7); ctx.arc(bx - 22 * s0, by - 44 * s0, 26 * s0, 0, 7); ctx.fill(); } } }
  // vila (platô)
  const vil = [[3085, 54, 40, '#e8dcc0', '#b3553a'], [3150, 46, 52, '#efe3c8', '#9c4a34'], [3330, 58, 44, '#e5d8ba', '#a4533a'], [3410, 50, 56, '#eadfc2', '#b3553a'], [3485, 60, 42, '#e8dcc0', '#8f4531'], [3560, 52, 50, '#efe3c8', '#b3553a']];
  for (const v of vil) house(ctx, v[0], G(v[0] + 20) + 4, v[1], v[2], v[3], v[4]);
  const cx = 3250, cy = G(cx) + 4; ctx.fillStyle = '#ddd0b2'; ctx.fillRect(cx - 16, cy - 118, 32, 118); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(cx - 20, cy - 118); ctx.lineTo(cx, cy - 170); ctx.lineTo(cx + 20, cy - 118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3e3a36'; ctx.fillRect(cx - 5, cy - 100, 10, 20); ctx.fillStyle = '#efe3c8'; ctx.fillRect(cx - 40, cy - 54, 80, 54); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(cx - 46, cy - 54); ctx.lineTo(cx, cy - 86); ctx.lineTo(cx + 46, cy - 54); ctx.closePath(); ctx.fill();
  // muro do vilarejo fortificado
  ctx.fillStyle = '#a89a80'; ctx.fillRect(3025, G(3050) - 22, 380, 24); ctx.fillStyle = '#3e3a36'; for (let x = 3040; x < 3400; x += 34) ctx.fillRect(x, G(x) - 14, 10, 6);
  ctx.fillStyle = '#8e8068'; for (let x = 3025; x < 3405; x += 22) ctx.fillRect(x, G(x) - 24, 12, 4);
  // infantaria francesa (atras do trincheiramento)
  const fr = [];
  for (let r = 2; r >= 0; r--) for (let i = 0; i < 16; i++) { const x = 2455 + i * 34 + r * 12; fr.push({ x, r, i }); }
  for (const o of fr) { const y = G(o.x) + o.r * 6 - 3; figure(ctx, { x: o.x, y, s: 1.32, coat: '#3a5c9e', facing: -1, idle: t * 2.4 + o.i * 1.3, hatTrim: '#f4f0e6', skin: SKIN[(o.i + o.r) % 4], shadow: false }); }
  flag(ctx, 2590, G(2590) + 8, 1.3, t, '#f3efe2', '#c9a13f'); flag(ctx, 2900, G(2900) + 8, 1.3, t + 1, '#f3efe2', '#c9a13f');
  // trincheiramentos
  for (const m of MOUNDS) {
    ctx.beginPath(); ctx.moveTo(m.x0 - 28, G(m.x0)); for (let x = m.x0 - 28; x <= m.x1 + 28; x += 12) ctx.lineTo(x, G(x) - moundH(x)); ctx.lineTo(m.x1 + 28, G(m.x1) + 20); ctx.lineTo(m.x0 - 28, G(m.x0) + 20); ctx.closePath();
    ctx.fillStyle = '#8b6c46'; ctx.fill(); ctx.strokeStyle = '#664b2d'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(70,50,30,.45)'; ctx.lineWidth = 2; for (let k = 1; k < 3; k++) { ctx.beginPath(); for (let x = m.x0; x <= m.x1; x += 12) { const y = G(x) - moundH(x) + k * 9; (x === m.x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); } ctx.stroke(); }
    ctx.fillStyle = '#5b4228'; for (let x = m.x0 + 8; x < m.x1 - 8; x += 26) { const y = G(x) - moundH(x); ctx.fillRect(x, y - 9, 4, 12); }
  }
  // canhoes + fumaca
  const cy2 = { A: G(CANN.A.x) - moundH(CANN.A.x), B: G(CANN.B.x) - moundH(CANN.B.x), C: G(CANN.C.x) - moundH(CANN.C.x), D: G(CANN.D.x) - 2 };
  for (const k of Object.keys(CANN)) {
    let rec = 0; for (const s of SHOTS) if (s.w === k) { const a = t - s.t; if (a >= 0 && a < .8) rec = Math.max(rec, Math.exp(-a * 7)); }
    cannon(ctx, CANN[k].x, cy2[k], 1.35, CANN[k].face, rec, t);
  }
  SHOTS.forEach((s, n) => { const c = CANN[s.w]; const mx = c.x - 56, my = cy2[s.w] - 40; flash(ctx, mx, my, t - s.t, 1); smoke(ctx, mx, my, t - s.t, 1.3, 100 + n * 17, -1); });
  // coluna britanica
  const col = [];
  for (let lane = 0; lane < 3; lane++) for (let i = 0; i < 28; i++) col.push({ lane, i });
  col.sort((a, b) => LANES[a.lane].dy - LANES[b.lane].dy);
  const hitOf = (lane, i) => HITS.find(h => h.lane === lane && h.i === i);
  // soldados caidos (no chao, ficam para tras)
  for (const h of HITS) { if (t < h.t) continue; const x = lanePosFixed(h); const L = LANES[h.lane]; const u = (t - h.t);
    figure(ctx, { x, y: G(x) + L.dy, s: L.sc, coat: '#b5302a', facing: 1, rot: -(Math.PI / 2) * easeOut(u / .5), alpha: 1 - sm(3.2, 4.4, u), walk: 0, musket: false, skin: SKIN[(h.i + h.lane) % 4] }); }
  for (const o of col) {
    if (hitOf(o.lane, o.i)) { const h = hitOf(o.lane, o.i); if (t >= h.t) continue; }
    const x = lanePos(o.lane, o.i, t); if (x < camX - 90 || x > camX + W + 90) continue;
    const L = LANES[o.lane]; const y = G(x) + L.dy;
    const isOff = o.lane === 1 && o.i === 0, isFlag = o.lane === 0 && o.i === 1;
    figure(ctx, { x, y, s: L.sc, coat: '#b5302a', facing: 1, phase: t * 7.2 + o.i * .9 + o.lane * 1.7, walk: 1, skin: SKIN[(o.i * 3 + o.lane) % 4], officer: isOff, musket: !isFlag, hand: isFlag ? [8, -40] : null });
    if (isFlag) flag(ctx, x + 8 * L.sc, y - 2, L.sc, t, '#c24a3d', '#f1e8d0');
  }
  // bolas de canhao + poeira
  for (const h of HITS) { const x = lanePosFixed(h), L = LANES[h.lane], ty = G(x) + L.dy - 36; const u = (t - (h.t - FLIGHT)) / FLIGHT;
    if (u > 0 && u < 1) { const bx = lerp(x + 1100, x, u), by = lerp(ty - 380, ty, u * u); ctx.strokeStyle = 'rgba(40,40,44,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 42, by - 14); ctx.stroke(); ctx.fillStyle = '#1b1d20'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); }
    smoke(ctx, x, ty + 26, t - h.t, 1.15, 500 + h.i * 31 + h.lane, 0.6); }
  ctx.restore();
  // rotulos (tela)
  const sx = (x) => x - camX; const Gs = (x) => G(x) - camY;
  tag(ctx, t, E[5] - 0.5, E[6] + 1.3, 'FONTENOY', sx(3250) - 60, Gs(3250) - 290, sx(3250), Gs(3250) - 175);
  tag(ctx, t, T[7] - 0.05, E[7] + 0.9, 'CANNONI', sx(2475) - 70, cy2.A - camY - 190, sx(2475), cy2.A - camY - 50);
  tag(ctx, t, T[8] - 0.05, E[8] + 1.0, 'CANNONI', sx(2268) - 30, cy2.C - camY - 170, sx(2268), cy2.C - camY - 50);
  tag(ctx, t, T[8] + 0.2, E[8] + 1.0, 'CANNONI', sx(3050) - 40, cy2.D - camY - 200, sx(3050), cy2.D - camY - 50);
  tag(ctx, t, T[9] + 0.95, E[9] - 0.6, 'TRINCERAMENTI', sx(2700) - 80, cy2.A - camY - 230, sx(2640), cy2.B - camY + 6);
  tag(ctx, t, T[9] + 2.0, E[9] - 0.3, 'VILLAGGIO FORTIFICATO', sx(3180) - 120, Gs(3200) - 250, sx(3200), Gs(3200) - 14);
  ctx.restore();
}
function lanePosFixed(h) { return xf(h.t) - h.i * SP - LANES[h.lane].off; }

// ===== CONFRONTO =====
const FAR = [T[13] + 1.0, T[15] + 0.3, T[17] + 1.2];
function drawFace(ctx, t) {
  // camera
  const zp = easeIO((t - (T[17] - 0.5)) / 2.3);
  const z = lerp(1, 1.5, zp), cx = lerp(640, 738, zp), cy = lerp(360, 540, zp);
  const sky = ctx.createLinearGradient(0, 0, 0, 420); sky.addColorStop(0, '#9db3bf'); sky.addColorStop(.7, '#d9d2bd'); sky.addColorStop(1, '#ecdcb8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  ctx.fillStyle = sky; ctx.fillRect(-400, -400, W + 800, 800);
  for (let i = 0; i < 6; i++) cloud(ctx, ((i * 310 + t * 7) % 1800) - 300, 60 + (i % 3) * 50, 1.2, 'rgba(250,246,238,.75)');
  farHills(ctx, 0, 0, 392, 14, '#a8b5ad', 21, .006);
  // linha de arvores e vila ao fundo (direita)
  poplars(ctx, 0, 0, 408, '#7f957a', 33);
  for (const v of [[960, 50, 34, '#dfd2b4', '#9c4a34'], [1030, 44, 44, '#e6dac0', '#a4533a'], [1110, 60, 38, '#dccfb0', '#8f4531'], [1190, 48, 46, '#e6dac0', '#b3553a']]) house(ctx, v[0], 414, v[1], v[2], v[3], v[4]);
  ctx.fillStyle = '#d9ccae'; ctx.fillRect(1074, 308, 20, 106); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(1070, 308); ctx.lineTo(1084, 268); ctx.lineTo(1098, 308); ctx.fill();
  // chao
  const gr = ctx.createLinearGradient(0, 408, 0, 760); gr.addColorStop(0, '#9bb05d'); gr.addColorStop(.5, '#7b974c'); gr.addColorStop(1, '#4f6c37'); ctx.fillStyle = gr; ctx.fillRect(-400, 408, W + 800, 500);
  ctx.strokeStyle = 'rgba(60,86,40,.16)'; ctx.lineWidth = 2; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(-400, 440 + k * 22 + k * k * 1.2); ctx.lineTo(W + 400, 440 + k * 22 + k * k * 1.2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(158,128,86,.22)'; ctx.beginPath(); ctx.ellipse(715, 560, 320, 52, 0, 0, 7); ctx.fill(); // faixa pisada no meio
  // fumaca de tiros distantes
  FAR.forEach((ft, n) => smoke(ctx, 1160 - n * 40, 440, t - ft, 1.4, 900 + n, -1));
  // linhas
  const walk = 1 - sm(tStop - 0.28, tStop, t);
  const approach = 60 * (tStop - tS3) * (1 - clamp((t - tS3) / (tStop - tS3)));
  const cp = sm(T[15], E[15] + 0.5, t);
  const items = [];
  const rj = rng(77);
  const LN = [{ dy: -26, sc: 1.32 }, { dy: 0, sc: 1.46 }, { dy: 26, sc: 1.6 }];
  for (let l = 0; l < 3; l++) for (let i = 0; i < 9; i++) {
    const jx = (rj() - .5) * 18, jy = (rj() - .5) * 5;
    items.push({ y: 640 + LN[l].dy, k: 'b', x: 520 - i * 58 - l * 15 + approach + jx * (1 - cp), yy: 640 + LN[l].dy + jy * (1 - cp), sc: LN[l].sc, ph: t * 7.2 + i * .9 + l * 1.7, j: i, r: l, bearer: l === 1 && i === 1 });
    items.push({ y: 640 + LN[l].dy, k: 'f', x: 870 + i * 58 + l * 15 + (rj() - .5) * 6, yy: 640 + LN[l].dy, sc: LN[l].sc, j: i, r: l, ph: t * 2 + i + l, bearer: l === 1 && i === 1 });
  }
  items.sort((a, b) => a.y - b.y);
  // oficiais
  const bo = (() => {
    const p1 = easeIO((t - T[17]) / 1.7);
    const mv = t > T[17] && t < T[17] + 1.7;
    let hand = null, hatIn = false;
    const th = t - T[18];
    if (th > 0) { const p = clamp(th / 0.95); const rest = [6, -34], up = [8, -72], out = [28, -52];
      hand = p < .4 ? [lerp(rest[0], up[0], p / .4), lerp(rest[1], up[1], p / .4)] : [lerp(up[0], out[0], (p - .4) / .6), lerp(up[1], out[1], (p - .4) / .6)]; hatIn = p > .38; }
    const ts = t - (T[19] + 0.1);
    if (ts > 0) { const p = easeIO(ts / 1.1); hand = [lerp(28, 40, p), lerp(-52, -60 + Math.sin(ts * 2.4) * 2, p)]; hatIn = true; }
    return { x: 590 + approach + 96 * p1, mv, hand, hatIn, p1 };
  })();
  const fo = (() => {
    const q = easeIO((t - T[21] - 0.1) / 1.5);
    const mv = t > T[21] + 0.1 && t < T[21] + 1.6;
    let hand = null, hatIn = false;
    const th = t - (T[21] + 2.05);
    if (th > 0) { const p = clamp(th / 0.8); hand = [lerp(6, 26, p), lerp(-34, -50 + Math.sin(p * 3.14) * -14, p)]; hatIn = p > .3; }
    const tc = t - (TL.words.Signori - 0.1);
    if (tc > 0) { const p = easeIO(tc / .6); hand = [lerp(26, 8, p), lerp(-50, -42, p)]; hatIn = true; }
    return { x: 868 - 76 * q, mv, hand, hatIn };
  })();
  let drewB = false, drewF = false;
  const drawOff = () => {
    if (!drewB) figure(ctx, { x: bo.x, y: 642, s: 1.8, coat: '#a82a2a', facing: 1, officer: true, phase: t * 7.2, walk: (bo.mv || (t < tStop)) ? (t < tStop ? walk : 1) : 0, hand: bo.hand, hatInHand: bo.hatIn, skin: SKIN[2], idle: t * 2 });
    drewB = true;
  };
  for (const it of items) {
    if (it.y > 640 && !drewB) drawOff();
    if (it.k === 'b') { figure(ctx, { x: it.x, y: it.yy, s: it.sc, coat: '#b5302a', facing: 1, phase: it.ph, walk, skin: SKIN[(it.j + it.r) % 4], idle: t * 2 + it.j, musket: !it.bearer, hand: it.bearer ? [8, -40] : null }); if (it.bearer) flag(ctx, it.x + 8 * it.sc, it.yy - 2, it.sc, t, '#c24a3d', '#f1e8d0'); }
    else { figure(ctx, { x: it.x, y: it.yy, s: it.sc, coat: '#3a5c9e', facing: -1, phase: it.ph, walk: 0, skin: SKIN[(it.j * 2 + it.r) % 4], idle: it.ph, hatTrim: '#f4f0e6', musket: !it.bearer, hand: it.bearer ? [8, -40] : null }); if (it.bearer) flag(ctx, it.x - 8 * it.sc, it.yy - 2, it.sc, t, '#f3efe2', '#c9a13f'); }
  }
  drawOff();
  figure(ctx, { x: fo.x, y: 642, s: 1.8, coat: '#2f4f93', facing: -1, officer: true, phase: t * 7.2, walk: fo.mv ? 1 : 0, hand: fo.hand, hatInHand: fo.hatIn, skin: SKIN[3], idle: t * 2, cuff: '#e8e2d2' });
  // nevoa baixa
  for (let i = 0; i < 5; i++) { const x = ((i * 380 + t * 14) % 1900) - 300; const g = ctx.createRadialGradient(x, 560, 10, x, 560, 260); g.addColorStop(0, 'rgba(235,228,214,.20)'); g.addColorStop(1, 'rgba(235,228,214,0)'); ctx.fillStyle = g; ctx.fillRect(x - 280, 380, 560, 340); }
  ctx.restore();
}

// ===== FIM =====
function drawEnd(ctx, t) {
  const tE = TL.voiceEnd + 0.95;
  const a = sm(tE, tE + 0.9, t); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 700); g.addColorStop(0, '#1a2233'); g.addColorStop(1, '#07090f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const t1 = tE + 1.0; if (t < t1) return;
  const ta = sm(t1, t1 + .5, t);
  ctx.save(); ctx.textAlign = 'center'; ctx.globalAlpha = ta;
  ctx.fillStyle = '#d4ab4f'; ctx.font = '600 22px Corm'; ctx.letterSpacing = '9px'; ctx.fillText('LOGICA DI GUERRA', W / 2, 250);
  ctx.fillRect(W / 2 - 60 * easeOut((t - t1) / .8), 270, 120 * easeOut((t - t1) / .8), 2.4);
  ctx.fillStyle = '#f7f1e2'; ctx.font = '700 68px FiraEC'; ctx.letterSpacing = '1px';
  const l1 = 'PERCHÉ I SOLDATI RESTAVANO', l2 = 'IN PIEDI SOTTO IL FUOCO?';
  ctx.globalAlpha = 1; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 10;
  ctx.fillText(typeText(l1, t, t1 + .4, 26), W / 2, 370); ctx.fillText(typeText(l2, t, t1 + .4 + l1.length / 26, 26), W / 2, 450);
  ctx.restore();
}

// ===== MONTAGEM =====
const mainC = document.getElementById('c'), mctx = mainC.getContext('2d');
function mkOff() { const c = document.createElement('canvas'); c.width = W; c.height = H; return { c, ctx: c.getContext('2d') }; }
const oM = mkOff(), oS = mkOff(), oF = mkOff();
window.renderFrame = function (t) {
  const fr = Math.round(t * 30);
  mctx.globalAlpha = 1; mctx.fillStyle = '#000'; mctx.fillRect(0, 0, W, H);
  if (t < tS2 + 0.75) { drawMap(oM.ctx, t); mctx.drawImage(oM.c, 0, 0); }
  if (t >= tS2 && t < tS3 + 0.75) { drawSlope(oS.ctx, t); mctx.globalAlpha = sm(tS2, tS2 + 0.7, t); mctx.drawImage(oS.c, 0, 0); mctx.globalAlpha = 1; }
  if (t >= tS3) { drawFace(oF.ctx, t); mctx.globalAlpha = sm(tS3, tS3 + 0.7, t); mctx.drawImage(oF.c, 0, 0); mctx.globalAlpha = 1; }
  post(mctx, fr, 'rgba(255,214,150,0.045)');
  lowerThird(mctx, t, T[1] + 0.1, T[3] + 0.8, 'FONTENOY, BELGIO', '11 MAGGIO 1745');
  lowerThird(mctx, t, T[13] + 4.3, T[14] - 0.3, 'A POCHE DECINE DI PASSI', 'FONTENOY · PRIMA LINEA FRANCESE');
  lowerThird(mctx, t, T[16] + 2.3, E[17] - 0.1, 'VOLTAIRE', 'PRÉCIS DU SIÈCLE DE LOUIS XV · SCRITTO ANNI DOPO');
  quoteCard(mctx, t);
  drawEnd(mctx, t);
  const fin = 1 - sm(0, 0.7, t); if (fin > 0) { mctx.fillStyle = `rgba(0,0,0,${fin})`; mctx.fillRect(0, 0, W, H); }
  const fout = sm(TOTAL - 0.7, TOTAL, t); if (fout > 0) { mctx.fillStyle = `rgba(0,0,0,${fout})`; mctx.fillRect(0, 0, W, H); }
};
window.getEvents = () => ({ shots: SHOTS.map(s => s.t), hits: HITS.map(h => h.t), fire: HITS.map(h => h.t - FLIGHT), far: FAR, stop: tStop, tS2, tS3, voiceEnd: TL.voiceEnd, total: TOTAL, close0: CLOSE0 });
window.TOTAL = TOTAL;
(async () => {
  const F = FONTS; const mk = (name, b64, w, st) => new FontFace(name, Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer, { weight: w, style: st });
  const faces = [mk('FiraEC', F.fira700, '700', 'normal'), mk('FiraEC', F.fira500, '500', 'normal'), mk('CormI', F.corm600i, '600', 'italic'), mk('Corm', F.corm600, '600', 'normal'), mk('Elite', F.elite, '400', 'normal')];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  window.READY = true;
})();
