// Núcleo de microblocos: voxeliza funções (SDF/cor) e gera malhas só com faces expostas.
import * as THREE from 'three';

export const hash3 = (x, y, z) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
export const rgb = (hex) => [(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255];
export const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------- primitivas SDF ----------
export const sd = {
  ell: (p, c, r) => { const x = (p[0] - c[0]) / r[0], y = (p[1] - c[1]) / r[1], z = (p[2] - c[2]) / r[2]; const k = Math.sqrt(x * x + y * y + z * z); return (k - 1) * Math.min(r[0], r[1], r[2]); },
  sph: (p, c, r) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - r,
  cap: (p, a, b, ra, rb = ra) => {
    const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const h = Math.max(0, Math.min(1, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2])));
    return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (ra + (rb - ra) * h);
  },
  box: (p, c, h, r = 0) => {
    const q = [Math.abs(p[0] - c[0]) - h[0] + r, Math.abs(p[1] - c[1]) - h[1] + r, Math.abs(p[2] - c[2]) - h[2] + r];
    return Math.hypot(Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)) + Math.min(Math.max(q[0], q[1], q[2]), 0) - r;
  },
  cylY: (p, c, r, h) => { const d0 = Math.hypot(p[0] - c[0], p[2] - c[2]) - r, d1 = Math.abs(p[1] - c[1]) - h; return Math.min(Math.max(d0, d1), 0) + Math.hypot(Math.max(d0, 0), Math.max(d1, 0)); },
  smin: (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; },
};

