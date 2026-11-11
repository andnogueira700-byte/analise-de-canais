// Objetos em microblocos: casa, móveis, objetos da história, pessoa, casas da rua.
import * as THREE from 'three';
import { sd, voxelize, jitter, lerpHex, hash3 } from './vox.js';
import { fbm } from './noise.js';
const { ell, cap, box, sph, cylY, smin } = sd;

// forma genérica a partir de uma lista de primitivas (a primeira que contém o ponto define a cor)
export function shapes(list, s, opts = {}) {
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  const ext = (c, r) => { for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], c[i] - r[i]); mx[i] = Math.max(mx[i], c[i] + r[i]); } };
  const fns = list.map(o => {
    if (o.t === 'box') { ext(o.c, o.h); return (p) => box(p, o.c, o.h, o.r || 0); }
    if (o.t === 'ell') { ext(o.c, o.r); return (p) => ell(p, o.c, o.r); }
    if (o.t === 'sph') { ext(o.c, [o.r, o.r, o.r]); return (p) => sph(p, o.c, o.r); }
    if (o.t === 'cyl') { ext(o.c, [o.r, o.h, o.r]); return (p) => cylY(p, o.c, o.r, o.h); }
    if (o.t === 'cap') { const r = Math.max(o.ra, o.rb ?? o.ra); ext(o.a, [r, r, r]); ext(o.b, [r, r, r]); return (p) => cap(p, o.a, o.b, o.ra, o.rb ?? o.ra); }
    if (o.t === 'fn') { ext(o.c, o.h); return o.f; }
  });
  const sub = list.map(o => !!o.sub);
  for (let i = 0; i < 3; i++) { mn[i] -= s * 2; mx[i] += s * 2; }
  return voxelize((p, x, y, z) => {
    for (let k = 0; k < fns.length; k++) if (sub[k] && fns[k](p) <= 0) return -1;
    for (let k = 0; k < fns.length; k++) {
      if (sub[k]) continue;
      if (fns[k](p) <= 0) { const c = list[k].col; return typeof c === 'function' ? c(p, x, y, z) : jitter(c, x, y, z, list[k].j ?? 0.05); }
    }
    return -1;
  }, mn, mx, s, opts);
}

const wood = (base, dark) => (p, x, y, z) => jitter(Math.sin(p[1] * 90 + fbm(p[0] * 8, p[2] * 8, 2) * 6) > 0.6 ? dark : base, x, y, z, 0.05);
const plank = (base, dark, w = 0.16, axis = 0) => (p, x, y, z) => { const a = p[axis] / w; const seam = Math.abs(a - Math.round(a)) < 0.06; return jitter(seam ? dark : lerpHex(base, dark, hash3(Math.floor(a), 0, Math.floor(p[2 - axis] / 1.2)) * 0.35), x, y, z, 0.05); };

