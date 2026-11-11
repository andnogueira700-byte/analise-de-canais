// Fauna de Hell Creek em microblocos. Convenção: +x é a frente do animal, y para cima, z para o lado; medidas em metros.
import * as THREE from 'three';
import { sd, voxelize, jitter, hash3, lerpHex } from './vox.js';
const { ell, cap, box, sph, smin } = sd;
const TAU = Math.PI * 2;
const J = (h, x, y, z, a = 0.07) => jitter(h, x, y, z, a);

// parte articulada: voxeliza fn<=0 em coordenadas do animal e devolve um grupo com pivô
function part(s, fn, colf, min, max, pivot, cast = true) {
  const m = voxelize((p, x, y, z) => fn(p) <= 0 ? colf(p, x, y, z) : -1, min, max, s, { cast });
  m.position.set(-pivot[0], -pivot[1], -pivot[2]);
  const g = new THREE.Group(); g.add(m); g.position.set(...pivot); g.userData.pivot = pivot; return g;
}
// pendura um filho no pai respeitando os pivôs absolutos
function attach(parent, child) { parent.add(child); const a = parent.userData.pivot || [0, 0, 0], b = child.userData.pivot; child.position.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); return child; }
const eye = (p, c, r, iris = 0xc8a040) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1], Math.abs(p[2]) - c[2]); if (d > r) return null; return d < r * 0.45 ? 0x111111 : iris; };

// ---------- crocodiliano (Borealosuchus / Brachychampsa) ----------
export function buildCroc(o = {}) {
  const L = o.len ?? 3.2, k = L / 3.2, s = (o.voxel ?? 0.028) * k, blunt = o.blunt ?? 0;
  const top = o.top ?? 0x3f4630, side = o.side ?? 0x59603e, belly = o.belly ?? 0xb5ab7c;
  const col = (p, x, y, z) => {
    const q = p.map(v => v / k);
    if (q[1] < 0.16) return J(belly, x, y, z, 0.05);
    const scute = q[1] > 0.3 && Math.abs(q[2]) < 0.2 && (Math.sin(q[0] * 38) > 0.2) && (Math.abs(Math.abs(q[2]) - 0.07) < 0.04 || Math.abs(Math.abs(q[2]) - 0.16) < 0.03);
    const band = Math.sin(q[0] * 7) > 0.75 && q[0] < -0.2;
    return J(scute ? lerpHex(top, 0x2a2e1e, 0.5) : band ? 0x343a26 : (q[1] > 0.26 ? top : side), x, y, z, 0.08);
  };
  const S = (v) => v.map(a => a * k);
  const root = new THREE.Group();
  const body = part(s, (p) => { const q = p.map(v => v / k); let d = ell(q, [0, 0.22, 0], [0.62, 0.15, 0.3]); d = smin(d, ell(q, [0.55, 0.24, 0], [0.22, 0.12, 0.17]), 0.12); return d * k; }, col, S([-0.7, 0.04, -0.36]), S([0.85, 0.42, 0.36]), S([0, 0.22, 0]));
  root.add(body);
  const snoutW = 0.11 + blunt * 0.06, snoutL = 0.62 - blunt * 0.2;
  const head = part(s, (p) => { const q = p.map(v => v / k); let d = ell(q, [0.82, 0.26, 0], [0.18, 0.09, 0.15]); d = smin(d, cap(q, [0.85, 0.24, 0], [0.85 + snoutL, 0.22, 0], snoutW, snoutW * 0.55 + blunt * 0.03), 0.06); d = Math.max(d, 0.215 - q[1]); return d * k; }, (p, x, y, z) => {
    const q = p.map(v => v / k); const e = eye(q, [0.86, 0.335, 0.075], 0.032, 0xc9b23c); if (e) return e;
    if (Math.hypot(q[0] - (0.85 + snoutL - 0.02), q[1] - 0.3, Math.abs(q[2]) - 0.035) < 0.018) return 0x1a1a14;
    if (q[1] < 0.235 && Math.abs(q[2]) > snoutW * 0.6 && hash3(x, 0, z) > 0.55) return 0xeae0c4; // dentes
    return col(p, x, y, z);
  }, S([0.6, 0.2, -0.2]), S([0.9 + snoutL + 0.05, 0.38, 0.2]), S([0.72, 0.24, 0]));
  attach(body, head);
  const jaw = part(s, (p) => { const q = p.map(v => v / k); let d = cap(q, [0.72, 0.19, 0], [0.82 + snoutL, 0.2, 0], snoutW * 0.95, snoutW * 0.5 + blunt * 0.03); d = Math.max(d, q[1] - 0.215); return d * k; }, (p, x, y, z) => { const q = p.map(v => v / k); if (q[1] > 0.2 && Math.abs(q[2]) < snoutW * 0.55) return 0xc8786a; if (q[1] > 0.2 && hash3(x, 1, z) > 0.55) return 0xeae0c4; return J(belly, x, y, z); }, S([0.6, 0.1, -0.2]), S([0.9 + snoutL + 0.05, 0.23, 0.2]), S([0.72, 0.215, 0]));
  attach(head, jaw);
  const tail = part(s, (p) => cap(p.map(v => v / k), [-0.55, 0.22, 0], [-1.25, 0.2, 0], 0.15, 0.08) * k, col, S([-1.35, 0.05, -0.2]), S([-0.4, 0.4, 0.2]), S([-0.55, 0.22, 0]));
  attach(body, tail);
  const tail2 = part(s, (p) => { const q = p.map(v => v / k); let d = cap(q, [-1.25, 0.2, 0], [-2.05, 0.18, 0], 0.085, 0.015); d = smin(d, box(q, [-1.6, 0.29, 0], [0.42, 0.035, 0.012]), 0.02); return d * k; }, col, S([-2.15, 0.08, -0.12]), S([-1.15, 0.36, 0.12]), S([-1.25, 0.2, 0]));
  attach(tail, tail2);
  const legs = [];
  for (const [fx, fr] of [[0.42, 1], [-0.42, 0]]) for (const sg of [1, -1]) {
    const z0 = 0.22 * sg, piv = [fx, 0.16, z0];
    const za = Math.min(z0 - 0.1 * sg, z0 + 0.3 * sg), zb = Math.max(z0 - 0.1 * sg, z0 + 0.3 * sg);
    const leg = part(s, (p) => { const q = p.map(v => v / k); return smin(cap(q, [fx, 0.16, z0], [fx + 0.04, 0.08, z0 + 0.14 * sg], 0.05, 0.04), ell(q, [fx + 0.08, 0.03, z0 + 0.16 * sg], [0.07, 0.025, 0.05]), 0.03) * k; }, col, S([fx - 0.12, -0.02, za]), S([fx + 0.2, 0.24, zb]), S(piv));
    attach(body, leg); legs.push({ g: leg, front: fr, sg });
  }
  return { root, body, head, jaw, tail: [tail, tail2], legs, k };
}
// p: {phase, swim(0..1), jaw, headYaw, headPitch, t}
export function poseCroc(C, p = {}) {
  const ph = (p.phase || 0) * TAU, sw = p.swim ?? 1, t = p.t || 0;
  C.tail[0].rotation.y = Math.sin(ph) * 0.28 * sw + Math.sin(t * 0.7) * 0.05;
  C.tail[1].rotation.y = Math.sin(ph - 1.1) * 0.45 * sw + Math.sin(t * 0.7 - 1) * 0.08;
  C.body.rotation.y = Math.sin(ph + 1.5) * 0.06 * sw;
  C.head.rotation.y = (p.headYaw || 0) - Math.sin(ph + 1.5) * 0.05 * sw;
  C.head.rotation.z = (p.headPitch || 0) + (p.jaw || 0) * 0.25;
  C.jaw.rotation.z = -(p.jaw || 0) * 0.5;
  for (const l of C.legs) { l.g.rotation.y = sw * 0.9 * l.sg * (l.front ? -1 : 1); l.g.rotation.x = (1 - sw) * Math.sin(ph + (l.front ? 0 : Math.PI) + (l.sg > 0 ? 0 : Math.PI)) * 0.4 * l.sg; }
}

