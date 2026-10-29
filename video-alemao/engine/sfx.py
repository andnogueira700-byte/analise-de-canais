# Sintetiza os efeitos sonoros (whoosh, pop, subida, cartão...) e monta uma faixa com eles nos tempos de eventos.json.
import json, os, sys, wave
import numpy as np
SR = 44100; R = np.random.default_rng(4)
D = os.path.dirname(os.path.abspath(__file__))
def env(n, a, r): t = np.linspace(0, 1, n); return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def lowpass(x, fc):  # um polo, fc pode variar no tempo
    fc = np.broadcast_to(fc, x.shape); a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def whoosh(d=0.9):
    n = int(SR * d); t = np.linspace(0, 1, n); x = R.standard_normal(n)
    sweep = 300 + 2600 * np.sin(np.pi * t) ** 2
    y = lowpass(x, sweep) - lowpass(x, sweep * 0.25)
    return y * np.sin(np.pi * t) ** 1.6 * 2.2
def pop():
    n = int(SR * 0.12); t = np.arange(n) / SR; f = 520 * np.exp(-t * 28) + 260
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.03, 0.18) * 0.9
def tick():
    n = int(SR * 0.05); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * 0.5 + lowpass(R.standard_normal(n), 4000) * 0.6) * env(n, 0.02, 0.12) * 0.6
def rise():
    n = int(SR * 0.45); t = np.arange(n) / SR; f = 90 + 140 * (t / t[-1])
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.25, 0.35)
    air = lowpass(R.standard_normal(n), 900 + 2000 * t / t[-1]) * env(n, 0.6, 0.3) * 0.5
    return (body * 0.8 + air) * 0.8
def card():
    w = whoosh(0.35) * 0.45; p = np.zeros_like(w); q = pop(); p[int(SR * 0.22):int(SR * 0.22) + len(q)] = q[:len(p) - int(SR * 0.22)] * 0.6
    return w + p
def drop():
    n = int(SR * 0.18); t = np.arange(n) / SR; f = 180 * np.exp(-t * 18) + 70
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 0.25)
def chapter():
    n = int(SR * 1.4); t = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((392, .5), (587.3, .35), (784, .2)))
    return (tone * env(n, 0.02, 0.22) * 0.5 + whoosh(1.4)[:n] * 0.35)
LIB = {k: f() for k, f in dict(whoosh=whoosh, pop=pop, tick=tick, rise=rise, card=card, drop=drop, chapter=chapter).items()}
for k, v in LIB.items(): LIB[k] = v / np.max(np.abs(v))
GAIN = dict(whoosh=0.55, pop=0.35, tick=0.25, rise=0.45, card=0.4, drop=0.4, chapter=0.5)
ev = json.load(open(D + '/eventos.json'))
t0 = float(sys.argv[1]) if len(sys.argv) > 1 else 0; dur = float(sys.argv[2]) if len(sys.argv) > 2 else max(e[0] for e in ev) + 3
out = np.zeros((int(SR * dur) + SR * 2, 2)); last = {}
for t, k, g in ev:
    t -= t0
    if t < 0 or t > dur or t - last.get(k, -9) < 0.15: continue  # não empilha o mesmo som
    last[k] = t; s = LIB[k] * GAIN[k] * g; i = int(t * SR)
    pan = R.uniform(-0.25, 0.25); out[i:i + len(s), 0] += s * (1 - pan); out[i:i + len(s), 1] += s * (1 + pan)
out = np.clip(out[:int(SR * dur)], -1, 1)
w = wave.open(sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/musica/sfx.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('sfx ok', dur)
