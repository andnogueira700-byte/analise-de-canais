# -*- coding: utf-8 -*-
import sys,base64,io,html,os,glob
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw,ImageFont
from data import SC,PEOPLE,VIDS
A='/tmp/alex/'
def b64(im,q=62):
    b=io.BytesIO(); im.convert('RGB').save(b,'JPEG',quality=q); return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
def ph(txt,w=300,h=200):
    im=Image.new('RGB',(w,h),(20,26,34)); d=ImageDraw.Draw(im); f=ImageFont.truetype(A+'fonts/Montserrat_600.ttf',15)
    d.ellipse([w*0.38,h*0.12,w*0.62,h*0.48],fill=(48,56,66)); d.ellipse([w*0.25,h*0.52,w*0.75,h*1.2],fill=(48,56,66))
    d.text((w/2,h*0.88),txt,font=f,fill=(255,176,0),anchor='mm'); return im
def load(k,w=300):
    if k.startswith('mock_'):
        p=glob.glob(A+'mock/'+k[5:]+'_*.jpg')
    elif k.startswith('fr_'): p=[A+'fr/'+k[3:]+'.png']
    elif k=='news_head': p=[A+'news/clip_star0108_head.jpg']
    elif k.startswith('sem_foto'): return ph('FOTO NON TROVATA · '+k.split('_')[-1])
    else: p=[A+'img/'+k+'.jpg',A+'icons/'+k+'.png']
    for q in p:
        if os.path.exists(q):
            im=Image.open(q)
            if im.mode=='RGBA':
                bg=Image.new('RGB',im.size,(24,44,70)); bg.paste(im,(0,0),im); im=bg
            im=im.convert('RGB'); im.thumbnail((w,int(w*0.8))); return im
    return ph('A BAIXAR · '+k)
def uri(k,w=260): return b64(load(k,w),55)
def font(p): return base64.b64encode(open(p,'rb').read()).decode()
fx=font(A+'fonts/Montserrat_800.ttf'); fs=font(A+'fonts/Montserrat_600.ttf'); ft=font(A+'fonts/CourierPrime_700.ttf')
css=f"""
@font-face{{font-family:'MX';src:url(data:font/ttf;base64,{fx})}}
@font-face{{font-family:'MS';src:url(data:font/ttf;base64,{fs})}}
@font-face{{font-family:'CP';src:url(data:font/ttf;base64,{ft})}}
:root{{--bg:#0c1828;--bg2:#182c46;--card:#13243a;--iv:#f2efe6;--st:#a7b6c8;--acc:#ffb000;--paper:#e8e0cc}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--iv);font:16px/1.55 'MS',system-ui,sans-serif}}
.wrap{{max-width:1180px;margin:0 auto;padding:28px 16px 80px}}
h1{{font:44px/1.05 'MX';margin:0;letter-spacing:.01em}} h2{{font:28px/1.1 'MX';margin:46px 0 14px;color:var(--acc);text-transform:uppercase}}
.sub{{color:var(--st);font-size:17px;margin:8px 0 0}}
.chip{{display:inline-block;background:var(--acc);color:var(--bg);font:13px 'MX';letter-spacing:.08em;padding:4px 10px;text-transform:uppercase}}
.scene{{background:var(--card);border-left:6px solid var(--acc);margin:16px 0;padding:16px 18px;display:grid;grid-template-columns:118px 1fr;gap:18px}}
.tc{{font:26px 'MX';color:var(--acc);line-height:1.1}} .tc small{{display:block;font:13px 'MS';color:var(--st);margin-top:4px}}
.scene h3{{font:21px/1.2 'MX';margin:0 0 6px;text-transform:uppercase}}
.k{{color:var(--acc);font:12px 'MX';letter-spacing:.14em;text-transform:uppercase;margin-top:12px}}
.nar{{font-family:'CP';color:#d8d0bd;font-size:15px}}
.txt{{display:inline-block;background:var(--bg);border-left:4px solid var(--acc);padding:6px 12px;font:16px 'MX';letter-spacing:.02em;margin-top:2px}}
.th{{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}} .th figure{{margin:0;width:200px}} .th img{{width:100%;display:block}}
figcaption{{font-size:12px;color:var(--st);margin-top:3px}}
table{{width:100%;border-collapse:collapse;margin-top:8px}} td,th{{text-align:left;padding:9px 10px;border-bottom:1px solid #2a3d56;vertical-align:top}}
a{{color:var(--acc);word-break:break-all}} .note{{background:#091320;border:1px solid #2a3d56;padding:12px 14px;color:var(--st)}}
.ppl{{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}} .pc{{background:var(--card);overflow:hidden;border-bottom:4px solid var(--acc)}} .pc img{{width:100%;display:block;height:200px;object-fit:cover}} .pc div{{padding:8px 12px}} .pc b{{font:17px 'MX';display:block;text-transform:uppercase}} .pc span{{color:var(--st);font-size:14px}}
.mus{{background:var(--card);padding:10px 14px;margin:8px 0}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}} .grid img{{width:100%;display:block}}
@media(max-width:700px){{.scene{{grid-template-columns:1fr}} h1{{font-size:30px}}}}
"""
h=[f"<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Storyboard Alessandria 1941</title><style>{css}</style></head><body><div class='wrap'>"]
h.append("<span class='chip'>Logica di Guerra · storyboard para aprovação</span><h1 style='margin-top:12px'>ALESSANDRIA 1941 · I SILURI A LENTA CORSA</h1><p class='sub'>Áudio 17:50 · 22 cenas · novo estilo (referência AWM: Montserrat + Courier Prime) · textos em tela em italiano, comentários em português</p>")
h.append("<div class='note'><b>Como ler:</b> cada cena tem o trecho da narração, o que aparece, o texto em tela (sempre pouco e só no momento em que é dito), o som e as imagens já encontradas. Ainda <b>não editei nada</b>: aprovando (ou dizendo o que mudar), começo a montagem. <b>Paleta:</b> usei a nº 1 (azul-marinho + âmbar) porque ainda não recebi seu voto; se preferir outra (2, 3 ou 4), troco só as cores, o resto fica igual.</div>")
h.append("<h2>1 · O estilo, na prática (mockups com material real)</h2><ul>"
 "<li><b>Abre com filmagem real</b>: achei no archive.org um filme da US Navy de 1945 (domínio público) que mostra o maiale de verdade: içado, com os operadores de respirador, e <b>passando por baixo do casco de um navio para prender a carga</b>. É o gancho dos primeiros segundos.</li>"
 "<li><b>Etiquetas de local</b> no canto (âmbar, caixa alta); <b>palavras cinéticas</b> com brilho só nas perguntas e palavras fortes; <b>carimbos</b> inclinados (BERSAGLIO, FALLITO, LONDRA TACE); <b>dados grandes</b> (200+ KG, 8 ORE, 40 MINUTI).</li>"
 "<li><b>Cartões de pessoa</b>: foto emoldurada em âmbar + nome + etiqueta do cargo; as duplas entram uma depois da outra e ficam lado a lado. Sem foto → silhueta escura com «FOTO NON TROVATA».</li>"
 "<li><b>3D</b>: modelo do maiale (com as três partes que acendem), submarino Scirè com os 3 cilindros, petroleira, rede com boias, encouraçados e contratorpedeiros. Mapa esquemático do porto com a rede abrindo e os três maiali seguindo os navios.</li>"
 "<li><b>Visual de época</b>: filmagens e fotos em P&B quente com grão; gráficos em cor. Pausas só no fim dos blocos, com tela preta e a música seguinte já entrando.</li></ul><div class='grid'>")
