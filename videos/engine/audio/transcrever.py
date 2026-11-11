# Transcreve a narração com tempo por palavra: transcrever.py narracion.wav words.json
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-ar', '16000', '-ac', '1', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
m = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = m.transcribe(a, language='es', word_timestamps=True, beam_size=5, vad_filter=False)
W = []
for s in segs:
    for w in s.words: W.append({'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)})
    print(f'{s.start:7.1f} {s.text}', flush=True)
json.dump(W, open(sys.argv[2], 'w'), ensure_ascii=False)
