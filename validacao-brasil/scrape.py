import json,re,sys,urllib.parse,urllib.request,time
def get(url):
    r=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0","Accept-Language":"en"})
    return urllib.request.urlopen(r,timeout=20).read().decode()
def walk(o,out):
    if isinstance(o,dict):
        if 'videoRenderer' in o: out.append(o['videoRenderer'])
        for v in o.values(): walk(v,out)
    elif isinstance(o,list):
        for v in o: walk(v,out)
def txt(x):
    if not x: return ''
    return x.get('simpleText') or ''.join(r.get('text','') for r in x.get('runs',[]))
def search(q):
    h=get("https://www.youtube.com/results?hl=en&gl=BR&search_query="+urllib.parse.quote(q))
    m=re.search(r'var ytInitialData = (\{.*?\});</script>',h)
    d=json.loads(m.group(1)); out=[]; walk(d,out)
    res=[]
    for v in out:
        vc=txt(v.get('viewCountText'))
        n=re.sub(r'[^\d]','',vc) ; n=int(n) if n else 0
        res.append(dict(id=v['videoId'],title=txt(v.get('title')),ch=txt(v.get('ownerText')),views=n,age=txt(v.get('publishedTimeText')),len=txt(v.get('lengthText'))))
    return res
def suggest(q):
    return json.loads(get("https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=pt&gl=BR&q="+urllib.parse.quote(q)))[1]
themes=json.load(open(sys.argv[1]))
R={}
for k,t in themes.items():
    R[k]={'search':{},'suggest':{}}
    for q in t['q']:
        R[k]['search'][q]=search(q); time.sleep(1)
    for s in t['s']:
        R[k]['suggest'][s]=suggest(s); time.sleep(0.5)
json.dump(R,open('out.json','w'),ensure_ascii=False,indent=1)