for f in sorted(glob.glob(A+'mock/*.jpg')):
    im=Image.open(f); im.thumbnail((760,428)); h.append(f"<figure style='margin:0'><img src='{b64(im,66)}'><figcaption>{html.escape(os.path.basename(f)[3:-4].replace('_',' '))}</figcaption></figure>")
h.append("</div><h2>2 · Cena a cena</h2>")
for c in SC:
    sid,a,b,ttl,nar,vis,txt,sfx,mus,imgs,vids=c
    thh=''.join(f"<figure><img src='{uri(k)}'><figcaption>{html.escape(cap)}</figcaption></figure>" for k,cap in imgs)
    vv=''.join(f"<li><a href='{u}'>{html.escape(t)}</a> — {html.escape(ch)} · {d}</li>" for k,t,ch,d,u,w in VIDS if k in vids)
    h.append(f"<div class='scene'><div class='tc'>{a}<small>até {b}<br>{sid} · música {mus}</small></div><div><h3>{html.escape(ttl)}</h3><div class='nar'>{html.escape(nar)}</div><div class='k'>O que aparece</div>{html.escape(vis)}<div class='k'>Texto em tela</div><span class='txt'>{html.escape(txt)}</span><div class='k'>Som</div>{html.escape(sfx)}<div class='th'>{thh}</div>{('<div class=k>Vídeos</div><ul>'+vv+'</ul>') if vv else ''}</div></div>")
h.append("<h2>3 · Ícones 3D novos</h2><p class='sub'>Maiale com operadores, maiale em corte (testa / batterie e posti / motore), Scirè com os cilindros, petroleira (Sagona) e rede com boias. Encouraçados, contratorpedeiros e porta-aviões vêm do vídeo anterior.</p>")
sh=Image.open(A+'sheets/icons.jpg'); h.append(f"<img style='width:100%;max-width:1100px' src='{b64(sh,70)}'>")
h.append("<h2>4 · Personagens</h2><div class='ppl'>")
for nm,rl,k,lic in PEOPLE: h.append(f"<div class='pc'><img src='{uri(k,420)}'><div><b>{html.escape(nm)}</b><span>{html.escape(rl)}</span><br><span style='font-size:12px'>foto: {html.escape(lic)}</span></div></div>")
h.append("</div>")
h.append("<h2>5 · Jornal de época (já baixado)</h2><div class='th'>")
for k,cap in (('news_head','Evening Star (Washington), 8 de janeiro de 1942, p. 16 — «Italy Reports Damage To British Battleship In Raid Last Month… London sources disavowed knowledge» · Library of Congress (domínio público)'),):
    h.append(f"<figure style='width:420px'><img src='{uri(k,420)}'><figcaption>{html.escape(cap)}</figcaption></figure>")
