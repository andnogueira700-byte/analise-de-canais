import sys; sys.path.insert(0,'/tmp/alex/tools')
from agfx import *
from PIL import ImageEnhance
TW,TH=1280,720; O='/tmp/alex/thumb/'; CUT=O+'cut/'
ANT='/tmp/alex/fonts/1Ptgg87LROyAm0K0.ttf'; MX='/tmp/alex/fonts/Montserrat_800.ttf'
def F(p,s): return ImageFont.truetype(p,s)
def bw(im,c=1.25,b=1.0):
    g=ImageOps.grayscale(im.convert('RGB')); g=ImageOps.autocontrast(g,cutoff=1); g=ImageEnhance.Contrast(g).enhance(c); g=ImageEnhance.Brightness(g).enhance(b); return g.convert('RGB')
def fit(im,w,h): return cover(im.convert('RGB'),w,h)
def cutout(name,h,bwmode=True):
    im=Image.open(CUT+name+'.png'); im=im.crop(im.getbbox()); im=im.resize((int(im.width*h/im.height),h),Image.LANCZOS)
    if bwmode:
        a=im.getchannel('A'); g=bw(im,1.3); g.putalpha(a); im=g
    return im
def torn(w,h,seed=1,jag=10):
    rng=np.random.default_rng(seed); m=Image.new('L',(w,h),0); d=ImageDraw.Draw(m); pts=[]
    for x in range(0,w,12): pts.append((x,rng.uniform(0,jag)))
    for y in range(0,h,12): pts.append((w-rng.uniform(0,jag),y))
    for x in range(w,0,-12): pts.append((x,h-rng.uniform(0,jag)))
    for y in range(h,0,-12): pts.append((rng.uniform(0,jag),y))
    d.polygon(pts,fill=255); return m
def parchment(w,h,seed=2):
    rng=np.random.default_rng(seed); base=np.ones((h,w,3),np.float32)*np.array([214,196,160])
    n=rng.normal(0,1,(h//8+1,w//8+1)); n=np.array(Image.fromarray(((n-n.min())/(n.max()-n.min())*255).astype(np.uint8)).resize((w,h),Image.BICUBIC)).astype(np.float32)/255
    base*= (0.78+0.3*n)[...,None]
    yy,xx=np.mgrid[0:h,0:w]; dd=((xx-w/2)/(w/2))**2+((yy-h/2)/(h/2))**2; base*=(1-0.35*np.clip(dd-0.3,0,1))[...,None]
    return Image.fromarray(np.clip(base,0,255).astype(np.uint8))
def parch_map(w,h,lon,lat,s,marks):
    im=parchment(w,h); d=ImageDraw.Draw(im,'RGBA'); k=math.cos(math.radians(lat))*s
    P=lambda lo,la:((lo-lon)*k+w/2,(lat-la)*s+h/2)
    for nm,rings in ALLC.items():
        for r in rings:
            xs=(r[:,0]-lon)*k+w/2; ys=(lat-r[:,1])*s+h/2
            if xs.max()<-20 or xs.min()>w+20 or ys.max()<-20 or ys.min()>h+20: continue
            col=(150,40,32,230) if nm=='Egypt' else (120,100,72,90)
            d.polygon(list(zip(xs.tolist(),ys.tolist())),fill=col,outline=(70,55,40,200))
    for m in marks:
        if m[0]=='lab': x,y=P(*m[1]); d.text((x,y),m[2],font=F(MX,m[3] if len(m)>3 else 22),fill=(40,30,22),anchor='mm')
        if m[0]=='dot': x,y=P(*m[1]); d.ellipse([x-7,y-7,x+7,y+7],fill=(30,20,15))
        if m[0]=='arrow':
            pts=[P(*p) for p in m[1]]; darrow(d,pts,(160,30,25),5,22,True)
    return im
def shadow(base,im,x,y,r=14,o=110):
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*o/255)) if im.mode=='RGBA' else Image.new('L',im.size,o))
    sh=sh.filter(ImageFilter.GaussianBlur(r)); base.alpha_composite(sh,(x+8,y+10))
def wbox(base,x,y,txt,sz,pad=(12,4)):
    f=F(MX,sz); d=ImageDraw.Draw(base); bb=d.textbbox((0,0),txt,font=f); w=bb[2]-bb[0]; h=bb[3]-bb[1]
    d.rectangle([x,y,x+w+2*pad[0],y+h+2*pad[1]+sz*0.12],fill=(250,250,250)); d.text((x+pad[0]-bb[0],y+pad[1]-bb[1]+sz*0.06),txt,font=f,fill=(10,10,10)); return y+h+2*pad[1]+sz*0.12
