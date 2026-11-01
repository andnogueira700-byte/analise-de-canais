"""Mers-el-Kébir — biblioteca: mapas, documentos, relógio, cartões de personagem."""
import sys; sys.path.insert(0,"/tmp/mers/tools")
import sys,math,json,os
from dcore import *
import dcore
from dgfx import *
from dgfxZ import *
import dturret
from dturret import L_diagram,arrow
from dico import put
from PIL import Image,ImageDraw,ImageFilter
import numpy as np
SEA=(15,32,54); LAND=(56,64,52); BORD=(104,116,100)
RED=(230,57,70); AMB=(255,183,3); CY=(46,196,241); GRN=(110,205,120); CREAM=(244,232,205); BLU=(70,120,205); FRC=(60,100,170); GBC=(190,60,70)
# ------------------------------------------------------------------ mapa
_C=json.load(open('/tmp/mers/geo/countries.json'))
COUNTRIES={}
for ft in _C['features']:
    nm=ft['properties'].get('NAME') or ft['properties'].get('ADMIN'); g=ft['geometry']
    polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    rings=[]
    for pl in polys:
        r=np.array(pl[0],dtype=np.float32)
        if r[:,0].max()<-35 or r[:,0].min()>70 or r[:,1].max()<8 or r[:,1].min()>72: continue
        if len(r)>900: r=r[::3]
        elif len(r)>300: r=r[::2]
        rings.append(r)
    if rings: COUNTRIES[nm]=rings
def mp(lon,lat,cam):
    clon,clat,s=cam; return ((lon-clon)*math.cos(math.radians(clat))*s+W/2,(clat-lat)*s+H/2)
def draw_map(d,cam,hl=None,al=1.0):
    hl=hl or {}; clon,clat,s=cam; d.rectangle([0,0,W,H],fill=SEA+(255,))
    k=math.cos(math.radians(clat))*s
    for nm,rings in COUNTRIES.items():
        col=hl.get(nm,LAND)
        for r in rings:
            x=(r[:,0]-clon)*k+W/2; y=(clat-r[:,1])*s+H/2
            if x.max()<-50 or x.min()>W+50 or y.max()<-50 or y.min()>H+50: continue
            pts=list(zip(x.tolist(),y.tolist())); d.polygon(pts,fill=col+(255,),outline=BORD+(255,))
def cam_at(t,keys):
    if t<=keys[0][0]: return keys[0][1:]
    for a,b in zip(keys,keys[1:]):
        if t<=b[0]:
            x=ease((t-a[0])/max(b[0]-a[0],1e-6)); return tuple(a[i]+(b[i]-a[i])*x for i in (1,2,3))
    return keys[-1][1:]
def tlab(d,x,y,txt,col=CREAM,sz=30,anchor='c',al=1.0):
    if al<=0.01: return
    f=serif(int(sz*1.2),'Bold'); w=tw(d,txt,f); xx={'l':x,'c':x-w/2,'r':x-w}[anchor]
    if al>=0.98:
        d.text((xx,y),txt,font=f,fill=col+(255,),stroke_width=3,stroke_fill=(8,10,14,255)); return
    pad=14; bb=f.getbbox(txt,stroke_width=3); tw_,th_=int(bb[2]-bb[0]+2*pad),int(bb[3]-bb[1]+2*pad)
    lay=Image.new('RGBA',(tw_,th_),(0,0,0,0)); ImageDraw.Draw(lay).text((pad-bb[0],pad-bb[1]),txt,font=f,fill=col+(255,),stroke_width=3,stroke_fill=(8,10,14,255))
    lay.putalpha(lay.getchannel('A').point(lambda v:int(v*al)))
    ox,oy=int(xx+bb[0]-pad),int(y+bb[1]-pad); ov=d._image
    x0,y0=max(ox,0),max(oy,0); x1,y1=min(ox+tw_,ov.width),min(oy+th_,ov.height)
    if x1>x0 and y1>y0: ov.alpha_composite(lay.crop((x0-ox,y0-oy,x1-ox,y1-oy)),(x0,y0))
