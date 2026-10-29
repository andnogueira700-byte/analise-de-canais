import json,sys,re,datetime
from hunt_num import num
A=json.load(open('about.json'));V=json.load(open(sys.argv[1]));pat=re.compile(sys.argv[2],re.I)
C={}
for v in V:
    if not pat.search(v['title']): continue
    C.setdefault(v['cid'],[]).append(v)
rows=[]
for cid,vs in C.items():
    a=A.get(cid) or {}
    rows.append((max(v['views'] for v in vs),a.get('handle'),a.get('joined'),a.get('subs'),a.get('vids'),len(vs),sorted(vs,key=lambda v:-v['views'])[0]))
rows.sort(key=lambda r:-r[0])
for r in rows[:int(sys.argv[3])]:
    b=r[6];print(f"{r[0]:>10,} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | n={r[5]} | {b['age']} | {b['len']} | {b['title'][:90]}")
print('total channels',len(rows))
