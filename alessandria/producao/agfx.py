"""Cenas animadas e camadas — Alessandria 1941."""
import sys; sys.path.insert(0,'/tmp/alex/tools')
from aeng import *
import json as _j
IC='/tmp/alex/icons/'; IMG='/tmp/alex/img/'
_icache={}
def icon_im(name,w,flip=False):
    k=(name,int(w),flip)
    if k not in _icache:
        im=Image.open(IC+name+'.png').convert('RGBA'); im=im.crop(im.getbbox()); h=max(1,int(im.height*w/im.width)); im=im.resize((int(w),h),Image.LANCZOS)
        if flip: im=ImageOps.mirror(im)
        sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*0.5))); sh=sh.filter(ImageFilter.GaussianBlur(5))
        _icache[k]=(im,sh)
    return _icache[k]
def put(base,name,x,y,w,flip=False,al=1.0):
    im,sh=icon_im(name,w,flip)
    if al<1: im=im.copy(); im.putalpha(im.getchannel('A').point(lambda v:int(v*al)))
    base.alpha_composite(sh,(int(x-im.width/2+5),int(y-im.height/2+8))); base.alpha_composite(im,(int(x-im.width/2),int(y-im.height/2)))
def along(pts,u):
    L=[math.dist(a,b) for a,b in zip(pts,pts[1:])]; tot=sum(L); d=u*tot
    for (a,b),l in zip(zip(pts,pts[1:]),L):
        if d<=l or l==L[-1]: k=d/max(l,1e-6); k=min(1,k); return (a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k),math.atan2(b[1]-a[1],b[0]-a[0])
        d-=l
    return pts[-1],0
def partial(pts,u):
    if u<=0: return [pts[0],pts[0]]
    L=[math.dist(a,b) for a,b in zip(pts,pts[1:])]; tot=sum(L); d=u*tot; out=[pts[0]]
    for (a,b),l in zip(zip(pts,pts[1:]),L):
        if d>=l: out.append(b); d-=l
        else: k=d/max(l,1e-6); out.append((a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k)); break
    return out
def darrow(d,pts,col=ACC,w=8,head=26,dash=False):
    if len(pts)<2 or math.dist(pts[0],pts[-1])<3: return
    if dash:
        for a,b in zip(pts,pts[1:]):
            L=math.dist(a,b); n=max(1,int(L/22))
            for i in range(0,n,2): u0,u1=i/n,min(1,(i+1)/n); d.line([(a[0]+(b[0]-a[0])*u0,a[1]+(b[1]-a[1])*u0),(a[0]+(b[0]-a[0])*u1,a[1]+(b[1]-a[1])*u1)],fill=col,width=w)
    else: d.line(pts,fill=col,width=w,joint='curve')
    (x0,y0),(x1,y1)=pts[-2],pts[-1]; a=math.atan2(y1-y0,x1-x0)
    d.polygon([(x1+math.cos(a)*head*0.7,y1+math.sin(a)*head*0.7),(x1+math.cos(a+2.5)*head,y1+math.sin(a+2.5)*head),(x1+math.cos(a-2.5)*head,y1+math.sin(a-2.5)*head)],fill=col)
