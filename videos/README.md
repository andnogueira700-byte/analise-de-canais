# Produção de vídeos em microblocos

- `engine/` — motor de render (three.js em Chromium, com ou sem placa de vídeo): cubos com chanfro, pitbull articulado, T. rex, cenário de Hell Creek, textos e cartões em blocos, mixagem de áudio.
- `01-pitbull-t-rex/completo/` — vídeo completo (16:40): narração em `audio/` (partes originais, transcrição, ritmo, `musica.json` com os trechos de calma/tensão/noite/silêncio), cenas em `src/` (`shots.js` com os planos do piloto retemporizados e `bloco2..4.js`).
- `01-pitbull-t-rex/piloto/` — piloto de 2 min: narração (`narracion.mp3` original, `narracion_ritmo.wav` com pausas encurtadas), tempos por palavra (`words_ritmo.json`) e as cenas (`src/shots.js`).

## Renderizar no seu computador (um comando)

Precisa só do **Node.js** (versão LTS, em https://nodejs.org). O resto (navegador, ffmpeg) é instalado sozinho na primeira vez.

- **Windows:** baixe o repositório e dê dois cliques em `RENDERIZAR.bat` (piloto de 2 min) ou `RENDERIZAR_COMPLETO.bat` (vídeo completo de 16 min), na pasta principal.
- **Mac/Linux:** `./renderizar.sh`

O vídeo pronto aparece na pasta do projeto (ex.: `videos/01-pitbull-t-rex/piloto/01-pitbull-t-rex_piloto.mp4`).
O motor usa a placa de vídeo automaticamente; se não encontrar uma, usa o processador (bem mais lento).
Para mixar a trilha do zero precisa de Python com `numpy` e `scipy`; sem isso, usa a trilha pronta do projeto (`trilha.m4a`).

Opções (`node renderizar.js <pasta> ...`): `--partes N` (quantas partes em paralelo), `--fps 30`, `--cpu`, `--ate 6` (teste rápido só dos primeiros segundos).

## Comandos avulsos

```bash
cd videos/engine && npm install   # os caminhos das páginas são relativos à pasta principal do repositório
node render.js still videos/01-pitbull-t-rex/piloto/src/index.html /tmp/previas "1.5,15.9,24.5" 960 540
node render.js video videos/01-pitbull-t-rex/piloto/src/index.html saida.mp4 0 122.55 24 2240 1260
node render.js meta  videos/01-pitbull-t-rex/piloto/src/index.html meta.json
python3 audio/mix.py meta.json ../01-pitbull-t-rex/piloto/narracion_ritmo.wav trilha.wav
```
