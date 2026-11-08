import React, {createContext, useContext} from 'react';
import {spring, useCurrentFrame, useVideoConfig, staticFile} from 'remotion';
import {C, FONT, FPS, H, W, clamp, rnd} from './theme';

// ---------------------------------------------------------------------------
// Contexto de cena: tempo local, duração, câmera
// ---------------------------------------------------------------------------
export type SceneCtxT = {lt: number; dur: number; idx: number; gt: number; zoom?: number; follow?: number};
export const SceneCtx = createContext<SceneCtxT>({lt: 0, dur: 4, idx: 0, gt: 0});
export const useScene = () => useContext(SceneCtx);

/** deslocamento da câmera (px) – sempre em movimento */
export const useCam = () => {
  const {lt, dur, zoom, follow} = useScene();
  const p = clamp(lt / Math.max(dur, 0.1));
  return {
    scale: 1 + (zoom ?? 0) * p,
    px: -(follow ?? 0) * lt * 0.55,
    py: 0,
    p,
  };
};

/** Camada com parallax. depth: 0 = fundo longínquo, 1 = plano médio, 2 = primeiro plano */
export const Layer: React.FC<{depth?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({depth = 1, children, style}) => {
  const cam = useCam();
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${cam.px * depth}px, ${cam.py * depth}px)`, ...style}}>
      {children}
    </div>
  );
};

/** Câmera: zoom lento 1.0 -> 1.08 aplicado a toda a cena */
export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const cam = useCam();
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${cam.scale})`, transformOrigin: '50% 50%'}}>{children}</div>
  );
};

// ---------------------------------------------------------------------------
// Fundo vivo
// ---------------------------------------------------------------------------
const NP = 70;
const parts = Array.from({length: NP}).map((_, i) => ({
  x: rnd(i * 3 + 1) * W,
  y: rnd(i * 3 + 2) * H,
  r: 1.2 + rnd(i * 3 + 3) * 3.2,
  sp: 6 + rnd(i * 7 + 4) * 14,
  dr: (rnd(i * 5 + 9) - 0.5) * 14,
  ph: rnd(i * 11) * 6.28,
  o: 0.18 + rnd(i * 13) * 0.45,
}));

export const Background: React.FC<{mode?: 'deep' | 'surface' | 'dark' | 'plain'; rays?: boolean; glow?: number; focusX?: number; focusY?: number}> = ({
  mode = 'deep', rays = true, glow = 1, focusX = 50, focusY = 38,
}) => {
  const {lt, gt, idx} = useScene();
  const cam = useCam();
  const t = gt;
  const centre = mode === 'dark' ? '#101214' : mode === 'surface' ? '#1b1f22' : '#15191c';
  const base = `radial-gradient(ellipse 85% 85% at ${focusX}% ${focusY}%, ${centre} 0%, #0d0f10 55%, ${C.bg} 100%)`;
  void lt; void idx;
  return (
    <div style={{position: 'absolute', inset: 0, background: base}}>
      {rays && mode !== 'plain' && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `translate(${cam.px * 0.3}px, 0)`}}>
          <defs>
            <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2f2f2" stopOpacity={0.13 * glow} />
              <stop offset="0.6" stopColor="#f2f2f2" stopOpacity={0.03 * glow} />
              <stop offset="1" stopColor="#f2f2f2" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const sway = Math.sin(t * 0.25 + i * 1.7) * 60;
            const x0 = 160 + i * 340 + sway;
            const wid = 70 + rnd(i + 5) * 120;
            const slant = 240 + Math.sin(t * 0.18 + i) * 60;
            return <polygon key={i} points={`${x0},-20 ${x0 + wid},-20 ${x0 + wid - slant + 160},${H} ${x0 - slant},${H}`} fill="url(#ray)" opacity={0.55 + 0.45 * Math.sin(t * 0.4 + i * 2.1) ** 2} />;
          })}
        </svg>
      )}
      {/* neve marinha em duas camadas de parallax */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {parts.map((p, i) => {
          const near = p.r > 3;
          const dep = near ? 1.4 : 0.35;
          const y = (((p.y - t * p.sp * (near ? 1.5 : 1)) % H) + H) % H;
          const x = ((p.x + t * p.dr + Math.sin(t * 0.5 + p.ph) * 18 + cam.px * dep) % W + W) % W;
          const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + p.ph);
          return <circle key={i} cx={x} cy={y} r={p.r} fill={C.white} opacity={p.o * tw * (near ? 0.8 : 0.55)} />;
        })}
      </svg>
    </div>
  );
};

/** Granulado + vinheta por cima de tudo */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = (frame * 97) % 256, oy = (frame * 53) % 256;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.075, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none'}} />
    </>
  );
};

// ---------------------------------------------------------------------------
// Texto na tela: pop de spring, saída rápida
// ---------------------------------------------------------------------------
export const parseMarkup = (s: string) =>
  s.split('|').map((line) => line.split(/(\*[^*]+\*)/g).filter(Boolean).map((seg) => (seg.startsWith('*') ? {t: seg.slice(1, -1), red: true} : {t: seg, red: false})));

