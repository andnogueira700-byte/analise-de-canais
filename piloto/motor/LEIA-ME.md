# Motor do piloto (Logica di Guerra, Fontenoy)

Pipeline: audio da narracao -> whisper (tempo por frase) -> `make_timeline.py` -> `src/scenes.js` (canvas) -> `render.js` (Playwright, JPEG por quadro) -> `audio.py` (voz + cama + canhoes) -> FFmpeg.

Baixe separadamente (nao estao no repo): d3@7.9.0, topojson-client@3.1.0, world-atlas@2.0.2 (countries-50m.json) e as fontes Fira Sans Extra Condensed 700/500, Cormorant Garamond 600 (via @fontsource), gerando `src/world.js`, `src/fonts.js`, `src/timeline.js` como em `make_timeline.py`.
Para um novo episodio: troque a lista `B` em `make_timeline.py` pelos tempos reais das frases e reescreva as cenas em `src/scenes.js`.