// ---------- champsossauro: corpo esguio, focinho de lápis ----------
export function buildChampso(o = {}) {
  return buildCroc({ len: o.len ?? 1.6, voxel: 0.03, blunt: -0.9, top: 0x4d4a3c, side: 0x6b6650, belly: 0xc4b894, ...o });
}

// ---------- tartaruga ----------
export function buildTurtle(o = {}) {
  const s = o.voxel ?? 0.012, sh = o.shell ?? 0x4c4a2c, sk = o.skin ?? 0x6b6e48;
  const root = new THREE.Group();
  const shell = part(s, (p) => { let d = ell(p, [0, 0.1, 0], [0.24, 0.1, 0.19]); d = Math.max(d, 0.04 - p[1]); d = Math.min(d, ell(p, [0, 0.045, 0], [0.23, 0.02, 0.17])); return d; }, (p, x, y, z) => {
    if (p[1] < 0.06) return J(0xb0a070, x, y, z);
    const u = p[0] / 0.09, v = p[2] / 0.08; const fu = u - Math.round(u), fv = v - Math.round(v);
    const seam = Math.abs(fu) < 0.1 || Math.abs(fv) < 0.1;
    return J(seam ? 0x2c2a18 : lerpHex(sh, 0x6a6236, Math.max(0, 1 - Math.hypot(fu, fv) * 2.2)), x, y, z, 0.06);
  }, [-0.27, 0.02, -0.21], [0.27, 0.22, 0.21], [0, 0.08, 0]);
  root.add(shell);
  const neck = part(s, (p) => smin(cap(p, [0.12, 0.08, 0], [0.27, 0.1, 0], 0.035), ell(p, [0.3, 0.105, 0], [0.055, 0.04, 0.04]), 0.02), (p, x, y, z) => { const e = eye(p, [0.315, 0.125, 0.03], 0.011, 0x2a1a0a); if (e) return 0x0e0a06; if (p[0] > 0.34 && p[1] < 0.1) return 0x3a3a24; return J(Math.sin(p[0] * 120) > 0.6 ? 0xb8b070 : sk, x, y, z); }, [0.1, 0.03, -0.07], [0.37, 0.16, 0.07], [0.14, 0.08, 0]);
  attach(shell, neck);
  const legs = [];
  for (const [fx, fr] of [[0.13, 1], [-0.14, 0]]) for (const sg of [1, -1]) {
    const piv = [fx, 0.06, 0.13 * sg];
    const g = part(s, (p) => ell(p, [fx + (fr ? 0.04 : -0.03), 0.04, 0.2 * sg], [fr ? 0.07 : 0.05, 0.022, 0.06]), (p, x, y, z) => J(sk, x, y, z), [fx - 0.12, 0, sg > 0 ? 0.08 : -0.3], [fx + 0.14, 0.09, sg > 0 ? 0.3 : -0.08], piv);
    attach(shell, g); legs.push({ g, sg, fr });
  }
  return { root, shell, neck, legs };
}
export function poseTurtle(Tt, p = {}) {
  const ph = (p.phase || 0) * TAU, w = p.walk ?? 0;
  Tt.neck.position.x = 0.14 - (1 - (p.neck ?? 1)) * 0.1; Tt.neck.rotation.z = (p.headPitch || 0); Tt.neck.rotation.y = p.headYaw || 0;
  for (const l of Tt.legs) l.g.rotation.y = Math.sin(ph + (l.fr ? 0 : Math.PI) + (l.sg > 0 ? 0 : Math.PI)) * 0.5 * w;
  Tt.shell.rotation.z = Math.sin(ph * 2) * 0.03 * w;
}

