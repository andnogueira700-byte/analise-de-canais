import React from 'react';
import {C} from './theme';

/**
 * Cada animal é desenhado UMA vez, de perfil, olhando para a DIREITA,
 * num viewBox 1000 x (400|480). A cauda é um grupo separado que gira em torno
 * do pedúnculo (ondulação de nado). Reaproveitado em todas as cenas.
 */

export type AnimalKind =
  | 'orca' | 'sperm' | 'humpback' | 'pilot' | 'shark' | 'seal' | 'blue' | 'dolphin' | 'fish' | 'greywhale';

export type AnimalProps = {
  kind: AnimalKind;
  t: number;            // tempo em segundos (anima a cauda)
  w?: number;           // largura em px
  flip?: boolean;       // olhar para a esquerda
  glow?: boolean;       // olho vermelho
  tone?: number;        // 0..1 mais claro/escuro
  amp?: number;         // amplitude da ondulação
  freq?: number;        // Hz
  phase?: number;
  opacity?: number;
  pose?: number;        // inclinação extra (graus)
  style?: React.CSSProperties;
};

const OUT = 'rgba(242,242,242,0.55)';

// ----- nadadeira caudal horizontal (orca / capodoglio / megattera ...) ------
const flukePath = (cx: number, cy: number, span: number, depth: number, notch = 10, serr = false) => {
  // lobo superior; espelhado para o inferior em torno de cy
  const up: [number, number][] = [
    [cx, cy - 4],
    [cx - depth * 0.35, cy - span * 0.5],
    [cx - depth * 0.95, cy - span],
  ];
  const tipX = cx - depth * 1.05;
  const top = `M ${cx} ${cy - 3} C ${cx - depth * 0.1} ${cy - span * 0.38}, ${cx - depth * 0.55} ${cy - span * 0.85}, ${tipX} ${cy - span}` +
    (serr
      ? ` L ${tipX + 22} ${cy - span * 0.8} L ${tipX + 8} ${cy - span * 0.68} L ${tipX + 36} ${cy - span * 0.52} L ${tipX + 30} ${cy - span * 0.35}`
      : ` C ${tipX + depth * 0.5} ${cy - span * 0.72}, ${tipX + depth * 0.7} ${cy - span * 0.4}, ${cx - depth * 0.62} ${cy - notch}`) +
    ` L ${cx - depth * 0.62 + 6} ${cy - notch * 0.3}`;
  const bot = ` L ${cx - depth * 0.62 + 6} ${cy + notch * 0.3}` +
    (serr
      ? ` L ${tipX + 30} ${cy + span * 0.35} L ${tipX + 36} ${cy + span * 0.52} L ${tipX + 8} ${cy + span * 0.68} L ${tipX + 22} ${cy + span * 0.8} L ${tipX} ${cy + span}`
      : ` L ${cx - depth * 0.62} ${cy + notch} C ${tipX + depth * 0.7} ${cy + span * 0.4}, ${tipX + depth * 0.5} ${cy + span * 0.72}, ${tipX} ${cy + span}`) +
    ` C ${cx - depth * 0.55} ${cy + span * 0.85}, ${cx - depth * 0.1} ${cy + span * 0.38}, ${cx} ${cy + 3} Z`;
  void up;
  return top + bot;
};

const shade = (tone: number) => {
  // tom base do corpo: de #1d1d1d a #4a4a4a
  const v = Math.round(46 + tone * 58);
  const v2 = Math.round(22 + tone * 30);
  return [`rgb(${v},${v},${v + 1})`, `rgb(${v2},${v2},${v2})`];
};

type Parts = {
  body: React.ReactNode;       // corpo (parte rígida)
  tail: React.ReactNode;       // pedúnculo + fluke (gira)
  joint: [number, number];     // eixo do pedúnculo
  fluke?: React.ReactNode;     // nadadeira (gira um pouco mais)
  flukeJoint?: [number, number];
  vb: [number, number];
  eye: [number, number];
  eyeR?: number;
  under?: React.ReactNode;     // desenhado antes do corpo (nadadeiras de trás)
  over?: React.ReactNode;      // detalhes por cima do corpo (marcas)
  clipBody?: string;           // path do corpo para clip das marcas
};

