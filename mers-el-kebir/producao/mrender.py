import sys; sys.path.insert(0,'/tmp/mers/tools')
import sys,os,subprocess,time
import mbuild, mplan
from dcore import *
import dcore
SH=mplan.shots; DUR=mplan.DUR
def frame(t):
    f=int(round(t*FPS)); im=build_frame(SH,t,f)
    for (a,b,fn) in dcore.LAYERS:
        if a-0.1<=t<=b+0.1: fn(t,im,None)
    if t<1.0: im=dimf(im,ease(t/1.0))
    if t>DUR-2.6: im=dimf(im,ease((DUR-t)/2.6))
    return im
def chunk(args):
    k,a,b,out=args
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
    for i in range(int(round(a*FPS)),int(round(b*FPS))):
        p.stdin.write(frame(min(i/FPS,DUR)).tobytes())
    p.stdin.close(); p.wait(); return out
if __name__=='__main__':
    mode=sys.argv[1]
    if mode=='check':
        prev=0; ok=True
        for s in SH:
            if abs(s.t0-prev)>1e-6: print('GAP/OVERLAP',prev,'->',s.t0); ok=False
            prev=s.t1
        print('fim',round(prev,2),'DUR',round(DUR,2),'ok' if ok else 'PROBLEMAS',len(SH),'shots',len(dcore.LAYERS),'camadas')
    elif mode=='stills':
        os.makedirs('/tmp/mers/build',exist_ok=True)
        for t in [mplan.tm(x) if ':' in x else float(x) for x in sys.argv[2:]]: frame(t).save(f'/tmp/mers/build/f_{t:07.2f}.png'); print('ok',round(t,2))
    elif mode=='chunks':
        import multiprocessing as mp
        step=float(sys.argv[2]); tag_=sys.argv[3]; ks=[int(x) for x in sys.argv[4:]]
        jobs=[(k,k*step,min((k+1)*step,DUR+0.1),f'/tmp/mers/build/{tag_}_{k:03d}.mp4') for k in ks]
        with mp.Pool(3) as pool:
            for r in pool.imap_unordered(chunk,jobs): print('done',r,flush=True)
        print('RENDER DONE',flush=True)
