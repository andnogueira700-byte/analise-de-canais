import numpy as np, json, subprocess, re, sys
SR=44100
MP3='/root/.claude/uploads/c0da569b-aa28-50f4-ba0e-b804a7957e77/5e7e0654-darkplanner_audio_7809edc6-ecb9-4ce5-98b4-a5bf5b9364fa.mp3'
raw=subprocess.run(['ffmpeg','-v','error','-i',MP3,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
nar=np.frombuffer(raw,dtype=np.float32).copy(); N=len(nar); dur=N/SR
meta=json.load(open('scenes.json')); flags={f['id']:f for f in json.load(open('flags.json'))}
rng=np.random.default_rng(7)
def lp(x,fc):  # one-pole lowpass
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    # vectorised via lfilter-like loop in chunks (fast enough with numpy cumulative trick)
    from numpy import zeros
    y=np.zeros_like(x); acc=0.0
    for i in range(0,len(x),1):
        pass
    return None
def lpf(x,fc):
    # IIR one-pole using FFT-free recursion implemented with np.frompyfunc is slow; use block recursion
    a=float(np.exp(-2*np.pi*fc/SR)); b=1-a
    n=len(x); y=np.empty(n,dtype=np.float64)
    # use scipy-free fast approach: exponential kernel convolution via FFT
    L=int(min(n, SR*0.5)); k=b*a**np.arange(L)
    nfft=1<<int(np.ceil(np.log2(n+L)))
    return np.fft.irfft(np.fft.rfft(x,nfft)*np.fft.rfft(k,nfft),nfft)[:n].astype(np.float32)
def hpf(x,fc): return x-lpf(x,fc)
def bpf(x,lo,hi): return lpf(hpf(x,lo),hi)
def tt(n): return np.arange(n)/SR
def fade(x,a=.2,b=.3):
    n=len(x); g=np.ones(n,dtype=np.float32); na=int(a*SR); nb=int(b*SR)
    if na>0: g[:min(na,n)]=np.linspace(0,1,min(na,n))
    if nb>0: g[-min(nb,n):]=np.minimum(g[-min(nb,n):],np.linspace(1,0,min(nb,n)))
    return x*g
def noise(n): return rng.standard_normal(n).astype(np.float32)
def pink(n): x=noise(n); return lpf(x,3000)*.5+lpf(x,400)*1.2
def saw(f,n): t=tt(n); return (2*((t*f)%1)-1).astype(np.float32)
def sine(f,n,ph=0): return np.sin(2*np.pi*f*tt(n)+ph).astype(np.float32)
def place(buf,x,t0,g=1.0):
    i=int(t0*SR); 
    if i>=len(buf) or i+len(x)<=0: return
    a=max(0,-i); b=min(len(x),len(buf)-i); buf[i+a:i+b]+=x[a:b]*g
# ------------- MÚSICA (procedural, tensa) -------------
def pad(freqs,n,bright=900):
    x=np.zeros(n,dtype=np.float32)
    for f in freqs:
        for det in (-.004,.0,.004): x+=saw(f*(1+det),n)*.18
    x=lpf(x,bright); t=tt(n); x*= (.75+.25*np.sin(2*np.pi*.11*t)).astype(np.float32); return x
def build_music():
    M=np.zeros(N,dtype=np.float32)
    chords=[[73.4,110,146.8,174.6],[58.3,87.3,116.5,138.6],[65.4,98,130.8,155.6],[55,82.4,110,130.8]]  # Dm, Bb, Gm(b3 clash), A
    seg=int(9*SR); i=0; k=0
    while i<N:
        n=min(seg+int(2*SR),N-i); p=pad(chords[k%4],n,700+120*(k%3)); 
        a=np.minimum(1,tt(n)/3.0)*np.minimum(1,(n/SR-tt(n))/3.0); M[i:i+n]+=p*a.astype(np.float32)*.9; i+=seg; k+=1
    # sub drone
    M+=lpf(sine(36.7,N)*.5+sine(73.4,N)*.2,120)*.7
    # tensão: coro de tremolo agudo em 'ondas' lentas
    t=tt(N); sh=(sine(587,N)*.05+sine(622,N)*.04)*(0.5+.5*np.sin(2*np.pi*t/37))**2*(0.5+.5*np.sin(2*np.pi*5.5*t)); M+=sh.astype(np.float32)
    # pulso grave (batimento) em capítulos tensos
    tense=[('ABERTURA',1.0),('CONTESTO',.25),('AS ORIGENS',.35),('COMO FUNCIONA',.45),('OS FRACASSOS',.5),('A OPERAÇÃO',.8),('AS TRÊS DUPLAS',.9),('DE LA PENNE',1.0),('AS EXPLOSÕES',1.0),('O DEPOIS',.3),('CONCLUSÃO',.2)]
    td=dict(tense); inten=np.zeros(N,dtype=np.float32)
    for i2,m in enumerate(meta):
        a=int((0 if i2==0 else m['t0'])*SR); b=int((meta[i2+1]['t0'] if i2+1<len(meta) else dur)*SR); inten[a:b]=td.get(m['ch'],.4)
    inten=lpf(inten,.3)
    beat=np.zeros(N,dtype=np.float32); k0=np.exp(-tt(int(.6*SR))*9)*np.sin(2*np.pi*(48+30*np.exp(-tt(int(.6*SR))*20))*tt(int(.6*SR)))
    tcur=1.0
    while tcur<dur-1:
        place(beat,k0.astype(np.float32),tcur,1.0); place(beat,k0.astype(np.float32),tcur+.42,.55); tcur+=1.7
    M+=beat*inten*.9
    # sons agudos ocasionais (tique de cordas)
    return M,inten
M,inten=build_music()
# reverb leve
def reverb(x,wet=.25):
    ir=np.exp(-tt(int(1.8*SR))*2.6)*noise(int(1.8*SR)); ir=lpf(ir,3500); ir/=np.abs(ir).sum()*.2
    nfft=1<<int(np.ceil(np.log2(len(x)+len(ir)))); y=np.fft.irfft(np.fft.rfft(x,nfft)*np.fft.rfft(ir,nfft),nfft)[:len(x)].astype(np.float32); return x*(1-wet)+y*wet
M=reverb(M,.3)
# envelope da narração p/ ducking
env=lpf(np.abs(nar),4.0); env=env/np.percentile(env,98); env=np.clip(env,0,1)
# cenas com texto: música sobe
bump=np.zeros(N,dtype=np.float32)
for i2,m in enumerate(meta):
    f=flags[m['id']]
    if f['text'] or f['card']:
        a=int((0 if i2==0 else m['t0'])*SR); b=int((meta[i2+1]['t0'] if i2+1<len(meta) else dur)*SR); bump[a:b]=1
bump=lpf(bump,1.2)
def rms(x): return float(np.sqrt(np.mean(x**2))+1e-9)
nr=rms(nar[np.abs(nar)>0.02]); mr=rms(M)
base=(nr/mr)*10**(-27/20)           # música base ~27 dB abaixo da voz
gain=base*(1-.55*env)*(1+1.2*bump)  # abaixa com a voz; +~7 dB nas cenas com texto
M=M*gain.astype(np.float32)
# ------------- SFX -------------
S=np.zeros(N,dtype=np.float32)
def ping(t0,g=1):
    n=int(2.6*SR); x=sine(1450,n)*np.exp(-tt(n)*2.2); y=np.zeros(n+int(1.5*SR),dtype=np.float32); y[:n]+=x
    for k,(d,a) in enumerate([(.55,.4),(1.1,.16)]): y[int(d*SR):int(d*SR)+n]+=x*a
    place(S,y,t0,.5*g)
def bubbles_snd(t0,d,g=1):
    for _ in range(int(d*5)):
        tb=t0+rng.random()*d; f=rng.uniform(500,1100); n=int(.05*SR); x=sine(f,n)*np.exp(-tt(n)*55)*(1+tt(n)*40*0)
        x=sine(f*(1+tt(n)*6),n)*np.exp(-tt(n)*60); place(S,x,tb,.35*g)
def motor(t0,d,g=1):
    n=int(d*SR); t=tt(n); x=lpf(saw(46,n)*(.7+.3*np.sin(2*np.pi*9*t))+saw(92.5,n)*.3,220); place(S,fade(x,.6,.8),t0,.7*g)
def waves(t0,d,g=1):
    n=int(d*SR); t=tt(n); x=pink(n)*(.55+.45*np.sin(2*np.pi*.17*t+rng.random()*6)); place(S,fade(lpf(x,900),.8,1.0),t0,.5*g)
def boom(t0,g=1):
    n=int(3.2*SR); t=tt(n); x=sine(52*np.exp(-t*.5)+24,n)*np.exp(-t*1.3); x+=lpf(noise(n),260)*np.exp(-t*3.2)*1.6; place(S,x.astype(np.float32),t0,1.3*g)
def metal(t0,d,g=1):
    for _ in range(max(1,int(d/1.6))):
        tb=t0+rng.random()*max(.1,d-.5); n=int(1.1*SR); t=tt(n); x=(sine(2300,n)*.4+sine(3170,n)*.25+sine(1430,n)*.35)*np.exp(-t*7)+bpf(noise(n),1800,4200)*np.exp(-t*30)*.4; place(S,x.astype(np.float32),tb,.35*g)
    n=int(d*SR); t=tt(n); c=sine(170+8*np.sin(2*np.pi*.4*t),n)*(.5+.5*np.sin(2*np.pi*.23*t))*.18; place(S,fade(c.astype(np.float32),.5,.6),t0,.5*g)
def ticks(t0,d,g=1):
    k=0; tc=t0
    while tc<t0+d:
        n=int(.04*SR); x=sine(2300 if k%2==0 else 1750,n)*np.exp(-tt(n)*140)+noise(n)*np.exp(-tt(n)*200)*.3; place(S,x.astype(np.float32),tc,.45*g); tc+=1.0 if False else .5; k+=1
def paper(t0,g=1):
    n=int(.35*SR); x=bpf(noise(n),2500,7000)*np.exp(-tt(n)*10)*(1+.8*np.sin(2*np.pi*35*tt(n))); place(S,x.astype(np.float32),t0,.4*g)
def stamp(t0,g=1):
    n=int(.35*SR); x=sine(95,n)*np.exp(-tt(n)*18)+lpf(noise(n),900)*np.exp(-tt(n)*40)*.6; place(S,x.astype(np.float32),t0,.8*g)
def bell(t0,g=1):
    n=int(5*SR); t=tt(n); x=sum(sine(f,n)*np.exp(-t*r)*a for f,r,a in [(392,.9,1),(594,1.1,.5),(1010,1.8,.3),(1580,2.4,.15)]); place(S,x.astype(np.float32),t0,.35*g)
def wind(t0,d,g=1):
    n=int(d*SR); t=tt(n); x=bpf(noise(n),250,900)*(.5+.5*np.sin(2*np.pi*.08*t+rng.random()*5)); place(S,fade(x.astype(np.float32),1,1),t0,.6*g)
def gull(t0,g=1):
    n=int(.7*SR); t=tt(n); f=1900-900*t/0.7+120*np.sin(2*np.pi*14*t); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*3.2); place(S,x.astype(np.float32),t0,.12*g)
def steps(t0,d,g=1):
    tc=t0
    while tc<t0+d:
        n=int(.12*SR); x=lpf(noise(n),500)*np.exp(-tt(n)*35)+sine(70,n)*np.exp(-tt(n)*30)*.6; place(S,x.astype(np.float32),tc,.5*g); tc+=.62
def plane(t0,d,g=1):
    n=int(d*SR); t=tt(n); x=lpf(saw(84+4*np.sin(2*np.pi*.3*t),n)*.6+saw(168,n)*.25,500)*np.hanning(n).astype(np.float32); place(S,x.astype(np.float32),t0,.7*g)
def heart(t0,d,g=1):
    tc=t0; k0=np.exp(-tt(int(.4*SR))*10)*sine(55,int(.4*SR))
    while tc<t0+d: place(S,k0.astype(np.float32),tc,.7*g); place(S,k0.astype(np.float32),tc+.28,.4*g); tc+=1.1
def whoosh(t0,g=1):
    n=int(.55*SR); t=tt(n); x=bpf(noise(n),400,4500)*np.sin(np.pi*t/.55)**2; place(S,x.astype(np.float32),t0,.22*g)
def thud(t0,g=1):
    n=int(.9*SR); x=sine(60,n)*np.exp(-tt(n)*6)+lpf(noise(n),200)*np.exp(-tt(n)*9)*.5; place(S,x.astype(np.float32),t0,.5*g)
def radio(t0,d,g=1):
    n=int(d*SR); x=bpf(noise(n),900,3200)*(rng.random(n//2000+2).repeat(2000)[:n]>.3); place(S,fade(x.astype(np.float32),.3,.3),t0,.25*g)
def gen(t0,d,g=1):
    n=int(d*SR); t=tt(n); x=lpf(saw(50,n)*.5+saw(100.5,n)*.2,300)*(0.8+.2*np.sin(2*np.pi*3*t)); place(S,fade(x.astype(np.float32),.6,.7),t0,.45*g)
def drip(t0,d,g=1):
    for _ in range(max(1,int(d/1.3))):
        tb=t0+rng.random()*d; n=int(.12*SR); x=sine(rng.uniform(900,1500),n)*np.exp(-tt(n)*35); place(S,x.astype(np.float32),tb,.3*g)
def pump(t0,d,g=1): gen(t0,d,g*.8)
DUR={}
for i2,m in enumerate(meta):
    a=0 if i2==0 else m['t0']; b=meta[i2+1]['t0'] if i2+1<len(meta) else dur; d=b-a; s=m['sfx'].lower(); f=flags[m['id']]
    kw=lambda *ws: any(w in s for w in ws)
    if kw('silêncio'): pass
    if kw('sonar'): ping(a+.6); ping(a+min(d-2.4,4.5)) if d>6 else None
    if kw('bolha','respira'): bubbles_snd(a+.2,min(d-.3,9),.8)
    if kw('motor','hélice','propuls','geradores') : motor(a,d,.7)
    if kw('água','mar ','mar,','mar.','onda','batendo','escorrendo') or s.strip().endswith('mar'): waves(a,d,.8)
    if kw('estrondo','surdo','explos','detona'): boom(a+min(1.0,d*.2),.9)
    if kw('metal','rangido','rangendo','casco','corte','tilintando','correntes','rede'): metal(a,d,.8)
    if kw('relógio','tique','tic-tac'): ticks(a,min(d,12),.9)
    if kw('papel','lápis','nota'): paper(a+.4)
    if kw('carimbo'): stamp(a+.6)
    if kw('sino','corneta'): bell(a+.3)
    if kw('vento'): wind(a,d,.8)
    if kw('gaivota'): gull(a+.5); gull(a+2.2)
    if kw('passos'): steps(a,min(d,8),.8)
    if kw('avião','motores'): plane(a,d,.8)
    if kw('batida','pulso'): heart(a,min(d,14),.9)
    if kw('rádio','elétrica'): radio(a,min(d,6),.8)
    if kw('gotejar','lodo'): drip(a,d,.8)
    if kw('silêncio','pausa'): pass
    # entrada de rótulo/cartão
    if f['tag'] or f['card'] or f['text']: whoosh(a+.45)
    # mudança de capítulo: batida grave
    if i2>0 and meta[i2-1]['ch']!=m['ch']: thud(a+.05,1.0)
# ambiente submarino sutil nos capítulos de ação (estrutura contínua e baixa)
amb=lpf(pink(N),500)*(.35+.65*inten)*(.7+.3*np.sin(2*np.pi*.05*tt(N)))
S+=amb*.25
sr_=rms(S[np.abs(S)>1e-4]); S=S*(nr/sr_)*10**(-24/20)*(1-.25*env)
mix=nar*1.0+M+S
mix=mix/np.max(np.abs(mix))*.89
out=(np.clip(mix,-1,1)*32767).astype('<i2')
import wave
w=wave.open('mix_raw.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
# trilhas separadas p/ conferência
for nm,x in [('music',M),('sfx',S)]:
    y=(np.clip(x/np.max(np.abs(x))*.8,-1,1)*32767).astype('<i2'); w=wave.open(f'stem_{nm}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()
print('ok dur',dur, 'ratios music/voice rms', rms(M)/nr, 'sfx/voice', rms(S)/nr)
