import json,re,sys,time,urllib.parse
from concurrent.futures import ThreadPoolExecutor
from yt import *
KEY="AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"
CTX={"client":{"clientName":"WEB","clientVersion":"2.20261028.01.00","hl":"es","gl":"MX"}}
def num(s):
    s=s.replace(',','').strip()
    m=re.match(r'([\d.]+)\s*([KMB]?)',s)
    if not m: return 0
    f={'':1,'K':1e3,'M':1e6,'B':1e9}[m.group(2)]
    return int(float(m.group(1))*f)
def vids(d):
    out=[]
    for v in find(d,'videoRenderer',[]):
        try: cid=v['ownerText']['runs'][0]['navigationEndpoint']['browseEndpoint']['browseId']
        except Exception: continue
        out.append(dict(id=v['videoId'],title=txt(v.get('title')),ch=txt(v.get('ownerText')),cid=cid,views=int(re.sub(r'\D','',txt(v.get('viewCountText'))) or 0),age=txt(v.get('publishedTimeText')),len=txt(v.get('lengthText'))))
    return out
def search(q,sp,pages=3):
    try:
        d=init(get("https://www.youtube.com/results?hl=es&gl=MX&sp="+urllib.parse.quote(sp)+"&search_query="+urllib.parse.quote(q)))
    except Exception as e: return []
    res=vids(d)
    for _ in range(pages-1):
        toks=[c['continuationCommand']['token'] for c in find(d,'continuationEndpoint',[]) if 'continuationCommand' in c]
        if not toks: break
        try:
            d=json.loads(get("https://www.youtube.com/youtubei/v1/search?key="+KEY,json.dumps({"context":CTX,"continuation":toks[-1]}).encode()))
        except Exception: break
        res+=vids(d)
    for r in res: r['q']=q
    return res
