import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {Animal, AnimalKind, Bird, Boat, Bus, Condo, ContainerShip, Crane, Gommone, Human, IceBlock, Owl, Panda} from './animals';
import {Arrow, Label, Layer, Rings, SpeedLines, Tag, useScene} from './fx';
import {MediaCard, FullBleedMedia} from './media';
import {C, FONT, H, W, clamp, ease, easeOut} from './theme';

export type Item = {
  k: string;
  x?: number; y?: number; w?: number; h?: number;
  vx?: number; vy?: number;
  flip?: boolean; glow?: boolean; amp?: number; freq?: number; phase?: number; tone?: number; pose?: number;
  d?: number;            // profundidade para parallax
  at?: number; out?: number;
  rot?: number; op?: number; bob?: number; bobf?: number;
  // genéricos
  text?: string; color?: string; size?: number; name?: string; measure?: string;
  x2?: number; y2?: number; dur?: number; n?: number; from?: number; to?: number; ax?: number; ay?: number;
  turn?: number;         // vira (flip suave) em t segundos
  scaleTo?: number;      // zoom próprio da peça ao longo da cena
  lines?: number; red?: boolean; dir?: 1 | -1;
};

const ANIMALS = ['orca', 'sperm', 'humpback', 'pilot', 'shark', 'seal', 'blue', 'dolphin', 'fish', 'greywhale'];
const RATIO: Record<string, number> = {humpback: 0.52};

const PopIn: React.FC<{at: number; out?: number; children: React.ReactNode; origin?: string}> = ({at, out, children, origin = '50% 50%'}) => {
  const {lt} = useScene();
  const {fps} = useVideoConfig();
  if (lt < at) return null;
  const sp = spring({frame: (lt - at) * fps, fps, config: {damping: 13, stiffness: 150, mass: 0.8}, durationInFrames: 16});
  const o = out !== undefined ? clamp((out - lt) / 0.2) : 1;
  if (o <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, opacity: clamp((lt - at) / 0.1) * o, transform: `scale(${0.85 + 0.15 * sp})`, transformOrigin: origin}}>{children}</div>;
};

const Wave: React.FC<{y: number; t: number; op?: number}> = ({y, t, op = 0.7}) => {
  let d = `M -50 ${y}`;
  for (let x = -50; x <= W + 50; x += 30) d += ` L ${x} ${y + Math.sin(x * 0.012 + t * 1.6) * 7 + Math.sin(x * 0.03 - t * 2.3) * 3}`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f2f2" stopOpacity={0.14} /><stop offset="1" stopColor="#f2f2f2" stopOpacity={0} /></linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050505" /><stop offset="1" stopColor="#1d2124" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={y} fill="url(#sky)" opacity={0.92} />
      <path d={d + ` L ${W + 50} ${y + 380} L -50 ${y + 380} Z`} fill="url(#wg)" />
      <path d={d} fill="none" stroke={C.gray2} strokeWidth={3} opacity={op} />
    </svg>
  );
};