// ---------- sala / quarto ----------
export function buildRoom(opts = {}) {
  const g = new THREE.Group();
  const W = opts.w ?? 7, D = opts.d ?? 5, Hh = 2.8, s = 0.05;
  const floor = shapes([{ t: 'box', c: [0, -0.05, 0], h: [W / 2, 0.05, D / 2], col: plank(opts.floor ?? 0xb07a4c, 0x7a4e2e, 0.18, 0) }], s, { cast: false });
  const wallCol = opts.wall ?? 0xe7d3b3, wallDark = lerpHex(wallCol, 0x6b4a32, 0.35);
  const wallFn = (p, x, y, z) => p[1] < 0.12 ? jitter(0xf5ecdc, x, y, z, 0.03) : jitter(Math.abs(Math.sin(p[0] * 3.2 + p[2] * 3.2)) > 0.97 ? wallDark : wallCol, x, y, z, 0.03);
  const back = shapes([{ t: 'box', c: [0, Hh / 2, -D / 2 - 0.05], h: [W / 2 + 0.1, Hh / 2, 0.05], col: wallFn }], s, { cast: false });
  const left = shapes([{ t: 'box', c: [-W / 2 - 0.05, Hh / 2, 0], h: [0.05, Hh / 2, D / 2], col: wallFn }], s, { cast: false });
  const right = shapes([{ t: 'box', c: [W / 2 + 0.05, Hh / 2, 0], h: [0.05, Hh / 2, D / 2], col: wallFn }, ...(opts.doorHole ? [{ t: 'box', c: [W / 2 + 0.05, 1.05, opts.doorHole], h: [0.2, 1.05, 0.48], sub: 1 }] : [])], s, { cast: false });
  g.add(floor, back, left, right);
  g.userData = { W, D, Hh };
  return g;
}
export function buildSofa(col = 0x3f7b86) {
  const dark = lerpHex(col, 0x10202a, 0.35), light = lerpHex(col, 0xffffff, 0.12);
  const fabric = (b) => (p, x, y, z) => jitter(hash3(x, y, z) > 0.8 ? lerpHex(b, 0x000000, 0.08) : b, x, y, z, 0.04);
  return shapes([
    { t: 'box', c: [-0.42, 0.47, 0.05], h: [0.4, 0.09, 0.36], r: 0.06, col: fabric(light) },
    { t: 'box', c: [0.42, 0.47, 0.05], h: [0.4, 0.09, 0.36], r: 0.06, col: fabric(light) },
    { t: 'box', c: [0, 0.78, -0.33], h: [0.88, 0.3, 0.12], r: 0.08, col: fabric(col) },
    { t: 'box', c: [-0.97, 0.56, 0], h: [0.12, 0.22, 0.45], r: 0.07, col: fabric(col) },
    { t: 'box', c: [0.97, 0.56, 0], h: [0.12, 0.22, 0.45], r: 0.07, col: fabric(col) },
    { t: 'box', c: [0, 0.27, 0], h: [1.05, 0.13, 0.45], r: 0.04, col: fabric(dark) },
    { t: 'box', c: [-0.95, 0.06, 0.35], h: [0.04, 0.06, 0.04], col: 0x3a2516 }, { t: 'box', c: [0.95, 0.06, 0.35], h: [0.04, 0.06, 0.04], col: 0x3a2516 },
    { t: 'box', c: [-0.95, 0.06, -0.35], h: [0.04, 0.06, 0.04], col: 0x3a2516 }, { t: 'box', c: [0.95, 0.06, -0.35], h: [0.04, 0.06, 0.04], col: 0x3a2516 },
  ], 0.022);
}
export function buildDoor() {
  // pivô na dobradiça (x=0), porta abre girando em y
  const g = new THREE.Group();
  const frame = shapes([
    { t: 'box', c: [0, 2.1, 0.47], h: [0.06, 0.07, 0.06], col: 0xf2ebdd }, { t: 'box', c: [0, 1.05, -0.0], h: [0.06, 1.1, 0.04], col: 0xf2ebdd },
    { t: 'box', c: [0, 1.05, 0.94], h: [0.06, 1.1, 0.04], col: 0xf2ebdd },
  ], 0.025, { cast: false });
  const panel = shapes([
    { t: 'box', c: [0, 1.02, 0.47], h: [0.025, 1.02, 0.45], col: (p, x, y, z) => { const inset = (Math.abs(p[1] - 1.45) < 0.4 || Math.abs(p[1] - 0.55) < 0.35) && Math.abs(p[2] - 0.47) < 0.33; return jitter(inset ? 0x7a4a2c : 0x8f5934, x, y, z, 0.05); } },
    { t: 'sph', c: [-0.05, 1.0, 0.82], r: 0.035, col: 0xd9b45a }, { t: 'sph', c: [0.05, 1.0, 0.82], r: 0.035, col: 0xd9b45a },
  ], 0.02);
  const pivot = new THREE.Group(); pivot.position.set(0, 0, 0.03); panel.position.z = -0.03; pivot.add(panel);
  g.add(frame, pivot); g.userData.pivot = pivot;
  return g;
}
export function buildRug(col = 0xb5523a) {
  return shapes([{ t: 'box', c: [0, 0.01, 0], h: [1.2, 0.012, 0.8], col: (p, x, y, z) => { const b = Math.max(Math.abs(p[0]) / 1.2, Math.abs(p[2]) / 0.8); const st = b > 0.86 ? 0xe9cf9a : (Math.sin(p[0] * 14) * Math.sin(p[2] * 14) > 0.4 ? 0x8a3a2a : col); return jitter(st, x, y, z, 0.05); } }], 0.025, { cast: false });
}
export function buildLamp() {
  return shapes([{ t: 'cyl', c: [0, 0.02, 0], r: 0.16, h: 0.02, col: 0x2e2a26 }, { t: 'cyl', c: [0, 0.8, 0], r: 0.018, h: 0.8, col: 0x2e2a26 },
    { t: 'cap', a: [0, 1.6, 0], b: [0, 1.85, 0], ra: 0.24, rb: 0.16, col: 0xf6deb0 }], 0.025);
}
export function buildPlant() {
  const list = [{ t: 'cyl', c: [0, 0.18, 0], r: 0.16, h: 0.18, col: 0xc0613a }];
  for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 0.18 + (i % 3) * 0.08; list.push({ t: 'ell', c: [Math.cos(a) * r, 0.55 + (i % 4) * 0.12, Math.sin(a) * r], r: [0.12, 0.05, 0.07], col: i % 2 ? 0x4d8a3c : 0x3c7432 }); }
  return shapes(list, 0.025);
}
export function buildWindow(w = 1.3, h = 1.2) {
  return shapes([{ t: 'box', c: [0, 0, 0], h: [w / 2, h / 2, 0.05], col: (p, x, y, z) => { const fr = Math.abs(p[0]) > w / 2 - 0.06 || Math.abs(p[1]) > h / 2 - 0.06 || Math.abs(p[0]) < 0.03 || Math.abs(p[1]) < 0.03; return fr ? jitter(0xf3ede0, x, y, z, 0.02) : lerpHex(0xbfe0f2, 0xfff1d6, (p[1] + h / 2) / h * 0.6); } }], 0.025, { cast: false });
}
export function buildBed() {
  return shapes([
    { t: 'box', c: [0, 0.55, -0.98], h: [0.78, 0.45, 0.05], r: 0.03, col: wood(0x8a5a36, 0x6a4228) },
    { t: 'box', c: [-0.4, 0.62, -0.72], h: [0.28, 0.08, 0.17], r: 0.07, col: 0xf6f0e6 }, { t: 'box', c: [0.4, 0.62, -0.72], h: [0.28, 0.08, 0.17], r: 0.07, col: 0xf6f0e6 },
    { t: 'box', c: [0, 0.5, 0.15], h: [0.74, 0.1, 0.78], r: 0.06, col: (p, x, y, z) => jitter(Math.floor((p[0] + 2) * 5) % 2 ? 0x6f8fb8 : 0x5f7fa8, x, y, z, 0.03) },
    { t: 'box', c: [0, 0.42, -0.1], h: [0.76, 0.1, 0.95], r: 0.04, col: 0xf1ece2 },
    { t: 'box', c: [0, 0.18, -0.1], h: [0.8, 0.14, 1.0], col: wood(0x8a5a36, 0x6a4228) },
  ], 0.025);
}
export function buildVacuum() {
  const g = new THREE.Group();
  const m = shapes([
    { t: 'box', c: [0, 0.05, 0.05], h: [0.17, 0.045, 0.1], r: 0.03, col: 0x2b2b30 },
    { t: 'box', c: [0, 0.32, -0.02], h: [0.1, 0.22, 0.09], r: 0.05, col: 0xd9372e },
    { t: 'box', c: [0, 0.32, 0.07], h: [0.06, 0.12, 0.01], col: 0x6b1712 },
    { t: 'cyl', c: [0, 0.75, -0.04], r: 0.022, h: 0.25, col: 0x9a9aa0 },
    { t: 'box', c: [0, 1.02, -0.04], h: [0.09, 0.03, 0.03], r: 0.015, col: 0x2b2b30 },
    { t: 'sph', c: [0.12, 0.05, -0.08], r: 0.04, col: 0x111111 }, { t: 'sph', c: [-0.12, 0.05, -0.08], r: 0.04, col: 0x111111 },
  ], 0.018);
  g.add(m); return g;
}
export function buildKeys() {
  const pts = [];
  return shapes([
    { t: 'fn', c: [0, 0, 0], h: [0.04, 0.04, 0.01], f: (p) => Math.abs(Math.hypot(p[0], p[1]) - 0.03) - 0.006 + Math.max(0, Math.abs(p[2]) - 0.004), col: 0xc9c9cf },
    { t: 'box', c: [0.0, -0.08, 0], h: [0.012, 0.045, 0.004], col: 0xd9b45a }, { t: 'box', c: [0.01, -0.115, 0], h: [0.02, 0.006, 0.004], col: 0xd9b45a },
    { t: 'sph', c: [0, -0.035, 0], r: 0.018, col: 0xd9b45a },
    { t: 'box', c: [0.05, -0.07, 0], h: [0.011, 0.04, 0.004], col: 0xbcbcc4 }, { t: 'sph', c: [0.05, -0.03, 0], r: 0.017, col: 0x3b7bd1 },
  ], 0.005);
}
export function buildBowl(food = false) {
  return shapes([
    { t: 'fn', c: [0, 0.05, 0], h: [0.16, 0.06, 0.16], f: (p) => { const r = Math.hypot(p[0], p[2]); const outer = Math.max(r - (0.12 + p[1] * 0.4), Math.abs(p[1] - 0.04) - 0.04); const inner = Math.max(r - (0.1 + p[1] * 0.4), -(p[1] - 0.015)); return food ? outer : Math.max(outer, -inner); }, col: (p, x, y, z) => jitter(p[1] > 0.075 ? 0xd8dde3 : 0xaab3bd, x, y, z, 0.05) },
  ], 0.012);
}
export function buildCollar() {
  return shapes([
    { t: 'fn', c: [0, 0, 0], h: [0.13, 0.13, 0.03], f: (p) => Math.max(Math.abs(Math.hypot(p[0], p[1]) - 0.11) - 0.014, Math.abs(p[2]) - 0.02), col: 0xd23a2e },
    { t: 'sph', c: [0, -0.15, 0], r: 0.028, col: 0xe8c45a },
  ], 0.008);
}
export function buildRope(len = 0.7) {
  return shapes([{ t: 'cap', a: [-len / 2, 0, 0], b: [len / 2, 0, 0], ra: 0.025, col: (p, x, y, z) => jitter(Math.sin(p[0] * 60 + Math.atan2(p[1], p[2]) * 2) > 0 ? 0xf2e7d2 : 0x3a7bc8, x, y, z, 0.04) },
    { t: 'sph', c: [-len / 2, 0, 0], r: 0.05, col: 0xe24b3b }, { t: 'sph', c: [len / 2, 0, 0], r: 0.05, col: 0xe24b3b }], 0.009);
}
export function buildPlate() {
  return shapes([
    { t: 'cyl', c: [0, 0.012, 0], r: 0.16, h: 0.012, col: 0xf4f1ea },
    { t: 'ell', c: [0.02, 0.05, 0], r: [0.09, 0.04, 0.06], col: 0xb0622a }, { t: 'cap', a: [0.08, 0.05, 0], b: [0.14, 0.06, 0.03], ra: 0.014, col: 0xf1e2c8 },
    { t: 'ell', c: [-0.08, 0.03, 0.05], r: [0.05, 0.02, 0.04], col: 0xe0c040 }, { t: 'ell', c: [-0.07, 0.03, -0.06], r: [0.04, 0.025, 0.035], col: 0x4a9a3a },
  ], 0.01);
}
export function buildBackpack() {
  return shapes([
    { t: 'box', c: [0, 0.22, 0], h: [0.16, 0.22, 0.09], r: 0.06, col: 0x2f6fb5 },
    { t: 'box', c: [0, 0.14, 0.09], h: [0.12, 0.09, 0.04], r: 0.03, col: 0x245a96 },
    { t: 'box', c: [0, 0.44, -0.02], h: [0.13, 0.03, 0.07], r: 0.02, col: 0x245a96 },
    { t: 'box', c: [-0.06, 0.47, 0], h: [0.035, 0.08, 0.065], col: 0xc23b2b }, { t: 'box', c: [0.0, 0.48, 0], h: [0.03, 0.09, 0.065], col: 0x3a9a5a }, { t: 'box', c: [0.06, 0.46, 0], h: [0.035, 0.07, 0.065], col: 0xe0b33a },
  ], 0.012);
}
export function buildBook(col) {
  return shapes([{ t: 'box', c: [0, 0, 0], h: [0.07, 0.015, 0.1], col: (p, x, y, z) => Math.abs(p[1]) < 0.009 && p[0] > -0.06 ? 0xf3eee2 : jitter(col, x, y, z, 0.04) }], 0.008);
}
export function buildScale() {
  return shapes([
    { t: 'box', c: [0, 0.04, 0], h: [0.55, 0.04, 0.35], r: 0.02, col: 0xe6e8ea },
    { t: 'box', c: [0, 0.085, 0], h: [0.5, 0.008, 0.3], col: 0x2c2f33 },
    { t: 'box', c: [0.58, 0.07, 0], h: [0.04, 0.05, 0.14], r: 0.01, col: 0x1c1e22 },
  ], 0.015);
}
export function buildRuler(h = 0.6) {
  return shapes([{ t: 'box', c: [0, h / 2, 0], h: [0.03, h / 2, 0.012], col: (p, x, y, z) => { const cm = p[1] * 100; const tick = Math.abs(cm - Math.round(cm / 5) * 5) < 0.6 && p[0] < (Math.round(cm) % 10 === 0 ? 0.03 : 0.0); return tick ? 0x1c140c : jitter(0xf2c230, x, y, z, 0.03); } }], 0.006);
}

