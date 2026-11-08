#!/usr/bin/env python3
"""Gera a trilha de EFEITOS (sem música) a partir de out/cues.json.
Níveis relativos ao RMS da narração: -20..-24 dB. Saída: public/sfx.wav (e out/sfx.wav)."""
import json, subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 44100
rng = np.random.default_rng(7)
DUR = 608.84
root = sys.argv[1] if len(sys.argv) > 1 else '.'
cues = json.load(open(f'{root}/out/cues.json'))
# RMS da narração (trechos com voz)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{root}/public/narrazione.mp3', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
nar = np.frombuffer(raw, dtype=np.float32)
act = nar[np.abs(nar) > 0.02]
R = float(np.sqrt(np.mean(act ** 2)))
db = lambda d: R * 10 ** (d / 20)

def env(n, a=0.01, r=0.2):
    e = np.ones(n); na = int(a * SR); nr = int(r * SR)
    e[:na] = np.linspace(0, 1, max(na, 1)); e[-nr:] = np.linspace(1, 0, max(nr, 1)) if nr <= n else e[-nr:]
    return e
def bp(x, lo, hi):
    sos = signal.butter(2, [lo, hi], 'band', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def whoosh(d=0.55, soft=False):
    n = int(d * SR); x = rng.normal(size=n)
    # varredura do filtro: sobe e desce
    out = np.zeros(n); blocks = 12; bl = n // blocks
    for i in range(blocks):
        c = 400 + 2600 * np.sin(np.pi * (i + 0.5) / blocks)
        out[i*bl:(i+1)*bl] = bp(x[i*bl:(i+1)*bl] if False else x, c * 0.7, c * 1.3)[i*bl:(i+1)*bl]
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out / (np.abs(out).max() + 1e-9) * (0.5 if soft else 0.8)
def pop():
    n = int(0.09 * SR); t = np.arange(n) / SR
    f = 700 * np.exp(-t * 18) + 220
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
def click():
    n = int(0.03 * SR); t = np.arange(n) / SR
    return bp(rng.normal(size=n), 1500, 5000) * np.exp(-t * 160)
def tick():
    n = int(0.04 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 110)
def boom():
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 62 - 20 * (1 - np.exp(-t * 2.5))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8)
def ping():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1560 * t) * np.exp(-t * 4.5) * 0.7
def bubbles():
    n = int(0.9 * SR); out = np.zeros(n)
    for _ in range(rng.integers(3, 6)):
        s = int(rng.uniform(0, 0.7) * SR); m = int(0.06 * SR); t = np.arange(m) / SR
        f0 = rng.uniform(500, 1100)
        out[s:s+m] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 6 * t)) / SR) * np.exp(-t * 55)
    return out
def water():
    n = int(1.3 * SR); x = bp(rng.normal(size=n), 150, 900)
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 / (np.abs(x).max() + 1e-9)
def swell():
    n = int(0.9 * SR); x = bp(rng.normal(size=n), 80, 400); return x * np.linspace(1, 0, n) ** 2 / (np.abs(x).max() + 1e-9)
LIB = {  # tipo: (gerador, pico em dB re. voz)
    'whoosh': (lambda: whoosh(0.5), -23), 'whoosh_soft': (lambda: whoosh(0.45, True), -26), 'pop': (pop, -24), 'click': (click, -29),
    'tick': (tick, -30), 'boom': (boom, -20), 'ping': (ping, -27), 'bubbles': (bubbles, -31), 'water': (water, -30), 'swell': (swell, -26),
}
out = np.zeros(int(DUR * SR) + SR * 2)
for c in cues:
    g, d = LIB[c['type']]
    x = g(); x = x / (np.abs(x).max() + 1e-9) * db(d)
    s = int(c['t'] * SR); out[s:s+len(x)] += x[:len(out) - s]
out = out[:int(DUR * SR)]
# passa-altas suave para não competir com a voz
out = signal.sosfilt(signal.butter(2, 60, 'high', fs=SR, output='sos'), out)
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
for path in (f'{root}/public/sfx.wav', f'{root}/out/sfx.wav'):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('R(voz)=%.4f  pico sfx=%.4f' % (R, np.abs(out).max()))
