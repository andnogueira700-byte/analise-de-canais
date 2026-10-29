// Lista os momentos que pedem efeito sonoro (câmera, destaques, ícones, cartões) e salva em eventos.json.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'index.html')); await p.waitForFunction(() => window.READY || window.ERR);
  const ev = await p.evaluate(() => {
    const E = [], S = SCENE, add = (t, k, g = 1) => { if (isFinite(t) && t >= 0) E.push([+t.toFixed(3), k, +g.toFixed(2)]); };
    // câmera: whoosh proporcional ao tamanho do movimento
    const ks = [...CAM].sort((a, b) => a.t - b.t);
    for (const k of ks) {
      if (k.d < 0.5) continue;
      const a = camera(k.t), z = camera(k.t + k.d), span = W / a.s;
      const move = Math.hypot(z.x - a.x, z.y - a.y) / span + Math.abs(Math.log(a.s / z.s));
      if (move > 0.25) add(k.t, 'whoosh', Math.min(1, 0.45 + move * 0.4));
    }
    for (const h of S.highlights) add(h.t0, 'rise', 0.8);
    for (const i of S.icons) add(i.t0, 'pop', 0.7);
    for (const r of S.rows) r.items.forEach((it, i) => add(it.at ?? (r.t0 + i * 0.35), 'pop', 0.6));
    for (const k of ['people', 'numbers', 'words', 'dots', 'lists', 'quotes', 'rows']) for (const c of S[k]) add(c.t0, 'card', 0.8);
    for (const k of ['pills']) for (const c of S[k]) add(c.t0, 'tick', 0.5);
    for (const c of S.chapters) add(c.t0, 'chapter', 1);
    for (const y of S.years) if (!y.hide) add(y.t, 'tick', 0.6);
    for (const pn of S.pins) if (!pn.hide) add(pn.t, 'drop', 0.8);
    for (const c of S.titles) add(c.t0, 'chapter', 1);
    return E.sort((a, b) => a[0] - b[0]);
  });
  fs.writeFileSync(path.join(__dirname, 'eventos.json'), JSON.stringify(ev)); console.log(ev.length, 'eventos');
  const cnt = {}; ev.forEach(e => cnt[e[1]] = (cnt[e[1]] || 0) + 1); console.log(cnt); await b.close();
})();
