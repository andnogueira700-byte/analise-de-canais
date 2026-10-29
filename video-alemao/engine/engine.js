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
  // vetores de onda inteiros: a textura emenda sem costura quando repete
  const waves = Array.from({ length: 9 }, () => { const a = r() * 6.28, f = 2 + Math.round(r() * 6); return [Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f) || 1, r() * 6.28, r() * 0.5 + 0.5]; });
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    let v = 0; for (const [kx, ky, ph, amp] of waves) v += amp * Math.sin((kx * x + ky * y) / 512 * 6.2832 + ph);
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

// ---------- mapa (relevo real + vetores) ----------
// O mapa é desenhado num canvas próprio, que pode ser inclinado em 3D via CSS; o resto fica num canvas por cima.
const mcv = document.getElementById('m'); const mctx = mcv.getContext('2d');
let ESTILO = 'a', TILT = 0, MW = W, MH = H; const PERSP = 1700;
function setTilt(deg) {
  TILT = deg; MW = deg ? 2500 : W; MH = deg ? 1700 : H; mcv.width = MW; mcv.height = MH;
  mcv.style.left = (W - MW) / 2 + 'px'; mcv.style.top = (H - MH) / 2 + 'px';
  mcv.style.transform = deg ? `perspective(${PERSP}px) rotateX(${deg}deg)` : 'none';
}
const toScreenM = (cam, x, y) => [(x - cam.x) * cam.s + MW / 2, -(y - cam.y) * cam.s + MH / 2];
const toScreen = (cam, lon, lat) => { const [x, y] = merc(lon, lat); return toScreenM(cam, x, y); };
// do canvas do mapa para a tela (aplica a inclinação); devolve [x, y, escala de profundidade]
function proj(mx, my) {
  if (!TILT) return [mx, my, 1];
  const X = mx - MW / 2, Y = my - MH / 2, th = TILT * Math.PI / 180;
  const yy = Y * Math.cos(th), z = Y * Math.sin(th), f = PERSP / (PERSP - z);
  return [W / 2 + X * f, H / 2 + yy * f, f];
}
const geoS = (cam, lon, lat) => { const [x, y] = toScreen(cam, lon, lat); return proj(x, y); };