// ---------- mamífero pequeno genérico (multituberculado / Didelphodon) ----------
export function buildMammal(o = {}) {
  const k = o.size ?? 1, s = (o.voxel ?? 0.0075) * k;
  const fur = o.fur ?? 0x6b5a48, dark = o.dark ?? 0x3a2e24, light = o.light ?? 0xc9b8a0, face = o.face ?? light, tailc = o.tail ?? 0xc9a090;
  const S = v => v.map(a => a * k), q = p => p.map(v => v / k);
  const furc = (p, x, y, z) => { const r = q(p); if (r[1] < 0.1) return J(light, x, y, z); return J(lerpHex(fur, dark, Math.max(0, (r[1] - 0.17) * 6)), x, y, z, 0.1); };
  const root = new THREE.Group();
  const body = part(s, (p) => { const r = q(p); return smin(ell(r, [0, 0.125, 0], [0.17, 0.095, 0.085]), ell(r, [0.1, 0.135, 0], [0.09, 0.085, 0.075]), 0.04) * k; }, furc, S([-0.2, 0.03, -0.1]), S([0.22, 0.24, 0.1]), S([0, 0.13, 0]));
  root.add(body);
  const wide = o.wide ?? 1;
  const head = part(s, (p) => { const r = q(p); let d = ell(r, [0.22, 0.155, 0], [0.075, 0.06, 0.06 * wide]); d = smin(d, ell(r, [0.3, 0.14, 0], [0.06, 0.035, 0.035 * wide]), 0.03); d = smin(d, ell(r, [0.2, 0.215, 0.045 * wide], [0.012, 0.025, 0.02]), 0.01); d = smin(d, ell(r, [0.2, 0.215, -0.045 * wide], [0.012, 0.025, 0.02]), 0.01); d = Math.max(d, 0.13 - r[1]); return d * k; }, (p, x, y, z) => {
    const r = q(p); const e = eye(r, [0.265, 0.175, 0.035 * wide], 0.011, 0x150c08); if (e) return e === 0x111111 ? 0x050505 : 0x1c120c;
    if (r[0] > 0.355) return 0xd8a0a0;
    if (r[1] > 0.2 && Math.abs(r[2]) > 0.035 * wide) return J(o.ear ?? 0x2e2620, x, y, z);
    return J(r[0] > 0.25 || (o.mask && r[1] < 0.17) ? face : fur, x, y, z, 0.08);
  }, S([0.12, 0.08, -0.1]), S([0.38, 0.25, 0.1]), S([0.15, 0.15, 0]));
  attach(body, head);
  const jaw = part(s, (p) => { const r = q(p); let d = ell(r, [0.27, 0.125, 0], [0.075, 0.022, 0.035 * wide]); d = Math.max(d, r[1] - 0.13); return d * k; }, (p, x, y, z) => { const r = q(p); if (r[1] > 0.118 && Math.abs(r[2]) > 0.022 * wide && hash3(x, 2, z) > 0.4) return 0xf2ead8; if (r[1] > 0.118) return 0x5a2622; return J(face, x, y, z); }, S([0.18, 0.09, -0.06]), S([0.36, 0.14, 0.06]), S([0.2, 0.13, 0]));
  attach(head, jaw);
  const tail = part(s, (p) => cap(q(p), [-0.15, 0.12, 0], [-0.4, 0.07, 0], 0.025 * (o.tailFat ?? 1), 0.008) * k, (p, x, y, z) => J(tailc, x, y, z, 0.05), S([-0.44, 0.03, -0.05]), S([-0.1, 0.17, 0.05]), S([-0.15, 0.12, 0]));
  attach(body, tail);
  const legs = [];
  for (const [fx, fr] of [[0.1, 1], [-0.1, 0]]) for (const sg of [1, -1]) {
    const piv = [fx, 0.1, 0.055 * sg];
    const g = part(s, (p) => { const r = q(p); return smin(cap(r, [fx, 0.1, 0.06 * sg], [fx + 0.01, 0.02, 0.065 * sg], 0.034, 0.024), ell(r, [fx + 0.025, 0.01, 0.065 * sg], [0.034, 0.011, 0.024]), 0.01) * k; }, (p, x, y, z) => q(p)[1] < 0.02 ? 0xc89a88 : J(dark, x, y, z), S([fx - 0.05, -0.005, 0.055 * sg - 0.05]), S([fx + 0.06, 0.13, 0.055 * sg + 0.05]), S(piv));
    attach(body, g); legs.push({ g, fr, sg });
  }
  return { root, body, head, jaw, tail, legs, k };
}
export function poseMammal(M, p = {}) {
  const ph = (p.phase || 0) * TAU, w = p.walk ?? 0, t = p.t || 0;
  for (const l of M.legs) { const a = ph + (l.fr ? 0 : Math.PI) + (l.sg > 0 ? 0 : Math.PI * 0.5); l.g.rotation.z = Math.sin(a) * 0.7 * w; }
  M.body.position.y = 0.13 * M.k + Math.abs(Math.sin(ph)) * 0.012 * M.k * w + Math.sin(t * 6) * 0.0015 * M.k;
  M.body.rotation.z = (p.rear || 0) * 0.5;
  M.head.rotation.z = (p.headPitch || 0) + Math.sin(t * 11) * 0.03 * (p.sniff || 0) - (p.rear || 0) * 0.3;
  M.head.rotation.y = p.headYaw || 0;
  M.jaw.rotation.z = -(p.jaw || 0) * 0.5;
  M.tail.rotation.y = Math.sin(t * 2 + ph) * 0.25; M.tail.rotation.z = (p.tailUp || 0);
}
export const buildMulti = () => buildMammal({ size: 0.55, voxel: 0.006, fur: 0x7a6248, dark: 0x4a3a2a, light: 0xd4c0a0, tail: 0x8a7058, tailFat: 1.2 });
export const buildDidelphodon = () => buildMammal({ size: 1.45, voxel: 0.0062, fur: 0x5e5a56, dark: 0x2c2826, light: 0xb8b0a4, face: 0xe2dccf, ear: 0x1e1a18, tail: 0xd2a6a0, mask: 1, wide: 1.35 });

