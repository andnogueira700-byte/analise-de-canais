import json,subprocess,sys,re
r=sys.argv[1]; out=sys.argv[2]
def get(u): return subprocess.run(['curl','-s','-m','120',u],capture_output=True).stdout
d=json.loads(get(f'https://www.loc.gov/resource/{r}&fo=json'))
res=d['resource']; ft=res['fulltext_file'].replace('&full_text=1','')
iiif=res['image'].split('/full/')[0]
a=json.loads(get(ft)); k=list(a)[0]; a=a[k]
W=int(float(a['width']));H=int(float(a['height']))
json.dump({'W':W,'H':H,'iiif':iiif,'coords':a['coords']},open(out+'.coords.json','w'))
open(out+'.jpg','wb').write(get(iiif+'/full/pct:50/0/default.jpg'))
print(W,H,iiif)
