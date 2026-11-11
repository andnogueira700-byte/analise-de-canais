# Trilha do piloto: efeitos sintetizados, ambiências por cenário, música de fundo e narração.
import numpy as np, json, sys, subprocess, os
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')
from scipy.signal import butter, sosfilt
SR = 44100
meta = json.load(open(sys.argv[1])); voice_path = sys.argv[2]; out = sys.argv[3]
END = meta['end'] + 0.3
N = int(END * SR)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(n, a, r): t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / r); return e
noise = lambda d: rng.standard_normal(int(d * SR))
def norm(x, g): return x / (np.abs(x).max() + 1e-9) * g

def whoosh(d=0.55):
    x = noise(d); n = len(x); out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        k = i / n; f = 300 + 3500 * np.sin(k * np.pi) ** 1.5
        out[i:i + seg] = bp(x[i:i + seg] if i + seg <= n else x[i:], max(80, f * 0.6), min(18000, f * 1.6), 1)[:len(out[i:i + seg])]
    return norm(lp(out, 6000) * np.sin(np.linspace(0, np.pi, n)) ** 2, 0.35)
def pop():
    t = t_(0.12); f = 950 * np.exp(-t * 18) + 420; ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * env(len(t), 0.003, 0.035), 0.3)
def stamp():
    t = t_(0.45); th = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * env(len(t), 0.002, 0.12)
    nz = lp(noise(0.45), 2500) * env(len(t), 0.001, 0.04)
    return norm(th + nz * 0.6, 0.55)
def bell(f, d=1.4):
    t = t_(d); return sum(np.sin(2 * np.pi * f * h * t) * a for h, a in [(1, 1), (2.76, 0.35), (5.4, 0.12)]) * env(len(t), 0.002, 0.45)
def ding():
    a = bell(1318.5); b = bell(1046.5); o = np.zeros(int(1.9 * SR)); o[:len(a)] += a; s = int(0.45 * SR); o[s:s + len(b)] += b
    return norm(o, 0.4)
def knock():
    o = np.zeros(int(0.5 * SR))
    for s in (0, 0.18):
        t = t_(0.12); k = np.sin(2 * np.pi * 140 * t) * env(len(t), 0.001, 0.03) + lp(noise(0.12), 900) * env(len(t), 0.001, 0.015)
        i = int(s * SR); o[i:i + len(k)] += k
    return norm(o, 0.35)
def sniff():
    o = np.zeros(int(0.6 * SR))
    for j, s in enumerate((0, 0.16, 0.3)):
        x = bp(noise(0.12), 2000, 7000) * np.sin(np.linspace(0, np.pi, int(0.12 * SR)))
        i = int(s * SR); o[i:i + len(x)] += x
    return norm(o, 0.22)
def step():
    t = t_(0.25); return norm(lp(noise(0.25), 300) * env(len(t), 0.003, 0.05) + np.sin(2 * np.pi * 60 * t) * env(len(t), 0.002, 0.06), 0.3)
def tick():
    o = np.zeros(int(0.7 * SR))
    for k in range(9):
        i = int(k * 0.07 * SR); c = hp(noise(0.01), 3000) * env(int(0.01 * SR), 0.0005, 0.003); o[i:i + len(c)] += c
    return norm(o, 0.25)
def trickle(d=3.0):
    x = bp(noise(d), 1500, 6000); m = (lp(np.abs(noise(d)), 12) * 3).clip(0, 1)
    return norm(x * m * np.sin(np.linspace(0, np.pi, len(x))), 0.12)
def tension(d=3.6):
    t = t_(d); x = np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t) + 0.3 * np.sin(2 * np.pi * 110 * t * (1 + 0.003 * np.sin(t * 3)))
    return norm(x * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 0.5), 0.3)
def rumble(d=1.8):
    t = t_(d); x = lp(noise(d), 70, 4) * 4 + np.sin(2 * np.pi * 38 * t) * 0.6
    return norm(x * env(len(t), 0.25, 0.6), 0.6)
