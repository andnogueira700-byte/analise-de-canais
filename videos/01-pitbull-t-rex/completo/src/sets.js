// Cenários do piloto e configuração de ambiente (luz, céu, neblina) por cenário.
import * as THREE from 'three';
import { makeSky, makeLights } from '/videos/engine/lib/world.js';
import { buildCreta, groundH } from '/videos/engine/lib/creta.js';
import { buildDog } from '/videos/engine/lib/dog.js';
import { heightfield, jitter, lerpHex, hash3, voxelize, voxMaterial } from '/videos/engine/lib/vox.js';
import * as P from '/videos/engine/lib/props.js';
import { fbm } from '/videos/engine/lib/noise.js';
import { CubeSet } from '/videos/engine/lib/text.js';
import { buildTerrain, makeRootLog, makeDung, makeFlowerBush } from '/videos/engine/lib/terrain.js';
import { makeTree, makeFern, makeLog, makeRock, makeWaterMaterial, buildTrex, makeClouds } from '/videos/engine/lib/world.js';
import * as F from '/videos/engine/lib/fauna.js';
import * as P2 from '/videos/engine/lib/props2.js';
import { rng } from '/videos/engine/lib/noise.js';
const SM = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
const LP = (a, b, t) => a + (b - a) * t;

export function createWorld(st) {
  const W = { st, sets: {}, cur: null };
  W.sky = makeSky(); st.scene.add(W.sky);
  W.L = makeLights(st.scene, { sun: 2.3, hemi: 1.35 });
  W.point = new THREE.PointLight(0xffb060, 0, 6, 1.6); st.scene.add(W.point);
  W.spot = new THREE.SpotLight(0xfff1dc, 0, 12, 0.5, 0.6, 1.2); W.spot.castShadow = true; W.spot.shadow.mapSize.set(1024, 1024); st.scene.add(W.spot, W.spot.target);
  W.dog = buildDog(); st.scene.add(W.dog.root);
  W.person = null;
  // partículas genéricas (neve, mosquitos, cheiro, bolhas, poeira, água)
  W.parts = new CubeSet(900, voxMaterial({ bev: 0.7, inst: 1 })); W.parts.mesh.castShadow = false;
  for (let i = 0; i < 900; i++) W.parts.add(0, -100, 0, 0xffffff, 0.01);
  W.parts.build(); st.scene.add(W.parts.mesh);
  W.particles = (n, fn) => { // fn(i) -> {p:[x,y,z], s, c, rx, ry}
    const it = W.parts.items, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color();
    for (let i = 0; i < 900; i++) {
      const r = i < n ? fn(i) : null;
      if (!r || !r.s) { M.makeScale(0.0001, 0.0001, 0.0001); M.setPosition(0, -100, 0); W.parts.mesh.setMatrixAt(i, M); continue; }
      E.set(r.rx || 0, r.ry || 0, r.rz || 0); Q.setFromEuler(E); M.compose(new THREE.Vector3(...r.p), Q, new THREE.Vector3(r.s, r.s, r.s)); W.parts.mesh.setMatrixAt(i, M);
      if (r.c !== undefined) { C.set(r.c); W.parts.mesh.setColorAt(i, C); }
    }
    W.parts.mesh.instanceMatrix.needsUpdate = true; if (W.parts.mesh.instanceColor) W.parts.mesh.instanceColor.needsUpdate = true;
  };
  W.use = (name) => {
    if (!W.sets[name]) W.sets[name] = BUILD[name](W);
    for (const k in W.sets) W.sets[k].group.visible = (k === name);
    W.cur = W.sets[name];
    W.particles(0);
    W.point.intensity = 0; W.spot.intensity = 0; W.point.distance = 6; W.point.color.set(0xffb060);
    W.st.scene.background = null;
    W.sets[name].env();
    W.dog.root.visible = true; W.dog.root.scale.setScalar(1);
    if (W.person) W.person.root.visible = false;
    return W.sets[name];
  };
  // humores de luz para cenários de mata (dia, meio-dia, tarde, noite, amanhecer)
  W.mood = (m, wm) => {
    const M = {
      dia: { sky: { top: 0x6fa4c6, mid: 0xcfe0d8, hor: 0xe8e0c0, sunDir: [0.4, 0.7, -0.5], glow: 0.25 }, fog: [0xc8d4c0, 0.02], L: { sun: 2.5, hemi: 1.35, sunCol: 0xfff0d0, sky: 0xd8e8f0, ground: 0x5a5a36 } },
      meio: { sky: { top: 0x5f9ad0, mid: 0xc6dce8, hor: 0xf0ead0, sunDir: [0.2, 0.95, -0.2], glow: 0.2 }, fog: [0xd0dcd0, 0.016], L: { sun: 2.8, hemi: 1.3, sunCol: 0xfff6e0, sky: 0xe0eef8, ground: 0x6a6440 } },
      tarde: { sky: { top: 0x6f9fb6, mid: 0xe9c79a, hor: 0xf6b47a, sunDir: [0.6, 0.18, -0.8], glow: 0.45 }, fog: [0xdcb48c, 0.014], L: { sun: 2.4, hemi: 1.2, sunCol: 0xffc48a, sky: 0xc8dce4, ground: 0x7a5636 } },
      ocaso: { sky: { top: 0x2c3a5c, mid: 0xb06a5a, hor: 0xf08a4a, sunDir: [0.7, 0.03, -0.7], glow: 0.6 }, fog: [0x9a6a5a, 0.02], L: { sun: 1.4, hemi: 0.75, sunCol: 0xff9a5a, sky: 0x8a90b8, ground: 0x4a3226, exposure: 1.05 } },
      noite: { sky: { top: 0x04070f, mid: 0x0e1628, hor: 0x1e2a48, sunDir: [-0.3, 0.6, 0.5], glow: 0.0 }, fog: [0x0e1628, 0.04], L: { sun: 1.05, hemi: 0.7, sunCol: 0xa8c0ff, sky: 0x6a7ab0, ground: 0x22221a, fill: 0.35, fillCol: 0x6a7ab0, exposure: 1.6 } },
      alba: { sky: { top: 0x5a7ab0, mid: 0xe8b8a8, hor: 0xffc890, sunDir: [-0.7, 0.08, 0.5], glow: 0.55 }, fog: [0xe0c0a8, 0.02], L: { sun: 1.9, hemi: 1.1, sunCol: 0xffb880, sky: 0xc0c8e0, ground: 0x5a4a36 } },
    }[m];
    setSky(W, M.sky); W.st.scene.fog = new THREE.FogExp2(M.fog[0], M.fog[1]); setLights(W, M.L);
    if (wm) { wm.userData.u.skyc.value.set(M.sky.mid); wm.userData.u.fogColor.value.set(M.fog[0]); wm.userData.u.sunDir.value.set(...M.sky.sunDir).normalize(); }
    return M;
  };
  W.getPerson = () => { if (!W.person) { W.person = P.buildPerson(); st.scene.add(W.person.root); } W.person.root.visible = true; return W.person; };
  return W;
}

