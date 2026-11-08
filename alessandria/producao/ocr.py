import sys,json,re,subprocess
r=sys.argv[1]; pat=sys.argv[2]
d=json.loads(subprocess.run(['curl','-s','-m','60',f'https://www.loc.gov/resource/{r}&fo=json'],capture_output=True,text=True).stdout)
u=d['resource']['fulltext_file']
t=json.loads(subprocess.run(['curl','-s','-m','60',u],capture_output=True,text=True).stdout)
s=list(t.values())[0]['full_text'].replace('\n',' ')
for m in re.finditer(pat,s,re.I): print('...',s[max(0,m.start()-350):m.start()+350],'\n')