h.append("</div>")
h.append("<h2>6 · Vídeos</h2><p class='sub'>Os dois primeiros já baixei (archive.org). Os do YouTube eu não consigo baixar daqui (o YouTube pede login): se puder, baixe e mande; 3 a 5 segundos de cada já bastam. Diga o minuto do trecho que achar bom.</p><table><tr><th>Cenas</th><th>Vídeo</th><th>Canal · duração</th></tr>")
for k,t,ch,d,u,w in VIDS: h.append(f"<tr><td>{html.escape(w)}</td><td><a href='{u}'>{html.escape(t)}</a></td><td>{html.escape(ch)} · {d}</td></tr>")
h.append("</table>")
h.append("<h2>7 · Pausas de bloco (tela preta + música seguinte)</h2><ol>"
 "<li>1:09 — depois de «…contro la flotta britannica?» (fim do gancho).</li>"
 "<li>2:16 — antes de «Primo novembre del millenovecentodiciotto».</li>"
 "<li>5:46 — antes de «Un'idea chiara, una procedura chiara».</li>"
 "<li>7:27 — depois de «Scrivilo nei commenti…».</li>"
 "<li>9:09 — antes de «È qui che ricomincia la scena dell'inizio».</li>"
 "<li>12:28 — antes de «Passano circa due ore e mezza» (início do relógio).</li>"
 "<li>13:45 — antes de «La Marina Militare scrive che due corazzate…».</li>"
 "<li>15:28 — antes de «Torniamo, allora, a quel varco nella rete».</li>"
 "<li>17:32 — antes da chamada final.</li></ol>")
h.append("<h2>8 · Sons (discretos, ~12 dB abaixo da voz)</h2><ul><li>Água abafada, bolhas e respiração nas cenas submarinas.</li><li>Tique curto ou máquina de escrever suave na entrada de cartões; carimbo seco nos carimbos.</li><li>Relógio só a partir de «due ore e mezza» e na cena 5:40 → 6:04.</li><li>Explosões submarinas graves e curtas, nunca mais altas que a narração.</li></ul>")
h.append("<h2>9 · Música (8 faixas)</h2><p class='sub'>Prompts completos no arquivo <b>alessandria/musica/musica_prompts_flow_music.md</b>.</p>")
for t,r,c in (("M1","0:00–1:11","Abertura subaquática: drone, sonar, batimento; termina num impacto."),("M2","1:11–3:24","Contexto e a ideia: pizzicato, piano discreto, tique mecânico."),("M3","3:24–5:46","Como funciona / ataque: frio e preciso, marimba e harpa, relógio no fim."),("M4","5:46–7:28","Fracassos: sombrio, cello, explosões distantes."),("M5","7:28–10:19","Viagem do Scirè: suspense furtivo em 4 estágios, termina quando a rede abre."),("M6","10:19–13:46","Dentro do porto e o relógio: claustrofóbico, acelera, três impactos."),("M7","13:46–15:29","Consequências e segredo: piano e cordas, tom investigativo."),("M8","15:29–17:50","Final: cello, trompa suave, respeito entre inimigos, fecha limpo.")):
    h.append(f"<div class='mus'><b>{t} · {r}</b> — {c}</div>")
h.append("<h2>10 · Decisões para você</h2><ol>"
 "<li><b>Paleta</b>: mantenho a nº 1 (azul-marinho + âmbar) ou troca para 2, 3 ou 4?</li>"
 "<li><b>Fotos não encontradas</b>: Emilio Bianchi, Mario Marino e Charles Morgan → silhueta com «FOTO NON TROVATA», como combinado. Se tiver fotos, mande.</li>"
 "<li><b>Filmagem de 1945</b>: algumas cenas do filme da US Navy mostram material alemão (Neger, Biber). Vou usar <b>só os trechos com o maiale italiano</b> e o diagrama da rede.</li>"
 "<li><b>Explosões</b>: não existe filmagem do ataque (foi à noite e em segredo). Proponho mostrar as explosões no mapa do porto (colunas d'água em 3D), sem usar filmagem de outro navio (ex.: Barham) para não confundir. Ok?</li>"
 "<li><b>Vídeo recomendado no fim</b> (bandeiras sob o fogo): me passe o link para eu pegar a miniatura certa.</li></ol>")
h.append("</div></body></html>")
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'storyboard_alessandria.html')
open(out,'w',encoding='utf8').write('\n'.join(h)); print(round(os.path.getsize(out)/1e6,2),'MB')
