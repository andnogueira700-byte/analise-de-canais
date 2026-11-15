
const W=1920,H=1080,c=document.getElementById('c'),X=c.getContext('2d');
const rnd=s=>{let x=Math.sin(s*12.9898+78.233)*43758.5453;return x-Math.floor(x)};
const ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const back=t=>{t=Math.min(Math.max(t,0),1);const s=1.7;return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2)};
const lerp=(a,b,t)=>a+(b-a)*t;
const C={sky:'#a9bccd',sky2:'#d7dfe6',bld:'#7c8aa0',bld2:'#929fb3',bld3:'#66748a',win:'#3e4a5e',lit:'#f2c35b',snow:'#eef1f4',night:'#2e3f5e',night2:'#4a5878',wall:'#c9a57c',wall2:'#b48d64',floor:'#7d5434',wood:'#9a6a3e',red:'#c0392b',gold:'#e2b04a',cream:'#f3ead8',ink:'#26221f',grey:'#7a7d78',field:'#6f7563',skin:'#f0c7a2',brown:'#8a5a32'};
function R(x,y,w,h,col,r=0){X.fillStyle=col;X.beginPath();X.roundRect(x,y,w,h,r);X.fill()}
function circ(x,y,r,col){X.fillStyle=col;X.beginPath();X.arc(x,y,r,0,7);X.fill()}
function glow(x,y,r,col){const g=X.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(x-r,y-r,2*r,2*r)}
function bg(a,b){const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(1,b);X.fillStyle=g;X.fillRect(-300,-300,W+600,H+600)}
function push(z,fx,fy){X.translate(W/2,H/2);X.scale(z,z);X.translate(-fx,-fy)}
function cam(z,ox=0,oy=0){X.translate(W/2+ox,H/2+oy);X.scale(z,z);X.translate(-W/2,-H/2)}
function snowfall(t,n=120,col='rgba(255,255,255,0.85)'){for(let i=0;i<n;i++){const x=(rnd(i)*W*1.2+Math.sin(t+i)*25)%(W*1.1)-50,y=(rnd(i+50)*H+t*(40+rnd(i+9)*50))%H;circ(x,y,2+rnd(i+3)*3,col)}}
function torch(x,y,s,t,seed){R(x-3*s,y,6*s,46*s,'#5b3a22');const f=1+0.2*Math.sin(t*20+seed*3);glow(x,y-6*s,60*s,'rgba(255,170,60,0.45)');X.fillStyle='#ff9b2f';X.beginPath();X.ellipse(x,y-8*s,9*s,18*s*f,0,0,7);X.fill();X.fillStyle='#ffe08a';X.beginPath();X.ellipse(x,y-4*s,4.5*s,9*s*f,0,0,7);X.fill()}
// ---------- personagem flat ----------
function fig(o){const s=o.s||1,d=o.dir||1,x=o.x,y=o.y,hgt=o.tall||1;const wk=o.walk!=null?Math.sin(o.walk):0;
 const legH=95*s*hgt,bodyH=120*s*hgt,bodyW=(o.bw||78)*s;const bob=o.walk!=null?Math.abs(Math.cos(o.walk))*5*s:0;const hip=y-legH-bob+ (o.walk!=null?3*s:0),sh=hip-bodyH;
 const lc=o.legs||'#2f3440';
 const ph=o.walk!=null?o.walk:null;
 const leg=(p,back)=>{const th=ph==null?0:-d*0.42*Math.sin(p),fl=ph==null?0:0.85*Math.max(0,Math.cos(p));const L1=legH*0.52,L2=legH*0.5;
  X.save();X.translate(x+(back?-6*s:6*s),hip);X.rotate(th);R(-11*s,0,22*s,L1+6*s,back?shade(lc):lc,8*s);X.translate(0,L1);X.rotate(d*fl);R(-10*s,0,20*s,L2,back?shade(lc):lc,7*s);R(-10*s+(d<0?-14*s:0),L2-11*s,34*s,12*s,'#1d1d22',5*s);X.restore()};
 leg((ph||0)+Math.PI,true);leg(ph||0,false);
 R(x-bodyW/2,sh,bodyW,bodyH+8*s,o.body||'#5d6b55',16*s);
 if(o.coat)R(x-bodyW/2-6*s,sh+bodyH*0.55,bodyW+12*s,bodyH*0.55,o.body,10*s);
 if(o.armband)R(x-bodyW/2,sh+30*s,bodyW,14*s,'#b3261e');
 if(o.medals){[0,1,2].forEach(i=>circ(x+d*10*s+i*d*9*s,sh+40*s,5*s,C.gold))}
 if(o.buttons){for(let i=0;i<4;i++)circ(x+d*8*s,sh+25*s+i*24*s,3.5*s,C.gold)}
 const arm=(ang,front)=>{X.save();X.translate(x+(front?d*bodyW*0.46:-d*bodyW*0.46),sh+14*s);X.rotate(ang*d);R(-10*s,0,20*s,90*s*hgt,o.body?shade(o.body):'#4a5546',9*s);circ(0,90*s*hgt,10*s,o.skin||C.skin);if(front&&o.hold)o.hold(0,90*s*hgt);X.restore()};
 arm(o.a2!=null?o.a2:(o.walk!=null?-0.45*Math.sin(o.walk):0.08),false);
 // cabeça
 const hx=x+d*4*s,hy=sh-48*s,hr=(o.headR||46)*s;
 if(o.square){R(hx-hr,hy-hr*1.05,hr*2,hr*2.05,o.skin||C.skin,hr*0.45)}else circ(hx,hy,hr,o.skin||C.skin);
 circ(hx-d*hr*0.92,hy+4*s,9*s,shade(o.skin||C.skin));
 // cabelo
 if(o.hair==='crew'){R(hx-hr*1.0,hy-hr*1.12,hr*2,hr*0.42,o.hairC||'#e8e6e0',6*s)}
 if(o.hair==='side'){X.fillStyle=o.hairC||'#2b2420';X.beginPath();X.ellipse(hx,hy-hr*0.62,hr*1.02,hr*0.5,0,Math.PI,0);X.fill();X.beginPath();X.moveTo(hx-d*hr*0.2,hy-hr*0.9);X.quadraticCurveTo(hx+d*hr*0.7,hy-hr*0.7,hx+d*hr*0.75,hy-hr*0.2);X.lineTo(hx+d*hr*0.35,hy-hr*0.55);X.fill()}
 if(o.hair==='short')R(hx-hr,hy-hr*1.05,hr*2,hr*0.6,o.hairC||'#5a3a22',hr*0.5);
 if(o.hair==='bald')R(hx-hr*1.02,hy-hr*0.35,hr*0.35,hr*0.5,o.hairC||'#8a8a8a',6*s);
 // olhos
 const ex=hx+d*hr*0.38,ey=hy-hr*0.08;circ(ex,ey,5*s,'#1d1b1a');circ(ex-d*hr*0.42,ey,5*s,'#1d1b1a');
 if(o.brow){R(ex-d*hr*0.6-8*s,ey-16*s,hr*0.9,6*s,o.hairC||'#2b2420',3*s)}
 if(o.mono){X.strokeStyle='#d9d2c0';X.lineWidth=3*s;X.beginPath();X.arc(ex,ey,10*s,0,7);X.stroke()}
 // nariz
 circ(hx+d*hr*0.78,hy+hr*0.12,hr*0.2,shade(o.skin||C.skin));
 // bigodes
 const mc=o.mustC||'#ece9e2',my=hy+hr*0.38,mx=hx+d*hr*0.5;
 if(o.must==='walrus'){X.fillStyle=mc;X.beginPath();X.moveTo(mx-d*hr*0.7,my);X.quadraticCurveTo(mx,my-hr*0.3,mx+d*hr*0.55,my-hr*0.05);X.quadraticCurveTo(mx+d*hr*0.9,my-hr*0.05,mx+d*hr*1.0,my-hr*0.4);X.quadraticCurveTo(mx+d*hr*1.05,my+hr*0.15,mx+d*hr*0.45,my+hr*0.2);X.quadraticCurveTo(mx-d*hr*0.2,my+hr*0.28,mx-d*hr*0.7,my);X.fill()}
 if(o.must==='brush')R(mx-d*6*s-9*s,my-8*s,18*s,12*s,mc,2*s);
 if(o.must==='thin')R(mx-d*14*s-14*s,my-6*s,28*s,7*s,mc,3*s);
 if(o.must==='wax'){X.strokeStyle=mc;X.lineWidth=7*s;X.lineCap='round';X.beginPath();X.moveTo(mx-d*hr*0.45,my-hr*0.35);X.quadraticCurveTo(mx,my-hr*0.05,mx+d*hr*0.45,my-hr*0.35);X.stroke();X.lineCap='butt'}
 if(!o.must||o.must==='brush'||o.must==='thin'){X.strokeStyle='#7a4a3a';X.lineWidth=3*s;X.beginPath();X.moveTo(hx+d*hr*0.25,hy+hr*0.58);X.lineTo(hx+d*hr*0.6,hy+hr*0.55);X.stroke()}
 if(o.sweat){X.fillStyle='#8fd0ff';X.beginPath();X.ellipse(hx-d*hr*0.1,hy-hr*0.5,6*s,10*s,0,0,7);X.fill()}
 // chapéus
 if(o.hat==='pickel'){R(hx-hr*1.05,hy-hr*1.2,hr*2.1,hr*0.7,'#1f2128',hr*0.3);R(hx-hr*0.15,hy-hr*1.6,hr*0.3,hr*0.45,'#c8a24a',4*s);R(hx-hr*1.15+d*hr*0.2,hy-hr*0.6,hr*2.1,hr*0.16,'#1f2128',4*s);circ(hx+d*hr*0.2,hy-hr*0.9,hr*0.18,C.gold)}
 if(o.hat==='cap'){R(hx-hr*1.0,hy-hr*1.12,hr*2,hr*0.55,o.hatC||'#5d6b55',hr*0.25);R(hx-hr*0.2,hy-hr*0.66,hr*1.5*d,hr*0.14,'#1f2128',3*s);R(hx-hr*1.0,hy-hr*0.78,hr*2,hr*0.12,'#b3261e')}
 if(o.hat==='top'){R(hx-hr*0.75,hy-hr*2.0,hr*1.5,hr*1.2,'#1c1c20',6*s);R(hx-hr*1.15,hy-hr*0.88,hr*2.3,hr*0.15,'#1c1c20',4*s)}
 if(o.hat==='cadet'){R(hx-hr*1.25,hy-hr*1.35,hr*2.5,hr*0.75,'#22305a',hr*0.3);R(hx-hr*1.3,hy-hr*0.72,hr*2.6,hr*0.15,'#111',3*s);circ(hx+d*hr*0.2,hy-hr*1.0,hr*0.15,C.gold)}
 arm(o.a1!=null?o.a1:(o.walk!=null?0.45*Math.sin(o.walk):-0.08),true);
}
function shade(h){const n=parseInt(h.slice(1),16);let r=(n>>16)*0.82,g=((n>>8)&255)*0.82,b=(n&255)*0.82;return `rgb(${r|0},${g|0},${b|0})`}
const HB=(o)=>Object.assign({s:1,tall:1.12,square:true,headR:50,hair:'crew',hairC:'#eeeeea',must:'walrus',body:'#6f7768',legs:'#3a3f39',medals:true,buttons:true,brow:true,bw:96},o);
const HITLER=(o)=>Object.assign({s:1,headR:42,hair:'side',hairC:'#2b2420',must:'brush',mustC:'#2b2420',body:'#2c2c30',legs:'#232327',bw:84},o);
// ---------- cenários ----------
function city(t,night,y0=860){for(let i=0;i<9;i++){const w=210+rnd(i)*90,h=330+rnd(i+4)*260,x=-60+i*230;R(x,y0-h,w,h,i%2?(night?'#3b4a68':C.bld2):(night?'#33405c':C.bld));for(let r=0;r<Math.floor(h/70)-1;r++)for(let k=0;k<Math.floor(w/48);k++){const lit=rnd(i*100+r*10+k)>(night?0.55:0.72);R(x+16+k*46,y0-h+26+r*68,24,34,lit?C.lit:(night?'#26324a':C.win),2)}
 R(x+w*0.4,y0-h-26,18,30,night?'#2a3550':C.bld3)}}