const parts = (kind: AnimalKind, f: string, f2: string): Parts => {
  const body = `url(#g-${kind})`;
  switch (kind) {
    case 'orca': {
      const bodyD = 'M 320 178 C 420 146, 520 118, 600 116 C 720 116, 840 132, 920 162 C 960 177, 990 190, 1000 202 C 990 214, 960 226, 920 238 C 840 276, 740 312, 640 314 C 530 316, 410 270, 320 228 Z';
      return {
        vb: [1000, 400], joint: [335, 202], eye: [893, 204], eyeR: 5.5, clipBody: bodyD,
        under: (
          <path d="M 775 285 C 805 322 785 368 740 382 C 736 346 742 312 748 288 Z" fill="#2c2c2c" stroke={OUT} strokeWidth={1.5} />
        ),
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            {/* barriga branca */}
            <path d="M 992 210 C 945 240 850 280 745 298 C 680 306 620 304 560 290 C 500 276 450 254 400 232 C 460 250 540 268 620 274 C 720 280 830 252 905 222 Z" fill={C.white} opacity={0.93} />
            {/* sela cinza */}
            <path d="M 520 150 C 560 138 600 142 640 150 C 610 168 560 174 520 170 Z" fill="#8a8a8a" opacity={0.55} />
            {/* mancha branca do olho */}
            <ellipse cx={868} cy={187} rx={40} ry={11.5} transform="rotate(-16 868 187)" fill={C.white} />
            {/* linha da boca */}
            <path d="M 999 208 C 965 216 935 224 905 227" stroke="#0A0A0A" strokeWidth={2.5} fill="none" opacity={0.7} />
          </g>
        ),
        tail: (
          <g>
            <path d="M 335 176 C 290 186 230 193 172 199 L 172 207 C 230 213 290 220 335 228 Z" fill={body} stroke={OUT} strokeWidth={1.5} />
          </g>
        ),
        fluke: <path d={flukePath(176, 203, 95, 118, 12)} fill={body} stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [176, 203],
        // dorsal e peitoral entram no body via "over2"
      } as Parts & {};
    }
    case 'sperm': {
      const bodyD = 'M 330 176 C 390 150, 460 134, 520 126 C 570 120, 610 104, 660 100 L 930 94 C 982 94, 1000 116, 1000 150 L 998 236 C 998 252, 990 262, 972 264 L 800 270 C 700 312, 560 322, 470 288 C 410 262, 365 236, 330 222 Z';
      return {
        vb: [1000, 400], joint: [335, 202], eye: [842, 232], eyeR: 4.5, clipBody: bodyD,
        under: <path d="M 700 286 C 705 320 690 345 660 352 C 662 325 668 305 672 286 Z" fill="#262626" stroke={OUT} strokeWidth={1.5} />,
        body: (
          <g>
            {/* mandíbula inferior estreita */}
            <path d="M 985 262 L 770 276 C 760 292 780 305 820 306 C 900 306 960 298 986 282 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.8} />
            <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />
          </g>
        ),
        over: (
          <g fill="none" stroke={C.white} strokeWidth={1.6} opacity={0.2}>
            {/* rugas da pele */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d={`M ${450 + i * 30} ${150 + i * 2} C ${460 + i * 30} ${190}, ${450 + i * 30} ${230}, ${470 + i * 30} ${275}`} />
            ))}
            <path d="M 990 252 L 790 268" stroke="#0A0A0A" strokeWidth={3} opacity={1} />
            {/* dorsal baixa */}
            <path d="M 440 136 C 450 118 465 114 480 134" strokeWidth={3} />
          </g>
        ),
        tail: (
          <path d="M 335 176 C 290 188 235 195 192 199 L 192 207 C 235 211 290 218 335 224 Z" fill={body} stroke={OUT} strokeWidth={1.5} />
        ),
        fluke: <path d={flukePath(196, 203, 125, 125, 16)} fill={body} stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [196, 203],
      } as Parts;
    }
    case 'humpback': {
      const bodyD = 'M 330 176 C 390 152, 470 134, 540 128 C 560 128, 580 128, 640 128 C 720 124, 800 126, 870 138 C 930 148, 970 168, 990 188 C 1000 200, 994 212, 975 222 C 920 250, 840 272, 740 286 C 640 308, 520 296, 430 262 C 390 246, 355 230, 330 222 Z';
      return {
        vb: [1000, 520], joint: [335, 200], eye: [925, 222], eyeR: 5, clipBody: bodyD,
        under: (
          <g>
            {/* peitoral longa e branca */}
            <path d="M 830 255 C 800 340 730 440 600 500 C 596 465 640 395 700 322 C 740 280 775 258 790 248 Z" fill={C.white} stroke={OUT} strokeWidth={1.5} opacity={0.96} />
          </g>
        ),
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <path d="M 985 210 C 920 246 840 270 735 284 C 640 292 520 276 440 250 C 520 262 640 262 740 252 C 830 240 920 226 985 210 Z" fill="#cfcfcf" opacity={0.85} />
            {/* sulcos da garganta */}
            <g stroke="#6a6a6a" strokeWidth={1.6} opacity={0.8}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <path key={i} d={`M ${960 - i * 3} ${214 + i * 3} C 880 ${238 + i * 3}, 800 ${255 + i * 3}, ${720 - i * 12} ${262 + i * 2}`} fill="none" />
              ))}
            </g>
            {/* tubérculos na cabeça */}
            {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={940 - i * 22} cy={175 + (i % 2) * 6} r={3} fill="#8a8a8a" opacity={0.7} />)}
            {/* corcova dorsal */}
            <path d="M 545 130 C 553 106 575 100 600 128 Z" fill="#303030" stroke={OUT} strokeWidth={1.5} />
            <path d="M 985 205 C 960 212 940 218 915 222" stroke="#0A0A0A" strokeWidth={2.4} fill="none" opacity={0.8} />
          </g>
        ),
        tail: <path d="M 335 178 C 290 188 240 195 196 199 L 196 209 C 240 214 290 220 335 226 Z" fill={body} stroke={OUT} strokeWidth={1.5} />,
        fluke: <path d={flukePath(200, 204, 140, 120, 14, true)} fill={body} stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [200, 204],
      } as Parts;
    }
    case 'greywhale': {
      const bodyD = 'M 330 178 C 400 148, 500 132, 600 132 C 720 138, 820 150, 900 172 C 960 188, 995 202, 1000 214 C 985 232, 940 248, 880 262 C 800 290, 700 312, 600 310 C 500 304, 410 266, 330 224 Z';
      return {
        vb: [1000, 400], joint: [335, 202], eye: [905, 226], eyeR: 4.5, clipBody: bodyD,
        under: <path d="M 790 270 C 795 310 770 335 735 340 C 740 310 748 290 756 268 Z" fill="#555" stroke={OUT} strokeWidth={1.5} />,
        body: <path d={bodyD} fill="url(#g-greywhale)" stroke={OUT} strokeWidth={2} />,
        over: (
          <g fill="#c8c8c8" opacity={0.55}>
            {[[500, 175, 14], [560, 190, 10], [640, 168, 12], [700, 200, 9], [770, 182, 11], [450, 200, 8], [830, 205, 7], [600, 230, 8]].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} />
            ))}
          </g>
        ),
        tail: <path d="M 335 178 C 290 190 240 196 196 200 L 196 208 C 240 212 290 218 335 226 Z" fill="url(#g-greywhale)" stroke={OUT} strokeWidth={1.5} />,
        fluke: <path d={flukePath(200, 204, 120, 105, 12)} fill="url(#g-greywhale)" stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [200, 204],
      } as Parts;
    }
    case 'pilot': {
      const bodyD = 'M 335 178 C 400 156, 470 140, 560 134 C 700 134, 820 126, 900 128 C 950 130, 985 150, 995 182 C 1000 205, 990 228, 960 245 C 920 262, 860 272, 800 280 C 700 304, 600 306, 520 292 C 440 276, 380 250, 335 226 Z';
      return {
        vb: [1000, 400], joint: [340, 202], eye: [928, 214], eyeR: 5.5, clipBody: bodyD,
        under: <path d="M 785 268 C 780 322 735 360 665 378 C 685 335 715 300 745 270 Z" fill="#232323" stroke={OUT} strokeWidth={1.5} />,
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            {/* dorsal falcata, base longa */}
            <path d="M 640 140 C 650 100, 690 62, 715 52 C 722 80, 745 112, 790 136 Z" fill="#242424" stroke={OUT} strokeWidth={1.8} />
            {/* sela cinza atrás da dorsal */}
            <path d="M 520 150 C 560 142 620 144 650 150 C 620 172 560 176 520 168 Z" fill="#8c8c8c" opacity={0.5} />
            {/* âncora branca no peito */}
            <path d="M 850 268 C 800 270 750 266 720 262 C 760 252 820 250 860 252 Z" fill={C.gray2} opacity={0.75} />
            <path d="M 988 220 C 962 228 944 232 925 234" stroke="#0A0A0A" strokeWidth={2.2} fill="none" opacity={0.8} />
          </g>
        ),
        tail: <path d="M 338 178 C 295 188 245 195 195 199 L 195 207 C 245 212 295 219 338 226 Z" fill={body} stroke={OUT} strokeWidth={1.5} />,
        fluke: <path d={flukePath(199, 203, 88, 100, 11)} fill={body} stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [199, 203],
      } as Parts;
    }
    case 'blue': {
      const bodyD = 'M 300 180 C 380 166, 520 146, 640 142 C 760 140, 880 152, 950 176 C 985 190, 998 202, 1000 210 C 980 230, 930 250, 860 262 C 740 282, 560 280, 440 258 C 380 246, 330 228, 300 222 Z';
      return {
        vb: [1000, 400], joint: [305, 201], eye: [930, 218], eyeR: 3.5, clipBody: bodyD,
        under: <path d="M 780 244 C 790 275 765 292 735 296 C 745 275 752 258 760 242 Z" fill="#555" stroke={OUT} strokeWidth={1.5} />,
        body: <path d={bodyD} fill="url(#g-blue)" stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <g fill="#9a9a9a" opacity={0.35}>
              {Array.from({length: 26}).map((_, i) => (
                <ellipse key={i} cx={350 + i * 24} cy={185 + ((i * 37) % 28)} rx={10 + (i % 3) * 3} ry={5} />
              ))}
            </g>
            <path d="M 300 176 C 306 164 312 164 322 178 Z" fill="#303030" stroke={OUT} strokeWidth={1.2} />
            <path d="M 990 210 C 960 222 935 228 905 230" stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.7} />
          </g>
        ),
        tail: <path d="M 305 182 C 270 192 230 198 200 200 L 200 206 C 230 210 270 216 305 222 Z" fill="url(#g-blue)" stroke={OUT} strokeWidth={1.5} />,
        fluke: <path d={flukePath(204, 203, 105, 85, 10)} fill="url(#g-blue)" stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [204, 203],
      } as Parts;
    }
    case 'shark': {
      const bodyD = 'M 262 190 C 360 168, 470 146, 560 134 C 680 136, 810 150, 900 174 C 950 188, 990 200, 1000 208 C 985 216, 960 226, 920 234 C 840 262, 740 292, 650 296 C 540 298, 400 262, 262 218 Z';
      return {
        vb: [1000, 400], joint: [266, 205], eye: [895, 196], eyeR: 5, clipBody: bodyD,
        under: <path d="M 745 262 C 735 322 665 378 575 392 C 605 340 640 300 675 270 Z" fill="#303030" stroke={OUT} strokeWidth={1.5} />,
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <path d="M 995 210 C 960 222 900 240 820 256 C 740 270 650 270 560 262 C 640 276 760 270 850 250 C 920 232 960 222 995 210 Z" fill={C.white} opacity={0.95} />
            <path d="M 990 205 C 960 212 940 218 915 222" stroke="#0A0A0A" strokeWidth={2.4} fill="none" />
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${790 - i * 14} ${185 + i * 2} L ${786 - i * 14} ${222 + i * 3}`} stroke="#0A0A0A" strokeWidth={2.2} opacity={0.7} />)}
            {/* dorsal */}
            <path d="M 690 138 C 650 112 618 70 586 30 C 580 82 570 118 548 144 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.8} />
            <path d="M 330 190 C 345 176 360 174 372 188 Z" fill="#2a2a2a" />
          </g>
        ),
        tail: (
          <g>
            <path d="M 270 196 C 240 198 215 200 190 202 L 190 210 C 215 210 240 212 270 214 Z" fill={body} stroke={OUT} strokeWidth={1.5} />
            {/* caudal vertical, lobo superior mais longo */}
            <path d="M 196 204 C 170 160 140 100 90 28 C 130 62 168 74 188 92 C 160 120 170 150 188 176 C 168 200 180 238 188 255 C 160 292 140 330 110 358 C 130 310 130 260 190 214 Z" fill={body} stroke={OUT} strokeWidth={1.5} />
          </g>
        ),
      } as Parts;
    }
    case 'dolphin': {
      const bodyD = 'M 340 192 C 420 160, 540 144, 650 146 C 760 146, 860 156, 930 176 C 960 184, 985 196, 1000 204 C 985 210, 965 214, 940 218 C 880 248, 780 272, 660 272 C 540 272, 430 244, 340 212 Z';
      return {
        vb: [1000, 400], joint: [345, 202], eye: [880, 196], eyeR: 5, clipBody: bodyD,
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <path d="M 940 218 C 880 248 780 272 660 272 C 540 272 430 244 360 216 C 480 246 600 252 700 246 C 800 238 880 226 940 218 Z" fill="#c9c9c9" opacity={0.9} />
            <path d="M 640 148 C 650 100 690 66 730 54 C 725 90 735 125 770 150 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.5} />
            <path d="M 760 268 C 760 310 735 335 705 342 C 715 315 725 290 735 266 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.5} />
          </g>
        ),
        tail: <path d="M 350 190 C 300 195 250 198 215 200 L 215 206 C 250 208 300 212 350 216 Z" fill={body} stroke={OUT} strokeWidth={1.5} />,
        fluke: <path d={flukePath(219, 203, 70, 70, 8)} fill={body} stroke={OUT} strokeWidth={1.5} />,
        flukeJoint: [219, 203],
      } as Parts;
    }
    case 'fish': {
      const bodyD = 'M 300 200 C 380 120, 560 100, 720 140 C 830 168, 930 190, 990 204 C 930 224, 830 240, 720 262 C 560 300, 380 280, 300 205 Z';
      return {
        vb: [1000, 400], joint: [300, 202], eye: [900, 192], eyeR: 6, clipBody: bodyD,
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <path d="M 700 262 C 600 290 480 285 380 262 C 480 270 600 266 700 262 Z" fill="#c9c9c9" opacity={0.8} />
            <path d="M 520 118 C 560 70 620 70 660 128 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.5} />
            <path d="M 540 270 C 540 310 560 330 590 336 C 590 310 585 290 580 272 Z" fill="#2a2a2a" />
          </g>
        ),
        tail: <path d="M 305 202 C 260 150 210 120 150 100 C 180 150 185 180 170 202 C 185 225 180 255 150 305 C 210 285 260 255 305 202 Z" fill={body} stroke={OUT} strokeWidth={1.5} />,
      } as Parts;
    }
    case 'seal': {
      const bodyD = 'M 110 272 C 130 214, 230 184, 380 176 C 470 172, 540 158, 590 128 C 620 100, 660 62, 725 56 C 780 52, 812 80, 814 112 C 816 142, 790 164, 748 176 C 706 190, 684 218, 640 244 C 540 296, 300 306, 110 284 Z';
      return {
        vb: [1000, 400], joint: [130, 268], eye: [775, 92], eyeR: 5.5, clipBody: bodyD,
        body: <path d={bodyD} fill={body} stroke={OUT} strokeWidth={2} />,
        over: (
          <g>
            <path d="M 814 100 C 826 118 818 140 794 152 C 774 146 780 112 814 100 Z" fill="#cfcfcf" opacity={0.4} />
            <circle cx={816} cy={118} r={6} fill="#0A0A0A" />
            <g stroke={C.white} strokeWidth={1.5} opacity={0.6}>
              <path d="M 804 128 L 850 120" /><path d="M 804 134 L 852 136" /><path d="M 802 140 L 846 152" />
            </g>
            <path d="M 600 230 C 650 270 630 310 585 318 C 588 290 588 262 580 236 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.5} />
            <path d="M 150 258 C 90 270 60 300 50 330 C 100 312 150 296 190 280 Z" fill="#2a2a2a" stroke={OUT} strokeWidth={1.5} />
          </g>
        ),
        tail: <g />,
      } as Parts;
    }
  }
};

const GRAD_IDS: AnimalKind[] = ['orca', 'sperm', 'humpback', 'pilot', 'shark', 'seal', 'blue', 'dolphin', 'fish', 'greywhale'];

export const AnimalDefs: React.FC<{tone?: number}> = ({tone = 0.55}) => {
  const [a, b] = shade(tone);
  return (
    <defs>
      {GRAD_IDS.map((k) => {
        const tint: Record<string, [string, string]> = {
          greywhale: ['#7c7c7c', '#3a3a3a'],
          blue: ['#6e6e6e', '#303030'],
          sperm: ['#585858', '#282828'],
          humpback: ['#535353', '#242424'],
        };
        const [c1, c2] = tint[k] ?? [a, b];
        return (
          <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        );
      })}
      <radialGradient id="eyeglow">
        <stop offset="0" stopColor={C.red} stopOpacity={0.95} />
        <stop offset="0.35" stopColor={C.red} stopOpacity={0.55} />
        <stop offset="1" stopColor={C.red} stopOpacity={0} />
      </radialGradient>
    </defs>
  );
};

/** Gradientes são injetados por animal para o componente ser autossuficiente. */
export const Animal: React.FC<AnimalProps> = ({
  kind, t, w = 900, flip = false, glow = false, tone = 0.55, amp = 1, freq = 0.7, phase = 0, opacity = 1, pose = 0, style,
}) => {
  const p = parts(kind, '', '');
  const [vw, vh] = p.vb;
  const ang = Math.sin((t * freq + phase) * Math.PI * 2);
  const ang2 = Math.sin((t * freq + phase) * Math.PI * 2 - 1.1);
  const tailA = ang * 9 * amp;
  const flukeA = ang2 * 14 * amp;
  const bodyRot = -ang * 0.9 * amp;
  const vertical = kind === 'shark' || kind === 'fish';
  const tailRot = vertical ? ang * 11 * amp : tailA;
  const clipId = `clip-${kind}`;
  const cx = vw * 0.6;
  const cy = 205;
  const scale = w / vw;
  return (
    <svg
      width={w}
      height={vh * scale}
      viewBox={`0 0 ${vw} ${vh}`}
      style={{overflow: 'visible', opacity, transform: `${flip ? 'scaleX(-1)' : ''} rotate(${pose}deg)`, ...style}}
    >
      <AnimalDefs tone={tone} />
      <g transform={`rotate(${bodyRot} ${cx} ${cy})`}>
        {p.under}
        <g transform={`rotate(${tailRot} ${p.joint[0]} ${p.joint[1]})`}>
          {p.tail}
          {p.fluke && (
            <g transform={`rotate(${flukeA} ${p.flukeJoint![0]} ${p.flukeJoint![1]})`}>{p.fluke}</g>
          )}
        </g>
        {p.body}
        {p.clipBody && (
          <>
            <clipPath id={clipId}><path d={p.clipBody} /></clipPath>
            <g clipPath={`url(#${clipId})`}>{p.over && kind !== 'orca' && kind !== 'shark' ? null : null}</g>
          </>
        )}
        {p.over}
        {/* olho */}
        {glow && <circle cx={p.eye[0]} cy={p.eye[1]} r={34} fill="url(#eyeglow)" />}
        <circle cx={p.eye[0]} cy={p.eye[1]} r={p.eyeR ?? 5} fill={glow ? C.red : '#050505'} />
        {kind === 'orca' && (
          <>
            {/* dorsal e peitoral da orca */}
            <path d="M 572 126 C 592 92 612 52 626 12 C 640 52 654 96 672 124 Z" fill="url(#g-orca)" stroke={OUT} strokeWidth={1.8} />
          </>
        )}
      </g>
    </svg>
  );
};

