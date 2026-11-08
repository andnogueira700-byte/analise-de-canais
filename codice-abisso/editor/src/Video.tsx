import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {Background, Camera, Layer, Finish, PopText, SceneCtx, useScene} from './fx';
import {Animal} from './animals';
import {ItemsScene, ItemView, Item} from './shot';
import {Chapter, Cards, Counter, Daisy, EndScreen, Icons3, MapScene, Pie, Scale, Stamp, StudyCard, Timeline} from './widgets';
import {MediaFill} from './media';
import {SCENES, SceneDef, TEXTS} from './scenes';
import {C, FPS, W, H, clamp, ease, lerp} from './theme';

export const TOTAL_SECONDS = 608.84;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

export const sceneEnd = (i: number) => (i + 1 < SCENES.length ? SCENES[i + 1].t : TOTAL_SECONDS);
export const sceneAt = (t: number) => {
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++) if (SCENES[i].t <= t + 1e-6) idx = i;
  return idx;
};
const defaultTr = (i: number): NonNullable<SceneDef['tr']> => (i === 0 ? 'cut' : i % 11 === 4 ? 'flash' : i % 3 === 1 ? 'whip' : 'cut');
export const trOf = (i: number) => SCENES[i].tr ?? defaultTr(i);

const Items: React.FC<{items: Item[]}> = ({items}) => (
  <>
    {items.filter((i) => i.k !== 'stamp').map((it, i) => <ItemView key={i} it={it} />)}
    {items.some((i) => i.k === 'stamp') && <Stamp text="IN PERICOLO CRITICO" />}
  </>
);

const OpenScene: React.FC<{desc: string}> = ({desc}) => {
  const {lt} = useScene();
  const k = ease((lt - 1.9) / 1.0);
  const x = lerp(0, 1120, k), y = lerp(0, 200, k), w = lerp(W, 700, k), h = lerp(H, 394, k);
  return (
    <>
      <Camera>
        <Items items={[
          {k: 'orca', x: 500, y: 720, w: 900, d: 1.3, at: 2.0, glow: false} as Item,
          {k: 'text', text: 'CODICE ABISSO', x: 500, y: 330, w: 800, size: 64, color: C.white, at: 2.3} as Item,
          {k: 'bar', x: 500, y: 400, w: 300, h: 10, to: 1, from: 1, at: 2.5} as Item,
        ]} />
      </Camera>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', border: `${lerp(0, 3, k)}px solid ${C.white}`, boxShadow: k > 0 ? '0 22px 50px rgba(0,0,0,.8)' : 'none', transform: `rotate(${3 * k}deg)`}}>
        <MediaFill kind="video" desc={desc} zoom={1} />
      </div>
      {k > 0.8 && <div style={{position: 'absolute', left: 1130, top: 610, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.white, background: C.bg, border: `2px solid ${C.gray1}`, padding: '6px 18px'}}>ORCA IN CACCIA</div>}
    </>
  );
};

const SceneBody: React.FC<{s: SceneDef}> = ({s}) => {
  const p = s.p ?? {};
  switch (s.k) {
    case 'open': return <OpenScene desc={p.desc} />;
    case 'items': return <Items items={s.items ?? []} />;
    case 'map': return <MapScene {...p} />;
    case 'counter': return <Counter {...p} />;
    case 'timeline': return <Timeline {...p} />;
    case 'study': return <StudyCard {...p} />;
    case 'scale': return <Scale {...p} />;
    case 'daisy': return <Daisy {...p} />;
    case 'pie': return <Pie {...p} />;
    case 'cards': return <Cards {...p} />;
    case 'chapter': return <Chapter {...p} />;
    case 'icons': return <Icons3 {...p} />;
    case 'end': return <EndScreen />;
    default: return null;
  }
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = sceneAt(t);
  const s = SCENES[idx];
  const lt = t - s.t;
  const dur = sceneEnd(idx) - s.t;
  const tr = trOf(idx);
  const isFull = s.k === 'items' && (s.items ?? []).some((i) => i.k === 'full');
  const bg = s.bg ?? {};
  const whip = tr === 'whip' ? clamp(1 - lt / 0.28) : 0;
  const flash = tr === 'flash' ? clamp(1 - lt / 0.2) : 0;
  const dip = tr === 'dip' ? clamp(1 - lt / 0.35) : 0;
  const ctx = {lt, dur, idx, gt: t, zoom: s.k === 'map' ? 0.03 : 0, follow: s.follow};
  const noBg = s.k === 'map' || s.k === 'open';
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <SceneCtx.Provider value={ctx}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${whip * whip * 420}px)`, opacity: 1 - dip}}>
          {!isFull && !noBg && <Background mode={bg.mode ?? 'deep'} rays={bg.rays ?? true} glow={bg.fx ?? 1} />}
          {s.k === 'map' || s.k === 'open' ? <Background mode="plain" rays={false} /> : null}
          {isFull ? <SceneBody s={s} /> : s.k === 'open' ? <SceneBody s={s} /> : <Camera>{s.k === 'items' || s.k === 'map' ? <SceneBody s={s} /> : <Layer depth={1.6}><SceneBody s={s} /></Layer>}</Camera>}
        </div>
        {TEXTS.filter((x) => t >= x.t && t < x.t + x.d).map((x, i) => (
          <PopText key={i} text={x.s} lt={t - x.t} dur={x.d} pos={x.pos ?? 'b'} size={x.size ?? 84} />
        ))}
        <Finish />
        {whip > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(242,242,242,0) 30%, rgba(242,242,242,${whip * 0.22}) 100%)`}} />}
        {flash > 0 && <div style={{position: 'absolute', inset: 0, background: C.white, opacity: flash * 0.55}} />}
      </SceneCtx.Provider>
      <Audio src={staticFile('narrazione.mp3')} />
    </AbsoluteFill>
  );
};
void Animal;
