// Mede o custo de cada etapa do quadro.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', ...(process.env.FLAGS || '').split(' ').filter(Boolean)] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'index.html')); await p.waitForFunction(() => window.READY || window.ERR);
  const r = await p.evaluate((ts) => {
    const out = {};
    for (const t of ts) {
      const cam = camera(t); let a = performance.now();
      for (let i = 0; i < 1; i++) {render(t); cv.toDataURL("image/jpeg",0.93);}; const m = (performance.now() - a) / 3;
      a = performance.now(); for (let i = 0; i < 3; i++) render(t); const rr = (performance.now() - a) / 3;
      a = performance.now(); for (let i = 0; i < 3; i++) cv.toDataURL('image/jpeg', 0.93); const j = (performance.now() - a) / 3;
      out[t] = [m, rr, j].map(v => v.toFixed(0)).join(' / ');
    }
    return out;
  }, (process.argv[2] || '2,20,50,68,75').split(',').map(Number));
  console.log('mapa / quadro / jpeg (ms)', r); await b.close();
})();