// ---------------------------- Silhueta humana -------------------------------
export const Human: React.FC<{h?: number; color?: string; stroke?: string}> = ({h = 300, color = C.gray1, stroke = C.white}) => (
  <svg width={h * (100 / 300)} height={h} viewBox="0 0 100 300" style={{overflow: 'visible'}}>
    <circle cx={50} cy={26} r={19} fill={color} stroke={stroke} strokeWidth={2} />
    <path
      d="M 30 62 C 36 53 64 53 70 62 L 82 128 C 83 136 75 138 73 131 L 66 90 L 66 150 L 69 288 C 69 296 56 297 54 290 L 50 188 L 46 290 C 44 297 31 296 31 288 L 34 150 L 34 90 L 27 131 C 25 138 17 136 18 128 Z"
      fill={color} stroke={stroke} strokeWidth={2} strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------- Objetos de apoio ------------------------------
export const Bus: React.FC<{w?: number}> = ({w = 600}) => (
  <svg width={w} height={w * 0.2} viewBox="0 0 600 120" style={{overflow: 'visible'}}>
    <rect x={4} y={10} width={288} height={84} rx={10} fill={C.gray1} stroke={C.gray2} strokeWidth={2} />
    <rect x={306} y={10} width={290} height={84} rx={10} fill={C.gray1} stroke={C.gray2} strokeWidth={2} />
    <path d="M 292 18 L 306 18 L 306 86 L 292 86 Z" fill="#222" stroke={C.gray2} strokeWidth={2} />
    {Array.from({length: 11}).map((_, i) => (
      <rect key={i} x={18 + i * 26 + (i > 5 ? 28 : 0)} y={24} width={18} height={28} rx={3} fill="#0f0f0f" stroke={C.gray2} strokeWidth={1} opacity={0.9} />
    ))}
    {[60, 220, 400, 540].map((x) => (<g key={x}><circle cx={x} cy={96} r={16} fill="#111" stroke={C.gray2} strokeWidth={3} /><circle cx={x} cy={96} r={5} fill={C.gray2} /></g>))}
  </svg>
);

export const Panda: React.FC<{w?: number}> = ({w = 230}) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 230 126" style={{overflow: 'visible'}}>
    <path d="M 10 92 L 14 62 C 20 44 40 36 62 30 C 90 12 140 12 160 30 C 190 36 214 48 220 72 L 222 92 Z" fill={C.gray1} stroke={C.gray2} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M 70 32 L 90 20 L 130 20 L 150 32 Z" fill="#161616" stroke={C.gray2} strokeWidth={1.5} />
    <line x1={110} y1={20} x2={110} y2={34} stroke={C.gray2} strokeWidth={1.5} />
    {[58, 170].map((x) => (<g key={x}><circle cx={x} cy={96} r={20} fill="#111" stroke={C.gray2} strokeWidth={3} /><circle cx={x} cy={96} r={7} fill={C.gray2} /></g>))}
  </svg>
);

