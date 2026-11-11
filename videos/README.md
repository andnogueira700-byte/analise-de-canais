# Produção de vídeos em microblocos

- `engine/` — motor de render (three.js em Chromium sem GPU): cubos com chanfro, pitbull articulado, T. rex, cenário de Hell Creek, textos e cartões em blocos, mixagem de áudio.
- `01-pitbull-t-rex/piloto/` — piloto de 2 min: narração (`narracion.mp3` original, `narracion_ritmo.wav` com pausas encurtadas), tempos por palavra (`words_ritmo.json`) e as cenas (`src/shots.js`).

## Como renderizar

```bash
cd videos/engine && npm install
node render.js still videos/01-pitbull-t-rex/piloto/src/index.html /tmp/previas "1.5,15.9,24.5" 960 540
node render.js video videos/01-pitbull-t-rex/piloto/src/index.html saida.mp4 0 122.55 24 2240 1260
node render.js meta  videos/01-pitbull-t-rex/piloto/src/index.html meta.json
python3 audio/mix.py meta.json ../01-pitbull-t-rex/piloto/narracion_ritmo.wav trilha.wav
```
