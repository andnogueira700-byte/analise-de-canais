import re, subprocess, sys
SRT = '/root/.claude/uploads/1e6189c4-a948-5630-a416-86fa940d0069/94613108-darkplanner_srtsyncpalavra.srt'
SRC = '/tmp/claude-0/final2/holanda-final.mp4'
OUT = '/mnt/project-files/mapa-raiz/shorts/'
def ts(x): h, m, r = x.split(':'); s, ms = r.replace('.', ',').split(','); return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000
W = []
for b in re.split(r'\n\s*\n', open(SRT, encoding='utf-8-sig').read().strip()):
    l = b.strip().split('\n'); a, c = l[1].split(' --> '); W.append((ts(a), ts(c), ' '.join(l[2:]).strip()))
def ass_t(t): return f'{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}'
SHORTS = [
  ('holanda-short-1-boi-voador', 282.4, 320.0, 'O BOI QUE IA\\NVOAR NO RECIFE'),
  ('holanda-short-2-quiz', 102.9, 141.0, 'QUANTOS HOLANDESES\\NVIVIAM AQUI?'),
  ('holanda-short-3-nova-york', 661.0, 681.7, 'NOVA YORK COMEÇA\\NNO RECIFE?'),
  ('holanda-short-4-guararapes', 516.9, 542.1, '1.000 MORTOS\\NCONTRA 45'),
]
for name, a, b, title in SHORTS:
    d = b - a
    ev = [f'Dialogue: 0,{ass_t(0)},{ass_t(d)},Titulo,,0,0,0,,{title}']
    for s, e, txt in W:
        if e <= a or s >= b: continue
        ev.append(f'Dialogue: 0,{ass_t(max(0, s - a))},{ass_t(min(d, e - a))},Leg,,0,0,0,,{txt.upper()}')
    ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Titulo,Bricolage Grotesque 96pt ExtraBold,86,&H00FFFFFF,&H00FFFFFF,&H002F1206,&H96000000,0,0,0,0,100,100,0,0,1,7,4,8,60,60,290,1
Style: Leg,Bricolage Grotesque 96pt ExtraBold,96,&H001AC2FF,&H001AC2FF,&H002F1206,&H96000000,0,0,0,0,100,100,0,0,1,8,4,2,60,60,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(ev) + '\n'
    p = f'/tmp/claude-0/shorts/{name}.ass'; open(p, 'w').write(ass)
    fc = (f"[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,boxblur=24:2,eq=brightness=-0.18[bg];"
          f"[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2,ass={p}:fontsdir=/tmp/claude-0/shorts/fonts,fade=t=in:d=0.25,fade=t=out:st={d-0.35}:d=0.35[v];"
          f"[0:a]afade=t=in:d=0.2,afade=t=out:st={d-0.4}:d=0.4[au]")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(d), '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[au]',
                    '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT + name + '.mp4'], check=True)
    print('ok', name, round(d, 1))
