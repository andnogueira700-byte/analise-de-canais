import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {Animal, AnimalKind, Human} from './animals';
import {GEO, PLACES} from './geo';
import {Arrow, Label, shadowText, useScene} from './fx';
import {C, FONT, H, W, clamp, ease, easeOut, lerp} from './theme';
import {ItemView, Item} from './shot';

// ------------------------------ MAPA RADAR ---------------------------------
export type MapP = {
  from: [number, number, number]; to?: [number, number, number]; // lon, lat, px/grau
  pts?: {p: string | [number, number]; label?: string; red?: boolean; at?: number; white?: boolean}[];
  routes?: {a: string; b: string; at?: number; dur?: number}[];
  names?: {p: string | [number, number]; text: string; at?: number}[];
  tracks?: {p: string; n?: number}[];
  title?: string; items?: Item[];
};
const pos = (p: string | [number, number]): [number, number] => (typeof p === 'string' ? PLACES[p] : p);

export const MapScene: React.FC<MapP> = ({from, to, pts = [], routes = [], names = [], tracks = [], title, items = []}) => {
  const {lt, dur} = useScene();
  const k = ease(lt / Math.max(dur, 0.1));
  const tgt = to ?? from;
  const lon0 = lerp(from[0], tgt[0], k), lat0 = lerp(from[1], tgt[1], k);
  const S = Math.exp(lerp(Math.log(from[2]), Math.log(tgt[2]), k));
  const P = (lon: number, lat: number): [number, number] => [W / 2 + (lon - lon0) * S, H / 2 - (lat - lat0) * S];
  const poly = (pl: [number, number][]) => pl.map(([a, b]) => P(a, b).join(',')).join(' ');
  const step = S > 40 ? 1 : S > 14 ? 5 : S > 7 ? 10 : 20;
  const lines: React.ReactNode[] = [];
  for (let lo = Math.floor((lon0 - W / 2 / S) / step) * step; lo < lon0 + W / 2 / S; lo += step) lines.push(<line key={'o' + lo} x1={P(lo, 0)[0]} y1={0} x2={P(lo, 0)[0]} y2={H} stroke={C.gray1} strokeWidth={1} opacity={0.5} />);
  for (let la = Math.floor((lat0 - H / 2 / S) / step) * step; la < lat0 + H / 2 / S; la += step) lines.push(<line key={'a' + la} x1={0} y1={P(0, la)[1]} x2={W} y2={P(0, la)[1]} stroke={C.gray1} strokeWidth={1} opacity={0.5} />);
  const sweep = (lt * 140) % (W + 400) - 200;
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <rect width={W} height={H} fill="#0d1012" opacity={0.9} />
        {lines}
        {Object.entries(GEO).map(([n, pl]) => <polygon key={n} points={poly(pl)} fill="#1b1d1e" stroke={C.gray2} strokeWidth={2.2} strokeLinejoin="round" opacity={0.95} />)}
        <defs><linearGradient id="sw" x1="0" x2="1"><stop offset="0" stopColor="#f2f2f2" stopOpacity={0} /><stop offset="1" stopColor="#f2f2f2" stopOpacity={0.12} /></linearGradient></defs>
        <rect x={sweep - 240} y={0} width={240} height={H} fill="url(#sw)" />
        <line x1={sweep} y1={0} x2={sweep} y2={H} stroke={C.gray2} strokeWidth={2} opacity={0.5} />
        {routes.map((r, i) => {
          const a = P(...pos(r.a)), b = P(...pos(r.b));
          const p = easeOut((lt - (r.at ?? 0)) / (r.dur ?? 2));
          if (p <= 0) return null;
          const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 120 - Math.abs(a[0] - b[0]) * 0.1;
          const ex = (1 - p) * (1 - p) * a[0] + 2 * (1 - p) * p * mx + p * p * b[0];
          const ey = (1 - p) * (1 - p) * a[1] + 2 * (1 - p) * p * my + p * p * b[1];
          return (
            <g key={i}>
              <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} fill="none" stroke={C.white} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.7} />
              <circle cx={ex} cy={ey} r={14} fill={C.red} />
            </g>
          );
        })}
        {tracks.map((tr, i) => {
          const c = P(...pos(tr.p));
          return Array.from({length: tr.n ?? 6}).map((_, j) => {
            const a = (j / (tr.n ?? 6)) * Math.PI * 2 + 0.4, p = easeOut((lt - 0.2 - j * 0.1) / 2.2);
            return <line key={`${i}-${j}`} x1={c[0]} y1={c[1]} x2={c[0] + Math.cos(a) * 340 * p} y2={c[1] + Math.sin(a) * 340 * p} stroke={C.white} strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />;
          });
        })}
        {pts.map((pt, i) => {
          if (lt < (pt.at ?? 0)) return null;
          const c = P(...pos(pt.p));
          const q = ((lt - (pt.at ?? 0)) * 0.9 + i * 0.3) % 1;
          const col = pt.red === false ? C.white : C.red;
          return (
            <g key={i}>
              <circle cx={c[0]} cy={c[1]} r={14 + q * 60} fill="none" stroke={col} strokeWidth={3} opacity={1 - q} />
              <circle cx={c[0]} cy={c[1]} r={12} fill={col} />
              {pt.label && <text x={c[0] + 26} y={c[1] + 10} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.white} stroke="#000" strokeWidth={6} paintOrder="stroke" letterSpacing={2}>{pt.label}</text>}
            </g>
          );
        })}
        {names.map((n, i) => {
          if (lt < (n.at ?? 0)) return null;
          const c = P(...pos(n.p));
          return <text key={i} x={c[0]} y={c[1]} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.gray2} stroke="#000" strokeWidth={5} paintOrder="stroke" letterSpacing={4}>{n.text}</text>;
        })}
      </svg>
      {title && <div style={{position: 'absolute', left: 120, top: 980, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.gray2}}>{title}</div>}
      {items.map((it, i) => <ItemView key={i} it={it} />)}
    </>
  );
};

