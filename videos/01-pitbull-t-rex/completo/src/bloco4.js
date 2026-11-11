// Bloco 4 (727,1 s → 1000,6 s): a noite, o abrigo, o raptor, o amanhecer, o carrapato, o veredito, os riscos, o asteroide e o final.
import * as F from '/videos/engine/lib/fauna.js';
import * as P2 from '/videos/engine/lib/props2.js';
import { poseTrex } from '/videos/engine/lib/world.js';
import { voxelize, jitter, lerpHex } from '/videos/engine/lib/vox.js';
import { fbm } from '/videos/engine/lib/noise.js';
import { makeKit2 } from './kit2.js';

export function addBloco4(K) {
  const { st, W, D, THREE, P, card, stamp, title, label, num, at, anchor, placeDog, cam, bark, yawTo, noseWorld, mouthWorld, person, stars, shot, ease, clamp, lerp, lerp3, seg, poseDog, hash3, makeCard, animCard, subj } = K;
  const X = makeKit2(K);
  const { O, B, E, CL, gO, gB, gC, tick, win, nameCard, scent, flies, rings, lazy, dogAt, dirt } = X;
  const V = new THREE.Vector3();
  const wpos = (o) => { o.getWorldPosition(V); return [V.x, V.y, V.z]; };
  const no = (k, text) => card(k, () => makeCard([{ text, px: 15, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 5 }));
  const flash = (col = 0xd8b080) => { st.veil.material.color.set(col); st.veil.material.opacity = 0.18; };
  const night = (T) => { tick(T); W.mood('noite', B().pmat); stars(1, T); };
  const SH = () => B().SHEL; // abrigo: prato de raízes em x=-3.5; buraco em (-3.95, -4.0)
  const HOLE = [-3.95, -4.0];
  const inHole = (o = {}) => { placeDog(HOLE[0] + 0.05, -0.17, HOLE[1], Math.PI); poseDog(D, { t: K.T, lie: 1, ears: 0.4, headPitch: 0.05, ...o }); };
  const holeCam = (lt, dur, d = 1.35, h = 0.3, fov = 38, sh = 0.0) => cam(lerp3([HOLE[0] - d, h, HOLE[1] + 0.35], [HOLE[0] - d + 0.12, h - 0.02, HOLE[1] + 0.3], lt / dur), [HOLE[0] + 0.05, 0.0, HOLE[1]], fov, sh, K.T);
  const fireflies = (n, c, T, r = 3) => W.particles(n, (i) => { const a = T * (0.3 + hash3(i, 1, 9) * 0.4) + i, b = hash3(i, 2, 9) * 6.28; return { p: [c[0] + Math.cos(a + b) * r * hash3(i, 3, 9), 0.2 + hash3(i, 4, 9) * 1.2 + Math.sin(T * 1.3 + i) * 0.1, c[2] + Math.sin(a * 0.7 + b) * r * hash3(i, 5, 9)], s: 0.012 * (0.5 + 0.5 * Math.sin(T * 4 + i * 1.7)), c: 0xd8ff7a }; });
  const raptor = () => { const R = B().raptor; R.root.visible = true; subj(R.root); return R; };
  const frog = () => lazy('frog', () => { const f = P.shapes([{ t: 'ell', c: [0, 0.03, 0], r: [0.05, 0.03, 0.045], col: (p, x, y, z) => jitter(p[1] > 0.04 ? 0x4a7a2a : 0x8aa04a, x, y, z, 0.08) }, { t: 'sph', c: [0.03, 0.058, 0.022], r: 0.012, col: 0x1a1a10 }, { t: 'sph', c: [0.03, 0.058, -0.022], r: 0.012, col: 0x1a1a10 }, { t: 'ell', c: [-0.03, 0.015, 0.05], r: [0.035, 0.012, 0.015], col: 0x4a7a2a }, { t: 'ell', c: [-0.03, 0.015, -0.05], r: [0.035, 0.012, 0.015], col: 0x4a7a2a }], 0.006); B().group.add(f); return f; }, (f) => f.visible = false);
  const tickOnEar = (show) => { const t = lazy('earTick', () => { const q = F.buildTick({ voxel: 0.0016 }); st.scene.add(q); return q; }, (q) => q.visible = false); if (!show) return t; const e = D.ears[0]; e.updateWorldMatrix(true, false); const p = new THREE.Vector3(0.012, 0.035, 0.03); e.localToWorld(p); t.visible = true; t.position.copy(p); t.quaternion.copy(e.getWorldQuaternion(new THREE.Quaternion())); return t; };

  // ===== a noite =====
  shot(727.12, 'bosque', (lt, T) => {
    tick(T); W.mood('ocaso', B().pmat);
    const x = lerp(1.5, 0.2, lt / 1.11);
    dogAt(gB, x, 1.0, Math.PI, { gait: 'walk', phase: lt * 1.1, ears: 0.4, tailDown: 0.3 });
    cam([x - 2.6, 0.5, 2.2], [x, 0.35, 1.0], 40, 0.002, T);
    animCard(at(label('caetarde', 'CAE LA TARDE', 14), -60, 34), lt, 0.1);
  }, [[0.1, 'pop'], [0, 'night']]);
  shot(728.23, 'bosque', (lt, T) => {
    night(T);
    const x = lerp(0.2, -0.8, lt / 5.5);
    dogAt(gB, x, 1.0, Math.PI - 0.2, { gait: 'walk', phase: lt * 1.0, ears: 0.6, tailDown: 0.5, headYaw: Math.sin(lt * 1.5) * 0.4 });
    cam(lerp3([x + 1.8, 2.4, 3.2], [x + 1.4, 2.6, 3.6], lt / 5.5), [x, 0.3, 1.0], 44, 0.002, T);
    animCard(at(label('oscuridad', 'UN PROBLEMA QUE NINGÚN PITBULL DE CASA CONOCE', 11), 0, -38), lt, 0.6, 3.8);
    animCard(at(stamp('sintecho', 'UNA NOCHE SIN TECHO', 17), 0, 34), lt, 4.0);
  }, [[0.6, 'pop'], [4.0, 'stamp']]);
  shot(733.74, 'bosque', (lt, T) => {
    night(T);
    dogAt(gB, -0.8, 1.0, Math.PI - 0.4, { ears: 0.2, tailDown: 0.8, shiver: ease.io(seg(lt, 2.6, 3.6)), headPitch: -0.15 });
    W.particles(260, (i) => { const k = (lt * 0.12 + hash3(i, 1, 3)) % 1; return { p: [-0.8 + (hash3(i, 2, 3) - 0.5) * 4 + k * 0.6, 0.05 + hash3(i, 3, 3) * 0.6, 1.0 + (hash3(i, 4, 3) - 0.5) * 3], s: 0.025, c: 0x8a9ac8 }; });
    cam(lerp3([0.4, 0.5, 2.0], [0.3, 0.48, 1.85], lt / 6.38), [-0.8, 0.28, 1.0], 38, 0.002, T);
    animCard(at(label('fresca', 'FRESCA Y HÚMEDA', 14), -56, 34), lt, 0.3);
    animCard(at(label('pelocorto2', 'PELO CORTO → TIEMBLA', 14), -56, 18), lt, 3.2);
  }, [[0.3, 'pop'], [0, 'wind'], [3.2, 'pop']]);
  shot(740.12, 'quarto', (lt, T) => {
    W.st.renderer.toneMappingExposure = 0.8;
    placeDog(-0.1, 0.6, -1.15, 0.2); poseDog(D, { t: T, ears: 0.6, wag: 0.6, headPitch: -0.3, crouch: 0.4, dig: lt > 2.6 ? 1 : 0 });
    cam(lerp3([1.2, 1.2, 0.6], [1.1, 1.1, 0.5], lt / 4.6), [-0.3, 0.7, -1.2], 40, 0.002, T);
    animCard(at(label('encasa', 'EN CASA…', 14), -56, 34), lt, 0.2);
    animCard(at(label('cobijas', 'SE METE DEBAJO DE LAS COBIJAS', 13), 0, -38), lt, 2.7);
  }, [[0.2, 'pop'], [2.7, 'pop'], [2.9, 'rustle']]);
  shot(744.72, 'quarto', (lt, T) => {
    W.st.renderer.toneMappingExposure = 0.8;
    const bl = W.cur.blanket; const under = lt > 3.2;
    if (!under) { const turns = ease.io(seg(lt, 0.8, 3.0)); placeDog(-0.4, 0.62, -1.15, turns * Math.PI * 6); poseDog(D, { t: T, gait: 'walk', amt: lt < 3 ? 1 : 0, phase: lt * 1.6, ears: 0.6, wag: 0.6 }); }
    else { bl.visible = true; placeDog(-0.45, 0.48, -1.15, 0.0); poseDog(D, { t: T, lie: 1, ears: 0.2, headPitch: 0.1 }); }
    cam(lerp3([0.6, 1.4, 0.4], [0.5, 1.3, 0.3], lt / 4.8), [-0.35, 0.65, -1.15], 40, 0.002, T);
    animCard(at(label('tunel', 'UN TÚNEL', 13), -56, 34), lt, 0.1);
    animCard(at(card('3vueltas', () => makeCard([{ text: '3', px: 22, color: 0xe0862f }, { text: 'VUELTAS', px: 11 }], { padX: 7, padY: 5 })), -56, 14), lt, 1.0);
    animCard(at(label('solonariz', 'SOLO SE LE VE LA NARIZ', 13), 0, -38), lt, 3.3);
  }, [[0.1, 'pop'], [1.0, 'pop'], [1.2, 'step'], [3.3, 'pop']]);
  shot(749.52, 'bosque', (lt, T) => {
    night(T);
    const k = lt / 2.28, x = lerp(-1.5, -2.6, k), z = lerp(-1.6, -3.0, k);
    dogAt(gB, x, z, yawTo(-1.1, -1.4), { gait: 'walk', phase: lt * 1.1, ears: 0.6, sniff: 0.4, shiver: 0.4 });
    cam([x + 1.2, 0.6, z + 1.4], [x - 0.3, 0.25, z - 0.4], 40, 0.002, T);
    animCard(at(label('mismo2', 'AQUÍ HACE EXACTAMENTE LO MISMO', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(751.80, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    cam(lerp3([-6.2, 1.6, -2.2], [-5.9, 1.4, -2.6], lt / 4.64), [-3.6, 0.5, -4.0], 40, 0.002, T);
    animCard(at(label('raices2', 'UN ÁRBOL CAÍDO · RAÍCES LEVANTADAS', 12), 0, 36), lt, 0.3);
    animCard(anchor(win('hueco', 'UN HUECO SECO'), [HOLE[0], 0.0, HOLE[1]], 0, 14), lt, 2.8);
  }, [[0.3, 'pop'], [2.8, 'ding']]);
  shot(756.44, 'bosque', (lt, T) => {
    night(T);
    dogAt(gB, HOLE[0] - 0.55, HOLE[1] + 0.05, 0, { dig: 1, digSpeed: 14, ears: 0.6 });
    dirt(80, [HOLE[0] - 0.3, -0.05, HOLE[1]], [-1, 0.1, 0], lt, [0x3a2a1a, 0x5a4028]);
    cam([HOLE[0] - 1.3, 0.45, HOLE[1] + 1.0], [HOLE[0] - 0.4, 0.1, HOLE[1]], 40, 0.004, T);
    animCard(at(label('escarbapoco', 'ESCARBA UN POCO', 13), -56, 34), lt, 0.1);
  }, [[0.1, 'dig'], [0.1, 'pop']]);
  shot(757.66, 'bosque', (lt, T) => {
    night(T);
    const push = Math.sin(lt * 4) * 0.5 + 0.5;
    dogAt(gB, HOLE[0] - 0.6 + push * 0.08, HOLE[1] + 0.05, 0, { sniff: 1, ears: 0.5, headPitch: -0.2 });
    const n = noseWorld();
    W.particles(30, (i) => { const k = clamp(push); return { p: [n.x + 0.05 + hash3(i, 1, 1) * 0.15 + k * 0.05, -0.08 + hash3(i, 3, 1) * 0.03, n.z + (hash3(i, 2, 1) - 0.5) * 0.25], s: 0.02, c: i % 2 ? 0x6a4a28 : 0x8a6a30, rx: i, ry: i * 2 }; });
    cam([n.x - 0.35, n.y + 0.2, n.z + 0.6], [n.x + 0.1, -0.05, n.z], 36, 0.002, T);
    animCard(at(label('hojas', 'EMPUJA HOJAS CON EL HOCICO', 13), 0, -38), lt, 0.2);
  }, [[0.2, 'rustle']]);
  shot(759.47, 'bosque', (lt, T) => {
    night(T);
    const tr = ease.io(seg(lt, 0, 1.3)), go = ease.io(seg(lt, 1.3, 1.9));
    if (lt < 1.3) dogAt(gB, HOLE[0] - 0.5, HOLE[1], tr * Math.PI * 6, { gait: 'walk', phase: lt * 2, ears: 0.6 });
    else inHole({ lie: go });
    cam([HOLE[0] - 1.6, 0.55, HOLE[1] + 0.6], [HOLE[0] - 0.2, 0.0, HOLE[1]], 40, 0.002, T);
    animCard(at(card('3vueltas2', () => makeCard([{ text: '3', px: 22, color: 0xe0862f }, { text: 'VUELTAS', px: 11 }], { padX: 7, padY: 5 })), -56, 34), lt, 0.1, 1.4);
    animCard(at(win('semete', 'Y SE METE'), -56, 34), lt, 1.5);
  }, [[0.1, 'pop'], [1.5, 'ding']]);
  shot(761.38, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.5 });
    holeCam(lt, 3.23, 1.6, 0.4, 40);
    animCard(at(win('espalda', 'ESPALDA CONTRA LA TIERRA'), -50, 34), lt, 0.2);
    animCard(at(win('entrada', 'UNA SOLA ENTRADA'), -50, 18), lt, 1.6);
  }, [[0.2, 'ding'], [1.6, 'ding']]);
  shot(764.61, 'bosque', (lt, T) => {
    night(T); fireflies(120, [-1, 0, -1], T, 5);
    cam(lerp3([2, 1.2, 3], [1.6, 1.3, 2.6], lt / 2.29), [-3, 0.8, -3], 46, 0.002, T); D.root.visible = false;
    animCard(at(label('nosilenciosa', 'LA NOCHE NO ES SILENCIOSA', 13), 0, -38), lt, 0.2);
  }, [[0, 'night'], [0.2, 'pop']]);
  shot(766.90, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    const f = frog(); const [px, pz] = B().POND; f.visible = true; f.position.set(px - 1.45, B().hB(px - 1.45, pz) + 0.0, pz); f.rotation.y = 0.3;
    f.scale.set(1, 1 + Math.max(0, Math.sin(lt * 6)) * 0.15, 1);
    cam([px - 1.2, 0.12, pz + 0.25], [px - 1.45, 0.04, pz], 32, 0.002, T);
    animCard(at(label('ranas', 'RANAS', 14), -56, 34), lt, 0.1);
  }, [[0.1, 'frog'], [0.6, 'frog']]);
  shot(768.0, 'bosque', (lt, T) => {
    night(T); D.root.visible = false; fireflies(200, [0, 0, 0], T, 2.5);
    cam([1.8, 0.8, 1.2], [0, 0.6, 0], 40, 0.002, T);
    animCard(at(label('insectos2', 'INSECTOS', 14), -56, 34), lt, 0.1);
    animCard(at(label('ramas2', 'RAMAS QUE SE ROMPEN A LO LEJOS', 12), 0, -38), lt, 1.1);
  }, [[0.1, 'buzz'], [1.1, 'snap'], [1.6, 'snap']]);
  shot(771.03, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    [B().multi, B().multi2].forEach((m, i) => { m.root.visible = true; subj(m.root); const k = (lt * 0.25 + i * 0.4) % 1; const x = lerp(-2.5, 0.5, k), z = -1.6 + i * 0.5 + Math.sin(k * 6) * 0.1; m.root.position.set(x, B().hB(x, z), z); m.root.rotation.y = 0; F.poseMammal(m, { t: T, walk: 1, phase: T * 3 + i }); });
    cam([-0.8, 0.25, -0.6], [-1.0, 0.05, -1.5], 40, 0.002, T);
    animCard(at(label('salen', 'LOS MAMÍFEROS SALEN A BUSCAR COMIDA', 12), 0, -38), lt, 0.6);
  }, [[0.6, 'pop'], [0.3, 'step']]);
  shot(775.66, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.7, headPitch: 0.15, sniff: 0.3 });
    const m = B().multi; m.root.visible = true; const x = HOLE[0] - 0.9, z = lerp(HOLE[1] + 0.9, HOLE[1] - 0.9, lt / 2.5); m.root.position.set(x, B().hB(x, z), z); m.root.rotation.y = Math.PI / 2; F.poseMammal(m, { t: T, walk: 1, phase: T * 3 });
    const n = noseWorld();
    scent(40, [x, 0.05, z], [n.x, n.y, n.z], lt, [0xc8a070], 0.1);
    holeCam(lt, 2.49, 1.25, 0.35, 36);
    animCard(at(label('unopor', 'LOS HUELE PASAR, UNO POR UNO', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'sniff']]);
  shot(778.15, 'bosque', (lt, T) => {
    night(T); inHole({ ears: lt > 1.2 ? 1 : 0.4, headPitch: lt > 1.2 ? 0.2 : 0.0, still: 1 });
    const n = noseWorld();
    cam([n.x - 0.55, n.y + 0.1, n.z + 0.25], [n.x + 0.1, n.y, n.z], 32, 0.0, T);
    animCard(at(label('medianoche', 'PASADA LA MEDIANOCHE', 13), -56, 34), lt, 0.1);
  }, [[0.1, 'pop'], [1.2, 'tension']]);
  shot(780.58, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    const R = raptor(); const stop = lt > 2.9; const x = lerp(-6.5, -5.0, clamp(lt / 2.9)), z = HOLE[1] + 0.3;
    R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = -0.15; F.poseRaptor(R, { t: T, walk: stop ? 0 : 1, phase: lt * 1.3, sniff: stop ? 1 : 0 });
    cam([x + 0.6, 0.18, z + 1.2], [x, 0.15, z], 34, 0.002, T);
    animCard(at(label('pasos', 'PASOS LIVIANOS', 13), -56, 34), lt, 0.6);
    animCard(at(label('sedetiene', 'SE DETIENE · OLFATEA', 13), 0, -38), lt, 3.0);
  }, [[0.3, 'stepL'], [0.9, 'stepL'], [1.5, 'stepL'], [2.1, 'stepL'], [3.0, 'sniff'], [3.4, 'sniff']]);
  const sRaptor = (T, o = {}) => { const S = E(); const R = lazy('studioRaptor', () => { const q = F.buildRaptor(); S.group.add(q.root); return q; }, (q) => q.root.visible = false); R.root.visible = true; subj(R.root); R.root.position.set(o.x ?? 0, 0, o.z ?? 0); R.root.rotation.y = o.yaw ?? 0; F.poseRaptor(R, { t: T, ...o }); return R; };
  shot(785.07, 'estudio', (lt, T) => {
    D.root.visible = false; sRaptor(T, { yaw: -0.4, headTilt: Math.sin(lt) * 0.2 });
    cam(lerp3([1.4, 0.8, 1.9], [1.3, 0.75, 1.75], lt / 2.36), [-0.1, 0.6, 0], 40, 0.002, T);
    animCard(at(label('raptores', 'EN HELL CREEK VIVÍAN RAPTORES', 13), 0, 36), lt, 0.1);
  }, [[0.1, 'pop']]);
  shot(787.43, 'estudio', (lt, T) => {
    D.root.visible = false; sRaptor(T, { yaw: -0.4 + lt * 0.2, headTilt: 0.2 });
    cam(lerp3([1.1, 0.9, 1.4], [1.0, 0.85, 1.3], lt / 4.22), [0, 0.7, 0], 38, 0.002, T);
    animCard(at(no('nopelicula', '✗ NO COMO EN LAS PELÍCULAS'), 0, 36), lt, 0.1);
    animCard(at(win('plumas', '✓ TENÍAN PLUMAS'), -56, -36), lt, 1.6);
    animCard(at(win('chicos4', '✓ CASI TODOS MÁS CHICOS'), 56, -36), lt, 3.0);
  }, [[0.1, 'pop'], [1.6, 'ding'], [3.0, 'ding']]);
  shot(791.65, 'estudio', (lt, T) => {
    D.root.visible = false; sRaptor(T, { yaw: -0.8, jaw: Math.max(0, Math.sin(lt * 3)) * 0.4 });
    cam(lerp3([1.7, 1.1, 1.5], [1.6, 1.05, 1.4], lt / 1.97), [0.3, 0.85, 0], 36, 0.002, T);
    animCard(at(nameCard('achero', 'ACHERORAPTOR', 'raptor de Hell Creek'), 0, 34), lt, 0.1);
  }, [[0.1, 'stamp']]);
  shot(793.62, 'estudio', (lt, T) => {
    sRaptor(T, { x: -0.6, z: -0.2, yaw: 0 });
    placeDog(0.9, 0, 0.35, Math.PI); poseDog(D, { t: T, ears: 0.6, headYaw: 0.2 });
    cam(lerp3([0.3, 0.9, 3.2], [0.3, 0.85, 3.0], lt / 2.7), [0.0, 0.5, 0], 42, 0.002, T);
    animCard(at(label('perrogrande', 'TAMAÑO DE UN PERRO GRANDE', 13), 0, 36), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(796.32, 'estudio', (lt, T) => {
    D.root.visible = false; sRaptor(T, { yaw: 0.25 });
    cam(lerp3([-0.6, 0.8, 2.3], [-0.7, 0.8, 2.15], lt / 1.7), [-0.7, 0.75, 0], 40, 0.002, T);
    animCard(at(label('cola', 'COLA LARGUÍSIMA', 14), -56, 34), lt, 0.1);
  }, [[0.1, 'pop']]);
  shot(798.02, 'estudio', (lt, T) => {
    D.root.visible = false; sRaptor(T, { yaw: 0 });
    cam(lerp3([0.35, 0.12, 0.55], [0.3, 0.11, 0.48], lt / 1.59), [0.05, 0.05, 0.09], 32, 0.002, T);
    animCard(at(label('garra', 'GARRA CURVA EN CADA PIE', 13), 0, -38), lt, 0.1);
  }, [[0.1, 'pop'], [0.3, 'snap']]);
  shot(799.61, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1 });
    const R = raptor(); const x = HOLE[0] - 1.6 + Math.sin(lt * 0.8) * 0.3, z = HOLE[1] + 0.4 + Math.cos(lt * 0.8) * 0.3;
    R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = -0.4 + Math.sin(lt * 0.8); F.poseRaptor(R, { t: T, walk: 0.6, phase: lt * 0.9, sniff: 0.5 });
    cam([HOLE[0] + 0.3, 0.38, HOLE[1] + 0.3], [x, 0.4, z], 40, 0.0, T);
    animCard(at(label('nadiesabe2', 'NADIE SABE SI CAZABA DE NOCHE', 12), 0, 36), lt, 0.2);
    animCard(at(stamp('ahiafuera', 'ALGO ESTÁ AHÍ AFUERA', 15), 0, -36), lt, 1.9);
  }, [[0.2, 'pop'], [1.9, 'stamp'], [0.6, 'stepL'], [1.6, 'stepL']]);
  shot(804.24, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1, headPitch: 0.05 });
    const n = noseWorld();
    cam(lerp3([n.x - 0.7, n.y + 0.06, n.z + 0.2], [n.x - 0.5, n.y + 0.05, n.z + 0.15], lt / 5.55), [n.x + 0.1, n.y + 0.03, n.z], 32, 0.0, T);
    animCard(at(num('terq2', '2', 'LA TERQUEDAD'), -56, 32), lt, 1.6);
    animCard(at(win('justo', 'JUSTO LO QUE NECESITA'), 0, -38), lt, 3.5);
  }, [[1.6, 'pop'], [3.5, 'ding']]);
  shot(809.79, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1 });
    cam(lerp3([HOLE[0] - 0.6, 3.6, HOLE[1] + 0.3], [HOLE[0] - 0.55, 3.2, HOLE[1] + 0.25], lt / 4.57), [HOLE[0] - 0.2, 0, HOLE[1]], 40, 0.0, T);
    W.particles(40, (i) => { const k = i / 40; return { p: [HOLE[0] - 1.5 + k * 0.9, 0.05, HOLE[1]], s: 0.03, c: 0xffd36a }; });
    animCard(at(no('noclaro', '✗ CLARO ABIERTO'), -56, 34), lt, 0.2);
    animCard(at(win('unaentrada', '✓ UNA SOLA ENTRADA'), -56, 18), lt, 2.0);
  }, [[0.2, 'pop'], [2.0, 'ding']]);
  shot(814.36, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1, crouch: ease.io(seg(lt, 0.5, 2)) * 0.3 });
    D.body.scale.set(1, 1 + ease.io(seg(lt, 1, 2.5)) * 0.03, 1 + ease.io(seg(lt, 1, 2.5)) * 0.05);
    holeCam(lt, 4.29, 1.1, 0.3, 36);
    animCard(at(card('25kg', () => makeCard([{ text: '25 KG', px: 22, color: 0xe0862f }, { text: 'DE MÚSCULO', px: 11 }], { padX: 8, padY: 5 })), -56, 32), lt, 0.6);
    animCard(at(stamp('noretro2', 'NO PIENSAN RETROCEDER', 14), 0, -36), lt, 2.4);
  }, [[0.6, 'pop'], [2.4, 'stamp']]);
  shot(818.65, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.2, growl: lt > 1.4 ? 1 : 0, still: 1 });
    const n = noseWorld();
    cam([n.x - 0.5, n.y + 0.05, n.z + 0.2], [n.x + 0.05, n.y, n.z], 32, lt > 1.4 ? 0.004 : 0, T);
    animCard(at(no('noladra', '✗ NO LADRA'), -56, 34), lt, 0.1);
    animCard(at(stamp('grune', 'GRUÑE', 18), -56, 16), lt, 1.4);
  }, [[0.1, 'pop'], [1.4, 'growl'], [1.4, 'stamp']]);
  shot(820.76, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.1, growl: 1, still: 1 });
    const c = wpos(D.body);
    W.particles(160, (i) => { const L = i % 4, a = (Math.floor(i / 4) / 40) * 6.28, r = ((lt * 0.5 + L / 4) % 1); return { p: [c[0] - 0.1 + Math.cos(a) * r * 0.4, c[1] + Math.sin(a) * r * 0.3, c[2] + 0.25], s: 0.006 * (1 - r), c: 0xffb070 }; });
    cam([c[0] - 0.95, c[1] + 0.25, c[2] + 0.55], [c[0] - 0.1, c[1], c[2]], 34, 0.004, T);
    animCard(at(label('bajito4', 'BAJITO, DESDE EL FONDO DEL PECHO', 12), 0, -38), lt, 0.2);
  }, [[0.0, 'growl'], [0.2, 'pop']]);
  shot(823.00, 'sala', (lt, T) => {
    W.st.renderer.toneMappingExposure = 0.75;
    placeDog(2.4, 0, 0.6, 0); poseDog(D, { t: T, growl: 1, ears: 0.1 });
    cam(lerp3([3.2, 0.4, 1.6], [3.1, 0.38, 1.5], lt / 4.97), [2.6, 0.3, 0.6], 36, 0.004, T);
    flash(0x203050);
    animCard(at(label('unavez', 'ESE GRUÑIDO QUE ESCUCHASTE UNA SOLA VEZ', 12), 0, -38), lt, 0.6);
  }, [[0.3, 'growl'], [0.6, 'pop']]);
  shot(827.97, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.3, growl: 0.6, still: 1 });
    const R = raptor(); const x = HOLE[0] - 1.3, z = HOLE[1] + 0.25; R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = -0.1;
    const up = ease.io(seg(lt, 0.3, 1.0)); F.poseRaptor(R, { t: T, sniff: 1 - up, headTilt: up * 0.2 });
    cam([x - 1.2, 0.6, z + 1.2], [x + 0.6, 0.3, z - 0.1], 40, 0.0, T);
    animCard(at(label('sedetiene2', 'EL OLFATEO SE DETIENE', 13), 0, -38), lt, 0.6);
  }, [[0.3, 'silence'], [0.6, 'pop']]);
  shot(830.25, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1 });
    const R = raptor(); const x = HOLE[0] - 1.3, z = HOLE[1] + 0.25; R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = -0.1; F.poseRaptor(R, { t: 0, headTilt: 0.2 });
    cam([HOLE[0] + 0.3, 0.38, HOLE[1] + 0.3], [x, 0.4, z], 40, 0.0, T);
  }, [[0, 'silence']]);
  shot(831.91, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 1, still: 1 });
    const R = raptor(); const k = ease.in(seg(lt, 0.1, 1.8)); const x = HOLE[0] - 1.3 - k * 2.2, z = HOLE[1] + 0.25 + k * 1.6;
    R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = lerp(-0.1, 2.5, ease.io(seg(lt, 0, 0.5))); F.poseRaptor(R, { t: T, walk: 1, phase: lt * 1.4 });
    cam([HOLE[0] + 0.3, 0.38, HOLE[1] + 0.3], [x, 0.4, z], 40, 0.0, T);
    animCard(at(label('sealejan', 'LOS PASOS SE ALEJAN', 13), 0, -38), lt, 0.4);
  }, [[0.2, 'stepL'], [0.7, 'stepL'], [1.2, 'stepL'], [0.4, 'pop']]);
  shot(833.71, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    const R = raptor(); const x = HOLE[0] - 4.0, z = HOLE[1] + 1.9;
    R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = lerp(2.5, 2.5 + 2.6, ease.io(seg(lt, 0.4, 1.4))) * (lt < 2.6 ? 1 : 0) + (lt >= 2.6 ? 2.5 : 0); F.poseRaptor(R, { t: T, walk: lt > 2.6 ? 1 : 0, phase: lt * 1.3, headTilt: 0.25 });
    cam([x - 1.4, 0.8, z + 1.0], [x + 0.6, 0.45, z - 0.6], 40, 0.002, T);
    animCard(at(label('ningun', 'NINGÚN CAZADOR METE LA CABEZA AHÍ', 12), 0, -38), lt, 0.4);
  }, [[0.4, 'pop']]);
  shot(837.87, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    const R = raptor(); const k = lt / 3.17; const x = HOLE[0] - 4.0 - k * 2.4, z = HOLE[1] + 1.9 + k * 1.2;
    R.root.position.set(x, B().hB(x, z), z); R.root.rotation.y = 2.6; F.poseRaptor(R, { t: T, walk: 1, phase: lt * 1.3 });
    cam([x + 2.2, 0.9, z + 1.6], [x, 0.45, z], 40, 0.002, T);
    animCard(at(label('masfacil', 'HAY COMIDA MÁS FÁCIL EN OTRA PARTE', 12), 0, -38), lt, 1.0);
  }, [[1.0, 'pop']]);
  // ===== amanhecer =====
  shot(841.04, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    cam(lerp3([-1, 1.4, 1], [-1.2, 1.6, 0.8], lt / 1.02), [-6, 2.5, -8], 46, 0.002, T); D.root.visible = false;
    animCard(at(title('amanece', ['AMANECE']), 0, 34), lt, 0.1);
  }, [[0, 'rise'], [0.1, 'birds']]);
  shot(842.06, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    const k = ease.io(lt / 1.72); const x = lerp(HOLE[0], HOLE[0] - 0.9, k);
    dogAt(gB, x, HOLE[1], Math.PI, { gait: 'walk', phase: lt * 1.2, ears: 0.6, wag: 0.3 });
    D.root.position.y = Math.max(D.root.position.y, lerp(-0.17, 0, k));
    cam([HOLE[0] - 1.9, 0.4, HOLE[1] + 0.6], [x, 0.2, HOLE[1]], 40, 0.002, T);
  }, [[0.3, 'step']]);
  shot(843.78, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    const b1 = Math.sin(clamp(lt / 2.6) * Math.PI);
    dogAt(gB, HOLE[0] - 0.95, HOLE[1], Math.PI, { bow: b1, ears: 0.4, wag: 0.5, jaw: b1 * 0.4 });
    cam([HOLE[0] - 1.0, 0.35, HOLE[1] + 1.1], [HOLE[0] - 1.1, 0.15, HOLE[1]], 40, 0.002, T);
    animCard(at(label('adelante2', 'PRIMERO LAS PATAS DE ADELANTE', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [0.5, 'yawn']]);
  shot(846.45, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    const b2 = Math.sin(clamp(lt / 1.6) * Math.PI);
    dogAt(gB, HOLE[0] - 0.95, HOLE[1], Math.PI, { stretchBack: b2, ears: 0.4, wag: 0.5 });
    cam([HOLE[0] - 1.0, 0.35, HOLE[1] + 1.1], [HOLE[0] - 1.0, 0.15, HOLE[1]], 40, 0.002, T);
    animCard(at(label('atras', 'DESPUÉS LAS DE ATRÁS', 12), 0, -38), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(848.09, 'sala', (lt, T) => {
    const b = Math.sin(clamp(lt / 2.0) * Math.PI);
    placeDog(-0.4, 0, -0.15, -0.6); poseDog(D, { t: T, bow: b, ears: 0.4, wag: 0.6 });
    cam(lerp3([0.8, 0.5, 1.0], [0.7, 0.48, 0.9], lt / 2.0), [-0.4, 0.2, -0.15], 38, 0.002, T);
    animCard(at(label('cadamanana', 'COMO CADA MAÑANA EN TU CASA', 12), 0, -38), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(850.09, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    dogAt(gB, HOLE[0] - 0.95, HOLE[1], Math.PI, { ears: 0.5, headYaw: -0.3 });
    const t2 = tickOnEar(true); const p = t2.position;
    const k = ease.in(seg(lt, 0.4, 2.0));
    cam(lerp3([p.x + 0.4, p.y + 0.2, p.z + 0.6], [p.x + 0.15, p.y + 0.08, p.z + 0.22], k), [p.x, p.y, p.z], lerp(36, 28, k), 0.0, T);
    animCard(at(stamp('garrapata', 'UNA GARRAPATA', 16), 0, -36), lt, 2.0);
  }, [[0.5, 'tension'], [2.0, 'stamp']]);
  shot(853.13, 'bosque', (lt, T) => {
    tick(T); W.mood('alba', B().pmat);
    dogAt(gB, HOLE[0] - 0.95, HOLE[1], Math.PI, { ears: 0.5, headYaw: -0.3 });
    const t2 = tickOnEar(true); const p = t2.position;
    cam([p.x + 0.16, p.y + 0.1, p.z + 0.24], [p.x, p.y, p.z], 28, 0.0, T);
    animCard(at(label('yaestaban', 'YA ESTABAN AQUÍ', 13), 0, -38), lt, 0.4);
  }, [[0.4, 'pop']]);
  shot(855.60, 'estudio', (lt, T) => {
    D.root.visible = false;
    const A = W.cur.amber; A.group.visible = true; A.group.position.set(0, 0.12, 0); A.group.rotation.y = lt * 0.3;
    const tk = W.cur.tick; tk.visible = true; tk.position.set(0.02, 0.115, 0.0); tk.rotation.set(0, lt * 0.3, 0); tk.scale.setScalar(0.9);
    W.spot.intensity = 70; W.spot.color.set(0xffe0b0);
    cam(lerp3([0.35, 0.22, 0.3], [0.3, 0.2, 0.26], lt / 7.35), [0, 0.12, 0], 32, 0.001, T);
    animCard(at(label('ambar', 'ATRAPADA EN ÁMBAR', 13), -56, 34), lt, 0.2);
    animCard(at(label('pluma', 'AGARRADA A UNA PLUMA DE DINOSAURIO', 12), 0, -38), lt, 2.2, 4.3);
    animCard(at(card('99m', () => makeCard([{ text: '99', px: 22, color: 0xe0862f }, { text: 'MILLONES DE AÑOS', px: 11 }], { padX: 8, padY: 5 })), 56, 32), lt, 4.5);
  }, [[0.2, 'pop'], [2.2, 'pop'], [4.5, 'pop']]);
  shot(862.95, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, wag: 0.4 });
    cam(lerp3([1.5, 0.6, 1.3], [1.35, 0.55, 1.15], lt / 3.52), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(card('66m4', () => makeCard([{ text: '66', px: 22, color: 0xe0862f }, { text: 'MILLONES DE AÑOS AL PASADO', px: 10 }], { padX: 8, padY: 5 })), -56, 32), lt, 0.3);
  }, [[0.3, 'pop'], [0, 'whoosh']]);
  shot(866.47, 'rua', (lt, T) => {
    placeDog(1.8, 0, 0.8, 0.4); poseDog(D, { t: T, sit: 1, ears: 0.6, headRoll: Math.sin(lt * 14) * 0.25, headPitch: -0.1 });
    D.legs.RL.up.rotation.z += 0.9 + Math.sin(lt * 22) * 0.25; D.legs.RL.lo.rotation.z -= 0.6;
    cam(lerp3([2.8, 0.55, 1.7], [2.7, 0.52, 1.6], lt / 3.38), [1.8, 0.3, 0.8], 38, 0.002, T);
    animCard(at(label('parque', 'LO MISMO QUE EN EL PARQUE', 13), 0, -38), lt, 1.8);
  }, [[0.4, 'scratch'], [1.8, 'pop']]);
  // ===== veredito =====
  shot(869.85, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat); D.root.visible = false;
    cam(lerp3([8, 3, 4], [7, 3.4, 5], lt / 2.42), [0, 0.5, -6], 46, 0.002, T);
    animCard(at(title('respondamos', ['RESPONDAMOS LA PREGUNTA']), 0, 34), lt, 0.2);
  }, [[0.2, 'stamp']]);
  shot(872.27, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat);
    dogAt(gO, 9.6, 0.9, -1.0, { ears: 0.7, wag: 0.5, headPitch: 0.15 });
    cam(lerp3([10.8, 0.6, -0.6], [10.7, 0.58, -0.5], lt / 3.34), [9.7, 0.35, 0.8], 38, 0.002, T);
    animCard(at(card('sobrevive', () => makeCard([{ text: '¿SOBREVIVE LA PRIMERA NOCHE?', px: 14 }], { padX: 7, padY: 5 })), 0, 34), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(875.61, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat);
    dogAt(gO, 9.6, 0.9, -1.0, { ears: 1, wag: 1, wagSpeed: 18, headPitch: 0.2, jaw: 0.3, pant: 1 });
    cam([10.8, 0.6, -0.6], [9.7, 0.35, 0.8], 38, 0.004, T);
    animCard(at(card('si', () => makeCard([{ text: 'SÍ', px: 30, color: 0xeaffea }], { bg: 0x2e7a3a, border: 0x14401c, padX: 10, padY: 6 })), 0, 34), lt, 0.05);
  }, [[0.05, 'stamp'], [0.1, 'ding']]);
  shot(876.19, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, wag: 0.4 });
    cam(lerp3([1.4, 0.5, 1.2], [1.3, 0.48, 1.1], lt / 1.92), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(no('fuerte2', '✗ NO POR SER EL MÁS FUERTE'), 0, -38), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(878.11, 'orilla', (lt, T) => {
    tick(T);
    dogAt(gO, 0.25, 0.18, Math.PI / 2, { drink: 1, ears: 0.4, wag: 0.4 });
    cam([1.5, 0.45, 0.6], [0.25, 0.1, -0.1], 36, 0.002, T); flash();
    animCard(at(win('r1', '✓ BEBIÓ DONDE SE VEÍA EL FONDO'), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0.3, 'ding']]);
  shot(881.39, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, -3.95, 2.95, yawTo(-0.8, -0.45), { ears: 0.2, headPitch: -0.1 });
    const dd = B().didel; dd.root.visible = true; subj(dd.root); dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 0.6 });
    cam([-3.45, 0.4, 1.45], [-4.25, 0.22, 2.78], 38, 0.002, T); flash();
    animCard(at(win('r2', '✓ SUPO LEER A UN ANIMALITO'), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0.3, 'ding']]);
  const herdQuiet = (T) => CL().herd.forEach((e) => { e.root.visible = true; const [x, z, r] = e.home; e.root.position.set(x, CL().hC(x, z), z); e.root.rotation.y = r; F.poseEdmonto(e, { headUp: 1, t: T }); });
  shot(884.45, 'claro', (lt, T) => {
    tick(T); herdQuiet(518); D.root.visible = false;
    cam([4, 2.4, -7], [24, 3.2, 1], 40, 0.002, T); flash();
    animCard(at(win('r3', '✓ Y A UNA MANADA CALLADA'), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0.3, 'ding']]);
  shot(886.56, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const dg = [2.0, 0, 4.7];
    dogAt(gB, dg[0] + 0.55, dg[2] - 0.25, 2.6, { roll: 1, rollSpeed: 11, ears: 0.6, wag: 1, wagSpeed: 18 });
    cam([dg[0] + 1.5, 0.5, dg[2] + 0.4], [dg[0] + 0.45, 0.15, dg[2] - 0.2], 40, 0.004, T); flash();
    animCard(at(win('r4', '✓ SE REVOLCÓ EN ALGO ASQUEROSO'), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0.3, 'ding'], [0.6, 'squish']]);
  shot(889.26, 'claro', (lt, T) => {
    tick(T);
    dogAt(gC, 0.12, 0.12, -0.08, { lie: 1, ears: 1, still: 1 });
    const R = CL().trex; R.root.visible = true; R.root.position.set(44, CL().hC(44, 10), 10); R.root.rotation.y = yawTo(6, 18); poseTrex(R, { phase: T * 0.3, walk: 1 });
    cam([-1.1, 0.95, 0.6], [44, 4, 10], 24, 0.001, T); flash();
    animCard(at(win('r5', '✓ NO FUE A INVESTIGAR EL RUIDO'), 0, -38), lt, 0.6);
  }, [[0, 'whoosh'], [0.6, 'ding']]);
  shot(893.52, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.5, tailDown: 0.3 });
    cam(lerp3([1.6, 0.6, 1.4], [1.45, 0.55, 1.25], lt / 4.16), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(title('cuanto4', ['¿CUÁNTO DURARÍA?']), 0, 34), lt, 0.2);
    animCard(at(stamp('dificil', 'LA PARTE DIFÍCIL', 15), 0, -36), lt, 2.6);
  }, [[0.2, 'pop'], [2.6, 'stamp']]);
  shot(897.68, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat);
    const x = 10.5 - lt * 0.35;
    dogAt(gO, x, -1.6, Math.PI, { gait: 'walk', phase: lt * 1.1, ears: 0.5, tailDown: 0.2 });
    cam([x - 1.2, 0.5, -0.4], [x, 0.3, -1.6], 40, 0.002, T);
    const day = lt < 2.97 ? 'HOY' : lt < 3.86 ? 'MAÑANA' : 'PASADO MAÑANA';
    animCard(at(card('dia' + day, () => makeCard([{ text: day, px: 16, color: 0xffd36a }], { bg: 0x16191c, border: 0x3a3f46, padX: 7, padY: 5 })), 56, 32), lt, day === 'HOY' ? 0.2 : day === 'MAÑANA' ? 2.97 : 3.86);
    animCard(at(label('repetir', 'TODO LO QUE LO SALVÓ, OTRA VEZ', 12), 0, -38), lt, 0.6);
  }, [[0.2, 'tick'], [2.97, 'tick'], [3.86, 'tick'], [0.6, 'pop']]);
  shot(902.81, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat);
    dogAt(gO, 0.25, 0.25, Math.PI / 2, { ears: 0.8, headPitch: -0.2 });
    W.particles(120, (i) => { const n = Math.floor(i / 20), j = i % 20; const x = -1.5 + n * 0.9, z = 0.55 + (n % 2) * 0.25; const a = j / 20 * 6.28; return { p: [x + Math.cos(a) * 0.15, O().hO(x, z) + 0.03, z + Math.sin(a) * 0.22], s: 0.025, c: 0x4a3420 }; });
    cam(lerp3([0.8, 0.9, 1.6], [0.7, 0.85, 1.5], lt / 4.33), [0.0, 0.1, 0.3], 40, 0.002, T);
    animCard(at(num('agua1', '1', 'EL AGUA'), -56, 32), lt, 0.1);
    animCard(at(label('duenio', 'EL RÍO TIENE DUEÑO', 14), 0, -38), lt, 2.2);
  }, [[0.1, 'pop'], [2.2, 'pop']]);
  shot(907.14, 'bosque', (lt, T) => {
    tick(T);
    const x = lerp(1.5, 0.3, lt / 5.66);
    dogAt(gB, x, 1.3, Math.PI, { gait: 'walk', phase: lt * 0.8, ears: 0.3, tailDown: 0.7, headPitch: -0.15 });
    cam(lerp3([x - 1.4, 0.5, 2.2], [x - 1.2, 0.48, 2.0], lt / 5.66), [x, 0.3, 1.3], 40, 0.002, T);
    animCard(at(num('comida1', '2', 'LA COMIDA'), -56, 32), lt, 0.1);
    animCard(at(label('mil', '+1000 KCAL CADA DÍA', 13), 56, 32), lt, 0.9);
    animCard(at(label('debil', 'CADA DÍA SIN COMER: MÁS DÉBIL', 12), 0, -38), lt, 5.8 - 0.1);
  }, [[0.1, 'pop'], [0.9, 'pop'], [5.7, 'pop']]);
  shot(912.80, 'bosque', (lt, T) => {
    tick(T);
    dogAt(gB, 0.3, 1.3, Math.PI, { lie: ease.io(seg(lt, 0.3, 1.5)), ears: 0.2, tailDown: 1, headPitch: -0.2 });
    cam([-0.6, 0.4, 2.1], [0.3, 0.2, 1.3], 38, 0.002, T);
    animCard(at(label('debil2', 'UN DÍA MÁS DÉBIL', 13), 0, -38), lt, 0.6);
  }, [[0.6, 'pop']]);
  shot(915.24, 'orilla', (lt, T) => {
    tick(T);
    dogAt(gO, 9.6, 0.9, -1.0, { ears: 0.3, headPitch: -0.5, sniff: 0.5, tailDown: 0.5 });
    const p = wpos(D.legs.FL.lo);
    W.particles(20, (i) => ({ p: [p[0] + 0.02 + (hash3(i, 1, 1) - 0.5) * 0.03, p[1] - 0.12 + hash3(i, 2, 1) * 0.03, p[2] + 0.04], s: 0.008, c: 0xa02020 }));
    cam(lerp3([p[0] + 0.5, 0.25, p[2] + 0.45], [p[0] + 0.4, 0.22, p[2] + 0.38], lt / 4.36), [p[0], 0.1, p[2]], 34, 0.002, T);
    animCard(at(num('heridas', '3', 'LAS HERIDAS'), -56, 32), lt, 0.1);
    animCard(at(no('veterinario', '✗ SIN VETERINARIO'), 0, -38), lt, 1.6);
  }, [[0.1, 'pop'], [1.6, 'pop']]);
  shot(919.60, 'orilla', (lt, T) => {
    tick(T);
    dogAt(gO, 9.6, 0.9, -1.0, { ears: 0.3, headPitch: -0.5, tailDown: 0.5 });
    const p = wpos(D.legs.FL.lo);
    flies(20, [p[0], p[1] - 0.05, p[2]], T);
    cam([p[0] + 0.6, 0.35, p[2] + 0.6], [p[0], 0.12, p[2]], 36, 0.002, T);
    animCard(at(label('barro', 'BARRO · BACTERIAS · GARRAPATAS', 13), 0, -38), lt, 0.2);
  }, [[0.2, 'pop'], [0, 'buzz']]);
  shot(922.31, 'bosque', (lt, T) => {
    night(T); D.root.visible = false;
    cam(lerp3([0, 1.0, 2], [-0.4, 1.1, 1.6], lt / 2.46), [-4, 1.0, -3], 44, 0.002, T);
    animCard(at(num('cazadores', '4', 'LOS CAZADORES QUE NO CONOCE'), 0, -34), lt, 0.2);
  }, [[0.2, 'pop'], [0, 'tension']]);
  shot(924.77, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = CL().trex; R.root.visible = true; R.root.scale.setScalar(0.45); subj(R.root);
    const x = lerp(30, 16, lt / 4.52), z = 6; R.root.position.set(x, CL().hC(x, z) - 0.03, z); R.root.rotation.y = Math.PI; poseTrex(R, { phase: lt * 1.4, walk: 1.4, headPitch: -0.1 });
    cam([x - 6, 1.2, z + 5], [x, 1.5, z], 38, 0.006, T);
    animCard(at(label('jovenes', 'TIRANOSAURIOS JÓVENES', 13), -50, 34), lt, 0.2);
    animCard(at(win('rapidos', 'MÁS LIVIANOS · MÁS RÁPIDOS'), 0, -38), lt, 1.8);
  }, [[0.2, 'pop'], [0.4, 'thud'], [1.0, 'thud'], [1.8, 'ding']]);
  K.onReset(() => { const S = W.sets.claro; if (S) S.trex.root.scale.setScalar(1); });
  shot(929.29, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = lazy('dakota', () => { const q = F.buildRaptor({ size: 2.2, voxel: 0.012 }); CL().group.add(q.root); return q; }, (q) => q.root.visible = false);
    R.root.visible = true; subj(R.root); const x = lerp(8, 4, lt / 4.14), z = 3; R.root.position.set(x, CL().hC(x, z), z); R.root.rotation.y = Math.PI - 0.3; F.poseRaptor(R, { t: T, walk: 1, phase: lt * 1.1 });
    cam([x - 3.5, 1.4, z + 4], [x - 0.5, 1.2, z], 38, 0.003, T);
    animCard(at(nameCard('dakota', 'DAKOTARAPTOR', 'raptor más grande'), -50, 34), lt, 0.2);
    animCard(at(card('5m', () => makeCard([{ text: '≈ 5 M', px: 20, color: 0xe0862f }], { padX: 7, padY: 5 })), 56, -34), lt, 2.6);
  }, [[0.2, 'stamp'], [2.6, 'pop'], [0.5, 'stepL'], [1.5, 'stepL']]);
  shot(933.43, 'claro', (lt, T) => {
    tick(T); W.mood('meio');
    const x = lerp(-2, 2, lt / 6.15);
    dogAt(gC, x, 2.5, -0.1, { gait: 'walk', phase: lt * 1.1, ears: 0.6 });
    cam(lerp3([x - 6, 7, 10], [x - 4, 9, 12], lt / 6.15), [x, 0, 2.5], 44, 0.002, T);
    animCard(at(no('sinhueco', '✗ SIN UN HUECO CON UNA SOLA ENTRADA'), 0, 34), lt, 0.6);
    animCard(at(label('ventaja', 'LA TERQUEDAD DEJA DE SER UNA VENTAJA', 12), 0, -38), lt, 3.2);
  }, [[0.6, 'pop'], [3.2, 'pop']]);
  shot(939.58, 'sala', (lt, T) => {
    const p = person(0.6, -0.6, -2.4, { armR: -2.2, headPitch: 0.35 });
    p.arms[1].rotation.x = -2.0 + Math.sin(lt * 10) * 0.15;
    placeDog(0.1, 0, 0.1, 0.9); poseDog(D, { t: T, sit: 1, ears: 0, headPitch: 0.25, tailDown: 1 });
    cam(lerp3([-0.9, 0.7, 1.4], [-0.8, 0.68, 1.3], lt / 2.94), [0.4, 0.6, -0.3], 42, 0.002, T);
    animCard(at(label('regañas', 'EN CASA, LO REGAÑAS', 13), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(942.52, 'claro', (lt, T) => {
    tick(T); W.mood('ocaso');
    dogAt(gC, 0.5, 2.5, -0.1, { ears: 0.5, tailDown: 0.4 });
    cam(lerp3([-3, 0.4, 4.5], [-2.6, 0.4, 4.2], lt / 2.68), [0.5, 0.3, 2.5], 38, 0.002, T);
    animCard(at(stamp('error', 'UN SOLO ERROR PUEDE SER EL ÚLTIMO', 14), 0, 34), lt, 0.4);
  }, [[0.4, 'stamp']]);
  shot(945.20, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, wag: 0.3 });
    cam(lerp3([1.6, 0.6, 1.4], [1.5, 0.58, 1.3], lt / 3.18), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(label('sisigue', 'SI SIGUE COMO EL PRIMER DÍA…', 13), 0, 36), lt, 0.1);
    animCard(at(card('dias', () => makeCard([{ text: 'DÍAS', px: 28, color: 0xffd36a }], { bg: 0x16191c, border: 0xe0862f, padX: 10, padY: 6 })), 0, -34), lt, 2.6);
  }, [[0.1, 'pop'], [2.6, 'stamp']]);
  shot(948.38, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.6, wag: 0.5 });
    cam(lerp3([1.5, 0.58, 1.3], [1.4, 0.56, 1.2], lt / 2.42), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(card('semanas', () => makeCard([{ text: 'CON MUCHA SUERTE', px: 12 }, { text: 'ALGUNAS SEMANAS', px: 20, color: 0xffd36a }], { bg: 0x16191c, border: 0xe0862f, padX: 10, padY: 6 })), 0, -32), lt, 0.3);
  }, [[0.3, 'stamp']]);
  shot(950.80, 'orilla', (lt, T) => {
    tick(T); W.mood('alba', O().wmat);
    dogAt(gO, 10.6, -1.9, Math.PI / 2 + 0.2, { sit: 1, ears: 0.6, headPitch: 0.1 });
    cam(lerp3([11.6, 0.5, -0.4], [11.8, 0.7, -0.1], lt / 3.77), [9.5, 0.4, -6], 40, 0.002, T);
    animCard(at(no('nodebil', '✗ NO PORQUE SEA DÉBIL'), 0, 34), lt, 0.1);
    animCard(at(label('maldia', 'AQUÍ NO SE PUEDE TENER UN MAL DÍA', 12), 0, -38), lt, 1.4);
  }, [[0.1, 'pop'], [1.4, 'pop']]);
  // ===== asteroide =====
  const strata = () => lazy('strata', () => { const m = voxelize((p, x, y, z) => { const L = Math.floor((p[1] + fbm(p[0] * 3, p[2] * 3, 2) * 0.05) / 0.08); if (Math.abs(p[1] - 0.62) < 0.012) return 0x1a1410; return jitter([0xb89a70, 0xa07a50, 0xc8b088, 0x8a6a48, 0xd8c8a0][L % 5], x, y, z, 0.05); }, [-0.5, 0, -0.3], [0.5, 0.75, 0.3], 0.02, { cast: true }); E().group.add(m); return m; }, (m) => m.visible = false);
  shot(954.57, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 1, headRoll: 0.25 });
    cam([1.3, 0.5, 1.1], [0, 0.3, 0], 36, 0.002, T);
    animCard(at(label('detalle', 'AH… UN DETALLE MÁS', 14), 0, -38), lt, 0.2);
  }, [[0.2, 'pop']]);
  shot(956.34, 'mapa', (lt, T) => {
    cam(lerp3([236, 7, 8], [238.5, 4, 4], lt / 3.13), [240, 0, -1], 42, 0.002, T);
    animCard(at(title('ultimo', [{ text: 'EL ÚLTIMO CAPÍTULO', px: 16 }, { text: 'DE LOS DINOSAURIOS', px: 11 }]), 0, 34), lt, 0.3);
  }, [[0.3, 'stamp']]);
  shot(959.47, 'estudio', (lt, T) => {
    D.root.visible = false; const s = strata(); s.visible = true; s.position.set(0, 0, 0); s.rotation.y = -0.4 + lt * 0.05;
    cam(lerp3([1.0, 0.7, 1.3], [0.9, 0.68, 1.15], lt / 3.53), [0, 0.45, 0], 36, 0.002, T);
    animCard(anchor(label('kpg', 'AQUÍ CAE EL ASTEROIDE', 12), [0.5, 0.62, 0.3], 30, 0), lt, 1.4);
    animCard(at(label('rocas', 'LAS ROCAS TERMINAN AQUÍ', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [1.4, 'pop']]);
  shot(963.00, 'estudio', (lt, T) => {
    D.root.visible = false;
    const slab = lazy('fossil', () => { const g = new THREE.Group(); g.add(P.shapes([{ t: 'box', c: [0, 0.03, 0], h: [0.45, 0.03, 0.3], col: (p, x, y, z) => jitter(0xc8b48a, x, y, z, 0.06) }], 0.012)); const f = F.buildFish({ len: 0.5, gar: 0, col: 0x6a5a40, belly: 0x5a4a34 }); f.root.position.set(0, 0.065, 0); f.root.rotation.x = -Math.PI / 2; g.add(f.root); E().group.add(g); return g; }, (g) => g.visible = false);
    slab.visible = true; slab.position.set(0, 0.0, 0); slab.rotation.y = lt * 0.1;
    cam(lerp3([0.5, 0.6, 0.6], [0.45, 0.55, 0.55], lt / 5.74), [0, 0.05, 0], 36, 0.002, T);
    animCard(at(label('pecesfosiles', 'PECES FÓSILES DE ESE MISMO DÍA', 12), 0, 36), lt, 0.3);
    animCard(at(card('primavera', () => makeCard([{ text: 'EN PRIMAVERA', px: 18, color: 0xb8f08a }], { padX: 8, padY: 5 })), 0, -34), lt, 3.4);
  }, [[0.3, 'pop'], [3.4, 'stamp']]);
  shot(968.74, 'claro', (lt, T) => {
    tick(T); W.mood('alba');
    dogAt(gC, 0.12, 2.0, 0.6, { sit: 1, ears: 0.8, headPitch: 0.45 });
    const A = lazy('asteroid', () => { const a = P2.buildAsteroid(0.4); CL().group.add(a); return a; }, (a) => a.visible = false);
    A.visible = true; const k = lt / 4.55; A.position.set(lerp(60, 45, k), lerp(55, 42, k), lerp(-70, -55, k)); A.scale.setScalar(9); A.rotation.set(lt * 0.3, lt * 0.2, 0);
    W.particles(200, (i) => { const u = i / 200; return { p: [A.position.x + u * 60 + Math.sin(i) * u * 3, A.position.y + u * 44, A.position.z - u * 52], s: (1.6 - u) * 4, c: i % 3 ? 0xffd090 : 0xff8040 }; });
    cam([-1.5, 0.4, 3.5], [40, 40, -60], 46, 0.002, T);
    animCard(at(label('ultimoano', 'UNA MAÑANA DE PRIMAVERA DE ESE ÚLTIMO AÑO…', 11), 0, -38), lt, 0.8);
  }, [[0, 'rumble'], [0.8, 'pop']]);
  shot(973.29, 'claro', (lt, T) => {
    tick(T); W.mood('alba'); D.root.visible = false;
    st.veil.material.color.set(0x000000); st.veil.material.opacity = clamp(lt / 0.8) * 0.82;
    cam([-1.5, 0.4, 3.5], [40, 40, -60], 46, 0.0, T);
    animCard(at(title('otrovideo', [{ text: 'BUENO… ESE ES OTRO VIDEO', px: 15 }]), 0, 0), lt, 0.4);
  }, [[0.4, 'pop']]);
  // ===== final =====
  shot(975.25, 'sala', (lt, T) => {
    placeDog(-0.7, 0.56, -1.78, -0.25); poseDog(D, { t: T, lie: 1, headPitch: 0.05, headYaw: 0.4, ears: 0.5, wag: 0.4, wagSpeed: 6 });
    cam(lerp3([1.0, 0.85, 0.9], [0.6, 0.78, 0.4], ease.out(lt / 1.92)), [-0.5, 0.72, -1.75], 38, 0.003, T);
    animCard(at(stamp('suyo3', 'EL SOFÁ ES SUYO', 15), 50, 30), lt, 0.3);
  }, [[0.3, 'stamp']]);
  shot(977.17, 'sala', (lt, T) => {
    placeDog(2.55, 0, 0.8, 0); poseDog(D, { t: T, sit: 1, ears: 0.6, wag: 0.5, headPitch: 0.1 });
    cam([3.15, 0.62, 2.1], [2.75, 0.55, 0.75], 44, 0.003, T);
    animCard(at(stamp('suya2', 'LA PUERTA ES SUYA', 15), -50, 30), lt, 0.2);
  }, [[0.2, 'stamp']]);
  shot(978.54, 'sala', (lt, T) => {
    placeDog(-0.4, 0.02, -0.15, -0.6); poseDog(D, { t: T, lie: 1, ears: lt > 0.4 ? 1 : 0.2, headYaw: lt > 0.4 ? 0.7 : 0, headPitch: 0.1 });
    cam([0.6, 0.45, 1.3], [-0.2, 0.25, -0.2], 40, 0.002, T);
    animCard(at(stamp('ruido2', 'CADA RUIDO ES ASUNTO SUYO', 14), 0, -36), lt, 0.5);
  }, [[0.3, 'knock'], [0.5, 'stamp']]);
  shot(980.63, 'claro', (lt, T) => {
    tick(T);
    dogAt(gC, 0.12, 2.0, 0.6, { ears: 0.5, headPitch: 0.1 });
    cam(lerp3([-1.4, 1.2, 4.0], [-1.0, 1.6, 4.6], lt / 2.4), [2, 0.5, 0], 44, 0.002, T);
    animCard(at(title('nadasuyo', [{ text: 'EN HELL CREEK', px: 11 }, { text: 'NADA ES SUYO', px: 17, color: 0xe0862f }]), 0, 34), lt, 0.3);
  }, [[0.3, 'stamp']]);
  shot(983.03, 'orilla', (lt, T) => { tick(T); D.root.visible = false; cam([8, 2.5, 3.5], [0, 0, -8], 46, 0.002, T); animCard(at(no('nirio', 'NI EL RÍO'), 0, -38), lt, 0.05); }, [[0.05, 'pop']]);
  shot(983.97, 'claro', (lt, T) => { tick(T); D.root.visible = false; herdQuiet(T); cam([4, 2.4, -7], [24, 3.2, 1], 40, 0.002, T); animCard(at(no('niclaro', 'NI EL CLARO'), 0, -38), lt, 0.05); }, [[0.05, 'pop']]);
  shot(984.91, 'claro', (lt, T) => { tick(T); dogAt(gC, 0.12, 0.12, -0.08, { lie: 1, ears: 1, still: 1 }); const n = noseWorld(); cam([n.x - 0.12, n.y + 0.12, n.z + 0.6], [n.x - 0.22, n.y + 0.05, n.z], 30, 0.0, T); animCard(at(no('nisilencio', 'NI EL SILENCIO'), 0, -38), lt, 0.05); }, [[0.05, 'pop']]);
  shot(985.71, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.2, headPitch: -0.1, still: 0 });
    holeCam(lt, 4.67, 1.6, 0.45, 40);
    animCard(at(label('esanoche', 'PERO ESA PRIMERA NOCHE…', 13), 0, 36), lt, 0.2);
    animCard(at(win('fuesuyo', 'UN HUECO BAJO LAS RAÍCES FUE SUYO'), 0, -38), lt, 2.0);
  }, [[0.2, 'pop'], [2.0, 'ding'], [0, 'night']]);
  shot(990.38, 'bosque', (lt, T) => {
    night(T); inHole({ ears: 0.1, headPitch: -0.15 });
    cam(lerp3([HOLE[0] - 1.6, 0.45, HOLE[1] + 0.35], [HOLE[0] - 2.6, 1.4, HOLE[1] + 1.0], lt / 1.39), [HOLE[0], 0.0, HOLE[1]], 40, 0.0, T);
    animCard(at(stamp('nadielo', 'Y NADIE SE LO QUITÓ', 15), 0, -36), lt, 0.1);
  }, [[0.1, 'stamp']]);
  shot(991.77, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.4); poseDog(D, { t: T, ears: 0.8, wag: 0.8, headRoll: 0.2 });
    cam(lerp3([1.5, 0.6, 1.3], [1.4, 0.57, 1.2], lt / 1.82), [0, 0.3, 0], 36, 0.002, T);
    animCard(at(title('comentarios', [{ text: 'CUÉNTAME EN LOS COMENTARIOS', px: 14 }]), 0, 34), lt, 0.1);
  }, [[0.1, 'pop']]);
  shot(993.59, 'claro', (lt, T) => {
    tick(T);
    dogAt(gC, 0.12, 0.12, -0.08, { lie: 1, ears: 1, still: 1 });
    cam(lerp3([3, 1.0, -0.6], [2.6, 0.9, -0.5], lt / 3.93), [0.1, 0.25, 0.1], 36, 0.001, T);
    animCard(at(card('callado', () => makeCard([{ text: '¿SE HABRÍA QUEDADO CALLADO', px: 13 }, { text: 'DETRÁS DE LOS HELECHOS?', px: 13 }], { padX: 7, padY: 5 })), 0, -34), lt, 0.6);
  }, [[0.6, 'pop']]);
  shot(997.52, 'claro', (lt, T) => {
    tick(T);
    const R = CL().trex; R.root.visible = true; R.root.position.set(9, CL().hC(9, 1.5), 1.5); R.root.rotation.y = Math.PI - 0.1; poseTrex(R, { walk: 0, headPitch: -0.35, headYaw: 0.1 }); subj(R.root);
    dogAt(gC, 2.2, 0.9, -0.1, { ears: 1, tailUp: 1, crouch: 0.25, jaw: bark(lt, 0.1, 2.4, 6), headPitch: 0.45 });
    cam(lerp3([0.6, 0.6, 3.2], [0.4, 0.8, 3.6], lt / 3.08), [5, 1.5, 0.8], 46, 0.008, T);
    st.veil.material.color.set(0x000000); st.veil.material.opacity = clamp((lt - 2.6) / 0.5) * 0.85;
    animCard(at(card('ladrarle', () => makeCard([{ text: '¿O HABRÍA IDO A LADRARLE AL T. REX?', px: 13 }], { padX: 7, padY: 5 })), 0, -36), lt, 0.3);
  }, [[0.1, 'bark'], [0.45, 'bark'], [0.8, 'bark'], [1.2, 'bark'], [0.3, 'pop']]);
}