export const Boat: React.FC<{w?: number}> = ({w = 520}) => (
  <svg width={w} height={w * 0.4} viewBox="0 0 520 208" style={{overflow: 'visible'}}>
    <path d="M 10 120 L 510 120 L 470 190 L 60 190 Z" fill={C.gray1} stroke={C.gray2} strokeWidth={3} strokeLinejoin="round" />
    <rect x={180} y={60} width={150} height={60} fill="#1a1a1a" stroke={C.gray2} strokeWidth={2.5} />
    <rect x={200} y={76} width={34} height={24} fill="#0a0a0a" stroke={C.gray2} strokeWidth={1.5} />
    <rect x={250} y={76} width={34} height={24} fill="#0a0a0a" stroke={C.gray2} strokeWidth={1.5} />
    <rect x={236} y={20} width={8} height={42} fill={C.gray2} />
    <line x1={240} y1={20} x2={380} y2={110} stroke={C.gray2} strokeWidth={1.5} />
  </svg>
);

export const Gommone: React.FC<{w?: number}> = ({w = 360}) => (
  <svg width={w} height={w * 0.38} viewBox="0 0 360 137" style={{overflow: 'visible'}}>
    <path d="M 10 70 C 10 40 40 38 70 40 L 300 40 C 335 40 352 50 350 74 C 346 108 320 118 290 118 L 70 118 C 30 118 10 100 10 70 Z" fill={C.gray1} stroke={C.gray2} strokeWidth={3} />
    <rect x={150} y={8} width={5} height={36} fill={C.gray2} /><rect x={140} y={4} width={40} height={14} fill="#161616" stroke={C.gray2} strokeWidth={2} />
    <circle cx={110} cy={26} r={11} fill={C.gray1} stroke={C.white} strokeWidth={2} />
    <circle cx={210} cy={28} r={11} fill={C.gray1} stroke={C.white} strokeWidth={2} />
  </svg>
);

