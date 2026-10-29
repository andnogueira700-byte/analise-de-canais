import json,sys,re
from concurrent.futures import ThreadPoolExecutor
from huntlib import search
from yt import get
qs=[l.strip() for l in open(sys.argv[1]) if l.strip()]
SPS=["EgIQAQ%3D%3D".replace('%3D','='),"EgQIBRAB","CAMSAhAB"]  # relevance video, this year, view count all-time
jobs=[(q,sp) for q in qs for sp in SPS]
with ThreadPoolExecutor(8) as ex: R=list(ex.map(lambda j:[dict(v,sp=j[1]) for v in search(j[0],j[1],pages=2)],jobs))
V={}
for r in R:
    for v in r:
        V.setdefault(v['id'],v)
cache=json.load(open('about.json'))
cids={v['cid'] for v in V.values()}
def about(cid):
    try: h=get(f"https://www.youtube.com/channel/{cid}/about?hl=en")
    except Exception: return cid,None
    g=lambda p:(re.search(p,h) or [None,None])[1]
    return cid,dict(subs=g(r'"subscriberCountText":"([^"]+)"'),joined=g(r'"joinedDateText":\{"content":"Joined ([^"]+)"'),vids=g(r'"videoCountText":"([^"]+)"'),country=g(r'"country":"([^"]+)"'),handle=g(r'"canonicalChannelUrl":"http://www.youtube.com/([^"]+)"'),total=g(r'"viewCountText":"([\d,]+) views"'))
todo=[c for c in cids if c not in cache]
with ThreadPoolExecutor(10) as ex:
    for c,a in ex.map(about,todo): cache[c]=a
json.dump(cache,open('about.json','w'))
json.dump(list(V.values()),open(sys.argv[2],'w'),ensure_ascii=False)
print(len(V),'videos',len(cids),'channels')
