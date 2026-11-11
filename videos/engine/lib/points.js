// Voxeliza nuvens de pontos (folhas, samambaias, detalhes) direto numa grade.
import * as THREE from 'three';
import { meshGrid, voxMaterial } from './vox.js';
export function pointsMesh(pts, s, opts = {}) {
  // pts: array de [x,y,z,cor]
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const p of pts) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); }
  mn = mn.map(v => Math.floor(v / s) * s - s); mx = mx.map(v => v + 2 * s);
  const nx = Math.ceil((mx[0] - mn[0]) / s), ny = Math.ceil((mx[1] - mn[1]) / s), nz = Math.ceil((mx[2] - mn[2]) / s);
  const grid = new Uint32Array(nx * ny * nz);
  for (const p of pts) {
    const x = Math.floor((p[0] - mn[0]) / s), y = Math.floor((p[1] - mn[1]) / s), z = Math.floor((p[2] - mn[2]) / s);
    if (x >= 0 && y >= 0 && z >= 0 && x < nx && y < ny && z < nz) grid[x + nx * (y + ny * z)] = p[3] + 1;
  }
  const g = meshGrid(grid, nx, ny, nz, s, mn, opts);
  const m = new THREE.Mesh(g, voxMaterial(opts.mat || {}));
  m.castShadow = opts.cast ?? true; m.receiveShadow = true;
  return m;
}
// traça uma linha densa de pontos (para hastes) com espessura
export function line(pts, a, b, s, r, col) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const n = Math.max(2, Math.ceil(L / (s * 0.5)));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
    const rr = typeof r === 'function' ? r(t) : r;
    const c = typeof col === 'function' ? col(t) : col;
    if (rr <= s * 0.5) { pts.push([x, y, z, c]); continue; }
    for (let dx = -rr; dx <= rr; dx += s) for (let dy = -rr; dy <= rr; dy += s) for (let dz = -rr; dz <= rr; dz += s)
      if (dx * dx + dy * dy + dz * dz <= rr * rr) pts.push([x + dx, y + dy, z + dz, c]);
  }
}
