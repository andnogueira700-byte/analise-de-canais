"""Gráficos animados no estilo escuro do HACKOPSIA (inspirados na análise do canal Neu:
a mesma tela vai se montando enquanto a voz fala). Cada função recebe o texto do
storyboard e k (0 a 1, o progresso do plano) e devolve uma imagem 1920x1080.

Formatos do texto (coluna "grifo_ou_texto" do storyboard):
  barras       "105 MIL|2024 / !139 MIL|1º SEM. 2025 // nota: +195,7% sobre o mesmo semestre de 2024"
               (! = barra vermelha; a última sem ! fica amarela)
  linha_tempo  "2018|LGPD aprovada / 02/2026|MED obrigatório / 07/2026|STJ decide"
  parte_total  "1 de 4|das ligações usa número falsificado"
  pessoas      "22|presos na central de Guarulhos"
  fluxo        "A FICHA / O DISFARCE / O EMPURRÃO"
  portas       "DADOS|quem vigia? / TELEFONIA|quem vigia? / BANCO|quem vigia? // ninguém fecha o ciclo"
  dividida     "VOLTA REDONDA|banco devolveu R$ 190,9 mil / STJ|vítima não recebeu nada"
  ficha        "NOME FICTÍCIO / CPF 000.000.000-00 / TEL. (00) 00000-0000 / NASC. 00/00/0000"
Etiquetas (em qualquer plano, inclusive vídeo): "data=28/11/2024; credito=ILUSTRAÇÃO".
"""
import math, re
from PIL import Image, ImageDraw, ImageFilter
from render_storyboard import W, H, AMARELO, VERMELHO, fonte, fundo_chumbo, FONTE, FONTE_BLACK, FONTE_MED, MONO

CINZA = (120, 126, 138)
CLARO = (232, 235, 240)
BEGE = (150, 140, 118)


def _ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def _janela(k, i, n, inicio=0.05, fim=0.75):
    """Progresso (0 a 1) do item i de n, que entram um após o outro entre inicio e fim."""
    passo = (fim - inicio) / max(1, n)
    return _ease((k - inicio - i * passo) / max(0.08, passo * 0.9))


def _centro(d, txt, f, y, cor, x0=0, x1=W):
    tw = d.textlength(txt, font=f)
    d.text((x0 + (x1 - x0 - tw) / 2, y), txt, font=f, fill=cor)


def _partes(texto):
    principal, _, nota = texto.partition("//")
    itens = [t.strip() for t in principal.split(" / ") if t.strip()]
    return itens, nota.replace("nota:", "").strip()


def _num(v):
    m = re.search(r"[\d.,]+", v)
    if not m:
        return 1.0
    s = m.group(0).replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 1.0