def map_scene(t0,t1,keys,elems,hl=None,base=None,yoff=0,drift=0.07):
    """keys: [(t,lon,lat,s)]; elems: lista de dicts com 'k' (icon|arrow|pin|label|x|ring), 't' de entrada"""
    def draw(t,d,a):
        cam=cam_at(t,keys); u_=(t-t0)/max(t1-t0,1e-6); cam=(cam[0],cam[1]-yoff/cam[2],cam[2]*(1+drift*ease(u_)))
        if base: base(d,cam,t)
        else: draw_map(d,cam,hl)
        for e in elems:
            if t<e['t']: continue
            k=min(1,(t-e['t'])/e.get('fi',0.5)); kk=ease(k)
            if e['k']=='arrow':
                a0=mp(*e['a'],cam); b0=mp(*e['b'],cam); u=ease((t-e['t'])/e.get('d',1.5)); p=(a0[0]+(b0[0]-a0[0])*u,a0[1]+(b0[1]-a0[1])*u)
                col=e.get('c',RED); d.line([a0,p],fill=col+(255,),width=e.get('w',9))
                if e.get('ship') and u>=0.99:
                    uu=((t-e['t']-e.get('d',1.5))/e.get('lap',4.0))%1.0; q=(a0[0]+(b0[0]-a0[0])*uu,a0[1]+(b0[1]-a0[1])*uu); put(d,e['ship'],q[0],q[1]+16+3*math.sin(t*2.2),e.get('sh',80),flip=(b0[0]<a0[0]))
                elif e.get('ship'): put(d,e['ship'],p[0],p[1]+16,e.get('sh',80),flip=(b0[0]<a0[0]))
                if u>0.05:
                    ang=math.atan2(p[1]-a0[1],p[0]-a0[0]); hd=e.get('w',9)*2.6
                    d.polygon([p,(p[0]-hd*math.cos(ang-0.45),p[1]-hd*math.sin(ang-0.45)),(p[0]-hd*math.cos(ang+0.45),p[1]-hd*math.sin(ang+0.45))],fill=col+(255,))
            elif e['k']=='icon':
                p=e['p']; 
                if 'move' in e:
                    m=e['move']; u=ease((t-e['t'])/max(m[2]-e['t'],1e-6)); p=(p[0]+(m[0]-p[0])*u,p[1]+(m[1]-p[1])*u)
                x,y=mp(*p,cam); put(d,e['n'],x,y+e.get('dy',20)+3*math.sin(t*2.0+x*0.01),e.get('h',90)*kk,flip=e.get('flip',False))
                if e.get('lab'): tlab(d,x,y+e.get('dy',20)+6,e['lab'],e.get('lc',CREAM),e.get('ls',24),al=kk)
            elif e['k']=='pin':
                x,y=mp(*e['p'],cam); c=e.get('c',RED); r=14
                d.ellipse([x-r,y-r,x+r,y+r],fill=c+(255,),outline=CREAM+(255,),width=4)
                if e.get('txt'): tlab(d,x,y-58,e['txt'],CREAM,e.get('sz',30),al=kk)
            elif e['k']=='label':
                x,y=mp(*e['p'],cam); tlab(d,x,y,e['txt'],e.get('c',CREAM),e.get('sz',28),e.get('anchor','c'),kk)
            elif e['k']=='x':
                x,y=mp(*e['p'],cam); r=e.get('r',46); d.line([(x-r,y-r),(x+r,y+r)],fill=RED+(255,),width=14); d.line([(x+r,y-r),(x-r,y+r)],fill=RED+(255,),width=14)
            elif e['k']=='ring':
                x,y=mp(*e['p'],cam); r=e.get('r',60)*(1+0.12*math.sin(t*5)); d.ellipse([x-r,y-r,x+r,y+r],outline=e.get('c',AMB)+(255,),width=6)
            elif e['k']=='text':
                tlab(d,e['x'],e['y'],e['txt'],e.get('c',CREAM),e.get('sz',40),e.get('anchor','c'),kk)
            elif e['k']=='img':
                x,y=mp(*e['p'],cam); put(d,e['n'],x,y,e.get('h',90)*kk)
    L_diagram(t0,t1,draw)
# ------------------------------------------------------------------ documento (máquina de escrever)
def doc_scene(t0,t1,head,lines,hl=(),cps=34.0,y0=250,size=40,strike=(),x0=330,wdt=1260):
    f=elite(size); fh=elite(int(size*0.7))
    def draw(t,d,a):
        d.rectangle([x0-60,y0-120,x0+wdt+60,y0+len(lines)*(size*1.55)+90],fill=(226,216,190,255),outline=(120,110,90,255),width=6)
        d.text((x0,y0-90),head,font=fh,fill=(100,40,35,255))
        left=int(max(0,t-t0-0.4)*cps); yy=y0
        for i,ln in enumerate(lines):
            n=max(0,min(len(ln),left)); left-=len(ln)
            sh=ln[:n]; xx=x0
            if sh:
                words=sh.split(' '); cx=xx
                for w_ in words:
                    col=(150,40,30,255) if any(h_.lower() in w_.lower() for h_ in hl) else (50,42,36,255)
                    d.text((cx,yy),w_+' ',font=f,fill=col); wlen=d.textlength(w_+' ',font=f)
                    if any(sx.lower() in w_.lower() for sx in strike): d.line([(cx,yy+size*0.55),(cx+wlen-8,yy+size*0.55)],fill=(190,30,30,255),width=6)
                    cx+=wlen
            yy+=size*1.55
    L_diagram(t0,t1,draw)
