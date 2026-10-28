import json,statistics,re
R=json.load(open('en_rows.json')); Vd=json.load(open('en_vids.json'))
out=[]
for r in R:
    vs=Vd.get(r['cid'],[])
    vals=[v['v'] for v in vs]
    best=max([r['views']]+vals)
    others=sorted(vals)
    if best in others: others.remove(best)
    med=statistics.median(others) if others else 0
    nonen=sum(1 for v in vs if re.search(r'[^\x00-ɏ -⯿\U0001F000-\U0001FFFF️]|ção|ñ|¿',v['t']))
    if vs and nonen>len(vs)/3: continue
    r.update(best=best,med=med,out=round(best/max(med,1)),nv=len(vs),top=[(v['t'][:70],v['v']) for v in sorted(vs,key=lambda v:-v['v'])[:4]])
    out.append(r)
out.sort(key=lambda r:-r['best']/r['s'])
json.dump(out,open('en_final.json','w'),ensure_ascii=False)
for r in out:
    print(f"{round(r['best']/r['s'])}x|med {int(r['med'])}|{r['h']}|{r['j'][:6]}|{r['subs'].split()[0]}|{r['n'].split()[0]}v|{r['c']}|{r['best']:,}|{r['t'][:80]}|2nd:{r['top'][1][1] if len(r['top'])>1 else 0} {r['top'][1][0][:50] if len(r['top'])>1 else ''}")
