// Linha do tempo do piloto: cada plano tem início/fim (s, no áudio com ritmo ajustado) e uma função que monta o quadro.
import * as THREE from 'three';
import { ease, clamp, lerp, lerp3, seg, shake } from '/videos/engine/lib/core.js';
import { poseDog } from '/videos/engine/lib/dog.js';
import { poseTrex } from '/videos/engine/lib/world.js';
import { FOOT, WATER_Y, riverX } from '/videos/engine/lib/creta.js';
import { makeCard, animCard, voxelText, animText } from '/videos/engine/lib/text.js';
import * as P from '/videos/engine/lib/props.js';
import { hash3 } from '/videos/engine/lib/vox.js';
import { groundH } from './sets.js';

export function makeShots(W) {
  const st = W.st, D = W.dog;
  // ---------- utilidades ----------
  const REG = new Map();
  const card = (key, make) => { if (!REG.has(key)) { const c = make(); st.oscene.add(c); REG.set(key, c); } const c = REG.get(key); c.userData.used = true; return c; };
  const stamp = (k, text, px = 16) => card(k, () => makeCard([{ text, px, color: 0xfff1dc }], { bg: 0xc8322b, border: 0x7a1a14, padX: 6, padY: 5 }));
  const title = (k, lines) => card(k, () => makeCard(lines.map(l => typeof l === 'string' ? { text: l, px: 16 } : l), { padX: 8, padY: 7 }));
  const label = (k, text, px = 12) => card(k, () => makeCard([{ text, px, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xe0862f, padX: 5, padY: 4, cell: 1.2 }));
  const num = (k, n, text) => card(k, () => makeCard([{ text: n, px: 22, color: 0xe0862f }, { text, px: 13 }], { padX: 8, padY: 6, gap: 1.6 }));
  const at = (c, x, y) => { c.position.set(x, y, 0); return c; };
  const fixed = (c, x, y) => { c.position.set(x, y, 0); c.userData.anchored = true; return c; };
  const anchor = (c, wp, dx = 0, dy = 0) => { const o = st.toOverlay(wp); const hw = (c.userData.W || 20) / 2 + 3, hh = (c.userData.H || 8) / 2 + 3; c.position.set(clamp(o[0] + dx, -96 + hw, 96 - hw), clamp(o[1] + dy, -54 + hh, 54 - hh), 0); c.userData.anchored = true; return c; };
  const gy = (x, z) => (groundH(x, z) + groundH(x + 0.12, z) + groundH(x - 0.12, z) + groundH(x, z + 0.1) + groundH(x, z - 0.1)) / 5;
  const placeDog = (x, y, z, yaw) => { D.root.position.set(x, y, z); D.root.rotation.set(0, yaw, 0); };
  const cam = (pos, tgt, fov = 35, sh = 0, T = 0, roll = 0) => {
    sh *= 0.55; const s = shake(T, sh, 3), s2 = shake(T + 9, sh * 0.6, 7);
    st.look([pos[0] + s[0], pos[1] + s[1], pos[2] + s[2]], [tgt[0] + s2[0], tgt[1] + s2[1], tgt[2] + s2[2]], roll, fov);
  };
  const bark = (lt, a, b, rate = 9) => (lt > a && lt < b) ? Math.max(0, Math.sin((lt - a) * rate * Math.PI)) : 0;
  const yawTo = (dx, dz) => Math.atan2(-dz, dx);
  const mouthWorld = () => { D.root.updateMatrixWorld(true); const v = new THREE.Vector3(0.2, -0.035, 0); D.head.localToWorld(v); return v; };
  const noseWorld = () => { D.root.updateMatrixWorld(true); const v = new THREE.Vector3(0.235, 0.02, 0); D.head.localToWorld(v); return v; };
  const C = () => W.sets.creta.C;
  const trex = (x, z, yaw, phase, o = {}) => { const T = C().trex; T.root.visible = true; T.root.position.set(x, groundH(x, z) - 0.05, z); T.root.rotation.y = yaw; poseTrex(T, { phase, ...o }); };
  const water = (T) => { const c = C(); c.wmat.userData.u.uTime.value = T; c.fmat.userData.u.uTime.value = T; for (const f of c.ferns) f.material.userData.uniforms.uTime.value = T; };
  const shadowAt = (p, size = 2.5, dir = [0.55, 0.42, -0.72]) => W.L.aim(p, dir, size, 18);
  const sunset = () => { const u = W.sky.userData.u; u.top.value.set(0x6f9fb6); u.mid.value.set(0xe9c79a); u.hor.value.set(0xf6b47a); u.sunDir.value.set(0.6, 0.1, -0.8).normalize(); u.glow.value = 0.45; st.scene.fog.color.set(0xdcb48c); W.L.sun.intensity = 2.4; W.L.hemi.intensity = 1.3; W.L.sun.color.set(0xffc48a); W.L.hemi.color.set(0xc8dce4); C().wmat.userData.u.skyc.value.set(0xe9c6a8); C().wmat.userData.u.fogColor.value.set(0xd9b48c); };
  const dust = (n, center, spread, t, col, seed = 1) => W.particles(n, (i) => {
    const r1 = hash3(i, seed, 1), r2 = hash3(i, seed, 2), r3 = hash3(i, seed, 3);
    return { p: [center[0] + (r1 - 0.5) * spread, center[1] + ((r2 + t * 0.15) % 1) * spread * 0.5, center[2] + (r3 - 0.5) * spread], s: 0.006 + r1 * 0.006, c: col, rx: t + i, ry: t * 2 + i };
  });
  const person = (x, z, yaw, o = {}) => {
    const p = W.getPerson(); p.root.position.set(x, o.y ?? 0, z); p.root.rotation.set(0, yaw, 0);
    const w = o.walk ?? 0, ph = (o.phase ?? 0) * Math.PI * 2, sit = o.sit ?? 0;
    p.legs[0].rotation.set(Math.sin(ph) * 0.45 * w - 1.55 * sit, 0, 0); p.legs[1].rotation.set(-Math.sin(ph) * 0.45 * w - 1.55 * sit, 0, 0);
    p.shins[0].rotation.set(Math.max(0, Math.cos(ph)) * 0.7 * w + 1.6 * sit, 0, 0); p.shins[1].rotation.set(Math.max(0, -Math.cos(ph)) * 0.7 * w + 1.6 * sit, 0, 0);
    p.root.position.y += w * (0.5 - 0.5 * Math.cos(ph * 2)) * 0.02;
    p.arms[0].rotation.set(-Math.sin(ph) * 0.4 * w + (o.armL ?? 0), 0, 0); p.arms[1].rotation.set(Math.sin(ph) * 0.4 * w + (o.armR ?? 0), 0, 0);
    p.torso.rotation.set(o.bend ?? 0, 0, 0); p.head.rotation.set(o.headPitch ?? 0, o.headYaw ?? 0, 0);
    return p;
  };
  const stars = (k, t) => W.particles(260, (i) => { const a = hash3(i, 4, 1) * Math.PI * 1.3 - 0.2, e = 0.12 + hash3(i, 4, 2) * 0.9; const r = 400; return { p: [Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, -Math.abs(Math.sin(a)) * Math.cos(e) * r - 60], s: (1.0 + hash3(i, 4, 3) * 1.4) * k * (0.7 + 0.3 * Math.sin(t * 3 + i)), c: 0xfff6e0 }; });

  // ---------- planos ----------
  const S = [];
  const shot = (a, set, fn, cues = []) => S.push({ a, set, fn, cues });

  // 1 · o sofá é dele
  shot(0.0, 'sala', (lt, T) => {
    const up = ease.io(seg(lt, 0.9, 1.6));
    placeDog(-0.7, 0.56, -1.78, -0.25);
    poseDog(D, { t: T, lie: 1, headPitch: -0.25 + up * 0.3, headYaw: up * 0.55, ears: 0.2 + up * 0.3, wag: 0.4 * up, wagSpeed: 6 });
    cam(lerp3([1.0, 0.85, 0.9], [0.45, 0.75, 0.25], ease.out(lt / 2.6)), [-0.5, 0.72, -1.75], 38, 0.006, T);
    animCard(at(stamp('suyo1', 'SUYO'), 46, 18), lt, 1.85);
  }, [[1.85, 'stamp']]);
  // 2 · a porta é dele + campainha
  shot(2.55, 'sala', (lt, T) => {
    const ring = seg(lt, 2.35, 2.6), jump = ease.out(seg(lt, 2.45, 2.7));
    placeDog(2.55, 0, 0.8, 0);
    poseDog(D, { t: T, sit: 1 - jump, ears: 0.4 + jump * 0.6, jaw: bark(lt, 2.55, 3.0, 8) * 0.9, wag: 0.6, tailUp: jump, headPitch: 0.1 });
    D.root.position.y = Math.sin(clamp((lt - 2.45) / 0.35) * Math.PI) * 0.08;
    cam(lerp3([3.15, 0.62, 2.1], [3.1, 0.6, 1.9], lt / 3), [2.75, 0.55, 0.75], 44, lt > 2.45 ? 0.02 : 0.006, T);
    animCard(anchor(stamp('suya', 'SUYA'), [3.45, 1.55, 0.8], 0, 6), lt, 1.05);
    if (ring > 0) {
      animCard(anchor(label('ding', 'DING DONG'), [3.45, 2.0, 0.8], -20, 10), lt, 2.4);
      W.particles(90, (i) => { const k = (i % 3), a = (i / 30) * Math.PI * 2, r = 0.1 + ((lt - 2.4) * 0.9 + k * 0.12) % 0.5; return { p: [3.4, 2.0 + Math.sin(a) * r, 0.8 + Math.cos(a) * r], s: 0.018 * (1 - r / 0.5), c: 0xffe9b0 }; });
    }
  }, [[1.05, 'stamp'], [2.4, 'ding']]);
  // 3 · o bairro inteiro
  shot(5.55, 'rua', (lt, T) => {
    placeDog(0, 0.24, -0.8, -Math.PI / 2);
    poseDog(D, { t: T, ears: 1, jaw: bark(lt, 0.1, 2.1, 7) * 0.8, tailUp: 1, wag: 0.8, headPitch: 0.15 });
    const k = ease.io(lt / 2.1);
    cam(lerp3([1.5, 0.7, -1.6], [1.6, 1.5, -1.85], k), lerp3([-1.6, 0.3, 1.4], [-1.1, 0.15, 3.5], k), lerp(48, 54, k), 0.008, T);
    animCard(at(stamp('suyo2', 'TODO SUYO', 20), 0, 26), lt, 1.0);
  }, [[0, 'whoosh'], [1.0, 'stamp']]);
  // 4 · em casa, investiga qualquer barulho
  shot(7.65, 'sala', (lt, T) => {
    const wake = ease.out(seg(lt, 1.55, 1.85)), rise = ease.io(seg(lt, 2.1, 2.45)), run = seg(lt, 2.35, 3.85);
    const p0 = [-0.4, -0.15], p1 = [2.45, 0.8];
    const pr = ease.in(run) * 0.6 + run * 0.4;
    const x = lerp(p0[0], p1[0], pr), z = lerp(p0[1], p1[1], pr);
    const yaw0 = -0.6, yaw1 = yawTo(p1[0] - p0[0], p1[1] - p0[1]);
    placeDog(x, 0.02, z, lerp(yaw0, yaw1, ease.io(seg(lt, 2.0, 2.4))));
    poseDog(D, { t: T, lie: 1 - rise, headPitch: -0.35 + wake * 0.45, headYaw: wake * 0.7 * (1 - rise), ears: lt > 1.55 ? 1 : 0.05 + Math.max(0, Math.sin(lt * 20)) * 0.3 * seg(lt, 1.3, 1.55), gait: lt > 2.3 ? 'run' : 'idle', amt: ease.io(seg(lt, 2.4, 2.75)), phase: lt * 2.6, wag: run > 0 ? 0.5 : 0 });
    const tgt = [x + 0.3, 0.3, z];
    cam(lerp3([0.6, 0.45, 1.3], [1.3, 0.7, 2.2], ease.io(seg(lt, 2.2, 3.85))), lerp3([-0.2, 0.25, -0.2], tgt, ease.io(seg(lt, 1.9, 2.8))), 40, 0.007, T);
    if (lt > 1.45 && lt < 2.2) W.particles(60, (i) => { const r = 0.05 + ((lt - 1.45) * 0.8 + (i % 3) * 0.1) % 0.4, a = (i / 20) * Math.PI * 2; return { p: [3.35, 1.0 + Math.sin(a) * r, 0.8 + Math.cos(a) * r], s: 0.016, c: 0xffe9b0 }; });
    if (lt > 1.6) animCard(anchor(label('ruido', '¿?', 14), [x + 0.3, 0.85, z]), lt, 1.6, 2.4);
  }, [[0, 'whoosh'], [1.5, 'knock'], [1.6, 'pop']]);
  // 5 · aqui: segue um som até o rio (focinho farejando)
  shot(11.5, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    const x = -0.75 + lt * 0.22, z = 0.42;
    placeDog(x, gy(x, z), z, 0);
    poseDog(D, { t: T, gait: 'walk', phase: lt * 1.0, sniff: 1, ears: 0.5, wag: 0.3 });
    const n = noseWorld();
    cam([n.x + 0.22, n.y + 0.16, n.z - 0.8], [n.x - 0.18, n.y - 0.03, n.z], 36, 0.004, T);
    shadowAt([x + 0.3, 0, z], 1.6);
    W.particles(40, (i) => { const k = ((lt * 0.7 + hash3(i, 1, 1)) % 1); const g = [n.x + 0.25 + hash3(i, 2, 2) * 0.3, gy(n.x + 0.3, z) + 0.01, n.z + (hash3(i, 3, 3) - 0.5) * 0.25]; const q = lerp3(g, [n.x + 0.01, n.y - 0.005, n.z], ease.in(k)); return { p: q, s: 0.006 * (1 - k * 0.5), c: 0xf6e3c4 }; });
  }, [[0, 'whoosh'], [0.2, 'sniff'], [1.3, 'sniff']]);
  // 6 · a pata ao lado da pegada (a pegada aparece antes da palavra)
  shot(13.85, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    C().footWater.position.y = -0.085;
    const step = ease.io(seg(lt, 0, 0.9));
    const x = lerp(-0.12, 0.12, step), z = 0.35;
    placeDog(x, gy(x, z), z, 0.12);
    poseDog(D, { t: T, gait: 'walk', amt: 1 - ease.io(seg(lt, 0.7, 1.05)), phase: lt * 1.1, sniff: 0.75, ears: 0.6 });
    cam(lerp3([0.95, 1.25, 1.25], [0.85, 1.05, 1.1], ease.out(lt / 3.3)), [0.48, -0.05, 0.45], 40, 0.004, T);
    shadowAt([0.5, 0, 0.45], 1.5);
    // régua sobre a pegada
    const rk = ease.back(seg(lt, 1.65, 2.1));
    let r = W.cur.footRuler; if (!r) { r = W.cur.footRuler = P.buildRuler(0.8); C().set.add(r); }
    const c = Math.cos(FOOT.ang), s = Math.sin(FOOT.ang);
    r.visible = rk > 0.01; r.rotation.order = 'YXZ'; r.rotation.set(-Math.PI / 2, FOOT.ang + Math.PI, 0);
    r.scale.set(1.3, rk, 1.3);
    r.position.set(FOOT.x + 0.36 * c - 0.26 * s, groundH(FOOT.x + 0.36 * c, FOOT.z - 0.36 * s) + 0.012, FOOT.z - 0.36 * s - 0.26 * c);
    if (rk > 0.01) animCard(anchor(label('80cm', '≈ 80 CM', 13), [FOOT.x + 0.35, 0.02, FOOT.z - 0.35], 0, 12), lt, 1.75);
  }, [[0.95, 'step'], [1.65, 'tick'], [1.75, 'pop']]);
  // 7 · ainda tem água dentro, enchendo devagar
  shot(17.15, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35);
    if (W.cur.footRuler) W.cur.footRuler.visible = false;
    const lvl = lerp(-0.085, -0.05, ease.sine(lt / 3.05));
    C().footWater.position.y = lvl;
    placeDog(0.02, gy(0.02, 0.3), 0.3, 0.15);
    poseDog(D, { t: T, sniff: 0.8, ears: 0.6 });
    const c = Math.cos(FOOT.ang), s = Math.sin(FOOT.ang);
    const tip = [FOOT.x + 0.42 * s, -0.06, FOOT.z + 0.42 * c];
    cam(lerp3([FOOT.x - 0.75, 0.42, FOOT.z + 0.85], [FOOT.x - 0.6, 0.34, FOOT.z + 0.68], lt / 3), [FOOT.x + 0.05, -0.08, FOOT.z], 36, 0.003, T);
    shadowAt([FOOT.x, 0, FOOT.z], 1.2);
    // filete de água escorrendo para dentro da pegada
    W.particles(70, (i) => { const k = (lt * 1.1 + i / 70) % 1; const src = [FOOT.x + 0.62 * s + 0.08, -0.03, FOOT.z + 0.62 * c - 0.02]; const q = lerp3(src, tip, k); q[1] = lerp(-0.03, lvl + 0.004, k) + Math.sin(k * 20 + T * 6) * 0.002; q[0] += Math.sin(i * 1.7) * 0.008; return { p: q, s: 0.009, c: 0x8fb7b8 }; });
  }, [[0.1, 'trickle']]);
  // 8 · e isso quer dizer uma coisa só (cão levanta a cabeça)
  shot(20.2, 'creta', (lt, T) => {
    sunset(); water(T); trex(24, -42, 1.77, T * 0.35, { headYaw: 0.2 });
    C().footWater.position.y = -0.05;
    const up = ease.io(seg(lt, 0.3, 1.1));
    placeDog(0.02, gy(0.02, 0.3), 0.3, lerp(0.15, 0.55, up));
    poseDog(D, { t: T, sniff: 0.8 * (1 - up), headPitch: up * 0.15, headYaw: up * 0.35, ears: 0.6 + up * 0.4, tailDown: up * 0.3 });
    const h = noseWorld();
    cam(lerp3([h.x + 0.85, h.y + 0.06, h.z + 0.55], [h.x + 0.75, h.y + 0.08, h.z + 0.48], ease.out(lt / 2.25)), [h.x - 0.18, h.y - 0.02, h.z], 36, 0.004, T);
    shadowAt([0.2, 0, 0.3], 1.4);
  }, []);
  // 9 · abre a câmera: o rio e o T. rex ao fundo, entre as árvores
  shot(22.45, 'creta', (lt, T) => {
    sunset(); water(T);
    trex(15 - lt * 0.2, -20 - lt * 1.0, 1.75, T * 0.32, { headYaw: Math.sin(T * 0.8) * 0.25 });
    C().footWater.position.y = -0.05;
    placeDog(0.02, gy(0.02, 0.3), 0.3, 0.55);
    poseDog(D, { t: T, headPitch: 0.15, headYaw: 0.35, ears: 1, tailDown: 0.3 });
    const k = ease.io(lt / 3.55);
    cam(lerp3([-0.7, 0.55, 1.1], [-2.4, 1.6, 3.6], k), lerp3([2.5, 0.6, -3], [9, 2.0, -18], k), lerp(38, 44, k), 0.006, T);
    shadowAt([0.5, 0, 0], 3);
  }, [[0, 'tension'], [1.4, 'rumble']]);
  // 10 · há 66 milhões de anos
  shot(26.0, 'creta', (lt, T) => {
    sunset(); water(T); trex(23.5 - 0.9 - lt * 0.25, -45 - lt * 1.1, 1.77, T * 0.32);
    placeDog(0.02, gy(0.02, 0.3), 0.3, 0.55); poseDog(D, { t: T, headYaw: 0.35, ears: 1 });
    const k = ease.io(lt / 2.7);
    cam(lerp3([3.2, 4.2, 5.5], [4.6, 4.6, -4.5], k), [6, 0.5, -45], 50, 0.01, T);
    animCard(at(title('66m', [{ text: 'HACE', px: 12 }, { text: '66 MILLONES DE AÑOS', px: 17 }]), 0, 30), lt, 0.6);
  }, [[0, 'whoosh'], [0.6, 'pop']]);
  // 11 · o mundo do T. rex
  shot(28.7, 'creta', (lt, T) => {
    sunset(); water(T);
    const x = 13 - lt * 0.2, z = -17 - lt * 1.2;
    trex(x, z, 1.62, lt * 0.36 + 0.2, { headYaw: -0.25 + Math.sin(lt * 1.5) * 0.12, headPitch: -0.05 });
    placeDog(0.02, gy(0.02, 0.3), 0.3, 0.55); poseDog(D, { t: T });
    cam(lerp3([5.2, 1.3, -3.2], [5.4, 1.5, -4.0], lt / 2.35), [x + 1.2, 4.2, z], 24, 0.01, T);
    animCard(at(label('trex', 'TIRANOSAURIO REX · 12 M', 12), -50, -38), lt, 0.5);
  }, [[0, 'rumble'], [0.5, 'pop']]);
  // 12 · quanto duraria o seu pitbull aqui?
  shot(31.05, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    placeDog(0.35, gy(0.35, 0.2), 0.2, 0.2);
    poseDog(D, { t: T, headYaw: Math.sin(lt * 1.2) * 0.35, ears: 0.8, wag: 0.15, wagSpeed: 5 });
    const k = ease.io(seg(lt, 0.3, 3.4));
    cam(lerp3([-0.3, 0.45, 0.9], [1.2, 4.6, 6.2], k), lerp3([0.6, 0.35, 0.1], [1.4, 0.1, -1.5], k), lerp(36, 46, k), 0.006, T);
    shadowAt([0.35, 0, 0.2], lerp(1.2, 5, k));
    animCard(at(title('cuanto', [{ text: '¿CUÁNTO DURARÍA?', px: 20 }]), 0, 32), lt, 1.8);
  }, [[1.8, 'pop']]);
  // 13 · não um cão de cinema
  shot(34.45, 'estudio', (lt, T) => {
    W.spot.intensity = 30; W.spot.color.set(0xffd2a0); W.spot.position.set(-1.5, 2.5, -1.5);
    W.L.fill.intensity = 1.6; W.L.fill.color.set(0xff8a50);
    placeDog(0, 0, 0, -0.5);
    poseDog(D, { t: T, headPitch: 0.25, headYaw: 0.2, ears: 0.9, tailUp: 0.8 });
    cam(lerp3([1.7, 0.22, 1.4], [1.5, 0.24, 1.25], lt / 2.2), [0, 0.42, 0], 34, 0.003, T, 0.06);
    W.particles(80, (i) => { const k = (lt * 1.6 + hash3(i, 5, 1)) % 1; return { p: [lerp(-1.5, 1.5, k), 0.1 + hash3(i, 5, 2) * 1.0, -0.6 + hash3(i, 5, 3) * 1.2], s: 0.008, c: 0xffd9a0, rz: 0.3 }; });
    const tk = ease.back(seg(lt, 0.55, 0.85));
    animCard(at(stamp('pelicula', 'NO ES DE PELÍCULA', 14), 0, -38), lt, 0.5, 1.5);
    animCard(at(title('tuyo', [{ text: 'EL TUYO', px: 20 }]), 0, -38), lt, 1.6);
  }, [[0, 'whoosh'], [0.5, 'pop'], [0.8, 'stamp'], [1.6, 'pop']]);
  // 14 · o que sobe na cama quando você não está olhando
  shot(36.65, 'quarto', (lt, T) => {
    const set = W.cur; set.vac.visible = false;
    const j = seg(lt, 0.25, 0.75), lie = ease.io(seg(lt, 0.8, 1.2));
    const x = lerp(0.95, -0.25, ease.io(j)), z = lerp(-0.2, -1.1, ease.io(j)), y = lerp(0, 0.6, ease.out(j)) + Math.sin(j * Math.PI) * 0.25;
    placeDog(x, y, z, lerp(2.2, 0.6, ease.io(seg(lt, 0.0, 1.0))));
    poseDog(D, { t: T, gait: 'walk', amt: 1 - ease.io(seg(lt, 0.1, 0.35)), phase: lt * 1.8, lie: lie, headYaw: ease.io(seg(lt, 1.2, 1.6)) * 0.9, headPitch: -0.1, ears: 0.15, wag: 0.25 * lie, wagSpeed: 4 });
    cam(lerp3([2.0, 1.25, 1.7], [1.85, 1.2, 1.5], lt / 2.2), [-0.2, 0.6, -1.0], 40, 0.012, T);
  }, [[0, 'whoosh'], [0.3, 'jump']]);
  // 15 · guerra contra o aspirador
  shot(38.85, 'quarto', (lt, T) => {
    const set = W.cur; set.vac.visible = true;
    const vx = 1.6 - Math.sin(clamp(lt / 2.7) * Math.PI * 1.5) * 0.6 - lt * 0.15;
    set.vac.position.set(vx, 0, 0.55); set.vac.rotation.set(0, -Math.PI / 2 + Math.sin(T * 3) * 0.15, Math.sin(T * 9) * 0.02);
    const hop = Math.abs(Math.sin(lt * 4.2));
    placeDog(0.15 - hop * 0.05, hop * 0.04, 0.55, 0);
    poseDog(D, { t: T, crouch: 0.35, headPitch: 0.2, jaw: bark(lt, 0.2, 2.7, 6.5) * 0.9, ears: 1, tailUp: 1, wag: 1, wagSpeed: 16 });
    cam(lerp3([0.9, 0.7, 2.6], [1.0, 0.68, 2.4], lt / 2.7), [0.8, 0.25, 0.5], 42, 0.01, T);
    W.L.aim([0.5, 0, 0.5], [0.4, 0.8, 0.6], 2.5, 12);
    animCard(at(stamp('guerra', '¡GUERRA!', 16), -48, 26), lt, 1.25);
  }, [[0.1, 'vacuum'], [1.25, 'stamp']]);
  // 16 · conheçamos o protagonista
  shot(41.6, 'estudio', (lt, T) => {
    const k = ease.out(seg(lt, 0, 1.3));
    W.spot.intensity = 60 * ease.out(seg(lt, 0, 0.25));
    placeDog(lerp(-1.4, 0, k), 0, 0, 0);
    poseDog(D, { t: T, gait: 'walk', amt: 1 - ease.io(seg(lt, 1.0, 1.4)), phase: lt * 1.7, headYaw: ease.io(seg(lt, 1.2, 1.7)) * -0.9, ears: 0.6, wag: 0.6 });
    cam(lerp3([1.6, 0.6, 1.9], [1.35, 0.55, 1.6], lt / 2.25), [0, 0.35, 0], 34, 0.004, T);
    animCard(at(title('prota', [{ text: 'EL PROTAGONISTA', px: 18 }]), 0, 34), lt, 0.7);
  }, [[0, 'whoosh'], [0.0, 'spot'], [0.7, 'pop']]);
  // 17 · pesa entre 14 e 27 quilos
  shot(43.85, 'estudio', (lt, T) => {
    const set = W.cur; set.scale.visible = true; set.scale.position.set(0, 0, 0);
    placeDog(-0.03, 0.093, 0, 0);
    poseDog(D, { t: T, ears: 0.5, headYaw: -0.4, wag: 0.4 });
    cam(lerp3([0.95, 0.8, 1.45], [0.85, 0.7, 1.3], lt / 3), [0.1, 0.25, 0], 36, 0.004, T);
    const v = Math.round(lerp(14, 27, ease.io(seg(lt, 1.45, 2.35))));
    const txt = lt < 1.45 ? '14 KG' : (lt < 2.4 ? v + ' KG' : '14 – 27 KG');
    const c = card('kg' + txt, () => makeCard([{ text: txt, px: 16, color: 0x8dff9a }], { bg: 0x16191c, border: 0x3a3f46, padX: 6, padY: 5 }));
    anchor(c, [0.6, 0.15, 0], 0, 12); animCard(c, lt, txt === '14 KG' ? 0.6 : (txt === '14 – 27 KG' ? 2.4 : -1));
  }, [[0.6, 'pop'], [1.45, 'tick'], [2.4, 'pop']]);
  // 18 · menos de meio metro até os ombros
  shot(46.85, 'estudio', (lt, T) => {
    const set = W.cur; set.scale.visible = false;
    const rk = ease.back(seg(lt, 0.3, 0.8));
    set.ruler.visible = true; set.ruler.position.set(0.14, 0, 0.32); set.ruler.scale.set(1.4, rk, 1.4);
    placeDog(0, 0, 0, 0);
    poseDog(D, { t: T, ears: 0.6, headYaw: ease.io(seg(lt, 0.6, 1.0)) * 0.5, headPitch: -0.1 * ease.io(seg(lt, 0.6, 1.0)) });
    cam(lerp3([0.25, 0.42, 1.9], [0.22, 0.4, 1.75], lt / 2.35), [0.05, 0.3, 0], 34, 0.003, T);
    const m = card('linha', () => voxelText('— — — — — —', { px: 10, cube: 0.5, color: 0xffe08a, shadow: false }));
    anchor(m, [-0.05, 0.47, 0.32]); animText(m, lt, 0.85);
    animCard(anchor(label('05m', 'MENOS DE 0,5 M', 13), [0.14, 0.62, 0.32], 0, 22), lt, 1.0);
  }, [[0.3, 'tick'], [1.0, 'pop']]);
  // 19 · baixinho, largo e pura musculatura
  shot(49.2, 'estudio', (lt, T) => {
    W.cur.ruler.visible = false;
    placeDog(0, 0, 0, 0);
    const flex = Math.max(0, Math.sin(seg(lt, 2.2, 3.0) * Math.PI));
    poseDog(D, { t: T, ears: 0.7, headPitch: 0.05 + flex * 0.1, wag: 0.5, shiver: flex });
    D.body.scale.set(1, 1 + flex * 0.04, 1 + flex * 0.08);
    const a = lerp(0.25, -0.25, ease.io(lt / 3.25));
    cam([Math.cos(a) * 1.6, 0.3, Math.sin(a) * 1.6], [0, 0.32, 0], 36, 0.003, T);
    animCard(at(label('bajito', 'BAJITO', 14), -62, 24), lt, 0.15);
    animCard(at(label('ancho', 'ANCHO', 14), -62, 6), lt, 1.4);
    animCard(at(label('musculo', 'PURO MÚSCULO', 14), -62, -12), lt, 2.2);
  }, [[0, 'whoosh'], [0.15, 'pop'], [1.4, 'pop'], [2.2, 'pop']]);
  // 20 · parece feito de tijolos + três ferramentas
  shot(52.45, 'estudio', (lt, T) => {
    D.body.scale.set(1, 1, 1);
    placeDog(0, 0, 0, -0.45);
    poseDog(D, { t: T, ears: 0.6, wag: 0.4 });
    const e = Math.sin(clamp((lt - 0.25) / 1.3) * Math.PI); const eo = ease.out(e);
    const parts = [[D.head, [0.25, 0.25, 0]], [D.jaw, [0.1, -0.12, 0]], [D.ears[0], [0, 0.12, 0.1]], [D.ears[1], [0, 0.12, -0.1]], [D.tail[0], [-0.25, 0.1, 0]],
      [D.legs.FL.up, [0.12, 0, 0.2]], [D.legs.FR.up, [0.12, 0, -0.2]], [D.legs.RL.up, [-0.12, 0, 0.2]], [D.legs.RR.up, [-0.12, 0, -0.2]], [D.legs.FL.lo, [0.05, -0.08, 0.1]], [D.legs.FR.lo, [0.05, -0.08, -0.1]], [D.legs.RL.lo, [-0.05, -0.08, 0.1]], [D.legs.RR.lo, [-0.05, -0.08, -0.1]]];
    parts.forEach(([g, d], i) => { g.position.x += d[0] * eo; g.position.y += d[1] * eo; g.position.z += d[2] * eo; g.rotation.x += eo * (hash3(i, 1, 1) - 0.5) * 1.2; g.rotation.y += eo * (hash3(i, 2, 1) - 0.5) * 1.2; });
    D.body.position.y += eo * 0.12; D.body.rotation.x += eo * 0.3;
    W.particles(200, (i) => { const d = [hash3(i, 1, 9) - 0.5, hash3(i, 2, 9) - 0.2, hash3(i, 3, 9) - 0.5]; const r = 0.3 + 0.9 * hash3(i, 4, 9); return { p: [d[0] * r * eo * 1.5, 0.35 + d[1] * r * eo, d[2] * r * eo * 1.5], s: 0.012 * eo, c: i % 3 ? 0xa4562c : 0xf3e7d6, rx: T * 3 + i, ry: T * 2 }; });
    cam(lerp3([1.4, 0.6, 1.3], [1.2, 0.55, 1.1], lt / 3.4), [0, 0.35, 0], 36, 0.004, T);
    animCard(at(stamp('ladrillos', 'LADRILLOS', 14), 0, 34), lt, 0.6, 1.5);
    animCard(at(num('h1', '1', 'NARIZ'), -48, 30), lt, 1.6); animCard(at(num('h2', '2', 'TERQUEDAD'), 0, 30), lt, 1.85); animCard(at(num('h3', '3', 'LEER'), 48, 30), lt, 2.1);
  }, [[0.25, 'burst'], [0.6, 'stamp'], [1.3, 'snap'], [1.6, 'pop'], [1.85, 'pop'], [2.1, 'pop']]);
  // 21 · a primeira é o nariz
  shot(55.85, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, 0);
    poseDog(D, { t: T, ears: 0.5, headPitch: Math.sin(T * 9) * 0.02 });
    const n = noseWorld();
    cam(lerp3([n.x + 0.62, n.y + 0.1, n.z + 0.5], [n.x + 0.5, n.y + 0.08, n.z + 0.4], lt / 2.65), [n.x - 0.12, n.y - 0.03, n.z], 32, 0.002, T);
    W.particles(120, (i) => { const k = ((lt * 0.8 + hash3(i, 7, 1)) % 1); const src = [n.x + 0.6 + hash3(i, 7, 2) * 0.4, n.y + (hash3(i, 7, 3) - 0.5) * 0.4, n.z + (hash3(i, 7, 4) - 0.5) * 0.6]; const q = lerp3(src, [n.x + 0.01, n.y, n.z], ease.in(k)); return { p: q, s: 0.007 * (1 - k * 0.6), c: [0xf6e3c4, 0xffc070, 0xb8e0a0][i % 3] }; });
    animCard(at(num('n1', '1', 'LA NARIZ'), -62, -33), lt, 0.4);
  }, [[0, 'whoosh'], [0.4, 'pop'], [0.8, 'sniff']]);
  // 22 · 300 milhões x 6 milhões de receptores
  shot(58.5, 'estudio', (lt, T) => {
    const set = W.cur;
    D.root.visible = true; placeDog(-0.75, 0, 0.35, 0); poseDog(D, { t: T, headPitch: 0.3, headYaw: 0.4, ears: 0.8, wag: 0.5 });
    const g1 = ease.out(seg(lt, 0.35, 2.3)), g2 = ease.back(seg(lt, 2.95, 3.3));
    const H1 = 2.6, H2 = H1 * 6 / 300;
    set.barDog.visible = true; set.barDog.position.set(-0.3, 0, 0); set.barDog.scale.set(1, Math.max(0.001, g1 * H1), 1);
    set.barHum.visible = g2 > 0; set.barHum.position.set(0.35, 0, 0); set.barHum.scale.set(1, Math.max(0.001, g2 * H2), 1);
    set.head.visible = g2 > 0; set.head.position.set(0.35, g2 * H2, 0); set.head.scale.setScalar(Math.max(0.001, 0.6 * g2));
    const up = ease.io(seg(lt, 0.6, 2.4)), down = ease.io(seg(lt, 2.75, 3.25));
    const ty = lerp(lerp(0.4, H1 * 0.85, up), 0.15, down);
    cam([lerp(0.9, 0.6, down), ty + 0.2, 3.6 - down * 1.4], [lerp(-0.1, 0.2, down), ty, 0], 42, 0.004, T);
    animCard(anchor(label('300m', '300.000.000', 15), [-0.3, g1 * H1 + 0.05, 0], 0, 8), lt, 1.4);
    animCard(anchor(label('6m', '6.000.000 (TÚ)', 13), [0.35, g2 * H2 + 0.15, 0], 0, 10), lt, 3.0);
  }, [[0.35, 'rise'], [1.4, 'pop'], [3.0, 'pop']]);
  // 23 · ele sabe o que você jantou ontem
  shot(62.9, 'sala', (lt, T) => {
    const p = person(0.6, -0.1, -Math.PI / 2 - 0.3, { armL: 0.2, headPitch: 0.3 });
    placeDog(0.0, 0.02, 0.1, 0.0);
    poseDog(D, { t: T, sniff: 0.3, headPitch: 0.35, ears: 0.7, wag: 0.7 });
    cam(lerp3([0.0, 0.8, 1.8], [0.05, 0.75, 1.6], lt / 2), [0.3, 0.55, -0.05], 40, 0.004, T);
    const b = card('bubble', () => { const c = makeCard([{ text: 'AYER', px: 12 }], { padX: 18, padY: 18, minW: 20 }); const pl = P.buildPlate(); pl.scale.setScalar(60); pl.rotation.set(0.6, 0.4, 0); pl.position.set(0, -6, 6); c.add(pl); return c; });
    animCard(at(b, 50, 22), lt, 0.25);
    W.particles(50, (i) => { const k = ((lt * 0.9 + hash3(i, 3, 1)) % 1); return { p: lerp3([0.5, 0.8, -0.05], [0.33, 0.48, 0.1], k), s: 0.008, c: 0xffd08a }; });
  }, [[0, 'whoosh'], [0.25, 'pop'], [0.5, 'sniff']]);
  // 24 · você não sabe onde deixou as chaves
  shot(64.9, 'sala', (lt, T) => {
    D.root.visible = false;
    const k = ease.io(lt / 2.6);
    cam(lerp3([-0.55, 1.4, -0.75], [-0.72, 0.85, -1.45], k), [-0.75, 0.56, -1.83], 40, 0.004, T);
    animCard(at(label('llaves', '¿Y LAS LLAVES?', 14), 52, -30), lt, 0.9);
    W.particles(12, (i) => { const a = i / 12 * Math.PI * 2 + T * 2; return { p: [-0.75 + Math.cos(a) * 0.12, 0.62 + Math.sin(T * 4 + i) * 0.01, -1.83 + Math.sin(a) * 0.05], s: 0.006 * (0.5 + 0.5 * Math.sin(T * 6 + i)), c: 0xfff3b0 }; });
  }, [[0.9, 'pop'], [1.6, 'jingle']]);
  // 25 · a segunda é a teimosia
  shot(67.5, 'estudio', (lt, T) => {
    const set = W.cur; set.barDog.visible = set.barHum.visible = set.head.visible = false;
    const pull = Math.sin(T * 5) * 0.5 + 0.5;
    placeDog(-0.05 * pull, 0, 0, Math.PI);
    poseDog(D, { t: T, crouch: 1, headPitch: -0.05, headYaw: Math.sin(T * 7) * 0.12, ears: 0.6, wag: 0.8, tailUp: 0.6 });
    const m = mouthWorld();
    set.rope.visible = true; set.rope.position.set(m.x - 0.38, m.y, m.z); set.rope.rotation.set(0, 0, Math.sin(T * 7) * 0.05);
    cam(lerp3([-0.6, 0.45, 1.5], [-0.5, 0.42, 1.3], lt / 3.1), [-0.25, 0.32, 0], 36, 0.006, T);
    animCard(at(num('n2', '2', 'LA TERQUEDAD'), -56, 28), lt, 0.35);
  }, [[0, 'whoosh'], [0.35, 'pop'], [1.0, 'growl']]);
  // 26 · se agarra a corda, não solta
  shot(70.6, 'estudio', (lt, T) => {
    const set = W.cur;
    const shk = Math.sin(T * 14) * 0.25 * seg(lt, 0.5, 0.8);
    placeDog(-0.06 * Math.abs(Math.sin(T * 4)), 0, 0, Math.PI);
    poseDog(D, { t: T, crouch: 1, headYaw: shk, headPitch: -0.08, ears: 0.8, wag: 1, wagSpeed: 15, tailUp: 0.8 });
    const m = mouthWorld();
    set.rope.visible = true; set.rope.position.set(m.x - 0.38, m.y, m.z); set.rope.rotation.set(0, shk * 0.8, 0);
    cam(lerp3([-0.9, 0.6, 1.05], [-0.8, 0.56, 0.9], lt / 3.1), [m.x + 0.1, m.y - 0.08, m.z], 34, 0.014, T);
  }, [[0.5, 'growl']]);
  // 27 · a mandíbula que trava? Mito.
  shot(73.7, 'estudio', (lt, T) => {
    const set = W.cur; set.rope.visible = false;
    placeDog(0, 0, 0, 0);
    poseDog(D, { t: T, ears: 0.5, jaw: 0, headYaw: 0.05 });
    D.root.updateMatrixWorld(true); const hinge = new THREE.Vector3(0.09, -0.03, 0.07); D.head.localToWorld(hinge);
    const lk = ease.back(seg(lt, 1.45, 1.75)), fall = seg(lt, 3.25, 3.9);
    set.lock.visible = lk > 0.01; set.lock.scale.setScalar(lk * 0.55);
    set.lock.position.set(hinge.x + 0.05, hinge.y - fall * fall * 0.8, hinge.z + 0.09); set.lock.rotation.set(0, 0, fall * 2.5);
    cam(lerp3([0.55, 0.55, 1.05], [0.5, 0.54, 0.92], lt / 3.9), [0.3, 0.48, 0], 32, 0.003, T);
    animCard(at(title('traba', [{ text: '¿MANDÍBULA QUE SE TRABA?', px: 14 }]), 0, 36), lt, 0.6, 3.1);
    animCard(at(stamp('mito', 'MITO', 26), 0, 4), lt, 3.2, 99, { spin: -0.6 });
  }, [[0.6, 'pop'], [1.45, 'click'], [3.2, 'stamp']]);
  // 28 · simplesmente não quer soltar
  shot(77.6, 'estudio', (lt, T) => {
    const set = W.cur; set.lock.visible = false;
    placeDog(0, 0, 0, Math.PI - 0.3);
    poseDog(D, { t: T, lie: 1, headPitch: 0.1, headYaw: 0.25 + Math.sin(lt * 2) * 0.05, ears: 0.3, wag: 0.6, wagSpeed: 6 });
    const m = mouthWorld(); const tug = Math.max(0, Math.sin(lt * 3)) * 0.03;
    set.rope.visible = true; set.rope.position.set(m.x - 0.38 * Math.cos(0.3) - tug, m.y, m.z - 0.38 * Math.sin(0.3)); set.rope.rotation.set(0, -0.3, 0);
    cam(lerp3([-0.3, 0.45, 1.2], [-0.25, 0.4, 1.05], lt / 2.15), [-0.15, 0.2, 0], 36, 0.004, T);
  }, []);
  // 29 · a terceira: ler os outros
  shot(79.75, 'sala', (lt, T) => {
    const px = lerp(-2.4, 2.0, lt / 3.95);
    person(px, -1.0, Math.PI / 2, { walk: 1, phase: lt * 0.9 });
    placeDog(0.1, 0.02, 0.6, Math.PI / 2 + 0.2);
    const look = clamp(Math.atan2(-(-1.0 - 0.6), px - 0.1) - (Math.PI / 2 + 0.2), -0.9, 0.9);
    poseDog(D, { t: T, sit: 1, headYaw: look, ears: 0.7, wag: 0.3 });
    cam(lerp3([1.7, 0.5, 0.25], [1.6, 0.5, 0.15], lt / 3.95), [-0.5, 0.55, -0.4], 42, 0.004, T);
    animCard(at(num('n3', '3', 'LEER A LOS DEMÁS'), -54, 28), lt, 0.35);
  }, [[0, 'whoosh'], [0.35, 'pop']]);
  // 30 · sabe que você vai sair antes de pegar as chaves
  shot(83.7, 'sala', (lt, T) => {
    const reach = ease.io(seg(lt, 1.0, 1.7));
    person(3.0, -0.75, Math.PI / 2 + 0.3, { armL: -reach * 1.9, headYaw: -0.2, headPitch: 0.15 });
    placeDog(2.65, 0.02, 0.45, 1.2);
    poseDog(D, { t: T, sit: lt < 1.6 ? 1 : 0, headPitch: 0.45, headYaw: -0.3, ears: 0.9, wag: 1, wagSpeed: 18, tailUp: 0.5 });
    if (lt > 1.6) { D.root.position.y += Math.abs(Math.sin((lt - 1.6) * 7)) * 0.05; }
    cam(lerp3([2.1, 0.6, 1.35], [2.15, 0.62, 1.2], lt / 2.65), [2.95, 0.8, -0.3], 44, 0.005, T);
    animCard(anchor(label('ya', '¡YA SABE!', 13), [2.7, 0.75, 0.45], 0, 6), lt, 0.55);
  }, [[0.55, 'pop'], [1.5, 'jingle']]);
  // 31 · sabe quando você está triste
  shot(86.35, 'sala', (lt, T) => {
    person(-0.25, -1.62, 0, { y: 0.56 + 0.075 - 0.98, sit: 1, bend: 0.3, headPitch: 0.45, armL: -0.75, armR: -0.75 });
    const k = ease.io(seg(lt, 0, 1.3));
    placeDog(lerp(0.75, -0.2, k), 0.02, lerp(0.2, -0.66, k), lerp(2.3, Math.PI / 2, k));
    poseDog(D, { t: T, gait: 'walk', amt: 1 - ease.io(seg(lt, 0.9, 1.3)), phase: lt * 1.4, headPitch: 0.05 + 0.1 * k, headYaw: 0.05, ears: 0.1, tailDown: 0.6, wag: 0.1 });
    cam(lerp3([1.15, 0.75, -0.35], [1.0, 0.72, -0.5], lt / 2.5), [-0.25, 0.55, -1.0], 38, 0.003, T);
    st.renderer.toneMappingExposure = 0.92;
  }, []);
  // 32 · milhares de anos olhando para nós (homem sentado num tronco, lobo deitado ao lado)
  shot(88.85, 'fogueira', (lt, T) => {
    const f = W.cur;
    const A = f.ancient; A.root.position.set(-1.05, 0.36 + 0.075 - 0.98, 0.0); A.root.rotation.set(0, Math.PI / 2, 0);
    A.legs.forEach(l => l.rotation.set(-1.5, 0, 0)); A.shins.forEach(l => l.rotation.set(1.45, 0, 0));
    A.torso.rotation.set(0.18, 0, 0); A.arms[0].rotation.set(-0.8, 0, 0.1); A.arms[1].rotation.set(-0.7 - Math.sin(T * 1.2) * 0.08, 0, -0.1); A.head.rotation.set(0.2, -0.35 + Math.sin(T * 0.7) * 0.08, 0);
    f.wolf.root.position.set(-0.6, 0, -0.95); f.wolf.root.rotation.set(0, 0.25, 0);
    poseDog(f.wolf, { t: T, lie: 1, headPitch: 0.15, headYaw: 0.5 + Math.sin(T * 0.8) * 0.1, ears: 0.7, wag: 0.1 });
    D.root.visible = false;
    W.point.intensity = 8 + Math.sin(T * 13) * 1.2 + Math.sin(T * 7.3) * 0.8;
    W.particles(160, (i) => { const k = ((T * 1.4 + hash3(i, 8, 1)) % 1); const a = hash3(i, 8, 2) * Math.PI * 2, r = 0.16 * (1 - k) * hash3(i, 8, 3); return { p: [Math.cos(a) * r, 0.08 + k * 0.6, Math.sin(a) * r], s: 0.035 * (1 - k), c: k < 0.3 ? 0xfff0a0 : k < 0.6 ? 0xffa030 : 0xd84a1a, rx: T + i }; });
    const a = lerp(0.75, 0.55, lt / 2.55);
    cam([Math.cos(a) * 3.2, 1.25, Math.sin(a) * 3.2], [-0.5, 0.35, -0.3], 38, 0.004, T);
    animCard(at(title('miles', [{ text: 'MILES DE AÑOS', px: 18 }]), 0, -38), lt, 0.3);
  }, [[0, 'whoosh'], [0, 'fire'], [0.3, 'pop']]);
  // 33 · experts em entender sem palavras (inclinar de cabeça)
  shot(91.4, 'sala', (lt, T) => {
    person(0.0, -0.9, 0, { headPitch: 0.5, armL: 0.1, armR: 0.1 });
    placeDog(0.05, 0.02, -0.25, Math.PI / 2);
    const tilt = Math.sin(clamp((lt - 0.8) / 1.6) * Math.PI) * 0.45 - Math.sin(clamp((lt - 2.3) / 1.0) * Math.PI) * 0.35;
    poseDog(D, { t: T, sit: 1, headPitch: 0.6, headRoll: tilt, ears: 0.6 + Math.abs(tilt), wag: 0.5, wagSpeed: 8 });
    cam(lerp3([0.85, 0.32, -0.75], [0.8, 0.33, -0.7], lt / 3.55), [0.0, 0.5, -0.4], 44, 0.003, T);
  }, [[0, 'whoosh']]);
  // 34 · agora, as más notícias
  shot(94.95, 'estudio', (lt, T) => {
    const set = W.cur; set.rope.visible = false;
    W.spot.intensity = 45 * (lt < 0.3 ? 1 : 0.55 + 0.1 * Math.sin(T * 30)); W.spot.color.set(0xff8a70);
    placeDog(0, 0, 0, -0.35);
    poseDog(D, { t: T, ears: 0, tailDown: 1, headPitch: -0.25 * ease.io(seg(lt, 0.2, 0.8)), wag: 0 });
    cam(lerp3([1.65, 0.6, 1.5], [1.45, 0.56, 1.3], lt / 2.05), [0, 0.3, 0], 36, 0.004, T);
    animCard(at(card('malas', () => makeCard([{ text: '¡MALAS NOTICIAS!', px: 18, color: 0xfff1dc }], { bg: 0x9e2a22, border: 0x3a0e0a, padX: 8, padY: 6 })), 0, 32), lt, 0.25);
  }, [[0, 'whoosh'], [0.25, 'stamp']]);
  // 35 · pelo curto: frio
  shot(97.0, 'estudio', (lt, T) => {
    W.spot.intensity = 40; W.spot.color.set(0x9fc0ff); W.L.fill.color.set(0x7fa8ff); W.L.fill.intensity = 1.2;
    placeDog(0, 0, 0, -0.5);
    poseDog(D, { t: T, shiver: 1, ears: 0, tailDown: 1, headPitch: -0.15 });
    W.particles(300, (i) => { const k = ((lt * 0.35 + hash3(i, 9, 1)) % 1); return { p: [(hash3(i, 9, 2) - 0.5) * 2.4 + Math.sin(T + i) * 0.05, 1.6 - k * 1.7, (hash3(i, 9, 3) - 0.5) * 2.0], s: 0.012, c: 0xf4f8ff, rx: T + i, ry: T * 0.7 + i }; });
    cam(lerp3([1.5, 0.55, 1.55], [1.35, 0.52, 1.4], lt / 2.55), [0, 0.3, 0], 36, 0.004, T);
    animCard(at(label('pelo', 'PELO CORTO', 15), -58, 26), lt, 0.25);
    animCard(at(label('frio', 'FRÍO', 15), -58, 8), lt, 2.3);
  }, [[0.25, 'pop'], [0.3, 'wind'], [2.3, 'pop']]);
  // 36 · insetos
  shot(99.55, 'estudio', (lt, T) => {
    placeDog(0, 0, 0, -0.3);
    const snap = bark(lt, 0.5, 2.0, 3.2);
    poseDog(D, { t: T, ears: 0.8, headYaw: Math.sin(T * 4) * 0.35, headPitch: 0.2 + snap * 0.1, jaw: snap, wag: 0.3 });
    const h = noseWorld();
    W.particles(60, (i) => { const a = T * (3 + hash3(i, 4, 1) * 3) + i, r = 0.12 + hash3(i, 4, 2) * 0.15; return { p: [h.x - 0.05 + Math.cos(a) * r, h.y + 0.05 + Math.sin(a * 1.7) * 0.08, h.z + Math.sin(a) * r], s: 0.009 + 0.004 * Math.sin(T * 60 + i), c: 0x1a1612, rx: T * 20 }; });
    cam(lerp3([1.35, 0.6, 1.0], [1.25, 0.58, 0.9], lt / 2), [0.2, 0.45, 0], 34, 0.006, T);
    animCard(at(label('insectos', 'INSECTOS', 15), -58, 26), lt, 0.3);
  }, [[0, 'buzz'], [0.3, 'pop']]);
  // 37 · muitos pitbulls não são bons nadadores
  shot(101.55, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    const x = 4.6 + lt * 0.06, z = 0.2;
    placeDog(x, WATER_Y - 0.36 + Math.sin(T * 4) * 0.012, z, 0.25);
    poseDog(D, { t: T, gait: 'swim', phase: T * 1.6, ears: 0.2, headPitch: 0.25 });
    cam(lerp3([x + 1.3, WATER_Y + 0.3, z + 1.1], [x + 1.15, WATER_Y + 0.28, z + 0.95], lt / 3.4), [x + 0.15, WATER_Y + 0.1, z], 36, 0.008, T);
    W.particles(120, (i) => { const k = ((T * 1.8 + hash3(i, 6, 1)) % 1); const a = hash3(i, 6, 2) * Math.PI * 2; const r = 0.15 + k * 0.25; return { p: [x + 0.1 + Math.cos(a) * r, WATER_Y + 0.01 + Math.sin(k * Math.PI) * 0.05, z + Math.sin(a) * r * 0.6], s: 0.012 * (1 - k), c: 0xe8f0f0 }; });
    shadowAt([x, WATER_Y, z], 1.2);
  }, [[0, 'whoosh'], [0, 'splash']]);
  // 38 · flutua como uma mochila cheia de livros
  shot(104.95, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    D.root.visible = false;
    let pk = W.cur.pack; if (!pk) { pk = W.cur.pack = P.buildBackpack(); C().set.add(pk); }
    pk.visible = true;
    const fall = seg(lt, 0.0, 0.45), sink = seg(lt, 0.45, 2.6);
    const y = lt < 0.45 ? lerp(1.0, WATER_Y, ease.in(fall)) : WATER_Y - ease.in(sink) * 0.7;
    pk.position.set(3.7, y - 0.2, 0.3); pk.rotation.set(0.3 * sink, 0.5, 0.4 * sink);
    W.particles(140, (i) => {
      if (lt < 0.45) return null;
      if (i < 70) { const k = clamp((lt - 0.45) / 0.6); const a = i / 70 * Math.PI * 2; return { p: [3.7 + Math.cos(a) * 0.25 * k, WATER_Y + Math.sin(k * Math.PI) * 0.25 * hash3(i, 1, 1), 0.3 + Math.sin(a) * 0.25 * k], s: 0.015 * (1 - k), c: 0xeef6f6 }; }
      const k = ((lt * 1.5 + hash3(i, 2, 2)) % 1); return { p: [3.7 + (hash3(i, 3, 3) - 0.5) * 0.15, WATER_Y + 0.005, 0.3 + (hash3(i, 4, 4) - 0.5) * 0.15], s: 0.01 * Math.sin(k * Math.PI) * (1 - sink), c: 0xdff0f0 };
    });
    cam(lerp3([4.3, 0.55, 1.15], [4.2, 0.4, 1.0], lt / 2.95), [3.7, WATER_Y, 0.3], 36, 0.005, T);
    animCard(at(label('mochila', 'MOCHILA + LIBROS', 14), 54, 30), lt, 0.6);
  }, [[0.45, 'splash'], [0.6, 'pop'], [1.0, 'bubble']]);
  // 39 · as regras são estas: chega sozinho
  shot(107.9, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    if (W.cur.pack) W.cur.pack.visible = false;
    placeDog(0.6, gy(0.6, -0.2), -0.2, 0.5);
    poseDog(D, { t: T, sit: 1, headYaw: Math.sin(lt * 0.9) * 0.3, ears: 0.6, tailDown: 0.3 });
    cam(lerp3([2.0, 0.65, 1.2], [1.85, 0.62, 1.05], lt / 2.9), [0.4, 0.4, -0.6], 44, 0.005, T);
    shadowAt([0.6, 0, -0.2], 2);
    animCard(at(title('reglas', [{ text: 'LAS REGLAS', px: 20 }]), 0, 34), lt, 0.1);
    animCard(at(label('solo', 'LLEGA SOLO', 14), 0, 18), lt, 1.6);
  }, [[0, 'whoosh'], [0.1, 'pop'], [1.6, 'pop']]);
  // 40 · sem coleira, sem comida, sem você
  shot(110.8, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    placeDog(0.6, gy(0.6, -0.2), -0.2, 0.5);
    poseDog(D, { t: T, sit: 1, headYaw: -0.2, ears: 0.4, tailDown: 0.4 });
    cam(lerp3([1.65, 0.48, 0.45], [1.55, 0.46, 0.35], lt / 2.95), [0.5, 0.35, -0.3], 38, 0.004, T);
    shadowAt([0.6, 0, -0.2], 1.5);
    const xs = [['c1', 'X  SIN COLLAR', 0.1], ['c2', 'X  SIN COMIDA', 1.0], ['c3', 'X  SIN TI', 2.35]];
    xs.forEach(([k, txt, t0], i) => animCard(fixed(card(k, () => makeCard([{ text: txt, px: 14, color: 0xfff1dc }], { bg: 0x2a1a10, border: 0xc8322b, padX: 6, padY: 4, cell: 1.2, minW: 52 })), -58, 26 - i * 15), lt, t0));
  }, [[0.1, 'pop'], [1.0, 'pop'], [2.35, 'pop']]);
  // 41 · o que ele tem é o que traz no corpo
  shot(113.75, 'creta', (lt, T) => {
    sunset(); water(T); trex(22, -48, 1.77, T * 0.32);
    placeDog(0.6, gy(0.6, -0.2), -0.2, 0.5);
    poseDog(D, { t: T, ears: 0.7, headYaw: 0.1, wag: 0.3 });
    const k = ease.io(lt / 1.95);
    const n = noseWorld();
    cam(lerp3([2.0, 0.6, -0.65], [1.85, 0.35, 0.7], k), lerp3([n.x, n.y, n.z], [0.75, 0.1, -0.15], k), 36, 0.004, T);
    shadowAt([0.6, 0, -0.2], 1.2);
    animCard(anchor(label('t1', 'NARIZ', 12), [n.x, n.y + 0.06, n.z], 0, 8), lt, 0.1, 1.2);
    animCard(anchor(label('t2', 'MÚSCULO', 12), [0.55, 0.42, -0.1], 0, 8), lt, 0.8);
    animCard(anchor(label('t3', 'PATAS', 12), [0.72, 0.02, -0.05], 0, 8), lt, 1.3);
  }, [[0.1, 'pop'], [0.8, 'pop'], [1.3, 'pop']]);
  // 42 · se chegar vivo à noite, já é vitória (o dia vira noite)
  shot(115.7, 'creta', (lt, T) => {
    water(T); trex(22, -48, 1.77, T * 0.32);
    const k = ease.io(seg(lt, 0.2, 2.3));
    const u = W.sky.userData.u;
    u.top.value.set(0x6f9fb6).lerp(new THREE.Color(0x0b1430), k); u.mid.value.set(0xe9c79a).lerp(new THREE.Color(0x26355e), k); u.hor.value.set(0xf6b47a).lerp(new THREE.Color(0x4a4a6e), k);
    u.sunDir.value.set(0.6, lerp(0.1, -0.15, k), -0.8).normalize(); u.glow.value = 0.45 * (1 - k);
    st.scene.fog.color.set(0xdcb48c).lerp(new THREE.Color(0x2a3352), k);
    C().wmat.userData.u.skyc.value.set(0xe9c6a8).lerp(new THREE.Color(0x3a4a70), k); C().wmat.userData.u.fogColor.value.copy(st.scene.fog.color);
    W.L.sun.intensity = lerp(2.4, 0.5, k); W.L.sun.color.set(0xffc48a).lerp(new THREE.Color(0x9ab0e8), k); W.L.hemi.intensity = lerp(1.3, 0.8, k); W.L.hemi.color.set(0xc8dce4).lerp(new THREE.Color(0x5a6a9a), k);
    stars(k, T);
    placeDog(0.6, gy(0.6, -0.2), -0.2, 0.5);
    poseDog(D, { t: T, sit: 1, headPitch: 0.25 * k, headYaw: 0.2, ears: 0.6 });
    cam(lerp3([1.9, 0.5, 0.75], [1.95, 0.52, 0.85], lt / 2.45), [0.3, 0.45, -0.6], 42, 0.003, T);
    shadowAt([0.6, 0, -0.2], 2);
    animCard(at(card('meta', () => makeCard([{ text: 'META', px: 12, color: 0xe0862f }, { text: 'LLEGAR A LA NOCHE', px: 16 }], { padX: 8, padY: 6, gap: 1.6 })), 0, 32), lt, 0.25);
  }, [[0.25, 'pop'], [0.3, 'night']]);
  // 43 · no final, vamos ver o que precisaria acontecer para durar mais
  shot(118.15, 'creta', (lt, T) => {
    water(T);
    const u = W.sky.userData.u;
    u.top.value.set(0x0b1430); u.mid.value.set(0x26355e); u.hor.value.set(0x4a4a6e); u.glow.value = 0; u.sunDir.value.set(0.6, -0.15, -0.8).normalize();
    st.scene.fog.color.set(0x2a3352); C().wmat.userData.u.skyc.value.set(0x3a4a70); C().wmat.userData.u.fogColor.value.set(0x2a3352);
    W.L.sun.intensity = 0.6; W.L.sun.color.set(0x9ab0e8); W.L.hemi.intensity = 0.8; W.L.hemi.color.set(0x5a6a9a);
    stars(1, T);
    trex(17, -26 - lt * 0.8, 1.9, T * 0.32, { headYaw: 0.3 });
    placeDog(0.6, gy(0.6, -0.2), -0.2, 0.5);
    poseDog(D, { t: T, sit: 1, headPitch: 0.2, headYaw: 0.3, ears: 0.8 });
    const k = ease.io(seg(lt, 0, 4.2));
    cam(lerp3([1.7, 0.5, 0.8], [3.6, 5.5, 6.5], k), lerp3([0.5, 0.4, -0.4], [8, 0.5, -20], k), lerp(40, 46, k), 0.005, T);
    shadowAt([0.6, 0, -0.2], lerp(1.5, 6, k));
    animCard(at(title('cuanto2', [{ text: '¿CUÁNTO DURARÍA?', px: 20 }]), 0, 30), lt, 1.6);
    st.veil.material.opacity = ease.in(seg(lt, 3.45, 4.4));
  }, [[0.4, 'rumble'], [1.6, 'pop']]);
  const END = 122.55;
  S.forEach((s, i) => s.b = i < S.length - 1 ? S[i + 1].a : END);

  // ---------- renderização de um instante ----------
  let curShot = null;
  const resetDog = () => { D.root.visible = true; D.root.scale.setScalar(1); D.body.scale.set(1, 1, 1); for (const k in D.legs) D.legs[k].up.position.set(...D.legs[k].up.userData.home); };
  // guarda posições de repouso das partes (o efeito de tijolos mexe nelas)
  const homes = [D.head, D.jaw, ...D.ears, D.tail[0], ...Object.values(D.legs).flatMap(l => [l.up, l.lo])];
  homes.forEach(g => g.userData.home = g.position.toArray());
  const restoreParts = () => homes.forEach(g => g.position.set(...g.userData.home));
  // cartões não podem cobrir o protagonista: mede a silhueta real (amostras dos cubos projetadas na tela)
  const GX = 32, GY = 18;
  const occGrid = (objs) => {
    const g = new Uint8Array(GX * GY), v = new THREE.Vector3();
    st.camera.updateMatrixWorld();
    for (const o of objs) {
      if (!o || !o.visible) continue;
      o.updateMatrixWorld(true);
      o.traverse(m => {
        if (!m.isMesh || !m.visible || !m.geometry.attributes.position) return;
        const pos = m.geometry.attributes.position, step = Math.max(1, Math.floor(pos.count / 400));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).project(st.camera);
          if (v.z > 1 || v.z < -1) continue;
          const cx = Math.floor((v.x + 1) / 2 * GX), cy = Math.floor((v.y + 1) / 2 * GY);
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const X = cx + dx, Y = cy + dy; if (X >= 0 && Y >= 0 && X < GX && Y < GY) g[X + GX * Y] = 1; }
        }
      });
    }
    return g;
  };
  const SLOTS = [[0, -38], [0, 37], [-58, 37], [58, 37], [-58, -38], [58, -38], [-62, 12], [62, 12], [-62, -12], [62, -12]];
  function avoid(si) {
    let grid = null;
    const cost = (cx, cy, w, h) => {
      const x0 = Math.floor(((cx - w / 2) / 96 + 1) / 2 * GX), x1 = Math.floor(((cx + w / 2) / 96 + 1) / 2 * GX), y0 = Math.floor(((cy - h / 2) / 54 + 1) / 2 * GY), y1 = Math.floor(((cy + h / 2) / 54 + 1) / 2 * GY);
      let n = 0; for (let X = Math.max(0, x0); X <= Math.min(GX - 1, x1); X++) for (let Y = Math.max(0, y0); Y <= Math.min(GY - 1, y1); Y++) n += grid[X + GX * Y]; return n;
    };
    for (const c of REG.values()) {
      if (!c.visible || c.userData.anchored) continue;
      const w = (c.userData.W || 20) * 1.08, h = (c.userData.H || 8) * 1.1;
      if (c.userData.homeShot !== si) { c.userData.home = [c.position.x, c.position.y]; c.userData.homeShot = si; c.userData.slot = null; }
      if (c.userData.slot === null) {
        if (!grid) grid = occGrid([D.root, W.person && W.person.root, W.cur === W.sets.fogueira ? W.cur.ancient.root : null, W.cur === W.sets.fogueira ? W.cur.wolf.root : null]);
        const others = [...REG.values()].filter(o => o !== c && o.userData.homeShot === si && o.userData.slot && o.userData.used);
        const cardHit = (q) => others.reduce((a, o) => { const ow = (o.userData.W || 20) * 1.08, oh = (o.userData.H || 8) * 1.1; const ix = Math.max(0, Math.min(q[0] + w / 2, o.userData.slot[0] + ow / 2) - Math.max(q[0] - w / 2, o.userData.slot[0] - ow / 2)), iy = Math.max(0, Math.min(q[1] + h / 2, o.userData.slot[1] + oh / 2) - Math.max(q[1] - h / 2, o.userData.slot[1] - oh / 2)); return a + (ix * iy > 0 ? 1000 : 0); }, 0);
        const cost2 = (q) => cost(q[0], q[1], w, h) + cardHit(q);
        let pick = c.userData.home, best = cost2(pick);
        if (best > 0) for (const [x, y] of SLOTS) { const q = [clamp(x, -96 + w / 2 + 2, 96 - w / 2 - 2), clamp(y, -54 + h / 2 + 2, 54 - h / 2 - 2)]; const k = cost2(q); if (k < best) { best = k; pick = q; } }
        c.userData.slot = pick;
      }
      c.position.x = c.userData.slot[0]; c.position.y = c.userData.slot[1];
    }
  }
  function frame(T) {
    const s = S.find(x => T >= x.a && T < x.b) || S[S.length - 1];
    if (s !== curShot) {
      W.use(s.set);
      if (s.set === 'creta') { C().trex.root.visible = true; }
      curShot = s;
    }
    for (const c of REG.values()) c.userData.used = false;
    restoreParts(); D.body.scale.set(1, 1, 1); D.root.visible = true;
    if (W.person) W.person.root.visible = false;
    st.veil.material.opacity = 0;
    W.particles(0);
    // reaplica ambiente do cenário a cada quadro (planos ajustam por cima)
    W.cur.env();
    s.fn(T - s.a, T);
    for (const c of REG.values()) if (!c.userData.used) c.visible = false;
    avoid(S.indexOf(s));
  }
  const cues = []; S.forEach(s => s.cues.forEach(([t, k]) => cues.push([+(s.a + t).toFixed(3), k])));
  return { frame, shots: S, cues, END };
}
