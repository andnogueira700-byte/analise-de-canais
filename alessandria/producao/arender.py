import sys; sys.path.insert(0,'/tmp/alex/tools')
import aplan
from aplan import *
from multiprocessing import Pool
aplan.build()
def prep_all():
    vs=[s for s in SHOTS if s['k']=='v']
    with Pool(4) as p: p.map(prep_clip,vs)
def still(t,out):
    s=next(x for x in SHOTS if x['t']<=t<x['e']); f=int(t*FPS)
    tmp=f'/tmp/alex/build/_still_{f}.mp4'; render_chunk(f,f+1,tmp)
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-frames:v','1',out]); os.remove(tmp)
CH=45.0
def chunk(i):
    f0=int(i*CH*FPS); f1=min(int((i+1)*CH*FPS),int(DUR*FPS)); out=f'/tmp/alex/build/ch_{i:03d}.mp4'
    if os.path.exists(out+'.ok'): return
    render_chunk(f0,f1,out); open(out+'.ok','w').write('1'); print('chunk',i,'ok',flush=True)
if __name__=='__main__':
    m=sys.argv[1]
    if m=='prep': prep_all(); print('prep ok')
    elif m=='stills':
        ts=[float(x) for x in sys.argv[2:]]
        with Pool(4) as p: p.starmap(still,[(t,f'/tmp/alex/build/st_{t:07.2f}.png') for t in ts])
    elif m=='chunks':
        n=int(math.ceil(DUR/CH)); idx=[int(x) for x in sys.argv[2:]] or list(range(n))
        with Pool(4) as p: p.map(chunk,idx,chunksize=1)