# ------------------------------------------------------------------ relógio analógico + linha do tempo
def clock_scene(t0,t1,events,title=None,cx=620,cy=560,R=330,side=True):
    """events: [(t, hh, mm, rótulo, cor)] — o ponteiro vai até cada horário no instante t"""
    def hm(t):
        prev=(t0-1,events[0][1]*60+events[0][2]-20)
        for e in events:
            if t<e[0]:
                a=prev; u=ease((t-a[0])/max(e[0]-a[0],1e-6)); return a[1]+(e[1]*60+e[2]-a[1])*u
            prev=(e[0],e[1]*60+e[2])
        return prev[1]
    def draw(t,d,a):
        d.ellipse([cx-R,cy-R,cx+R,cy+R],fill=(236,228,205,255),outline=(30,34,40,255),width=14)
        for i in range(60):
            ang=math.radians(i*6-90); r1=R-18 if i%5 else R-40
            d.line([(cx+r1*math.cos(ang),cy+r1*math.sin(ang)),(cx+(R-8)*math.cos(ang),cy+(R-8)*math.sin(ang))],fill=(40,40,44,255),width=4 if i%5==0 else 2)
        for h in range(1,13):
            ang=math.radians(h*30-90); tlab(d,cx+(R-78)*math.cos(ang),cy+(R-78)*math.sin(ang)-22,str(h),(30,30,34),44)
        m=hm(t); ma=math.radians((m%60)*6-90); ha=math.radians(((m/60)%12)*30-90)
        d.line([(cx,cy),(cx+(R-70)*math.cos(ma),cy+(R-70)*math.sin(ma))],fill=(20,22,26,255),width=10)
        d.line([(cx,cy),(cx+(R-150)*math.cos(ha),cy+(R-150)*math.sin(ha))],fill=(160,30,30,255),width=16); d.ellipse([cx-16,cy-16,cx+16,cy+16],fill=(20,22,26,255))
        hh=int(m//60)%24; mm=int(m%60); tlab(d,cx,cy+R+26,f"{hh:02d}:{mm:02d}",AMB,64)
        if title: tlab(d,cx,110,title,CREAM,46)
        if side:
            y=300
            for e in events:
                if t>=e[0]:
                    k=ease((t-e[0])/0.4); tlab(d,1020,y,f"{e[1]:02d}:{e[2]:02d}",e[4] if len(e)>4 else AMB,54,'l',k); tlab(d,1190,y+8,e[3],CREAM,34,'l',k); y+=96
    L_diagram(t0,t1,draw)
# ------------------------------------------------------------------ cartões de personagem
def _portrait(path,w=270,h=300):
    if path and os.path.exists(path):
        try:
            im=Image.open(path).convert('L').convert('RGB'); iw,ih=im.size; ar=w/h
            if iw/ih>ar: nw=int(ih*ar); x=(iw-nw)//2; im=im.crop((x,0,x+nw,ih))
            else: nh=int(iw/ar); im=im.crop((0,0,iw,nh))
            im=im.resize((w,h),Image.LANCZOS); sep=Image.new('RGB',(w,h),(224,196,150)); return Image.blend(im,Image.composite(sep,im,im.convert('L')),0.22)
        except Exception: pass
    im=Image.new('RGB',(w,h),(26,30,36)); dr=ImageDraw.Draw(im)
    dr.ellipse([w/2-48,h*0.20,w/2+48,h*0.20+112],fill=(48,54,62)); dr.ellipse([w/2-110,h*0.52,w/2+110,h*1.05],fill=(48,54,62))
    f=serif(15,'Medium'); dr.text((w/2,h-16),"FOTO NON TROVATA",font=f,fill=(110,120,130),anchor='mm'); return im
def L_cards(cards,t_end,y=640,pw=250,ph=270):
    """cards: [(t_in, nome, cargo, foto|None)] — entram um depois do outro e ficam lado a lado até t_end"""
    n=len(cards); gap=36; tot=n*(pw+gap)-gap; x0=W/2-tot/2
    ims=[_portrait(c[3],pw,ph) for c in cards]
    def fn(t,im,s):
        ov,d=newov()
        for i,(t_in,nm,rl,ph_) in enumerate(cards):
            a=fade(t,t_in,t_end,0.35,0.35)
            if a<=0: continue
            k=easeo((t-t_in)/0.5); x=x0+i*(pw+gap); yy=y+int(40*(1-k))
            d.rectangle([x-5,yy-5,x+pw+5,yy+ph+110],fill=(8,12,18,int(235*a)),outline=RED+(int(255*a),),width=4)
            p=ims[i].convert('RGBA'); p.putalpha(int(255*a)); ov.alpha_composite(p,(int(x),int(yy)))
            f=serif(27,'Bold'); fs=sans(27 if pw>=300 else 22,'SemiBold')
            nm2=nm
            while tw(d,nm2,f)>pw-16 and len(nm2)>8: f=serif(int(f.size/ (1.0)*0.92) if hasattr(f,'size') else 24,'Bold'); break
            d.text((x+12,yy+ph+8),nm,font=serif(27 if pw>=300 else 21,'Bold'),fill=CREAM+(int(255*a),)); d.text((x+12,yy+ph+56),rl,font=fs,fill=(160,176,189,int(255*a)))
        over(im,ov)
    t0=min(c[0] for c in cards); LAYERS.append((t0,t_end,fn)); return fn
