// ===== utilidades =====
const W = 1280, H = 720;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeIO = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// linha do tempo: T[i] = inicio da frase i, E[i] = fim (1-indexado)
const T = [], E = [];
TL.beats.forEach(b => { T[b.i] = b.start; E[b.i] = b.end; });
const TOTAL = TL.total;

// ===== sprites =====
const SKIN = ['#e8b896', '#d9a37c', '#f0c8a8', '#c98f6a'];

function tricorn(ctx, x, y, s, col, trim, plume) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(-12, 0); ctx.lineTo(-9, -7); ctx.lineTo(0, -11); ctx.lineTo(9, -7); ctx.lineTo(12, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = trim; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, 3); ctx.lineTo(12, 0); ctx.stroke();
  if (plume) { ctx.fillStyle = '#f4f0e6'; ctx.beginPath(); ctx.ellipse(-8, -9, 6, 3, -0.5, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ===== boneco v2: esqueleto simples com vida =====
// coordenadas locais: pes em (0,0); quadril em (0,-27). A casaca/cabeca/bracos ficam num grupo rotacionavel no quadril.
function figure(ctx, o) {
  const { x, y, s = 1, coat = '#b5302a', facing = 1, phase = 0, walk = 0, skin = SKIN[0], hat = true, hatTrim = '#e9e3d3',
    officer = false, hand = null, hand2 = null, hatInHand = false, idle = 0, rot = 0, alpha = 1, shadow = true, cuff = '#e8e2d2', musket = true,
    lean = 0, bow = 0, look = 0, tilt = 0, flinch = 0, tm = 0, seed = 0, hatLift = 0 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  if (shadow) { ctx.fillStyle = 'rgba(30,40,20,.24)'; ctx.beginPath(); ctx.ellipse(0, 1, 16 * s, 4 * s, 0, 0, 7); ctx.fill(); }
  ctx.rotate(rot * facing); ctx.scale(s * facing, s);
  const idl = 1 - walk;
  const bob = -Math.abs(Math.sin(phase)) * 2.6 * walk + Math.sin(idle) * 0.55 * idl;
  const swayX = Math.sin(idle * 0.5 + seed) * 0.9 * idl;
  const hipX = swayX, hipY = -27 + bob + flinch * 3;
  // pernas com joelho
  for (const k of [-1, 1]) {
    const ph = phase + (k > 0 ? 0 : Math.PI);
    const a = 0.52 * Math.sin(ph) * walk + k * 0.035 * idl + (flinch ? -0.08 * flinch : 0);
    const b = (0.12 + 0.85 * Math.max(0, Math.sin(ph + 1.25))) * walk + 0.02;
    const hx = hipX + 2.3 * k, hy = hipY;
    const kx = hx + 13.5 * Math.sin(a), ky = hy + 13.5 * Math.cos(a);
    const fa = a - b; const fx = kx + 13.5 * Math.sin(fa), fy = Math.min(-0.5, ky + 13.5 * Math.cos(fa));
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ece6d6'; ctx.lineWidth = 5.8; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.strokeStyle = '#2b2828'; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = '#161313'; ctx.save(); ctx.translate(fx, fy); ctx.rotate(-fa * 0.5); ctx.fillRect(-3, -1.6, 8.5, 3.6); ctx.restore();
  }
  // grupo do tronco
  ctx.save(); ctx.translate(hipX, hipY);
  ctx.rotate(0.045 * walk + lean + bow * 0.34 - flinch * 0.16);
  const armSw = Math.sin(phase);
  // braco de tras
  { const ex = hand2 ? hand2[0] : -3 + armSw * 7 * walk - 1 * idl, ey = hand2 ? hand2[1] : -3 + 2 * Math.abs(Math.cos(phase)) * walk + 1 * idl;
    ctx.strokeStyle = coat; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.globalAlpha *= 0.92; ctx.beginPath(); ctx.moveTo(-3, -23); ctx.quadraticCurveTo((-3 + ex) / 2 - 2, (-23 + ey) / 2 + 3, ex, ey); ctx.stroke(); ctx.globalAlpha /= 0.92;
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, 7); ctx.fill(); }
  // casaca (com aba que balanca)
  const tail = -Math.sin(phase - 0.6) * 3.2 * walk - lean * 10;
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.moveTo(-8.8, -25); ctx.quadraticCurveTo(0, -29.5, 8.8, -25); ctx.lineTo(9.8, 4); ctx.lineTo(-9.8, 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9.8, 3); ctx.lineTo(9.8, 3); ctx.lineTo(9.8 + tail * 0.6, 9); ctx.lineTo(0 + tail, 11); ctx.lineTo(-9.8 + tail * 0.6, 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(-9.8, 0, 19.6, 4.6);
  ctx.strokeStyle = '#f2ecdd'; ctx.lineWidth = 2.3;
  ctx.beginPath(); ctx.moveTo(-7, -24); ctx.lineTo(7, 0); ctx.moveTo(7, -24); ctx.lineTo(-7, 0); ctx.stroke();
  if (officer) { ctx.strokeStyle = '#c9a13f'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-9, -21); ctx.lineTo(9, -3); ctx.stroke(); ctx.fillStyle = '#c9a13f'; for (let i = 0; i < 3; i++) ctx.fillRect(-1, -22 + i * 8, 2.2, 2.2); }
  ctx.fillStyle = '#d8c48a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -20 + i * 7, 0.9, 0, 7); ctx.fill(); }
  // cabeca
  ctx.save(); ctx.translate(0, -32); ctx.rotate(tilt + look * 0.09 - bow * 0.22 - lean * 0.4 + Math.sin(phase * 2 + 0.4) * 0.035 * walk);
  ctx.fillStyle = '#7d7468'; ctx.fillRect(-9.2, -4.5, 4.2, 6.5);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, 7); ctx.fill();
  if (officer) { ctx.fillStyle = '#ebe6da'; ctx.beginPath(); ctx.arc(-0.6, -1.2, 7.5, Math.PI * 0.95, Math.PI * 2.1); ctx.fill(); ctx.beginPath(); ctx.arc(-6.4, 3, 3.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(-6.4, 6.6, 2.7, 0, 7); ctx.fill(); }
  const blink = ((tm * 0.31 + seed * 0.173) % 1) > 0.955;
  const ex = 3 + look * 1.5;
  ctx.fillStyle = '#2a2220'; ctx.strokeStyle = '#2a2220'; ctx.lineWidth = 1.2;
  if (blink) { ctx.beginPath(); ctx.moveTo(ex - 1.3, -0.3); ctx.lineTo(ex + 1.3, -0.3); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(ex, -0.5, 1, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(190,90,70,.35)'; ctx.beginPath(); ctx.arc(ex + 0.5, 2.6, 1.5, 0, 7); ctx.fill();
  if (officer) { ctx.strokeStyle = '#4a3b33'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(3.5, 3); ctx.lineTo(6.8, 2.4); ctx.stroke(); }
  if (hat && !hatInHand) { ctx.save(); ctx.translate(0, -3 - hatLift); ctx.rotate(Math.sin(phase * 2 + 0.7) * 0.05 * walk); tricorn(ctx, 0, 0, 1.05, officer ? '#1f1b1a' : '#262221', officer ? '#d1ac4a' : hatTrim, officer); ctx.restore(); }
  ctx.restore();
  // braco da frente + mosquete / mao
  if (hand) {
    const sx = 3, sy = -23;
    ctx.strokeStyle = coat; ctx.lineWidth = 5.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + hand[0]) / 2 + 1, (sy + hand[1]) / 2 + 6, hand[0], hand[1]); ctx.stroke();
    ctx.fillStyle = cuff; ctx.beginPath(); ctx.arc(hand[0], hand[1], 3.2, 0, 7); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hand[0] + 1.2, hand[1] - 0.5, 2.7, 0, 7); ctx.fill();
    if (hat && hatInHand) { ctx.save(); ctx.translate(hand[0] + 4, hand[1] - 3); ctx.rotate(o.hatRot || 0); tricorn(ctx, 0, 0, 1.05, '#1f1b1a', '#d1ac4a', true); ctx.restore(); }
  } else if (musket) {
    const sw = Math.sin(idle * 0.7 + seed) * 0.02 * idl;
    ctx.save(); ctx.translate(9, 1); ctx.rotate(sw);
    ctx.strokeStyle = '#6a4a2c'; ctx.lineWidth = 2.9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10.5, -54); ctx.stroke();
    ctx.strokeStyle = '#c9ccd0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10.5, -54); ctx.lineTo(-11.4, -62); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = coat; ctx.lineWidth = 5.2; ctx.beginPath(); ctx.moveTo(3, -23); ctx.lineTo(8, -8); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(8.4, -7, 2.7, 0, 7); ctx.fill();
  }
  ctx.restore(); // tronco
  ctx.restore();
}

