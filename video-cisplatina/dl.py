import hashlib,urllib.parse,urllib.request,time,os,sys,subprocess
sys.path.insert(0,'.')
from assets import A
UA='MapaRaizResearch/0.1 (https://github.com/andnogueira700-byte/analise-de-canais; video research)'
def thumb(t):
    f=t.replace(' ','_'); h=hashlib.md5(f.encode()).hexdigest(); q=urllib.parse.quote(f)
    base=f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/'
    ext=f.rsplit('.',1)[1].lower()
    if ext in('tif','tiff'): return base+f'lossy-page1-500px-{q}.jpg'
    if ext=='svg': return base+f'500px-{q}.png'
    if ext in('webm','ogv'): return base+f'500px--{q}.jpg'
    return base+f'500px-{q}'
os.makedirs('th',exist_ok=True)
pending=[k for k in A if not os.path.exists(f'th/{k}.jpg')]
wait=20
while pending:
    k=pending[0]; u=thumb(A[k][0])
    try:
        d=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA}),timeout=60).read()
        open(f'th/{k}.raw','wb').write(d)
        subprocess.run(['ffmpeg','-v','error','-y','-i',f'th/{k}.raw','-vf','scale=480:-2','-q:v','4',f'th/{k}.jpg'])
        os.remove(f'th/{k}.raw'); print('OK',k,flush=True); pending.pop(0); wait=15
    except urllib.error.HTTPError as e:
        print('ERR',k,e.code,flush=True)
        if e.code==404: pending.pop(0)
        else: wait=12
    except Exception as e:
        print('ERR',k,e,flush=True); wait=12
    time.sleep(wait)
print('DONE',flush=True)
