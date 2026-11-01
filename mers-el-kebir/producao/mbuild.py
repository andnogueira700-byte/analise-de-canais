# -*- coding: utf-8 -*-
from mscenes import *
import glob
BATTLE='/tmp/mers/blender/battle.mp4'
def build_plan():
    # (tempo original, tipo, ...)
    A("0:00",'V','v0',33,cy=0.5); A("0:04.2",'V','v0',63); A("0:08.2",'V','v1',1); A("0:12.8",'P','churchill',z=(1.0,1.12)); A("0:17.6",'N','star',z=(1.0,1.14),c=((.5,.35),(.5,.28))); A("0:22.6",'G'); A("0:45.7",'G')
    A("1:01.5",'V','v12',20,cy=0.5); A("1:06.3",'V','v12',95); A("1:11.0",'V','v1',22); A("1:16.4",'V','v1',30); A("1:21.7",'V','v1',41)
    A("1:26.8",'P','richelieu','dunkerque'); A("1:33.8",'V','v10',6); A("1:39.4",'G'); A("1:52.3",'G')
    A("2:06.4",'V','v8',54); A("2:14.2",'G'); A("2:37.3",'P','churchill_pm','churchill'); A("2:42.7",'P','petain_hitler')
    A("2:51.1",'G'); A("3:14.1",'G'); A("3:29.06",'G'); A("3:44.9",'P','somerville','somerville2','hood'); A("3:56.97",'P','cunningham','hood'); A("4:04.2",'V','v14',66); A("4:10.4",'G'); A("4:28.6",'G')
    A("4:48.1",'V','v19',8); A("4:53.6",'P','surcouf','strasbourg'); A("5:02.7",'G'); A("5:27.3",'G'); A("6:17.2",'G'); A("6:50.5",'G'); A("7:08.4",'V','v1',34,cy=0.5); A("7:12.7",'G'); A("7:44.2",'G'); A("8:30.6",'G'); A("8:50.0",'G')
    A("9:18.95",'V','v1',2,zoom=1.12)
    A("9:28.3",'B3',BATTLE); A("9:56.3",'V','v0',33); A("10:04.7",'V','v0',8); A("10:12.8",'V','v0',83); A("10:18.2",'V','v0',93)
    A("10:23.6",'G'); A("10:48.3",'P','mers'); A("11:11.0",'V','v0',98); A("11:15.9",'P','hermes','richelieu'); A("11:19.8",'P','churchill_pm','churchill'); A("11:39.5",'G'); A("11:46.9",'G'); A("12:19.5",'G')
    A("12:26.1",'V','v14',618); A("12:30.5",'G'); A("12:51.4",'G'); A("13:19.3",'G')
    A("14:05.6",'P','churchill_pm','churchill'); A("14:26.9",'P','mers'); A("14:44.8",'P','bretagne','mers'); A("14:59.0",'V','v0',88); A("15:07.9",'V','v1',22)
