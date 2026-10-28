import json,urllib.parse,re,time,sys
from concurrent.futures import ThreadPoolExecutor
from yt import get
from huntlib_pt import search
T={
"Brasil não fala tupi (língua geral)":["por que o brasil não fala tupi","língua geral paulista","são paulo falava tupi"],
"Brasil não fala espanhol":["por que o brasil não fala espanhol","por que o brasil fala português"],
"Filipinas não falam espanhol":["por que as filipinas não falam espanhol","filipinas espanhol"],
"Goa / Índia não fala português":["por que goa não fala português","índia portuguesa goa"],
"Macau não fala português":["por que macau não fala português","macau português"],
"Angola e Moçambique falam português":["por que angola fala português","por que moçambique fala português"],
"Timor-Leste fala português":["por que timor leste fala português","timor leste português"],
"Uruguai fala espanhol (era do Brasil)":["por que o uruguai fala espanhol","uruguai já foi do brasil"],
"Paraguai fala guarani":["por que o paraguai fala guarani","paraguai guarani"],
"Holandeses no Nordeste não deixaram holandês":["por que o brasil não fala holandês","holandeses no nordeste"],
"Suriname fala holandês / Guianas":["por que o suriname fala holandês","por que a guiana fala inglês"],
"Haiti fala francês":["por que o haiti fala francês","haiti francês"],
"Sul do Brasil fala alemão":["por que no sul do brasil se fala alemão","pomerode alemão","hunsrik"],
"Japonês não pegou no Brasil":["japoneses no brasil história","por que os japoneses vieram para o brasil"],
"EUA falam inglês e não holandês/francês/espanhol":["por que os estados unidos falam inglês","nova york era holandesa"],
"Portugal e Brasil falam diferente":["por que portugal e brasil falam diferente","por que o português de portugal é diferente"],
"Canadá fala francês":["por que o canadá fala francês","quebec francês"],
"Índia fala inglês":["por que a índia fala inglês"],
"Indonésia não fala holandês":["por que a indonésia não fala holandês"],
"Argentina fala com sotaque italiano":["por que argentino fala diferente","sotaque argentino italiano"],
"Galícia fala quase português":["galego e português","por que o galego parece português"],
"África do Sul fala africâner":["por que a áfrica do sul fala africâner"],
"Latim desapareceu":["por que o latim deixou de ser falado","como o latim virou português"],
"Hebraico ressuscitado":["como o hebraico voltou a ser falado"],
"Sotaques do Brasil":["por que o nordestino fala diferente","por que cada região do brasil tem um sotaque"],
}
def sug(q):
    try: return json.loads(get("https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=pt&gl=BR&q="+urllib.parse.quote(q)))[1]
    except Exception: return []
def run(item):
    k,qs=item
    vids={};sg={}
    for q in qs:
        for v in search(q,"EgIQAQ==",pages=1): vids[v['id']]=v
        sg[q]=sug(q)
    vs=sorted(vids.values(),key=lambda v:-v['views'])
    return k,dict(sug=sg,top=[(v['views'],v['ch'],v['age'],v['title'][:80]) for v in vs[:6]])
with ThreadPoolExecutor(6) as ex: R=dict(ex.map(run,T.items()))
json.dump(R,open('themes_pt.json','w'),ensure_ascii=False)
for k,r in R.items():
    print('##',k)
    for q,s in r['sug'].items(): print('   sug',q,'→',len(s),s[:5])
    for t in r['top']: print(f"   {t[0]:>10,} | {t[1]} | {t[2]} | {t[3]}")
