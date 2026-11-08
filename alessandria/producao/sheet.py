import subprocess,sys,os
from PIL import Image,ImageDraw,ImageFont
src,tag,step=sys.argv[1],sys.argv[2],float(sys.argv[3])
d=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src],capture_output=True,text=True).stdout)
tmp=f'/tmp/alex/sheets/_{tag}'; os.makedirs(tmp,exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-vf',f'fps=1/{step},scale=320:-2',f'{tmp}/f%04d.jpg'])
fs=sorted(os.listdir(tmp)); f=ImageFont.truetype('/tmp/ref/Montserrat_800.ttf',18)
per=36
for s in range(0,len(fs),per):
    W=Image.new('RGB',(6*320,6*250),'black'); dr=ImageDraw.Draw(W)
    for i,n in enumerate(fs[s:s+per]):
        im=Image.open(f'{tmp}/{n}'); im.thumbnail((320,240)); x,y=(i%6)*320,(i//6)*250
        W.paste(im,(x,y)); t=(s+i)*step+step/2*0; dr.text((x+4,y+4),f'{int(t//60)}:{int(t%60):02d}',fill='yellow',font=f,stroke_width=2,stroke_fill='black')
    W.save(f'/tmp/alex/sheets/{tag}_{s//per:02d}.jpg',quality=80)
print(len(fs))