def burst(base,x,y,k,size=1.0,seed=7):
    """explosão submarina: coluna d'água irregular + spray + anel; k=0..1"""
    if k<=0 or k>=1: return
    rng=np.random.default_rng(seed); ov=Image.new('RGBA',base.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    fade=(1-k)**0.8; rise=min(1,k*3.2); fall=max(0,k-0.35)
    for i in range(70):
        ang=rng.uniform(-0.35,0.35); sp=rng.uniform(0.15,1.0); r=rng.uniform(10,30)*size*(0.6+0.8*k)*(1.2-sp*0.5)
        hh=(240*size*sp*rise)-fall*fall*500*size*sp; xx=x+math.sin(ang)*hh*0.55+rng.normal(0,8); yy=y-max(0,hh)*math.cos(ang)
        a=int(220*fade*rng.uniform(0.5,1)); c=int(rng.uniform(215,250)); d.ellipse([xx-r,yy-r,xx+r,yy+r],fill=(c,c,c-6,a))
    rr=30+300*k*size; d.ellipse([x-rr,y-rr*0.32,x+rr,y+rr*0.32],outline=(240,240,235,int(200*fade)),width=max(2,int(8*fade)))
    g=Image.new('RGBA',base.size,(0,0,0,0)); ImageDraw.Draw(g).ellipse([x-110*size,y-70*size,x+110*size,y+40*size],fill=(255,170,60,int(200*(1-k)**3)))
    base.alpha_composite(g.filter(ImageFilter.GaussianBlur(28))); base.alpha_composite(ov.filter(ImageFilter.GaussianBlur(2.5)))
# ------------------------------------------------------------ mapa geográfico
_A=_j.load(open('/tmp/mers/geo/countries.json')); ALLC={}
for ft in _A['features']:
    nm=ft['properties'].get('NAME') or ft['properties'].get('ADMIN'); g=ft['geometry']; polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    ALLC[nm]=[np.array(pl[0],dtype=np.float32) for pl in polys]
PLACES={'La Spezia':(9.82,44.10),'Lero':(26.85,37.15),'Alessandria':(29.9,31.2),'Gibilterra':(-5.35,36.14),'Malta':(14.51,35.9),'Pola':(13.85,44.87),'Taranto':(17.24,40.47),'Tripoli':(13.18,32.89),'Bengasi':(20.07,32.1),'Napoli':(14.27,40.85),'Durban':(31.0,-29.86),'Norfolk':(-76.3,36.85),'Roma':(12.5,41.9)}
def cam_at(t,keys):
    if t<=keys[0][0]: return keys[0][1:]
    for a,b in zip(keys,keys[1:]):
        if t<=b[0]: x=ease((t-a[0])/max(b[0]-a[0],1e-6)); return tuple(a[i]+(b[i]-a[i])*x for i in (1,2,3))
    return keys[-1][1:]
def geomap(keys,elems,hl=None,drift=0.05,dur=10):
    """keys: [(tl,lon,lat,px_por_grau)]; elems: dicts k=pin|arrow|icon|label|burst|ring, t (local)"""
    hl=hl or {}
    def fn(tl,u):
        lon,lat,s=cam_at(tl,keys); s*=1+drift*u; cam=(lon,lat,s)
        im=Image.new('RGBA',(W,H),SEA+(255,)); d=ImageDraw.Draw(im)
        for x in range(-H,W+H,120): d.line([(x+tl*6,H),(x+H+tl*6,0)],fill=(17,35,57),width=40)
        k=math.cos(math.radians(lat))*s
        for nm,rings in ALLC.items():
            for r in rings:
                xs=(r[:,0]-lon)*k+W/2; ys=(lat-r[:,1])*s+H/2
                if xs.max()<-50 or xs.min()>W+50 or ys.max()<-50 or ys.min()>H+50: continue
                step=1 if len(r)<400 or s>60 else 2
                d.polygon(list(zip(xs[::step].tolist(),ys[::step].tolist())),fill=hl.get(nm,LAND),outline=BORD)
        P=lambda lo,la:((lo-lon)*k+W/2,(lat-la)*s+H/2)
        for e in elems:
            if tl<e['t'] or tl>e.get('e',1e9): continue
            q=tl-e['t']
            if e['k']=='arrow':
                pts=[P(*PLACES.get(p,p)) if isinstance(p,str) else P(*p) for p in e['pts']]; uu=ease(q/e.get('d',2.0))
                darrow(d,partial(pts,uu),e.get('c',ACC),e.get('w',8),24,e.get('dash',True))
                if e.get('ship'):
                    uv=uu if uu<1 or not e.get('loop') else ((q-e.get('d',2.0))/e['loop'])%1
                    (x,y),ang=along(pts,uv); put(im,e['ship'],x,y-14+3*math.sin(tl*2),e.get('sw',110),flip=math.cos(ang)<0)
            elif e['k']=='pin':
                x,y=P(*PLACES.get(e['p'],e.get('ll',(0,0)))); a=min(1,q/0.25)
                d.ellipse([x-12,y-12,x+12,y+12],fill=e.get('c',ACC),outline=BG,width=4)
                chip(im,x+(24 if e.get('side','r')=='r' else -24),y-22,e.get('lab',e['p']),sz=e.get('sz',24),anchor='l' if e.get('side','r')=='r' else 'r',bg=WHITE,fg=BG,pad=(12,7),al=a)
            elif e['k']=='icon':
                x,y=P(*PLACES.get(e['p'],e.get('ll',(0,0)))) if 'p' in e else P(*e['ll']); put(im,e['name'],x+e.get('dx',0),y+e.get('dy',0)+3*math.sin(tl*1.7),e.get('w',120),e.get('flip',False),min(1,q/0.3))
            elif e['k']=='x':
                x,y=P(*e['ll']); a=min(1,q/0.2); r=26; d.line([(x-r,y-r),(x+r,y+r)],fill=RED,width=10); d.line([(x-r,y+r),(x+r,y-r)],fill=RED,width=10)
            elif e['k']=='ring':
                x,y=P(*PLACES.get(e['p'],(0,0))); kk=(q%1.6)/1.6; r=20+120*kk; d.ellipse([x-r,y-r,x+r,y+r],outline=(120,220,255,int(255*(1-kk))),width=4)
            elif e['k']=='flash':
                x,y=P(*PLACES.get(e['p'],(0,0))); 
                for j in range(3):
                    kk=((q*1.3+j*0.33)%1); xx=x+e.get('dx',0)*j; g=int(255*(1-kk)); d.ellipse([xx-8-30*kk,y-8-30*kk,xx+8+30*kk,y+8+30*kk],fill=(255,210,120,g))
        return im
    return fn
# ------------------------------------------------------------ porto de Alexandria (esquema)
LANDP=[(0,860),(260,800),(330,770),(620,790),(900,760),(1150,700),(1290,600),(1330,470),(1380,330),(1440,300),(1500,330),(1510,430),(1580,520),(1720,560),(1920,560),(1920,1080),(0,1080)]
BW=[(1385,330),(1100,410),(800,500),(470,610)]
NETA,NETB=(470,610),(380,700)
VAL=(1060,560); QE=(1200,480); SAG=(820,668); JER=(905,728); SCI=(250,300)
PATHS={'221':[(300,320),(395,520),(430,650),(700,600),(1000,575),(1040,585)],'222':[(300,320),(400,525),(420,665),(640,690),(790,690)],'223':[(300,320),(405,515),(440,640),(900,500),(1150,500)]}
DDPATH=[(60,420),(300,560),(425,655),(650,610),(930,540),(1150,560)]
def harbor(ev,cam=((0,1.0,0.5,0.5),),dur=10):
    """ev: dict de tempos locais: net_open, dd(entrada), slc{'221':(t,d)}, boom{'SAG':t,...}, labels, gone(lista)"""
    S=1.25; CW,CH=int(W*S),int(H*S)
    def fn(tl,u):
        im=Image.new('RGBA',(CW,CH),SEA+(255,)); d=ImageDraw.Draw(im); P=lambda p:(p[0]*S,p[1]*S)
        for x in range(-CH,CW+CH,140): d.line([(x+tl*5,CH),(x+CH+tl*5,0)],fill=(17,35,57),width=46)
        d.polygon([P(p) for p in LANDP],fill=LAND,outline=BORD)
        d.line([P(p) for p in BW],fill=(150,160,170),width=int(16*S)); d.line([P((330,770)),P((380,700))],fill=(150,160,170),width=int(16*S))
        op=ease((tl-ev.get('net_open',1e9))/2.0) if tl>=ev.get('net_open',1e9) else 0
        cl=ease((tl-ev.get('net_close',1e9))/2.0) if tl>=ev.get('net_close',1e9) else 0
        op=op*(1-cl)
        for i in range(9):
            uu=i/8; side=-1 if uu<0.5 else 1; off=op*abs(uu-0.5)*0+op*0.28*side*(1-abs(uu-0.5)*1.4)
            u2=uu+off; x=NETA[0]+(NETB[0]-NETA[0])*u2; y=NETA[1]+(NETB[1]-NETA[1])*u2
            if 0.5-op*0.3<uu<0.5+op*0.3 and op>0.05: continue
            d.ellipse([P((x-9,y-9))[0],P((x-9,y-9))[1],P((x+9,y+9))[0],P((x+9,y+9))[1]],fill=ACC)
        if op<0.3: d.line([P(NETA),P(NETB)],fill=ACC,width=4)
        # faro
        fx,fy=P((1440,296)); d.ellipse([fx-12,fy-12,fx+12,fy+12],fill=ACC,outline=BG,width=4)
        if ev.get('beam') is not None:
            ang=tl*0.9; L=900
            beam=Image.new('RGBA',im.size,(0,0,0,0)); ImageDraw.Draw(beam).polygon([(fx,fy),(fx+math.cos(ang-0.08)*L,fy+math.sin(ang-0.08)*L),(fx+math.cos(ang+0.08)*L,fy+math.sin(ang+0.08)*L)],fill=(255,240,190,60)); im.alpha_composite(beam.filter(ImageFilter.GaussianBlur(6)))
        gone=ev.get('gone',{})
        ships=[('ship_uk_bb',VAL,300,'VALIANT'),('ship_uk_bb',QE,300,'QUEEN ELIZABETH'),('tanker',SAG,250,'SAGONA'),('ship_dd_uk',JER,170,'JERVIS')]
        for nm,p,w,lab in ships:
            sink=ev.get('sink',{}).get(lab); dy=0
            if sink is not None and tl>sink: dy=min(1,(tl-sink)/4)*14*S
            x,y=P(p); put(im,nm,x,y+dy+2*math.sin(tl*1.3+p[0]),w*S)
            if lab in ev.get('labels',()): chip(im,x,y+52*S+dy,lab,sz=int(20*S),anchor='c',bg=WHITE,fg=BG,pad=(10,5))
        if 'scire' in ev and tl>=ev['scire'] and tl<ev.get('scire_out',1e9): x,y=P(SCI); put(im,'scire',x,y,340*S,al=min(1,(tl-ev['scire'])/0.4)); chip(im,x,y+56*S,'SCIRÈ',sz=int(22*S),anchor='c',pad=(10,5))
        if 'dd' in ev and tl>=ev['dd']:
            for j in range(2):
                q=(tl-ev['dd']-j*1.6)/7.0
                if 0<q<1: (x,y),ang=along([P(p) for p in DDPATH],ease(q)); put(im,'ship_dd_uk',x,y,150*S,flip=math.cos(ang)<0)
        for key,(t0,dd) in ev.get('slc',{}).items():
            if tl<t0: continue
            q=min(1,(tl-t0)/dd); pts=[P(p) for p in PATHS[key]]; darrow(d,partial(pts,ease(q)),ACC,7,22,True)
            (x,y),ang=along(pts,ease(q)); put(im,'slc_side',x,y-6,90*S,flip=math.cos(ang)<0)
            if q>=1 or ev.get('tags'): chip(im,x,y-60*S,key,sz=int(20*S),anchor='c',pad=(8,4))
        for lab,t0 in ev.get('boom',{}).items():
            p={'SAGONA':SAG,'VALIANT':VAL,'QUEEN ELIZABETH':QE}[lab]; x,y=P(p); burst(im,x,y,(tl-t0)/2.6,1.1)
        z,cx,cy=cam_at(tl,[(c[0],c[1],c[2],c[3]) for c in cam]) if len(cam)>1 else cam[0][1:]
        w,h=W/z,H/z; x0=(CW-w)*cx; y0=(CH-h)*cy
        return im.resize((W,H),Image.BILINEAR,box=(x0,y0,x0+w,y0+h))
    return fn
# ------------------------------------------------------------ outras cenas
def bgstripes(tl):
    im=Image.new('RGBA',(W,H),BG+(255,)); d=ImageDraw.Draw(im); o=(tl*12)%90
    for x in range(-H-90,W+H,90): d.polygon([(x+o,H),(x+o+45,H),(x+o+45+H,0),(x+o+H,0)],fill=(16,32,52))
    return im
def slc_scheda(hl_times,rows_t,dur):
    """hl_times: [(t,'h'|'b'|'m'|'n')] destaca partes; rows_t: tempos de entrada das linhas da ficha"""
    imgs={o:Image.open(IC+f'slc_hl_{o}.png').convert('RGBA') for o in 'nhbm'}
    for o in imgs: im=imgs[o]; im=im.crop(im.getbbox()); imgs[o]=im.resize((1240,int(im.height*1240/im.width)),Image.LANCZOS)
    labs={'h':(0.86,'TESTA · CARICA'),'b':(0.50,'BATTERIE · 2 POSTI'),'m':(0.12,'MOTORE · ELICA')}
    def fn(tl,u):
        im=bgstripes(tl); cur='n'
        for t,o in hl_times:
            if tl>=t: cur=o
        s=imgs[cur]; x=70+int(18*math.sin(tl*0.5)); y=330+int(6*math.sin(tl*0.8)); im.alpha_composite(s,(x,y))
        d=ImageDraw.Draw(im)
        for t,o in hl_times:
            if o in labs and tl>=t:
                fx,lab=labs[o]; lx=x+int(s.width*fx); d.line([(lx,y+s.height+8),(lx,y+s.height+60)],fill=ACC if o==cur else (140,150,165),width=4)
                chip(im,lx,y+s.height+66,lab,sz=22,anchor='c',bg=ACC if o==cur else WHITE,fg=BG,pad=(12,7))
        rows=[('LUNGHEZZA','~7 M',0.7),('VELOCITÀ MAX','3 NODI',0.3),('CARICA','>200 KG',0.8),('OPERATORI','2',0.2)]
        n=sum(1 for t in rows_t if tl>=t)
        dossier(im,1430,110,430,640,'SLC «MAIALE»',['SILURO A LENTA CORSA','REGIA MARINA'],rows[:n],head='SCHEDA TECNICA')
        chip(im,90,90,'COME FUNZIONA',sz=30)
        return im
    return fn
def timeline_scene(items,lit_t,stamps=(),title='PRIMA DI ALESSANDRIA'):
    """lit_t: [(t,i)] acende item i no tempo t; stamps: [(t,txt,col,x,y)]"""
    def fn(tl,u):
        im=bgstripes(tl); lit=[i for t,i in lit_t if tl>=t]; chip(im,90,90,title,sz=30)
        timeline(im,items,lit[-1:] if lit else [])
        d=ImageDraw.Draw(im)
        for i in lit[:-1]:
            x=180+(1740-180)*i/(len(items)-1); d.ellipse([x-18,560-18,x+18,560+18],fill=(200,150,40))
        for t,txt,col,x,y in stamps:
            if tl>=t: stamp(im,x,y,txt,sz=56,col=col,ang=-8,al=min(1,(tl-t)/0.15))
        return im
    return fn
def clock_scene(keys,events,dur):
    """keys: [(tl,'HH:MM')] ; events [(tl,txt)] lista de linhas que acendem"""
    def fn(tl,u):
        im=bgstripes(tl); cur=keys[0][1]
        for t,v in keys:
            if tl>=t: cur=v
        glow_text(im,(W//2,330),cur,fnt('x',230),ACC,glow=26)
        chip(im,W//2,500,'MATTINA DEL 19 DICEMBRE 1941',sz=26,anchor='c',bg=WHITE,fg=BG)
        y=610
        for t,txt in events:
            if tl>=t: chip(im,W//2,y,txt,sz=30,anchor='c',al=min(1,(tl-t)/0.15)); y+=78
        return im
    return fn
def ship_section(mode,ev,dur):
    """mode 'valiant': perfil com local das correntes e carga no fundo; 'settle': navio assenta com convés fora d'água"""
    def fn(tl,u):
        im=Image.new('RGBA',(W,H),(10,22,38,255)); d=ImageDraw.Draw(im)
        wl=470; d.rectangle([0,wl,W,H],fill=(14,40,64)); d.rectangle([0,900,W,H],fill=(52,48,40))
        for i in range(0,W,40): d.line([(i,900+8*math.sin(i*0.05)),(i+40,900+8*math.sin((i+40)*0.05))],fill=(80,72,60),width=4)
        sink=0
        if mode=='settle' and tl>ev.get('settle',1e9): sink=ease((tl-ev['settle'])/4.0)*230
        hull=[(260,330+sink),(1660,330+sink),(1610,640+sink),(420,640+sink),(300,560+sink)]
        d.polygon(hull,fill=(118,126,136),outline=(30,30,30))
        d.rectangle([700,230+sink,1200,330+sink],fill=(130,138,148)); d.rectangle([880,120+sink,980,230+sink],fill=(120,128,138)); d.rectangle([1040,170+sink,1100,230+sink],fill=(100,104,110))
        for x in (420,560,1320,1460): d.rectangle([x-50,290+sink,x+50,330+sink],fill=(105,112,120)); d.rectangle([x+(40 if x<900 else -110),300+sink,x+(140 if x<900 else -40),314+sink],fill=(90,95,100))
        d.text((W//2,560+sink),'HMS VALIANT',font=fnt('x',40),fill=(60,64,70),anchor='mm')
        water=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(water).rectangle([0,wl,W,900],fill=(20,70,110,110)); im.alpha_composite(water)
        d=ImageDraw.Draw(im)
        if mode=='valiant':
            if tl>=ev.get('locker',1e9):
                a=min(1,(tl-ev['locker'])/0.3); d.rectangle([1440,360,1560,450],outline=ACC,width=6); chip(im,1500,250,'LOCALE DELLE CATENE',sz=24,anchor='c',al=a)
            if tl>=ev.get('charge',1e9):
                k=0.5+0.5*math.sin(tl*5); d.ellipse([1335,870,1395,900],fill=(255,int(120+100*k),0)); chip(im,1365,940,'CARICA SUL FONDO',sz=22,anchor='c')
                d.line([(1365,870),(1365,660)],fill=(255,176,0),width=3)
            if tl>=ev.get('depth',1e9): chip(im,1200,700,'~6 M SOTTO IL LIVELLO DELL\'ACQUA',sz=20,anchor='c',bg=WHITE,fg=BG)
            if tl>=ev.get('boom',1e9): burst(im,1365,640,(tl-ev['boom'])/2.4,2.0)
        if mode=='settle' and tl>ev.get('settle',1e9)+3.6: chip(im,W//2,160,'IL PONTE RESTA FUORI DALL\'ACQUA',sz=28,anchor='c')
        return im
    return fn
def minefield(ev,dur):
    def fn(tl,u):
        im=Image.new('RGBA',(W,H),(10,22,38,255)); d=ImageDraw.Draw(im)
        d.rectangle([0,180,W,H],fill=(12,34,56)); d.rectangle([0,960,W,H],fill=(52,48,40))
        for x in range(120,W,260):
            y=330+40*math.sin(x); d.line([(x,y),(x,960)],fill=(90,100,110),width=3); d.ellipse([x-26,y-26,x+26,y+26],fill=(70,74,80),outline=(30,30,30),width=3)
            for a in range(0,360,60): d.line([(x,y),(x+34*math.cos(math.radians(a)),y+34*math.sin(math.radians(a)))],fill=(70,74,80),width=4)
        q=tl/dur; x=-300+q*(W+300); y=720 if tl<ev.get('rise',1e9) else 720-ease((tl-ev['rise'])/3)*560
        put(im,'scire',x,y,520)
        dep=-60 if tl<ev.get('rise',1e9) else int(-60*(1-ease((tl-ev['rise'])/3)))
        chip(im,W-90,90,f'PROFONDITÀ {dep} M',sz=30,anchor='r')
        d.line([(0,180),(W,180)],fill=(120,160,200),width=3)
        return im
    return fn
def quote_scene(lines,attr,t_attr=0.5):
    def fn(tl,u):
        im=bgstripes(tl); d=ImageDraw.Draw(im); d.text((160,170),'“',font=fnt('x',260),fill=ACC)
        y=360
        for ln in lines: d.text((260,y),ln,font=fnt('x',58),fill=WHITE); y+=80
        if tl>=t_attr: chip(im,260,y+30,attr,sz=26,al=min(1,(tl-t_attr)/0.2))
        return im
    return fn
def news_scene(path,hl_boxes,hl_t,stamp_t=None,stamp_txt=None,lab=('EVENING STAR','WASHINGTON · 8 GENNAIO 1942'),dur=8):
    nw=Image.open(path).convert('RGB'); nw=era(nw,warm=0.3,grain=4,vig=0.12); s=1000/nw.height if nw.height>1000 else 1.0
    nw=nw.resize((int(nw.width*s*1.05),int(nw.height*s*1.05))); sc=s*1.05
    def fn(tl,u):
        im=bgstripes(tl); p=nw.convert('RGBA'); hl=Image.new('RGBA',p.size,(0,0,0,0)); hd=ImageDraw.Draw(hl)
        for (box,t) in zip(hl_boxes,hl_t):
            if tl>=t:
                k=min(1,(tl-t)/0.5); x0,y0,x1,y1=[v*sc for v in box]; hd.rectangle([x0,y0,x0+(x1-x0)*k,y1],fill=ACC+(95,))
        p=Image.alpha_composite(p,hl); z=1+0.05*u; p=p.resize((int(p.width*z),int(p.height*z)),Image.BILINEAR).rotate(-1.5,expand=True,resample=Image.BICUBIC)
        im.alpha_composite(p,(int(330-20*u),int((H-p.height)/2)))
        label_corner(im,lab[0],lab[1],side='r',y=80)
        if stamp_t is not None and tl>=stamp_t: stamp(im,1480,620,stamp_txt,sz=64,ang=-9,al=min(1,(tl-stamp_t)/0.12))
        return im
    return fn
def vs_scene(left,right,tag,t_r=1.0):
    """left/right: (img or None, nome, ruolo)"""
    def fn(tl,u):
        im=bgstripes(tl); d=ImageDraw.Draw(im); d.polygon([(1010,0),(1060,0),(910,H),(860,H)],fill=ACC)
        person(im,250,220,Image.open(left[0]) if left[0] else None,left[1],left[2],pw=300,ph=360)
        if tl>=t_r: person(im,1300,220,Image.open(right[0]) if right[0] else None,right[1],right[2],pw=300,ph=360,al=min(1,(tl-t_r)/0.2))
        chip(im,90,90,tag,sz=28,anchor='l')
        return im
    return fn
def endcard(thumb,dur):
    th=Image.open(thumb).convert('RGB').resize((880,495),Image.LANCZOS)
    def fn(tl,u):
        im=bgstripes(tl); d=ImageDraw.Draw(im); chip(im,W//2,110,'GUARDA ANCHE',sz=34,anchor='c')
        fr=Image.new('RGBA',(896,511),ACC+(255,)); fr.paste(th,(8,8)); im.alpha_composite(fr,(W//2-448,170))
        d.text((W//2,722),'PERCHÉ GLI ESERCITI PORTAVANO',font=fnt('x',42),fill=WHITE,anchor='mm'); d.text((W//2,776),'BANDIERE SOTTO IL FUOCO?',font=fnt('x',42),fill=ACC,anchor='mm')
        return im
    return fn
# ------------------------------------------------------------ camadas (overlays)
def _ov(draw,static=True,until=0.0):
    cache={}
    def fn(im,tl,a):
        if static and tl>=until and 'o' in cache: ov=cache['o']
        else:
            ov=Image.new('RGBA',(W,H),(0,0,0,0)); draw(ov,tl)
            if static and tl>=until: cache['o']=ov
        if a<1: ov=ov.copy(); ov.putalpha(ov.getchannel('A').point(lambda v:int(v*a)))
        im.alpha_composite(ov)
    return fn
def L_loc(t0,t1,txt,sub=None,side='l'): layer(t0,t1,_ov(lambda o,tl:label_corner(o,txt,sub,side)),name='loc',slot='top'+side)
def L_chip(t0,t1,txt,x=W//2,y=930,sz=30,anchor='c',bg=ACC,fg=BG): layer(t0,t1,_ov(lambda o,tl:chip(o,x,y,txt,sz=sz,anchor=anchor,bg=bg,fg=fg)),slot=('bot' if y>700 else 'top'+('r' if x>W*0.6 else 'l' if x<W*0.4 else 'c')) if True else None)
def L_word(t0,t1,txt,col=ACC,y=H//2,sz=140,glow=20,dim=0.0):
    def dr(o,tl):
        if dim: o.alpha_composite(Image.new('RGBA',(W,H),(0,0,0,int(255*dim))))
        s=1.0+0.06*max(0,1-tl/0.18); f=fnt('x',int(sz*s)); glow_text(o,(W//2,y),txt,f,col,glow=glow)
    layer(t0,t1,_ov(dr,until=0.2),fi=0.08,name='word',slot='center')
def L_words(items,t_end,y=H//2,sz=120,dim=0.35):
    """items: [(t,txt,col)] — cada palavra substitui a anterior"""
    for i,(t,txt,col) in enumerate(items):
        e=items[i+1][0] if i+1<len(items) else t_end; L_word(t,e,txt,col,y,sz,dim=dim)
def L_big(t0,t1,num,sub,dim=0.4):
    def dr(o,tl):
        o.alpha_composite(Image.new('RGBA',(W,H),(0,0,0,int(255*dim)))); big_number(o,num,sub)
    layer(t0,t1,_ov(dr),fi=0.08,name='big',slot='center')
def L_stamp(t0,t1,txt,x=W//2,y=H//2,col=ACC,ang=8,sz=70): layer(t0,t1,_ov(lambda o,tl:stamp(o,x,y,txt,sz=sz,col=col,ang=ang)),fi=0.06,name='stamp',slot='stamp')
def L_people(items,t_end,y=230,x0=140,gap=480,pw=260,ph=310,dim=0.45):
    """items: [(t, img|None, nome, ruolo)] — entram um depois do outro, lado a lado"""
    def mk(i):
        def dr(o,tl):
            if i==0 and dim: o.alpha_composite(Image.new('RGBA',(W,H),(4,10,20,int(255*dim))))
            t,img,nm,rl=items[i]; person(o,x0+gap*i,y,Image.open(img) if img else None,nm,rl,pw=pw,ph=ph)
        return dr
    for i,(t,img,nm,rl) in enumerate(items): layer(t,t_end,_ov(mk(i)),name='person')
def L_lower(t0,t1,name,role): layer(t0,t1,_ov(lambda o,tl:lower_third(o,name,role)),name='lower')
def L_comment(t0,t1,q): layer(t0,t1,_ov(lambda o,tl:(o.alpha_composite(Image.new('RGBA',(W,H),(4,10,20,170))),comment_box(o,q))),name='comment',slot='center')
def L_type(t0,t1,lines,y=470,sz=50,cps=30,dim=0.55):
    def dr(o,tl):
        o.alpha_composite(Image.new('RGBA',(W,H),(0,0,0,int(255*dim)))); d=ImageDraw.Draw(o); n=int(tl*cps); yy=y
        for ln in lines:
            s=ln[:max(0,n)]; n-=len(ln); d.text((W//2,yy),s,font=fnt('t',sz),fill=PAPER,anchor='mm'); yy+=sz+18
    layer(t0,t1,_ov(dr,until=sum(len(x) for x in lines)/cps+0.1),fi=0.05,name='type',slot='center')
def L_cta(t0,dur=8.0):
    import glob as _g
    fr=sorted(_g.glob('/tmp/mers/chroma/c*.png'))
    def fn(im,tl,a):
        k=int(tl*25)
        if k>=len(fr): return
        g=Image.open(fr[k]).convert('RGBA'); g=g.resize((int(g.width*0.85),int(g.height*0.85))); im.alpha_composite(g,(W//2-g.width//2,H-g.height-40))
    layer(t0,t0+min(dur,len(fr)/25),fn,fi=0,fo=0,name='cta')
