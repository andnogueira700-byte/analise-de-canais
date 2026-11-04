import numpy as np, json, subprocess, wave
SR = 44100
ev = json.load(open("events.json")); tl = json.load(open("timeline.json"))
TOTAL = tl["total"]; LEAD = tl["lead"]; N = int(TOTAL * SR)
rs = np.random.RandomState(7)

# voz original (0 -> 63.4 s), estereo
raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", "orig_raw", "-t", "63.4", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
v = np.frombuffer(raw, np.float32).reshape(-1, 2)
fo = int(0.35 * SR); v = v.copy(); v[-fo:] *= np.linspace(1, 0, fo)[:, None]
voice = np.zeros((N, 2), np.float32); s0 = int(LEAD * SR); voice[s0:s0 + len(v)] = v[:N - s0]

t = np.arange(N) / SR
def lp(x, fc):  # filtro 1 polo
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def lp_fast(x, fc):
    from numpy.fft import rfft, irfft
    X = rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** 4); return irfft(X, len(x))

# cama grave (Re menor), entra devagar
pad = np.zeros(N)
for f0, g in [(36.7, .9), (73.4, 1.0), (110.0, .7), (146.8, .55), (174.6, .45), (220.0, .25)]:
    for det in (-0.35, 0.0, 0.4):
        ph = rs.rand() * 6.28
        pad += g * (np.sin(2 * np.pi * (f0 + det) * t + ph) + 0.35 * np.sin(2 * np.pi * 2 * (f0 + det) * t + ph))
pad *= (0.65 + 0.35 * np.sin(2 * np.pi * t / 9.0 + 1))
pad = lp_fast(pad, 320)
pad /= np.max(np.abs(pad)); env = np.clip(t / 3.0, 0, 1) * np.clip((TOTAL - t) / 2.5, 0, 1)
tension = 1 + 0.5 * np.clip((t - ev["tS3"]) / 10, 0, 1)  # cresce no confronto
pad *= env * tension * 0.20

# vento
wind = lp_fast(rs.randn(N), 700); wind /= np.max(np.abs(wind)); wind *= (0.55 + 0.45 * np.sin(2 * np.pi * t / 6.5)) * 0.06 * env

sfx = np.zeros(N)
def add(buf, start, x, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    j = min(N, i + len(x)); buf[i:j] += x[:j - i] * gain
def boom(dur=1.6, f_start=95, far=False):
    n = int(dur * SR); tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (38 + (f_start - 38) * np.exp(-tt * 14)) * tt) * np.exp(-tt * 3.2)
    noise = lp_fast(rs.randn(n), 900 if not far else 380) * np.exp(-tt * 4.5)
    crack = rs.randn(n) * np.exp(-tt * 70) * (0.25 if not far else 0.04)
    x = thump * 0.9 + noise * 0.55 + crack
    return x / np.max(np.abs(x))
for ts in ev["shots"]: add(sfx, ts, boom(), 0.36)
for ts in ev["far"]: add(sfx, ts, boom(2.0, 80, True), 0.15)
# bolas de canhao: assobio + impacto
for tf, th in zip(ev["fire"], ev["hits"]):
    n = int((th - tf) * SR); tt = np.arange(n) / SR
    w = rs.randn(n); w = lp_fast(w, 2600) - lp_fast(w, 500); w *= (tt / tt[-1]) ** 2 * 0.5
    add(sfx, tf, w, 0.2)
    imp = boom(1.0, 70) ; add(sfx, th, imp, 0.28)
# marcha: batidas suaves ate "Si fermarono"
step = ev.get('stepEvery', 0.6); tm = ev["tS2"] + 0.3
march = np.zeros(N)
while tm < ev["stop"] - 0.05:
    if not (ev["tS2"] + 4 < tm < ev["tS2"] + 4.1):
        n = int(0.12 * SR); tt = np.arange(n) / SR
        x = lp_fast(rs.randn(n), 1400) * np.exp(-tt * 38); add(march, tm, x / np.max(np.abs(x)), 0.04 * (0.7 + 0.3 * rs.rand()))
    tm += step
march *= np.clip((t - ev["tS2"]) / 1.5, 0, 1)
# timpano no "Si fermarono"
n = int(1.4 * SR); tt = np.arange(n) / SR
timp = np.sin(2 * np.pi * (60 + 40 * np.exp(-tt * 12)) * tt) * np.exp(-tt * 3.0); add(sfx, ev["stop"], timp, 0.26)

# ducking sob a voz
vm = np.abs(voice).mean(1); k = int(0.12 * SR)
venv = np.convolve(vm, np.ones(k) / k, mode="same"); venv = np.clip(venv / 0.09, 0, 1)
duck = 1 - 0.45 * venv
bed = (pad + wind + march) * duck
fx = sfx * (1 - 0.5 * venv)
st = np.stack([bed + fx, bed + fx], 1).astype(np.float32)
# pad levemente aberto no estereo
st[:, 0] += (pad * 0.05).astype(np.float32); st[:, 1] -= (pad * 0.05).astype(np.float32)
mix = voice * 1.0 + st
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", TOTAL)