// ------------------------------ CARTÃO DE ESTUDO ---------------------------
export const StudyCard: React.FC<{big: string; sub?: string; author: string; year: string; journal?: string; key1?: string; items?: Item[]}> = ({big, sub, author, year, journal, key1, items = []}) => {
  const {lt} = useScene();
  const {fps} = useVideoConfig();
  const sp = spring({frame: lt * fps, fps, config: {damping: 12, stiffness: 120}, durationInFrames: 20});
  const ul = easeOut((lt - 0.7) / 0.6);
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - 600, top: H / 2 - 290, width: 1200, height: 580, background: C.bg, border: `2px solid ${C.gray2}`, boxShadow: '0 30px 80px rgba(0,0,0,.8)', transform: `scale(${0.85 + 0.15 * sp}) rotate(${-1 + lt * 0.2}deg)`, opacity: clamp(lt / 0.1), padding: '48px 64px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: C.gray2}}>STUDIO</div>
        <div style={{height: 3, width: 140 * ul, background: C.red, marginTop: 14}} />
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 96, color: C.white, marginTop: 44, lineHeight: 1.05, textTransform: 'uppercase'}}>{big}</div>
        {sub && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.red, marginTop: 10, textTransform: 'uppercase'}}>{sub}</div>}
        <div style={{position: 'absolute', left: 64, bottom: 44, fontFamily: FONT, fontWeight: 500, fontSize: 34, color: C.gray2, lineHeight: 1.4}}>
          {author} · {year}<br />{journal}
        </div>
        {key1 && <div style={{position: 'absolute', right: 64, bottom: 44, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.red}}>{key1}</div>}
      </div>
      {items.map((it, i) => <ItemView key={i} it={it} />)}
    </>
  );
};

