# Baixa tiles de elevação (AWS Terrain Tiles, formato terrarium) e gera mosaicos de mapa com relevo sombreado e batimetria.
# Fonte dos dados: Mapzen / AWS Open Data (SRTM, GMTED, ETOPO1 etc.).
import os, sys, math, io, json, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image

CACHE = '/tmp/claude-0/terrain'; os.makedirs(CACHE, exist_ok=True)
STYLE = os.environ.get('STYLE', 'a')  # a = relevo realista, b = estilizado (terra creme, mar turquesa)
OUT = os.path.dirname(os.path.abspath(__file__)) + '/../assets/relevo' + ('' if STYLE == 'a' else '-' + STYLE); os.makedirs(OUT, exist_ok=True)

def tile_xy(lon, lat, z):
    n = 2 ** z; x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def fetch(z, x, y):
    p = f'{CACHE}/{z}_{x}_{y}.png'
    if not os.path.exists(p):
        for i in range(4):
            try:
                b = urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', timeout=30).read(); open(p, 'wb').write(b); break
            except Exception as e: print('retry', z, x, y, e)
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

def mosaic(name, z, lon0, lat0, lon1, lat1):
    x0, y0 = tile_xy(lon0, lat1, z); x1, y1 = tile_xy(lon1, lat0, z)
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    n = 2 ** z; xs = list(range(x0, x1 + 1)); ys = list(range(max(0, y0), min(n - 1, y1) + 1))
    with ThreadPoolExecutor(16) as ex:
        tiles = dict(zip([(x, y) for y in ys for x in xs], ex.map(lambda t: fetch(z, t[0] % n, t[1]), [(x, y) for y in ys for x in xs])))
    E = np.zeros((len(ys) * 256, len(xs) * 256), np.float32)
    for (x, y), a in tiles.items(): E[(y - ys[0]) * 256:(y - ys[0] + 1) * 256, (x - xs[0]) * 256:(x - xs[0] + 1) * 256] = a
    img = shade(E, z, (ys[0] + ys[-1] + 1) / 2 / n)
    # limites do mosaico em coordenadas do motor (lon, y Mercator em graus)
    def merc_y(ty): return math.degrees(math.pi * (1 - 2 * ty / n))
    meta = dict(name=name, z=z, x0=xs[0] / n * 360 - 180, x1=(xs[-1] + 1) / n * 360 - 180, y0=merc_y(ys[-1] + 1), y1=merc_y(ys[0]), w=img.width, h=img.height)
    img.save(f'{OUT}/{name}.jpg', quality=90); print(name, img.size, len(tiles)); return meta

def shade(E, z, ty_frac):
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty_frac))))
    mpp = 156543.03 * math.cos(math.radians(lat)) / 2 ** z  # metros por pixel
    land = E > 0
    # sombreamento (luz do noroeste), com exagero vertical maior em zoom baixo
    ex = {4: 30, 5: 18, 6: 10, 7: 6, 8: 4, 9: 3, 10: 2.5}.get(z, 3)
    gy, gx = np.gradient(E * ex, mpp)
    slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(42)
    hs = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    hs = np.clip(hs, 0, 1)
    if STYLE == 'b': return shade_b(E, hs, land)
    # cores de terra (planície verde-oliva → planalto ocre → serra marrom → pico claro)
    stops_l = [(0, (128, 146, 92)), (200, (150, 160, 104)), (600, (178, 168, 118)), (1200, (170, 140, 98)), (2500, (150, 120, 92)), (4500, (228, 222, 214))]
    # cores do mar (plataforma rasa clara → oceano profundo anil)
    stops_o = [(0, (64, 132, 170)), (-60, (38, 98, 150)), (-200, (24, 70, 128)), (-1500, (14, 46, 98)), (-4000, (10, 30, 74)), (-7000, (6, 18, 47))]
    def ramp(v, stops):
        xs = [s[0] for s in stops]; out = np.zeros(v.shape + (3,), np.float32)
        order = np.argsort(xs); xs_s = np.array(xs)[order]; cs = np.array([stops[i][1] for i in order], np.float32)
        for c in range(3): out[..., c] = np.interp(v, xs_s, cs[:, c])
        return out
    col_l = ramp(E, stops_l); col_o = ramp(E, stops_o)
    shade_l = (0.55 + 0.75 * hs)[..., None]; shade_o = (0.85 + 0.3 * hs)[..., None]
    rgb = np.where(land[..., None], col_l * shade_l, col_o * shade_o)
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

def shade_b(E, hs, land):
    from scipy import ndimage
    # tira ilhotas de poucos pixels (montes submarinos que viram pontinhos brilhantes)
    lab, n = ndimage.label(land); sizes = ndimage.sum(land, lab, range(1, n + 1))
    land = land & np.isin(lab, np.nonzero(sizes >= 30)[0] + 1)
    # terra creme com relevo suave
    alt = np.clip(E / 2500, 0, 1)[..., None]
    base = np.array((236, 222, 190), np.float32) * (1 - alt * 0.25) + np.array((196, 170, 132), np.float32) * alt * 0.25
    col_l = base * (0.86 + 0.2 * hs[..., None])
    # mar turquesa, mais claro perto da costa (brilho) e mais fundo longe
    d = ndimage.distance_transform_edt(~land)
    glow = np.exp(-d / 14)[..., None]; near = np.exp(-d / 60)[..., None]
    deep = np.array((38, 112, 136), np.float32); mid = np.array((52, 140, 160), np.float32); light = np.array((150, 214, 214), np.float32)
    col_o = deep + (mid - deep) * near
    col_o = col_o + (light - col_o) * glow * 0.85
    col_o = col_o * (0.97 + 0.06 * hs[..., None])
    rgb = np.where(land[..., None], col_l, col_o)
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

if __name__ == '__main__':
    regions = json.loads(sys.argv[1]) if len(sys.argv) > 1 else [
        ['mundo', 4, -180, -70, 180, 75],
        ['atlantico', 5, -80, -45, 35, 62],
        ['brasil', 7, -62, -36, -34, -8],
        ['europa', 7, 0, 45, 22, 58],
        ['sul', 9, -55.5, -32.5, -47.5, -25.3],
        ['es', 9, -42, -21, -39.8, -19.2],
    ]
    metas = [mosaic(*r) for r in regions]
    old = json.load(open(f'{OUT}/mosaicos.json')) if os.path.exists(f'{OUT}/mosaicos.json') else []
    keep = {m['name']: m for m in old}; keep.update({m['name']: m for m in metas})
    json.dump(list(keep.values()), open(f'{OUT}/mosaicos.json', 'w'), indent=1)
