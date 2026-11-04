const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const mode = process.argv[2]; const out = process.argv[3];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => { console.error('PAGEERR', e.message); }); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('file://' + path.join(__dirname, 'src/index.html')); await p.waitForFunction('window.READY===true', null, { timeout: 30000 });
  if (mode !== 'events') fs.mkdirSync(out, { recursive: true });
  const grab = async (t) => p.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
  if (mode === 'stills') { for (const s of process.argv.slice(4)) { const t = parseFloat(s); fs.writeFileSync(path.join(out, 's_' + s.padStart(6, '0') + '.jpg'), Buffer.from(await grab(t), 'base64')); } }
  else if (mode === 'events') { fs.writeFileSync(out, JSON.stringify(await p.evaluate('window.getEvents()'))); }
  else { const total = await p.evaluate('window.TOTAL'); const n = Math.ceil(total * 30); const a = +(process.argv[4] || 0), z = +(process.argv[5] || n);
    for (let i = a; i < Math.min(n, z); i++) { fs.writeFileSync(path.join(out, 'f_' + String(i).padStart(5, '0') + '.jpg'), Buffer.from(await grab(i / 30), 'base64')); if (i % 150 === 0) console.log('frame', i, '/', n); } }
  await b.close();
})();
