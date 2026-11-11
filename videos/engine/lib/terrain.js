// Terreno genérico em anéis de detalhe (perto fino, longe grosso), igual ao cenário do rio do piloto.
import * as THREE from 'three';
import { heightfield, voxelize, jitter, lerpHex, hash3, sd } from './vox.js';
import { fbm, rng } from './noise.js';
const { ell, cap, sph, box, smin } = sd;

export function buildTerrain(hfn, cfn, o = {}) {
  const g = new THREE.Group();
  const cx = o.cx ?? 0, cz = o.cz ?? 0;
  const rings = o.rings ?? [
    { half: 2, s: 0.02, sv: 0.02, chunks: 4 },
    { half: 7, s: 0.05, sv: 0.02, chunks: 6 },
    { half: 28, s: 0.16, sv: 0.03, chunks: 6, tall: true },
    { half: 160, s: 0.9, sv: 0.06, chunks: 8, tall: true },
  ];
  let inner = null;
  for (const r of rings) {
    const x0 = cx - r.half, z0 = cz - r.half, size = (r.half * 2) / r.chunks;
    for (let i = 0; i < r.chunks; i++) for (let j = 0; j < r.chunks; j++) {
      const a0 = x0 + i * size, b0 = z0 + j * size;
      if (inner && a0 >= inner[0] - 1e-6 && b0 >= inner[1] - 1e-6 && a0 + size <= inner[2] + 1e-6 && b0 + size <= inner[3] + 1e-6) continue;
      const m = heightfield(hfn, cfn, a0, b0, a0 + size, b0 + size, r.s, { hole: inner, skirt: 4, sv: r.sv, tallSides: r.tall, mat: { bev: r.s < 0.03 ? 0.7 : 0.8, rough: 0.75 } });
      g.add(m);
    }
    inner = [x0, z0, cx + r.half, cz + r.half];
  }
  return g;
}

// árvore caída com o prato de raízes levantado (e um buraco embaixo)
export function makeRootLog(seed, o = {}) {
  const R = rng(seed), s = o.voxel ?? 0.03, len = o.len ?? 4, rad = o.rad ?? 0.32, plate = o.plate ?? 1.0;
  const roots = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + R() * 0.3; roots.push([Math.cos(a), Math.sin(a), 0.5 + R() * 0.5]); }
  return voxelize((p, x, y, z) => {
    // tronco ao longo de +x a partir do prato em x=0
    let d = cap(p, [0.1, plate * 0.75, 0], [len, rad, 0], rad * 1.05, rad * 0.8);
    // prato de raízes: disco irregular vertical no plano yz em x≈0
    const r = Math.hypot(p[1] - plate * 0.7, p[2]); const ang = Math.atan2(p[1] - plate * 0.7, p[2]);
    const edge = plate * (0.85 + 0.25 * fbm(ang * 2 + seed, 0, 2));
    const disc = Math.max(Math.abs(p[0] + 0.05) - 0.16 - (1 - r / edge) * 0.08, r - edge);
    d = Math.min(d, disc);
    for (const [cx, cy, l] of roots) d = Math.min(d, cap(p, [-0.05, plate * 0.7 + cy * edge * 0.8, cx * edge * 0.8], [-0.25 - l * 0.3, plate * 0.7 + cy * (edge + l * 0.5), cx * (edge + l * 0.5)], 0.05, 0.015));
    if (d > 0) return -1;
    if (disc <= 0 && p[0] < -0.08) return jitter(lerpHex(0x4a3524, 0x2e2216, fbm(p[1] * 6, p[2] * 6, 2)), x, y, z, 0.12); // terra presa nas raízes
    const groove = Math.sin(Math.atan2(p[2], p[1] - rad) * 12 + fbm(p[0] * 2, 0, 1) * 4) > 0.55;
    if (p[1] > rad * 1.6 && fbm(p[0] * 4, p[2] * 4 + 3, 2) > 0.5) return jitter(0x6f8a34, x, y, z, 0.15);
    return jitter(groove ? 0x3e2a1c : 0x5e4330, x, y, z, 0.1);
  }, [-0.8, 0, -plate * 1.4], [len + 0.2, plate * 1.9, plate * 1.4], s, { cast: true });
}

// monte de excremento de dinossauro (com moscas sendo partículas na cena)
export function makeDung(seed = 1, o = {}) {
  const s = o.voxel ?? 0.018, r = o.r ?? 0.45;
  return voxelize((p, x, y, z) => {
    let d = ell(p, [0, 0, 0], [r, r * 0.55, r * 0.85]);
    d = smin(d, ell(p, [0.12, r * 0.35, 0.05], [r * 0.6, r * 0.45, r * 0.5]), 0.08);
    d = smin(d, ell(p, [-0.05, r * 0.6, -0.04], [r * 0.32, r * 0.3, r * 0.3]), 0.06);
    d += (fbm(p[0] * 9 + seed, p[2] * 9 + p[1] * 6, 2) - 0.5) * 0.08;
    if (d > 0) return -1;
    const seeds = hash3(x, y * 3, z) > 0.93;
    return jitter(seeds ? 0x8a7a40 : lerpHex(0x4a3a1e, 0x2e2412, fbm(p[0] * 5, p[1] * 5 + p[2] * 5, 2)), x, y, z, 0.12);
  }, [-r * 1.3, 0, -r * 1.2], [r * 1.3, r * 1.1, r * 1.2], s, { cast: true });
}

// cavalinha / planta baixa com flor (substitui grama, que não existia)
export function makeFlowerBush(seed, o = {}) {
  const R = rng(seed), s = o.voxel ?? 0.02, sz = o.size ?? 0.5, flower = o.flower ?? [0xe8d8a0, 0xd88aa0, 0xf0f0e0][seed % 3];
  const blobs = []; for (let i = 0; i < 7; i++) blobs.push([(R() - 0.5) * sz, sz * (0.35 + R() * 0.4), (R() - 0.5) * sz, sz * (0.28 + R() * 0.15)]);
  return voxelize((p, x, y, z) => {
    let d = 9; for (const b of blobs) d = Math.min(d, sph(p, [b[0], b[1], b[2]], b[3]));
    d = Math.min(d, cap(p, [0, 0, 0], [0, sz * 0.4, 0], 0.03));
    d += (fbm(p[0] * 12 + seed, p[2] * 12 + p[1] * 9, 2) - 0.5) * 0.08;
    if (d > 0) return -1;
    if (d > -s * 1.5 && hash3(x, y, z) > 0.9 && p[1] > sz * 0.4) return flower;
    return jitter(lerpHex(0x3e5a26, 0x6f8a34, p[1] / sz), x, y, z, 0.1);
  }, [-sz * 1.1, 0, -sz * 1.1], [sz * 1.1, sz * 1.2, sz * 1.1], s, { cast: true });
}
