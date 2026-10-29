// Varre o vídeo e lista os instantes em que dois elementos de tipos diferentes se sobrepõem na tela.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'index.html') + '?estilo=' + (process.env.ESTILO || 'b') + '&marcas=' + (process.env.MARCAS ?? 1) + '&tilt=' + (process.env.TILT || 0) + (process.env.V ? '&v=' + process.env.V : ''));
  await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 600000 });
  const out = await p.evaluate(([t0, t1, dt]) => {
    const res = [];
    for (let t = t0; t < t1; t += dt) {
      render(t); const B = BOXES;
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const a = B[i], c = B[j]; if (!a.k || !c.k || a.k === c.k) continue;
        const ox = Math.min(a[2], c[2]) - Math.max(a[0], c[0]), oy = Math.min(a[3], c[3]) - Math.max(a[1], c[1]);
        if (ox > 6 && oy > 6) res.push(`${t.toFixed(1)}s ${a.k} x ${c.k} (${Math.round(ox)}x${Math.round(oy)})`);
      }
    }
    return res;
  }, [+(process.argv[2] || 0), +(process.argv[3] || 848), +(process.argv[4] || 0.5)]);
  console.log(out.join('\n') || 'nenhuma sobreposição'); await b.close();
})();
