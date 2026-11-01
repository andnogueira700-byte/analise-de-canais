# -*- coding: utf-8 -*-
from mplan import *
import urllib.request
tmx=tm
# ---------- ícones/posições
LON={'london':(-0.13,51.5),'tours':(0.69,47.39),'paris':(2.35,48.86),'bordeaux':(-0.58,44.84),'vichy':(3.43,46.12),'toulon':(5.93,43.12),'brest':(-4.49,48.39),'mers':(-0.70,35.735),'gib':(-5.35,36.14),
 'alex':(29.92,31.2),'portsmouth':(-1.09,50.8),'plymouth':(-4.14,50.37),'dakar':(-17.44,14.69),'berlin':(13.4,52.5),'rome':(12.5,41.9),'liverpool':(-2.99,53.4),'ny':(-74,40.7)}
HLF={'France':FRC,'Germany':(120,52,56),'United Kingdom':(56,100,76),'Italy':(110,96,60)}
# ---------- cena de barras (4ª frota)
def rank_scene(t0,t1):
    def draw(t,d,a):
        base=860; x0=300
        tlab(d,960,150,"FLOTTA FRANCESE: LA 4ª DEL MONDO",CREAM,50,al=min(1,(t-t0)/0.5))
        k1=ease((t-t0-0.5)/1.2); d.rectangle([x0,330,x0+700*k1,430],fill=(60,100,160,255)); tlab(d,x0,290,"ROYAL NAVY",CREAM,34,'l',k1)
        for i in range(4): put(d,'ship_hood' if i==0 else 'ship_uk_bb',x0+110+i*150,430,90*k1)
        if t-t0>5.8:
            k2=ease((t-t0-5.8)/1.4); d.rectangle([x0,560,x0+700*k2,660],fill=(150,60,60,255)); d.rectangle([x0+700,560,x0+700+350*k2,660],fill=(255,183,3,255)); tlab(d,x0,520,"ASSE + FLOTTA FRANCESE",CREAM,34,'l',k2)
            for i in range(5): put(d,'ship_fr_bb' if i%2 else 'ship_dd_fr',x0+100+i*190,660,90*k2)
        if t-t0>11.0:
            tlab(d,1560,430,"+50%",AMB,140,al=ease((t-t0-11.0)/0.25))
    L_diagram(t0,t1,draw)
