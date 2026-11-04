// ===== marcos de tempo (absolutos, vem da narracao real) =====
const tS2 = T[3] - 0.5;             // encosta entra (a coluna ja esta em cena quando a voz fala dela)
const tS3 = T[13] + 3.6;            // confronto entra
const tStop = T[14];                // "Si fermarono"
const SP = 54;                      // espacamento da coluna
const STRIDE = 53.6;                // px de avanco por ciclo de passada (escala 1) -> sem "patinar"
const cyc = (dist, sc) => 2 * Math.PI * dist / (STRIDE * sc);

// ===== MAPA =====
const EURO = ['United Kingdom', 'Ireland', 'France', 'Belgium', 'Netherlands', 'Germany', 'Luxembourg', 'Switzerland', 'Spain', 'Italy', 'Denmark', 'Austria', 'Czechia', 'Poland', 'Norway', 'Sweden', 'Portugal'];
let mapFeats = null, proj, grat;
function initMap() {
  mapFeats = topojson.feature(WORLD, WORLD.objects.countries).features.filter(f => EURO.includes(f.properties.name));
  proj = d3.geoConicConformal().parallels([49, 52]).rotate([-4.2, 0]).clipExtent([[-200, -200], [W + 200, H + 200]]);
  grat = d3.geoGraticule().step([1, 1])();
}
const FONT = [3.4797, 50.5775];
function drawMap(ctx, t) {
  if (!mapFeats) initMap();
  const z = easeIO(clamp((t - 0.05) / 3.0));                 // zoom rapido e suave (3 s)
  const zz = z * z * (3 - 2 * z) * 0.35 + z * 0.65;
  const sc = Math.exp(lerp(Math.log(2300), Math.log(15500), zz));
  const ctr = [lerp(3.2, FONT[0] + 0.15, zz), lerp(51.8, FONT[1] + 0.05, zz)];
  proj.translate([0, 0]).scale(sc); const p0 = proj(ctr); proj.translate([W / 2 - p0[0], H / 2 - p0[1]]);
  const path = d3.geoPath(proj, ctx);
  const sea = ctx.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#3a6a86'); sea.addColorStop(1, '#264d68');
  ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.beginPath(); path(grat); ctx.stroke();
  for (const f of mapFeats) {
    const be = f.properties.name === 'Belgium';
    ctx.beginPath(); path(f); ctx.fillStyle = be ? '#dcb872' : '#e6d8b6'; ctx.fill();
    ctx.lineWidth = be ? 2.6 : 1.4; ctx.strokeStyle = be ? '#7a5a26' : '#b19a68'; ctx.stroke();
  }
  const lab = (txt, ll, a, col = '#6b5632', size = 20) => { const p = proj(ll); if (!p) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = `700 ${size}px FiraEC`; ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.fillText(txt, p[0], p[1]); ctx.restore(); };
  const la = sm(0.25, 0.75, z);
  lab('BELGIO', [4.75, 50.55], la, '#5a4220', 26); lab('FRANCIA', [2.2, 49.7], la, '#7b6a46', 24); lab('OLANDA', [5.5, 52.0], la, '#7b6a46', 20);
  lab('GERMANIA', [7.6, 50.4], la, '#7b6a46', 20); lab('MARE DEL NORD', [2.6, 52.0], la, '#cfe0ea', 16); lab('MANICA', [1.0, 50.6], la * .8, '#cfe0ea', 16);
  const mp = proj(FONT); const ma = sm(1.6, 2.2, t);
  if (ma > 0 && mp) {
    ctx.save(); ctx.globalAlpha = ma;
    for (let k = 0; k < 3; k++) { const u = ((t * 0.9 + k / 3) % 1); ctx.strokeStyle = `rgba(190,40,34,${(1 - u) * .8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mp[0], mp[1], 10 + u * 48, 0, 7); ctx.stroke(); }
    ctx.fillStyle = '#b8231d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mp[0], mp[1], 9, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = 'rgba(214,176,110,.10)'; ctx.fillRect(0, 0, W, H);
}

// ===== ENCOSTA =====
// vegetacao e detalhes FIXOS no mundo (gerados uma vez; a camera so enquadra)
const ST_TREES = (() => { const rb = rng(4242), o = []; for (let i = 0; i < 90; i++) o.push({ bx: -400 + i * 78 + rb() * 60, kind: rb(), oy: rb() * 70, s1: rb(), s2: rb(), i }); return o; })();
const ST_PATCH = (() => { const rp = rng(808), o = []; for (let i = 0; i < 70; i++) o.push({ x: -300 + i * 120 + rp() * 100, y: 50 + rp() * 220, dk: rp() > .5, rx: 60 + rp() * 70, ry: 12 + rp() * 12 }); return o; })();
const ST_TUFT = (() => { const rf = rng(606), o = []; for (let i = 0; i < 130; i++) o.push({ x: -300 + i * 62 + rf() * 50, y: 70 + rf() * 230, fl: rf() < .25, s: .9 + rf() * .9, c: rf() > .5, f2: rf() > .5 }); return o; })();
const ST_TUFT3 = (() => { const rf = rng(303), o = []; for (let i = 0; i < 80; i++) o.push({ x: -250 + rf() * 1600, y: 650 + rf() * 130, fl: rf() < .22, s: 1.1 + rf() * 1.1, c: rf() > .5, f2: rf() > .5 }); return o; })();
const ST_PATCH3 = (() => { const rp = rng(909), o = []; for (let i = 0; i < 40; i++) o.push({ x: -100 + rp() * 1500, y: 450 + rp() * 330, dk: rp() > .5, rx: 60 + rp() * 90, ry: 10 + rp() * 14 }); return o; })();
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
const X0 = 300, X1 = 2250, VS2 = (X1 - X0) / (tS3 + 0.25 - tS2);
function xf(t) { return X0 + (X1 - X0) * clamp((t - tS2) / (tS3 + 0.25 - tS2)); }
function lanePosFixed(h) { return xf(h.t) - h.i * SP - LANES[h.lane].off; }
function lanePos(lane, i, t) {
  let ra = 0; for (const h of HITS) if (h.lane === lane && h.i < i) ra++;
  return xf(t) - i * SP - LANES[lane].off + SP * ra * easeIO((t - CLOSE0) / (CLOSE1 - CLOSE0));
}
// camera da encosta: segue a historia (coluna -> topo -> canhoes -> coluna de perto -> chegada)
const cam2 = makeCam(tS2 - 1, tS3 + 1.2, (tq) => { const t = tq + 0.6;
  const follow = (z) => ({ x: xf(t) - 760, y: 0, z });
  if (t < T[4] + 0.4) return follow(1.12);
  if (t < T[7] - 0.7) return { x: 2020, y: 0, z: 1.0 };
  if (t < E[8] + 0.3) return { x: 2090 + (t - T[7]) * 8, y: 0, z: 1.1 };
  if (t < E[9] - 0.7) return { x: 2150, y: 0, z: 1.0 };
  if (t < T[11] - 0.2) return follow(1.18);
  if (t < E[12] + 0.3) return { x: xf(t) - 640, y: 0, z: 1.32 };
  if (t < T[13] + 1.0) return follow(1.2);
  return follow(1.0);
}, 1.0);

function drawSlope(ctx, t) {
  const c = cam2(t), camX = c.x, camY = camY2(camX), zoom = c.z;
  const hz = 452 - camY * 0.3;
  ctx.save(); ctx.translate(W * 0.5, H * 0.78); ctx.scale(zoom, zoom); ctx.translate(-W * 0.5, -H * 0.78);
  backdrop(ctx, camX, t, hz, 11, { windmillX: 860 });
  ctx.save(); ctx.translate(-camX, -camY);
  // chao
  ctx.beginPath(); ctx.moveTo(camX - 80, H + 400);
  for (let x = camX - 80; x <= camX + W + 80; x += 16) ctx.lineTo(x, G(x));
  ctx.lineTo(camX + W + 80, H + 400); ctx.closePath();
  const gr = ctx.createLinearGradient(0, 300, 0, H + 300); gr.addColorStop(0, '#a3bb63'); gr.addColorStop(.3, '#84a053'); gr.addColorStop(1, '#4e6c38'); ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = 'rgba(222,232,150,.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = camX - 80; x <= camX + W + 80; x += 16) (x === camX - 80 ? ctx.moveTo(x, G(x)) : ctx.lineTo(x, G(x))); ctx.stroke();
  for (let k = 1; k < 8; k++) { ctx.strokeStyle = `rgba(60,86,40,${.09 + k * .018})`; ctx.lineWidth = 2 + k * .4; ctx.beginPath(); for (let x = camX - 80; x <= camX + W + 80; x += 24) { const y = G(x) + k * 28 + k * k * 1.6; (x === camX - 80 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); } ctx.stroke(); }
  for (const p of ST_PATCH) { if (p.x < camX - 150 || p.x > camX + W + 150) continue; const y = G(p.x) + p.y; ctx.fillStyle = p.dk ? 'rgba(60,90,40,.14)' : 'rgba(190,210,110,.16)'; ctx.beginPath(); ctx.ellipse(p.x, y, p.rx, p.ry, 0, 0, 7); ctx.fill(); }
  // trilha
  ctx.beginPath(); for (let x = camX - 80; x <= camX + W + 80 && x < 2400; x += 20) { const y = G(x) - 8 - 6 * Math.sin(x * .02); (x === camX - 80 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); }
  for (let x = Math.min(camX + W + 80, 2400); x >= camX - 80; x -= 20) ctx.lineTo(x, G(x) + 58 + 4 * Math.sin(x * .017));
  ctx.closePath(); ctx.fillStyle = 'rgba(180,150,100,.6)'; ctx.fill();
  ctx.strokeStyle = 'rgba(150,120,76,.5)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = camX - 80; x <= camX + W + 80 && x < 2400; x += 20) { const y = G(x) + 18; (x === camX - 80 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); } ctx.stroke();
  for (const h of HITS) { const x = lanePosFixed(h); craterGround(ctx, x, G(x) + LANES[h.lane].dy + 2, LANES[h.lane].sc, t - h.t); }
  // arvores / arbustos atras da trilha
  for (const o of ST_TREES) { if (o.bx < camX - 140 || o.bx > camX + W + 140) continue; const by = G(o.bx) - 22 - o.oy;
    if (o.kind < .22) tree(ctx, o.bx, by, .85 + o.s1 * .5, 0, o.i, t); else if (o.kind < .34) tree(ctx, o.bx, by, .9 + o.s1 * .4, 1, o.i, t); else bush(ctx, o.bx, by + 20, .8 + o.s2 * .7, o.i); }
  // vila
  const vil = [[3085, 54, 40, '#e8dcc0', '#b3553a'], [3150, 46, 52, '#efe3c8', '#9c4a34'], [3330, 58, 44, '#e5d8ba', '#a4533a'], [3410, 50, 56, '#eadfc2', '#b3553a'], [3485, 60, 42, '#e8dcc0', '#8f4531'], [3560, 52, 50, '#efe3c8', '#b3553a']];
  for (const v of vil) house(ctx, v[0], G(v[0] + 20) + 4, v[1], v[2], v[3], v[4]);
  const cx = 3250, cy = G(cx) + 4; ctx.fillStyle = '#ddd0b2'; ctx.fillRect(cx - 16, cy - 118, 32, 118); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(cx - 20, cy - 118); ctx.lineTo(cx, cy - 170); ctx.lineTo(cx + 20, cy - 118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3e3a36'; ctx.fillRect(cx - 5, cy - 100, 10, 20); ctx.fillStyle = '#efe3c8'; ctx.fillRect(cx - 40, cy - 54, 80, 54); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(cx - 46, cy - 54); ctx.lineTo(cx, cy - 86); ctx.lineTo(cx + 46, cy - 54); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 3; i++) { smoke(ctx, 3120 + i * 160, G(3150) - 70, ((t * .35 + i * 1.3) % 4), .7, 70 + i, 1); }
  ctx.fillStyle = '#a89a80'; ctx.fillRect(3025, G(3050) - 22, 380, 24); ctx.fillStyle = '#3e3a36'; for (let x = 3040; x < 3400; x += 34) ctx.fillRect(x, G(x) - 14, 10, 6);
  ctx.fillStyle = '#8e8068'; for (let x = 3025; x < 3405; x += 22) ctx.fillRect(x, G(x) - 24, 12, 4);
  // infantaria francesa (respira, pisca, olha para os britanicos)
  const fr = []; for (let r = 2; r >= 0; r--) for (let i = 0; i < 16; i++) fr.push({ x: 2455 + i * 34 + r * 12, r, i });
  for (const o of fr) { const y = G(o.x) + o.r * 6 - 3; figure(ctx, { x: o.x, y, s: 1.32, coat: '#3a5c9e', facing: -1, idle: t * 2.2 + o.i * 1.3, tm: t, seed: o.i * 3 + o.r, look: .6, hatTrim: '#f4f0e6', skin: SKIN[(o.i + o.r) % 4], shadow: false }); }
  flag(ctx, 2590, G(2590) + 8, 1.3, t, '#f3efe2', '#c9a13f'); flag(ctx, 2900, G(2900) + 8, 1.3, t + 1, '#f3efe2', '#c9a13f');
  for (const m of MOUNDS) {
    ctx.beginPath(); ctx.moveTo(m.x0 - 28, G(m.x0)); for (let x = m.x0 - 28; x <= m.x1 + 28; x += 12) ctx.lineTo(x, G(x) - moundH(x)); ctx.lineTo(m.x1 + 28, G(m.x1) + 20); ctx.lineTo(m.x0 - 28, G(m.x0) + 20); ctx.closePath();
    ctx.fillStyle = '#8b6c46'; ctx.fill(); ctx.strokeStyle = '#664b2d'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(70,50,30,.45)'; ctx.lineWidth = 2; for (let k = 1; k < 3; k++) { ctx.beginPath(); for (let x = m.x0; x <= m.x1; x += 12) { const y = G(x) - moundH(x) + k * 9; (x === m.x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); } ctx.stroke(); }
    ctx.fillStyle = '#5b4228'; for (let x = m.x0 + 8; x < m.x1 - 8; x += 26) { const y = G(x) - moundH(x); ctx.fillRect(x, y - 9, 4, 12); }
  }
  const cy2 = { A: G(CANN.A.x) - moundH(CANN.A.x), B: G(CANN.B.x) - moundH(CANN.B.x), C: G(CANN.C.x) - moundH(CANN.C.x), D: G(CANN.D.x) - 2 };
  for (const k of Object.keys(CANN)) { let rec = 0; for (const s of SHOTS) if (s.w === k) { const a = t - s.t; if (a >= 0 && a < .8) rec = Math.max(rec, Math.exp(-a * 7)); } cannon(ctx, CANN[k].x, cy2[k], 1.35, CANN[k].face, rec, t); }
  SHOTS.forEach((s, n) => { const cc = CANN[s.w]; const mx = cc.x - 56, my = cy2[s.w] - 40; flash(ctx, mx, my, t - s.t, 1); smoke(ctx, mx, my, t - s.t, 1.3, 100 + n * 17, -1); });
  // coluna britanica
  const col = []; for (let lane = 0; lane < 3; lane++) for (let i = 0; i < 28; i++) col.push({ lane, i });
  col.sort((a, b) => LANES[a.lane].dy - LANES[b.lane].dy);
  const hitOf = (lane, i) => HITS.find(h => h.lane === lane && h.i === i);
  for (const h of HITS) { if (t < h.t) continue; const x = lanePosFixed(h), L = LANES[h.lane], u = t - h.t;
    figure(ctx, { x, y: G(x) + L.dy, s: L.sc, coat: '#b5302a', facing: 1, rot: -(Math.PI / 2) * easeOut(u / .45), alpha: 1 - sm(3.2, 4.4, u), walk: 0, musket: false, skin: SKIN[(h.i + h.lane) % 4], tm: t, seed: h.i }); }
  const dust = [];
  for (const o of col) {
    const hh = hitOf(o.lane, o.i); if (hh && t >= hh.t) continue;
    const x = lanePos(o.lane, o.i, t); if (x < camX - 90 || x > camX + W + 90) continue;
    const L = LANES[o.lane], y = G(x) + L.dy, isOff = o.lane === 1 && o.i === 0, isFlag = o.lane === 0 && o.i === 1;
    const rateV = 0.97 + 0.06 * hash(o.i, o.lane, 2);
    const phase = cyc(xf(t), L.sc) * rateV + hash(o.i, o.lane, 1) * 6.28;
    let fl = 0; for (const h of HITS) { const dx = Math.abs(lanePosFixed(h) - x); if (t > h.t && dx < 210) fl = Math.max(fl, Math.min(1, (t - h.t) / .09) * Math.exp(-(t - h.t) * 3.0) * (1 - dx / 210)); }
    let look = 0; for (const h of HITS) if (h.lane === o.lane && o.i === h.i + 1) look = Math.min(look, -sm(h.t, h.t + .35, t) * (1 - sm(h.t + 1.8, h.t + 2.6, t)));
    figure(ctx, { x, y, s: L.sc, coat: '#b5302a', facing: 1, phase, walk: 1, skin: SKIN[(o.i * 3 + o.lane) % 4], officer: isOff, musket: !isFlag, hand: isFlag ? [8, -5] : null, tm: t, seed: o.i * 5 + o.lane, flinch: fl, look });
    if (isFlag) flag(ctx, x + 8 * L.sc, y - 2, L.sc, t, '#c24a3d', '#f1e8d0');
    const age = ((((phase % Math.PI) + Math.PI) % Math.PI)) / (2 * Math.PI * VS2 / (STRIDE * L.sc)); if (age < 0.42) dust.push([x - 8 * L.sc, y, age, L.sc]);
  }
  for (const d of dust) { const a = 1 - d[2] / 0.42; ctx.fillStyle = `rgba(190,165,120,${0.38 * a})`; ctx.beginPath(); ctx.ellipse(d[0] - d[2] * 14, d[1] - 2 - d[2] * 10, (5 + d[2] * 26) * d[3] * .6, (3 + d[2] * 12) * d[3] * .6, 0, 0, 7); ctx.fill(); }
  for (const h of HITS) { const x = lanePosFixed(h); craterFire(ctx, x, G(x) + LANES[h.lane].dy + 2, LANES[h.lane].sc, t - h.t, t, h.i * 7 + h.lane); }
  for (const h of HITS) { const x = lanePosFixed(h), L = LANES[h.lane], ty = G(x) + L.dy - 36; const u = (t - (h.t - FLIGHT)) / FLIGHT;
    if (u > 0 && u < 1) { const bx = lerp(x + 1100, x, u), by = lerp(ty - 380, ty, u * u); ctx.strokeStyle = 'rgba(40,40,44,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 42, by - 14); ctx.stroke(); ctx.fillStyle = '#1b1d20'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); }
    smoke(ctx, x, ty + 26, t - h.t, 1.15, 500 + h.i * 31 + h.lane, 0.6); }
  for (const o of ST_TUFT) { if (o.x < camX - 50 || o.x > camX + W + 50) continue; const y = G(o.x) + o.y; if (!o.fl) tuft(ctx, o.x, y, o.s, o.c ? '#3f5f2c' : '#6f8f45', t); else flowers(ctx, o.x, y, 1.2, o.f2 ? '#f2d34e' : '#f7f4ea'); }
  ctx.restore();
  cloudShadows(ctx, t, 560, 70);
  const sx = (x) => x - camX, Gs = (x) => G(x) - camY;
  tag(ctx, t, E[5] - 0.5, E[6] + 1.3, 'FONTENOY', sx(3250) - 60, Gs(3250) - 290, sx(3250), Gs(3250) - 175);
  tag(ctx, t, T[7] - 0.05, E[7] + 0.9, 'CANNONI', sx(2475) - 70, cy2.A - camY - 190, sx(2475), cy2.A - camY - 50);
  tag(ctx, t, T[8] - 0.05, E[8] + 1.0, 'CANNONI', sx(2268) - 30, cy2.C - camY - 170, sx(2268), cy2.C - camY - 50);
  tag(ctx, t, T[8] + 0.2, E[8] + 1.0, 'CANNONI', sx(3050) - 40, cy2.D - camY - 200, sx(3050), cy2.D - camY - 50);
  tag(ctx, t, T[9] + 0.95, E[9] - 0.6, 'TRINCERAMENTI', sx(2700) - 80, cy2.A - camY - 230, sx(2640), cy2.B - camY + 6);
  tag(ctx, t, T[9] + 2.0, E[9] - 0.3, 'VILLAGGIO FORTIFICATO', sx(3180) - 120, Gs(3200) - 250, sx(3200), Gs(3200) - 14);
  ctx.restore();
}

// ===== CONFRONTO: coreografia =====
const FAR = [T[13] + 1.0, T[15] + 0.3, T[17] + 1.2];
const LN3 = [{ dy: -26, sc: 1.32 }, { dy: 0, sc: 1.46 }, { dy: 26, sc: 1.6 }];
const APPROACH = 330;
function approachOff(t) { const p = clamp((t - tS3) / (tStop - tS3)); return -APPROACH * Math.pow(1 - p, 1.7); }  // vem da ESQUERDA, freia suave
const bez = (a, b, c, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
const eBack = (u) => { u = clamp(u); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const REST = [7, -4];
function officerBraw(t) {   // oficial britanico
  const mv = clamp((t - T[17]) / 1.9), ex = easeIO(mv);
  const o = { x: 590 + approachOff(t) + 74 * ex, walk: 0, lean: 0, bow: 0, hand: null, hand2: null, hatIn: false, hatRot: 0, look: 0, hatLift: 0 };
  o.walk = t < tStop ? 1 - sm(tStop - 0.3, tStop, t) : (mv > 0 && mv < 1 ? 1 : 0);
  o.lean = (t > T[17] - 0.25 && t < T[17]) ? -0.05 * sm(T[17] - 0.25, T[17], t) : (mv > 0 && mv < 1 ? 0.05 * Math.sin(Math.PI * mv) : 0);
  const th = t - T[18];
  if (th > 0) {
    const hat = [9, -37], out = [32, -12], up = [22, -44];
    if (th < 0.32) { const u = easeOut(th / .32); o.hand = [lerp(REST[0], hat[0], u), lerp(REST[1], hat[1], u)]; o.lean = -0.04 * u; }
    else if (th < 1.0) { const u = easeIO((th - .32) / .68); o.hand = bez(hat, up, out, u); o.hatIn = u > 0.12; o.bow = Math.sin(u * Math.PI * .5) * 0.9; o.hatRot = lerp(-.4, .35, u); o.hatLift = u < .12 ? u * 20 : 0; }
    else { o.hand = out; o.hatIn = true; o.hatRot = .35; o.bow = 0.9 * (1 - easeIO((th - 1.0) / .7)); }
    if (t > T[19] + 0.05) { const u = eBack((t - T[19] - .05) / .85); o.hand = [lerp(out[0], 36, u), lerp(out[1], -22 + Math.sin((t - T[19]) * 2.6) * 1.2, u)]; o.hatIn = true; o.hatRot = lerp(.35, -.15, u); o.hand2 = [lerp(-3, 18, u), lerp(-3, -10, u)]; o.look = 1; }
  }
  return o;
}
function officerFraw(t) {   // oficial frances
  const mv = clamp((t - T[21] - 0.1) / 1.7), ex = easeIO(mv);
  const o = { x: 868 - 54 * ex, walk: mv > 0 && mv < 1 ? 1 : 0, lean: mv > 0 && mv < 1 ? 0.05 * Math.sin(Math.PI * mv) : 0, bow: 0, hand: null, hand2: null, hatIn: false, hatRot: 0, look: 0, hatLift: 0 };
  const th = t - (T[21] + 2.25);
  if (th > 0) {
    const hat = [9, -37], out = [30, -12], up = [21, -44];
    if (th < 0.3) { const u = easeOut(th / .3); o.hand = [lerp(REST[0], hat[0], u), lerp(REST[1], hat[1], u)]; }
    else if (th < 0.95) { const u = easeIO((th - .3) / .65); o.hand = bez(hat, up, out, u); o.hatIn = u > .12; o.bow = Math.sin(u * Math.PI * .5) * 0.7; o.hatRot = lerp(-.4, .3, u); o.hatLift = u < .12 ? u * 20 : 0; }
    else { o.hand = out; o.hatIn = true; o.hatRot = .3; o.bow = 0.7 * (1 - easeIO((th - .95) / .6)); }
  }
  const ts = t - (TL.words.Signori - 0.15);
  if (ts > 0) { const u = easeOut(ts / .5); o.hatIn = true; o.hand2 = [lerp(-3, 7, u), lerp(-3, -13, u)]; o.hand = [lerp(30, 32, u), lerp(-12, -20 + Math.sin(ts * 2.3) * 1.2, u)]; o.look = 1;
    const nod = (t > TL.words.non && t < TL.words.nemmeno + .4) ? Math.max(0, Math.sin((t - TL.words.non) * 5)) * 0.14 : 0; o.bow = Math.max(o.bow, nod); }
  return o;
}
const _stF = { default: 0.13, bow: 0.24, lean: 0.2, look: 0.4 };
const _chan = (o) => ({ hx: o.hand ? o.hand[0] : REST[0], hy: o.hand ? o.hand[1] : REST[1], gx: o.hand2 ? o.hand2[0] : -3, gy: o.hand2 ? o.hand2[1] : -3, bow: o.bow, lean: o.lean, look: o.look });
const _smB = makeFollow(tS3 - 1.5, TOTAL + 0.5, (t) => _chan(officerBraw(t)), _stF);
const _smF = makeFollow(tS3 - 1.5, TOTAL + 0.5, (t) => _chan(officerFraw(t)), _stF);
const _mixO = (o, s) => ({ ...o, hand: [s.hx, s.hy], hand2: [s.gx, s.gy], bow: s.bow, lean: s.lean, look: s.look });
function officerB(t) { return _mixO(officerBraw(t), _smB(t)); }
function officerF(t) { return _mixO(officerFraw(t), _smF(t)); }
// camera do confronto: segue a historia
const cam3 = makeCam(tS3 - 1.0, TOTAL + 0.5, (tq) => { const t = tq + 0.8;
  const b = officerB(t), f = officerF(t);
  if (t < tStop - 1.8) return { x: 600, y: 395, z: 1.0 };
  if (t < tStop) return { x: 590, y: 470, z: 1.18 };
  if (t < T[15]) return { x: 575, y: 520, z: 1.32 };
  if (t < T[16]) return { x: 380, y: 545, z: 1.55 };
  if (t < T[17] - 0.1) return { x: 640, y: 480, z: 1.12 };
  if (t < T[18] - 0.9) return { x: b.x + 45, y: 545, z: 1.5 };
  if (t < T[19] + 0.5) return { x: b.x + 22, y: 560, z: 2.45 };
  if (t < T[20]) return { x: b.x + 70, y: 556, z: 2.15 };
  if (t < T[21] - 0.1) return { x: 840, y: 565, z: 1.7 };
  if (t < TL.words.Signori - 0.35) return { x: f.x - 12, y: 560, z: 2.35 };
  return { x: (b.x + f.x) / 2, y: 558, z: 2.0 + 0.15 * sm(TL.words.Signori, TL.voiceEnd, t) };
}, 0.8);

function drawFace(ctx, t) {
  const c = cam3(t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
  backdrop(ctx, 0, t, 408, 31, { windmillX: 250, sunx: 780 });
  for (const v of [[930, 50, 34, '#dfd2b4', '#9c4a34'], [992, 44, 44, '#e6dac0', '#a4533a'], [1052, 38, 36, '#e2d6b8', '#b3553a'], [1110, 60, 38, '#dccfb0', '#8f4531'], [1190, 48, 46, '#e6dac0', '#b3553a'], [1250, 54, 36, '#e2d6b8', '#9c4a34']]) house(ctx, v[0], 414, v[1], v[2], v[3], v[4]);
  ctx.fillStyle = '#d9ccae'; ctx.fillRect(1074, 296, 22, 118); ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(1070, 296); ctx.lineTo(1085, 254); ctx.lineTo(1100, 296); ctx.fill();
  for (let i = 0; i < 3; i++) smoke(ctx, 960 + i * 150, 340, ((t * .35 + i * 1.1) % 4), .6, 90 + i, 1);
  for (const x of [20, 140, 1180, 1240]) tree(ctx, x, 420, 1.0, x < 600 ? 0 : 1, x, t);
  for (let x = 0; x < 1300; x += 90) bush(ctx, x + 20, 414, .7, x);
  const gr = ctx.createLinearGradient(0, 408, 0, 800); gr.addColorStop(0, '#a2b95f'); gr.addColorStop(.35, '#80a050'); gr.addColorStop(1, '#4d6b36'); ctx.fillStyle = gr; ctx.fillRect(-500, 408, W + 1000, 600);
  ctx.strokeStyle = 'rgba(60,86,40,.15)'; ctx.lineWidth = 2; for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.moveTo(-500, 440 + k * 24 + k * k * 1.2); ctx.lineTo(W + 500, 440 + k * 24 + k * k * 1.2); ctx.stroke(); }
  for (const p of ST_PATCH3) { ctx.fillStyle = p.dk ? 'rgba(60,90,40,.13)' : 'rgba(200,215,120,.14)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(165,135,92,.25)'; ctx.beginPath(); ctx.ellipse(715, 600, 360, 58, 0, 0, 7); ctx.fill();
  cloudShadows(ctx, t, 560, 90);
  FAR.forEach((ft, n) => smoke(ctx, 1160 - n * 40, 440, t - ft, 1.4, 900 + n, -1));
  // soldados
  const cp = sm(T[15], E[15] + 0.5, t), ao = approachOff(t);
  const items = [], rj = rng(77);
  const stopKick = t >= tStop ? Math.exp(-(t - tStop) * 6) : 0;
  for (let l = 0; l < 3; l++) for (let i = 0; i < 9; i++) {
    const jx = (rj() - .5) * 18, jy = (rj() - .5) * 5, sc = LN3[l].sc, yb = 640 + LN3[l].dy;
    const bx = 520 - i * 58 - l * 15 + ao + jx * (1 - cp);
    const shuffling = (t > T[15] - 0.1 && t < E[15] + 0.7) ? Math.sin(Math.PI * clamp((t - T[15] + .1 + i * .035) / 1.0)) : 0;
    const mv = t < tStop ? 1 - sm(tStop - 0.35, tStop, t) : shuffling * 0.55;
    const ph = (t < tStop + 0.01) ? cyc(bx, sc) + hash(i, l, 1) * 6.28 : (shuffling > 0 ? t * 6.2 + hash(i, l, 4) * 6.28 : cyc(520 - i * 58 - l * 15, sc) + hash(i, l, 1) * 6.28);
    items.push({ y: yb, k: 'b', x: bx, yy: yb + jy * (1 - cp), sc, ph, mv, j: i, r: l, bearer: l === 1 && i === 1, lean: -0.07 * stopKick });
    items.push({ y: yb, k: 'f', x: 870 + i * 58 + l * 15 + (rj() - .5) * 6, yy: yb, sc, j: i, r: l, ph: 0, mv: 0, bearer: l === 1 && i === 1 });
  }
  items.sort((a, b) => a.y - b.y);
  const bo = officerB(t), fo = officerF(t);
  let drewB = false;
  const drawOff = () => { if (drewB) return; drewB = true;
    figure(ctx, { x: bo.x, y: 642, s: 1.8, coat: '#a82a2a', facing: 1, officer: true, phase: cyc(bo.x, 1.8) + .4, walk: bo.walk, hand: [bo.hand[0] - Math.sin(cyc(bo.x, 1.8) + .4) * 6 * bo.walk, bo.hand[1]], hand2: [bo.hand2[0] + Math.sin(cyc(bo.x, 1.8) + .4) * 7 * bo.walk, bo.hand2[1]], hatInHand: bo.hatIn, hatRot: bo.hatRot, hatLift: bo.hatLift, lean: bo.lean, bow: bo.bow, look: bo.look, skin: SKIN[2], idle: t * 2, tm: t, seed: 3, musket: false }); };
  const dust = [];
  for (const it of items) {
    if (it.y > 640 && !drewB) drawOff();
    if (it.k === 'b') {
      figure(ctx, { x: it.x, y: it.yy, s: it.sc, coat: '#b5302a', facing: 1, phase: it.ph, walk: it.mv, skin: SKIN[(it.j + it.r) % 4], idle: t * 2 + it.j, tm: t, seed: it.j * 3 + it.r, lean: it.lean, look: sm(T[17], T[17] + .8, t), musket: !it.bearer, hand: it.bearer ? [8, -5] : null });
      if (it.bearer) flag(ctx, it.x + 8 * it.sc, it.yy - 2, it.sc, t, '#c24a3d', '#f1e8d0');
      if (it.mv > 0.5 && t < tStop) { const age = ((((it.ph % Math.PI) + Math.PI) % Math.PI)) / (Math.PI * 2 * 60 / (STRIDE * it.sc)); if (age < .4) dust.push([it.x - 8 * it.sc, it.yy, age, it.sc]); }
    } else {
      figure(ctx, { x: it.x, y: it.yy, s: it.sc, coat: '#3a5c9e', facing: -1, phase: 0, walk: 0, skin: SKIN[(it.j * 2 + it.r) % 4], idle: t * 2.1 + it.j + it.r, tm: t, seed: it.j * 7 + it.r + 2, hatTrim: '#f4f0e6', look: lerp(.4, 1, sm(T[18], T[18] + .8, t)), musket: !it.bearer, hand: it.bearer ? [8, -5] : null });
      if (it.bearer) flag(ctx, it.x - 8 * it.sc, it.yy - 2, it.sc, t, '#f3efe2', '#c9a13f');
    }
  }
  drawOff();
  figure(ctx, { x: fo.x, y: 642, s: 1.8, coat: '#2f4f93', facing: -1, officer: true, phase: cyc(868 - fo.x, 1.8), walk: fo.walk, hand: [fo.hand[0] - Math.sin(cyc(868 - fo.x, 1.8)) * 6 * fo.walk, fo.hand[1]], hand2: [fo.hand2[0] + Math.sin(cyc(868 - fo.x, 1.8)) * 7 * fo.walk, fo.hand2[1]], hatInHand: fo.hatIn, hatRot: fo.hatRot, hatLift: fo.hatLift, lean: fo.lean, bow: fo.bow, look: fo.look, skin: SKIN[3], idle: t * 2, tm: t, seed: 9, musket: false });
  for (const d of dust) { const a = 1 - d[2] / 0.4; ctx.fillStyle = `rgba(190,165,120,${0.4 * a})`; ctx.beginPath(); ctx.ellipse(d[0] - d[2] * 14, d[1] - 2 - d[2] * 10, (5 + d[2] * 26) * d[3] * .6, (3 + d[2] * 12) * d[3] * .6, 0, 0, 7); ctx.fill(); }
  for (const o of ST_TUFT3) { if (!o.fl) tuft(ctx, o.x, o.y, o.s, o.c ? '#3f5f2c' : '#6f8f45', t); else flowers(ctx, o.x, o.y, 1.4, o.f2 ? '#f2d34e' : '#f7f4ea'); }
  for (let i = 0; i < 5; i++) { const x = ((i * 380 + t * 14) % 1900) - 300; const g = ctx.createRadialGradient(x, 560, 10, x, 560, 260); g.addColorStop(0, 'rgba(235,228,214,.18)'); g.addColorStop(1, 'rgba(235,228,214,0)'); ctx.fillStyle = g; ctx.fillRect(x - 280, 380, 560, 340); }
  ctx.restore();
}

// ===== FIM =====
function drawEnd(ctx, t) {
  const tE = TL.voiceEnd + 0.95; const a = sm(tE, tE + 0.9, t); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 700); g.addColorStop(0, '#1a2233'); g.addColorStop(1, '#07090f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
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
  post(mctx, fr, 'rgba(255,214,150,0.04)');
  lowerThird(mctx, t, T[1] + 0.1, T[3] + 0.8, 'FONTENOY, BELGIO', '11 MAGGIO 1745');
  lowerThird(mctx, t, T[13] + 4.3, T[14] - 0.3, 'A POCHE DECINE DI PASSI', 'FONTENOY · PRIMA LINEA FRANCESE');
  lowerThird(mctx, t, T[16] + 2.3, E[17] - 0.1, 'VOLTAIRE', 'PRÉCIS DU SIÈCLE DE LOUIS XV · SCRITTO ANNI DOPO');
  quoteCard(mctx, t);
  drawEnd(mctx, t);
  const fin = 1 - sm(0, 0.6, t); if (fin > 0) { mctx.fillStyle = `rgba(0,0,0,${fin})`; mctx.fillRect(0, 0, W, H); }
  const fout = sm(TOTAL - 0.7, TOTAL, t); if (fout > 0) { mctx.fillStyle = `rgba(0,0,0,${fout})`; mctx.fillRect(0, 0, W, H); }
};
window.getEvents = () => ({ shots: SHOTS.map(s => s.t), hits: HITS.map(h => h.t), fire: HITS.map(h => h.t - FLIGHT), far: FAR, stop: tStop, tS2, tS3, voiceEnd: TL.voiceEnd, total: TOTAL, close0: CLOSE0, stepEvery: (STRIDE * 1.34) / 2 / VS2 });
window.TOTAL = TOTAL;
(async () => {
  const F = FONTS; const mk = (name, b64, w, st) => new FontFace(name, Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer, { weight: w, style: st });
  const faces = [mk('FiraEC', F.fira700, '700', 'normal'), mk('FiraEC', F.fira500, '500', 'normal'), mk('CormI', F.corm600i, '600', 'italic'), mk('Corm', F.corm600, '600', 'normal'), mk('Elite', F.elite, '400', 'normal')];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  window.READY = true;
})();
