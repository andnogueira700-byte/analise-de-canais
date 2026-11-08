import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {C, FONT, H, W, clamp, easeOut} from './theme';
import {Layer, useScene, Label} from './fx';

const isVideo = (s: string) => /\.(mp4|mov|webm)$/i.test(s);

const Cam: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s * 0.8} viewBox="0 0 100 80" fill="none" stroke={C.gray2} strokeWidth={4} strokeLinejoin="round">
    <path d="M 10 22 H 28 L 34 12 H 66 L 72 22 H 90 V 70 H 10 Z" />
    <circle cx={50} cy={46} r={16} />
    <circle cx={50} cy={46} r={6} fill={C.gray2} />
  </svg>
);

/** Conteúdo: mídia real (src) ou placeholder de storyboard */
export const MediaFill: React.FC<{src?: string; desc: string; zoom?: number; kind?: 'foto' | 'video'}> = ({src, desc, zoom = 1, kind = 'foto'}) => {
  if (src) {
    const url = staticFile(`assets/${src}`);
    return isVideo(src)
      ? <OffthreadVideo src={url} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
      : <Img src={url} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />;
  }
  return (
    <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'repeating-linear-gradient(45deg,#1b1b1b 0 14px,#212121 14px 28px)'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(179,179,179,0.10), rgba(0,0,0,0.55))'}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, transform: `scale(${zoom})`}}>
        <Cam s={110} />
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.gray2, textAlign: 'center', textTransform: 'uppercase', padding: '0 70px', lineHeight: 1.25}}>
          {kind === 'video' ? 'VIDEO REALE' : 'FOTO REALE'}: {desc}
        </div>
      </div>
    </div>
  );
};

/** Cartão com foto/vídeo real: moldura fina, sombra, rotação leve, parallax, etiqueta */
export const MediaCard: React.FC<{src?: string; desc: string; label?: string; x: number; y: number; w?: number; rot?: number; d?: number; at?: number; out?: number}> = ({
  src, desc, label, x, y, w = 760, rot = -2, d = 1.2, at = 0, out,
}) => {
  const {lt} = useScene();
  if (lt < at) return null;
  const k = easeOut((lt - at) / 0.45);
  const o = out !== undefined ? clamp((out - lt) / 0.2) : 1;
  const h = w * 9 / 16;
  y = Math.max(y, 215 + h / 2);
  const drift = 0;
  return (
    <Layer depth={d}>
      <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, opacity: o * clamp((lt - at) / 0.12), transform: `translateY(${(1 - k) * 60}px) rotate(${rot + drift}deg) scale(${0.9 + 0.1 * k})`}}>
        <div style={{width: w, height: h, border: `3px solid ${C.white}`, boxShadow: '0 22px 50px rgba(0,0,0,0.75)', overflow: 'hidden', background: '#111'}}>
          <MediaFill src={src} desc={desc} />
        </div>
        {label && (
          <div style={{marginTop: 14, fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.white, background: C.bg, border: `2px solid ${C.gray1}`, display: 'inline-block', padding: '6px 18px', textTransform: 'uppercase'}}>{label}</div>
        )}
      </div>
    </Layer>
  );
};

export const FullBleedMedia: React.FC<{src?: string; desc: string}> = ({src, desc}) => {
  const {lt, dur} = useScene();
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <MediaFill kind="video" src={src} desc={desc} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 35%)'}} />
    </div>
  );
};
void H; void W; void Label;
