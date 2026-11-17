#!/usr/bin/env python3
"""Renderiza um trecho do vídeo a partir do storyboard do editor (estilo Elementar).

Uso:
  python3 -I ferramentas/render_storyboard.py CONFIG.json

O CONFIG aponta para: storyboard (tabela markdown), pasta de clipes (Vxx.mp4),
prints com grifo (grifos.json + PNGs), narração, música, efeitos sonoros e saída.
"""
import json, math, os, re, subprocess, sys, datetime
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 30
AMARELO = (255, 212, 0)
VERMELHO = (230, 57, 70)
CHUMBO = (13, 15, 19)
FONTE = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONTE_BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
FONTE_MED = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
MONO = None
for c in ["/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-ExtraBold.ttf",
          "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"]:
    if os.path.exists(c):
        MONO = c
        break


def fonte(caminho, tam):
    try:
        return ImageFont.truetype(caminho, tam)
    except Exception:
        return ImageFont.truetype(FONTE, tam)


def _norm(t):
    return re.sub(r"[^\wáàâãéêíóôõúçü]", "", t.lower())


def ler_storyboard_v2(caminho, palavras, cfg):
    """Formato v2: | plano | gatilho | tipo | asset | entrada | movimento | texto | sfx | transicao | cor |"""
    linhas = []
    for linha in open(caminho, encoding="utf-8"):
        c = [x.strip() for x in linha.strip().strip("|").split("|")]
        if len(c) >= 10 and c[0].isdigit():
            linhas.append(c)
    planos, pos = [], 0
    vin = cfg.get("vinhetas", {})
    for c in linhas:
        g = c[1]
        if g.upper().startswith("VINHETA"):
            ini = float(vin[g.upper()])
        else:
            alvo = [_norm(x) for x in g.split() if _norm(x)]
            ini = None
            for i in range(pos, len(palavras) - len(alvo) + 1):
                if all(_norm(palavras[i + j]["text"]) == alvo[j] for j in range(len(alvo))):
                    ini, pos = palavras[i]["start"] - cfg.get("antecipa", 0.06), i + 1
                    break
            if ini is None:
                raise SystemExit(f"gatilho nao encontrado no plano {c[0]}: {g}")
        planos.append(dict(n=int(c[0]), ini=max(0.0, ini), fim=None, tipo=c[2], asset=c[3],
                           entrada=float(c[4]) if c[4] not in ("-", "") else 0.0, mov=c[5],
                           texto=c[6], sfx=c[7], trans=c[8], cor=c[9] if len(c) > 9 else "neutro"))
    planos[0]["ini"] = 0.0
    for a, b in zip(planos, planos[1:]):
        a["fim"] = b["ini"]
    planos[-1]["fim"] = float(cfg["fim"])
    return planos


def ler_storyboard(caminho):
    planos = []
    for linha in open(caminho, encoding="utf-8"):
        if not linha.startswith("|") or "---" in linha or "plano" in linha.lower()[:10]:
            continue
        c = [x.strip() for x in linha.strip().strip("|").split("|")]
        if len(c) < 10 or not c[0].isdigit():
            continue
        planos.append(dict(n=int(c[0]), ini=float(c[1]), fim=float(c[2]), tipo=c[3], asset=c[4],
                           entrada=float(c[5]) if c[5] not in ("-", "") else 0.0, mov=c[6],
                           texto=c[7], sfx=c[8], trans=c[9]))
    return planos


# ---------- utilidades de imagem ----------

def ken_burns(img, k, mov, forca=0.08):
    """Recorta/escala a imagem para o quadro k (0..1) com zoom/pan leve."""
    iw, ih = img.size
    if mov == "zoom_in":
        z = 1.0 + forca * k
        cx, cy = iw / 2, ih / 2
    elif mov == "zoom_out":
        z = 1.0 + forca * (1 - k)
        cx, cy = iw / 2, ih / 2
    elif mov in ("pan_esq", "pan_dir"):
        z = 1.0 + forca
        folga = iw - iw / z
        x0 = folga * (1 - k) if mov == "pan_esq" else folga * k
        cx, cy = x0 + iw / z / 2, ih / 2
    else:
        z, cx, cy = 1.0, iw / 2, ih / 2
    cw, ch = iw / z, ih / z
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return img.resize((W, H), Image.LANCZOS, box=box)


