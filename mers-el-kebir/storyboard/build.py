# -*- coding: utf-8 -*-
import sys,json,base64,io,html,os
sys.path.insert(0,'/tmp/mers/sb')
from PIL import Image,ImageDraw,ImageFont
from data import SC,PEOPLE,VIDS
R='/tmp/mers/'
NEWS={'news_wilm':'wilm_0704','news_star':'star_0704','news_wdn':'wdn_0704','news_keywest':'keywest_0705','news_star0623':'star_0623'}
def b64(im,q=60):
    b=io.BytesIO(); im.convert('RGB').save(b,'JPEG',quality=q); return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
def ph(txt,w=300,h=190):
    im=Image.new('RGB',(w,h),(34,40,46)); d=ImageDraw.Draw(im); f=ImageFont.truetype('/tmp/mers/fonts/BarlowCondensed-SemiBold.ttf',22)
    d.rectangle([2,2,w-3,h-3],outline=(90,100,110),width=2); d.text((w/2,h/2-12),'SEM FOTO AINDA',font=f,fill=(230,57,70),anchor='mm'); d.text((w/2,h/2+18),txt[:34],font=f,fill=(160,170,180),anchor='mm'); return im
def load(key,w=300):
    p=None
    if key in NEWS:
        im=Image.open(R+'news/'+NEWS[key]+'.jpg'); W,H=im.size; im=im.crop((0,0,W,int(H*0.34))); im.thumbnail((w*2,w)); return im
    if key.startswith('w_'): p=R+'img/'+key+'.jpg'
    elif key.startswith('loc_'): p=R+'img/'+key+'.jpg'
    elif key.startswith('sem_foto'): return ph(key.replace('sem_foto_',''))
    if p and os.path.exists(p):
        try:
            im=Image.open(p).convert('RGB'); im.thumbnail((w,int(w*0.75))); return im
        except Exception: pass
    return ph(key.split('_',1)[-1]+' (a baixar)')
def uri(key,w=260): return b64(load(key,w),52)
def font(path): return base64.b64encode(open(path,'rb').read()).decode()
fs=font('/tmp/mers/fonts/SairaStencilOne-Regular.ttf'); fb=font('/tmp/mers/fonts/BarlowCondensed-SemiBold.ttf')
css=f"""
@font-face{{font-family:'Saira';src:url(data:font/ttf;base64,{fs})}}
@font-face{{font-family:'Barlow';src:url(data:font/ttf;base64,{fb})}}
:root{{--bg:#10161d;--card:#18212a;--iv:#ece6d6;--st:#9fb0bd;--red:#e63946;--amb:#ffb703;--cy:#2ec4f1;--gr:#6ecd78;--navy:#1d3557}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--iv);font:17px/1.5 'Barlow',system-ui,sans-serif}}
.wrap{{max-width:1180px;margin:0 auto;padding:28px 18px 80px}}
h1{{font:48px/1.05 'Saira';margin:0;letter-spacing:.02em}} h2{{font:32px/1 'Saira';margin:46px 0 14px;letter-spacing:.03em;color:var(--amb)}}
.sub{{color:var(--st);font-size:19px;margin:8px 0 0}}
.scene{{background:var(--card);border-left:6px solid var(--red);border-radius:6px;margin:16px 0;padding:16px 18px;display:grid;grid-template-columns:120px 1fr;gap:18px}}
.tc{{font:28px 'Saira';color:var(--amb);line-height:1.1}} .tc small{{display:block;font:15px 'Barlow';color:var(--st)}}
.scene h3{{font:24px/1.15 'Saira';margin:0 0 6px;letter-spacing:.02em}}
.k{{color:var(--st);font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin-top:10px}}
.nar{{font-style:italic;color:#cfc8b8}}
.txt{{display:inline-block;background:#0a0f14;border-left:4px solid var(--red);padding:6px 12px;font:20px 'Saira';letter-spacing:.02em;margin-top:2px}}
.th{{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}} .th figure{{margin:0;width:200px}} .th img{{width:100%;border-radius:4px;display:block}}
figcaption{{font-size:13px;color:var(--st);margin-top:3px}}
table{{width:100%;border-collapse:collapse;margin-top:8px}} td,th{{text-align:left;padding:9px 11px;border-bottom:1px solid #2b3742;vertical-align:top}}
a{{color:var(--cy);word-break:break-all}} .note{{background:#0b1117;border:1px solid #2b3742;border-radius:6px;padding:12px 14px;color:var(--st)}}
.ppl{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}} .pc{{background:var(--card);border-radius:6px;overflow:hidden;border-bottom:4px solid var(--red)}} .pc img{{width:100%;display:block;height:170px;object-fit:cover}} .pc div{{padding:8px 12px}} .pc b{{font:20px 'Saira';display:block}} .pc span{{color:var(--st);font-size:15px}}
.mus{{background:var(--card);padding:10px 14px;border-radius:6px;margin:8px 0}}
@media(max-width:700px){{.scene{{grid-template-columns:1fr}} h1{{font-size:34px}}}}
"""
def sheet(p,w=1100): 
    im=Image.open(p); im.thumbnail((w,w)); return b64(im,70)