export const Bird: React.FC<{w?: number; t: number; phase?: number}> = ({w = 70, t, phase = 0}) => {
  const f = Math.sin((t * 3 + phase) * Math.PI * 2);
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 100 50" style={{overflow: 'visible'}}>
      <path d={`M 50 28 C 35 ${12 - f * 14} 18 ${14 - f * 14} 2 ${24 - f * 8} C 22 ${22 - f * 4} 36 ${28} 50 34 C 64 28 78 ${22 - f * 4} 98 ${24 - f * 8} C 82 ${14 - f * 14} 65 ${12 - f * 14} 50 28 Z`} fill={C.gray2} />
    </svg>
  );
};

export const Owl: React.FC<{w?: number}> = ({w = 220}) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 160 200" style={{overflow: 'visible'}}>
    <path d="M 80 10 L 100 30 C 140 34 150 80 144 130 C 138 176 110 192 80 192 C 50 192 22 176 16 130 C 10 80 20 34 60 30 Z" fill={C.gray1} stroke={C.gray2} strokeWidth={3} />
    <circle cx={56} cy={70} r={20} fill="#0f0f0f" stroke={C.gray2} strokeWidth={2.5} />
    <circle cx={104} cy={70} r={20} fill="#0f0f0f" stroke={C.gray2} strokeWidth={2.5} />
    <circle cx={56} cy={70} r={7} fill={C.red} /><circle cx={104} cy={70} r={7} fill={C.red} />
    <path d="M 80 82 L 72 100 L 88 100 Z" fill={C.gray2} />
    <rect x={20} y={187} width={120} height={8} rx={4} fill={C.gray2} opacity={0.6} />
  </svg>
);