function flag(ctx, x, y, s, t, col, edge) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#4c3a26'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -96); ctx.stroke();
  ctx.fillStyle = '#c9a13f'; ctx.beginPath(); ctx.arc(0, -98, 3, 0, 7); ctx.fill();
  const w = 40, h = 30;
  ctx.beginPath(); ctx.moveTo(0, -94);
  for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(u * w, -94 + Math.sin(t * 5 + u * 5) * 3 * u); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(u * w, -94 + h + Math.sin(t * 5 + u * 5) * 3 * u); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

function cannon(ctx, x, y, s, facing, recoil, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 1, 34, 5, 0, 0, 7); ctx.fill();
  const rx = -recoil * 9;
  ctx.save(); ctx.translate(rx, 0);
  ctx.fillStyle = '#6b4a2b'; ctx.beginPath(); ctx.moveTo(-26, -14); ctx.lineTo(18, -22); ctx.lineTo(20, -17); ctx.lineTo(-22, -9); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(2, -26); ctx.rotate(-0.06);
  ctx.fillStyle = '#2f3a42'; ctx.beginPath(); ctx.moveTo(-18, -5); ctx.lineTo(40, -3.5); ctx.lineTo(40, 3.5); ctx.lineTo(-18, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4a5964'; ctx.fillRect(-18, -5, 58, 2);
  ctx.fillStyle = '#212a30'; ctx.fillRect(38, -5, 4, 10); ctx.beginPath(); ctx.arc(-19, 0, 5.5, 0, 7); ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = '#4a3322'; ctx.lineWidth = 3.4; ctx.fillStyle = '#7a5434';
  ctx.beginPath(); ctx.arc(-2 + rx, -13, 13, 0, 7); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 1.6; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-2 + rx, -13); ctx.lineTo(-2 + rx + Math.cos(a) * 13, -13 + Math.sin(a) * 13); ctx.stroke(); }
  ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.arc(-2 + rx, -13, 2.6, 0, 7); ctx.fill();
  ctx.restore();
}

