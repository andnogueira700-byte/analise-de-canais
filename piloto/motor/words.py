import numpy as np, subprocess, json
from faster_whisper import WhisperModel
raw=subprocess.run(["ffmpeg","-nostdin","-v","error","-i","orig85.wav","-f","s16le","-ac","1","-ar","16000","-"],capture_output=True).stdout
a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
m=WhisperModel("small",device="cpu",compute_type="int8")
segs,_=m.transcribe(a,language="it",word_timestamps=True,vad_filter=False,condition_on_previous_text=False)
out=[]
for s in segs:
    for w in s.words: out.append([round(w.start,2),round(w.end,2),w.word.strip()])
json.dump(out,open("words85.json","w"),ensure_ascii=False)
print(len(out))
