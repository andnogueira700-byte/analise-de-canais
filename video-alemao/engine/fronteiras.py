# Gera só as fronteiras terrestres (sem a linha da costa), para desenhar por cima do mapa de relevo.
import json, math
from geo import merc, dp, TOPO, STATES

def line_out(pts, tol):
    pts = dp([merc(*p) for p in pts], tol)
    return [v for p in pts for v in (round(p[0], 4), round(p[1], 4))] if len(pts) > 1 else None

out = {}
# países: arcos usados por dois países são fronteira terrestre
t = json.load(open(TOPO)); sc, tr = t['transform']['scale'], t['transform']['translate']
use = {}
for g in t['objects']['countries']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']] if g['type'] == 'Polygon' else []
    for poly in polys:
        for r in poly:
            for i in r: use[i if i >= 0 else ~i] = use.get(i if i >= 0 else ~i, 0) + 1
for lod, tol in (('fine', 0.004), ('coarse', 0.08)):
    lines = []
    for i, a in enumerate(t['arcs']):
        if use.get(i, 0) < 2: continue
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
        o = line_out(pts, tol)
        if o: lines.append(o)
    out['paises_' + lod] = lines

# estados: segmentos que aparecem em dois estados são divisa
feats = json.load(open(STATES))['features']
key = lambda p: (round(p[0], 5), round(p[1], 5))
cnt = {}
rings = []
for f in feats:
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        r = poly[0]; rings.append(r)
        for a, b in zip(r, r[1:]):
            e = tuple(sorted((key(a), key(b)))); cnt[e] = cnt.get(e, 0) + 1
for lod, tol in (('fine', 0.002), ('coarse', 0.02)):
    lines = []
    for r in rings:
        cur = []
        for a, b in zip(r, r[1:]):
            if cnt[tuple(sorted((key(a), key(b))))] >= 2:
                if not cur: cur = [a]
                cur.append(b)
            elif cur:
                o = line_out(cur, tol); cur = []
                if o: lines.append(o)
        if cur:
            o = line_out(cur, tol)
            if o: lines.append(o)
    out['estados_' + lod] = lines
open('fronteiras.js', 'w').write('const BORDERS=' + json.dumps(out, separators=(',', ':')) + ';')
print({k: len(v) for k, v in out.items()})
