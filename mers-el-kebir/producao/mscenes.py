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
        if t-t0>4.0:
            k2=ease((t-t0-4.0)/1.4); d.rectangle([x0,560,x0+700*k2,660],fill=(150,60,60,255)); d.rectangle([x0+700,560,x0+700+350*k2,660],fill=(255,183,3,255)); tlab(d,x0,520,"ASSE + FLOTTA FRANCESE",CREAM,34,'l',k2)
            for i in range(5): put(d,'ship_fr_bb' if i%2 else 'ship_dd_fr',x0+100+i*190,660,90*k2)
        if t-t0>7.0:
            tlab(d,1560,430,"+50%",AMB,140,al=ease((t-t0-7.0)/0.5))
    L_diagram(t0,t1,draw)
def split_scene(t0,t1,t_l,t_r):
    def draw(t,d,a):
        d.rectangle([0,0,W//2,H],fill=(30,52,92,255)); d.rectangle([W//2,0,W,H],fill=(86,36,44,255)); d.rectangle([W//2-3,0,W//2+3,H],fill=(236,230,214,255))
        kl=ease((t-t_l)/0.5); kr=ease((t-t_r)/0.5)
        tlab(d,W//4,300,"I FRANCESI LEGGEVANO:",CREAM,40,al=kl); tlab(d,W//4,390,"SORVEGLIANZA",AMB,100,al=kl)
        tlab(d,3*W//4,300,"GLI INGLESI LEGGEVANO:",CREAM,40,al=kr); tlab(d,3*W//4,390,"COMANDO",AMB,100,al=kr)
        put(d,'ship_fr_bb',W//4,780,170*kl); put(d,'ship_uk_bb',3*W//4,780,170*kr)
    L_diagram(t0,t1,draw)
def promise_scene(t0,t1,t_w1,t_w2):
    def draw(t,d,a):
        d.rectangle([0,0,W,H],fill=(8,10,14,255))
        k1=ease((t-t_w1)/0.6); tlab(d,960,380,"UNA PROMESSA",AMB,130,al=k1)
        k2=ease((t-t_w2)/0.6); tlab(d,960,560,"NON SI PUÒ VERIFICARE",CREAM,76,al=k2)
    L_diagram(t0,t1,draw)
def options_scene(t0,t1,t_opts,t_six):
    def draw(t,d,a):
        d.rectangle([0,0,W,H],fill=(14,22,34,255))
        o=[("1","UNIRSI AI BRITANNICI","ship_fr_bb"),("2","PORTO BRITANNICO · EQUIPAGGI RIDOTTI","ship_fr_old"),("3","MARTINICA · O STATI UNITI","ship_fr_bb")]
        for i,(n,txt,ic) in enumerate(o):
            k=ease((t-t_opts[i])/0.5)
            if k<=0: continue
            x=330+i*630; d.rectangle([x-270,230,x+270,830],fill=(24,36,54,255),outline=CREAM+(255,),width=3); tlab(d,x,250,n,AMB,120,al=k); put(d,ic,x,600,150*k); tlab(d,x,680,txt if len(txt)<22 else txt[:22],CREAM,28,al=k)
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
def bay_base(d,cam,t):
    d.rectangle([0,0,W,H],fill=SEA+(255,))
    d.polygon([(0,0),(W,0),(W,370),(1500,400),(1260,340),(860,360),(460,390),(0,430)],fill=LAND+(255,),outline=BORD+(255,))
    d.line([(420,400),(1440,390)],fill=(206,200,184,255),width=26)
    tlab(d,960,130,"MERS-EL-KÉBIR",CREAM,54)
def px(x,y): return (x-960,-(y-540))      # (px de tela) -> (lon,lat) fictícios p/ mp() com cam (0,0,1) — mp usa cos(lat)=1
BAYCAM=[(0,0,0,1)]
def bay_scene(t0,t1,elems):
    def draw(t,d,a):
        bay_base(d,None,t)
        for e in elems:
            if t<e['t']: continue
            k=ease((t-e['t'])/0.5)
            if e['k']=='icon':
                x,y=e['p']
                if 'move' in e: u=ease((t-e['t'])/max(e['move'][2]-e['t'],1e-6)); x=x+(e['move'][0]-x)*u; y=y+(e['move'][1]-y)*u
                put(d,e['n'],x,y,e.get('h',110)*k,flip=e.get('flip',False))
                if e.get('lab'): tlab(d,x,y+8,e['lab'],CREAM,e.get('ls',24),al=k)
            elif e['k']=='text': tlab(d,e['x'],e['y'],e['txt'],e.get('c',CREAM),e.get('sz',36),e.get('anchor','c'),k)
            elif e['k']=='net':
                for i in range(9): d.line([(1480+i*16,420+i*30),(1520+i*16,450+i*30)],fill=(200,200,200,255),width=3)
                tlab(d,1680,500,"CANALE STRETTO · RETI",AMB,28,al=k)
            elif e['k']=='arrow':
                a0=e['a']; b0=e['b']; u=ease((t-e['t'])/e.get('d',1.5)); p=(a0[0]+(b0[0]-a0[0])*u,a0[1]+(b0[1]-a0[1])*u); d.line([a0,p],fill=e.get('c',RED)+(255,),width=9)
    L_diagram(t0,t1,draw)
def build_scenes():
    T=tmx
    # --- mapas
    map_scene(T("0:22.6"),T("0:36.2"),[(T("0:22.6"),8,40,36),(T("0:36.2"),5,38,40)],[
      dict(k='icon',n='ship_fr_bb',p=LON['toulon'],t=T("0:23.2"),h=100,lab='TOLONE'),dict(k='icon',n='ship_fr_old',p=LON['mers'],t=T("0:23.8"),h=100,lab='MERS-EL-KÉBIR'),dict(k='icon',n='ship_fr_bb',p=LON['alex'],t=T("0:24.4"),h=100,lab='ALESSANDRIA'),
      dict(k='label',p=LON['berlin'],txt='HITLER',c=RED,sz=34,t=T("0:26.6")),dict(k='arrow',a=(6.2,44.0),b=(12.4,51.5),c=RED,t=T("0:26.8"),d=1.8),dict(k='x',p=(9.3,47.8),t=T("0:29.0"),r=40)],hl=HLF)
    map_scene(T("0:36.2"),T("0:45.3"),[(T("0:36.2"),5,38,40),(T("0:40.0"),-0.7,36.2,150),(T("0:45.3"),-0.7,35.95,240)],[
      dict(k='ring',p=LON['mers'],r=90,t=T("0:38.4")),dict(k='pin',p=LON['mers'],txt='MERS-EL-KÉBIR',t=T("0:37.2"),sz=36),dict(k='label',p=(-0.5,35.62),txt='ALGERIA',sz=40,c=AMB,t=T("0:41.6")),dict(k='label',p=(-0.95,35.62),txt='ORANO',sz=28,t=T("0:42.5"))],hl=HLF)
    map_scene(T("0:45.7"),T("1:01.5"),[(T("0:45.7"),2.5,46.5,64),(T("1:01.5"),1.2,46.6,88)],[
      dict(k='arrow',a=(7.5,50.5),b=(2.4,48.9),c=RED,t=T("0:46.4"),d=2.0),dict(k='arrow',a=(7.5,48.8),b=(1.6,47.2),c=RED,t=T("0:47.4"),d=2.0),dict(k='arrow',a=(-0.13,51.4),b=(0.69,47.7),c=CY,t=T("0:51.0"),d=2.0,w=10),
      dict(k='label',p=LON['paris'],txt='PARIGI',sz=28,t=T("0:46.4")),dict(k='pin',p=LON['tours'],txt='TOURS',t=T("0:53.5"),sz=36),dict(k='label',p=LON['london'],txt='LONDRA',sz=28,t=T("0:51.0"),c=CY),
      dict(k='arrow',a=(2.35,48.6),b=(-0.58,45.1),c=AMB,t=T("0:58.2"),d=1.8),dict(k='label',p=(-0.58,44.6),txt='BORDEAUX',sz=26,t=T("0:59.2"),c=AMB)],hl=HLF)
    rank_scene(T("1:39.4"),T("1:52.3"))
    doc_scene(T("1:52.3"),T("2:06.3"),"16 GIUGNO 1940 · LA RISPOSTA BRITANNICA",["UN ARMISTIZIO SEPARATO È POSSIBILE,","MA A UNA CONDIZIONE:","LA FLOTTA FRANCESE DEVE PRIMA","RAGGIUNGERE I PORTI BRITANNICI.","","NON ANDÒ COSÌ."],hl=['CONDIZIONE','FLOTTA','NON'],cps=26,y0=290,size=42,wdt=1260)
    doc_scene(T("2:14.2"),T("2:23.3"),"ARMISTIZIO DI COMPIÈGNE · ARTICOLO 8",["LE NAVI DA GUERRA FRANCESI SARANNO","SMOBILITATE E DISARMATE","SOTTO IL CONTROLLO","TEDESCO O ITALIANO."],hl=['CONTROLLO'],cps=24,y0=300,size=44)
    split_scene(T("2:23.3"),T("2:37.2"),T("2:25.0"),T("2:29.0"))
    map_scene(T("2:51.1"),T("3:14.0"),[(T("2:51.1"),-1.5,45.0,60),(T("3:14.0"),0.5,44.5,66)],[
      dict(k='icon',n='ship_fr_bb',p=LON['brest'],t=T("2:57.6"),h=95,lab='BREST'),dict(k='arrow',a=(-4.4,47.9),b=(-8.0,43.5),c=CY,t=T("2:58.4"),d=1.4),dict(k='arrow',a=(-8.0,43.5),b=(-6.5,38.0),c=CY,t=T("2:59.3"),d=1.2),dict(k='arrow',a=(-6.5,38.0),b=(5.4,42.8),c=CY,t=T("3:00.0"),d=2.2),
      dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("3:00.4"),sz=34,c=CY),dict(k='icon',n='ship_fr_burn',p=(5.6,42.3),t=T("3:02.2"),h=95,lab='AUTOAFFONDARSI',lc=AMB),dict(k='label',p=(-1.3,43.1),txt='FLOTTA DELL\'ATLANTICO',sz=26,t=T("2:58.4"),c=CY)],hl=HLF)
    promise_scene(T("3:14.1"),T("3:28.9"),T("3:21.0"),T("3:25.2"))
    map_scene(T("3:29.06"),T("3:44.5"),[(T("3:29.06"),2,36,22),(T("3:44.5"),2,36,22)],[
      dict(k='label',p=LON['london'],txt='LONDRA',sz=34,t=T("3:29.5"),c=CY),
      dict(k='arrow',a=(-1.5,50.8),b=(-5.3,36.3),c=RED,t=T("3:36.2"),d=1.2,w=8),dict(k='arrow',a=(-0.5,50.6),b=(-0.7,36.2),c=RED,t=T("3:38.0"),d=1.2,w=8),dict(k='arrow',a=(1.5,50.5),b=(29.5,31.6),c=RED,t=T("3:38.6"),d=2.0,w=8),dict(k='arrow',a=(-3.0,50.5),b=(-16.5,15.4),c=RED,t=T("3:39.6"),d=1.6,w=8),
      dict(k='label',p=LON['gib'],txt='GIBILTERRA',sz=24,t=T("3:36.6")),dict(k='label',p=(-0.7,35.2),txt='ORANO',sz=24,t=T("3:38.4")),dict(k='label',p=LON['alex'],txt='ALESSANDRIA',sz=24,t=T("3:39.0")),dict(k='label',p=(-17.4,14.0),txt='DAKAR',sz=24,t=T("3:40.0")),
      dict(k='label',p=LON['portsmouth'],txt='PORTSMOUTH · PLYMOUTH',sz=22,t=T("3:35.4"),c=AMB)],hl=HLF)
    map_scene(T("4:10.4"),T("4:18.5"),[(T("4:10.4"),-5.2,36.2,420),(T("4:18.5"),-4.5,36.0,260)],[
      dict(k='pin',p=LON['gib'],txt='GIBILTERRA',t=T("4:10.8"),sz=34,c=CY),dict(k='icon',n='ship_hood',p=(-5.35,36.1),t=T("4:11.3"),h=100,move=(-4.0,35.8,T("4:17.5"))),dict(k='icon',n='ship_uk_bb',p=(-5.38,36.12),t=T("4:11.8"),h=90,move=(-3.9,35.7,T("4:17.8"))),dict(k='icon',n='carrier',p=(-5.4,36.1),t=T("4:12.3"),h=90,move=(-3.8,35.6,T("4:18.0"))),
      dict(k='text',x=960,y=950,txt='2 LUGLIO · LA FORZA H SALPA',c=AMB,sz=40,t=T("4:13.0"))],hl=HLF)
    doc_scene(T("4:18.5"),T("4:28.6"),"TELEGRAMMA DI CHURCHILL · 2 LUGLIO 1940",["«SIETE INCARICATO DI UNO DEI COMPITI","PIÙ SGRADEVOLI E DIFFICILI CHE SIA MAI","TOCCATO A UN AMMIRAGLIO BRITANNICO,","MA ABBIAMO PIENA FIDUCIA IN VOI»"],hl=['SGRADEVOLI','FIDUCIA'],cps=30,y0=290,size=42)
    map_scene(T("4:28.6"),T("4:48.0"),[(T("4:28.6"),-2.6,50.5,160),(T("4:48.0"),-2.6,50.5,175)],[
      dict(k='pin',p=LON['portsmouth'],txt='PORTSMOUTH',t=T("4:33.4"),sz=30),dict(k='pin',p=LON['plymouth'],txt='PLYMOUTH',t=T("4:33.8"),sz=30),
      dict(k='icon',n='ship_fr_old',p=(-1.2,50.72),t=T("4:39.0"),h=90,lab='PARIS'),dict(k='icon',n='ship_fr_old',p=(-4.2,50.28),t=T("4:40.0"),h=90,lab='COURBET'),dict(k='icon',n='sub',p=(-3.3,50.0),t=T("4:44.0"),h=60),dict(k='icon',n='ship_dd_fr',p=(-2.2,50.05),t=T("4:44.6"),h=70),
      dict(k='text',x=960,y=980,txt='≈ 200 UNITÀ MINORI',c=AMB,sz=44,t=T("4:49.0"))],hl=HLF)
    map_scene(T("5:02.7"),T("5:27.2"),[(T("5:02.7"),29.9,31.25,420),(T("5:27.2"),29.9,31.25,520)],[
      dict(k='pin',p=LON['alex'],txt='ALESSANDRIA',t=T("5:03.0"),sz=34),dict(k='icon',n='ship_fr_bb',p=(29.8,31.22),t=T("5:04.5"),h=100,lab='SQUADRA GODFROY'),dict(k='icon',n='ship_uk_bb',p=(30.1,31.24),t=T("5:08.8"),h=100,lab='CUNNINGHAM'),
      dict(k='arrow',a=(30.05,31.24),b=(29.85,31.23),c=GRN,t=T("5:19.8"),d=1.2),dict(k='text',x=960,y=950,txt='4 LUGLIO · ACCORDO: NESSUNO SPARA',c=GRN,sz=44,t=T("5:21.0"))],hl=HLF)
    # --- baía
    bay_scene(T("5:27.3"),T("6:17.0"),[
      dict(k='icon',n='ship_fr_old',p=(570,470),t=T("5:27.6"),h=120,lab='BRETAGNE'),dict(k='icon',n='ship_fr_old',p=(830,470),t=T("5:27.9"),h=120,lab='PROVENCE'),dict(k='icon',n='ship_fr_bb',p=(1090,470),t=T("5:28.2"),h=120,lab='STRASBOURG'),dict(k='icon',n='ship_fr_bb',p=(1350,470),t=T("5:28.5"),h=120,lab='DUNKERQUE'),
      dict(k='icon',n='ship_dd_uk',p=(1900,700),t=T("5:27.4"),h=110,move=(1500,640,T("5:36.0")),lab='FOXHOUND'),dict(k='text',x=960,y=1030,txt='08:00',c=AMB,sz=60,t=T("5:27.6")),
      dict(k='icon',n='ship_hood',p=(300,160),t=T("5:50.2"),h=130,lab='HOOD'),dict(k='icon',n='ship_uk_bb',p=(150,300),t=T("5:54.0"),h=120,lab='VALIANT'),dict(k='icon',n='ship_uk_bb',p=(420,300),t=T("5:54.6"),h=120,lab='RESOLUTION'),dict(k='icon',n='carrier',p=(300,430),t=T("5:57.2"),h=100,lab='ARK ROYAL'),dict(k='icon',n='ship_dd_uk',p=(120,470),t=T("5:59.0"),h=90),
      dict(k='net',t=T("6:13.4")),dict(k='text',x=300,y=60,txt='FORZA H',c=CY,sz=48,t=T("5:50.0"))])
    options_scene(T("6:17.2"),T("6:50.4"),[T("6:27.3"),T("6:30.6"),T("6:36.8")],T("6:46.4"))
    doc_scene(T("6:50.5"),T("7:02.4"),"IL MESSAGGIO DI HOLLAND",["«SE RIFIUTATE QUESTE OFFERTE GIUSTE,","CON PROFONDO RAMMARICO DEVO CHIEDERVI","DI AFFONDARE LE VOSTRE NAVI","ENTRO SEI ORE»"],hl=['SEI ORE','AFFONDARE'],cps=30,y0=290,size=42)
    doc_scene(T("7:02.5"),T("7:08.4"),"RISPOSTA DI GENSOUL",["I FRANCESI RISPONDERANNO","ALLA FORZA CON LA FORZA."],hl=['FORZA'],cps=26,y0=380,size=50)
    clock_scene(T("7:12.7"),T("7:44.0"),[(T("7:13.5"),15,0,"IL TEMPO PASSA"),(T("7:26.6"),15,30,"PRIMA SCADENZA · POI PROROGATA"),(T("7:30.4"),16,15,"HOLLAND SULLA DUNKERQUE"),(T("7:40.5"),16,30,"«PENSO CHE STIANO CEDENDO»",GRN)],title="3 LUGLIO 1940")
    dark_scene(T("7:44.2"),T("8:05.0"),[(T("7:55.4"),960,150,"INFORMAZIONI INCOMPLETE",AMB,70)])
    doc_scene(T("8:05.0"),T("8:30.4"),"RAPPORTO DI GENSOUL AL SUO GOVERNO",["LE ALTERNATIVE SONO:","1. INTERNAMENTO","2. COMBATTIMENTO","3. INDIE OCCIDENTALI"],hl=['INDIE'],strike=['INDIE','OCCIDENTALI'],cps=18,y0=290,size=46)
    map_scene(T("8:30.6"),T("8:50.0"),[(T("8:30.6"),1.5,46.0,64),(T("8:50.0"),1.5,46.0,64)],[
      dict(k='arrow',a=(-0.58,44.9),b=(3.2,46.0),c=AMB,t=T("8:36.4"),d=2.0),dict(k='pin',p=LON['bordeaux'],txt='BORDEAUX',t=T("8:36.0"),sz=30),dict(k='pin',p=LON['vichy'],txt='VICHY',t=T("8:38.4"),sz=30,c=AMB),
      dict(k='x',p=(0.4,46.9),t=T("8:30.9"),r=50),dict(k='text',x=960,y=950,txt='DARLAN: NON RAGGIUNGIBILE',c=RED,sz=46,t=T("8:31.0"))],hl=HLF)
    clock_scene(T("8:50.0"),T("9:18.5"),[(T("8:51.0"),16,45,"MESSAGGIO DELL'AMMIRAGLIATO"),(T("9:07.6"),17,30,"SCADE L'ULTIMA PROROGA"),(T("9:14.6"),17,55,"FUOCO!",RED)],title="3 LUGLIO 1940")
    map_scene(T("10:23.6"),T("10:48.2"),[(T("10:23.6"),2.5,39.5,50),(T("10:48.2"),2.5,39.5,50)],[
      dict(k='pin',p=LON['mers'],txt='MERS-EL-KÉBIR',t=T("10:24.0"),sz=30),dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("10:25.0"),sz=30,c=CY),
      dict(k='icon',n='ship_fr_bb',p=LON['mers'],t=T("10:26.0"),h=100,move=(5.6,42.7,T("10:45.5")),lab='STRASBOURG'),dict(k='arrow',a=(-0.5,36.0),b=(5.4,42.5),c=CY,t=T("10:28.6"),d=3.0,w=7),
      dict(k='text',x=960,y=960,txt='28 NODI',c=AMB,sz=70,t=T("10:32.8")),dict(k='icon',n='swordfish',p=(-0.2,36.4),t=T("10:37.0"),h=70,move=(1.5,38.0,T("10:42.0")))],hl=HLF)
    map_scene(T("11:46.9"),T("12:19.5"),[(T("11:46.9"),1.5,45.5,34),(T("12:19.5"),1.5,45.5,34)],[
      dict(k='pin',p=LON['vichy'],txt='VICHY',t=T("11:47.6"),sz=30,c=AMB),dict(k='arrow',a=(3.4,46.4),b=(-0.2,51.2),c=RED,t=T("11:48.0"),d=1.6),dict(k='x',p=(1.4,48.8),t=T("11:50.2"),r=36),dict(k='text',x=960,y=1000,txt='VICHY ROMPE CON LONDRA',c=RED,sz=40,t=T("11:50.4")),
      dict(k='arrow',a=(2.8,43.9),b=(-5.2,36.3),c=RED,t=T("11:53.8"),d=1.8),dict(k='pin',p=LON['gib'],txt='GIBILTERRA',t=T("11:55.4"),sz=28)],hl=HLF)
    map_scene(T("12:19.5"),T("12:26.0"),[(T("12:19.5"),-38,43,20),(T("12:26.0"),-36,44,20)],[
      dict(k='label',p=(-72,41),txt='STATI UNITI',sz=34,t=T("12:19.8"),c=CY),dict(k='label',p=(-6,53),txt='REGNO UNITO',sz=34,t=T("12:19.8"),c=GRN),
      dict(k='icon',n='ship_dd_uk',p=(-70,42),t=T("12:20.5"),h=95,move=(-8,50,T("12:25.5"))),dict(k='icon',n='ship_dd_uk',p=(-69,40),t=T("12:20.7"),h=90,move=(-9,49,T("12:25.7"))),dict(k='icon',n='ship_dd_uk',p=(-68,38),t=T("12:20.9"),h=90,move=(-10,48,T("12:25.9"))),
      dict(k='text',x=960,y=950,txt='50 CACCIATORPEDINIERE',c=AMB,sz=56,t=T("12:21.0"))],hl=HLF)
    map_scene(T("12:30.5"),T("12:51.4"),[(T("12:30.5"),2.5,45.8,64),(T("12:51.4"),4.5,44.0,110)],[
      dict(k='arrow',a=(4.5,50.4),b=(4.5,45.2),c=RED,t=T("12:37.2"),d=1.8),dict(k='arrow',a=(7.5,49.0),b=(5.0,44.0),c=RED,t=T("12:38.2"),d=1.8),dict(k='arrow',a=(2.0,50.2),b=(2.5,45.0),c=RED,t=T("12:38.4"),d=1.8),
      dict(k='label',p=(3.0,44.3),txt='ZONA LIBERA',sz=36,c=AMB,t=T("12:38.0")),dict(k='pin',p=LON['toulon'],txt='TOLONE',t=T("12:44.8"),sz=34,c=CY),dict(k='icon',n='ship_fr_bb',p=(5.8,43.0),t=T("12:45.2"),h=110),dict(k='icon',n='ship_fr_old',p=(6.1,43.05),t=T("12:45.6"),h=100),
      dict(k='text',x=960,y=1000,txt='OPERAZIONE LILA',c=RED,sz=52,t=T("12:42.4"))],hl={**HLF,'France':(70,96,150)})
    # Toulon: contadores
    def sink(t0,t1):
        def draw(t,d,a):
            draw_map(d,(5.93,43.1,330),HLF)
            for i in range(8):
                xx=560+i*110; yy=520+(i%2)*90; ts=T("12:53.0")+i*0.5; n='ship_fr_burn' if t>ts else ('ship_fr_bb' if i%2 else 'ship_fr_old'); put(d,n,xx,yy,110*ease((t-t0)/0.4))
            if t>T("12:55.5"): tlab(d,960,150,"77 NAVI",AMB,110,al=ease((t-T("12:55.5"))/0.5))
            for tt,txt,y in ((T("12:55.5"),"3 CORAZZATE",330),(T("12:56.6"),"7 INCROCIATORI",410),(T("12:57.4"),"15 CACCIATORPEDINIERE",490),(T("12:59.0"),"12 SOMMERGIBILI",570)): 
                if t>tt: tlab(d,260,y,txt,CREAM,36,'l',ease((t-tt)/0.4))
            if t>T("13:00.6"): tlab(d,960,900,"STRASBOURG · DUNKERQUE",CY,50,al=ease((t-T("13:00.6"))/0.5))
        L_diagram(t0,t1,draw)
    sink(T("12:51.4"),T("13:19.3"))
    dark_scene(T("13:19.3"),T("14:05.4"),[(T("13:28.4"),960,250,"FALLIMENTO TATTICO",AMB,76),(T("13:41.3"),960,250,"NESSUNO POTEVA SAPERLO",CREAM,70),(T("13:57.6"),960,250,"ERRORE DI COMUNICAZIONE",AMB,70)])
    doc_scene(T("11:39.5"),T("11:46.8"),"CAMERA DEI COMUNI · 4 LUGLIO 1940",["«LASCIO IL GIUDIZIO AL PARLAMENTO,","CON FIDUCIA»","","«LASCIO IL GIUDIZIO AL MONDO","E ALLA STORIA»"],hl=['GIUDIZIO'],cps=22,y0=270,size=44)