// ---------- pessoa simples ----------
export function buildPerson(o = {}) {
  const skin = o.skin ?? 0xd9a07a, shirt = o.shirt ?? 0x3f6fa0, pants = o.pants ?? 0x2f3d55, hair = o.hair ?? 0x3a2416, s = o.voxel ?? 0.02;
  const P = (list, pivot) => { const m = shapes(list, s); m.position.set(-pivot[0], -pivot[1], -pivot[2]); const g = new THREE.Group(); g.add(m); g.position.set(...pivot); return g; };
  const root = new THREE.Group();
  const torso = P([{ t: 'box', c: [0, 1.22, 0], h: [0.19, 0.27, 0.11], r: 0.06, col: shirt }, { t: 'cap', a: [0, 1.5, 0], b: [0, 1.56, 0], ra: 0.055, col: skin }], [0, 1.0, 0]);
  const head = P([{ t: 'box', c: [0, 1.7, 0], h: [0.1, 0.12, 0.105], r: 0.06, col: (p, x, y, z) => { if (p[1] > 1.76 || (p[2] < -0.05 && p[1] > 1.62)) return jitter(hair, x, y, z, 0.05); if (Math.abs(p[0]) > 0.025 && Math.abs(p[0]) < 0.055 && Math.abs(p[1] - 1.71) < 0.012 && p[2] > 0.08) return 0x1a120c; return jitter(skin, x, y, z, 0.03); } }], [0, 1.56, 0]);
  torso.add(head); head.position.sub(new THREE.Vector3(0, 1.0, 0));
  const arms = [];
  for (const sg of [1, -1]) {
    const arm = P([{ t: 'cap', a: [0.24 * sg, 1.43, 0], b: [0.26 * sg, 1.12, 0], ra: 0.055, col: shirt }, { t: 'cap', a: [0.26 * sg, 1.12, 0], b: [0.27 * sg, 0.88, 0], ra: 0.045, col: skin }, { t: 'sph', c: [0.27 * sg, 0.84, 0], r: 0.05, col: skin }], [0.24 * sg, 1.43, 0]);
    torso.add(arm); arm.position.sub(new THREE.Vector3(0, 1.0, 0)); arms.push(arm);
  }
  const legs = [];
  for (const sg of [1, -1]) {
    const leg = P([{ t: 'cap', a: [0.1 * sg, 0.98, 0], b: [0.1 * sg, 0.1, 0], ra: 0.075, rb: 0.06, col: pants }, { t: 'box', c: [0.1 * sg, 0.04, 0.05], h: [0.055, 0.04, 0.11], r: 0.02, col: o.shoe ?? 0x2a2a2a }], [0.1 * sg, 0.98, 0]);
    root.add(leg); legs.push(leg);
  }
  root.add(torso);
  return { root, torso, head, arms, legs };
}

