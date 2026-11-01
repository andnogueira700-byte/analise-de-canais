# -*- coding: utf-8 -*-
"""Mers-el-Kébir — plano completo (cenas, textos, cartões, mapas)."""
import sys; sys.path.insert(0,'/tmp/mers/tools')
import sys,json,os,re,copy,subprocess
from mlib import *
import prep
DUR_N=936.3
cuts=json.load(open('/tmp/mers/cuts.json'))
def tm(s):                      # "m:ss.s" ou segundos (tempo ORIGINAL do áudio) -> tempo no vídeo
    if isinstance(s,str): m,x=s.split(':'); s=int(m)*60+float(x)
    return s+2.0+sum(d for c,d in cuts if c<=s)
BLK=[]; acc=0.0
for c,d in cuts:
    gs=c+2.0+acc; BLK.append((gs-0.15,gs+d+0.25)); acc+=d
DUR=936.3
# ------------------------------------------------------------------ imagens
IM='/tmp/mers/img/'
POOLC={'churchill':['loc_churchill.jpg'],'churchill_pm':['w_churchill_pm.jpg','loc_churchill.jpg'],'darlan':['w_darlan.jpg','loc_darlan.jpg'],'petain_hitler':['loc_hitler_petain.jpg','w_petain_hitler.jpg'],
 'compiegne1':['loc_compiegne1.jpg'],'compiegne2':['loc_compiegne2.jpg'],'compiegne3':['loc_compiegne3.jpg'],'toulon_air':['loc_toulon.jpg'],'fdr':['loc_fdr.jpg'],'cartoon_swine':['loc_cartoon_swine.jpg'],'cartoon_ships':['loc_cartoon_ships.jpg'],
 'bretagne':['w_mers_bretagne.jpg'],'strasbourg_mers':['w_mers_strasbourg.jpg'],'mogador':['w_mers_mogador.jpg'],'mers':['w_mers_on005.jpg'],'dunkerque':['w_dunkerque1.jpg','w_dunkerque1940.jpg'],'strasbourg':['w_strasbourg1.jpg'],'provence':['w_provence1.jpg'],
 'valiant':['w_valiant.jpg'],'richelieu':['w_richelieu1.jpg'],'hermes':['w_hermes.jpg'],'surcouf':['w_surcouf.jpg'],'toulon_panzer':['w_toulon_panzer.jpg'],'toulon_ship':['w_toulon_ship.jpg'],'compiegne_hitler':['w_compiegne_hitler.jpg'],
 'somerville':['w_somerville.jpg'],'somerville2':['w_somerville_warspite.jpg'],'cunningham':['w_cunningham.jpg'],'holland':[],'laborde':['w_laborde.jpg'],'lacouture':['w_lacouture.jpg'],'petain':['w_petain.jpg'],
 'hood':['w_hood_iwm.jpg','w_hood1932.jpg','w_hood_h60450.jpg'],'ark':['w_ark_planes.jpg','w_ark_swordfish.jpg','w_ark1.jpg'],'swordfish':['w_swordfish_flight.jpg','w_swordfish2.jpg'],'foxhound':['w_foxhound.jpg'],'destroyers':['w_destroyers_bases.jpg'],
 'courbet':['w_courbet.jpg'],'paris':['w_paris.jpg'],'resolution':['w_resolution.jpg'],'oran_old':['loc_oran_harbor.jpg']}
USED=[]
def pimg(alias):
    for f in POOLC.get(alias,[]):
        p=IM+f
        if os.path.exists(p):
            try: Image.open(p).verify(); return p
            except Exception: pass
    return None
def pimg_or(alias,*fall):
    for a in (alias,)+fall:
        p=pimg(a)
        if p: USED.append(a); return p
    USED.append('mers'); return pimg('mers')
NEWS={'wilm':'wilm_0704','star':'star_0704','wdn':'wdn_0704','keywest':'keywest_0705','star23':'star_0623'}
def news_clip(k):
    out=f'/tmp/mers/news/clip_{k}.jpg'
    if not os.path.exists(out):
        im=Image.open(f'/tmp/mers/news/{NEWS[k]}.jpg').convert('L'); w,h=im.size; ch=int(w*9/16*0.98); im.crop((0,0,w,ch)).convert('RGB').save(out,quality=90)
    return out
# ------------------------------------------------------------------ montagem
shots=[]; TRX={}
class NewsShot(Shot):
    def __init__(s,t0,t1,**k):
        Shot.__init__(s,t0,t1,**k); s.img=Image.open(k['key']).convert('RGB'); s.iw,s.ih=s.img.size
    def xf(s,t):
        z0,z1=s.k.get('z',(1.0,1.12)); z=z0+(z1-z0)*ease(s.p(t)); c=s.k.get('c',(.5,.3))
        vw=s.iw/z; vh=s.ih/z; x0=min(max(c[0]*s.iw-vw/2,0),s.iw-vw); y0=min(max(c[1]*s.ih-vh/2,0),s.ih-vh); return x0,y0,vw,vh
    def render(s,t):
        x0,y0,vw,vh=s.xf(t); return s.img.crop((int(x0),int(y0),int(x0+vw),int(y0+vh))).resize((W,H),Image.LANCZOS)
