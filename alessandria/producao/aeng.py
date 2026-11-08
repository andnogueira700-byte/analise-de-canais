"""Motor de render — Alessandria 1941."""
import sys,os,json,math,subprocess,re
sys.path.insert(0,'/tmp/alex/tools')
import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageOps
from alib import *
FPS=25
CUTS=json.load(open('/tmp/alex/cuts.json'))
REM=json.load(open('/tmp/alex/rem.json'))
def warp(t): return t-sum(min(max(t-a,0),b-a) for a,b in REM)
DUR=round(float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','/tmp/alex/narr.wav'],capture_output=True,text=True).stdout),2)
def tm(s):
    if isinstance(s,str): m,x=s.split(':'); s=int(m)*60+float(x)
    return warp(s)+2.0+sum(d for c,d in CUTS if c<=s)
BLK=[]; _acc=0.0
for c,d in CUTS: g=warp(c)+2.0+_acc; BLK.append((g,g+d)); _acc+=d
WORDS=json.load(open('/tmp/alex/words.json'))
def _norm(x): return re.sub(r'[^a-zàèéìòù0-9]','',x.lower())
def wt(word,near,end=False):
    """tempo ORIGINAL em que a palavra começa (interpolado dentro do bloco do SRT)"""
    best=None; w=_norm(word)
    for a,b,txt in WORDS:
        toks=txt.split(); n=sum(len(x)+1 for x in toks)
        pos=0
        for tk in toks:
            if _norm(tk).startswith(w) or (len(w)>4 and w in _norm(tk)):
                t=a+(b-a)*((pos+(len(tk) if end else 0))/max(n,1))
                if best is None or abs(t-near)<abs(best-near): best=t
            pos+=len(tk)+1
    if best is None or abs(best-near)>12: raise ValueError(f'palavra {word!r} perto de {near}: {best}')
    return best
def T(word,near,end=False):
    t=wt(word,near,end)
    for c,d in CUTS:
        if c-0.8<t<c: t=c+0.02
    return tm(t)
def mmss(s): m,x=s.split(':'); return int(m)*60+float(x)
def W_(word,ms,end=False): return T(word,mmss(ms),end)
# ---------------------------------------------------------------- planos
SHOTS=[]     # dict(t,k,...)
LAYERS=[]    # (t0,t1,fn(im,t,a,s), name)
def shot(t,k,**kw): kw.update(t=t,k=k); SHOTS.append(kw); return kw
def layer(t0,t1,fn,fi=0.14,fo=0.22,name='txt',slot=None): LAYERS.append(dict(t0=t0,t1=t1,fn=fn,fi=fi,fo=fo,name=name,slot=slot))
def arbitrate():
    """sem texto sobre texto: na mesma zona, a camada anterior termina quando a seguinte começa"""
    by={}
    for L in LAYERS:
        if L['slot']: by.setdefault(L['slot'],[]).append(L)
    for k,v in by.items():
        v.sort(key=lambda L:L['t0'])
        for a,b in zip(v,v[1:]):
            if a['t1']>b['t0']: a['t1']=max(a['t0']+0.3,b['t0'])
def finalize():
    arbitrate()
    SHOTS.sort(key=lambda s:s['t'])
    for i,s in enumerate(SHOTS): s['e']=SHOTS[i+1]['t'] if i+1<len(SHOTS) else DUR; s['id']=i
# ---------------------------------------------------------------- vídeo
SRC={'sneak':'/tmp/alex/vid/sneak.mp4','hood':'/tmp/alex/vid/hood.mp4','ytc':'/tmp/alex/vid/ytcomm.mp4'}
CROP={'sneak':'crop=iw*0.94:ih*0.94','hood':'crop=iw*0.80:ih*0.80:iw*0.10:ih*0.04','ytc':'crop=iw*0.70:ih*0.86:iw*0.15:ih*0.05'}
PW,PH=2112,1188
GRADE="format=gray,format=rgb24,normalize=blackpt=black:whitept=white:smoothing=40:independence=0:strength=0.75,colorchannelmixer=rr=1.06:gg=1.0:bb=0.88,eq=contrast=1.06:gamma=1.18:brightness=0.02,noise=alls=5:allf=t,vignette=angle=PI/8"
def clip_path(s): return f"/tmp/alex/build/clips/c{s['id']:03d}.mp4"
def prep_clip(s):
    p=clip_path(s)
    if os.path.exists(p) and os.path.getsize(p)>1000: return
    os.makedirs(os.path.dirname(p),exist_ok=True)
    d=(s['e']-s['t'])*s.get('sp',1.0)+0.6
    vf=f"{CROP[s['src']]},scale={PW}:{PH}:force_original_aspect_ratio=increase,crop={PW}:{PH},setsar=1"
    if s.get('sp',1.0)!=1.0: vf+=f",setpts=PTS/{s['sp']}"
    vf+=f",fps={FPS},{GRADE}"
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(s['s0']),'-t',str(d),'-i',SRC[s['src']],'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',p],check=True)
class Reader:
    def __init__(s,path,start):
        s.p=subprocess.Popen(['ffmpeg','-v','error','-threads','2','-ss',f'{start:.3f}','-i',path,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=PW*PH*3*2)
        s.last=None
    def next(s):
        b=s.p.stdout.read(PW*PH*3)
        if len(b)==PW*PH*3: s.last=Image.frombuffer('RGB',(PW,PH),b,'raw','RGB',0,1)
        return s.last
    def close(s): s.p.kill()
def kb(im,u,z0,z1,cx0=0.5,cy0=0.5,cx1=None,cy1=None):
    """janela móvel (ken burns) sobre imagem grande -> 1920x1080"""
    cx1=cx0 if cx1 is None else cx1; cy1=cy0 if cy1 is None else cy1
    e=u; z=z0+(z1-z0)*e; cx=cx0+(cx1-cx0)*e; cy=cy0+(cy1-cy0)*e
    iw,ih=im.size; s=max(W/iw,H/ih)*z; w,h=W/s,H/s
    x=(iw-w)*cx; y=(ih-h)*cy
    return im.resize((W,H),Image.BILINEAR,box=(x,y,x+w,y+h))
_pcache={}
def photo_big(path,mode='era',bg=False):
    k=(path,mode,bg)
    if k in _pcache: return _pcache[k]
    im=Image.open(path).convert('RGB')
    if mode=='era': im=era(im,grain=4,vig=0.12)
    if bg:   # foto pequena/retrato: fundo desfocado + foto inteira no centro
        big=cover(im,PW,PH).filter(ImageFilter.GaussianBlur(28)); big=Image.eval(big,lambda v:int(v*0.45))
        f=im.copy(); f.thumbnail((int(PW*0.62),int(PH*0.80))); fr=Image.new('RGB',(f.width+16,f.height+16),ACC); fr.paste(f,(8,8))
        big.paste(fr,((PW-fr.width)//2,(PH-fr.height)//2)); im=big
    else:
        im=cover(im,max(PW,int(im.width*PH/im.height)) if im.width/im.height>PW/PH else PW, PH if im.width/im.height>PW/PH else int(im.height*PW/im.width))
    _pcache[k]=im; return im
def photo_big(path,mode='era',bg=False):
    k=(path,mode,bg)
    if k in _pcache: return _pcache[k]
    im=Image.open(path).convert('RGB')
    if mode=='era': im=era(im,grain=4,vig=0.12)
    if bg:
        big=cover(im,PW,PH).filter(ImageFilter.GaussianBlur(28)); big=Image.eval(big,lambda v:int(v*0.4))
        f=im.copy(); f.thumbnail((int(PW*0.6),int(PH*0.78)))
        if f.height<PH*0.6: f=f.resize((int(f.width*PH*0.6/f.height),int(PH*0.6)),Image.LANCZOS)
        fr=Image.new('RGB',(f.width+16,f.height+16),ACC); fr.paste(f,(8,8))
        big.paste(fr,((PW-fr.width)//2,(PH-fr.height)//2)); im=big
    else:
        s=max(PW/im.width,PH/im.height); im=im.resize((int(im.width*s+1),int(im.height*s+1)),Image.LANCZOS)
    _pcache[k]=im; return im
def lalpha(L,t):
    if t<L['t0'] or t>=L['t1']: return 0.0
    return max(0.0,min(1.0,(t-L['t0'])/L['fi'] if L['fi']>0 else 1,(L['t1']-t)/L['fo'] if L['fo']>0 else 1))
def blk_factor(t):
    for a,b in BLK:
        if a-0.4<=t<=b+0.4:
            if a<=t<=b: return 0.0
            return min(1.0,(a-t)/0.4) if t<a else min(1.0,(t-b)/0.4)
    if t<0.5: return t/0.5
    if t>DUR-1.2: return max(0.0,(DUR-t)/1.2)
    return 1.0
def render_chunk(f0,f1,out):
    finalize_done=True
    enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','veryfast','-threads','2','-crf','19','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
    rd=None; rid=None
    for f in range(f0,f1):
        t=f/FPS; s=next((x for x in SHOTS if x['t']<=t<x['e']),SHOTS[-1]); tl=t-s['t']; u=tl/max(s['e']-s['t'],1e-6)
        k=s['k']
        if k=='v':
            if rid!=s['id']:
                if rd: rd.close()
                rd=Reader(clip_path(s),tl*s.get('sp',1.0)); rid=s['id']
            fr=rd.next()
            base=kb(fr,ease(u) if s.get('ease') else u,s.get('z0',1.0),s.get('z1',1.06),s.get('cx',0.5),s.get('cy',0.5),s.get('cx1'),s.get('cy1')) if fr else Image.new('RGB',(W,H))
        elif k=='p':
            base=kb(photo_big(s['img'],s.get('mode','era'),s.get('bg',False)),u,s.get('z0',1.0),s.get('z1',1.08),s.get('cx',0.5),s.get('cy',0.5),s.get('cx1'),s.get('cy1'))
        elif k=='g':
            base=s['fn'](tl,u)
        else: base=Image.new('RGB',(W,H))
        im=base.convert('RGBA') if base.mode!='RGBA' else base
        if s.get('dim'): im.alpha_composite(Image.new('RGBA',(W,H),(4,10,20,int(255*s['dim']*0.7))))
        for L in LAYERS:
            a=lalpha(L,t)
            if a>0: L['fn'](im,t-L['t0'],a)
        bf=blk_factor(t)
        if bf<1: im=Image.blend(Image.new('RGBA',(W,H),(0,0,0,255)),im,bf)
        enc.stdin.write(im.convert('RGB').tobytes())
    if rd: rd.close()
    enc.stdin.close(); enc.wait()
