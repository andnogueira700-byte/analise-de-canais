import sys; sys.path.insert(0,'/tmp/mers/tools'); sys.path.insert(0,'/tmp/lanc/tools')
import mplan, dsfx
from mplan import tm,BLK,DUR
TRANS={round(b,2):'dip' for a,b in BLK}
T=tm
TICKS=[T("0:12.9"),T("0:30.5"),T("0:57.8"),T("1:01.3"),T("3:44.9"),T("4:00.5"),T("5:31.3"),T("5:34.9"),T("5:44.7"),T("7:50.3"),T("7:51.8"),T("7:54.3"),T("10:27.3"),T("12:07.0"),T("13:35.8"),T("13:55.4")]
IMPACTS=[(T("0:05.7"),0.5),(T("9:39.3"),0.85),(T("10:51.0"),0.55)]+[(T("9:28.7")+3.0*k,0.35) for k in range(0,9)]
COUNTERS=[]; AIRS=[]
dsfx.build(DUR,TRANS,TICKS,COUNTERS,IMPACTS,AIRS,'/tmp/mers/build/sfx_bed.wav','/tmp/mers/build/sfx_hits.wav')
