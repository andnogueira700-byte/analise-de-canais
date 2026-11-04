set -e
python3 - <<'P'
import json
d=json.load(open('scenes.json'))
open('concat.txt','w').write(''.join(f"file 'seg/{s['id']}.mp4'\n" for s in d))
P
ffmpeg -y -loglevel error -i mix_raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 160k mix_final.m4a
ffmpeg -y -loglevel error -f concat -safe 0 -i concat.txt -i mix_final.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart video30.mp4
ls -la video30.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 video30.mp4
