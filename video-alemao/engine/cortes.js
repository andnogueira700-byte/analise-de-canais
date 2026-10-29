// Exporta os tempos de corte da trilha a partir da legenda.
const fs = require('fs'); const vm = require('vm');
const ctx = { console, document: { getElementById: () => ({ getContext: () => ({}) }), createElement: () => ({ getContext: () => ({}) }) }, Path2D: class {} };
vm.createContext(ctx);
// vídeo escolhido pela variável V (sem ela: o vídeo 1); os cortes de cada vídeo ficam em trilha.json na pasta dele
const VD = process.env.V ? `${__dirname}/../../video-${process.env.V}/` : null;
for (const f of [VD ? VD + 'cues.js' : __dirname + '/cues.js', __dirname + '/engine.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const cortes = VD ? JSON.parse(fs.readFileSync(VD + 'trilha.json', 'utf8')).cortes : { lei: 'tudo isso mudou em', casa: 'e mesmo assim a lingua', pomeranos: 'mas a historia nao terminou', sobrou: 'e hoje o que sobrou' };
const r = Object.fromEntries(Object.entries(cortes).map(([k, p]) => [k, vm.runInContext(`at(${JSON.stringify(p)})`, ctx)]));
fs.mkdirSync('/tmp/claude-0/musica', { recursive: true }); fs.writeFileSync('/tmp/claude-0/musica/cortes.json', JSON.stringify(r)); console.log(r);
