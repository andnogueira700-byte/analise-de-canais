import os, sys, html, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from assets import A, PX
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blocks.py')).read())

OUT = sys.argv[1]
TH = os.path.join(os.path.dirname(OUT), 'th')
TOTAL = 15*60+14

def sec(t):
    m, s = t.split(':'); return int(m)*60+int(s)

TYPES = {
 "MAPA": ("Mapa 3D", "t-mapa"),
 "TIMELINE": ("Linha do tempo", "t-time"),
 "MOTION": ("Motion graphic", "t-motion"),
 "PINTURA": ("Pintura de época", "t-real"),
 "RETRATO": ("Retrato", "t-real"),
 "FOTO": ("Foto real", "t-real"),
 "VIDEO": ("Vídeo real", "t-video"),
}
e = html.escape

def commons(t):
    return "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(t.replace(' ', '_'))

# fita do vídeo (proporção por tipo)
segs = []
dur = {}
for b in B:
    a, z = sec(b[0]), sec(b[1])
    segs.append((a, z, b[2]))
    grp = {"PINTURA":"REAL","RETRATO":"REAL","FOTO":"REAL"}.get(b[2], b[2])
    dur[grp] = dur.get(grp, 0) + (z - a)
tot = sum(dur.values())
pct = {k: round(100*v/tot) for k, v in dur.items()}

have = {k for k in A if os.path.exists(os.path.join(TH, k + '.jpg'))}

def asset_html(k):
    if k in PX:
        pid, f, art, desc = PX[k]
        img = (f'<img src="th/{k}.jpg" alt="{e(desc)}" loading="lazy">' if os.path.exists(os.path.join(TH, k + '.jpg'))
               else f'<div class="ph"><span>vídeo</span></div>')
        return (f'<figure class="asset is-video is-px">{img}<figcaption><a href="https://pixabay.com/videos/id-{pid}/" target="_blank" rel="noopener">{e(desc)}</a>'
                f'<span class="lic">Pixabay · {e(art)} · {e(f)}</span></figcaption></figure>')
    t, lic, art, tipo = A[k]
    img = (f'<img src="th/{k}.jpg" alt="{e(t)}" loading="lazy">' if k in have
           else f'<div class="ph"><span>{e(tipo)}</span><small>miniatura ainda baixando</small></div>')
    vid = ' is-video' if t.endswith(('.webm', '.ogv')) else ''
    return (f'<figure class="asset{vid}">{img}<figcaption><a href="{commons(t)}" target="_blank" rel="noopener">{e(t.rsplit(".",1)[0][:70])}</a>'
            f'<span class="lic">{e(lic)} · {e(art)}</span></figcaption></figure>')

cards = []
for i, b in enumerate(B):
    a, z, typ, quote, beats, keys = b
    label, cls = TYPES[typ]
    n = sec(z) - sec(a)
    cuts = max(1, round(n/2.5))
    beats_html = ''.join(f'<li>{e(x)}</li>' for x in beats)
    assets = ''.join(asset_html(k) for k in keys)
    cards.append(f'''<article class="scene {cls}" id="c{i+1}">
  <div class="tc"><span class="num">{i+1:02d}</span><span class="time">{a}–{z}</span><span class="cuts">{n}s · ~{cuts} cortes</span></div>
  <div class="body">
    <span class="chip {cls}">{label}</span>
    <blockquote>“{e(quote)}”</blockquote>
    <ul class="beats">{beats_html}</ul>
    {f'<div class="assets">{assets}</div>' if assets else ''}
  </div>
</article>''')

strip = ''.join(
    f'<a class="seg {TYPES[t][1]}" href="#c{i+1}" style="left:{100*a/TOTAL:.2f}%;width:{100*(z-a)/TOTAL:.2f}%" title="{B[i][0]} {TYPES[t][0]}"></a>'
    for i, (a, z, t) in enumerate(segs))

n_real = len(A) + len(PX)

page = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read()
page = (page.replace('{{STRIP}}', strip).replace('{{CARDS}}', '\n'.join(cards))
        .replace('{{NBLOCOS}}', str(len(B))).replace('{{NREAL}}', str(n_real)).replace('{{NHAVE}}', str(len(have)))
        .replace('{{P_MAPA}}', str(pct.get('MAPA', 0))).replace('{{P_REAL}}', str(pct.get('REAL', 0)))
        .replace('{{P_VIDEO}}', str(pct.get('VIDEO', 0))).replace('{{P_MOTION}}', str(pct.get('MOTION', 0)))
        .replace('{{P_TIME}}', str(pct.get('TIMELINE', 0))))
open(OUT, 'w').write(page)
print('ok', len(B), 'blocos', len(have), 'thumbs', pct)
