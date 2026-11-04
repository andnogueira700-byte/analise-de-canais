const http=require('http'),fs=require('fs'),path=require('path');
const MIME={'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.glb':'model/gltf-binary','.fbx':'application/octet-stream','.json':'application/json'};
module.exports=()=>new Promise(r=>{const s=http.createServer((q,res)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d);});}).listen(0,()=>r({s,port:s.address().port}));});
