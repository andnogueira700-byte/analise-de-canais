const {chromium}=require('playwright');const fs=require('fs');const srv=require('./lib_srv');const {spawn}=require('child_process');
(async()=>{const {s,port}=await srv();const cam=process.argv[2]||'side',dur=parseFloat(process.argv[3]||'0'),fps=24,out=process.argv[4]||('slc_'+cam);
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${port}/slc_scene.html?cam=${cam}`);await p.waitForFunction('window.READY===true',null,{timeout:90000});
if(!dur){for(const t of[1,3]){const x=await p.evaluate(t=>frame(t),t);fs.writeFileSync(`${out}_${t}.jpg`,Buffer.from(x,'base64'));}}
else{const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','22','-pix_fmt','yuv420p',out+'.mp4'],{stdio:['pipe','inherit','inherit']});
 for(let k=0;k<dur*fps;k++){const x=await p.evaluate(t=>frame(t),k/fps);if(!ff.stdin.write(Buffer.from(x,'base64')))await new Promise(r=>ff.stdin.once('drain',r));}ff.stdin.end();await new Promise(r=>ff.on('close',r));}
await b.close();s.close();})()
