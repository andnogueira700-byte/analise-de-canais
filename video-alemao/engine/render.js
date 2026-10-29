// Renderiza um trecho do vídeo: node render.js <inicio_s> <fim_s> <saida.mp4> [fps] [frames.jpg para prévia]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [t0, t1] = [parseFloat(process.argv[2]), parseFloat(process.argv[3])];
  const out = process.argv[4], fps = parseFloat(process.argv[5] || 30), still = process.argv[6];
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.error('[page]', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'index.html') + '?tilt=' + (process.env.TILT || 0) + '&estilo=' + (process.env.ESTILO || 'a') + '&marcas=' + (process.env.MARCAS || 0) + (process.env.V ? '&v=' + process.env.V : ''));
  await page.waitForFunction(() => window.READY || window.ERR, null, { timeout: 600000 });
  const err = await page.evaluate(() => window.ERR); if (err) { console.error(err); process.exit(1); }
  if (still) { // quadros soltos para conferência
    const fs = require('fs');
    // cada quadro pode ser um tempo (12.5) ou uma frase da legenda com deslocamento ("no brasil o alemao@+2")
    for (const [i, arg] of process.argv.slice(6).entries()) {
      const t = isNaN(+arg) ? await page.evaluate(([p, d]) => at(p) + (+d || 0), arg.split('@')) : +arg;
      await page.evaluate(t => render(t), t);
      const name = process.env.PREFIX ? `${process.env.PREFIX}${String(i + 1).padStart(2, '0')}` : `f_${String(t.toFixed(1)).padStart(6, '0')}`;
      fs.writeFileSync(path.join(out, name + '.jpg'), await page.screenshot({ type: 'jpeg', quality: 92 }));
    }
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((t1 - t0) * fps); const start = Date.now();
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fps;
    await page.evaluate(t => render(t), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.error(`${out}: ${i}/${n} (${((Date.now() - start) / 1000 / (i + 1) * 1000).toFixed(0)} ms/quadro)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