// ---------- peixes (pejelagarto e peixes pequenos) ----------
export function buildFish(o = {}) {
  const L = o.len ?? 0.9, gar = o.gar ?? 1, s = o.voxel ?? 0.012 * L / 0.9;
  const base = o.col ?? (gar ? 0x6a6a48 : 0x8a9aa0), belly = o.belly ?? 0xd8d2b4;
  const col = (p, x, y, z) => {
    if (p[1] < -0.01 * L) return J(belly, x, y, z, 0.05);
    if (gar) { const u = (p[0] + p[1]) * 60 / L, v = (p[0] - p[1]) * 60 / L; const d = Math.abs(u - Math.round(u)) < 0.12 || Math.abs(v - Math.round(v)) < 0.12; const spot = hash3(Math.floor(p[0] * 30 / L), Math.floor(p[1] * 30 / L), Math.sign(p[2])) > 0.85; return J(spot ? 0x2a2a1a : d ? lerpHex(base, 0x2a2a1a, 0.4) : base, x, y, z, 0.06); }
    return J(base, x, y, z, 0.06);
  };
  const root = new THREE.Group();
  const front = part(s, (p) => { const q = p.map(v => v / L); let d = ell(q, [0.05, 0, 0], [0.28, 0.055, 0.045]); if (gar) d = smin(d, cap(q, [0.25, 0.005, 0], [0.5, 0.0, 0], 0.022, 0.01), 0.03); else d = smin(d, ell(q, [0.05, 0, 0], [0.3, 0.12, 0.05]), 0.05); d = Math.min(d, box(q, [-0.12, 0.055, 0], [0.035, 0.018, 0.004], 0.003)); return d * L; }, (p, x, y, z) => { const e = eye(p.map(v => v / L), [0.22, 0.02, 0.03], 0.013, 0xd0b060); if (e) return e; return col(p, x, y, z); }, [-0.3 * L, -0.15 * L, -0.07 * L], [0.52 * L, 0.15 * L, 0.07 * L], [-0.2 * L, 0, 0]);
  root.add(front);
  const back = part(s, (p) => { const q = p.map(v => v / L); let d = cap(q, [-0.2, 0, 0], [-0.42, 0.005, 0], 0.045, 0.02); d = Math.min(d, Math.max(Math.abs(q[2]) - 0.006, ell(q, [-0.5, 0.0, 0], [0.08, 0.09, 0.01]))); return d * L; }, col, [-0.62 * L, -0.12 * L, -0.06 * L], [-0.15 * L, 0.12 * L, 0.06 * L], [-0.2 * L, 0, 0]);
  attach(front, back);
  return { root, front, back, L };
}
export function poseFish(F, p = {}) { const ph = (p.phase || 0) * TAU, a = p.amp ?? 1; F.front.rotation.y = Math.sin(ph) * 0.12 * a; F.back.rotation.y = Math.sin(ph - 1.3) * 0.5 * a; }

