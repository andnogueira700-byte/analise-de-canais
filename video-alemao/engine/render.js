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
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.waitForFunction(() => window.READY || window.ERR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.ERR); if (err) { console.error(err); process.exit(1); }
  if (still) { // quadros soltos para conferência
    const fs = require('fs');
    for (const t of process.argv.slice(6)) {
      const b64 = await page.evaluate(t => { render(t); return cv.toDataURL('image/jpeg', 0.9).slice(23); }, parseFloat(t));
      fs.writeFileSync(path.join(out, `f_${String(parseFloat(t).toFixed(1)).padStart(6, '0')}.jpg`), Buffer.from(b64, 'base64'));
    }
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((t1 - t0) * fps); const start = Date.now();
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fps;
    const b64 = await page.evaluate(t => { render(t); return cv.toDataURL('image/jpeg', 0.93).slice(23); }, t);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.error(`${out}: ${i}/${n} (${((Date.now() - start) / 1000 / (i + 1) * 1000).toFixed(0)} ms/quadro)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