// ---------- casas da rua ----------
export function buildHouse(seed, o = {}) {
  const wall = o.wall ?? [0xe8d6b5, 0xc9dbe0, 0xf0c9a8, 0xd8e2c4][seed % 4], roof = o.roof ?? [0x9a3d2e, 0x5a4a44, 0x7a3a2a, 0x40566a][seed % 4];
  const W = 4.2, D = 4, H = 2.8;
  return shapes([
    { t: 'fn', c: [0, H + 0.9, 0], h: [W / 2 + 0.4, 1.1, D / 2 + 0.3], f: (p) => Math.max(Math.abs(p[2]) - D / 2 - 0.3, Math.abs(p[0]) - W / 2 - 0.35, p[1] - (H + 1.6 - Math.abs(p[0]) * 0.75), H - p[1]), col: (p, x, y, z) => jitter(Math.floor(p[1] * 6) % 2 ? roof : lerpHex(roof, 0x000000, 0.15), x, y, z, 0.05) },
    { t: 'box', c: [0, H / 2, 0], h: [W / 2, H / 2, D / 2], col: (p, x, y, z) => {
      const fz = p[2] > D / 2 - 0.1;
      if (fz && Math.abs(p[0]) < 0.42 && p[1] < 2.0) return jitter(0x6b3f24, x, y, z, 0.04);
      if (fz && (Math.abs(Math.abs(p[0]) - 1.35) < 0.45) && Math.abs(p[1] - 1.55) < 0.42) return (Math.abs(Math.abs(p[0]) - 1.35) < 0.04 || Math.abs(p[1] - 1.55) < 0.04) ? 0xf5f0e6 : 0xffd98a;
      return jitter(wall, x, y, z, 0.03); } },
    { t: 'box', c: [0, 0.1, D / 2 + 0.5], h: [0.6, 0.1, 0.5], col: 0xb9b2a6 },
  ], 0.08, { cast: true });
}
export function buildStreetTree(seed) {
  return shapes([{ t: 'cyl', c: [0, 0.9, 0], r: 0.12, h: 0.9, col: 0x6b4a32 }, { t: 'fn', c: [0, 2.4, 0], h: [1.1, 1, 1.1], f: (p) => ell(p, [0, 2.4, 0], [1.0, 0.95, 1.0]) + (fbm(p[0] * 2 + seed, p[2] * 2 + p[1] * 2, 2) - 0.5) * 0.5, col: (p, x, y, z) => jitter(lerpHex(0x3f7a34, 0x8ab04a, (p[1] - 1.6) / 1.6), x, y, z, 0.1) }], 0.07);
}
export function buildFence(len = 8) {
  const list = [];
  for (let x = -len / 2; x <= len / 2; x += 0.3) list.push({ t: 'box', c: [x, 0.45, 0], h: [0.05, 0.45, 0.03], col: 0xf4f1ea });
  list.push({ t: 'box', c: [0, 0.6, 0], h: [len / 2, 0.04, 0.025], col: 0xf4f1ea }, { t: 'box', c: [0, 0.3, 0], h: [len / 2, 0.04, 0.025], col: 0xf4f1ea });
  return shapes(list, 0.04);
}