// ---------- material com chanfro (cada cubo parece um tijolinho) ----------
const matCache = new Map();
export function voxMaterial(opts = {}) {
  const key = JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ vertexColors: !opts.inst, roughness: opts.rough ?? 0.85, metalness: 0, transparent: !!opts.transparent, opacity: opts.opacity ?? 1 });
  m.customProgramCacheKey = () => key;
  m.userData.uniforms = { uTime: { value: 0 }, uWind: { value: opts.wind || 0 } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, m.userData.uniforms);
    sh.fragmentShader = '#define BEVMIN ' + (opts.bev ?? 0.62).toFixed(3) + '\n' + sh.fragmentShader;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 fuv;\nvarying vec2 vFuv;\nuniform float uTime;\nuniform float uWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vFuv = fuv;
        if (uWind > 0.0) {
          vec4 wp = modelMatrix * vec4(transformed, 1.0);
          float h = max(transformed.y, 0.0);
          float s = sin(uTime * 1.7 + wp.x * 1.3 + wp.z * 0.9) + 0.5 * sin(uTime * 3.1 + wp.x * 2.7);
          transformed.x += s * uWind * h * h;
          transformed.z += cos(uTime * 1.3 + wp.z * 1.1) * uWind * 0.6 * h * h;
        }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFuv;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 e2 = min(vFuv, 1.0 - vFuv);
        float ed = min(e2.x, e2.y);
        float bev = mix(BEVMIN, 1.0, smoothstep(0.0, 0.16, ed));
        float hi = smoothstep(0.22, 0.0, 1.0 - vFuv.y) * 0.10 + smoothstep(0.22, 0.0, vFuv.x) * 0.05;
        diffuseColor.rgb = diffuseColor.rgb * bev + hi * diffuseColor.rgb;`);
  };
  matCache.set(key, m);
  return m;
}

// ---------- gerador de malha a partir de uma grade ----------
// grid: Uint32Array (0 = vazio, senão cor 0xRRGGBB+1), dims nx,ny,nz; tamanho s; origem o
const FACES = [
  { d: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], u: [2, 1], sh: 0.86 },
  { d: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], u: [2, 1], sh: 0.80 },
  { d: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], u: [0, 2], sh: 1.0 },
  { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], u: [0, 2], sh: 0.55 },
  { d: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], u: [0, 1], sh: 0.92 },
  { d: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], u: [0, 1], sh: 0.75 },
];
const FUV = [[0, 0], [0, 1], [1, 1], [1, 0]];

export function meshGrid(grid, nx, ny, nz, s, o, opts = {}) {
  const at = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= nx || y >= ny || z >= nz) ? 0 : grid[x + nx * (y + ny * z)];
  const pos = [], nor = [], col = [], fuv = [], idx = [];
  const ao = opts.ao ?? 0.22;
  let vi = 0;
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const v = grid[x + nx * (y + ny * z)];
    if (!v) continue;
    const c = rgb(v - 1);
    for (const f of FACES) {
      const d = f.d;
      if (at(x + d[0], y + d[1], z + d[2])) continue;
      const vals = [];
      for (let k = 0; k < 4; k++) {
        const cc = f.c[k];
        // AO por vértice: verifica os 3 vizinhos na frente da face
        const ax = [], tv = [cc[0] * 2 - 1, cc[1] * 2 - 1, cc[2] * 2 - 1];
        const t1 = [0, 0, 0], t2 = [0, 0, 0];
        const ua = f.u[0], ub = f.u[1];
        t1[ua] = tv[ua]; t2[ub] = tv[ub];
        const bx = x + d[0], by = y + d[1], bz = z + d[2];
        const s1 = at(bx + t1[0], by + t1[1], bz + t1[2]) ? 1 : 0;
        const s2 = at(bx + t2[0], by + t2[1], bz + t2[2]) ? 1 : 0;
        const cn = at(bx + t1[0] + t2[0], by + t1[1] + t2[1], bz + t1[2] + t2[2]) ? 1 : 0;
        const occ = (s1 && s2) ? 3 : s1 + s2 + cn;
        const sh = f.sh * (1 - occ * ao / 3);
        vals.push(sh);
        pos.push(o[0] + (x + cc[0]) * s, o[1] + (y + cc[1]) * s, o[2] + (z + cc[2]) * s);
        nor.push(d[0], d[1], d[2]);
        col.push(c[0] * sh, c[1] * sh, c[2] * sh);
        fuv.push(FUV[k][0], FUV[k][1]);
      }
      if (vals[0] + vals[2] < vals[1] + vals[3]) idx.push(vi + 1, vi + 2, vi + 3, vi + 1, vi + 3, vi);
      else idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      vi += 4;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('fuv', new THREE.Float32BufferAttribute(fuv, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

// voxeliza: fn(p) -> cor hex (número) ou -1 se vazio; bounds [min,max]
export function voxelize(fn, min, max, s, opts = {}) {
  const nx = Math.ceil((max[0] - min[0]) / s), ny = Math.ceil((max[1] - min[1]) / s), nz = Math.ceil((max[2] - min[2]) / s);
  const grid = new Uint32Array(nx * ny * nz);
  const p = [0, 0, 0];
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    p[0] = min[0] + (x + 0.5) * s; p[1] = min[1] + (y + 0.5) * s; p[2] = min[2] + (z + 0.5) * s;
    const c = fn(p, x, y, z);
    if (c >= 0) grid[x + nx * (y + ny * z)] = c + 1;
  }
  const geo = meshGrid(grid, nx, ny, nz, s, min, opts);
  const mesh = new THREE.Mesh(geo, voxMaterial(opts.mat || {}));
  mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

// variação de cor por cubo
export function jitter(hex, x, y, z, amt = 0.07, seed = 0) {
  const c = rgb(hex), r = hash3(x + seed * 17, y, z) - 0.5;
  const k = 1 + r * 2 * amt;
  const R = Math.min(255, Math.max(0, Math.round(c[0] * 255 * k))), G = Math.min(255, Math.max(0, Math.round(c[1] * 255 * k))), B = Math.min(255, Math.max(0, Math.round(c[2] * 255 * k)));
  return (R << 16) | (G << 8) | B;
}
export const lerpHex = (a, b, t) => { const A = rgb(a), B = rgb(b), c = mixc(A, B, Math.max(0, Math.min(1, t))); return (Math.round(c[0] * 255) << 16) | (Math.round(c[1] * 255) << 8) | Math.round(c[2] * 255); };

// SDF -> voxel helper: lista de [sdf(p), cor(p)] em união; retorna mesh
export function sdfMesh(sdf, color, min, max, s, opts = {}) {
  return voxelize((p, x, y, z) => sdf(p) <= 0 ? color(p, x, y, z) : -1, min, max, s, opts);
}

// ---------- terreno (campo de alturas) ----------
// hfn(x,z) -> altura (m); cfn(x,z,y,isTop,depth) -> cor; região retangular com buraco opcional
export function heightfield(hfn, cfn, x0, z0, x1, z1, s, opts = {}) {
  const sv = opts.sv ?? s;
  const nx = Math.ceil((x1 - x0) / s), nz = Math.ceil((z1 - z0) / s);
  const H = new Int32Array((nx + 2) * (nz + 2));
  const hole = opts.hole; // [hx0,hz0,hx1,hz1]
  const inHole = (i, j) => { if (!hole) return false; const x = x0 + (i + 0.5) * s, z = z0 + (j + 0.5) * s; return x > hole[0] && x < hole[2] && z > hole[1] && z < hole[3]; };
  for (let j = -1; j <= nz; j++) for (let i = -1; i <= nx; i++) H[(i + 1) + (nx + 2) * (j + 1)] = Math.round(hfn(x0 + (i + 0.5) * s, z0 + (j + 0.5) * s) / sv);
  const h = (i, j) => H[(i + 1) + (nx + 2) * (j + 1)];
  const pos = [], nor = [], col = [], fuv = [], idx = [];
  let vi = 0;
  const minDrop = opts.skirt ?? 3;
  const quad = (pts, n, c, sh, aos) => {
    for (let k = 0; k < 4; k++) { pos.push(...pts[k]); nor.push(...n); const a = sh * (aos ? aos[k] : 1); col.push(c[0] * a, c[1] * a, c[2] * a); fuv.push(FUV[k][0], FUV[k][1]); }
    idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); vi += 4;
  };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    if (inHole(i, j)) continue;
    const hh = h(i, j), y = hh * sv, x = x0 + i * s, z = z0 + j * s;
    const wx = x + s / 2, wz = z + s / 2;
    const ct = rgb(cfn(wx, wz, y, true, 0, i, j));
    // AO no topo: vizinhos mais altos escurecem cantos
    const up = (di, dj) => h(i + di, j + dj) > hh ? 1 : 0;
    const aoc = (a, b, c) => 1 - 0.09 * ((a && b) ? 3 : a + b + c);
    const aos = [aoc(up(-1, 0), up(0, 1), up(-1, 1)), aoc(up(1, 0), up(0, 1), up(1, 1)), aoc(up(1, 0), up(0, -1), up(1, -1)), aoc(up(-1, 0), up(0, -1), up(-1, -1))];
    quad([[x, y, z + s], [x + s, y, z + s], [x + s, y, z], [x, y, z]], [0, 1, 0], ct, 1, aos);
    // laterais
    const sides = [[1, 0, 0.86], [-1, 0, 0.8], [0, 1, 0.92], [0, -1, 0.75]];
    for (const [di, dj, sh] of sides) {
      let nh = h(i + di, j + dj);
      if (inHole(i + di, j + dj) || i + di < 0 || j + dj < 0 || i + di >= nx || j + dj >= nz) nh = Math.min(nh, hh - minDrop);
      if (nh >= hh) continue;
      if (opts.tallSides) {
        const yb = nh * sv, yt = hh * sv, cs = rgb(cfn(wx, wz, yb, false, 1, i, j));
        let pts;
        if (di === 1) pts = [[x + s, yb, z], [x + s, yt, z], [x + s, yt, z + s], [x + s, yb, z + s]];
        else if (di === -1) pts = [[x, yb, z + s], [x, yt, z + s], [x, yt, z], [x, yb, z]];
        else if (dj === 1) pts = [[x + s, yb, z + s], [x + s, yt, z + s], [x, yt, z + s], [x, yb, z + s]];
        else pts = [[x, yb, z], [x, yt, z], [x + s, yt, z], [x + s, yb, z]];
        quad(pts, [di, 0, dj], cs, sh);
        continue;
      }
      for (let k = hh - 1; k >= nh; k--) {
        const yb = k * sv, yt = yb + sv;
        const cs = rgb(cfn(wx, wz, yb, false, hh - k, i, j));
        let pts;
        if (di === 1) pts = [[x + s, yb, z], [x + s, yt, z], [x + s, yt, z + s], [x + s, yb, z + s]];
        else if (di === -1) pts = [[x, yb, z + s], [x, yt, z + s], [x, yt, z], [x, yb, z]];
        else if (dj === 1) pts = [[x + s, yb, z + s], [x + s, yt, z + s], [x, yt, z + s], [x, yb, z + s]];
        else pts = [[x, yb, z], [x, yt, z], [x + s, yt, z], [x + s, yb, z]];
        quad(pts, [di, 0, dj], cs, sh * (k === nh ? 0.8 : 1));
        if (hh - k > (opts.maxSide ?? 8)) break;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('fuv', new THREE.Float32BufferAttribute(fuv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  const m = new THREE.Mesh(g, voxMaterial(opts.mat || {}));
  m.receiveShadow = true; m.castShadow = opts.cast ?? false;
  return m;
}
