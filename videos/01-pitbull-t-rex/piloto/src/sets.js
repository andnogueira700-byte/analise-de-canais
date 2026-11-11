// Cenários do piloto e configuração de ambiente (luz, céu, neblina) por cenário.
import * as THREE from 'three';
import { makeSky, makeLights } from '/videos/engine/lib/world.js';
import { buildCreta, groundH } from '/videos/engine/lib/creta.js';
import { buildDog } from '/videos/engine/lib/dog.js';
import { heightfield, jitter, lerpHex, hash3, voxelize, voxMaterial } from '/videos/engine/lib/vox.js';
import * as P from '/videos/engine/lib/props.js';
import { fbm } from '/videos/engine/lib/noise.js';
import { CubeSet } from '/videos/engine/lib/text.js';

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
    W.st.scene.add(g);
    return { group: g, door, keys, keys2, sofa, plate, rope, env() {
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
    W.st.scene.add(g);
    return { group: g, bed, vac, env() {
      vac.visible = false;
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
    W.st.scene.add(g);
    return { group: g, scale, ruler, rope, lock, barDog, barHum, head, pack, env() {
      for (const o of [scale, ruler, rope, lock, barDog, barHum, head, pack]) o.visible = false;
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
