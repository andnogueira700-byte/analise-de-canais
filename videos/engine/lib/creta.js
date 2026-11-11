// Cenário: margem de rio em Hell Creek, fim do Cretáceo.
import * as THREE from 'three';
import { heightfield, jitter, lerpHex, hash3 } from './vox.js';
const far0 = 0;
import { fbm, rng } from './noise.js';
import { makeTree, makeFern, makeLog, makeRock, makeWaterMaterial, buildTrex, makeClouds } from './world.js';

export const WATER_Y = -0.2;
export const riverX = (z) => 4.6 + 3.2 * Math.sin(z * 0.022 + 0.25) + Math.max(0, -z - 30) * 0.1;
export const riverHalf = (z) => 2.6 + Math.max(0, -z) * 0.035;
export const FOOT = { x: 0.6, z: 0.55, ang: -0.35, depth: 0.1 };

function footDepth(x, z) {
  const c = Math.cos(FOOT.ang), s = Math.sin(FOOT.ang);
  const dx = x - FOOT.x, dz = z - FOOT.z;
  const u = dx * c - dz * s, v = dx * s + dz * c; // u: lateral, v: para frente (dedos)
  let m = 0;
  const heel = (u * u) / (0.14 * 0.14) + ((v + 0.04) * (v + 0.04)) / (0.17 * 0.17);
  if (heel < 1) m = Math.max(m, 1 - heel * 0.6);
  const toes = [[0, 0.52, 0.062], [-0.3, 0.36, 0.052], [0.3, 0.36, 0.052]];
  for (const [tu, tv, r] of toes) {
    const ax = 0, av = 0.05, L2 = (tu - ax) ** 2 + (tv - av) ** 2;
    const h = Math.max(0, Math.min(1, ((u - ax) * (tu - ax) + (v - av) * (tv - av)) / L2));
    const du = u - (ax + (tu - ax) * h), dv = v - (av + (tv - av) * h);
    const rr = r * (1 - h * 0.45);
    const q = (du * du + dv * dv) / (rr * rr);
    if (q < 1) m = Math.max(m, 1 - q * 0.5);
  }
  // borda levantada (lama empurrada)
  const ring = Math.sqrt((u * u) / (0.4 * 0.4) + ((v - 0.15) * (v - 0.15)) / (0.52 * 0.52));
  const rim = ring > 0.85 && ring < 1.15 ? (1 - Math.abs(ring - 1) / 0.15) * 0.018 : 0;
  return { d: m > 0 ? -FOOT.depth * Math.min(1, m * 2.2) : 0, rim };
}

export function groundH(x, z) {
  const rx = riverX(z), half = riverHalf(z);
  const dist = Math.abs(x - rx) - half;
  let h;
  if (dist < 0) h = -0.32 - Math.min(-dist, 2) * 0.18;
  else if (dist < 2.2) { const t = dist / 2.2; h = -0.3 + 0.3 * (t * t * (3 - 2 * t)); }
  else h = (dist - 2.2) * 0.015;
  const far = Math.hypot(x, z);
  h += (fbm(x * 0.06, z * 0.06, 3, 7) - 0.5) * Math.min(1, Math.max(0, far - 12) / 20) * 3.0;
  h += (fbm(x * 2.2, z * 2.2, 3, 11) - 0.5) * 0.03;
  if (dist > 0) {
    const f = footDepth(x, z); h += f.d + f.rim;
    if (far < 8 && Math.hypot(x - FOOT.x, z - FOOT.z) > 0.9) { const k = hash3(Math.floor(x * 50), 9, Math.floor(z * 50)); if (k > 0.982) h += 0.02; }
  }
  return h;
}

function groundCol(x, z, y, top, depth) {
  const rx = riverX(z), half = riverHalf(z);
  const dist = Math.abs(x - rx) - half;
  const n = fbm(x * 1.3, z * 1.3, 3, 5);
  const ix = Math.round(x * 50), iz = Math.round(z * 50), iy = Math.round(y * 50);
  if (!top) return jitter(depth > 2 ? 0x4e301c : 0x6a4128, ix, iy, iz, 0.08);
  if (y < WATER_Y + 0.02 && dist < 0.4) return jitter(0x5b3d26, ix, iy, iz, 0.08);
  const f = footDepth(x, z);
  if (f.d < -0.01) return jitter(f.d < -0.06 ? 0x4e2e1a : 0x64391f, ix, iy, iz, 0.06);
  if (dist < 2.8) {
    const wet = 1 - Math.min(1, Math.max(0, dist) / 2.8);
    let c = lerpHex(0x94573a, 0x5c3420, wet * 0.85);
    if (n > 0.62) c = lerpHex(c, 0x7c6a3a, 0.4);
    if (hash3(ix, 3, iz) > 0.985) c = 0x5a4632;
    return jitter(c, ix, iy, iz, 0.09);
  }
  let c = lerpHex(0x85513a, 0x66763a, Math.min(1, (dist - 2.8) / 4) * (n > 0.45 ? 1 : 0.35));
  if (Math.hypot(x, z) > 30) c = lerpHex(c, 0x5d6f3c, 0.6);
  return jitter(c, ix, iy, iz, 0.1);
}