def news_marks(shot,marks):
    """marks: [(t_rel, (x0,y0,x1,y1) em fração da página, 'hi'|'box')] — grifo amarelo que varre + moldura vermelha"""
    def fn(t,im,s_):
        if not (shot.t0<=t<=shot.t1): return
        x0,y0,vw,vh=shot.xf(t); ov,d=newov()
        for tr,(a,b,c,e),kind in marks:
            tt=t-(shot.t0+tr)
            if tt<0: continue
            X0=(a*shot.iw-x0)*W/vw; X1=(c*shot.iw-x0)*W/vw; Y0=(b*shot.ih-y0)*H/vh; Y1=(e*shot.ih-y0)*H/vh
            u=min(1,tt/0.7); xe=X0+(X1-X0)*ease(u)
            if kind=='hi':
                d.rectangle([X0,Y0,xe,Y1],fill=(255,225,40,115))
            d.rectangle([X0-6,Y0-6,X1+6,Y1+6],outline=(230,57,70,int(255*min(1,max(0,(tt-0.5)/0.3)))),width=7)
        over(im,ov)
    LAYERS.append((shot.t0,shot.t1,fn))
class Blk(Shot):
    def render(s,t): return Image.new('RGB',(W,H),(0,0,0))
def vclip(clip,ss,t0,t1,name,**k):
    dur=(t1-t0)+1.2; p=prep.prep(clip,ss,dur,name)
    ar=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0:s=x',p],capture_output=True,text=True).stdout.strip().split('x'); sz=(int(ar[0]),int(ar[1]))
    return Video(t0,t1,key=p,ss=0.0,size=sz,**k)
PLAN=[]   # (t_orig, kind, args, opts)
def A(t,kind,*a,**o): PLAN.append((tm(t),kind,a,o))
def gfx_window(t0,t1): return Gfx(t0,t1,fn=lambda t,s: black_bg())
def build_shots():
    P=sorted(PLAN,key=lambda x:x[0]); prev_end=0.0; seq=[]
    for i,(t0,kind,a,o) in enumerate(P):
        t1=P[i+1][0] if i+1<len(P) else DUR
        if kind=='P':
            p=pimg_or(*a); z=o.get('z',(1.0,1.10)); c=o.get('c',((.5,.5),(.5,.5)))
            seq.append(Photo(t0,t1,key=p,z=z,c=c,seed=len(seq)+1.0,cover=o.get('cover',False)))
        elif kind=='N':
            ns=NewsShot(t0,t1,key=news_clip(a[0]),z=o.get('z',(1.0,1.12)),c=o.get('c',(.5,.3)),look='full'); seq.append(ns)
            if o.get('marks'): news_marks(ns,o['marks'])
            TRX[round(t0,2)]='diss'
        elif kind=='V':
            seq.append(vclip(a[0],a[1],t0,t1,f'seg{len(seq):03d}_{a[0]}_{int(a[1])}',zoom=o.get('zoom',1.06),z0=o.get('z0',1.0),cy=o.get('cy',0.5),c=o.get('c',(.5,.5))))
        elif kind=='B3':   # vídeo 3D do Blender
            seq.append(Video(t0,t1,key=a[0],ss=0.0,zoom=1.0,look='light'))
        elif kind=='G':
            seq.append(gfx_window(t0,t1))
        if o.get('diss'): TRX[round(t0,2)]='diss'
    # cortes para as telas pretas das pausas
    out=[]
    for s in seq:
        cur=s
        for (a,b) in BLK:
            if cur is None: break
            if cur.t1<=a or cur.t0>=b: continue
            if cur.t0<a: h=copy.copy(cur); h.t1=a; out.append(h)
            if cur.t1>b: tl=copy.copy(cur); tl.t0=b; cur=tl; TRX[round(b,2)]='diss'
            else: cur=None
        if cur is not None: out.append(cur)
    for (a,b) in BLK: out.append(Blk(a,b)); TRX[round(a,2)]='diss'
    out.sort(key=lambda x:x.t0)
    # costura: sem lacunas
    for i in range(len(out)-1): out[i].t1=out[i+1].t0
    out[0].t0=0.0; out[-1].t1=DUR
    shots[:]=out
    for s in shots:
        if isinstance(s,Photo) and round(s.t0,2) not in TRX: TRX[round(s.t0,2)]='diss'
    dcore.TRANS.update(TRX)
