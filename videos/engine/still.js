// Renderiza imagens de teste: node still.js <url-relativa> <saida-dir> <chamadas JSON>
const { chromium } = require('playwright'); const serve = require('./serve'); const fs = require('fs');
(async () => {
  const [, , page, outDir, callsJson, w = '1920', h = '1080'] = process.argv;
  const srv = await serve(require('path').resolve(__dirname, '../..'), 8770 + Math.floor(Math.random() * 100));
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(`http://localhost:${port}/${page}${page.includes('?') ? '&' : '?'}w=${w}&h=${h}`);
  await p.waitForFunction('window.ready', null, { timeout: 600000 });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, ...args] of JSON.parse(callsJson)) {
    const r = await p.evaluate(([n, a]) => window.renderAt(n, ...a), [name, args]);
    const f = `${outDir}/${name}_${args.join('_')}.jpg`;
    fs.writeFileSync(f, Buffer.from(r.url.split(',')[1], 'base64')); console.log(f, Math.round(r.ms) + 'ms');
  }
  await b.close(); srv.close();
})();