h=[f"<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Storyboard — Mers-el-Kébir</title><style>{css}</style></head><body><div class='wrap'>"]
h.append("<h1>STORYBOARD · MERS-EL-KÉBIR (3 LUGLIO 1940)</h1><p class='sub'>Vídeo para o outro canal de 2ª Guerra · áudio 15:22 · 31 cenas · textos em tela em italiano, comentários em português</p>")
h.append("<div class='note'><b>Como ler:</b> cada cena tem o trecho da narração, o que aparece, o texto em tela (sempre pouco), o som e as imagens que já encontrei. Onde aparece «SEM FOTO AINDA» a imagem será baixada ou preciso de você (ver perguntas no fim). Ainda <b>não editei nada</b>: aprovando este storyboard (ou dizendo o que mudar), eu começo a montagem.</div>")
h.append("<h2>1 · ESTILO DESTE VÍDEO</h2><ul>"
 "<li><b>Tom documental</b>: gráficos, cartões e mapas em vez de texto contínuo. Sem legenda corrida.</li>"
 "<li><b>Texto em tela</b>: só <b>nomes de pessoas</b> (no cartão, junto da foto), <b>cidades/locais</b> (no canto, direita ou esquerda conforme a imagem), <b>perguntas</b> (painel escuro, centro) e <b>palavras fortes</b> (centro, tamanho médio). Nada de frases longas.</li>"
 "<li><b>Fonte</b>: Saira Stencil One (estêncil militar) nos destaques e Barlow Condensed nos rótulos pequenos.</li>"
 "<li><b>Cartões de personagem</b>: foto + nome + cargo. Quando dois falam juntos, um aparece e depois o outro, lado a lado.</li>"
 "<li><b>Mapas com setas</b>: ícones 3D (navios, aviões, soldados) sobre mapa, com a câmera seguindo a seta. Os ícones 3D novos estão na seção 3.</li>"
 "<li><b>Recortes de jornal reais</b> de 1940 (Library of Congress) e documentos em máquina de escrever.</li>"
 "<li><b>Cor</b>: fotos e filmagens em preto e branco quente com grão leve; gráficos em cores vivas (azul-marinho, vermelho, âmbar, ciano).</li></ul>")
h.append("<div class='th'>")
for f,c in (('mock_a.png','MOCKUP · mapa com ícones 3D, seta que a câmera segue e nome do lugar no canto'),('mock_b.png','MOCKUP · cartões de personagem lado a lado: foto, nome, cargo'),('mock_c.png','MOCKUP · recorte de jornal real e pergunta no painel escuro')):
    h.append(f"<figure style='width:370px'><img src='{b64(Image.open(R+f).resize((640,360)),62)}'><figcaption>{html.escape(c)}</figcaption></figure>")