def vacuum(d=2.7):
    t = t_(d); x = bp(noise(d), 300, 3000) * 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3
    return norm(lp(x, 4000) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3), 0.18)
def spot():
    t = t_(0.6); return norm(np.sin(2 * np.pi * 55 * t) * env(len(t), 0.002, 0.15) + lp(noise(0.6), 400) * env(len(t), 0.001, 0.05), 0.4)
def burst():
    t = t_(0.9); x = bp(noise(0.9), 400, 8000) * env(len(t), 0.002, 0.18)
    for k in range(14):
        i = int(rng.uniform(0.05, 0.7) * SR); f = rng.uniform(1500, 4000); c = np.sin(2 * np.pi * f * t_(0.05)) * env(int(0.05 * SR), 0.001, 0.012); x[i:i + len(c)] += c * 0.5
    return norm(x, 0.35)
def snap():
    o = np.zeros(int(0.5 * SR))
    for k in range(6):
        i = int(k * 0.06 * SR); c = bp(noise(0.03), 1000, 5000) * env(int(0.03 * SR), 0.001, 0.008); o[i:i + len(c)] += c
    return norm(o, 0.3)
def rise(d=2.0):
    t = t_(d); f = 200 * 2 ** (t * 1.5); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm((np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2), 0.15)
def growl(d=1.2):
    t = t_(d); x = lp(noise(d), 250) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t))
    return norm(x * np.sin(np.linspace(0, np.pi, len(t))), 0.3)
def jingle():
    o = np.zeros(int(0.6 * SR))
    for k in range(10):
        i = int(rng.uniform(0, 0.4) * SR); f = rng.uniform(3000, 7000); c = np.sin(2 * np.pi * f * t_(0.12)) * env(int(0.12 * SR), 0.001, 0.03); o[i:i + len(c)] += c
    return norm(o, 0.2)
def fire(d=2.6):
    x = lp(noise(d), 600) * 0.4
    for k in range(60):
        i = int(rng.uniform(0, d - 0.02) * SR); c = hp(noise(0.006), 2000) * rng.uniform(0.3, 1); x[i:i + len(c)] += c
    return norm(x * np.minimum(1, t_(d) / 0.3), 0.25)
def wind(d=2.6):
    x = noise(d); m = 0.5 + 0.5 * np.sin(t_(d) * 2.1)
    return norm(bp(x, 300, 1500) * m * np.sin(np.linspace(0, np.pi, len(x))), 0.25)
def buzz(d=2.0):
    t = t_(d); f = 620 + 40 * np.sin(2 * np.pi * 6 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    a = 0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t)
    return norm(lp(np.sign(np.sin(ph)), 3000) * a * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3), 0.08)
def splash(d=0.9):
    t = t_(d); return norm(lp(noise(d), 3500) * env(len(t), 0.005, 0.18) + bp(noise(d), 2000, 8000) * env(len(t), 0.02, 0.3) * 0.4, 0.45)
def bubble():
    o = np.zeros(int(1.6 * SR))
    for k in range(9):
        i = int(k * 0.15 * SR); tt = t_(0.07); f = 400 + 900 * tt / 0.07 + rng.uniform(0, 200); c = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.02); o[i:i + len(c)] += c
    return norm(o, 0.2)
def click():
    t = t_(0.08); return norm(bp(noise(0.08), 1500, 6000) * env(len(t), 0.0005, 0.01) + np.sin(2 * np.pi * 2200 * t) * env(len(t), 0.0005, 0.02), 0.3)
def night(d=2.4):
    o = np.zeros(int(d * SR))
    for k in range(int(d * 4)):
        i = int(k * 0.25 * SR); tt = t_(0.08); c = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 40 * tt) > 0) * env(len(tt), 0.005, 0.03); o[i:i + len(c)] += c
    return norm(o, 0.06)
def jump(): return whoosh(0.35) * 0.6

