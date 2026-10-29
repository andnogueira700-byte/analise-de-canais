// Roteiro de cenas do vídeo "Por que ninguém fala holandês em Pernambuco", sincronizado pela legenda.
// A voz é rápida: as cenas trocam a cada 2 ou 3 segundos e a câmera não para.
const MOS_USE = ['mundo', 'atlantico', 'brasil', 'europa', 'nordeste', 'nepe', 'pe', 'recife', 'guianas', 'guine', 'novayork', 'iberia'];
const FOTOS = [['nassau', 'fotos/nassau.jpg'], ['post', 'fotos/post.jpg'], ['vieira', 'fotos/vieira.jpg'], ['negreiros', 'fotos/negreiros.jpg'],
  ['dias', 'fotos/dias.jpg'], ['camarao', 'fotos/camarao.jpg'], ['guararapes', 'fotos/guararapes.jpg'], ['sinagoga', 'fotos/sinagoga.jpg'], ['mauricia', 'fotos/mauricia.jpg']];
// marcadores próprios deste vídeo (desenhados no estilo Lucide) e outros do Lucide
Object.assign(MK, { acucar: 'x-acucar', boi: 'x-boi', ponte: 'x-ponte', sinagoga: 'x-sinagoga', ouro: 'coins', moeda: 'hand-coins', fabrica: 'factory',
  bandeira: 'flag', forte: 'castle', coroa: 'crown', soldado: 'shield', espada: 'swords', canhao: 'flame', idiomas: 'languages', estrela: 'telescope',
  pintura: 'palette', livro: 'book-open', jardim: 'trees', rua: 'map', familia: 'users', juros: 'percent', queda: 'trending-down', balanca: 'scale',
  pena: 'feather', igreja: 'church', cruz: 'cross', ancora: 'anchor', mundo: 'globe', papel: 'file-text', loja: 'store', aperto: 'handshake', peixe: 'fish' });