// ---------- Edmontosaurus (bico de pato) ----------
export function buildEdmonto(o = {}) {
  const s = o.voxel ?? 0.1, skin = o.skin ?? 0x6a6a4a, back = o.back ?? 0x4e5236, belly = o.belly ?? 0xb0a47c;
  const col = (p, x, y, z) => { if (p[1] < 2.0 && p[0] > -2 && p[0] < 2.5) return J(belly, x, y, z, 0.06); const m = hash3(Math.floor(p[0] * 2.5), Math.floor(p[1] * 2.5), Math.floor(p[2] * 2.5)); return J(lerpHex(skin, back, Math.min(1, Math.max(0, (p[1] - 2.6) * 0.8)) * 0.7 + (m > 0.8 ? 0.2 : 0)), x, y, z, 0.07); };
  const root = new THREE.Group();
  const HIP = [0, 2.9, 0];
  const body = part(s, (p) => { let d = ell(p, [0.3, 2.75, 0], [2.3, 1.1, 0.95]); d = smin(d, ell(p, [-0.6, 3.0, 0], [1.4, 1.0, 0.85]), 0.6); d = smin(d, cap(p, [2.2, 2.9, 0], [3.4, 3.4, 0], 0.65, 0.4), 0.5); return d; }, col, [-2.3, 1.5, -1.1], [3.9, 4.2, 1.1], HIP);
  root.add(body);
  const NECK = [3.3, 3.35, 0];
  const head = part(s, (p) => { let d = ell(p, [3.75, 3.6, 0], [0.55, 0.38, 0.3]); d = smin(d, box(p, [4.45, 3.4, 0], [0.42, 0.14, 0.22], 0.1), 0.25); return d; }, (p, x, y, z) => { if (Math.hypot(p[0] - 3.85, p[1] - 3.78, Math.abs(p[2]) - 0.27) < 0.09) return 0x1a120a; if (p[0] > 4.55) return J(0x8a8268, x, y, z); return col(p, x, y, z); }, [3.0, 3.0, -0.5], [5.0, 4.15, 0.5], NECK);
  attach(body, head);
  const tail = part(s, (p) => cap(p, [-1.8, 3.0, 0], [-4.4, 3.0, 0], 0.75, 0.32), col, [-5, 2.1, -0.9], [-1.0, 3.9, 0.9], [-1.8, 3.0, 0]);
  attach(body, tail);
  const tail2 = part(s, (p) => cap(p, [-4.4, 3.0, 0], [-7.6, 2.8, 0], 0.34, 0.06), col, [-7.9, 2.4, -0.5], [-4.0, 3.5, 0.5], [-4.4, 3.0, 0]);
  attach(tail, tail2);
  const legs = [];
  for (const sg of [1, -1]) {
    const z = 0.6 * sg, Hp = [0, 2.8, z];
    const thigh = part(s, (p) => smin(ell(p, [0, 2.4, z], [0.9, 1.05, 0.5]), cap(p, [0, 2.6, z], [0.3, 1.5, z], 0.55, 0.42), 0.3), col, [-1.1, 1.0, z - 0.65], [1.1, 3.5, z + 0.65], Hp);
    const Kn = [0.3, 1.5, z];
    const shin = part(s, (p) => smin(cap(p, [0.3, 1.5, z], [-0.05, 0.3, z], 0.42, 0.3), ell(p, [0.15, 0.12, z], [0.42, 0.14, 0.28]), 0.12), (p, x, y, z2) => p[1] < 0.22 ? J(0x3e3a2c, x, y, z2) : col(p, x, y, z2), [-0.45, -0.05, z - 0.4], [0.65, 1.9, z + 0.4], Kn);
    attach(body, thigh); attach(thigh, shin);
    const Sh = [2.2, 2.3, z * 0.85];
    const arm = part(s, (p) => smin(cap(p, [2.2, 2.3, z * 0.85], [2.5, 0.25, z * 0.9], 0.3, 0.2), ell(p, [2.55, 0.1, z * 0.9], [0.22, 0.11, 0.18]), 0.08), (p, x, y, z2) => p[1] < 0.2 ? J(0x3e3a2c, x, y, z2) : col(p, x, y, z2), [1.9, -0.05, z * 0.85 - 0.35], [2.85, 2.6, z * 0.85 + 0.35], Sh);
    attach(body, arm);
    legs.push({ thigh, shin, arm, sg });
  }
  return { root, body, head, tail: [tail, tail2], legs, HIP };
}
// p: {phase, walk, graze(0..1 cabeça no chão), headYaw, headUp, t}
export function poseEdmonto(E, p = {}) {
  const ph = (p.phase || 0) * TAU, w = p.walk ?? 0, g = p.graze ?? 0, t = p.t || 0;
  E.body.position.y = E.HIP[1] + Math.abs(Math.cos(ph)) * 0.08 * w;
  E.body.rotation.z = -0.08 * g + Math.sin(ph * 2) * 0.015 * w;
  for (const L of E.legs) { const a = ph + (L.sg > 0 ? 0 : Math.PI); L.thigh.rotation.z = Math.sin(a) * 0.3 * w; L.shin.rotation.z = -Math.max(0, Math.cos(a)) * 0.4 * w; L.arm.rotation.z = -Math.sin(a) * 0.25 * w + 0.08 * g; }
  E.head.rotation.z = -1.05 * g + (p.headUp || 0) * 0.35 + Math.sin(t * 1.3) * 0.03 + (g > 0.5 ? Math.max(0, Math.sin(t * 5)) * 0.05 : 0);
  E.head.rotation.y = p.headYaw || 0;
  E.tail[0].rotation.y = Math.sin(ph + 1) * 0.07 * w + Math.sin(t * 0.5) * 0.04; E.tail[1].rotation.y = Math.sin(ph) * 0.1 * w + Math.sin(t * 0.5 - 0.6) * 0.06;
}

