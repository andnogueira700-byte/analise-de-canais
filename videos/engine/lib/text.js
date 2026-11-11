// Textos e cartões em microblocos (camada overlay). 1 unidade = 10 px em 1080p.
import * as THREE from 'three';
import { voxMaterial, hash3 } from './vox.js';
import { ease, clamp } from './core.js';

const glyphCache = new Map();
// amostra texto num canvas pequeno e devolve pixels acesos
export function sampleText(str, px = 16, font = 'Inter', weight = 900) {
  const key = str + '|' + px + '|' + font + weight;
  if (glyphCache.has(key)) return glyphCache.get(key);
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = `${weight} ${px}px "${font}"`;
  const w = Math.ceil(g.measureText(str).width) + 4, h = Math.ceil(px * 1.35) + 4;
  c.width = w; c.height = h;
  g.font = `${weight} ${px}px "${font}"`; g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(str, 2, h / 2 + 1);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 120) pts.push([x, h - 1 - y]);
  let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
  for (const [x, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  const r = { pts: pts.map(([x, y]) => [x - minX, y - minY]), w: maxX - minX + 1, h: maxY - minY + 1, capH: px * 0.72 };
  glyphCache.set(key, r); return r;
}

const box = new THREE.BoxGeometry(1, 1, 1);
// box com atributo fuv para o chanfro
(function addFuv() {
  const uv = box.attributes.uv; box.setAttribute('fuv', uv.clone());
})();

// Cubos instanciados com animação por cubo
export class CubeSet {
  constructor(max, mat) {
    this.mesh = new THREE.InstancedMesh(box, mat || voxMaterial({ bev: 0.55, rough: 0.6, inst: 1 }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false; this.items = []; this.max = max;
    this.mesh.count = 0;
  }
  add(x, y, z, col, s = 1, extra = {}) { this.items.push({ x, y, z, col: new THREE.Color(col), s, ...extra }); }
  build() {
    this.mesh.count = this.items.length;
    this.items.forEach((it, i) => this.mesh.setColorAt(i, it.col));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  // f(it, i) -> {k: escala 0..1, dx, dy, dz, rot}
  update(f) {
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
    this.items.forEach((it, i) => {
      const a = f ? f(it, i) : { k: 1 };
      const k = Math.max(0.0001, a.k ?? 1);
      E.set(a.rx || 0, a.ry || 0, a.rz || 0); Q.setFromEuler(E);
      P.set(it.x + (a.dx || 0), it.y + (a.dy || 0), it.z + (a.dz || 0)); S.set(it.s * k, it.s * k, (it.sz || it.s) * k);
      M.compose(P, Q, S); this.mesh.setMatrixAt(i, M);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// Texto em blocos. opts: {px, cube, color, shade (cor da camada de trás), depth}
export function voxelText(str, opts = {}) {
  const px = opts.px ?? 16, cs = opts.cube ?? 0.6;
  const g = sampleText(str, px, opts.font ?? 'Inter', opts.weight ?? 900);
  const set = new CubeSet(g.pts.length * 2 + 8);
  const W = g.w * cs, H = g.h * cs;
  const ox = opts.align === 'left' ? 0 : opts.align === 'right' ? -W : -W / 2;
  for (const [x, y] of g.pts) {
    const X = ox + x * cs, Y = -H / 2 + y * cs;
    set.add(X, Y, cs * 0.6, opts.color ?? 0xfff3df, cs * 0.98, { gx: x, gy: y });
    if (opts.shadow !== false) set.add(X + cs * 0.35, Y - cs * 0.45, -cs * 0.4, opts.shade ?? 0x2a160c, cs * 0.98, { gx: x, gy: y, back: 1 });
  }
  set.build(); set.update();
  const grp = new THREE.Group(); grp.add(set.mesh);
  grp.userData = { set, W, H, gw: g.w, gh: g.h };
  return grp;
}

// Cartão: painel de blocos com borda + linhas de texto
export function makeCard(lines, opts = {}) {
  const grp = new THREE.Group();
  const texts = lines.map(l => voxelText(l.text, { px: l.px ?? 14, cube: l.cube ?? 0.55, color: l.color ?? 0x3a2312, shade: l.shade ?? 0xd9c09a, shadow: l.shadow ?? false, align: 'center' }));
  const gap = opts.gap ?? 2.2;
  let totalH = texts.reduce((a, t) => a + t.userData.H, 0) + gap * (texts.length - 1);
  const W = Math.max(opts.minW ?? 0, ...texts.map(t => t.userData.W)) + (opts.padX ?? 7), H = totalH + (opts.padY ?? 6);
  // painel
  const pc = opts.cell ?? 1.6;
  const nx = Math.ceil(W / pc), ny = Math.ceil(H / pc);
  const panel = new CubeSet(nx * ny + 10);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const edge = i === 0 || j === 0 || i === nx - 1 || j === ny - 1;
    const corner = (i === 0 || i === nx - 1) && (j === 0 || j === ny - 1);
    if (corner) continue;
    const base = edge ? (opts.border ?? 0x6b3f22) : (opts.bg ?? 0xf3e2c0);
    const c = new THREE.Color(base).multiplyScalar(0.93 + hash3(i, j, 7) * 0.12);
    panel.add((i - (nx - 1) / 2) * pc, (j - (ny - 1) / 2) * pc, edge ? 0.3 : 0, c, pc * 0.98, { i, j, sz: pc * (edge ? 1.6 : 1) });
  }
  panel.build(); panel.update(); grp.add(panel.mesh);
  let y = totalH / 2;
  texts.forEach((t, k) => { y -= t.userData.H / 2; t.position.set(0, y, 1.4); y -= t.userData.H / 2 + gap; grp.add(t); });
  grp.userData = { panel, texts, W: nx * pc, H: ny * pc, nx, ny };
  return grp;
}

// animação padrão de entrada/saída de um cartão. lt: tempo local (s), inT: início, outT: fim
export function animCard(card, lt, inT = 0, outT = 99, opts = {}) {
  const ud = card.userData;
  const a = clamp((lt - inT) / 0.35), b = clamp((outT - lt) / 0.25);
  const k = ease.back(a) * ease.out(b);
  card.visible = k > 0.001;
  card.scale.setScalar(Math.max(0.0001, k));
  card.rotation.z = (1 - ease.out(a)) * (opts.spin ?? -0.25);
  card.rotation.x = Math.sin(lt * 1.3) * 0.06; card.rotation.y = Math.sin(lt * 0.9) * 0.08 + (opts.ry ?? 0);
  // texto cai bloco a bloco
  for (const t of ud.texts || []) {
    const set = t.userData.set, gw = t.userData.gw;
    set.update((it) => { const d = clamp((lt - inT - 0.1 - (it.gx / gw) * 0.18) / 0.14); return { k: ease.out(d), dy: (1 - ease.out(d)) * 1.5 }; });
  }
}
export function animText(t, lt, inT = 0, outT = 99, opts = {}) {
  const set = t.userData.set, gw = t.userData.gw;
  const b = clamp((outT - lt) / 0.25);
  t.visible = lt > inT && b > 0;
  set.update((it) => { const d = clamp((lt - inT - (it.gx / gw) * (opts.spread ?? 0.2)) / 0.14); return { k: ease.out(d) * ease.out(b), dy: (1 - ease.out(d)) * 1.5 }; });
}
