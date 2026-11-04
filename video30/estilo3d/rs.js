const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{const mode=process.argv[2],dur=parseFloat(process.argv[3]),fps=24;
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1280,height:720}});
p.on('pageerror',e=>console.error('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('C',m.text())});
await p.goto('file://'+__dirname+'/style3d.html?mode='+mode);await p.waitForFunction('window.READY===true');
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','22','-pix_fmt','yuv420p',`${mode}.mp4`],{stdio:['pipe','inherit','inherit']});
fs.mkdirSync('stills',{recursive:true});const n=Math.round(dur*fps),t0=Date.now();
for(let k=0;k<n;k++){const d=await p.evaluate(t=>window.frame(t),k/fps);const buf=Buffer.from(d,'base64');if(k%48===0)fs.writeFileSync(`stills/${mode}_${k}.jpg`,buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log(mode,'ok',(Date.now()-t0)/n,'ms/frame');await b.close();})();
