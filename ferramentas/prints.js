// Tira prints de páginas para usar no vídeo.
// Uso: node ferramentas/prints.js lista.tsv pasta_saida
// lista.tsv: ID<TAB>URL  (uma por linha)
const { chromium } = require('playwright');
const fs = require('fs');
const [,, lista, out] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'pt-BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  for (const linha of fs.readFileSync(lista, 'utf8').trim().split('\n')) {
    const [id, url] = linha.split('\t');
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);
      for (const t of ['Aceitar', 'Aceito', 'Concordo', 'Aceitar todos', 'Aceitar tudo', 'OK', 'Entendi', 'Fechar']) {
        const b = page.getByRole('button', { name: t, exact: false });
        if (await b.count()) { await b.first().click({ timeout: 2000 }).catch(() => {}); }
      }
      await page.waitForTimeout(1500);
      const titulo = (await page.title()).slice(0, 90);
      await page.screenshot({ path: `${out}/${id}-topo.png` });
      await page.screenshot({ path: `${out}/${id}-pagina-inteira.png`, fullPage: true }).catch(() => {});
      console.log(`${id}\tOK\t${titulo}`);
    } catch (e) {
      console.log(`${id}\tFALHOU\t${String(e).slice(0, 80)}`);
    }
    await page.close();
  }
  await browser.close();
})();
