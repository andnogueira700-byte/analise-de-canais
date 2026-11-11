// Ambiente: céu, luz, água, árvores, samambaias, troncos, pedras e o T. rex.
import * as THREE from 'three';
import { sd, voxelize, jitter, lerpHex, hash3, voxMaterial } from './vox.js';
import { pointsMesh, line } from './points.js';
import { fbm, rng } from './noise.js';
const { ell, cap, box, sph, smin, cylY } = sd;

// ---------- céu ----------
export function makeSky(opts = {}) {
  const u = {
    top: { value: new THREE.Color(opts.top ?? 0x6f9fb6) }, mid: { value: new THREE.Color(opts.mid ?? 0xe9c79a) },
    hor: { value: new THREE.Color(opts.hor ?? 0xf6b47a) }, sunDir: { value: new THREE.Vector3(0.6, 0.12, -0.8).normalize() },
    sunCol: { value: new THREE.Color(opts.sunCol ?? 0xfff0c8) }, sunSize: { value: opts.sunSize ?? 0.9994 }, glow: { value: opts.glow ?? 0.45 },
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 top,mid,hor,sunDir,sunCol; uniform float sunSize,glow; varying vec3 vD;
      void main(){ float y = vD.y; vec3 c = mix(hor, mid, smoothstep(-0.02, 0.18, y)); c = mix(c, top, smoothstep(0.15, 0.7, y));
        float sd = max(dot(normalize(vD), normalize(sunDir)), 0.0);
        c += sunCol * pow(sd, 40.0) * glow * 0.5 + sunCol * pow(sd, 4.0) * glow * 0.22;
        c = mix(c, sunCol*1.4, smoothstep(sunSize, sunSize+0.0006, sd));
        if (y < 0.0) c = mix(hor, hor*0.85, clamp(-y*4.0,0.0,1.0));
        gl_FragColor = vec4(c,1.0); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), m);
  mesh.renderOrder = -10; mesh.frustumCulled = false;
  mesh.userData.u = u;
  return mesh;
}

// ---------- nuvens em blocos ----------
export function makeClouds(seed = 3, n = 9, col = 0xf3c9a6) {
  const R = rng(seed), g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const cx = (R() - 0.5) * 500, cz = -250 - R() * 250, cy = 70 + R() * 60;
    const w = 30 + R() * 50;
    const m = voxelize((p, x, y, z) => {
      const d = ell(p, [0, 0, 0], [w, 7, w * 0.4]) + (fbm(p[0] * 0.05 + i, p[2] * 0.05, 3) - 0.5) * 10;
      return d <= 0 ? jitter(lerpHex(col, 0xffffff, (p[1] + 7) / 14 * 0.6), x, y, z, 0.03) : -1;
    }, [-w, -7, -w * 0.4], [w, 7, w * 0.4], 4, { cast: false, receive: false, ao: 0.1 });
    m.position.set(cx, cy, cz); m.material = voxMaterial({ fogless: 1 }); g.add(m);
  }
  g.traverse(o => { if (o.material) { o.material.fog = false; } });
  return g;
}

// ---------- luzes ----------
export function makeLights(scene, opts = {}) {
  const hemi = new THREE.HemisphereLight(opts.sky ?? 0xcfe0e8, opts.ground ?? 0x7a5636, opts.hemi ?? 1.15);
  const sun = new THREE.DirectionalLight(opts.sunCol ?? 0xffc98e, opts.sun ?? 2.8);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01;
  sun.shadow.radius = 3;
  scene.add(hemi, sun, sun.target);
  const fill = new THREE.DirectionalLight(opts.fillCol ?? 0x9fb8d8, opts.fill ?? 0.35);
  fill.position.set(-5, 3, 6); scene.add(fill);
  return { hemi, sun, fill,
    aim(target, dir, size = 3, dist = 20) { // posiciona sombra em volta do alvo
      const d = new THREE.Vector3(...dir).normalize();
      sun.target.position.set(...target); sun.position.set(target[0] + d.x * dist, target[1] + d.y * dist, target[2] + d.z * dist);
      const c = sun.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.5; c.far = dist * 2.5; c.updateProjectionMatrix();
    } };
}

