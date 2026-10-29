#!/bin/bash
# renderiza um pedaço de 45 s; só renomeia quando termina (pedaço pronto não é refeito)
i=$1; D=/tmp/claude-0/final3; a=$(python3 -c "print($i*45)"); b=$(python3 -c "print(min(($i+1)*45, 914.65))")
[ -f $D/seg_$(printf %02d $i).mp4 ] && exit 0
cd /home/user/analise-de-canais/video-alemao/engine && V=cisplatina ESTILO=b MARCAS=1 TILT=30 node render.js $a $b $D/tmp_$i.mp4 30 > $D/log_$i.txt 2>&1 && mv $D/tmp_$i.mp4 $D/seg_$(printf %02d $i).mp4
