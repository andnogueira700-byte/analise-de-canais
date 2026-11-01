import sys,subprocess,re,json
sys.path.insert(0,'/tmp/mers/tools')
import mplan
from mplan import tm,BLK,DUR
M='/tmp/mers/drive/'
OPEN='Dark Cinematic Documentary Opening.mp3'; DIP='Diplomatic Crisis (1940 Underscore).mp3'; WAR='War Cabinet (Slow Ominous Build).mp3'; STAND='Naval Standoff (Deadline Underscore).mp3'
BATT='Naval Battle (Impact & Aftermath).mp3'; AFT='Aftermath (Somber Documentary Lament).mp3'; UNI='Unintended Consequences (History Cue).mp3'; HUM='Human Cost (Reflective Underscore).mp3'
g=[b[0]+0.15 for b in BLK]            # início de cada pausa (tempo do vídeo)
TG=-35.0                              # nível médio da música (dB): baixa, abaixo da voz
standoff_start=g[3]-145
SEG=[(OPEN,0,g[0]+1.0,0,2.0,TG),
     (DIP,g[0]-0.05,g[1]+1.0,8,1.2,TG),
     (WAR,g[1]-0.05,g[1]+150,20,1.2,TG-1),
     (WAR,g[1]+146,standoff_start+4.5,100,3.0,TG-1),
     (STAND,standoff_start,g[3]+1.0,0,3.0,TG),
     (BATT,g[3]-0.05,g[4]+1.0,36,1.2,TG+1),
     (AFT,g[4]-0.05,tm("11:46.9")+0.6,0,1.2,TG),
     (UNI,tm("11:46.9")-0.6,tm("13:19.3")+0.8,40,1.2,TG),
     (HUM,tm("13:19.3")-0.8,DUR,15,1.2,TG)]
def means():
    out={}
    for f in set(x[0] for x in SEG):
        r=subprocess.run(['ffmpeg','-hide_banner','-i',M+f,'-af','volumedetect','-vn','-f','null','-'],capture_output=True,text=True).stderr
        out[f]=float(re.search(r'mean_volume: ([-\d.]+)',r)[1])
    return out
def boost():
    e='1'
    for a,b in BLK: e+=f"+1.0*clip(min((t-{a+0.1:.2f})/0.5,({b+0.2:.2f}-t)/0.5),0,1)"
    return "volume='"+e+"':eval=frame"
def gate():
    e='1'
    for a,b in BLK: e+=f"*(1-clip(min((t-{a-0.2:.2f})/0.3,({b+0.2:.2f}-t)/0.3),0,1))"
    return "volume='"+e+"':eval=frame"
def run(sfx=True):
    mn=means(); ins=['-i','/tmp/mers/narr.wav']; fc=[]
    for i,(f,a,b,off,fd,tg) in enumerate(SEG,1):
        d=b-a; ins+=['-i',M+f]; gdb=tg-mn[f]
        fc.append(f"[{i}:a]atrim=start={off}:end={off+d},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:st=0:d={fd},afade=t=out:st={max(0,d-fd)}:d={fd},volume={gdb:.1f}dB,adelay={int(max(a,0)*1000)}|{int(max(a,0)*1000)}[m{i}]")
    n=len(SEG); extra=[]
    if sfx: ins+=['-i','/tmp/mers/build/sfx_bed.wav','-i','/tmp/mers/build/sfx_hits.wav']
    labels=''.join(f'[m{i}]' for i in range(1,n+1))
    fc.append(f"{labels}amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={DUR}[music]")
    fc.append("[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=%d%s"%((3,"[n1][n2][n3]") if sfx else (2,"[n1][n2]")))
    fc.append("[music][n1]sidechaincompress=threshold=0.02:ratio=3.5:attack=20:release=700:makeup=1[duck0]")
    fc.append("[duck0]%s[duck]"%boost())
    mix="[duck][n2]"; cnt=2
    if sfx:
        fc.append(f"[{n+1}:a]aresample=48000,volume=-9dB,{gate()}[bedr]"); fc.append(f"[{n+2}:a]aresample=48000,volume=-9dB,{gate()}[hitsr]")
        fc.append("[bedr][n3]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=500:makeup=1[bedd]")
        mix+="[bedd][hitsr]"; cnt=4
    fc.append(f"{mix}amix=inputs={cnt}:normalize=0:duration=longest,volume=-1.5dB,alimiter=limit=0.93,afade=t=out:st={DUR-3.0:.1f}:d=3.0[out]")
    cmd=['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[out]','-t',str(DUR),'-ar','48000','-ac','2','/tmp/mers/build/mix.wav']
    subprocess.run(cmd,check=True); print('mix ok')
if __name__=='__main__': run(sfx=('--nosfx' not in sys.argv))
