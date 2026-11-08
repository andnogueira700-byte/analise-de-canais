# Guia Visual: Codice Abisso

## 1. Paleta

| Cor | HEX | Onde usar |
|---|---|---|
| Preto de fundo | #0A0A0A | Fundo de vídeos, capas, cartelas, cartões |
| Cinza escuro | #3A3A3A | Silhuetas, bordas, linhas do mapa |
| Cinza claro | #B3B3B3 | Legendas secundárias, medidas, linhas de costa |
| Branco | #F2F2F2 | Textos principais, números, contornos da gravura |
| Vermelho | #D7141A | Único destaque: palavra-chave, olho, medida, sublinhado |

Por que #D7141A: é o vermelho vivo do olho do logo, contrasta forte com o preto e não parece laranja.

Regra: use o vermelho pouco. Uma palavra, um número, um olho ou uma linha por vez.

## 2. Fontes gratuitas (Google Fonts)

- **Títulos e textos na tela:** Montserrat ExtraBold (800) para títulos e Montserrat Light (300) para subtítulos. Parecida com a fonte do banner.
- **Thumbnails:** Anton (ou Bebas Neue). Condensada e bem grossa.

Tamanhos de referência para vídeo 1920x1080:
- Título de abertura: 120 px
- Texto na tela (palavras-chave): 84 px
- Subtítulo: 56 px
- Legenda: 44 px
- Número grande: 260 px
- Etiqueta de animal (nome e medida): 40 px
- Thumbnail 1280x720: 200 a 260 px em Anton

## 3. Textos na tela

Regras:
1. Sempre em MAIÚSCULAS.
2. Texto branco, com a palavra-chave em vermelho. Exemplo: "IL MOSTRO È VIVO", com "VIVO" em vermelho.
3. No máximo 4 palavras por tela.
4. Posição: terço inferior ou superior, centralizado ou à esquerda. Margem de 120 px das bordas.
5. Sombra: contorno preto de 6 px e sombra preta (80%), desfoque de 12 px.
6. Entrada: "pop" de 150 ms (de 80% a 100% do tamanho) ou digitação de 40 ms por letra. Escolha um e use em todo o vídeo.
7. Tempo mínimo na tela: 2 segundos.

Elementos fixos:
- **Números grandes:** número em branco, unidade em vermelho. Exemplo: "18" + "M". Sem caixa, com contorno preto.
- **Etiquetas de animais:** caixa #0A0A0A com borda cinza escuro de 2 px. Nome em branco, em caixa alta, e medida em vermelho. Uma linha fina cinza liga a etiqueta ao animal. Exemplo: "ORCA" / "8 M".
- **Cartas misteriosas 03-02-01:** cartão preto com borda branca de 3 px. "03" em cinza escuro, "02" em cinza claro, "01" em vermelho. Entra com giro de 0,5 s.
- **Régua de tamanho:** linha horizontal branca com marcas a cada metro, números em cinza claro. Silhueta humana de 1,80 m em cinza escuro, com contorno branco fino de 2 px. A medida do animal fica em vermelho.
- **Mapa escuro:** fundo #0A0A0A, oceano em cinza escuro, costas em cinza claro. O ponto de interesse é vermelho e pulsa.
- **Cartão de estudo científico:** caixa preta com borda cinza claro de 2 px. Título "STUDIO" em cinza claro, dado principal em branco, autor e ano em cinza claro menor. O dado-chave vai em vermelho.

## 4. Legendas (se usadas)

- Fonte: Montserrat Medium, 44 px.
- Cor: branco #F2F2F2. Sem vermelho.
- Fundo: caixa #0A0A0A com 70% de opacidade, cantos retos.
- Posição: centro inferior, 120 px da borda.
- Máximo 2 linhas.

## 5. Thumbnail do vídeo 01

Título: "Gli Unici Animali Che Fanno Scappare Le Orche"

