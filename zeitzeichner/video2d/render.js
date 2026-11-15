const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');
(async()=>{const mode=process.argv[2]||'stills';const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+__dirname+'/scene.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
if(mode==='stills'){const ts=JSON.parse(process.argv[3]);fs.mkdirSync('stills',{recursive:true});for(const t of ts){const d=await p.evaluate(t=>render(t),t);fs.writeFileSync(`stills/s_${t}.jpg`,Buffer.from(d.split(',')[1],'base64'))}}
else{const fps=24,dur=await p.evaluate(()=>DUR),N=Math.ceil(dur*fps);const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+fps,'-i','-','-ss','0','-t',''+dur,'-i',process.argv[3],'-map','0:v','-map','1:a','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest',process.argv[4]]);
for(let f=0;f<N;f++){const d=await p.evaluate(t=>render(t),f/fps);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(f%240==0)console.log('frame',f,'/',N)}
ff.stdin.end();await new Promise(r=>ff.on('close',r))}
await b.close()})();