def barras(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, nota = _partes(texto)
    dados = []
    for it in itens:
        vermelho = it.startswith("!")
        valor, _, rot = it.lstrip("!").partition("|")
        dados.append((valor.strip(), rot.strip(), vermelho))
    maxv = max(_num(v) for v, _, _ in dados) or 1
    n = len(dados); base = 900; alt_max = 480; larg = 260
    gap = 200; total = n * larg + (n - 1) * gap; x = (W - total) / 2
    d.line([(x - 80, base), (x + total + 80, base)], fill=CINZA, width=3)
    fv, fr = fonte(FONTE_BLACK, 74), fonte(FONTE_MED, 38)
    for i, (v, r, verm) in enumerate(dados):
        p = _janela(k, i, n, 0.04, 0.6)
        if p <= 0:
            x += larg + gap; continue
        h = alt_max * _num(v) / maxv * p
        cor = VERMELHO if verm else (AMARELO if i == n - 1 else BEGE)
        d.rectangle([x, base - h, x + larg, base], fill=cor)
        if p > 0.6:
            _centro(d, v, fv, base - h - 96, CLARO, x - 60, x + larg + 60)
        _centro(d, r, fr, base + 22, CLARO if p > 0.3 else CINZA, x - 80, x + larg + 80)
        x += larg + gap
    if nota and k > 0.7:
        a = _ease((k - 0.7) / 0.15)
        f = fonte(FONTE, 46)
        tw = d.textlength(nota, font=f)
        d.rectangle([(W - tw) / 2 - 24, 90, (W + tw) / 2 + 24, 166], fill=(int(VERMELHO[0] * a), int(VERMELHO[1] * a), int(VERMELHO[2] * a)))
        _centro(d, nota, f, 100, (255, 255, 255))
    return img


def linha_tempo(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, nota = _partes(texto)
    n = len(itens); y = 560; x0, x1 = 200, W - 200
    d.line([(x0, y), (x0 + (x1 - x0) * _ease(k / 0.25), y)], fill=AMARELO, width=6)
    fd, fe = fonte(MONO or FONTE, 54), fonte(FONTE_MED, 42)
    for i, it in enumerate(itens):
        data, _, ev = it.partition("|")
        p = _janela(k, i, n, 0.15, 0.85)
        if p <= 0:
            continue
        x = x0 + (x1 - x0) * (i + 0.5) / n
        r = 18 * p
        d.ellipse([x - r, y - r, x + r, y + r], fill=AMARELO if i == n - 1 else CLARO)
        cima = i % 2 == 0
        linhas = _quebra(d, ev.strip(), fe, 420)
        bloco = 66 + len(linhas) * 50
        yy = y - 50 - bloco if cima else y + 50
        d.line([(x, y - 20 if cima else y + 20), (x, y - 40 if cima else y + 44)], fill=CINZA, width=2)
        _centro(d, data.strip(), fd, yy, AMARELO, x - 230, x + 230)
        for j, ln in enumerate(linhas):
            _centro(d, ln, fe, yy + 66 + j * 50, CLARO, x - 240, x + 240)
    return img


def _quebra(d, txt, f, largura):
    txt = re.sub(r"R\$ ", "R$\u00a0", txt)
    linhas, atual = [], ""
    for p in txt.split():
        t = (atual + " " + p).strip()
        if d.textlength(t, font=f) > largura and atual:
            linhas.append(atual); atual = p
        else:
            atual = t
    if atual:
        linhas.append(atual)
    return linhas


def parte_total(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    cab, _, leg = texto.partition("|")
    m = re.match(r"\s*(\d+)\s*de\s*(\d+)", cab)
    parte, total = (int(m.group(1)), int(m.group(2))) if m else (1, 4)
    lado = 220 if total <= 6 else (120 if total <= 20 else 60)
    cols = min(total, 10 if total > 10 else total)
    linhas = math.ceil(total / cols)
    gap = lado * 0.18
    gw = cols * lado + (cols - 1) * gap; gh = linhas * lado + (linhas - 1) * gap
    x0, y0 = (W - gw) / 2, (H - gh) / 2 - 60
    for i in range(total):
        p = _janela(k, i, total, 0.03, 0.4)
        if p <= 0:
            continue
        c, r = i % cols, i // cols
        x, y = x0 + c * (lado + gap), y0 + r * (lado + gap)
        verm = i < parte and k > 0.5
        cor = VERMELHO if verm else (46, 52, 62)
        s = lado * (0.6 + 0.4 * p)
        d.rounded_rectangle([x + (lado - s) / 2, y + (lado - s) / 2, x + (lado + s) / 2, y + (lado + s) / 2], radius=10, fill=cor)
    if k > 0.55:
        _centro(d, cab.strip().upper(), fonte(FONTE_BLACK, 84), y0 + gh + 50, VERMELHO)
        _centro(d, leg.strip(), fonte(FONTE_MED, 44), y0 + gh + 160, CLARO)
    return img


def _boneco(d, x, y, esc, cor):
    r = 22 * esc
    d.ellipse([x - r, y, x + r, y + 2 * r], fill=cor)
    d.rounded_rectangle([x - 34 * esc, y + 2 * r + 8 * esc, x + 34 * esc, y + 2 * r + 86 * esc], radius=int(26 * esc), fill=cor)


def pessoas(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    num, _, leg = texto.partition("|")
    n = max(1, int(_num(num)))
    cols = min(n, 11); linhas = math.ceil(n / cols)
    esp = 130; x0 = (W - (cols - 1) * esp) / 2; y0 = 330 - (linhas - 1) * 75
    for i in range(n):
        p = _janela(k, i, n, 0.03, 0.6)
        if p <= 0:
            continue
        c, r = i % cols, i // cols
        cor = AMARELO if k > 0.75 else CLARO
        _boneco(d, x0 + c * esp, y0 + r * 160 + (1 - p) * 30, 1.0, cor)
    if k > 0.7:
        _centro(d, num.strip().upper(), fonte(FONTE_BLACK, 110), y0 + linhas * 160 + 40, AMARELO)
        _centro(d, leg.strip(), fonte(FONTE_MED, 46), y0 + linhas * 160 + 180, CLARO)
    return img


def fluxo(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, nota = _partes(texto)
    n = len(itens); larg, alt, gap = 440, 190, 150
    total = n * larg + (n - 1) * gap; x = (W - total) / 2; y = (H - alt) / 2
    f = fonte(FONTE_BLACK, 50)
    for i, it in enumerate(itens):
        p = _janela(k, i, n, 0.05, 0.8)
        aceso = p > 0.5
        cor_borda = AMARELO if aceso else (60, 66, 78)
        d.rounded_rectangle([x, y, x + larg, y + alt], radius=18, outline=cor_borda, width=6,
                            fill=(28, 30, 22) if aceso else (20, 22, 27))
        _centro(d, f"0{i + 1}", fonte(MONO or FONTE, 36), y - 64, cor_borda, x, x + larg)
        for j, ln in enumerate(_quebra(d, it, f, larg - 50)):
            _centro(d, ln, f, y + 50 + j * 60, CLARO if aceso else CINZA, x, x + larg)
        if i < n - 1:
            pa = _janela(k, i + 0.5, n, 0.05, 0.8)
            xa = x + larg + 20
            d.line([(xa, y + alt / 2), (xa + (gap - 40) * pa, y + alt / 2)], fill=AMARELO, width=6)
            if pa > 0.9:
                d.polygon([(xa + gap - 40, y + alt / 2 - 16), (xa + gap - 16, y + alt / 2), (xa + gap - 40, y + alt / 2 + 16)], fill=AMARELO)
        x += larg + gap
    return img


def portas(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, nota = _partes(texto)
    n = len(itens); larg, alt, gap = 300, 470, 170
    total = n * larg + (n - 1) * gap; x = (W - total) / 2; y = 220
    for i, it in enumerate(itens):
        rot, _, vig = it.partition("|")
        p = _janela(k, i, n, 0.05, 0.7)
        if p <= 0:
            x += larg + gap; continue
        d.rectangle([x, y, x + larg, y + alt], outline=CLARO, width=6, fill=(22, 25, 31))
        abre = larg * 0.75 * p
        d.polygon([(x, y), (x + abre, y + 30), (x + abre, y + alt - 30), (x, y + alt)], fill=(46, 52, 62))
        d.ellipse([x + abre - 30, y + alt / 2 - 10, x + abre - 10, y + alt / 2 + 10], fill=AMARELO)
        _centro(d, rot.strip().upper(), fonte(FONTE_BLACK, 52), y + alt + 30, CLARO, x - 60, x + larg + 60)
        _centro(d, vig.strip(), fonte(FONTE_MED, 34), y + alt + 100, CINZA, x - 80, x + larg + 80)
        x += larg + gap
    if nota and k > 0.78:
        _centro(d, nota.upper(), fonte(FONTE_BLACK, 56), 110, AMARELO)
    return img


def dividida(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, _ = _partes(texto)
    d.line([(W / 2, 140), (W / 2, 140 + (H - 280) * _ease(k / 0.2))], fill=CINZA, width=4)
    for i, it in enumerate(itens[:2]):
        tit, _, txt = it.partition("|")
        p = _janela(k, i, 2, 0.12, 0.6)
        if p <= 0:
            continue
        x0 = 120 if i == 0 else W / 2 + 80
        x1 = W / 2 - 80 if i == 0 else W - 120
        yy = 360 + (1 - p) * 40
        cor = AMARELO if i == 0 else VERMELHO
        _centro(d, tit.strip().upper(), fonte(FONTE_BLACK, 96), yy, cor, x0, x1)
        for j, ln in enumerate(_quebra(d, txt.strip(), fonte(FONTE, 64), x1 - x0 - 40)):
            _centro(d, ln, fonte(FONTE, 64), yy + 160 + j * 82, CLARO, x0, x1)
    return img


def ficha(texto, k):
    img = fundo_chumbo(); d = ImageDraw.Draw(img)
    itens, nota = _partes(texto)
    x0, y0, x1 = 520, 230, 1400
    y1 = y0 + 140 + len(itens) * 110
    d.rectangle([x0, y0, x1, y1], fill=(236, 232, 220))
    d.rectangle([x0, y0, x1, y0 + 90], fill=(40, 44, 52))
    d.text((x0 + 40, y0 + 22), "FICHA", font=fonte(MONO or FONTE, 46), fill=AMARELO)
    d.text((x1 - 330, y0 + 30), "EXEMPLO FICTÍCIO", font=fonte(FONTE_MED, 30), fill=(200, 200, 200))
    f = fonte(MONO or FONTE, 50)
    for i, it in enumerate(itens):
        p = _janela(k, i, len(itens), 0.08, 0.8)
        if p <= 0:
            continue
        mostrar = it[: max(1, int(len(it) * p))]
        d.text((x0 + 50, y0 + 130 + i * 110), mostrar, font=f, fill=(20, 22, 26))
        d.line([(x0 + 50, y0 + 200 + i * 110), (x1 - 50, y0 + 200 + i * 110)], fill=(190, 186, 176), width=2)
    return img


def etiquetas(img, texto):
    """Etiqueta de data (canto sup. direito) e crédito/ILUSTRAÇÃO (canto sup. esquerdo)."""
    if not texto or "=" not in texto:
        return img
    campos = dict((a.strip(), b.strip()) for a, _, b in (p.partition("=") for p in texto.split(";")) if b)
    d = ImageDraw.Draw(img)
    if campos.get("data"):
        f = fonte(MONO or FONTE, 34); t = campos["data"].upper()
        tw = d.textlength(t, font=f)
        d.rectangle([W - tw - 90, 50, W - 50, 108], fill=VERMELHO)
        d.text((W - tw - 70, 58), t, font=f, fill=(255, 255, 255))
    if campos.get("credito"):
        f = fonte(FONTE_MED, 24); t = campos["credito"]
        tw = d.textlength(t, font=f)
        d.rectangle([50, 50, 50 + tw + 32, 92], fill=(0, 0, 0))
        d.text((66, 57), t, font=f, fill=(210, 214, 220))
    return img


TIPOS = {"barras": barras, "linha_tempo": linha_tempo, "parte_total": parte_total, "pessoas": pessoas,
         "fluxo": fluxo, "portas": portas, "dividida": dividida, "ficha": ficha}
