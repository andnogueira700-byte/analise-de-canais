// Print de notícia com a posição exata (linha por linha) de uma frase, para grifar na edição.
// Uso: node ferramentas/print_grifo.js lista.tsv pasta_saida
// lista.tsv: ID<TAB>URL<TAB>frase exata visível na página
const { chromium } = require('playwright');
const fs = require('fs');
const [,, lista, out] = process.argv;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1920,height:1080}, deviceScaleFactor:2, locale:'pt-BR',
    userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  const res = {};
  for (const l of fs.readFileSync(lista,'utf8').trim().split('\n')) {
    const [id, url, frase] = l.split('\t');
    const p = await ctx.newPage();
    try {
      await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000}); await p.waitForTimeout(4500);
      for (const t of ['Aceitar cookies','Aceitar todos','Aceitar','Concordo','Prosseguir','Entendi']) {
        const bt = p.getByRole('button', { name: t }); if (await bt.count()) { await bt.first().click({timeout:2000}).catch(()=>{}); break; } }
      await p.waitForTimeout(800);
      const rects = await p.evaluate((frase) => {
        const norm = s => s.replace(/\s+/g,' ');
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) {
          const t = n.textContent; const i = norm(t).indexOf(frase);
          if (i >= 0 && n.parentElement && n.parentElement.offsetParent !== null) {
            n.parentElement.scrollIntoView({block:'center'});
            // mapeia o índice normalizado para o texto original (assume espaços simples)
            const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + frase.length);
            return Array.from(r.getClientRects()).map(x => [x.left, x.top, x.width, x.height]);
          }
        }

        // plano B: elemento (h1, h2, p, span) cujo texto contém a frase -> grifa o elemento inteiro, linha por linha
        for (const el of document.querySelectorAll('h1,h2,h3,p,span,div')) {
          if (el.children.length > 3) continue;
          const tx = (el.innerText || '').replace(/\s+/g,' ');
          if (tx.includes(frase) && el.offsetParent !== null && tx.length < frase.length * 3) {
            el.scrollIntoView({block:'center'});
            const r = document.createRange(); r.selectNodeContents(el);
            return Array.from(r.getClientRects()).filter(x => x.width > 8).map(x => [x.left, x.top, x.width, x.height]);
          }
        }
        return null;
      }, frase);
      await p.waitForTimeout(800);
      const rects2 = await p.evaluate((frase) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { const i = n.textContent.replace(/\s+/g,' ').indexOf(frase);
          if (i >= 0 && n.parentElement && n.parentElement.offsetParent !== null) {
            const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + frase.length);
            return Array.from(r.getClientRects()).map(x => [x.left, x.top, x.width, x.height]); } }

        // plano B: elemento (h1, h2, p, span) cujo texto contém a frase -> grifa o elemento inteiro, linha por linha
        for (const el of document.querySelectorAll('h1,h2,h3,p,span,div')) {
          if (el.children.length > 3) continue;
          const tx = (el.innerText || '').replace(/\s+/g,' ');
          if (tx.includes(frase) && el.offsetParent !== null && tx.length < frase.length * 3) {
            
            const r = document.createRange(); r.selectNodeContents(el);
            return Array.from(r.getClientRects()).filter(x => x.width > 8).map(x => [x.left, x.top, x.width, x.height]);
          }
        }
        return null; }, frase);
      await p.screenshot({ path: `${out}/${id}.png` });
      res[id] = { url, frase, rects: (rects2 || []).map(r => r.map(v => Math.round(v * 2))) };
      console.log(id, rects2 ? rects2.length + ' linhas' : 'FRASE NAO ENCONTRADA');
    } catch (e) { console.log(id, 'ERRO', String(e).slice(0,80)); }
    await p.close();
  }
  fs.writeFileSync(`${out}/grifos.json`, JSON.stringify(res, null, 1));
  await b.close();
})();
