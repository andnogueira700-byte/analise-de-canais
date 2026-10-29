import re
def num(s):
    s=s.replace(',','').strip()
    m=re.match(r'([\d.]+)\s*([KMB]?)',s)
    if not m: return 0
    f={'':1,'K':1e3,'M':1e6,'B':1e9}[m.group(2)]
    return int(float(m.group(1))*f)