# =============== A: estilo "Markets of the Past"
def A():
    b=Image.new('RGBA',(TW,TH),(14,14,14,255))
    ph=bw(fit(Image.open('/tmp/alex/img/valiant.jpg'),760,330),1.3,0.95).convert('RGBA'); b.alpha_composite(ph,(520,390))
    mp=parch_map(640,360,19.5,37.5,21,[('dot',(29.9,31.2)),('lab',(28.5,29.6),'ALESSANDRIA',20),('lab',(12.5,43.2),'ITALIA',22),('dot',(9.8,44.1)),('arrow',[(9.8,43.6),(9.2,40),(12.2,37.8),(16,36.3),(22,35.8),(27,34),(29.6,31.7)]),('lab',(24,32.5),'?',34)]).convert('RGBA')
    mp.putalpha(torn(640,360,3,14)); shadow(b,mp,620,20); mp=mp.rotate(-2,expand=True,resample=Image.BICUBIC); b.alpha_composite(mp,(610,14))
    p=cutout('dlp3',560); g=Image.new('RGBA',b.size,(0,0,0,0)); g.alpha_composite(p,(20,TH-p.height+10)); b.alpha_composite(g)
    y=wbox(b,40,438,'SEI ITALIANI CONTRO',40); y=wbox(b,40,y+6,'DUE CORAZZATE',48); wbox(b,40,y+6,'FOLLIA?',92)
    return b
# =============== B: foto + papel rasgado + faixa preta, letras amarelas
def B():
    im=Image.open('/tmp/alex/thumb/f_200.png').convert('RGB'); im=fit(im,TW,TH)
    g=bw(im,1.15,1.05); arr=np.asarray(g).astype(np.float32)/255; col=np.stack([arr[...,0]*1.0+0.02,arr[...,1]*0.93+0.02,arr[...,2]*0.80],-1)
    b=Image.fromarray((np.clip(col,0,1)*255).astype(np.uint8)).convert('RGBA')
    d=ImageDraw.Draw(b); rng=np.random.default_rng(5)
    for (x0,y0,x1,y1) in []:
        pts=[(x0+(x1-x0)*u+rng.normal(0,10),y0+(y1-y0)*u+rng.normal(0,10)) for u in np.linspace(0,1,26)]
        d.line(pts,fill=(245,245,240),width=8,joint='curve')
    f=F(ANT,118); txt='CAVALCAVANO UN SILURO'; bb=d.textbbox((0,0),txt,font=f); w=bb[2]-bb[0]
    ban=Image.new('RGBA',(w+70,170),(12,12,12,255)); ban.putalpha(torn(w+70,170,7,12)); x=(TW-ban.width)//2; b.alpha_composite(ban,(x,40))
    d.text((x+35-bb[0],40+85),txt,font=f,fill=(245,196,22),anchor='lm')
    return b
# =============== C: mapa ilustrado + retrato à direita + pincelada vermelha
def C():
    ev=dict(labels=('VALIANT','QUEEN ELIZABETH','SAGONA'),slc={'221':(-100,1),'222':(-100,1),'223':(-100,1)},net_open=-100,dd=None,scire=-1)
    ev.pop('dd')
    fr=harbor(ev,cam=((0,1.02,0.42,0.4),))(0,0).convert('RGB')
    fr=fr.resize((TW,TH),Image.LANCZOS); b=fr.convert('RGBA')
    ov=Image.new('RGBA',(TW,TH),(0,0,0,0)); od=ImageDraw.Draw(ov)
    for x in range(TW): od.line([(x,0),(x,TH)],fill=(0,0,0,int(200*max(0,(x-760)/520))))
    b.alpha_composite(ov)
    p=cutout('dlp3',600,True); b.alpha_composite(p,(TW-p.width+150,TH-p.height+20))
    def mini(img,lab,x,y):
        q=Image.open(img).convert('RGB'); q=bw(fit(q,110,130)); fr=Image.new('RGBA',(122,142),(40,34,26,255)); fr.paste(q,(6,6)); b.alpha_composite(fr,(x,y))
        chip(b,x+61,y+146,lab,sz=16,anchor='c',bg=(240,240,235),fg=(15,15,15),pad=(8,4))
    mini('/tmp/alex/img/martellotta.jpg','MARTELLOTTA',40,40); mini('/tmp/alex/img/schergat.jpg','SCHERGAT',180,40)
    d=ImageDraw.Draw(b); f=F(ANT,112); txt='APRITE LA RETE'; bb=d.textbbox((0,0),txt,font=f); w=bb[2]-bb[0]
    br=Image.new('RGBA',(w+120,160),(0,0,0,0)); bd=ImageDraw.Draw(br); rng=np.random.default_rng(4)
    for i in range(26):
        y0=rng.uniform(10,140); bd.line([(rng.uniform(0,40),y0),(w+120-rng.uniform(0,50),y0+rng.normal(0,5))],fill=(196,22,28,255),width=int(rng.uniform(14,30)))
    br=br.filter(ImageFilter.GaussianBlur(1.2)); b.alpha_composite(br,(20,TH-200))
    d.text((80-bb[0],TH-200+80),txt,font=f,fill=(250,250,250),anchor='lm')
    return b
for n,fn in (('A',A),('B',B),('C',C)):
    fn().convert('RGB').save(O+f'thumb_{n}.png'); print(n)
