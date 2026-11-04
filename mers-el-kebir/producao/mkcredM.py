# -*- coding: utf-8 -*-
import sys,json,os
sys.path.insert(0,'/tmp/mers/tools')
import mplan
from mplan import tm
def ts(t): return f"{int(t//60)}:{int(t%60):02d}"
ch=[("0:00","Quindici minuti, milleduecento morti"),("0:45.7","La promessa di Tours (13 giugno 1940)"),("1:21.7","Perché la flotta francese contava così tanto"),("2:06.4","L'armistizio e l'articolo 8"),("2:51.1","Gli ordini di Darlan"),("3:14.1","Una promessa che non si può verificare"),("3:29.1","Operazione Catapult"),("4:28.6","3 luglio: Portsmouth, Plymouth e Alessandria"),("5:27.3","Mers-el-Kébir: le otto del mattino"),("6:17.2","L'ultimatum: sei ore"),("7:12.7","Il tempo passa"),("7:44.2","Tre uomini, informazioni incomplete"),("8:30.6","17:55: ordine di aprire il fuoco"),("9:28.3","La battaglia: sedici minuti"),("10:23.6","La fuga della Strasbourg"),("10:48.3","Il bilancio"),("11:46.9","Le conseguenze"),("12:30.5","Tolone, 27 novembre 1942"),("13:19.3","Churchill sbagliò? Gli storici"),("14:05.6","La domanda per voi"),("14:26.9","Non attaccò un nemico: attaccò un'incertezza")]
chap="\n".join(f"{ts(tm(t)) if i else '0:00'} {n}" for i,(t,n) in enumerate(ch))
vids=[("British Pathé","«Battle Of Oran (1940)»","https://www.youtube.com/watch?v=mrse26zh20g"),("British Pathé","arquivo sobre o Mediterrâneo e Compiègne (Pathé, 1940)","https://www.youtube.com/@britishpathe"),("CriticalPast","Italy Enters War (Universal Newsreel, 1940)","https://www.youtube.com/watch?v=GJ2dMOA72Bg"),("AP Archive / British Movietone","filmati su Tolone (1942) e navi francesi a Liverpool (1940)","https://www.youtube.com/@APArchive"),("PeriscopeFilm","filmati sulla caduta della Francia (1940)","https://www.youtube.com/@PeriscopeFilm"),("Castle Films","filmato d'epoca sulla flotta francese (1940)","https://www.youtube.com/results?search_query=Castle+Films+French+fleet+1940"),("Smithsonian Channel","immagini d'archivio sulla caduta della Francia","https://www.youtube.com/@SmithsonianChannel")]
used=sorted(set(mplan.USED))
o=f"""# Lógica — Mers-el-Kébir (3 luglio 1940) — capitoli, descrizione e crediti

## Capitoli (da incollare nella descrizione)
```
{chap}
```

## Descrizione (italiano)

Il 3 luglio 1940, in circa quindici minuti, la Royal Navy uccide più di milleduecento marinai francesi, in un porto dell'Algeria, a meno di due settimane dalla fine dell'alleanza. L'ordine è di Winston Churchill, che lo definirà la decisione più odiosa, più innaturale e più dolorosa che abbia mai dovuto prendere.

Perché lo fece? La risposta che si legge ovunque è semplice: temeva che la flotta francese finisse nelle mani di Hitler. Ma c'è un problema: l'ammiraglio Darlan gli aveva promesso, a voce, che non sarebbe mai successo. In questo video seguiamo ora per ora la giornata di Mers-el-Kébir, dalla promessa di Tours all'ultimatum di sei ore, dalle scadenze prorogate al fuoco delle 17:55, fino a Tolone nel 1942, quando i francesi affondano da soli la propria flotta.

Se foste stati nel gabinetto di guerra britannico il 27 giugno 1940, avreste dato l'ordine di attaccare? Scrivete la vostra risposta nei commenti.

#MersElKébir #SecondaGuerraMondiale #Churchill #MarinaFrancese #StoriaMilitare

## Crediti (da mettere in fondo alla descrizione)
Filmati d'archivio usati nel video (reperiti da canali pubblici di archivio storico; diritti dei rispettivi titolari):
"""+"\n".join(f"- {a} — {b}: {c}" for a,b,c in vids)+f"""

Fotografie e documenti:
- Prime pagine di giornali americani del luglio e giugno 1940 (Evening Star, Wilmington Morning Star, Washington Daily News, Key West Citizen): Library of Congress, Chronicling America — pubblico dominio.
- Ritratti e fotografie storiche (LoC, Wikimedia Commons, Imperial War Museum, NARA, Bundesarchiv e altri archivi; dettaglio nel file `crediti_immagini.md`).
- Miniatura del video consigliato: YouTube, canale Dopo la Guerra.

Grafica, mappe e modelli 3D (navi, aerei): creati per il video. Mappe basate su dati Natural Earth (pubblico dominio).

Musica (generata con Flow Music, brani originali per il canale): «Dark Cinematic Documentary Opening», «Diplomatic Crisis (1940 Underscore)», «War Cabinet (Slow Ominous Build)», «Naval Standoff (Deadline Underscore)», «Naval Battle (Impact & Aftermath)», «Aftermath (Somber Documentary Lament)», «Unintended Consequences (History Cue)», «Human Cost (Reflective Underscore)».

Caratteri: Saira Stencil One, Barlow Condensed, Special Elite (SIL Open Font License).

## Immagini usate (alias interni)
{', '.join(used)}

## Avvertenze
- I filmati d'archivio provengono da archivi commerciali (British Pathé, AP, Reuters, CriticalPast…); possono generare richieste di copyright (Content ID). Controllare i diritti prima di monetizzare.
- Per Gensoul, Dufay, Holland, Melton e altri senza fotografia verificata è stata usata una sagoma con la dicitura «foto non trovata».
- Mappe e animazioni 3D sono illustrative, non in scala.
"""
open(sys.argv[1],'w').write(o); print(chap)
