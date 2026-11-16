#!/usr/bin/env python3
"""Busca no YouTube Brasil e baixa thumbnails para estudo visual.

Não precisa de chave de API nem gasta créditos: lê a página pública de busca
do YouTube. Use com moderação (poucas buscas por vídeo).

Uso:
  python3 -I ferramentas/yt_busca.py busca "vazamento de dados" [--ordem views] [--n 10]
  python3 -I ferramentas/yt_busca.py canal @Elementar [--n 12]
  ... --baixar PASTA      baixa as thumbnails (uma por vídeo) para PASTA
  ... --mosaico ARQ.jpg   junta as thumbnails baixadas num mosaico numerado
                          (precisa de --baixar), para olhar todas de uma vez

A ordem "views" ordena a busca por número de visualizações.
"""
import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request

UA = {"Accept-Language": "pt-BR,pt;q=0.9", "User-Agent": "Mozilla/5.0"}


def _get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    data = urllib.request.urlopen(req, timeout=25).read()
    return data if binary else data.decode("utf-8", "ignore")


def _initial_data(html):
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html)
    if not m:
        raise RuntimeError("não consegui ler a página do YouTube")
    return json.loads(m.group(1))


def _text(node):
    if not isinstance(node, dict):
        return ""
    if "simpleText" in node:
        return node["simpleText"]
    if "content" in node:
        return node["content"]
    return "".join(r.get("text", "") for r in node.get("runs", []))


def _walk(obj, out):
    if isinstance(obj, dict):
        if "videoRenderer" in obj:
            v = obj["videoRenderer"]
            out.append({
                "id": v.get("videoId"),
                "titulo": _text(v.get("title", {})),
                "canal": _text(v.get("ownerText", {})),
                "views": _text(v.get("viewCountText", {})),
                "publicado": _text(v.get("publishedTimeText", {})),
                "duracao": _text(v.get("lengthText", {})),
            })
        elif "richItemRenderer" in obj and "lockupViewModel" in json.dumps(obj)[:2000]:
            pass
        for x in obj.values():
            _walk(x, out)
    elif isinstance(obj, list):
        for x in obj:
            _walk(x, out)


def _walk_lockups(obj, out):
    """Página de vídeos de um canal (formato novo do YouTube)."""
    if isinstance(obj, dict):
        if "lockupViewModel" in obj:
            lv = obj["lockupViewModel"]
            vid = lv.get("contentId")
            meta = lv.get("metadata", {}).get("lockupMetadataViewModel", {})
            titulo = _text(meta.get("title", {}))
            partes = []
            rows = meta.get("metadata", {}).get("contentMetadataViewModel", {}).get("metadataRows", [])
            for r in rows:
                for p in r.get("metadataParts", []):
                    partes.append(_text(p.get("text", {})))
            out.append({"id": vid, "titulo": titulo, "canal": "", "views": " · ".join(partes),
                        "publicado": "", "duracao": ""})
        for x in obj.values():
            _walk_lockups(x, out)
    elif isinstance(obj, list):
        for x in obj:
            _walk_lockups(x, out)


def busca(termo, ordem=None, n=10):
    url = ("https://www.youtube.com/results?search_query=" + urllib.parse.quote(termo)
           + "&gl=BR&hl=pt-BR")
    if ordem == "views":
        url += "&sp=CAMSAhAB"  # ordenar por visualizações, só vídeos
    out = []
    _walk(_initial_data(_get(url)), out)
    return [v for v in out if v["id"]][:n]


def canal(handle, n=12):
    handle = handle if handle.startswith("@") else "@" + handle
    # aba "Vídeos" (os mais recentes que a página traz), reordenados por views
    html = _get(f"https://www.youtube.com/{handle}/videos?view=0&sort=p&gl=BR&hl=pt-BR")
    data = _initial_data(html)
    out = []
    _walk(data, out)
    if not out:
        _walk_lockups(data, out)
    for v in out:
        v["canal"] = v["canal"] or handle
    seen, res = set(), []
    for v in out:
        if v["id"] and v["id"] not in seen:
            seen.add(v["id"])
            res.append(v)
    res.sort(key=lambda v: _num_views(v["views"]), reverse=True)
    return res[:n]


def _num_views(txt):
    """'188 mil · há 5 meses' -> 188000; '1,2 mi' -> 1200000."""
    m = re.search(r"([\d.,]+)\s*(mil|mi|bi)?", txt or "")
    if not m:
        return 0
    num = m.group(1)
    mult = {"mil": 1e3, "mi": 1e6, "bi": 1e9}.get(m.group(2), 1)
    if m.group(2):
        num = num.replace(".", "").replace(",", ".")
    else:
        num = num.replace(".", "").replace(",", "")
    try:
        return float(num) * mult
    except ValueError:
        return 0


def baixar(videos, pasta):
    os.makedirs(pasta, exist_ok=True)
    for i, v in enumerate(videos, 1):
        for nome in ("maxresdefault", "hqdefault"):
            try:
                img = _get(f"https://i.ytimg.com/vi/{v['id']}/{nome}.jpg", binary=True)
                if len(img) > 2000:
                    caminho = os.path.join(pasta, f"{i:02d}_{v['id']}.jpg")
                    with open(caminho, "wb") as f:
                        f.write(img)
                    v["arquivo"] = caminho
                    break
            except Exception:
                continue


def mosaico(videos, destino, colunas=3):
    from PIL import Image, ImageDraw
    arquivos = [v for v in videos if v.get("arquivo")]
    if not arquivos:
        return
    w, h = 480, 270
    linhas = (len(arquivos) + colunas - 1) // colunas
    folha = Image.new("RGB", (colunas * w, linhas * h), "black")
    d = ImageDraw.Draw(folha)
    for k, v in enumerate(arquivos):
        img = Image.open(v["arquivo"]).convert("RGB").resize((w, h))
        x, y = (k % colunas) * w, (k // colunas) * h
        folha.paste(img, (x, y))
        d.rectangle([x, y, x + 34, y + 26], fill="yellow")
        d.text((x + 8, y + 6), f"{k + 1:02d}", fill="black")
    folha.save(destino, quality=85)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("modo", choices=["busca", "canal"])
    p.add_argument("alvo")
    p.add_argument("--ordem", choices=["relevancia", "views"], default="relevancia")
    p.add_argument("--n", type=int, default=10)
    p.add_argument("--baixar")
    p.add_argument("--mosaico")
    a = p.parse_args()
    vids = busca(a.alvo, a.ordem, a.n) if a.modo == "busca" else canal(a.alvo, a.n)
    if a.baixar:
        baixar(vids, a.baixar)
        if a.mosaico:
            mosaico(vids, a.mosaico)
    for i, v in enumerate(vids, 1):
        print(f"{i:02d}. {v['titulo']} | {v['canal']} | {v['views']} | {v['publicado']} | "
              f"{v['duracao']} | https://youtu.be/{v['id']}")
    if a.mosaico and a.baixar:
        print(f"\nMosaico: {a.mosaico}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # mensagem simples para quem não é técnico
        print(f"ERRO: {e}", file=sys.stderr)
        sys.exit(1)
