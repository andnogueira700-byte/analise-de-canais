import sys, glob
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/*.jpg')); cols=int(sys.argv[2]) if len(sys.argv)>2 else 2
w,h=640,360; ims=[Image.open(f).resize((w,h)) for f in fs]
W=Image.new('RGB',(w*cols,h*((len(ims)+cols-1)//cols)))
for i,im in enumerate(ims): W.paste(im,((i%cols)*w,(i//cols)*h))
W.save(d+'/grid.png'); print(len(fs))
