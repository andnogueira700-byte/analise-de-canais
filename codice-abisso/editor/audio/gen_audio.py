#!/usr/bin/env python3
"""Mixer do vídeo 01: voz + música por bloco (crossfade, normalização, ducking) + efeitos reais.
Saídas: public/mix_full.wav (voz+música+sfx, -14 LUFS), out/trilha_musica_sfx.wav (sem voz, mesmo ganho)."""
import json, subprocess, sys, wave
import numpy as np
import pyloudnorm as pyln
from scipy import signal
SR = 44100; DUR = 608.84; N = int(DUR * SR)
root = sys.argv[1] if len(sys.argv) > 1 else '.'
A = f'{root}/public/audio'
def load(path, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start)] + (['-t', str(dur)] if dur else []) + ['-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.float32).reshape(-1, 2).copy()
meter = pyln.Meter(SR)
def lufs(x): return meter.integrated_loudness(x)
def norm(x, target): return x * 10 ** ((target - lufs(x)) / 20)
def fade(x, a=0.0, b=0.0):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None]
    if nb: x[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return x

voice = load(f'{root}/public/narrazione.mp3'); voice = np.vstack([voice, np.zeros((max(0, N - len(voice)), 2), np.float32)])[:N]
Lv = lufs(voice)
timing = json.load(open(f'{root}/data/timing.json'))
# envelope de voz (1 quando fala) com ataque/soltura
vm = np.zeros(N)
for s in timing: vm[int(s['start'] * SR):int(s['end'] * SR)] = 1
k = int(0.35 * SR); vm = np.convolve(vm, np.ones(k) / k, 'same'); vm = np.clip(vm * 1.6, 0, 1)
# ----- detecção de onsets
def onsets(x, hop=512):
    m = x.mean(axis=1); sos = signal.butter(2, 4000, 'low', fs=SR, output='sos'); m = signal.sosfilt(sos, m)
    e = np.sqrt(np.convolve(m ** 2, np.ones(hop) / hop, 'same'))[::hop // 2]
    d = np.maximum(0, np.diff(np.log(e + 1e-4)))
    pk, pr = signal.find_peaks(d, height=np.percentile(d, 97), distance=int(0.15 * SR / (hop // 2)))
    return pk * (hop // 2) / SR, pr['peak_heights']
# ----- abertura: trecho de suspense com batidas mais fortes
susp = load(f'{A}/suspense-tension-trailer-398329.mp3')
ot, oh = onsets(susp)
best = None
for h0, h in zip(ot, oh):
    if h0 + 22 > len(susp) / SR: continue
    inwin = (ot >= h0 - 0.02) & (ot < h0 + 20)
    score = oh[inwin].sum() + 3 * h
    near = [abs(o - (h0 + 14.5)) for o in ot[inwin]]
    if near and min(near) < 0.25: score += 2.0
    if best is None or score > best[0]: best = (score, h0)
h0 = best[1]; print('abertura: suspense a partir de %.2fs (hit alinhado ao frame 0)' % h0)
open_seg = susp[int((h0 - 0.02) * SR):int((h0 - 0.02 + 24) * SR)]
# ----- blocos de música
blocks = [  # (início, fim, arquivo)
    (0, 20, None), (20, 64, 'Oak_Studios_Suspense_Scary_Music_-_Standard_Quality.mp3'), (64, 120, 'Investigative_Underscore.mp3'), (120, 241, 'The_Unraveling.mp3'),
    (241, 351, 'Dark20Times.mp3'), (351, 485, 'Interloper_-_Kevin_MacLeod.mp3'), (485, 537, 'Pulsar.mp3'), (537, DUR, 'Reflective_Resolution.mp3'),
]
XF = 2.5
music_s = np.zeros((N, 2), np.float32)       # música no nível "voz falando" (após ducking)
for (a, b, f) in blocks:
    seg = open_seg if f is None else load(f'{A}/{f}')
    seg = norm(seg, -16.0)
    need = int((b - a + XF * 2) * SR)
    if len(seg) < need:       # repete com emenda suave
        reps = []; tot = 0
        while tot < need: reps.append(seg); tot += len(seg) - SR
        out = reps[0]
        for r in reps[1:]: out = np.vstack([fade(out, 0, 1.0)[:-SR] if False else out[:-SR], np.vstack([out[-SR:] * np.linspace(1, 0, SR)[:, None] + r[:SR] * np.linspace(0, 1, SR)[:, None], r[SR:]])])
        seg = out
    seg = seg[:need]
    lead = 0 if a == 0 else XF
    seg = fade(seg, XF if a > 0 else 0.0, XF if b < DUR else 3.0)
    s0 = int((a - lead) * SR); s0 = max(s0, 0)
    seg = seg[(0 if a > 0 else 0):]
    L = min(len(seg), N - s0); music_s[s0:s0 + L] += seg[:L]
# níveis: falando -22 dB (re. voz); em pausas sobe +6 dB. Abertura: -16 / -10
lv = Lv
g_speak = 10 ** ((lv - 22 - (-16)) / 20); g_gap = g_speak * 2.0
g_open_speak = 10 ** ((lv - 16 - (-16)) / 20); g_open_gap = g_open_speak * 2.0
gain = np.where(vm > 0.5, 1, 0).astype(float)
gain = g_gap + (g_speak - g_gap) * vm
t = np.arange(N) / SR
og = g_open_gap + (g_open_speak - g_open_gap) * vm
w = np.clip((t - 18.5) / 2.5, 0, 1)   # transição de nível abertura -> gancio
gain = np.where(t < 18.5, og, og * (1 - w) + gain * w)
# quedas antes das revelações (0,5 s)
REV = [(60.6, 'Sono tre'), (120.8, 'Numero tre'), (241.5, 'Numero due'), (347.6, 'Sbagliato'), (351.5, 'Numero uno'), (542.5, 'Siamo noi')]
for r, _ in REV:
    a, b = int((r - 0.55) * SR), int(r * SR)
    gain[a:b] *= np.linspace(1, 0.08, b - a); gain[b:b + int(0.8 * SR)] *= np.linspace(0.08, 1, int(0.8 * SR))
music = music_s * gain[:, None]
# ----- efeitos reais
sfx = np.zeros((N, 2), np.float32)
def put(x, at, db):
    x = x * 10 ** ((lv + db - lufs_ref(x)) / 20) if False else x
    s = int(at * SR)
    if s < 0 or s >= N: return
    L = min(len(x), N - s); sfx[s:s + L] += x[:L]
def peak_to(x, db):   # normaliza pelo pico em dB re. nível de pico típico da voz
    vp = 10 ** ((lv + 12) / 20)   # pico da voz ~ LUFS + 12 dB
    return x / (np.abs(x).max() + 1e-9) * vp * 10 ** (db / 20)
woosh = fade(load(f'{A}/Stereo_woosh.mp3', 0, 1.2), 0.02, 0.6); pop = load(f'{A}/Botton02.wav'); paper = fade(load(f'{A}/Papel05.mp3'), 0, 0.3)
riser = load(f'{A}/QUICK_RISER_14.wav'); drop = load(f'{A}/BASS_DROP_3.wav'); e13 = load(f'{A}/Cinematic_teaser_EPIC_00013.wav'); e14 = load(f'{A}/Cinematic_teaser_EPIC_00014.wav')
def first_hit(x):
    m = np.abs(x).mean(axis=1); thr = m.max() * 0.35; return int(np.argmax(m > thr))
def impact(x, secs=2.5):
    i = max(0, first_hit(x) - int(0.02 * SR)); return fade(x[i:i + int(secs * SR)], 0, 1.2)
cues = json.load(open(f'{root}/out/cues.json'))
for c in cues:
    if c['type'] == 'whoosh': put(peak_to(woosh, -22), c['t'] - 0.1, 0) if False else put(peak_to(woosh, -22), max(0, c['t'] - 0.12), 0)
    elif c['type'] == 'pop': put(peak_to(pop, -24), c['t'], 0)
    elif c['type'] == 'paper': put(peak_to(paper, -22), c['t'], 0)
put(peak_to(impact(e13, 2.8), -18), 0.0, 0)                      # impacto no frame 0
for r, name in REV:
    rs = riser[-int(2.5 * SR):] if len(riser) > 2.5 * SR else riser
    put(peak_to(fade(rs, 0.3, 0.05), -20), r - 0.5 - len(rs) / SR, 0)   # riser termina 0,5 s antes (silêncio) e o drop entra no tempo
    put(peak_to(drop, -18), r, 0)
for t0, e in ((122.0, e13), (242.4, e14), (352.6, e13)):
    put(peak_to(impact(e, 2.0), -20), t0, 0)
# ----- mix, normalização -14 LUFS, limitador
mix_nov = music + sfx
full = voice + mix_nov
g = 10 ** ((-14.0 - lufs(full)) / 20)
full *= g; mix_nov = mix_nov * g
from scipy.ndimage import minimum_filter1d, uniform_filter1d
def limit(x, ceil=0.95):
    env = np.abs(x).max(axis=1)
    gr = np.minimum(1.0, ceil / (env + 1e-9))
    gr = minimum_filter1d(gr, int(0.04 * SR)); gr = uniform_filter1d(gr, int(0.03 * SR))
    gr = np.minimum(gr, np.minimum(1.0, ceil / (env + 1e-9)) * 1.0 + 1e-9) if False else gr
    return x * gr[:, None], gr
full, gr = limit(full)
mix_nov = mix_nov * gr[:, None]
full = np.clip(full, -0.98, 0.98)
g2 = 10 ** ((-14.0 - lufs(full)) / 20)   # reajusta após o limitador e limita de novo
if g2 > 1.0:
    full, gr2 = limit(full * g2); mix_nov = mix_nov * g2 * gr2[:, None]
print('LUFS final: %.2f | pico %.3f | voz %.1f LUFS | música falando ≈ %.1f dB re. voz' % (lufs(full), np.abs(full).max(), Lv, -22))
def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
write(f'{root}/public/mix_full.wav', full)
write(f'{root}/out/trilha_musica_sfx.wav', mix_nov)