let MOS = [];
// borda esfumada nos mosaicos mais detalhados, para não aparecer a emenda com o de baixo
function featherMosaics(list) {
  for (const m of list) {
    const im = IMG['mos_' + m.name]; if (!im) continue;
    // máscara do mar (meia resolução): onde o azul domina
    const mk = document.createElement('canvas'); mk.width = im.width >> 1; mk.height = im.height >> 1; const mg = mk.getContext('2d');
    mg.drawImage(im, 0, 0, mk.width, mk.height); const d = mg.getImageData(0, 0, mk.width, mk.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) { const water = px[i + 2] > px[i] + 12; px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = water ? 255 : 0; }
    mg.putImageData(d, 0, 0); IMG['msk_' + m.name] = mk;
    if (m.name === 'mundo') continue;
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d');
    g.drawImage(im, 0, 0); g.globalCompositeOperation = 'destination-out';
    const e = Math.round(Math.min(c.width, c.height) * 0.06);
    for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, e, 0, 0, 0, e, c.height], [c.width, 0, c.width - e, 0, c.width - e, 0, e, c.height], [0, 0, 0, e, 0, 0, c.width, e], [0, c.height, 0, c.height - e, 0, c.height - e, c.width, e]]) {
      const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(rx, ry, rw, rh);
    }
    IMG['mos_' + m.name] = c;
  }
}
function drawRelief(cam) {
  mctx.fillStyle = '#06122F'; mctx.fillRect(0, 0, MW, MH); drawMos(mctx, cam, 'mos_', 1);
}
// desenha os mosaicos que cobrem a vista (pre = 'mos_' imagem, 'msk_' máscara do mar), na escala k do canvas de destino
function drawMos(g, cam, pre, k) {
  const vx0 = cam.x - MW / 2 / cam.s, vx1 = cam.x + MW / 2 / cam.s, vy0 = cam.y - MH / 2 / cam.s, vy1 = cam.y + MH / 2 / cam.s;
  const nat = m => m.w / (m.x1 - m.x0);
  const cover = MOS.filter(m => m.x0 <= vx0 && m.x1 >= vx1 && m.y0 <= vy0 && m.y1 >= vy1).sort((a, b) => a.z - b.z);
  const list = cover.length ? cover : [MOS.find(m => m.name === 'mundo')];
  let prev = null;
  for (const m of list) {
    let a = 1; if (prev) a = clamp((cam.s - 0.5 * nat(prev)) / (0.6 * nat(prev)));
    if (a > 0 && IMG[pre + m.name]) {
      const ix0 = Math.max(vx0, m.x0), ix1 = Math.min(vx1, m.x1), iy0 = Math.max(vy0, m.y0), iy1 = Math.min(vy1, m.y1);
      const im = IMG[pre + m.name], kx = im.width / (m.x1 - m.x0), ky = im.height / (m.y1 - m.y0);
      const [dx0, dy0] = toScreenM(cam, ix0, iy1), [dx1, dy1] = toScreenM(cam, ix1, iy0);
      g.globalAlpha = a; g.imageSmoothingQuality = 'high';
      g.drawImage(im, (ix0 - m.x0) * kx, (m.y1 - iy1) * ky, (ix1 - ix0) * kx, (iy1 - iy0) * ky, dx0 * k, dy0 * k, (dx1 - dx0) * k, (dy1 - dy0) * k);
      g.globalAlpha = 1;
    }
    prev = m;
  }
}
let BPATH = {};
function buildBorders() {
  for (const [k, lines] of Object.entries(BORDERS)) {
    const p = new Path2D(); for (const l of lines) { for (let i = 0; i < l.length; i += 2) i ? p.lineTo(l[i], l[i + 1]) : p.moveTo(l[i], l[i + 1]); } BPATH[k] = p;
  }
}
// ondas: textura de ondulação andando devagar, só no mar (a terra é recortada), em meia resolução
const WV = document.createElement('canvas'); const wctx = WV.getContext('2d');
function drawWaves(t, cam) {
  const k = 0.5; if (WV.width !== MW * k) { WV.width = MW * k; WV.height = MH * k; }
  const pat = wctx.createPattern(NOISE, 'repeat'); wctx.globalCompositeOperation = 'source-over'; wctx.clearRect(0, 0, WV.width, WV.height);
  // duas camadas presas ao mapa, deslizando em direções diferentes
  const ox = -cam.x * cam.s * k, oy = cam.y * cam.s * k;
  for (const [vx, vy, sc, al] of [[16, 6, 1.6, 1], [-10, 12, 2.6, 0.8]]) {
    wctx.save(); wctx.globalAlpha = al; wctx.translate(((ox + t * vx) % (512 * sc)), ((oy + t * vy) % (512 * sc))); wctx.scale(sc, sc);
    wctx.fillStyle = pat; wctx.fillRect(-512, -512, WV.width / sc + 1024, WV.height / sc + 1024); wctx.restore();
  }
  wctx.globalCompositeOperation = 'destination-in'; drawMos(wctx, cam, 'msk_', k); wctx.globalCompositeOperation = 'source-over';
  mctx.save(); mctx.globalCompositeOperation = 'screen'; mctx.globalAlpha = 0.85; mctx.drawImage(WV, 0, 0, MW, MH); mctx.restore();
}
function drawMap(t, cam, S) {
  drawRelief(cam); if (ESTILO === 'b') drawWaves(t, cam);
  const span = W / cam.s, lod = span > 60 ? 'coarse' : 'fine'; LAND = LODS[lod].land;
  mctx.save(); mctx.setTransform(cam.s, 0, 0, -cam.s, MW / 2 - cam.x * cam.s, MH / 2 + cam.y * cam.s); mctx.lineJoin = 'round'; mctx.lineCap = 'round';
  // fronteiras terrestres (sem linha de costa)
  mctx.lineWidth = (ESTILO === 'b' ? 1.8 : 1.6) / cam.s; mctx.strokeStyle = ESTILO === 'b' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'; mctx.stroke(BPATH['paises_' + lod]);
  if (span < 45) { mctx.setLineDash([5 / cam.s, 5 / cam.s]); mctx.lineWidth = 1.2 / cam.s; mctx.strokeStyle = ESTILO === 'b' ? 'rgba(120,96,64,0.45)' : 'rgba(255,255,255,0.4)'; mctx.stroke(BPATH['estados_' + lod]); mctx.setLineDash([]); }
  // regiões em destaque: placa que sobe do mapa (parede lateral escura + sombra + topo na cor)
  const act = [];
  for (const h of S.highlights) {
    const a = vis(t, h.t0, h.t1, 0.6, 0.6); if (!a) continue;
    const l = byName(h.name); if (!l) continue;
    // região maior que a tela (câmera dentro dela): fica só um véu de cor, sem placa, para não tapar o mapa
    const big = h.solid ? 0 : clamp(((l.bbox[2] - l.bbox[0]) / span - 0.55) / 0.35); // solid: país com ilhas longe (Holanda) não vira véu
    const up = h.flat ? 0 : (h.lift ?? 14) * easeOut(clamp((t - h.t0) / 0.7)) * (t > h.t1 - 0.6 ? a : 1) * (1 - big);
    act.push({ h, a, l, up, big }); h._up = up;
  }
  for (const { h, a, l, up, big } of act) {
    if (big >= 1) continue;
    mctx.save(); mctx.globalAlpha = a * 0.55 * (1 - big); mctx.shadowColor = 'rgba(6,18,47,0.9)'; mctx.shadowBlur = 22; mctx.shadowOffsetY = 8;
    mctx.fillStyle = darken(h.color, 0.5); mctx.fill(l.path); mctx.restore();
    mctx.globalAlpha = a; mctx.fillStyle = darken(h.color, 0.42);
    for (let k = 0; k < up; k += 1.5) { mctx.save(); mctx.translate(0, k / cam.s); mctx.fill(l.path); mctx.restore(); }
  }
  for (const { h, a, l, up, big } of act) {
    mctx.save(); mctx.translate(0, up / cam.s);
    mctx.globalAlpha = a * (h.alpha ?? 0.94) * (1 - big * 0.65); mctx.fillStyle = h.color; mctx.fill(l.path);
    mctx.globalAlpha = a; mctx.lineWidth = 2.6 / cam.s; mctx.strokeStyle = h.pulse && Math.sin(t * 5) > 0 ? h.pulse : 'rgba(255,255,255,0.9)'; mctx.stroke(l.path);
    mctx.restore();
  }
  mctx.globalAlpha = 1;
  mctx.restore();

  // manchas de região (colônias)
  for (const b of S.blobs) {
    const a = vis(t, b.t0, b.t1, 0.8, 0.6); if (!a) continue;
    const [x, y] = toScreen(cam, b.lon, b.lat); const r = Math.max(b.r * cam.s, b.minPx ?? 14) * (0.6 + 0.4 * easeOut((t - b.t0) / 0.8));
    const g = mctx.createRadialGradient(x, y, 0, x, y, r);
    const col = b.grey && t > b.grey ? C.cinza : b.color;
    g.addColorStop(0, hexA(col, 0.8 * a)); g.addColorStop(0.6, hexA(col, 0.5 * a)); g.addColorStop(1, hexA(col, 0));
    mctx.fillStyle = g; mctx.beginPath(); mctx.arc(x, y, r, 0, 7); mctx.fill();
  }
  // enxames de pontos (pessoas chegando); com people: true viram bonequinhos, desenhados em pé por cima do mapa
  const crowd = CROWD = [];
  for (const sw of S.swarms) {
    const a = vis(t, sw.t0, sw.t1, 0.3, 0.6); if (!a) continue;
    const r = rng(sw.seed || 11);
    for (let i = 0; i < sw.n; i++) {
      const ang = r() * 6.283, rad = Math.sqrt(r()) * sw.r, ti = sw.t0 + (i / sw.n) * (sw.dur || 3);
      const p = easeOut((t - ti) / 0.4); if (p <= 0) continue;
      if (!landAt(sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8)) continue; // ponto no mar não aparece
      const [x, y] = toScreen(cam, sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8);
      if (sw.people) { const [px, py, f] = proj(x, y); crowd.push([py, px, f, sw, a * p, backOut(p), r()]); continue; }
      mctx.globalAlpha = a * p; mctx.fillStyle = sw.color; mctx.beginPath(); mctx.arc(x, y, (sw.px || 5) * backOut(p), 0, 7); mctx.fill();
      mctx.strokeStyle = 'rgba(255,255,255,0.8)'; mctx.lineWidth = 1.2; mctx.stroke();
    }
    mctx.globalAlpha = 1;
  }
}
// bonequinhos: desenhados depois do alfinete e dos nomes, de trás para a frente, sem empilhar e sem ficar por baixo de nada
let CROWD = [];
function drawCrowd() {
  CROWD.sort((a, b) => a[0] - b[0]); const taken = [];
  for (const [y, x, f, sw, a, sc, rv] of CROWD) {
    const h = (sw.size || 40) * f; if (taken.some(([tx, ty]) => Math.abs(tx - x) < h * 0.42 && Math.abs(ty - y) < h * 0.3)) continue;
    if (hit([x - h * 0.25, y - h, x + h * 0.25, y])) continue;
    taken.push([x, y]); drawPerson(x, y, h * sc, sw.color, a, rv);
  }
}
// bonequinho com volume: sombra no chão, corpo com degradê e cabeça com brilho
const SKIN = ['#F2D3B5', '#E0B48C', '#B97E52', '#8A5634'];
function drawPerson(x, y, h, color, a, rv) {
  if (h < 3) return; ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(6,18,47,0.35)'; ctx.beginPath(); ctx.ellipse(x + h * 0.06, y, h * 0.26, h * 0.08, 0, 0, 7); ctx.fill();
  const bw = h * 0.42, bt = y - h * 0.66;
  const g = ctx.createLinearGradient(x - bw / 2, bt, x + bw / 2, y); g.addColorStop(0, lighten(color)); g.addColorStop(0.55, color); g.addColorStop(1, darken(color, 0.35));
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - bw / 2, bt, bw, h * 0.66, [bw * 0.5, bw * 0.5, bw * 0.18, bw * 0.18]); ctx.fill();
  ctx.lineWidth = Math.max(1, h * 0.04); ctx.strokeStyle = 'rgba(6,18,47,0.55)'; ctx.stroke();
  const hr = h * 0.17, hy = bt - hr * 0.95, skin = SKIN[Math.floor(rv * SKIN.length)];
  const gh = ctx.createRadialGradient(x - hr * 0.35, hy - hr * 0.35, hr * 0.1, x, hy, hr); gh.addColorStop(0, '#fff8ef'); gh.addColorStop(0.35, skin); gh.addColorStop(1, darken(skin, 0.3));
  ctx.fillStyle = gh; ctx.beginPath(); ctx.arc(x, hy, hr, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function darken(hex, k) { const n = parseInt(hex.slice(1), 16); const f = c => Math.round(c * (1 - k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
function lighten(hex) { const n = parseInt(hex.slice(1), 16); const f = c => Math.round(c + (255 - c) * 0.35); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

// ---------- elementos sobre o mapa ----------
function drawLabels(t, cam, S) {
  for (const l of S.labels) {
    const a = vis(t, l.t0, l.t1, 0.5, 0.5); if (!a) continue;
    let [x, y] = toScreen(cam, l.lon, l.lat);
    // rótulo em cima de região destacada: sobe junto com a placa e fica branco com contorno escuro
    const on = S.highlights.find(h => h._up != null && vis(t, h.t0, h.t1, 0.6, 0.6) && byName(h.name) && inPath(cam, byName(h.name).path, l.lon, l.lat));
    if (on) y -= on._up;
    { mctx.save(); mctx.font = `800 ${(l.size || 30) * 1.2}px "Bricolage Grotesque"`; const w = mctx.measureText(l.text.toUpperCase()).width / 2 + 8, h = (l.size || 30) * 0.75; mctx.restore();
      const [p0x, p0y] = proj(x - w, y - h), [p1x, p1y] = proj(x + w, y + h);
      if (BOXES.some(b => (b.k === 'cartão' || b.k === 'ano') && p0x < b[2] && p1x > b[0] && p0y < b[3] && p1y > b[1])) continue; }
    const dark = ESTILO === 'b' && !on && !l.light, sz = (l.size || 30) * 1.2;
    mctx.save(); mctx.globalAlpha = a; mctx.font = `800 ${sz}px "Bricolage Grotesque"`; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    mctx.letterSpacing = `${sz * 0.06}px`; mctx.lineJoin = 'round'; mctx.lineWidth = sz * 0.28;
    mctx.strokeStyle = dark ? 'rgba(255,255,255,0.95)' : 'rgba(6,18,47,0.92)'; mctx.fillStyle = dark ? C.tinta : C.branco;
    const txt = l.upper === false ? l.text : l.text.toUpperCase();
    mctx.strokeText(txt, x, y); mctx.fillText(txt, x, y);
    const w = mctx.measureText(txt).width / 2 + 8, [p0x, p0y] = proj(x - w, y - sz * 0.6), [p1x, p1y] = proj(x + w, y + sz * 0.6);
    BOXES.push([p0x, p0y, p1x, p1y]); mctx.restore();
  }
}
const inPath = (cam, path, lon, lat) => { const [x, y] = merc(lon, lat); mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0); const r = mctx.isPointInPath(path, x, y); mctx.restore(); return r; };
function drawRoutes(t, cam) {
  for (const r of Object.values(ROUTES)) {
    const a = vis(t, r.t0, r.hide ?? Infinity, 0.2, 0.6); if (!a || t < r.t0) continue;
    const L = routeProg(r, t) * r._L;
    mctx.save(); mctx.globalAlpha = a; mctx.beginPath();
    for (let i = 0; i < r._pts.length && r._cum[i] <= L; i++) { const [x, y] = toScreenM(cam, r._pts[i][0], r._pts[i][1]); i ? mctx.lineTo(x, y) : mctx.moveTo(x, y); }
    const h = routeHead(r, t); const [hx, hy] = toScreenM(cam, h[0], h[1]); mctx.lineTo(hx, hy);
    mctx.lineCap = 'round'; mctx.setLineDash([2, 16]); mctx.lineWidth = 10; mctx.strokeStyle = 'rgba(6,18,47,0.45)'; mctx.stroke();
    mctx.lineWidth = 6; mctx.strokeStyle = r.color || C.branco; mctx.stroke(); mctx.setLineDash([]);
    mctx.restore();
    if (r.icon && (IMG[r.icon] || (MARCAS && IMG["mk_" + MK[r.icon]])) && t <= r.t1 + 0.6) {
      const [sx, sy, f] = proj(hx, hy); const sz = (r.size || 84) * f, bob = Math.sin(t * 6) * 4;
      drawIcon(r.icon, sx, sy - sz * 0.3 + bob, sz, vis(t, r.t0, r.t1, 0.2, 0.5));
    }
  }
}
// emoji → marcador redondo equivalente (quando ?marcas=1)
let MARCAS = false;
const MK = { school: 'school', newspaper: 'newspaper', rolled_newspaper: 'newspaper', police_officer: 'shield', hot_beverage: 'coffee', church: 'church', house: 'house', hut: 'house',
  books: 'book-open', openbook: 'book-open', bluebook: 'book-open', man_teacher: 'user', teacher: 'user', bust: 'user', busts: 'users', woman: 'user', old_woman: 'user', child: 'baby',
  graduation_cap: 'graduation-cap', pencil: 'pencil', abacus: 'calculator', musical_notes: 'music', performing_arts: 'drama', hospital: 'hospital', fire: 'flame', fire_engine: 'flame',
  chains: 'link', locked: 'lock', lock2: 'lock', scroll: 'scroll', page_with_curl: 'scroll', prohibited: 'ban', prohibited2: 'ban', no_entry: 'ban', speech_balloon: 'message-circle', speaking_head: 'megaphone',
  eyes: 'eye', lupa: 'search', trophy: 'trophy', beer_mug: 'beer', beers: 'beer', ear_of_corn: 'wheat', seedling: 'sprout', axe: 'axe', store: 'store', dstore: 'store', bread: 'croissant', baguette: 'croissant',
  shortcake: 'cake', hearthands: 'heart-handshake', bullseye: 'target', gym: 'dumbbell', brokenheart: 'heart-crack', swords: 'swords', skull: 'skull', muted: 'volume-x', shushing_face: 'volume-x',
  door: 'door-open', cooking: 'cooking-pot', pot_of_food: 'cooking-pot', tree: 'tree-pine', tree2: 'tree-pine', flag: 'flag', microphone: 'mic', classical_building: 'landmark', cross_mark: 'x',
  check_mark_button: 'check', ship: 'ship', ship2: 'ship', passenger_ship: 'ship', canoe: 'sailboat', sailboat: 'sailboat', spiral_calendar: 'calendar', tractor: 'tractor', hammer: 'hammer', bell: 'bell', envelope: 'mail', sparkles: 'sparkles', fearful_face: 'user', dove: 'heart-handshake', jar: 'cooking-pot', leafy_green: 'sprout' };
function drawIcon(img, x, y, sz, a, scale = 1) {
  if (MARCAS && MK[img] && IMG['mk_' + MK[img]]) return drawMarker(MK[img], x, y, Math.min(sz, 104), a, scale);
  if (!IMG[img]) return;
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
  const im = IMG[img], s = sz * scale, k = Math.min(s / im.width, s / im.height);
  ctx.drawImage(im, x - im.width * k / 2, y - im.height * k / 2, im.width * k, im.height * k); ctx.restore();
}
// marcador redondo: disco branco, aro colorido e ícone de traço (Lucide)
function drawMarker(name, x, y, sz, a, scale = 1, ring = C.caju) {
  const r = sz * scale / 2; if (r <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(6,18,47,0.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  ctx.fillStyle = C.branco; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = r * 0.14; ctx.strokeStyle = ring; ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, 7); ctx.stroke();
  const im = IMG['mk_' + name]; if (im) ctx.drawImage(im, x - r * 0.55, y - r * 0.55, r * 1.1, r * 1.1);
  ctx.restore();
}
function drawCross(x, y, sz, p) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.strokeStyle = C.urucum; ctx.lineWidth = sz * 0.1; ctx.lineCap = 'round';
  const d = sz * 0.42 * easeOut(p * 1.3); ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d);
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8; ctx.stroke(); ctx.restore();
}
// caixas já ocupadas neste quadro (alfinete e rótulos), para nada ficar por cima de nada
let BOXES = [];
const hit = (b) => BOXES.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
function drawIcons(t, cam, S) {
  for (const ic of S.icons) {
    const a = vis(t, ic.t0, ic.t1, 0.2, 0.35); if (!a) continue;
    if (ic._skip) continue;
    let x, y, f = 1; if (ic.sx != null) { x = ic.sx; y = ic.sy; } else { [x, y, f] = geoS(cam, ic.lon, ic.lat); const o = ic._off || [ic.dx || 0, ic.dy || 0]; x += o[0] * f; y += o[1] * f; }
    const size = iconSize(ic) * (ic.sx != null ? 1 : f);
    const sc = backOut((t - ic.t0) / 0.45) * (1 + 0.03 * Math.sin(t * 3 + (ic.lon || 0)));
    let aa = a; if (ic.sink && t > ic.sink) { const p = clamp((t - ic.sink) / 1.6); y += p * 50; aa *= 1 - p; }
    if (ic.sx == null && BOXES.some(b => (b.k === 'cartão' || b.k === 'rótulo') && x - size / 2 < b[2] && x + size / 2 > b[0] && y - size / 2 < b[3] && y + size / 2 > b[1])) continue; // nunca por baixo de cartão ou nome
    const grey = ic.grey && t > ic.grey;
    ctx.save(); if (grey) ctx.filter = 'grayscale(1) opacity(0.6)';
    if (ic.mark) drawMarker(ic.mark, x, y, size, aa, sc, ic.ring); else drawIcon(ic.img, x, y, size, aa, sc); ctx.restore();
    if (ic.cross && t > ic.cross) drawCross(x, y, size, (t - ic.cross) / 0.3);
    if (ic.sx == null) BOXES.push([x - size / 2, y - size / 2, x + size / 2, y + size / 2]);
    if (ic.label) tagLabel(ic.label, x, y + size * 0.62, aa, 24);
  }
  for (const sw of S.iconSwarms) {
    const a = vis(t, sw.t0, sw.t1, 0.3, 0.5); if (!a) continue;
    const r = rng(sw.seed || 5);
    for (let i = 0; i < sw.n; i++) {
      const ang = r() * 6.283, rad = Math.sqrt(r()) * sw.r, ti = sw.t0 + (i / sw.n) * (sw.dur || 2.5);
      const p = (t - ti) / 0.4; if (p <= 0 || !landAt(sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8)) continue;
      const [x, y, f] = geoS(cam, sw.lon + Math.cos(ang) * rad, sw.lat + Math.sin(ang) * rad * 0.8);
      const h = (sw.size || 54) * f * 0.5, b = [x - h, y - h, x + h, y + h]; if (hit(b)) continue; // não empilha ícones
      BOXES.push(b); drawIcon(sw.img, x, y, h * 2, a, backOut(p));
    }
  }
}
const iconSize = ic => Math.min(ic.size || 96, 104);
const LANDC = new Map();
function landAt(lon, lat) {
  const key = lon.toFixed(3) + ',' + lat.toFixed(3); if (LANDC.has(key)) return LANDC.get(key);
  const [x, y] = merc(lon, lat); mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0);
  const r = LODS.fine.coast.some(c => x >= c.bbox[0] && x <= c.bbox[2] && y >= c.bbox[1] && y <= c.bbox[3] && mctx.isPointInPath(c.path, x, y));
  mctx.restore(); LANDC.set(key, r); return r;
}
// da tela para o canvas do mapa (desfaz a inclinação)
function unproj(sx, sy) {
  if (!TILT) return [sx, sy];
  const th = TILT * Math.PI / 180, d = sy - H / 2, Y = d * PERSP / (Math.cos(th) * PERSP + d * Math.sin(th)), f = PERSP / (PERSP - Y * Math.sin(th));
  return [(sx - W / 2) / f + MW / 2, Y + MH / 2];
}
// ponto da tela está em terra firme?
function onLand(cam, px, py) {
  const [sx, sy] = unproj(px, py);
  const x = cam.x + (sx - MW / 2) / cam.s, y = cam.y - (sy - MH / 2) / cam.s, lod = W / cam.s > 60 ? 'coarse' : 'fine';
  mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0);
  const r = LODS[lod].coast.some(c => x >= c.bbox[0] && x <= c.bbox[2] && y >= c.bbox[1] && y <= c.bbox[3] && mctx.isPointInPath(c.path, x, y));
  mctx.restore(); return r;
}
// decide uma vez, num instante fixo, onde cada ícone fica: em terra, perto do lugar e sem cobrir nada
function placeIcons(S) {
  const list = S.icons.filter(i => i.sx == null).sort((a, b) => a.t0 - b.t0);
  for (const ic of list) ic._skip = true;
  for (const ic of list) {
    const tm = ic.t0 + 0.45; render(tm);
    for (const k of CARDS) for (const o of S[k] || []) if (o.t0 < ic.t1 && ic.t0 < o.t1) {
      const r = cardRect(k, o), dx = o._dx || 0, dy = o._dy || 0; BOXES.push([r[0] + dx - 10, r[1] + dy - 10, r[0] + r[2] + dx + 10, r[1] + r[3] + dy + 10]);
    }
    const cam = camera(tm), [ax, ay, f] = geoS(cam, ic.lon, ic.lat), sz = iconSize(ic) * f, r = sz / 2;
    const extra = ic.label ? sz * 0.62 + 28 : 0;
    const ok = (x, y) => x - r > 20 && x + r < W - 20 && y - r > 20 && y + r + extra < H - 130 &&
      !hit([x - r, y - r, x + r, y + r + extra]) && [[0, 0], [r * .7, 0], [-r * .7, 0], [0, r * .7], [0, -r * .7]].every(([dx, dy]) => wet(x + dx, y + dy));
    const wet = (x, y) => onLand(cam, x, y) !== !!ic.sea; // navio fica no mar; o resto, em terra
    const want = [(ic.dx || 0) * f, (ic.dy || 0) * f], cands = [want];
    for (const k of [0.75, 1.1, 1.5, 2, 2.6, 3.3]) {
      const ring = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; ring.push([want[0] + Math.cos(a) * k * sz, want[1] + Math.sin(a) * k * sz]); }
      ring.sort((p, q) => Math.hypot(...p) - Math.hypot(...q)); cands.push(...ring);
    }
    const c = cands.find(([dx, dy]) => ok(ax + dx, ay + dy)) || cands.find(([dx, dy]) => wet(ax + dx, ay + dy)) || want;
    ic._off = [c[0] / f, c[1] / f]; ic._skip = false;
  }
}
function tagLabel(text, x, y, a, size = 26, bg = C.tinta, fg = C.branco) {
  ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px Figtree`; ctx.letterSpacing = `${size * 0.08}px`;
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.6;
  for (let k = 0; k < 6 && hit([x - w / 2, y - h / 2, x + w / 2, y + h / 2]); k++) y += h + 6;
  BOXES.push([x - w / 2, y - h / 2, x + w / 2, y + h / 2]);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = bg; rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1); ctx.restore();
}
// escolhe o maior tamanho de fonte (até size) em que o texto cabe em maxW; font usa {} no lugar do tamanho
function fit(text, maxW, font, size, min = 16) {
  let sz = size; for (; sz > min; sz--) { ctx.font = font.replace('{}', sz); if (ctx.measureText(text).width <= maxW) break; }
  ctx.font = font.replace('{}', sz); return sz;
}
// quebra o texto em até 2 linhas que caibam em maxW (com a fonte atual)
function wrap2(text, maxW) {
  if (ctx.measureText(text).width <= maxW) return [text];
  const w = text.split(' '); let best = [text];
  for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '); if (ctx.measureText(a).width <= maxW && ctx.measureText(b).width <= maxW) { best = [a, b]; if (ctx.measureText(b).width <= ctx.measureText(a).width) break; } }
  return best;
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
// cidade citada: um quarteirão de predinhos em 3D no lugar exato, embaixo do alfinete
let CIDADES = false;
function drawCity(x, y, p, seed) {
  if (p <= 0) return; let h0 = 0; for (const ch of seed) h0 = (h0 * 31 + ch.charCodeAt(0)) >>> 0; const r = rng(h0 || 7);
  const K = 1.7, blocks = []; for (let i = 0; i < 13; i++) { const ang = r() * 6.283, d = Math.sqrt(r()) * 34 * K; blocks.push([x + Math.cos(ang) * d * 1.3, y + Math.sin(ang) * d * 0.5, (9 + r() * 7) * K, (10 + r() * 22) * K * (1 - d / (34 * K) * 0.5), r()]); }
  blocks.sort((a, b) => a[1] - b[1]);
  ctx.save(); ctx.globalAlpha = clamp(p * 2);
  ctx.fillStyle = 'rgba(6,18,47,0.28)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 62 * K, 24 * K, 0, 0, 7); ctx.fill();
  const roofs = ['#C8553D', '#D9824A', '#B5473A'];
  for (const [bx, by, bw, bh0, rv] of blocks) {
    const bh = bh0 * backOut(p), dx = bw * 0.45, dy = bw * 0.28;
    ctx.fillStyle = '#E9DCC4'; ctx.fillRect(bx - bw / 2, by - bh, bw, bh); // frente
    ctx.fillStyle = '#C9B796'; ctx.beginPath(); ctx.moveTo(bx + bw / 2, by); ctx.lineTo(bx + bw / 2 + dx, by - dy); ctx.lineTo(bx + bw / 2 + dx, by - dy - bh); ctx.lineTo(bx + bw / 2, by - bh); ctx.fill(); // lado
    ctx.fillStyle = roofs[Math.floor(rv * 3)]; ctx.beginPath(); ctx.moveTo(bx - bw / 2, by - bh); ctx.lineTo(bx + bw / 2, by - bh); ctx.lineTo(bx + bw / 2 + dx, by - bh - dy); ctx.lineTo(bx - bw / 2 + dx, by - bh - dy); ctx.fill(); // telhado
    ctx.strokeStyle = 'rgba(6,18,47,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(bx - bw / 2, by - bh, bw, bh);
    ctx.fillStyle = 'rgba(6,18,47,0.35)'; for (let wy = by - bh + 6; wy < by - 5; wy += 9) ctx.fillRect(bx - bw / 2 + 3, wy, bw - 6, 2); // janelas
  }
  ctx.restore();
  BOXES.push([x - 66 * K, y - 50 * K, x + 66 * K, y + 14 * K]);
}
function drawPin(t, cam, S) {
  const P = S.pins; let i = -1; for (let k = 0; k < P.length; k++) if (P[k].t <= t) i = k;
  if (i < 0) return; const cur = P[i]; if (cur.hide) { // some com fade
    const prev = P[i - 1]; if (!prev || prev.hide) return; const a = 1 - clamp((t - cur.t) / 0.4); if (a <= 0) return;
    const [x, y] = geoS(cam, prev.lon, prev.lat); drawPinShape(x, y, 96, a); return;
  }
  const prev = i > 0 && !P[i - 1].hide ? P[i - 1] : null;
  let [x, y] = geoS(cam, cur.lon, cur.lat); let a = 1, sc = 1;
  // cidade: o quarteirão fica no chão, o alfinete flutua por cima e o nome vem embaixo, maior
  const city = CIDADES && cur.city !== false, gx = x, gy = y; if (city) { drawCity(x, y, clamp((t - cur.t - 0.3) / 0.6), cur.label || ''); y -= 62; }
  const p = clamp((t - cur.t) / 0.8);
  if (prev && p < 1) { const [x0, y00] = geoS(cam, prev.lon, prev.lat), y0 = y00 - (CIDADES && prev.city !== false ? 62 : 0); const e = ease(p); x = lerp(x0, x, e); y = lerp(y0, y, e) - Math.sin(Math.PI * e) * 120; }
  else if (!prev) { a = clamp((t - cur.t) / 0.3); sc = backOut((t - cur.t) / 0.5); y -= (1 - easeOut(p)) * 80; }
  drawPinShape(x, y, 96 * sc, a); BOXES.push([x - 40, y - 100, x + 40, y + 10]);
  if (cur.label) { const la = clamp((t - cur.t - 0.6) / 0.3) * a; if (la > 0) city ? tagLabel(cur.label, gx, gy + 56, la, 34, C.tinta, C.branco) : tagLabel(cur.label, x, y + 46, la, 28, C.branco, C.tinta); }
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
    ctx.save(); ctx.font = '800 44px "Bricolage Grotesque"'; const nw = ctx.measureText(c.num).width + 40;
    ctx.font = '700 30px Figtree'; ctx.letterSpacing = '4px'; const tw = ctx.measureText(c.title.toUpperCase()).width + 44;
    // se o alfinete ou um rótulo estiver no canto, a etiqueta do capítulo desce
    let cy = 70; for (let k = 0; k < 6 && hit([60, cy - 10, 80 + nw + tw, cy + 90]); k++) cy += 100;
    BOXES.push([70, cy, 70 + nw + tw, cy + 80]); ctx.globalAlpha = a; ctx.translate(70 + slide, cy);
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
const CARDS = ['numbers', 'people', 'words', 'dots', 'lists', 'rows', 'photos'];
// retângulo de cada cartão (mesmas contas dos desenhos), para arrumar a tela antes de renderizar
function cardRect(k, o) {
  ctx.save(); let r;
  if (k === 'numbers') { ctx.font = '800 120px "Bricolage Grotesque"'; const nw = ctx.measureText((o.prefix || '') + (o.raw || fmt(o.value)) + (o.suffix || '')).width; ctx.font = '700 28px Figtree'; ctx.letterSpacing = '3px'; const w = Math.max(nw, ctx.measureText(o.label.toUpperCase()).width) + 100; r = [(o.x ?? W / 2) - w / 2, o.y ?? 150, w, 230]; }
  else if (k === 'people') { ctx.font = '800 46px "Bricolage Grotesque"'; const nw = ctx.measureText(o.name).width; ctx.font = '700 24px Figtree'; ctx.letterSpacing = '3px'; const w = Math.max(nw, ctx.measureText(o.role.toUpperCase()).width) + 290; r = [o.side === 'right' ? W - 90 - w : 90, o.y ?? 330, w, 220]; }
  else if (k === 'words') r = [o.x ?? 90, o.y ?? 300, 640, o.meaning ? 300 : 240];
  else if (k === 'dots') { const cols = o.cols || 10, cell = o.cell || 38, w = cols * cell + 80; r = [o.x ?? (W - 90 - w), o.y ?? 200, w, Math.ceil(o.total / cols) * cell + 170]; }
  else if (k === 'lists') r = [W - 90 - 600, o.y ?? 200, 600, 100 + o.items.length * 92];
  else if (k === 'photos') { const w = o.w || 560, h = photoH(o, w); r = [o.x ?? (o.side === 'left' ? 90 : W - 90 - w), o.y ?? 150, w, h]; }
  else if (k === 'rows') { const w = o.items.length * 220 + 40; r = [W / 2 - w / 2, o.y ?? 170, w, 250]; }
  ctx.restore(); return r;
}
function layoutCards(S) {
  LAYOUT = true; const all = [];
  for (const k of CARDS) for (const o of S[k] || []) all.push({ k, o, r: cardRect(k, o) });
  all.sort((a, b) => a.o.t0 - b.o.t0);
  const done = [];
  for (const c of all) {
    // obstáculos fixos no tempo do cartão: alfinete, rótulos do mapa, capítulo e selo do ano
    const obst = [];
    for (const ts of [c.o.t0 + 0.5, (c.o.t0 + c.o.t1) / 2, c.o.t1 - 0.4]) { render(ts); for (const b of BOXES) if (['alfinete', 'rótulo', 'capítulo', 'ano'].includes(b.k)) obst.push(b); }
    const live = done.filter(d => d.o.t0 < c.o.t1 && c.o.t0 < d.o.t1).concat(obst.map(b => ({ o: {}, r: [b[0], b[1], b[2] - b[0], b[3] - b[1]] })));
    const off = c2 => [c2.o._dx || 0, c2.o._dy || 0];
    const clash = (dx, dy) => live.some(d => { const [ex, ey] = off(d), b = [c.r[0] + dx - 12, c.r[1] + dy - 12, c.r[0] + c.r[2] + dx + 12, c.r[1] + c.r[3] + dy + 12], e = [d.r[0] + ex, d.r[1] + ey, d.r[0] + d.r[2] + ex, d.r[1] + d.r[3] + ey]; return b[0] < e[2] && b[2] > e[0] && b[1] < e[3] && b[3] > e[1]; });
    let dx = 0, dy = 0;
    if (clash(0, 0)) {
      const opts = []; for (const sx of [0, -150, 150, -300, 300, -450, 450, -600, 600, -750, 750, -900, 900, -1140, 1140]) for (const sy of [0, 40, -40, 80, -80, 120, 160, 200, 240, 300, 360, 420, 480, 540]) opts.push([sx, sy]);
      opts.sort((p, q) => Math.hypot(p[0] * 0.7, p[1]) - Math.hypot(q[0] * 0.7, q[1]));
      const fit = ([sx, sy]) => c.r[0] + sx >= 40 && c.r[0] + c.r[2] + sx <= W - 40 && c.r[1] + sy >= 40 && c.r[1] + c.r[3] + sy <= H - 140 && !clash(sx, sy);
      const f = opts.find(fit); if (f) [dx, dy] = f;
      else { // não cabe: os cartões que atrapalham saem de cena quando este entra, e ele só desvia dos obstáculos fixos
        const ov = (d, sx, sy) => { const [ex, ey] = off(d), b = [c.r[0] + sx - 12, c.r[1] + sy - 12, c.r[0] + c.r[2] + sx + 12, c.r[1] + c.r[3] + sy + 12], e = [d.r[0] + ex, d.r[1] + ey, d.r[0] + d.r[2] + ex, d.r[1] + d.r[3] + ey]; return b[0] < e[2] && b[2] > e[0] && b[1] < e[3] && b[3] > e[1]; };
        const inside = ([sx, sy]) => c.r[0] + sx >= 40 && c.r[0] + c.r[2] + sx <= W - 40 && c.r[1] + sy >= 40 && c.r[1] + c.r[3] + sy <= H - 140;
        const g = opts.find(p => inside(p) && !live.some(d => !d.k && ov(d, ...p))) || [0, 0];
        [dx, dy] = g; for (const d of live) if (d.k && ov(d, dx, dy)) d.o.t1 = Math.min(d.o.t1, c.o.t0 + 0.3);
      }
    }
    c.o._dx = dx;
    c.o._dy = dy; done.push(c);
  }
  LAYOUT = false;
}
// caixas dos cartões visíveis no instante t (para ícones e rótulos não ficarem por baixo)
let LAYOUT = false;
function cardBoxes(t, S) {
  if (S.years.some(y => !y.hide && y.t <= t)) BOXES.push(Object.assign([W - 340, 50, W - 50, 180], { k: 'ano' })); // selo do ano
  if (LAYOUT) return;
  for (const k of CARDS) for (const o of S[k] || []) {
    if (!vis(t, o.t0, o.t1, 0.3, 0.35)) continue; const r = cardRect(k, o), dx = o._dx || 0, dy = o._dy || 0;
    BOXES.push([r[0] + dx - 10, r[1] + dy - 10, r[0] + r[2] + dx + 10, r[1] + r[3] + dy + 10]);
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
    const w = Math.max(nw, lw) + 100, h = 230, x = (n.x ?? W / 2) + (n._dx || 0), y = (n.y ?? 150) + (n._dy || 0);
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
    const x = (wd.x ?? 90) + (wd._dx || 0), y = (wd.y ?? 300) + (wd._dy || 0), w = 640, h = wd.meaning ? 300 : 240;
    const slide = (1 - easeOut((t - wd.t0) / 0.45)) * -50;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(slide, 0); card(x, y, w, h, a);
    tagLabelLeft(wd.lang, x + 36, y + 50, wd.langColor || C.acai);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    // tudo dentro do cartão: a palavra diminui até caber ao lado do ícone, e o resto até caber na largura
    ctx.fillStyle = C.tinta; fit(wd.word, w - 72 - (wd.icon ? 150 : 0), 'italic 600 {}px Fraunces', 76, 34); ctx.fillText(wd.word, x + 36, y + 160);
    if (wd.pt) { fit('→ ' + wd.pt, w - 72, '700 {}px Figtree', 40, 24); ctx.fillStyle = C.verde; ctx.fillText('→ ' + wd.pt, x + 36, y + 218); }
    if (wd.meaning) {
      const m = '“' + wd.meaning + '”', yy = y + (wd.pt ? 268 : 215); ctx.fillStyle = '#4a5068';
      if (fit(m, w - 72, 'italic 400 {}px Figtree', 34, 27) > 27 || ctx.measureText(m).width <= w - 72) ctx.fillText(m, x + 36, yy);
      else { ctx.font = 'italic 400 25px Figtree'; const L = wrap2(m, w - 72); if (L.length > 1) fit(L[0].length > L[1].length ? L[0] : L[1], w - 72, 'italic 400 {}px Figtree', 25, 16); L.forEach((l, i) => ctx.fillText(l, x + 36, yy - (L.length - 1) * 15 + i * 30)); }
    }
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
    const w = Math.max(nw, rw) + 290, h = 220; const x = (right ? W - 90 - w : 90) + (pp._dx || 0), y = (pp.y ?? 330) + (pp._dy || 0);
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
// quadro ou foto de época: moldura branca, zoom lento e legenda embaixo
function photoH(o, w) { const im = IMG[o.img]; const ih = im ? Math.min(Math.max((w - 28) * im.height / im.width, 240), 520) : 300; return ih + 28 + 74; }
function drawPhotos(t, S) {
  for (const o of S.photos || []) {
    const a = vis(t, o.t0, o.t1, 0.4, 0.35); if (!a) continue; const im = IMG[o.img]; if (!im) continue;
    const r = cardRect('photos', o), x = r[0] + (o._dx || 0), y = r[1] + (o._dy || 0), w = r[2], h = r[3], ih = h - 28 - 74;
    const up = (1 - easeOut((t - o.t0) / 0.5)) * 40;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, up); card(x, y, w, h, a);
    ctx.save(); rr(x + 14, y + 14, w - 28, ih, 12); ctx.clip();
    const z = 1.04 + 0.08 * clamp((t - o.t0) / Math.max(1, o.t1 - o.t0)), k = Math.max((w - 28) / im.width, ih / im.height) * z;
    const iw = im.width * k, ihh = im.height * k; ctx.drawImage(im, x + w / 2 - iw / 2, y + 14 + ih * (o.focus ?? 0.5) - ihh * (o.focus ?? 0.5), iw, ihh); ctx.restore();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.tinta; fit(o.caption, w - 48, '800 {}px "Bricolage Grotesque"', 30, 16); ctx.fillText(o.caption, x + 24, y + ih + 28 + 38);
    if (o.sub) { fit(o.sub, w - 48, '500 {}px Figtree', 21, 13); ctx.fillStyle = '#5a6078'; ctx.fillText(o.sub, x + 24, y + ih + 28 + 66); }
    ctx.restore();
  }
}
function drawDots(t, S) {
  for (const d of S.dots) {
    const a = vis(t, d.t0, d.t1, 0.35, 0.35); if (!a) continue;
    const cols = d.cols || 10, rows = Math.ceil(d.total / cols), cell = d.cell || 38;
    const w = cols * cell + 80, h = rows * cell + 170; const x = (d.x ?? (W - 90 - w)) + (d._dx || 0), y = (d.y ?? 200) + (d._dy || 0);
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    ctx.textAlign = 'left'; ctx.fillStyle = C.tinta; ctx.font = '700 26px Figtree'; ctx.letterSpacing = '2px'; fit(d.title.toUpperCase(), w - 80, '700 {}px Figtree', 26, 14); ctx.fillText(d.title.toUpperCase(), x + 40, y + 56); ctx.letterSpacing = '0px';
    for (let i = 0; i < d.total; i++) {
      const ti = d.t0 + 0.3 + i * (d.speed || 0.012); const p = backOut((t - ti) / 0.3); if (p <= 0) continue;
      const cx = x + 40 + (i % cols) * cell + cell / 2, cy = y + 90 + Math.floor(i / cols) * cell + cell / 2;
      const colored = i < d.colored && t > d.t0 + (d.colorAt ?? 0);
      ctx.fillStyle = colored ? d.color : (d.base || '#cfd3dc'); ctx.beginPath(); ctx.arc(cx, cy, cell * 0.36 * p, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#4a5068'; fit(d.legend.map(l => l[1]).join(''), w - 80 - d.legend.length * 70, '500 {}px Figtree', 24, 14);
    let lx = x + 40; for (const [col, txt] of d.legend) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 10, y + h - 42, 10, 0, 7); ctx.fill(); ctx.fillStyle = C.tinta; ctx.fillText(txt, lx + 28, y + h - 34); lx += ctx.measureText(txt).width + 70; }
    ctx.restore();
  }
}
function drawRows(t, S) {
  for (const row of S.rows) {
    const a = vis(t, row.t0, row.t1, 0.3, 0.35); if (!a) continue;
    const n = row.items.length, cw = 220, w = n * cw + 40, h = 250, x = W / 2 - w / 2 + (row._dx || 0), y = (row.y ?? 170) + (row._dy || 0);
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    row.items.forEach((it, i) => {
      const ti = it.at ?? (row.t0 + i * 0.35); const p = (t - ti) / 0.45; if (p <= 0) return;
      const cx = x + 20 + cw * i + cw / 2; const grey = it.cross && t > it.cross;
      ctx.save(); if (grey) ctx.filter = 'grayscale(1) opacity(0.55)'; drawIcon(it.img, cx, y + 100, 120, 1, backOut(p)); ctx.restore();
      if (it.cross && t > it.cross) drawCross(cx, y + 100, 120, (t - it.cross) / 0.3);
      if (it.label) { ctx.globalAlpha = a * clamp(p); ctx.fillStyle = C.tinta; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; fit(it.label.toUpperCase(), cw - 18, '700 {}px Figtree', 24, 14); ctx.fillText(it.label.toUpperCase(), cx, y + 210); ctx.letterSpacing = '0px'; ctx.globalAlpha = a; }
    });
    ctx.restore();
  }
}
function drawLists(t, S) {
  for (const L of S.lists) {
    const a = vis(t, L.t0, L.t1, 0.35, 0.35); if (!a) continue;
    const w = 600, rowH = 92, h = 100 + L.items.length * rowH, x = W - 90 - w + (L._dx || 0), y = (L.y ?? 200) + (L._dy || 0);
    ctx.save(); ctx.globalAlpha = a; card(x, y, w, h, a);
    ctx.fillStyle = C.tinta; ctx.letterSpacing = '2px'; ctx.textAlign = 'left'; fit(L.title.toUpperCase(), w - 72, '700 {}px Figtree', 26, 14); ctx.fillText(L.title.toUpperCase(), x + 36, y + 58); ctx.letterSpacing = '0px';
    L.items.forEach((it, i) => {
      const p = easeOut((t - it.at) / 0.4); if (p <= 0) return; const yy = y + 110 + i * rowH;
      ctx.globalAlpha = a * p; ctx.fillStyle = it.color; ctx.beginPath(); ctx.arc(x + 52, yy + 26, 14, 0, 7); ctx.fill();
      ctx.fillStyle = C.tinta; fit(it.name, w - 120, '800 {}px "Bricolage Grotesque"', 34, 18); ctx.fillText(it.name, x + 82 + (1 - p) * 20, yy + 26);
      ctx.fillStyle = '#4a5068'; fit(it.sub, w - 120, '500 {}px Figtree', 24, 14); ctx.fillText(it.sub, x + 82 + (1 - p) * 20, yy + 60);
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
  BOXES = [];
  mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const cam = camera(t), S = SCENE;
  // cada caixa ganha o tipo de quem a ocupou (usado pela conferência de sobreposição)
  const K = (k, f) => { const n = BOXES.length; f(); for (let i = n; i < BOXES.length; i++) BOXES[i].k ??= k; };
  K('cartão', () => cardBoxes(t, S)); drawMap(t, cam, S); K('rótulo', () => drawLabels(t, cam, S)); drawRoutes(t, cam);
  ctx.drawImage(OVER, 0, 0); // vinheta e grão
  K('alfinete', () => drawPin(t, cam, S)); K('ícone', () => drawIcons(t, cam, S)); drawCrowd();
  drawYear(t, S); K('capítulo', () => drawChapter(t, S));
  drawDots(t, S); drawLists(t, S); drawNumbers(t, S); drawWords(t, S); drawPeople(t, S); drawPhotos(t, S); drawRows(t, S);
  drawPills(t, S); drawQuotes(t, S); drawTitle(t, S); drawEnd(t, S);
}
