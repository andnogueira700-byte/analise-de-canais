#!/usr/bin/env python3
"""Compila cenas.txt + SRT de tempo -> PROMPTS_IMAGEM.txt e PROMPTS_VIDEO.txt (1 linha por bloco).
Uso: python3 compilar.py <pasta_do_video> <arquivo_srt_tempo>"""
import re, sys, os
STYLE_DNA = ("2D hand-drawn adult animation cartoon style, bold uniform near-black outlines (#180A09), flat cel shading with a single soft shadow tone, "
 "oversized expressive eyes with small black pupils, rounded exaggerated faces with big noses and strong jaws, detailed painted period backgrounds, "
 "warm cinematic lighting with golden sunset glow and strong rim light, deep warm browns (#3B140D) and peach highlights (#DFA777), "
 "clear dominant subject, 16:9 widescreen composition, clean finish.")
NEGATIVE_DNA = ("No photorealism, no 3D render, no anime style, no text, no letters, no numbers, no subtitles, no logo, no watermark, "
 "no swastika, no Nazi symbols or insignia, no extra limbs, no deformed hands, no blurry faces.")
MOTION = ("Smooth 2D cartoon animation with consistent bold outlines and flat colors, expressive character acting, subtle ambient motion, slow gentle camera. "
 "No identity drift, face morphing, new limbs, wardrobe changes, text or unplanned objects.")
def lock_img(t):
    if len(t)==1: return f"[{t[0]}] Use the supplied character reference image mapped to this bracketed token as the sole visual identity authority for the corresponding character; preserve identity and all defining features while changing only the scene-authorized pose, expression, placement, wardrobe state, camera angle and lighting."
    return " ".join(f"[{x}]" for x in t)+" Use each supplied character reference image mapped to its bracketed token as the sole visual identity authority for the corresponding character; keep every identity separate and preserve each character's defining features while changing only scene-authorized pose, expression, placement, wardrobe state, camera angle and lighting."
def lock_vid(t):
    if not t: return "Use the supplied first frame as the exact composition and geometry authority."
    if len(t)==1: return f"[{t[0]}] Use the supplied character reference image mapped to this bracketed token as the identity authority for the corresponding character, and use the supplied first frame as the exact composition and geometry authority; preserve identity, anatomy, clothing state, props and spatial placement throughout the shot."
    return " ".join(f"[{x}]" for x in t)+" Use each supplied character reference image mapped to its bracketed token as identity authority for the corresponding character, and use the supplied first frame as the exact composition and geometry authority; keep identities separate and preserve anatomy, clothing state, props and spatial placement throughout the shot."
def srt_durs(p):
    b=re.split(r"\n\s*\n",open(p,encoding="utf-8-sig").read().strip()); out=[]
    for x in b:
        m=re.search(r"(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)",x)
        s=lambda h,m_,s_,ms:int(h)*3600+int(m_)*60+int(s_)+int(ms)/1000
        out.append(s(*m.groups()[4:])-s(*m.groups()[:4]))
    return out
pasta,srt=sys.argv[1],sys.argv[2]
cenas=[l.rstrip("\n").split("|") for l in open(os.path.join(pasta,"cenas.txt"),encoding="utf-8") if l.strip() and not l.startswith("#")]
durs=srt_durs(srt)
assert len(cenas)==len(durs), f"ERRO: {len(cenas)} cenas x {len(durs)} blocos no SRT"
assert [int(c[0]) for c in cenas]==list(range(1,len(cenas)+1)), "numeração fora de ordem"
names=["Hindenburg","Paul","Ludendorff","Kaiser","Papen","Oskar","Schleicher","Hitler"]
img,vid=[],[]
for (i,tok,cena,mov),d in zip(cenas,durs):
    t=[x.strip() for x in tok.split(",") if x.strip()]
    for n in names:  # nome nunca fora dos colchetes
        assert not re.search(rf"\b{n}\b",cena+mov), f"bloco {i}: nome '{n}' fora do token"
    pre=(lock_img(t)+" ") if t else ""
    img.append(f"[I] {pre}Create a single 16:9 image: {cena}. {STYLE_DNA} {NEGATIVE_DNA}")
    vid.append(f"[V] {lock_vid(t)} {mov[0].upper()+mov[1:]}; complete the movement within {max(d,2):.1f} seconds and settle into a gentle hold before the cut. {MOTION}")
for nome,linhas in (("PROMPTS_IMAGEM.txt",img),("PROMPTS_VIDEO.txt",vid)):
    open(os.path.join(pasta,nome),"w",encoding="utf-8").write("\n".join(linhas)+"\n")
print(f"OK: {len(img)} linhas em cada arquivo (= {len(durs)} blocos do SRT)")
