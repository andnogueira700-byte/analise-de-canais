// Pitbull em microblocos, montado por partes articuladas (corpo, cabeça, mandíbula, orelhas, patas, rabo).
import * as THREE from 'three';
import { sd, voxelize, jitter, hash3 } from './vox.js';

const { ell, cap, box, sph, smin } = sd;
export const DOG_COLORS = {
  pitbull: { fur: 0xa4562c, furDark: 0x874424, white: 0xf3e7d6, nose: 0x6a3532, eye: 0x1c100b, eyeRing: 0x4a2414, mouth: 0x3a1c18, tongue: 0xc96a68, earIn: 0xc98a78 },
  wolf: { fur: 0x8d8478, furDark: 0x5e574f, white: 0xd8d0c2, nose: 0x1e1a18, eye: 0x9a7a20, eyeRing: 0x2a2420, mouth: 0x2a1a18, tongue: 0xb85a5a, earIn: 0x6e625a },
};

function part(fn, colorFn, min, max, s, pivot) {
  // voxeliza em espaço do cão e desloca para o pivô
  const m = voxelize((p, x, y, z) => fn(p) <= 0 ? colorFn(p, x, y, z) : -1, min, max, s);
  m.position.set(-pivot[0], -pivot[1], -pivot[2]);
  const g = new THREE.Group(); g.add(m); g.position.set(...pivot);
  return g;
}

