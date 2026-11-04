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

// figura base. Pes em (0,0), altura ~ 72 unidades.
function figure(ctx, o) {
  const { x, y, s = 1, coat = '#b5302a', facing = 1, phase = 0, walk = 0, skin = SKIN[0], hat = true, hatTrim = '#e9e3d3',
    officer = false, hand = null, hatInHand = false, idle = 0, rot = 0, alpha = 1, shadow = true, cuff = '#e8e2d2', musket = true } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  if (shadow) { ctx.fillStyle = 'rgba(30,40,20,.22)'; ctx.beginPath(); ctx.ellipse(0, 1, 15 * s, 3.6 * s, 0, 0, 7); ctx.fill(); }
  ctx.rotate(rot * facing); ctx.scale(s * facing, s);
  const bob = -Math.abs(Math.sin(phase)) * 2.2 * walk - Math.sin(idle) * 0.7 * (1 - walk);
  const sw = Math.sin(phase) * walk;
  // pernas
  for (const k of [-1, 1]) {
    const a = sw * k * 0.62;
    const hx = 2.2 * k, hy = -27 + bob;
    const kx = hx + Math.sin(a) * 8, ky = hy + 13;
    const lift = walk * Math.max(0, Math.sin(phase + (k > 0 ? 0 : Math.PI) + 1.57)) * 4;
    const fx = hx + Math.sin(a) * 14, fy = -2 - lift;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ece6d6'; ctx.lineWidth = 5.6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.strokeStyle = '#2b2828'; ctx.lineWidth = 5.2; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = '#161313'; ctx.fillRect(fx - 3, fy - 1.5, 8, 3.4);
  }
  // casaca
  ctx.fillStyle = coat;
  ctx.beginPath(); ctx.moveTo(-8.5, -52 + bob); ctx.quadraticCurveTo(0, -56 + bob, 8.5, -52 + bob);
  ctx.lineTo(9.5, -22 + bob); ctx.lineTo(-9.5, -22 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(-9.5, -26 + bob, 19, 4.5);
  // cinturoes cruzados
  ctx.strokeStyle = '#f2ecdd'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(-7, -51 + bob); ctx.lineTo(7, -28 + bob); ctx.moveTo(7, -51 + bob); ctx.lineTo(-7, -28 + bob); ctx.stroke();
  if (officer) { ctx.strokeStyle = '#c9a13f'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-9, -48 + bob); ctx.lineTo(9, -30 + bob); ctx.stroke();
    ctx.fillStyle = '#c9a13f'; for (let i = 0; i < 3; i++) ctx.fillRect(-1 + (i - 1) * 0, -48 + i * 8 + bob, 2.2, 2.2); }
  ctx.fillStyle = '#d8c48a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -47 + i * 7 + bob, 0.9, 0, 7); ctx.fill(); }
  // cabeca
  ctx.fillStyle = '#7d7468'; ctx.fillRect(-9, -62 + bob, 4, 6); // rabicho
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -59 + bob, 6.4, 0, 7); ctx.fill();
  if (officer) { ctx.fillStyle = '#ebe6da'; ctx.beginPath(); ctx.arc(-0.6, -60 + bob, 7.4, Math.PI * 0.95, Math.PI * 2.1); ctx.fill(); ctx.beginPath(); ctx.arc(-6.3, -56 + bob, 3.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(-6.3, -52.4 + bob, 2.6, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#2a2220'; ctx.beginPath(); ctx.arc(3, -59.5 + bob, 0.95, 0, 7); ctx.fill();
  if (officer) { ctx.strokeStyle = '#4a3b33'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(3.5, -56.3 + bob); ctx.lineTo(6.6, -57 + bob); ctx.stroke(); }
  if (hat && !hatInHand) tricorn(ctx, 0, -62 + bob, 1.05, officer ? '#1f1b1a' : '#262221', officer ? '#d1ac4a' : hatTrim, officer);
  // braco + mosquete / mao
  if (hand) {
    const sx = 3, sy = -48 + bob;
    ctx.strokeStyle = coat; ctx.lineWidth = 5.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + hand[0]) / 2 + 2, (sy + hand[1]) / 2 + 7, hand[0], hand[1] + bob); ctx.stroke();
    ctx.fillStyle = cuff; ctx.beginPath(); ctx.arc(hand[0], hand[1] + bob, 3.1, 0, 7); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hand[0] + 1.2, hand[1] + bob - 0.5, 2.6, 0, 7); ctx.fill();
    if (hat && hatInHand) tricorn(ctx, hand[0] + 4, hand[1] + bob - 3, 1.05, '#1f1b1a', '#d1ac4a', true);
  } else if (musket) {
    ctx.strokeStyle = '#6a4a2c'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(9, -26 + bob); ctx.lineTo(-1.5, -80 + bob); ctx.stroke();
    ctx.strokeStyle = '#c9ccd0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-1.5, -80 + bob); ctx.lineTo(-2.4, -88 + bob); ctx.stroke();
    ctx.strokeStyle = coat; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(3, -48 + bob); ctx.lineTo(7.6, -35 + bob); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(8, -34 + bob, 2.6, 0, 7); ctx.fill();
  }
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
