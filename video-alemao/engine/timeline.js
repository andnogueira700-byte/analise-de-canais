// Roteiro de cenas do vídeo "O alemão no Sul do Brasil", sincronizado pela legenda.
const P = { // lugares [lon, lat]
  hamburgo: [9.99, 53.55], hunsruck: [7.3, 49.9], pomerania: [15.0, 54.0],
  saoLeopoldo: [-51.15, -29.76], portoAlegre: [-51.23, -30.03], rioGrande: [-52.1, -32.03],
  blumenau: [-49.07, -26.92], joinville: [-48.85, -26.30], itapiranga: [-53.71, -27.17],
  jetiba: [-40.74, -20.03], pomerode: [-49.18, -26.74], herval: [-50.99, -29.50],
  antonioCarlos: [-48.77, -27.52], lajeado: [-51.96, -29.47], rio: [-43.2, -22.9],
  sergipe: [-37.0, -11.4], saoLourenco: [-51.98, -31.36], berlim: [13.4, 52.5],
  macau: [113.55, 22.2], goa: [73.9, 15.4], timor: [125.7, -8.8]
};
function buildScene() {
  const S = { highlights: [], blobs: [], swarms: [], labels: [], icons: [], iconSwarms: [], pins: [], years: [], chapters: [], pills: [], numbers: [], words: [], people: [], dots: [], rows: [], lists: [], quotes: [], titles: [], ends: [] };
  const cam = (t, place, span, d = 1.6) => CAM.push(Array.isArray(place) ? { t, lon: place[0], lat: place[1], span, d } : { t, ...place, span, d });
  const follow = (t, id, span, d = 1.0) => CAM.push({ t, follow: id, span, d });
  const pin = (t, place, label) => S.pins.push({ t, lon: place[0], lat: place[1], label });
  const unpin = t => S.pins.push({ t, hide: true });
  const year = (t, y, from) => S.years.push({ t, y, from });
  const noYear = t => S.years.push({ t, hide: true });
  const chap = (t, num, title) => S.chapters.push({ t0: t, num, title });
  const pill = (t0, t1, text, color) => S.pills.push({ t0, t1, text, color });
  const num = (t0, t1, value, label, o = {}) => S.numbers.push({ t0, t1, value, label, ...o });
  const hl = (t0, t1, name, color, o = {}) => S.highlights.push({ t0, t1, name, color, ...o });
  const blob = (t0, t1, place, r, color, o = {}) => S.blobs.push({ t0, t1, lon: place[0], lat: place[1], r, color, ...o });
  const icon = (t0, t1, img, place, o = {}) => S.icons.push({ t0, t1, img, lon: place[0], lat: place[1], ...o });
  const sicon = (t0, t1, img, sx, sy, o = {}) => S.icons.push({ t0, t1, img, sx, sy, ...o });
  const label = (t0, t1, place, text, o = {}) => S.labels.push({ t0, t1, lon: place[0], lat: place[1], text, ...o });
  const route = (id, t0, t1, pts, o = {}) => ROUTES[id] = buildRoute({ t0, t1, pts, hide: t1 + 5, ...o });
  const person = (t0, t1, name, role, o = {}) => S.people.push({ t0, t1, name, role, ...o });
  const word = (t0, t1, lang, wordTxt, o = {}) => S.words.push({ t0, t1, lang, word: wordTxt, ...o });
  const row = (t0, t1, items, o = {}) => S.rows.push({ t0, t1, items, ...o });
  const A = at;
  const ALEMAO = C.acai, POM = C.lilas;
  const SUL = ['RS', 'SC', 'PR'];

  // ===== GANCHO =====
  cam(0, [-25, 8], 130, 0.1);
  cam(0.2, [-35, -5], 105, 4.5);
  sicon(A('quando um governo'), A('no brasil o alemão') - 0.4, 'speech_balloon', W / 2 - 70, H / 2 - 40, { size: 170 });
  sicon(A('ela costuma morrer'), A('no brasil o alemão') - 0.4, 'prohibited', W / 2 + 70, H / 2 + 10, { size: 150 });
  pill(A('quando um governo') + 0.4, A('no brasil o alemão') - 0.3, 'Língua proibida, língua morta?');
  const tBr = A('no brasil o alemão');
  cam(tBr, [-50.5, -27.5], 26, 1.8);
  const SULC = { RS: C.caju, SC: C.turq, PR: C.verde }; // cada estado com uma cor diferente
  SUL.forEach((s, i) => hl(tBr + 0.3 + i * 0.35, A('nao e o alemao da') - 0.2, s, SULC[s]));
  label(tBr + 0.8, A('eu sempre achei'), [-53.5, -29.8], 'Rio Grande do Sul', { size: 26 });
  label(tBr + 0.8, A('eu sempre achei'), [-50.6, -27.2], 'Santa Catarina', { size: 26 });
  label(tBr + 0.8, A('eu sempre achei'), [-51.6, -24.7], 'Paraná', { size: 26 });
  icon(A('na escola'), A('mas descobri que'), 'school', P.blumenau, { size: 90 });
  icon(A('no jornal e'), A('mas descobri que'), 'newspaper', P.portoAlegre, { size: 90, dx: 40 });
  icon(A('ate na rua'), A('mas descobri que'), 'police_officer', P.joinville, { size: 90, dx: 60 });
  icon(A('conversar num cafe'), A('mas descobri que'), 'hot_beverage', P.joinville, { size: 70, dx: 140, dy: 20 });
  pill(A('eu sempre achei'), A('mas descobri que') - 0.2, 'Proibição = fim da língua?');
  num(A('mas descobri que') + 0.6, A('nao e o alemao da') - 0.2, 1000000, 'falam alemão no Sul do Brasil', { prefix: '+', color: ALEMAO });
  swarm(S, A('mais de um milhao'), A('como isso foi possivel'), [-51.5, -27.5], 3.5, 160, ALEMAO, 3.5, 4);
  const tDE = A('nao e o alemao da');
  cam(tDE, [-20, 16], 205, 2.2);
  hl(tDE + 0.5, A('como isso foi possivel'), 'Germany', ALEMAO);
  hl(tDE + 0.5, A('como isso foi possivel'), 'RS', C.ipe);
  hl(tDE + 0.5, A('como isso foi possivel'), 'SC', C.caju);
  label(tDE + 0.9, A('como isso foi possivel'), [10.4, 47.0], 'Alemanha', { size: 26, color: C.branco, alpha: 0.9 });
  pill(A('e um alemao que nasceu'), A('como isso foi possivel') - 0.1, 'Um alemão que nasceu aqui');
  // cartão de título
  const tTit = A('como isso foi possivel');
  S.titles.push({ t0: tTit, t1: A('no dia vinte e cinco') - 0.4, text: 'O alemão que ninguém\nconseguiu calar' });

  // ===== I · A CHEGADA =====
  const t1824 = A('no dia vinte e cinco');
  chap(t1824, 'I', 'A chegada');
  cam(t1824 - 0.3, P.saoLeopoldo, 5.5, 2.2);
  year(t1824 + 0.4, 1824, 1800);
  pin(t1824 + 1.2, P.saoLeopoldo, 'São Leopoldo');
  num(A('trinta e nove alemaes'), A('ficava no rio grande'), 39, 'alemães chegam em 25 de julho', { color: ALEMAO, x: W / 2 + 300 });
  cam(A('ficava no rio grande'), [-53, -29.6], 13, 1.4);
  hl(A('ficava no rio grande'), A('vinham de uma regiao') + 0.3, 'RS', C.verde, { alpha: 0.55 });
  label(A('ficava no rio grande'), A('vinham de uma regiao'), [-53.5, -29.2], 'Rio Grande do Sul', { size: 30 });
  const tHun = A('vinham de uma regiao');
  cam(tHun, P.hunsruck, 9, 2.4);
  hl(tHun + 0.6, A('a cidade ganhou o nome') + 0.6, 'Germany', ALEMAO, { alpha: 0.55 });
  blob(tHun + 1.2, A('a cidade ganhou o nome') + 0.5, P.hunsruck, 0.6, C.ipe);
  pin(tHun + 1.4, P.hunsruck, 'Hunsrück');
  pill(A('pobre chamada'), A('a cidade ganhou o nome') - 0.2, 'Hunsrück: oeste da Alemanha');
  const tLeo = A('a cidade ganhou o nome');
  cam(tLeo, P.saoLeopoldo, 4.5, 2.2);
  pin(tLeo + 0.6, P.saoLeopoldo, 'São Leopoldo');
  person(A('da imperatriz leopoldina') - 0.3, A('os trinta e nove ficaram') - 0.2, 'Leopoldina', 'Imperatriz do Brasil', { img: 'leopoldina', zoom: 1.3, top: 0.02 });
  person(A('mulher do imperador') + 0.2, A('os trinta e nove ficaram') - 0.2, 'Dom Pedro I', 'Imperador do Brasil', { img: 'pedro1', side: 'right', zoom: 1.6, top: 0.08 });
  icon(A('numa antiga fazenda'), A('eles sairam de navio') + 0.3, 'house', P.saoLeopoldo, { size: 110, dx: 120, dy: -20, label: 'FEITORIA DO LINHO CÂNHAMO' });
  pill(A('numa antiga fazenda'), A('eles sairam de navio') - 0.1, 'Esperando um pedaço de terra');
  const tHam = A('eles sairam de navio');
  cam(tHam, P.hamburgo, 22, 1.6);
  pin(tHam + 0.4, P.hamburgo, 'Hamburgo');
  hl(tHam, A('chegaram cheios de') - 2, 'Germany', ALEMAO, { alpha: 0.45 });
  const tSea = A('porto de hamburgo') + 0.6;
  const tRiver = A('subiram o rio') ;
  route('mar', tSea, tRiver + 0.4, [P.hamburgo, [8.4, 54.0], [6, 53.85], [4, 53.1], [2.6, 51.7], [1.5, 51.05], [-1, 50.25], [-5.5, 49.3], [-10, 46], [-18, 30], [-26, 8], [-32, -8], [-40, -24], [-48.5, -31.5], P.rioGrande, [-51.3, -31.0], P.portoAlegre], { icon: 'ship', color: C.branco });
  route('rio', tRiver + 0.4, A('chegaram cheios de') - 0.2, [P.portoAlegre, [-51.18, -29.92], P.saoLeopoldo], { icon: 'canoe', size: 70, color: C.ipe });
  unpin(tSea - 0.1);
  follow(tSea, 'mar', 40, 0.8);
  follow(tRiver + 0.3, 'rio', 2.2, 1.0);
  // promessas
  const tProm = A('chegaram cheios de');
  cam(tProm, P.saoLeopoldo, 3.2, 1.2);
  pin(tProm + 0.2, P.saoLeopoldo, 'São Leopoldo');
  const tNao = A('mas muita coisa que prometeram');
  row(tProm + 0.3, A('e eles nao ficaram') - 0.2, [
    { img: 'seedling', label: 'Terra', at: A('terra ferramentas') }, { img: 'axe', label: 'Ferramentas', at: A('ferramentas comida') },
    { img: 'bread', label: 'Comida', at: A('comida no comeco') }, { img: 'church', label: 'Religião', at: A('liberdade para rezar') }
  ].map(it => ({ ...it, cross: tNao + 0.8 })));
  pill(tNao, A('e eles nao ficaram') - 0.2, 'Cada família por conta própria', C.urucum);
  // mais imigrantes
  const t5mil = A('entre mil oitocentos e vinte e quatro');
  cam(t5mil - 0.6, P.saoLeopoldo, 6, 1.5);
  year(t5mil, 1830, 1824);
  num(A('mais de cinco mil'), A('a maioria foi para perto') + 1.5, 5000, 'alemães desembarcam até 1830', { prefix: '+', color: ALEMAO });
  swarm(S, A('mais de cinco mil'), A('para entender por que eles') , P.saoLeopoldo, 0.9, 140, ALEMAO, 4, 5);
  pill(A('eles nao falavam portugues'), A('mas isso sozinho') - 0.2, 'No dia a dia, só alemão');
  sicon(A('eles nao falavam portugues'), A('mas isso sozinho') - 0.2, 'speech_balloon', W / 2 + 380, H - 230, { size: 120 });
  pill(A('mas isso sozinho'), A('quando o imigrante chegava') - 0.2, 'Por que eles não trocaram de língua?');

  // ===== II · ISOLADOS NO MATO =====
  const tMato = A('quando o imigrante chegava');
  chap(tMato, 'II', 'Isolados no mato');
  cam(tMato, [-51.5, -29.5], 3.0, 1.6);
  noYear(tMato);
  pin(tMato + 0.2, [-51.75, -29.35], 'Lote no mato');
  S.iconSwarms.push({ t0: A('pedaco de terra no meio'), t1: A('as colonias foram feitas') + 1, img: 'tree', n: 14, lon: -51.7, lat: -29.35, r: 0.45, size: 60, dur: 2.5, seed: 21 });
  icon(A('pedaco de terra no meio'), A('as colonias foram feitas') + 1, 'hut', [-51.75, -29.35], { size: 100, dy: -10 });
  route('picada', A('a cidade mais proxima'), A('os vizinhos eram') + 0.5, [[-51.75, -29.35], [-51.55, -29.6], [-51.35, -29.9], P.portoAlegre], { color: C.ipe, hide: A('as colonias foram feitas') + 1 });
  label(A('a cidade mais proxima'), A('as colonias foram feitas') + 1, [-51.23, -30.17], 'Porto Alegre', { size: 24 });
  pill(A('e o caminho era so'), A('os vizinhos eram') - 0.1, 'Só uma picada no mato');
  swarm(S, A('os vizinhos eram'), A('depois foi assim em blumenau'), [-51.6, -29.45], 0.4, 40, ALEMAO, 2.5, 8);
  pill(A('as colonias foram feitas'), A('foi assim em sao leopoldo') + 0.3, 'Colônias de gente da mesma origem');
  const tBlu = A('depois foi assim em blumenau');
  cam(tBlu, [-49.5, -27.4], 7, 1.8);
  pin(tBlu + 0.3, P.blumenau, 'Blumenau');
  year(A('em mil oitocentos e cinquenta e em'), 1850, 1830);
  blob(tBlu + 0.5, A('para que aprender portugues'), P.blumenau, 0.35, ALEMAO);
  pin(A('e em joinville'), P.joinville, 'Joinville');
  year(A('em mil oitocentos e cinquenta e um'), 1851);
  blob(A('e em joinville'), A('para que aprender portugues'), P.joinville, 0.35, ALEMAO);
  const t1876 = A('em mil oitocentos e setenta e seis');
  year(t1876, 1876);
  pin(t1876, P.blumenau, 'Blumenau');
  S.dots.push({ t0: t1876 + 0.4, t1: A('em joinville chegaram') - 0.2, total: 100, colored: 80, colorAt: A('mais de oito mil') - t1876, color: ALEMAO, title: 'Blumenau em 1876 · 1 ponto = 100 moradores', legend: [[ALEMAO, 'alemães (+8 mil)'], ['#cfd3dc', 'outros']], cell: 40 });
  const tJoi = A('em joinville chegaram');
  pin(tJoi, P.joinville, 'Joinville');
  cam(tJoi, P.joinville, 3.5, 1.4);
  noYear(tJoi);
  num(A('chegaram cerca de dezessete'), A('imagine viver ali') , 17000, 'imigrantes em Joinville, 1850 a 1888', { prefix: '≈', color: ALEMAO });
  const tViz = A('imagine viver ali');
  icon(A('o vizinho falava'), A('com os pomeranos') - 0.2, 'house', P.joinville, { dx: -220, dy: -60, size: 110, label: 'VIZINHO' });
  icon(A('o dono do armazem'), A('com os pomeranos') - 0.2, 'store', P.joinville, { dx: 0, dy: -150, size: 110, label: 'ARMAZÉM' });
  icon(A('o padeiro tambem'), A('com os pomeranos') - 0.2, 'bread', P.joinville, { dx: 220, dy: -60, size: 110, label: 'PADARIA' });
  pill(tViz + 1, A('para que aprender portugues') - 0.1, 'Todo mundo falava alemão');
  pill(A('para que aprender portugues'), A('com os pomeranos') - 0.1, 'Para que aprender português?');
  const tPom = A('com os pomeranos');
  cam(tPom, [-46, -25.5], 21, 2.0);
  unpin(tPom);
  blob(tPom + 0.6, A('mas ainda faltava'), P.jetiba, 0.7, POM, { minPx: 30 });
  blob(tPom + 1.0, A('mas ainda faltava'), P.pomerode, 0.6, POM, { minPx: 30 });
  blob(tPom + 1.4, A('mas ainda faltava'), P.saoLourenco, 0.6, POM, { minPx: 30 });
  label(A('no espirito santo'), A('mas ainda faltava'), [-40.7, -19.1], 'Espírito Santo', { size: 24 });
  label(A('em santa catarina e no'), A('mas ainda faltava'), [-49.4, -27.9], 'Santa Catarina', { size: 24 });
  label(A('rio grande do sul e falavam'), A('mas ainda faltava'), [-53.3, -30.4], 'Rio Grande do Sul', { size: 24 });
  pill(tPom + 0.5, A('esse isolamento foi') - 0.1, 'Pomeranos: colônias só deles', POM);
  pill(A('esse isolamento foi'), A('mas ainda faltava') - 0.1, 'Razão 2: isolamento');
  pill(A('mas ainda faltava'), A('a terceira razao') - 0.1, 'Faltava uma peça: a escola');

  // ===== III · A ESCOLA DA COMUNIDADE =====
  const tEsc = A('a terceira razao');
  chap(tEsc, 'III', 'A escola da comunidade');
  cam(tEsc, P.blumenau, 3.2, 1.8);
  pin(tEsc + 0.4, P.blumenau, 'Blumenau');
  icon(A('quase nao existia escola publica'), A('eles se juntavam') - 0.2, 'classical_building', P.blumenau, { dx: 0, dy: -170, size: 120, cross: A('nas colonias') + 0.2, label: 'ESCOLA DO GOVERNO' });
  row(A('eles se juntavam'), A('na alemanha estudar') - 0.2, [
    { img: 'busts', label: 'Os colonos', at: A('eles se juntavam') + 0.2 }, { img: 'man_teacher', label: 'Professor', at: A('pagavam um professor') },
    { img: 'school', label: 'Escola', at: A('e construiam a') }, { img: 'hearthands', label: 'Associação', at: A('uma associacao de pais') }
  ]);
  pill(A('na alemanha estudar'), A('em blumenau em mil oitocentos e sessenta') - 0.1, 'Na Alemanha, estudar era obrigação');
  sicon(A('e eles nao queriam'), A('em blumenau em mil oitocentos e sessenta') - 0.1, 'openbook', W / 2 - 120, H / 2 - 40, { size: 140 });
  sicon(A('ler e escrever'), A('em blumenau em mil oitocentos e sessenta') - 0.1, 'pencil', W / 2 + 80, H / 2 - 40, { size: 140 });
  const t1867 = A('em blumenau em mil oitocentos e sessenta');
  year(t1867 + 0.6, 1867, 1851);
  num(A('ja tinha doze escolas'), A('com duzentas e sessenta') - 0.1, 12, 'escolas em Blumenau', { color: C.turq, x: W / 2 + 320 });
  num(A('com duzentas e sessenta'), A('o historiador lucio'), 263, 'crianças estudando', { color: C.turq, x: W / 2 + 320 });
  S.iconSwarms.push({ t0: A('ja tinha doze escolas'), t1: A('o historiador lucio') + 0.5, img: 'school', n: 12, lon: P.blumenau[0], lat: P.blumenau[1], r: 0.6, size: 56, dur: 1.4, seed: 33 });
  pill(A('isso menos de vinte'), A('o historiador lucio') - 0.1, 'Menos de 20 anos depois da fundação');
  const tLuc = A('o historiador lucio');
  person(tLuc, A('e mais do que em qualquer') - 0.2, 'Lúcio Kreutz', 'Historiador da educação', { icon: 'graduation_cap' });
  cam(tLuc, [-51, -27.3], 13, 2.2);
  noYear(tLuc);
  unpin(tLuc);
  num(A('fala em cerca de mil'), A('nessas escolas a crianca') - 0.2, 1500, 'escolas alemãs no Brasil', { prefix: '≈', color: C.turq });
  S.iconSwarms.push({ t0: A('fala em cerca de mil'), t1: A('a escola mantinha') , img: 'school', n: 46, lon: -51.5, lat: -27.8, r: 3.2, size: 44, dur: 2.5, seed: 44 });
  const tAL = A('e mais do que em qualquer');
  cam(tAL, [-60, -22], 62, 2.0);
  pill(tAL, A('nessas escolas a crianca') - 0.1, 'Mais que em qualquer país da América Latina');
  hl(tAL + 0.3, A('nessas escolas a crianca'), 'RS', C.turq, { alpha: 0.8 });
  hl(tAL + 0.3, A('nessas escolas a crianca'), 'SC', C.turq, { alpha: 0.8 });
  const tLer = A('nessas escolas a crianca');
  cam(tLer, P.blumenau, 4, 1.8);
  row(tLer + 0.3, A('a escola mantinha') + 0.5, [
    { img: 'openbook', label: 'Ler', at: A('aprendia a ler') }, { img: 'abacus', label: 'Contar', at: A('a contar e') }, { img: 'church', label: 'Rezar', at: A('a rezar') }
  ]);
  pill(A('a escola mantinha'), A('mas a escola nao trabalhava') - 0.1, 'A escola era da própria comunidade');

  // ===== IV · A IGREJA =====
  const tIg = A('mas a escola nao trabalhava');
  cam(tIg, P.saoLeopoldo, 3.5, 2.2);
  pin(tIg + 0.5, P.saoLeopoldo, 'São Leopoldo');
  icon(A('ficava a igreja'), A('dos trinta e nove primeiros') + 0.2, 'church', P.saoLeopoldo, { dx: 140, dy: -90, size: 120 });
  const t39 = A('dos trinta e nove primeiros');
  chap(t39 - 0.2, 'IV', 'A igreja');
  S.dots.push({ t0: t39, t1: A('o culto a pregacao') - 0.2, total: 39, cols: 13, colored: 33, color: ALEMAO, base: C.ipe, colorAt: 0, speed: 0.03, title: 'Os 39 primeiros imigrantes', legend: [[ALEMAO, '33 luteranos'], [C.ipe, '6 católicos']], cell: 46 });
  pill(A('os dois grupos tinham'), A('o culto a pregacao') - 0.1, 'Pastores e padres falavam alemão');
  row(A('o culto a pregacao'), A('em itapiranga') - 0.2, [
    { img: 'church', label: 'Culto', at: A('o culto a') }, { img: 'speaking_head', label: 'Pregação', at: A('a pregacao e os') }, { img: 'musical_notes', label: 'Cantos', at: A('e os cantos') }, { img: 'school', label: 'Escola', at: A('tambem cuidava da escola') }
  ]);
  const tIta = A('em itapiranga');
  cam(tIta, P.itapiranga, 4, 2.2);
  pin(tIta + 0.6, P.itapiranga, 'Itapiranga');
  label(tIta + 0.5, A('a crianca ouvia alemao') + 0.5, [-51.2, -27.5], 'Santa Catarina', { size: 26 });
  icon(A('o povo lia uma revista'), A('a crianca ouvia alemao') - 0.2, 'page_with_curl', P.itapiranga, { dx: -160, dy: -110, size: 110, label: 'REVISTA DA IGREJA' });
  icon(A('e a missa tambem'), A('a crianca ouvia alemao') - 0.2, 'church', P.itapiranga, { dx: 170, dy: -110, size: 110, label: 'MISSA EM ALEMÃO' });
  pill(A('entao veja o tamanho'), A('a crianca ouvia alemao') - 0.1, 'Veja a força disso');
  const tTres = A('a crianca ouvia alemao');
  row(tTres, A('eu achava que o segredo') - 0.2, [
    { img: 'house', label: 'Em casa', at: tTres + 0.2 }, { img: 'school', label: 'Na escola', at: A('aprendia alemao na') }, { img: 'church', label: 'No domingo', at: A('e rezava em alemao') }
  ]);
  pill(A('a lingua estava em tres'), A('eu achava que o segredo') - 0.1, 'Em três lugares ao mesmo tempo');
  pill(A('eu achava que o segredo'), A('so que a vida deles') - 0.1, 'Não era teimosia: era útil em tudo');

  // ===== V · CLUBES E JORNAIS =====
  const tClu = A('so que a vida deles');
  chap(A('os colonos copiaram'), 'V', 'Clubes e jornais');
  cam(tClu, P.joinville, 3.2, 2.0);
  pin(tClu + 0.5, P.joinville, 'Joinville');
  pill(A('as sociedades'), A('e tudo isso acontecia') + 0.4, 'As sociedades');
  row(A('eram clubes de canto'), A('em joinville em mil oitocentos e setenta') - 0.2, [
    { img: 'musical_notes', label: 'Canto', at: A('clubes de canto') }, { img: 'bullseye', label: 'Tiro', at: A('de tiro') },
    { img: 'gym', label: 'Ginástica', at: A('de ginastica') }, { img: 'performing_arts', label: 'Teatro', at: A('e de teatro') }
  ]);
  const t1877 = A('em joinville em mil oitocentos e setenta');
  year(t1877 + 0.5, 1877, 1867);
  S.iconSwarms.push({ t0: A('ja existiam muitos desses'), t1: A('tinha jornal tambem'), img: 'performing_arts', n: 8, lon: P.joinville[0], lat: P.joinville[1], r: 0.35, size: 50, dur: 1.2, seed: 9 });
  icon(A('alem de escola'), A('tinha jornal tambem'), 'school', P.joinville, { dx: -260, dy: -120, size: 100 });
  icon(A('igreja hospital'), A('tinha jornal tambem'), 'church', P.joinville, { dx: -90, dy: -190, size: 100 });
  icon(A('hospital e corpo'), A('tinha jornal tambem'), 'hospital', P.joinville, { dx: 90, dy: -190, size: 100 });
  icon(A('corpo de bombeiros'), A('tinha jornal tambem'), 'fire_engine', P.joinville, { dx: 260, dy: -120, size: 100 });
  pill(A('era uma cidade inteira'), A('tinha jornal tambem') - 0.1, 'Uma cidade inteira em alemão');
  const tJor = A('tinha jornal tambem');
  cam(tJor, P.saoLeopoldo, 4, 2.0);
  pin(tJor + 0.4, P.saoLeopoldo, 'São Leopoldo');
  year(A('foi impressa em'), 1832, 1877);
  icon(A('a primeira cartilha'), A('a partir de mil oitocentos e cinquenta') - 0.2, 'bluebook', P.saoLeopoldo, { dx: 160, dy: -120, size: 130, label: '1ª CARTILHA ALEMÃ' });
  num(A('isso foi so oito'), A('a partir de mil oitocentos e cinquenta') - 0.1, 8, 'anos depois da chegada', { color: ALEMAO, x: W / 2 - 330 });
  const t1850b = A('a partir de mil oitocentos e cinquenta');
  year(t1850b + 0.5, 1850, 1832);
  cam(t1850b, P.portoAlegre, 5, 1.6);
  S.iconSwarms.push({ t0: A('aparecem jornais'), t1: A('escola igreja clube'), img: 'newspaper', n: 10, lon: -51.2, lat: -29.85, r: 0.7, size: 56, dur: 1.5, seed: 12 });
  S.iconSwarms.push({ t0: A('almanaques e livros'), t1: A('escola igreja clube'), img: 'books', n: 8, lon: -51.25, lat: -29.85, r: 0.75, size: 52, dur: 1.5, seed: 13 });
  pill(A('o colono podia ler'), A('escola igreja clube') - 0.1, 'Notícias, lavoura e diversão em alemão');
  const tPilar = A('escola igreja clube');
  const tLei = A('podiam ser fechadas');
  noYear(tPilar);
  row(tPilar, A('e foi o que aconteceu') + 0.3, [
    { img: 'school', label: 'Escola', at: tPilar }, { img: 'church', label: 'Igreja', at: A('igreja clube') }, { img: 'performing_arts', label: 'Clube', at: A('clube e jornal') }, { img: 'newspaper', label: 'Jornal', at: A('e jornal parecia') }
  ].map(it => ({ ...it, cross: tLei + 0.6 })));
  pill(A('parecia uma lingua impossivel'), A('mas todas essas coisas') - 0.1, 'Impossível de derrubar?');
  pill(A('mas todas essas coisas'), A('e foi o que aconteceu') - 0.1, 'O ponto fraco: uma lei', C.urucum);

  // ===== VI · A LEI =====
  const t1937 = A('tudo isso mudou em');
  chap(t1937, 'VI', 'A lei');
  year(t1937 + 0.8, 1937, 1850);
  cam(t1937, P.rio, 9, 2.0);
  pin(t1937 + 0.6, P.rio, 'Rio de Janeiro, capital');
  person(A('o presidente getulio vargas') - 0.2, A('o governo olhou com') - 0.2, 'Getúlio Vargas', 'Presidente, depois ditador', { img: 'vargas', zoom: 1.25, top: 0.02, years: 'Golpe do Estado Novo, 1937' });
  pill(A('ele queria um brasil'), A('o governo olhou com') - 0.1, 'Um só jeito, uma só língua');
  const tDesc = A('o governo olhou com');
  route('olhar', tDesc + 0.2, tDesc + 3.2, [P.rio, [-46, -25.5], [-49, -27], P.blumenau], { icon: 'eyes', size: 80, color: C.urucum, hide: A('isso nao era novidade') + 1 });
  follow(tDesc + 0.2, 'olhar', 12, 1.0);
  unpin(tDesc);
  for (const s of ['RS', 'SC']) hl(A('as colonias do sul'), A('mas agora o governo') + 1, s, ALEMAO, { alpha: 0.75, pulse: C.urucum });
  pill(A('para o governo'), A('isso nao era novidade') - 0.1, 'Uma "ameaça" para o governo', C.urucum);
  const t1917 = A('ja em mil novecentos e dezessete');
  cam(t1917, [-50.5, -27.3], 7, 1.4);
  year(t1917 + 0.4, 1917, 1937);
  label(t1917, A('mas agora o governo') + 1, [-50.6, -27.2], 'Santa Catarina', { size: 30 });
  pill(A('santa catarina mandou'), A('mas agora o governo') - 0.1, 'Escolas estrangeiras: português obrigatório');
  const t1938 = A('em maio de mil novecentos');
  cam(A('mas agora o governo'), [-51, -27.5], 12, 1.8);
  year(t1938 + 0.4, 1938, 1917);
  num(A('saiu a lei numero'), A('ela mandava as escolas') + 0.3, 406, 'decreto de maio de 1938', { prefix: 'Lei nº ', color: C.urucum });
  row(A('ela mandava as escolas'), A('em mil novecentos e trinta e nove vieram') - 0.2, [
    { img: 'school', label: 'Só português', at: A('ela mandava as escolas') + 0.2 }, { img: 'man_teacher', label: 'Professor nato', at: A('os professores tinham') },
    { img: 'newspaper', label: 'Com licença', at: A('e livros revistas'), cross: A('so com licenca') }, { img: 'locked', label: 'Controle', at: A('so com licenca') }
  ]);
  const t1939 = A('em mil novecentos e trinta e nove vieram');
  year(t1939 + 0.3, 1939, 1938);
  S.iconSwarms.push({ t0: A('as escolas que nao obedeciam'), t1: A('na pratica era obrigar'), img: 'school', n: 24, lon: -51.5, lat: -27.8, r: 2.6, size: 44, dur: 0.8, seed: 44 });
  S.iconSwarms.push({ t0: A('foram fechadas'), t1: A('na pratica era obrigar'), img: 'locked', n: 24, lon: -51.5, lat: -27.8, r: 2.6, size: 34, dur: 1.6, seed: 44 });
  icon(A('os livros em alemao foram'), A('chamaram isso de campanha') + 1.5, 'books', [-51.0, -27.4], { size: 130, dy: -60, cross: A('foram recolhidos') + 0.2 });
  pill(A('chamaram isso de campanha'), A('na pratica era obrigar') - 0.1, 'Campanha de nacionalização', C.urucum);
  pill(A('na pratica era obrigar'), A('para muitos pais') - 0.1, 'Todo mundo obrigado a falar português');
  sicon(A('para muitos pais'), A('e isso ainda era so') - 0.1, 'brokenheart', W / 2, H / 2 - 30, { size: 170 });
  pill(A('para muitos pais'), A('e isso ainda era so') - 0.1, 'Ver tudo desmoronar');

  // ===== VII · A GUERRA =====
  const t1942 = A('e isso ainda era so');
  chap(A('em mil novecentos e quarenta e dois o clima'), 'VII', 'A guerra');
  year(A('em mil novecentos e quarenta e dois o clima'), 1942, 1939);
  cam(t1942, [-18, 15], 120, 2.4);
  hl(t1942 + 1, A('e quem falava alemao virou'), 'Brazil', C.verde, { alpha: 0.7 });
  hl(t1942 + 1, A('e quem falava alemao virou'), 'Germany', ALEMAO);
  route('relacao', A('o brasil rompeu'), A('o brasil rompeu') + 1.6, [P.rio, [-20, 10], P.berlim], { color: C.urucum, hide: A('em agosto daquele ano') + 0.5 });
  sicon(A('relacoes com'), A('em agosto daquele ano') + 0.2, 'brokenheart', W / 2 - 20, H / 2 - 40, { size: 130 });
  pill(A('em janeiro de mil novecentos'), A('em agosto daquele ano') - 0.1, 'Janeiro: relações rompidas');
  const tSub = A('em agosto daquele ano');
  cam(tSub, [-36.5, -12.5], 12, 2.2);
  label(tSub + 1, A('e quem falava alemao virou'), [-40.5, -12], 'Bahia', { size: 26 });
  label(tSub + 1, A('e quem falava alemao virou'), [-37.4, -10.6], 'Sergipe', { size: 22 });
  const navios = [[-36.6, -11.3], [-37.0, -12.0], [-36.0, -10.6], [-37.7, -13.1], [-38.3, -13.9], [-35.6, -10.1]];
  const tAfund = A('afundaram seis');
  navios.forEach((n, i) => icon(tSub + 0.8 + i * 0.25, A('e quem falava alemao virou'), 'ship', n, { size: 80, sink: tAfund + 0.3 + i * 0.35 }));
  navios.forEach((n, i) => icon(tAfund + 0.4 + i * 0.35, tAfund + 2.6 + i * 0.35, 'fire', n, { size: 70 }));
  num(A('navios brasileiros em apenas'), A('muita gente morreu') + 0.5, 6, 'navios afundados em 5 dias', { color: C.urucum, x: W / 2 + 330 });
  pill(A('muita gente morreu'), A('no dia vinte e dois de agosto') - 0.1, 'O povo foi para a rua', C.urucum);
  const tGuerra = A('no dia vinte e dois de agosto');
  cam(tGuerra - 0.3, [-18, 15], 120, 2.0);
  sicon(tGuerra + 0.3, A('e quem falava alemao virou'), 'swords', W / 2 - 20, H / 2 - 40, { size: 170 });
  pill(tGuerra + 0.2, A('e quem falava alemao virou') - 0.1, '22 de agosto: guerra contra a Alemanha', C.urucum);
  const tAlvo = A('e quem falava alemao virou');
  cam(tAlvo, [-51, -27.5], 11, 2.0);
  for (const s of ['RS', 'SC', 'PR']) hl(tAlvo + 0.5, A('em joinville um jornal de'), s, ALEMAO, { alpha: 0.7, pulse: C.urucum });
  sicon(A('virou alvo'), A('mesmo quem nao tinha') + 1, 'bullseye', W / 2, H / 2 - 40, { size: 160 });
  pill(A('mesmo quem nao tinha'), A('havia gente ligada') - 0.1, 'Mesmo quem nada tinha a ver com o nazismo');
  pill(A('havia gente ligada'), A('passou a ser proibido') - 0.1, 'Nazistas eram minoria');
  row(A('passou a ser proibido'), A('e muita gente perdeu') - 0.2, [
    { img: 'speech_balloon', label: 'Falar em público', at: A('passou a ser proibido'), cross: A('alemao em publico') },
    { img: 'scroll', label: 'Salvo-conduto', at: A('o salvo conduto') }, { img: 'shortcake', label: 'Festas em casa', at: A('festa de aniversario'), cross: A('festa de aniversario') + 0.6 }
  ]);
  pill(A('quem tinha nascido na alemanha'), A('em alguns estados') - 0.1, 'Papel da polícia até para viajar');
  pill(A('em alguns estados'), A('e muita gente perdeu') - 0.1, 'Reuniões proibidas até dentro de casa', C.urucum);
  row(A('e muita gente perdeu'), A('em joinville um jornal de') - 0.1, [
    { img: 'house', label: 'Bens perdidos', at: A('perdeu bens') }, { img: 'fire', label: 'Casas apedrejadas', at: A('teve casa apedrejada') }, { img: 'chains', label: 'Prisões', at: A('e gente presa') }
  ]);
  const tCafe = A('em joinville um jornal de');
  cam(tCafe, P.joinville, 2.5, 2.0);
  pin(tCafe + 0.5, P.joinville, 'Joinville');
  year(A('mil novecentos e quarenta e tres'), 1943, 1942);
  icon(A('deu a noticia'), A('imagine ser punido') + 0.5, 'newspaper', P.joinville, { dx: -200, dy: -110, size: 120, label: 'JORNAL, 1943' });
  icon(A('pessoas presas'), A('imagine ser punido') + 0.5, 'police_officer', P.joinville, { dx: 30, dy: -170, size: 120 });
  icon(A('em um cafe'), A('imagine ser punido') + 0.5, 'hot_beverage', P.joinville, { dx: 220, dy: -110, size: 110, label: 'NO CAFÉ' });
  pill(A('imagine ser punido'), A('e mesmo assim a lingua') - 0.1, 'Punido por falar a língua da mãe');

  // ===== VIII · A LÍNGUA DE CASA =====
  const tCasa = A('e mesmo assim a lingua');
  noYear(tCasa);
  pill(tCasa, A('o governo podia fechar') - 0.1, 'E mesmo assim, a língua não morreu');
  cam(tCasa, P.saoLeopoldo, 6, 2.0);
  unpin(tCasa);
  const tFech = A('o governo podia fechar');
  row(tFech, A('o alemao que a maioria') - 0.1, [
    { img: 'school', label: 'Escola', at: tFech + 0.3, cross: A('fechar escola') + 0.5 }, { img: 'books', label: 'Livro', at: A('recolher livro'), cross: A('recolher livro') + 0.5 },
    { img: 'newspaper', label: 'Jornal', at: A('e parar jornal'), cross: A('e parar jornal') + 0.5 }, { img: 'speech_balloon', label: 'Conversa?', at: A('mas como e que se fecha') }
  ]);
  pill(A('mas como e que se fecha'), A('o alemao que a maioria') - 0.1, 'Como se fecha uma conversa?', C.ipe);
  const tRoca = A('o alemao que a maioria');
  chap(tRoca, 'VIII', 'A língua de casa');
  cam(A('era um jeito de falar'), P.hunsruck, 7, 2.4);
  hl(A('era um jeito de falar'), A('o estudioso cleo') + 0.5, 'Germany', ALEMAO, { alpha: 0.5 });
  blob(A('trazido por quem saiu'), A('o estudioso cleo') + 0.5, P.hunsruck, 0.55, C.ipe);
  pin(A('trazido por quem saiu'), P.hunsruck, 'Hunsrück');
  word(A('a lingua e chamada de'), A('o estudioso cleo') + 2.2, 'LÍNGUA', 'Hunsrik', { pt: 'do alemão Hunsrückisch', meaning: 'o jeito de falar do Hunsrück', icon: 'speech_balloon' });
  const tCleo = A('o estudioso cleo');
  cam(tCleo, [-51.6, -29.0], 5, 2.0);
  pin(tCleo + 0.5, P.portoAlegre, 'UFRGS, Porto Alegre');
  person(tCleo + 0.2, A('ele mostra que essa lingua') + 1.5, 'Cléo Altenhofen', 'Linguista · UFRGS', { icon: 'graduation_cap', side: 'right' });
  row(A('quase ninguem escrevia'), A('aprendia se com a mae') + 0.3, [
    { img: 'pencil', label: 'Escrita', at: A('quase ninguem escrevia'), cross: A('quase ninguem escrevia') + 0.6 }, { img: 'house', label: 'Casa', at: A('era lingua de casa') },
    { img: 'cooking', label: 'Cozinha', at: A('de cozinha') }, { img: 'ear_of_corn', label: 'Lavoura', at: A('e de lavoura') }
  ]);
  sicon(A('aprendia se com a mae'), A('e essa lingua nao ficou') - 0.1, 'woman', W / 2 - 80, H / 2 - 20, { size: 170 });
  sicon(A('aprendia se com a mae') + 0.3, A('e essa lingua nao ficou') - 0.1, 'child', W / 2 + 90, H / 2 + 20, { size: 130 });
  pill(A('aprendia se com a mae'), A('e essa lingua nao ficou') - 0.1, 'Aprendia-se com a mãe, não na escola');
  pill(A('e essa lingua nao ficou'), A('por isso o hunsrik de hoje') - 0.1, 'Pegou palavras do português');
  pill(A('por isso o hunsrik de hoje'), A('a lei atingiu') - 0.1, 'Um alemão feito aqui');
  hl(A('por isso o hunsrik de hoje'), A('a lei atingiu'), 'RS', ALEMAO, { alpha: 0.6 });
  const tAting = A('a lei atingiu');
  row(tAting + 0.3, A('mas a conversa da mae') - 0.1, [
    { img: 'school', label: 'Escola', at: A('escola livro'), cross: A('escola livro') + 0.3 }, { img: 'books', label: 'Livro', at: A('livro jornal'), cross: A('livro jornal') + 0.3 }, { img: 'newspaper', label: 'Jornal', at: A('jornal mas a conversa') - 0.3, cross: A('jornal mas a conversa') }
  ]);
  const tFog = A('mas a conversa da mae');
  cam(tFog, P.saoLeopoldo, 1.6, 2.2);
  icon(tFog, A('claro que muita gente teve') - 0.2, 'house', P.saoLeopoldo, { size: 150, dy: -30 });
  icon(A('com o filho'), A('claro que muita gente teve') - 0.2, 'cooking', P.saoLeopoldo, { size: 90, dx: 120, dy: -110 });
  icon(A('ficou escondida'), A('claro que muita gente teve') - 0.2, 'police_officer', P.saoLeopoldo, { size: 90, dx: -260, dy: 40, grey: A('o guarda nao chegava') });
  pill(A('ficou escondida'), A('a proibicao derrubou') - 0.1, 'Onde o guarda não chegava');
  pill(A('a proibicao derrubou'), A('claro que muita gente teve') - 0.1, 'A língua estava dentro de casa', C.verde);

  // ===== IX · ESCONDIDA, MAS VIVA =====
  const tMedo = A('claro que muita gente teve');
  chap(tMedo, 'IX', 'Escondida, mas viva');
  cam(tMedo, P.saoLeopoldo, 3, 1.8);
  sicon(A('claro que muita gente teve'), A('mas muita gente tambem deu') , 'fearful_face', W / 2, H / 2 - 30, { size: 160 });
  row(A('dentro de casa as familias'), A('alguns professores tambem') - 0.1, [
    { img: 'door', label: 'Portas fechadas', at: A('de portas fechadas') - 0.8 }, { img: 'muted', label: 'Mais baixo', at: A('so que mais baixo') }, { img: 'store', label: 'Na rua: português', at: A('na rua e no comercio') }
  ]);
  const tTaq = A('alguns professores tambem');
  cam(A('um estudo sobre o vale'), P.lajeado, 3, 2.0);
  pin(A('um estudo sobre o vale') + 0.4, P.lajeado, 'Vale do Taquari');
  year(A('de mil novecentos e quarenta ela'), 1940, 1943);
  icon(A('ela falava de um professor'), A('o pior e que o medo') - 0.2, 'man_teacher', P.lajeado, { size: 130, dx: 150, dy: -110, label: 'AULA EM ALEMÃO' });
  pill(tTaq, A('um estudo sobre o vale') - 0.1, 'Alguns professores resistiram', C.verde);
  const tDen = A('o pior e que o medo');
  noYear(tDen);
  cam(A('em itapiranga os pesquisadores'), P.itapiranga, 3, 2.0);
  pin(A('em itapiranga os pesquisadores') + 0.4, P.itapiranga, 'Itapiranga');
  icon(A('o povo era unido'), A('muita crianca aprendeu') - 0.2, 'busts', P.itapiranga, { size: 120, dx: -150, dy: -110 });
  icon(A('passou a reinar'), A('muita crianca aprendeu') - 0.2, 'eyes', P.itapiranga, { size: 100, dx: 150, dy: -110 });
  pill(A('porque quem denunciava'), A('muita crianca aprendeu') - 0.1, 'Denúncias de gente do próprio grupo', C.urucum);
  pill(A('muita crianca aprendeu'), A('uma senhora contou') - 0.1, 'Português na marra');
  sicon(A('muita crianca aprendeu'), A('uma senhora contou') - 0.1, 'child', W / 2 - 60, H / 2 - 30, { size: 150 });
  sicon(A('muita crianca aprendeu') + 0.3, A('uma senhora contou') - 0.1, 'school', W / 2 + 80, H / 2 - 30, { size: 130 });
  S.quotes.push({ t0: A('uma senhora contou'), t1: A('assim a lingua passou') - 0.1, text: '1938 foi um ano\nmuito triste.', by: 'Relato de uma moradora', icon: 'old_woman' });
  pill(A('assim a lingua passou'), A('so que ela saiu dali') - 0.1, 'Escondida, mas viva', C.verde);

  // ===== X · O MEDO FICOU =====
  const tMach = A('so que ela saiu dali');
  chap(tMach, 'X', 'O medo ficou');
  cam(tMach, [-51.5, -28.3], 7, 2.0);
  year(A('a guerra acabou em'), 1945, 1940);
  sicon(A('a guerra acabou em'), A('mas o medo ficou') + 0.3, 'dove', W / 2 - 80, H / 2 - 30, { size: 150 });
  sicon(A('mas o medo ficou'), A('depois dela algumas') - 0.1, 'fearful_face', W / 2 + 90, H / 2 - 30, { size: 150 });
  row(A('depois dela algumas'), A('muita gente passou a ter') - 0.1, [
    { img: 'school', label: 'Escolas', at: A('retomar as') }, { img: 'performing_arts', label: 'Clubes', at: A('e os clubes') }
  ]);
  pill(A('mas ja nao era como'), A('muita gente passou a ter') - 0.1, 'Já não era como antes');
  sicon(A('muita gente passou a ter'), A('muitos pais passaram') - 0.1, 'shushing_face', W / 2, H / 2 - 30, { size: 170 });
  pill(A('muita gente passou a ter'), A('muitos pais passaram') - 0.1, 'Vergonha da própria língua');
  sicon(A('muitos pais passaram'), A('foi assim que a lingua ficou') - 0.1, 'woman', W / 2 - 90, H / 2 - 30, { size: 160 });
  sicon(A('portugues com os filhos'), A('foi assim que a lingua ficou') - 0.1, 'child', W / 2 + 80, H / 2 + 10, { size: 120 });
  pill(A('muitos pais passaram'), A('assim uma geracao inteira') - 0.1, 'Pais falando português com os filhos');
  pill(A('assim uma geracao inteira'), A('foi assim que a lingua ficou') - 0.1, 'Entendia alemão, mas não falava');
  pill(A('foi assim que a lingua ficou'), A('oitenta anos depois') - 0.1, 'Não foi só a lei: foram o medo e a vergonha');
  sicon(A('oitenta anos depois'), A('uma proibicao nao precisa') - 0.1, 'shushing_face', W / 2, H / 2 - 30, { size: 150 });
  pill(A('oitenta anos depois'), A('uma proibicao nao precisa') - 0.1, '80 anos depois, ainda há silêncio');
  S.quotes.push({ t0: A('uma proibicao nao precisa'), t1: A('mas a historia nao terminou') - 0.1, text: 'Uma proibição não precisa\ndurar para sempre.\nSó precisa ensinar a ter vergonha.' });

  // ===== XI · OS POMERANOS =====
  const tPom2 = A('mas a historia nao terminou');
  chap(A('os pomeranos vieram de'), 'XI', 'Os pomeranos');
  cam(A('os pomeranos vieram de') - 0.6, P.pomerania, 14, 2.2);
  blob(A('os pomeranos vieram de'), A('na europa o pomerano') + 4, P.pomerania, 1.6, POM, { grey: A('deixou de ser falado') + 0.4 });
  pin(A('os pomeranos vieram de') + 0.4, P.pomerania, 'Pomerânia');
  label(A('perto do mar baltico') , A('muitos foram para o') + 0.5, [17.5, 56.2], 'Mar Báltico', { size: 26, color: C.branco, alpha: 0.75 });
  const tES = A('muitos foram para o');
  unpin(tES);
  route('pom', tES, tES + 3.6, [P.pomerania, [8, 55.5], [1.5, 51.0], [-8, 46], [-22, 20], [-30, -2], [-37, -17], P.jetiba], { icon: 'ship', color: C.lilas });
  route('pom2', tES + 2.2, tES + 4.4, [[-37, -17], [-45, -26], P.pomerode], { color: C.lilas });
  follow(tES, 'pom', 40, 0.8);
  const tESc = A('moravam em colonias so deles');
  cam(tESc, [-45, -24], 18, 1.6);
  blob(tESc - 0.5, A('na europa o pomerano'), P.jetiba, 0.6, POM, { minPx: 34 });
  blob(tESc - 0.3, A('na europa o pomerano'), P.pomerode, 0.5, POM, { minPx: 34 });
  label(tESc, A('na europa o pomerano'), [-40.7, -19.1], 'Espírito Santo', { size: 24 });
  label(tESc, A('na europa o pomerano'), [-49.4, -27.9], 'Santa Catarina', { size: 24 });
  pill(A('e isso deixou os brasileiros'), A('depois muitos falantes') - 0.1, 'Desconfiança na época de Vargas', C.urucum);
  row(A('depois muitos falantes'), A('pesquisadores dizem que a ditadura') - 0.1, [
    { img: 'pencil', label: 'Quase não escrita', at: A('quase ninguem escrevia e por') }, { img: 'ear_of_corn', label: 'Vida na roça', at: A('viverem na') }
  ]);
  pill(A('ainda sofreram preconceito'), A('pesquisadores dizem que a ditadura') - 0.1, 'Preconceito');
  year(A('depois de mil novecentos e sessenta'), 1964, 1945);
  pill(A('pesquisadores dizem que a ditadura'), A('mas olha o que aconteceu') - 0.1, 'A ditadura militar também pesou');
  const tOlha = A('mas olha o que aconteceu');
  noYear(tOlha);
  cam(tOlha, [-12, 20], 112, 2.2);
  blob(tOlha, A('na casa dela') + 6, P.pomerania, 1.6, POM, { grey: A('deixou de ser falado') + 0.4, minPx: 60 });
  icon(A('deixou de ser falado') + 0.3, A('no brasil ele continua') - 0.1, 'cross_mark', P.pomerania, { size: 90 });
  blob(A('no brasil ele continua'), A('em santa maria de jetiba no espirito') + 0.5, P.jetiba, 1.2, POM, { minPx: 60 });
  icon(A('no brasil ele continua') + 0.2, A('os estudiosos calculam') , 'check_mark_button', P.jetiba, { size: 90 });
  pill(A('no brasil ele continua'), A('os estudiosos calculam') - 0.1, 'No Brasil, continua vivo', C.verde);
  const tCalc = A('os estudiosos calculam');
  cam(tCalc, P.jetiba, 6, 2.0);
  num(A('cento e vinte mil'), A('e cerca de trezentos mil') - 0.1, 120000, 'descendentes de pomeranos no ES', { prefix: '≈', color: POM });
  num(A('e cerca de trezentos mil'), A('em santa maria de jetiba no espirito') - 0.1, 300000, 'descendentes de pomeranos no Brasil', { prefix: '≈', color: POM, from: 120000 });
  hl(A('cento e vinte mil'), A('em santa maria de jetiba no espirito'), 'ES', POM, { alpha: 0.8 });
  const tJet = A('em santa maria de jetiba no espirito');
  cam(tJet, P.jetiba, 2.4, 2.0);
  pin(tJet + 0.4, P.jetiba, 'Santa Maria de Jetibá');
  S.dots.push({ t0: A('oitenta e cinco por'), t1: A('uma lingua que quase some') - 0.1, total: 100, colored: 85, color: POM, colorAt: 0.6, title: 'Santa Maria de Jetibá', legend: [[POM, '85% falam melhor pomerano'], ['#cfd3dc', 'outros']], cell: 40 });
  pill(A('essa foi a parte que mais'), A('uma lingua que quase some') - 0.1, 'A parte que mais surpreendeu');
  const tOce = A('uma lingua que quase some');
  cam(tOce, [-12, 18], 112, 2.0);
  unpin(tOce);
  blob(tOce, A('e hoje o que sobrou'), P.pomerania, 1.6, C.cinza, { minPx: 60 });
  blob(tOce + 0.8, A('e hoje o que sobrou'), P.jetiba, 1.2, POM, { minPx: 70 });
  route('ponte', tOce + 0.5, tOce + 3.5, [P.pomerania, [-5, 40], [-25, 5], P.jetiba], { color: C.lilas, hide: A('e hoje o que sobrou') });
  pill(A('fica de pe do outro'), A('e quem salvou foi') - 0.1, 'De pé do outro lado do oceano', C.verde);
  pill(A('e quem salvou foi'), A('e hoje o que sobrou') - 0.1, 'Salva por gente simples');

  // ===== XII · O QUE SOBROU =====
  const tSob = A('e hoje o que sobrou');
  chap(tSob, 'XII', 'O que sobrou');
  cam(tSob, [-51, -28], 9, 2.0);
  pill(A('primeiro esta na boca'), A('a cuca vem de') - 0.1, 'Na boca do povo');
  word(A('a cuca vem de'), A('o chope vem de') - 0.15, 'ALEMÃO', 'Kuchen', { pt: 'cuca', meaning: 'bolo', icon: 'shortcake' });
  word(A('o chope vem de'), A('o chucrute e o') - 0.15, 'ALEMÃO', 'Schoppen', { pt: 'chope', meaning: 'uma medida de bebida', icon: 'beer_mug' });
  word(A('o chucrute e o'), A('e a chimia') - 0.15, 'ALEMÃO', 'Sauerkraut', { pt: 'chucrute', meaning: 'repolho fermentado', icon: 'leafy_green' });
  word(A('e a chimia'), A('depois tem as pessoas') - 0.1, 'ALEMÃO DAQUI', 'Schmier', { pt: 'chimia', meaning: 'doce de fruta para o pão', icon: 'jar' });
  const tPes = A('depois tem as pessoas');
  cam(tPes, [-54, -28], 16, 2.0);
  person(A('segundo o estudioso cleo'), A('mais de um milhao de pessoas falam') + 0.8, 'Cléo Altenhofen', 'Linguista · UFRGS', { icon: 'graduation_cap', side: 'right' });
  num(A('mais de um milhao de pessoas falam'), A('e o brasil tem mais') - 0.1, 1000000, 'falam hunsrik no Sul e nos vizinhos', { prefix: '+', color: ALEMAO });
  for (const s of SUL) hl(A('mais de um milhao de pessoas falam'), A('em dois mil e doze'), s, ALEMAO, { alpha: 0.7 });
  hl(A('nos paises vizinhos') - 0.3, A('em dois mil e doze'), 'Argentina', ALEMAO, { alpha: 0.35 });
  hl(A('nos paises vizinhos') - 0.3, A('em dois mil e doze'), 'Paraguay', ALEMAO, { alpha: 0.35 });
  num(A('e o brasil tem mais'), A('em dois mil e doze') - 0.1, 5000000, 'descendentes de alemães no Brasil', { prefix: '+', color: C.ipe });
  const t2012 = A('em dois mil e doze');
  year(t2012 + 0.3, 2012, 1964);
  cam(t2012, [-52.5, -29.8], 6, 1.6);
  hl(t2012 + 0.3, A('em santa maria do herval') + 0.5, 'RS', ALEMAO, { alpha: 0.8 });
  icon(A('declarou o hunsrik patrimonio'), A('em santa maria do herval'), 'trophy', [-52.6, -29.6], { size: 140, label: 'PATRIMÔNIO CULTURAL DO RS' });
  const tOf = A('em santa maria do herval');
  noYear(tOf);
  cam(tOf, [-47, -24.5], 19, 2.0);
  const listT1 = A('mas nao esta tudo ganho');
  S.lists.push({ t0: tOf, t1: listT1 - 0.2, title: 'Línguas cooficiais', items: [
    { name: 'Santa Maria do Herval (RS)', sub: 'hunsrik', color: ALEMAO, at: tOf + 0.3 },
    { name: 'Antônio Carlos (SC)', sub: 'hunsrik', color: ALEMAO, at: A('em antonio carlos') },
    { name: 'Santa Maria de Jetibá (ES)', sub: 'pomerano · desde 2009', color: POM, at: A('em santa maria de jetiba o pomerano') },
    { name: 'Pomerode (SC)', sub: 'pomerano · desde 2017', color: POM, at: A('e em pomerode') }
  ] });
  pin(tOf + 0.3, P.herval, 'Santa Maria do Herval');
  pin(A('em antonio carlos'), P.antonioCarlos, 'Antônio Carlos');
  pin(A('em santa maria de jetiba o pomerano'), P.jetiba, 'Santa Maria de Jetibá');
  year(A('desde dois mil e nove'), 2009, 2000);
  pin(A('e em pomerode'), P.pomerode, 'Pomerode');
  year(A('desde dois mil e dezessete'), 2017, 2009);
  const tEsc2 = A('em algumas escolas as criancas');
  noYear(tEsc2);
  cam(tEsc2, [-51, -27.5], 10, 2.0);
  row(tEsc2 + 0.2, A('mas nao esta tudo ganho') - 0.1, [
    { img: 'school', label: 'Escola', at: tEsc2 + 0.3 }, { img: 'child', label: 'Crianças', at: A('as criancas aprendem') }, { img: 'old_woman', label: 'Avós', at: A('os avos quase perderam') }
  ]);
  pill(A('a lingua que foi proibida virou'), A('mas nao esta tudo ganho') - 0.1, 'A língua proibida virou patrimônio', C.verde);
  pill(A('mas nao esta tudo ganho'), A('por isso ainda existe') - 0.1, 'Os jovens falam cada vez menos', C.urucum);
  pill(A('por isso ainda existe'), A('entao como o alemao sobreviveu') - 0.1, 'Gente trabalhando para a língua não sumir');

  // ===== FECHAMENTO =====
  const tFim = A('entao como o alemao sobreviveu');
  unpin(tFim);
  cam(tFim, [-50.5, -27.5], 16, 2.2);
  for (const s of SUL) hl(tFim + 0.3, A('no proximo video'), s, ALEMAO, { alpha: 0.65 });
  row(A('na escola na igreja'), A('a lingua de casa') - 0.1, [
    { img: 'school', label: 'Escola', at: A('na escola na igreja') }, { img: 'church', label: 'Igreja', at: A('na igreja no clube') },
    { img: 'performing_arts', label: 'Clube', at: A('no clube e no jornal') }, { img: 'newspaper', label: 'Jornal', at: A('e no jornal e quando') }
  ].map(it => ({ ...it, cross: A('tudo isso foi proibido') + 0.3 })));
  sicon(A('a lingua de casa'), A('se voce gostou') - 0.1, 'house', W / 2, H / 2 - 50, { size: 220 });
  pill(A('a lingua de casa'), A('no fim o que salvou') - 0.1, 'A língua de casa', C.verde);
  pill(A('no fim o que salvou'), A('se voce gostou') - 0.1, 'Gente comum, conversando com os filhos', C.verde);
  pill(A('se voce gostou'), A('no proximo video') - 0.1, 'Inscreva-se para os próximos mapas', C.ipe);
  const tNext = A('no proximo video');
  cam(tNext, [95, 8], 75, 3.0);
  hl(tNext + 1.2, 99999, 'Timor-Leste', C.verde);
  blob(tNext + 1.0, 99999, P.macau, 1.0, C.verde, { minPx: 30 });
  blob(tNext + 1.3, 99999, P.goa, 1.0, C.verde, { minPx: 30 });
  label(A('macau goa'), 99999, [113.55, 24.3], 'Macau', { size: 28, color: C.branco, alpha: 0.95 });
  label(A('goa e timor'), 99999, [73.9, 17.6], 'Goa', { size: 28, color: C.branco, alpha: 0.95 });
  label(A('e timor leste'), 99999, [125.7, -11.2], 'Timor-Leste', { size: 28, color: C.branco, alpha: 0.95 });
  S.ends.push({ t0: A('e o portugues que quase sumiu') - 0.4, t1: A('porque a raiz de tudo') - 0.2, next: 'Macau, Goa e Timor-Leste:\no português que quase sumiu' });
  S.ends.push({ t0: A('porque a raiz de tudo') });

  CAM.sort((a, b) => a.t - b.t);
  return S;
}
function swarm(S, t0, t1, place, r, n, color, dur, seed) { S.swarms.push({ t0, t1, lon: place[0], lat: place[1], r, n, color, dur, seed }); }
