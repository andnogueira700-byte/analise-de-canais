import sys; sys.path.insert(0,'/tmp/alex/tools')
from thumbs import *
RED=(165,28,28)
def chart_bg(w,h,seed=3):
    rng=np.random.default_rng(seed)
    n=rng.normal(0,1,(h//40+2,w//40+2)); n=np.array(Image.fromarray(((n-n.min())/(n.max()-n.min())*255).astype(np.uint8)).resize((w,h),Image.BICUBIC)).astype(np.float32)/255
    base=np.stack([10+14*n,22+18*n,34+24*n],-1)
    im=Image.fromarray(base.astype(np.uint8)).convert('RGBA'); d=ImageDraw.Draw(im,'RGBA')
    # isolinhas de profundidade
    for lv in np.linspace(0.2,0.85,9):
        m=(np.abs(n-lv)<0.006).astype(np.uint8)*255
        ln=Image.fromarray(m).filter(ImageFilter.MaxFilter(3)); im.paste((90,130,160,255),(0,0),ln.filter(ImageFilter.GaussianBlur(1)).point(lambda v:int(v*0.14)))
    for x in range(0,w,80): d.line([(x,0),(x,h)],fill=(120,150,180,28),width=1)
    for y in range(0,h,80): d.line([(0,y),(w,y)],fill=(120,150,180,28),width=1)
    f=F(MX,13)
    for i in range(70): d.text((rng.uniform(0,w),rng.uniform(0,h)),str(int(rng.uniform(4,60))),font=f,fill=(140,170,200,70))
    # rosa dos ventos
    cx,cy,R=1110,560,120
    for a in range(0,360,45):
        L=R if a%90==0 else R*0.6; t=math.radians(a)
        d.polygon([(cx,cy),(cx+math.cos(t-0.12)*L*0.25,cy+math.sin(t-0.12)*L*0.25),(cx+math.cos(t)*L,cy+math.sin(t)*L)],fill=(160,180,200,60))
    d.ellipse([cx-R*0.7,cy-R*0.7,cx+R*0.7,cy+R*0.7],outline=(160,180,200,60),width=2)
    return im
def build():
    b=chart_bg(TW,TH)
    # mapa antigo à esquerda
    mp=parch_map(600,330,20,37.0,19,[('dot',(29.9,31.2)),('lab',(26.0,32.3),'ALESSANDRIA',19),('lab',(12.6,43.3),'ITALIA',21),('dot',(9.8,44.1)),('arrow',[(9.8,43.6),(9.2,40),(12.2,37.8),(16,36.3),(22,35.8),(27,34),(29.6,31.7)])]).convert('RGBA')
    mp.putalpha(torn(600,330,3,14)); mp=mp.rotate(2,expand=True,resample=Image.BICUBIC); shadow(b,mp,22,18); b.alpha_composite(mp,(18,14))
    # navios: foto da Valiant + ícones 3D
    ph=bw(fit(Image.open('/tmp/alex/img/valiant.jpg'),400,180),1.35,1.05).convert('RGBA'); fr=Image.new('RGBA',(412,192),(235,230,215,255)); fr.alpha_composite(ph,(6,6)); fr=fr.rotate(-3,expand=True,resample=Image.BICUBIC)
    shadow(b,fr,24,318); b.alpha_composite(fr,(20,312))
    put(b,'slc',520,470,210)
    # texto com fundo vermelho do canal
    def rbox(x,y,txt,sz):
        f=F(MX,sz); d=ImageDraw.Draw(b); bb=d.textbbox((0,0),txt,font=f); w=bb[2]-bb[0]; h=bb[3]-bb[1]; px,py=14,int(sz*0.16)
        d.rectangle([x,y,x+w+2*px,y+h+2*py],fill=RED); d.text((x+px-bb[0],y+py-bb[1]),txt,font=f,fill=(255,255,255)); return y+h+2*py
    y=rbox(28,520,'SEI ITALIANI CONTRO',34); y=rbox(28,y+6,'DUE CORAZZATE',44); rbox(28,y+6,'FOLLIA?',78)
    return b
if __name__=='__main__':
    b=build(); b.convert('RGB').save('/tmp/alex/thumb/bgA2.png'); print('ok')
