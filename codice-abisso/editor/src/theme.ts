export const C = {
  bg: '#0A0A0A',
  gray1: '#3A3A3A',
  gray2: '#B3B3B3',
  white: '#F2F2F2',
  red: '#D7141A',
};
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
export const FONT_DISPLAY = "'Anton', 'Impact', sans-serif";

// pseudo-random determinístico
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = (x: number) => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