export function buildCreta(scene, opts = {}) {
  const set = new THREE.Group(); set.name = 'creta';
  const cx = opts.cx ?? 0.6, cz = opts.cz ?? 0.2;
  // anéis de detalhe divididos em pedaços para o recorte de câmera funcionar
  const rings = opts.rings ?? [
    { half: 1.7, s: 0.02, sv: 0.02, chunks: 4 },
    { half: 6, s: 0.045, sv: 0.02, chunks: 6 },
    { half: 26, s: 0.16, sv: 0.03, chunks: 6, tall: true },
    { half: 160, s: 0.9, sv: 0.06, chunks: 8, tall: true },
  ];
  let inner = null;
  for (const r of rings) {
    const x0 = cx - r.half, z0 = cz - r.half, size = (r.half * 2) / r.chunks;
    for (let i = 0; i < r.chunks; i++) for (let j = 0; j < r.chunks; j++) {
      const a0 = x0 + i * size, b0 = z0 + j * size;
      if (inner && a0 >= inner[0] - 1e-6 && b0 >= inner[1] - 1e-6 && a0 + size <= inner[2] + 1e-6 && b0 + size <= inner[3] + 1e-6) continue;
      const m = heightfield(groundH, groundCol, a0, b0, a0 + size, b0 + size, r.s, { hole: inner, skirt: 4, sv: r.sv, tallSides: r.tall, mat: { bev: r.s < 0.03 ? 0.7 : 0.8, rough: 0.75 } });
      m.name = 'ground' + r.s;
      set.add(m);
    }
    inner = [x0, z0, cx + r.half, cz + r.half];
  }
  // água do rio
  const wmat = makeWaterMaterial();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), wmat);
  water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y; set.add(water);
  // água dentro da pegada (nível animável)
  const fmat = makeWaterMaterial({ deep: 0x4a5048, shallow: 0x6d6a55, cell: 0.02 });
  const footWater = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), fmat);
  footWater.rotation.x = -Math.PI / 2; footWater.position.set(FOOT.x, -0.04, FOOT.z); set.add(footWater);
  // árvores
  const R = rng(42);
  const trees = [];
  const place = (x, z, o) => { if (o.voxel > 0.1 && (Math.hypot(x - 14, z - 22 * -1) < 8 || Math.hypot(x - 22, z + 46) < 7)) return null; const t = makeTree(Math.floor(R() * 1e6), o); t.name = 'tree'; t.position.set(x, groundH(x, z) - 0.1, z); t.rotation.y = R() * 6.28; set.add(t); trees.push(t); return t; };
  // perto, atrás do cão
  place(-2.6, -3.2, { voxel: 0.05, height: 12, radius: 0.45, type: 'cypress', cast: true });
  place(-0.6, -6.5, { voxel: 0.06, height: 14, radius: 0.5 });
  place(1.6, -9.5, { voxel: 0.07, height: 13 });
  place(-4.5, 0.5, { voxel: 0.06, height: 11, radius: 0.5, type: 'cypress' });
  place(-5.5, -8, { voxel: 0.08, height: 15 });
  place(-1.8, 3.8, { voxel: 0.06, height: 10, type: 'cypress' });
  // margem oposta e fundo
  for (let i = 0; i < 55; i++) {
    const z = -6 - R() * 120, x = riverX(z) + riverHalf(z) + 2.5 + R() * 40;
    place(x, z, { voxel: 0.16 + Math.min(0.3, -z / 300) });
  }
  for (let i = 0; i < 35; i++) {
    const z = -12 - R() * 110, x = riverX(z) - riverHalf(z) - 4 - R() * 40;
    place(x, z, { voxel: 0.18 + Math.min(0.3, -z / 300) });
  }
  // samambaias
  const ferns = [];
  const fernAt = (x, z, sz, seed) => { const f = makeFern(seed, { size: sz }); f.name = 'fern'; f.position.set(x, groundH(x, z) - 0.01, z); f.rotation.y = seed; set.add(f); ferns.push(f); };
  fernAt(-0.75, 1.25, 0.42, 1); fernAt(0.35, -0.75, 0.5, 2); fernAt(2.05, -0.55, 0.38, 3); fernAt(-0.9, -0.4, 0.55, 4);
  fernAt(1.25, 1.75, 0.36, 5); fernAt(-0.2, 2.1, 0.5, 6); fernAt(2.4, 1.4, 0.3, 7); fernAt(-1.6, -1.6, 0.6, 8);
  fernAt(1.1, -1.9, 0.55, 9); fernAt(-2.2, 0.9, 0.6, 10); fernAt(2.9, -1.6, 0.4, 11);
  // tronco caído
  const log = makeLog(5, 2.3, 0.22, 0.025); log.position.set(1.7, groundH(1.7, -1.5) - 0.04, -1.5); log.rotation.y = -0.7; set.add(log);
  // pedras na beira
  for (const [x, z, r] of [[3.1, 0.6, 0.16], [3.4, -0.5, 0.12], [2.9, 1.8, 0.2], [3.8, 1.2, 0.1], [3.3, -1.6, 0.18]]) { const k = makeRock(Math.floor(x * 100), r); k.position.set(x, groundH(x, z) + 0.02, z); set.add(k); }
  // nuvens
  set.add(makeClouds(4, 10));
  // T. rex
  const trex = buildTrex({ voxel: 0.1 });
  set.add(trex.root); trex.root.position.set(24, 0, -42); trex.root.rotation.y = 0.5;
  scene.add(set);
  return { set, water, wmat, footWater, fmat, trees, ferns, log, trex, groundH };
}
