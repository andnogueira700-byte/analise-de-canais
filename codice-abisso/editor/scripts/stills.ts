import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const times = (process.env.T ?? '').split(',').map(Number);
const out = process.env.OUT ?? 'out/pilot';
(async () => {
  const b = await bundle({entryPoint: path.resolve('src/index.ts')});
  const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
  const br = await openBrowser('chrome', {browserExecutable: exe, chromiumOptions: {gl: 'swangle'}});
  const comp = await selectComposition({serveUrl: b, id: 'Orche', puppeteerInstance: br});
  for (const t of times) await renderStill({composition: comp, serveUrl: b, output: `${out}/t${String(t).replace('.', '_')}.jpg`, frame: Math.round(t * 30), imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5, puppeteerInstance: br, chromiumOptions: {gl: 'swangle'}});
  await br.close({silent: true} as any);
})();
