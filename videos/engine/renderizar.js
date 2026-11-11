// Renderiza um projeto inteiro com um comando: cenas em paralelo, trilha sonora e montagem final.
//   node renderizar.js <pasta-do-projeto> [--cpu] [--partes N] [--fps 30] [--ate SEGUNDOS]
//   ex.: node renderizar.js ../01-pitbull-t-rex/piloto
// A pasta do projeto precisa ter src/index.html e narracion_ritmo.wav.
// Por padrão usa a placa de vídeo (GPU). --cpu força o modo da nuvem, bem mais lento.
const path = require('path'), fs = require('fs'), os = require('os'); const { spawn, spawnSync } = require('child_process');
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const proj = path.resolve(args.find(a => !a.startsWith('--') && !/^[\d.]+$/.test(a)) || '../01-pitbull-t-rex/piloto');
const root = path.resolve(__dirname, '../..');
const cpu = args.includes('--cpu'); const fps = +opt('--fps', 30);
const partes = +opt('--partes', cpu ? Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2))) : 2);
let FFMPEG = process.env.FFMPEG; if (!FFMPEG) { try { FFMPEG = require('ffmpeg-static'); } catch { FFMPEG = 'ffmpeg'; } }
const env = { ...process.env, FFMPEG, GPU: cpu ? '0' : '1' };
const page = path.relative(root, path.join(proj, 'src/index.html')).split(path.sep).join('/');
const out = path.join(proj, 'render'); fs.mkdirSync(out, { recursive: true });
const nome = path.basename(path.dirname(proj)) + '_' + path.basename(proj);
const final = path.join(proj, nome + '.mp4');
const prog = {}; let tIni = 0;
function status() {
  const ks = Object.keys(prog); if (!ks.length) return; let f = 0, n = 0; ks.forEach(k => { f += prog[k][0]; n += prog[k][1]; });
  const pct = f / n, el = (Date.now() - tIni) / 60000, rest = pct > 0.02 ? el / pct - el : NaN;
  process.stdout.write(`\r  ${ks.map(k => `${k}: ${Math.round(prog[k][0] / prog[k][1] * 100)}%`).join('  ')}   total ${Math.round(pct * 100)}%   ${isNaN(rest) ? 'calculando tempo...' : `faltam ~${Math.ceil(rest)} min`}     `);
}
const run = (cmd, a, tag) => new Promise((res, rej) => {
  const p = spawn(cmd, a, { env, cwd: __dirname });
  const log = fs.createWriteStream(path.join(out, `log_${tag}.txt`));
  p.stdout.on('data', d => { log.write(d); const m = [...d.toString().matchAll(/(\d+)\/(\d+) \(/g)].pop(); if (m) prog[tag] = [+m[1], +m[2]]; });
  p.stderr.on('data', d => { log.write(d); process.stderr.write(`\n[${tag}] ${d}`); });
  p.on('close', c => (c === 0 ? res() : rej(new Error(`${tag} terminou com erro ${c}; veja ${path.join(out, `log_${tag}.txt`)}`))));
});
(async () => {
  const t0 = Date.now(); const min = () => ((Date.now() - t0) / 60000).toFixed(1) + ' min';
  console.log(`Projeto: ${proj}\nModo: ${cpu ? 'CPU' : 'placa de vídeo (GPU)'}, ${partes} partes em paralelo, ${fps} fps\n`);
  // 1. cenas e tempos
  const metaF = path.join(out, 'meta.json');
  await run('node', ['render.js', 'meta', page, metaF], 'meta');
  const meta = JSON.parse(fs.readFileSync(metaF)); const END = Math.min(meta.end, +opt('--ate', meta.end));
  const cuts = (meta.shots || []).map(s => (typeof s === 'number' ? s : s.t ?? s.start ?? s[0])).filter(t => t > 0 && t < END);
  // 2. divide em partes de tamanho parecido, sempre num corte de cena
  const bounds = [0];
  for (let k = 1; k < partes; k++) { const alvo = END * k / partes; const c = cuts.reduce((b, t) => (Math.abs(t - alvo) < Math.abs(b - alvo) ? t : b), alvo); if (c > bounds.at(-1) + 1) bounds.push(c); }
  bounds.push(END);
  console.log(`\nDuração ${END.toFixed(1)} s, partes: ${bounds.map(b => b.toFixed(2)).join(' | ')}`);
  // 3. trilha sonora (precisa de Python com numpy e scipy; se não tiver, usa trilha pronta ou só a narração)
  const trilha = path.join(out, 'trilha.wav'); const voz = path.join(proj, 'narracion_ritmo.wav');
  const audioJob = (async () => {
    for (const py of ['python3', 'python', 'py']) {
      const r = spawnSync(py, [path.join(__dirname, 'audio/mix.py'), metaF, voz, trilha], { env, stdio: 'pipe' });
      if (r.status === 0) return console.log(`\nTrilha sonora mixada (${py}).`);
    }
    const pronta = ['trilha.m4a', 'trilha.wav'].map(f => path.join(proj, f)).find(f => fs.existsSync(f));
    console.log(`\nPython com numpy/scipy não encontrado: usando ${pronta ? 'a trilha pronta do projeto' : 'só a narração'}.`);
    spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', pronta || voz, '-ar', '48000', '-ac', '2', trilha]);
  })();
  // 4. vídeo em paralelo
  const W = 2240, H = 1260; const nomes = []; tIni = Date.now(); const tick = setInterval(status, 3000);
  console.log('Renderizando o vídeo...');
  await Promise.all(bounds.slice(0, -1).map((a, i) => {
    const f = path.join(out, `parte_${i}.mp4`); nomes.push(f);
    return run('node', ['render.js', 'video', page, f, a.toFixed(3), bounds[i + 1].toFixed(3), String(fps), String(W), String(H)], `parte ${i + 1}`);
  }));
  clearInterval(tick); status(); await audioJob;
  // 5. montagem final com cor e nitidez
  fs.writeFileSync(path.join(out, 'lista.txt'), nomes.map(f => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'lista.txt'), '-i', trilha,
    '-filter_complex', '[0:v]eq=contrast=1.06:saturation=1.12:gamma=0.98,vignette=angle=0.55,unsharp=5:5:0.4,format=yuv420p[v]',
    '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('falha na montagem final');
  console.log(`\n\nPronto em ${min()}: ${final}`);
})().catch(e => { console.error('\nERRO:', e.message); process.exit(1); });
