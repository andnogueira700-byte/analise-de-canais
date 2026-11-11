import { hash3 } from './vox.js';
const fade = (t) => t * t * (3 - 2 * t);
export function vnoise(x, z, seed = 0) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const a = hash3(xi, seed, zi), b = hash3(xi + 1, seed, zi), c = hash3(xi, seed, zi + 1), d = hash3(xi + 1, seed, zi + 1);
  const u = fade(xf), v = fade(zf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, z, oct = 4, seed = 0) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, z * f, seed + i * 13); f *= 2.03; a *= 0.5; }
  return s;
}
// gerador pseudo-aleatório determinístico
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
