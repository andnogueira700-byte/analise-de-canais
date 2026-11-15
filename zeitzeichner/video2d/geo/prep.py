import json,math
VIEWS={'europa':(-11,32,42,63),'osten':(12.5,51.2,27.5,57.2),'deutschland':(4,46.5,24,56.5)}
def merc(lat):return math.log(math.tan(math.pi/4+math.radians(lat)/2))
out={}
for y in (1880,1914,1920,1938):
    d=json.load(open(f'geo/world_{y}.geojson'))
    for vn,(x0,y0,x1,y1) in VIEWS.items():
        my0,my1=merc(y0),merc(y1);sx=1920/math.radians(x1-x0);sy=1080/(my1-my0);sc=min(sx,sy)*1.0
        cx=(x0+x1)/2;cy=(my0+my1)/2
        P=lambda lon,lat:(round(960+math.radians(lon-cx)*sc),round(540-(merc(max(min(lat,85),-85))-cy)*sc))
        feats=[]
        for f in d['features']:
            name=f['properties'].get('NAME') or ''
            g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
            rings=[]
            for poly in polys:
                for ring in poly:
                    if not any(x0-6<lo<x1+6 and y0-6<la<y1+6 for lo,la in ring):continue
                    pts=[];last=None
                    for lo,la in ring:
                        p=P(lo,la)
                        if last is None or abs(p[0]-last[0])+abs(p[1]-last[1])>=3:pts.append(p);last=p
                    if len(pts)>=3:rings.append([c for p in pts for c in p])
            if rings:feats.append([name,rings])
        out[f'{vn}_{y}']=feats
js='window.MAPS='+json.dumps(out,separators=(',',':'))+';'
open('maps.js','w').write(js);print(len(js)//1024,'KB',{k:len(v) for k,v in out.items()})
