# Monta a trilha de fundo com as músicas do Anderson, por trechos do vídeo, e mixa com a narração.
import subprocess, json, sys, os
E = os.path.dirname(os.path.abspath(__file__))
V = os.environ.get('V')  # vídeo escolhido (sem V: o vídeo 1)
D = E + (f'/../../video-{V}/audio' if V else '/../audio')
M = E + '/../audio/musicas/'
TMP = '/tmp/claude-0/musica'; os.makedirs(TMP, exist_ok=True)
DUR = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', D + '/narracao.mp3']))
# trechos: (início, fim, músicas em sequência)
B = json.load(open(TMP + '/cortes.json'))  # tempos vindos da legenda
if V:
    B.update(inicio=0, fim=DUR + 1)
    SECS = [(B[a], B[b], songs) for a, b, songs in json.load(open(f'{E}/../../video-{V}/trilha.json'))['secoes']]
else:
    SECS = [
        (0, B['lei'], ['playful_inquiry', 'curious_discovery']),
        (B['lei'], B['casa'], ['investigative_pulse']),
        (B['casa'], B['pomeranos'], ['documentary_reflection']),
        (B['pomeranos'], B['sobrou'], ['gentle_dawn']),
        (B['sobrou'], DUR + 1, ['triumphant_horizons']),
    ]
def run(a): subprocess.run(['ffmpeg', '-v', 'error', '-y'] + a, check=True)
parts = []
for i, (a, b, songs) in enumerate(SECS):
    need = b - a + 4
    # encadeia as músicas (repetindo se precisar) com crossfade de 3 s
    seq = []; tot = 0; k = 0
    while tot < need:
        s = songs[k % len(songs)]; seq.append(M + s + '.mp3')
        tot += float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', M + s + '.mp3'])) - 3; k += 1
    inp = sum([['-i', f] for f in seq], [])
    if len(seq) == 1: fc = '[0:a]anull[x]'
    else:
        fc = ''; last = '[0:a]'
        for j in range(1, len(seq)): fc += f'{last}[{j}:a]acrossfade=d=3[c{j}];'; last = f'[c{j}]'
        fc += f'{last}anull[x]'
    fc += f';[x]atrim=0:{need},asetpts=N/SR/TB,afade=t=in:d=1.5,afade=t=out:st={need - 2.5}:d=2.5,aresample=44100,aformat=channel_layouts=stereo[o]'
    out = f'{TMP}/sec{i}.wav'; run(inp + ['-filter_complex', fc, '-map', '[o]', out]); parts.append((a, out))
# posiciona cada trecho no tempo (começando 2 s antes do corte, para cruzar com o anterior)
inp = sum([['-i', p] for _, p in parts], []); fc = ''
for j, (a, _) in enumerate(parts):
    d = int(max(0, a - 2) * 1000); fc += f'[{j}:a]adelay={d}|{d}[d{j}];'
fc += ''.join(f'[d{j}]' for j in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,atrim=0:{DUR},loudnorm=I=-30:TP=-2:LRA=11,volume=-12dB[m]'
run(inp + ['-filter_complex', fc, '-map', '[m]', '-ar', '44100', TMP + '/trilha.wav'])
# efeitos sonoros nos tempos dos eventos da animação
subprocess.run(['python3', os.path.dirname(os.path.abspath(__file__)) + '/sfx.py', '0', str(DUR), TMP + '/sfx.wav'], check=True)
# narração normalizada + trilha bem baixa (Anderson pediu "bem no mínimo") com "ducking" quando há voz + efeitos
run(['-i', D + '/narracao.mp3', '-i', TMP + '/trilha.wav', '-i', TMP + '/sfx.wav', '-filter_complex',
     '[0:a]loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo,asplit=2[v][sc];'
     '[1:a][sc]sidechaincompress=threshold=0.05:ratio=3:attack=80:release=600[mb];'
     '[2:a]volume=0.32[fx];'
     '[v][mb][fx]amix=inputs=3:normalize=0,alimiter=limit=0.95[out]', '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', D + '/mix.m4a'])
print('ok', DUR)