function gate(x,y,s,col){R(x-330*s,y-36*s,660*s,36*s,shade(col));for(let i=0;i<6;i++)R(x-280*s+i*112*s-15*s,y-300*s,30*s,265*s,col,4*s);R(x-345*s,y-345*s,690*s,48*s,col,4*s);R(x-305*s,y-392*s,610*s,50*s,shade(col),4*s);R(x-110*s,y-440*s,220*s,50*s,col,6*s);
 X.fillStyle=shade(shade(col));X.beginPath();X.ellipse(x-30*s,y-458*s,62*s,20*s,0,0,7);X.fill();R(x-6*s,y-540*s,14*s,90*s,shade(shade(col)));circ(x+1*s,y-548*s,14*s,shade(shade(col)))}
function windowR(x,y,w,h,inner,frame='#5a3a26'){R(x,y,w,h,inner,6);X.strokeStyle=frame;X.lineWidth=16;X.strokeRect(x,y,w,h);X.lineWidth=9;X.beginPath();X.moveTo(x+w/2,y);X.lineTo(x+w/2,y+h);X.moveTo(x,y+h*0.4);X.lineTo(x+w,y+h*0.4);X.stroke()}
// ---------- interface fixa ----------
const CH=[['Jugend',1847,1866,'#9aa3ad'],['Kaiserreich',1866,1914,'#6f8fb0'],['Weltkrieg',1914,1918,'#c0574a'],['Weimar',1918,1933,'#9fb06e'],['Untergang',1933,1934.7,'#d58a3a']];
const TX0=140,TX1=1780;function yearX(y){// eixo não-linear: cada capítulo tem largura fixa
 const wd=[0.17,0.27,0.18,0.24,0.14];let acc=TX0;for(let i=0;i<CH.length;i++){const [n,a,b]=CH[i],w=wd[i]*(TX1-TX0);if(y<=b||i==CH.length-1)return acc+w*Math.min(1,Math.max(0,(y-a)/(b-a)));acc+=w}}
