// Renderiza quadros de um projeto.
//  stills: node render.js still <pagina> <saida-dir> <tempos,separados,por,virgula> [w h]
//  vídeo : node render.js video <pagina> <saida.mp4> <t0> <t1> <fps> [w h]
const { chromium } = require('playwright'); const serve = require('./serve'); const fs = require('fs'); const { spawn } = require('child_process');
const FFMPEG = process.env.FFMPEG || (() => { try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; } })();
(async () => {
  const [, , mode, page, out, a, b, c, w = '1920', h = '1080'] = process.argv;
  const srv = await serve(require('path').resolve(__dirname, '../..'), 0); const port = srv.address().port;
  // GPU=1 usa a placa de vídeo do computador; sem isso (ou se a placa não responder), usa a CPU (SwiftShader), como na nuvem.
  const CPU_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  let br, gpu = false;
  if (process.env.GPU === '1') {
    try {
      br = await chromium.launch({ channel: 'chromium', args: ['--ignore-gpu-blocklist'] });
      const t = await br.newPage(); const gl = await t.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); if (!c) return ''; const e = c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl2'; }); await t.close();
      if (gl && !/swiftshader|llvmpipe|software/i.test(gl)) { gpu = true; console.log('[gpu]', gl); } else { await br.close(); br = null; console.log('[gpu] placa de vídeo não disponível, usando CPU'); }
    } catch (e) { if (br) await br.close(); br = null; console.log('[gpu] falhou (' + e.message.split('\n')[0] + '), usando CPU'); }
  }
  if (!br) br = await chromium.launch({ args: CPU_ARGS });
  const W = mode === 'still' ? (b || w) : w, H = mode === 'still' ? (c || h) : h;
  const pg = await br.newPage({ viewport: { width: +W, height: +H } });
  pg.on('console', m => { const t = m.text(); if (!t.includes('GPU stall') && !(gpu && t.includes('GL Driver'))) console.log('[page]', t); }); pg.on('pageerror', e => console.log('[err]', e.message)); pg.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) console.log('[404]', r.url()); });
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
    const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
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