def transicao(frame, i, trans):
    """Aplica a transição de entrada nos primeiros quadros."""
    if trans == "flash" and i < 5:
        a = 1 - i / 5
        return Image.blend(frame, Image.new("RGB", (W, H), (255, 255, 255)), a * 0.9)
    if trans == "fade" and i < 12:
        return Image.blend(Image.new("RGB", (W, H), (0, 0, 0)), frame, i / 12)
    if trans == "glitch" and i < 6:
        r, g, b = frame.split()
        d = [28, -22, 16, -10, 6, 0][i]
        r = r.transform((W, H), Image.AFFINE, (1, 0, d, 0, 1, 0))
        b = b.transform((W, H), Image.AFFINE, (1, 0, -d, 0, 1, 0))
        f = Image.merge("RGB", (r, g, b))
        dr = ImageDraw.Draw(f)
        for s in range(4):
            y = (i * 197 + s * 263) % H
            faixa = f.crop((0, y, W, min(H, y + 24)))
            f.paste(faixa, ((s % 2 * 2 - 1) * (40 - i * 6), y))
        return f
    return frame


def escurecer(img, fator=0.45, desfoque=0):
    if desfoque:
        img = img.filter(ImageFilter.GaussianBlur(desfoque))
    return Image.blend(Image.new("RGB", img.size, (0, 0, 0)), img, fator)


def fundo_chumbo():
    img = Image.new("RGB", (W, H), CHUMBO)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(22, 25, 31))
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(22, 25, 31))
    brilho = Image.new("RGB", (W, H), (0, 0, 0))
    db = ImageDraw.Draw(brilho)
    db.ellipse((-500, H - 450, 700, H + 500), fill=(25, 45, 75))
    brilho = brilho.filter(ImageFilter.GaussianBlur(160))
    return Image.blend(img, Image.eval(Image.blend(img, brilho, 0.5), lambda v: v), 0.6)


def quebrar(texto, fnt, larg_max, draw):
    palavras, linhas, atual = texto.split(), [], ""
    for p in palavras:
        teste = (atual + " " + p).strip()
        if draw.textlength(teste, font=fnt) <= larg_max:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def frase_na_tela(base, texto, k):
    """Caixas brancas empilhadas (uma por linha), texto preto, quadradinho amarelo (estilo Elementar)."""
    img = base.copy()
    d = ImageDraw.Draw(img)
    fnt = fonte(FONTE, 86)
    linhas = quebrar(texto, fnt, 1250, d)
    alt = 118
    y0 = H // 2 - len(linhas) * alt // 2 - 20
    x0 = 160
    for j, ln in enumerate(linhas):
        aparece = min(1.0, max(0.0, (k * 10) - j * 0.8))  # entram uma a uma, rápido
        if aparece <= 0:
            continue
        tw = d.textlength(ln, font=fnt)
        larg = int((tw + 44) * min(1.0, aparece * 1.4))
        y = y0 + j * alt + int((1 - aparece) * 30)
        d.rectangle([x0, y, x0 + larg, y + alt - 12], fill=(255, 255, 255))
        if aparece > 0.5:
            d.text((x0 + 22, y + 8), ln, font=fnt, fill=(10, 10, 10))
        if j == len(linhas) - 1 and aparece >= 1:
            d.rectangle([x0 + tw + 58, y + 32, x0 + tw + 82, y + 56], fill=AMARELO)
    return img


def numero_destaque(base, texto, k):
    img = escurecer(base, 0.35, 6)
    d = ImageDraw.Draw(img)
    partes = texto.split(" ", 2)
    if len(partes) >= 2 and any(ch.isdigit() for ch in partes[0]):
        num = partes[0] + (" " + partes[1] if partes[1].isupper() and len(partes[1]) <= 3 else "")
        resto = texto[len(num):].strip()
    else:
        num, resto = texto, ""
    s = 0.85 + 0.15 * min(1, k * 4)
    fn = fonte(FONTE_BLACK, int(250 * s))
    tw = d.textlength(num, font=fn)
    d.text(((W - tw) / 2, H / 2 - 230 * s), num, font=fn, fill=AMARELO, stroke_width=8, stroke_fill=(0, 0, 0))
    if resto and k > 0.15:
        fr = fonte(FONTE, 70)
        rw = d.textlength(resto, font=fr)
        y = H / 2 + 90
        d.rectangle([(W - rw) / 2 - 30, y - 10, (W + rw) / 2 + 30, y + 92], fill=VERMELHO)
        d.text(((W - rw) / 2, y), resto, font=fr, fill=(255, 255, 255))
    return img


DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]


