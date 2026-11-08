import sys; sys.path.insert(0,'/tmp/alex/tools')
from alib import *
from PIL import Image,ImageDraw
O='/tmp/alex/mock/'; FR='/tmp/alex/fr/'; IM='/tmp/alex/img/'; IC='/tmp/alex/icons/'
def foot(p,z=1.08,cy=0.5): return era(cover(Image.open(p),z=z,cy=cy)).convert('RGBA')
def brand(b): ImageDraw.Draw(b).text((W-40,36),'LOGICA DI GUERRA',font=fnt('x',22),fill=(255,255,255,150),anchor='ra')
# 1 apertura
b=foot(FR+'s_5_52.png'); label_corner(b,'ALESSANDRIA D\'EGITTO','18-19 DICEMBRE 1941'); brand(b); b.convert('RGB').save(O+'01_apertura.jpg',quality=90)
# 1b dado grande
b=foot(FR+'s_3_22.png'); ov=Image.new('RGBA',b.size,(0,0,0,110)); b.alpha_composite(ov); big_number(b,'200+ KG','DI ESPLOSIVO NELLA TESTA'); brand(b); b.convert('RGB').save(O+'02_dato.jpg',quality=90)
# 2 domanda
b=foot(FR+'s_6_22.png'); ov=Image.new('RGBA',b.size,(0,0,0,140)); b.alpha_composite(ov)
glow_text(b,(W//2,470),'FOLLIA?',fnt('x',150),WHITE,glow=14); glow_text(b,(W//2,640),'CORAGGIO?',fnt('x',150),ACC,glow=20); brand(b); b.convert('RGB').save(O+'03_domanda.jpg',quality=90)
# 3 scheda maiale
b=stripes().convert('RGBA'); sl=Image.open(IC+'slc_parts.png').convert('RGBA'); sl=sl.crop(sl.getbbox()); sl=sl.resize((1300,int(sl.height*1300/sl.width)))
b.alpha_composite(sl,(80,300)); d=ImageDraw.Draw(b)
for x,lab in [(1260,'TESTA · CARICA'),(760,'BATTERIE · 2 POSTI'),(220,'MOTORE · ELICA')]:
    d.line([(x,300+sl.height+10),(x,300+sl.height+70)],fill=ACC,width=4); chip(b,x,300+sl.height+76,lab,sz=22,anchor='c',bg=WHITE,fg=BG,pad=(12,7))
dossier(b,1430,120,430,640,'SLC «MAIALE»',['SILURO A LENTA CORSA','MARINA · 1935-1943'],[('LUNGHEZZA','~7 m',0.7),('VELOCITÀ MAX','3 NODI',0.3),('CARICA','>200 KG',0.8),('OPERATORI','2',0.2)],head='SCHEDA TECNICA')
chip(b,90,90,'COME FUNZIONA',sz=30); brand(b); b.convert('RGB').save(O+'04_scheda_maiale.jpg',quality=90)
# 4 personaggi
b=foot(FR+'s_4_45.png',z=1.1); ov=Image.new('RGBA',b.size,(5,12,22,150)); b.alpha_composite(ov)
person(b,140,250,Image.open(IM+'dlp3.jpg'),'Luigi\nDurand de la Penne','tenente di vascello · SLC 221')
person(b,620,250,None,'Emilio\nBianchi','capo palombaro · SLC 221')
stamp(b,1420,420,'BERSAGLIO: VALIANT',sz=54,ang=7)
icon(b,IC+'ship_uk_bb.png',1420,640,520)
brand(b); b.convert('RGB').save(O+'05_personaggi.jpg',quality=90)
# 5 mappa porto (schematica)
b=Image.new('RGBA',(W,H),SEA+(255,)); d=ImageDraw.Draw(b)
for x in range(-H,W+H,120): d.line([(x,H),(x+H,0)],fill=(18,36,58),width=40)
land=[(0,860),(260,800),(330,770),(620,790),(900,760),(1150,700),(1290,600),(1330,470),(1380,330),(1440,300),(1500,330),(1510,430),(1580,520),(1720,560),(1920,560),(1920,1080),(0,1080)]
d.polygon(land,fill=LAND,outline=BORD)
bw=[(1385,330),(1100,410),(800,500),(470,610)]
d.line(bw,fill=(150,160,170),width=14); d.line([(330,770),(380,700)],fill=(150,160,170),width=14)
# rete
for i in range(9):
    u=i/8; x=470+(380-470)*u; y=610+(700-610)*u; d.ellipse([x-9,y-9,x+9,y+9],fill=ACC)
d.line([(470,610),(380,700)],fill=ACC,width=3)
chip(b,300,560,'RETE ANTISOMMERGIBILE',sz=18,anchor='r',bg=ACC,fg=BG,pad=(10,6))
pin(b,1440,295,'FARO',side='r')
icon(b,IC+'ship_uk_bb.png',1060,560,260); chip(b,1060,615,'VALIANT',sz=20,anchor='c',bg=WHITE,fg=BG,pad=(10,5))
icon(b,IC+'ship_uk_bb.png',1200,480,260); chip(b,1200,420,'QUEEN ELIZABETH',sz=20,anchor='c',bg=WHITE,fg=BG,pad=(10,5))
icon(b,IC+'tanker.png',820,665,240); chip(b,820,710,'SAGONA',sz=20,anchor='c',bg=WHITE,fg=BG,pad=(10,5))
icon(b,IC+'scire.png',240,260,300); chip(b,240,320,'SCIRÈ',sz=22,anchor='c',pad=(10,5))
for pts,lab in [([(300,300),(420,640),(700,600),(1000,570)],'221'),([(300,300),(400,660),(640,690),(780,665)],'222'),([(300,300),(440,630),(900,500),(1150,480)],'223')]:
    arrow(b,pts,ACC,w=6,head=24,dash=True)
icon(b,IC+'ship_dd_uk.png',600,560,150,flip=False)
label_corner(b,'PORTO DI ALESSANDRIA','NOTTE 18-19 DICEMBRE 1941'); brand(b); b.convert('RGB').save(O+'06_mappa_porto.jpg',quality=90)
# 6 giornale
b=stripes().convert('RGBA'); nw=Image.open('/tmp/alex/news/clip_star0108_head.jpg').convert('RGB'); nw=era(nw,warm=0.3,grain=4,vig=0.15)
nw=nw.resize((int(nw.width*0.92),int(nw.height*0.92))); nwr=nw.convert('RGBA')
hl=Image.new('RGBA',nwr.size,(0,0,0,0)); hd=ImageDraw.Draw(hl); s=0.92
hd.rectangle([60*s,40*s,700*s,400*s],fill=ACC+(80,)); hd.rectangle([75*s,795*s,710*s,1000*s],fill=ACC+(80,))
nwr=Image.alpha_composite(nwr,hl); nwr=nwr.rotate(-2,expand=True,resample=Image.BICUBIC)
b.alpha_composite(nwr,(260,30)); stamp(b,1450,560,'LONDRA TACE',sz=64,ang=-9)
label_corner(b,'EVENING STAR','WASHINGTON · 8 GENNAIO 1942',side='r',y=80); brand(b); b.convert('RGB').save(O+'07_giornale.jpg',quality=90)
# 7 timeline
b=stripes().convert('RGBA'); chip(b,90,90,'PRIMA DI ALESSANDRIA',sz=30)
timeline(b,[('1918','Pola\nViribus Unitis'),('1935','Tesei e Toschi\nil progetto'),('1940','Iride\naffondato'),('1941','Malta\nfallimento'),('SET 1941','Gibilterra\n3 navi colpite'),('DIC 1941','Alessandria')],lit=[3])
stamp(b,W//2+480,300,'FALLITO',sz=60,col=RED,ang=-8); brand(b); b.convert('RGB').save(O+'08_timeline.jpg',quality=90)
# 8 commenti
b=foot(FR+'s_3_40.png'); ov=Image.new('RGBA',b.size,(5,12,22,170)); b.alpha_composite(ov)
comment_box(b,'Dopo Malta, dopo tutti questi fallimenti,\ntu saresti salito su quel siluro?'); brand(b); b.convert('RGB').save(O+'09_commenti.jpg',quality=90)
print('ok')
