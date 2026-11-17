#!/usr/bin/env python3
"""Busca vídeos gratuitos no Mixkit (licença livre para YouTube).

Uso: python3 -I ferramentas/mixkit_busca.py lista.tsv saida.json [--paginas 3]
lista.tsv: ID<TAB>categoria<TAB>palavras-chave separadas por espaço<TAB>descrição
Para cada ID, lê as páginas da categoria e ordena os vídeos pelas palavras-chave
que aparecem no título.
"""
import json, re, sys, urllib.request

UA = {"User-Agent": "Mozilla/5.0"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read().decode("utf-8", "ignore")

def itens(categoria, paginas):
    vistos = {}
    for p in range(1, paginas + 1):
        try:
            html = get(f"https://mixkit.co/free-stock-video/{categoria}/" + (f"?page={p}" if p > 1 else ""))
        except Exception:
            break
        for slug, vid in re.findall(r'href="/free-stock-video/([a-z0-9-]+)-(\d+)/"', html):
            vistos.setdefault(vid, slug)
    return vistos

def main():
    lista, saida = sys.argv[1], sys.argv[2]
    paginas = int(sys.argv[sys.argv.index("--paginas") + 1]) if "--paginas" in sys.argv else 3
    cache, res = {}, {}
    for linha in open(lista, encoding="utf-8"):
        if not linha.strip():
            continue
        vid_id, cat, chaves, desc = (linha.rstrip("\n").split("\t") + [""] * 4)[:4]
        if cat not in cache:
            cache[cat] = itens(cat, paginas)
        palavras = chaves.lower().split()
        cands = []
        for vid, slug in cache[cat].items():
            nota = sum(1 for w in palavras if w in slug)
            cands.append((nota, vid, slug))
        cands.sort(key=lambda x: (-x[0], x[1]))
        res[vid_id] = {"descricao": desc, "categoria": cat, "candidatos": [
            {"id": v, "titulo": s.replace("-", " "), "nota": n,
             "pagina": f"https://mixkit.co/free-stock-video/{s}-{v}/",
             "mp4_720": f"https://assets.mixkit.co/videos/{v}/{v}-720.mp4",
             "miniatura": f"https://assets.mixkit.co/videos/{v}/{v}-thumb-360-0.jpg"}
            for n, v, s in cands[:6]]}
        print(vid_id, cat, len(cache[cat]), "->", [c[2][:40] for c in cands[:3]])
    json.dump(res, open(saida, "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
