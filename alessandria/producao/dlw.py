import subprocess,urllib.parse,time,json,os,sys
from PIL import Image
UA='LogicaDiGuerra/1.0 (documentary research)'
L=json.load(open(sys.argv[1])); MF='/tmp/alex/img/meta.json'
meta=json.load(open(MF)) if os.path.exists(MF) else {}
def valid(p):
    try: Image.open(p).verify(); return True
    except Exception: return False
for pas in range(6):
 left=0
 for k,path in L.items():
     out=f'/tmp/alex/img/{k}.jpg'
     if os.path.exists(out) and valid(out): continue
     wiki,rest=path.split('/',1); url=f'https://upload.wikimedia.org/wikipedia/{wiki}/{rest}'
     tmp=out+'.part'
     r=subprocess.run(['curl','-s','-L','-A',UA,'-o',tmp,'-w','%{http_code}',url],capture_output=True,text=True)
     if r.stdout=='200' and valid(tmp):
         im=Image.open(tmp).convert('RGB'); im.thumbnail((2000,2000)); im.save(out,quality=90); os.remove(tmp)
         fn=urllib.parse.unquote(rest.split('/')[-1])
         meta[k]={'name':fn,'page':('https://commons.wikimedia.org/wiki/File:' if wiki=='commons' else f'https://{wiki}.wikipedia.org/wiki/File:')+rest.split('/')[-1]}
         json.dump(meta,open(MF,'w'),ensure_ascii=False,indent=1); print(k,'ok',flush=True)
     else:
         left+=1; print(k,'FAIL',r.stdout,flush=True); time.sleep(10)
     time.sleep(4)
 if not left: break
 time.sleep(60)