# ---- efeitos do vídeo completo ----
def bark():
    t = t_(0.28); f = 520 * np.exp(-t * 4) + 260; ph = 2 * np.pi * np.cumsum(f) / SR
    v = (np.sign(np.sin(ph)) * 0.5 + np.sin(ph * 2) * 0.5) * env(len(t), 0.008, 0.09)
    return norm(bp(v + noise(0.28) * 0.25 * env(len(t), 0.005, 0.05), 250, 3500), 0.5)
def hiss(d=1.0):
    t = t_(d); return norm(bp(noise(d), 2500, 9000) * np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - 0.5) * 4), 0.4)
def dig(d=1.6):
    t = t_(d); x = lp(noise(d), 1800) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7 * t) > 0.3)); return norm(x * np.minimum(1, (d - t) / 0.3), 0.3)
def crunch():
    o = np.zeros(int(0.5 * SR))
    for k in range(5):
        i = int((k * 0.09 + rng.random() * 0.03) * SR); x = bp(noise(0.06), 1500, 7000) * env(int(0.06 * SR), 0.002, 0.02); o[i:i + len(x)] += x
    return norm(o, 0.35)
def squish(d=0.8):
    t = t_(d); return norm(lp(noise(d), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t)) * env(len(t), 0.02, 0.3), 0.3)
def herd(d=3.0):
    t = t_(d); o = lp(noise(d), 400) * 0.4
    for k in range(4):
        i = int(rng.random() * (d - 0.8) * SR); n = int(0.7 * SR); tt = np.arange(n) / SR; f = 70 + rng.random() * 40
        o[i:i + n] += np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * 3 * tt)) * env(n, 0.15, 0.3)
    return norm(o * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5), 0.3)
def snort(): t = t_(0.5); return norm(bp(noise(0.5), 300, 2500) * env(len(t), 0.02, 0.15), 0.35)
def moo(d=1.2):
    t = t_(d); f = 85 + 10 * np.sin(2 * np.pi * 0.8 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(lp(np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sign(np.sin(ph)), 900) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3), 0.35)
def chew(d=1.2):
    o = np.zeros(int(d * SR))
    for k in range(int(d / 0.25)):
        i = int(k * 0.25 * SR); x = lp(noise(0.08), 1200) * env(int(0.08 * SR), 0.005, 0.03); o[i:i + len(x)] += x
    return norm(o, 0.2)
def flap(d=1.6):
    t = t_(d); return norm(bp(noise(d), 300, 2500) * (np.sin(2 * np.pi * 9 * t) > 0) * np.minimum(1, (d - t) / 0.5), 0.3)
def infra(d=2.4):
    t = t_(d); return norm((np.sin(2 * np.pi * 38 * t) + 0.5 * np.sin(2 * np.pi * 57 * t)) * np.sin(np.pi * t / d) ** 2 + lp(noise(d), 120) * 0.3, 0.7)
def rattle(d=2.0):
    t = t_(d); return norm(bp(noise(d), 2500, 6000) * (np.sin(2 * np.pi * 28 * t) > 0.6) * np.sin(np.pi * t / d), 0.15)
def roar(d=1.6):
    t = t_(d); f = 160 - 60 * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(lp(np.sign(np.sin(ph)) + noise(d) * 0.8, 1800) * np.sin(np.pi * np.minimum(1, t / d)) ** 0.5, 0.55)
def coo(d=1.6):
    t = t_(d); return norm(np.sin(2 * np.pi * 180 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.5 * t)) * np.sin(np.pi * t / d), 0.25)
def heartbeat():
    o = np.zeros(int(0.9 * SR))
    for dt, a in ((0, 1), (0.22, 0.7)):
        i = int(dt * SR); n = int(0.15 * SR); tt = np.arange(n) / SR; o[i:i + n] += np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 30) * a
    return norm(o, 0.6)
