// Bloco 2 (120,6 s → 447,6 s): onde estamos, a pegada, o rio, a primeira água, a fome, os mamíferos, o charco e o esterco.
import * as F from '/videos/engine/lib/fauna.js';
import * as P2 from '/videos/engine/lib/props2.js';
import { FOOT } from '/videos/engine/lib/creta.js';
import { groundH } from './sets.js';
import { makeKit2 } from './kit2.js';

export function addBloco2(K) {
  const { st, W, D, THREE, P, card, stamp, title, label, num, at, fixed, anchor, gy, placeDog, cam, bark, yawTo, noseWorld, mouthWorld, C, trex, water, shadowAt, sunset, person, shot, ease, clamp, lerp, lerp3, seg, poseDog, hash3, makeCard, animCard, subj } = K;
  const X = makeKit2(K);
  const { O, B, E, gO, gB, tick, win, nameCard, splash, dirt, scent, flies, rings, orbit, lazy, dogAt, fishInMouth } = X;

  // ===== onde estamos =====
  shot(120.62, 'mapa', (lt, T) => {
    const k = ease.io(lt / 1.6);
    cam(lerp3([0, 34, 30], [-6, 22, 16], k), lerp3([0, 0, 0], [-10, 0, -4], k), 45, 0.0, T);
    animCard(at(title('donde', ['¿DÓNDE ESTAMOS?']), 0, 36), lt, 0.2);
  }, [[0, 'whoosh'], [0.2, 'pop']]);
  shot(122.23, 'mapa', (lt, T) => {
    const k = ease.io(seg(lt, 0, 3.4));
    const mt = [-12, 0.9, -8.5];
    cam(lerp3([-6, 22, 16], [-10.5, 8.5, 1.5], k), lerp3([-10, 0, -4], mt, k), 45, 0.0, T);
    W.cur.us.position.y = 0;
    const pin = ease.back(seg(lt, 0.4, 0.8));
    W.particles(140, (i) => { if (i < 60) { const a = i / 60 * Math.PI * 2, r = 0.35; return { p: [mt[0] + Math.cos(a) * r * pin, mt[1] + 1.6 * pin, mt[2] + Math.sin(a) * r * pin], s: 0.22 * pin, c: 0xc8322b }; } if (i < 80) return { p: [mt[0], mt[1] + (i - 60) / 20 * 1.4 * pin, mt[2]], s: 0.12 * pin, c: 0xf3e7d6 }; const a = (i - 80) / 60 * Math.PI * 2, r = (lt * 1.5 + (i % 3) * 0.6) % 2.5; return { p: [mt[0] + Math.cos(a) * r * 2, mt[1] + 0.1, mt[2] + Math.sin(a) * r * 2], s: 0.12 * (1 - r / 2.5) * pin, c: 0xffe08a }; });
    animCard(anchor(stamp('hellcreek', 'HELL CREEK', 18), mt, 0, 26), lt, 0.5);
    animCard(at(label('montana', 'MONTANA · ESTADOS UNIDOS', 13), 0, -38), lt, 1.6);
  }, [[0.4, 'pop'], [0.5, 'stamp'], [1.6, 'pop']]);
  shot(126.19, 'mapa', (lt, T) => {
    const d = W.cur.dio, k = lt / 4.0;
    W.cur.car.position.set(0.6 + 0.12, 0.06, lerp(6, -6, k)); W.cur.car.rotation.y = Math.PI / 2;
    cam(lerp3([203.5, 2.6, 6.5], [201.5, 1.5, 1.0], ease.io(k)), lerp3([200.4, 0, 2], [200.2, 0, -3], ease.io(k)), 40, 0.002, T);
    animCard(at(stamp('hoy', 'HOY', 18), -66, 36), lt, 0.1);
    animCard(at(label('pasto', 'PASTO SECO', 13), -60, -30), lt, 0.6);
    animCard(at(label('rancho', 'RANCHOS', 13), 0, -30), lt, 1.6);
    animCard(at(label('carretera', 'CARRETERAS LARGUÍSIMAS', 13), 52, -30), lt, 2.4);
  }, [[0, 'whoosh'], [0.1, 'stamp'], [0.6, 'pop'], [1.6, 'pop'], [2.4, 'pop']]);
  shot(130.19, 'mapa', (lt, T) => {
    const k = lt / 3.95;
    cam(lerp3([236, 7, 8], [238.5, 3.2, 3], ease.io(k)), lerp3([239, 0, 0], [240.5, 0, -2], ease.io(k)), 42, 0.002, T);
    if (lt < 0.25) st.veil.material.opacity = 1 - lt / 0.25, st.veil.material.color.set(0xffffff);
    animCard(at(stamp('antes', 'HACE 66 MILLONES DE AÑOS', 15), 0, 38), lt, 0.3);
    animCard(at(label('rios', 'RÍOS', 13), -52, -32), lt, 2.6);
  }, [[0, 'rise'], [0.3, 'stamp'], [2.6, 'pop']]);
  shot(134.13, 'mapa', (lt, T) => {
    const k = ease.io(lt / 3.75);
    cam(lerp3([238.5, 3.2, 3], [243.5, 2.2, 3.5], k), lerp3([240.5, 0, -2], [245.8, 0, -1.5], k), 42, 0.002, T);
    animCard(anchor(label('pantanos', 'PANTANOS', 12), [240.5, 0.3, -1.0], 0, 10), lt, 0.1);
    animCard(anchor(label('bosques', 'BOSQUES HÚMEDOS', 12), [243.5, 0.6, 1.0], 0, 10), lt, 0.8);
    animCard(anchor(label('mar', 'MAR INTERIOR', 12), [246.8, 0.2, 0], 0, 10), lt, 2.2);
  }, [[0.1, 'pop'], [0.8, 'pop'], [2.2, 'pop'], [2.0, 'trickle']]);
  shot(137.88, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const k = lt / 2.45;
    cam(lerp3([2.6, 0.45, 0.2], [1.8, 0.5, 0.9], ease.io(k)), lerp3([0.0, 0.2, 2.2], [-0.8, 0.25, 2.6], ease.io(k)), 44, 0.004, T);
    animCard(at(label('helechos', 'HELECHOS', 14), -60, -32), lt, 0.15);
    animCard(at(label('flores', 'ÁRBOLES CON FLORES', 14), 52, -32), lt, 1.3);
  }, [[0, 'whoosh'], [0.15, 'pop'], [1.3, 'pop']]);
  shot(140.32, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false;
    const k = lt / 2.5;
    cam(lerp3([-12, 0.25, -9], [-8, 0.35, -9.5], ease.io(k)), [-9, 1.5, -14.5], 42, 0.005, T);
    animCard(at(label('raices', 'RAÍCES EN EL AGUA', 14), 0, -36), lt, 0.4);
  }, [[0.4, 'pop'], [0, 'trickle']]);
  shot(142.82, 'orilla', (lt, T) => {
    tick(T);
    const x = 9.5, z = -1.2;
    dogAt(gO, x, z, -0.4, { ears: 0.7, headPitch: 0.25 + Math.sin(lt * 2.2) * 0.04, wag: 0.5 });
    D.body.scale.set(1, 1 + Math.max(0, Math.sin(lt * 2.2)) * 0.03, 1 + Math.max(0, Math.sin(lt * 2.2)) * 0.05);
    cam(lerp3([x + 1.0, 0.5, z - 1.3], [x + 0.85, 0.48, z - 1.15], lt / 2.8), [x + 0.1, 0.35, z], 38, 0.003, T);
    const n = noseWorld();
    W.particles(80, (i) => { const kk = ((lt * 0.6 + hash3(i, 3, 1)) % 1); return { p: [n.x + 0.5 * (1 - kk) + (hash3(i, 3, 2) - 0.5) * 0.3 * (1 - kk), n.y + (hash3(i, 3, 3) - 0.5) * 0.25 * (1 - kk), n.z + (hash3(i, 3, 4) - 0.5) * 0.4 * (1 - kk)], s: 0.006, c: 0xe8f4ff }; });
    animCard(at(win('aire', '✓ EL AIRE SE PUEDE RESPIRAR'), 0, -38), lt, 0.6);
  }, [[0.6, 'ding'], [0.2, 'sniff']]);
  shot(145.60, 'bosque', (lt, T) => {
    tick(T);
    const x = 0.6, z = 1.6;
    dogAt(gB, x, z, -1.9, { gait: 'walk', phase: lt * 1.1, ears: 0.6, wag: 0.7, jaw: 0.25, pant: 1 });
    D.root.position.x += Math.cos(-1.9) * lt * 0.18; D.root.position.z -= Math.sin(-1.9) * lt * 0.18;
    const p = D.root.position;
    cam(lerp3([p.x + 1.4, 0.5, p.z + 0.6], [p.x + 1.2, 0.45, p.z + 0.9], lt / 3.5), [p.x, 0.3, p.z], 38, 0.004, T);
    animCard(at(win('pulmones', '✓ PULMONES: SIN DIFERENCIA'), 0, -38), lt, 0.8);
  }, [[0.8, 'ding']]);
  shot(149.14, 'orilla', (lt, T) => {
    tick(T);
    const x = 9.6, z = 0.9;
    dogAt(gO, x, z, -1.2, { ears: 0.3, headPitch: -0.55 * ease.io(seg(lt, 0, 0.6)), sniff: 0.4, wag: 0.1 });
    cam(lerp3([x + 0.8, 0.9, z + 0.8], [x + 0.65, 0.8, z + 0.7], lt / 2.3), [x, 0.05, z - 0.2], 40, 0.003, T);
    animCard(at(stamp('nopasto', 'NO HAY PASTO', 18), 0, -36), lt, 0.9);
  }, [[0.9, 'stamp']]);
  shot(151.46, 'rua', (lt, T) => {
    placeDog(1.8, 0.0, 0.8, 0.3);
    poseDog(D, { t: T, roll: 1, rollSpeed: 8, ears: 0.6, wag: 1 });
    cam(lerp3([2.9, 0.6, 1.6], [2.75, 0.55, 1.45], lt / 2.6), [1.75, 0.15, 0.8], 36, 0.004, T);
    animCard(at(label('cesped', 'NI UN METRO DE CÉSPED', 14), 0, -38), lt, 0.5);
    W.particles(40, (i) => { const kk = (lt * 1.2 + hash3(i, 2, 2)) % 1; return { p: [1.8 + (hash3(i, 1, 2) - 0.5) * 0.6, 0.02 + kk * 0.25, 0.8 + (hash3(i, 3, 2) - 0.5) * 0.4], s: 0.01 * (1 - kk), c: 0x6aa83a, rx: T * 4 + i }; });
  }, [[0, 'whoosh'], [0.5, 'pop']]);
  shot(154.02, 'orilla', (lt, T) => {
    tick(T);
    const x = 9.6, z = 0.9;
    dogAt(gO, x, z, -1.4, { sit: 1, ears: 0, tailDown: 1, headPitch: -0.3 });
    const k = ease.io(lt / 2.8);
    cam(lerp3([x + 0.6, 0.5, z - 1.6], [x + 0.45, 0.45, z - 1.15], k), [x, 0.3, z], 36, 0.002, T);
    animCard(at(stamp('tragedia', 'CASI UNA TRAGEDIA', 16), 0, 36), lt, 1.1);
  }, [[1.1, 'stamp']]);

  // ===== a pegada =====
  shot(156.80, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.06; D.root.visible = false;
    const c = Math.cos(FOOT.ang), s = Math.sin(FOOT.ang);
    const rk = ease.back(seg(lt, 0.7, 1.2));
    let r = W.cur.footRuler; if (!r) { r = W.cur.footRuler = P.buildRuler(0.8); C().set.add(r); }
    r.visible = rk > 0.01; r.rotation.order = 'YXZ'; r.rotation.set(-Math.PI / 2, FOOT.ang + Math.PI, 0); r.scale.set(1.3, rk, 1.3);
    r.position.set(FOOT.x + 0.36 * c - 0.26 * s, groundH(FOOT.x + 0.36 * c, FOOT.z - 0.36 * s) + 0.012, FOOT.z - 0.36 * s - 0.26 * c);
    cam(lerp3([0.62, 1.55, 0.95], [0.6, 1.35, 0.85], lt / 3.3), [0.6, 0, 0.5], 40, 0.002, T);
    animCard(at(label('huella', 'LA HUELLA', 14), -60, 34), lt, 0.1);
    if (rk > 0.01) animCard(anchor(label('80cm2', '≈ 80 CM DE LARGO', 13), [FOOT.x + 0.35, 0.02, FOOT.z - 0.35], 0, 12), lt, 0.9);
  }, [[0.1, 'pop'], [0.7, 'tick'], [0.9, 'pop']]);
  shot(160.14, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.06; D.root.visible = false; if (W.cur.footRuler) W.cur.footRuler.visible = false;
    const c = Math.cos(FOOT.ang), s = Math.sin(FOOT.ang);
    const toe = (u, v) => [FOOT.x + u * c + v * s, 0.02, FOOT.z - u * s + v * c];
    cam(lerp3([1.15, 0.9, 1.1], [1.05, 0.8, 0.95], lt / 1.9), [0.62, -0.02, 0.45], 40, 0.002, T);
    [[0.52, 0], [0.36, 0.3], [0.36, -0.3]].forEach(([v, u], i) => animCard(anchor(card('dedo' + i, () => makeCard([{ text: String(i + 1), px: 16, color: 0xe0862f }], { padX: 5, padY: 4 })), toe(u, v), 0, 8), lt, 0.3 + i * 0.35));
    animCard(at(label('tresdedos', 'TRES DEDOS', 14), 0, -38), lt, 1.3);
  }, [[0.3, 'pop'], [0.65, 'pop'], [1.0, 'pop'], [1.3, 'ding']]);
  shot(162.05, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.06; D.root.visible = false;
    const car = lazy('cretaCar', () => { const c = P2.buildCar(0x3a6aa0, 0.05); c.scale.setScalar(0.32); C().set.add(c); return c; }, (c) => c.visible = false);
    const fall = seg(lt, 0.9, 1.45);
    car.visible = true; car.position.set(FOOT.x + 0.2, lerp(2.4, 0.0, ease.in(fall)), FOOT.z - 0.1); car.rotation.set(0.1 * (1 - fall), FOOT.ang, 0.2 * (1 - fall));
    const hit = lt > 1.45;
    cam(lerp3([1.7, 0.8, 1.9], [1.6, 0.75, 1.75], lt / 2.9), [0.65, 0.25, 0.4], 42, hit ? 0.03 * Math.exp(-(lt - 1.45) * 4) : 0.002, T);
    if (hit) dustBurst(lt - 1.45, [FOOT.x + 0.2, 0.05, FOOT.z - 0.1]);
    animCard(at(label('auto', 'COMO SI CAYERA UN AUTO', 14), 0, -38), lt, 0.3);
  }, [[0.9, 'whoosh'], [1.45, 'burst'], [1.47, 'rumble'], [0.3, 'pop']]);
  function dustBurst(t, c) { W.particles(160, (i) => { const a = hash3(i, 1, 5) * Math.PI * 2, sp = 0.3 + hash3(i, 2, 5) * 0.9, k = Math.min(1, t * 1.2); return { p: [c[0] + Math.cos(a) * sp * k, c[1] + Math.sin(k * Math.PI) * 0.25 * hash3(i, 3, 5) + k * 0.05, c[2] + Math.sin(a) * sp * k], s: 0.03 * (1 - k * 0.8), c: i % 2 ? 0x8a6a4a : 0xa88a64, rx: t * 3 + i }; }); }
  shot(164.95, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.06;
    placeDog(0.15, gy(0.15, 0.32), 0.32, 0.1);
    poseDog(D, { t: T, sniff: 1, ears: 0.6, headPitch: -0.15 });
    const n = noseWorld();
    cam([n.x + 0.25, n.y + 0.12, n.z + 0.55], [n.x + 0.05, n.y - 0.08, n.z], 34, 0.003, T);
    scent(50, [n.x + 0.35, 0.0, n.z + 0.05], [n.x + 0.01, n.y, n.z], lt, [0xf6e3c4, 0xffc070], 0.25);
  }, [[0.1, 'sniff'], [0.7, 'sniff']]);
  shot(166.23, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.15, gy(0.15, 0.32), 0.32, 0.1);
    const up = ease.out(seg(lt, 0.9, 1.3));
    poseDog(D, { t: T, sniff: 1 - up, ears: 0.4 + up * 0.6, headPitch: up * 0.15 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.32, n.y + 0.04, n.z + 0.22], [n.x + 0.24, n.y + 0.03, n.z + 0.16], lt / 2.3), [n.x - 0.05, n.y + 0.02, n.z], 30, 0.002, T);
    scent(70, [n.x + 0.45, n.y - 0.1, n.z], [n.x + 0.01, n.y, n.z], lt, [0x9a6ad0, 0x6ad09a, 0xd0a06a], 0.3);
    animCard(at(label('nunca', 'UN OLOR NUNCA SENTIDO', 13), -56, -36), lt, 0.5);
  }, [[0, 'sniff'], [0.9, 'tension'], [0.5, 'pop']]);
  shot(168.51, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.5);
    poseDog(D, { t: T, sniff: 0.5, ears: 0.6, headYaw: Math.sin(lt * 3) * 0.3 });
    cam(lerp3([1.55, 0.55, 1.15], [1.4, 0.52, 1.0], lt / 3.4), [0, 0.3, 0], 36, 0.003, T);
    const no = (k, t, txt, y) => animCard(at(card(k, () => makeCard([{ text: txt, px: 14, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 4 })), -58, y), lt, t);
    no('nogato', 0.05, '✗ GATO', 26); no('nocartero', 0.95, '✗ CARTERO', 8); no('novecino', 2.0, '✗ PERRO DEL VECINO', -10);
  }, [[0.05, 'pop'], [0.95, 'pop'], [2.0, 'pop']]);
  shot(171.97, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.15, gy(0.15, 0.32), 0.32, 0.1);
    poseDog(D, { t: T, ears: 1, headPitch: 0.25, headYaw: -0.2, tailDown: 0.3 });
    const k = ease.io(lt / 1.23);
    cam(lerp3([0.6, 0.06, 1.1], [0.55, 0.12, 1.05], k), lerp3([0.3, 0.35, 0.3], [0.2, 0.5, 0.2], k), 50, 0.004, T);
    animCard(at(stamp('grande', 'ALGO GRANDE', 18), 0, 34), lt, 0.25);
  }, [[0.25, 'stamp'], [0, 'rumble']]);
  shot(173.20, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.0, gy(0.0, 0.45), 0.45, 0.4);
    poseDog(D, { t: T, ears: 0.8, headYaw: -0.6 * ease.io(seg(lt, 0.5, 1.5)), headPitch: 0.05 });
    cam(lerp3([-0.6, 0.7, 1.6], [-0.9, 0.9, 1.8], lt / 3.3), [1.0, 0.1, 0.0], 44, 0.003, T);
    trail(lt, [[FOOT.x, FOOT.z], [1.6, -0.6], [2.6, -2.2], [3.2, -4.5]], 0xffc070);
  }, [[0.3, 'sniff'], [1.5, 'whoosh']]);
  function trail(lt, pts, col, n = 160, off = 0) { W.particles(n, (i) => { const u = ((i / n) + lt * 0.12 + off) % 1; const f = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(f)), w = f - j; const x = lerp(pts[j][0], pts[j + 1][0], w), z = lerp(pts[j][1], pts[j + 1][1], w); const vis = clamp(lt * 1.5 - u * 2); return { p: [x + (hash3(i, 4, 1) - 0.5) * 0.2, groundH(x, z) + 0.05 + Math.sin(lt * 3 + i) * 0.02, z + (hash3(i, 4, 2) - 0.5) * 0.2], s: 0.014 * vis, c: col }; }); }
  shot(176.48, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.0, gy(0.0, 0.45), 0.45, 0.4);
    poseDog(D, { t: T, ears: 0.8, headYaw: -0.4 + Math.sin(lt * 1.5) * 0.5 });
    const k = ease.io(lt / 5.2);
    cam(lerp3([-1.5, 2.2, 3.2], [-3.0, 5.5, 5.5], k), lerp3([0.8, 0, -0.5], [2, 0, -3], k), 44, 0.002, T);
    W.particles(420, (i) => { const L = i % 3, u = ((i / 140) + lt * (0.05 + L * 0.02) + L * 0.3) % 1; const z = lerp(4, -14, u), x = 3.2 + Math.sin(z * 0.3 + L) * 0.8 - L * 0.6 + (riverXlike(z)); const vis = clamp(lt * 0.8 - L * 0.4); return { p: [x, groundH(x, z) + 0.06, z], s: 0.035 * vis, c: [0xffc070, 0xff9a50, 0xffe0a0][L] }; });
    animCard(at(label('muchas', 'VA Y VIENE · MUCHAS VECES', 14), 0, -38), lt, 2.0);
  }, [[2.0, 'pop'], [0, 'whoosh']]);
  const riverXlike = (z) => -1.2 + Math.sin(z * 0.022 + 0.25) * 1.5;
  shot(181.72, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.1, gy(0.1, 0.45), 0.45, -0.2);
    poseDog(D, { t: T, ears: 0.8, headRoll: 0.35 * ease.io(seg(lt, 0.3, 0.8)), headYaw: 0.4 });
    cam(lerp3([0.55, 0.42, 1.45], [0.5, 0.4, 1.3], lt / 2), [0.3, 0.35, 0.4], 34, 0.002, T);
    animCard(at(label('noentiende', '¿?', 18), -40, 30), lt, 0.6);
  }, [[0.6, 'pop']]);
  shot(183.69, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    placeDog(0.1, gy(0.1, 0.45), 0.45, -0.3);
    const turn = ease.io(seg(lt, 0.2, 1.0));
    poseDog(D, { t: T, ears: 0.6, headYaw: 0.55 * turn, jaw: 0.35 * turn, pant: 1, wag: 0.3 });
    cam(lerp3([0.75, 0.42, 1.5], [0.65, 0.4, 1.35], lt / 3.04), [0.3, 0.35, 0.35], 34, 0.003, T);
    animCard(at(stamp('sed', 'TIENE SED', 18), -54, -34), lt, 2.2);
  }, [[2.2, 'stamp']]);

  // ===== o rio, o lugar mais perigoso =====
  shot(186.73, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    cam(lerp3([10, 2.2, 3.5], [9, 2.6, 4.2], lt / 2.2), [6, 0, -6], 44, 0.002, T);
    animCard(at(stamp('prob1', 'PROBLEMA #1: AGUA', 18), 0, 34), lt, 0.2);
  }, [[0.2, 'stamp']]);
  function posCrocs(T, o = {}) {
    const S = O();
    const cr = S.croc, br = S.brach, ch = S.champ, ch2 = S.champ2;
    const swim = (A, x0, z0, dir, sp, ph) => { const d = (T * sp) % 40 - 20; A.root.position.x = x0 + Math.cos(dir) * d; A.root.position.z = z0 - Math.sin(dir) * d; A.root.rotation.y = dir; F.poseCroc(A, { phase: T * 0.5 + ph, swim: 1, t: T }); };
    if (!o.keepCroc) swim(cr, 1.6, -6.2, 0.05, 0.25, 0);
    if (!o.keepBrach) swim(br, -5, -9.5, Math.PI + 0.05, 0.2, 1);
    swim(ch, 6, -9, 0.1, 0.35, 2); swim(ch2, -1.5, -11, Math.PI - 0.1, 0.3, 3);
  }
  shot(188.96, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    cam(lerp3([9, 2.8, -1.5], [7.5, 3.4, -1.2], lt / 2.3), [2, 0, -8], 46, 0.002, T);
    animCard(at(label('unico', 'EL ÚNICO LUGAR CON AGUA', 14), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(191.25, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    const k = lt / 4.0;
    cam(lerp3([8, 0.06, -3.4], [4, 0.08, -4.2], k), lerp3([4, 0.0, -8], [0, 0.0, -9], k), 46, 0.004, T);
    animCard(at(stamp('peligroso', 'EL LUGAR MÁS PELIGROSO', 16), 0, 36), lt, 1.6);
  }, [[0, 'tension'], [1.6, 'stamp']]);
  shot(195.27, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    for (const e of O().edmos) { e.root.visible = true; F.poseEdmonto(e, { graze: 0.8, t: T + e.root.position.x }); }
    cam(lerp3([-4.5, 3.2, -7.5], [-4.8, 3.0, -8.2], lt / 2.6), [-4.6, 1.2, -15.4], 40, 0.002, T);
    animCard(at(label('beber', 'TODOS TIENEN QUE BEBER', 14), 0, -38), lt, 0.5);
  }, [[0.5, 'pop']]);
  shot(197.91, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T, { keepCroc: 1 });
    const cr = O().croc; const rise = ease.io(seg(lt, 0.3, 1.8));
    cr.root.position.set(8.5, -0.08 - 0.29 - (1 - rise) * 0.25, -4.2); cr.root.rotation.y = 2.8; F.poseCroc(cr, { swim: 0.4, phase: T * 0.3, t: T });
    const e = [8.5 + Math.cos(2.8) * 0.85, -0.05, -4.2 - Math.sin(2.8) * 0.85];
    cam(lerp3([e[0] - 0.9, 0.0, e[2] + 0.9], [e[0] - 0.7, 0.02, e[2] + 0.7], lt / 2.5), [e[0], -0.04, e[2]], 32, 0.002, T);
    rings(e, lt, 0xd8e8e8);
  }, [[0.3, 'bubble'], [1.2, 'tension']]);
  shot(200.42, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T, { keepCroc: 1 });
    const cr = O().croc; const x = 9 - lt * 0.35, z = -4.6;
    cr.root.position.set(x, -0.08 - 0.27, z); cr.root.rotation.y = Math.PI; F.poseCroc(cr, { swim: 1, phase: T * 0.7, t: T });
    cam(lerp3([x - 1.6, 0.6, z + 2.2], [x - 1.3, 0.55, z + 2.0], lt / 3.8), [x - 0.4, -0.05, z], 40, 0.003, T);
    animCard(at(label('parientes', 'PARIENTES DE COCODRILOS Y CAIMANES', 13), 0, -38), lt, 0.6);
  }, [[0.6, 'pop'], [0, 'splash']]);
  shot(204.18, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T, { keepCroc: 1 });
    const cr = O().croc; cr.root.position.set(-3.2, O().hO(-3.2, -2.1) + 0.0, -2.1); cr.root.rotation.y = 0.15; F.poseCroc(cr, { swim: 0, jaw: 0.25 + Math.sin(lt) * 0.05, t: T });
    const rk = ease.back(seg(lt, 1.6, 2.1));
    const r = lazy('crocRuler', () => { const rr = P.buildRuler(1.6); O().group.add(rr); return rr; }, (rr) => rr.visible = false);
    r.visible = rk > 0.01; r.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); r.scale.set(1.6, rk * 2.0, 1.6); r.position.set(-3.2 - 1.75, O().hO(-3.2, -1.7) + 0.02, -1.62);
    cam(lerp3([-2.0, 1.1, 0.3], [-2.4, 1.0, 0.1], lt / 4), [-3.2, 0.1, -2.1], 44, 0.002, T);
    animCard(at(nameCard('boreal', 'BOREALOSUCHUS', 'pariente de los cocodrilos'), -50, 34), lt, 0.2);
    if (rk > 0.01) animCard(at(label('3m', 'MÁS DE 3 M', 14), 50, -36), lt, 2.1);
  }, [[0.2, 'pop'], [1.6, 'tick'], [2.1, 'pop']]);
  shot(208.18, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T, { keepBrach: 1 });
    const b = O().brach; b.root.position.set(2.6, O().hO(2.6, -2.0) - 0.01, -2.0); b.root.rotation.y = -2.7; F.poseCroc(b, { swim: 0, jaw: 0.1, t: T });
    cam(lerp3([1.0, 0.5, -0.9], [1.2, 0.45, -1.1], lt / 2.6), [2.1, 0.12, -1.75], 40, 0.002, T);
    animCard(at(nameCard('brach', 'BRACHYCHAMPSA', 'dientes de atrás anchos'), -50, 34), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(210.80, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T, { keepBrach: 1 });
    const b = O().brach; b.root.position.set(2.6, O().hO(2.6, -2.0) - 0.01, -2.0); b.root.rotation.y = -2.7;
    const bite = Math.max(0, Math.sin(clamp((lt - 0.6) / 1.6) * Math.PI * 2));
    F.poseCroc(b, { swim: 0, jaw: 0.9 * (1 - bite), t: T });
    const sh = lazy('shellBits', () => { const t = F.buildTurtle({ voxel: 0.01 }); t.root.scale.setScalar(0.55); O().group.add(t.root); return t; }, (t) => t.root.visible = false);
    const mouth = [2.6 + Math.cos(-2.7) * 0.75, O().hO(2.6, -2.0) + 0.12, -2.0 - Math.sin(-2.7) * 0.75];
    sh.root.visible = lt < 1.25; sh.root.position.set(mouth[0], mouth[1] - 0.05, mouth[2]); sh.root.rotation.set(0.3, 1, 0.4);
    if (lt > 1.25) W.particles(70, (i) => { const k = clamp((lt - 1.25) * 1.2); const a = hash3(i, 1, 8) * 6.28; return { p: [mouth[0] + Math.cos(a) * k * 0.3, mouth[1] + Math.sin(k * 3) * 0.12 * hash3(i, 2, 8), mouth[2] + Math.sin(a) * k * 0.3], s: 0.02 * (1 - k * 0.5), c: i % 2 ? 0x4c4a2c : 0x6a6236, rx: i + k * 4 }; });
    cam(lerp3([mouth[0] - 0.75, mouth[1] + 0.22, mouth[2] + 0.6], [mouth[0] - 0.62, mouth[1] + 0.2, mouth[2] + 0.5], lt / 3), mouth, 34, lt > 1.25 && lt < 1.5 ? 0.02 : 0.002, T);
    animCard(at(label('caparazon', 'ROMPE CAPARAZONES', 14), 0, -38), lt, 1.3);
  }, [[1.25, 'snap'], [1.27, 'burst'], [1.3, 'pop']]);
  shot(213.86, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    const c = O().champ; const x = 3 + lt * 0.4, z = -5.2;
    c.root.position.set(x, -0.08 - 0.155, z); c.root.rotation.y = 0.05; F.poseCroc(c, { swim: 1, phase: T * 0.9, t: T });
    cam(lerp3([x - 0.4, 0.45, z + 1.5], [x + 0.2, 0.4, z + 1.3], lt / 4), [x + 0.4, -0.05, z], 38, 0.003, T);
    animCard(at(nameCard('champ', 'CHAMPSOSAURIO', 'hocico largo y delgado'), -50, 34), lt, 0.2);
  }, [[0.2, 'pop'], [0, 'splash']]);
  shot(217.85, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    const c = O().champ; const x = 4.6, z = -5.2;
    c.root.position.set(x, -0.08 - 0.155, z); c.root.rotation.y = 0.05; F.poseCroc(c, { swim: 0.3, phase: T * 0.4, t: T });
    const pen = lazy('pencil', () => { const p = P2.buildPencil(0.5); O().group.add(p); return p; }, (p) => p.visible = false);
    const k = ease.back(seg(lt, 0.3, 0.7));
    pen.visible = k > 0.01; pen.scale.setScalar(Math.max(0.01, k)); pen.position.set(x + 0.42, 0.05, z + 0.12); pen.rotation.set(0, 0.05, 0);
    cam(lerp3([x + 0.75, 0.4, z + 0.8], [x + 0.7, 0.35, z + 0.7], lt / 1.8), [x + 0.65, 0.0, z + 0.05], 34, 0.002, T);
    animCard(at(stamp('lapiz', 'UN LÁPIZ CON DIENTES', 16), 0, -36), lt, 0.5);
  }, [[0.3, 'pop'], [0.5, 'stamp']]);
  shot(219.65, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false; posCrocs(T);
    const c = O().champ; const x = 4.6, z = -5.2;
    const snap = seg(lt, 1.0, 1.25);
    c.root.position.set(x, -0.08 - 0.155, z); c.root.rotation.y = 0.05; F.poseCroc(c, { swim: 0.3, phase: T * 0.4, t: T, jaw: lt < 1.0 ? ease.io(seg(lt, 0.6, 1.0)) * 0.8 : 0.8 * (1 - snap), headYaw: -0.15 * snap });
    const f = lazy('jumpFish', () => { const q = F.buildFish({ len: 0.22, gar: 0 }); O().group.add(q.root); return q; }, (q) => q.root.visible = false);
    const j = seg(lt, 0.3, 1.1);
    f.root.visible = lt < 1.15; f.root.position.set(x + 0.75 - j * 0.1, -0.08 + Math.sin(j * Math.PI) * 0.25, z + 0.35 - j * 0.3); f.root.rotation.set(0, 2.2, Math.cos(j * Math.PI) * 0.8); F.poseFish(f, { phase: T * 3 });
    cam(lerp3([x + 1.3, 0.35, z + 1.4], [x + 1.15, 0.32, z + 1.25], lt / 3.3), [x + 0.6, 0.0, z + 0.15], 38, 0.003, T);
    if (lt > 1.15) splash(60, [x + 0.65, -0.07, z + 0.05], lt - 1.15, 3);
    animCard(at(win('peces', '✓ PECES'), -50, -36), lt, 1.4);
    animCard(at(card('noperro', () => makeCard([{ text: '✗ PERROS', px: 15, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 5 })), 50, -36), lt, 2.3);
  }, [[0.3, 'splash'], [1.0, 'snap'], [1.4, 'ding'], [2.3, 'pop']]);
  shot(222.93, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 10.6, -1.9, Math.PI / 2 + 0.2, { ears: 0.9, headRoll: 0.3 * ease.io(seg(lt, 0.3, 0.8)), headPitch: 0.05, wag: 0.4 });
    cam(lerp3([11.5, 0.42, -3.0], [11.35, 0.4, -2.9], lt / 1.9), [10.6, 0.33, -2.0], 36, 0.002, T);
    animCard(at(label('nosabe', 'ÉL NO LO SABE', 14), 0, -38), lt, 0.4);
  }, [[0.4, 'pop']]);
  shot(224.85, 'orilla', (lt, T) => {
    tick(T); posCrocs(T, { keepCroc: 1 });
    const cr = O().croc; cr.root.position.set(10.0, -0.08 - 0.3, -5.0); cr.root.rotation.y = 0.4; F.poseCroc(cr, { swim: 0.2, phase: T * 0.2, t: T });
    dogAt(gO, 10.6, -1.9, Math.PI / 2 + 0.2, { ears: 0.9, headPitch: -0.05 });
    cam(lerp3([11.6, 1.1, -0.6], [11.5, 1.0, -0.8], lt / 2.8), [10.2, -0.1, -5], 40, 0.002, T);
    const tags = [[10.0, -5.0], [9.0, -4.5], [12.0, -6.0]];
    lazy('logs2', () => { const L = [makeLogAt(9.0, -4.5, 0.3), makeLogAt(12.0, -6.0, 2.0)]; return L; }, (L) => L.forEach(l => l.visible = false)).forEach(l => l.visible = true);
    tags.forEach(([x, z], i) => animCard(anchor(card('tronco' + i, () => makeCard([{ text: '¿TRONCO?', px: 11, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xe0862f, padX: 4, padY: 3, cell: 1.2 })), [x, 0.15, z], 0, 8), lt, 0.6 + i * 0.5));
  }, [[0.6, 'pop'], [1.1, 'pop'], [1.6, 'pop']]);
  function makeLogAt(x, z, r) { const l = X.makeLog(Math.floor(x * 13), 2.4, 0.2, 0.03); l.position.set(x, -0.08 - 0.27, z); l.rotation.y = r; O().group.add(l); return l; }
  shot(227.69, 'orilla', (lt, T) => {
    tick(T); posCrocs(T, { keepCroc: 1 });
    lazy('logs2', () => [], () => {}).forEach(l => l.visible = true);
    const cr = O().croc; const turn = ease.io(seg(lt, 0.5, 1.4));
    cr.root.position.set(10.0, -0.08 - 0.3 + turn * 0.02, -5.0); cr.root.rotation.y = 0.4 + turn * 1.0; F.poseCroc(cr, { swim: 0.2, phase: T * 0.2, t: T });
    const e = [10 + Math.cos(0.4 + turn) * 0.86, -0.05, -5 - Math.sin(0.4 + turn) * 0.86];
    cam(lerp3([e[0] + 0.5, 0.02, e[2] + 0.75], [e[0] + 0.35, 0.02, e[2] + 0.55], lt / 1.9), [e[0], -0.03, e[2]], 30, 0.002, T);
    animCard(at(stamp('ojos', 'ALGUNOS TIENEN OJOS', 16), 0, 36), lt, 0.9);
  }, [[0.4, 'tension'], [0.9, 'stamp']]);
  shot(229.63, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    const back = ease.io(seg(lt, 0.2, 1.2));
    dogAt(gO, 10.6, -1.9 + back * 0.35, Math.PI / 2 + 0.2, { gait: 'walk', amt: Math.sin(clamp(lt / 1.4) * Math.PI), phase: -lt * 1.3, ears: 0.6, headPitch: 0.1 });
    cam(lerp3([12.1, 0.5, -1.4], [11.95, 0.48, -1.45], lt / 2.4), [10.6, 0.3, -1.65], 38, 0.003, T);
    animCard(at(win('inteligente', '✓ ALGO INTELIGENTE'), 0, -38), lt, 0.8);
  }, [[0.8, 'ding']]);
  shot(232.08, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 10.6, -1.55, 0.6, { ears: 0.6, headYaw: lerp(0.9, -0.3, ease.io(seg(lt, 0.2, 1.2))), wag: 0.3 });
    cam(lerp3([9.6, 0.5, -0.6], [9.75, 0.48, -0.75], lt / 1.6), [10.6, 0.3, -1.8], 38, 0.002, T);
    animCard(at(card('norio', () => makeCard([{ text: '✗ RÍO GRANDE', px: 15, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 5 })), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(233.71, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    const x = 10.2 - lt * 0.42, z = -1.4 + Math.sin(lt * 0.8) * 0.05;
    dogAt(gO, x, z, Math.PI, { gait: 'walk', phase: lt * 1.2, sniff: 1, ears: 0.5, wag: 0.3 });
    const n = noseWorld();
    cam([x - 1.3, 0.45, z + 1.0], [x - 0.1, 0.2, z], 38, 0.004, T);
    scent(30, [n.x - 0.3, gO(n.x - 0.3, z) + 0.01, n.z], [n.x, n.y, n.z], lt, [0xf6e3c4], 0.15);
  }, [[0.2, 'sniff'], [1.2, 'sniff'], [2.0, 'sniff']]);
  shot(236.13, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    const x = 9.2 - lt * 0.3, z = -1.4;
    dogAt(gO, x, z, Math.PI, { gait: 'walk', phase: lt * 1.1, ears: 0.8, wag: 0.5, amt: 1 - ease.io(seg(lt, 3.6, 4.4)) });
    const k = ease.io(lt / 4.8);
    cam(lerp3([x + 0.5, 0.6, z + 1.0], [6, 7.5, 5.0], k), lerp3([x - 0.5, 0.2, z], [2.0, 0, -1.5], k), 44, 0.002, T);
    animCard(anchor(label('brazo', 'BRAZO DE AGUA', 13), [1.5, 0, -0.7], 0, 8), lt, 2.4);
    animCard(anchor(label('arena', 'ARENA', 13), [0.5, 0, -2.1], 0, 8), lt, 3.0);
    animCard(anchor(label('riogrande', 'RÍO', 13), [-0.5, 0, -6], 0, 8), lt, 3.6);
  }, [[0, 'whoosh'], [2.4, 'pop'], [3.0, 'pop'], [3.6, 'pop']]);
  shot(240.89, 'orilla', (lt, T) => {
    tick(T); posCrocs(T); D.root.visible = false;
    const k = lt / 2.2;
    cam(lerp3([-2, 0.12, -0.5], [1, 0.12, -0.6], k), lerp3([1, -0.12, -0.8], [4, -0.12, -0.8], k), 40, 0.003, T);
    animCard(at(label('baja', 'BAJA Y CLARA', 14), 0, -38), lt, 0.2);
  }, [[0.2, 'pop'], [0, 'trickle']]);
  shot(243.05, 'orilla', (lt, T) => {
    tick(T); posCrocs(T); D.root.visible = false;
    cam(lerp3([0.5, 1.1, -0.45], [0.3, 0.95, -0.5], lt / 2.4), [0.45, -0.17, -0.75], 40, 0.002, T);
    W.particles(12, (i) => { const a = T * (0.6 + i * 0.07) + i; return { p: [0.45 + Math.cos(a) * (0.15 + i * 0.03), -0.15, -0.75 + Math.sin(a) * 0.25], s: 0.012, c: 0x8a9aa0, ry: -a }; });
    animCard(at(win('fondo', '✓ SE VE EL FONDO'), -50, -36), lt, 0.1);
    animCard(at(win('nada', '✓ NADA ESCONDIDO'), 50, -36), lt, 1.1);
  }, [[0.1, 'ding'], [1.1, 'ding']]);
  shot(245.49, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    const app = ease.io(seg(lt, 0, 0.9)), x = 0.25, z = lerp(0.7, 0.18, app);
    const look = lt > 1.4 && lt < 2.3;
    dogAt(gO, x, z, Math.PI / 2, { gait: 'walk', amt: 1 - app, phase: lt * 1.2, sniff: look ? 0 : (lt > 0.8 ? 1 : 0.3), headYaw: look ? Math.sin((lt - 1.4) * 5) * 0.6 : 0, headPitch: look ? 0.15 : 0, ears: look ? 1 : 0.6 });
    const n = noseWorld();
    cam(lerp3([x + 1.4, 0.45, z + 0.5], [x + 1.25, 0.42, z + 0.4], lt / 3), [x, 0.2, z - 0.2], 36, 0.002, T);
    if (!look && lt > 0.8) scent(25, [n.x, -0.07, n.z - 0.15], [n.x, n.y, n.z], lt, [0xd8f0f0], 0.12);
  }, [[0.9, 'sniff'], [1.4, 'whoosh'], [2.4, 'sniff']]);
  shot(248.5, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 0.25, 0.18, Math.PI / 2, { drink: ease.io(seg(lt, 0, 0.35)), ears: 0.4, wag: 0.4 });
    const m = mouthWorld();
    cam(lerp3([m.x + 0.6, m.y + 0.06, m.z - 0.05], [m.x + 0.52, m.y + 0.05, m.z - 0.04], lt / 1.3), [m.x, m.y - 0.03, m.z], 34, 0.002, T);
    rings([m.x, -0.07, m.z], lt * 1.5, 0xe0f0f0);
  }, [[0.3, 'trickle']]);
  shot(249.77, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    const up = ease.io(seg(lt, 0.1, 0.6));
    dogAt(gO, 0.25, 0.18, Math.PI / 2, { drink: 1 - up, ears: 0.7, wag: 0.9, headPitch: up * 0.15 });
    const m = mouthWorld();
    cam(lerp3([1.5, 0.45, 0.6], [1.4, 0.43, 0.5], lt / 1.6), [0.25, 0.25, 0.0], 36, 0.002, T);
    if (lt > 0.4) W.particles(16, (i) => { const k = ((lt * 1.6 + i / 16) % 1); return { p: [m.x + (hash3(i, 1, 4) - 0.5) * 0.04, m.y - k * (m.y + 0.07), m.z], s: 0.008 * (1 - k), c: 0xd8f0f8 }; });
    animCard(at(win('v1', '✓ PRIMERA VICTORIA'), 0, 34), lt, 0.3);
  }, [[0.3, 'ding']]);
  shot(251.41, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 0.25, 0.18, Math.PI / 2, { drink: 1, ears: 0.4 + ease.io(seg(lt, 1.5, 1.8)) * 0.6, wag: 0.4 });
    const tu = O().turtle; tu.root.visible = true; tu.root.position.set(0.95 - lt * 0.03, gO(0.95, 0.35), 0.35); tu.root.rotation.y = 2.4; F.poseTurtle(tu, { walk: 1, phase: lt * 0.8, neck: 1 });
    cam(lerp3([1.6, 0.4, -0.5], [1.5, 0.38, -0.45], lt / 2.35), lerp3([0.25, 0.15, 0.0], [0.85, 0.08, 0.35], ease.io(seg(lt, 1.2, 2.0))), 38, 0.002, T);
  }, [[1.4, 'step'], [1.6, 'pop']]);
  shot(253.76, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 0.25, 0.18, Math.PI / 2 - 0.6, { ears: 1, headYaw: -0.5, headPitch: -0.1 });
    const tu = O().turtle; tu.root.visible = true; tu.root.position.set(0.88, gO(0.88, 0.35), 0.35); tu.root.rotation.y = 2.4; F.poseTurtle(tu, { walk: 0.5, phase: lt * 0.6, neck: 1 });
    for (const t of O().turtles) F.poseTurtle(t, { neck: 1, headYaw: Math.sin(T * 0.5 + t.root.position.x) * 0.4 });
    const k = ease.io(seg(lt, 1.0, 3.2));
    cam(lerp3([1.5, 0.25, 0.75], [3.5, 2.2, 2.5], k), lerp3([0.9, 0.05, 0.35], [0, -0.1, -2.0], k), 40, 0.002, T);
    animCard(anchor(label('tortuga', 'UNA TORTUGA', 13), [0.88, 0.25, 0.35], 0, 10), lt, 0.1, 1.0);
    animCard(at(label('lleno', 'HELL CREEK: LLENO DE TORTUGAS', 13), 0, -38), lt, 1.4);
  }, [[0.1, 'pop'], [1.4, 'pop']]);
  shot(256.99, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 0.25, 0.25, 0.2, { ears: 1, jaw: bark(lt, 0.1, 1.1, 6) * 0.9, tailUp: 1, wag: 0.8, headPitch: 0.1 });
    const tu = O().turtle; tu.root.visible = true; tu.root.position.set(1.25, gO(1.25, 0.35), 0.35); tu.root.rotation.y = 2.9; F.poseTurtle(tu, { neck: 1 });
    cam(lerp3([0.75, 0.38, 1.6], [0.77, 0.37, 1.5], lt / 1.2), [0.7, 0.2, 0.3], 40, 0.01, T);
    animCard(at(label('guau', '¡GUAU!', 16), -50, 30), lt, 0.12, 0.9);
  }, [[0.12, 'bark'], [0.45, 'bark']]);
  shot(258.16, 'orilla', (lt, T) => {
    tick(T); posCrocs(T); D.root.visible = true;
    dogAt(gO, 0.25, 0.25, 0.2, { ears: 1, jaw: 0.2, tailUp: 1 });
    const tu = O().turtle; tu.root.visible = true; tu.root.position.set(1.25, gO(1.25, 0.35), 0.35); tu.root.rotation.y = 2.9;
    F.poseTurtle(tu, { neck: 1, headYaw: -0.4 * ease.io(seg(lt, 0.3, 1.6)), headPitch: 0.1 });
    const h = [1.25 + Math.cos(2.9) * 0.3, gO(1.25, 0.35) + 0.11, 0.35 - Math.sin(2.9) * 0.3];
    cam(lerp3([0.78, h[1] + 0.12, 0.85], [0.8, h[1] + 0.1, 0.78], lt / 3.4), h, 30, 0.001, T);
    animCard(at(label('gato', 'COMO TU GATO CUANDO LO LLAMAS', 13), 0, -38), lt, 1.2);
  }, [[1.2, 'pop']]);
  shot(261.52, 'orilla', (lt, T) => {
    tick(T); posCrocs(T);
    dogAt(gO, 0.25, 0.25, 0.2, { ears: 0.6, headYaw: -0.3, wag: 0.2 });
    const tu = O().turtle; tu.root.visible = true; const k = lt / 2.37;
    const z = lerp(0.35, -0.6, k); tu.root.position.set(1.25 - k * 0.1, Math.max(gO(0.88, z), -0.13) - Math.max(0, k - 0.5) * 0.15, z); tu.root.rotation.y = Math.PI / 2 + 0.1; F.poseTurtle(tu, { walk: 1, phase: lt * 0.5, neck: 1 });
    cam([2.3, 0.4, 0.5], [1.1, 0.0, -0.1], 40, 0.002, T);
    if (k > 0.55) rings([1.15, -0.07, z], (k - 0.55) * 3, 0xe0f0f0);
  }, [[1.4, 'splash']]);
  shot(263.89, 'orilla', (lt, T) => {
    tick(T); posCrocs(T); D.root.visible = false;
    cam(lerp3([12, 3, 3], [10, 4, 4.5], lt / 1.54), [0, 0, -8], 50, 0.002, T);
    animCard(at(title('bienvenido', ['BIENVENIDO AL CRETÁCICO']), 0, 32), lt, 0.1);
  }, [[0, 'whoosh'], [0.1, 'stamp']]);
  shot(265.43, 'orilla', (lt, T) => {
    tick(T); posCrocs(T, { keepCroc: 1 });
    const cr = O().croc; cr.root.position.set(12 - lt * 0.5, -0.08 - 0.29, -3.8); cr.root.rotation.y = Math.PI; F.poseCroc(cr, { swim: 1, phase: T * 0.6, t: T });
    dogAt(gO, 10.6, -1.7, Math.PI / 2 + 0.3, { sit: 1, ears: 0, tailDown: 1, headPitch: -0.2 });
    cam(lerp3([11.9, 0.4, -2.3], [11.8, 0.38, -2.25], lt / 2.1), [10.5, 0.22, -2.1], 40, 0.002, T);
    animCard(at(stamp('nadie', 'NADIE LE TIENE MIEDO', 16), 0, 36), lt, 0.6);
  }, [[0.6, 'stamp']]);

  // ===== fome =====
  shot(267.53, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, 0.4, 1.2, -2.2, { ears: 0.5, headPitch: -0.15, tailDown: 0.4 });
    D.body.scale.y = 1 - Math.max(0, Math.sin(lt * 9)) * 0.02 * (lt > 2.6 ? 1 : 0);
    cam(lerp3([1.4, 0.55, 1.9], [1.25, 0.5, 1.75], lt / 3.3), [0.4, 0.3, 1.2], 38, 0.003, T);
    animCard(at(win('aguaok', '✓ AGUA'), -56, 34), lt, 0.1);
    animCard(at(stamp('prob2', 'PROBLEMA #2: HAMBRE', 16), 0, -36), lt, 1.3);
  }, [[0.1, 'ding'], [1.3, 'stamp'], [2.8, 'growl']]);
  shot(270.85, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, wag: 0.5, jaw: 0.2, pant: 1 });
    cam(lerp3([1.5, 0.55, 1.3], [1.35, 0.5, 1.15], lt / 3.4), [0, 0.3, 0], 36, 0.003, T);
    const v = Math.round(lerp(0, 1000, ease.out(seg(lt, 0.4, 2.2))));
    const c = card('kcal' + (lt < 2.2 ? Math.floor(v / 50) : 'f'), () => makeCard([{ text: (lt < 2.2 ? v : '+1000') + ' KCAL', px: 18, color: 0xffd36a }, { text: 'AL DÍA', px: 11 }], { bg: 0x16191c, border: 0x3a3f46, padX: 7, padY: 5 }));
    at(c, 52, 20); animCard(c, lt, lt < 0.45 ? 0.4 : -1);
  }, [[0.4, 'tick'], [2.2, 'ding']]);
  shot(274.23, 'sala', (lt, T) => {
    const bw = W.cur.bowl; bw.visible = true; const pop = ease.back(seg(lt, 0.5, 0.9)); bw.scale.setScalar(Math.max(0.01, pop)); bw.position.set(0.9, 0, 0.6);
    placeDog(0.45, 0, 0.6, 0); poseDog(D, { t: T, ears: 0.8, wag: 1, wagSpeed: 16, drink: lt > 1.4 ? 0.8 : 0, headPitch: lt > 1.4 ? 0 : 0.1 });
    cam(lerp3([1.6, 0.6, 1.6], [1.45, 0.55, 1.45], lt / 5.3), [0.75, 0.15, 0.6], 38, 0.003, T);
    if (lt > 0.4 && lt < 1.6) W.particles(80, (i) => { const k = clamp((lt - 0.4) * 1.1); const a = i / 80 * 6.28 + k * 3; const r = 0.1 + k * 0.3; return { p: [0.9 + Math.cos(a) * r, 0.1 + k * 0.4 * hash3(i, 2, 2), 0.6 + Math.sin(a) * r], s: 0.012 * (1 - k), c: [0xffe08a, 0xffffff, 0xffc0e0][i % 3] }; });
    animCard(at(label('2x', '2 VECES AL DÍA', 14), -56, 34), lt, 1.2);
    animCard(at(label('magia', 'COMO POR ARTE DE MAGIA', 14), 0, -38), lt, 4.0);
  }, [[0.5, 'rise'], [0.6, 'ding'], [1.2, 'pop'], [4.0, 'pop']]);
  shot(279.55, 'bosque', (lt, T) => {
    tick(T);
    const bw = lazy('forestBowl', () => { const b = P.buildBowl(false); B().group.add(b); return b; }, (b) => b.visible = false);
    bw.visible = true; bw.position.set(0.9, gB(0.9, 1.5), 1.5);
    dogAt(gB, 0.5, 1.5, 0, { sniff: 0.8, ears: 0.3, tailDown: 0.5 });
    cam(lerp3([1.5, 0.5, 2.3], [1.4, 0.45, 2.15], lt / 2.1), [0.8, 0.1, 1.5], 38, 0.002, T);
    W.particles(3, (i) => { const k = clamp(lt / 2); return { p: [0.95 + Math.sin(k * 6 + i) * 0.1, 1.2 - k * 1.15, 1.5 + i * 0.1], s: 0.03, c: 0x8a6a30, rx: k * 4 + i, ry: k * 3 }; });
    animCard(at(label('nadie2', 'NADIE LE VA A LLENAR EL PLATO', 13), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(281.64, 'bosque', (lt, T) => {
    tick(T);
    const x = 1.4 - lt * 0.42, z = 0.4 - lt * 0.16;
    dogAt(gB, x, z, Math.PI + 0.3, { gait: 'walk', phase: lt * 1.2, sniff: 1, ears: 0.5, wag: 0.4 });
    cam(lerp3([x + 0.4, 0.5, z + 1.2], [x + 0.2, 0.45, z + 1.1], lt / 2), [x - 0.6, 0.2, z - 0.2], 40, 0.003, T);
  }, [[0.3, 'sniff'], [1.2, 'sniff']]);
  shot(283.62, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, 0.45, -0.25, Math.PI + 0.3, { sniff: 1, ears: 0.8, headPitch: -0.1 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.15, n.y + 0.15, n.z + 0.75], [n.x + 0.1, n.y + 0.13, n.z + 0.68], lt / 2.1), [n.x - 0.15, n.y - 0.08, n.z - 0.05], 36, 0.002, T);
    scent(60, [n.x - 0.4, gB(n.x - 0.4, n.z) + 0.03, n.z - 0.15], [n.x, n.y, n.z], lt, [0xc8a070, 0xe8c090], 0.18);
    animCard(at(label('chiquito', 'OLOR A ANIMAL CHIQUITO', 13), 0, -38), lt, 0.6);
  }, [[0.2, 'sniff'], [0.6, 'pop']]);
  shot(285.71, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const m = B().multi; m.root.visible = true; subj(m.root);
    const e = logEnd(0.12); m.root.position.set(e[0], gB(e[0], e[2]) + 0.0, e[2]); m.root.rotation.y = 0.3 + Math.PI; F.poseMammal(m, { t: T, sniff: 1, headYaw: Math.sin(T * 2) * 0.3 });
    cam(lerp3([e[0] + 0.45, 0.15, e[2] + 0.35], [e[0] + 0.38, 0.13, e[2] + 0.3], lt / 2.1), [e[0], 0.06, e[2]], 30, 0.002, T);
    animCard(at(label('mamiferos', 'AQUÍ SÍ HABÍA MAMÍFEROS', 13), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  function logEnd(out = 0) { const a = 0.3, L = 1.3 + out; return [-1.0 + Math.cos(a) * L, 0, -0.4 - Math.sin(a) * L]; }
  shot(287.79, 'estudio', (lt, T) => {
    D.root.visible = false;
    const m = lazy('studioMulti', () => { const q = F.buildMulti(); W.sets.estudio.group.add(q.root); return q; }, (q) => q.root.visible = false);
    m.root.visible = true; m.root.position.set(0, 0, 0); m.root.rotation.y = -0.5 + lt * 0.15; F.poseMammal(m, { t: T, sniff: 0.5, walk: 0 });
    const r = W.cur.ruler; r.visible = true; r.position.set(0.05, 0, 0.15); r.scale.set(0.5, 0.35, 0.5);
    cam(lerp3([0.45, 0.22, 0.45], [0.4, 0.2, 0.38], lt / 4.4), [0, 0.06, 0], 34, 0.002, T);
    animCard(at(label('peq', 'PEQUEÑOS · PELUDOS', 14), -56, 34), lt, 0.2);
    animCard(at(label('raton', 'DE RATÓN A ARDILLA', 14), 0, -38), lt, 1.6);
  }, [[0.2, 'pop'], [1.6, 'pop']]);
  shot(292.18, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const m = B().multi; m.root.visible = true; subj(m.root);
    const e = logEnd(0.14); m.root.position.set(e[0], gB(e[0], e[2]), e[2]); m.root.rotation.y = 0.3 + Math.PI + 0.6; F.poseMammal(m, { t: T, rear: 0.6 + Math.sin(T * 3) * 0.1, headPitch: -0.2 });
    cam(lerp3([e[0] + 0.35, 0.12, e[2] + 0.25], [e[0] + 0.3, 0.11, e[2] + 0.2], lt / 2.6), [e[0], 0.08, e[2]], 28, 0.002, T);
    animCard(at(card('roedor', () => makeCard([{ text: '✗ ROEDORES', px: 14, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 4 })), -56, -36), lt, 1.4);
  }, [[1.4, 'pop']]);
  shot(294.81, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const m = B().multi; m.root.visible = true; subj(m.root);
    const e = logEnd(0.14); m.root.position.set(e[0], gB(e[0], e[2]), e[2]); m.root.rotation.y = 0.3 + Math.PI + 0.3; F.poseMammal(m, { t: T, sniff: 1 });
    cam(lerp3([e[0] + 0.6, 0.3, e[2] + 0.5], [e[0] + 0.5, 0.25, e[2] + 0.4], lt / 3.5), [e[0], 0.07, e[2]], 34, 0.002, T);
    animCard(at(nameCard('multi', 'MULTITUBERCULADOS', 'un grupo que ya no existe'), 0, 34), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(298.28, 'rua', (lt, T) => {
    placeDog(0.6, 0, -0.3, 0.6); poseDog(D, { t: T, dig: 1, ears: 0.6, wag: 0.8 });
    cam(lerp3([1.5, 0.5, 0.4], [1.35, 0.45, 0.3], lt / 2.15), [0.65, 0.15, -0.35], 38, 0.004, T);
    dirt(80, [0.6 + Math.cos(0.6) * 0.3, 0.02, -0.3 - Math.sin(0.6) * 0.3], [-Math.cos(0.6), 0, Math.sin(0.6)], lt, [0x6a4a2a, 0x5aa03a]);
    animCard(at(label('patio', 'COMO EN EL PATIO', 14), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0.2, 'dig'], [0.3, 'pop']]);
  shot(300.43, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { dig: 1, digSpeed: 17, ears: 0.6, wag: 0.9 });
    cam(lerp3([e[0] + 0.6, 0.45, e[2] + 1.3], [e[0] + 0.5, 0.42, e[2] + 1.2], lt / 2.3), [e[0] + 0.3, 0.15, e[2]], 38, 0.006, T);
    dirt(140, [e[0] + 0.25, gB(e[0], e[2]) + 0.03, e[2] + 0.03], [1, 0, 0.1], lt, [0x4a3420, 0x6a4a28, 0x8a6a30]);
    animCard(at(stamp('escarba', 'ESCARBA', 18), -54, 34), lt, 0.1);
  }, [[0.1, 'stamp'], [0.1, 'dig']]);
  shot(302.70, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { dig: 1, digSpeed: 19, ears: 0.6, wag: 0.9 });
    cam([e[0] + 1.4, 0.3, e[2] + 0.45], [e[0] + 0.3, 0.18, e[2]], 44, 0.012, T);
    dirt(260, [e[0] + 0.25, gB(e[0], e[2]) + 0.03, e[2] + 0.03], [1, 0.2, 0.05], lt, [0x4a3420, 0x6a4a28, 0x8a6a30, 0x5a7a2a], 1.6);
    animCard(at(label('tierra', 'TIERRA PARA TODOS LADOS', 13), -50, -36), lt, 0.1);
  }, [[0.1, 'dig'], [0.8, 'whoosh']]);
  shot(304.32, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { dig: 1, digSpeed: 24, ears: 0.6, wag: 0.6 });
    const pile = lazy('dirtPile', () => { const pl = X.makeDirtPile(); B().group.add(pl); return pl; }, (pl) => pl.visible = false);
    pile.visible = true; const g = 0.2 + ease.out(lt / 2) * 0.8; pile.scale.set(g, g, g); pile.position.set(e[0] + 0.95, gB(e[0] + 0.95, e[2]), e[2] + 0.05);
    cam(lerp3([e[0] + 1.0, 0.9, e[2] + 1.1], [e[0] + 0.9, 0.85, e[2] + 1.0], lt / 2), [e[0] + 0.45, 0.1, e[2]], 40, 0.004, T);
    dirt(120, [e[0] + 0.25, gB(e[0], e[2]) + 0.03, e[2] + 0.03], [1, 0.1, 0.05], lt, [0x4a3420, 0x6a4a28]);
    const mn = Math.floor(clamp(lt / 1.9) * 5);
    animCard(at(card('min' + mn, () => makeCard([{ text: mn + ':00', px: 18, color: 0xffd36a }, { text: 'MINUTOS', px: 10 }], { bg: 0x16191c, border: 0x3a3f46, padX: 7, padY: 5 })), 60, 32), lt, -1);
  }, [[0, 'tick'], [0.4, 'tick'], [0.8, 'tick'], [1.2, 'tick'], [1.6, 'tick']]);
  shot(306.29, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { drink: 0.8, ears: 0.9, wag: 0 });
    const pile = lazy('dirtPile', () => null, () => {}); if (pile) pile.visible = true;
    cam([e[0] + 0.9, 0.35, e[2] + 0.55], [e[0] + 0.3, 0.12, e[2]], 36, 0.001, T);
    animCard(at(stamp('nada2', 'NADA', 18), 0, 34), lt, 0.25);
  }, [[0.25, 'stamp']]);
  shot(307.25, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { dig: 1, digSpeed: 15, ears: 0.6 });
    const m = B().multi; m.root.visible = true; subj(m.root);
    const o = [-2.35, 0, 0.05], k = seg(lt, 0.6, 3.6);
    m.root.position.set(o[0] - k * 1.2, gB(o[0] - k * 1.2, o[2] + k * 0.4), o[2] + k * 0.4); m.root.rotation.y = Math.PI - 0.3; F.poseMammal(m, { t: T, walk: k > 0 && k < 1 ? 1 : 0, phase: T * 4 });
    cam(lerp3([-0.9, 1.2, 1.9], [-1.1, 1.3, 2.1], lt / 4.1), [-1.1, 0.1, -0.2], 44, 0.002, T);
    animCard(anchor(label('otroagujero', 'OTRO AGUJERO', 12), [o[0], 0.15, o[2]], 0, 10), lt, 0.7);
  }, [[0.6, 'pop'], [1.0, 'step']]);
  shot(311.36, 'rua', (lt, T) => {
    const t = lazy('parkTree', () => { const q = P.buildStreetTree(3); W.sets.rua.group.add(q); return q; }, (q) => q.visible = false);
    t.visible = true; t.position.set(-0.5, 0, -1.5);
    const sq = lazy('squirrel', () => { const q = F.buildMammal({ size: 0.65, voxel: 0.006, fur: 0x8a8a8a, dark: 0x5a5a5a, light: 0xd8d8d8, tail: 0x7a7a7a, tailFat: 3 }); W.sets.rua.group.add(q.root); return q; }, (q) => q.root.visible = false);
    sq.root.visible = true; sq.root.position.set(-0.4, 1.4, -1.3); sq.root.rotation.y = 1.0; F.poseMammal(sq, { t: T, rear: 0.4, tailUp: 0.8 }); subj(sq.root);
    placeDog(0.2, 0, -0.7, 2.2); poseDog(D, { t: T, ears: 1, headPitch: 0.6, jaw: bark(lt, 0.2, 1.3, 6) * 0.8, wag: 0.8 });
    cam(lerp3([2.2, 0.7, 1.0], [2.1, 0.7, 0.9], lt / 1.4), [-0.1, 0.8, -1.0], 46, 0.004, T);
  }, [[0.2, 'bark'], [0.7, 'bark']]);
  shot(312.76, 'bosque', (lt, T) => {
    tick(T);
    const e = logEnd(-0.2);
    dogAt(gB, e[0] + 0.45, e[2] + 0.05, Math.PI + 0.25, { dig: 1, digSpeed: 15, ears: 0.6, wag: 0.5 });
    dirt(80, [e[0] + 0.25, gB(e[0], e[2]) + 0.03, e[2] + 0.03], [1, 0.1, 0.05], lt, [0x4a3420, 0x6a4a28]);
    cam(lerp3([e[0] + 2.2, 1.4, e[2] + 2.8], [e[0] + 3.0, 1.8, e[2] + 3.6], lt / 4.4), [e[0] + 0.4, 0.15, e[2]], 44, 0.002, T);
    const out = lt > 3.2 ? 3.2 : 99;
    animCard(at(card('yadeja', () => makeCard([{ text: '¡YA, DEJA ESO!', px: 16, color: 0xfff1dc }], { bg: 0x3a5a8a, border: 0x1a2a4a, padX: 7, padY: 5 })), 0, 34), lt, 1.6, out);
    if (lt > 3.0) animCard(at(stamp('nadie3', 'NADIE SE LO DICE', 14), 0, -36), lt, 3.0);
  }, [[1.6, 'pop'], [3.0, 'stamp']]);
  shot(317.14, 'bosque', (lt, T) => {
    tick(T);
    const k = lt / 2.65, x = lerp(-2.6, -3.8, k), z = lerp(1.0, 2.75, k);
    dogAt(gB, x, z, yawTo(-1.2, 1.75), { gait: 'walk', phase: lt * 1.2, sniff: 0.3, ears: 0.6, wag: 0.3 });
    cam(lerp3([-1.6, 0.6, 3.6], [-2.2, 0.55, 3.8], k), [x - 0.4, 0.2, z], 40, 0.003, T);
  }, [[0, 'whoosh'], [0.5, 'tension']]);
  shot(319.79, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -4.15, 2.85, yawTo(-0.8, -0.45), { sniff: 1, ears: 0.9 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.3, n.y + 0.1, n.z - 0.6], [n.x + 0.26, n.y + 0.09, n.z - 0.52], lt / 3.56), [n.x - 0.12, n.y - 0.04, n.z - 0.05], 34, 0.002, T);
    scent(90, [n.x - 0.6, n.y - 0.1, n.z - 0.35], [n.x, n.y, n.z], lt, [0x8a5a3a, 0x6a4a2a, 0xa07a50], 0.4, 0.016);
    animCard(at(label('fuerte', 'MÁS FUERTE · MÁS GRANDE', 13), 0, -38), lt, 1.2);
  }, [[0.2, 'sniff'], [1.2, 'pop'], [1.5, 'tension']]);
  shot(323.35, 'bosque', (lt, T) => {
    tick(T);
    const push = ease.io(seg(lt, 0.2, 1.6));
    dogAt(gB, -4.15 - push * 0.18, 2.85 - push * 0.1, yawTo(-0.8, -0.45), { sniff: 0.7, ears: 0.8, headPitch: -0.05 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.4, n.y + 0.12, n.z - 0.75], [n.x + 0.35, n.y + 0.1, n.z - 0.65], lt / 2.36), [n.x - 0.1, n.y, n.z - 0.05], 36, 0.002, T);
  }, [[0.4, 'sniff'], [1.2, 'sniff']]);
  shot(325.71, 'bosque', (lt, T) => {
    tick(T);
    const fl = ease.out(seg(lt, 0.35, 0.6));
    dogAt(gB, -4.33 + fl * 0.25, 2.75 + fl * 0.14, yawTo(-0.8, -0.45), { ears: lt > 0.35 ? 0 : 0.8, headPitch: fl * 0.25, sit: fl * 0.3, tailDown: fl });
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.85, gB(-4.85, 2.45), 2.45); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: lt > 0.3 ? 1 : 0.2, headPitch: 0.15 });
    const h = [-4.5, 0.25, 2.62];
    cam(lerp3([-3.7, 0.38, 1.75], [-3.65, 0.4, 1.7], lt / 2.42), [-4.3, 0.2, 2.68], 40, lt > 0.35 && lt < 0.7 ? 0.03 : 0.003, T);
    if (lt > 0.35) W.particles(50, (i) => { const k = clamp((lt - 0.35) * 2); return { p: [-4.6 + k * 0.5 * hash3(i, 1, 3), 0.18 + (hash3(i, 2, 3) - 0.5) * 0.1 * k, 2.55 + k * 0.3 * hash3(i, 3, 3)], s: 0.006 * (1 - k), c: 0xe8e0d0 }; });
    animCard(at(stamp('bufido', '¡FFFSSS!', 18), 54, 34), lt, 1.6);
  }, [[0.35, 'hiss'], [0.4, 'jump'], [1.6, 'stamp']]);
  shot(328.13, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0.1, headPitch: 0.15, tailDown: 0.6 });
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    const k = ease.io(seg(lt, 0, 1.6));
    dd.root.position.set(lerp(-4.85, -4.55, k), gB(-4.6, 2.55), lerp(2.45, 2.6, k)); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, walk: k < 1 ? 1 : 0, phase: T * 2, jaw: 0.3 });
    cam(lerp3([-3.45, 0.45, 1.5], [-3.55, 0.42, 1.6], lt / 3.1), [-4.3, 0.18, 2.7], 40, 0.002, T);
    animCard(at(label('gatogrande', 'TAMAÑO: UN GATO GRANDE', 14), 0, -38), lt, 1.2);
  }, [[0.2, 'step'], [1.2, 'pop']]);
  shot(331.23, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.2 + Math.sin(T * 2) * 0.1, headYaw: Math.sin(T) * 0.2 });
    const a = lerp(0.2, 1.2, ease.io(lt / 3.84));
    cam([-4.55 + Math.cos(a) * 0.95, 0.4, 2.6 + Math.sin(a) * 0.95], [-4.55, 0.15, 2.6], 38, 0.002, T);
    animCard(at(label('zarig', 'COMO UNA ZARIGÜEYA…', 13), -54, 34), lt, 0.1);
    animCard(at(label('robusta', '…PERO MÁS ROBUSTA', 13), -54, 18), lt, 1.2);
    animCard(at(label('ancha', 'CABEZA ANCHA', 13), -54, 2), lt, 2.6);
  }, [[0.1, 'pop'], [1.2, 'pop'], [2.6, 'pop']]);
  shot(335.07, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.6 });
    cam(lerp3([-3.7, 0.25, 3.15], [-3.85, 0.25, 3.05], lt / 1.7), [-4.5, 0.18, 2.62], 36, 0.002, T);
    animCard(at(nameCard('didel', 'DIDELPHODON', 'mamífero de Hell Creek'), 0, 34), lt, 0.1);
  }, [[0.1, 'stamp']]);
  shot(336.77, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.75 + Math.sin(T * 3) * 0.05 });
    const h = [-4.55 + 0.92 * 0.3, 0.2, 2.6 + 0.4 * 0.3];
    cam(lerp3([h[0] + 0.62, h[1] + 0.07, h[2] + 0.3], [h[0] + 0.42, h[1] + 0.05, h[2] + 0.2], ease.io(lt / 2.28)), h, 32, 0.002, T);
  }, [[0, 'tension']]);
  shot(339.05, 'estudio', (lt, T) => {
    D.root.visible = false;
    const dd = W.cur.didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(0, 0, 0); dd.root.rotation.y = -0.6; F.poseMammal(dd, { t: T, jaw: 0.8 * Math.max(0, Math.sin(lt * 2.4)) });
    cam(lerp3([0.9, 0.4, 0.8], [0.8, 0.35, 0.7], lt / 2.3), [0.05, 0.15, 0], 36, 0.002, T);
    animCard(at(label('cientificos', 'SEGÚN LOS CIENTÍFICOS', 13), -54, 34), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(341.34, 'estudio', (lt, T) => {
    D.root.visible = false;
    const dd = W.cur.dido || W.cur.didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-0.15, 0, 0); dd.root.rotation.y = 0; const bite = Math.max(0, Math.sin(lt * 3.2));
    F.poseMammal(dd, { t: T, jaw: bite });
    cam(lerp3([0.75, 0.25, 0.55], [0.65, 0.22, 0.45], lt / 5.9), [0.25, 0.14, 0], 32, bite < 0.1 ? 0.006 : 0.002, T);
    animCard(at(title('mordida', [{ text: 'MORDIDA', px: 13 }, { text: 'DE LAS MÁS FUERTES', px: 16, color: 0xe0862f }, { text: 'PARA SU TAMAÑO', px: 11 }]), 52, 30), lt, 0.6);
    animCard(at(stamp('mamif', 'ENTRE LOS MAMÍFEROS', 13), 52, -34), lt, 3.2);
  }, [[0.6, 'pop'], [1.0, 'snap'], [2.95, 'snap'], [3.2, 'stamp'], [4.9, 'snap']]);
  shot(347.28, 'estudio', (lt, T) => {
    D.root.visible = false;
    const dd = W.cur.didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-0.15, 0, 0); dd.root.rotation.y = 0;
    const snail = lazy('snail', () => { const q = P2.buildSnail(); W.sets.estudio.group.add(q); return q; }, (q) => q.visible = false);
    const crunch = lt > 1.4;
    F.poseMammal(dd, { t: T, jaw: crunch ? 0.3 * Math.max(0, Math.sin(lt * 9)) : ease.io(seg(lt, 0.6, 1.3)) * 0.9 });
    snail.visible = !crunch; snail.position.set(0.28, 0.0, 0); snail.rotation.y = Math.PI;
    if (crunch) W.particles(60, (i) => { const k = clamp((lt - 1.4) * 1.4); const a = hash3(i, 1, 2) * 6.28; return { p: [0.3 + Math.cos(a) * k * 0.15, 0.1 + Math.sin(k * 3) * 0.08 * hash3(i, 2, 2) - k * 0.1, Math.sin(a) * k * 0.15], s: 0.007 * (1 - k * 0.5), c: i % 2 ? 0x6a4a2a : 0xc8a070, rx: i + k * 5 }; });
    cam(lerp3([0.7, 0.18, 0.4], [0.62, 0.17, 0.33], lt / 4.17), [0.25, 0.1, 0], 30, crunch && lt < 1.7 ? 0.02 : 0.002, T);
    animCard(at(label('caracoles', 'CARACOLES Y ANIMALES CON CONCHA', 13), 0, 36), lt, 0.2);
    animCard(at(stamp('contodo', 'CON CONCHA Y TODO', 15), 0, -36), lt, 2.9);
  }, [[0.2, 'pop'], [1.4, 'snap'], [1.45, 'burst'], [2.9, 'stamp']]);
  shot(351.45, 'estudio', (lt, T) => {
    const dd = W.cur.didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(0.55, 0, 0.2); dd.root.rotation.y = Math.PI - 0.3; F.poseMammal(dd, { t: T, jaw: 0.3 });
    placeDog(-0.25, 0, -0.1, -0.2); poseDog(D, { t: T, ears: 0.7, headYaw: -0.3, wag: 0.3 });
    cam(lerp3([0.3, 0.55, 1.85], [0.25, 0.5, 1.7], lt / 2.65), [0.15, 0.25, 0], 38, 0.002, T);
    animCard(at(card('x5', () => makeCard([{ text: '×5', px: 26, color: 0xe0862f }, { text: 'MÁS PESADO', px: 11 }], { padX: 8, padY: 5 })), -56, 30), lt, 0.6);
  }, [[0.6, 'pop']]);
  shot(354.10, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0.7, headPitch: -0.12, growl: 0.5, tailUp: 0.6, crouch: 0.3 });
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.7 });
    cam(lerp3([-3.45, 0.4, 1.45], [-3.55, 0.38, 1.55], lt / 3.98), [-4.25, 0.22, 2.78], 38, 0.003, T);
    animCard(at(stamp('noretro', 'NO RETROCEDAS', 16), 0, 34), lt, 0.6);
    animCard(at(label('criaron', 'PARA ESO LO CRIARON', 13), 0, -38), lt, 2.8);
  }, [[0.6, 'stamp'], [0.8, 'growl'], [2.8, 'pop']]);
  shot(358.08, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0.8, headPitch: -0.05, still: 0 });
    const h = noseWorld();
    cam(lerp3([h.x - 0.42, h.y + 0.06, h.z - 0.38], [h.x - 0.36, h.y + 0.05, h.z - 0.32], lt / 4.5), [h.x + 0.1, h.y + 0.04, h.z + 0.05], 34, 0.002, T);
    animCard(at(num('h3b', '3', 'LEER A LOS DEMÁS'), -56, 32), lt, 0.6);
  }, [[0.6, 'pop'], [2.6, 'whoosh']]);
  shot(362.58, 'bosque', (lt, T) => {
    tick(T);
    const back = ease.io(seg(lt, 0.4, 1.4));
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0.8 - back * 0.8, headPitch: -0.05 - back * 0.15, tailDown: back * 0.8 });
    const h2 = noseWorld();
    cam(lerp3([h2.x - 0.5, h2.y + 0.05, h2.z - 0.45], [h2.x - 0.44, h2.y + 0.04, h2.z - 0.4], lt / 2.14), [h2.x + 0.12, h2.y, h2.z + 0.06], 36, 0.002, T);
    animCard(at(label('nogusta', 'NO LE GUSTA NADA', 14), 0, -38), lt, 0.9);
  }, [[0.9, 'pop']]);
  shot(364.72, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0, headPitch: -0.2, tailDown: 0.8 });
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 1, headYaw: Math.sin(T * 0.7) * 0.1 });
    const h = [-4.55 + 0.92 * 0.3, 0.2, 2.6 + 0.4 * 0.3];
    cam(lerp3([-3.35, 0.62, 3.2], [-3.4, 0.6, 3.15], lt / 5.9), h, 34, 0.002, T);
    animCard(at(label('nohuye', 'NO HUYE', 14), -56, 30), lt, 0.3);
    animCard(at(label('boca', 'BOCA ABIERTA', 14), -56, 12), lt, 2.6);
    animCard(at(label('fijo', 'MIRADA FIJA', 14), -56, -6), lt, 4.8);
  }, [[0.3, 'pop'], [1.0, 'hiss'], [2.6, 'pop'], [4.8, 'pop']]);
  shot(370.63, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.95 });
    const h = [-4.55 + 0.92 * 0.36, 0.19, 2.6 + 0.4 * 0.36];
    cam(lerp3([h[0] + 0.7, h[1] + 0.06, h[2] + 0.32], [h[0] + 0.38, h[1] + 0.04, h[2] + 0.17], ease.io(lt / 5.38)), h, 32, 0.002, T);
    animCard(at(label('nolonecesita', 'NO LO NECESITA', 15), 0, -38), lt, 4.0);
  }, [[0, 'tension'], [4.0, 'pop']]);
  shot(376.01, 'rua', (lt, T) => {
    const tr = lazy('truck', () => { const q = P2.buildTruck(); q.scale.setScalar(0.85); W.sets.rua.group.add(q); return q; }, (q) => q.visible = false);
    tr.visible = true; tr.position.set(lerp(-6, 6, lt / 3.3), 0, 6); tr.rotation.y = 0;
    placeDog(0, 0.24, -0.8, -Math.PI / 2); poseDog(D, { t: T, ears: 1, jaw: bark(lt, 0.2, 3.0, 6) * 0.9, tailUp: 1, wag: 0.8, headPitch: 0.15 });
    cam(lerp3([1.2, 0.6, -1.7], [1.3, 0.7, -1.9], lt / 3.3), [0, 0.4, 2.5], 50, 0.006, T);
    animCard(at(label('basura', 'EL QUE LE LADRA AL CAMIÓN DE LA BASURA', 12), 0, -38), lt, 0.4);
  }, [[0.2, 'bark'], [0.7, 'bark'], [1.3, 'bark'], [0.1, 'rumble']]);
  shot(379.30, 'bosque', (lt, T) => {
    tick(T);
    const b1 = ease.io(seg(lt, 0.0, 0.5)), b2 = ease.io(seg(lt, 0.6, 1.1)), turn = ease.io(seg(lt, 1.35, 1.9));
    const yaw0 = yawTo(-0.8, -0.45), back = (b1 + b2) * 0.14;
    const x = -3.95 + 0.8 * back / 0.92, z = 2.95 + 0.45 * back / 0.92;
    const walk = lt > 1.5 ? (lt - 1.5) * 0.4 : 0;
    dogAt(gB, x + Math.cos(yaw0 + Math.PI) * walk, z - Math.sin(yaw0 + Math.PI) * walk, yaw0 + turn * Math.PI, { gait: 'walk', amt: lt < 1.2 ? Math.sin(clamp(lt / 0.55) * Math.PI) : 1, phase: lt < 1.2 ? -lt * 2 : lt * 1.3, ears: 0.1, tailDown: 0.8 });
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.5 });
    cam(lerp3([-3.2, 0.55, 1.55], [-3.1, 0.55, 1.65], lt / 2.15), [-3.85, 0.25, 2.9], 42, 0.003, T);
    animCard(at(label('dospasos', 'DOS PASOS ATRÁS', 14), -56, 32), lt, 0.3);
  }, [[0.1, 'step'], [0.65, 'step'], [0.3, 'pop'], [1.5, 'whoosh']]);
  shot(381.45, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45);
    const chomp = seg(lt, 2.0, 2.25);
    F.poseMammal(dd, { t: T, jaw: lt < 2.0 ? 1 : 1 - chomp });
    const h = [-4.55 + 0.92 * 0.4, 0.19, 2.6 + 0.4 * 0.4];
    cam(lerp3([h[0] + 0.6, h[1] + 0.04, h[2] + 0.26], [h[0] + 0.3, h[1] + 0.03, h[2] + 0.13], ease.in(seg(lt, 0, 2.2))), h, 34, lt > 2.0 && lt < 2.4 ? 0.03 : 0.002, T);
    if (lt > 2.15) st.veil.material.opacity = clamp((lt - 2.15) * 4) * 0.9, st.veil.material.color.set(0x000000);
    animCard(at(title('leccion1', [{ text: 'LECCIÓN 1', px: 12, color: 0xe0862f }, { text: 'LO PEQUEÑO TAMBIÉN MUERDE', px: 15 }]), 0, -34), lt, 0.3);
  }, [[0.3, 'stamp'], [2.0, 'snap']]);

  // ===== charco =====
  shot(385.70, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const k = lt / 2.13, x = lerp(0.6, 1.4, k), z = lerp(0.2, 1.2, k);
    dogAt(gB, x, z, yawTo(0.8, 1.0), { gait: 'walk', phase: lt * 1.2, ears: 0.4, wag: 0.2, tailDown: 0.3 });
    cam(lerp3([x + 1.5, 1.6, z - 0.4], [x + 1.4, 1.5, z - 0.2], k), [x, 0.2, z], 44, 0.002, T);
    animCard(at(label('mediodia', 'MEDIODÍA', 14), -60, 34), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(387.83, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const k = ease.io(lt / 2.92), x = lerp(1.4, 2.05, k), z = lerp(1.2, 1.8, k);
    dogAt(gB, x, z, yawTo(0.8, 1.0), { gait: 'walk', amt: 1 - ease.io(seg(lt, 2.2, 2.9)), phase: lt * 1.1, sniff: 0.5, ears: 0.8, wag: 0.5 });
    cam(lerp3([0.4, 0.6, 0.6], [0.8, 0.7, 0.9], k), [3.2, 0.0, 2.6], 44, 0.002, T);
    animCard(at(label('charco', 'UN CHARCO QUE DEJÓ EL RÍO', 13), 0, -38), lt, 0.8);
  }, [[0.8, 'pop']]);
  function fishSwim(T, o = {}) {
    const S = B(), [px, pz] = S.POND;
    S.gars.forEach((f, i) => { f.root.visible = true; const a = T * (0.25 + i * 0.05) * (i % 2 ? -1 : 1) + i * 2.1, r = 0.55 + i * 0.12; f.root.position.set(px + Math.cos(a) * r * 1.25, -0.12, pz + Math.sin(a) * r * 0.8); f.root.rotation.y = -a + (i % 2 ? Math.PI / 2 : -Math.PI / 2); F.poseFish(f, { phase: T * 1.5 + i }); });
    S.fish.forEach((f, i) => { f.root.visible = !o.hideSmall; const a = T * (0.6 + i * 0.1) * (i % 2 ? 1 : -1) + i * 1.3, r = 0.3 + i * 0.12; f.root.position.set(px + Math.cos(a) * r * 1.3, -0.1, pz + Math.sin(a) * r * 0.9); f.root.rotation.y = -a + (i % 2 ? -Math.PI / 2 : Math.PI / 2); F.poseFish(f, { phase: T * 3 + i }); });
  }
  shot(390.75, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T); D.root.visible = false;
    const [px, pz] = B().POND;
    cam(lerp3([px - 0.4, 1.6, pz + 1.3], [px - 0.2, 1.45, pz + 1.05], lt / 4.34), [px, -0.12, pz], 42, 0.002, T);
    animCard(at(label('quieta', 'AGUA QUIETA · POCO PROFUNDA', 13), 0, 36), lt, 0.2);
    animCard(at(label('atrapados', 'PECES ATRAPADOS', 14), 0, -38), lt, 2.3);
  }, [[0.2, 'pop'], [2.3, 'pop'], [0, 'trickle']]);
  shot(395.09, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T, { hideSmall: 1 }); D.root.visible = false;
    const f = B().gars[1]; const p = f.root.position;
    cam([p.x + Math.cos(-f.root.rotation.y) * 0.1 + 0.55, 0.05, p.z + 0.5], [p.x, -0.12, p.z], 34, 0.002, T);
    animCard(at(nameCard('pejelagarto', 'PEJELAGARTO', 'existe hasta hoy'), -50, 34), lt, 0.2);
    animCard(at(label('armadura', 'ESCAMAS COMO ARMADURA', 13), 0, -38), lt, 2.4);
  }, [[0.2, 'pop'], [2.4, 'pop']]);
  shot(400.31, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T); D.root.visible = false;
    const f = B().fish[0]; const p = f.root.position;
    cam([p.x + 0.35, 0.05, p.z + 0.3], [p.x, -0.1, p.z], 34, 0.002, T);
    animCard(at(label('chicos', 'Y OTROS MÁS CHICOS', 14), 0, -38), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(401.65, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const [px, pz] = B().POND; const k = ease.io(seg(lt, 0.2, 2.6));
    const x = lerp(2.05, px - 0.45, k), z = lerp(1.8, pz - 0.1, k);
    dogAt(gB, x, z, yawTo(0.8, 0.6), { gait: 'walk', amt: 1 - ease.io(seg(lt, 2.4, 3.0)), phase: lt * 1.1, ears: 0.9, wag: 0.8, headPitch: -0.2 });
    D.root.position.y = Math.max(D.root.position.y, -0.2);
    cam(lerp3([x + 0.2, 0.35, z + 1.2], [x + 0.1, 0.3, z + 1.0], lt / 4.68), [x + 0.2, 0.0, z], 40, 0.003, T);
    animCard(at(win('perfecto', '✓ PERFECTO'), -54, 34), lt, 1.2);
    animCard(at(label('patas', 'EL AGUA LE LLEGA A LAS PATAS', 13), 0, -38), lt, 3.2);
    if (k > 0.6) rings([x + 0.1, -0.07, z], lt, 0xe0f0e0);
  }, [[1.2, 'ding'], [2.0, 'splash'], [3.2, 'pop']]);
  shot(406.33, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const [px, pz] = B().POND;
    dogAt(gB, px - 0.1, pz, lt * 0.8, { ears: 1, headPitch: -0.4, headYaw: Math.sin(T * 2.4) * 0.4, wag: 0.6 });
    D.root.position.y = -0.2;
    cam([px + 0.05, 2.3, pz + 0.15], [px, -0.1, pz], 44, 0.002, T, lt * 0.15);
    animCard(at(label('nohay', 'LOS PECES NO TIENEN A DÓNDE IR', 13), 0, -38), lt, 0.4);
  }, [[0.4, 'pop']]);
  shot(408.35, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const [px, pz] = B().POND;
    const j = Math.max(0, Math.sin(lt * 5));
    dogAt(gB, px - 0.1 + Math.sin(lt * 2) * 0.15, pz + Math.cos(lt * 1.7) * 0.1, lt * 2, { ears: 1, headPitch: -0.5, jaw: j * 0.6, wag: 1, crouch: 0.3 });
    D.root.position.y = -0.2 + j * 0.08;
    cam([px + 1.2, 0.4, pz + 1.0], [px - 0.1, 0.0, pz], 40, 0.01, T);
    splash(160, [D.root.position.x, -0.07, D.root.position.z], (lt * 2.5) % 1, Math.floor(lt * 2.5), 0.4);
    animCard(at(label('rato', 'UN BUEN RATO…', 14), -56, 34), lt, 0.2);
  }, [[0.2, 'splash'], [0.6, 'splash'], [1.0, 'splash']]);
  shot(409.70, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const [px, pz] = B().POND;
    const slip = ease.in(seg(lt, 1.0, 1.5));
    dogAt(gB, px - 0.1, pz, 0.6, { ears: 0.6, headPitch: -0.3, crouch: 0.4 * (1 - slip) });
    D.root.position.y = -0.2 - slip * 0.08; D.root.rotation.x = slip * 1.35;
    cam([px + 0.9, 0.3, pz + 0.9], [px - 0.1, 0.0, pz], 40, lt > 1.4 && lt < 1.8 ? 0.03 : 0.006, T);
    splash(220, [px - 0.1, -0.07, pz], clamp((lt - 1.4) * 1.2), 7, 0.6);
    animCard(at(label('salpica', 'SALPICA', 14), -56, 34), lt, 0.1);
    animCard(at(label('resbala', 'SE RESBALA', 14), -56, 18), lt, 1.0);
    animCard(at(label('lado', 'SE CAE DE LADO', 14), -56, 2), lt, 1.7);
  }, [[0.1, 'splash'], [1.0, 'whoosh'], [1.45, 'splash'], [1.5, 'burst'], [1.7, 'pop']]);
  shot(412.30, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); fishSwim(T);
    const [px, pz] = B().POND;
    dogAt(gB, px - 0.6, pz - 0.6, 0.4, { ears: 1, wag: 1, wagSpeed: 18, headPitch: 0.15, jaw: 0.25 });
    fishInMouth(true);
    cam(lerp3([px + 0.2, 0.4, pz + 0.3], [px + 0.1, 0.38, pz + 0.2], lt / 1.57), [px - 0.4, 0.33, pz - 0.65], 34, 0.003, T);
    animCard(at(win('consigue', '✓ ¡LO CONSIGUE!'), 0, -38), lt, 0.2);
  }, [[0.2, 'ding']]);
  shot(413.87, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const [px, pz] = B().POND;
    dogAt(gB, px - 0.6, pz - 0.6, 0.4, { ears: 1, wag: 1, wagSpeed: 18, headPitch: -0.2, jaw: Math.max(0, Math.sin(lt * 10)) * 0.4 });
    cam(lerp3([px + 0.6, 0.6, pz + 0.6], [px + 0.5, 0.55, pz + 0.5], lt / 1.32), [px - 0.55, 0.25, pz - 0.6], 38, 0.002, T);
    animCard(at(win('v2', '✓ SEGUNDA VICTORIA'), 0, 34), lt, 0.1);
  }, [[0.1, 'ding'], [0.3, 'crunch']]);
  shot(415.19, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const [px, pz] = B().POND;
    const look = ease.io(seg(lt, 0.4, 1.2));
    dogAt(gB, px - 0.6, pz - 0.6, 0.4, { ears: 1, wag: 0.9, headYaw: 0.9 * look, headPitch: 0.1 });
    const k = ease.in(seg(lt, 0.8, 3.3));
    const h = noseWorld();
    cam(lerp3([px + 0.4, 0.45, pz + 0.2], [h.x + 0.35, h.y + 0.05, h.z + 0.3], k), [h.x - 0.1, h.y, h.z], lerp(40, 28, k), 0.002, T);
    animCard(at(label('duenos', 'LO QUE TODOS LOS DUEÑOS CONOCEN', 12), 0, -38), lt, 1.6);
  }, [[0.4, 'whoosh'], [1.6, 'pop']]);
  shot(418.52, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat); D.root.visible = false;
    const dg = [2.0, 0, 4.7];
    flies(40, [dg[0], 0.45, dg[2]], T);
    cam(lerp3([3.1, 0.6, 5.6], [2.9, 0.5, 5.4], lt / 3.96), [dg[0], 0.2, dg[2]], 40, 0.002, T);
    animCard(at(title('caca', [{ text: 'UNA MONTAÑA DE', px: 12 }, { text: 'EXCREMENTO DE DINOSAURIO', px: 15, color: 0xc8a060 }]), 0, -36), lt, 0.4);
  }, [[0, 'buzz'], [0.4, 'pop']]);
  shot(422.48, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const dg = [2.0, 0, 4.7];
    const down = ease.io(seg(lt, 0, 0.8));
    dogAt(gB, dg[0] + 0.55, dg[2] - 0.25, 2.6, { roll: down, rollSpeed: 9, ears: 0.6, wag: 1, wagSpeed: 18, sit: (1 - down) * 0.3 });
    flies(30, [dg[0], 0.45, dg[2]], T);
    cam(lerp3([dg[0] + 1.6, 0.5, dg[2] + 0.4], [dg[0] + 1.45, 0.45, dg[2] + 0.3], lt / 2.2), [dg[0] + 0.45, 0.15, dg[2] - 0.2], 40, 0.004, T);
    animCard(at(stamp('revuelca', 'SE REVUELCA', 18), -54, 34), lt, 0.5);
  }, [[0.5, 'stamp'], [0.6, 'squish']]);
  shot(424.68, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const dg = [2.0, 0, 4.7];
    dogAt(gB, dg[0] + 0.55, dg[2] - 0.25, 2.6, { roll: 1, rollSpeed: 11, ears: 0.6, wag: 1, wagSpeed: 18 });
    flies(30, [dg[0], 0.45, dg[2]], T);
    cam(lerp3([dg[0] + 0.55, 1.1, dg[2] - 0.25 + 0.05], [dg[0] + 0.55, 0.95, dg[2] - 0.2], lt / 3.18), [dg[0] + 0.55, 0.1, dg[2] - 0.25], 44, 0.003, T, lt * 0.3);
    animCard(at(label('patasaire', 'DE ESPALDA · PATAS AL AIRE', 13), 0, -38), lt, 0.4);
    animCard(at(label('feliz', 'FELIZ DE LA VIDA', 14), 0, 36), lt, 1.8);
  }, [[0.4, 'pop'], [1.8, 'pop'], [0.8, 'squish']]);
  shot(427.86, 'rua', (lt, T) => {
    const k = lt < 1.6 ? 0 : 1;
    placeDog(0.6, 0, -0.3, 0.3);
    poseDog(D, k ? { t: T, roll: 1, rollSpeed: 9, ears: 0.6, wag: 1 } : { t: T, shiver: 0.6, ears: 0.2, tailDown: 0.6 });
    if (!k) W.particles(140, (i) => { const a = hash3(i, 1, 1) * 6.28, r = 0.15 + hash3(i, 2, 1) * 0.25; return { p: [0.6 + Math.cos(a) * r * 1.3, 0.25 + hash3(i, 3, 1) * 0.35 + Math.sin(T * 2 + i) * 0.02, -0.3 + Math.sin(a) * r * 0.7], s: 0.02 + hash3(i, 4, 1) * 0.02, c: 0xf4f8ff }; });
    cam(lerp3([1.6, 0.55, 0.6], [1.45, 0.5, 0.45], lt / 3.7), [0.55, 0.2, -0.3], 36, 0.003, T);
    animCard(at(label('banaste', k ? 'JUSTO DESPUÉS DEL BAÑO' : 'RECIÉN BAÑADO', 14), 0, -38), lt, k ? 1.6 : 0.3);
  }, [[0, 'whoosh'], [0.3, 'bubble'], [1.6, 'pop']]);
  shot(431.57, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.7, headRoll: 0.3, wag: 0.4 });
    cam(lerp3([1.4, 0.55, 1.2], [1.3, 0.52, 1.1], lt / 3.38), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(title('porque', ['¿POR QUÉ LO HACEN?']), 0, 34), lt, 0.1);
    animCard(at(stamp('nadiesabe', 'NADIE LO SABE CON SEGURIDAD', 13), 0, -36), lt, 1.7);
  }, [[0.1, 'pop'], [1.7, 'stamp']]);
  shot(434.95, 'fogueira', (lt, T) => {
    const S = W.cur; S.ancient.root.visible = false;
    D.root.visible = false;
    const w = S.wolf; w.root.visible = true; w.root.position.set(0.9, 0, 0.3); w.root.rotation.set(0, 0.5, 0); poseDog(w, { t: T, roll: 1, rollSpeed: 7, ears: 0.6, wag: 0.6 });
    cam(lerp3([-0.3, 0.6, 1.2], [-0.2, 0.55, 1.1], lt / 4.16), [0.9, 0.15, 0.3], 38, 0.002, T);
    animCard(at(label('lobos', 'ANTEPASADOS LOBOS', 14), -56, 34), lt, 0.6);
    animCard(at(stamp('hipo', 'HIPÓTESIS', 14), 56, -36), lt, 2.0);
  }, [[0.6, 'pop'], [2.0, 'stamp']]);
  shot(439.11, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    dogAt(gB, 1.2, 3.6, 0.6, { ears: 0.6, wag: 0.4 });
    const mix = ease.io(seg(lt, 0.4, 2.4));
    W.particles(220, (i) => { const a = hash3(i, 1, 6) * 6.28 + lt * 0.6, r = 0.3 + hash3(i, 2, 6) * 0.25; const own = hash3(i, 3, 6) > mix; return { p: [1.2 + Math.cos(a) * r, 0.1 + hash3(i, 4, 6) * 0.5 + Math.sin(lt * 2 + i) * 0.03, 3.6 + Math.sin(a) * r], s: 0.012, c: own ? 0xffb070 : 0x7a8a3a }; });
    cam(lerp3([2.2, 0.6, 4.5], [2.05, 0.55, 4.35], lt / 2.95), [1.2, 0.3, 3.6], 38, 0.002, T);
    animCard(at(label('disfrazar', 'OTRO OLOR PARA DISFRAZAR EL PROPIO', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [1.0, 'whoosh']]);
  shot(442.06, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, headPitch: 0.1, wag: 0.3 });
    cam(lerp3([1.35, 0.5, 1.15], [1.25, 0.48, 1.05], lt / 2.66), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(stamp('nocomp', 'NO COMPROBADO', 16), -50, 34), lt, 0.1);
    animCard(at(title('recuerda', [{ text: 'RECUERDA ESTO', px: 16, color: 0xffd36a }]), 0, -36), lt, 1.6);
  }, [[0.1, 'stamp'], [1.6, 'ding']]);
  shot(444.72, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    dogAt(gB, 1.2, 3.6, 0.6, { ears: 0.6, wag: 0.4, shiver: lt < 1 ? 1 : 0 });
    const h = noseWorld(); const k = ease.in(lt / 2.9);
    cam(lerp3([2.4, 0.5, 4.6], [h.x + 0.5, h.y + 0.05, h.z + 0.35], k), [h.x - 0.1, h.y - 0.05, h.z], lerp(40, 30, k), 0.002, T);
    flies(14, [1.2, 0.45, 3.6], T);
    animCard(at(label('importar', 'VA A IMPORTAR', 15), 0, -38), lt, 1.9);
  }, [[0, 'tension'], [1.9, 'pop']]);
}