def build_text():
    T=tm
    L_stamp(T("0:00")-1.9,T("0:00")+1.4,"3 LUGLIO 1940",y=520,sub="MERS-EL-KÉBIR · ALGERIA",size=84)
    L_num(T("0:05.7"),T("0:08.0"),"+1.200","MARINAI FRANCESI",y=470,size=170)
    L_cards([(T("0:12.9"),"WINSTON CHURCHILL","Primo ministro britannico",pimg('churchill'))],T("0:21.0"),y=300)
    L_type(T("0:21.0"),T("0:22.5"),["PERCHÉ LO FECE?"],y=480,size=64,cps=14)
    L_cards([(T("0:30.5"),"FRANÇOIS DARLAN","Comandante in capo, marina francese",pimg('darlan'))],T("0:35.6"),y=300)
    L_stamp(T("0:55.2"),T("0:61"),"13 GIUGNO 1940 · TOURS",y=880)
    L_cards([(T("0:57.8"),"WINSTON CHURCHILL","Primo ministro britannico",pimg('churchill')),(T("1:01.3"),"FRANÇOIS DARLAN","Comandante in capo, marina francese",pimg('darlan'))],T("1:06.4"),y=300)
    L_num(T("1:48.5"),T("1:52.2"),"6","ORE",y=480,size=10) if False else None
    L_cen(T("2:42.8"),T("2:50.9"),[("«…SI SAREBBE FIDATO DELLA PAROLA DI HITLER?»",CREAM)],y=870,size=44)
    L_cards([(T("3:44.9"),"JAMES SOMERVILLE","Vice-ammiraglio · Forza H",pimg('somerville'))],T("3:56.8"),y=300)
    L_cen(T("3:52.4"),T("3:56.9"),[("«IL PIÙ GRANDE ERRORE POLITICO",CREAM),("DEI TEMPI MODERNI»",AMB)],y=140,size=48)
    L_cards([(T("4:00.5"),"ANDREW CUNNINGHAM","Ammiraglio · Flotta del Mediterraneo",pimg('cunningham'))],T("4:04.0"),y=300)
    L_cards([(T("4:48.5"),"SURCOUF","Il più grande sommergibile del mondo",None)],T("4:53.5"),y=380) if False else None
    L_cards([(T("5:03.8"),"RENÉ-ÉMILE GODFROY","Vice-ammiraglio · squadra francese",pimg('godfroy') if 'godfroy' in POOLC else None),(T("5:09.6"),"ANDREW CUNNINGHAM","Ammiraglio · Flotta del Mediterraneo",pimg('cunningham'))],T("5:20.0"),y=300) if False else None
    L_ask(T("5:25.0"),T("5:27.0"),["PERCHÉ NON ACCADDE LO STESSO","A MERS-EL-KÉBIR?"],y=300,size=46)
    L_cards([(T("5:31.3"),"CEDRIC HOLLAND","Capitano · ufficiale britannico",pimg('holland')),(T("5:34.9"),"MARCEL-BRUNO GENSOUL","Vice-ammiraglio · comandante francese",None),(T("5:44.7"),"BERNARD DUFAY","Tenente · inviato di Gensoul",None)],T("5:49.5"),y=640,pw=250,ph=270)
    L_cards([(T("7:50.3"),"WINSTON CHURCHILL","Londra",pimg('churchill')),(T("7:51.8"),"JAMES SOMERVILLE","Davanti al porto",pimg('somerville')),(T("7:54.3"),"MARCEL-BRUNO GENSOUL","A bordo",None)],T("8:05.0"),y=360)
    L_cards([(T("10:27.3"),"LOUIS COLLINET","Capitano · comandante della Strasbourg",pimg('collinet') if 'collinet' in POOLC else None)],T("10:36.0"),y=360)
    L_stamp(T("10:23.8"),T("10:30"),"IL TENTATIVO DI FUGA",y=900) if False else None
    L_num(T("10:50.0"),T("10:57.0"),"1.297","MARINAI FRANCESI MORTI",y=430,size=190)
    L_num(T("10:57.0"),T("11:00.0"),"2","AVIATORI BRITANNICI",y=430,size=190)
    L_cards([(T("11:56.4"),"FRANÇOIS DARLAN","Ammiraglio",pimg('darlan')),(T("12:01.0"),"PHILIPPE PÉTAIN","Maresciallo · governo di Vichy",pimg('petain')),(T("12:08.9"),"FRANKLIN D. ROOSEVELT","Presidente degli Stati Uniti",pimg('fdr'))],T("12:19.3"),y=300) if False else None
    L_cards([(T("13:35.8"),"GEORGE MELTON","Storico",None),(T("13:55.4"),"JEAN LACOUTURE","Storico francese",pimg('lacouture'))],T("14:05.2"),y=420)
    L_cards([(T("12:07.0"),"FRANKLIN D. ROOSEVELT","Presidente degli Stati Uniti",pimg('fdr'))],T("12:19.0"),y=300)
    L_type(T("14:06.8"),T("14:17.0"),["SE FOSTE STATI NEL GABINETTO DI GUERRA,","AVRESTE DATO L'ORDINE DI ATTACCARE?"],y=470,size=48,cps=22)
    L_type(T("14:18.2"),T("14:26.2"),["SCRIVETELO NEI COMMENTI"],y=520,size=58,cps=16)
    L_cen(T("14:51.9"),T("14:55.4"),[("NON ATTACCÒ UN NEMICO.",CREAM)],y=520,size=92)
    L_cen(T("14:55.6"),T("15:00.0"),[("ATTACCÒ UN'INCERTEZZA.",AMB)],y=520,size=92)
    L_num(T("15:01.0"),T("15:06.0"),"1.297","MARINAI",y=440,size=190)
    # CTA chroma key
    fr=sorted(glob.glob('/tmp/mers/chroma/c*.png')); t0c=T("9:19.0")
    def cta(t,im,s):
        k=int((t-t0c)*25)
        if k<0 or k>=len(fr): return
        a=min(1,(t-t0c)/0.3)
        g=Image.open(fr[k]).convert('RGBA'); g=g.resize((int(g.width*0.9),int(g.height*0.9))); ov,d=newov(); ov.alpha_composite(g,(W//2-g.width//2,760)); over(im,ov)
    LAYERS.append((t0c,t0c+8.0,cta))
    # tela final: vídeo recomendado
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
def build():
    build_plan(); build_shots(); build_scenes(); build_text()
    # mapeamento de vídeos
    dcore.MEDIA['bl']=BATTLE
build()
