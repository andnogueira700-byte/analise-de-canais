# Manual de Edição do HACKOPSIA

Baseado na análise quadro a quadro do vídeo do Elementar **"Por que quebra-molas
é proibido no Brasil?"** (15min43s, 1080p, 24 quadros por segundo), feita em
17/11/2026: 314 quadros (1 a cada 3 s), o trecho de 8:00 a 9:00 quadro a quadro
(2 por segundo), 18 quadros ampliados, detecção automática de cortes e medição
do áudio.

Quadros de referência: `canal/referencias-visuais/elementar-edicao-*.jpg`.

> **Descoberta principal:** nesse vídeo o apresentador **não aparece nenhuma
> vez**. A edição inteira é feita com vídeos de banco e imagens próprias do
> assunto, cartões de notícia, trechos de reportagem com o texto grifado,
> gráficos animados e frases na tela. O formato é **100% copiável por um canal
> sem rosto**.

---

## 1. Ritmo (os números)

| Medida | Elementar | Regra para o HACKOPSIA |
|---|---|---|
| Cortes no vídeo | 192 a 277 (conforme a sensibilidade) | — |
| Duração média de cada plano | **3,5 a 5 s** (mediana: 2,5 a 3,7 s) | Imagens de banco: **2 a 5 s cada**. Nunca mais de 6 s parado no mesmo vídeo de banco |
| Cortes por minuto | 8 a 19 (média de cerca de 13) | **12 a 18 por minuto** |
| Planos longos (mais de 8 s) | Quase todos são **cartões de texto** (reportagem grifada, lista, gráfico), que ficam de 10 a 30 s na tela, mas **mudam por dentro**: o grifo avança, os itens da lista aparecem um a um | Cartão de texto pode ficar até 20 s **se algo mudar a cada 3 a 4 s** (grifo, zoom lento, item novo) |
| Silêncios | Só 6 pausas no vídeo inteiro, todas com menos de 1,2 s | Música contínua. Pausa de 0,5 a 1 s **só** antes de uma revelação ou de um título de capítulo |
| Volume | -17,3 LUFS integrado, faixa de 4,2 LU (som muito constante) | Exportar a cerca de -14 a -16 LUFS. Voz sempre na frente; música baixa e contínua (cerca de -20 dB abaixo da voz) |

**Como o ritmo é montado:** a narração nunca fica "sozinha". Cada frase ganha
uma imagem, e a cada 2 ou 3 frases entra um elemento gráfico (frase na tela,
cartão de notícia, gráfico). O espectador nunca fica 10 s olhando a mesma coisa
sem nada mudar.

## 2. Estrutura do vídeo (linha do tempo)

| Tempo | O que acontece | Elementos |
|---|---|---|
| 0:00–1:05 | **Abertura fria:** montagem rápida do assunto (quebra-molas de todos os ângulos), com a narração apresentando o problema | Imagens de banco em sequência, cortes a cada 2 a 3 s. Termina com **2 perguntas na tela** (caixas brancas) |
| 1:06–1:10 | **Cartão de capítulo:** tela preta, título pequeno e branco, centralizado ("Quebra-tudo"), com a letra aparecendo animada | Pausa curta antes, música muda |
| 1:10–5:35 | Bloco 1: lei, notícias e casos | Print do site da lei com zoom e grifo amarelo, cartões de notícia, Street View, cartões de reportagem com grifo vermelho |
| 5:36–6:10 | **Bloco de produto/patrocínio** (cerca de 35 s): vídeos de banco de "tela de computador", miniaturas de outros vídeos do canal, QR code do produto | Visual diferente do resto, para o espectador perceber que é um anúncio |
| 6:12 | Cartão de capítulo ("Não-funciona") | |
| 6:18–8:53 | Bloco 2: explicação técnica | **Gráficos animados** (Tipo A x Tipo B, com medidas), artigo científico grifado, vídeos de redes sociais, drone com o nome da cidade |
| 8:51–8:57 | Pergunta na tela, depois o cartão de capítulo ("Speed bump") | |
| 9:00–12:53 | Bloco 3: como é lá fora | Imagens de outros países, **lista numerada** que aparece item por item, número de destaque ("US$ 52 mi"), manchetes estrangeiras |
| 12:54–13:02 | Trecho de entrevista de especialista, com **nome na tela** | Crédito com o nome |
| 13:03–14:59 | Conclusão: imagens do Brasil x de fora, voltando ao objeto do início | Volta às imagens da abertura (fecha o ciclo) |
| 15:00–15:43 | Encerramento: produto com QR code + vídeo final | QR code fixo no canto |

