const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.otf':'font/otf','.wav':'audio/wav'};
module.exports=(root,port)=>new Promise(res=>{const s=http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(port,()=>res(s));});
