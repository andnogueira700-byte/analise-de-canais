# baixa as imagens do Commons por thumb.php (upload.wikimedia.org dá 429 neste IP)
import urllib.parse, subprocess, time, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from assets import A
UA = 'MapaRaizResearch/0.1 (https://github.com/andnogueira700-byte/analise-de-canais; video research)'
D = os.path.dirname(os.path.abspath(__file__)) + '/fotos'
for k in A:
    if os.path.exists(f'{D}/{k}.jpg'): continue
    f = A[k][0].replace(' ', '_'); ok = False; r = ''
    for w in (2000, 1400, 900, 600, 400, 280):
        u = 'https://commons.wikimedia.org/w/thumb.php?' + urllib.parse.urlencode({'f': f, 'w': w})
        r = subprocess.run(['curl', '-s', '-A', UA, '-o', f'/tmp/claude-0/fil/{k}.raw', '-w', '%{http_code} %{content_type}', u], capture_output=True, text=True).stdout
        if r.startswith('200') and 'image' in r:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'/tmp/claude-0/fil/{k}.raw', '-q:v', '3', f'{D}/{k}.jpg']); ok = True; print('OK', k, w, flush=True); break
        time.sleep(2)
    if not ok: print('ERR', k, r, flush=True)
    time.sleep(3)
print('DONE', flush=True)