// fumaca: nuvem de circulos que cresce e some
function smoke(ctx, x, y, age, size, seed, drift = 1) {
  if (age < 0 || age > 5) return;
  const r = rng(seed);
  const a = clamp(1 - age / 5);
  for (let i = 0; i < 9; i++) {
    const ang = r() * 6.28, d = (8 + r() * 22) * Math.sqrt(age + .15) * size;
    const px = x + Math.cos(ang) * d + age * 14 * drift * (0.6 + r() * .8);
    const py = y + Math.sin(ang) * d * 0.7 - age * (10 + r() * 14);
    const rad = (8 + r() * 14) * size * (0.7 + age * 0.55);
    const g = 190 + r() * 40;
    ctx.fillStyle = `rgba(${g},${g - 4},${g - 10},${0.5 * a * a})`;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, 7); ctx.fill();
  }
}
function flash(ctx, x, y, age, size) {
  if (age < 0 || age > 0.18) return;
  const a = 1 - age / 0.18;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 44 * size);
  g.addColorStop(0, `rgba(255,246,200,${a})`); g.addColorStop(.35, `rgba(255,170,60,${a * .8})`); g.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 44 * size, 0, 7); ctx.fill();
}

function cloud(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.arc(x, y, 26 * s, 0, 7); ctx.arc(x + 30 * s, y - 12 * s, 34 * s, 0, 7); ctx.arc(x + 68 * s, y - 2 * s, 28 * s, 0, 7);
  ctx.arc(x + 98 * s, y + 6 * s, 20 * s, 0, 7); ctx.rect(x, y, 98 * s, 26 * s); ctx.fill();
}