export function buildDog(opts = {}) {
  const C = DOG_COLORS[opts.palette || 'pitbull'];
  const s = opts.voxel || 0.0092;
  const sx = opts.snout || 0; // lobo: focinho mais longo
  const J = (hex, x, y, z, a = 0.06) => jitter(hex, x, y, z, a);
  const root = new THREE.Group();
  const V = (a) => new THREE.Vector3(...a);
  const B = [0, 0.35, 0];
  // ---------- corpo (peito largo, cintura, quadril, pescoço grosso) ----------
  const torsoSdf = (p) => {
    let d = ell(p, [0.12, 0.35, 0], [0.175, 0.162, 0.158]);
    d = smin(d, ell(p, [-0.06, 0.36, 0], [0.17, 0.125, 0.13]), 0.08);
    d = smin(d, ell(p, [-0.2, 0.372, 0], [0.125, 0.125, 0.128]), 0.07);
    d = smin(d, cap(p, [0.17, 0.42, 0], [0.27, 0.5, 0], 0.108, 0.098), 0.06);
    d = smin(d, ell(p, [0.13, 0.36, 0.095], [0.1, 0.12, 0.07]), 0.05);
    d = smin(d, ell(p, [0.13, 0.36, -0.095], [0.1, 0.12, 0.07]), 0.05);
    return d;
  };
  const torsoCol = (p, x, y, z) => {
    const az = Math.abs(p[2]);
    const bib = (p[0] > 0.205 - Math.max(0, 0.42 - p[1]) * 0.5 && p[1] < 0.5 && az < 0.115 - Math.max(0, p[1] - 0.38) * 0.7) || (p[1] < 0.24 && p[0] > -0.02 && az < 0.09);
    if (bib) return J(C.white, x, y, z, 0.035);
    const dark = p[1] > 0.47 && p[0] < 0.15;
    return J(dark ? C.furDark : C.fur, x, y, z);
  };
  const body = part(torsoSdf, torsoCol, [-0.35, 0.17, -0.2], [0.4, 0.62, 0.2], s, B);
  root.add(body);
  // ---------- cabeça larga ----------
  const H = [0.27, 0.5, 0];
  const headSdf = (p) => {
    let d = ell(p, [0.305, 0.548, 0], [0.122, 0.094, 0.118]);
    d = smin(d, box(p, [0.31, 0.59, 0], [0.08, 0.042, 0.088], 0.045), 0.03);
    d = smin(d, ell(p, [0.355, 0.505, 0.06], [0.085, 0.07, 0.066]), 0.04);
    d = smin(d, ell(p, [0.355, 0.505, -0.06], [0.085, 0.07, 0.066]), 0.04);
    d = smin(d, box(p, [0.44 + sx / 2, 0.5, 0], [0.062 + sx / 2, 0.043, 0.064 - sx * 0.25], 0.03), 0.03);
    d = smin(d, ell(p, [0.497 + sx, 0.522, 0], [0.021, 0.021, 0.03]), 0.012);
    d = Math.min(d, sph(p, [0.408, 0.568, 0.063], 0.02), sph(p, [0.408, 0.568, -0.063], 0.02));
    return d;
  };
  const eyeC = [[0.408, 0.568, 0.063], [0.408, 0.568, -0.063]];
  const headCol = (p, x, y, z) => {
    const az = Math.abs(p[2]);
    if (p[0] > 0.482 + sx && p[1] > 0.5 && az < 0.036) return J(C.nose, x, y, z, 0.05);
    for (const e of eyeC) {
      const de = Math.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2]);
      if (de < 0.023) { if (p[1] > e[1] + 0.007 && p[0] > e[0] + 0.006) return 0xfff6e8; return C.eye; }
    }
    if (p[1] < 0.476 && p[0] > 0.37) return J(C.mouth, x, y, z, 0.03);
    const blaze = az < 0.016 + Math.max(0, 0.6 - p[1]) * 0.4 && p[0] > 0.34 && p[1] > 0.535;
    const muzzle = p[0] > 0.432 + sx * 0.6 || (p[1] < 0.495 && p[0] > 0.385);
    if (blaze || muzzle) return J(C.white, x, y, z, 0.035);
    return J(C.fur, x, y, z);
  };
  const head = part(headSdf, headCol, [0.17, 0.43, -0.14], [0.54 + sx, 0.65, 0.14], s, H);
  body.add(head); head.position.sub(V(B));
  // mandíbula
  const Jp = [0.36, 0.474, 0];
  const jaw = part(
    (p) => box(p, [0.43 + sx / 2, 0.458, 0], [0.055 + sx / 2, 0.02, 0.052 - sx * 0.2], 0.017),
    (p, x, y, z) => p[1] > 0.47 ? J(C.tongue, x, y, z, 0.05) : J(C.white, x, y, z, 0.035),
    [0.34, 0.43, -0.07], [0.51 + sx, 0.49, 0.07], s, Jp);
  head.add(jaw); jaw.position.sub(V(H));
  // orelhas em "rosa", dobradas para trás
  const ears = [];
  for (const sgn of [1, -1]) {
    const E = [0.27, 0.632, 0.078 * sgn];
    const ear = part(
      (p) => ell(p, [0.262, 0.636, 0.112 * sgn], [0.044, 0.016, 0.042]),
      (p, x, y, z) => (p[1] < 0.632) ? J(C.earIn, x, y, z, 0.04) : J(C.furDark, x, y, z),
      [0.2, 0.57, sgn > 0 ? 0.06 : -0.14], [0.34, 0.68, sgn > 0 ? 0.14 : -0.06], s, E);
    ear.userData.sgn = sgn;
    head.add(ear); ear.position.sub(V(H)); ears.push(ear);
  }
  // ---------- patas ----------
  const legs = {};
  const whitePaw = (p, x, y, z) => p[1] < 0.072 ? J(C.white, x, y, z, 0.035) : J(C.fur, x, y, z);
  for (const sgn of [1, -1]) {
    const zc = 0.098 * sgn;
    const S = [0.14, 0.32, zc], E = [0.13, 0.17, zc];
    const up = part((p) => smin(cap(p, [0.14, 0.32, zc], [0.13, 0.17, zc], 0.055, 0.044), ell(p, [0.145, 0.27, zc], [0.065, 0.085, 0.055]), 0.03), (p, x, y, z) => J(C.fur, x, y, z), [0.06, 0.12, zc - 0.075], [0.22, 0.4, zc + 0.075], s, S);
    const lo = part((p) => smin(cap(p, [0.13, 0.17, zc], [0.14, 0.045, zc], 0.04, 0.035), ell(p, [0.162, 0.026, zc], [0.05, 0.028, 0.045]), 0.02), whitePaw, [0.07, -0.005, zc - 0.065], [0.23, 0.21, zc + 0.065], s, E);
    body.add(up); up.position.sub(V(B)); up.add(lo); lo.position.sub(V(S));
    legs[sgn > 0 ? 'FL' : 'FR'] = { up, lo, front: true };
    const Hh = [-0.2, 0.35, zc * 0.95], K = [-0.15, 0.185, zc];
    const up2 = part((p) => smin(ell(p, [-0.185, 0.28, zc], [0.088, 0.115, 0.062]), cap(p, [-0.2, 0.35, zc], [-0.15, 0.185, zc], 0.05, 0.042), 0.04), (p, x, y, z) => J(C.fur, x, y, z), [-0.29, 0.13, zc - 0.08], [-0.08, 0.42, zc + 0.08], s, Hh);
    const lo2 = part((p) => smin(smin(cap(p, [-0.15, 0.185, zc], [-0.235, 0.092, zc], 0.04, 0.034), cap(p, [-0.235, 0.092, zc], [-0.215, 0.04, zc], 0.034, 0.032), 0.02), ell(p, [-0.193, 0.026, zc], [0.05, 0.028, 0.045]), 0.02), whitePaw, [-0.29, -0.005, zc - 0.065], [-0.11, 0.23, zc + 0.065], s, K);
    body.add(up2); up2.position.sub(V(B)); up2.add(lo2); lo2.position.sub(V(Hh));
    legs[sgn > 0 ? 'RL' : 'RR'] = { up: up2, lo: lo2, front: false };
  }
  // ---------- rabo ----------
  const T = [-0.3, 0.42, 0], T2 = [-0.41, 0.375, 0];
  const t1 = part((p) => cap(p, [-0.3, 0.42, 0], [-0.41, 0.375, 0], 0.03, 0.022), (p, x, y, z) => J(C.fur, x, y, z), [-0.45, 0.33, -0.05], [-0.26, 0.46, 0.05], s, T);
  const t2 = part((p) => cap(p, [-0.41, 0.375, 0], [-0.51, 0.3, 0], 0.022, 0.011), (p, x, y, z) => J(C.furDark, x, y, z), [-0.55, 0.26, -0.04], [-0.38, 0.41, 0.04], s, T2);
  body.add(t1); t1.position.sub(V(B)); t1.add(t2); t2.position.sub(V(T));
  body.position.set(...B);
  const dog = { root, body, head, jaw, ears, legs, tail: [t1, t2], B, s };
  root.userData.dog = dog;
  return dog;
}