h.append("</div>")
h.append("<h2>2 · CENA A CENA</h2>")
for c in SC:
    sid,a,b,ttl,nar,vis,txt,sfx,mus,imgs,vids=c
    thh=''.join(f"<figure><img src='{uri(k)}'><figcaption>{html.escape(cap)}</figcaption></figure>" for k,cap in imgs)
    vv=''.join(f"<li><a href='{u}'>{html.escape(t)}</a> — {html.escape(ch)} · {d}</li>" for k,t,ch,d,u,w in VIDS if k in [x[0] for x in vids] ) 
    h.append(f"<div class='scene'><div class='tc'>{a}<small>até {b}<br>{sid} · música {mus}</small></div><div><h3>{html.escape(ttl)}</h3><div class='nar'>{html.escape(nar)}</div><div class='k'>O que aparece</div>{html.escape(vis)}<div class='k'>Texto em tela</div><span class='txt'>{html.escape(txt)}</span><div class='k'>Som</div>{html.escape(sfx)}<div class='th'>{thh}</div>{('<div class=k>Vídeos de arquivo sugeridos</div><ul>'+vv+'</ul>') if vv else ''}</div></div>")
h.append("<h2>3 · ÍCONES 3D (NOVOS NAVIOS + OS DO VÍDEO ANTERIOR)</h2><p class='sub'>Os ícones do vídeo da torre (tanque, soldado, carro, avião, canhão) continuam disponíveis. Criei agora a frota: encouraçado britânico, Hood, encouraçado francês, encouraçados antigos, contratorpedeiros, porta-aviões, submarino e o biplano Swordfish. São estilizados, como os anteriores.</p>")
h.append(f"<img style='width:100%;max-width:1100px;border-radius:6px' src='{sheet(R+'ships_sheet.png')}'>")
h.append(f"<img style='width:100%;max-width:1100px;border-radius:6px;margin-top:10px' src='{sheet('/tmp/zoo/icons_sheet.png')}'>")
h.append("<h2>4 · CARTÕES DE PERSONAGEM (FOTO + NOME + CARGO)</h2><p class='sub'>Quando um nome é falado, o cartão entra no canto inferior esquerdo; quando são dois ou três, entram um depois do outro e ficam lado a lado.</p><div class='ppl'>")
for nm,rl,k,lic in PEOPLE:
    h.append(f"<div class='pc'><img src='{uri(k,420)}'><div><b>{html.escape(nm)}</b><span>{html.escape(rl)}</span><br><span style='font-size:13px'>foto: {html.escape(lic)}</span></div></div>")
h.append("</div>")
h.append("<h2>5 · RECORTES DE JORNAL DE 1940 (JÁ BAIXADOS)</h2><div class='th'>")
for k,cap in (('news_wilm','Wilmington Morning Star, 4/7/1940 — «Battle staged between British, French ships»'),('news_star','Evening Star, 4/7/1940 — «Churchill claims large proportion of French fleet»'),('news_wdn','Washington Daily News, 4/7/1940 — «Britain takes greater part»'),('news_keywest','Key West Citizen, 5/7/1940 — «French end British relations»'),('news_star0623','Sunday Star, 23/6/1940 — frota francesa e armistício')):
    h.append(f"<figure style='width:340px'><img src='{uri(k,340)}'><figcaption>{html.escape(cap)} · Library of Congress (domínio público)</figcaption></figure>")
h.append("</div>")
h.append("<h2>6 · VÍDEOS PARA VOCÊ BAIXAR</h2><p class='sub'>Não consigo baixar vídeos do YouTube daqui (o site bloqueia). Os links abaixo são os que mais combinam com cada cena; 3 a 5 segundos de cada já resolvem. Quando baixar, mande o arquivo e diga o minuto do trecho que serve.</p><table><tr><th>Cenas</th><th>Vídeo</th><th>Canal · duração</th></tr>")
for k,t,ch,d,u,w in VIDS: h.append(f"<tr><td>{html.escape(w)}</td><td><a href='{u}'>{html.escape(t)}</a></td><td>{html.escape(ch)} · {d}</td></tr>")
h.append("</table>")
h.append("<h2>7 · PAUSAS NO ÁUDIO (FIM DE BLOCO, COM PRETO E MÚSICA)</h2><p class='sub'>Pausas só entre blocos, em silêncios naturais da fala, com tela preta e a música da parte seguinte já começando durante o preto (1,2 a 1,6 s):</p><ol>"
 "<li>0:45 — entre o gancho e «Per capirlo bisogna partire da quella promessa».</li>"
 "<li>3:29 — antes de «Ventisette giugno. Il Gabinetto di guerra…» (fim do bloco da promessa).</li>"
 "<li>5:27 — antes de «Alle otto del mattino…» (início de Mers-el-Kébir).</li>"
 "<li>9:14 — antes de «Se questa storia vi sta tenendo…» / a batalha (corte para preto com relógio em 17:55).</li>"
 "<li>10:48 — depois do balanço de mortos (momento de luto).</li>"
 "<li>12:26 — antes de «Ora arriva la parte che la complica».</li>"
 "<li>14:05 — antes da pergunta ao público.</li>"
 "<li>14:26 — antes do fechamento («Tornate a quel pomeriggio…»).</li></ol>")