function house(ctx, x, y, w, h, wall, roof) {
  ctx.fillStyle = wall; ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 5, y - h); ctx.lineTo(x + w / 2, y - h - w * 0.42); ctx.lineTo(x + w + 5, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x + w * .6, y - h, w * .4, h);
  ctx.fillStyle = '#3e3a36'; const n = Math.max(1, Math.floor(w / 26));
  for (let i = 0; i < n; i++) ctx.fillRect(x + 8 + i * (w - 16) / n, y - h * .7, 8, 12);
}

// ===== tipografia =====
function typeText(str, t, t0, cps) { return str.slice(0, Math.max(0, Math.min(str.length, Math.floor((t - t0) * cps)))); }

function lowerThird(ctx, t, t0, t1, title, sub, x = 54, y = H - 92) {
  if (t < t0 || t > t1) return;
  const a = Math.min(sm(t0, t0 + .25, t), 1 - sm(t1 - .45, t1, t));
  ctx.save();
  const g = ctx.createRadialGradient(0, H, 20, 0, H, 760); g.addColorStop(0, `rgba(0,0,0,${0.62 * a})`); g.addColorStop(.55, `rgba(0,0,0,${0.3 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, H - 760, 900, 760);
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.font = '700 38px FiraEC'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#f7f1e2'; ctx.letterSpacing = '0.4px';
  const s = typeText(title, t, t0 + .1, 24);
  ctx.fillText(s, x, y);
  const wFull = ctx.measureText(title).width;
  const lw = wFull * sm(t0 + .1, t0 + .1 + title.length / 24, t);
  ctx.shadowBlur = 0; ctx.fillStyle = '#d4ab4f'; ctx.fillRect(x, y + 11, lw, 2.4);
  const tSub = t0 + .1 + title.length / 24;
  if (t > tSub) { ctx.globalAlpha = a * sm(tSub, tSub + .35, t); ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.font = '500 16px FiraEC'; ctx.letterSpacing = '1.8px'; ctx.fillStyle = '#e8dcc0'; ctx.fillText(sub, x, y + 36); }
  ctx.restore();
}

function tag(ctx, t, t0, t1, text, x, y, tx, ty) {
  if (t < t0 || t > t1) return;
  const a = Math.min(sm(t0, t0 + .3, t), 1 - sm(t1 - .4, t1, t));
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = '700 17px FiraEC'; ctx.letterSpacing = '1.6px';
  const w = ctx.measureText(text).width + 22, h = 28;
  const k = easeOut((t - t0) / .35);
  ctx.strokeStyle = '#f2e8cc'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h); ctx.lineTo(lerp(x + w / 2, tx, k), lerp(y + h, ty, k)); ctx.stroke();
  ctx.fillStyle = 'rgba(24,20,18,.82)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = '#d4ab4f'; ctx.fillRect(x, y + h - 3, w * k, 3);
  ctx.fillStyle = '#f7f1e2'; ctx.fillText(text, x + 11, y + 20);
  ctx.beginPath(); ctx.arc(tx, ty, 4.5 * k, 0, 7); ctx.fillStyle = '#d4ab4f'; ctx.fill();
  ctx.restore();
}

function quoteCard(ctx, t) {
  const t0 = TL.words.Signori - 0.35; if (t < t0) return;
  const k = easeOut((t - t0) / .5) * (1 - sm(TL.voiceEnd + 0.7, TL.voiceEnd + 1.3, t));
  const W2 = TL.words;
  const l1 = [['Signori,', W2.Signori], ['non', W2.non], ['ci', W2.ci], ['pensiamo', W2.pensiamo], ['nemmeno.', W2.nemmeno]];
  const l2 = [['Sparate', W2.Sparate], ['voi.', W2.voi]];
  ctx.save();
  ctx.translate(56, 58 - (1 - k) * 40); ctx.rotate(-0.022); ctx.globalAlpha = k;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#f1e4c3'; ctx.beginPath(); ctx.roundRect(0, 0, 540, 176, 7); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(120,84,40,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(8, 8, 524, 160, 4); ctx.stroke();
  ctx.fillStyle = '#a9352d'; ctx.font = '600 84px CormI'; ctx.letterSpacing = '0px'; ctx.fillText('“', 20, 88);
  ctx.fillStyle = '#2d2119'; ctx.font = 'italic 600 34px CormI';
  const draw = (arr, x0, yy) => { let x = x0; for (const [w, tw] of arr) { if (t >= tw) { const a = sm(tw, tw + .15, t); ctx.globalAlpha = k * a; ctx.fillText(w, x, yy); ctx.globalAlpha = k; } x += ctx.measureText(w + ' ').width; } };
  draw(l1, 74, 74); draw(l2, 74, 118);
  ctx.globalAlpha = k * sm(W2.Signori + .2, W2.Signori + .7, t);
  ctx.fillStyle = '#6f4c2a'; ctx.font = '700 14px FiraEC'; ctx.letterSpacing = '1.6px';
  ctx.fillText('UN UFFICIALE FRANCESE · SECONDO VOLTAIRE', 74, 152);
  ctx.restore();
}

// ===== acabamento =====
const noiseTiles = [];
(function () { for (let n = 0; n < 4; n++) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const d = g.createImageData(256, 256); const r = rng(1234 + n * 77);
  for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 30; } g.putImageData(d, 0, 0); noiseTiles.push(c); } })();
function post(ctx, frame, tone) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,6,10,.58)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (tone) { ctx.fillStyle = tone; ctx.fillRect(0, 0, W, H); }
  const r = rng(frame * 31 + 7); const tile = noiseTiles[frame % 4]; const ox = Math.floor(r() * 256), oy = Math.floor(r() * 256);
  ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}


// ===== camera suavizada (amortecimento critico), pre-simulada =====
function smoothDamp(cur, target, vel, st, dt) { const om = 2 / st, x = om * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x); const ch = cur - target, tmp = (vel + om * ch) * dt; return [target + (ch + tmp) * e, (vel - om * tmp) * e]; }
function makeCam(t0, t1, targetFn, st) {
  const dt = 1 / 120, n = Math.ceil((t1 - t0) / dt) + 1, out = []; let tg = targetFn(t0);
  let c = { ...tg }, v = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < n; i++) { const t = t0 + i * dt; tg = targetFn(t);
    for (const k of ['x', 'y', 'z']) { const r = smoothDamp(c[k], tg[k], v[k], k === 'z' ? st * 1.15 : st, dt); c[k] = r[0]; v[k] = r[1]; }
    out.push({ x: c.x, y: c.y, z: c.z }); }
  return (t) => { const f = clamp((t - t0) / dt, 0, n - 1.001), i = Math.floor(f), u = f - i; const a = out[i], b = out[i + 1]; return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) }; };
}

// ===== cenario =====
function tree(ctx, x, y, s, kind, seed, t) {
  const r = rng(seed * 13 + 5); const sway = Math.sin(t * 0.9 + seed) * 1.6 * s;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(25,45,20,.22)'; ctx.beginPath(); ctx.ellipse(10 * s, 2, 40 * s, 7 * s, 0, 0, 7); ctx.fill();
  if (kind === 1) { // choupo
    const h = 120 * s, w = 17 * s;
    ctx.fillStyle = '#5a4630'; ctx.fillRect(-2 * s, -14 * s, 4 * s, 14 * s);
    ctx.fillStyle = '#44663a'; ctx.beginPath(); ctx.ellipse(sway * .4, -h / 2 - 8 * s, w, h / 2, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5f8548'; ctx.beginPath(); ctx.ellipse(sway * .4 - w * .22, -h / 2 - 12 * s, w * .62, h * .43, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#86a85a'; ctx.beginPath(); ctx.ellipse(sway * .4 - w * .38, -h / 2 - 22 * s, w * .3, h * .24, 0, 0, 7); ctx.fill();
  } else { // carvalho
    ctx.fillStyle = '#5b4631'; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.quadraticCurveTo(-3 * s, -30 * s, -4 * s, -48 * s); ctx.lineTo(4 * s, -48 * s); ctx.quadraticCurveTo(3 * s, -30 * s, 6 * s, 0); ctx.fill();
    ctx.strokeStyle = '#5b4631'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(0, -40 * s); ctx.lineTo(-20 * s, -62 * s); ctx.moveTo(0, -42 * s); ctx.lineTo(20 * s, -60 * s); ctx.stroke();
    const cl = []; for (let i = 0; i < 9; i++) cl.push([(r() - .5) * 74 * s, -(62 + r() * 38) * s, (24 + r() * 14) * s]);
    ctx.fillStyle = '#3f6236'; for (const c of cl) { ctx.beginPath(); ctx.arc(c[0] + sway, c[1] + 6 * s, c[2], 0, 7); ctx.fill(); }
    ctx.fillStyle = '#5a8043'; for (const c of cl) { ctx.beginPath(); ctx.arc(c[0] + sway - 4 * s, c[1] - 2 * s, c[2] * .84, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#86aa58'; for (const c of cl) { ctx.beginPath(); ctx.arc(c[0] + sway - 9 * s, c[1] - 9 * s, c[2] * .42, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(30,60,30,.5)'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc((r() - .5) * 70 * s + sway, -(50 + r() * 40) * s, 3 * s, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
function bush(ctx, x, y, s, seed) {
  ctx.fillStyle = 'rgba(25,45,20,.2)'; ctx.beginPath(); ctx.ellipse(x + 6 * s, y + 2, 34 * s, 6 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4b6e3a'; ctx.beginPath(); ctx.ellipse(x, y - 10 * s, 30 * s, 16 * s, 0, 0, 7); ctx.ellipse(x + 20 * s, y - 6 * s, 22 * s, 13 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6a8f48'; ctx.beginPath(); ctx.ellipse(x - 5 * s, y - 15 * s, 20 * s, 10 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#93b062'; ctx.beginPath(); ctx.ellipse(x - 10 * s, y - 19 * s, 9 * s, 5 * s, 0, 0, 7); ctx.fill();
}
function windmill(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(25,45,20,.2)'; ctx.beginPath(); ctx.ellipse(8, 1, 36, 6, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e6dcc2'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-12, -78); ctx.lineTo(12, -78); ctx.lineTo(20, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(4, -78); ctx.lineTo(12, -78); ctx.lineTo(20, 0); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a4636'; ctx.beginPath(); ctx.moveTo(-16, -78); ctx.lineTo(0, -102); ctx.lineTo(16, -78); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4a3a2c'; ctx.fillRect(-4, -14, 8, 14);
  ctx.translate(0, -84); ctx.rotate(t * 0.32);
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.fillStyle = '#6b5538'; ctx.fillRect(-1.6, -62, 3.2, 62);
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(2, -60, 13, 38); ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 1; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(2, -60 + k * 7.5); ctx.lineTo(15, -60 + k * 7.5); ctx.stroke(); } ctx.restore(); }
  ctx.fillStyle = '#3e3020'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
  ctx.restore();
}
function cloud2(ctx, x, y, s, a) {
  const g = ctx.createLinearGradient(0, y - 50 * s, 0, y + 28 * s); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.6, `rgba(244,246,248,${a})`); g.addColorStop(1, `rgba(196,210,224,${a})`);
  ctx.fillStyle = g;
  for (const [dx, dy, r] of [[0, 0, 24], [30, -14, 34], [68, -6, 30], [102, 4, 22], [52, -28, 24], [14, 8, 20], [86, 10, 20]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.rect(x, y - 2 * s, 102 * s, 26 * s); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${a * .55})`; ctx.beginPath(); ctx.arc(x + 24 * s, y - 24 * s, 14 * s, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x + 56 * s, y - 38 * s, 10 * s, 0, 7); ctx.fill();
}
function birds(ctx, t, x0, y0, n, seed, col = '#3b3a3a') {
  const r = rng(seed); ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ox = r() * 90, oy = r() * 40, ph = r() * 6; const x = x0 + ox + ((t * 22 + i * 3) % 1500) - 150, y = y0 + oy + Math.sin(t * .8 + ph) * 6; const w = Math.sin(t * 8 + ph) * 4;
    ctx.beginPath(); ctx.moveTo(x - 7, y - w); ctx.quadraticCurveTo(x - 3, y - 4 - w * .3, x, y); ctx.quadraticCurveTo(x + 3, y - 4 - w * .3, x + 7, y - w); ctx.stroke(); }
}
function tuft(ctx, x, y, s, col) { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); for (const d of [-5, 0, 5]) { ctx.moveTo(x + d * s * .5, y); ctx.quadraticCurveTo(x + d * s, y - 7 * s, x + d * s * 1.5, y - 12 * s); } ctx.stroke(); }
function flowers(ctx, x, y, s, col) { ctx.fillStyle = col; for (const [dx, dy] of [[0, 0], [5, -3], [-4, -2]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 1.8 * s, 0, 7); ctx.fill(); } }

