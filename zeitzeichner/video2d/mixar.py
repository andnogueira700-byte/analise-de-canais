#!/usr/bin/env python3
"""Mixa voz + música (por capítulo) + efeitos sonoros (por cena) -> mix_final.wav"""
import json,subprocess,numpy as np
SR=44100
def load(p):
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).copy();return a
def rms(a):return float(np.sqrt(np.mean(a**2))+1e-9)
D=json.load(open('spec_dump.json'));T=D['T'];S=D['S']
voice=load('audio_sem_respiros.mp3');N=len(voice);vr=rms(voice[voice**2>1e-5])
mix=voice.copy()
# ---------- efeitos ----------
def sfx_for(s):
    t,m,k,c=s['tpl'],s['mode'],s['k'],s['carry']
    amb,one=[],[]
    if t=='gateNight':amb=['torches','wind']
    elif t=='streetDusk':amb=['wind','steps']
    elif t in('marchers',):amb=['march','torches']
    elif t in('facadeZoom','windowOut'):amb=['torches']
    elif t=='overShoulder':amb=['march','torches']
    elif t=='deskSign':amb=['pen']
    elif t=='queueCoins':amb=['murmur']
    elif t=='statueNails':amb=['hammer']
    elif t=='crypt':one=['door']
    elif t=='clockBack':amb=['clock']
    elif t=='cadetYard':amb=['march']
    elif t=='room':
        if s['fire']:amb=['torches']
        if s['chars']:amb+=['steps']
        if s['door'] and not s['chars']:pass
    elif t=='battle':amb=['battle']
    elif t=='hall':amb=['cheer'] if m in('1871',) else ['murmur'] if m=='1919' else ['church']
    elif t=='chamber':amb={'brawl':['parliament'],'empty':['church'],'seats':['church']}.get(m,['murmur'])
    elif t=='prop':
        amb={'helmet':['battle'],'book':['paper'],'telegram':['paper'],'constitution':['paper'],'pen':['pen'],'hourglass':['clock'],'ballot':['paper'],'cap':['wind'],'tophat':['rain'],'grave':['wind'],'shield':['rain'],'tree':['wind'],'flagdown':['wind'],'calendar':['paper'],'money':['paper'],'signpost':['wind'],'typewriter':['typewriter']}.get(k,[])
        one={'lever':['lever'],'stamp':['stamp'],'chains':['chains'],'cell':['door'],'flash':['flash']}.get(k,[])
        if k=='lever' and not s['pull']:one=[]
    elif t=='crowd':
        if s['brown']:amb=['march']
        elif c=='fist':amb=['parliament']
        elif c in('hats','portrait','hands'):amb=['cheer']
        elif c=='paper':amb=['paper','murmur']
        elif s['soup']:amb=['wind']
        elif s['walk']:amb=['steps','murmur']
        else:amb=['murmur']
    elif t=='train':amb=['train']
    elif t=='forest':amb=['march'] if m in('russians','prisoners') else ['wind']
    elif t=='reichstag':amb={'fire':['bigfire'],'cheer':['cheer'],'proclaim':['cheer'],'statue':['hammer']}.get(m,['murmur'])
    elif t=='sea':amb=['sea'];one=['explosion'] if m=='torpedo' else []
    elif t=='trench':amb=['rain'] if m in('rain','collapse') else ['wind']
    elif t=='street':amb={'wheelbarrow':['steps','murmur'],'fight':['parliament'],'redflags':['murmur'],'cars':['wind'],'arrest':['steps'],'bread':['murmur'],'hat':['rain'],'walkers':['steps'],'signs':['hammer'],'rainvote':['rain']}.get(m,[])
    elif t=='zep':amb=['bigfire'] if m in('fire','fall') else ['wind']
    elif t=='memorial':amb={'funeral':['march'],'explode':[],'church':['church'],'manor':['wind'],'tanks':['wind'],'tower':['wind']}.get(m,[]);one=['explosion'] if m=='explode' else []
    elif t in('doc','lawtext'):amb=['paper']
    elif t=='potsdam':amb=['cheer'] if m=='ext' else ['church']
    return amb,one
cache={}
def sfx(n):
    if n not in cache:
        a=load(f'sfx/{n}.mp3');cache[n]=a/rms(a)
    return cache[n]
AMB=0.055*vr; ONE=0.09*vr   # bem baixinho em relação à voz
for i,s in enumerate(S):
    t0,t1=int(T[i]*SR),int(T[i+1]*SR);L=t1-t0
    if L<=0:continue
    amb,one=sfx_for(s)
    env=np.ones(L,dtype=np.float32);f=min(int(0.25*SR),L//3)
    if f>0:env[:f]=np.linspace(0,1,f);env[-f:]=np.linspace(1,0,f)
    for n in amb:
        a=sfx(n);off=int((T[i]*1.7%3)*SR)%max(1,len(a)-1)
        seg=np.resize(np.roll(a,-off),L)
        mix[t0:t1]+=seg*env*AMB/max(1,len(amb))**0.5
    for n in one:
        a=sfx(n)[:L];st=t0+int(0.15*SR);e=min(N,st+len(a));mix[st:e]+=a[:e-st]*ONE
# ---------- música por capítulo ----------
def chap(i):
    b=i+1
    if b<=15:return 'untergang'
    if b<=47:return 'kaiserreich'
    if b<=109:return 'weltkrieg'
    if b<=167:return 'weimar'
    if b<=301:return 'untergang'
    return 'epilog'
MUS=0.13*vr
mus=np.zeros(N,dtype=np.float32)
runs=[];cur=None
for i in range(len(S)):
    c=chap(i)
    if c!=cur:runs.append([c,int(T[i]*SR),None]);cur=c
for j,r in enumerate(runs):r[2]=runs[j+1][1] if j+1<len(runs) else N
X=int(2.5*SR)
for c,a0,a1 in runs:
    m=load(f'music/{c}.mp3');m=m/rms(m)
    # loop com crossfade de 3 s
    cf=int(3*SR);loop=m.copy()
    while len(loop)<(a1-a0)+X:
        nxt=m.copy();ov=loop[-cf:]*np.linspace(1,0,cf)+nxt[:cf]*np.linspace(0,1,cf);loop=np.concatenate([loop[:-cf],ov,nxt[cf:]])
    s0=max(0,a0-X);seg=loop[:a1-s0].copy();env=np.ones(len(seg),dtype=np.float32)
    k=min(X,len(seg)//2);env[:k]=np.linspace(0,1,k);env[-k:]=np.linspace(1,0,k)
    mus[s0:a1]+=seg*env
# ducking leve: abaixa a música quando a voz fala
win=int(0.05*SR);n=N//win;v=np.sqrt((voice[:n*win].reshape(n,win)**2).mean(1));act=(v>0.25*vr).astype(np.float32)
act=np.convolve(act,np.ones(12)/12,'same');duck=np.repeat(1-0.35*act,win);duck=np.concatenate([duck,np.ones(N-len(duck))])
mix+=mus*MUS*duck.astype(np.float32)
# fade out final
mix[-int(3*SR):]*=np.linspace(1,0,int(3*SR))
peak=np.max(np.abs(mix));mix=mix*(0.89/peak) if peak>0.89 else mix
st=np.stack([mix,mix],1).astype(np.float32)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s16le','mix_final.wav'],input=st.tobytes())
print('ok',N/SR,'s; sfx usados:',sorted(cache))