// ------------------------------ CONTADOR -----------------------------------
export const Counter: React.FC<{shiftX?: number; from?: number; to: number; unit?: string; label?: string; dur?: number; items?: Item[]; size?: number; dec?: number; sep?: boolean}> = ({from = 0, to, unit, label, dur = 1.6, items = [], size = 260, dec = 0, sep, shiftX = 0}) => {
  const {lt} = useScene();
  const v = lerp(from, to, easeOut(lt / dur));
  let s = v.toFixed(dec);
  if (sep) s = Math.round(v).toLocaleString('it-IT');
  const pop = 1 + 0.06 * Math.max(0, 1 - (lt - dur) * 4) * (lt > dur ? 1 : 0);
  return (
    <>
      {items.map((it, i) => <ItemView key={i} it={it} />)}
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateX(${shiftX}px) scale(${pop})`}}>
        {label && <Label size={44} color={C.gray2} weight={800}>{label}</Label>}
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, textShadow: shadowText}}>
          <span style={{color: C.white, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>{s}</span>
          {unit && <span style={{color: C.red, fontSize: size * 0.36, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>{unit}</span>}
        </div>
      </div>
    </>
  );
};

// ------------------------------ LINHA DO TEMPO -----------------------------
export const Timeline: React.FC<{from: number; to: number; mark: number; marks?: {y: number; label: string}[]; big?: string; items?: Item[]}> = ({from, to, mark, marks = [], big, items = []}) => {
  const {lt} = useScene();
  const x = (y: number) => 180 + ((y - from) / (to - from)) * (W - 360);
  const p = easeOut(lt / 1.6);
  const cur = lerp(from, mark, p);
  const ticks = [];
  for (let y = from; y <= to; y++) ticks.push(y);
  return (
    <>
      {items.map((it, i) => <ItemView key={i} it={it} />)}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={150} y1={620} x2={x(cur)} y2={620} stroke={C.white} strokeWidth={5} />
        <line x1={x(cur)} y1={620} x2={W - 150} y2={620} stroke={C.gray1} strokeWidth={5} />
        {ticks.map((y) => (
          <g key={y}>
            <line x1={x(y)} y1={600} x2={x(y)} y2={640} stroke={y === mark ? C.red : C.gray2} strokeWidth={y === mark ? 6 : 3} />
            <text x={x(y)} y={690} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={y === mark ? 50 : 34} fill={y === mark ? C.red : C.gray2}>{y}</text>
          </g>
        ))}
        {marks.map((m, i) => (<g key={i}><circle cx={x(m.y)} cy={620} r={10} fill={C.white} /><text x={x(m.y)} y={570} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.white}>{m.label}</text></g>))}
        <circle cx={x(cur)} cy={620} r={20} fill={C.red} />
        <polygon points={`${x(cur)},585 ${x(cur) - 16},555 ${x(cur) + 16},555`} fill={C.red} />
      </svg>
      {big && <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 230, color: C.white, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', opacity: clamp((lt - 0.6) / 0.3)}}>{big}</div>}
    </>
  );
};

// ------------------------------ MARGHERITA ---------------------------------
const SpermTop: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.3} viewBox="0 0 300 90" style={{overflow: 'visible'}}>
    <path d="M 8 45 C 30 20 70 18 120 20 L 270 12 C 292 12 296 30 296 45 C 296 60 292 78 270 78 L 120 70 C 70 72 30 70 8 45 Z" fill="#555" stroke="rgba(242,242,242,.6)" strokeWidth={2} />
    <path d="M 8 45 L -26 18 L -10 40 L -10 50 L -26 72 Z" fill="#4a4a4a" stroke="rgba(242,242,242,.5)" strokeWidth={2} />
    <path d="M 130 70 L 160 92 L 170 72 Z M 130 20 L 160 -2 L 170 18 Z" fill="#4a4a4a" />
  </svg>
);
const OrcaTop: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.3} viewBox="0 0 300 90" style={{overflow: 'visible'}}>
    <path d="M 20 45 C 60 28 130 24 200 28 C 250 30 285 38 298 45 C 285 52 250 60 200 62 C 130 66 60 62 20 45 Z" fill="#303030" stroke="rgba(242,242,242,.7)" strokeWidth={2} />
    <path d="M 20 45 L -20 22 L -4 44 L -20 68 Z" fill="#303030" stroke="rgba(242,242,242,.6)" strokeWidth={2} />
    <path d="M 190 28 L 215 0 L 225 30 Z M 190 62 L 215 90 L 225 60 Z" fill="#303030" stroke="rgba(242,242,242,.6)" strokeWidth={2} />
    <ellipse cx={262} cy={37} rx={9} ry={4} fill={C.white} />
  </svg>
);

export const Daisy: React.FC<{n?: number; orcas?: number; rescue?: boolean; items?: Item[]}> = ({n = 8, orcas = 5, rescue, items = []}) => {
  const {lt, gt} = useScene();
  const cx = W / 2, cy = 610, R = 105;
  const grow = easeOut(lt / 0.9);
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R + 320} fill="none" stroke={C.gray1} strokeWidth={2} strokeDasharray="6 10" />
      </svg>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + gt * 0.05;
        let r = R * grow;
        let extra = 0;
        if (rescue && i === 0) { const q = Math.sin(clamp(lt / 4) * Math.PI); extra = q * 330; }
        const rr = r + 140 + extra;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        return (
          <div key={i} style={{position: 'absolute', left: x - 150, top: y - 45, transform: `rotate(${(a * 180) / Math.PI + 180}deg)`}}>
            <SpermTop w={300} />
          </div>
        );
      })}
      {Array.from({length: orcas}).map((_, i) => {
        const a = -(i / orcas) * Math.PI * 2 - gt * 0.35;
        const rr = 520 + Math.sin(gt * 1.2 + i) * 28;
        const x = cx + Math.cos(a) * rr * 1.18, y = cy + Math.sin(a) * rr * 0.78;
        return (
          <div key={i} style={{position: 'absolute', left: x - 125, top: y - 37, transform: `rotate(${(a * 180) / Math.PI - 90}deg)`, opacity: clamp(lt / 0.5)}}>
            <OrcaTop w={250} />
          </div>
        );
      })}
      {items.map((it, i) => <ItemView key={i} it={it} />)}
    </>
  );
};

// ------------------------------ BALANÇA ------------------------------------
export const Scale: React.FC<{left: {k?: AnimalKind; n?: number; text?: string; sub?: string; w?: number}; right: {k?: AnimalKind; n?: number; text?: string; sub?: string; w?: number}; tilt: number; items?: Item[]}> = ({left, right, tilt, items = []}) => {
  const {lt} = useScene();
  const ang = tilt * easeOut((lt - 0.6) / 1.4) + Math.sin(lt * 1.5) * 0.6;
  const L = 520, cx = W / 2, cy = 330;
  const a = (ang * Math.PI) / 180;
  const lx = cx - Math.cos(a) * L, ly = cy - Math.sin(a) * L, rx = cx + Math.cos(a) * L, ry = cy + Math.sin(a) * L;
  const pan = (x: number, y: number, side: typeof left) => (
    <g>
      <line x1={x} y1={y} x2={x - 180} y2={y + 250} stroke={C.gray2} strokeWidth={3} /><line x1={x} y1={y} x2={x + 180} y2={y + 250} stroke={C.gray2} strokeWidth={3} />
      <path d={`M ${x - 230} ${y + 250} L ${x + 230} ${y + 250} L ${x + 180} ${y + 285} L ${x - 180} ${y + 285} Z`} fill={C.gray1} stroke={C.white} strokeWidth={3} />
    </g>
  );
  const sideView = (x: number, y: number, side: typeof left) => (
    <div style={{position: 'absolute', left: x - 300, top: y + 250 - (side.k ? 190 : 120), width: 600, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap', height: side.k ? 190 : 120, gap: 6}}>
      {side.k && Array.from({length: side.n ?? 1}).map((_, i) => (
        <div key={i} style={{marginBottom: (side.n ?? 1) > 1 ? 0 : 0, marginLeft: (side.n ?? 1) > 1 ? -8 : 0}}>
          <Animal kind={side.k!} t={lt + i * 0.3} w={side.w ?? 300} amp={0.4} />
        </div>
      ))}
      {side.text && <Label size={62} color={C.white} style={{alignSelf: 'center'}}>{side.text}</Label>}
    </div>
  );
  return (
    <>
      {items.map((it, i) => <ItemView key={i} it={it} />)}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <polygon points={`${cx},${cy} ${cx - 40},${cy + 560} ${cx + 40},${cy + 560}`} fill="#1a1a1a" stroke={C.gray2} strokeWidth={3} />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.white} strokeWidth={14} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={24} fill={C.red} />
        {pan(lx, ly, left)}{pan(rx, ry, right)}
      </svg>
      {sideView(lx, ly, left)}
      {sideView(rx, ry, right)}
      {left.sub && <div style={{position: 'absolute', left: lx - 300, width: 600, top: ly + 310, textAlign: 'center'}}><Label size={46} color={C.red}>{left.sub}</Label></div>}
      {right.sub && <div style={{position: 'absolute', left: rx - 300, width: 600, top: ry + 310, textAlign: 'center'}}><Label size={46} color={C.red}>{right.sub}</Label></div>}
    </>
  );
};

// ------------------------------ PIZZA --------------------------------------
export const Pie: React.FC<{pct: number; hi?: 'small' | 'big'; labelSmall?: string; labelBig?: string; items?: Item[]}> = ({pct, hi, labelSmall = 'MEGATTERE', labelBig = 'ALTRI ANIMALI', items = []}) => {
  const {lt} = useScene();
  const p = easeOut(lt / 1.2);
  const r = 280, cx = W / 2 - 220, cy = H / 2;
  const a1 = (pct / 100) * 360 * p;
  const arc = (a0: number, a: number) => {
    const s = ((a0 - 90) * Math.PI) / 180, e = ((a0 + a - 90) * Math.PI) / 180;
    return `M ${cx} ${cy} L ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)} Z`;
  };
  const big = (360 - (pct / 100) * 360) * p;
  const mid = ((pct / 100) * 360) / 2 - 90;
  return (
    <>
      {items.map((it, i) => <ItemView key={i} it={it} />)}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={arc(a1, big)} fill={hi === 'big' ? '#8a8a8a' : '#4a4a4a'} stroke={C.bg} strokeWidth={6} transform={hi === 'big' ? `translate(30 30)` : ''} />
        <path d={arc(0, a1)} fill={C.red} stroke={C.bg} strokeWidth={6} transform={`translate(${hi === 'small' ? Math.cos((mid * Math.PI) / 180) * 26 : 0} ${hi === 'small' ? Math.sin((mid * Math.PI) / 180) * 26 : 0})`} />
      </svg>
      <div style={{position: 'absolute', left: cx + r + 90, top: cy - 170, display: 'flex', flexDirection: 'column', gap: 40}}>
        <div><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 190, color: C.red, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', lineHeight: 1}}>{pct}%</div><Label size={38} color={C.gray2}>{labelSmall}</Label></div>
        <div style={{opacity: clamp((lt - 0.7) / 0.3)}}><div style={{fontFamily: FONT, fontWeight: 800, fontSize: 190, color: C.white, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', lineHeight: 1}}>{100 - pct}%</div><Label size={38} color={C.gray2}>{labelBig}</Label></div>
      </div>
    </>
  );
};

// ------------------------------ CARTAS 03/02/01 ----------------------------
export const Cards: React.FC<{reveal: 3 | 2 | 1; animal: AnimalKind; name: string}> = ({reveal, animal, name}) => {
  const {lt} = useScene();
  const nums: (3 | 2 | 1)[] = [3, 2, 1];
  const col = {3: C.gray1, 2: C.gray2, 1: C.red};
  const flip = easeOut((lt - 0.1) / 0.4);
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
      {nums.map((n, i) => {
        const isR = n === reveal;
        const x = W / 2 + (i - 1) * 520, y = H / 2 + (isR ? -20 : 20) + Math.sin(lt * 1.5 + i) * 8;
        const rot = isR ? 180 * flip : 0;
        const faceUp = rot > 90;
        const dim = !isR && (n > reveal);
        return (
          <div key={n} style={{position: 'absolute', left: x - 215, top: y - 320, width: 430, height: 640, transform: `scale(${isR ? 1 + 0.12 * flip : 0.9}) rotateY(${rot}deg) translateY(${(1 - easeOut(lt / 0.5)) * 400}px)`, opacity: dim ? 0.3 : 1, transformStyle: 'preserve-3d'}}>
            <div style={{position: 'absolute', inset: 0, background: C.bg, border: `3px solid ${C.white}`, boxShadow: '0 20px 60px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', fontFamily: FONT, fontWeight: 800, fontSize: 260, color: col[n]}}>
              0{n}
            </div>
            <div style={{position: 'absolute', inset: 0, background: '#141414', border: `3px solid ${C.white}`, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', overflow: 'hidden'}}>
              {faceUp && (
                <div style={{position: 'absolute', left: 15, top: 220, width: 400}}>
                  <Animal kind={animal} t={lt} w={400} glow />
                </div>
              )}
              <div style={{position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: 3}}>{name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------ CARTELA DE CAPÍTULO ------------------------
export const Chapter: React.FC<{num: string; title: string; animal: AnimalKind}> = ({num, title, animal}) => {
  const {lt, dur} = useScene();
  const fade = clamp(lt / 0.3) * clamp((dur - lt) / 0.3);
  const ul = easeOut((lt - 0.5) / 0.6);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      <div style={{position: 'absolute', right: -80 + (1 - easeOut(lt / 1)) * 200, top: 330, opacity: 0.55}}><Animal kind={animal} t={lt} w={1100} tone={0.3} /></div>
      <div style={{position: 'absolute', left: 140, top: 340}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 48, color: C.red, letterSpacing: 6}}>{num}</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 118, color: C.white, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', lineHeight: 1.1, marginTop: 14}}>{title}</div>
        <div style={{height: 10, width: 420 * ul, background: C.red, marginTop: 24}} />
      </div>
    </div>
  );
};

// ------------------------------ ÍCONES (3 itens) ---------------------------
export const Icons3: React.FC<{labels: string[]; times: number[]}> = ({labels, times}) => {
  const {lt} = useScene();
  const {fps} = useVideoConfig();
  const icon = (i: number) => {
    const s = {fill: 'none', stroke: C.white, strokeWidth: 6, strokeLinejoin: 'round' as const};
    if (i === 0) return <g {...s}><rect x={10} y={44} width={140} height={26} /><path d="M 30 44 v 12 M 60 44 v 12 M 90 44 v 12 M 120 44 v 12" /></g>;
    if (i === 1) return <g {...s}>{[[40, 40], [110, 40], [75, 80], [20, 90], [130, 90]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={14} />)}</g>;
    return <g {...s}><path d="M 20 100 L 40 50 L 80 30 L 125 55 L 140 100 Z" /><path d="M 60 100 L 70 70 L 100 80" /></g>;
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {labels.map((l, i) => {
        const at = times[i];
        if (lt < at) return null;
        const sp = spring({frame: (lt - at) * fps, fps, config: {damping: 11, stiffness: 180}, durationInFrames: 14});
        return (
          <div key={i} style={{position: 'absolute', left: W / 2 + (i - 1) * 560 - 200, top: 300, width: 400, textAlign: 'center', transform: `scale(${0.7 + 0.3 * sp})`, opacity: clamp((lt - at) / 0.1)}}>
            <svg width={300} height={225} viewBox="0 0 160 120" style={{overflow: 'visible'}}>{icon(i)}</svg>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: i === 2 ? C.red : C.white, marginTop: 10, letterSpacing: 2}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------ CARIMBO ------------------------------------
export const Stamp: React.FC<{text: string; at?: number}> = ({text, at = 0.3}) => {
  const {lt} = useScene();
  const k = easeOut((lt - at) / 0.25);
  if (lt < at) return null;
  const shake = lt < at + 0.4 ? Math.sin(lt * 90) * 4 * (1 - (lt - at) / 0.4) : 0;
  return (
    <div style={{position: 'absolute', left: W / 2, top: 380, transform: `translate(-50%,-50%) rotate(-8deg) scale(${2.2 - 1.2 * k}) translate(${shake}px,${shake}px)`, opacity: k, border: `10px solid ${C.red}`, color: C.red, fontFamily: FONT, fontWeight: 800, fontSize: 110, padding: '10px 40px', letterSpacing: 6, background: 'rgba(10,10,10,0.55)', whiteSpace: 'nowrap'}}>{text}</div>
  );
};

// ------------------------------ TELA FINAL ---------------------------------
export const EndScreen: React.FC = () => {
  const {lt} = useScene();
  const o = clamp(lt / 1.5);
  const slot = (x: number, label: string) => (
    <div style={{position: 'absolute', left: x, top: 250, width: 590, height: 332, border: `3px dashed ${C.gray1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 28, letterSpacing: 4, color: C.gray1, opacity: o}}>{label}</div>
  );
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={0.18 * o} transform={`translate(${W / 2} ${H / 2 + 220})`}>
          <ellipse rx={150} ry={64} fill="none" stroke={C.gray2} strokeWidth={6} />
          <ellipse rx={20 + Math.sin(lt) * 2} ry={56} fill={C.gray1} />
        </g>
      </svg>
      {slot(120, 'VIDEO')}{slot(W - 710, 'VIDEO')}
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: FONT, fontWeight: 300, fontSize: 56, color: C.gray2, letterSpacing: 10, opacity: o}}>ISCRIVITI</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, fontWeight: 300, fontSize: 40, color: C.gray2, letterSpacing: 12, opacity: clamp((lt - 1.5) / 1)}}>LA VITA ESTREMA, SPIEGATA.</div>
    </div>
  );
};
void Arrow; void Human; void lerp;
