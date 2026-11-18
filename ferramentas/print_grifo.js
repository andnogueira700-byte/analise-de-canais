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
    const [id, url, frases] = l.split('\t');
    const lista_f = frases.split(' || '); const frase = lista_f[0];
    const p = await ctx.newPage();
    try {
      await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000}); await p.waitForTimeout(4500);
      for (const t of ['Aceitar cookies','Aceitar todos','Aceitar','Concordo','Prosseguir','Entendi']) {
        const bt = p.getByRole('button', { name: t }); if (await bt.count()) { await bt.first().click({timeout:2000}).catch(()=>{}); break; } }
      await p.waitForTimeout(800);
      // aumenta a letra do parágrafo da frase (só para o print ficar legível em vídeo)
      await p.evaluate((frase) => {
        const re = new RegExp(frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'));
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) {
          if (re.test(n.textContent) && n.parentElement && n.parentElement.offsetParent !== null) {
            const el = n.parentElement.closest('p,h1,h2,h3,li,blockquote,figcaption') || n.parentElement;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (fs < 30) { el.style.fontSize = '30px'; el.style.lineHeight = '1.45'; }
            el.style.maxWidth = '1050px';
            return;
          }
        }
      }, frase);
      await p.waitForTimeout(500);
      const rects = await p.evaluate((frase) => {
        const norm = s => s.replace(/\s+/g,' ');
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) {
          const t = n.textContent; const mm = t.match(new RegExp(frase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'))); const i = mm ? mm.index : -1; const L = mm ? mm[0].length : 0;
          if (i >= 0 && n.parentElement && n.parentElement.offsetParent !== null) {
            n.parentElement.scrollIntoView({block:'center'});
            // mapeia o índice normalizado para o texto original (assume espaços simples)
            const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + L);
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
        while ((n = w.nextNode())) { const mm = n.textContent.match(new RegExp(frase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'))); const i = mm ? mm.index : -1; const L = mm ? mm[0].length : 0;
          if (i >= 0 && n.parentElement && n.parentElement.offsetParent !== null) {
            const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + L);
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
      // caixa do parágrafo (ou título) onde está a frase: o print novo mostra só esse bloco
      const bloco = await p.evaluate((frase) => {
        const re = new RegExp(frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'));
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) {
          if (re.test(n.textContent) && n.parentElement && n.parentElement.offsetParent !== null) {
            const el = n.parentElement.closest('p,h1,h2,h3,li,blockquote,figcaption') || n.parentElement;
            const r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height];
          }
        }
        return null; }, frase);
      await p.screenshot({ path: `${out}/${id}.png` });
      res[id] = { url, frase, rects: (rects2 || []).map(r => r.map(v => Math.round(v * 2))),
                  bloco: bloco ? bloco.map(v => Math.round(v * 2)) : null };
      // frases extras na MESMA imagem (print contínuo com vários grifos): id_2, id_3...
      for (let k = 1; k < lista_f.length; k++) {
        const rx = await p.evaluate((fr) => {
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
          while ((n = w.nextNode())) { const mm = n.textContent.match(new RegExp(fr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'))); const i = mm ? mm.index : -1; const L = mm ? mm[0].length : 0;
            if (i >= 0 && n.parentElement && n.parentElement.offsetParent !== null) {
              const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + L);
              return Array.from(r.getClientRects()).map(x => [x.left, x.top, x.width, x.height]); } }
          return null; }, lista_f[k]);
        res[`${id}_${k + 1}`] = { url, frase: lista_f[k], mesma_imagem: id, rects: (rx || []).map(r => r.map(v => Math.round(v * 2))) };
        console.log(`${id}_${k + 1}`, rx ? rx.length + ' linhas' : 'FRASE NAO ENCONTRADA');
      }
      console.log(id, rects2 ? rects2.length + ' linhas' : 'FRASE NAO ENCONTRADA');
    } catch (e) { console.log(id, 'ERRO', String(e).slice(0,80)); }
    await p.close();
  }
  fs.writeFileSync(`${out}/grifos.json`, JSON.stringify(res, null, 1));
  await b.close();
})();
