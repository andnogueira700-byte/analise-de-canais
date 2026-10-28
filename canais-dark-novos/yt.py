import json,re,urllib.parse,urllib.request
def get(url,data=None):
    r=urllib.request.Request(url,data=data,headers={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36","Accept-Language":"en","Content-Type":"application/json"})
    return urllib.request.urlopen(r,timeout=25).read().decode()
def init(h):
    m=re.search(r'var ytInitialData = (\{.*?\});</script>',h); return json.loads(m.group(1))
def find(o,key,out):
    if isinstance(o,dict):
        if key in o: out.append(o[key])
        for v in o.values(): find(v,key,out)
    elif isinstance(o,list):
        for v in o: find(v,key,out)
    return out
def txt(x):
    if not x: return ''
    return x.get('simpleText') or ''.join(r.get('text','') for r in x.get('runs',[]))
