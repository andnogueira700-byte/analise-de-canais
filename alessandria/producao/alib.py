"""Alessandria 1941 — biblioteca gráfica no estilo de referência (paleta 1: azul-marinho + âmbar)."""
import math,json,random
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps,ImageChops
W,H=1920,1080
BG=(12,24,40); BG2=(24,44,70); ACC=(255,176,0); ACC_D=(148,109,18); WHITE=(245,245,240); PAPER=(232,224,204); INK=(28,28,30); RED=(214,64,52); SEA=(14,30,50); LAND=(46,58,72); BORD=(84,102,124)
F={'x':'/tmp/alex/fonts/Montserrat_800.ttf','s':'/tmp/alex/fonts/Montserrat_600.ttf','t':'/tmp/alex/fonts/CourierPrime_700.ttf'}
_fc={}
def fnt(k,sz):
    if (k,sz) not in _fc: _fc[(k,sz)]=ImageFont.truetype(F[k],sz)
    return _fc[(k,sz)]
def ease(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def eo(x): x=max(0,min(1,x)); return 1-(1-x)**3
def stripes(w=W,h=H,c1=BG,c2=(16,32,52),step=90):
    im=Image.new('RGB',(w,h),c1); d=ImageDraw.Draw(im)
    for x in range(-h,w+h,step): d.polygon([(x,h),(x+step/2,h),(x+step/2+h,0),(x+h,0)],fill=c2)
    return im
def cover(im,w=W,h=H,z=1.0,cx=0.5,cy=0.5):
    iw,ih=im.size; s=max(w/iw,h/ih)*z; nw,nh=int(iw*s+0.5),int(ih*s+0.5); im=im.resize((nw,nh),Image.LANCZOS)
    x=int((nw-w)*cx); y=int((nh-h)*cy); return im.crop((x,y,x+w,y+h))
def era(im,warm=0.22,grain=10,vig=0.55,seed=0):
    g=ImageOps.grayscale(im.convert('RGB')); g=ImageOps.autocontrast(g,cutoff=1)
    a=np.asarray(g).astype(np.float32)/255.
    r=a*(1+warm*0.35); gg=a*(1+warm*0.12); b=a*(1-warm*0.25)
    out=np.stack([r,gg,b],-1)
    h,w=a.shape; yy,xx=np.mgrid[0:h,0:w]; dd=((xx-w/2)/(w/2))**2+((yy-h/2)/(h/2))**2; out*=(1-vig*np.clip(dd-0.25,0,1)*0.8)[...,None]
    rng=np.random.default_rng(seed); out+=rng.normal(0,grain/255.,(h,w,1))
    return Image.fromarray((np.clip(out,0,1)*255).astype(np.uint8))
def glow_text(base,xy,txt,font,col=ACC,glow=18,anchor='mm',al=1.0,stroke=0):
    lay=Image.new('RGBA',base.size,(0,0,0,0)); d=ImageDraw.Draw(lay); d.text(xy,txt,font=font,fill=col+(255,),anchor=anchor,stroke_width=stroke,stroke_fill=(0,0,0,255))
    g=lay.filter(ImageFilter.GaussianBlur(glow)); ga=g.getchannel('A').point(lambda v:int(min(255,v*1.6)*0.85*al)); g.putalpha(ga)
    base.alpha_composite(g); 
    if al<1: lay.putalpha(lay.getchannel('A').point(lambda v:int(v*al)))
    base.alpha_composite(lay)
def chip(base,x,y,txt,sz=30,bg=ACC,fg=BG,anchor='l',al=1.0,pad=(20,10),sp=2):
    f=fnt('x',sz); txt=txt.upper(); d0=ImageDraw.Draw(base); tw=sum(d0.textlength(c,font=f) for c in txt)+sp*(len(txt)-1)
    bw,bh=int(tw+2*pad[0]),int(sz*1.05+2*pad[1])
    if anchor=='c': x=x-bw//2
    elif anchor=='r': x=x-bw
    lay=Image.new('RGBA',(bw,bh),bg+(255,)); d=ImageDraw.Draw(lay); cx=pad[0]
    for c in txt: d.text((cx,bh/2),c,font=f,fill=fg+(255,),anchor='lm'); cx+=d.textlength(c,font=f)+sp
    if al<1: lay.putalpha(int(255*al))
    base.alpha_composite(lay,(int(x),int(y))); return bw,bh
def stamp(base,cx,cy,txt,sz=70,col=ACC,ang=8,al=1.0):
    f=fnt('x',sz); d0=ImageDraw.Draw(base); tw=d0.textlength(txt,font=f); bw,bh=int(tw+90),int(sz*1.7)
    lay=Image.new('RGBA',(bw+40,bh+40),(0,0,0,0)); d=ImageDraw.Draw(lay)
    d.rectangle([20,20,20+bw,20+bh],outline=col+(255,),width=8); d.text((20+bw/2,20+bh/2),txt,font=f,fill=col+(255,),anchor='mm')
    n=np.asarray(lay).copy(); rng=np.random.default_rng(3); m=rng.random(n.shape[:2])<0.10; n[m,3]=(n[m,3]*0.3).astype(np.uint8); lay=Image.fromarray(n)
    lay=lay.rotate(ang,resample=Image.BICUBIC,expand=True)
    if al<1: lay.putalpha(lay.getchannel('A').point(lambda v:int(v*al)))
    base.alpha_composite(lay,(int(cx-lay.width/2),int(cy-lay.height/2)))
def framed(im,w,h,border=8,col=ACC):
    p=cover(im.convert('RGB'),w,h); p=era(p,grain=6,vig=0.3)
    out=Image.new('RGBA',(w+2*border,h+2*border),col+(255,)); out.paste(p,(border,border)); return out
def silhouette(w,h):
    im=Image.new('RGB',(w,h),(20,26,34)); d=ImageDraw.Draw(im)
    d.ellipse([w*0.3,h*0.14,w*0.7,h*0.52],fill=(48,56,66)); d.ellipse([w*0.1,h*0.56,w*0.9,h*1.3],fill=(48,56,66))
    d.text((w/2,h*0.92),'FOTO NON TROVATA',font=fnt('s',max(12,w//16)),fill=(150,160,170),anchor='mm'); return im
def person(base,x,y,photo,name,role,pw=230,ph=280,al=1.0):
    fr=framed(photo,pw,ph) if photo is not None else framed(silhouette(pw,ph),pw,ph)
    if al<1: fr.putalpha(int(255*al))
    base.alpha_composite(fr,(x,y)); d=ImageDraw.Draw(base)
    lines=name.upper().split('\n'); yy=y+ph+30
    for ln in lines:
        lay=Image.new('RGBA',base.size,(0,0,0,0)); ImageDraw.Draw(lay).text((x,yy),ln,font=fnt('x',34),fill=WHITE+(int(255*al),),stroke_width=2,stroke_fill=(0,0,0,int(200*al))); base.alpha_composite(lay); yy+=40
    chip(base,x,yy+6,role,sz=19,al=al,pad=(12,7),sp=1)
def lower_third(base,name,role,x=90,y=880):
    d=ImageDraw.Draw(base); d.text((x,y),name.upper(),font=fnt('x',46),fill=WHITE,stroke_width=2,stroke_fill=(0,0,0)); chip(base,x,y+62,role,sz=22,pad=(14,8))
def label_corner(base,txt,sub=None,side='l',y=70):
    x=90 if side=='l' else W-90; a='l' if side=='l' else 'r'
    chip(base,x,y,txt,sz=26,anchor=a)
    if sub: chip(base,x,y+58,sub,sz=18,bg=BG,fg=ACC,anchor=a,pad=(12,6))
def dossier(base,x,y,w,h,title,lines,rows=None,img=None,head='SCHEDA'):
    lay=Image.new('RGBA',(w,h),PAPER+(255,)); d=ImageDraw.Draw(lay); d.rectangle([0,0,w-1,h-1],outline=ACC+(255,),width=8)
    d.text((34,30),head,font=fnt('t',24),fill=ACC_D); d.text((34,62),title.upper(),font=fnt('x',44),fill=INK)
    yy=128
    for ln in lines: d.text((34,yy),ln,font=fnt('t',28),fill=(70,64,56)); yy+=38
    if rows:
        yy+=16
        for lab,val,frac in rows:
            d.text((34,yy),lab.upper(),font=fnt('s',24),fill=(60,58,54)); d.text((w-34,yy),val,font=fnt('x',26),fill=INK,anchor='ra')
            bx=34; by=yy+38; d.rectangle([bx,by,w-34,by+12],fill=(205,196,176)); d.rectangle([bx,by,bx+(w-68)*frac,by+12],fill=ACC); yy+=74
    if img is not None:
        p=img.copy(); p.thumbnail((int(w*0.95),int(h*0.5))); lay.alpha_composite(p,(int((w-p.width)/2),h-p.height-20))
    base.alpha_composite(lay,(x,y))
def comment_box(base,q,cta='SCRIVILO NEI COMMENTI'):
    w,h=1100,300; x,y=(W-w)//2,330; lay=Image.new('RGBA',(w,h),(250,250,250,255)); d=ImageDraw.Draw(lay)
    d.ellipse([30,34,100,104],fill=(110,120,135)); d.text((125,40),'@tu',font=fnt('x',26),fill=(30,30,30)); d.text((210,44),'adesso',font=fnt('s',22),fill=(130,130,130))
    yy=92
    for ln in q.split('\n'): d.text((125,yy),ln,font=fnt('s',38),fill=(25,25,25)); yy+=52
    d.text((125,h-50),'MI PIACE    ·    RISPONDI',font=fnt('s',22),fill=(110,110,110))
    base.alpha_composite(lay,(x,y)); chip(base,W//2,y+h+40,cta,sz=34,anchor='c')
def big_number(base,num,sub,cx=W//2,cy=470):
    glow_text(base,(cx,cy),num,fnt('x',190),ACC,glow=22); chip(base,cx,cy+140,sub,sz=30,anchor='c',bg=WHITE,fg=BG)
def timeline(base,items,lit,y=560,x0=180,x1=1740):
    d=ImageDraw.Draw(base); d.line([(x0,y),(x1,y)],fill=(120,135,155),width=6)
    n=len(items)
    for i,(yr,lab) in enumerate(items):
        x=x0+(x1-x0)*i/(n-1); on=i in lit; c=ACC if on else (120,135,155)
        d.ellipse([x-18,y-18,x+18,y+18],fill=c, outline=BG,width=4)
        d.text((x,y-60),yr,font=fnt('x',44 if on else 36),fill=c,anchor='ms')
        yy=y+56
        for ln in lab.split('\n'): d.text((x,yy),ln.upper(),font=fnt('s',22),fill=WHITE if on else (150,160,175),anchor='ma'); yy+=30
# --------------------------------------------------------------- mapa
_C=json.load(open('/tmp/mers/geo/countries.json')); COUNTRIES={}
for ft in _C['features']:
    nm=ft['properties'].get('NAME') or ft['properties'].get('ADMIN'); g=ft['geometry']; polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    rings=[np.array(pl[0],dtype=np.float32) for pl in polys]; rings=[r for r in rings if not(r[:,0].max()<-10 or r[:,0].min()>45 or r[:,1].max()<20 or r[:,1].min()>55)]
    if rings: COUNTRIES[nm]=rings
def mp(lon,lat,cam):
    clon,clat,s=cam; k=math.cos(math.radians(clat))*s; return ((lon-clon)*k+W/2,(clat-lat)*s+H/2)
def draw_map(base,cam,hl=None):
    hl=hl or {}; d=ImageDraw.Draw(base); d.rectangle([0,0,W,H],fill=SEA)
    for x in range(-H,W+H,120): d.line([(x,H),(x+H,0)],fill=(18,36,58),width=40)
    for nm,rings in COUNTRIES.items():
        for r in rings:
            pts=[mp(float(a),float(b),cam) for a,b in r]
            xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
            if max(xs)<-50 or min(xs)>W+50 or max(ys)<-50 or min(ys)>H+50: continue
            d.polygon(pts,fill=hl.get(nm,LAND),outline=BORD)
def icon(base,path,x,y,w,flip=False,al=1.0):
    im=Image.open(path).convert('RGBA'); bb=im.getbbox(); im=im.crop(bb); h=int(im.height*w/im.width); im=im.resize((int(w),h),Image.LANCZOS)
    if flip: im=ImageOps.mirror(im)
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*0.45))); sh=sh.filter(ImageFilter.GaussianBlur(6))
    base.alpha_composite(sh,(int(x-w/2+6),int(y-h/2+10)))
    if al<1: im.putalpha(im.getchannel('A').point(lambda v:int(v*al)))
    base.alpha_composite(im,(int(x-w/2),int(y-h/2)))
def arrow(base,pts,col=ACC,w=10,head=34,dash=False):
    d=ImageDraw.Draw(base)
    if dash:
        for a,b in zip(pts,pts[1:]):
            L=math.dist(a,b); n=int(L/30)
            for i in range(0,n,2): u0,u1=i/n,min(1,(i+1)/n); d.line([(a[0]+(b[0]-a[0])*u0,a[1]+(b[1]-a[1])*u0),(a[0]+(b[0]-a[0])*u1,a[1]+(b[1]-a[1])*u1)],fill=col,width=w)
    else: d.line(pts,fill=col,width=w,joint='curve')
    (x0,y0),(x1,y1)=pts[-2],pts[-1]; a=math.atan2(y1-y0,x1-x0)
    d.polygon([(x1+math.cos(a)*head*0.6,y1+math.sin(a)*head*0.6),(x1+math.cos(a+2.5)*head,y1+math.sin(a+2.5)*head),(x1+math.cos(a-2.5)*head,y1+math.sin(a-2.5)*head)],fill=col)
def pin(base,x,y,txt,col=ACC,side='r'):
    d=ImageDraw.Draw(base); d.ellipse([x-13,y-13,x+13,y+13],fill=col,outline=BG,width=4)
    chip(base,x+(26 if side=='r' else -26),y-24,txt,sz=24,anchor='l' if side=='r' else 'r',bg=WHITE,fg=BG,pad=(12,7))