def rustle(d=1.6):
    t = t_(d); return norm(bp(noise(d), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3 * t))) * np.sin(np.pi * t / d), 0.2)
def thud():
    t = t_(0.9); return norm(np.sin(2 * np.pi * 45 * t) * np.exp(-t * 6) + lp(noise(0.9), 200) * np.exp(-t * 9) * 0.6, 0.85)
def stepL(): t = t_(0.15); return norm(bp(noise(0.15), 800, 4000) * env(len(t), 0.003, 0.03), 0.15)
def frog(d=0.9):
    t = t_(d); return norm(np.sign(np.sin(2 * np.pi * 380 * t)) * (np.sin(2 * np.pi * 14 * t) > 0) * np.sin(np.pi * t / d) * 0.6 + 0, 0.12)
def yawn(d=1.2):
    t = t_(d); f = 600 - 300 * t / d; ph = 2 * np.pi * np.cumsum(f) / SR; return norm(lp(np.sin(ph) + noise(d) * 0.3, 2000) * np.sin(np.pi * t / d), 0.2)
def scratch(d=1.5):
    t = t_(d); return norm(bp(noise(d), 2000, 6000) * (np.sin(2 * np.pi * 11 * t) > 0) * np.sin(np.pi * t / d), 0.18)
def birds(d=2.4):
    o = np.zeros(int(d * SR))
    for k in range(6):
        i = int(rng.random() * (d - 0.3) * SR); n = int(0.18 * SR); tt = np.arange(n) / SR; f = 2500 + rng.random() * 1500 + 800 * np.sin(2 * np.pi * 18 * tt)
        o[i:i + n] += np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 0.06)
    return norm(o, 0.12)
FX = dict(whoosh=whoosh, pop=pop, stamp=stamp, ding=ding, knock=knock, sniff=sniff, step=step, tick=tick, trickle=trickle, tension=tension, rumble=rumble,
          vacuum=vacuum, spot=spot, burst=burst, snap=snap, rise=rise, growl=growl, jingle=jingle, fire=fire, wind=wind, buzz=buzz, splash=splash,
          bubble=bubble, click=click, night=night, jump=jump,
          bark=bark, hiss=hiss, dig=dig, crunch=crunch, squish=squish, herd=herd, snort=snort, moo=moo, chew=chew, flap=flap, infra=infra, rattle=rattle,
          roar=roar, coo=coo, heartbeat=heartbeat, rustle=rustle, thud=thud, stepL=stepL, frog=frog, yawn=yawn, scratch=scratch, birds=birds)
fx = np.zeros(N)
for t, k in meta['cues']:
    if k not in FX: continue
    x = FX[k](); i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i]
# ambiências por cenário
amb = np.zeros(N)
river = lp(noise(END), 900) * 0.5 + bp(noise(END), 1500, 5000) * 0.08
room = lp(noise(END), 200) * 0.25
forest = bp(noise(END), 3000, 7000) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * np.arange(N) / SR)) + lp(noise(END), 500) * 0.3
for a, b, s in meta['shots']:
    i, j = int(a * SR), int(b * SR)
    if s == 'creta': amb[i:j] += river[i:j] * 0.07
    elif s in ('sala', 'quarto'): amb[i:j] += room[i:j] * 0.03
    elif s == 'rua': amb[i:j] += river[i:j] * 0.03
    elif s == "fogueira": amb[i:j] += lp(rng.standard_normal(j - i), 500) * 0.03
    elif s == 'orilla': amb[i:j] += river[i:j] * 0.08
    elif s == 'bosque': amb[i:j] += (forest[i:j] * 0.05)
    elif s == 'claro': amb[i:j] += (forest[i:j] * 0.03 + room[i:j] * 0.03)
    elif s == 'mapa': amb[i:j] += room[i:j] * 0.02
