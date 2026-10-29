# Converte mapas (world-atlas 50m + estados do Brasil) para coordenadas Mercator simplificadas.
import json, math, sys
TOPO = '/tmp/claude-0/s/geo/package/countries-50m.json'
STATES = '../assets/geo/br-states.geojson'

def merc(lon, lat):
    lat = max(min(lat, 84), -80)
    return (lon, math.degrees(math.log(math.tan(math.pi/4 + math.radians(lat)/2))))

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts)-1)]
    while st:
        a, b = st.pop(); ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx-ax, by-ay; L = math.hypot(dx, dy) or 1e-12
        best, bi = -1, -1
        for i in range(a+1, b):
            px, py = pts[i]; d = abs(dy*px - dx*py + bx*ay - by*ax)/L
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; st += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def ring_out(ring, tol):
    pts = [merc(*p) for p in ring]; m = len(pts)//2
    pts = dp(pts[:m+1], tol) + dp(pts[m:], tol)[1:]
    if len(pts) < 4: return None
    return [v for p in pts for v in (round(p[0], 4), round(p[1], 4))]

t = json.load(open(TOPO)); sc, tr = t['transform']['scale'], t['transform']['translate']
arcs = []
for a in t['arcs']:
    x = y = 0; out = []
    for dx, dy in a:
        x += dx; y += dy; out.append((x*sc[0]+tr[0], y*sc[1]+tr[1]))
    arcs.append(out)
def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
def ring(idx):
    pts = []
    for i in idx:
        a = arc(i); pts += a if not pts else a[1:]
    return pts

def build(tolc, tols):
  countries = {}
  for g in t['objects']['countries']['geometries']:
    name = g['properties']['name']
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']] if g['type'] == 'Polygon' else []
    rings = []
    for poly in polys:
        o = ring_out(ring(poly[0]), tolc)  # ignora buracos
        if o: rings.append(o)
    if rings: countries[name] = countries.get(name, []) + rings
  states = {}
  for f in json.load(open(STATES))['features']:
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    states[f['properties']['sigla']] = [o for poly in polys for o in [ring_out(poly[0], tols)] if o]
  # contorno de terra (para o brilho da costa), do land-50m
  L = json.load(open(TOPO.replace('countries', 'land'))); global arcs
  land = []
  for g in L['objects']['land']['geometries']:
    for poly in (g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]):
      o = ring_out(ring2(L, poly[0]), tolc * 1.5)
      if o: land.append(o)
  return {'countries': countries, 'states': states, 'land': land}

def ring2(T, idx):
    sc, tr = T['transform']['scale'], T['transform']['translate']
    if '_arcs' not in T:
        T['_arcs'] = []
        for a in T['arcs']:
            x = y = 0; out = []
            for dx, dy in a: x += dx; y += dy; out.append((x*sc[0]+tr[0], y*sc[1]+tr[1]))
            T['_arcs'].append(out)
    pts = []
    for i in idx:
        a = T['_arcs'][i] if i >= 0 else T['_arcs'][~i][::-1]
        pts += a if not pts else a[1:]
    return pts

G = {'fine': build(0.02, 0.004), 'coarse': build(0.12, 0.03)}
json.dump(G, open('geo.json', 'w'), separators=(',', ':'))
for k, v in G.items(): print(k, sum(len(r) for c in v['countries'].values() for r in c)//2, sum(len(r) for c in v['states'].values() for r in c)//2, sum(len(r) for r in v['land'])//2)
