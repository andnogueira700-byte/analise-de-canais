# -*- coding: utf-8 -*-
from mscenes import *
import glob
BATTLE='/tmp/mers/blender/battle.mp4'
def build_plan():
    A("0:00",'V','v0',33); A("0:04.2",'V','v0',63); A("0:08.2",'V','v1',1); A("0:12.8",'P','churchill',z=(1.0,1.12))
    A("0:17.6",'N','star',z=(1.0,1.10),c=(.5,.34),marks=[(0.3,(0.02,0.23,0.97,0.46),'hi'),(2.4,(0.03,0.47,0.50,0.62),'box')])
    A("0:22.6",'G'); A("0:30.5",'P','darlan'); A("0:36.2",'G'); A("0:45.7",'G'); A("0:55.2",'G')
    A("1:01.5",'V','v12',20); A("1:06.3",'V','v12',95); A("1:11.0",'V','v1',22); A("1:16.4",'V','v1',30)
    A("1:21.7",'N','star23',z=(1.0,1.10),c=(.2,.18),marks=[(0.6,(0.125,0.08,0.265,0.19),'hi')])
    A("1:26.8",'P','richelieu','dunkerque'); A("1:33.8",'V','v10',6); A("1:39.4",'G'); A("1:52.3",'G'); A("2:00.0",'V','v12',150)
    A("2:06.4",'V','v8',54); A("2:14.2",'G'); A("2:23.3",'G'); A("2:30.5",'V','v8',107); A("2:37.3",'P','churchill_pm','churchill'); A("2:42.7",'P','petain_hitler')
    A("2:51.1",'P','darlan'); A("2:57.5",'G'); A("3:04.5",'V','v1',22); A("3:14.1",'G'); A("3:29.06",'G')
    A("3:44.5",'V','v14',100); A("3:57.0",'V','v14',150); A("4:04.2",'V','v14',66); A("4:10.4",'G'); A("4:18.5",'G'); A("4:28.6",'G')
    A("4:44.0",'V','v19',2); A("4:53.6",'P','surcouf','strasbourg'); A("5:02.7",'G')
    A("5:27.3",'G'); A("5:38.6",'V','v1',34); A("5:46.0",'V','v1',9); A("5:50.0",'G'); A("6:03.0",'V','v1',22); A("6:10.9",'G')
    A("6:17.2",'V','v1',41); A("6:27.0",'G'); A("6:50.5",'V','v0',3); A("6:54.8",'G'); A("7:02.5",'V','v1',40); A("7:04.8",'G'); A("7:08.4",'V','v1',36)
    A("7:12.7",'G'); A("7:20.1",'V','v1',16); A("7:25.6",'G'); A("7:44.2",'V','v14',12); A("7:55.4",'G'); A("8:06.8",'G'); A("8:15.0",'G')
    A("8:30.6",'V','v14',470); A("8:44.0",'V','v1',45); A("8:50.0",'G'); A("8:57.0",'V','v14',590); A("9:05.0",'G')
    A("9:18.95",'V','v1',2,zoom=1.12)
    A("9:28.3",'B3',BATTLE); A("9:56.3",'V','v0',33); A("10:04.7",'V','v0',8); A("10:12.8",'V','v0',83); A("10:18.2",'V','v0',93)
    A("10:23.6",'G'); A("10:40.5",'V','v15',5)
    A("10:48.3",'P','mers')
    A("11:00.0",'N','wdn',z=(1.0,1.08),c=(.5,.5),marks=[(0.8,(0.05,0.30,0.95,0.72),'hi')]); A("11:11.0",'V','v0',98); A("11:15.9",'P','hermes','richelieu'); A("11:19.8",'P','churchill_pm','churchill')
    A("11:27.0",'N','star',z=(1.0,1.10),c=(.5,.34),marks=[(0.4,(0.02,0.23,0.97,0.46),'hi'),(3.6,(0.03,0.47,0.50,0.62),'hi')]); A("11:39.5",'G')
    A("11:46.9",'P','petain_hitler'); A("11:49.5",'N','keywest',z=(1.0,1.10),c=(.5,.4),marks=[(0.4,(0.03,0.37,0.98,0.52),'hi'),(3.0,(0.52,0.55,0.98,0.87),'box')])
    A("11:53.7",'G'); A("12:06.0",'P','fdr'); A("12:19.5",'G')
    A("12:26.1",'V','v14',618); A("12:30.5",'G'); A("12:46.5",'G'); A("12:51.4",'G'); A("13:00.6",'V','v15',8); A("13:08.0",'V','v15',30)
    A("13:19.3",'V','v14',345); A("13:28.4",'G'); A("13:46.5",'V','v1',41); A("13:55.4",'G')
    A("14:05.6",'P','churchill_pm','churchill'); A("14:15.5",'P','strasbourg_mers','mers'); A("14:26.9",'P','mers'); A("14:35.5",'P','mogador','mers'); A("14:44.8",'P','bretagne','mers'); A("14:52.0",'V','v0',48); A("14:59.0",'V','v0',88); A("15:07.9",'V','v1',22)
