import json
LEAD=0.5
B=[(0.00,2.40,"L'11 maggio 1745,"),(2.94,3.96,"nell'attuale Belgio,"),(4.36,8.36,"una colonna di circa quindicimila soldati britannici e hannoveriani"),
(8.78,10.56,"cominciò a salire lungo un pendio,"),(10.92,12.70,"vicino al villaggio di Fontenoy."),(13.16,15.30,"In cima li aspettava l'esercito francese,"),
(15.88,16.72,"cannoni davanti,"),(17.20,18.22,"cannoni sui lati,"),(18.66,22.12,"fanti al riparo dietro trinceramenti e villaggi fortificati."),
(22.62,26.12,"I britannici avanzarono allo scoperto, in file ordinate,"),(26.58,28.45,"le palle di cannone aprivano varchi nei ranghi."),
(28.78,32.34,"Gli uomini chiudevano i vuoti e continuavano a camminare."),
(32.90,40.78,"Quando finalmente arrivarono davanti alla prima linea francese, a poche decine di passi, successe qualcosa di ancora più strano."),
(41.50,42.44,"Si fermarono,"),(42.88,44.00,"sistemarono le file"),(44.10,47.50,"e, secondo il racconto reso famoso da Voltaire,"),
(47.92,49.95,"un ufficiale britannico si fece avanti."),(50.28,51.20,"Si tolse il cappello"),(51.28,53.70,"e invitò i francesi a sparare per primi."),
(53.76,55.16,"Dall'altra parte,"),(55.60,58.92,"un ufficiale francese avrebbe risposto con la stessa cortesia."),
(59.54,60.06,"Signori,"),(60.54,61.70,"non ci pensiamo nemmeno."),(62.08,62.92,"Sparate voi!")]
words={"Signori":59.54,"non":60.54,"ci":60.64,"pensiamo":60.78,"nemmeno":61.24,"Sparate":62.08,"voi":62.64}
beats=[{"i":i+1,"start":round(s+LEAD,3),"end":round(e+LEAD,3),"text":t} for i,(s,e,t) in enumerate(B)]
tl={"lead":LEAD,"beats":beats,"words":{k:round(v+LEAD,3) for k,v in words.items()},"voiceEnd":round(62.92+LEAD,3),"total":round(62.92+LEAD+5.0,3)}
json.dump(tl,open("timeline.json","w"),ensure_ascii=False,indent=1)
open("src/timeline.js","w").write("window.TL="+json.dumps(tl,ensure_ascii=False)+";")
print(tl["total"],len(beats))
