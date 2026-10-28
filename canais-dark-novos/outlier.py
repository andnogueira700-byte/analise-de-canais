import json,sys,re,statistics
from concurrent.futures import ThreadPoolExecutor
from yt import *
from hunt_num import num
def vnum(s):
    m=re.match(r'([\d.,]+)\s*([KMB]?)\s*(views?)?',s or '')
    if not m or not m.group(3): return None
    return num(m.group(1)+m.group(2))
def go(cid):
    try: d=init(get(f"https://www.youtube.com/channel/{cid}/videos?hl=en&gl=US"))
    except Exception as e: return cid,[]
    out=[]
    for l in find(d,'lockupViewModel',[]):
        t=[x.get('content') for x in find(l,'title',[]) if isinstance(x,dict) and 'content' in x]
        v=None;age=''
        for mp in find(l,'metadataParts',[]):
            for x in mp:
                c=x.get('text',{}).get('content') or ''; a=x.get('accessibilityLabel') or ''
                if 'view' in a: v=num(c)
                if 'ago' in c: age=c
        out.append(dict(t=t[0] if t else '?',v=v or 0,age=age))
    return cid,out
cids=json.load(open(sys.argv[1]))
with ThreadPoolExecutor(10) as ex: R=dict(ex.map(go,cids))
json.dump(R,open(sys.argv[2],'w'),ensure_ascii=False)
