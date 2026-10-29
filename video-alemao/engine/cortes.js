// Exporta os tempos de corte da trilha a partir da legenda.
const fs = require('fs'); const vm = require('vm');
const ctx = { console, document: { getElementById: () => ({ getContext: () => ({}) }), createElement: () => ({ getContext: () => ({}) }) }, Path2D: class {} };
vm.createContext(ctx);
for (const f of ['cues.js', 'engine.js']) vm.runInContext(fs.readFileSync(__dirname + '/' + f, 'utf8'), ctx);
const r = vm.runInContext(`({ lei: at('tudo isso mudou em'), casa: at('e mesmo assim a lingua'), pomeranos: at('mas a historia nao terminou'), sobrou: at('e hoje o que sobrou') })`, ctx);
fs.mkdirSync('/tmp/claude-0/musica', { recursive: true }); fs.writeFileSync('/tmp/claude-0/musica/cortes.json', JSON.stringify(r)); console.log(r);