export const shadowText = '0 4px 14px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,1)';

export const PopText: React.FC<{text: string; lt: number; dur: number; pos?: 't' | 'b' | 'c' | 'l'; size?: number; align?: 'center' | 'left'}> = ({
  text, lt, dur, pos = 'b', size = 84, align = 'center',
}) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame: lt * fps, fps, config: {damping: 11, stiffness: 190, mass: 0.7}, durationInFrames: 14});
  const exitP = clamp((lt - (dur - 0.18)) / 0.18);
  const sc = (0.8 + 0.2 * enter) * (1 - 0.1 * exitP);
  const op = clamp(lt / 0.06) * (1 - exitP);
  const lines = parseMarkup(text);
  const place: React.CSSProperties =
    pos === 't' ? {top: 110} : pos === 'c' ? {top: '50%', transform: 'translateY(-50%)'} : {bottom: 120};
  return (
    <div style={{position: 'absolute', left: 120, right: 120, display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', ...place, opacity: op, pointerEvents: 'none'}}>
      <div style={{transform: `scale(${sc})`, transformOrigin: align === 'center' ? '50% 100%' : '0% 100%', textAlign: align, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: 1, textTransform: 'uppercase'}}>
        {lines.map((ln, i) => (
          <div key={i} style={{whiteSpace: 'nowrap'}}>
            {ln.map((s, j) => (
              <span key={j} style={{color: s.red ? C.red : C.white, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: shadowText}}>{s.t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// pequenos utilitários de tipografia para componentes
export const Label: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({children, size = 40, color = C.white, weight = 800, style}) => (
  <div style={{fontFamily: FONT, fontWeight: weight, fontSize: size, color, textTransform: 'uppercase', letterSpacing: 1.5, whiteSpace: 'nowrap', WebkitTextStroke: '4px #000', paintOrder: 'stroke fill', ...style}}>{children}</div>
);

/** Etiqueta de animal: caixa preta, borda cinza, nome branco e medida vermelha */
export const Tag: React.FC<{name: string; measure?: string; x: number; y: number; appear?: number; anchor?: [number, number]}> = ({name, measure, x, y, appear = 0, anchor}) => {
  const {lt} = useScene();
  const k = clamp((lt - appear) / 0.25);
  return (
    <>
      {anchor && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: k}}>
          <line x1={x} y1={y} x2={anchor[0]} y2={anchor[1]} stroke={C.gray2} strokeWidth={2} />
          <circle cx={anchor[0]} cy={anchor[1]} r={6} fill={C.red} />
        </svg>
      )}
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * k})`, opacity: k, background: C.bg, border: `2px solid ${C.gray1}`, padding: '10px 22px', fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 2, color: C.white, whiteSpace: 'nowrap', display: 'flex', gap: 18}}>
        <span>{name}</span>
        {measure && <span style={{color: C.red}}>{measure}</span>}
      </div>
    </>
  );
};

export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; width?: number}> = ({x1, y1, x2, y2, p = 1, color = C.red, width = 14}) => {
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hs = width * 2.6;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * hs * 0.6} y2={ey - Math.sin(a) * hs * 0.6} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {p > 0.05 && <polygon points={`${ex},${ey} ${ex - Math.cos(a - 0.45) * hs},${ey - Math.sin(a - 0.45) * hs} ${ex - Math.cos(a + 0.45) * hs},${ey - Math.sin(a + 0.45) * hs}`} fill={color} />}
    </svg>
  );
};

/** Anéis de sonar / ondas */
export const Rings: React.FC<{x: number; y: number; t: number; color?: string; n?: number; max?: number; speed?: number}> = ({x, y, t, color = C.gray2, n = 4, max = 600, speed = 0.45}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: n}).map((_, i) => {
      const k = (t * speed + i / n) % 1;
      return <circle key={i} cx={x} cy={y} r={k * max} fill="none" stroke={color} strokeWidth={3} opacity={(1 - k) * 0.7} />;
    })}
  </svg>
);

export const SpeedLines: React.FC<{t: number; dir?: 1 | -1; y0?: number; y1?: number; op?: number}> = ({t, dir = 1, y0 = 200, y1 = 900, op = 0.35}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 16}).map((_, i) => {
      const y = y0 + rnd(i * 9 + 1) * (y1 - y0);
      const len = 160 + rnd(i * 5 + 2) * 380;
      const x = (((rnd(i * 3 + 7) * (W + 800) + dir * t * (1400 + rnd(i) * 800)) % (W + 800)) + (W + 800)) % (W + 800) - 400;
      return <line key={i} x1={x} y1={y} x2={x - dir * len} y2={y} stroke={C.white} strokeWidth={2 + rnd(i + 4) * 3} opacity={op * (0.4 + rnd(i + 8) * 0.6)} strokeLinecap="round" />;
    })}
  </svg>
);

export const lineW = (n: number) => n;
export const FPSC = FPS;