def calendario(texto, k):
    img = fundo_chumbo()
    d = ImageDraw.Draw(img)
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", texto)
    data = datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1))) if m else datetime.date(2026, 11, 12)
    seg = data - datetime.timedelta(days=data.weekday())
    titulo = texto.split("·")[0].strip()
    rotulo = texto.split("·")[-1].strip() if texto.count("·") >= 2 else ""
    ft = fonte(FONTE, 64)
    d.text((160, 170), "NOVEMBRO DE " + str(data.year), font=fonte(FONTE_MED, 40), fill=(160, 165, 175))
    caixa, gap = 200, 22
    x0 = (W - (7 * caixa + 6 * gap)) // 2
    y0 = 380
    for i in range(7):
        dia = seg + datetime.timedelta(days=i)
        x = x0 + i * (caixa + gap)
        alvo = dia == data
        cor_fundo = AMARELO if (alvo and k > 0.25) else (28, 32, 40)
        cor_txt = (10, 10, 10) if (alvo and k > 0.25) else (230, 232, 236)
        if i >= 5 and not alvo:
            cor_txt = (110, 115, 125)
        d.rounded_rectangle([x, y0, x + caixa, y0 + caixa + 40], 18, fill=cor_fundo)
        fd = fonte(FONTE_MED, 36)
        d.text((x + (caixa - d.textlength(DIAS[i], font=fd)) / 2, y0 + 22), DIAS[i], font=fd, fill=cor_txt)
        fn = fonte(FONTE_BLACK, 96)
        s = str(dia.day)
        d.text((x + (caixa - d.textlength(s, font=fn)) / 2, y0 + 80), s, font=fn, fill=cor_txt)
    if k > 0.3:
        tw = d.textlength(titulo, font=ft)
        d.text(((W - tw) / 2, y0 + caixa + 110), titulo, font=ft, fill=(255, 255, 255))
        if rotulo:
            fr = fonte(FONTE, 52)
            rw = d.textlength(rotulo, font=fr)
            y = y0 + caixa + 210
            d.rectangle([(W - rw) / 2 - 24, y - 6, (W + rw) / 2 + 24, y + 70], fill=VERMELHO)
            d.text(((W - rw) / 2, y), rotulo, font=fr, fill=(255, 255, 255))
    return img


def vinheta(texto, k, dur):
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    linhas = [t.strip() for t in texto.split("/")]
    fm = fonte(MONO or FONTE, 54)
    total = sum(len(l) for l in linhas)
    mostrar = int(total * min(1, k * 1.6))
    y = H // 2 - 40 * len(linhas) - 20
    for j, ln in enumerate(linhas):
        n = max(0, min(len(ln), mostrar))
        mostrar -= len(ln)
        if j == 0 and ln.upper().startswith("HACKOPSIA"):
            fl = fonte(FONTE_BLACK, 150)
            tw = d.textlength(ln, font=fl)
            if n > 0:
                d.text(((W - tw) / 2, y), ln[:n], font=fl, fill=(255, 255, 255))
            y += 170
            continue
        f = fm if j > 1 else fonte(MONO or FONTE, 72)
        tw = d.textlength(ln, font=f)
        cor = AMARELO if ("LAUDO" in ln.upper() or "ARQUIVO" in ln.upper()) else (200, 204, 210)
        d.text(((W - tw) / 2, y), ln[:n], font=f, fill=cor)
        if 0 < n < len(ln) and int(k * dur * 4) % 2 == 0:
            cx = (W - tw) / 2 + d.textlength(ln[:n], font=f) + 6
            d.rectangle([cx, y + 6, cx + 26, y + 60], fill=cor)
        y += 90
    return img


def print_grifado(png, rects, k, mov):
    """Print da notícia com marca-texto amarelo varrendo as linhas da frase."""
    img = Image.open(png).convert("RGB")
    iw, ih = img.size
    grifo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dg = ImageDraw.Draw(grifo)
    total = sum(r[2] for r in rects) or 1
    andar = total * min(1.0, max(0.0, (k - 0.15) / 0.5))
    for (x, y, w, h) in rects:
        if andar <= 0:
            break
        ww = min(w, andar)
        dg.rectangle([x - 8, y + h * 0.1, x + ww + 8, y + h * 0.95], fill=(255, 212, 0, 120))
        andar -= w
    img = Image.alpha_composite(img.convert("RGBA"), grifo).convert("RGB")
    # enquadra na frase: centro na primeira linha, com zoom de aproximação
    if rects:
        xs = [r[0] for r in rects] + [r[0] + r[2] for r in rects]
        ys = [r[1] for r in rects] + [r[1] + r[3] for r in rects]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    else:
        cx, cy = iw / 2, ih / 2
    z = 1.35 + 0.15 * k if mov != "zoom_out" else 1.5 - 0.15 * k
    cw, ch = iw / z, ih / z
    cx = min(max(cx, cw / 2), iw - cw / 2)
    cy = min(max(cy, ch / 2), ih - ch / 2)
    return img.resize((W, H), Image.LANCZOS, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))