// ---------- poses ----------
const TAU = Math.PI * 2;
export function resetPose(d) {
  d.body.position.set(...d.B); d.body.rotation.set(0, 0, 0);
  d.head.rotation.set(0, 0, 0); d.jaw.rotation.set(0, 0, 0);
  for (const e of d.ears) e.rotation.set(0, 0, 0);
  for (const k in d.legs) { d.legs[k].up.rotation.set(0, 0, 0); d.legs[k].lo.rotation.set(0, 0, 0); }
  d.tail[0].rotation.set(0, 0, 0.35); d.tail[1].rotation.set(0, 0, 0.2);
}

// p: {gait:'idle'|'walk'|'run'|'swim', phase, sit, lie, headPitch, headYaw, headRoll, jaw, ears, wag, wagSpeed, t, breathe, shiver, sniff, crouch, tailUp}
export function poseDog(d, p) {
  resetPose(d);
  const t = p.t || 0;
  const L = d.legs;
  let by = 0, bp = 0, br = 0;
  // respiração
  const br0 = Math.sin(t * (p.pant ? 14 : 2.4)) * (p.pant ? 0.004 : 0.003);
  by += br0;
  if (p.gait === 'walk' || p.gait === 'run') {
    const ph = p.phase * TAU;
    const run = p.gait === 'run';
    const A = run ? 0.75 : 0.42, Bf = run ? 1.1 : 0.7;
    const offs = run ? { FL: 0, FR: 0.12, RL: 0.5, RR: 0.62 } : { RL: 0, FL: 0.25, RR: 0.5, FR: 0.75 };
    for (const k in L) {
      const a = ph + offs[k] * TAU;
      const sw = Math.sin(a);
      const lift = Math.max(0, Math.cos(a));
      L[k].up.rotation.z = sw * A * (L[k].front ? 1 : 0.85);
      L[k].lo.rotation.z = L[k].front ? -lift * Bf : lift * Bf * 0.9;
    }
    by += run ? Math.abs(Math.sin(ph)) * 0.05 - 0.02 : Math.abs(Math.sin(ph * 2)) * 0.008;
    bp += run ? Math.sin(ph + 0.6) * 0.12 : Math.sin(ph * 2) * 0.015;
    d.head.rotation.z += run ? -Math.sin(ph + 0.6) * 0.1 : Math.sin(ph * 2) * 0.03;
  }
  if (p.gait === 'swim') {
    const ph = p.phase * TAU;
    for (const k in L) {
      const off = { FL: 0, FR: 0.5, RL: 0.25, RR: 0.75 }[k];
      const a = ph + off * TAU;
      L[k].up.rotation.z = (L[k].front ? 0.6 : -0.2) + Math.sin(a) * 0.6;
      L[k].lo.rotation.z = (L[k].front ? -0.4 : 0.6) - Math.max(0, Math.cos(a)) * 0.6 * (L[k].front ? 1 : -1);
    }
    bp += 0.35; d.head.rotation.z -= 0.15;
    by += Math.sin(ph * 2) * 0.01;
  }
  if (p.crouch) { // postura firme, puxando (cabo de guerra)
    const c = p.crouch;
    bp += -0.12 * c; by -= 0.05 * c;
    L.FL.up.rotation.z = L.FR.up.rotation.z = 0.35 * c; L.FL.lo.rotation.z = L.FR.lo.rotation.z = 0.05 * c;
    L.RL.up.rotation.z = L.RR.up.rotation.z = -0.25 * c; L.RL.lo.rotation.z = L.RR.lo.rotation.z = 0.35 * c;
  }
  if (p.sit) {
    const k = p.sit;
    bp += 0.55 * k; by -= 0.13 * k;
    for (const n of ['RL', 'RR']) { L[n].up.rotation.z = 1.25 * k - 0.55 * k; L[n].lo.rotation.z = -1.9 * k + 0.55 * k * 0.0; }
    for (const n of ['FL', 'FR']) { L[n].up.rotation.z = -0.55 * k + 0.06 * k; }
    d.head.rotation.z -= 0.45 * k;
  }
  if (p.lie) {
    const k = p.lie;
    by -= 0.235 * k;
    for (const n of ['FL', 'FR']) { L[n].up.rotation.z = 1.45 * k; L[n].lo.rotation.z = 0.05 * k; }
    for (const n of ['RL', 'RR']) { L[n].up.rotation.z = 1.35 * k; L[n].lo.rotation.z = -2.35 * k; }
    for (const n of ['RL', 'RR']) L[n].up.rotation.x = 0.25 * k * (n === 'RL' ? -1 : 1);
  }
  if (p.shiver) { by += Math.sin(t * 70) * 0.003 * p.shiver; br += Math.sin(t * 63) * 0.02 * p.shiver; }
  d.body.position.y = d.B[1] + by; d.body.rotation.z = bp; d.body.rotation.x = br;
  // cabeça
  d.head.rotation.z += (p.headPitch || 0);
  d.head.rotation.y += (p.headYaw || 0);
  d.head.rotation.x += (p.headRoll || 0);
  if (p.sniff) { // focinho farejando: pequenos impulsos
    d.head.rotation.z += -0.55 * p.sniff + Math.sin(t * 9) * 0.035 * p.sniff;
  }
  d.jaw.rotation.z = -(p.jaw || 0) * 0.6;
  // orelhas: 0 relaxadas, 1 em alerta
  const ek = p.ears ?? 0.3;
  for (const e of d.ears) { const g = e.userData.sgn; e.rotation.x = (0.75 - ek * 0.5) * g; e.rotation.z = 0.15 - ek * 0.3; e.rotation.y = 0; }
  // rabo
  const wag = p.wag ?? 0.2;
  d.tail[0].rotation.y = Math.sin(t * (p.wagSpeed || 12)) * 0.5 * wag;
  d.tail[1].rotation.y = Math.sin(t * (p.wagSpeed || 12) - 0.8) * 0.4 * wag;
  d.tail[0].rotation.z = 0.35 + (p.tailUp || 0) * 0.5 - (p.tailDown || 0) * 0.8;
}
