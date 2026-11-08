import sys,subprocess,re,glob,json
sys.path.insert(0,'/tmp/alex/tools')
import aplan
from aplan import *
aplan.build()
sys.path.insert(0,'/tmp/mers/tools'); sys.path.insert(0,'/tmp/lanc/tools')
import dsfx
import numpy as np
D='/tmp/mers/drive/'; U=glob.glob('/root/.claude/uploads/*/')[0]
OPEN=D+'Dark Cinematic Documentary Opening.mp3'; DIP=D+'Diplomatic Crisis (1940 Underscore).mp3'; WAR=D+'War Cabinet (Slow Ominous Build).mp3'; STAND=D+'Naval Standoff (Deadline Underscore).mp3'
BATT=D+'Naval Battle (Impact & Aftermath).mp3'; AFT=D+'Aftermath (Somber Documentary Lament).mp3'; UNI=D+'Unintended Consequences (History Cue).mp3'; HUM=D+'Human Cost (Reflective Underscore).mp3'
INV=glob.glob(U+'*Investigative_Underscore.mp3')[0]; CORP=glob.glob(U+'*Corporate_Suspense.mp3')[0]; INTER=glob.glob(U+'*Interloper*.mp3')[0]
g=[a for a,b in BLK]; e=[b for a,b in BLK]
TG=-34.5
# (arquivo, início vídeo, fim vídeo, offset no arquivo, fade, nível)
SEG=[(OPEN,0,e[0]+0.4,0,1.6,TG+0.5),
     (DIP,g[0]-0.1,e[1]+0.4,12,0.6,TG-2.5),
     (INV,g[1]-0.1,tm(205),0,0.6,TG-2),
     (INTER,tm(203),e[2]+0.4,2,2.0,TG-1),
     (AFT,g[2]-0.1,e[3]+0.4,0,0.6,TG-1),
     (STAND,g[3]-0.1,e[4]+0.4,40,0.6,TG+0.5),
     (CORP,g[4]-0.1,tm(652),26,0.6,TG),
     (WAR,tm(648),e[5]+0.4,60,3.0,TG+0.5),
     (BATT,g[5]-0.1,e[6]+0.4,10.3,0.6,TG+1.5),
     (UNI,g[6]-0.1,e[7]+0.4,20,0.6,TG-2),
     (HUM,g[7]-0.1,DUR,10,0.6,TG-1)]
def means():
    out={}
    for f in set(x[0] for x in SEG):
        r=subprocess.run(['ffmpeg','-hide_banner','-i',f,'-af','volumedetect','-vn','-f','null','-'],capture_output=True,text=True).stderr
        out[f]=float(re.search(r'mean_volume: ([-\d.]+)',r)[1])
    return out
def boost():
    x='1'
    for a,b in BLK: x+=f"+2.0*clip(min((t-{a-0.1:.2f})/0.4,({b+0.5:.2f}-t)/0.4),0,1)"
    return "volume='"+x+"':eval=frame"
def sfx():
    TICK=[];IMP=[];last=-9
    for L in sorted(LAYERS,key=lambda L:L['t0']):
        n=L['name']
        if n in('stamp',):
            IMP.append((L['t0'],0.22))
        elif n in('big','weights'): IMP.append((L['t0'],0.32))
        elif n in('txt','loc','person','target','lower') and L['t0']-last>0.7: TICK.append(L['t0']); last=L['t0']
    # explosões (tempo do 'boom' nas cenas)
    for wd,ms in (('esplosa','13:00'),('esplode','13:10'),('squarcia','13:40')): IMP.append((W_(wd,ms),0.9))
    dsfx.build(DUR,{},TICK,[],IMP,[],'/tmp/alex/build/sfx_bed_unused.wav','/tmp/alex/build/sfx_hits.wav')
    # ambiente subaquático (ruído grave + bolhas) só nas cenas debaixo d'água
    SR=48000; N=int(DUR*SR); rng=np.random.default_rng(1); amb=np.zeros(N,np.float32)
    zones=[(0,W_('Intorno','0:30')),(W_('Davanti','4:37'),W_('Ma','5:19')),(W_('Superata','11:12'),W_('Lì','11:58')),(W_('Davanti','9:59'),W_('Aspettano','10:07'))]
    for a,b in zones:
        n=int((b-a)*SR); w=np.cumsum(rng.normal(0,1,n)).astype(np.float32); w-=np.convolve(w,np.ones(4800)/4800,'same'); w/=np.abs(w).max()+1e-6
        env=np.minimum(1,np.minimum(np.arange(n)/(SR*1.0),(n-np.arange(n))/(SR*1.0))); seg=w*0.35*env
        for k in range(int((b-a)*1.2)):
            p=rng.integers(0,max(1,n-SR//4)); L=int(SR*rng.uniform(0.04,0.12)); tt=np.arange(L)/SR; f0=rng.uniform(300,900)
            seg[p:p+L]+=0.12*np.sin(2*np.pi*(f0+4000*tt)*tt)*np.exp(-tt*35)
        i0=int(a*SR); amb[i0:i0+n]+=seg[:N-i0]
    import wave
    x=(np.clip(amb,-1,1)*32767).astype(np.int16)
    with wave.open('/tmp/alex/build/sfx_amb.wav','w') as f: f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(x.tobytes())
def run():
    sfx(); mn=means(); ins=['-i','/tmp/alex/narr.wav']; fc=[]
    for i,(f,a,b,off,fd,tg) in enumerate(SEG,1):
        d=b-a; ins+=['-i',f]; gdb=tg-mn[f]
        fc.append(f"[{i}:a]atrim=start={off}:end={off+d},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,afade=t=in:st=0:d={fd},afade=t=out:st={max(0,d-fd)}:d={fd},volume={gdb:.1f}dB,adelay={int(max(a,0)*1000)}|{int(max(a,0)*1000)}[m{i}]")
    n=len(SEG)
    fc.append(''.join(f'[m{i}]' for i in range(1,n+1))+f"amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={DUR}[music]")
    fc.append("[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=3[n1][n2][n3]")
    fc.append("[music][n1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=650:makeup=1[duck0]")
    fc.append(f"[duck0]{boost()}[duck]")
    ins+=['-i','/tmp/alex/build/sfx_hits.wav','-i','/tmp/alex/build/sfx_amb.wav']
    fc.append(f"[{n+1}:a]aresample=48000,aformat=channel_layouts=stereo,volume=-12dB[hits]")
    fc.append(f"[{n+2}:a]aresample=48000,aformat=channel_layouts=stereo,lowpass=f=1200,volume=-17dB[amb0]")
    fc.append("[amb0][n3]sidechaincompress=threshold=0.02:ratio=3:attack=20:release=500:makeup=1[amb]")
    fc.append(f"[duck][n2][hits][amb]amix=inputs=4:normalize=0:duration=longest,volume=-1dB,alimiter=limit=0.93,afade=t=out:st={DUR-2.5:.1f}:d=2.5[out]")
    subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[out]','-t',str(DUR),'-ar','48000','-ac','2','/tmp/alex/build/mix.wav'],check=True); print('mix ok')
if __name__=='__main__': run()
