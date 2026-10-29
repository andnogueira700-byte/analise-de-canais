#!/bin/bash
D=/tmp/claude-0/final2
seq 0 16 | xargs -P 4 -I{} bash $D/seg.sh {}
ls $D/seg_*.mp4 | sed "s/^/file '/; s/$/'/" > $D/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i $D/lista.txt -c copy $D/video.mp4
ffmpeg -v error -y -i $D/video.mp4 -i /home/user/analise-de-canais/video-holanda/audio/mix.m4a -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $D/holanda-final.mp4
echo PRONTO > $D/status.txt