**Cartões de capítulo a cada 3 a 5 minutos** dão "respiro" e dividem o vídeo em
atos.

## 3. Os elementos gráficos (catálogo)

Todos levam a **marca d'água "ELEMENTAR"** pequena, branca, no canto inferior
esquerdo, o vídeo inteiro.

### 3.1 Frase na tela (caixa de pergunta)
- Quando: as perguntas-chave do roteiro ("Mas por que o Brasil é tão obcecado
  por quebra-molas?").
- Visual: **cada linha numa caixa branca própria**, empilhadas, com texto preto
  em sans-serif negrito, alinhadas à esquerda, um pouco acima do centro, sobre o
  vídeo. Termina com um **quadradinho vermelho** depois do ponto de interrogação.
- Animação: as linhas entram uma a uma, de baixo para cima, rapidamente.
- Duração: 2 a 4 s. Aparecem 1 a 3 vezes por bloco, normalmente **antes de uma
  virada ou de um capítulo**.

### 3.2 Cartão de notícia (manchete)
- Quando: a narração cita uma reportagem.
- Visual: **foto da notícia escurecida e desfocada** no fundo, **logo do
  veículo** no topo, **manchete em branco, negrito e grande** (2 a 3 linhas,
  centralizada) e "Autor, data" em cinza abaixo.
- Duração: 4 a 9 s, com um zoom lento.
- Importante: é **recriado** no editor, não é um print do site.

### 3.3 Cartão de reportagem grifada (o mais usado)
- Quando: a narração lê um trecho de uma fonte.
- Visual: **fundo cinza-chumbo quase preto com uma grade fina** quase invisível
  e um **brilho roxo** suave no canto inferior esquerdo. Bloco de texto
  centralizado com: título em branco negrito; "Por: veículo" e "Publicado:
  data" em cinza pequeno; **linha dupla branca**; o trecho em branco.
- **Grifo vermelho** (fundo vinho/vermelho atrás das palavras) que **avança
  acompanhando a narração**: primeiro uma frase, depois outra.
- Transição: às vezes um **"vazamento de luz" vermelho/laranja** (film burn)
  passando pela tela, entre um cartão e outro.
- Duração: 10 a 30 s, sempre com o grifo andando.

### 3.4 Print de site com zoom
- Quando: lei, site oficial, artigo científico.
- Visual: o print real da página, com **zoom lento até o trecho** e um **grifo
  amarelo** (marca-texto) no trecho lido.

### 3.5 Gráfico técnico animado
- Fundo igual ao do cartão de reportagem (chumbo + grade). Linhas finas
  brancas/cinza, **números de destaque em laranja**, ícones de placa, cotas com
  setas (3,7 m; 8 a 10 cm).
- Ele se **constrói por partes**: aparece o Tipo A, depois a medida, depois o
  Tipo B, depois as placas.
- Rótulos em caixa alta, pequenos e espaçados ("ELEVAÇÃO", "SENTIDO").

### 3.6 Lista numerada
- Fundo chumbo. Números "01, 02, 03..." em **verde-água**, itens em branco
  negrito. Os itens **aparecem um a um** com a narração; o último fica
  destacado em verde.

### 3.7 Número de destaque sobre o vídeo
- Exemplo: "**US$ 52 mi** / pra trocar radar por lombada" e "**13 anos** / pra
  terminar a troca".
- Visual: número grande em branco sobre uma **tarja vermelha**, com a legenda
  pequena abaixo numa faixa branca, no canto esquerdo do vídeo. Entra
  "deslizando".

### 3.8 Imagem em moldura
- Vídeo ou foto **menor, centralizado** sobre o fundo chumbo, às vezes com um
  número grande ao lado ("4 a 7 m"). Usado quando a imagem é de baixa
  qualidade ou é um vídeo vertical de rede social.

### 3.9 Etiquetas e créditos
- **Local:** etiqueta preta pequena no canto inferior esquerdo ("SAPIRANGA,
  RS"; "BR-265, LAVRAS, MG"; "CAMPO GRANDE, MS").
- **Crédito de vídeo de terceiros:** no canto superior esquerdo ("BBC | Sep 29,
  2016"), em branco sobre uma faixa escura.
- **Nome de entrevistado:** caixa branca com o nome em preto negrito e uma
  faixa escura fina abaixo com o cargo.

### 3.10 Cartão de capítulo
- **Tela preta**, título pequeno e branco no centro, com as letras aparecendo
  uma a uma. Dura 2 a 4 s, com pausa na narração e mudança na música.

### 3.11 Transição entre blocos: o "respiro de suspense" (pedido do dono)
Em **toda troca de bloco do roteiro** (por exemplo, da introdução para o
primeiro bloco), o vídeo faz uma pausa dramática:
1. **Fade-out** (a imagem vai escurecendo até ficar preta) em cerca de 1 s,
   junto com o fim da última frase do bloco.
2. **Tela preta ou quase preta de 2 a 4 s, sem voz**: só a música de
   suspense sobe um pouco (de 3 a 6 dB). Opcional: o cartão de capítulo
   "ARQUIVO 0X — título" aparecendo letra por letra nesse escuro.
3. **Fade-in** (a imagem vai clareando) em cerca de 1 s, **junto com a primeira
   frase do bloco seguinte**: a voz volta e a imagem do novo bloco aparece.
4. A música volta ao volume de fundo (cerca de -20 dB abaixo da voz) assim que a
   voz recomeça.

**Como o dono trabalha (decisão de 17/11):** a narração é gerada **num áudio só,
corrido**, no Studio do ElevenLabs, a partir do `02c-roteiro-corrido.txt` (sem
marcas de pausa). **As pausas são criadas pelo editor, com cortes na própria
edição**, só onde forem necessárias: nas trocas entre a intro e o bloco 1 e entre cada bloco seguinte (6 trocas, marcadas no mapa de edição) e, se precisar, antes de uma revelação.
O editor corta o áudio no fim da última frase do bloco, abre o espaço do respiro
e cola o resto do áudio depois.

### 3.12 Regra de não repetir imagens (pedido do dono)
- **Até a metade do vídeo, nenhum vídeo ou foto pode aparecer duas vezes.** O público nota na hora e o vídeo fica cansativo.
- Da metade para o fim, só repete se não houver alternativa (muitos já saíram, e quem ficou se incomoda menos).
- O controle é automático: `uso-clipes.json` registra o que cada parte usou, e o renderizador recusa o storyboard com repetição proibida.
- Biblioteca: `ferramentas/biblioteca.py` (Mixkit, Coverr Full HD e fotos reais do Wikimedia Commons, todos com licença livre). Fotos reais do Brasil (agências, filas, Brasília) dão "cara" ao que é dito.
- **YouTube:** não dá para baixar daqui (o YouTube bloqueia servidores). Se o dono quiser trechos de até 5 s de outros vídeos, ele baixa no computador dele e envia; o editor usa sem o áudio, só a imagem, sempre como apoio à narrativa e com o crédito na descrição.

## 4. As imagens (de onde vem cada coisa)

Pela contagem dos quadros, mais ou menos:
- **cerca de 65%:** vídeos do assunto (banco de imagens + gravações próprias):
  vários ângulos do mesmo objeto (rente ao chão, aberto, detalhe, câmera no
  carro, drone);
- **cerca de 25%:** cartões gráficos (reportagem grifada, manchete, gráfico,
  lista, frase);
- **cerca de 10%:** prints de sites, Street View, vídeo de rede social e
  trechos de reportagem com crédito.

**Truques de câmera:**
- **ângulos variados do mesmo objeto** em sequência (o quebra-molas visto de 6
  jeitos diferentes em 20 s);
- **câmera rente ao chão** (dramática) misturada com planos abertos;
- **zoom lento (Ken Burns)** em quase todo plano parado;
- **vídeo de banco "de clima"** (mão digitando, tela de computador) só nos
  blocos de produto.

## 5. Som

- **Música de fundo contínua** do começo ao fim, baixa, num clima entre neutro
  e tenso (documental). Ela muda nos cartões de capítulo.
- Quase não há silêncio: só pausas curtas antes das viradas e dos capítulos.
- Volume muito constante: sem picos e sem trechos baixos demais.
- Efeitos sonoros discretos: whoosh nas entradas de texto, um "impacto" grave
  nas revelações e um ruído de "queimado" no film burn.

---

## 6. Adaptação para o HACKOPSIA

| Elementar | HACKOPSIA |
|---|---|
| Marca d'água "ELEMENTAR" no canto inferior esquerdo | "HACKOPSIA" pequeno, branco, no canto inferior esquerdo, o vídeo inteiro |
| Fundo dos cartões: chumbo + grade fina + brilho **roxo** | Chumbo (#0B0D10 a #15181D) + grade fina + brilho **azul-frio** suave (clima de perícia) |
| Grifo **vermelho** nos trechos de reportagem | Grifo **amarelo #FFD400 com texto preto** (o marca-texto do laudo). Vermelho #E63946 só para números de perda e "VAZADO" |
| Números de destaque em **laranja** nos gráficos | Números em **amarelo** |
| Lista com números **verde-água** | Lista com números em amarelo, no estilo "EVIDÊNCIA 01, 02..." |
| Frase na tela: caixas brancas + quadradinho **vermelho** | Caixas brancas + quadradinho **amarelo** |
| Cartão de capítulo: tela preta + título pequeno | Igual, mas no formato "ARQUIVO 01 — [título]", com efeito de digitação (letra por letra) |
| Film burn vermelho/laranja | **Glitch digital curto** (0,3 s) ou film burn frio, nas transições entre cartões |
| Etiqueta de local preta | Etiqueta de local + **etiqueta de data** ("06/11/2026") no mesmo estilo: a data é o nosso personagem |
| Crédito "BBC \| data" no canto superior | Igual, sempre que usar imagem de reportagem (com uso curto, só quando necessário) |
| Apresentador (às vezes) | **Nunca.** Trocar por mãos segurando o celular, telas, documentos e vídeos de banco |
| Bloco de produto com QR code | Quando houver patrocínio: mesmo formato, entre os blocos 5 e 6 do roteiro |


### 3.13 Regras do dono (17/11, Laudo 002)
- **Gráfico entra na palavra exata.** Cada pedaço de um gráfico animado (cada barra, cada data da linha do tempo, cada número, a tarja da nota) entra no instante em que a palavra correspondente é falada, nem antes nem depois. No storyboard, cada item leva a âncora "@palavras" (ex.: "139 MIL~1º SEM. 2025@cento e trinta e nove"); o renderizador acha a palavra na narração.
- **Pausa depois da intro, sem texto.** Entre a intro e o bloco 1 há sempre um respiro: a imagem escurece (fade-out), fica a tela preta só com a música de suspense por alguns segundos (3 a 4 s) e a imagem abre devagar (fade-in de cerca de 1,5 s) junto com a primeira frase do bloco 1. Nesse respiro **não há texto na tela**. Ele separa a intro do resto do roteiro. Nas trocas entre os outros blocos, segue o respiro com o cartão "ARQUIVO 0X — título" (3.11).

### O que o HACKOPSIA acrescenta (o "ar de suspense")
- Música um pouco mais **tensa** que a do Elementar (pulso grave, cordas).
- Vídeos de banco **mais escuros**, com luz de tela de celular e de monitor.
- **Linha do tempo de datas** recorrente (dia do ataque → dia do aviso).
- **Carimbo "VAZADO"** e **etiqueta "LAUDO Nº"** como elementos fixos.

## 7. Onde achar as imagens

- **Grátis:** Pexels, Pixabay, Mixkit, Coverr.
- **Pagos (mais variedade):** Storyblocks, Envato Elements, Artgrid.
- **Termos de busca em inglês que funcionam para o nosso tema:** "phone
  notification dark", "hands typing laptop night", "server room", "hacker
  hoodie silhouette", "data center", "credit card close up", "bank app phone",
  "call center", "elderly phone call", "brasilia aerial", "city night aerial",
  "glitch overlay", "film burn", "paper document close up", "magnifying glass
  document".
- **Prints:** sites oficiais e matérias citadas (com o logo do veículo no
  cartão de notícia). Imagem de reportagem de TV: só trechos curtos, com
  crédito, quando for indispensável.
- **Música:** biblioteca de áudio do YouTube, Epidemic Sound ou Artlist
  (gêneros: "documentary", "suspense", "investigation", "dark ambient").

## 8. Checklist do editor (antes de exportar)

- [ ] Nenhum vídeo de banco fica mais de 6 s na tela.
- [ ] Cartões de texto mudam algo a cada 3 a 4 s.
- [ ] Há uma frase na tela antes de cada virada ou capítulo.
- [ ] Há cartões de capítulo a cada 3 a 5 minutos.
- [ ] A marca d'água HACKOPSIA aparece o vídeo inteiro.
- [ ] A música é contínua, a voz está clara e o volume final fica entre -14 e -16 LUFS.
- [ ] Toda fonte citada aparece na tela (cartão de notícia ou de reportagem).
- [ ] Nenhum dado pessoal real aparece na tela.
