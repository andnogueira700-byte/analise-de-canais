// Motor de animação do Mapa Raiz: desenha um quadro do vídeo para um tempo t (segundos).
const W = 1920, H = 1080;
const C = {
  anil: '#0B1E4F', tinta: '#06122F', areia: '#E9D3A4', ipe: '#FFC21A', verde: '#00A86B',
  urucum: '#E8432E', turq: '#19B8C9', jambo: '#E0277A', caju: '#FF7F11', acai: '#7B3FA0',
  lilas: '#B48AD8', branco: '#FFFFFF', cinza: '#9AA3B5'
};
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- utilidades ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = p => (p = clamp(p), p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOut = p => 1 - Math.pow(1 - clamp(p), 3);
const backOut = p => { p = clamp(p); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const merc = (lon, lat) => [lon, 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// visibilidade com fade de entrada e saída
function vis(t, t0, t1, fin = 0.35, fout = 0.35) {
  if (t < t0 || t > t1 + fout) return 0;
  return Math.min(clamp((t - t0) / fin), t1 === Infinity ? 1 : clamp((t1 + fout - t) / fout));
}
const fmt = n => Math.round(n).toLocaleString('pt-BR');

// localiza o tempo de uma frase na legenda (a partir de um tempo mínimo)
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
// texto corrido da legenda, com o início de cada trecho, para achar o tempo de qualquer frase
let FULL = ' ', OFFS = [];
for (const c of CUES) { OFFS.push([FULL.length, c[0], c[1]]); FULL += norm(c[2]) + ' '; }
function at(phrase, after = 0) {
  const p = ' ' + norm(phrase) + ' ';
  const startCue = OFFS.find(o => o[2] >= after) || OFFS[0];
  const k = FULL.indexOf(p, Math.max(0, startCue[0] - 1));
  if (k < 0) throw new Error('frase não encontrada: ' + phrase + ' @' + after);
  let cue = OFFS[0]; for (const o of OFFS) { if (o[0] <= k + 1) cue = o; else break; }
  // estima o tempo dentro do trecho pela posição do caractere
  const next = OFFS[OFFS.indexOf(cue) + 1]; const len = (next ? next[0] : FULL.length) - cue[0];
  return +(cue[1] + (cue[2] - cue[1]) * Math.max(0, k + 1 - cue[0]) / len).toFixed(3);
}

// ---------- imagens ----------
const IMG = {};
function loadImages(list) {
  return Promise.all(list.map(([k, src]) => new Promise(res => {
    const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => { console.warn('falhou', src); res(); }; im.src = src;
  })));
}

// ---------- geografia ----------
const LODS = {}; let LAND = []; // {name, kind, path, bbox}
function mkPath(rings) {
  const p = new Path2D(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 2) {
      const x = r[i], y = r[i + 1];
      if (i === 0) p.moveTo(x, y); else p.lineTo(x, y);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    p.closePath();
  }
  return { path: p, bbox: [x0, y0, x1, y1] };
}
function buildGeo() {
  for (const lod of ['fine', 'coarse']) {
    const G = GEO[lod], L = [];
    for (const [n, rings] of Object.entries(G.countries)) L.push({ name: n === 'Brazil' ? 'BrazilBase' : n, kind: 'country', ...mkPath(rings) });
    for (const [n, rings] of Object.entries(G.states)) L.push({ name: n, kind: 'state', ...mkPath(rings) });
    const br = new Path2D(); for (const l of L) if (l.kind === 'state') br.addPath(l.path);
    L.push({ name: 'Brazil', kind: 'country', path: br, bbox: [-74, -34, -34, 5.3], virtual: true });
    // contorno de terra em pedaços, para cortar o que está fora da tela
    const coast = G.land.map(r => mkPath([r]));
    LODS[lod] = { land: L, coast };
  }
  LAND = LODS.fine.land;
}
const byName = (n) => LAND.find(l => l.name === n);

// ---------- câmera ----------
let CAM = [];   // {t, lon, lat, span, d} ou {t, follow, span, d}
let ROUTES = {};
function camTarget(k, t) {
  if (k.follow) { const h = routeHead(ROUTES[k.follow], t); return [h[0], h[1], Math.log(k.span)]; }
  const [x, y] = merc(k.lon, k.lat); return [x, y, Math.log(k.span)];
}
function camera(t) {
  let st = camTarget(CAM[0], t), arrive = CAM[0].t;
  for (let i = 1; i < CAM.length; i++) {
    const k = CAM[i]; if (t < k.t) break;
    const from = st, to = camTarget(k, t), p = ease((t - k.t) / k.d);
    const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const bump = Math.max(0, Math.log(Math.max(dist * 1.3, 1e-6)) - Math.max(from[2], to[2]));
    st = [lerp(from[0], to[0], p), lerp(from[1], to[1], p), lerp(from[2], to[2], p) + bump * Math.sin(Math.PI * p) * 0.8];
    arrive = k.t + k.d;
    // para o próximo quadro-chave, o ponto de partida é onde a câmera está no momento em que ele começa
    if (i + 1 < CAM.length && CAM[i + 1].t <= t) {
      const tn = CAM[i + 1].t, pn = ease((tn - k.t) / k.d), ton = camTarget(k, tn);
      st = [lerp(from[0], ton[0], pn), lerp(from[1], ton[1], pn), lerp(from[2], ton[2], pn) + bump * Math.sin(Math.PI * pn) * 0.8];
    }
  }
  // empurrão lento depois de chegar, para o mapa nunca ficar parado
  const drift = Math.min(Math.max(0, t - arrive), 12) * 0.006;
  const span = Math.exp(st[2] - drift);
  return { x: st[0], y: st[1], s: W / span };
}
const toScreen = (cam, lon, lat) => { const [x, y] = merc(lon, lat); return [(x - cam.x) * cam.s + W / 2, -(y - cam.y) * cam.s + H / 2]; };

// ---------- rotas ----------
function buildRoute(r) {
  const P = r.pts.map(p => merc(p[0], p[1]));
  const pts = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const u = k / 40, u2 = u * u, u3 = u2 * u;
      pts.push([0, 1].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
  }
  pts.push(P[P.length - 1]);
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  r._pts = pts; r._cum = cum; r._L = cum[cum.length - 1];
  return r;
}
function routeProg(r, t) { return ease((t - r.t0) / (r.t1 - r.t0)); }
function routeHead(r, t) {
  const L = routeProg(r, t) * r._L; let i = r._cum.findIndex(c => c >= L); if (i <= 0) return r._pts[0];
  const a = r._pts[i - 1], b = r._pts[i], f = (L - r._cum[i - 1]) / ((r._cum[i] - r._cum[i - 1]) || 1);
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
}

// ---------- textura do mar ----------
let NOISE, GRAIN, OVER; const GLOW = document.createElement('canvas'); GLOW.width = 640; GLOW.height = 360; const gctx = GLOW.getContext('2d');
function makeTextures() {
  const n = document.createElement('canvas'); n.width = n.height = 512; const g = n.getContext('2d');
  const r = rng(7); const id = g.createImageData(512, 512);
  // ondulação: soma de senos irregulares
  const waves = Array.from({ length: 9 }, () => [r() * 6.28, (r() * 0.03 + 0.012), r() * 6.28, r() * 0.5 + 0.5]);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    let v = 0; for (const [a, f, ph, amp] of waves) v += amp * Math.sin((x * Math.cos(a) + y * Math.sin(a)) * f * 6.28 / 6.28 * 2 + ph);
    v = (v / 5 + 1) / 2; const i = (y * 512 + x) * 4;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = Math.round(clamp(v) * 40);
  }
  g.putImageData(id, 0, 0); NOISE = n;
  const gr = document.createElement('canvas'); gr.width = gr.height = 256; const gg = gr.getContext('2d'); const gi = gg.createImageData(256, 256); const r2 = rng(3);
  for (let i = 0; i < gi.data.length; i += 4) { const v = r2() * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 14; }
  gg.putImageData(gi, 0, 0); GRAIN = gr;
  OVER = document.createElement('canvas'); OVER.width = W; OVER.height = H; const o = OVER.getContext('2d');
  const vg = o.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.72); vg.addColorStop(0, 'rgba(6,18,47,0)'); vg.addColorStop(1, 'rgba(6,18,47,0.55)');
  o.fillStyle = vg; o.fillRect(0, 0, W, H); o.fillStyle = o.createPattern(GRAIN, 'repeat'); o.fillRect(0, 0, W, H);
}

// ---------- desenho do mapa ----------
function drawMap(t, cam, S) {
  // mar
  const og = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, W * 0.75);
  og.addColorStop(0, '#173A7A'); og.addColorStop(0.55, '#0F2A60'); og.addColorStop(1, '#081A40');
  ctx.fillStyle = og; ctx.fillRect(0, 0, W, H);
  // ondulação presa ao mapa (paralaxe)
  ctx.save(); ctx.globalAlpha = 0.55; const pat = ctx.createPattern(NOISE, 'repeat');
  const ox = (-cam.x * cam.s * 0.35 + t * 6) % 512, oy = (cam.y * cam.s * 0.35) % 512;
  ctx.translate(ox, oy); ctx.fillStyle = pat; ctx.fillRect(-ox - 512, -oy - 512, W + 1024, H + 1024); ctx.restore();

  const lod = W / cam.s > 22 ? LODS.coarse : LODS.fine; LAND = lod.land;
  const vx0 = cam.x - W / 2 / cam.s, vx1 = cam.x + W / 2 / cam.s, vy0 = cam.y - H / 2 / cam.s, vy1 = cam.y + H / 2 / cam.s;
  const pad = 60 / cam.s;
  const visible = LAND.filter(l => !l.virtual && l.bbox[2] > vx0 - pad && l.bbox[0] < vx1 + pad && l.bbox[3] > vy0 - pad && l.bbox[1] < vy1 + pad);
  // linhas d'água e plataforma rasa, desenhadas em baixa resolução (são suaves de qualquer jeito)
  const coast = lod.coast.filter(l => l.bbox[2] > vx0 - pad && l.bbox[0] < vx1 + pad && l.bbox[3] > vy0 - pad && l.bbox[1] < vy1 + pad);
  const k = GLOW.width / W; gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.clearRect(0, 0, GLOW.width, GLOW.height);
  gctx.setTransform(cam.s * k, 0, 0, -cam.s * k, (W / 2 - cam.x * cam.s) * k, (H / 2 + cam.y * cam.s) * k); gctx.lineJoin = 'round';
  for (const [w, col] of [[46, 'rgba(160,200,255,0.05)'], [30, 'rgba(160,200,255,0.06)'], [16, 'rgba(120,180,255,0.10)'], [26, 'rgba(40,110,180,0.16)'], [18, 'rgba(40,110,180,0.16)'], [11, 'rgba(40,110,180,0.16)'], [6, 'rgba(40,110,180,0.16)']]) {
    gctx.lineWidth = w * 2 / cam.s; gctx.strokeStyle = col; for (const l of coast) gctx.stroke(l.path);
  }
  ctx.drawImage(GLOW, 0, 0, W, H);
  ctx.save(); ctx.setTransform(cam.s, 0, 0, -cam.s, W / 2 - cam.x * cam.s, H / 2 + cam.y * cam.s);
  ctx.lineJoin = 'round';
  // terra
  ctx.fillStyle = C.areia; for (const l of visible) ctx.fill(l.path);
  // regiões em destaque (com efeito levantado)
  for (const h of S.highlights) {
    const a = vis(t, h.t0, h.t1, 0.6, 0.6); if (!a) continue;
    const l = byName(h.name); if (!l) continue;
    const lift = (h.lift ?? 5) * a / cam.s;
    ctx.save(); ctx.globalAlpha = 0.28 * a; ctx.fillStyle = C.tinta; ctx.translate(0, -lift * 0.6); ctx.fill(l.path); ctx.restore();
    ctx.save(); ctx.translate(0, lift * 0.7); ctx.globalAlpha = a * (h.alpha ?? 0.92); ctx.fillStyle = h.color; ctx.fill(l.path);
    if (h.pulse) { ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 5)); ctx.lineWidth = 4 / cam.s; ctx.strokeStyle = h.pulse; ctx.stroke(l.path); }
    ctx.restore();
  }
  // fronteiras
  ctx.lineWidth = 1.1 / cam.s; ctx.strokeStyle = 'rgba(6,18,47,0.28)';
  for (const l of visible) ctx.stroke(l.path);
  ctx.restore();

  // manchas de região (colônias)
  for (const b of S.blobs) {
    const a = vis(t, b.t0, b.t1, 0.8, 0.6); if (!a) continue;
    const [x, y] = toScreen(cam, b.lon, b.lat); const r = Math.max(b.r * cam.s, b.minPx ?? 14) * (0.6 + 0.4 * easeOut((t - b.t0) / 0.8));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = b.grey && t > b.grey ? C.cinza : b.color;
    g.addColorStop(0, hexA(col, 0.85 * a)); g.addColorStop(0.65, hexA(col, 0.55 * a)); g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  // enxames de pontos (pessoas chegando)
  for (const sw of S.swarms) {
    const a = vis(t, sw.t0, sw.t1, 0.3, 0.6); if (!a) continue;
    const r = rng(sw.seed || 11);
    for (let i = 0; i < sw.n; i++) {
      const ang = r() * 6.283, rad = Math.sqrt(r()) * sw.r, ti = sw.t0 + (i / sw.n) * (sw.dur || 3);
      const p = easeOut((t - ti) / 0.4); if (p <= 0) continue;
      const [x, y] = toScreen(cam, sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8);
      ctx.globalAlpha = a * p; ctx.fillStyle = sw.color; ctx.beginPath(); ctx.arc(x, y, (sw.px || 5) * backOut(p), 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(6,18,47,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

// ---------- elementos sobre o mapa ----------
function drawLabels(t, cam, S) {
  for (const l of S.labels) {
    const a = vis(t, l.t0, l.t1, 0.5, 0.5); if (!a) continue;
    const [x, y] = toScreen(cam, l.lon, l.lat);
    ctx.save(); ctx.globalAlpha = a * (l.alpha ?? 0.62); ctx.fillStyle = l.color || C.tinta;
    ctx.font = `700 ${l.size || 30}px Figtree`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${(l.size || 30) * 0.18}px`; ctx.fillText(l.text.toUpperCase(), x, y); ctx.restore();
  }
}
function drawRoutes(t, cam) {
  for (const r of Object.values(ROUTES)) {
    const a = vis(t, r.t0, r.hide ?? Infinity, 0.2, 0.6); if (!a || t < r.t0) continue;
    const L = routeProg(r, t) * r._L;
    ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
    for (let i = 0; i < r._pts.length && r._cum[i] <= L; i++) {
      const p = r._pts[i]; const x = (p[0] - cam.x) * cam.s + W / 2, y = -(p[1] - cam.y) * cam.s + H / 2;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    const h = routeHead(r, t); const hx = (h[0] - cam.x) * cam.s + W / 2, hy = -(h[1] - cam.y) * cam.s + H / 2; ctx.lineTo(hx, hy);
    ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(6,18,47,0.35)'; ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = r.color || C.branco; ctx.stroke(); ctx.setLineDash([]);
    if (r.icon && IMG[r.icon] && t <= r.t1 + 0.6) {
      const sz = r.size || 84, bob = Math.sin(t * 6) * 4; const ia = vis(t, r.t0, r.t1, 0.2, 0.5);
      ctx.globalAlpha = ia; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
      ctx.drawImage(IMG[r.icon], hx - sz / 2, hy - sz * 0.8 + bob, sz, sz);
    }
    ctx.restore();
  }
}
function drawIcon(img, x, y, sz, a, scale = 1) {
  if (!IMG[img]) return;
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 7;
  const s = sz * scale; ctx.drawImage(IMG[img], x - s / 2, y - s / 2, s, s); ctx.restore();
}
function drawCross(x, y, sz, p) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.strokeStyle = C.urucum; ctx.lineWidth = sz * 0.1; ctx.lineCap = 'round';
  const d = sz * 0.42 * easeOut(p * 1.3); ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d);
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8; ctx.stroke(); ctx.restore();
}
function drawIcons(t, cam, S) {
  for (const ic of S.icons) {
    const a = vis(t, ic.t0, ic.t1, 0.2, 0.35); if (!a) continue;
    let x, y; if (ic.sx != null) { x = ic.sx; y = ic.sy; } else { [x, y] = toScreen(cam, ic.lon, ic.lat); x += ic.dx || 0; y += ic.dy || 0; }
    const sc = backOut((t - ic.t0) / 0.45) * (1 + 0.03 * Math.sin(t * 3 + (ic.lon || 0)));
    let aa = a; if (ic.sink && t > ic.sink) { const p = clamp((t - ic.sink) / 1.6); y += p * 50; aa *= 1 - p; }
    const grey = ic.grey && t > ic.grey;
    ctx.save(); if (grey) ctx.filter = 'grayscale(1) opacity(0.6)';
    drawIcon(ic.img, x, y, ic.size || 96, aa, sc); ctx.restore();
    if (ic.cross && t > ic.cross) drawCross(x, y, ic.size || 96, (t - ic.cross) / 0.3);
    if (ic.label) tagLabel(ic.label, x, y + (ic.size || 96) * 0.62, aa, 24);
  }
  for (const sw of S.iconSwarms) {
    const a = vis(t, sw.t0, sw.t1, 0.3, 0.5); if (!a) continue;
    const r = rng(sw.seed || 5);
    for (let i = 0; i < sw.n; i++) {
      const ang = r() * 6.283, rad = Math.sqrt(r()) * sw.r, ti = sw.t0 + (i / sw.n) * (sw.dur || 2.5);
      const p = (t - ti) / 0.4; if (p <= 0) continue;
      const [x, y] = toScreen(cam, sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8);
      drawIcon(sw.img, x, y, sw.size || 54, a, backOut(p));
    }
  }
}
function tagLabel(text, x, y, a, size = 26, bg = C.tinta, fg = C.branco) {
  ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px Figtree`; ctx.letterSpacing = `${size * 0.08}px`;
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.6;
  ctx.fillStyle = bg; rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1); ctx.restore();
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// alfinete da marca
const PIN = new Path2D('M100 28c-30 0-52 22-52 50 0 34 52 72 52 72s52-38 52-72c0-28-22-50-52-50z');
function drawPinShape(x, y, sz, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); const k = sz / 130; ctx.scale(k, k); ctx.translate(-100, -186);
  ctx.save(); ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(100, 186, 30, 9, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.verde; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (const d of ['M100 150v24', 'M100 160c-10 4-20 6-30 14', 'M100 160c10 4 20 6 30 14', 'M100 168c-6 6-12 8-18 18', 'M100 168c6 6 12 8 18 18']) ctx.stroke(new Path2D(d));
  ctx.fillStyle = C.ipe; ctx.strokeStyle = C.tinta; ctx.lineWidth = 6; ctx.fill(PIN); ctx.stroke(PIN);
  ctx.fillStyle = C.tinta; ctx.beginPath(); ctx.arc(100, 76, 15, 0, 7); ctx.fill();
  ctx.restore();
}
function drawPin(t, cam, S) {
  const P = S.pins; let i = -1; for (let k = 0; k < P.length; k++) if (P[k].t <= t) i = k;
  if (i < 0) return; const cur = P[i]; if (cur.hide) { // some com fade
    const prev = P[i - 1]; if (!prev || prev.hide) return; const a = 1 - clamp((t - cur.t) / 0.4); if (a <= 0) return;
    const [x, y] = toScreen(cam, prev.lon, prev.lat); drawPinShape(x, y, 96, a); return;
  }
  const prev = i > 0 && !P[i - 1].hide ? P[i - 1] : null;
  let [x, y] = toScreen(cam, cur.lon, cur.lat); let a = 1, sc = 1;
  const p = clamp((t - cur.t) / 0.8);
  if (prev && p < 1) { const [x0, y0] = toScreen(cam, prev.lon, prev.lat); const e = ease(p); x = lerp(x0, x, e); y = lerp(y0, y, e) - Math.sin(Math.PI * e) * 120; }
  else if (!prev) { a = clamp((t - cur.t) / 0.3); sc = backOut((t - cur.t) / 0.5); y -= (1 - easeOut(p)) * 80; }
  drawPinShape(x, y, 96 * sc, a);
  if (cur.label) { const la = clamp((t - cur.t - 0.6) / 0.3) * a; if (la > 0) tagLabel(cur.label, x, y + 46, la, 28, C.branco, C.tinta); }
}

// ---------- interface ----------
function drawYear(t, S) {
  const Y = S.years; let i = -1; for (let k = 0; k < Y.length; k++) if (Y[k].t <= t) i = k;
  if (i < 0 || Y[i].hide) { if (i > 0 && Y[i].hide && Y[i - 1].y) { const a = 1 - clamp((t - Y[i].t) / 0.4); if (a > 0) yearBox(Y[i - 1].y, a, 1); } return; }
  const cur = Y[i], prev = i > 0 && !Y[i - 1].hide ? Y[i - 1] : null;
  const p = clamp((t - cur.t) / 0.9); const from = cur.from ?? (prev ? prev.y : cur.y - 20);
  const val = Math.round(lerp(from, cur.y, easeOut(p))); const a = prev ? 1 : clamp((t - cur.t) / 0.3);
  yearBox(cur.label ? cur.label : String(val), a, 1 + 0.06 * Math.sin(Math.PI * p) * (p < 1));
}
function yearBox(txt, a, sc) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W - 70, 70); ctx.scale(sc, sc);
  ctx.font = '800 64px "Bricolage Grotesque"'; const w = Math.max(ctx.measureText('0000').width, ctx.measureText(txt).width) + 56;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.fillStyle = C.ipe; rr(-w, 0, w, 92, 16); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.fillStyle = C.tinta; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2, 49); ctx.restore();
}
function drawChapter(t, S) {
  for (const c of S.chapters) {
    const a = vis(t, c.t0, c.t0 + 5, 0.4, 0.5); if (!a) continue;
    const slide = (1 - easeOut((t - c.t0) / 0.5)) * -40;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(70 + slide, 70);
    ctx.font = '800 44px "Bricolage Grotesque"'; const nw = ctx.measureText(c.num).width + 40;
    ctx.font = '700 30px Figtree'; ctx.letterSpacing = '4px'; const tw = ctx.measureText(c.title.toUpperCase()).width + 44;
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.tinta; rr(0, 0, nw + tw, 80, 14); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.ipe; rr(0, 0, nw, 80, [14, 0, 0, 14]); ctx.fill();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.tinta; ctx.letterSpacing = '0px'; ctx.font = '800 44px "Bricolage Grotesque"'; ctx.fillText(c.num, nw / 2, 43);
    ctx.textAlign = 'left'; ctx.fillStyle = C.branco; ctx.font = '700 30px Figtree'; ctx.letterSpacing = '4px'; ctx.fillText(c.title.toUpperCase(), nw + 22, 42);
    ctx.restore();
  }
}
function drawPills(t, S) {
  for (const p of S.pills) {
    const a = vis(t, p.t0, p.t1, 0.3, 0.3); if (!a) continue;
    const up = (1 - easeOut((t - p.t0) / 0.4)) * 30;
    ctx.save(); ctx.globalAlpha = a; ctx.font = '700 42px Figtree'; const w = ctx.measureText(p.text).width + 80;
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = C.branco; rr(W / 2 - w / 2, H - 150 + up, w, 84, 42); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = p.color || C.ipe; ctx.beginPath(); ctx.arc(W / 2 - w / 2 + 34, H - 108 + up, 9, 0, 7); ctx.fill();
    ctx.fillStyle = C.tinta; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, W / 2 + 12, H - 106 + up); ctx.restore();
  }
}
function card(x, y, w, h, a, fill = C.branco) {
  ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10; ctx.fillStyle = fill; rr(x, y, w, h, 22); ctx.fill(); ctx.shadowColor = 'transparent';
}
function drawNumbers(t, S) {
  for (const n of S.numbers) {
    const a = vis(t, n.t0, n.t1, 0.3, 0.35); if (!a) continue;
    const p = easeOut((t - n.t0 - 0.15) / 1.3); const v = (n.from ?? 0) + (n.value - (n.from ?? 0)) * p;
    const txt = (n.prefix || '') + (n.raw ? n.raw : fmt(v)) + (n.suffix || '');
    ctx.save(); ctx.globalAlpha = a; const sc = 0.85 + 0.15 * backOut((t - n.t0) / 0.45);
    ctx.font = '800 120px "Bricolage Grotesque"'; const nw = ctx.measureText((n.prefix || '') + (n.raw || fmt(n.value)) + (n.suffix || '')).width;
    ctx.font = '700 28px Figtree'; ctx.letterSpacing = '3px'; const lw = ctx.measureText(n.label.toUpperCase()).width;
    const w = Math.max(nw, lw) + 100, h = 230, x = n.x ?? W / 2, y = n.y ?? 150;
    ctx.translate(x, y + h / 2); ctx.scale(sc, sc); ctx.translate(-x, -(y + h / 2));
    card(x - w / 2, y, w, h, a);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
    ctx.fillStyle = n.color || C.urucum; ctx.font = '800 120px "Bricolage Grotesque"'; ctx.fillText(txt, x, y + 140);
    ctx.fillStyle = C.tinta; ctx.font = '700 28px Figtree'; ctx.letterSpacing = '3px'; ctx.fillText(n.label.toUpperCase(), x, y + 195);
    ctx.restore();
  }
}
function drawWords(t, S) {
  for (const wd of S.words) {
    const a = vis(t, wd.t0, wd.t1, 0.3, 0.35); if (!a) continue;
    const x = wd.x ?? 90, y = wd.y ?? 300, w = 640, h = wd.meaning ? 300 : 240;
    const slide = (1 - easeOut((t - wd.t0) / 0.45)) * -50;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(slide, 0); card(x, y, w, h, a);
    tagLabelLeft(wd.lang, x + 36, y + 50, wd.langColor || C.acai);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.tinta; ctx.font = 'italic 600 76px Fraunces'; ctx.fillText(wd.word, x + 36, y + 160);
    if (wd.pt) { ctx.font = '700 40px Figtree'; ctx.fillStyle = C.verde; ctx.fillText('→ ' + wd.pt, x + 36, y + 218); }
    if (wd.meaning) { ctx.font = 'italic 400 34px Figtree'; ctx.fillStyle = '#4a5068'; ctx.fillText('“' + wd.meaning + '”', x + 36, y + (wd.pt ? 268 : 215)); }
    if (wd.icon) drawIcon(wd.icon, x + w - 90, y + 110, 120, a);
    ctx.restore();
  }
}
function tagLabelLeft(text, x, y, bg) {
  ctx.font = '700 24px Figtree'; ctx.letterSpacing = '3px'; const w = ctx.measureText(text).width + 30;
  ctx.fillStyle = bg; rr(x, y - 20, w, 40, 20); ctx.fill(); ctx.fillStyle = C.branco; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, x + 15, y + 1); ctx.letterSpacing = '0px';
}
function drawPeople(t, S) {
  for (const pp of S.people) {
    const a = vis(t, pp.t0, pp.t1, 0.35, 0.35); if (!a) continue;
    const right = pp.side === 'right';
    ctx.save(); ctx.font = '800 46px "Bricolage Grotesque"'; const nw = ctx.measureText(pp.name).width;
    ctx.font = '700 24px Figtree'; ctx.letterSpacing = '3px'; const rw = ctx.measureText(pp.role.toUpperCase()).width; ctx.letterSpacing = '0px';
    const w = Math.max(nw, rw) + 290, h = 220; const x = right ? W - 90 - w : 90, y = pp.y ?? 330;
    const slide = (1 - easeOut((t - pp.t0) / 0.45)) * (right ? 60 : -60);
    ctx.globalAlpha = a; ctx.translate(slide, 0); card(x, y, w, h, a);
    const cx = x + 125, cy = y + h / 2, R = 82;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = '#d9cfbb'; ctx.fill(); ctx.clip();
    if (pp.img && IMG[pp.img]) { const im = IMG[pp.img]; const k = Math.max(2 * R / im.width, 2 * R / im.height) * (pp.zoom || 1.15); const iw = im.width * k, ih = im.height * k; ctx.drawImage(im, cx - iw / 2, cy - R - (pp.top ?? 0.05) * ih, iw, ih); }
    else if (pp.icon) drawIcon(pp.icon, cx, cy, 110, 1);
    ctx.restore(); ctx.lineWidth = 7; ctx.strokeStyle = C.ipe; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.tinta; ctx.font = '800 46px "Bricolage Grotesque"'; ctx.fillText(pp.name, x + 238, y + 102);
    ctx.font = '700 24px Figtree'; ctx.letterSpacing = '3px'; ctx.fillStyle = C.acai; ctx.fillText(pp.role.toUpperCase(), x + 238, y + 146);
    if (pp.years) { ctx.letterSpacing = '0px'; ctx.font = '500 24px Figtree'; ctx.fillStyle = '#5a6078'; ctx.fillText(pp.years, x + 238, y + 182); }
    ctx.restore();
  }
}
function drawDots(t, S) {
  for (const d of S.dots) {
    const a = vis(t, d.t0, d.t1, 0.35, 0.35); if (!a) continue;
    const cols = d.cols || 10, rows = Math.ceil(d.total / cols), cell = d.cell || 38;
    const w = cols * cell + 80, h = rows * cell + 170; const x = d.x ?? (W - 90 - w), y = d.y ?? 200;
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    ctx.textAlign = 'left'; ctx.fillStyle = C.tinta; ctx.font = '700 26px Figtree'; ctx.letterSpacing = '2px'; ctx.fillText(d.title.toUpperCase(), x + 40, y + 56); ctx.letterSpacing = '0px';
    for (let i = 0; i < d.total; i++) {
      const ti = d.t0 + 0.3 + i * (d.speed || 0.012); const p = backOut((t - ti) / 0.3); if (p <= 0) continue;
      const cx = x + 40 + (i % cols) * cell + cell / 2, cy = y + 90 + Math.floor(i / cols) * cell + cell / 2;
      const colored = i < d.colored && t > d.t0 + (d.colorAt ?? 0);
      ctx.fillStyle = colored ? d.color : (d.base || '#cfd3dc'); ctx.beginPath(); ctx.arc(cx, cy, cell * 0.36 * p, 0, 7); ctx.fill();
    }
    ctx.font = '500 24px Figtree'; ctx.fillStyle = '#4a5068';
    let lx = x + 40; for (const [col, txt] of d.legend) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 10, y + h - 42, 10, 0, 7); ctx.fill(); ctx.fillStyle = C.tinta; ctx.fillText(txt, lx + 28, y + h - 34); lx += ctx.measureText(txt).width + 70; }
    ctx.restore();
  }
}
function drawRows(t, S) {
  for (const row of S.rows) {
    const a = vis(t, row.t0, row.t1, 0.3, 0.35); if (!a) continue;
    const n = row.items.length, cw = 220, w = n * cw + 40, h = 250, x = W / 2 - w / 2, y = row.y ?? 170;
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    row.items.forEach((it, i) => {
      const ti = it.at ?? (row.t0 + i * 0.35); const p = (t - ti) / 0.45; if (p <= 0) return;
      const cx = x + 20 + cw * i + cw / 2; const grey = it.cross && t > it.cross;
      ctx.save(); if (grey) ctx.filter = 'grayscale(1) opacity(0.55)'; drawIcon(it.img, cx, y + 100, 120, 1, backOut(p)); ctx.restore();
      if (it.cross && t > it.cross) drawCross(cx, y + 100, 120, (t - it.cross) / 0.3);
      if (it.label) { ctx.globalAlpha = a * clamp(p); ctx.fillStyle = C.tinta; ctx.font = '700 24px Figtree'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillText(it.label.toUpperCase(), cx, y + 210); ctx.letterSpacing = '0px'; ctx.globalAlpha = a; }
    });
    ctx.restore();
  }
}
function drawLists(t, S) {
  for (const L of S.lists) {
    const a = vis(t, L.t0, L.t1, 0.35, 0.35); if (!a) continue;
    const w = 600, rowH = 92, h = 100 + L.items.length * rowH, x = W - 90 - w, y = L.y ?? 200;
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    ctx.fillStyle = C.tinta; ctx.font = '700 26px Figtree'; ctx.letterSpacing = '2px'; ctx.textAlign = 'left'; ctx.fillText(L.title.toUpperCase(), x + 36, y + 58); ctx.letterSpacing = '0px';
    L.items.forEach((it, i) => {
      const p = easeOut((t - it.at) / 0.4); if (p <= 0) return; const yy = y + 110 + i * rowH;
      ctx.globalAlpha = a * p; ctx.fillStyle = it.color; ctx.beginPath(); ctx.arc(x + 52, yy + 26, 14, 0, 7); ctx.fill();
      ctx.fillStyle = C.tinta; ctx.font = '800 34px "Bricolage Grotesque"'; ctx.fillText(it.name, x + 82 + (1 - p) * 20, yy + 26);
      ctx.fillStyle = '#4a5068'; ctx.font = '500 24px Figtree'; ctx.fillText(it.sub, x + 82 + (1 - p) * 20, yy + 60);
    });
    ctx.restore();
  }
}
function drawQuotes(t, S) {
  for (const q of S.quotes) {
    const a = vis(t, q.t0, q.t1, 0.4, 0.4); if (!a) continue;
    ctx.save(); ctx.globalAlpha = a * 0.6; ctx.fillStyle = C.tinta; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    ctx.textAlign = 'center'; ctx.fillStyle = C.ipe; ctx.font = '700 160px Fraunces'; ctx.fillText('“', W / 2, H / 2 - 120);
    ctx.fillStyle = C.branco; ctx.font = 'italic 600 60px Fraunces';
    const lines = q.text.split('\n'); lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + i * 80 - (lines.length - 1) * 40 + 20));
    if (q.by) { ctx.font = '700 26px Figtree'; ctx.letterSpacing = '3px'; ctx.fillStyle = C.ipe; ctx.fillText(q.by.toUpperCase(), W / 2, H / 2 + lines.length * 40 + 90); }
    if (q.icon) drawIcon(q.icon, W / 2, H / 2 - 260, 120, a);
    ctx.restore();
  }
}
function drawTitle(t, S) {
  for (const tc of S.titles) {
    const a = vis(t, tc.t0, tc.t1, 0.5, 0.5); if (!a) continue;
    ctx.save(); ctx.globalAlpha = a * 0.55; ctx.fillStyle = C.tinta; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    const sc = 0.92 + 0.08 * easeOut((t - tc.t0) / 0.8); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
    const w = 1300, h = 440, x = W / 2 - w / 2, y = H / 2 - h / 2; card(x, y, w, h, a, C.areia);
    drawPinShape(W / 2, y + 150, 120, a);
    ctx.textAlign = 'center'; ctx.fillStyle = C.tinta; ctx.font = '800 40px "Bricolage Grotesque"'; ctx.letterSpacing = '8px'; ctx.fillText('MAPA RAIZ', W / 2, y + 210); ctx.letterSpacing = '0px';
    ctx.font = '800 72px "Bricolage Grotesque"'; tc.text.split('\n').forEach((l, i) => ctx.fillText(l, W / 2, y + 305 + i * 84));
    ctx.restore();
  }
}
function drawEnd(t, S) {
  for (const e of S.ends) {
    const a = vis(t, e.t0, e.t1 ?? Infinity, 0.6, 0.5); if (!a) continue;
    ctx.save(); ctx.globalAlpha = a * 0.75; ctx.fillStyle = C.tinta; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; ctx.textAlign = 'center';
    if (e.next) {
      ctx.fillStyle = C.ipe; ctx.font = '700 30px Figtree'; ctx.letterSpacing = '8px'; ctx.fillText('PRÓXIMO VÍDEO', W / 2, H / 2 - 70); ctx.letterSpacing = '0px';
      ctx.fillStyle = C.branco; ctx.font = '800 72px "Bricolage Grotesque"'; e.next.split('\n').forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + 30 + i * 86));
    } else {
      drawPinShape(W / 2, H / 2 - 40, 170, a);
      ctx.fillStyle = C.branco; ctx.font = '800 84px "Bricolage Grotesque"'; ctx.fillText('Mapa Raiz', W / 2, H / 2 + 110);
      ctx.fillStyle = C.ipe; ctx.font = 'italic 600 40px Fraunces'; ctx.fillText('A raiz de tudo está no mapa', W / 2, H / 2 + 175);
    }
    ctx.restore();
  }
}

// ---------- quadro ----------
let SCENE;
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const cam = camera(t), S = SCENE;
  drawMap(t, cam, S);
  drawLabels(t, cam, S);
  drawRoutes(t, cam);
  drawIcons(t, cam, S);
  drawPin(t, cam, S);
  ctx.drawImage(OVER, 0, 0); // vinheta e grão
  drawYear(t, S); drawChapter(t, S);
  drawDots(t, S); drawLists(t, S); drawNumbers(t, S); drawWords(t, S); drawPeople(t, S); drawRows(t, S);
  drawPills(t, S); drawQuotes(t, S); drawTitle(t, S); drawEnd(t, S);
}