// ---------- Triceratops ----------
export function buildTrike(o = {}) {
  const s = o.voxel ?? 0.075, skin = o.skin ?? 0x7a6a4c, back = o.back ?? 0x5a4c36, belly = o.belly ?? 0xb3a07c;
  const col = (p, x, y, z) => { if (p[1] < 1.3) return J(belly, x, y, z, 0.06); const sc = hash3(Math.floor(p[0] * 6), Math.floor(p[1] * 6), Math.floor(p[2] * 6)) > 0.8; return J(sc ? 0x4a3e2c : (p[1] > 2.2 ? back : skin), x, y, z, 0.08); };
  const root = new THREE.Group();
  const B = [0, 1.9, 0];
  const body = part(s, (p) => { let d = ell(p, [0, 1.9, 0], [2.4, 1.05, 1.15]); d = smin(d, ell(p, [-0.8, 2.05, 0], [1.4, 0.95, 1.05]), 0.5); return d; }, col, [-2.5, 0.8, -1.3], [2.6, 3.1, 1.3], B);
  root.add(body);
  const NECK = [2.2, 2.0, 0];
  const head = part(s, (p) => {
    let d = ell(p, [2.9, 1.95, 0], [0.75, 0.62, 0.55]);
    d = smin(d, cap(p, [3.2, 1.8, 0], [3.95, 1.45, 0], 0.32, 0.12), 0.2); // focinho/bico
    const fr = Math.max(ell(p, [2.35, 2.7, 0], [0.32, 1.15, 1.25]), Math.abs((p[0] - 2.35) + (p[1] - 2.7) * 0.55) - 0.12); // babado inclinado
    d = Math.min(d, fr);
    d = Math.min(d, cap(p, [2.95, 2.4, 0.3], [3.75, 3.15, 0.38], 0.12, 0.025)); d = Math.min(d, cap(p, [2.95, 2.4, -0.3], [3.75, 3.15, -0.38], 0.12, 0.025)); // chifres sobre os olhos
    d = Math.min(d, cap(p, [3.55, 1.95, 0], [3.8, 2.3, 0], 0.08, 0.02)); // chifre do nariz
    return d;
  }, (p, x, y, z) => {
    if (Math.hypot(p[0] - 3.05, p[1] - 2.15, Math.abs(p[2]) - 0.45) < 0.09) return 0x150e08;
    if ((p[1] > 2.45 && p[0] > 2.9) || (p[0] > 3.5 && p[1] > 2.0)) return J(0xe6dcc0, x, y, z, 0.05); // chifres
    if (p[0] > 3.75) return J(0x3a3024, x, y, z); // bico
    const rim = ell(p, [2.35, 2.7, 0], [0.32, 1.15, 1.25]) > -0.14 && p[1] > 2.2;
    if (rim) return J(hash3(Math.floor(p[1] * 4), 0, Math.floor(p[2] * 4)) > 0.5 ? 0xd8c8a0 : 0x8a5a3a, x, y, z);
    if (p[0] < 2.6 && p[1] > 2.3) return J(lerpHex(0x9a6a40, 0x5a4a34, Math.abs(p[2]) / 1.2), x, y, z, 0.08);
    return col(p, x, y, z);
  }, [1.9, 1.0, -1.4], [4.1, 4.0, 1.4], NECK);
  attach(body, head);
  const jaw = part(s, (p) => Math.max(cap(p, [3.0, 1.55, 0], [3.85, 1.3, 0], 0.22, 0.08), p[1] - 1.55), (p, x, y, z) => p[0] > 3.6 ? J(0x3a3024, x, y, z) : col(p, x, y, z), [2.7, 1.0, -0.4], [4.1, 1.7, 0.4], [3.0, 1.6, 0]);
  attach(head, jaw);
  const tail = part(s, (p) => cap(p, [-2.0, 2.0, 0], [-4.3, 1.6, 0], 0.6, 0.12), col, [-4.6, 1.0, -0.7], [-1.5, 2.7, 0.7], [-2.0, 2.0, 0]);
  attach(body, tail);
  const legs = [];
  for (const [fx, fr] of [[1.5, 1], [-1.3, 0]]) for (const sg of [1, -1]) {
    const z = 0.85 * sg, piv = [fx, 1.6, z];
    const g = part(s, (p) => smin(cap(p, [fx, 1.6, z], [fx + 0.1, 0.25, z], fr ? 0.4 : 0.5, 0.3), ell(p, [fx + 0.15, 0.12, z], [0.38, 0.13, 0.32]), 0.12), (p, x, y, z2) => p[1] < 0.22 ? J(0x3e3426, x, y, z2) : col(p, x, y, z2), [fx - 0.6, -0.05, z - 0.6], [fx + 0.6, 2.2, z + 0.6], piv);
    attach(body, g); legs.push({ g, fr, sg });
  }
  return { root, body, head, jaw, tail, legs, B };
}
export function poseTrike(Tk, p = {}) {
  const ph = (p.phase || 0) * TAU, w = p.walk ?? 0, t = p.t || 0;
  Tk.body.position.y = Tk.B[1] + Math.abs(Math.cos(ph)) * 0.05 * w;
  for (const L of Tk.legs) L.g.rotation.z = Math.sin(ph + (L.fr ? 0 : Math.PI) + (L.sg > 0 ? 0 : Math.PI)) * 0.25 * w;
  Tk.head.rotation.z = -(p.headDown ?? 0) * 0.45 + (p.headUp || 0) * 0.25 + Math.sin(t * 1.1) * 0.015;
  Tk.head.rotation.y = p.headYaw || 0;
  Tk.jaw.rotation.z = -(p.chew ? Math.max(0, Math.sin(t * 7)) * 0.12 * p.chew : 0) - (p.jaw || 0) * 0.3;
  Tk.tail.rotation.y = Math.sin(t * 0.6) * 0.08;
}

