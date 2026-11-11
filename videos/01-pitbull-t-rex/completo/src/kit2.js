// Utilidades dos blocos novos: chão dos cenários, partículas (respingos, terra, cheiro, moscas, ondas), cartões e objetos criados sob demanda.
import * as F from '/videos/engine/lib/fauna.js';
import { makeLog } from '/videos/engine/lib/world.js';
import { voxelize, jitter, lerpHex, hash3 } from '/videos/engine/lib/vox.js';
import { fbm } from '/videos/engine/lib/noise.js';

export function makeKit2(K) {
  const { st, W, D, card, makeCard, placeDog, poseDog, lerp, lerp3, clamp, ease } = K;
  if (K.kit2) return K.kit2;
  const O = () => W.sets.orilla, B = () => W.sets.bosque, E = () => W.sets.estudio, CL = () => W.sets.claro;
  const avg = (f, x, z) => (f(x, z) + f(x + 0.12, z) + f(x - 0.12, z) + f(x, z + 0.1) + f(x, z - 0.1)) / 5;
  const gO = (x, z) => avg(O().hO, x, z), gB = (x, z) => avg(B().hB, x, z), gC = (x, z) => avg(CL().hC, x, z);
  // anima água e vento do cenário atual
  const mats = new Map();
  const tick = (T) => {
    const set = W.cur; if (!set) return;
    if (!mats.has(set)) { const L = []; set.group.traverse(o => { const m = o.material; if (!m) return; if (m.userData.u && m.userData.u.uTime) L.push(m.userData.u.uTime); else if (m.userData.uniforms && m.userData.uniforms.uTime && m.userData.uniforms.uWind && m.userData.uniforms.uWind.value > 0) L.push(m.userData.uniforms.uTime); }); mats.set(set, [...new Set(L)]); }
    for (const u of mats.get(set)) u.value = T;
  };
  const win = (k, text) => card(k, () => makeCard([{ text, px: 15, color: 0xeaffea }], { bg: 0x2e7a3a, border: 0x14401c, padX: 6, padY: 5 }));
  const nameCard = (k, name, sub) => card(k, () => makeCard([{ text: name, px: 17, color: 0xe0862f }, { text: sub.toUpperCase(), px: 10 }], { padX: 8, padY: 6, gap: 1.4 }));
  // respingos: t 0..1
  const splash = (n, c, t, seed = 1, r = 0.3) => W.particles(n, (i) => { const a = hash3(i, seed, 1) * 6.28, sp = (0.4 + hash3(i, seed, 2)) * r, up = 0.5 + hash3(i, seed, 3); const k = clamp(t); return { p: [c[0] + Math.cos(a) * sp * k, c[1] + (up * k - 1.6 * k * k) * r * 1.2, c[2] + Math.sin(a) * sp * k], s: 0.012 * (1 - k * 0.6), c: i % 3 ? 0xe8f4f4 : 0xb8d8d8 }; });
  // terra/folhas jogadas para trás em arcos (cíclico)
  const dirt = (n, o, dir, lt, cols, spread = 1) => W.particles(n, (i) => { const ph = (lt * 2.2 + hash3(i, 2, 7)) % 1, sp = (0.3 + hash3(i, 3, 7) * 0.5) * spread; const sx = (hash3(i, 4, 7) - 0.5) * 0.5; return { p: [o[0] + (dir[0] + sx * dir[2]) * sp * ph, o[1] + (0.9 * ph - 1.4 * ph * ph) * 0.5 * spread + 0.02, o[2] + (dir[2] - sx * dir[0]) * sp * ph], s: (0.012 + hash3(i, 5, 7) * 0.012) * (1 - ph * 0.3), c: cols[i % cols.length], rx: ph * 9 + i, ry: ph * 5 }; });
  // cheiro: corrente de partículas até o focinho
  const scent = (n, from, to, lt, cols, spread = 0.2, size = 0.007) => W.particles(n, (i) => { const k = (lt * 0.7 + hash3(i, 9, 1)) % 1; const s = [from[0] + (hash3(i, 9, 2) - 0.5) * spread, from[1] + (hash3(i, 9, 3) - 0.5) * spread * 0.4, from[2] + (hash3(i, 9, 4) - 0.5) * spread]; const q = lerp3(s, to, ease.in(k)); q[1] += Math.sin(k * 6 + i) * 0.01; return { p: q, s: size * (1 - k * 0.5), c: cols[i % cols.length] }; });
  const flies = (n, c, T) => W.particles(n, (i) => { const a = T * (4 + hash3(i, 3, 3) * 4) + i, r = 0.15 + hash3(i, 4, 3) * 0.35; return { p: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a * 1.3) * 0.15 + hash3(i, 5, 3) * 0.2, c[2] + Math.sin(a) * r], s: 0.008, c: 0x15120e }; });
  const rings = (c, t, col) => W.particles(180, (i) => { const L = i % 3, a = (Math.floor(i / 3) / 60) * 6.28, r = ((t * 0.35 + L / 3) % 1); return { p: [c[0] + Math.cos(a) * r * 0.5, c[1] + 0.004, c[2] + Math.sin(a) * r * 0.5], s: 0.008 * (1 - r), c: col }; });
  const orbit = (c, r, h, a, fov, T, sh = 0.002) => K.cam([c[0] + Math.cos(a) * r, c[1] + h, c[2] + Math.sin(a) * r], c, fov, sh, T);
  // objetos criados uma vez, escondidos a cada quadro
  const LZ = new Map();
  const lazy = (key, make, reset) => { if (!LZ.has(key)) { const o = make(); LZ.set(key, o); if (o != null && reset) K.onReset(() => reset(o)); } return LZ.get(key); };
  const dogAt = (g, x, z, yaw, pose) => { placeDog(x, g(x, z), z, yaw); poseDog(D, { t: K.T, ...pose }); };
  const fishInMouth = (show) => { const f = lazy('mouthFish', () => { const q = F.buildFish({ len: 0.2, gar: 0, col: 0x9a9070 }); q.root.position.set(0.22, -0.035, 0); q.root.rotation.set(0, Math.PI / 2, 0.2); D.head.add(q.root); return q; }, (q) => q.root.visible = false); f.root.visible = !!show; F.poseFish(f, { phase: K.T * 4, amp: 0.6 }); };
  const makeDirtPile = () => voxelize((p, x, y, z) => { const d = Math.hypot(p[0] / 0.35, p[2] / 0.28) + p[1] / 0.16 - 1 + (fbm(p[0] * 12, p[2] * 12, 2) - 0.5) * 0.25; return d <= 0 ? jitter(lerpHex(0x4a3420, 0x6a4a28, fbm(p[0] * 20, p[1] * 20 + p[2] * 9, 2)), x, y, z, 0.1) : -1; }, [-0.4, 0, -0.32], [0.4, 0.18, 0.32], 0.014, { cast: true });
  K.kit2 = { O, B, E, CL, gO, gB, gC, tick, win, nameCard, splash, dirt, scent, flies, rings, orbit, lazy, dogAt, fishInMouth, makeLog, makeDirtPile };
  return K.kit2;
}