amb = lp(amb, 8000)
# música: pad + marimba suave, 96 bpm, Ré menor
bpm = 96; beat = 60 / bpm
chords = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]
mus = np.zeros(N); mar = np.zeros(N); T = np.arange(N) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
bar = beat * 4
for ci in range(int(END / bar) + 1):
    ch = chords[ci % 4]; a = ci * bar; i0 = int(a * SR); n = int(bar * 1.15 * SR); tt = np.arange(n) / SR
    e = np.minimum(1, tt / 0.6) * np.minimum(1, np.maximum(0, (bar * 1.15 - tt)) / 0.5)
    pad = sum(np.sin(2 * np.pi * hz(m) * tt) + 0.25 * np.sin(2 * np.pi * hz(m) * 2.003 * tt) for m in ch) * e * 0.05
    if i0 >= N: continue
    j = min(N, i0 + n); mus[i0:j] += pad[:j - i0]
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for k in range(8):
        st = a + k * beat / 2; i = int(st * SR); m = ch[pat[k]] + 12; d = 0.6; tt2 = np.arange(int(d * SR)) / SR
        pl = (np.sin(2 * np.pi * hz(m) * tt2) + 0.3 * np.sin(2 * np.pi * hz(m) * 4 * tt2) * np.exp(-tt2 * 30)) * np.exp(-tt2 * 7) * 0.09
        if i >= N: continue
        j = min(N, i + len(pl)); mar[i:j] += pl[:j - i]
mus = lp(mus, 5000); mar = lp(mar, 5000)
# dinâmica da música: piloto usa a curva fixa; vídeos longos usam "modos" (arquivo musica.json ao lado da narração)
def gain_curve(points):
    g = np.interp(T, [p[0] for p in points], [p[1] for p in points]); return g
import os
mfile = os.path.join(os.path.dirname(os.path.abspath(voice_path)), 'musica.json')
if os.path.exists(mfile):
    modes = json.load(open(mfile))
    lvl = {'calma': 1.0, 'tension': 0.55, 'noche': 0.45, 'silencio': 0.0}
    pts = [(0, 0)]
    for a, b, m in modes: pts += [(a + 0.25, lvl[m]), (b - 0.25, lvl[m])]
    pts.append((END, 0)); pts.sort()
    g = gain_curve(pts)
    # drone grave nos trechos de tensão/noite
    drone = np.zeros(N)
    for a, b, m in modes:
        if m in ('tension', 'noche'):
            i, j = int(a * SR), min(N, int(b * SR)); tt = np.arange(j - i) / SR
            drone[i:j] += (np.sin(2 * np.pi * 73.4 * tt) + 0.5 * np.sin(2 * np.pi * 110 * tt + np.sin(tt * 0.7))) * np.minimum(1, tt / 1.5) * np.minimum(1, (b - a - tt) / 1.5) * 0.05
    gm = gain_curve(sorted([(0, 0)] + [p for a, b, m in modes for p in ((a + 0.25, 1.0 if m == 'calma' else 0.0), (b - 0.25, 1.0 if m == 'calma' else 0.0))] + [(END, 0)]))
    mus = mus * g + mar * gm + lp(drone, 400)
else:
    g = gain_curve([(0, 0), (0.3, 1), (22.2, 1), (22.6, 0.0), (26.0, 0.0), (26.6, 1), (94.9, 1), (95.1, 0.35), (101.5, 0.35), (102, 1), (121.0, 1), (END, 0)])
    mus = (mus + mar) * g
# narração
raw = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', voice_path, '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
# ducking: música e ambiência baixam quando há voz
ve = np.abs(voice); ve = lp(ve, 4); duck = 1 - 0.6 * np.clip(ve / (np.percentile(ve, 90) + 1e-9), 0, 1)
mix = voice * 1.0 + fx * 0.7 + amb * duck + mus * 0.2 * duck
mix = mix / max(1.0, np.abs(mix).max() / 0.95)
st = np.stack([mix, mix], 1).astype(np.float32)
subprocess.run([FFMPEG, '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'pcm_s16le', out], input=st.tobytes())
print('ok', END)