function setSky(W, o) {
  const u = W.sky.userData.u;
  u.top.value.set(o.top); u.mid.value.set(o.mid); u.hor.value.set(o.hor); u.glow.value = o.glow ?? 0.45;
  if (o.sunDir) u.sunDir.value.set(...o.sunDir).normalize();
  W.sky.visible = true;
}
function setLights(W, o) {
  W.L.sun.color.set(o.sunCol ?? 0xffc98e); W.L.sun.intensity = o.sun ?? 2.3;
  W.L.hemi.color.set(o.sky ?? 0xcfe0e8); W.L.hemi.groundColor.set(o.ground ?? 0x7a5636); W.L.hemi.intensity = o.hemi ?? 1.35;
  W.L.fill.intensity = o.fill ?? 0.35; W.L.fill.color.set(o.fillCol ?? 0x9fb8d8);
  W.st.renderer.toneMappingExposure = o.exposure ?? 1.0;
}

const BUILD = {
  // ---------- margem do rio com braço raso e claro, separado por uma faixa de areia ----------
  orilla(W) {
    const g = new THREE.Group();
    const hO = (x, z) => {
      let y = 0.15;
      y = LP(y, -0.7, SM(-15.5, -13.0, z));
      y = LP(y, 0.03, SM(-2.95, -2.55, z));
      const ch = 1 - SM(5.5, 7.0, Math.abs(x));
      y = LP(y, -0.17, SM(-1.6, -1.35, z) * ch);
      y = LP(y, 0.04, SM(-0.1, 0.15, z));
      y += Math.max(0, z - 2) * 0.06;
      const n = (fbm(x * 0.7, z * 0.7, 3) - 0.5);
      return y + n * (z > 0.15 ? 0.1 : z > -1.4 ? 0.015 : z > -2.6 ? 0.03 : z < -15.5 ? 0.25 : 0.05) + (z > -2.6 && z < -1.5 ? Math.sin(x * 0.6) * 0.015 : 0);
    };
    const cO = (x, z, y, top) => {
      const ix = Math.round(x * 50), iz = Math.round(z * 50);
      if (!top) return 0x4a3a28;
      if (z > 0.15 || z < -15) { const m = fbm(x * 0.9, z * 0.9, 2); const leaf = hash3(ix, 7, iz) > 0.93; return jitter(leaf ? 0x8a6a30 : z < 0.5 && z > 0 ? 0x5a4630 : lerpHex(0x4a3a26, 0x56662e, m), ix, 0, iz, 0.1); }
      if (z > -1.4 && Math.abs(x) > 6.2) return jitter(lerpHex(0x8a7656, 0x6a5a40, fbm(x * 2, z * 2, 2)), ix, 0, iz, 0.08);
      if (z > -1.4) { const r = hash3(Math.floor(x * 18), 3, Math.floor(z * 18)); return jitter(r > 0.8 ? 0x5e5a52 : r > 0.6 ? 0x8a8070 : r > 0.4 ? 0xb0a080 : 0x9a8a6a, ix, 0, iz, 0.1); }
      if (z > -2.65) return jitter(lerpHex(0xb8a27a, 0xa08a64, fbm(x * 2, z * 2, 2)), ix, 0, iz, 0.07);
      return jitter(0x3a3428, ix, 0, iz, 0.08);
    };
    g.add(buildTerrain(hO, cO, { cx: 0, cz: -1 }));
    const wmat = makeWaterMaterial();
    const river = new THREE.Mesh(new THREE.PlaneGeometry(600, 300), wmat); river.rotation.x = -Math.PI / 2; river.position.set(0, -0.08, -2.45 - 150); g.add(river);
    const cmat = makeWaterMaterial({ deep: 0x4f7f7a, shallow: 0x9cc4b4, alpha: 0.3, cell: 0.02 });
    const chan = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.75), cmat); chan.rotation.x = -Math.PI / 2; chan.position.set(0, -0.075, -0.72); chan.renderOrder = 1; g.add(chan);
    const R = rng(77);
    const trees = [];
    const tree = (x, z, o) => { const t = makeTree(Math.floor(R() * 1e6), o); t.position.set(x, hO(x, z) - 0.1, z); t.rotation.y = R() * 6.28; g.add(t); trees.push(t); };
    for (let i = 0; i < 40; i++) { const x = -60 + R() * 120, z = -17 - R() * 40; tree(x, z, { voxel: 0.14 + (-z - 17) / 200 }); }
    for (let i = 0; i < 9; i++) tree(-30 + i * 7 + R() * 3, -13.6 - R() * 1.2, { voxel: 0.1, type: 'cypress', height: 9 + R() * 5 });
    for (let i = 0; i < 14; i++) { const x = -14 + R() * 28, z = 2.6 + R() * 8; if (Math.abs(x) < 2 && z < 4) continue; tree(x, z, { voxel: 0.06 + (z - 2) * 0.01, cast: z < 5 }); }
    const ferns = [];
    for (let i = 0; i < 26; i++) { const x = -6 + R() * 12, z = 0.5 + R() * 2.2; if (Math.abs(x - 0.2) < 1.0 && z < 1.4) continue; const f = makeFern(i + 40, { size: 0.35 + R() * 0.3 }); f.position.set(x, hO(x, z) - 0.01, z); f.rotation.y = R() * 6; g.add(f); ferns.push(f); }
    const logs = [];
    for (const [x, z, r] of [[-3.5, -5.2, 0.4], [4.2, -7.5, 1.9], [9, -4.5, 0.9], [-9, -8, 2.5]]) { const l = makeLog(Math.floor(x * 10 + 50), 2.6, 0.22, 0.03); l.position.set(x, -0.08 - 0.3, z); l.rotation.y = r; g.add(l); logs.push(l); }
    const croc = F.buildCroc(); croc.root.position.set(1.6, -0.08 - 0.29, -6.2); croc.root.rotation.y = 2.6; g.add(croc.root);
    const brach = F.buildCroc({ len: 2.2, blunt: 1 }); brach.root.position.set(-5, -0.08 - 0.2, -9.5); brach.root.rotation.y = 0.4; g.add(brach.root);
    const champ = F.buildChampso(); champ.root.position.set(6, -0.08 - 0.16, -9); champ.root.rotation.y = -2.5; g.add(champ.root);
    const champ2 = F.buildChampso({ len: 1.3 }); champ2.root.position.set(-1.5, -0.08 - 0.13, -11); champ2.root.rotation.y = 0.3; g.add(champ2.root);
    const turtle = F.buildTurtle(); g.add(turtle.root);
    const turtles = []; for (const [x, z, r] of [[-2.2, -2.2, 0.5], [-1.6, -2.4, 2.2], [3.2, -2.1, -0.6], [4.0, -2.3, 1.2], [-3.9, -5.1, 0.3]]) { const t = F.buildTurtle(); t.root.position.set(x, z < -4 ? -0.08 + 0.14 : hO(x, z), z); t.root.rotation.y = r; t.root.scale.setScalar(0.8 + (x * 7 % 3) * 0.1); g.add(t.root); turtles.push(t); }
    const edmos = []; for (const [x, z, r] of [[-6, -15.2, 1.4], [-2.5, -15.6, 1.9]]) { const e = F.buildEdmonto({ voxel: 0.13 }); e.root.position.set(x, hO(x, z) - 0.05, z); e.root.rotation.y = r; g.add(e.root); edmos.push(e); }
    const trex = buildTrex({ voxel: 0.08 }); trex.root.visible = false; g.add(trex.root);
    for (const [x, z, r] of [[1.6, -0.05, 0.08], [-1.2, 0.05, 0.1], [2.4, -1.7, 0.12], [-2.2, -1.9, 0.09]]) { const k = makeRock(Math.floor(x * 100 + 7), r, 0.015); k.position.set(x, hO(x, z) + 0.01, z); g.add(k); }
    g.add(makeClouds(6, 8));
    W.st.scene.add(g);
    const o = { group: g, hO, wmat, cmat, croc, brach, champ, champ2, turtle, turtles, edmos, trex, ferns, logs, env() {
      trex.root.visible = false; turtle.root.visible = true; for (const e of edmos) e.root.visible = false;
      W.mood('dia', wmat); cmat.userData.u.skyc.value.set(0xcfe0d8); cmat.userData.u.fogColor.value.set(0xc8d4c0);
      W.L.aim([0, 0, -0.5], [0.4, 0.7, -0.5], 3, 18);
    } };
    return o;
  },
  // ---------- mata: troncos, raízes, charco, esterco e o abrigo da noite ----------
  bosque(W) {
    const g = new THREE.Group();
    const POND = [3.6, 2.8], SHEL = [-3.5, -4.0];
    const hB = (x, z) => {
      const rp = Math.hypot((x - POND[0]) / 1.5, (z - POND[1]) / 1.1), rs = Math.hypot((x - SHEL[0] + 0.45) / 0.55, (z - SHEL[1]) / 0.5);
      let y = (fbm(x * 0.5, z * 0.5, 3) - 0.5) * 0.25 * SM(1.2, 2.4, rp) * SM(1.0, 3.0, rs);
      y += (fbm(x * 3, z * 3, 2) - 0.5) * 0.03;
      y -= 0.2 * (1 - SM(0.55, 1.0, rp));
      y -= 0.24 * (1 - SM(0.6, 1.0, rs));
      return y;
    };
    const cB = (x, z, y, top) => {
      const ix = Math.round(x * 50), iz = Math.round(z * 50);
      if (!top) return 0x3e2e1e;
      const rp = Math.hypot((x - POND[0]) / 1.5, (z - POND[1]) / 1.1);
      if (rp < 1.05) return jitter(rp < 0.8 ? 0x4a4030 : 0x5a4632, ix, 0, iz, 0.08);
      const m = fbm(x * 0.8, z * 0.8, 2), lf = hash3(ix, 5, iz);
      return jitter(lf > 0.9 ? 0x9a6a30 : lf > 0.8 ? 0x6a4a28 : lerpHex(0x46361f, 0x52602a, m), ix, 0, iz, 0.1);
    };
    g.add(buildTerrain(hB, cB, { cx: -0.5, cz: 0 }));
    const pmat = makeWaterMaterial({ deep: 0x3a4a38, shallow: 0x6a7a58, alpha: 0.62, cell: 0.02 });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 48), pmat); pond.rotation.x = -Math.PI / 2; pond.scale.set(1.5, 1.1, 1); pond.position.set(POND[0], -0.07, POND[1]); pond.renderOrder = 1; g.add(pond);
    const logA = makeLog(9, 2.6, 0.24, 0.022); logA.position.set(-1.0, hB(-1, -0.4) - 0.05, -0.4); logA.rotation.y = 0.3; g.add(logA);
    const logB = makeRootLog(21, { len: 3.5, rad: 0.28, plate: 0.85, voxel: 0.025 }); logB.position.set(-5.4, hB(-5.4, 2.2) - 0.05, 2.2); logB.rotation.y = Math.PI - 0.4; g.add(logB);
    const shel = makeRootLog(5, { len: 5, rad: 0.36, plate: 1.15, voxel: 0.028 }); shel.position.set(SHEL[0], -0.05, SHEL[1]); g.add(shel);
    const dung = makeDung(3, { r: 0.42 }); dung.position.set(2.0, hB(2.0, 4.7) - 0.03, 4.7); g.add(dung);
    const R = rng(91);
    const keep = [[-1, -0.4, 2.2], [-5.4, 2.2, 2.2], [POND[0], POND[1], 2.6], [SHEL[0], SHEL[1], 2.4], [2, 4.7, 1.5], [0, 2, 1.5]];
    const free = (x, z, r = 0) => keep.every(([a, b, c]) => Math.hypot(x - a, z - b) > c + r);
    for (let i = 0; i < 70; i++) { const a = R() * 6.28, d = 3 + R() * 40, x = Math.cos(a) * d - 0.5, z = Math.sin(a) * d; if (!free(x, z, 0.6)) continue; const t = makeTree(Math.floor(R() * 1e6), { voxel: d < 8 ? 0.06 : d < 18 ? 0.1 : 0.16, cast: d < 10, height: 10 + R() * 8 }); t.position.set(x, hB(x, z) - 0.1, z); t.rotation.y = R() * 6; g.add(t); }
    const ferns = [];
    for (let i = 0; i < 60; i++) { const x = -8 + R() * 16, z = -7 + R() * 14; if (!free(x, z, -0.6)) continue; const f = makeFern(i + 300, { size: 0.3 + R() * 0.35 }); f.position.set(x, hB(x, z) - 0.01, z); f.rotation.y = R() * 6; g.add(f); ferns.push(f); }
    for (let i = 0; i < 8; i++) { const x = -6 + R() * 12, z = -6 + R() * 12; if (!free(x, z)) continue; const b = makeFlowerBush(i, { size: 0.35 + R() * 0.2 }); b.position.set(x, hB(x, z), z); g.add(b); }
    const multi = F.buildMulti(); g.add(multi.root);
    const multi2 = F.buildMulti(); g.add(multi2.root);
    const didel = F.buildDidelphodon(); g.add(didel.root);
    const fish = [], gars = [];
    for (let i = 0; i < 3; i++) { const f = F.buildFish({ len: 0.75 + i * 0.1 }); g.add(f.root); gars.push(f); }
    for (let i = 0; i < 4; i++) { const f = F.buildFish({ len: 0.22, gar: 0, col: [0x8a9aa0, 0x9a9070, 0x7a8a7a, 0xa0a090][i] }); g.add(f.root); fish.push(f); }
    const raptor = F.buildRaptor(); g.add(raptor.root);
    W.st.scene.add(g);
    const o = { group: g, hB, POND, SHEL, pmat, logA, logB, shel, dung, multi, multi2, didel, gars, fish, raptor, ferns, env() {
      for (const a of [multi, multi2, didel, raptor]) a.root.visible = false;
      for (const f of [...gars, ...fish]) f.root.visible = false;
      W.mood('dia', pmat);
      W.L.aim([0, 0, 0], [0.4, 0.7, -0.5], 3, 18);
    } };
    return o;
  },
  // ---------- clareira aberta: a manada, o Triceratops e a chegada do T. rex ----------
  claro(W) {
    const g = new THREE.Group();
    const hC = (x, z) => (fbm(x * 0.12, z * 0.12, 3) - 0.5) * 0.6 * SM(3, 12, Math.hypot(x, z)) + (fbm(x * 2, z * 2, 2) - 0.5) * 0.03;
    const cC = (x, z, y, top) => {
      const ix = Math.round(x * 40), iz = Math.round(z * 40);
      if (!top) return 0x4a3a26;
      const m = fbm(x * 0.4, z * 0.4, 3), h = hash3(ix, 9, iz);
      return jitter(h > 0.95 ? 0x9a8a40 : lerpHex(0x5a5a2c, 0x7a7a3a, m), ix, 0, iz, 0.1);
    };
    g.add(buildTerrain(hC, cC, { cx: 4, cz: 0, rings: [{ half: 2, s: 0.025, sv: 0.02, chunks: 4 }, { half: 8, s: 0.06, sv: 0.02, chunks: 6 }, { half: 32, s: 0.18, sv: 0.03, chunks: 6, tall: true }, { half: 180, s: 0.9, sv: 0.06, chunks: 8, tall: true }] }));
    const R = rng(55);
    for (let i = 0; i < 80; i++) { const a = R() * 6.28, d = 52 + R() * 50, x = 20 + Math.cos(a) * d, z = Math.sin(a) * d * 0.9; const t = makeTree(Math.floor(R() * 1e6), { voxel: 0.16 + d / 400, height: 12 + R() * 10 }); t.position.set(x, hC(x, z) - 0.1, z); g.add(t); }
    const edge = []; for (const [x, z] of [[58, -26], [62, -19], [55, -31], [64, -12], [60, -5], [57, 6], [61, 14], [54, 22]]) { const t = makeTree(Math.floor(x * 31 + z), { voxel: 0.12, height: 13 + (x % 4), cast: true }); t.position.set(x, hC(x, z) - 0.1, z); g.add(t); edge.push(t); }
    const dungs = []; for (const [x, z, r] of [[6, -3, 0.5], [11, 5, 0.6], [3.5, 4, 0.4]]) { const d = makeDung(Math.floor(x), { r, voxel: 0.03 }); d.position.set(x, hC(x, z) - 0.03, z); g.add(d); dungs.push(d); }
    for (let i = 0; i < 10; i++) { const x = -6 - R() * 6, z = -8 + R() * 16; const t = makeTree(Math.floor(R() * 1e6), { voxel: 0.08, height: 11 + R() * 6, cast: true }); t.position.set(x, hC(x, z) - 0.1, z); g.add(t); }
    const ferns = [];
    const fern = (x, z, sz, sd) => { const f = makeFern(sd, { size: sz }); f.position.set(x, hC(x, z) - 0.01, z); f.rotation.y = sd; g.add(f); ferns.push(f); return f; };
    const big = fern(0.85, 0.05, 0.95, 501); fern(0.75, -0.75, 0.7, 503); fern(-0.7, -0.8, 0.55, 504);
    for (let i = 0; i < 70; i++) { const x = -4 + R() * 50, z = -25 + R() * 50; if (Math.hypot(x, z) < 2.6) continue; if (Math.hypot(x - 20, z) < 14 && R() < 0.7) continue; i % 3 ? fern(x, z, 0.4 + R() * 0.5, 600 + i) : (() => { const b = makeFlowerBush(i + 20, { size: 0.4 + R() * 0.4, voxel: 0.03 }); b.position.set(x, hC(x, z), z); g.add(b); })(); }
    const herd = [];
    const HP = [[16, -6, 2.9], [20, 3, 3.3], [24, -12, 2.6], [27, 8, 3.6], [31, -3, 3.0], [34, 12, 3.4], [22, -18, 2.4], [36, -10, 2.8], [40, 2, 3.2], [29, 18, 3.5]];
    HP.forEach(([x, z, r], i) => { const e = F.buildEdmonto({ voxel: i < 4 ? 0.1 : 0.14 }); e.root.position.set(x, hC(x, z), z); e.root.rotation.y = r; e.home = [x, z, r]; e.ph = i * 0.37; g.add(e.root); herd.push(e); });
    const trike = F.buildTrike(); trike.root.position.set(13, hC(13, 15), 15); trike.root.rotation.y = 2.4; g.add(trike.root);
    const trex = buildTrex({ voxel: 0.07 }); g.add(trex.root); trex.root.visible = false;
    const birds = []; for (let i = 0; i < 8; i++) { const b = F.buildBird(); b.root.scale.setScalar(1.6); g.add(b.root); birds.push(b); }
    g.add(makeClouds(9, 10, 0xf0e0c8));
    W.st.scene.add(g);
    const o = { group: g, hC, herd, trike, trex, birds, ferns, big, edge, env() {
      trex.root.visible = false; for (const b of birds) b.root.visible = false;
      W.mood('tarde'); W.st.scene.fog.density = 0.008;
      W.L.aim([1, 0, 0], [0.6, 0.45, -0.6], 4, 20);
    } };
    return o;
  },
  // ---------- mapa dos EUA e dioramas (hoje x Cretáceo) ----------
  mapa(W) {
    const g = new THREE.Group();
    const us = P2.buildUSMap(0.28); g.add(us);
    const table = voxelize((p, x, y, z) => p[1] < -0.0 ? jitter(0x2a2f36, x, y, z, 0.05) : -1, [-40, -0.6, -24], [40, 0, 24], 0.8, { cast: false }); g.add(table);
    // diorama de hoje (miniatura): pasto seco, estrada reta, rancho
    const dio = new THREE.Group(); dio.position.set(200, 0, 0); g.add(dio);
    const hH = (x, z) => (fbm(x * 0.4, z * 0.4, 3) - 0.5) * 0.35;
    const cH = (x, z, y, top) => { const ix = Math.round(x * 20), iz = Math.round(z * 20); if (!top) return 0x6a5a40; if (Math.abs(x - 0.6) < 0.32) return Math.abs(x - 0.6) < 0.03 && Math.floor(z * 2) % 2 === 0 ? 0xf0d060 : jitter(0x4a4d52, ix, 0, iz, 0.05); return jitter(lerpHex(0xc9b46a, 0xa89a58, fbm(x, z, 2)), ix, 0, iz, 0.08); };
    dio.add(heightfield((x, z) => Math.abs(x - 0.6) < 0.4 ? 0 : hH(x, z), cH, -8, -8, 8, 8, 0.05, { sv: 0.025, tallSides: true }));
    const ranch = P2.buildRanch(0.03); ranch.scale.setScalar(0.9); ranch.position.set(-2.2, 0.05, -1.2); dio.add(ranch);
    const car = P2.buildCar(0x3a6aa0, 0.05); car.scale.setScalar(0.18); car.rotation.y = Math.PI / 2; dio.add(car);
    const fence = P.buildFence(6); fence.scale.setScalar(0.3); fence.position.set(-1.5, 0, 0.4); dio.add(fence);
    // diorama do Cretáceo: rios, pântano, florestas, mar interior
    const dio2 = new THREE.Group(); dio2.position.set(240, 0, 0); g.add(dio2);
    const riv = (x, z) => Math.min(Math.abs(x - 1.2 * Math.sin(z * 0.6) - 0.5), Math.abs(x + 3 - 0.8 * Math.sin(z * 0.9 + 1)) + 0.1);
    const hK = (x, z) => x > 5.5 ? -0.25 : riv(x, z) < 0.25 ? -0.12 : (fbm(x * 0.5, z * 0.5, 3) - 0.5) * 0.3;
    const cK = (x, z, y, top) => { const ix = Math.round(x * 20), iz = Math.round(z * 20); if (!top) return 0x4a3a26; if (x > 5.5) return jitter(0x2f6a8a, ix, 0, iz, 0.04); if (riv(x, z) < 0.25) return jitter(0x3f7f8a, ix, 0, iz, 0.05); const sw = fbm(x * 0.7 + 5, z * 0.7, 2) > 0.62; return jitter(sw ? (hash3(ix, 1, iz) > 0.6 ? 0x4a7a6a : 0x3a5a2a) : lerpHex(0x4a6a2a, 0x6a7a34, fbm(x, z, 2)), ix, 0, iz, 0.08); };
    dio2.add(heightfield(hK, cK, -8, -8, 8, 8, 0.05, { sv: 0.025, tallSides: true }));
    const R = rng(12); const miniTrees = [];
    for (let i = 0; i < 70; i++) { const x = -7.5 + R() * 12.5, z = -7.5 + R() * 15; if (riv(x, z) < 0.45 || x > 5) continue; miniTrees.push([x, hK(x, z), z, 0.35 + R() * 0.3]); }
    for (const [a, b, c, h] of miniTrees) { const tc = hash3(Math.round(a * 9), 0, Math.round(c * 9)) > 0.5 ? 0x3e5a2a : 0x56702e; const m = voxelize((p, x, y, z) => { const r = Math.hypot(p[0], p[2]); if (p[1] < h * 0.35 && r < 0.035) return 0x5a3a24; if (p[1] > h * 0.25 && r < (1 - (p[1] - h * 0.25) / (h * 0.8)) * 0.17) return jitter(tc, x, y, z, 0.1); return -1; }, [-0.2, 0, -0.2], [0.2, h + 0.05, 0.2], 0.04, { cast: true }); m.position.set(a, b, c); dio2.add(m); }
    W.st.scene.add(g);
    return { group: g, us, dio, dio2, car, env() {
      setSky(W, { top: 0x5d9ad0, mid: 0xb7d4e6, hor: 0xf1dcc0, sunDir: [-0.5, 0.6, 0.4], glow: 0.2 });
      W.st.scene.fog = new THREE.FogExp2(0xdfe4e2, 0.004);
      setLights(W, { sun: 2.4, hemi: 1.3, sunCol: 0xfff0d8, sky: 0xd6e8f4, ground: 0x6a7a4a });
      W.L.aim([0, 0, 0], [-0.4, 0.8, 0.45], 30, 80);
    } };
  },

  creta(W) {
    const C = buildCreta(W.st.scene);
    const cset = { group: C.set, C, env() {
      if (cset.pack) cset.pack.visible = false; if (cset.footRuler) cset.footRuler.visible = false;
      C.footWater.position.y = -0.05;
      setSky(W, { top: 0x6f9fb6, mid: 0xe9c79a, hor: 0xf6b47a, sunDir: [0.6, 0.1, -0.8] });
      W.st.scene.fog = new THREE.FogExp2(0xdcb48c, 0.013);
      setLights(W, { sun: 2.4, hemi: 1.3, sunCol: 0xffc48a, sky: 0xc8dce4, ground: 0x7a5636 });
      W.L.aim([0.5, 0, 0], [0.55, 0.42, -0.72], 3, 18);
    } };
    return cset;
  },
  sala(W) {
    const g = new THREE.Group();
    const room = P.buildRoom({ w: 7, d: 5, doorHole: 0.8, wall: 0xe8d4b0 }); g.add(room);
    const sofa = P.buildSofa(0x3f7b86); sofa.position.set(-0.6, 0, -1.85); g.add(sofa);
    const rug = P.buildRug(); rug.position.set(-0.4, 0, -0.2); g.add(rug);
    const win = P.buildWindow(1.4, 1.3); win.position.set(1.7, 1.55, -2.52); g.add(win);
    const lamp = P.buildLamp(); lamp.position.set(-2.1, 0, -2.0); g.add(lamp);
    const plant = P.buildPlant(); plant.position.set(2.9, 0, -2.0); g.add(plant);
    const door = P.buildDoor(); door.position.set(3.48, 0, 0.33); g.add(door);
    const keys = P.buildKeys(); keys.position.set(3.42, 1.38, -0.45); keys.rotation.y = -Math.PI / 2; g.add(keys);
    const hook = P.shapes([{ t: 'box', c: [0, 0, 0], h: [0.02, 0.04, 0.12], col: 0x6b4a32 }], 0.01); hook.position.set(3.46, 1.43, -0.45); g.add(hook);
    const keys2 = P.buildKeys(); keys2.rotation.set(-Math.PI / 2, 0, 0.6); keys2.position.set(-0.75, 0.56, -1.83); keys2.scale.setScalar(1.3); g.add(keys2);
    const plate = P.buildPlate(); plate.visible = false; g.add(plate);
    const rope = P.buildRope(0.6); rope.visible = false; g.add(rope);
    const bowl = P.buildBowl(true); bowl.visible = false; g.add(bowl);
    W.st.scene.add(g);
    return { group: g, door, keys, keys2, sofa, plate, rope, bowl, env() {
      bowl.visible = false;
      W.sky.visible = false; W.st.scene.background = new THREE.Color(0x2a1d14); W.st.scene.fog = null;
      setLights(W, { sun: 1.9, hemi: 1.25, sunCol: 0xffe2b8, sky: 0xfff0dc, ground: 0x7a5a3e, fill: 0.5, fillCol: 0xffd9a8, exposure: 1.05 });
      W.L.aim([0, 0.4, -0.5], [-0.35, 0.8, 0.5], 4.5, 12);
      W.point.position.set(-2.1, 1.75, -1.9); W.point.intensity = 4;
    } };
  },
  quarto(W) {
    const g = new THREE.Group();
    const room = P.buildRoom({ w: 6, d: 5, wall: 0xc9d8de, floor: 0xa8774c }); g.add(room);
    const bed = P.buildBed(); bed.position.set(-0.4, 0, -1.3); g.add(bed);
    const rug = P.buildRug(0x6d8a4a); rug.position.set(0.9, 0, 0.6); rug.scale.set(0.8, 1, 0.8); g.add(rug);
    const win = P.buildWindow(1.2, 1.2); win.position.set(1.6, 1.55, -2.52); g.add(win);
    const lamp = P.buildLamp(); lamp.position.set(-1.7, 0, -2.0); lamp.scale.setScalar(0.7); g.add(lamp);
    const vac = P.buildVacuum(); g.add(vac);
    const blanket = P2.buildBlanket(); blanket.position.set(-0.4, 0.62, -1.15); g.add(blanket);
    W.st.scene.add(g);
    return { group: g, bed, vac, blanket, env() {
      vac.visible = false; blanket.visible = false;
      W.sky.visible = false; W.st.scene.background = new THREE.Color(0x1c2228); W.st.scene.fog = null;
      setLights(W, { sun: 1.8, hemi: 1.3, sunCol: 0xffe8c8, sky: 0xf2f6ff, ground: 0x6a5a4a, fill: 0.45, exposure: 1.05 });
      W.L.aim([0, 0.4, -0.5], [0.4, 0.8, 0.6], 4, 12);
    } };
  },
  rua(W) {
    const g = new THREE.Group();
    const hfn = (x, z) => (z > 3 && z < 9) ? -0.12 : 0;
    const cfn = (x, z, y, top, d) => {
      const ix = Math.round(x * 10), iz = Math.round(z * 10);
      if (!top) return 0x6b5a48;
      if (z > 3 && z < 9) return jitter(Math.abs(z - 6) < 0.08 && Math.floor(x / 1.2) % 2 === 0 ? 0xf0d060 : 0x4a4d52, ix, 0, iz, 0.06);
      if ((z > 2 && z <= 3) || (z >= 9 && z < 10.2)) return jitter(0xc9c2b4, ix, 0, iz, 0.04);
      if (Math.abs(x) < 0.6 && z < 2 && z > -1) return jitter(0xb9ad98, ix, 0, iz, 0.04);
      return jitter(lerpHex(0x5f9a3a, 0x7cb04a, fbm(x * 0.8, z * 0.8, 2)), ix, 0, iz, 0.1);
    };
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const x0 = -24 + i * 12, z0 = -6 + j * 9;
      g.add(heightfield(hfn, cfn, x0, z0, x0 + 12, z0 + 9, 0.1, { sv: 0.04, tallSides: true, mat: { bev: 0.8 } }));
    }
    // nossa casa (atrás da câmera) — varanda e porta
    const porch = P.shapes([{ t: 'box', c: [0, 0.12, -1.2], h: [1.6, 0.12, 0.8], col: 0xc9b9a0 }, { t: 'box', c: [0, 1.5, -2.2], h: [3, 1.5, 0.2], col: (p, x, y, z) => Math.abs(p[0]) < 0.5 && p[1] < 2.1 ? jitter(0x6b3f24, x, y, z, 0.04) : jitter(0xe8d6b5, x, y, z, 0.03) }], 0.05);
    g.add(porch);
    for (let i = 0; i < 6; i++) { const h = P.buildHouse(i); h.position.set(-15 + i * 6, 0, 14.5); h.rotation.y = Math.PI; g.add(h); }
    for (let i = 0; i < 5; i++) { const t = P.buildStreetTree(i); t.position.set(-12 + i * 6, 0, 10.8); g.add(t); }
    const fence = P.buildFence(12); fence.position.set(-7.5, 0, 1.9); g.add(fence);
    const fence2 = P.buildFence(12); fence2.position.set(7.5, 0, 1.9); g.add(fence2);
    const mail = P.shapes([{ t: 'cyl', c: [0, 0.5, 0], r: 0.04, h: 0.5, col: 0x6b4a32 }, { t: 'box', c: [0, 1.05, 0], h: [0.12, 0.1, 0.22], r: 0.06, col: 0x2f5fa0 }, { t: 'box', c: [0.13, 1.15, 0.1], h: [0.01, 0.08, 0.02], col: 0xd23a2e }], 0.02);
    mail.position.set(1.3, 0, 2.2); g.add(mail);
    W.st.scene.add(g);
    return { group: g, env() {
      setSky(W, { top: 0x5d9ad0, mid: 0xb7d4e6, hor: 0xf1dcc0, sunDir: [-0.5, 0.35, -0.6], glow: 0.3 });
      W.st.scene.fog = new THREE.FogExp2(0xdfe4e2, 0.012);
      setLights(W, { sun: 2.5, hemi: 1.25, sunCol: 0xffe2b0, sky: 0xd6e8f4, ground: 0x6a7a4a });
      W.L.aim([0, 0, 1], [-0.5, 0.75, 0.45], 6, 20);
    } };
  },
  estudio(W) {
    const g = new THREE.Group();
    const plat = voxelize((p, x, y, z) => { const r = Math.hypot(p[0], p[2]); if (r > 1.25 || p[1] > 0.0) return -1; return r > 1.15 ? jitter(0xe0a64a, x, y, z, 0.05) : jitter(Math.floor(r * 6) % 2 ? 0x3b3f46 : 0x353941, x, y, z, 0.05); }, [-1.3, -0.16, -1.3], [1.3, 0.0, 1.3], 0.04, { cast: false });
    g.add(plat);
    const floor = voxelize((p, x, y, z) => p[1] < -0.12 ? jitter(0x22262c, x, y, z, 0.08) : -1, [-8, -0.2, -8], [8, -0.12, 8], 0.16, { cast: false });
    g.add(floor);
    const scale = P.buildScale(); scale.visible = false; g.add(scale);
    const ruler = P.buildRuler(0.6); ruler.visible = false; g.add(ruler);
    const rope = P.buildRope(0.8); rope.visible = false; g.add(rope);
    const lock = P.shapes([{ t: 'box', c: [0, 0, 0], h: [0.05, 0.04, 0.02], r: 0.01, col: 0xe2b23a }, { t: 'fn', c: [0, 0.06, 0], h: [0.05, 0.05, 0.02], f: (p) => Math.max(Math.abs(Math.hypot(p[0], p[1] - 0.04) - 0.032) - 0.008, Math.abs(p[2]) - 0.008, 0.04 - p[1]), col: 0xb8bcc4 }], 0.006);
    lock.visible = false; g.add(lock);
    // barras do gráfico de olfato
    const barDog = P.shapes([{ t: 'box', c: [0, 0.5, 0], h: [0.18, 0.5, 0.18], col: (p, x, y, z) => jitter(Math.floor(p[1] * 20) % 2 ? 0xe07a34 : 0xd06a2a, x, y, z, 0.04) }], 0.03);
    const barHum = P.shapes([{ t: 'box', c: [0, 0.5, 0], h: [0.18, 0.5, 0.18], col: (p, x, y, z) => jitter(Math.floor(p[1] * 20) % 2 ? 0x5a8ac8 : 0x4a7ab8, x, y, z, 0.04) }], 0.03);
    barDog.visible = barHum.visible = false; g.add(barDog, barHum);
    const head = P.buildPerson().head; // cabeça humana para o gráfico
    head.visible = false; g.add(head);
    const pack = P.buildBackpack(); pack.visible = false; g.add(pack);
    const cars = []; for (let i = 0; i < 6; i++) { const c = P2.buildCar([0xc8423a, 0x3a6aa0, 0xe0b040, 0x4a8a4a, 0xd8d8d8, 0x7a4aa0][i], 0.07); g.add(c); cars.push(c); }
    const banana = P2.buildBanana(); g.add(banana);
    const tooth = P2.buildTooth(); g.add(tooth);
    const amber = P2.buildAmber(); g.add(amber.group);
    const tick = F.buildTick(); g.add(tick);
    const trex = buildTrex({ voxel: 0.08 }); g.add(trex.root);
    const didel = F.buildDidelphodon(); g.add(didel.root);
    const bowl = P.buildBowl(true); g.add(bowl);
    const props = [scale, ruler, rope, lock, barDog, barHum, head, pack, ...cars, banana, tooth, amber.group, tick, trex.root, didel.root, bowl];
    W.st.scene.add(g);
    return { group: g, scale, ruler, rope, lock, barDog, barHum, head, pack, cars, banana, tooth, amber, tick, trex, didel, bowl, plat, env() {
      for (const o of props) o.visible = false; plat.visible = true;
      setSky(W, { top: 0x0d1116, mid: 0x1a2028, hor: 0x2b3038, sunDir: [0, -1, 0], glow: 0 });
      W.st.scene.fog = new THREE.FogExp2(0x15191f, 0.06);
      setLights(W, { sun: 1.0, hemi: 0.55, sunCol: 0xffe6c8, sky: 0xbcc8d8, ground: 0x30281f, fill: 0.7, fillCol: 0x8fb0e0, exposure: 1.1 });
      W.L.aim([0, 0, 0], [0.6, 0.9, 0.7], 2, 10);
      W.spot.position.set(0.6, 4.5, 1.5); W.spot.target.position.set(0, 0.2, 0); W.spot.intensity = 60; W.spot.angle = 0.42; W.spot.color.set(0xfff1dc);
    } };
  },
  fogueira(W) {
    const g = new THREE.Group();
    g.add(heightfield((x, z) => (fbm(x * 0.4, z * 0.4, 2) - 0.5) * 0.3, (x, z, y, top) => jitter(top ? lerpHex(0x4a3a28, 0x3d4a2a, fbm(x, z, 2)) : 0x3a2a1c, Math.round(x * 20), 0, Math.round(z * 20), 0.12), -12, -12, 12, 12, 0.08, { sv: 0.04, tallSides: true }));
    const logs = P.shapes([{ t: 'cap', a: [-0.35, 0.05, -0.1], b: [0.35, 0.08, 0.1], ra: 0.06, col: 0x4a3020 }, { t: 'cap', a: [-0.1, 0.05, 0.35], b: [0.1, 0.08, -0.35], ra: 0.06, col: 0x55361f }], 0.02);
    g.add(logs);
    const stones = [];
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; stones.push({ t: 'ell', c: [Math.cos(a) * 0.5, 0.04, Math.sin(a) * 0.5], r: [0.09, 0.07, 0.08], col: 0x6a6460 }); }
    g.add(P.shapes(stones, 0.025));
    const seat = P.shapes([{ t: 'cap', a: [-1.05, 0.17, -0.5], b: [-1.05, 0.17, 0.5], ra: 0.17, col: (p, x, y, z) => jitter(Math.abs(p[2]) > 0.48 ? 0x9a7550 : (Math.sin(p[0] * 60 + p[1] * 40) > 0.5 ? 0x4a3020 : 0x5e3d26), x, y, z, 0.08) }], 0.02);
    g.add(seat);
    const wolf = buildDog({ palette: 'wolf', snout: 0.035 }); g.add(wolf.root);
    const ancient = P.buildPerson({ shirt: 0x7a5a3a, pants: 0x6a4a2e, skin: 0xb98a64, hair: 0x2a1a10, shoe: 0x5a3a24 }); g.add(ancient.root);
    W.st.scene.add(g);
    return { group: g, wolf, ancient, env() {
      setSky(W, { top: 0x05070f, mid: 0x0d1424, hor: 0x1d2236, sunDir: [0, 1, 0], glow: 0 });
      W.st.scene.fog = new THREE.FogExp2(0x0b0f1a, 0.08);
      setLights(W, { sun: 0.25, hemi: 0.25, sunCol: 0x8fa8d8, sky: 0x3a4a7a, ground: 0x1a120a, fill: 0.1, exposure: 1.15 });
      W.L.aim([0, 0, 0], [-0.4, 0.8, -0.5], 3, 10);
      W.point.position.set(0, 0.45, 0); W.point.intensity = 9; W.point.distance = 8; W.point.color.set(0xff9a40);
    } };
  },
};
export { groundH };
