#!/usr/bin/env python3
"""Corta respiros/pausas da narração e remapeia o SRT de tempo.
Uso: python3 cortar_respiros.py <audio_entrada> <srt_entrada> <audio_saida.mp3> <srt_saida>"""
import numpy as np,re,subprocess,sys
A,SRT,OA,OS=sys.argv[1:5];sr=44100
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',A,'-ac','1','-ar',str(sr),'-f','s16le','-'],capture_output=True).stdout,dtype=np.int16).astype(np.float32)/32768
win=int(sr*0.01);n=len(a)//win;db=20*np.log10(np.sqrt((a[:n*win].reshape(n,win)**2).mean(1))+1e-9);q=db<-38
pauses=[];i=0
while i<n:
    if q[i]:
        j=i
        while j<n and q[j]: j+=1
        if (j-i)*0.01>=0.22: pauses.append((i*0.01,j*0.01))
        i=j
    else: i+=1
removed=[];segs=[];cur=0.0
for s,e in pauses:
    keep=0.22 if e-s>=0.5 else 0.10      # fim de frase respira um pouco mais
    c0,c1=s+keep/2,e-keep/2
    if c1>c0: segs.append((cur,c0));removed.append((c0,c1));cur=c1
segs.append((cur,len(a)/sr))
out=np.concatenate([a[int(s*sr):int(e*sr)] for s,e in segs])
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(sr),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','192k',OA],input=out.astype(np.float32).tobytes())
def m(t):
    r=t
    for s,e in removed:
        if t>=e:r-=e-s
        elif t>s:r-=t-s
    return r
f=lambda x:(lambda h,mn,s:int(h)*3600+int(mn)*60+float(s.replace(',','.')))(*x.strip().split(':'))
g=lambda t:(lambda ms:f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}")(int(round(t*1000)))
bl=re.split(r"\n\s*\n",open(SRT,encoding='utf-8-sig').read().strip());o=[]
for b in bl:
    L=b.splitlines();t0,t1=[f(x) for x in L[1].split('-->')];o.append("\n".join([L[0],f"{g(m(t0))} --> {g(m(t1))}"]+L[2:]))
open(OS,'w',encoding='utf-8').write("\n\n".join(o)+"\n")
print(f"{len(removed)} pausas encurtadas, {sum(e-s for s,e in removed):.1f}s removidos: {len(a)/sr/60:.2f} -> {len(out)/sr/60:.2f} min")
