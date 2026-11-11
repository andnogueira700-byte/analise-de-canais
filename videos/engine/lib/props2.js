// Mais objetos: carro, banana, dente, coberta, âmbar, rancho, mapa dos EUA, asteroide.
import * as THREE from 'three';
import { sd, voxelize, jitter, lerpHex, hash3 } from './vox.js';
import { fbm } from './noise.js';
import { shapes } from './props.js';
const { ell, cap, box, sph, smin } = sd;

export function buildCar(col = 0xc8423a, s = 0.06) {
  return shapes([
    { t: 'box', c: [0, 0.75, 0], h: [0.95, 0.3, 0.82], r: 0.12, col: (p, x, y, z) => Math.abs(p[0]) < 0.9 && p[1] > 0.82 && Math.abs(p[2]) < 0.84 && p[1] < 1.0 ? 0x9fc4d4 : jitter(col, x, y, z, 0.03) },
    { t: 'box', c: [0, 0.48, 0], h: [2.05, 0.28, 0.86], r: 0.12, col: (p, x, y, z) => (Math.abs(p[0]) > 1.98 && p[1] > 0.5 && Math.abs(p[2]) > 0.55) ? (p[0] > 0 ? 0xfff2c0 : 0xd02020) : jitter(col, x, y, z, 0.03) },
    ...[[-1.3, 1], [1.3, 1], [-1.3, -1], [1.3, -1]].map(([x, z]) => ({ t: 'fn', c: [x, 0.3, z * 0.8], h: [0.32, 0.32, 0.14], f: (p) => Math.max(Math.hypot(p[0] - x, p[1] - 0.3) - 0.3, Math.abs(p[2] - z * 0.8) - 0.13), col: (p) => Math.hypot(p[0] - x, p[1] - 0.3) < 0.13 ? 0xb8bcc4 : 0x1e1e20 })),
  ], s);
}
export function buildBanana(s = 0.006) {
  return voxelize((p, x, y, z) => {
    const a = Math.atan2(p[1] + 0.09, p[0]) - Math.PI / 2; if (Math.abs(a) > 0.95) return -1;
    const r = Math.hypot(p[0], p[1] + 0.09); const th = 0.024 * Math.cos(a * 1.2);
    if (Math.abs(r - 0.11) > th || Math.abs(p[2]) > th) return -1;
    return Math.abs(a) > 0.85 ? 0x4a3a1a : jitter(Math.abs(a) > 0.7 ? 0xb8b040 : 0xf2d24a, x, y, z, 0.05);
  }, [-0.12, -0.02, -0.03], [0.12, 0.04, 0.03], s);
}
// dente de T. rex (~30 cm com raiz), serrilhado
export function buildTooth(s = 0.005) {
  return voxelize((p, x, y, z) => {
    const h = p[1] / 0.3; if (h < 0 || h > 1) return -1;
    const w = 0.042 * (1 - h) ** 0.7 + 0.004, cx = h * h * 0.04;
    const d = Math.hypot((p[0] - cx) / 1.0, p[2] / 0.75) - w;
    if (d > 0) return -1;
    const ser = Math.abs(p[2]) < 0.006 && Math.sin(p[1] * 900) > 0.3;
    return jitter(h < 0.35 ? 0xa08a68 : (ser ? 0xd8ccb0 : 0xece2c8), x, y, z, 0.05);
  }, [-0.06, 0, -0.04], [0.09, 0.3, 0.04], s);
}
// coberta com volume (o cão por baixo); só o focinho de fora
export function buildBlanket(col = 0x5a7ab0, s = 0.02) {
  return voxelize((p, x, y, z) => {
    const hump = 0.26 * Math.exp(-((p[0] + 0.05) ** 2 / 0.12 + p[2] ** 2 / 0.06));
    const top = 0.03 + hump + Math.sin(p[0] * 9 + p[2] * 5) * 0.012;
    if (Math.abs(p[0]) > 0.75 || Math.abs(p[2]) > 0.65 || p[1] > top || p[1] < top - 0.045) return -1;
    const ch = (Math.floor(p[0] * 7) + Math.floor(p[2] * 7)) % 2 === 0;
    return jitter(ch ? col : lerpHex(col, 0xffffff, 0.25), x, y, z, 0.04);
  }, [-0.8, 0, -0.7], [0.8, 0.35, 0.7], s, { cast: true });
}
// âmbar com pena e carrapato dentro
export function buildAmber() {
  const g = new THREE.Group();
  const amber = voxelize((p, x, y, z) => {
    const d = ell(p, [0, 0, 0], [0.11, 0.075, 0.06]) + (fbm(p[0] * 20, p[2] * 20 + p[1] * 14, 2) - 0.5) * 0.02;
    return d <= 0 ? jitter(lerpHex(0xe89a2a, 0xc86a10, fbm(p[0] * 12, p[1] * 12, 2)), x, y, z, 0.06) : -1;
  }, [-0.13, -0.09, -0.08], [0.13, 0.09, 0.08], 0.006, { cast: true, mat: { transparent: true, opacity: 0.55, bev: 0.85, rough: 0.25 } });
  amber.renderOrder = 2; g.add(amber);
  const feather = voxelize((p, x, y, z) => {
    if (Math.abs(p[2]) > 0.002) return -1;
    const u = p[0] + 0.07; if (u < 0 || u > 0.13) return -1;
    if (Math.abs(p[1] - u * 0.15) < 0.0025) return 0x3a2a1a;
    const w = 0.028 * Math.sin(Math.min(1, u / 0.13) * Math.PI) ** 0.6; if (Math.abs(p[1] - u * 0.15) > w) return -1;
    return Math.sin(u * 300 + Math.abs(p[1]) * 200) > 0 ? 0x6a5a48 : 0x4a3e30;
  }, [-0.08, -0.03, -0.004], [0.07, 0.05, 0.004], 0.0025, { cast: false });
  g.add(feather);
  return { group: g, amber, feather };
}
// rancho: casinha, celeiro e cerca (diorama de hoje)
export function buildRanch(s = 0.05) {
  return shapes([
    { t: 'box', c: [0, 0.45, 0], h: [0.8, 0.45, 0.6], col: 0xe8dcc4 },
    { t: 'fn', c: [0, 1.1, 0], h: [0.9, 0.3, 0.7], f: (p) => Math.max(Math.abs(p[0]) - 0.9, Math.abs(p[2]) - 0.7, p[1] - 0.9 - (0.35 - Math.abs(p[2]) * 0.5), 0.88 - p[1]), col: 0x6a3a2a },
    { t: 'box', c: [2.2, 0.6, 0.2], h: [0.7, 0.6, 0.55], col: (p, x, y, z) => Math.abs(p[0] - 2.2) < 0.2 && p[1] < 0.8 && p[2] > 0.7 ? 0xe8dcc4 : jitter(0xa83a2a, x, y, z, 0.04) },
    { t: 'fn', c: [2.2, 1.35, 0.2], h: [0.75, 0.25, 0.6], f: (p) => Math.max(Math.abs(p[0] - 2.2) - 0.75, Math.abs(p[2] - 0.2) - 0.6, p[1] - 1.2 - (0.3 - Math.abs(p[0] - 2.2) * 0.4), 1.18 - p[1]), col: 0x4a4a4a },
  ], s);
}
// mapa dos EUA (contorno simplificado) com Montana destacada; 1 unidade = 1 grau
const US = [[-124.7, 48.4], [-123, 46.2], [-124.2, 42], [-124.3, 40.3], [-122.4, 37.5], [-120.6, 34.5], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103, 29], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9], [-97.3, 27.8], [-94.7, 29.4], [-93.8, 29.7], [-89.6, 29.3], [-89.4, 30.2], [-86.5, 30.4], [-84.3, 30], [-82.8, 27.9], [-81.7, 25.9], [-80.1, 25.8], [-80.1, 26.9], [-81.4, 30.7], [-81, 31.8], [-79.1, 33.4], [-75.6, 35.3], [-76.3, 37], [-75.2, 38.8], [-74, 40.5], [-71.9, 41.1], [-70, 41.7], [-70.7, 43.1], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-75, 45], [-76.8, 43.6], [-79, 43.2], [-79.8, 42.4], [-82.5, 41.7], [-83.5, 42], [-82.4, 43], [-82.5, 45.3], [-84.5, 45.8], [-87.6, 46.4], [-89.6, 48], [-95.2, 49], [-123.3, 49]];
const MT = [[-116.05, 49], [-104.05, 49], [-104.05, 45], [-111.05, 45], [-111.05, 44.5], [-113.4, 44.5], [-114.5, 45.5], [-114.3, 46.6], [-116.05, 48]];
const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
export function buildUSMap(s = 0.3) {
  // x = longitude (leste +), z = -latitude (norte = -z). Centro aprox. em (-98, 39)
  const cache = new Map();
  const land = voxelize((p, x, y, z) => {
    const lon = p[0] - 98, lat = -p[2] + 39, key = x * 4096 + z;
    let c = cache.get(key); if (c === undefined) { c = inPoly(lon, lat, US) ? (inPoly(lon, lat, MT) ? 2 : 1) : 0; cache.set(key, c); }
    if (!c) return p[1] < 0.15 ? jitter(0x2f5f86, x, y, z, 0.03) : -1;
    const mt = c === 2;
    const h = mt ? 0.9 : 0.45 + fbm(p[0] * 0.3, p[2] * 0.3, 2) * 0.25;
    if (p[1] > h) return -1;
    return mt ? jitter(0xe0862f, x, y, z, 0.05) : jitter(lerpHex(0x8aa25a, 0xc9b27a, fbm(p[0] * 0.15, p[2] * 0.15, 2)), x, y, z, 0.06);
  }, [-30, 0, -14], [30, 1.2, 14], s, { cast: true });
  return land;
}
export function buildAsteroid(s = 0.12) {
  return voxelize((p, x, y, z) => { const d = ell(p, [0, 0, 0], [1.2, 1.0, 1.1]) + (fbm(p[0] * 2, p[2] * 2 + p[1] * 2, 2) - 0.5) * 0.6; return d <= 0 ? jitter(lerpHex(0x5a4a40, 0x2e2622, fbm(p[0] * 3, p[1] * 3, 2)), x, y, z, 0.1) : -1; }, [-1.6, -1.4, -1.5], [1.6, 1.4, 1.5], s, { cast: false });
}
// lápis (comparação com o focinho do champsossauro), ao longo de +x
export function buildPencil(len = 0.45, s = 0.006) {
  return voxelize((p, x, y, z) => {
    const r = Math.hypot(p[1], p[2]); const hex = Math.max(Math.abs(p[1]), Math.abs(p[1]) * 0.5 + Math.abs(p[2]) * 0.866);
    if (p[0] < 0 || p[0] > len) return -1;
    const tip = len - 0.06;
    if (p[0] > tip) { const k = (p[0] - tip) / 0.06; if (r > 0.014 * (1 - k)) return -1; return k > 0.6 ? 0x2a2a2a : 0xe8c89a; }
    if (hex > 0.014) return -1;
    if (p[0] < 0.035) return p[0] < 0.02 ? 0xe88a9a : 0xb8bcc4;
    return jitter(0xf2c230, x, y, z, 0.03);
  }, [-0.005, -0.02, -0.02], [len + 0.005, 0.02, 0.02], s);
}
// caramujo (concha espiral simples)
export function buildSnail(s = 0.004) {
  return voxelize((p, x, y, z) => {
    const d = ell(p, [0, 0.03, 0], [0.03, 0.03, 0.022]);
    const body = ell(p, [0.02, 0.008, 0], [0.04, 0.009, 0.012]);
    if (Math.min(d, body) > 0) return -1;
    if (d <= 0) { const a = Math.atan2(p[1] - 0.03, p[0]), r = Math.hypot(p[0], p[1] - 0.03); return (Math.sin(a * 1 + r * 260) > 0.3) ? 0x6a4a2a : 0xc8a070; }
    return 0x9a8a6a;
  }, [-0.035, 0, -0.025], [0.065, 0.065, 0.025], s);
}
// caminhão de lixo
export function buildTruck(s = 0.07) {
  return shapes([
    { t: 'box', c: [1.75, 0.95, 0], h: [0.6, 0.55, 0.9], r: 0.1, col: (p, x, y, z) => p[1] > 1.05 && p[0] > 2.0 ? 0x9fc4d4 : jitter(0xe8e8e0, x, y, z, 0.03) },
    { t: 'box', c: [-0.6, 1.15, 0], h: [1.7, 0.85, 0.95], r: 0.08, col: (p, x, y, z) => jitter(Math.floor(p[0] * 2.5) % 2 ? 0x3a7a3a : 0x2f6a30, x, y, z, 0.04) },
    { t: 'box', c: [0.4, 0.35, 0], h: [2.4, 0.12, 0.85], col: 0x2a2a2a },
    ...[[-1.6, 1], [-0.6, 1], [1.7, 1], [-1.6, -1], [-0.6, -1], [1.7, -1]].map(([x, z]) => ({ t: 'fn', c: [x, 0.38, z * 0.85], h: [0.4, 0.4, 0.15], f: (p) => Math.max(Math.hypot(p[0] - x, p[1] - 0.38) - 0.38, Math.abs(p[2] - z * 0.85) - 0.14), col: (p) => Math.hypot(p[0] - x, p[1] - 0.38) < 0.16 ? 0xb8bcc4 : 0x1e1e20 })),
  ], s);
}
