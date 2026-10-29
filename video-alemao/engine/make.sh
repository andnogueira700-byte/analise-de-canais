#!/bin/bash
# Renderiza [ini, fim) em paralelo, junta os pedaços e coloca o áudio mixado. Uso: make.sh ini fim workers saida.mp4
set -e
INI=$1; FIM=$2; N=${3:-3}; OUT=$4; FPS=30
T=/tmp/claude-0/partes; mkdir -p $T; rm -f $T/p_*.mp4 $T/lista.txt
DIR=$(cd "$(dirname "$0")" && pwd)
PIDS=()
for i in $(seq 0 $((N-1))); do
  a=$(python3 -c "print(round($INI+($FIM-$INI)*$i/$N*1.0*$FPS)/$FPS)"); b=$(python3 -c "print(round($INI+($FIM-$INI)*($i+1)/$N*1.0*$FPS)/$FPS)")
  node $DIR/render.js $a $b $T/p_$i.mp4 $FPS > $T/log_$i.txt 2>&1 & PIDS+=($!)
  echo "file '$T/p_$i.mp4'" >> $T/lista.txt
done
for p in ${PIDS[@]}; do wait $p; done
ffmpeg -v error -y -f concat -safe 0 -i $T/lista.txt -c copy $T/video.mp4
ffmpeg -v error -y -i $T/video.mp4 -ss $INI -t $(python3 -c "print($FIM-$INI)") -i $DIR/../audio/mix.m4a -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo pronto "$OUT"
