import numpy as np, json, subprocess, sys
src, out, wjson, wout = sys.argv[1:5]
sr=44100
raw=subprocess.run(['ffmpeg','-loglevel','error','-i',src,'-ar',str(sr),'-ac','1','-f','f32le','-'],capture_output=True).stdout
a=np.frombuffer(raw,dtype=np.float32).copy()
hop=int(sr*0.01); n=len(a)//hop
rms=np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2)) for i in range(n)])
thr=max(0.006, np.percentile(rms,20)*1.8)
sil=rms<thr
# find silent runs
runs=[];i=0
while i<n:
    if sil[i]:
        j=i
        while j<n and sil[j]: j+=1
        runs.append((i,j)); i=j
    else: i+=1
keep_default=0.24
special=json.loads(sys.argv[5]) if len(sys.argv)>5 else {}
cuts=[]  # (start_sample, end_sample) to remove
for (i,j) in runs:
    dur=(j-i)*0.01
    t0=i*0.01
    keep=keep_default
    for k,v in special.items():
        if abs(t0-float(k))<0.8: keep=v
    if i==0: keep=0.05
    if dur>keep+0.04:
        half=keep/2
        cuts.append((int((t0+half)*sr), int((t0+dur-half)*sr)))
pieces=[];prev=0
for s,e in cuts: pieces.append(a[prev:s]); prev=e
pieces.append(a[prev:])
b=np.concatenate(pieces)
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','f32le','-ar',str(sr),'-ac','1','-i','-','-c:a','pcm_s16le',out],input=b.tobytes())
def remap(t):
    s=t*sr; removed=0
    for cs,ce in cuts:
        if s>=ce: removed+=ce-cs
        elif s>cs: removed+=s-cs
    return round((s-removed)/sr,3)
w=json.load(open(wjson))
for x in w: x['s']=remap(x['s']); x['e']=remap(x['e'])
json.dump(w,open(wout,'w'),ensure_ascii=False)
print('orig',len(a)/sr,'new',len(b)/sr,'cuts',len(cuts))