// ---------- água ----------
export function makeWaterMaterial(opts = {}) {
  const u = {
    uTime: { value: 0 }, deep: { value: new THREE.Color(opts.deep ?? 0x24545e) }, shallow: { value: new THREE.Color(opts.shallow ?? 0x4f8288) },
    skyc: { value: new THREE.Color(opts.sky ?? 0xe9c6a8) }, sunDir: { value: new THREE.Vector3(0.6, 0.15, -0.8).normalize() }, cell: { value: opts.cell ?? 0.035 },
    sunCol: { value: new THREE.Color(0xfff2d0) }, fogColor: { value: new THREE.Color(0xd9b48c) }, fogDensity: { value: 0.012 }, alpha: { value: opts.alpha ?? 1 },
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: (opts.alpha ?? 1) < 1,
    vertexShader: `varying vec3 vW; varying float vDist; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix*w; vDist = -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime, cell, fogDensity, alpha; uniform vec3 deep, shallow, skyc, sunDir, sunCol, fogColor; varying vec3 vW; varying float vDist;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        float cs = cell * (1.0 + floor(vDist / 6.0) * 0.6);
        vec2 g = floor(vW.xz / cs); vec2 f = fract(vW.xz / cs);
        vec2 c = (g + 0.5) * cs;
        float w = sin(c.x*3.1 + uTime*1.6) * 0.5 + sin(c.y*4.3 - uTime*1.2 + c.x*1.7) * 0.35 + sin((c.x+c.y)*9.0 + uTime*2.7)*0.15;
        vec3 V = normalize(cameraPosition - vec3(c.x, vW.y, c.y));
        vec3 N = normalize(vec3(w*0.12, 1.0, cos(c.y*3.7+uTime*1.4)*0.08));
        float fr = pow(1.0 - max(dot(V, N), 0.0), 3.0);
        vec3 col = mix(shallow, deep, clamp(0.35 + w*0.15, 0.0, 1.0));
        col = mix(col, skyc, clamp(0.12 + fr*0.95 + smoothstep(4.0, 40.0, vDist)*0.35, 0.0, 0.92));
        vec3 R = reflect(-V, N);
        float sp = pow(max(dot(R, normalize(sunDir)), 0.0), 60.0);
        col += sunCol * sp * 0.7 * step(0.6, h(g + floor(uTime*3.0)));
        float ed = min(min(f.x, 1.0-f.x), min(f.y, 1.0-f.y));
        col *= mix(0.86, 1.0, smoothstep(0.0, 0.14, ed));
        col *= 0.96 + h(g)*0.08;
        float fg = 1.0 - exp(-fogDensity*fogDensity*vDist*vDist);
        col = mix(col, fogColor, fg);
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  m.userData.u = u;
  return m;
}

// ---------- árvores ----------
export function makeTree(seed, opts = {}) {
  const R = rng(seed);
  const s = opts.voxel ?? 0.08;
  const H = opts.height ?? (9 + R() * 8), r0 = opts.radius ?? (0.35 + R() * 0.25);
  const type = opts.type ?? (R() < 0.6 ? 'araucaria' : 'cypress');
  const bark = opts.bark ?? 0x6b4a32, leaf = opts.leaf ?? 0x55703a, leaf2 = opts.leaf2 ?? 0x7d8f45;
  const g = new THREE.Group();
  const lean = (R() - 0.5) * 0.06;
  const trunk = voxelize((p, x, y, z) => {
    const t = p[1] / H, r = r0 * (1 - t * 0.55) + (p[1] < 0.6 ? (0.6 - p[1]) * 0.5 : 0);
    const cx = lean * p[1];
    const d = Math.hypot(p[0] - cx, p[2]) - r;
    if (d > 0 || p[1] > H) return -1;
    const stripe = hash3(Math.floor(Math.atan2(p[2], p[0] - cx) * 6), 0, Math.floor(p[1] / (s * 3))) ;
    return jitter(stripe > 0.7 ? 0x4f3524 : bark, x, y, z, 0.08);
  }, [-r0 - 0.7, 0, -r0 - 0.7], [r0 + 0.7 + Math.abs(lean) * H, H, r0 + 0.7], s, { cast: opts.cast ?? false });
  g.add(trunk);
  // copa
  const pts = [];
  const top = H;
  if (type === 'araucaria') {
    const layers = 3 + Math.floor(R() * 3);
    for (let i = 0; i < layers; i++) {
      const y = top - i * (1.1 + R() * 0.6), rad = 1.6 + i * 0.7 + R() * 0.8;
      const cx = lean * y + (R() - 0.5) * 0.6, cz = (R() - 0.5) * 0.6;
      for (let x = -rad; x <= rad; x += s) for (let z = -rad; z <= rad; z += s) {
        const q = (x * x + z * z) / (rad * rad); if (q > 1) continue;
        const th = (1 - q) * 0.9 + 0.25 + (fbm(x * 0.9 + i, z * 0.9 + seed, 2) - 0.5) * 0.6;
        if (th <= 0) continue;
        if (fbm(x * 1.7 + seed, z * 1.7 + i * 5, 2) < 0.33 && q > 0.35) continue;
        for (let yy = 0; yy < th; yy += s) pts.push([cx + x, y - th * 0.4 + yy, cz + z, jitter(lerpHex(leaf, leaf2, yy / th * 0.8 + (1 - q) * 0.2), Math.round(x / s), Math.round(yy / s), Math.round(z / s), 0.12)]);
      }
    }
  } else {
    const cH = H * 0.65;
    for (let y = H - cH; y < H + 1.2; y += s) {
      const t = (y - (H - cH)) / (cH + 1.2), rad = (1 - t) * 2.4 + 0.3;
      for (let x = -rad; x <= rad; x += s) for (let z = -rad; z <= rad; z += s) {
        const q = (x * x + z * z) / (rad * rad); if (q > 1 || q < 0.55) continue;
        if (fbm(x * 1.4 + y, z * 1.4 + seed, 2) < 0.4) continue;
        pts.push([lean * y + x, y, z, jitter(lerpHex(leaf, leaf2, t * 0.7), Math.round(x / s), Math.round(y / s), Math.round(z / s), 0.12)]);
      }
    }
  }
  const crown = pointsMesh(pts, s, { cast: opts.cast ?? false, mat: { wind: 0.0 } });
  g.add(crown);
  return g;
}

// ---------- samambaia ----------
export function makeFern(seed, opts = {}) {
  const R = rng(seed), s = opts.voxel ?? 0.012, size = opts.size ?? (0.35 + R() * 0.25);
  const pts = [], c1 = opts.c1 ?? 0x6f8f2e, c2 = opts.c2 ?? 0xa9b84a;
  const n = 6 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R() * 0.5, len = size * (0.7 + R() * 0.5), up = 0.7 + R() * 0.5;
    const steps = Math.ceil(len / (s * 0.6));
    let prev = null;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, r = t * len;
      const y = Math.sin(t * Math.PI * 0.85) * len * 0.55 * up;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const col = lerpHex(c1, c2, t * 0.7);
      pts.push([x, y, z, col]);
      // folíolos
      const ll = (1 - t) * len * 0.22 * (t > 0.05 ? 1 : 0);
      if (k % 2 === 0 && ll > s) {
        const px = -Math.sin(a), pz = Math.cos(a);
        for (const sg of [1, -1]) line(pts, [x, y, z], [x + px * ll * sg + Math.cos(a) * ll * 0.4, y - ll * 0.25, z + pz * ll * sg + Math.sin(a) * ll * 0.4], s, 0, (tt) => jitter(lerpHex(col, c2, tt * 0.5), k, i, sg > 0 ? 1 : 2, 0.1));
      }
    }
  }
  return pointsMesh(pts, s, { cast: true, mat: { wind: opts.wind ?? 0.35 } });
}

// ---------- tronco caído ----------
export function makeLog(seed, len = 3, rad = 0.28, s = 0.03) {
  const R = rng(seed);
  return voxelize((p, x, y, z) => {
    const t = (p[0] + len / 2) / len;
    if (t < 0 || t > 1) return -1;
    const rr = rad * (1 - t * 0.25) + (fbm(p[0] * 3, p[2] * 5 + seed, 2) - 0.5) * 0.05;
    const jag = t > 0.93 ? (fbm(p[1] * 20, p[2] * 20, 2) > 0.5 + (t - 0.93) * 8 ? 1 : 0) : 1;
    const d = Math.hypot(p[1] - rad, p[2]) - rr;
    if (d > 0 || !jag) return -1;
    if (d > -s * 1.5 && p[1] > rad * 1.55 && fbm(p[0] * 4, p[2] * 4 + 3, 2) > 0.45) return jitter(0x7f8f3a, x, y, z, 0.15);
    const ring = Math.abs(p[0] - (len / 2 - 0.01)) < s * 1.5 ? 0x9a7550 : 0x6b4a33;
    const groove = Math.sin(Math.atan2(p[2], p[1] - rad) * 14 + fbm(p[0] * 2, 0, 1) * 4) > 0.55;
    return jitter(groove ? 0x4a3020 : ring, x, y, z, 0.1);
  }, [-len / 2, 0, -rad * 1.4], [len / 2, rad * 2.3, rad * 1.4], s, { cast: true });
}

// ---------- pedras ----------
export function makeRock(seed, r = 0.2, s = 0.025, col = 0x7b6650) {
  return voxelize((p, x, y, z) => {
    const d = ell(p, [0, 0, 0], [r, r * 0.6, r * 0.85]) + (fbm(p[0] * 8 + seed, p[2] * 8 + p[1] * 4, 2) - 0.5) * r * 0.5;
    return d <= 0 ? jitter(lerpHex(col, 0x4e4034, -p[1] / r * 0.5 + 0.3), x, y, z, 0.1) : -1;
  }, [-r * 1.3, -r * 0.8, -r * 1.2], [r * 1.3, r * 0.8, r * 1.2], s, { cast: true });
}

// ---------- T. rex ----------
export function buildTrex(opts = {}) {
  const s = opts.voxel ?? 0.09;
  const skin = opts.skin ?? 0x5d5444, back = opts.back ?? 0x433a30, belly = opts.belly ?? 0x8a7c62;
  const J = (h, x, y, z) => jitter(h, x, y, z, 0.08);
  const col = (p, x, y, z) => {
    const stripe = Math.sin(p[0] * 2.2) > 0.6 && p[1] > 3.2;
    if (p[1] < 2.7) return J(belly, x, y, z);
    return J(stripe || p[1] > 3.9 ? back : skin, x, y, z);
  };
  const root = new THREE.Group();
  const P = (fn, colf, min, max, pivot) => { const m = voxelize((p, x, y, z) => fn(p) <= 0 ? colf(p, x, y, z) : -1, min, max, s, { cast: true }); m.position.set(-pivot[0], -pivot[1], -pivot[2]); const g = new THREE.Group(); g.add(m); g.position.set(...pivot); return g; };
  const HIP = [0, 3.6, 0];
  const body = P((p) => { let d = ell(p, [0.4, 3.5, 0], [2.2, 1.15, 0.95]); d = smin(d, ell(p, [-0.6, 3.6, 0], [1.4, 1.0, 0.85]), 0.6); d = smin(d, cap(p, [1.9, 3.8, 0], [2.9, 4.4, 0], 0.7, 0.55), 0.5); return d; }, col, [-2.2, 2.2, -1.1], [3.6, 5.1, 1.1], HIP);
  root.add(body);
  const NECK = [2.8, 4.4, 0];
  const head = P((p) => { let d = box(p, [3.55, 4.55, 0], [0.85, 0.42, 0.42], 0.22); d = smin(d, ell(p, [3.05, 4.65, 0], [0.55, 0.55, 0.5]), 0.3); return d; }, (p, x, y, z) => {
    if (Math.hypot(p[0] - 3.22, p[1] - 4.82, Math.abs(p[2]) - 0.38) < 0.11) return 0xd8a040;
    if (p[1] < 4.33 && p[0] > 3.0 && Math.abs(p[2]) > 0.25) return hash3(x, 0, z) > 0.5 ? 0xe8dcc0 : J(skin, x, y, z);
    return col(p, x, y, z);
  }, [2.3, 3.9, -0.6], [4.6, 5.3, 0.6], NECK);
  body.add(head); head.position.sub(new THREE.Vector3(...HIP));
  const JAW = [2.95, 4.25, 0];
  const jaw = P((p) => box(p, [3.5, 4.12, 0], [0.75, 0.16, 0.36], 0.12), (p, x, y, z) => p[1] > 4.22 ? 0x8a3a34 : J(belly, x, y, z), [2.6, 3.9, -0.5], [4.4, 4.4, 0.5], JAW);
  head.add(jaw); jaw.position.sub(new THREE.Vector3(...NECK));
  const TAIL = [-1.8, 3.7, 0];
  const tail = P((p) => cap(p, [-1.8, 3.7, 0], [-4.2, 3.6, 0], 0.75, 0.38), col, [-5, 2.7, -1], [-1.0, 4.6, 1], TAIL);
  const TAIL2 = [-4.2, 3.6, 0];
  const tail2 = P((p) => cap(p, [-4.2, 3.6, 0], [-7.3, 3.3, 0], 0.4, 0.08), col, [-7.6, 2.9, -0.6], [-3.7, 4.2, 0.6], TAIL2);
  body.add(tail); tail.position.sub(new THREE.Vector3(...HIP)); tail.add(tail2); tail2.position.sub(new THREE.Vector3(...TAIL));
  const legs = [];
  for (const sg of [1, -1]) {
    const z = 0.65 * sg;
    const Hp = [0, 3.4, z];
    const thigh = P((p) => smin(ell(p, [-0.05, 2.9, z], [0.75, 1.05, 0.42]), cap(p, [0, 3.4, z], [0.35, 1.9, z], 0.4, 0.3), 0.3), col, [-1, 1.5, z - 0.6], [1.1, 4.1, z + 0.6], Hp);
    const Kn = [0.35, 1.9, z];
    const shin = P((p) => smin(cap(p, [0.35, 1.9, z], [-0.2, 0.55, z], 0.3, 0.2), cap(p, [-0.2, 0.55, z], [0.55, 0.12, z], 0.16, 0.14), 0.15), (p, x, y, z2) => p[1] < 0.3 ? J(0x3a3028, x, y, z2) : col(p, x, y, z2), [-0.6, -0.05, z - 0.4], [1.0, 2.3, z + 0.4], Kn);
    body.add(thigh); thigh.position.sub(new THREE.Vector3(...HIP)); thigh.add(shin); shin.position.sub(new THREE.Vector3(...Hp));
    legs.push({ thigh, shin, sg });
    const arm = P((p) => cap(p, [2.0, 3.2, z * 0.9], [2.35, 2.75, z * 1.05], 0.12, 0.08), col, [1.7, 2.5, z - 0.4], [2.6, 3.4, z + 0.4], [2.0, 3.2, z]);
    body.add(arm); arm.position.sub(new THREE.Vector3(...HIP));
  }
  body.position.set(...HIP);
  return { root, body, head, jaw, tail: [tail, tail2], legs, HIP };
}
export function poseTrex(T, p) {
  const t = p.t || 0, ph = (p.phase || 0) * Math.PI * 2, w = p.walk ?? 1;
  T.body.position.y = T.HIP[1] + Math.abs(Math.cos(ph)) * 0.12 * w - 0.06;
  T.body.rotation.z = Math.sin(ph * 2) * 0.02 * w + (p.pitch || 0);
  T.body.rotation.x = Math.sin(ph) * 0.03 * w;
  for (const L of T.legs) {
    const a = ph + (L.sg > 0 ? 0 : Math.PI);
    L.thigh.rotation.z = Math.sin(a) * 0.38 * w;
    L.shin.rotation.z = -Math.max(0, Math.cos(a)) * 0.5 * w;
  }
  T.head.rotation.z = (p.headPitch || 0) + Math.sin(ph * 2 + 0.5) * 0.03 * w;
  T.head.rotation.y = p.headYaw || 0;
  T.jaw.rotation.z = -(p.jaw || 0) * 0.45;
  T.tail[0].rotation.y = Math.sin(ph + 1) * 0.08 * w; T.tail[1].rotation.y = Math.sin(ph + 0.2) * 0.12 * w;
  T.tail[0].rotation.z = Math.sin(ph * 2) * 0.03;
}