export const Clock: React.FC<{w: number; p: number}> = ({w, p}) => (
  <svg width={w} height={w} viewBox="-100 -100 200 200" style={{overflow: 'visible'}}>
    <circle r={92} fill="#111" stroke={C.white} strokeWidth={5} />
    {Array.from({length: 12}).map((_, i) => <line key={i} x1={0} y1={-80} x2={0} y2={-70} stroke={C.gray2} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-52} stroke={C.white} strokeWidth={7} strokeLinecap="round" transform={`rotate(${p * 360})`} />
    <line x1={0} y1={0} x2={0} y2={-76} stroke={C.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${p * 360 * 12})`} />
    <circle r={7} fill={C.white} />
  </svg>
);

export const ItemView: React.FC<{it: Item}> = ({it}) => {
  const {lt, gt} = useScene();
  const at = it.at ?? 0;
  const k = it.k;
  const x0 = it.x ?? W / 2, y0 = it.y ?? H / 2;
  const tt = Math.max(0, lt - 0);
  const x = x0 + (it.vx ?? 0) * tt;
  const y = y0 + (it.vy ?? 0) * tt + Math.sin(gt * (it.bobf ?? 1.1) + (it.phase ?? 0) * 6) * (it.bob ?? 8);
  const w = it.w ?? 800;
  const flip = it.turn !== undefined ? (lt > it.turn ? !it.flip : !!it.flip) : it.flip;
  const dep = it.d ?? 1;
  const extraScale = it.scaleTo ? 1 + (it.scaleTo - 1) * clamp(lt / 6) : 1;

  const place = (node: React.ReactNode, hRatio = 0.4) => (
    <Layer depth={dep}>
      <PopIn at={at} out={it.out}>
        <div style={{position: 'absolute', left: x - w / 2, top: y - (w * hRatio) / 2, transform: `rotate(${it.rot ?? 0}deg) scale(${extraScale})`, opacity: it.op ?? 1, transformOrigin: '50% 50%'}}>{node}</div>
      </PopIn>
    </Layer>
  );

  if (ANIMALS.includes(k)) {
    // virada suave: gira o corpo ao inverter o flip
    const turnK = it.turn !== undefined ? easeOut((lt - it.turn) / 0.5) : 1;
    const squash = it.turn !== undefined && lt > it.turn && lt < it.turn + 0.5 ? 1 - 0.5 * Math.sin(Math.PI * turnK) : 1;
    return place(
      <div style={{transform: `scaleY(${squash})`}}>
        <Animal kind={k as AnimalKind} t={lt + (it.phase ?? 0) * 3} w={w} flip={flip} glow={it.glow} amp={it.amp ?? 1} freq={it.freq ?? 0.7} phase={it.phase ?? 0} tone={it.tone ?? 0.55} pose={it.pose ?? 0} />
      </div>,
      RATIO[k] ?? 0.4,
    );
  }
  switch (k) {
    case 'human': return place(<Human h={it.h ?? w} />, (it.h ?? w) / w);
    case 'bus': return place(<Bus w={w} />, 0.2);
    case 'panda': return place(<Panda w={w} />, 0.55);
    case 'boat': return place(<Boat w={w} />, 0.4);
    case 'gommone': return place(<Gommone w={w} />, 0.38);
    case 'ice': return place(<IceBlock w={w} />, 0.3);
    case 'crane': return place(<Crane h={w} />, 1);
    case 'ship': return place(<ContainerShip w={w} />, 0.3);
    case 'owl': return place(<Owl w={w} />, 1.25);
    case 'bird': return place(<Bird w={w} t={lt} phase={it.phase ?? 0} />, 0.5);
    case 'condo': return place(<Condo h={w} />, 1);
    case 'clock': {
      const p = ease(clamp((lt - at) / (it.dur ?? 3)));
      return place(<Clock w={w} p={p * (it.n ?? 0.5)} />, 1);
    }
    case 'qmark':
      return place(<div style={{fontFamily: FONT, fontWeight: 800, fontSize: w, lineHeight: 1, color: it.color ?? C.red, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', width: w, textAlign: 'center', transform: `rotate(${Math.sin(lt * 2) * 4}deg)`}}>{it.text ?? '?'}</div>, 1);
    case 'text':
      return place(<div style={{fontFamily: FONT, fontWeight: it.n ?? 800, fontSize: it.size ?? 48, color: it.color ?? C.white, whiteSpace: 'nowrap', letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: '5px #000', paintOrder: 'stroke fill', width: w, textAlign: 'center', textShadow: '0 4px 12px rgba(0,0,0,.8)'}}>{it.text}</div>, (it.size ?? 48) / w);
    case 'cross': {
      const p = easeOut((lt - at) / 0.3);
      return (
        <Layer depth={dep}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <line x1={x - w / 2} y1={y - w * 0.22} x2={x - w / 2 + w * p} y2={y - w * 0.22 + w * 0.44 * p} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
            {p > 0.6 && <line x1={x + w / 2} y1={y - w * 0.22} x2={x + w / 2 - w * (p - 0.6) / 0.4} y2={y - w * 0.22 + w * 0.44 * (p - 0.6) / 0.4} stroke={C.red} strokeWidth={22} strokeLinecap="round" />}
          </svg>
        </Layer>
      );
    }
    case 'strike': {
      const p = easeOut((lt - at) / 0.35);
      return (<Layer depth={dep}><svg width={W} height={H} style={{position: 'absolute', inset: 0}}><line x1={x - w / 2} y1={y} x2={x - w / 2 + w * p} y2={y} stroke={C.red} strokeWidth={20} strokeLinecap="round" /></svg></Layer>);
    }
    case 'arrow': {
      const p = easeOut((lt - at) / (it.dur ?? 0.5));
      return <Layer depth={dep}><Arrow x1={x} y1={y} x2={it.x2 ?? x + 300} y2={it.y2 ?? y} p={p} width={it.size ?? 14} color={it.color ?? C.red} /></Layer>;
    }
    case 'rings': return <Layer depth={dep}><Rings x={x} y={y} t={lt} max={w} n={it.n ?? 4} color={it.color ?? C.gray2} /></Layer>;
    case 'speed': return <SpeedLines t={lt} dir={it.dir ?? 1} y0={it.y ?? 200} y1={it.y2 ?? 900} op={it.op ?? 0.35} />;
    case 'tag':
      return <Tag name={it.name ?? ''} measure={it.measure} x={x} y={y} appear={at} anchor={it.ax !== undefined ? [it.ax, it.ay!] : undefined} />;
    case 'ruler': {
      const ppm = it.size ?? 116, nm = it.n ?? 10;
      const p = easeOut((lt - at) / 0.8);
      return (
        <Layer depth={dep}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <line x1={x} y1={y} x2={x + nm * ppm * p} y2={y} stroke={C.white} strokeWidth={4} />
            {Array.from({length: nm + 1}).map((_, i) => (i * ppm <= nm * ppm * p) && (
              <g key={i}><line x1={x + i * ppm} y1={y - 12} x2={x + i * ppm} y2={y + 12} stroke={C.white} strokeWidth={3} /><text x={x + i * ppm} y={y + 46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.gray2}>{i}</text></g>
            ))}
            <text x={x + nm * ppm + 30} y={y + 46} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.gray2}>M</text>
          </svg>
        </Layer>
      );
    }
    case 'bracket': {
      const p = easeOut((lt - at) / 0.7);
      return (
        <Layer depth={dep}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <path d={`M ${x} ${y + 14} V ${y} H ${x + w * p} V ${y + 14}`} fill="none" stroke={C.red} strokeWidth={8} />
          </svg>
          <div style={{position: 'absolute', left: x, width: w, top: y - 74, textAlign: 'center', opacity: p}}><Label size={46} color={C.red}>{it.text}</Label></div>
        </Layer>
      );
    }
    case 'water': return <Wave y={y} t={gt} />;
    case 'disc': {
      const p = easeOut((lt - at) / 0.5);
      return (<Layer depth={dep}><svg width={W} height={H} style={{position: 'absolute', inset: 0}}><circle cx={x} cy={y} r={w / 2 * p} fill="none" stroke={it.color ?? C.red} strokeWidth={8} opacity={it.op ?? 1} strokeDasharray={it.n ? '18 14' : undefined} /></svg></Layer>);
    }
    case 'pulse': {
      const q = (lt * 0.9 + (it.phase ?? 0)) % 1;
      return (<Layer depth={dep}><svg width={W} height={H} style={{position: 'absolute', inset: 0}}><circle cx={x} cy={y} r={w * (0.4 + q)} fill="none" stroke={C.red} strokeWidth={3} opacity={1 - q} /><circle cx={x} cy={y} r={w * 0.28} fill={C.red} /></svg></Layer>);
    }
    case 'bar': {
      const p = ease(clamp((lt - at) / (it.dur ?? 1.5)));
      const val = (it.from ?? 0) + ((it.to ?? 1) - (it.from ?? 0)) * p;
      const hh = it.h ?? 54;
      return (
        <Layer depth={dep}>
          <div style={{position: 'absolute', left: x - w / 2, top: y - hh / 2, width: w, height: hh, border: `3px solid ${C.gray2}`, background: '#0c0c0c'}}>
            <div style={{width: `${val * 100}%`, height: '100%', background: it.color ?? C.red}} />
          </div>
        </Layer>
      );
    }
    case 'shade': {
      return <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${it.op ?? 0.5})`}} />;
    }
    case 'floor': {
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0A0A" stopOpacity={0} /><stop offset="1" stopColor="#262626" stopOpacity={0.95} /></linearGradient></defs>
          <rect x={0} y={y} width={W} height={H - y} fill="url(#fl)" />
        </svg>
      );
    }
    case 'label': return <Layer depth={dep}><PopIn at={at} out={it.out}><div style={{position: 'absolute', left: x - 800, width: 1600, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}><Label size={it.size ?? 40} color={it.color ?? C.gray2} weight={it.n ?? 800}>{it.text}</Label></div></PopIn></Layer>;
    case 'media': return <MediaCard src={it.color} desc={it.text ?? ''} label={it.name} x={x} y={y} w={w} rot={it.rot ?? -2} d={it.d ?? 1.2} at={at} out={it.out} />;
    case 'full': return <FullBleedMedia src={it.color} desc={it.text ?? ''} />;
    default: return null;
  }
};

/** Cena genérica: lista de itens sobre fundo vivo */
export const ItemsScene: React.FC<{items: Item[]}> = ({items}) => (
  <>
    {items.map((it, i) => <ItemView key={i} it={it} />)}
  </>
);