export const Crane: React.FC<{h?: number}> = ({h = 420}) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 440 400" style={{overflow: 'visible'}}>
    <g stroke={C.gray2} strokeWidth={4} fill="none">
      <path d="M 120 390 L 140 120 M 200 390 L 180 120 M 130 330 L 190 270 M 190 330 L 130 270 M 138 200 L 182 150" />
      <path d="M 40 120 L 430 120 L 430 90 L 40 90 Z" fill="#1a1a1a" />
      <path d="M 160 90 L 100 20 L 300 90" />
      <path d="M 380 120 L 380 250" strokeWidth={2} />
    </g>
    <rect x={364} y={250} width={32} height={20} fill={C.gray1} stroke={C.gray2} strokeWidth={2} />
  </svg>
);

export const ContainerShip: React.FC<{w?: number}> = ({w = 900}) => {
  const rows = [0, 1, 2];
  return (
    <svg width={w} height={w * 0.3} viewBox="0 0 900 270" style={{overflow: 'visible'}}>
      <path d="M 20 170 L 880 170 L 830 250 L 80 250 Z" fill="#202020" stroke={C.gray2} strokeWidth={3} />
      {rows.map((r) => Array.from({length: 14}).map((_, i) => (
        <rect key={`${r}-${i}`} x={60 + i * 48} y={130 - r * 34} width={44} height={32} fill={(i + r) % 3 === 0 ? C.gray1 : '#2b2b2b'} stroke="#0a0a0a" strokeWidth={2} />
      )))}
      <rect x={740} y={60} width={90} height={110} fill="#1d1d1d" stroke={C.gray2} strokeWidth={2.5} />
      <rect x={756} y={76} width={58} height={22} fill="#0a0a0a" />
    </svg>
  );
};

