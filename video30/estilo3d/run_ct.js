const {chromium}=require('playwright');const fs=require('fs');const srv=require('./lib_srv');
(async()=>{const {s,port}=await srv();const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:960,height:480}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('C',m.text().slice(0,200))});
await p.goto(`http://localhost:${port}/chartest.html`);await p.waitForFunction('window.READY===true',null,{timeout:90000});
const x=await p.evaluate(()=>fr(1.0));fs.writeFileSync('ct.jpg',Buffer.from(x,'base64'));await b.close();s.close();})()
