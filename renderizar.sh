#!/usr/bin/env bash
# Mac/Linux: ./renderizar.sh [pasta-do-projeto]
set -e
cd "$(dirname "$0")/videos/engine"
command -v node >/dev/null || { echo "Falta o Node.js: instale a versão LTS de https://nodejs.org"; exit 1; }
[ -d node_modules/playwright ] || npm install
node renderizar.js "${1:-../01-pitbull-t-rex/piloto}"