def split_scene(t0,t1,t_l,t_lw,t_r,t_rw):
    def draw(t,d,a):
        d.rectangle([0,0,W//2,H],fill=(30,52,92,255)); d.rectangle([W//2,0,W,H],fill=(86,36,44,255)); d.rectangle([W//2-3,0,W//2+3,H],fill=(236,230,214,255))
        kl=ease((t-t_l)/0.3); kr=ease((t-t_r)/0.3); kw=ease((t-t_lw)/0.2); kv=ease((t-t_rw)/0.2)
        tlab(d,W//4,300,"I FRANCESI LEGGEVANO:",CREAM,40,al=kl); tlab(d,W//4,390,"SORVEGLIANZA",AMB,100,al=kw)
        tlab(d,3*W//4,300,"GLI INGLESI LEGGEVANO:",CREAM,40,al=kr); tlab(d,3*W//4,390,"COMANDO",AMB,100,al=kv)
        put(d,'ship_fr_bb',W//4,780,170*kl); put(d,'ship_uk_bb',3*W//4,780,170*kr)
    L_diagram(t0,t1,draw)
def promise_scene(t0,t1,t_w1,t_w2):
    def draw(t,d,a):
        d.rectangle([0,0,W,H],fill=(8,10,14,255))
        z=1.0+0.10*ease((t-t0)/max(t1-t0,1e-6)); r=int(260+40*math.sin(t*2.2)); d.ellipse([960-r,500-r,960+r,500+r],outline=(255,183,3,60),width=6)
        k1=ease((t-t_w1)/0.2); tlab(d,960,380,"UNA PROMESSA",AMB,int(130*z),al=k1)
        k2=ease((t-t_w2)/0.2); tlab(d,960,560,"NON SI PUÒ VERIFICARE",CREAM,int(76*z),al=k2)
    L_diagram(t0,t1,draw)
def options_scene(t0,t1,t_opts,t_six):
    def draw(t,d,a):
        d.rectangle([0,0,W,H],fill=(14,22,34,255))
        o=[("1","UNIRSI AI BRITANNICI","ship_fr_bb"),("2","PORTO BRITANNICO · EQUIPAGGI RIDOTTI","ship_fr_old"),("3","MARTINICA · O STATI UNITI","ship_fr_bb")]
        for i,(n,txt,ic) in enumerate(o):
            k=ease((t-t_opts[i])/0.5)
            if k<=0: continue
            x=330+i*630; d.rectangle([x-270,230,x+270,830],fill=(24,36,54,255),outline=CREAM+(255,),width=3); tlab(d,x,250,n,AMB,120,al=k); sx=x+90*math.sin(t*1.1+i)*(1 if i<2 else -1); d.line([(x-200,640),(x+200,640)],fill=(120,140,170,255),width=4); put(d,ic,sx,620+4*math.sin(t*2+i),150*k,flip=(i==2)); tlab(d,x,680,txt if len(txt)<22 else txt[:22],CREAM,28,al=k)
            if len(txt)>=22: tlab(d,x,716,txt[22:].strip(),CREAM,28,al=k)
        ks=ease((t-t_six)/0.4)
        if ks>0:
            d.rectangle([0,0,W,H],fill=(120,20,30,int(235*ks))); tlab(d,960,300,"6",CREAM,330,al=ks); tlab(d,960,640,"ORE",CREAM,150,al=ks)
    L_diagram(t0,t1,draw)
def dark_scene(t0,t1,elems):
    def draw(t,d,a):
        d.rectangle([0,0,W,H],fill=(10,14,20,255))
        for i,(tt,x,y,txt,col,sz) in enumerate(elems):
            nxt=[e[0] for e in elems[i+1:] if e[2]==y]
            if nxt and t>=nxt[0]-0.1: continue
            tlab(d,x,y,txt,col,sz,al=ease((t-tt)/0.5))
    L_diagram(t0,t1,draw)
def bay_base(d,cam,t,X=lambda x:x,Y=lambda y:y,Z=1.0):
    d.rectangle([0,0,W,H],fill=SEA+(255,))
    pts=[(-400,-400),(W+400,-400),(W+400,370),(1500,400),(1260,340),(860,360),(460,390),(-400,430)]
    d.polygon([(X(x),Y(y)) for x,y in pts],fill=LAND+(255,),outline=BORD+(255,))
    d.line([(X(420),Y(400)),(X(1440),Y(390))],fill=(206,200,184,255),width=int(26*Z))
    tlab(d,960,130,"MERS-EL-KÉBIR",CREAM,54)
def px(x,y): return (x-960,-(y-540))      # (px de tela) -> (lon,lat) fictícios p/ mp() com cam (0,0,1) — mp usa cos(lat)=1
BAYCAM=[(0,0,0,1)]
def bay_scene(t0,t1,elems,z0=1.0,z1=1.12,pan=(0,0),pan1=(-60,0)):
    def draw(t,d,a):
        u=ease((t-t0)/max(t1-t0,1e-6)); Z=z0+(z1-z0)*u; ox=pan[0]+(pan1[0]-pan[0])*u; oy=pan[1]+(pan1[1]-pan[1])*u
        def X(x): return (x-960)*Z+960+ox
        def Y(y): return (y-540)*Z+540+oy
        bay_base(d,None,t,X,Y,Z)
        for e in elems:
            if t<e['t']: continue
            k=ease((t-e['t'])/0.5)
            if e['k']=='icon':
                x,y=e['p']
                if 'move' in e: u2=ease((t-e['t'])/max(e['move'][2]-e['t'],1e-6)); x=x+(e['move'][0]-x)*u2; y=y+(e['move'][1]-y)*u2
                xx,yy=X(x),Y(y)+3*math.sin(t*2.0+x*0.01); put(d,e['n'],xx,yy,e.get('h',110)*k*Z,flip=e.get('flip',False))
                if e.get('lab'): tlab(d,xx,yy+8,e['lab'],CREAM,e.get('ls',24),al=k)
            elif e['k']=='text': tlab(d,e['x'],e['y'],e['txt'],e.get('c',CREAM),e.get('sz',36),e.get('anchor','c'),k)
            elif e['k']=='net':
                for i in range(9): d.line([(X(1480+i*16),Y(420+i*30)),(X(1520+i*16),Y(450+i*30))],fill=(200,200,200,255),width=3)
                tlab(d,X(1680),Y(500),"CANALE STRETTO · RETI",AMB,28,al=k)
            elif e['k']=='arrow':
                a0=(X(e['a'][0]),Y(e['a'][1])); b0=(X(e['b'][0]),Y(e['b'][1])); u2=ease((t-e['t'])/e.get('d',1.5)); p=(a0[0]+(b0[0]-a0[0])*u2,a0[1]+(b0[1]-a0[1])*u2); d.line([a0,p],fill=e.get('c',RED)+(255,),width=9)
    L_diagram(t0,t1,draw)
def build_scenes():
    T=tmx
    # ============================ mapas com câmera em movimento e navios seguindo setas
    map_scene(T("0:22.6"),T("0:30.5"),[(T("0:22.6"),5,41,42),(T("0:30.5"),4,40,60)],[
      dict(k='icon',n='ship_fr_bb',p=LON['toulon'],t=T("0:23.2"),h=100,lab='TOLONE'),dict(k='icon',n='ship_fr_old',p=LON['mers'],t=T("0:23.8"),h=100,lab='MERS-EL-KÉBIR'),dict(k='icon',n='ship_fr_bb',p=LON['alex'],t=T("0:24.4"),h=100,lab='ALESSANDRIA'),
      dict(k='label',p=LON['berlin'],txt='HITLER',c=RED,sz=34,t=T("0:28.3")),dict(k='arrow',a=(6.2,44.0),b=(12.4,51.5),c=RED,t=T("0:27.6"),d=1.6,ship='ship_fr_bb',sh=70,lap=2.5),dict(k='x',p=(9.3,47.8),t=T("0:29.5"),r=40)],hl=HLF)
    map_scene(T("0:36.2"),T("0:45.7"),[(T("0:36.2"),5,38,40),(T("0:40.0"),-0.7,36.2,150),(T("0:45.7"),-0.7,35.95,260)],[
      dict(k='pin',p=LON['mers'],txt='MERS-EL-KÉBIR',t=T("0:38.6"),sz=36),dict(k='ring',p=LON['mers'],r=90,t=T("0:39.4")),dict(k='label',p=(-0.5,35.62),txt='ALGERIA',sz=40,c=AMB,t=T("0:38.0")),
      dict(k='arrow',a=(1.2,37.0),b=(-0.68,35.78),c=CY,t=T("0:41.0"),d=1.6,ship='ship_fr_bb',sh=90,lap=3.0)],hl=HLF)
    map_scene(T("0:45.7"),T("0:55.2"),[(T("0:45.7"),5,47.5,46),(T("0:55.2"),1.5,48.0,80)],[
      dict(k='label',p=LON['london'],txt='LONDRA',sz=28,t=T("0:50.2"),c=CY),dict(k='arrow',a=(-0.13,51.4),b=(0.69,47.7),c=CY,t=T("0:50.8"),d=2.0,w=10,ship='ship_dd_uk',sh=60,lap=3.0),dict(k='pin',p=LON['tours'],txt='TOURS',t=T("0:52.8"),sz=36)],hl=HLF)
    map_scene(T("0:55.2"),T("1:01.5"),[(T("0:55.2"),1.0,47.0,100),(T("1:01.5"),0.2,46.2,140)],[
      dict(k='pin',p=LON['tours'],txt='TOURS',t=T("0:55.4"),sz=36),dict(k='ring',p=LON['tours'],r=80,t=T("0:56.0"))],hl=HLF,yoff=160)
    rank_scene(T("1:39.4"),T("1:52.3"))
    doc_scene(T("1:52.3"),T("2:00.0"),"16 GIUGNO 1940 · LA RISPOSTA BRITANNICA",["UN ARMISTIZIO SEPARATO È POSSIBILE,","MA A UNA CONDIZIONE:","LA FLOTTA FRANCESE DEVE PRIMA","RAGGIUNGERE I PORTI BRITANNICI."],hl=['CONDIZIONE','FLOTTA'],cps=26,y0=290,size=42)
    doc_scene(T("2:14.2"),T("2:23.3"),"ARMISTIZIO DI COMPIÈGNE · ARTICOLO 8",["LE NAVI DA GUERRA FRANCESI SARANNO","SMOBILITATE E DISARMATE","SOTTO IL CONTROLLO","TEDESCO O ITALIANO."],hl=['CONTROLLO'],cps=24,y0=300,size=44)
    split_scene(T("2:23.3"),T("2:30.5"),T("2:25.9"),T("2:26.8"),T("2:28.3"),T("2:29.6"))
    map_scene(T("2:57.5"),T("3:04.5"),[(T("2:57.5"),-1.5,45.0,60),(T("3:04.5"),1.0,43.8,90)],[
      dict(k='icon',n='ship_fr_bb',p=LON['brest'],t=T("2:57.8"),h=95,lab='BREST'),dict(k='arrow',a=(-4.4,47.9),b=(-8.0,43.5),c=CY,t=T("2:58.2"),d=1.2,ship='ship_fr_bb',sh=70,lap=3.0),dict(k='arrow',a=(-8.0,43.5),b=(-6.5,38.0),c=CY,t=T("2:59.3"),d=1.2,ship='ship_fr_bb',sh=70,lap=3.0),dict(k='arrow',a=(-6.5,38.0),b=(5.4,42.8),c=CY,t=T("3:00.0"),d=2.2,ship='ship_fr_bb',sh=70,lap=3.0),
      dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("3:00.4"),sz=34,c=CY),dict(k='icon',n='ship_fr_burn',p=(5.6,42.3),t=T("3:02.2"),h=95,lab='AUTOAFFONDARSI',lc=AMB)],hl=HLF)
    promise_scene(T("3:14.1"),T("3:28.9"),T("3:21.0"),T("3:25.2"))
    map_scene(T("3:29.06"),T("3:44.5"),[(T("3:29.06"),2,43,22),(T("3:36"),0,36,34),(T("3:44.5"),-4,28,24)],[
      dict(k='label',p=LON['london'],txt='LONDRA',sz=34,t=T("3:29.5"),c=CY),
      dict(k='arrow',a=(-1.5,50.8),b=(-5.3,36.3),c=RED,t=T("3:36.2"),d=1.6,w=8,ship='ship_uk_bb',sh=70,lap=3.2),dict(k='arrow',a=(-0.5,50.6),b=(-0.7,36.2),c=RED,t=T("3:38.0"),d=1.6,w=8,ship='ship_uk_bb',sh=70,lap=3.2),dict(k='arrow',a=(1.5,50.5),b=(29.5,31.6),c=RED,t=T("3:38.6"),d=2.4,w=8,ship='ship_uk_bb',sh=70,lap=4.0),dict(k='arrow',a=(-3.0,50.5),b=(-16.5,15.4),c=RED,t=T("3:39.6"),d=2.0,w=8,ship='ship_uk_bb',sh=70,lap=4.0),
      dict(k='label',p=LON['gib'],txt='GIBILTERRA',sz=24,t=T("3:36.6")),dict(k='label',p=(-0.7,35.2),txt='ORANO',sz=24,t=T("3:38.4")),dict(k='label',p=LON['alex'],txt='ALESSANDRIA',sz=24,t=T("3:39.0")),dict(k='label',p=(-17.4,14.0),txt='DAKAR',sz=24,t=T("3:40.0")),dict(k='label',p=LON['portsmouth'],txt='PORTSMOUTH · PLYMOUTH',sz=22,t=T("3:35.4"),c=AMB)],hl=HLF)
    map_scene(T("4:10.4"),T("4:17.0"),[(T("4:10.4"),-5.2,36.2,420),(T("4:17.0"),-3.0,35.9,200)],[
      dict(k='pin',p=LON['gib'],txt='GIBILTERRA',t=T("4:10.8"),sz=34,c=CY),dict(k='icon',n='ship_hood',p=(-5.35,36.1),t=T("4:11.3"),h=100,move=(-2.5,35.6,T("4:18.0"))),dict(k='icon',n='ship_uk_bb',p=(-5.38,36.12),t=T("4:11.8"),h=90,move=(-2.4,35.5,T("4:18.3"))),dict(k='icon',n='carrier',p=(-5.4,36.1),t=T("4:12.3"),h=90,move=(-2.3,35.4,T("4:18.5"))),
      dict(k='text',x=960,y=950,txt='2 LUGLIO · LA FORZA H SALPA',c=AMB,sz=40,t=T("4:13.0"))],hl=HLF)
    doc_scene(T("4:17.0"),T("4:28.6"),"TELEGRAMMA DI CHURCHILL · 2 LUGLIO 1940",["«SIETE INCARICATO DI UNO DEI COMPITI","PIÙ SGRADEVOLI E DIFFICILI CHE SIA MAI","TOCCATO A UN AMMIRAGLIO BRITANNICO,","MA ABBIAMO PIENA FIDUCIA IN VOI»"],hl=['SGRADEVOLI','FIDUCIA'],cps=30,y0=290,size=42)
    map_scene(T("4:28.6"),T("4:44.0"),[(T("4:28.6"),-2.6,50.6,150),(T("4:44.0"),-2.6,50.5,230)],[
      dict(k='pin',p=LON['portsmouth'],txt='PORTSMOUTH',t=T("4:33.4"),sz=30),dict(k='pin',p=LON['plymouth'],txt='PLYMOUTH',t=T("4:33.8"),sz=30),
      dict(k='arrow',a=(-1.6,50.2),b=(-1.15,50.75),c=CY,t=T("4:34.6"),d=1.4,ship='ship_dd_uk',sh=70,lap=2.6),dict(k='arrow',a=(-4.6,49.9),b=(-4.15,50.33),c=CY,t=T("4:35.2"),d=1.4,ship='ship_dd_uk',sh=70,lap=2.6),
      dict(k='icon',n='ship_fr_old',p=(-1.2,50.72),t=T("4:41.0"),h=90,lab='PARIS'),dict(k='icon',n='ship_fr_old',p=(-4.2,50.28),t=T("4:42.4"),h=90,lab='COURBET')],hl=HLF)
    map_scene(T("5:02.7"),T("5:27.2"),[(T("5:02.7"),29.0,31.3,300),(T("5:11.5"),29.9,31.22,520),(T("5:27.2"),29.9,31.22,640)],[
      dict(k='pin',p=LON['alex'],txt='ALESSANDRIA',t=T("5:03.0"),sz=34),dict(k='icon',n='ship_fr_bb',p=(29.8,31.22),t=T("5:04.5"),h=100,lab='SQUADRA GODFROY'),
      dict(k='icon',n='ship_uk_bb',p=(30.6,31.45),t=T("5:11.6"),h=100,lab='CUNNINGHAM',move=(30.1,31.25,T("5:16.0"))),
      dict(k='arrow',a=(30.05,31.24),b=(29.85,31.23),c=GRN,t=T("5:17.0"),d=1.2),dict(k='text',x=960,y=950,txt='4 LUGLIO · ACCORDO: NESSUNO SPARA',c=GRN,sz=44,t=T("5:15.0"))],hl=HLF,yoff=120)
    # baía: três cenas com câmera e navios em movimento
    bay_scene(T("5:27.3"),T("5:38.6"),[
      dict(k='icon',n='ship_fr_old',p=(570,470),t=T("5:27.6"),h=120,lab='BRETAGNE'),dict(k='icon',n='ship_fr_old',p=(830,470),t=T("5:27.9"),h=120,lab='PROVENCE'),dict(k='icon',n='ship_fr_bb',p=(1090,470),t=T("5:28.2"),h=120,lab='STRASBOURG'),dict(k='icon',n='ship_fr_bb',p=(1350,470),t=T("5:28.5"),h=120,lab='DUNKERQUE'),
      dict(k='icon',n='ship_dd_uk',p=(2000,760),t=T("5:27.4"),h=110,move=(1500,640,T("5:36.0")),lab='FOXHOUND',flip=False),dict(k='text',x=960,y=1030,txt='08:00',c=AMB,sz=60,t=T("5:27.6"))],z0=1.0,z1=1.25,pan=(0,-30),pan1=(-120,-60))
    bay_scene(T("5:50.0"),T("6:03.0"),[
      dict(k='icon',n='ship_fr_old',p=(570,470),t=T("5:50.0"),h=120),dict(k='icon',n='ship_fr_old',p=(830,470),t=T("5:50.0"),h=120),dict(k='icon',n='ship_fr_bb',p=(1090,470),t=T("5:50.0"),h=120),dict(k='icon',n='ship_fr_bb',p=(1350,470),t=T("5:50.0"),h=120),
      dict(k='icon',n='ship_hood',p=(-300,160),t=T("5:50.2"),h=130,lab='HOOD',move=(300,170,T("5:58.0"))),dict(k='icon',n='ship_uk_bb',p=(-450,300),t=T("5:54.0"),h=120,lab='VALIANT',move=(150,300,T("6:01.0"))),dict(k='icon',n='ship_uk_bb',p=(-250,300),t=T("5:54.6"),h=120,lab='RESOLUTION',move=(420,310,T("6:02.0"))),dict(k='icon',n='carrier',p=(-400,430),t=T("5:57.2"),h=100,lab='ARK ROYAL',move=(300,440,T("6:02.8"))),
      dict(k='text',x=300,y=60,txt='FORZA H',c=CY,sz=48,t=T("5:50.0"))],z0=1.2,z1=1.0,pan=(120,0),pan1=(0,0))
    bay_scene(T("6:10.9"),T("6:17.0"),[
      dict(k='icon',n='ship_fr_old',p=(570,470),t=T("6:10.9"),h=120),dict(k='icon',n='ship_fr_old',p=(830,470),t=T("6:10.9"),h=120),dict(k='icon',n='ship_fr_bb',p=(1090,470),t=T("6:10.9"),h=120),dict(k='icon',n='ship_fr_bb',p=(1350,470),t=T("6:10.9"),h=120),
      dict(k='net',t=T("6:12.2")),dict(k='arrow',a=(1420,440),b=(1820,640),c=AMB,t=T("6:12.6"),d=1.8),dict(k='text',x=960,y=990,txt='UNICA USCITA: CANALE STRETTO',c=CREAM,sz=40,t=T("6:12.4"))],z0=1.0,z1=1.3,pan=(0,0),pan1=(-380,-120))
    options_scene(T("6:27.0"),T("6:50.4"),[T("6:27.3"),T("6:30.6"),T("6:36.8")],T("6:46.4"))
    doc_scene(T("6:54.8"),T("7:02.5"),"IL MESSAGGIO DI HOLLAND",["«SE RIFIUTATE QUESTE OFFERTE GIUSTE,","CON PROFONDO RAMMARICO DEVO CHIEDERVI","DI AFFONDARE LE VOSTRE NAVI","ENTRO SEI ORE»"],hl=['SEI ORE','AFFONDARE'],cps=36,y0=290,size=42)
    doc_scene(T("7:04.8"),T("7:08.4"),"RISPOSTA DI GENSOUL",["I FRANCESI RISPONDERANNO","ALLA FORZA CON LA FORZA."],hl=['FORZA'],cps=26,y0=380,size=50)
    clock_scene(T("7:12.7"),T("7:20.1"),[(T("7:13.5"),15,0,"IL TEMPO PASSA")],title="3 LUGLIO 1940")
    clock_scene(T("7:25.6"),T("7:44.0"),[(T("7:26.6"),15,30,"PRIMA SCADENZA · POI PROROGATA"),(T("7:30.4"),16,15,"HOLLAND SULLA DUNKERQUE"),(T("7:41.6"),16,30,"«PENSO CHE STIANO CEDENDO»",GRN)],title="3 LUGLIO 1940")
    dark_scene(T("7:55.4"),T("8:06.8"),[(T("7:55.6"),960,420,"INFORMAZIONI INCOMPLETE",AMB,76)])
    doc_scene(T("8:06.8"),T("8:15.0"),"RAPPORTO DI GENSOUL AL SUO GOVERNO",["LE ALTERNATIVE SONO:","1. INTERNAMENTO","2. COMBATTIMENTO","3. INDIE OCCIDENTALI"],hl=['INDIE'],strike=['INDIE','OCCIDENTALI'],cps=18,y0=290,size=46)
    map_scene(T("8:15.0"),T("8:30.6"),[(T("8:15.0"),1.5,46.0,60),(T("8:30.6"),2.5,45.0,100)],[
      dict(k='text',x=960,y=950,txt='DARLAN: NON RAGGIUNGIBILE',c=RED,sz=46,t=T("8:18.0")),dict(k='pin',p=LON['bordeaux'],txt='BORDEAUX',t=T("8:21.0"),sz=30),
      dict(k='arrow',a=(-0.58,44.9),b=(3.2,46.0),c=AMB,t=T("8:21.8"),d=1.6,ship='ship_dd_fr',sh=60,lap=3.0),dict(k='pin',p=LON['vichy'],txt='VICHY',t=T("8:23.4"),sz=30,c=AMB),dict(k='x',p=(0.4,46.9),t=T("8:19.0"),r=50)],hl=HLF)
    clock_scene(T("8:50.0"),T("8:57.0"),[(T("8:51.0"),16,45,"MESSAGGIO DELL'AMMIRAGLIATO")],title="3 LUGLIO 1940")
    clock_scene(T("9:05.0"),T("9:18.5"),[(T("9:05.4"),17,10,"I FRANCESI RINFORZANO ORANO"),(T("9:07.6"),17,30,"SCADE L'ULTIMA PROROGA"),(T("9:14.6"),17,55,"FUOCO!",RED)],title="3 LUGLIO 1940")
    map_scene(T("10:23.6"),T("10:40.5"),[(T("10:23.6"),-0.5,36.0,160),(T("10:30"),1.5,38.0,70),(T("10:40.5"),4.5,41.5,90)],[
      dict(k='pin',p=LON['mers'],txt='MERS-EL-KÉBIR',t=T("10:24.0"),sz=30),dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("10:46.2"),sz=30,c=CY),
      dict(k='icon',n='ship_fr_bb',p=LON['mers'],t=T("10:27.8"),h=100,move=(5.6,42.7,T("10:44.0")),lab='STRASBOURG'),dict(k='arrow',a=(-0.5,36.0),b=(5.4,42.5),c=CY,t=T("10:29.4"),d=3.0,w=7),
      dict(k='text',x=960,y=960,txt='28 NODI',c=AMB,sz=70,t=T("10:35.6")),dict(k='icon',n='swordfish',p=(-0.2,36.4),t=T("10:36.8"),h=70,move=(2.5,39.2,T("10:44.0")))],hl=HLF,yoff=120)
    map_scene(T("11:53.7"),T("12:06.0"),[(T("11:53.7"),1.5,43.5,38),(T("12:06.0"),-2.0,40.5,64)],[
      dict(k='arrow',a=(2.8,43.9),b=(-5.2,36.3),c=RED,t=T("11:54.2"),d=2.0),dict(k='pin',p=LON['gib'],txt='GIBILTERRA',t=T("11:55.6"),sz=28),dict(k='text',x=960,y=1000,txt='AEREI FRANCESI SU GIBILTERRA',c=RED,sz=40,t=T("11:54.4")),dict(k='icon',n='swordfish',p=(2.8,43.9),t=T("11:54.2"),h=60,move=(-5.2,36.3,T("12:03.0")),flip=True)],hl=HLF)
    map_scene(T("12:19.5"),T("12:26.0"),[(T("12:19.5"),-38,43,20),(T("12:26.0"),-30,46,24)],[
      dict(k='label',p=(-72,41),txt='STATI UNITI',sz=34,t=T("12:19.8"),c=CY),dict(k='label',p=(-6,53),txt='REGNO UNITO',sz=34,t=T("12:19.8"),c=GRN),
      dict(k='icon',n='ship_dd_uk',p=(-70,42),t=T("12:20.5"),h=95,move=(-8,50,T("12:25.5"))),dict(k='icon',n='ship_dd_uk',p=(-69,40),t=T("12:20.7"),h=90,move=(-9,49,T("12:25.7"))),dict(k='icon',n='ship_dd_uk',p=(-68,38),t=T("12:20.9"),h=90,move=(-10,48,T("12:25.9"))),
      dict(k='text',x=960,y=950,txt='50 CACCIATORPEDINIERE',c=AMB,sz=56,t=T("12:21.0"))],hl=HLF)
    map_scene(T("12:30.5"),T("12:46.5"),[(T("12:30.5"),2.5,47.0,52),(T("12:46.5"),4.0,44.5,90)],[
      dict(k='arrow',a=(4.5,50.4),b=(4.5,45.2),c=RED,t=T("12:40.6"),d=2.2),dict(k='arrow',a=(7.5,49.0),b=(5.0,44.0),c=RED,t=T("12:40.8"),d=2.2),dict(k='arrow',a=(2.0,50.2),b=(2.5,45.0),c=RED,t=T("12:41.0"),d=2.2),
      dict(k='label',p=(3.0,44.3),txt='ZONA LIBERA',sz=36,c=AMB,t=T("12:40.3")),dict(k='text',x=960,y=1000,txt='OPERAZIONE LILA',c=RED,sz=52,t=T("12:42.4"))],hl={**HLF,'France':(70,96,150)})
    map_scene(T("12:46.5"),T("12:51.4"),[(T("12:46.5"),4.5,45.0,80),(T("12:51.4"),5.9,43.2,330)],[
      dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("12:46.8"),sz=34,c=CY),dict(k='icon',n='ship_fr_bb',p=(5.8,43.0),t=T("12:47.2"),h=110),dict(k='icon',n='ship_fr_old',p=(6.1,43.05),t=T("12:47.6"),h=100),dict(k='arrow',a=(6.0,44.6),b=(5.93,43.2),c=RED,t=T("12:48.2"),d=2.4,ship='ship_dd_uk',sh=60,lap=2.0)],hl={**HLF,'France':(70,96,150)})
    def sink(t0,t1):
        def draw(t,d,a):
            u=ease((t-t0)/max(t1-t0,1e-6)); draw_map(d,(5.93,43.1,330+80*u),HLF)
            for i in range(8):
                xx=500+i*130; yy=520+(i%2)*90+4*math.sin(t*2+i); ts=T("12:53.0")+i*0.5; n='ship_fr_burn' if t>ts else ('ship_fr_bb' if i%2 else 'ship_fr_old'); put(d,n,xx,yy,110*ease((t-t0)/0.4))
                if t>ts and t<ts+1.4: d.ellipse([xx-50,yy-50-10*math.sin((t-ts)*8),xx+50,yy+20],outline=(255,255,255,int(200*(1-(t-ts)/1.4))),width=5)
            if t>T("12:55.5"): tlab(d,960,150,"77 NAVI",AMB,110,al=ease((t-T("12:55.5"))/0.5))
            for tt,txt,y in ((T("12:55.5"),"3 CORAZZATE",330),(T("12:56.6"),"7 INCROCIATORI",410),(T("12:57.4"),"15 CACCIATORPEDINIERE",490),(T("12:59.0"),"12 SOMMERGIBILI",570)):
                if t>tt: tlab(d,260,y,txt,CREAM,36,'l',ease((t-tt)/0.4))
        L_diagram(t0,t1,draw)
    sink(T("12:51.4"),T("13:00.6"))
    dark_scene(T("13:28.4"),T("13:46.5"),[(T("13:28.6"),960,230,"FALLIMENTO TATTICO",AMB,76),(T("13:41.3"),960,230,"NESSUNO POTEVA SAPERLO",CREAM,70)])
    dark_scene(T("13:55.4"),T("14:05.2"),[(T("13:59.6"),960,230,"ERRORE DI COMUNICAZIONE",AMB,70)])
    doc_scene(T("11:39.5"),T("11:46.8"),"CAMERA DEI COMUNI · 4 LUGLIO 1940",["«LASCIO IL GIUDIZIO AL PARLAMENTO,","CON FIDUCIA»","","«LASCIO IL GIUDIZIO AL MONDO","E ALLA STORIA»"],hl=['GIUDIZIO'],cps=22,y0=270,size=44)