// ---------- raptor com penas (Acheroraptor; Dakotaraptor = escala maior) ----------
export function buildRaptor(o = {}) {
  const k = o.size ?? 1, s = (o.voxel ?? 0.014) * k;
  const fe = o.feather ?? 0x5a4632, fd = o.featherDark ?? 0x2e241a, fl = o.featherLight ?? 0xb8a07a, sk = o.skin ?? 0x6e5c46;
  const S = v => v.map(a => a * k), q = p => p.map(v => v / k);
  const col = (p, x, y, z) => { const r = q(p); const bar = Math.sin(r[0] * 40 + Math.abs(r[2]) * 10) > 0.55; if (r[1] < 0.62) return J(fl, x, y, z, 0.08); return J(bar ? fd : fe, x, y, z, 0.12); };
  const root = new THREE.Group();
  const HIP = [0, 0.75, 0];
  const body = part(s, (p) => { const r = q(p); let d = ell(r, [0.08, 0.75, 0], [0.32, 0.17, 0.14]); d = smin(d, cap(r, [0.3, 0.78, 0], [0.55, 1.0, 0], 0.1, 0.06), 0.08); return d * k; }, col, S([-0.3, 0.5, -0.2]), S([0.65, 1.12, 0.2]), S(HIP));
  root.add(body);
  const NECK = [0.55, 1.0, 0];
  const head = part(s, (p) => { const r = q(p); let d = ell(r, [0.66, 1.05, 0], [0.09, 0.065, 0.055]); d = smin(d, cap(r, [0.68, 1.03, 0], [0.86, 1.0, 0], 0.045, 0.022), 0.04); return d * k; }, (p, x, y, z) => {
    const r = q(p); const e = eye(r, [0.69, 1.07, 0.045], 0.016, 0xd8a028); if (e) return e;
    if (r[0] > 0.72) return J(sk, x, y, z, 0.06);
    if (r[1] < 1.0 && r[0] > 0.7 && hash3(x, 3, z) > 0.6) return 0xece2c8;
    return J(r[1] > 1.07 ? fd : fe, x, y, z, 0.1);
  }, S([0.55, 0.94, -0.08]), S([0.9, 1.13, 0.08]), S(NECK));
  attach(body, head);
  const jaw = part(s, (p) => { const r = q(p); return Math.max(cap(r, [0.66, 0.995, 0], [0.84, 0.985, 0], 0.03, 0.015), r[1] - 0.995) * k; }, (p, x, y, z) => J(fl, x, y, z), S([0.6, 0.94, -0.05]), S([0.88, 1.0, 0.05]), S([0.66, 1.0, 0]));
  attach(head, jaw);
  const tail = part(s, (p) => { const r = q(p); let d = cap(r, [-0.2, 0.77, 0], [-1.3, 0.8, 0], 0.08, 0.02); d = smin(d, ell(r, [-1.0, 0.8, 0], [0.4, 0.035, 0.12]), 0.05); return d * k; }, (p, x, y, z) => { const r = q(p); return J(Math.sin(r[0] * 14) > 0.3 ? fd : fe, x, y, z, 0.1); }, S([-1.45, 0.65, -0.18]), S([-0.1, 0.92, 0.18]), S([-0.2, 0.77, 0]));
  attach(body, tail);
  const legs = [], arms = [];
  for (const sg of [1, -1]) {
    const z = 0.09 * sg, Hp = [0.02, 0.72, z];
    const thigh = part(s, (p) => { const r = q(p); return smin(ell(r, [0.0, 0.62, z], [0.09, 0.14, 0.06]), cap(r, [0.0, 0.68, z], [0.09, 0.4, z], 0.055, 0.035), 0.04) * k; }, col, S([-0.12, 0.34, z - 0.09]), S([0.16, 0.8, z + 0.09]), S(Hp));
    const Kn = [0.09, 0.4, z];
    const shin = part(s, (p) => { const r = q(p); let d = cap(r, [0.09, 0.4, z], [-0.02, 0.1, z], 0.035, 0.022); d = smin(d, cap(r, [-0.02, 0.1, z], [0.03, 0.015, z], 0.02, 0.016), 0.02); d = Math.min(d, cap(r, [0.03, 0.015, z], [0.12, 0.01, z], 0.014, 0.008)); d = Math.min(d, cap(r, [0.04, 0.03, z], [0.08, 0.07, z], 0.012, 0.005)); return d * k; }, (p, x, y, z2) => { const r = q(p); if (r[1] > 0.03 && r[1] < 0.08 && r[0] > 0.035) return 0x1a1410; return r[1] < 0.3 ? J(sk, x, y, z2) : col(p, x, y, z2); }, S([-0.08, -0.01, z - 0.05]), S([0.16, 0.44, z + 0.05]), S(Kn));
    attach(body, thigh); attach(thigh, shin);
    const Sh = [0.4, 0.83, 0.1 * sg];
    const arm = part(s, (p) => { const r = q(p); let d = cap(r, [0.4, 0.83, 0.1 * sg], [0.48, 0.68, 0.12 * sg], 0.03, 0.02); d = smin(d, Math.max(ell(r, [0.4, 0.71, 0.13 * sg], [0.13, 0.08, 0.015]), r[1] - 0.8), 0.02); return d * k; }, (p, x, y, z2) => J(q(p)[1] < 0.68 ? fd : fe, x, y, z2, 0.1), S([0.25, 0.6, 0.1 * sg - 0.05]), S([0.55, 0.88, 0.1 * sg + 0.05]), S(Sh));
    attach(body, arm);
    legs.push({ thigh, shin, sg }); arms.push(arm);
  }
  return { root, body, head, jaw, tail, legs, arms, HIP, k };
}
// p: {phase, walk, sniff, headYaw, headTilt, crouch, jaw, t}
export function poseRaptor(R, p = {}) {
  const ph = (p.phase || 0) * TAU, w = p.walk ?? 0, t = p.t || 0, cr = p.crouch || 0;
  R.body.position.y = (R.HIP[1] - cr * 0.12 + Math.abs(Math.cos(ph)) * 0.03 * w) * R.k;
  R.body.rotation.z = -0.08 * cr + Math.sin(ph * 2) * 0.03 * w - (p.sniff || 0) * 0.15;
  for (const L of R.legs) { const a = ph + (L.sg > 0 ? 0 : Math.PI); L.thigh.rotation.z = Math.sin(a) * 0.55 * w + cr * 0.4; L.shin.rotation.z = -Math.max(0, Math.cos(a)) * 0.7 * w - cr * 0.6; }
  R.head.rotation.z = -(p.sniff || 0) * 0.5 + Math.sin(t * 12) * 0.03 * (p.sniff || 0) + Math.sin(ph * 2) * 0.05 * w;
  R.head.rotation.y = p.headYaw || 0; R.head.rotation.x = p.headTilt || 0;
  R.jaw.rotation.z = -(p.jaw || 0) * 0.4;
  R.tail.rotation.y = Math.sin(t * 1.4 + ph) * 0.12; R.tail.rotation.z = Math.sin(ph * 2) * 0.04 * w + cr * 0.08;
  for (const a of R.arms) a.rotation.z = Math.sin(t * 1.5) * 0.05 - 0.2;
}