for (const n of ['heart-handshake', 'baby', 'crown', 'mountain', 'link', 'factory', 'message-circle', 'tent', 'bomb', 'flag', 'shield', 'clock', 'building-2', 'landmark', 'search']) MK[n] = n;
const P = { // lugares [lon, lat]
  recife: [-34.877, -8.063], olinda: [-34.855, -8.010], salvador: [-38.51, -12.97], amsterda: [4.90, 52.37], lisboa: [-9.14, 38.72],
  madri: [-3.70, 40.42], elmina: [-1.35, 5.08], paramaribo: [-55.20, 5.85], novaYork: [-74.0, 40.71], guararapes: [-34.945, -8.155],
  tabocas: [-35.29, -8.12], taborda: [-34.886, -8.078], mauricia: [-34.879, -8.069], bomJesus: [-34.871, -8.061], londres: [-0.12, 51.5],
  engenho: [-35.05, -8.0], aldeia: [-35.4, -7.6], cabo: [-35.03, -8.29]
};
function buildScene() {
  const S = { highlights: [], blobs: [], swarms: [], labels: [], icons: [], iconSwarms: [], pins: [], years: [], chapters: [], pills: [], numbers: [], words: [], people: [], dots: [], rows: [], lists: [], quotes: [], titles: [], ends: [], photos: [] };
  // abaixo de ~1,6° o relevo do Recife (quase ao nível do mar) vira quadradinhos, então a câmera não chega mais perto que isso
  const cam = (t, place, span, d = 1.4) => (span = Math.max(span, 1.6), CAM.push(Array.isArray(place) ? { t, lon: place[0], lat: place[1], span, d } : { t, ...place, span, d }));
  const follow = (t, id, span, d = 0.8) => CAM.push({ t, follow: id, span, d });
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
  const label = (t0, t1, place, text, o = {}) => S.labels.push({ t0, t1, lon: place[0], lat: place[1], text, ...o });
  const route = (id, t0, t1, pts, o = {}) => ROUTES[id] = buildRoute({ t0, t1, pts, hide: t1 + 5, ...o });
  const person = (t0, t1, name, role, o = {}) => S.people.push({ t0, t1, name, role, ...o });
  const word = (t0, t1, lang, wordTxt, o = {}) => S.words.push({ t0, t1, lang, word: wordTxt, ...o });
  const row = (t0, t1, items, o = {}) => S.rows.push({ t0, t1, items, ...o });
  const photo = (t0, t1, img, caption, o = {}) => S.photos.push({ t0, t1, img, caption, ...o });
  const swarm = (t0, t1, place, r, n, color, dur, seed, o = {}) => S.swarms.push({ t0, t1, lon: place[0], lat: place[1], r, n, color, dur, seed, ...o });
  const A = at;
  // cores: cada lugar citado em sequência tem uma cor diferente da anterior
  const HOL = C.caju, POR = C.verde, ESP = C.urucum, PE = C.ipe, SUR = C.acai, GAN = C.jambo, NY = C.lilas;
  const NORDESTE = ['PE', 'PB', 'RN', 'AL'];

  // ===== GANCHO =====
  cam(0, [-38, -8.5], 20, 0.1);
  cam(0.2, [-37.2, -8.4], 13, 3.6);
  hl(0.5, A('entao me responde') - 0.2, 'PE', HOL);
  label(0.9, A('entao me responde') - 0.2, [-38.4, -8.35], 'Pernambuco', { size: 30 });
  num(A('por vinte e quatro anos') + 0.4, A('o governo era da') + 1.4, 24, 'anos sob a bandeira da Holanda', { color: HOL });
  pill(A('o governo era da'), A('quem mandava no acucar') - 0.1, 'Governo holandês', HOL);
  icon(A('quem mandava no acucar'), A('entao me responde') - 0.2, 'acucar', P.engenho, { size: 96, dx: -150, dy: -40 });
  icon(A('quase tanto quanto ouro'), A('entao me responde') - 0.2, 'ouro', P.engenho, { size: 96, dx: -20, dy: -40 });
  pill(A('quase tanto quanto ouro'), A('os documentos do governo') - 0.1, 'Açúcar: quase tanto quanto ouro', PE);
  icon(A('os documentos do governo'), A('entao me responde') - 0.2, 'papel', P.recife, { size: 96, dx: -60, dy: 60, label: 'EM HOLANDÊS' });
  const tPerg = A('entao me responde');
  cam(tPerg, P.recife, 2.2, 1.8);
  pin(tPerg + 0.2, P.recife, 'Recife');
  pill(tPerg + 0.2, A('eu sempre achei que a resposta') - 0.1, 'Por que ninguém fala holandês aqui?');
  const tAchei = A('eu sempre achei que a resposta');
  cam(tAchei, [-25, 18], 120, 2.0);
  unpin(tAchei);
  hl(tAchei + 0.4, A('mas descobri que o portugues'), 'Netherlands', HOL, { solid: true });
  hl(tAchei + 0.4, A('mas descobri que o portugues'), 'PE', PE);
  route('volta', A('perderam a guerra') + 0.2, A('perderam a guerra') + 2.4, [P.recife, [-28, 4], [-18, 30], [-6, 46], P.amsterda], { icon: 'ship', color: HOL });
  pill(A('perderam a guerra'), A('mas descobri que o portugues') - 0.1, 'Perderam a guerra e foram embora?');
  const tNunca = A('mas descobri que o portugues');
  cam(tNunca, [-37, -8.3], 12, 1.6);
  hl(tNunca + 0.3, A('e a explicacao passa'), 'PE', POR);
  word(tNunca + 0.4, A('e a explicacao passa') - 0.1, 'A LÍNGUA DO POVO', 'Português', { meaning: 'nunca perdeu, nem com os holandeses no governo', icon: 'message-circle' });
  const tTres = A('e a explicacao passa');
  cam(tTres, P.recife, 1.2, 1.6);
  row(tTres + 0.2, A('no fim do video eu') - 0.1, [
    { img: 'juros', label: 'Uma dívida', at: A('por uma divida') }, { img: 'ponte', label: 'Uma ponte', at: A('por uma ponte') },
    { img: 'boi', label: 'Um boi que voa', at: A('e por um boi') }
  ]);
  pill(A('no fim do video eu'), A('para entender a gente') - 0.1, 'No fim: um lugar do Recife ainda de pé', C.verde);
  icon(A('no fim do video eu') + 0.4, A('para entender a gente'), 'sinagoga', P.bomJesus, { size: 96 });
  // cartão de título
  const tTit = A('para entender a gente');
  S.titles.push({ t0: tTit, t1: A('no comeco do seculo') - 0.2, text: 'Por que ninguém fala\nholandês em Pernambuco?' });

  // ===== CONTEXTO: AÇÚCAR, 1580, A COMPANHIA =====
  const tSec = A('no comeco do seculo');
  cam(tSec - 0.3, [-20, 22], 115, 2.0);
  year(tSec + 0.3, 1600, 1500);
  hl(tSec + 0.5, A('os holandeses compravam'), 'Brazil', PE, { alpha: 0.75 });
  route('acucar', A('que o brasil mandava') - 0.3, A('pernambuco era uma') + 0.2, [P.recife, [-28, 5], [-20, 25], P.lisboa], { icon: 'acucar', size: 72, color: PE });
  const tProd = A('pernambuco era uma');
  cam(tProd, [-37, -8.2], 12, 1.4);
  hl(tProd + 0.2, A('os holandeses compravam'), 'PE', HOL);
  S.iconSwarms.push({ t0: tProd + 0.4, t1: A('os holandeses compravam') + 0.4, img: 'acucar', n: 9, lon: -35.6, lat: -8.2, r: 0.9, size: 56, dur: 1.6, seed: 7 });
  const tCompr = A('os holandeses compravam');
  cam(tCompr, [-12, 26], 105, 1.8);
  route('refino', tCompr + 0.2, tCompr + 2.6, [P.recife, [-28, 6], [-20, 30], [-8, 46], P.amsterda], { icon: 'acucar', size: 72, color: HOL });
  hl(tCompr + 1.6, A('em mil quinhentos e oitenta'), 'Netherlands', HOL, { solid: true });
  row(A('refinavam e revendiam') - 0.2, A('em mil quinhentos e oitenta') - 0.1, [
    { img: 'acucar', label: 'Compravam', at: A('os holandeses compravam') + 0.3 }, { img: 'fabrica', label: 'Refinavam', at: A('refinavam e revendiam') },
    { img: 'ouro', label: 'Lucravam', at: A('ganhavam muito dinheiro') }
  ]);
  const t1580 = A('em mil quinhentos e oitenta');
  cam(t1580, [-4, 44], 30, 1.8);
  year(t1580 + 0.3, 1580, 1600);
  hl(t1580 + 0.5, A('por isso os holandeses perderam') + 0.3, 'Portugal', POR);
  hl(t1580 + 0.9, A('por isso os holandeses perderam') + 0.3, 'Spain', ESP);
  icon(A('a ter o mesmo rei'), A('so que a espanha estava') + 0.5, 'coroa', P.madri, { size: 104, label: 'UM SÓ REI' });
  label(t1580 + 0.6, A('so que a espanha estava') - 0.2, [-8.2, 39.6], 'Portugal', { size: 24 });
  label(t1580 + 1.0, A('so que a espanha estava') - 0.2, [-3.6, 39.6], 'Espanha', { size: 26 });
  const tGuer = A('so que a espanha estava');
  cam(tGuer, [0, 47], 34, 1.6);
  hl(tGuer, A('a resposta deles foi direta'), 'Netherlands', HOL, { solid: true });
  route('guerra1', tGuer + 0.3, tGuer + 1.6, [P.madri, [0.5, 46], P.amsterda], { color: ESP, hide: A('a resposta deles foi direta') });
  icon(A('em guerra com a holanda'), A('a resposta deles foi direta'), 'espada', [2.5, 47.0], { size: 100 });
  pill(A('por isso os holandeses perderam'), A('a resposta deles foi direta') - 0.1, 'Sem açúcar português para a Holanda', ESP);
  const tResp = A('a resposta deles foi direta');
  cam(tResp, [-22, 20], 110, 1.8);
  route('tomar', A('iam tomar a terra') - 0.3, A('iam tomar a terra') + 2.2, [P.amsterda, [-8, 44], [-22, 18], [-30, 0], P.recife], { icon: 'ship', color: HOL, hide: A('em mil seiscentos e vinte e um') + 0.5 });
  pill(A('se nao podiam comprar'), A('em mil seiscentos e vinte e um') - 0.1, 'Tomar a terra onde o açúcar nascia', HOL);
  hl(A('iam tomar a terra') + 1.4, A('em mil seiscentos e vinte e um'), 'PE', PE);
  // a companhia
  const t1621 = A('em mil seiscentos e vinte e um');
  cam(t1621, P.amsterda, 9, 1.6);
  year(t1621 + 0.2, 1621, 1580);
  pin(t1621 + 0.3, P.amsterda, 'Amsterdã');
  hl(t1621, A('em mil seiscentos e vinte e quatro'), 'Netherlands', HOL, { solid: true });
  word(A('criaram a companhia') - 0.2, A('pense numa empresa') + 0.6, 'HOLANDÊS', 'WIC', { pt: 'Cia. das Índias Ocidentais', meaning: 'West-Indische Compagnie', icon: 'ship' });
  row(A('pense numa empresa'), A('em mil seiscentos e vinte e quatro') - 0.1, [
    { img: 'ship', label: 'Navios', at: A('com navios') }, { img: 'soldado', label: 'Soldados', at: A('soldados e donos') }, { img: 'ouro', label: 'Lucro', at: A('so queriam lucro') }
  ]);
  const t1624 = A('em mil seiscentos e vinte e quatro');
  unpin(t1624);
  cam(t1624, [-22, 18], 112, 1.6);
  year(t1624 + 0.3, 1624, 1621);
  route('salv', t1624 + 0.1, t1624 + 2.0, [P.amsterda, [-8, 42], [-24, 10], [-33, -10], P.salvador], { icon: 'ship', color: HOL });
  cam(t1624 + 1.4, P.salvador, 5, 1.2);
  hl(t1624 + 1.6, A('em mil seiscentos e trinta ela voltou'), 'BA', SUR);
  pin(A('tomou salvador') + 0.6, P.salvador, 'Salvador');
  icon(A('mas perdeu a cidade'), A('em mil seiscentos e trinta ela voltou'), 'cross_mark', P.salvador, { size: 90, dx: 110, dy: -50 });
  pill(A('mas perdeu a cidade'), A('em mil seiscentos e trinta ela voltou') - 0.1, 'Perdeu Salvador em 1625');
  // 1630: Pernambuco
  const t1630 = A('em mil seiscentos e trinta ela voltou');
  unpin(t1630);
  cam(t1630, [-36.4, -7.8], 12, 1.6);
  year(t1630 + 0.3, 1630, 1624);
  hl(t1630 + 0.4, A('olinda caiu em fevereiro'), 'PE', PE);
  const frota = [[-33.4, -6.4], [-33.1, -7.0], [-33.7, -7.5], [-33.0, -7.8], [-33.5, -8.3], [-33.2, -8.8]];
  frota.forEach((n, i) => icon(A('eram mais de sessenta') + i * 0.2, A('olinda caiu em fevereiro') + 0.5, 'ship', n, { size: 70, sea: true }));
  num(A('eram mais de sessenta'), A('e cerca de sete mil') - 0.1, 60, 'navios da companhia', { prefix: '+', color: HOL });
  num(A('e cerca de sete mil'), A('olinda caiu em fevereiro') + 0.2, 7000, 'homens', { prefix: '≈', color: HOL, from: 60 });
  const tOli = A('olinda caiu em fevereiro');
  cam(tOli, [-34.9, -8.04], 0.55, 1.6);
  pin(tOli + 0.2, P.olinda, 'Olinda');
  blob(tOli + 0.3, A('dessa vez os holandeses ficaram') + 3, P.olinda, 0.012, HOL, { minPx: 40 });
  pin(A('o recife caiu em marco'), P.recife, 'Recife');
  blob(A('o recife caiu em marco') + 0.3, A('dessa vez os holandeses ficaram') + 3, P.recife, 0.012, HOL, { minPx: 40 });
  icon(A('dessa vez os holandeses ficaram'), A('muita gente acha') + 0.2, 'bandeira', P.recife, { size: 96, dx: -110, dy: 20, label: 'FICARAM' });
  // a grande pergunta
  const tAcha = A('muita gente acha');
  noYear(tAcha);
  cam(tAcha, [-37, -8.3], 12, 1.6);
  unpin(tAcha);
  hl(tAcha, A('entao a grande pergunta'), 'PE', HOL, { alpha: 0.6 });
  pill(tAcha + 0.2, A('mas pense bem') - 0.1, 'O português sobreviveu só porque a Holanda perdeu?');
  num(A('em vinte e quatro anos um governo'), A('entao a grande pergunta') - 0.1, 24, 'anos para mudar a língua', { color: HOL });
  icon(A('e ele nao mudou'), A('entao a grande pergunta'), 'idiomas', [-36.3, -8.3], { size: 104, label: 'NÃO MUDOU' });
  const tPerg2 = A('entao a grande pergunta');
  cam(tPerg2, [-36.2, -8.1], 4, 1.4);
  hl(tPerg2, A('quem chegou foi uma empresa'), 'PE', PE);
  row(A('quem mudou'), A('a primeira razao ja responde') - 0.1, [
    { img: 'bandeira', label: 'A bandeira', at: A('so a bandeira') }, { img: 'familia', label: 'O povo?', at: A('ou o povo tambem') }
  ]);
  pill(A('a primeira razao ja responde'), A('quem chegou foi uma empresa') - 0.1, 'Dez razões', C.ipe);

  // ===== I · UMA EMPRESA, NÃO UM POVO =====
  const tEmp = A('quem chegou foi uma empresa');
  chap(A('a primeira razao e a mais'), 'I', 'Uma empresa, não um povo');
  cam(tEmp, [-20, 22], 110, 1.8);
  hl(tEmp + 0.3, A('ela mandou soldados'), 'Netherlands', HOL, { solid: true });
  hl(tEmp + 0.3, A('pausa o video'), 'PE', PE, { alpha: 0.8 });
  route('empresa', A('ela mandou soldados'), A('ela mandou soldados') + 2.4, [P.amsterda, [-8, 44], [-22, 16], [-30, -2], P.recife], { icon: 'ship', color: HOL });
  row(A('ela mandou soldados'), A('os holandeses tentaram atrair') - 0.1, [
    { img: 'soldado', label: 'Soldados', at: A('ela mandou soldados') + 0.1 }, { img: 'papel', label: 'Funcionários', at: A('funcionarios pastores') },
    { img: 'igreja', label: 'Pastores', at: A('pastores e comerciantes') }, { img: 'loja', label: 'Comerciantes', at: A('e comerciantes') },
    { img: 'familia', label: 'Famílias', at: A('mas nao mandou familias'), cross: A('mas nao mandou familias') + 0.6 }
  ]);
  pill(A('os holandeses tentaram atrair'), A('antes de eu te contar') - 0.1, 'Atrair colonos quase não deu certo', HOL);
  // quiz
  const tQuiz = A('antes de eu te contar');
  cam(tQuiz, [-36.0, -8.1], 3.6, 1.6);
  pin(tQuiz + 0.3, P.recife, 'Recife');
  pill(A('pausa o video'), A('quantos holandeses civis') - 0.1, 'Pausa o vídeo e chuta!', C.ipe);
  word(A('quantos holandeses civis'), A('dez mil') - 0.1, 'QUIZ', '???', { meaning: 'civis holandeses em Pernambuco, sem contar soldados', icon: 'search' });
  num(A('dez mil'), A('cinquenta mil') - 0.05, 10000, 'Dez mil?', { color: C.cinza, x: W / 2 - 330 });
  num(A('cinquenta mil'), A('os historiadores falam') - 0.1, 50000, 'Cinquenta mil?', { color: C.cinza, x: W / 2 + 330 });
  num(A('os historiadores falam'), A('com tao pouca gente') - 0.1, 3000, 'civis holandeses', { prefix: '≈', color: HOL, from: 50000 });
  swarm(A('os historiadores falam') + 0.5, A('com tao pouca gente') + 1, [-34.95, -8.06], 0.09, 30, HOL, 1.5, 3, { px: 6 });
  pill(A('numa terra enorme'), A('com tao pouca gente') - 0.1, 'Cabiam numa cidade pequena');
  const tPouca = A('com tao pouca gente');
  cam(tPouca, [-36.5, -8.3], 6, 1.6);
  swarm(tPouca + 0.2, A('mas se os holandeses eram poucos') + 0.4, [-36.5, -8.3], 1.5, 160, POR, 3, 9);
  pill(tPouca + 0.2, A('acertou o numero') - 0.1, 'Impossível trocar a língua de alguém', POR);
  pill(A('acertou o numero'), A('mas se os holandeses eram poucos') - 0.1, 'Comenta o seu chute!', C.ipe);

  // ===== II · CAMADA POR CIMA =====
  const tCam = A('mas se os holandeses eram poucos');
  unpin(tCam);
  chap(A('a segunda razao e facil'), 'II', 'Uma camada por cima');
  cam(tCam, [-36.0, -8.2], 3.2, 1.6);
  hl(A('o dominio holandes foi uma camada'), A('quem eram os moradores'), 'PE', HOL, { lift: 26 });
  pill(A('o dominio holandes foi uma camada'), A('embaixo a sociedade') - 0.1, 'Por cima: o governo holandês', HOL);
  pill(A('embaixo a sociedade'), A('quem eram os moradores') - 0.1, 'Embaixo: a mesma sociedade', POR);
  const tMor = A('quem eram os moradores');
  S.dots.push({ t0: tMor, t1: A('pense numa cidade em que') - 0.2, total: 100, colored: 3, color: HOL, base: POR, colorAt: A('os holandeses mandavam mas viviam') - tMor, speed: 0.015,
    title: 'Quem vivia no Brasil holandês', legend: [[POR, 'o povo daqui'], [HOL, 'holandeses']], cell: 40 });
  swarm(A('a maioria era de portugueses'), A('pense numa cidade em que'), [-35.8, -8.0], 1.0, 70, POR, 1.5, 4);
  swarm(A('os africanos escravizados'), A('pense numa cidade em que'), [-35.4, -8.4], 0.7, 40, C.jambo, 1.2, 5);
  swarm(A('e os indigenas'), A('pense numa cidade em que'), [-36.6, -7.9], 0.8, 30, C.turq, 1.0, 6);
  pill(A('os holandeses mandavam mas viviam'), A('pense numa cidade em que') - 0.1, 'Um mar de gente falando português', POR);
  const tPref = A('pense numa cidade em que');
  cam(tPref, P.recife, 0.5, 1.6);
  icon(A('o prefeito muda'), A('mas a feira') + 0.3, 'landmark', P.recife, { size: 96, dx: -150, dy: -40, label: 'PREFEITO NOVO' });
  row(A('mas a feira'), A('era assim no recife') - 0.1, [
    { img: 'loja', label: 'A feira', at: A('mas a feira') }, { img: 'house', label: 'A porta de casa', at: A('a conversa na porta') },
    { img: 'igreja', label: 'A reza', at: A('a reza e o namoro') }, { img: 'heart-handshake', label: 'O namoro', at: A('e o namoro') }
  ]);
  pill(A('era assim no recife'), A('as criancas nasciam') - 0.1, 'Era assim no Recife');
  const tCri = A('as criancas nasciam');
  icon(tCri, A('para a lingua mudar') + 0.3, 'house', P.recife, { size: 104, dx: 120, dy: -30, label: 'EM CASA: PORTUGUÊS' });
  icon(A('passa de pai para filho'), A('para a lingua mudar') + 0.3, 'baby', P.recife, { size: 90, dx: 260, dy: 40 });
  icon(A('mesmo com a bandeira nova'), A('para a lingua mudar') + 0.3, 'forte', P.recife, { size: 90, dx: -140, dy: 40, label: 'BANDEIRA NOVA' });
  const tMud = A('para a lingua mudar');
  row(tMud, A('os holandeses nao fizeram nenhuma') + 1.4, [
    { img: 'bandeira', label: 'Trocar o governo', at: A('nao basta trocar') + 0.2, cross: A('nao basta trocar') + 0.9 }, { img: 'familia', label: 'Trocar o povo', at: A('e preciso trocar o povo') },
    { img: 'idiomas', label: 'Convencer o povo', at: A('ou convencer o povo') }
  ]);
  pill(A('os holandeses nao fizeram nenhuma'), A('quem fazia o acucar') - 0.1, 'Não fizeram nenhuma das duas', HOL);

  // ===== III · O ENGENHO =====
  const tEng = A('quem fazia o acucar');
  unpin(tEng);
  chap(A('a terceira razao comeca'), 'III', 'O engenho');
  cam(tEng, [-35.3, -8.1], 1.4, 1.8);
  word(A('engenho engenho era'), A('ele mandava nas terras') - 0.1, 'PORTUGUÊS', 'Engenho', { meaning: 'fazenda de cana onde se fazia o açúcar', icon: 'factory' });
  S.iconSwarms.push({ t0: A('se plantava cana'), t1: A('quando os holandeses chegaram'), img: 'acucar', n: 10, lon: -35.25, lat: -8.05, r: 0.25, size: 54, dur: 1.5, seed: 17 });
  person(A('o dono era o senhor'), A('quando os holandeses chegaram') - 0.1, 'Senhor de engenho', 'Dono da fazenda', { icon: 'crown', side: 'right' });
  row(A('ele mandava nas terras'), A('quando os holandeses chegaram') - 0.1, [
    { img: 'mountain', label: 'Terras', at: A('nas terras') }, { img: 'acucar', label: 'Plantações', at: A('nas plantacoes') }, { img: 'link', label: 'Pessoas escravizadas', at: A('e nas pessoas escravizadas') }
  ], { y: 600 });
  const tParad = A('quando os holandeses chegaram');
  cam(tParad, [-35.4, -8.1], 2.0, 1.6);
  S.iconSwarms.push({ t0: A('muitos engenhos estavam parados'), t1: A('a companhia vendeu os'), img: 'fabrica', n: 7, lon: -35.3, lat: -8.05, r: 0.4, size: 56, dur: 1.2, seed: 23 });
  pill(A('muitos engenhos estavam parados'), A('a companhia vendeu os') - 0.1, 'Engenhos parados pela guerra', ESP);
  row(A('a companhia vendeu os'), A('isso quer dizer uma coisa') - 0.1, [
    { img: 'factory', label: 'Vendeu engenhos', at: A('a companhia vendeu os') + 0.2 }, { img: 'moeda', label: 'Emprestou dinheiro', at: A('e emprestou dinheiro') },
    { img: 'crown', label: 'Portugueses ficaram', at: A('muitos senhores de engenho eram portugueses') }
  ]);
  const tPrec = A('isso quer dizer uma coisa');
  cam(tPrec, [-35.2, -8.05], 1.2, 1.4);
  pill(A('para ter acucar os holandeses'), A('e a rotina do engenho') - 0.1, 'Sem os senhores, sem açúcar', HOL);
  icon(A('e a rotina do engenho'), A('e uma parte triste') + 0.3, 'message-circle', P.engenho, { size: 100, label: 'TUDO EM PORTUGUÊS' });
  pill(A('e uma parte triste'), A('para trazer mais gente') - 0.1, 'Todo esse açúcar dependia de gente escravizada', C.urucum);
  const tMina = A('para trazer mais gente');
  cam(tMina, [-17, 1], 52, 1.8);
  year(A('em mil seiscentos e trinta e sete o forte'), 1637, 1630);
  hl(tMina + 0.5, A('essa foi a parte que mais me surpreendeu'), 'Ghana', GAN);
  hl(tMina + 0.5, A('essa foi a parte que mais me surpreendeu'), 'PE', PE);
  pin(A('o forte de sao jorge'), P.elmina, 'São Jorge da Mina');
  route('mina', A('o forte de sao jorge') + 0.6, A('o forte de sao jorge') + 3.0, [P.elmina, [-12, 0], [-25, -6], P.recife], { color: GAN, hide: A('quem conquistou a terra') + 1 });
  icon(A('o forte de sao jorge') + 0.3, A('essa foi a parte que mais me surpreendeu'), 'forte', P.elmina, { size: 96, dx: 0, dy: -120 });
  const tSurp = A('essa foi a parte que mais me surpreendeu');
  noYear(tSurp);
  unpin(tSurp);
  cam(tSurp, [-36.2, -8.2], 4.5, 1.6);
  pill(A('quem conquistou a terra'), A('se voce e de pernambuco') - 0.1, 'Quem conquistou dependia de quem já morava', C.verde);
  hl(A('quem conquistou a terra'), A('a quarta razao tem nome'), 'PE', POR);
  pill(A('se voce e de pernambuco'), A('porque agora e hora') - 0.1, 'É de Pernambuco? Conta nos comentários!', C.ipe);

  // ===== IV · MAURÍCIO DE NASSAU =====
  const tNas = A('a quarta razao tem nome');
  chap(tNas, 'IV', 'Maurício de Nassau');
  cam(tNas, [5, 50], 22, 1.8);
  hl(tNas + 0.4, A('chegou em mil seiscentos e trinta e sete'), 'Germany', SUR);
  hl(tNas + 0.4, A('chegou em mil seiscentos e trinta e sete'), 'Netherlands', HOL, { solid: true });
  person(A('mauricio de nassau ele era'), A('nassau era esperto') - 0.1, 'Maurício de Nassau', 'Conde alemão a serviço da WIC', { img: 'nassau', icon: 'bust', zoom: 1.5, top: 0.06, years: '1604 a 1679' });
  const t1637 = A('chegou em mil seiscentos e trinta e sete');
  cam(t1637, [-22, 18], 110, 1.4);
  year(t1637 + 0.3, 1637, 1630);
  route('nassau', t1637, t1637 + 2.2, [P.amsterda, [-8, 44], [-22, 16], [-30, -2], P.recife], { icon: 'ship', color: SUR, hide: A('nassau era esperto') + 1 });
  follow(t1637 + 0.1, 'nassau', 70, 0.6);
  pill(A('como governador'), A('nassau era esperto') - 0.1, 'Governador do Brasil holandês', SUR);
  const tEsp = A('nassau era esperto');
  cam(tEsp, P.recife, 1.4, 1.4);
  pin(tEsp + 0.2, P.recife, 'Recife');
  row(A('sabia que sem os senhores'), A('isso se chama tolerancia') - 0.1, [
    { img: 'crown', label: 'Senhores de engenho', at: A('sabia que sem os senhores') }, { img: 'heart-handshake', label: 'Tratou bem', at: A('entao tratou bem') },
    { img: 'cruz', label: 'Missa católica', at: A('deixou os catolicos rezarem') }
  ]);
  word(A('isso se chama tolerancia'), A('ele tambem criou conselhos') - 0.1, 'PORTUGUÊS', 'Tolerância religiosa', { meaning: 'cada um segue a sua fé sem perseguição', icon: 'heart-handshake' });
  row(A('ele tambem criou conselhos'), A('nassau reformou o recife') - 0.1, [
    { img: 'balanca', label: 'Conselhos', at: A('ele tambem criou conselhos') + 0.2 }, { img: 'bandeira', label: 'Holandeses', at: A('sentavam holandeses') },
    { img: 'familia', label: 'Portugueses', at: A('e portugueses') }, { img: 'message-circle', label: 'Ouvir o português', at: A('ou seja o governo precisava') }
  ]);
  const tRef = A('nassau reformou o recife');
  unpin(tRef);
  cam(tRef, [-34.885, -8.06], 0.18, 1.8);
  photo(tRef + 0.2, A('montou ate um observatorio') - 0.1, 'mauricia', 'Cidade Maurícia e o Recife', { sub: 'Mapa holandês, por volta de 1640' });
  icon(A('construiu pontes'), A('fundou a cidade mauricia') + 1, 'ponte', [-34.876, -8.064], { size: 90 });
  icon(A('ruas e jardins'), A('fundou a cidade mauricia') + 1, 'jardim', P.mauricia, { size: 90, dx: -40, dy: 40 });
  label(A('fundou a cidade mauricia'), A('montou ate um observatorio'), [-34.884, -8.075], 'Cidade Maurícia', { size: 26 });
  pill(A('que alguns especialistas'), A('montou ate um observatorio') - 0.1, 'Primeira cidade planejada do Brasil?');
  const tObs = A('montou ate um observatorio');
  icon(tObs, A('trouxe pintores') + 0.3, 'estrela', P.mauricia, { size: 100, label: 'OBSERVATÓRIO' });
  pill(A('o primeiro das americas'), A('trouxe pintores') - 0.1, 'O primeiro das Américas feito por europeus', SUR);
  photo(A('trouxe pintores'), A('e agora o boi') - 0.1, 'post', 'Engenho em Pernambuco', { sub: 'Frans Post, século 17', side: 'left' });
  icon(A('trouxe pintores'), A('e agora o boi'), 'pintura', P.recife, { size: 90, dx: 140 });
  icon(A('e cientistas como'), A('e agora o boi'), 'livro', P.recife, { size: 90, dx: 140, dy: 120, label: 'MARCGRAVE' });
  // o boi voador
  const tBoi = A('e agora o boi');
  cam(tBoi, [-34.877, -8.064], 0.09, 1.6);
  year(A('em fevereiro de mil seiscentos e quarenta e quatro nassau'), 1644, 1637);
  icon(A('inaugurou uma grande ponte'), A('eu adoro essa historia'), 'ponte', [-34.876, -8.0635], { size: 104, label: 'PONTE, 1644' });
  route('boi', A('ia voar sobre o rio'), A('um monte de gente foi') + 0.6, [[-34.84, -8.08], [-34.88, -8.04], [-34.93, -8.075]], { icon: 'boi', size: 96, color: C.branco, hide: A('eu adoro essa historia') });
  S.iconSwarms.push({ t0: A('um monte de gente foi'), t1: A('eu adoro essa historia'), img: 'familia', n: 10, lon: -34.93, lat: -8.07, r: 0.08, size: 54, dur: 1.2, seed: 31 });
  pill(A('o boi na verdade'), A('e quem queria assistir') - 0.1, 'Era um boi puxado por cordas e roldanas');
  icon(A('e quem queria assistir'), A('eu adoro essa historia'), 'moeda', [-34.8785, -8.066], { size: 96, label: 'PEDÁGIO' });
  pill(A('e quem queria assistir'), A('eu adoro essa historia') - 0.1, 'Para ver, pagava para passar na ponte', C.ipe);
  const tAdoro = A('eu adoro essa historia');
  cam(tAdoro, [-20, 20], 110, 1.8);
  route('nassauVolta', A('nassau foi embora') - 0.2, A('nassau foi embora') + 2.2, [P.recife, [-30, -2], [-22, 16], [-8, 44], P.amsterda], { icon: 'ship', color: SUR });
  pill(A('e quando ele saiu'), A('mas antes de chegar') - 0.1, 'E quando ele saiu, o clima mudou', ESP);
  pill(A('mas antes de chegar'), A('a quinta razao envolve') - 0.1, 'Os tradutores dessa história');

  // ===== V · OS JUDEUS =====
  const tJud = A('a quinta razao envolve');
  unpin(tJud);
  chap(tJud, 'V', 'Os judeus do Recife');
  cam(tJud, [-15, 22], 100, 1.6);
  year(A('em mil seiscentos e trinta e cinco comecaram'), 1635, 1644);
  route('judeus', A('comecaram a chegar judeus'), A('comecaram a chegar judeus') + 2.6, [P.amsterda, [-8, 44], [-22, 16], [-30, -2], P.recife], { icon: 'sinagoga', size: 80, color: NY });
  hl(A('muitos tinham origem portuguesa') - 0.3, A('a companhia incentivou') + 0.4, 'Portugal', POR);
  label(A('muitos tinham origem portuguesa'), A('a companhia incentivou'), [-8.2, 39.6], 'Portugal', { size: 24 });
  const tInc = A('a companhia incentivou');
  cam(tInc, P.recife, 0.35, 1.8);
  pin(tInc + 0.2, P.bomJesus, 'Recife');
  row(tInc + 0.2, A('em mil seiscentos e trinta e seis') - 0.1, [{ img: 'loja', label: 'Comércio', at: A('entendesse de comercio') }, { img: 'ouro', label: 'Dinheiro', at: A('e de dinheiro') }]);
  const t1636 = A('em mil seiscentos e trinta e seis');
  year(t1636 + 0.2, 1636, 1635);
  cam(t1636, P.bomJesus, 0.12, 1.6);
  icon(A('fundaram a primeira sinagoga'), A('esses judeus falavam') + 0.5, 'sinagoga', P.bomJesus, { size: 104, label: '1ª SINAGOGA DAS AMÉRICAS' });
  word(A('sinagoga e o templo'), A('aqui eles podiam abrir') - 0.1, 'HEBRAICO', 'Kahal Zur Israel', { pt: 'Rocha de Israel', meaning: 'a sinagoga do Recife', icon: 'sinagoga' });
  pill(A('isso mesmo no recife'), A('aqui eles podiam abrir') - 0.1, 'No Recife!', NY);
  row(A('aqui eles podiam abrir'), A('por isso serviam de ponte') - 0.1, [
    { img: 'loja', label: 'Lojas', at: A('abrir lojas') }, { img: 'aperto', label: 'Negócios', at: A('fazer negocios') },
    { img: 'idiomas', label: 'Português + holandês', at: A('falavam portugues e holandes') }
  ]);
  const tTrad = A('por isso serviam de ponte');
  unpin(tTrad);
  cam(tTrad, [-34.88, -8.06], 0.3, 1.4);
  noYear(tTrad);
  icon(tTrad, A('ja sao cinco razoes'), 'bandeira', P.recife, { size: 90, dx: -240, dy: -10, label: 'GOVERNO' });
  icon(tTrad + 0.3, A('ja sao cinco razoes'), 'idiomas', P.recife, { size: 100, dy: -30, label: 'TRADUTORES' });
  icon(tTrad + 0.6, A('ja sao cinco razoes'), 'familia', P.recife, { size: 90, dx: 240, dy: -10, label: 'POVO' });
  pill(A('quem tinha que se adaptar'), A('ja sao cinco razoes') - 0.1, 'Quem se adaptava era o governo, não o povo', POR);
  pill(A('ja sao cinco razoes'), A('a sexta razao vem') - 0.1, 'Até os pastores aprenderam português', C.ipe);

  // ===== VI · A RELIGIÃO =====
  const tRel = A('a sexta razao vem');
  unpin(tRel);
  chap(tRel, 'VI', 'Os pastores');
  cam(tRel, [-35.6, -7.4], 4, 1.6);
  word(A('calvinismo e uma religiao'), A('a igreja deles queria') - 0.1, 'RELIGIÃO', 'Calvinismo', { meaning: 'ramo protestante da igreja dos holandeses', icon: 'igreja' });
  const tInd = A('a igreja deles queria');
  for (const s of ['PB', 'RN']) hl(tInd + 0.2, A('em mil seiscentos e quarenta e um') + 0.3, s, s === 'PB' ? C.turq : SUR, { alpha: 0.85 });
  hl(tInd + 0.2, A('em mil seiscentos e quarenta e um') + 0.3, 'PE', PE, { alpha: 0.85 });
  icon(A('converter os indigenas'), A('em mil seiscentos e quarenta e um'), 'tent', P.aldeia, { size: 96, label: 'ALDEIA' });
  row(A('so que os indigenas falavam'), A('em mil seiscentos e quarenta e um') - 0.1, [{ img: 'message-circle', label: 'Tupi', at: A('falavam tupi') }, { img: 'message-circle', label: 'Português', at: A('tambem sabiam portugues') }], { y: 620 });
  const t1641 = A('em mil seiscentos e quarenta e um');
  cam(t1641, [-15, 22], 100, 1.6);
  year(t1641 + 0.3, 1641, 1636);
  hl(t1641 + 0.3, A('esse era em tupi'), 'Netherlands', HOL, { solid: true });
  route('catecismo', A('foi impresso na holanda') + 0.4, A('catecismo e um livrinho') + 1.2, [P.amsterda, [-8, 44], [-22, 16], [-30, -2], P.recife], { icon: 'livro', size: 80, color: HOL });
  word(A('catecismo e um livrinho'), A('esse era em tupi') - 0.1, 'RELIGIÃO', 'Catecismo', { meaning: 'livrinho de perguntas e respostas sobre a fé', icon: 'livro' });
  const tTupi = A('esse era em tupi');
  cam(tTupi, [-35.4, -7.6], 3, 1.4);
  S.lists.push({ t0: tTupi, t1: A('os holandeses ate tentaram') - 0.1, title: 'Catecismo de 1641', items: [
    { name: 'Tupi', sub: 'a língua das aldeias', color: C.turq, at: tTupi + 0.1 },
    { name: 'Português', sub: 'a língua do povo', color: POR, at: A('em portugues e em holandes') },
    { name: 'Holandês', sub: 'a língua do governo', color: HOL, at: A('e em holandes') }
  ] });
  const tProf = A('os holandeses ate tentaram');
  icon(tProf, A('mesmo assim o holandes nao pegou'), 'school', P.aldeia, { size: 96, label: 'ESCOLA NA ALDEIA' });
  num(A('mandaram nove professores'), A('mesmo assim o holandes nao pegou') - 0.1, 9, 'professores com as famílias', { color: HOL });
  pill(A('mesmo assim o holandes nao pegou'), A('no total quarenta e sete') - 0.1, 'Mesmo assim, o holandês não pegou', ESP);
  num(A('no total quarenta e sete'), A('seis cuidaram so') - 0.1, 47, 'pastores no Nordeste', { color: HOL });
  num(A('seis cuidaram so'), A('mas em nenhum momento') - 0.1, 6, 'só para os indígenas', { color: C.turq, from: 47 });
  pill(A('mas em nenhum momento'), A('se o video esta te fazendo') - 0.1, 'Ninguém trocou de língua', POR);
  pill(A('se o video esta te fazendo'), A('agora vem a virada') - 0.1, 'Deixa o seu like!', C.ipe);
  cam(A('se o video esta te fazendo'), [-36.4, -7.6], 6, 2.4);

  // ===== VII · A DÍVIDA =====
  const tVir = A('agora vem a virada');
  cam(tVir, [-36.2, -8.2], 3.5, 1.4);
  pill(tVir, A('a setima razao e a divida') - 0.1, 'A virada', ESP);
  const tDiv = A('a setima razao e a divida');
  chap(tDiv, 'VII', 'A dívida');
  year(A('em mil seiscentos e quarenta a companhia'), 1640, 1641);
  icon(A('a companhia comecou a ter'), A('juros e o valor extra'), 'queda', P.recife, { size: 100, dx: -120, label: 'DINHEIRO EM FALTA' });
  const tPreco = A('o preco do acucar caiu');
  cam(tPreco, [-12, 26], 105, 1.6);
  hl(tPreco + 0.3, A('ai a empresa passou'), 'Netherlands', HOL, { solid: true });
  route('precocai', tPreco, tPreco + 1.6, [P.recife, [-24, 12], [-10, 40], P.amsterda], { icon: 'queda', size: 72, color: ESP, hide: A('juros e o valor extra') });
  const tCobr = A('ai a empresa passou');
  cam(tCobr, [-35.3, -8.1], 2.4, 1.4);
  S.iconSwarms.push({ t0: A('a cobrar os emprestimos'), t1: A('imagine dever dinheiro'), img: 'moeda', n: 8, lon: -35.3, lat: -8.05, r: 0.5, size: 54, dur: 1.4, seed: 41 });
  pill(A('e com juros altos'), A('juros e o valor extra') - 0.1, 'Cobrança com juros altos', ESP);
  word(A('juros e o valor extra'), A('imagine dever dinheiro') - 0.1, 'PORTUGUÊS', 'Juros', { meaning: 'o valor extra pago a quem emprestou dinheiro', icon: 'juros' });
  pill(A('imagine dever dinheiro'), A('nesse mesmo ano de mil seiscentos e quarenta') - 0.1, 'Devendo ao estrangeiro que manda no seu país', ESP);
  const tRest = A('nesse mesmo ano de mil seiscentos e quarenta');
  cam(tRest, [-5, 41], 22, 1.6);
  hl(tRest + 0.4, A('nassau ainda tentou'), 'Portugal', POR);
  hl(tRest + 0.4, A('portugal se separou') + 0.6, 'Spain', ESP, { alpha: 0.6 });
  icon(A('voltou a ter rei proprio'), A('nassau ainda tentou'), 'coroa', P.lisboa, { size: 104, label: 'REI PRÓPRIO' });
  label(tRest + 0.6, A('nassau ainda tentou'), [-4.0, 40.0], 'Espanha', { size: 24 });
  pill(A('isso deu ainda mais forca'), A('nassau ainda tentou') - 0.1, 'Mais força para quem queria Portugal de volta', POR);
  const tSeg = A('nassau ainda tentou');
  cam(tSeg, [-20, 20], 110, 1.6);
  person(tSeg, A('os senhores de engenho perderam') - 0.1, 'Maurício de Nassau', 'Chamado de volta pela WIC', { img: 'nassau', icon: 'bust', zoom: 1.5, top: 0.06, side: 'right' });
  year(A('ele foi embora em mil seiscentos e quarenta e quatro'), 1644, 1640);
  route('saida', A('ele foi embora em mil seiscentos'), A('ele foi embora em mil seiscentos') + 2.4, [P.recife, [-30, -2], [-22, 16], [-8, 44], P.amsterda], { icon: 'ship', color: SUR });
  const tBomba = A('os senhores de engenho perderam');
  cam(tBomba, [-35.4, -8.1], 2.4, 1.6);
  hl(tBomba, A('a oitava razao e a revolta'), 'PE', ESP, { pulse: C.ipe });
  icon(A('estava armada a bomba'), A('a oitava razao e a revolta'), 'bomb', P.engenho, { size: 104 });
  pill(A('e quem acendeu o pavio'), A('a oitava razao e a revolta') - 0.1, 'Quem acendeu o pavio: os senhores de engenho', ESP);

  // ===== VIII · A REVOLTA =====
  const tRev = A('a oitava razao e a revolta');
  chap(tRev, 'VIII', 'A revolta');
  cam(tRev, [-35.5, -8.2], 2.4, 1.4);
  year(A('em mil seiscentos e quarenta e cinco os senhores'), 1645, 1644);
  swarm(A('se levantaram contra'), A('quem liderou'), [-35.4, -8.1], 0.6, 90, POR, 1.6, 12);
  row(A('nao era so por dinheiro'), A('quem liderou') - 0.1, [{ img: 'moeda', label: 'Dinheiro', at: A('nao era so por dinheiro') }, { img: 'cruz', label: 'Fé católica', at: A('os catolicos tambem reclamavam') }]);
  const tLid = A('quem liderou');
  person(A('joao fernandes vieira'), A('henrique dias filho') - 0.1, 'João Fernandes Vieira', 'Senhor de engenho', { img: 'vieira', icon: 'bust', zoom: 1.6, top: 0.08 });
  person(A('andre vidal de negreiros'), A('e filipe camarao') - 0.1, 'André Vidal de Negreiros', 'Nascido no Brasil', { img: 'negreiros', icon: 'bust', zoom: 1.6, top: 0.08, side: 'right' });
  person(A('henrique dias filho'), A('repare nisso') - 0.1, 'Henrique Dias', 'Comandava soldados negros', { img: 'dias', icon: 'bust', zoom: 1.5, top: 0.06 });
  person(A('e filipe camarao'), A('repare nisso') - 0.1, 'Filipe Camarão', 'Líder potiguara', { img: 'camarao', icon: 'bust', zoom: 1.5, top: 0.06, side: 'right' });
  cam(tLid, [-35.7, -8.1], 3.4, 1.6);
  swarm(tLid, A('em agosto daquele ano'), [-35.6, -8.1], 0.8, 110, POR, 6, 13);
  hl(tLid, A('em agosto daquele ano'), 'PE', POR, { alpha: 0.35, flat: true });
  const tRep = A('repare nisso');
  row(tRep, A('em agosto daquele ano') - 0.1, [
    { img: 'crown', label: 'Senhor de engenho', at: tRep + 0.1 }, { img: 'flag', label: 'Nascido no Brasil', at: tRep + 0.4 }, { img: 'shield', label: 'Soldados negros', at: tRep + 0.7 }, { img: 'tent', label: 'Indígenas', at: tRep + 1.0 }
  ]);
  const tTab = A('em agosto daquele ano');
  cam(tTab, P.tabocas, 0.6, 1.6);
  pin(A('veio a batalha de tabocas') - 0.2, P.tabocas, 'Monte das Tabocas');
  icon(A('veio a batalha de tabocas'), A('quando o ano acabou'), 'espada', P.tabocas, { size: 100, dx: 130, dy: -40 });
  const tAcab = A('quando o ano acabou');
  unpin(tAcab);
  cam(tAcab, [-35.4, -7.9], 3.2, 1.6);
  hl(tAcab, A('mas a guerra ainda ia longe') + 0.3, 'PE', POR);
  blob(A('os holandeses so controlavam'), A('a nona razao e o morro') + 0.5, P.recife, 0.05, HOL, { minPx: 50 });
  icon(A('alguns fortes e ilhas'), A('a nona razao e o morro'), 'forte', [-34.95, -7.75], { size: 90 });
  pill(A('a bandeira holandesa estava presa'), A('mas a guerra ainda ia longe') - 0.1, 'A Holanda presa numa cidade', HOL);

  // ===== IX · GUARARAPES =====
  const tGua = A('a nona razao e o morro');
  chap(tGua, 'IX', 'Guararapes');
  cam(tGua, P.guararapes, 0.35, 1.8);
  pin(tGua + 0.6, P.guararapes, 'Morro dos Guararapes');
  const t1648 = A('em abril de mil seiscentos e quarenta e oito');
  year(t1648 + 0.2, 1648, 1645);
  photo(A('foi ali que a guerra virou'), A('cerca de dois mil') - 0.1, 'guararapes', 'Batalha dos Guararapes', { sub: 'Victor Meirelles, 1879', w: 700, y: 210 });
  num(A('cerca de dois mil'), A('depois de cinco horas') + 0.6, 2400, 'soldados do lado de cá', { prefix: '≈', color: POR, x: W / 2 - 360 });
  num(A('cerca de quatro mil'), A('depois de cinco horas') + 0.6, 4500, 'holandeses', { prefix: '≈', color: HOL, x: W / 2 + 360 });
  swarm(A('cerca de dois mil'), A('depois de cinco horas') + 1, [-34.99, -8.13], 0.07, 40, POR, 1.2, 14, { px: 6 });
  swarm(A('cerca de quatro mil'), A('depois de cinco horas') + 1, [-34.93, -8.2], 0.08, 70, HOL, 1.2, 15, { px: 6 });
  icon(A('depois de cinco horas'), A('um ano depois em fevereiro'), 'clock', P.guararapes, { size: 96, dx: 120, label: '5 HORAS' });
  pill(A('os holandeses recuaram'), A('um ano depois em fevereiro') - 0.1, 'Os holandeses recuaram', POR);
  const t1649 = A('um ano depois em fevereiro');
  year(t1649 + 0.4, 1649, 1648);
  cam(t1649, P.guararapes, 0.25, 1.4);
  icon(A('veio a segunda batalha'), A('os holandeses foram cercados') + 1, 'espada', P.guararapes, { size: 100, dx: -120, label: '2ª BATALHA' });
  route('cerco', A('os holandeses foram cercados'), A('os holandeses foram cercados') + 1.8, [[-35.02, -8.1], [-34.88, -8.1], [-34.88, -8.22], [-35.02, -8.22], [-35.02, -8.1]], { color: POR, hide: A('quando vi esses numeros') });
  num(A('mais de mil morreram'), A('quando vi esses numeros') + 0.4, 1000, 'holandeses mortos', { prefix: '+', color: HOL, x: W / 2 - 360 });
  num(A('morreram quarenta e cinco'), A('quando vi esses numeros') + 0.4, 45, 'do outro lado', { color: POR, x: W / 2 + 360 });
  pill(A('essa diferenca diz tudo'), A('quando vi esses numeros') - 0.1, 'Essa diferença diz tudo');
  pill(A('quando vi esses numeros'), A('em mil seiscentos e cinquenta e dois') - 0.1, 'É muita diferença');
  // fim do Brasil holandês
  const t1652 = A('em mil seiscentos e cinquenta e dois');
  unpin(t1652);
  cam(t1652, [-2, 50], 20, 1.8);
  year(t1652 + 0.3, 1652, 1649);
  hl(t1652 + 0.4, A('em dezembro de mil'), 'Netherlands', HOL, { solid: true });
  hl(t1652 + 0.6, A('em dezembro de mil'), 'United Kingdom', ESP);
  icon(A('em guerra com a inglaterra'), A('em dezembro de mil'), 'espada', [1.5, 52.6], { size: 96 });
  pill(A('e passou a mandar muito menos'), A('em dezembro de mil') - 0.1, 'Menos ajuda para o Brasil', HOL);
  const tFrota = A('em dezembro de mil');
  cam(tFrota, [-22, 14], 100, 1.6);
  year(tFrota + 0.3, 1653, 1652);
  route('frota', A('chegou uma frota portuguesa'), A('chegou uma frota portuguesa') + 2.4, [P.lisboa, [-18, 25], [-28, 4], P.recife], { icon: 'ship', color: POR });
  follow(A('chegou uma frota portuguesa') + 0.2, 'frota', 60, 0.6);
  const tCerc = A('e o recife foi cercado');
  cam(tCerc, P.recife, 0.35, 1.4);
  frota.forEach((n, i) => icon(tCerc + i * 0.15, A('em janeiro de mil seiscentos e cinquenta e quatro'), 'ship', [-34.83 + (i % 2) * 0.02, -8.0 - i * 0.03], { size: 64, mark: 'ship', ring: POR, sea: true }));
  const t1654 = A('em janeiro de mil seiscentos e cinquenta e quatro');
  year(t1654 + 0.3, 1654, 1653);
  cam(t1654, P.taborda, 0.12, 1.4);
  pin(A('no campo do taborda'), P.taborda, 'Campo do Taborda');
  icon(A('os holandeses assinaram'), A('os vinte e quatro anos tinham'), 'papel', P.taborda, { size: 100, label: 'RENDIÇÃO' });
  pill(A('foi no dia vinte e seis'), A('dois dias depois') - 0.1, '26 de janeiro de 1654', POR);
  const tDois = A('dois dias depois');
  cam(tDois, P.recife, 0.5, 1.4);
  swarm(tDois + 0.2, A('os vinte e quatro anos tinham'), [-34.94, -8.05], 0.07, 50, POR, 1.2, 19, { px: 6 });
  icon(A('os portugueses entraram'), A('os vinte e quatro anos tinham'), 'bandeira', P.recife, { size: 96, mark: 'flag', ring: POR, dx: -120 });
  const t24 = A('os vinte e quatro anos tinham');
  unpin(t24);
  cam(t24, [-37, -8.3], 12, 1.6);
  hl(t24, A('a decima razao e uma prova'), 'PE', POR);
  num(t24, A('mas ainda falta a prova') - 0.1, 24, 'anos: fim do Brasil holandês', { color: HOL, from: 0 });
  pill(A('mas ainda falta a prova'), A('a decima razao e uma prova') - 0.1, 'A prova final está longe daqui');

  // ===== X · O SURINAME =====
  const tSur = A('a decima razao e uma prova');
  chap(tSur, 'X', 'A prova do Suriname');
  noYear(tSur);
  cam(tSur, [-48, -2], 40, 1.8);
  pill(A('se os holandeses tivessem ficado'), A('para saber olhe') - 0.1, 'Mais tempo e o holandês venceria?');
  const tOlhe = A('para saber olhe');
  cam(tOlhe, [-55.8, 4.2], 9, 1.8);
  hl(tOlhe + 0.4, A('a diferenca foi o tempo') + 0.4, 'Suriname', SUR);
  label(tOlhe + 0.8, A('hoje ele e a lingua oficial'), [-55.9, 4.0], 'Suriname', { size: 28 });
  pin(A('no norte da america'), P.paramaribo, 'Paramaribo');
  num(A('mais de trezentos anos'), A('o holandes foi a lingua do poder') + 0.6, 300, 'anos de governo holandês', { prefix: '+', color: SUR });
  row(A('o holandes foi a lingua do poder'), A('os escravizados eram proibidos') - 0.1, [
    { img: 'coroa', label: 'Poder', at: A('lingua do poder') }, { img: 'balanca', label: 'Leis', at: A('das leis') }, { img: 'school', label: 'Escola', at: A('e da escola') }
  ]);
  pill(A('os escravizados eram proibidos'), A('em mil oitocentos e setenta e seis') - 0.1, 'Escravizados proibidos de aprender a língua', C.urucum);
  const t1876 = A('em mil oitocentos e setenta e seis');
  year(t1876 + 0.3, 1876, 1654);
  icon(A('virou a unica lingua de ensino'), A('pare um segundo') + 0.4, 'school', P.paramaribo, { size: 100, dx: 30, dy: 110, label: 'SÓ HOLANDÊS' });
  word(A('hoje ele e a lingua oficial'), A('proibir um povo') - 0.1, 'SURINAME HOJE', 'Nederlands', { pt: 'holandês', meaning: 'a língua oficial do país', icon: 'idiomas' });
  pill(A('proibir um povo de aprender'), A('os holandeses fizeram isso la') - 0.1, 'Uma forma de controle muito forte', C.urucum);
  const tComp = A('agora compare');
  cam(tComp, [-46, -2], 34, 1.8);
  noYear(tComp);
  unpin(tComp);
  hl(tComp, A('a diferenca foi o tempo') + 0.4, 'PE', PE);
  S.lists.push({ t0: A('no recife a holanda mandou'), t1: A('e tem uma ironia boa') - 0.1, title: 'Recife × Suriname', items: [
    { name: 'Recife: 24 anos', sub: 'poucos civis, dependendo dos portugueses', color: PE, at: A('no recife a holanda mandou') },
    { name: 'Suriname: 300+ anos', sub: 'e com a escola nas mãos', color: SUR, at: A('no suriname mandou') }
  ] });
  pill(A('a diferenca foi o tempo'), A('e tem uma ironia boa') - 0.1, 'A diferença: tempo e controle');
  const tIron = A('e tem uma ironia boa');
  cam(tIron, [-46, -2], 34, 1.4);
  route('judeusSur', A('alguns judeus que partiram'), A('foram parar no suriname') + 1.4, [P.recife, [-38, 0], [-48, 5], P.paramaribo], { icon: 'sinagoga', size: 76, color: NY });
  pill(A('pesquisadores dizem que eles levaram'), A('ate hoje a lingua dos saramacas') - 0.1, 'Levaram o português junto', POR);
  word(A('ate hoje a lingua dos saramacas'), A('ou seja o portugues de pernambuco') - 0.1, 'SURINAME', 'Saramacano', { meaning: 'língua com muita influência do português', icon: 'idiomas' });
  blob(A('ate hoje a lingua dos saramacas'), A('ou seja o portugues de pernambuco') + 1, [-55.6, 4.3], 0.8, POR, { minPx: 50 });
  pill(A('ou seja o portugues de pernambuco'), A('agora a ultima parte') - 0.1, 'O português de Pernambuco viajou', POR);
  cam(A('e e por isso que a ultima'), P.recife, 2, 2.0);

  // ===== O QUE SOBROU =====
  const tSob = A('agora a ultima parte');
  chap(tSob, '★', 'O que sobrou');
  cam(tSob, [-34.875, -8.062], 0.1, 1.8);
  pill(A('a lingua holandesa nao ficou'), A('mas a holanda deixou marcas') - 0.1, 'A língua holandesa não ficou', HOL);
  pill(A('uma delas e o desenho'), A('nenhum predio do centro') - 0.1, 'O desenho do Recife');
  const tPred = A('nenhum predio do centro');
  icon(tPred, A('outra marca sao os livros'), 'building-2', P.bomJesus, { size: 96, dx: -150, dy: -40, cross: tPred + 1.4 });
  label(A('como as da rua imperador'), A('outra marca sao os livros'), [-34.95, -8.12], 'Rua Imperador D. Pedro II', { size: 24 });
  icon(A('o formato das ruas'), A('outra marca sao os livros'), 'house', [-34.878, -8.065], { size: 90, dx: 130, dy: 20, label: 'CASAS ESTREITAS' });
  const tLiv = A('outra marca sao os livros');
  unpin(tLiv);
  cam(tLiv, [-34.9, -8.06], 0.4, 1.4);
  year(A('em mil seiscentos e quarenta e oito saiu'), 1648, 1654);
  word(A('saiu a historia natural'), A('os quadros de frans') - 0.1, 'LATIM', 'Historia Naturalis Brasiliae', { pt: 'História Natural do Brasil', meaning: 'as plantas e os animais daqui', icon: 'livro' });
  photo(A('os quadros de frans'), A('e agora o lugar que eu prometi') - 0.1, 'post', 'A paisagem de Pernambuco', { sub: 'Frans Post · hoje em museus' });
  icon(A('estao em museus'), A('e agora o lugar que eu prometi'), 'landmark', P.recife, { size: 90, dx: -140 });
  const tLug = A('e agora o lugar que eu prometi');
  noYear(tLug);
  cam(tLug, P.bomJesus, 0.06, 2.0);
  pin(A('no recife antigo'), P.bomJesus, 'Rua do Bom Jesus');
  photo(A('existe um centro cultural'), A('quando os holandeses perderam') - 0.1, 'sinagoga', 'Kahal Zur Israel', { sub: 'Centro cultural no lugar da 1ª sinagoga das Américas', w: 640 });
  pill(A('e uma das provas mais fortes'), A('quando os holandeses perderam') - 0.1, 'Uma das provas mais fortes daquela época', C.verde);
  const tSai = A('quando os holandeses perderam');
  unpin(tSai);
  cam(tSai, [-40, 18], 80, 1.8);
  num(A('cerca de seiscentos judeus'), A('um grupo de vinte e tres') - 0.1, 600, 'judeus deixam o Recife', { prefix: '≈', color: NY });
  route('ny', A('um grupo de vinte e tres'), A('um grupo de vinte e tres') + 3.0, [P.recife, [-38, 2], [-60, 18], [-70, 32], P.novaYork], { icon: 'sinagoga', size: 76, color: NY });
  follow(A('um grupo de vinte e tres') + 0.2, 'ny', 50, 0.6);
  num(A('um grupo de vinte e tres') + 0.2, A('que hoje e nova york') - 0.1, 23, 'pessoas para Nova Amsterdã', { color: NY, from: 600 });
  const tNY = A('que hoje e nova york');
  cam(tNY, P.novaYork, 2.6, 1.4);
  pin(tNY + 0.5, P.novaYork, 'Nova Amsterdã → Nova York');
  hl(tNY + 0.3, A('e tem um ultimo detalhe'), 'United States of America', NY, { alpha: 0.5 });
  pill(A('ali elas formaram'), A('ou seja uma parte') - 0.1, '1ª comunidade judaica da América do Norte', NY);
  pill(A('ou seja uma parte'), A('e tem um ultimo detalhe') - 0.1, 'Nova York começa um pouco no Recife');
  const t1661 = A('em mil seiscentos e sessenta e um');
  unpin(t1661);
  cam(t1661, [-2, 46], 26, 1.8);
  year(t1661 + 0.3, 1661, 1648);
  hl(t1661 + 0.3, A('essa foi a parte que mais me impressionou'), 'Portugal', POR);
  hl(t1661 + 0.3, A('essa foi a parte que mais me impressionou'), 'Netherlands', HOL, { solid: true });
  route('indeniza', A('pagar uma indenizacao'), A('pagar uma indenizacao') + 1.8, [P.lisboa, [-4, 47], P.amsterda], { icon: 'moeda', size: 76, color: C.ipe });
  pill(A('para encerrar de vez'), A('essa foi a parte que mais me impressionou') - 0.1, 'Indenização para encerrar a briga pelo Brasil', C.ipe);
  const tImp = A('essa foi a parte que mais me impressionou');
  noYear(tImp);
  cam(tImp, [-34.9, -8.06], 0.35, 2.0);
  row(A('uma guerra que acabou'), A('no fim das contas') - 0.1, [
    { img: 'aperto', label: 'Um acordo', at: A('com um acordo') }, { img: 'sinagoga', label: 'Uma sinagoga', at: A('uma sinagoga') }, { img: 'message-circle', label: 'Uma língua', at: A('e uma lingua que nunca') }
  ]);

  // ===== FECHAMENTO =====
  const tFim = A('no fim das contas');
  cam(tFim, [-37, -8.3], 12, 2.0);
  hl(tFim + 0.3, A('agora eu quero saber'), 'PE', POR);
  S.quotes.push({ t0: tFim + 0.2, t1: A('a holanda trouxe uma bandeira') - 0.1, text: 'O português ficou\nporque o povo ficou.' });
  row(A('a holanda trouxe uma bandeira'), A('mas a lingua estava na boca') - 0.1, [
    { img: 'bandeira', label: 'Bandeira', at: A('trouxe uma bandeira') }, { img: 'soldado', label: 'Soldados', at: A('soldados e uma') }, { img: 'fabrica', label: 'Uma empresa', at: A('e uma empresa') }
  ]);
  row(A('mas a lingua estava na boca'), A('agora eu quero saber') - 0.1, [
    { img: 'acucar', label: 'Plantava', at: A('de quem plantava') }, { img: 'igreja', label: 'Rezava', at: A('rezava vendia') }, { img: 'loja', label: 'Vendia', at: A('vendia e criava') }, { img: 'familia', label: 'Criava os filhos', at: A('e criava os filhos') }
  ]);
  swarm(A('mas a lingua estava na boca'), A('agora eu quero saber'), [-36.4, -8.3], 1.6, 160, POR, 2.5, 21);
  const tVoce = A('agora eu quero saber');
  cam(tVoce, [-37, -8.3], 13, 2.0);
  hl(tVoce + 0.3, A('se voce gostou se inscreva'), 'PE', HOL, { alpha: 0.75 });
  pill(A('se os holandeses tivessem ficado como'), A('se voce gostou se inscreva') - 0.1, 'E se os holandeses tivessem ficado?', HOL);
  pill(A('se voce gostou se inscreva'), A('no proximo video') - 0.1, 'Inscreva-se para os próximos mapas', C.ipe);
  const tNext = A('no proximo video');
  cam(tNext, [-55, -31], 16, 2.4);
  hl(tNext + 0.8, 99999, 'Uruguay', C.turq);
  hl(tNext + 1.0, 99999, 'RS', PE, { alpha: 0.7 });
  label(A('voce sabia que o uruguai'), 99999, [-56.0, -32.8], 'Uruguai', { size: 30 });
  S.ends.push({ t0: A('voce sabia que o uruguai') - 0.2, t1: A('porque a raiz de tudo') - 0.2, next: 'O Uruguai já foi\ndo Brasil?' });
  S.ends.push({ t0: A('porque a raiz de tudo') });
  CAM.sort((a, b) => a.t - b.t);
  return S;
}