function timeline(year,label){X.save();X.globalAlpha=0.93;R(TX0-40,14,TX1-TX0+80,62,'rgba(32,34,40,0.78)',10);X.globalAlpha=1;
 for(let i=0;i<CH.length;i++){const [n,a,b,col]=CH[i],x0=yearX(a),x1=yearX(b);const past=year>=a;R(x0,26,x1-x0-3,7,past?col:'rgba(255,255,255,0.18)',3);X.fillStyle=year>=a&&year<b?'#fff':'rgba(255,255,255,0.6)';X.font='600 17px Inter';X.textAlign='center';X.fillText(n,(x0+x1)/2,56)}
 X.font='500 13px Inter';X.fillStyle='rgba(255,255,255,0.55)';X.textAlign='left';X.fillText('1847',TX0-28,66);X.textAlign='right';X.fillText('1934',TX1+28,66);
 const mx=yearX(year);circ(mx,29,10,'#f3f3f3');circ(mx,29,5,'#bbb');X.textAlign='center';X.fillStyle='#fff';X.font='700 15px Inter';X.fillText(label,mx,92);X.textAlign='left';X.restore()}
function lowerThird(place,date,u){const a=ease((u-0.25)/0.35);if(a<=0)return;X.save();X.globalAlpha=a;const w=Math.max(X.measureText?380:380,place.length*26+80);const x=70-30*(1-a);
 const g=X.createLinearGradient(x,0,x+w+120,0);g.addColorStop(0,'rgba(22,22,26,0.85)');g.addColorStop(1,'rgba(22,22,26,0)');X.fillStyle=g;X.fillRect(x,880,w+160,110);R(x,880,9,110,C.red);
 X.fillStyle='#fff';X.font='800 44px Inter';X.letterSpacing='2px';X.fillText(place,x+34,930);X.letterSpacing='0px';R(x+34,946,w-40,2,'rgba(226,176,74,0.7)');X.fillStyle=C.gold;X.font='500 27px Inter';X.fillText(date,x+34,978);X.restore()}