export const IceBlock: React.FC<{w?: number}> = ({w = 700}) => (
  <svg width={w} height={w * 0.3} viewBox="0 0 700 210" style={{overflow: 'visible'}}>
    <path d="M 20 200 L 60 70 L 160 40 L 260 60 L 360 24 L 480 48 L 600 70 L 680 200 Z" fill="#2c2c2c" stroke={C.gray2} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 60 70 L 90 200 M 160 40 L 200 200 M 360 24 L 330 200 M 480 48 L 520 200" stroke={C.gray2} strokeWidth={1.2} opacity={0.35} />
    <path d="M 160 40 L 260 60 L 360 24" fill="none" stroke={C.white} strokeWidth={2.5} opacity={0.8} />
  </svg>
);

export const Condo: React.FC<{h?: number; open?: number; children?: React.ReactNode}> = ({h = 760, open = 0, children}) => {
  const cols = 4, rows = 7;
  return (
    <svg width={h * 0.62} height={h} viewBox="0 0 470 760" style={{overflow: 'visible'}}>
      <rect x={10} y={10} width={450} height={740} fill="#171717" stroke={C.gray2} strokeWidth={3} />
      {Array.from({length: rows}).map((_, r) => Array.from({length: cols}).map((_, c) => {
        const isTarget = r === 3 && c === 2;
        return (
          <g key={`${r}-${c}`}>
            <rect x={40 + c * 105} y={40 + r * 98} width={62} height={72} fill={isTarget ? '#2a2a2a' : '#0b0b0b'} stroke={C.gray2} strokeWidth={2} />
            {isTarget && <rect x={40 + c * 105} y={40 + r * 98} width={62 * (1 - open * 0.0)} height={72} fill="none" />}
          </g>
        );
      }))}
      {children}
    </svg>
  );
};