def build_text():
    T=tm
    L_stamp(T("0:00")-1.9,T("0:00")+1.4,"3 LUGLIO 1940",y=520,sub="MERS-EL-KÉBIR · ALGERIA",size=84)
    L_cen(T("4:49.0"),T("4:53.4"),[("≈ 200 UNITÀ MINORI",AMB)],y=900,size=64)
    L_num(T("0:05.7"),T("0:08.0"),"+1.200","MARINAI FRANCESI",y=470,size=170)
    L_cards([(T("0:14.0"),"WINSTON CHURCHILL","Primo ministro britannico",pimg('churchill'))],T("0:17.4"),y=640)
    L_ask(T("0:21.0"),T("0:22.55"),["PERCHÉ LO FECE?"],y=900,size=84)
    L_name(T("0:31.0"),T("0:35.8"),"FRANÇOIS DARLAN","Comandante in capo della marina francese",corner='bl')
    L_stamp(T("0:52.4"),T("0:57.5"),"13 GIUGNO 1940 · TOURS",y=900)
    L_cards([(T("0:56.4"),"WINSTON CHURCHILL","Primo ministro britannico",pimg('churchill')),(T("0:57.8"),"FRANÇOIS DARLAN","Comandante in capo, marina francese",pimg('darlan'))],T("1:06.4"),y=640)
    L_cen(T("2:44.5"),T("2:50.9"),[("«…SI SAREBBE FIDATO DELLA PAROLA DI HITLER?»",CREAM)],y=900,size=44)
    L_name(T("2:51.6"),T("2:56.8"),"FRANÇOIS DARLAN","24 giugno · ordine di autoaffondamento",corner='bl')
    L_cards([(T("3:45.5"),"JAMES SOMERVILLE","Vice-ammiraglio · Forza H",pimg('somerville'))],T("3:56.8"),y=640)
    L_cen(T("3:54.2"),T("3:57.0"),[("«IL PIÙ GRANDE ERRORE POLITICO",CREAM),("DEI TEMPI MODERNI»",AMB)],y=120,size=48)
    L_cards([(T("4:00.5"),"ANDREW CUNNINGHAM","Ammiraglio · Flotta del Mediterraneo",pimg('cunningham'))],T("4:04.0"),y=640)
    L_cards([(T("5:03.8"),"RENÉ-ÉMILE GODFROY","Vice-ammiraglio · squadra francese",None),(T("5:11.8"),"ANDREW CUNNINGHAM","Ammiraglio · Flotta del Mediterraneo",pimg('cunningham'))],T("5:19.0"),y=640)
    L_ask(T("5:25.0"),T("5:27.0"),["PERCHÉ NON ACCADDE LO STESSO","A MERS-EL-KÉBIR?"],y=300,size=46)
    L_cards([(T("5:31.3"),"CEDRIC HOLLAND","Capitano · ufficiale britannico",pimg('holland')),(T("5:37.0"),"MARCEL-BRUNO GENSOUL","Vice-ammiraglio · comandante francese",None),(T("5:46.0"),"BERNARD DUFAY","Tenente · inviato di Gensoul",None)],T("5:49.5"),y=640,pw=250,ph=270)
    L_cards([(T("7:50.3"),"WINSTON CHURCHILL","Londra",pimg('churchill')),(T("7:53.7"),"JAMES SOMERVILLE","Davanti al porto",pimg('somerville')),(T("7:54.6"),"MARCEL-BRUNO GENSOUL","A bordo",None)],T("7:55.3"),y=560,pw=300,ph=330)
    L_cards([(T("10:28.5"),"LOUIS COLLINET","Capitano · comandante della Strasbourg",pimg('collinet') if 'collinet' in POOLC else None)],T("10:36.0"),y=640)
    L_num(T("10:50.0"),T("10:57.0"),"1.297","MARINAI FRANCESI MORTI",y=430,size=190)
    L_num(T("10:57.0"),T("10:59.8"),"2","AVIATORI BRITANNICI",y=430,size=190)
    L_cards([(T("12:06.8"),"FRANKLIN D. ROOSEVELT","Presidente degli Stati Uniti",None)],T("12:19.0"),y=640) if False else L_name(T("12:07.0"),T("12:18.8"),"FRANKLIN D. ROOSEVELT","Presidente degli Stati Uniti",corner='bl')
    L_cards([(T("13:35.8"),"GEORGE MELTON","Storico",None)],T("13:46.3"),y=560,pw=300,ph=330)
    L_cards([(T("13:55.4"),"JEAN LACOUTURE","Storico francese",pimg('lacouture'))],T("14:05.0"),y=560,pw=300,ph=330)
    L_type(T("14:08.0"),T("14:15.2"),["SE FOSTE STATI NEL GABINETTO DI GUERRA,","AVRESTE DATO L'ORDINE DI ATTACCARE?"],y=470,size=48,cps=26)
    L_type(T("14:20.9"),T("14:26.0"),["SCRIVETELO NEI COMMENTI"],y=520,size=58,cps=18)
    L_cen(T("14:51.9"),T("14:55.4"),[("NON ATTACCÒ UN NEMICO.",CREAM)],y=520,size=92)
    L_cen(T("14:55.6"),T("15:00.0"),[("ATTACCÒ UN'INCERTEZZA.",AMB)],y=520,size=92)
    L_num(T("14:58.2"),T("15:01.6"),"1.297","MARINAI",y=440,size=190)
    fr=sorted(glob.glob('/tmp/mers/chroma/c*.png')); t0c=T("9:19.0")
    def cta(t,im,s):
        k=int((t-t0c)*25)
        if k<0 or k>=len(fr): return
        g=Image.open(fr[k]).convert('RGBA'); g=g.resize((int(g.width*0.9),int(g.height*0.9))); ov,d=newov(); ov.alpha_composite(g,(W//2-g.width//2,760)); over(im,ov)
    LAYERS.append((t0c,t0c+8.0,cta))
    t0,t1=T("15:07.9"),DUR
    thumb=Image.open('/tmp/mers/img/yt_thumb.jpg').convert('RGB').resize((800,600)).crop((0,60,800,510))
    def endcard(t,im,s):
        a=fade(t,t0,t1,0.5,0.8)
        if a<=0: return
        scrim(im,0.72*a); ov,d=newov(); d.text((W//2,150),"VIDEO CONSIGLIATO",font=serif(54,'Bold'),fill=CREAM+(int(255*a),),anchor='mm')
        d.rectangle([W//2-410,220,W//2+410,682],outline=RED+(int(255*a),),width=6); over(im,ov)
        if a>0.02: im.paste(Image.blend(im.crop((W//2-400,230,W//2+400,680)),thumb,min(1,a)),(W//2-400,230))
        ov,d=newov(); d.text((W//2,760),"PERCHÉ GLI AMERICANI AFFONDARONO",font=serif(44,'Bold'),fill=CREAM+(int(255*a),),anchor='mm'); d.text((W//2,820),"I SOTTOMARINI GIAPPONESI CHE AVEVANO CATTURATO?",font=serif(44,'Bold'),fill=AMB+(int(255*a),),anchor='mm'); d.text((W//2,900),"DOPO LA GUERRA",font=sans(34,'SemiBold'),fill=(160,176,189,int(255*a)),anchor='mm'); over(im,ov)
    LAYERS.append((t0,t1,endcard))
def arbitrate(i0):
    """sem textos encobrindo textos: cada camada de texto termina quando a próxima começa"""
    L=dcore.LAYERS; txt=[x for x in L[i0:] if x[2].__name__ not in ('cta','endcard')]; keep=L[:i0]+[x for x in L[i0:] if x[2].__name__ in ('cta','endcard')]
    txt.sort(key=lambda x:x[0]); out=[]
    for i,(a,b,f) in enumerate(txt):
        nx=[c for (c,d_,_) in txt[i+1:] if c>a+0.02 and c<b]
        out.append((a,min(b,nx[0]-0.03) if nx else b,f))
    L[:]=keep+out
def build():
    build_plan(); build_shots(); build_scenes(); i0=len(dcore.LAYERS); build_text(); arbitrate(i0)
    # mapeamento de vídeos
    dcore.MEDIA['bl']=BATTLE
build()
