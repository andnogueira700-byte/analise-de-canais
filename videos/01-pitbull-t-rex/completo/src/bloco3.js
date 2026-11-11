// Bloco 3 (447,6 s → 727,1 s): a clareira, a manada, o Triceratops, o silêncio, o som que se sente e o T. rex.
import * as F from '/videos/engine/lib/fauna.js';
import * as P2 from '/videos/engine/lib/props2.js';
import { poseTrex } from '/videos/engine/lib/world.js';
import { FOOT } from '/videos/engine/lib/creta.js';
import { groundH } from './sets.js';
import { makeKit2 } from './kit2.js';

export function addBloco3(K) {
  const { st, W, D, THREE, P, card, stamp, title, label, num, at, fixed, anchor, gy, placeDog, cam, bark, yawTo, noseWorld, mouthWorld, C, trex, water, sunset, person, shot, ease, clamp, lerp, lerp3, seg, poseDog, hash3, makeCard, animCard, subj } = K;
  const X = makeKit2(K);
  const { O, B, E, CL, gO, gB, gC, tick, win, nameCard, splash, scent, flies, rings, lazy, dogAt } = X;
  const V = new THREE.Vector3();
  const wpos = (o) => { o.updateMatrixWorld(true); o.getWorldPosition(V); return [V.x, V.y, V.z]; };
  const no = (k, text) => card(k, () => makeCard([{ text, px: 15, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 5 }));

  // ---------- manada ----------
  const herd = (T, o = {}) => CL().herd.forEach((e, i) => {
    e.root.visible = true;
    const [x, z, r] = e.home, mv = o.move || 0, al = o.alert || 0;
    const px = x + mv * 0.25, pz = z + mv;
    e.root.position.set(px, CL().hC(px, pz), pz);
    e.root.rotation.y = lerp(r, -Math.PI / 2 + 0.25, o.turn || 0);
    const graze = (1 - al) * (0.55 + 0.45 * Math.sin(T * 0.25 + e.ph * 7));
    F.poseEdmonto(e, { phase: T * 0.32 + e.ph, walk: o.walk ?? (i % 3 === 0 ? 0.25 : 0), graze, headUp: al, headYaw: o.look ? Math.sin(e.ph * 9) * 0.2 : Math.sin(T * 0.4 + e.ph * 5) * 0.25 * (1 - al), t: T + e.ph * 10 });
    if (o.push && i < 2) { e.root.position.x += Math.sin(T * 2.2 + i * Math.PI) * 0.25; e.root.rotation.y += Math.sin(T * 2.2 + i * Math.PI) * 0.06; }
  });
  const heads = () => CL().herd.map(e => wpos(e.head));
  const noise = (T, amt = 1) => { const H = heads(); W.particles(300, (i) => { const h = H[i % H.length], L = Math.floor(i / H.length) % 3, a = (Math.floor(i / (H.length * 3)) / 10) * 6.28; const r = ((T * 0.8 + L / 3 + i * 0.013) % 1); return { p: [h[0] + Math.cos(a) * r * 2.2, h[1] + 0.3 + Math.sin(a) * r * 1.2, h[2] + Math.sin(a * 1.3) * r * 2.2], s: 0.09 * (1 - r) * amt, c: 0xfff0c8 }; }); };
  const trike = (T, o = {}) => { const k = CL().trike; k.root.visible = true; F.poseTrike(k, { t: T, headDown: o.headDown ?? 0.8, headUp: o.headUp || 0, chew: o.chew ?? 1, headYaw: o.headYaw || 0 }); return k; };
  const rex = (x, z, yaw, o = {}) => { const R = CL().trex; R.root.visible = true; R.root.position.set(x, CL().hC(x, z) - 0.05, z); R.root.rotation.y = yaw; poseTrex(R, { phase: o.phase || 0, walk: o.walk ?? 1, headPitch: o.headPitch || 0, headYaw: o.headYaw || 0, jaw: o.jaw || 0, pitch: o.pitch || 0 }); subj(R.root); return R; };
  const birdsFly = (T, k, from = [57, 12, -6]) => CL().birds.forEach((b, i) => { b.root.visible = true; const a = i * 0.8, d = k * 25; b.root.position.set(from[0] - d * Math.cos(a * 0.3) + i * 0.7, from[1] + k * 6 + Math.sin(T * 3 + i) * 0.3 + i * 0.4, from[2] + d * Math.sin(a * 0.4) * 0.6 + i * 1.3); b.root.rotation.y = Math.PI - a * 0.3; F.poseBird(b, T + i); });
  const lieDog = (o = {}) => dogAt(gC, 0.12, 0.12, -0.08, { lie: 1, ears: 0.5, headPitch: 0.05, ...o });
  const dogEyeCam = (lt, dur, extra = 0) => { const n = noseWorld(); cam(lerp3([n.x - 0.05, n.y + 0.08, n.z + 0.62 + extra], [n.x - 0.04, n.y + 0.07, n.z + 0.55 + extra], lt / dur), [n.x - 0.18, n.y + 0.01, n.z], 32, 0.002, K.T); };
  const groundPulse = (c, lt, col = 0xf0d8a0, n = 240) => W.particles(n, (i) => { const L = i % 4, a = (Math.floor(i / 4) / (n / 4)) * 6.28, r = ((lt * 0.45 + L / 4) % 1); return { p: [c[0] + Math.cos(a) * r * 3, c[1] + 0.02, c[2] + Math.sin(a) * r * 3], s: 0.022 * (1 - r), c: col }; });

  // ===== a clareira =====
  shot(447.62, 'claro', (lt, T) => {
    tick(T); herd(T);
    const k = lt / 3.74, x = lerp(-5.5, -2.6, k), z = lerp(1.2, 0.6, k);
    dogAt(gC, x, z, -0.15, { gait: 'walk', phase: lt * 1.15, ears: 0.6, wag: 0.4 });
    cam(lerp3([x - 1.6, 0.6, z + 1.4], [x - 1.2, 0.55, z + 1.2], k), [x + 0.6, 0.3, z], 40, 0.004, T);
    animCard(at(label('tarde', 'POR LA TARDE', 14), -60, 34), lt, 0.2);
  }, [[0, 'whoosh'], [0.2, 'pop']]);
  shot(451.36, 'claro', (lt, T) => {
    tick(T); herd(T);
    const stop = ease.io(seg(lt, 0, 0.8));
    dogAt(gC, -2.6 + stop * 0.3, 0.6, -0.15, { gait: 'walk', amt: 1 - stop, phase: lt * 1.15, ears: 0.4 + stop * 0.6, headPitch: 0.15 * stop, tailUp: 0.5 * stop });
    const k = ease.io(seg(lt, 0.6, 3.0));
    cam(lerp3([-3.6, 0.45, 0.9], [-3.9, 1.0, 1.1], k), lerp3([-2.0, 0.35, 0.6], [20, 2.5, 0], k), lerp(40, 34, k), 0.002, T);
    animCard(at(label('jamas', 'ALGO QUE NINGÚN PERRO HA VISTO', 13), 0, -38), lt, 1.6);
  }, [[0.6, 'rise'], [1.6, 'pop']]);
  shot(454.41, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false;
    cam(lerp3([6, 4, -16], [8, 4.5, -14], lt / 2.14), [24, 2, 0], 44, 0.002, T);
    animCard(at(nameCard('edmo', 'EDMONTOSAURUS', 'una manada'), 0, 34), lt, 0.2);
  }, [[0.2, 'stamp'], [0, 'herd']]);
  shot(456.55, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false;
    const e = CL().herd[0]; const h = wpos(e.head);
    cam(lerp3([h[0] - 3.2, h[1] + 1.0, h[2] + 4.0], [h[0] - 2.9, h[1] + 0.9, h[2] + 3.6], lt / 2.45), [h[0] + 0.3, h[1], h[2]], 38, 0.002, T);
    animCard(at(label('pato', 'PICO DE PATO', 14), -56, -36), lt, 0.3);
  }, [[0.3, 'pop'], [0.8, 'chew']]);
  shot(459.0, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false;
    const e = CL().herd[1]; const p = e.root.position;
    cam(lerp3([p.x - 15, 4.5, p.z + 5], [p.x - 14, 4.6, p.z + 5.5], lt / 2.9), [p.x, 2.5, p.z], 42, 0.002, T);
    animCard(at(card('12m', () => makeCard([{ text: '≈ 12 M', px: 22, color: 0xe0862f }, { text: 'DE LARGO', px: 11 }], { padX: 8, padY: 5 })), 56, 30), lt, 0.3);
    animCard(at(label('tranquilos', 'COMIENDO PLANTAS, TRANQUILOS', 13), 0, -38), lt, 1.5);
  }, [[0.3, 'pop'], [1.5, 'pop']]);
  shot(461.90, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false;
    cam(lerp3([10, 22, -26], [14, 24, -22], lt / 1.36), [28, 0, 0], 48, 0.002, T);
    animCard(at(stamp('docenas', 'DOCENAS', 18), 0, 34), lt, 0.15);
  }, [[0.15, 'stamp']]);
  shot(463.26, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false; noise(T);
    cam(lerp3([8, 3, -9], [9.5, 3.2, -8], lt / 3.55), [24, 3, 0], 40, 0.002, T);
    animCard(at(label('ruido3', 'RUIDO TODO EL TIEMPO', 13), -56, 34), lt, 0.2);
    animCard(at(label('resoplido', 'RESOPLIDOS', 13), -56, -20), lt, 1.6);
    animCard(at(label('mugido', 'MUGIDOS GRAVES', 13), -56, -36), lt, 2.4);
  }, [[0.2, 'pop'], [0.5, 'snort'], [1.6, 'pop'], [2.0, 'moo'], [2.4, 'pop']]);
  shot(466.81, 'claro', (lt, T) => {
    tick(T); herd(T); D.root.visible = false;
    const e = CL().herd[3]; const h = wpos(e.head);
    cam(lerp3([h[0] - 4, h[1] + 0.5, h[2] - 4], [h[0] - 3.5, h[1] + 0.4, h[2] - 3.6], lt / 1.83), h, 36, 0.003, T);
    W.particles(80, (i) => { const k = clamp(lt * 0.8); const a = hash3(i, 1, 4) * 6.28; return { p: [h[0] + Math.cos(a) * k * 1.6, h[1] + 0.5 - k * k * 2.5 + hash3(i, 2, 4) * 0.5, h[2] + Math.sin(a) * k * 1.6], s: 0.08 * (1 - k * 0.5), c: i % 2 ? 0x6a8a34 : 0x4a3a20, rx: k * 6 + i }; });
    animCard(at(label('ramas', 'RAMAS QUE SE ROMPEN', 13), 0, -38), lt, 0.3);
  }, [[0.2, 'snap'], [0.3, 'pop']]);
  shot(468.64, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T); D.root.visible = false;
    const k = ease.io(lt / 2.9);
    cam(lerp3([2, 2.5, 4], [3, 2.0, 6], k), lerp3([22, 2.5, 2], [13, 1.8, 15], k), 38, 0.002, T);
    animCard(at(nameCard('trike', 'TRICERATOPS', 'solo, un poco más allá'), 0, 34), lt, 1.6);
  }, [[0, 'whoosh'], [1.6, 'stamp']]);
  shot(471.55, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T); D.root.visible = false;
    const tk = CL().trike.root.position;
    const k = lt < 1.5 ? 0 : 1;
    if (!k) cam(lerp3([tk.x - 2, 2.2, tk.z + 9], [tk.x - 1.7, 2.1, tk.z + 8.6], lt / 1.5), [tk.x, 1.6, tk.z], 44, 0.002, T);
    else { const h = wpos(CL().trike.head); cam(lerp3([h[0] - 4.2, h[1] + 1.2, h[2] - 1.0], [h[0] - 3.8, h[1] + 1.1, h[2] - 0.8], (lt - 1.5) / 1.1), h, 36, 0.002, T); }
    if (!k) animCard(at(card('9m', () => makeCard([{ text: '≈ 9 M', px: 22, color: 0xe0862f }, { text: 'DE LARGO', px: 11 }], { padX: 8, padY: 5 })), 56, 30), lt, 0.2, 1.45);
    else animCard(at(card('3cuernos', () => makeCard([{ text: '3', px: 22, color: 0xe0862f }, { text: 'CUERNOS', px: 11 }], { padX: 8, padY: 5 })), 56, 30), lt, 1.55);
  }, [[0.2, 'pop'], [1.5, 'whoosh'], [1.55, 'pop']]);
  shot(474.16, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T, { headDown: 0.4, chew: 0.5 }); D.root.visible = false;
    const sofa = lazy('claroSofa', () => { const s = P.buildSofa(0x3f7b86); s.scale.setScalar(1.0); CL().group.add(s); return s; }, (s) => s.visible = false);
    const h = wpos(CL().trike.head); const pop = ease.back(seg(lt, 0.8, 1.2));
    sofa.visible = pop > 0.01; sofa.scale.setScalar(Math.max(0.01, pop)); sofa.position.set(h[0] - 1.6, CL().hC(h[0] - 1.6, h[2] + 1.8), h[2] + 1.8); sofa.rotation.y = 2.4;
    cam(lerp3([h[0] - 4.5, 1.6, h[2] + 5.0], [h[0] - 4.1, 1.5, h[2] + 4.6], lt / 3.47), [h[0] - 0.9, 1.0, h[2] + 0.9], 42, 0.002, T);
    animCard(at(label('sofa', 'UNA CABEZA COMO TU SOFÁ', 14), 0, -38), lt, 1.3);
  }, [[0.8, 'pop'], [1.3, 'pop']]);
  shot(477.63, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    const tense = ease.io(seg(lt, 0.4, 2.6));
    dogAt(gC, -1.4, 0.9, -0.775, { ears: 0.5 + tense * 0.5, tailUp: tense, crouch: tense * 0.25, headPitch: 0.1 });
    const n = noseWorld();
    cam(lerp3([-2.9, 0.6, -0.4], [-2.4, 0.5, 0.05], ease.in(lt / 3.74)), [13, 1.5, 15], 30, 0.002, T);
    animCard(at(label('yasabes', 'LO QUE YA SABES QUE HARÍA', 13), 0, -38), lt, 1.0);
  }, [[0, 'tension'], [1.0, 'pop']]);
  shot(481.37, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    dogAt(gC, -1.4, 0.9, -0.775, { ears: 1, tailUp: 1, crouch: 0.25, jaw: bark(lt, 0.0, 1.6, 6) * 1.0, headPitch: 0.25 });
    cam(lerp3([-0.3, 0.4, 2.0], [-0.35, 0.39, 1.9], lt / 1.63), [-1.2, 0.35, 0.95], 40, 0.012, T);
    animCard(at(stamp('ladra', '¡LE LADRA!', 18), 0, 34), lt, 0.1);
  }, [[0.05, 'bark'], [0.4, 'bark'], [0.75, 'bark'], [1.1, 'bark']]);
  const postman = () => lazy('postman', () => { const p = P.buildPerson({ shirt: 0x3a5a9a, pants: 0x2a3a5a, hair: 0x2a2018, shoe: 0x1a1a1a }); W.sets.rua.group.add(p.root); return p; }, (p) => p.root.visible = false);
  const posePerson = (p, x, z, yaw, w, ph) => { p.root.visible = true; p.root.position.set(x, 0, z); p.root.rotation.set(0, yaw, 0); const a = ph * Math.PI * 2; p.legs[0].rotation.set(Math.sin(a) * 0.45 * w, 0, 0); p.legs[1].rotation.set(-Math.sin(a) * 0.45 * w, 0, 0); p.shins[0].rotation.set(Math.max(0, Math.cos(a)) * 0.7 * w, 0, 0); p.shins[1].rotation.set(Math.max(0, -Math.cos(a)) * 0.7 * w, 0, 0); p.arms[0].rotation.set(-Math.sin(a) * 0.4 * w, 0, 0); p.arms[1].rotation.set(Math.sin(a) * 0.4 * w, 0, 0); p.torso.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0); };
  shot(483.0, 'rua', (lt, T) => {
    const pm = postman(); posePerson(pm, 1.4, 2.6, Math.PI, 0.3, lt * 0.8);
    placeDog(0.3, 0, 1.4, 0.9); poseDog(D, { t: T, ears: 1, tailUp: 1, jaw: bark(lt, 0.0, 1.7, 6), headPitch: 0.3, crouch: 0.2 });
    cam(lerp3([-0.9, 0.6, 0.6], [-0.85, 0.58, 0.65], lt / 1.8), [0.9, 0.7, 2.2], 44, 0.008, T);
    animCard(at(label('cartero', 'COMO AL CARTERO', 14), -56, 34), lt, 0.1);
    animCard(at(label('contodo3', 'CON TODO', 14), 0, -38), lt, 1.1);
  }, [[0.05, 'bark'], [0.45, 'bark'], [0.85, 'bark'], [0.1, 'pop'], [1.1, 'pop']]);
  shot(484.80, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    dogAt(gC, -1.4, 0.9, -0.775, { ears: 1, tailUp: 1, crouch: 0.3, jaw: bark(lt, 0.2, 1.6, 5) * 0.8, headPitch: 0.25, still: 1 });
    cam(lerp3([-0.3, 0.35, -0.2], [-0.35, 0.35, -0.15], lt / 1.78), [-1.4, 0.3, 0.9], 38, 0.004, T);
    animCard(at(label('tieso', 'CUERPO TIESO', 14), -56, 34), lt, 0.1);
    animCard(at(label('colaarriba', 'COLA ARRIBA', 14), -56, 18), lt, 0.9);
  }, [[0.1, 'pop'], [0.3, 'bark'], [0.9, 'pop']]);
  shot(486.58, 'claro', (lt, T) => {
    tick(T); herd(T);
    const up = ease.io(seg(lt, 0, 0.8)) * (1 - ease.io(seg(lt, 3.8, 4.6)));
    trike(T, { headDown: 0.8 * (1 - up), headUp: up * 0.8, chew: lt > 2.9 && lt < 3.7 ? 1 : 0.1, headYaw: up * 0.5 });
    D.root.visible = false;
    const h = wpos(CL().trike.head);
    cam(lerp3([h[0] - 5.2, h[1] + 0.6, h[2] - 2.2], [h[0] - 4.8, h[1] + 0.55, h[2] - 2.0], lt / 4.67), h, 34, 0.002, T);
    animCard(at(label('mira', 'LO MIRA', 13), -56, 34), lt, 2.3, 2.85);
    animCard(at(label('mastica', 'MASTICA', 13), -56, 34), lt, 2.9, 3.7);
    animCard(at(label('vuelve', 'Y VUELVE A COMER', 13), -56, 34), lt, 3.8);
  }, [[0.2, 'whoosh'], [2.3, 'pop'], [2.9, 'chew'], [3.8, 'pop']]);
  shot(491.25, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    const deflate = ease.io(seg(lt, 0.6, 2.0));
    dogAt(gC, -1.4, 0.9, -0.775, { ears: 1 - deflate * 0.8, tailUp: 1 - deflate, tailDown: deflate * 0.5, headPitch: 0.25 - deflate * 0.35 });
    cam(lerp3([-0.2, 0.45, 2.1], [-0.25, 0.43, 2.0], lt / 4.56), [-1.35, 0.28, 0.9], 38, 0.002, T);
    animCard(at(no('tortuga2', '✗ TORTUGA'), -56, 34), lt, 0.8);
    animCard(at(no('trike2', '✗ TRICERATOPS'), -56, 18), lt, 1.6);
    animCard(at(stamp('niinmuta', 'NI SE INMUTA', 15), 0, -36), lt, 3.0);
  }, [[0.8, 'pop'], [1.6, 'pop'], [3.0, 'stamp']]);
  shot(495.81, 'rua', (lt, T) => {
    const pm = postman(); const k = seg(lt, 0.8, 4.0); posePerson(pm, 1.4 - k * 4, 2.6 + k * 0.6, Math.PI / 2 + 0.2, 1, lt * 0.9);
    placeDog(0.3, 0, 1.4, 0.9); poseDog(D, { t: T, ears: 1, tailUp: 1, jaw: bark(lt, 0.0, 1.2, 6), wag: lt > 2 ? 1 : 0.4, wagSpeed: 16 });
    cam(lerp3([-0.6, 0.8, -0.3], [-0.55, 0.78, -0.25], lt / 4.04), [0.4, 0.6, 2.4], 48, 0.004, T);
    animCard(at(win('funciona', '✓ EN CASA, LADRAR FUNCIONA'), 0, 34), lt, 0.2);
    animCard(at(label('sevapre', 'SIEMPRE SE VA', 14), 0, -38), lt, 3.0);
  }, [[0.1, 'bark'], [0.2, 'ding'], [0.5, 'bark'], [3.0, 'pop']]);
  shot(499.85, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T); D.root.visible = false;
    cam(lerp3([-4, 3, 5], [-3.6, 3.2, 5.4], lt / 1.6), [20, 1.5, 4], 46, 0.002, T);
    animCard(at(stamp('nadiesev', 'AQUÍ, NADIE SE VA', 16), 0, 34), lt, 0.15);
  }, [[0.15, 'stamp']]);
  shot(501.45, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    const k = ease.io(seg(lt, 0, 2.2)), lie = ease.io(seg(lt, 2.0, 3.2));
    dogAt(gC, lerp(-1.4, 0.12, k), lerp(0.9, 0.12, k), lerp(-0.775, -0.08, k), { gait: 'walk', amt: 1 - ease.io(seg(lt, 1.8, 2.2)), phase: lt * 1.1, lie, ears: 0.4, tailDown: 0.3, headPitch: 0.05 * lie });
    cam(lerp3([-1.4, 0.7, 2.2], [-1.0, 0.55, 1.5], ease.io(lt / 4.45)), [0.0, 0.2, 0.3], 42, 0.002, T);
    animCard(at(label('cansa', 'SE CANSA', 14), -56, 34), lt, 0.1);
    animCard(at(label('sombra', 'A LA SOMBRA DE UN HELECHO', 13), 0, -38), lt, 2.2);
  }, [[0.1, 'pop'], [2.2, 'pop']]);
  shot(505.90, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T); lieDog({ headYaw: Math.sin(lt * 0.8) * 0.15 });
    dogEyeCam(lt, 2.7);
    animCard(at(num('leer3', '3', 'LO QUE MEJOR SABE HACER'), -54, -32), lt, 0.6);
  }, [[0.6, 'pop']]);
  shot(508.60, 'claro', (lt, T) => {
    const TT = 508.6 + lt * 12; tick(TT); herd(TT); trike(TT); lieDog({ headYaw: Math.sin(TT * 0.3) * 0.2 });
    cam([-1.2, 1.4, -2.2], [14, 1.0, 2], 46, 0.0, T);
    animCard(at(label('rato2', 'POR UN BUEN RATO…', 14), -56, 34), lt, 0.1);
  }, [[0.1, 'pop']]);
  shot(510.32, 'claro', (lt, T) => {
    tick(T); herd(T, { push: 1 }); trike(T); D.root.visible = false; noise(T);
    const e = CL().herd[0].root.position;
    cam(lerp3([e.x - 6, 3, e.z + 9], [e.x - 5, 3, e.z + 8.5], lt / 3.73), [e.x + 2, 2.4, e.z + 4], 40, 0.003, T);
    animCard(at(label('comen', 'COMEN · RESOPLAN · SE EMPUJAN', 13), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [0.6, 'snort'], [2.0, 'moo']]);
  shot(514.05, 'claro', (lt, T) => {
    tick(T); herd(T, { push: 1 }); trike(T); lieDog(); noise(T, 0.8);
    cam(lerp3([-1.8, 0.6, 0.9], [-1.7, 0.6, 0.85], lt / 3.06), [16, 2.5, 0], 36, 0.002, T);
    animCard(at(label('cocina', 'COMO UNA COCINA LLENA DE GENTE', 13), 0, -38), lt, 0.6);
  }, [[0.6, 'pop'], [0.2, 'herd']]);
  // ---- o silêncio ----
  shot(517.11, 'claro', (lt, T) => {
    tick(T); const f = 517.11 + Math.min(lt, 1.0); herd(lt < 1.0 ? T : f, { push: lt < 1 ? 1 : 0 }); trike(f); D.root.visible = false;
    if (lt < 1.0) noise(T, 1 - lt);
    cam([6, 2.6, -6], [24, 2.6, 2], 40, 0.0, T);
  }, [[0, 'silence']]);
  shot(519.38, 'claro', (lt, T) => {
    tick(T); herd(518.1, {}); trike(518.1); lieDog({ ears: 0.5 + ease.out(seg(lt, 0.2, 0.5)) * 0.5, still: 1 });
    const n = noseWorld();
    cam([n.x - 0.12, n.y + 0.12, n.z + 0.6], [n.x - 0.22, n.y + 0.05, n.z], 30, 0.0, T);
    animCard(at(stamp('para', 'PARA.', 20), 0, 34), lt, 1.1);
  }, [[1.1, 'stamp']]);
  shot(521.40, 'claro', (lt, T) => {
    tick(T); const al = ease.io(seg(lt, 0.2, 1.1)); herd(518.1 + lt * 0.2, { alert: al, look: 1 }); trike(T, { headDown: 0.8 * (1 - al), headUp: al }); D.root.visible = false;
    cam(lerp3([4, 2.4, -7], [4.5, 2.5, -6.5], lt / 2.81), [24, 3.2, 1], 40, 0.0, T);
    animCard(at(label('cabezas', 'TODAS AL MISMO TIEMPO', 13), 0, -38), lt, 1.2);
  }, [[0.2, 'whoosh'], [1.2, 'pop']]);
  shot(524.21, 'claro', (lt, T) => {
    tick(T); herd(518.1, { alert: 1, look: 1 }); trike(T, { headDown: 0, headUp: 1 }); D.root.visible = false;
    birdsFly(T, ease.in(seg(lt, 0.1, 2.2)));
    cam(lerp3([44, 6, -10], [43, 7, -9], lt / 2.22), [57, 11, -6], 40, 0.002, T);
    animCard(at(label('pajaros', 'LOS PÁJAROS SALEN VOLANDO', 13), 0, -38), lt, 0.4);
  }, [[0.1, 'flap'], [0.4, 'pop']]);
  shot(526.43, 'claro', (lt, T) => {
    tick(T); const mv = ease.in(seg(lt, 0, 4)) * 3; herd(T, { alert: 0.8, move: mv, walk: 0.6, turn: ease.io(seg(lt, 0, 1.2)) }); trike(T, { headDown: 0, headUp: 1 }); D.root.visible = false;
    cam(lerp3([2, 5, -14], [4, 5.5, -12], lt / 4.0), [26, 1.5, 6], 46, 0.002, T);
    animCard(at(label('despacio', 'SE MUEVEN DESPACIO', 13), 0, -38), lt, 0.6);
  }, [[0.3, 'herd'], [0.6, 'pop']]);
  shot(530.43, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 0.8, move: 3 + lt * 0.8, walk: 0.6, turn: 1 }); trike(T, { headDown: 0, headUp: 1 });
    lieDog({ ears: 1, headPitch: 0.15, still: 1 });
    dogEyeCam(lt, 2.5, 0.1);
    animCard(at(label('tuno', 'TÚ NO TE DARÍAS CUENTA…', 13), -50, 34), lt, 0.1);
    animCard(at(win('elsi', 'PERO TU PERRO SÍ'), -50, 18), lt, 1.3);
  }, [[0.1, 'pop'], [1.3, 'ding']]);
  shot(532.92, 'sala', (lt, T) => {
    const p = person(1.0, -0.3, -2.2, { armL: -0.9, armR: -0.9, headPitch: 0.25 });
    p.arms[0].rotation.z = 0.9; p.arms[1].rotation.z = -0.9;
    placeDog(0.1, 0, 0.3, 0.6); poseDog(D, { t: T, lie: 1, ears: 0.1, headPitch: 0.3, headYaw: 0.3, still: 1 });
    cam(lerp3([-0.6, 0.45, 1.6], [-0.5, 0.42, 1.5], lt / 5.4), [0.6, 0.6, -0.1], 40, 0.0, T);
    animCard(at(label('momento', 'CONOCE ESTE MOMENTO', 13), -56, 34), lt, 0.3);
    animCard(at(label('enoja', 'CUANDO ALGUIEN SE ENOJA', 13), 0, -38), lt, 2.4);
  }, [[0.3, 'pop'], [2.4, 'pop'], [0, 'silence']]);
  shot(538.32, 'sala', (lt, T) => {
    const p = person(1.0, -0.3, -2.2 + ease.io(seg(lt, 0.5, 2.0)) * 1.2, { armL: -0.9, armR: -0.9, headPitch: 0.25 });
    p.arms[0].rotation.z = 0.9; p.arms[1].rotation.z = -0.9;
    const pr = person; void pr;
    placeDog(0.1, 0, 0.3, 0.6); poseDog(D, { t: T, lie: 1, ears: 0.1 + ease.io(seg(lt, 1.6, 2.2)) * 0.6, headPitch: 0.3, headYaw: 0.3 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.6, n.y + 0.1, n.z + 0.5], [n.x + 0.5, n.y + 0.08, n.z + 0.42], lt / 4.36), [n.x - 0.1, n.y, n.z], 34, 0.0, T);
    animCard(at(label('ambiente', 'NADIE DICE NADA', 13), -56, 34), lt, 0.6);
    animCard(at(win('primero', 'ÉL LO NOTA PRIMERO'), 0, -38), lt, 2.6);
  }, [[0.6, 'pop'], [2.6, 'ding']]);
  shot(542.68, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 0.8, move: 6, walk: 0.5, turn: 1 });
    const f = ease.io(seg(lt, 0.3, 1.2));
    lieDog({ ears: 0.3 + f * 0.7, headPitch: 0.1 + f * 0.05, still: 1 });
    const h = wpos(D.head);
    cam(lerp3([h[0] - 0.3, h[1] + 0.2, h[2] + 0.55], [h[0] - 0.26, h[1] + 0.18, h[2] + 0.5], lt / 1.98), [h[0] + 0.05, h[1] + 0.05, h[2]], 32, 0.0, T);
    animCard(at(label('orejas', 'OREJAS ADELANTE', 13), 0, -38), lt, 0.8);
  }, [[0.8, 'pop']]);
  shot(544.66, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 6.5, walk: 0.4, turn: 1 });
    lieDog({ ears: 1, still: 1, shiver: Math.max(0, Math.sin(lt * 2.4)) * 0.6 });
    groundPulse([0.2, CL().hC(0.2, 0.1), 0.1], lt);
    cam(lerp3([-0.6, 0.55, 1.5], [-0.5, 0.5, 1.4], lt / 4.13), [0.2, 0.15, 0.1], 38, 0.003 + Math.max(0, Math.sin(lt * 2.4)) * 0.006, T);
    animCard(at(no('noescucha', '✗ NO LO ESCUCHA'), -56, 34), lt, 1.9);
    animCard(at(win('siente', '✓ LO SIENTE'), -56, 18), lt, 3.0);
  }, [[0.3, 'infra'], [1.9, 'pop'], [3.0, 'ding']]);
  shot(548.79, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1, shiver: 0.5 + Math.max(0, Math.sin(lt * 2.4)) * 0.5 });
    D.body.scale.set(1, 1 + Math.max(0, Math.sin(lt * 9)) * 0.015, 1 + Math.max(0, Math.sin(lt * 9)) * 0.02);
    const c = wpos(D.body);
    W.particles(200, (i) => { const L = i % 4, a = (Math.floor(i / 4) / 50) * 6.28, r = ((lt * 0.6 + L / 4) % 1); return { p: [c[0] + 0.15 + Math.cos(a) * r * 0.5, c[1] - 0.05 + Math.sin(a) * r * 0.35, c[2] + 0.3], s: 0.006 * (1 - r), c: 0xffe0a0 }; });
    cam(lerp3([c[0] + 0.2, c[1] + 0.1, c[2] + 0.95], [c[0] + 0.18, c[1] + 0.09, c[2] + 0.85], lt / 2.79), [c[0] + 0.1, c[1] - 0.05, c[2]], 34, 0.004, T);
    animCard(at(label('pecho', 'LE VIBRA EN EL PECHO', 13), 0, -38), lt, 0.5);
  }, [[0.2, 'infra'], [0.5, 'pop']]);
  shot(551.58, 'sala', (lt, T) => {
    const win2 = lazy('salaWin', () => W.sets.sala.group.children.find(o => o.position.x === 1.7 && o.position.z === -2.52), (w) => { if (w) w.position.x = 1.7; });
    const sh = Math.sin(lt * 40) * 0.006 * (1 - seg(lt, 3.0, 3.8));
    if (win2) win2.position.x = 1.7 + sh;
    placeDog(1.0, 0, -0.6, 1.4); poseDog(D, { t: T, sit: 1, ears: 1, headPitch: 0.35 });
    cam(lerp3([0.0, 0.8, 1.0], [0.1, 0.8, 0.9], lt / 3.79), [1.6, 1.3, -2.4], 42, 0.006, T);
    animCard(at(label('camion', 'CAMIÓN PESADO · TIEMBLAN LOS VIDRIOS', 12), 0, -38), lt, 0.4);
  }, [[0, 'rumble'], [0.4, 'pop'], [0.6, 'rattle']]);
  // ---- o som do T. rex ----
  const sRex = (T, o = {}) => { const R = E().trex; R.root.visible = true; R.root.position.set(o.x ?? 0, 0, o.z ?? 0); R.root.rotation.y = o.yaw ?? 0; poseTrex(R, { phase: o.phase ?? 0, walk: o.walk ?? 0, headPitch: o.headPitch || 0, headYaw: o.headYaw || 0, jaw: o.jaw || 0 }); subj(R.root); return R; };
  const studioDark = () => { W.cur.plat.visible = false; W.L.sun.intensity = 2.2; W.L.hemi.intensity = 1.1; W.L.aim([0, 2, 0], [0.5, 0.8, 0.6], 9, 25); };
  shot(555.37, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false; const R = sRex(T, { yaw: -0.5 });
    const h = wpos(R.head);
    cam(lerp3([h[0] + 3.5, h[1] - 0.6, h[2] + 4], [h[0] + 3.1, h[1] - 0.5, h[2] + 3.6], lt / 2.61), h, 40, 0.002, T);
    animCard(at(card('peliculas', () => makeCard([{ text: 'LAS PELÍCULAS', px: 12 }, { text: 'NOS LO CONTARON MAL', px: 16, color: 0xe0862f }], { padX: 7, padY: 5 })), 0, -36), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(557.98, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const open = ease.out(seg(lt, 0.1, 0.5)) * (1 - ease.io(seg(lt, 2.3, 2.8)));
    const R = sRex(T, { yaw: -0.5, jaw: open, headPitch: open * 0.15 });
    const h = wpos(R.head);
    cam(lerp3([h[0] + 3.0, h[1] - 0.2, h[2] + 3.2], [h[0] + 2.8, h[1] - 0.2, h[2] + 3.0], lt / 3.82), h, 38, open > 0.5 ? 0.012 : 0.002, T);
    animCard(at(no('rugir', '✗ ¿RUGÍA CON LA BOCA ABIERTA?'), 0, -36), lt, 1.6);
  }, [[0.15, 'roar'], [1.6, 'pop']]);
  shot(561.80, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: -0.5, headPitch: -0.05 });
    const throat = 1 + Math.max(0, Math.sin(lt * 1.6)) * 0.08; R.head.scale.set(1, throat, 1);
    const h = wpos(R.head);
    W.particles(260, (i) => { const L = i % 4, a = (Math.floor(i / 4) / 65) * 6.28, r = ((lt * 0.35 + L / 4) % 1); return { p: [h[0] - 0.3 + Math.cos(a) * r * 4, h[1] - 0.8 + Math.sin(a) * r * 2.5, h[2] + Math.sin(a * 2) * r * 0.5], s: 0.05 * (1 - r), c: 0xffd890 }; });
    cam(lerp3([h[0] + 4.2, h[1] - 0.6, h[2] + 4.6], [h[0] + 3.8, h[1] - 0.55, h[2] + 4.2], lt / 4.79), [h[0] - 0.4, h[1] - 0.6, h[2]], 40, 0.004, T);
    animCard(at(win('cerrada', 'CON LA BOCA CERRADA'), 0, 36), lt, 0.6);
    animCard(at(label('creen', 'MUCHOS CIENTÍFICOS CREEN', 12), 0, -38), lt, 0.2);
  }, [[0.2, 'pop'], [0.4, 'infra'], [0.6, 'ding']]);
  K.onReset(() => { const R = W.sets.estudio && W.sets.estudio.trex; if (R) R.head.scale.set(1, 1, 1); });
  shot(566.59, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: -0.2 }); const h = wpos(R.head);
    W.particles(300, (i) => { const L = i % 5, a = (Math.floor(i / 5) / 60) * 6.28, r = ((lt * 0.5 + L / 5) % 1); return { p: [h[0] + Math.cos(a) * r * 8, 0.05, h[2] + Math.sin(a) * r * 8], s: 0.08 * (1 - r), c: 0xffd890 }; });
    cam(lerp3([h[0] + 7, 1.2, h[2] + 7], [h[0] + 6.5, 1.3, h[2] + 6.5], lt / 1.73), [h[0], 2.0, h[2]], 46, 0.008, T);
    animCard(at(stamp('graves', 'GRAVES Y RETUMBANTES', 16), 0, 34), lt, 0.1);
  }, [[0.05, 'infra'], [0.1, 'stamp']]);
  shot(568.32, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: -0.9, headPitch: -0.1 }); R.head.scale.set(1, 1 + Math.max(0, Math.sin(lt * 2.2)) * 0.08, 1);
    const h = wpos(R.head);
    W.particles(260, (i) => { const L = i % 4, a = (Math.floor(i / 4) / 65) * 6.28, r = ((lt * 0.3 + L / 4) % 1); return { p: [h[0] - 0.5 + Math.cos(a) * r * 6, h[1] - 1.0 + Math.sin(a) * r * 3.5, h[2] + Math.sin(a * 2) * r * 0.6], s: 0.06 * (1 - r), c: 0xffd890 }; });
    cam(lerp3([h[0] + 5.5, h[1] - 0.8, h[2] + 3.5], [h[0] + 5.0, h[1] - 0.7, h[2] + 3.2], lt / 3.42), [h[0] - 0.5, h[1] - 0.8, h[2]], 42, 0.004, T);
    animCard(at(label('aves', 'COMO ALGUNAS AVES DE HOY', 13), -50, 34), lt, 0.1);
    animCard(at(stamp('profundo', 'PERO MUCHÍSIMO MÁS PROFUNDO', 13), 0, -36), lt, 1.4);
  }, [[0.1, 'pop'], [0.3, 'infra'], [1.4, 'stamp']]);
  shot(571.74, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 7, walk: 0.3, turn: 1 });
    lieDog({ ears: 1, still: 1, shiver: 0.4 });
    groundPulse([0.2, CL().hC(0.2, 0.1), 0.1], lt, 0xffd890, 320);
    cam(lerp3([-1.2, 1.0, 1.6], [-1.0, 0.95, 1.45], lt / 3.84), [0.2, 0.1, 0.1], 40, 0.006, T);
    animCard(at(no('oidos', '✗ CON LOS OÍDOS'), -56, 34), lt, 0.3);
    animCard(at(win('cuerpo', '✓ CON EL CUERPO'), -56, 18), lt, 2.4);
  }, [[0.1, 'infra'], [0.3, 'pop'], [2.4, 'ding']]);
  // ---- decidir ----
  shot(575.58, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const n = noseWorld(); const k = ease.in(lt / 1.98);
    cam(lerp3([n.x - 0.3, n.y + 0.2, n.z + 1.1], [n.x - 0.1, n.y + 0.08, n.z + 0.6], k), [n.x - 0.15, n.y + 0.02, n.z], 34, 0.0, T);
    animCard(at(stamp('decidir', 'TIENE QUE DECIDIR', 17), 0, 34), lt, 0.4);
  }, [[0.4, 'stamp'], [0, 'tension']]);
  shot(577.56, 'claro', (lt, T) => {
    tick(T);
    const rise = Math.sin(clamp(lt / 3.1) * Math.PI) * 0.6;
    lieDog({ lie: 1 - rise, ears: 1, tailUp: rise, still: 1 });
    cam(lerp3([-0.5, 0.4, 1.4], [-0.45, 0.39, 1.35], lt / 3.12), [0.2, 0.2, 0.1], 38, 0.004, T);
    animCard(at(label('cuerpole', 'TODO SU CUERPO LE DICE…', 13), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [1.0, 'heartbeat']]);
  shot(580.68, 'sala', (lt, T) => {
    const run = seg(lt, 0, 2.0), x = lerp(-0.4, 2.45, run), z = lerp(-0.15, 0.8, run);
    placeDog(x, 0.02, z, yawTo(2.85, 0.95)); poseDog(D, { t: T, gait: 'run', phase: lt * 2.6, ears: 1, wag: 0.5 });
    cam(lerp3([0.6, 0.5, 1.6], [1.4, 0.6, 2.2], lt / 2.09), [x + 0.3, 0.3, z], 42, 0.008, T);
    animCard(at(stamp('veaver', '¡VE A VER QUÉ ES!', 15), -50, 34), lt, 0.05);
    animCard(at(stamp('investiga', '¡INVESTIGA!', 15), -50, 18), lt, 1.3);
  }, [[0, 'whoosh'], [0.05, 'stamp'], [1.3, 'stamp']]);
  shot(582.77, 'rua', (lt, T) => {
    placeDog(0, 0.24, -0.8, -Math.PI / 2); poseDog(D, { t: T, ears: 1, jaw: bark(lt, 0.0, 2.2, 6) * 0.9, tailUp: 1, wag: 0.8, headPitch: 0.15 });
    cam(lerp3([1.5, 0.7, -1.6], [1.6, 1.2, -1.85], lt / 2.25), [-1.3, 0.25, 2.0], 50, 0.01, T);
    animCard(at(stamp('ladra2', '¡LADRA!', 16), -50, 34), lt, 0.05);
    animCard(at(stamp('defiende', '¡DEFIENDE TU TERRITORIO!', 15), 0, -36), lt, 0.9);
  }, [[0.05, 'bark'], [0.05, 'stamp'], [0.4, 'bark'], [0.9, 'stamp'], [1.1, 'bark']]);
  shot(585.02, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    const x = -0.75 + lt * 0.22, z = 0.42;
    placeDog(x, gy(x, z), z, 0); poseDog(D, { t: T, gait: 'walk', phase: lt * 1.0, sniff: 1, ears: 0.5, wag: 0.3 });
    cam(lerp3([x + 0.6, 0.5, z + 1.3], [x + 0.5, 0.48, z + 1.2], lt / 4.57), [x + 0.2, 0.2, z], 40, 0.003, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(label('asiesel', 'ASÍ ES ÉL', 14), -56, 34), lt, 0.1);
    animCard(at(label('principio', 'COMO AL PRINCIPIO DE LA HISTORIA', 13), 0, -38), lt, 1.2);
  }, [[0.1, 'pop'], [1.2, 'pop']]);
  shot(589.59, 'orilla', (lt, T) => {
    tick(T);
    dogAt(gO, 0.25, 0.25, 0.2, { ears: 1, jaw: bark(lt, 0.1, 1.5, 6) * 0.9, tailUp: 1, wag: 0.8, headPitch: 0.1 });
    const tu = O().turtle; tu.root.visible = true; tu.root.position.set(1.25, gO(1.25, 0.35), 0.35); tu.root.rotation.y = 2.9; F.poseTurtle(tu, { neck: 1 });
    cam([0.75, 0.38, 1.6], [0.7, 0.2, 0.3], 40, 0.008, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(no('yatortuga', '✗ YA LE LADRÓ A UNA TORTUGA'), 0, -38), lt, 0.3);
  }, [[0.1, 'bark'], [0.3, 'pop']]);
  shot(591.75, 'claro', (lt, T) => {
    tick(T); herd(T); trike(T);
    dogAt(gC, -1.4, 0.9, -0.775, { ears: 1, tailUp: 1, crouch: 0.25, jaw: bark(lt, 0.0, 1.5, 6), headPitch: 0.25 });
    cam([-0.3, 0.4, 2.0], [-1.2, 0.35, 0.95], 40, 0.01, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(no('yatrike', '✗ YA LE LADRÓ A UN TRICERATOPS'), 0, -38), lt, 0.2);
  }, [[0.05, 'bark'], [0.2, 'pop']]);
  shot(593.59, 'bosque', (lt, T) => {
    tick(T); D.root.visible = false;
    const dd = B().didel; dd.root.visible = true; subj(dd.root);
    dd.root.position.set(-4.55, gB(-4.55, 2.6), 2.6); dd.root.rotation.y = yawTo(0.8, 0.45); F.poseMammal(dd, { t: T, jaw: 1 });
    const h = [-4.55 + 0.92 * 0.3, 0.2, 2.6 + 0.4 * 0.3];
    cam(lerp3([h[0] + 0.75, h[1] + 0.08, h[2] + 0.35], [h[0] + 0.6, h[1] + 0.06, h[2] + 0.28], lt / 4.03), h, 34, 0.002, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(label('ningunmiedo', 'CINCO VECES MÁS CHICO · NINGÚN MIEDO', 12), 0, -38), lt, 0.6);
  }, [[0.3, 'hiss'], [0.6, 'pop']]);
  shot(597.62, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 8, walk: 0.3, turn: 1 });
    const down = ease.io(seg(lt, 0, 0.6));
    lieDog({ ears: 1 - down * 0.5, headPitch: 0.1 - down * 0.25, still: 1 });
    cam([-0.45, 0.35, 1.3], [0.2, 0.12, 0.1], 38, 0.0, T);
    animCard(at(win('quedaechado', 'SE QUEDA ECHADO'), 0, -38), lt, 0.2);
  }, [[0.2, 'ding']]);
  // ---- o T. rex aparece ----
  const shakeTrees = (lt, k) => CL().edge.forEach((t, i) => { t.rotation.z = Math.sin(lt * 7 + i) * 0.015 * k; t.rotation.x = Math.cos(lt * 6 + i * 2) * 0.012 * k; });
  K.onReset(() => { const S = W.sets.claro; if (S) S.edge.forEach(t => t.rotation.set(0, 0, 0)); });
  shot(598.67, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 8.5, walk: 0.3, turn: 1 }); lieDog({ ears: 1, still: 1 });
    shakeTrees(lt, ease.io(seg(lt, 1.0, 2.0)));
    cam([-1.1, 0.95, 0.6], [59, 6, -18], 22, 0.001, T);
    animCard(at(label('algosemueve', 'ALGO SE MUEVE ENTRE LOS ÁRBOLES', 13), 0, -38), lt, 1.4);
  }, [[1.0, 'rustle'], [1.4, 'pop']]);
  shot(601.82, 'claro', (lt, T) => {
    tick(T); shakeTrees(lt, 1.5);
    cam([30, 4, -10], [60, 13, -20], 18, 0.001, T); D.root.visible = false;
    W.particles(60, (i) => { const k = (lt * 0.5 + hash3(i, 1, 1)) % 1; return { p: [58 + hash3(i, 2, 1) * 6, 14 - k * 10, -24 + hash3(i, 3, 1) * 8], s: 0.08, c: 0x6a8a34, rx: k * 6 + i }; });
    animCard(at(label('copas', 'PRIMERO LAS COPAS', 13), 0, -38), lt, 0.2);
  }, [[0, 'rustle'], [0.2, 'pop']]);
  shot(603.06, 'claro', (lt, T) => {
    tick(T); shakeTrees(lt, 1);
    const R = rex(58.5, -21, Math.PI - 0.5, { phase: T * 0.3, walk: 1 });
    R.root.position.x -= lt * 0.6;
    cam([30, 3.5, -8], [57, 4, -20], 16, 0.001, T); D.root.visible = false;
    W.L.sun.intensity *= 0.6;
    animCard(at(label('sombra2', 'DESPUÉS, UNA SOMBRA', 13), 0, -38), lt, 0.2);
  }, [[0.2, 'pop'], [0.5, 'thud']]);
  shot(604.74, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const R = rex(55.5, -19, Math.PI - 0.5, { phase: T * 0.3, walk: 0.6, headPitch: 0.1 });
    const rise = ease.io(seg(lt, 0.4, 3.0)); R.root.position.y = CL().hC(55.5, -19) - 0.05 - (1 - rise) * 3.2;
    cam([-1.1, 0.9, 0.55], [55, 5.5, -18.5], 15, 0.0, T);
  }, [[0.4, 'thud'], [1.5, 'infra'], [3.0, 'tension']]);
  shot(608.71, 'claro', (lt, T) => {
    tick(T);
    const R = rex(54.5, -18.5, Math.PI - 0.55, { phase: T * 0.3, walk: 0.5 });
    D.root.visible = false;
    cam(lerp3([40, 3, -6], [41, 3.5, -7], lt / 2.2), [54, 4, -18], 26, 0.002, T);
    animCard(at(nameCard('trexname', 'TYRANNOSAURUS REX', 'adulto'), 0, 34), lt, 0.2);
  }, [[0.2, 'stamp'], [0.5, 'thud'], [1.6, 'thud']]);
  shot(610.91, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { x: 0, yaw: 0, walk: 0 });
    const rk = ease.out(seg(lt, 0.2, 1.2));
    const r = lazy('rex12', () => { const q = P.buildRuler(1.0); W.sets.estudio.group.add(q); return q; }, (q) => q.visible = false);
    r.visible = rk > 0.01; r.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); r.scale.set(6, 12 * rk, 6); r.position.set(-7.3, 0.02, 1.6);
    cam(lerp3([0, 3.5, 14], [0, 3.3, 13], lt / 1.9), [-1.5, 2.5, 0], 50, 0.002, T);
    animCard(at(card('12mrex', () => makeCard([{ text: '≈ 12 M', px: 22, color: 0xe0862f }, { text: 'DE LARGO', px: 11 }], { padX: 8, padY: 5 })), 0, -36), lt, 0.8);
  }, [[0.2, 'tick'], [0.8, 'pop']]);
  shot(612.81, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    sRex(T, { x: -3.5, yaw: 0, walk: 0 });
    W.cur.cars.forEach((c, i) => { const p = ease.back(seg(lt, 1.6 + i * 0.22, 1.9 + i * 0.22)); c.visible = p > 0.01; c.scale.setScalar(Math.max(0.01, p)); c.position.set(4.5 + (i % 3) * 0 , 0, -3 + i * 1.25 - 0.6); c.position.x = 4.2 + (i % 2) * 0.0; c.position.y = Math.floor(i / 3) * 0; c.rotation.y = 0; });
    W.cur.cars.forEach((c, i) => { c.position.set(3.0 + (i % 3) * 0.0, 0, 0); c.position.x = 2.5; c.position.z = -3.2 + i * 1.3; });
    cam(lerp3([2, 6, 14], [2, 6.2, 13.5], lt / 3.72), [0, 1.5, 0], 50, 0.002, T);
    animCard(at(card('8t', () => makeCard([{ text: '≈ 8 T', px: 22, color: 0xe0862f }, { text: 'TONELADAS', px: 11 }], { padX: 8, padY: 5 })), -56, 32), lt, 0.2);
    animCard(at(card('6autos', () => makeCard([{ text: '> 6 AUTOS', px: 18, color: 0xffd36a }, { text: 'JUNTOS', px: 11 }], { padX: 8, padY: 5 })), 56, 32), lt, 2.0);
  }, [[0.2, 'pop'], [1.6, 'pop'], [1.82, 'pop'], [2.04, 'pop'], [2.26, 'pop'], [2.48, 'pop'], [2.7, 'pop']]);
  shot(616.53, 'estudio', (lt, T) => {
    D.root.visible = false;
    const t = W.cur.tooth, b = W.cur.banana;
    const pt = ease.back(seg(lt, 0.1, 0.5)), pb = ease.back(seg(lt, 0.9, 1.3));
    t.visible = true; t.scale.setScalar(Math.max(0.01, pt)); t.position.set(-0.12, 0, 0); t.rotation.y = lt * 0.4;
    b.visible = pb > 0.01; b.scale.setScalar(Math.max(0.01, pb) * 1.35); b.position.set(0.14, 0.15, 0); b.rotation.set(0, 0.3, Math.PI / 2 - 0.2);
    cam(lerp3([0.0, 0.25, 0.85], [0.0, 0.24, 0.78], lt / 2.3), [0.0, 0.14, 0], 32, 0.002, T);
    animCard(at(label('diente', 'DIENTE DE T. REX', 12), -54, -36), lt, 0.3);
    animCard(at(label('platano', 'UN PLÁTANO', 12), 54, -36), lt, 1.1);
  }, [[0.1, 'pop'], [0.3, 'pop'], [0.9, 'pop'], [1.1, 'pop']]);
  // T. rex caminhando na clareira
  const rexPath = (t) => { const x = lerp(54.5, 38, clamp(t / 30)), z = lerp(-18.5, -7, clamp(t / 30)); return [x, z]; };
  shot(618.83, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const [x, z] = rexPath(lt + 2); const R = rex(x, z, yawTo(-16.5, 11.5), { phase: (lt + 2) * 0.28, walk: 1 });
    cam(lerp3([x - 6, 1.5, z + 10], [x - 6.5, 1.6, z + 9.5], lt / 1.89), [x, 3.5, z], 36, 0.004, T);
    animCard(at(label('despacio2', 'CAMINA DESPACIO', 13), -56, 34), lt, 0.1);
    animCard(at(no('nocorre', '✗ NO CORRE'), -56, 18), lt, 1.15);
  }, [[0.1, 'pop'], [0.4, 'thud'], [1.15, 'pop'], [1.6, 'thud']]);
  shot(620.72, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: 0, walk: 1, phase: lt * 0.4 });
    cam(lerp3([2, 2.5, 13], [1.5, 2.6, 12.5], lt / 2.8), [0, 2.5, 0], 50, 0.002, T);
    W.particles(140, (i) => { const k = (lt * 0.8 + i / 140) % 1; return { p: [8 - k * 16, 0.04, -2 + (i % 7) * 0.6], s: 0.08, c: 0x5a6068 }; });
    animCard(at(label('estudios', 'LOS ESTUDIOS DICEN…', 13), -56, 34), lt, 0.2);
  }, [[0.2, 'pop'], [0.6, 'thud'], [2.0, 'thud']]);
  shot(623.52, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: 0, walk: 1, phase: lt * 0.4 });
    cam(lerp3([1.5, 1.0, 5], [1.2, 1.0, 4.6], lt / 3.18), [0, 1.2, 0], 44, 0.003, T);
    animCard(at(no('nocorrer', '✗ PROBABLEMENTE NO PODÍA CORRER'), 0, -38), lt, 0.3);
  }, [[0.3, 'pop'], [0.8, 'thud'], [2.0, 'thud']]);
  shot(626.70, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const [x, z] = rexPath(6 + lt * 1.5); const R = rex(x, z, yawTo(-16.5, 11.5), { phase: (6 + lt) * 0.45, walk: 1 });
    cam(lerp3([x - 14, 2, z - 6], [x - 13, 2.2, z - 6.5], lt / 2.68), [x, 3, z], 40, 0.005, T);
    animCard(at(win('caminata', 'MÁXIMO: CAMINATA RÁPIDA'), 0, -38), lt, 0.3);
  }, [[0.3, 'ding'], [0.5, 'thud'], [1.2, 'thud'], [1.9, 'thud']]);
  shot(629.38, 'estudio', (lt, T) => {
    studioDark();
    const R = sRex(T, { x: -2 + lt * 0.8, z: -1.5, yaw: 0, walk: 1, phase: lt * 0.5 });
    placeDog(-1 + lt * 2.4, 0, 1.4, 0); poseDog(D, { t: T, gait: 'run', phase: lt * 2.8, ears: 0.8, wag: 0.6 });
    W.particles(80, (i) => ({ p: [6, 0.02 + (i % 2) * 0.01, -4 + (i / 80) * 8], s: 0.07, c: Math.floor(i / 4) % 2 ? 0xffffff : 0x1a1a1a }));
    cam(lerp3([2, 2.6, 9.5], [4, 2.4, 9], lt / 3.31), [2, 1.2, 0], 48, 0.004, T);
    animCard(at(win('gana', '🏁 GANARÍA TU PITBULL'.replace('🏁 ', '')), 0, 34), lt, 2.0);
  }, [[0, 'whoosh'], [2.0, 'ding']]);
  shot(632.69, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const [x, z] = rexPath(14); const R = rex(x, z, yawTo(-16.5, 11.5), { phase: 14 * 0.3 + lt * 0.2, walk: 0.4, headPitch: 0.05 });
    const h = wpos(R.head);
    cam(lerp3([h[0] - 5.5, h[1] + 0.5, h[2] + 4.5], [h[0] - 5, h[1] + 0.4, h[2] + 4.1], lt / 3.19), [h[0] + 0.5, h[1] - 0.1, h[2]], 34, 0.002, T);
    animCard(at(label('masgrande', 'UN PROBLEMA MÁS GRANDE', 13), -56, 34), lt, 0.3);
    animCard(at(stamp('lanariz', 'LA NARIZ', 18), 0, -36), lt, 2.6);
  }, [[0.3, 'pop'], [2.6, 'stamp']]);
  shot(635.88, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: -0.3, headPitch: 0 }); const h = wpos(R.head);
    const bulb = [h[0] + 0.55 * Math.cos(-0.3), h[1] + 0.25, h[2] - 0.55 * Math.sin(-0.3)];
    const gl = ease.out(seg(lt, 0.6, 1.4));
    W.particles(220, (i) => { const a = hash3(i, 1, 2) * 6.28, b = hash3(i, 2, 2) * 3.14, r = 0.28 * Math.cbrt(hash3(i, 3, 2)); return { p: [bulb[0] + Math.cos(a) * Math.sin(b) * r * 1.6, bulb[1] + Math.cos(b) * r * 0.7, bulb[2] + Math.sin(a) * Math.sin(b) * r * 0.9], s: 0.05 * gl * (0.8 + 0.3 * Math.sin(T * 6 + i)), c: i % 3 ? 0xff9a40 : 0xffe080 }; });
    cam(lerp3([h[0] + 1.2, h[1] + 1.0, h[2] + 3.4], [h[0] + 1.1, h[1] + 0.9, h[2] + 3.1], lt / 4.12), [h[0] + 0.4, h[1] + 0.05, h[2]], 38, 0.002, T);
    animCard(at(label('olfato', 'CEREBRO: ENORME ZONA DEL OLFATO', 13), 0, -38), lt, 1.2);
  }, [[0.6, 'rise'], [1.2, 'pop']]);
  shot(640.00, 'estudio', (lt, T) => {
    studioDark(); D.root.visible = false;
    const R = sRex(T, { yaw: -0.3, headPitch: 0.1 + Math.sin(T * 9) * 0.02 }); const h = wpos(R.head);
    const n = [h[0] + 1.2 * Math.cos(-0.3), h[1] + 0.1, h[2] - 1.2 * Math.sin(-0.3)];
    scent(120, [n[0] + 2, n[1] + 0.4, n[2] + 0.5], n, lt, [0xf6e3c4, 0xffc070], 1.4, 0.03);
    cam(lerp3([h[0] + 3.2, h[1] + 0.5, h[2] + 3.0], [h[0] + 2.9, h[1] + 0.45, h[2] + 2.7], lt / 6.43), [h[0] + 0.6, h[1], h[2]], 40, 0.002, T);
    animCard(at(card('top', () => makeCard([{ text: 'ENTRE LOS MEJORES', px: 15, color: 0xffd36a }, { text: 'OLFATOS DE DINOSAURIOS CARNÍVOROS', px: 10 }], { padX: 7, padY: 5 })), 0, -36), lt, 1.4);
  }, [[0.3, 'sniff'], [1.4, 'pop'], [3.0, 'sniff']]);
  shot(646.43, 'estudio', (lt, T) => {
    W.cur.plat.visible = true;
    const R = sRex(T, { x: -2.6, yaw: 0, headPitch: -0.25 + Math.sin(T * 9) * 0.02 });
    placeDog(0.9, 0, 0, Math.PI); poseDog(D, { t: T, sniff: 0.3, headPitch: 0.4, ears: 0.9 });
    const h = wpos(R.head);
    cam(lerp3([0.2, 1.8, 6], [0.1, 1.7, 5.5], lt / 5.68), [0.2, 1.8, 0], 46, 0.002, T);
    animCard(at(card('vs', () => makeCard([{ text: 'VS', px: 26, color: 0xe0862f }], { padX: 8, padY: 5 })), 0, 34), lt, 0.6);
    animCard(at(label('unico3', 'EL ÚNICO QUE COMPITE CON SU NARIZ', 12), 0, -38), lt, 2.6);
  }, [[0.6, 'stamp'], [2.6, 'pop']]);
  // ---- para, cheira, olha ----
  const rexStop = [38, -7], rexYaw = yawTo(-16.5, 11.5);
  shot(652.11, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const st0 = ease.out(seg(lt, 0, 0.6));
    const R = rex(rexStop[0] + 0.6 * (1 - st0), rexStop[1] - 0.4 * (1 - st0), rexYaw, { phase: 16 * 0.3 + st0 * 0.25, walk: 1 - st0 });
    cam(lerp3([rexStop[0] - 12, 2, rexStop[1] + 8], [rexStop[0] - 11.6, 2.1, rexStop[1] + 7.6], lt / 0.96), [rexStop[0], 3.6, rexStop[1]], 34, 0.004, T);
  }, [[0.1, 'thud']]);
  shot(653.07, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const up = ease.io(seg(lt, 0, 0.9));
    const R = rex(rexStop[0], rexStop[1], rexYaw, { phase: 16 * 0.3 + 0.25, walk: 0, headPitch: up * 0.35 + (lt > 1.2 ? Math.sin(T * 9) * 0.02 : 0), pitch: up * 0.05 });
    const h = wpos(R.head);
    if (lt > 1.1) scent(80, [h[0] - 6, h[1] + 1, h[2] + 4], [h[0] + 0.9, h[1], h[2] + 0.3], lt, [0xc8a070, 0x8a7a3a], 3, 0.04);
    cam(lerp3([h[0] - 4.5, h[1] - 0.6, h[2] + 3.4], [h[0] - 4.1, h[1] - 0.5, h[2] + 3.1], lt / 2.06), h, 36, 0.002, T);
    animCard(at(label('huele', 'HUELE EL AIRE', 13), 0, -38), lt, 1.2);
  }, [[0.2, 'whoosh'], [1.2, 'sniff'], [1.6, 'sniff']]);
  shot(655.13, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.5); poseDog(D, { t: T, still: 1, ears: 0.8 });
    cam(lerp3([1.5, 0.55, 1.3], [1.4, 0.52, 1.2], lt / 4.34), [0, 0.3, 0], 36, 0.0, T);
    animCard(at(label('cine2', 'OTRA COSA QUE EL CINE ENSEÑÓ MAL', 12), 0, 36), lt, 0.1);
    animCard(at(no('quieto', 'QUIETO ≠ INVISIBLE'), 0, -38), lt, 2.1);
  }, [[0.1, 'pop'], [2.1, 'stamp']]);
  shot(659.47, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.2, headYaw: Math.sin(lt * 0.6) * 0.2 });
    const h = wpos(R.head), f = [Math.cos(rexYaw), 0, -Math.sin(rexYaw)];
    const eyes = [[h[0] + f[0] * 0.2 + f[2] * 0.4, h[1] + 0.3, h[2] + f[2] * 0.2 - f[0] * 0.4], [h[0] + f[0] * 0.2 - f[2] * 0.4, h[1] + 0.3, h[2] + f[2] * 0.2 + f[0] * 0.4]];
    W.particles(240, (i) => { const e = eyes[i % 2], k = ((Math.floor(i / 2) / 120) + lt * 0.3) % 1, sp = (hash3(i, 2, 2) - 0.5) * 0.5; return { p: [e[0] + f[0] * k * 14 + f[2] * sp * k * 4, e[1] - k * 2.5 + (hash3(i, 3, 2) - 0.5) * k, e[2] + f[2] * k * 14 - f[0] * sp * k * 4], s: 0.06 * (1 - k * 0.5), c: 0xbfe8ff }; });
    cam(lerp3([h[0] + f[0] * 9 + 3, h[1] + 0.5, h[2] + f[2] * 9 + 3], [h[0] + f[0] * 8 + 2.6, h[1] + 0.45, h[2] + f[2] * 8 + 2.6], lt / 3.44), h, 34, 0.002, T);
    animCard(at(label('adelante', 'OJOS HACIA ADELANTE, COMO NOSOTROS', 12), 0, -38), lt, 0.3);
  }, [[0.3, 'pop']]);
  shot(662.91, 'claro', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.15, headYaw: -0.15 });
    const h = wpos(R.head), f = [Math.cos(rexYaw), 0, -Math.sin(rexYaw)];
    cam(lerp3([h[0] + f[0] * 8, h[1] + 0.4, h[2] + f[2] * 8], [h[0] + f[0] * 6.5, h[1] + 0.3, h[2] + f[2] * 6.5], ease.in(lt / 3.73)), h, 34, 0.002, T);
    animCard(at(win('veia', 'VEÍA MUY BIEN'), -56, 34), lt, 0.3);
    animCard(at(stamp('teve', 'SI TE VE, TE VE.', 17), 0, -36), lt, 2.4);
  }, [[0.3, 'ding'], [2.4, 'stamp']]);
  shot(666.64, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 9, walk: 0, turn: 1 });
    lieDog({ ears: 1, still: 1 });
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.1 });
    cam(lerp3([3, 1.0, -0.6], [2.6, 0.9, -0.5], lt / 3.93), [0.1, 0.25, 0.1], 36, 0.001, T);
    animCard(at(label('novista', 'NO ESTÁ A LA VISTA', 13), -56, 34), lt, 0.3);
    animCard(at(label('detras', 'DETRÁS DE LOS HELECHOS', 13), 0, -38), lt, 2.0);
  }, [[0.3, 'pop'], [2.0, 'pop']]);
  const wind = (lt, from, to, n = 200, col = 0xe8f0ff) => W.particles(n, (i) => { const k = ((i / n) * 3 + lt * 0.35) % 1, L = i % 5; const p = lerp3(from, to, k); return { p: [p[0] + (L - 2) * 1.2, p[1] + Math.sin(k * 12 + L) * 0.4 + (L % 2) * 0.8, p[2] + (L - 2) * 1.0 + Math.cos(k * 9) * 0.3], s: 0.07 * Math.sin(k * Math.PI), c: col }; });
  shot(670.57, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.1 });
    wind(lt, [rexStop[0], 4, rexStop[1]], [0, 0.5, 0]);
    cam(lerp3([10, 16, 22], [12, 17, 20], lt / 3.56), [18, 0, -3], 46, 0.002, T);
    animCard(at(card('viento', () => makeCard([{ text: 'VIENTO', px: 12 }, { text: 'T. REX  →  PERRO', px: 16, color: 0xbfe8ff }], { padX: 7, padY: 5 })), 0, -36), lt, 0.3);
  }, [[0.3, 'wind'], [0.5, 'pop']]);
  shot(674.13, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1, headPitch: 0.1 + Math.sin(T * 9) * 0.02 });
    const n = noseWorld();
    scent(90, [n.x + 1.5, n.y + 0.2, n.z - 0.3], [n.x, n.y, n.z], lt, [0xc8a070, 0x8a7a3a, 0xe8c090], 0.8, 0.01);
    cam(lerp3([n.x - 0.1, n.y + 0.12, n.z + 0.65], [n.x - 0.08, n.y + 0.1, n.z + 0.58], lt / 2.75), [n.x + 0.1, n.y, n.z], 32, 0.0, T);
    animCard(at(win('lohuele', 'ÉL HUELE AL T. REX'), -56, 34), lt, 0.1);
    animCard(at(no('noalrevez', '✗ NO AL REVÉS'), -56, 18), lt, 1.2);
  }, [[0.1, 'sniff'], [0.1, 'ding'], [1.2, 'pop']]);
  shot(676.88, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const c = [0.15, 0.25, 0.1], mix = ease.io(seg(lt, 0.5, 2.5));
    W.particles(300, (i) => { const a = hash3(i, 1, 6) * 6.28 + lt * 0.3, r = 0.3 + hash3(i, 2, 6) * (i < 150 ? 0.3 : 6); const own = i < 150; return { p: [c[0] + Math.cos(a) * r, 0.1 + hash3(i, 4, 6) * (own ? 0.5 : 1.2), c[2] + Math.sin(a) * r], s: own ? 0.012 : 0.04, c: own ? (hash3(i, 3, 6) > mix ? 0xffb070 : 0x7a8a3a) : 0x7a8a3a }; });
    cam(lerp3([-2.2, 1.6, 2.4], [-2.0, 1.5, 2.2], lt / 3.53), [0.4, 0.2, 0.1], 42, 0.002, T);
    animCard(at(label('mismo', 'HUELE IGUAL QUE TODO EL CLARO', 13), 0, -38), lt, 0.6);
    animCard(at(card('aexcr', () => makeCard([{ text: 'A EXCREMENTO', px: 15, color: 0xc8a060 }], { padX: 7, padY: 5 })), -56, 34), lt, 2.4);
  }, [[0.6, 'pop'], [2.4, 'pop']]);
  shot(682.41, 'bosque', (lt, T) => {
    tick(T); W.mood('meio', B().pmat);
    const dg = [2.0, 0, 4.7];
    dogAt(gB, dg[0] + 0.55, dg[2] - 0.25, 2.6, { roll: 1, rollSpeed: 11, ears: 0.6, wag: 1, wagSpeed: 18 });
    flies(30, [dg[0], 0.45, dg[2]], T);
    cam([dg[0] + 1.5, 0.5, dg[2] + 0.4], [dg[0] + 0.45, 0.15, dg[2] - 0.2], 40, 0.004, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(label('revolcon', 'EL REVOLCÓN DEL MEDIODÍA', 14), 0, -38), lt, 0.6);
  }, [[0.3, 'squish'], [0.6, 'pop']]);
  shot(685.17, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const h = wpos(D.head);
    cam([h[0] - 0.05, h[1] + 0.08, h[2] + 0.45], [h[0] + 0.05, h[1] + 0.05, h[2]], 28, 0.0, T);
    const s = Math.floor(lt * 1.2);
    animCard(at(card('seg' + s, () => makeCard([{ text: '0:0' + s, px: 18, color: 0xffd36a }], { bg: 0x16191c, border: 0x3a3f46, padX: 6, padY: 4 })), 62, 34), lt, -1);
  }, [[0, 'heartbeat'], [1, 'heartbeat'], [2, 'heartbeat']]);
  shot(687.48, 'claro', (lt, T) => {
    tick(T); herd(T, { alert: 1, move: 9, walk: 0, turn: 1 }); D.root.visible = false;
    const yawH = lt < 2.8 ? lerp(0, 0.55, ease.io(seg(lt, 0.3, 2.2))) : lerp(0.55, -0.45, ease.io(seg(lt, 2.8, 3.95)));
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.1, headYaw: yawH });
    const h = wpos(R.head);
    cam(lerp3([h[0] - 7, h[1] - 1.5, h[2] + 4], [h[0] - 6.6, h[1] - 1.4, h[2] + 3.8], lt / 3.95), h, 32, 0.0, T);
    animCard(at(label('gira', 'GIRA LA CABEZA, DESPACIO', 13), -50, 34), lt, 0.3);
    animCard(at(label('hmanada', 'HACIA LA MANADA', 13), -50, 18), lt, 2.8);
  }, [[0.3, 'pop'], [2.8, 'pop']]);
  shot(691.43, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const yawH = lt < 1.1 ? -0.45 : lerp(-0.45, 0.55, ease.io(seg(lt, 1.2, 2.5)));
    const R = rex(rexStop[0], rexStop[1], rexYaw, { walk: 0, phase: 16 * 0.3 + 0.25, headPitch: 0.1, headYaw: yawH });
    const h = wpos(R.head);
    const fw = [Math.cos(rexYaw), 0, -Math.sin(rexYaw)];
    cam([h[0] - fw[0] * 3.5 + 1.2, h[1] + 1.6, h[2] - fw[2] * 3.5 + 1.2], [0.6, 0.5, 0.1], 11, 0.0, T);
    animCard(at(label('hhelechos', 'HACIA LOS HELECHOS…', 13), -50, 34), lt, 0.1);
    animCard(at(label('otravez', 'OTRA VEZ HACIA LA MANADA', 13), -50, 18), lt, 1.2);
  }, [[0.1, 'pop'], [1.2, 'pop'], [0.5, 'tension']]);
  shot(694.14, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const n = noseWorld();
    cam([n.x - 0.25, n.y + 0.08, n.z + 0.6], [n.x - 0.1, n.y, n.z], 30, 0.0, T);
  }, [[0, 'heartbeat']]);
  shot(695.17, 'sala', (lt, T) => {
    placeDog(2.55, 0, 0.8, 0); poseDog(D, { t: T, ears: 1, jaw: bark(lt, 0.1, 1.4, 8) * 0.9, wag: 0.6, headPitch: 0.1 });
    cam([3.15, 0.62, 2.1], [2.75, 0.55, 0.75], 44, 0.01, T);
    animCard(at(label('timbre2', 'AL TIMBRE', 14), -56, 34), lt, 0.05);
  }, [[0.0, 'ding'], [0.1, 'bark'], [0.5, 'bark']]);
  shot(696.71, 'rua', (lt, T) => {
    const pm = postman(); posePerson(pm, 1.4, 2.6, Math.PI, 0.3, lt * 0.8);
    placeDog(0.3, 0, 1.4, 0.9); poseDog(D, { t: T, ears: 1, tailUp: 1, jaw: bark(lt, 0.0, 1.2, 6), headPitch: 0.3 });
    cam([-0.9, 0.6, 0.6], [0.9, 0.7, 2.2], 44, 0.01, T);
    animCard(at(label('cartero2', 'AL CARTERO', 14), -56, 34), lt, 0.05);
  }, [[0.05, 'bark'], [0.45, 'bark']]);
  shot(697.92, 'quarto', (lt, T) => {
    const v = W.cur.vac; v.visible = true; v.position.set(0.9 + Math.sin(lt * 3) * 0.1, 0, 0.2); v.rotation.y = -2.2;
    placeDog(0.1, 0, 0.5, -0.2); poseDog(D, { t: T, crouch: 0.35, ears: 1, jaw: bark(lt, 0.0, 1.0, 7) * 0.9, headPitch: 0.1 });
    cam([0.5, 0.6, 1.8], [0.5, 0.25, 0.3], 44, 0.01, T);
    animCard(at(label('aspiradora2', 'A LA ASPIRADORA', 14), -56, 34), lt, 0.05);
  }, [[0.05, 'bark'], [0.0, 'vacuum']]);
  shot(698.92, 'rua', (lt, T) => {
    const bag = lazy('bag', () => { const b = P.shapes([{ t: 'ell', c: [0, 0.15, 0], r: [0.16, 0.14, 0.12], col: 0xeceff2 }, { t: 'ell', c: [0.08, 0.3, 0], r: [0.04, 0.06, 0.03], col: 0xd8dce0 }, { t: 'ell', c: [-0.08, 0.3, 0], r: [0.04, 0.06, 0.03], col: 0xd8dce0 }], 0.015); W.sets.rua.group.add(b); return b; }, (b) => b.visible = false);
    bag.visible = true; bag.position.set(0.9 + Math.sin(lt * 2) * 0.3, 0.4 + Math.sin(lt * 3) * 0.2, 0.6); bag.rotation.set(Math.sin(lt * 4) * 0.5, lt, 0.2);
    placeDog(-0.2, 0, 0.5, 0.0); poseDog(D, { t: T, ears: 1, jaw: bark(lt, 0.0, 1.0, 7) * 0.9, headPitch: 0.3, crouch: 0.2 });
    cam([0.3, 0.5, 2.0], [0.4, 0.35, 0.5], 44, 0.01, T);
    animCard(at(label('bolsas', 'A LAS BOLSAS DE PLÁSTICO', 13), -50, 34), lt, 0.05);
  }, [[0.05, 'bark'], [0.4, 'bark']]);
  shot(699.88, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1, jaw: 0 });
    const m = mouthWorld(); const k = ease.in(lt / 2.36);
    cam(lerp3([m.x - 0.1, m.y + 0.1, m.z + 0.9], [m.x - 0.05, m.y + 0.03, m.z + 0.5], k), [m.x + 0.02, m.y, m.z], 30, 0.0, T);
    animCard(at(title('niunruido', [{ text: 'NI UN SOLO RUIDO', px: 16 }]), 0, -36), lt, 0.8);
  }, [[0, 'silence'], [0.8, 'pop']]);
  shot(702.24, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const go = seg(lt, 0, 3.2);
    const x = rexStop[0] + lerp(0, 4, go), z = rexStop[1] + lerp(0, 9, go);
    const R = rex(x, z, yawTo(4, 9), { phase: 16 * 0.3 + 0.25 + go * 1.2, walk: Math.min(1, lt * 2) });
    cam(lerp3([-1.1, 0.9, 0.6], [-1.12, 0.9, 0.65], lt / 3.21), [x, 4, z], 20, 0.003 + (Math.abs(Math.sin(lt * 4)) > 0.95 ? 0.01 : 0), T);
    animCard(at(label('paso', 'UN PASO… OTRO…', 13), -56, 34), lt, 0.1);
    animCard(at(label('sigue', 'Y SIGUE DE LARGO', 13), 0, -38), lt, 2.1);
  }, [[0.1, 'thud'], [0.1, 'pop'], [1.5, 'thud'], [2.1, 'pop'], [2.9, 'thud']]);
  shot(705.45, 'claro', (lt, T) => {
    tick(T); lieDog({ ears: 1, still: 1 });
    const go = seg(lt, 0, 3.4);
    const x = rexStop[0] + 4 + lerp(0, 6, go), z = rexStop[1] + 9 + lerp(0, 18, go);
    rex(x, z, yawTo(6, 18), { phase: 16 * 0.3 + 1.45 + go * 2, walk: 1 });
    cam([20, 5, -16], [x, 3, z], 30, 0.002, T);
    animCard(at(label('rumbo', 'RUMBO AL RÍO', 14), 0, -38), lt, 1.3);
  }, [[0.3, 'thud'], [1.3, 'pop'], [1.6, 'thud']]);
  // ---- a pegada era um caminho ----
  shot(708.93, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.06; D.root.visible = false;
    cam(lerp3([0.62, 1.55, 0.95], [0.6, 1.4, 0.85], lt / 2.47), [0.6, 0, 0.5], 40, 0.002, T);
    st.veil.material.color.set(0xd8b080); st.veil.material.opacity = 0.18;
    animCard(at(label('entiende', 'AHORA ENTIENDE LA HUELLA', 13), 0, -38), lt, 0.6);
  }, [[0, 'whoosh'], [0.6, 'pop']]);
  shot(711.40, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35); D.root.visible = false;
    const k = ease.io(lt / 3.78);
    cam(lerp3([2.5, 3.5, 1.0], [5.0, 8.0, 2.0], k), lerp3([1.5, 0, -1], [2.5, 0, -7], k), 44, 0.002, T);
    W.particles(300, (i) => { const n = Math.floor(i / 25), j = i % 25; const z = 1.5 - n * 2.4, x = 2.2 + Math.sin(z * 0.25) * 0.6 + (n % 2 ? 0.5 : -0.5); const vis = clamp(lt * 1.2 - n * 0.12); const ang = (j / 25) * 6.28; const tx = Math.cos(ang) * 0.22 * (j < 12 ? 1 : 0.6), tz = Math.sin(ang) * 0.3; return { p: [x + tx, groundH(x, z) + 0.03, z + tz], s: 0.045 * vis, c: 0x5a3a24 }; });
    animCard(at(no('casualidad', '✗ NO PASABA POR CASUALIDAD'), 0, 36), lt, 0.3);
    animCard(at(stamp('camino', 'ERA UN CAMINO', 18), 0, -36), lt, 2.7);
  }, [[0.3, 'pop'], [2.7, 'stamp']]);
  shot(715.18, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false;
    trail2(lt);
    cam(lerp3([2.0, 1.2, 2.2], [1.6, 1.3, 2.5], lt / 4.7), [0.2, 0, -0.6], 42, 0.002, T);
    animCard(at(label('dondetomo', 'DONDE TOMÓ AGUA', 13), -56, 34), lt, 0.2);
    animCard(at(label('ibayvenia', 'DONDE EL OLOR IBA Y VENÍA', 13), 0, -38), lt, 1.9);
  }, [[0.2, 'pop'], [1.9, 'pop']]);
  function trail2(lt) { W.particles(240, (i) => { const L = i % 3, u = ((i / 240) + lt * 0.08 + L * 0.3) % 1; const x = lerp(-6, 9, u), z = 0.25 + Math.sin(x * 0.5 + L) * 0.25 + L * 0.15; return { p: [x, gO(x, z) + 0.05, z], s: 0.02 * clamp(lt), c: [0xffc070, 0xff9a50, 0xffe0a0][L] }; }); }
  const rexDrink = (T, lt, arrive) => { const R = O().trex; R.root.visible = true; subj(R.root); const k = ease.out(clamp(arrive)); const x = lerp(-9, -3.2, k), z = lerp(4.5, 1.6, k); R.root.position.set(x, gO(x, z) - 0.05, z); R.root.rotation.y = lerp(yawTo(1, -0.5), yawTo(0.2, -1), k); const dr = ease.io(seg(lt, 2.4, 3.4)); poseTrex(R, { phase: T * 0.3, walk: 1 - k, headPitch: -0.9 * dr, pitch: -0.25 * dr, jaw: dr * 0.15 }); return R; };
  shot(719.88, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = rexDrink(T, lt + 1, (lt) / 2.4);
    cam(lerp3([5, 2.0, 2.5], [4.6, 2.1, 2.7], lt / 3.45), [-3, 2.5, 0.5], 42, 0.004, T);
    animCard(at(label('bajabeber', 'POR AQUÍ BAJA A BEBER EL T. REX', 13), 0, -38), lt, 0.3);
    animCard(at(stamp('todoslosdias', 'TODOS LOS DÍAS', 16), 0, 34), lt, 2.3);
  }, [[0.3, 'pop'], [0.4, 'thud'], [1.3, 'thud'], [2.3, 'stamp']]);
  shot(723.33, 'orilla', (lt, T) => {
    tick(T); D.root.visible = false;
    const R = rexDrink(T, 5, 2);
    const h = wpos(R.head);
    rings([h[0], -0.07, h[2]], lt * 1.4, 0xe0f0f0);
    cam(lerp3([4.5, 1.8, -1.2], [4.2, 1.7, -1.0], lt / 3.79), [-2.8, 1.6, 0.2], 40, 0.002, T);
    animCard(at(title('cocinavecino', [{ text: 'TOMÓ AGUA EN LA COCINA', px: 13 }, { text: 'DEL VECINO MÁS PELIGROSO', px: 15, color: 0xe0862f }]), 0, -34), lt, 0.6);
  }, [[0.4, 'trickle'], [0.6, 'stamp']]);
}
