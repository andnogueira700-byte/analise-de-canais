// Fila de renderização retomável: divide o vídeo em blocos (sempre em cortes de cena) e renderiza N em paralelo.
//   node fila.js <pagina> <pasta-saida> <meta.json> [workers=3] [fps=30] [w=1920] [h=1080] [bloco=40]
// Blocos prontos ficam como bloco_###.mp4 + .ok; rodar de novo continua de onde parou.
const fs = require('fs'), path = require('path'); const { spawn } = require('child_process');
const [, , page, outDir, metaF, nw = '3', fps = '30', w = '1920', h = '1080', blk = '40'] = process.argv;
const meta = JSON.parse(fs.readFileSync(metaF)); const END = meta.end;
const cuts = meta.shots.map(s => s[0]).filter(t => t > 0);
const B = [0]; let last = 0;
for (const c of cuts) if (c - last >= +blk) { B.push(c); last = c; }
if (END - B[B.length - 1] < 8 && B.length > 1) B.pop();
B.push(END);
fs.mkdirSync(outDir, { recursive: true });
const jobs = B.slice(0, -1).map((a, i) => ({ i, a, b: B[i + 1], f: path.join(outDir, `bloco_${String(i).padStart(3, '0')}.mp4`) }));
fs.writeFileSync(path.join(outDir, 'blocos.json'), JSON.stringify(jobs.map(j => [j.a, j.b])));
const pending = jobs.filter(j => !fs.existsSync(j.f + '.ok'));
console.log(`${jobs.length} blocos, ${pending.length} pendentes`);
const t0 = Date.now();
let done = jobs.length - pending.length;
function next() {
  const j = pending.shift(); if (!j) return Promise.resolve();
  return new Promise((res) => {
    const log = fs.createWriteStream(j.f + '.log');
    const p = spawn('node', [path.join(__dirname, 'render.js'), 'video', page, j.f, j.a.toFixed(3), j.b.toFixed(3), fps, w, h], { cwd: __dirname });
    p.stdout.pipe(log); p.stderr.pipe(log);
    p.on('close', (c) => {
      if (c === 0) { fs.writeFileSync(j.f + '.ok', ''); done++; console.log(`[${new Date().toISOString().slice(11, 19)}] bloco ${j.i} ok (${done}/${jobs.length}), ${((Date.now() - t0) / 60000).toFixed(1)} min`); }
      else { console.log(`bloco ${j.i} falhou (${c})`); pending.push(j); }
      res(next());
    });
  });
}
Promise.all(Array.from({ length: +nw }, next)).then(() => console.log('FIM', done, '/', jobs.length));
