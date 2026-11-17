#!/usr/bin/env python3
"""Monta uma biblioteca de imagens e vídeos livres para a edição.

Fontes (todas com licença livre para uso em vídeo no YouTube):
- Mixkit (vídeos, licença Mixkit)       -> IDs  M<numero>
- Coverr (vídeos Full HD, licença Coverr) -> IDs  C<numero>
- Wikimedia Commons (fotos, licenças CC/domínio público, crédito na descrição) -> IDs F<numero>

Uso:
  python3 -I ferramentas/biblioteca.py buscas.json saida.json
buscas.json: {"mixkit": ["phone", "elderly", ...], "coverr": ["elderly phone call", ...],
              "commons": ["Caixa Econômica Federal agência", ...]}
"""
import json, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (biblioteca-hackopsia)"}


def get(url, tentativas=3):
    for t in range(tentativas):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode("utf-8", "ignore")
        except Exception:
            time.sleep(2 + t * 3)
    return ""


def mixkit(cats, paginas=4):
    res = {}
    for cat in cats:
        for p in range(1, paginas + 1):
            html = get(f"https://mixkit.co/free-stock-video/{cat}/" + (f"?page={p}" if p > 1 else ""))
            achados = re.findall(r'href="/free-stock-video/([a-z0-9-]+)-(\d+)/"', html)
            if not achados:
                break
            for slug, vid in achados:
                res.setdefault(f"M{vid}", {
                    "fonte": "Mixkit", "titulo": slug.replace("-", " "), "categoria": cat,
                    "pagina": f"https://mixkit.co/free-stock-video/{slug}-{vid}/",
                    "video": f"https://assets.mixkit.co/videos/{vid}/{vid}-720.mp4",
                    "miniatura": f"https://assets.mixkit.co/videos/{vid}/{vid}-thumb-360-0.jpg",
                    "licenca": "Mixkit Free License"})
    return res


def coverr(termos):
    res = {}
    for termo in termos:
        html = get("https://coverr.co/s?q=" + urllib.parse.quote(termo))
        for m in re.finditer(r'https://cdn\.coverr\.co/videos/([a-z0-9-]+)/(?:360p|720p|1080p)\.mp4', html):
            pasta = m.group(1)
            if "temp-" in pasta or "paywall" in pasta or "banner" in pasta:
                continue
            num = re.search(r"-(\d+)$", pasta)
            cid = f"C{num.group(1) if num else abs(hash(pasta)) % 100000}"
            titulo = re.sub(r"^coverr-|-\d+$", "", pasta).replace("-", " ")
            res.setdefault(cid, {
                "fonte": "Coverr", "titulo": titulo, "categoria": termo,
                "pagina": "https://coverr.co/s?q=" + urllib.parse.quote(termo),
                "video": f"https://cdn.coverr.co/videos/{pasta}/1080p.mp4",
                "miniatura": f"https://cdn.coverr.co/videos/{pasta}/thumbnail.jpeg",
                "licenca": "Coverr License"})
    return res


def commons(termos, por_termo=10):
    res = {}
    for termo in termos:
        q = urllib.parse.urlencode({"action": "query", "generator": "search", "gsrsearch": termo, "gsrnamespace": 6,
                                    "gsrlimit": por_termo, "prop": "imageinfo", "iiprop": "url|extmetadata|size",
                                    "iiurlwidth": 1920, "format": "json"})
        txt = get("https://commons.wikimedia.org/w/api.php?" + q)
        time.sleep(1.5)
        try:
            pages = json.loads(txt).get("query", {}).get("pages", {})
        except Exception:
            continue
        for pid, pg in pages.items():
            ii = (pg.get("imageinfo") or [{}])[0]
            if not ii.get("thumburl") or ii.get("width", 0) < 1200:
                continue
            md = ii.get("extmetadata", {})
            lic = md.get("LicenseShortName", {}).get("value", "?")
            autor = re.sub("<[^>]+>", "", md.get("Artist", {}).get("value", "?"))[:80]
            res.setdefault(f"F{pid}", {
                "fonte": "Wikimedia Commons", "titulo": pg["title"].replace("File:", ""), "categoria": termo,
                "pagina": ii.get("descriptionurl", ""), "imagem": ii["thumburl"],
                "licenca": lic, "credito": autor})
    return res


if __name__ == "__main__":
    buscas = json.load(open(sys.argv[1]))
    lib = {}
    lib.update(mixkit(buscas.get("mixkit", [])))
    lib.update(coverr(buscas.get("coverr", [])))
    lib.update(commons(buscas.get("commons", [])))
    json.dump(lib, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    por = {}
    for v in lib.values():
        por[v["fonte"]] = por.get(v["fonte"], 0) + 1
    print(len(lib), por)
