import json,csv
F={r['h']:r for r in json.load(open('en_final.json'))}
G=[
("História e guerra",[("@WhereTheyStood","Lugares históricos proibidos, \"Why can't you visit…\""),("@TerrainWalk","Batalhas contadas no terreno em 3D"),("@TwoSideHistory","2ª Guerra com pergunta \"Why did…\""),("@CityEons","Cidade crescendo em timelapse 3D"),("@HistoryTabOpen","\"The ENTIRE history of X in 10 minutes\""),("@TheLanguageMap","Por que tal império não deixou a língua"),("@WWII-Desk","\"They asked [general]…\", 2ª Guerra"),("@FromNobodyToLegend","Ficha militar de atores famosos"),("@onedocumentary-tv","Tragédias históricas de cidades"),("@RivetCount","Aviões históricos, \"how did this B-17…\""),("@WarUnspun","\"What if\" da 2ª Guerra"),("@ByTheClock","Guerras dia a dia, com mapa"),("@HistoryMiscalculated","\"How every country teaches…\""),("@PlutoExplainss","Pré-história e evolução humana")]),
("Militar e engenharia",[("@GiantsinMotion","Porta-aviões"),("@BattleEnsign1","Armas e navios da Marinha dos EUA"),("@CrossSectionFiles","Operações militares atuais (Israel/Irã)"),("@TheSteelRepublic","Armas e helicópteros, \"$300 vs $4 milhões\""),("@INGENIUMYT","Aviação militar, \"Why the…\""),("@explodedworks","Como funciona, animação 3D"),("@DeadGunsSociety","Fuzis e armas do Exército"),("@WlordFactoryjourney9T9","Por dentro da fábrica (how it's made)")]),
("Ciência, \"what if\" e curiosidade",[("@TracerProject","Simulação de desastres (asteroide, megaterremoto)"),("@Hindcast26","Simulação \"What if\" geopolítico em mapa"),("@OminiAM","\"What if\" ciência"),("@ManifestingWhatIF","\"What if\" sobre você"),("@therailaspect","Como funcionam os trens"),("@Cruise_Ship_Uncovered","Bastidores de cruzeiro"),("@DoorstepAtlas","\"POV: você mora…\""),("@TimeboundWorld","O que acontece com seu corpo…"),("@dummyology","O que acontece se…"),("@FaunaCodeYT","Perguntas sobre animais e oceano"),("@SURVIVALTECHYT","Listas de sobrevivência e equipamentos")]),
("Dinheiro, lei e geopolítica",[("@LegalLensExplained","\"What happens if…\" jurídico e de dívidas"),("@GreenbackStories","História econômica (crise de 1929)"),("@TSCS-Research","\"WTF just happened to…\" mercados"),("@NotUnprecedented","IA e economia com paralelo histórico"),("@strabomedia","Geopolítica explicada"),("@TheWealthEngine_07","Economia explicada"),("@RetireeMath","Aposentadoria em números")]),
("Celebridades e nostalgia",[("@WatchDrollery","Hollywood antiga, histórias de astros"),("@DVDRewind2026","\"20 weird facts\" de séries antigas"),("@worlddatacomparisonny","Listas de astros do faroeste"),("@WhenFootballWasFootball11","NFL dos anos 70")]),
("Histórias narradas e ficção",[("@TheFrontierChroniclesTV","Histórias de faroeste (cowboy, viúva)"),("@TheLegendsCaravan","Lendas e mitos narrados"),("@HeartTheater-83","Drama de fantasia com IA"),("@niasmovies","Drama empregada e bilionário"),("@Untoldworkstories","Histórias de trabalho"),("@AtomicTerranTales","Ficção científica \"humanos vs. alienígenas\""),("@StickThroughCollapse","Sobrevivência \"dia 1 ao dia 30\"")]),
("Religião, filosofia e mistério",[("@BereanStudies","Perguntas bíblicas"),("@Socrates-555","Filosofia (Schopenhauer)"),("@MindNova-r1o","Resumo de livros de autoajuda"),("@PhilosophyIsTimeless","Filosofia"),("@TheMysticRealmTMR","Profecias (Baba Vanga, Nostradamus)")]),
("Público 60+",[("@EverYoungSeniors-tv","Saúde 60+, \"médico revela\""),("@LifeRevivalWisdom","Saúde 60+"),("@SecurityAxis","Aposentadoria e Social Security")]),
("Animais e natureza",[("@Aliwildlife27","Ciclo de vida de animais, documentário"),("@WildlifeOdyssey360","Savana, predadores")]),
("Crime",[("@PrisonProfile","Presos mais perigosos"),("@Mrreduse","Casos com vídeo de câmera policial")]),
]
FLAG={"@Mrreduse":"usa vídeo de câmera policial","@EverYoungSeniors-tv":"pode usar \"médico\" com rosto de IA","@LifeRevivalWisdom":"pode usar \"médico\" com rosto de IA","@WlordFactoryjourney9T9":"imagens de fábrica, possivelmente de terceiros"}
def br(n):
    if n>=1e6: return f"{n/1e6:.2f}".rstrip('0').rstrip('.').replace('.',',')+" mi"
    if n>=1e3: return f"{round(n/1e3)} mil"
    return str(int(n))
M={'Aug':'ago','Sep':'set','Oct':'out'}
out=[];rows=[]
for g,items in G:
    L=[]
    for h,niche in items:
        r=F[h]; mo,d,_=r['j'].replace(',','').split()
        subs=r['subs'].split()[0].replace('K',' mil').replace('.',',')
        L.append(dict(h=h.lstrip('@'),j=f"{d}/{M[mo]}",subs=subs,n=r['n'].split()[0],t=r['t'] if r['views']>=r['best'] else r['top'][0][0],v=br(r['best']),id=r['id'] if r['views']>=r['best'] else '',x=round(r['best']/r['s']),fc=(round(r['best']/r['med']) if r['med']>=50 else None),med=br(r['med']) if r['med'] else '0',nicho=niche,flag=FLAG.get(h,''),c=r['c'] or ''))
        rows.append([g,h,'https://www.youtube.com/'+h,r['j'],r['subs'],r['n'],r['c'],L[-1]['t'],r['best'],L[-1]['x'],r['med'],L[-1]['fc'],niche])
    L.sort(key=lambda x:-x['x'])
    out.append(dict(g=g,rows=L))
json.dump(out,open('en_page.json','w'),ensure_ascii=False)
with open('/home/user/analise-de-canais/canais-dark-novos/ingles-selecionados.csv','w',newline='') as f:
    w=csv.writer(f);w.writerow(['nicho_grupo','canal','link','criado','inscritos','videos','pais','video_estourado','views','x_inscritos','mediana_outros_videos','x_mediana','formato'])
    w.writerows(rows)
print(sum(len(o['rows']) for o in out))
