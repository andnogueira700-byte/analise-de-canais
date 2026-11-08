import sys; sys.path.insert(0,'/tmp/alex/tools')
import aplan; from aplan import *
aplan.build()
def covered(t): return any(L['t0']<=t<L['t1'] and L['name'] not in ('cta',) for L in LAYERS)
inblk=lambda t:any(a-0.4<=t<=b+0.4 for a,b in BLK)
for s in SHOTS:
    if s.get('plain'):
        t=s['t']; gaps=[];g0=None
        while t<s['e']:
            c=covered(t) or inblk(t)
            if not c and g0 is None: g0=t
            if c and g0 is not None: gaps.append((g0,t)); g0=None
            t+=0.1
        if g0 is not None: gaps.append((g0,s['e']))
        for a,b in gaps:
            if b-a>0.25: print(f'VAZIO {a:7.2f}-{b:7.2f} ({b-a:.1f}s)')
# layers before shot change? text spanning cut fine. long single shots
for s in SHOTS:
    if s['e']-s['t']>9 and s['k'] in('v','p'): print(f"LONGO {s['k']} {s['t']:.1f} {s['e']-s['t']:.1f}s",s.get('src'),s.get('s0'),s.get('img','')[-20:] if s.get('img') else '')