// ---------- pássaro pequeno (asas batendo) ----------
export function buildBird(o = {}) {
  const s = o.voxel ?? 0.01, c = o.col ?? 0x3a3428, w = o.wing ?? 0x5a4a36;
  const root = new THREE.Group();
  const body = part(s, (p) => smin(ell(p, [0, 0, 0], [0.09, 0.04, 0.04]), ell(p, [0.09, 0.02, 0], [0.035, 0.032, 0.03]), 0.02), (p, x, y, z) => { if (p[0] > 0.12) return 0xd8a040; if (Math.hypot(p[0] - 0.1, p[1] - 0.03, Math.abs(p[2]) - 0.025) < 0.008) return 0x0a0a0a; return J(c, x, y, z); }, [-0.1, -0.05, -0.05], [0.15, 0.06, 0.05], [0, 0, 0]);
  root.add(body);
  const wings = [];
  for (const sg of [1, -1]) { const g = part(s, (p) => ell(p, [0, 0.01, 0.12 * sg], [0.06, 0.008, 0.12]), (p, x, y, z) => J(Math.abs(p[2]) > 0.18 ? 0x2a241c : w, x, y, z), [-0.07, -0.01, sg > 0 ? 0 : -0.25], [0.07, 0.03, sg > 0 ? 0.25 : 0], [0, 0.01, 0.02 * sg]); attach(body, g); wings.push({ g, sg }); }
  return { root, body, wings };
}
export function poseBird(Bd, t) { for (const w of Bd.wings) w.g.rotation.x = Math.sin(t * 22) * 0.9 * w.sg; Bd.body.position.y = Math.sin(t * 22 + 1) * 0.01; }

// ---------- carrapato e âmbar ----------
export function buildTick(o = {}) {
  const s = o.voxel ?? 0.0018;
  return voxelize((p, x, y, z) => {
    let d = ell(p, [0, 0.006, 0], [0.012, 0.006, 0.009]); d = Math.min(d, ell(p, [0.012, 0.005, 0], [0.004, 0.003, 0.003]));
    for (const sg of [1, -1]) for (let i = 0; i < 4; i++) d = Math.min(d, cap(p, [0.006 - i * 0.005, 0.005, 0.006 * sg], [0.01 - i * 0.009, 0.0, 0.016 * sg], 0.0012));
    if (d > 0) return -1;
    return p[0] > 0.0085 && p[1] > 0.004 ? 0x2a1a10 : jitter(p[1] > 0.008 ? 0x6a3a22 : 0x4a2a18, x, y, z, 0.08);
  }, [-0.03, -0.002, -0.022], [0.02, 0.016, 0.022], s, { cast: true });
}