h.append("<h2>8 · SONS E EFEITOS (DISCRETOS)</h2><ul><li>Entrada de texto/cartão: <i>tick</i> curto e baixo ou máquina de escrever muito suave.</li><li>Troca de imagem: sopro de ar (<i>whoosh</i>) quase inaudível, só nas viradas de bloco.</li><li>Números grandes: um batimento grave.</li><li>Batalha (S22): canhões pesados com eco e explosão grave, mas abaixo da voz.</li><li>Volume dos efeitos sempre ~12 dB abaixo da narração; a música sobe só nas pausas.</li></ul>")
h.append("<h2>9 · MÚSICA</h2><p class='sub'>Os prompts detalhados para o Flow Music estão no arquivo <b>musica_prompts_flow_music.md</b> (8 faixas, uma por clima do roteiro). Resumo:</p>")
for t,r,c in (("M1","0:00–0:45","Tensão forte de abertura: drones graves, relógio, pulso. Sem melodia."),("M2","0:45–3:29","Documental diplomático: cordas secas, piano discreto. Tenso sem exagero."),("M3","3:29–5:27","A decisão: crescendo sombrio, metais baixos, tambores."),("M4","5:27–9:28","Suspense do relógio: 4 estágios, cada prazo mais tenso; termina em suspensão."),("M5","9:28–10:48","Batalha: orquestra pesada, percussão, coro; termina em colapso."),("M6","10:48–11:46","Luto: cello solo e cordas lentas."),("M7","11:46–13:19","Consequências e Toulon: ostinato de piano e cordas graves."),("M8","13:19–15:22","Reflexão final: piano e cordas, tensão que se resolve em silêncio.")):
    h.append(f"<div class='mus'><b>{t} · {r}</b> — {c}</div>")
h.append("<h2>10 · DECISÕES E PERGUNTAS PARA VOCÊ</h2><ol>"
 "<li><b>Fotos que não achei</b>: Gensoul, Godfroy, Dufay, Melton e (talvez) Holland em 1940. Sugiro cartão com silhueta + nome e cargo, ou você me manda uma foto. Pode ser?</li>"
 "<li><b>Vídeo recomendado do final</b> (submarinos japoneses afundados pelos americanos): me passe o título ou o link para eu pegar a imagem certa.</li>"
 "<li><b>Cor dos arquivos</b>: manter fotos e filmagens em preto e branco quente (visual de época) ou deixar cada material com a cor original? Proponho preto e branco quente.</li>"
 "<li><b>Animação da batalha (S22)</b>: proponho uma sequência 3D de ~25 s sobre o mapa (tiros, Bretagne explodindo, Strasbourg escapando), alternando com as filmagens que você baixar. Ok?</li>"
 "<li><b>Chamada para o canal (S21)</b> no meio da batalha: manter só como selo pequeno, para não quebrar a tensão. Ok?</li>"
 "<li><b>Licenças</b>: a maioria das imagens é domínio público (IWM, NARA, LoC). Algumas são CC BY-SA (ex.: Lacouture); o crédito vai no arquivo final, como nos vídeos anteriores.</li></ol>")
h.append("</div></body></html>")
open('/tmp/mers/sb/storyboard_mers_el_kebir.html','w',encoding='utf8').write('\n'.join(h)); print(os.path.getsize('/tmp/mers/sb/storyboard_mers_el_kebir.html')/1e6,'MB')