**Composição A (principal)**
- Cabeça gigante de capodoglio saindo da escuridão, em direção ao espectador. Expressão maligna, pele com cicatrizes, mandíbula aberta com dentes.
- Olho brilhando em vermelho.
- Embaixo, à esquerda: uma orca pequena fugindo.
- Fundo: silhuetas escuras de globicefali.
- Lado esquerdo vazio para o texto.

**Texto:** "LA LORO" em branco (linha 1) e "UNICA PAURA" em vermelho (linha 2). Anton, caixa alta, à esquerda, com sombra preta.

**Prompt A (inglês):**
> Black and white engraving, dense crosshatched ink illustration on pure black background, giant sperm whale head emerging from deep darkness toward the viewer, malevolent expression, scarred skin, open jaw with large teeth, the only color is a glowing red eye, small orca fleeing in the bottom left corner, dark silhouettes of pilot whales in the distance, empty negative space on the left side, monochrome, highly detailed, cinematic low angle --ar 16:9

**Composição B (variação)**
- Cabeça de baixo para cima, ocupando dois terços da direita. Orca no canto inferior esquerdo. Silhuetas de globicefali como névoa ao fundo.
- Texto no terço superior esquerdo, com a mesma regra de cor.

**Prompt B (inglês):**
> Black and white woodcut engraving, deep ink hatching, view from below the surface, huge sperm whale head filling the right two-thirds of the frame, jaw open with teeth, scars across the head, one red eye, tiny orca escaping at lower left, faint pilot whale silhouettes in murky water, left third empty black, strictly grayscale except the red eye --ar 16:9

Se o gerador não aceitar "--ar 16:9" (Ideogram, Leonardo, Canva), apague esse trecho e escreva "widescreen 16:9".

**Montagem no Canva (1280x720)**
1. Crie um design personalizado de 1280x720.
2. Envie a imagem e cubra a capa toda, sem deformar (segure Shift ao arrastar).
3. Coloque um retângulo preto com degradê à esquerda, 40% de transparência, para o texto ler bem.
4. Adicione o texto em Anton, caixa alta, tamanho 220 px. Duas linhas.
5. Cores: "LA LORO" em #F2F2F2 e "UNICA PAURA" em #D7141A.
6. Efeitos > Sombra: preta, desfoque 12, distância 4, transparência 80%. Contorno preto de 8 px.
7. Exporte em PNG ou JPG, qualidade alta.

**Teste do tamanho de uma unha (celular)**
Veja a capa no celular, na lista de vídeos, com o tamanho bem pequeno, como uma unha. Se ainda der para ler "LA LORO UNICA PAURA" e ver o olho vermelho, a capa está aprovada. Se não der, aumente o texto e o olho, ou tire detalhes do fundo.

## 6. Tela final e cartela de capítulo

**Tela final (últimos 20 segundos, 1920x1080)**
- Fundo #0A0A0A com o olho de réptil do logo pequeno e fraco no centro, em cinza escuro.
- Duas áreas para vídeos, uma à esquerda e outra à direita, com um terço da largura cada. Ficam livres para o YouTube colocar os elementos.
- Área de inscrição em cinza claro, com o texto "ISCRIVITI" em Montserrat Light, 56 px.
- Opcional: slogan "LA VITA ESTREMA, SPIEGATA." em Montserrat Light, 40 px, caixa alta, letras espaçadas, cinza claro.
- Nenhum outro texto grande, para não cobrir os elementos do YouTube.

**Cartela de capítulo (3 segundos)**
- Fundo #0A0A0A, com fade in de 0,3 s e fade out de 0,3 s.
- Linha de cima: "CAPITOLO 01" em vermelho, Montserrat ExtraBold, 48 px.
- Título em branco, Montserrat ExtraBold, 110 px, caixa alta.
- Sublinhado vermelho curto abaixo do título, igual ao do banner.
- Gravura pequena em cinza no canto direito, para lembrar o banner.
