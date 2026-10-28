import json,sys,re,datetime
from concurrent.futures import ThreadPoolExecutor
from yt import *
from hunt_num import num
V=json.load(open(sys.argv[1]))
cache={}
try: cache=json.load(open('about.json'))
except Exception: pass
cand={}
for v in V:
    if v['views']>=36000: cand.setdefault(v['cid'],[]).append(v)
todo=[c for c in cand if c not in cache]
print(len(cand),'candidate channels,',len(todo),'to fetch')
def about(cid):
    try: h=get(f"https://www.youtube.com/channel/{cid}/about?hl=en")
    except Exception as e: return cid,None
    g=lambda p:(re.search(p,h) or [None,None])[1]
    return cid,dict(subs=g(r'"subscriberCountText":"([^"]+)"'),joined=g(r'"joinedDateText":\{"content":"Joined ([^"]+)"'),vids=g(r'"videoCountText":"([^"]+)"'),country=g(r'"country":"([^"]+)"'),handle=g(r'"canonicalChannelUrl":"http://www.youtube.com/([^"]+)"'),total=g(r'"viewCountText":"([\d,]+) views"'))
with ThreadPoolExecutor(10) as ex:
    for cid,a in ex.map(about,todo): cache[cid]=a
json.dump(cache,open('about.json','w'))
cut=datetime.datetime(2026,8,15)
hits=[]
for cid,vs in cand.items():
    a=cache.get(cid)
    if not a or not a['joined'] or not a['subs']: continue
    j=datetime.datetime.strptime(a['joined'],'%b %d, %Y')
    s=num(a['subs'].split(' ')[0])
    if j<cut or not (900<=s<=7000): continue
    best=max(vs,key=lambda v:v['views'])
    hits.append((best['views']/max(s,1),a,best,s,j))
for r,a,b,s,j in sorted(hits,key=lambda x:-x[0]):
    print(f"{r:6.0f}x | {a['handle']} | {a['joined']} | {a['subs']} | {a['vids']} | {a['country']} | {b['views']:,} | {b['age']} | {b['len']} | {b['title'][:80]} | {b['id']}")