function nameTag(name,role,u,x=W/2-220,y=900){const a=ease((u-0.3)/0.35);if(a<=0)return;X.save();X.globalAlpha=a;R(x,y,460,92,'rgba(22,22,26,0.82)',12);circ(x+46,y+46,28,C.gold);X.fillStyle='#22201c';X.font='900 26px Playfair';X.textAlign='center';X.fillText('Z',x+46,y+56);X.textAlign='left';X.fillStyle='#fff';X.font='800 30px Inter';X.fillText(name,x+92,y+44);X.fillStyle='#c9c4b8';X.font='500 21px Inter';X.fillText(role,x+92,y+74);X.restore()}
function bigNumber(txt,sub,u,t0=0.2,y=300){const a=back((u-t0)/0.5);if(a<=0)return;X.save();X.translate(W/2,y);X.scale(a,a);X.textAlign='center';X.shadowColor='rgba(0,0,0,0.45)';X.shadowBlur=18;X.shadowOffsetY=4;X.fillStyle='#fff';X.font='900 118px Inter';X.fillText(txt,0,0);if(sub){X.font='600 40px Inter';X.fillText(sub,0,62)}X.restore()}
function keyword(txt,u,t0=0.3){const a=ease((u-t0)/0.3);if(a<=0)return;X.save();X.globalAlpha=a;X.textAlign='center';X.font='700 46px Inter';const w=X.measureText(txt).width;R(W/2-w/2-26,955,w+52,70,'rgba(20,20,24,0.78)',10);X.fillStyle='#fff';X.fillText(txt,W/2,1004);X.restore()}
function watermark(){X.save();X.globalAlpha=0.45;X.strokeStyle='#fff';X.lineWidth=3;X.beginPath();X.arc(1840,1010,30,0,7);X.stroke();X.fillStyle='#fff';X.font='900 30px Playfair';X.textAlign='center';X.fillText('Z',1840,1021);for(let i=0;i<6;i++){X.beginPath();X.ellipse(1840-38+i*0,1010,0,0,0,0,1)}X.restore()}
function grain(t){for(let i=0;i<500;i++){X.fillStyle=`rgba(255,255,255,${0.05*rnd(i+t*7)})`;X.fillRect(rnd(i*3+Math.floor(t*24))*W,rnd(i*7+Math.floor(t*24)*5)*H,2,2)}const g=X.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.32)');X.fillStyle=g;X.fillRect(0,0,W,H)}
// ---------- cenas ----------