// retalhos de campos sobre uma colina
function fields(ctx, camX, f, contour, depth, seed, pal) {
  const r = rng(seed); let wx = -300 + Math.floor((camX * f) / 150) * 150 - 150;
  for (let i = 0; i < 40; i++) { const w = 90 + r() * 130; const x0 = wx - camX * f, x1 = x0 + w; wx += w;
    if (x1 < -50 || x0 > W + 50) continue;
    const c = pal[Math.floor(r() * pal.length)]; const sk = (r() - .5) * 80;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0, contour(wx - w) + 0.5); ctx.lineTo(x1, contour(wx) + 0.5); ctx.lineTo(x1 + sk, contour(wx) + depth); ctx.lineTo(x0 + sk, contour(wx - w) + depth); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,80,40,.35)'; ctx.lineWidth = 1.6; ctx.stroke(); }
}

// pano de fundo completo: ceu, sol com raios, nuvens, colinas, campos, arvores, moinho, passaros
function backdrop(ctx, camX, t, hz, seed, o = {}) {
  const sky = ctx.createLinearGradient(0, 0, 0, hz + 40);
  sky.addColorStop(0, o.top || '#7fa6c6'); sky.addColorStop(.55, '#b9d2dc'); sky.addColorStop(.85, '#eadfc0'); sky.addColorStop(1, '#f3e4bf');
  ctx.fillStyle = sky; ctx.fillRect(-400, -400, W + 800, hz + 440);
  const sunx = (o.sunx || 940) - camX * .03, suny = o.suny || 120;
  const sg = ctx.createRadialGradient(sunx, suny, 6, sunx, suny, 260); sg.addColorStop(0, 'rgba(255,250,222,.95)'); sg.addColorStop(.18, 'rgba(255,236,176,.55)'); sg.addColorStop(1, 'rgba(255,236,176,0)');
  ctx.fillStyle = sg; ctx.fillRect(sunx - 280, suny - 280, 560, 560);
  ctx.save(); ctx.globalAlpha = 0.07 + 0.02 * Math.sin(t * .5); ctx.fillStyle = '#fff3c4';
  for (let i = 0; i < 7; i++) { const a = 1.2 + i * 0.26 + Math.sin(t * .15 + i) * .02; ctx.beginPath(); ctx.moveTo(sunx, suny); ctx.lineTo(sunx + Math.cos(a) * 1100 - 60, suny + Math.sin(a) * 1100); ctx.lineTo(sunx + Math.cos(a) * 1100 + 60, suny + Math.sin(a) * 1100); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(sunx, suny, 22, 0, 7); ctx.fill();
  for (let i = 0; i < 5; i++) { const cx = ((i * 380 + t * 6) % 2000) - 360 - camX * .04; cloud2(ctx, cx, 62 + (i % 3) * 44, 0.8 + (i % 2) * .35, .72); }
  for (let i = 0; i < 4; i++) { const cx = ((i * 520 + 140 + t * 10) % 2200) - 380 - camX * .08; cloud2(ctx, cx, 120 + (i % 2) * 48, 1.2 + (i % 3) * .2, .9); }
  birds(ctx, t, 90, 150, 6, seed + 1);
  // colinas distantes + vilarejo pequeno
  const hill = (base, amp, f, ph, fr) => (wx) => base + Math.sin(wx * fr + ph) * amp + Math.sin(wx * fr * 2.7 + ph * 2) * amp * .35;
  const drawHill = (fn, f, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-10, hz + 400); for (let x = -10; x <= W + 10; x += 8) ctx.lineTo(x, fn(x + camX * f)); ctx.lineTo(W + 10, hz + 400); ctx.closePath(); ctx.fill(); };
  const h1 = hill(hz - 70, 22, .15, 3, .0042), h2 = hill(hz - 36, 19, .3, 8, .0055), h3 = hill(hz - 4, 15, .5, 11, .0062);
  drawHill(h1, .15, '#b6c4cb');
  ctx.fillStyle = '#a8b4b6'; for (let i = 0; i < 6; i++) { const x = ((i * 410 + 120) - camX * .15) % 2400; if (x > -40 && x < W + 40) { ctx.fillRect(x, h1(x + camX * .15) - 10, 14, 10); ctx.beginPath(); ctx.moveTo(x - 2, h1(x + camX * .15) - 10); ctx.lineTo(x + 7, h1(x + camX * .15) - 17); ctx.lineTo(x + 16, h1(x + camX * .15) - 10); ctx.fill(); } }
  drawHill(h2, .3, '#9fb69a');
  fields(ctx, camX, .3, (wx) => h2(wx), 56, seed + 3, ['#aab36a', '#8fae60', '#b8b46e', '#7fa35c', '#a09a58']);
  { const rt = rng(seed + 9); for (let i = 0; i < 16; i++) { const wx = i * 170 + rt() * 90, x = wx - camX * .3; if (x > -60 && x < W + 60) tree(ctx, x, h2(wx) + 6, .32 + rt() * .12, i % 3 === 0 ? 1 : 0, i, t); } }
  drawHill(h3, .5, '#82a46f');
  fields(ctx, camX, .5, (wx) => h3(wx), 70, seed + 5, ['#9db462', '#86a95c', '#b4b26a', '#76985a']);
  const wmx = (o.windmillX != null ? o.windmillX : 860) - camX * .5; windmill(ctx, wmx, h3(wmx + camX * .5) + 8, .62, t);
  { const rt = rng(seed + 21); for (let i = 0; i < 14; i++) { const wx = i * 190 + rt() * 120, x = wx - camX * .5; if (x > -60 && x < W + 60) tree(ctx, x, h3(wx) + 12, .5 + rt() * .2, i % 4 === 1 ? 1 : 0, i + 20, t); } }
  // nevoa de profundidade
  const hz2 = ctx.createLinearGradient(0, hz - 90, 0, hz + 30); hz2.addColorStop(0, 'rgba(240,228,196,0)'); hz2.addColorStop(1, 'rgba(240,228,196,.35)'); ctx.fillStyle = hz2; ctx.fillRect(0, hz - 90, W, 120);
}
