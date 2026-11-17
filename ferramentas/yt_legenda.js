// Captura a legenda (transcrição) de um vídeo do YouTube abrindo o player no navegador.
// Uso: node ferramentas/yt_legenda.js VIDEO_ID arquivo_saida.txt
const { chromium } = require('playwright');
const [,, id, out] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ locale: 'pt-BR' });
  let texto = null;
  page.on('response', async (r) => {
    const u = r.url();
    if (u.includes('/api/timedtext') && !texto) {
      try {
        const b = await r.text();
        if (b && b.length > 200) texto = b;
      } catch (e) {}
    }
  });
  await page.goto(`https://www.youtube.com/watch?v=${id}&hl=pt-BR&cc_load_policy=1&cc_lang_pref=pt`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // aceita cookies se aparecer
  for (const t of ['Aceitar tudo', 'Accept all']) {
    const b = page.getByRole('button', { name: t });
    if (await b.count()) { await b.first().click().catch(()=>{}); }
  }
  await page.waitForTimeout(4000);
  // tenta dar play e ligar legendas
  await page.keyboard.press('k').catch(()=>{});
  await page.waitForTimeout(1500);
  const cc = page.locator('.ytp-subtitles-button');
  if (await cc.count()) {
    const on = await cc.getAttribute('aria-pressed');
    if (on !== 'true') await cc.click().catch(()=>{});
  }
  for (let i = 0; i < 20 && !texto; i++) await page.waitForTimeout(1000);
  await browser.close();
  if (!texto) { console.error('SEM_LEGENDA'); process.exit(2); }
  let linhas = [];
  try {
    const j = JSON.parse(texto);
    for (const ev of j.events || []) if (ev.segs) linhas.push(ev.segs.map(s => s.utf8).join(''));
  } catch (e) {
    linhas = texto.replace(/<[^>]+>/g, ' ').split('\n');
  }
  const final = linhas.join(' ').replace(/\s+/g, ' ').trim();
  require('fs').writeFileSync(out, final);
  console.log('OK', final.split(' ').length, 'palavras');
})();