LUTS = {
    "frio": (lambda v: int(v * 0.90), lambda v: int(v * 0.98), lambda v: min(255, int(v * 1.06 + 10))),
    "quente": (lambda v: min(255, int(v * 1.07 + 6)), lambda v: int(v * 1.0), lambda v: int(v * 0.88)),
}
_LUT_CACHE = {}


def colorir(img, cor):
    if cor not in LUTS:
        return img
    if cor not in _LUT_CACHE:
        _LUT_CACHE[cor] = [list(map(f, range(256))) for f in LUTS[cor]]
    r, g, b = img.split()
    lr, lg, lb = _LUT_CACHE[cor]
    return Image.merge("RGB", (r.point(lr), g.point(lg), b.point(lb)))


def poeira(img, quadro):
    """Partículas e riscos leves de película (ar de documentário)."""
    import random
    rnd = random.Random(quadro * 7919)
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(rnd.randint(4, 10)):
        x, y, r = rnd.randint(0, W), rnd.randint(0, H), rnd.choice([1, 1, 2, 2, 3])
        a = rnd.randint(40, 110)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(235, 230, 220, a))
    if rnd.random() < 0.06:
        x = rnd.randint(100, W - 100)
        d.line([(x, 0), (x + rnd.randint(-20, 20), H)], fill=(230, 230, 230, 35), width=1)
    return img


# ---------- vídeo ----------

def quadros_de_video(clipe, entrada, dur):
    """Extrai os quadros do trecho do clipe (1920x1080, 30 fps) como imagens PIL."""
    cmd = ["ffmpeg", "-loglevel", "error", "-ss", f"{entrada:.2f}", "-t", f"{dur + 0.2:.2f}", "-i", clipe,
           "-vf", f"fps={FPS},scale=2112:1188:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    tam = 2112 * 1188 * 3
    return [Image.frombytes("RGB", (2112, 1188), raw[i:i + tam]) for i in range(0, len(raw) - tam + 1, tam)]


def renderizar(cfg):
    if cfg.get("formato") == "v2":
        stt = json.load(open(cfg["transcricao"]))
        palavras = [x for x in stt["words"] if x["type"] == "word"]
        planos = ler_storyboard_v2(cfg["storyboard"], palavras, cfg)
        cfg["_planos"] = planos
        for p in planos:
            print(f"  {p['n']:>2} {p['ini']:6.2f}-{p['fim']:6.2f} {p['tipo']}", flush=True)
    else:
        planos = ler_storyboard(cfg["storyboard"])
    grifos = json.load(open(os.path.join(cfg["prints"], "grifos.json")))
    mapa_print = cfg.get("mapa_prints", {})
    saida_video = cfg["saida"].replace(".mp4", "_sem_audio.mp4")
    enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                            "-crf", "18", "-pix_fmt", "yuv420p"] + (["-vf", cfg["look"]] if cfg.get("look") else []) + [saida_video], stdin=subprocess.PIPE)
    ultimo_video = None
    fwm = fonte(FONTE_BLACK, 26)
    usados_print = {}
    quadro_global = 0
    for idx_p, p in enumerate(planos):
        nq = max(1, round((p["fim"] - p["ini"]) * FPS))
        prox_vinheta = idx_p + 1 < len(planos) and planos[idx_p + 1]["tipo"] == "vinheta" and p["tipo"] != "vinheta"
        tipo = p["tipo"]
        frames_base = None
        if tipo == "video":
            clipe = os.path.join(cfg["clipes"], p["asset"] + ".mp4")
            frames_base = quadros_de_video(clipe, p["entrada"], nq / FPS)
            ultimo_video = (clipe, p["entrada"] + nq / FPS)
        elif tipo in ("texto", "numero") and ultimo_video:
            fb = quadros_de_video(ultimo_video[0], ultimo_video[1], 0.1)
            frames_base = [escurecer(fb[0], 0.42, 10)] if fb else None
        for i in range(nq):
            k = i / max(1, nq - 1)
            if tipo == "video" and frames_base:
                f = ken_burns(frames_base[min(i, len(frames_base) - 1)], k, p["mov"], 0.07)
            elif tipo == "print":
                chave = mapa_print.get(f"{p['n']}", p["asset"])
                g = grifos.get(chave) or grifos.get(p["asset"])
                f = print_grifado(os.path.join(cfg["prints"], (chave if chave in grifos else p["asset"]) + ".png"),
                                  g["rects"] if g else [], k, p["mov"])
            elif tipo == "texto":
                base = ken_burns(frames_base[0], k, "zoom_in", 0.03) if frames_base else fundo_chumbo()
                f = frase_na_tela(base, p["texto"], k)
            elif tipo == "numero":
                base = ken_burns(frames_base[0], k, "zoom_in", 0.03) if frames_base else fundo_chumbo()
                f = numero_destaque(base, p["texto"], k)
            elif tipo == "calendario":
                f = ken_burns(calendario(p["texto"], k), k, "zoom_in", 0.04)
            elif tipo == "vinheta":
                f = vinheta(p["texto"], k, nq / FPS)
            else:
                f = Image.new("RGB", (W, H), (0, 0, 0))
            f = transicao(f, i, p["trans"])
            if tipo != "vinheta":
                f = colorir(f, p.get("cor", "neutro"))
                f = poeira(f, quadro_global)
            if prox_vinheta and i >= nq - 14:
                f = Image.blend(f, Image.new("RGB", (W, H), (0, 0, 0)), (i - (nq - 14)) / 14)
            quadro_global += 1
            if tipo != "vinheta":
                d = ImageDraw.Draw(f)
                d.text((44, H - 64), "HACKOPSIA", font=fwm, fill=(235, 235, 235))
            enc.stdin.write(f.tobytes())
        print(f"plano {p['n']:>2} {tipo:<10} {p['ini']:6.2f}-{p['fim']:6.2f} ok", flush=True)
    enc.stdin.close()
    enc.wait()
    mixar(cfg, planos, saida_video)


