// Renderiza quadros de um projeto.
//  stills: node render.js still <pagina> <saida-dir> <tempos,separados,por,virgula> [w h]
//  vídeo : node render.js video <pagina> <saida.mp4> <t0> <t1> <fps> [w h]
const { chromium } = require('playwright'); const serve = require('./serve'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const [, , mode, page, out, a, b, c, w = '1920', h = '1080'] = process.argv;
  const srv = await serve('/home/user/analise-de-canais', 0); const port = srv.address().port;
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const W = mode === 'still' ? (c || w) : w, H = mode === 'still' ? (c ? (process.argv[7] || h) : h) : h;
  const pg = await br.newPage({ viewport: { width: +W, height: +H } });
  pg.on('console', m => { const t = m.text(); if (!t.includes('GPU stall')) console.log('[page]', t); }); pg.on('pageerror', e => console.log('[err]', e.message));
  await pg.goto(`http://localhost:${port}/${page}?w=${W}&h=${H}`);
  await pg.waitForFunction('window.ready', null, { timeout: 600000 });
  if (mode === 'meta') { fs.writeFileSync(out, JSON.stringify({ cues: await pg.evaluate('window.CUES'), end: await pg.evaluate('window.END'), shots: await pg.evaluate('window.SHOTS') }, null, 1)); }
  if (mode === 'still') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of a.split(',').map(Number)) {
      const t0 = Date.now(); const url = await pg.evaluate((T) => window.renderAt(T), t);
      const f = `${out}/t${t.toFixed(2).padStart(7, '0')}.jpg`; fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); console.log(f, Date.now() - t0, 'ms');
    }
  }
  if (mode === 'video') {
    const t0 = +a, t1 = +b, fps = +c;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n0 = Math.round(t0 * fps), n1 = Math.round(t1 * fps); const start = Date.now();
    for (let n = n0; n < n1; n++) {
      const url = await pg.evaluate((T) => window.renderAt(T), (n + 0.5) / fps);
      const buf = Buffer.from(url.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((n - n0) % 24 === 0) console.log(`${out}: ${n - n0}/${n1 - n0} (${((Date.now() - start) / (n - n0 + 1) / 1000).toFixed(2)} s/q)`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await br.close(); srv.close();
})();
