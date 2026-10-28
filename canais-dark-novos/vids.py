import json,sys,re
from concurrent.futures import ThreadPoolExecutor
from yt import *
rows={r['h']:r for r in json.load(open('final.json'))}
hs=sys.argv[1].split(',')
def go(h):
    r=rows[h]
    try: d=init(get(f"https://www.youtube.com/channel/{r['cid']}/videos?hl=pt-BR&gl=BR"))
    except Exception as e: return h,str(e)
    out=[]
    for l in find(d,'lockupViewModel',[]):
        t=find(l,'title',[]); t=[x.get('content') for x in t if isinstance(x,dict) and 'content' in x]
        meta=[x.get('text',{}).get('content') for x in find(l,'metadataParts',[])[0]] if find(l,'metadataParts',[]) else []
        out.append((t[0] if t else '?', ' / '.join(m for m in meta if m)))
    desc=(re.search(r'"description":"(.{0,200})',json.dumps(find(d,'pageHeaderViewModel',[])[:1],ensure_ascii=False)) or [None,''])[1]
    return h,out[:int(sys.argv[2]) if len(sys.argv)>2 else 8]
with ThreadPoolExecutor(8) as ex:
    for h,o in ex.map(go,hs):
        print('##',h,rows[h]['subs'],rows[h]['j'])
        for x in (o if isinstance(o,list) else [o]): print('   ',x)