def mixar(cfg, planos, video):
    planos = cfg.get("_planos", planos)
    ini, fim = planos[0]["ini"], planos[-1]["fim"]
    dur = fim - ini
    entradas = ["-i", video, "-ss", f"{ini}", "-t", f"{dur}", "-i", cfg["narracao"],
                "-stream_loop", "-1", "-t", f"{dur}", "-i", cfg["musica"]]
    mudo = cfg.get("mutar_narracao", [])
    vexpr = "1"
    for a, b in mudo:
        vexpr = f"if(between(t,{a - ini},{b - ini}),0,{vexpr})"
    filtros = [f"[1:a]volume='{vexpr}':eval=frame[voz]"]
    # música: baixa sob a voz, sobe no respiro (sem voz)
    resp = cfg.get("respiro", [])
    expr = "0.16"
    for a, b in resp:
        expr = f"if(between(t,{a},{b}),0.55,{expr})"
    filtros.append(f"[2:a]volume='{expr}':eval=frame,afade=t=in:d=1.5,afade=t=out:st={dur-1.5}:d=1.5[mus]")
    mix = ["[voz]", "[mus]"]
    idx = 3
    vol = {"whoosh": 0.35, "click": 0.5, "impacto": 0.6, "glitch": 0.4, "digitacao": 0.35, "flash": 0.35}
    for p in planos:
        s = p["sfx"]
        if s in ("nenhum", "-", ""):
            continue
        arq = os.path.join(cfg["sfx"], s + ".mp3")
        if not os.path.exists(arq):
            continue
        atraso = int((p["ini"] - ini) * 1000)
        if p["tipo"] == "vinheta" and s == "digitacao":
            dur_dig = (p["fim"] - p["ini"]) / 1.6 + 0.1
            entradas += ["-stream_loop", "-1", "-t", f"{dur_dig:.2f}", "-i", arq]
            filtros.append(f"[{idx}:a]volume=0.45,afade=t=out:st={max(0, dur_dig - 0.15):.2f}:d=0.15,adelay={atraso}|{atraso}[s{idx}]")
        else:
            entradas += ["-i", arq]
            filtros.append(f"[{idx}:a]volume={vol.get(s, 0.4)},adelay={atraso}|{atraso}[s{idx}]")
        mix.append(f"[s{idx}]")
        idx += 1
    filtros.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,alimiter=limit=0.95[a]")
    cmd = ["ffmpeg", "-loglevel", "error", "-y"] + entradas + ["-filter_complex", ";".join(filtros),
           "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", cfg["saida"]]
    subprocess.run(cmd, check=True)
    print("pronto:", cfg["saida"])


if __name__ == "__main__":
    renderizar(json.load(open(sys.argv[1])))
