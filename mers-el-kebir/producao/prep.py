"""Prepara trechos dos vídeos baixados: corta as barras pretas, remove logos/marcas (delogo) e padroniza em 4:3 ou 16:9."""
import subprocess,re,os,json,sys
D='/tmp/mers/drive/'
F={'v0':'videoplayback.mp4','v1':'videoplayback (1).mp4','v4':'videoplayback (4).mp4','v5':'videoplayback (5).mp4','v8':'videoplayback (8).mp4','v9':'videoplayback (9).mp4','v10':'videoplayback (10).mp4','v11':'videoplayback (11).mp4','v12':'videoplayback (12).mp4','v14':'videoplayback (14).mp4','v15':'videoplayback (15).mp4','v16':'videoplayback (16).mp4','v19':'videoplayback (19).mp4','v6':'videoplayback (6).mp4'}
# logo: (x,y,w,h) em fração da área ativa da imagem; bottom: fração cortada embaixo; top: fração cortada em cima
CFG={'v0':dict(logo=(0.870,0.010,0.125,0.260)),'v1':dict(logo=(0.870,0.010,0.125,0.260)),'v8':dict(logo=(0.870,0.010,0.125,0.260)),'v14':dict(logo=(0.870,0.010,0.125,0.260)),
     'v9':dict(autocrop=1,trim=(0.0,0.20,0.14,0.0)),'v15':dict(autocrop=1,trim=(0.0,0.19,0.14,0.0)),'v19':dict(autocrop=1,trim=(0.0,0.19,0.14,0.0)),
     'v4':dict(autocrop=1,logo=(0.0,0.86,0.13,0.14)),'v10':dict(autocrop=1),'v11':dict(logo=(0.78,0.90,0.22,0.10)),'v12':dict(autocrop=1,bottom=0.19),'v5':dict(logo=(0.78,0.88,0.22,0.12)),'v16':dict(autocrop=1),'v6':dict(autocrop=1)}
_crop={}
def active(k):
    if k in _crop: return _crop[k]
    f=D+F[k]; box=None
    r=subprocess.run(['ffmpeg','-hide_banner','-ss','12','-i',f,'-t','6','-vf','cropdetect=24:2:0','-f','null','-'],capture_output=True,text=True).stderr
    m=re.findall(r'crop=(\d+):(\d+):(\d+):(\d+)',r)
    if m: box=tuple(map(int,m[-1]))
    _crop[k]=box; return box
def prep(k,ss,dur,name,out_ar='43'):
    out=f'/tmp/mers/prep/{name}.mp4'
    if os.path.exists(out) and os.path.getsize(out)>1000: return out
    f=D+F[k]; c=CFG.get(k,{})
    pr=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0:s=x',f],capture_output=True,text=True).stdout.strip().split('x'); W,H=int(pr[0]),int(pr[1])
    if c.get('autocrop'):
        b=active(k)
        if b: w,h,x,y=b
        else: w,h,x,y=W,H,0,0
    else: w,h,x,y=W,H,0,0
    w-=w%2;h-=h%2
    vf=[f'crop={w}:{h}:{x}:{y}']
    if c.get('trim'):
        l,t,r,b=c['trim']; nx=int(w*l); ny=int(h*t); nw=int(w*(1-l-r)); nh=int(h*(1-t-b)); nw-=nw%2; nh-=nh%2
        vf.append(f'crop={nw}:{nh}:{nx}:{ny}'); w,h=nw,nh
    if 'logo' in c:
        lx,ly,lw,lh=c['logo']; bx=max(1,int(lx*w)); by=max(1,int(ly*h)); bw=min(int(lw*w),w-bx-1); bh=min(int(lh*h),h-by-1)
        vf.append(f'delogo=x={bx}:y={by}:w={bw}:h={bh}')
    if c.get('bottom'):
        hh=int(h*(1-c['bottom'])); hh-=hh%2; vf.append(f'crop={w}:{hh}:0:0'); h=hh
    ar=w/h
    if out_ar=='43' and ar<1.5: vf.append('scale=960:720:flags=lanczos')
    elif ar>=1.5: vf.append('scale=1280:720:flags=lanczos')
    else: vf.append('scale=960:720:flags=lanczos')
    vf.append('unsharp=3:3:0.4'); 
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-t',str(dur),'-i',f,'-an','-vf',','.join(vf),'-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
if __name__=='__main__' and False:
    for k,ss,d in [('v0',60,3),('v1',16,3),('v8',54,3),('v14',90,3),('v9',20,3),('v15',22,3),('v19',12,3),('v4',90,3),('v12',160,3),('v11',60,3)]:
        print(k,prep(k,ss,d,f'test_{k}'),active(k))
