const { chromium } = require('playwright'); const fs = require('fs'); const { spawn } = require('child_process');
const FPS = 24, END = parseFloat(process.env.END || '1070.9');
const [wi, wn] = [parseInt(process.argv[2]), parseInt(process.argv[3])]; const only = process.argv.slice(4);
(async () => {
  const meta = JSON.parse(fs.readFileSync('scenes.json')); fs.mkdirSync('seg', { recursive: true });
  const fr = meta.map((m, i) => { const a = Math.round((i == 0 ? 0 : m.t0) * FPS), b = Math.round((i + 1 < meta.length ? meta[i + 1].t0 : END) * FPS); return [a, b]; });
  const tot = fr.reduce((s, [a, b]) => s + (b - a), 0); let acc = 0; const mine = [];
  meta.forEach((m, i) => { const w = Math.min(wn - 1, Math.floor(acc / (tot / wn))); acc += fr[i][1] - fr[i][0]; if (w === wi) mine.push(i); });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + __dirname + '/video.html'); await p.waitForFunction('window.READY===true', null, { timeout: 60000 });
  for (const i of mine) { const m = meta[i]; if (only.length && !only.includes(m.id)) continue; const n = fr[i][1] - fr[i][0];
    const fadeIn = i === 0 || meta[i - 1].ch !== m.ch;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', String(FPS), `seg/${m.id}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let k = 0; k < n; k++) { const d = await p.evaluate(([i, k, n, f]) => window.renderFrame(i, k, n, 24, f), [i, k, n, fadeIn]); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('w' + wi, m.id, n, 'frames'); }
  await b.close();
})();
