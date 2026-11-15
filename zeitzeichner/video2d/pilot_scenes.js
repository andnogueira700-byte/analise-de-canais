const S={
s1(u,d,t){bg('#3d5276','#7a6a78');cam(1+0.03*u/d);snowfall(t,50,'rgba(255,255,255,0.5)');glow(W/2,900,800,'rgba(255,160,70,0.35)');gate(W/2,930,1.2,'#d9cdb6');R(-300,930,W+600,300,'#e9e4dc');for(let i=0;i<16;i++)torch(110+i*115,880,1,t,i)},
s2(u,d,t){bg('#7d8fb0','#c9b9b4');cam(1.02);city(t,false,880);R(-300,880,W+600,300,C.snow);for(let i=0;i<6;i++){R(130+i*330,700,10,190,'#3a3a40');glow(135+i*330,700,70,'rgba(255,210,120,0.8)');circ(135+i*330,700,12,'#ffe7a0')}
 fig({x:260+u*150,y:960,s:0.9,dir:1,walk:u*6.5,body:'#7a5a40',hat:'top',must:'thin',mustC:'#4a3020'});fig({x:1560-u*130,y:975,s:0.85,dir:-1,walk:u*6.5+1.3,body:'#4a5a78',hair:'short',coat:true});snowfall(t,160)},
s3(u,d,t){bg('#33466a','#806470');gate(W/2+260,860,0.95,'#cbbfa8');R(-300,860,W+600,300,'#dcd6cc');glow(W/2,800,900,'rgba(255,150,60,0.3)');
 const ph=u*6.2;// todos no mesmo passo (marcha)
 for(let row=0;row<3;row++)for(let i=0;i<13;i++){const x=((i*170+u*120+row*60)%(W+500))-250;fig({x,y:900+row*80,s:0.55+row*0.13,dir:1,walk:ph+row*0.2,body:'#8a6a3e',legs:'#3d3226',hat:'cap',hatC:'#7a5c34',armband:true,a1:-2.75,a2:-0.45*Math.sin(ph+row*0.2),hold:(hx,hy)=>torch(hx,hy-34,0.9,t,i+row*20)})}},
s4(u,d,t){const p=ease(Math.max(0,(u-0.6)/(d-0.6)));const z=lerp(1,4.2,p),fx=lerp(W/2,1068,p),fy=lerp(H/2,318,p);bg('#2c3a58','#4a4560');push(z,fx,fy);
 R(140,120,1640,980,'#8f8676',8);R(120,100,1680,40,'#7a7264');
 for(let r=0;r<2;r++)for(let k=0;k<6;k++){const x=230+k*255,y=230+r*380,lit=(r==0&&k==3);const f=0.35+0.2*Math.sin(t*9+k*2);windowR(x,y,150,270,lit?'#f6c56a':`rgba(255,${150+k*8},70,${f})`,'#5a5248')}
 X.save();X.beginPath();X.rect(995,230,150,270);X.clip();R(995,230,150,270,'#f6c56a');fig(HB({x:1070,y:560,s:0.62,dir:-1}));X.restore();
 X.strokeStyle='#5a5248';X.lineWidth=16;X.strokeRect(995,230,150,270);X.lineWidth=9;X.beginPath();X.moveTo(1070,230);X.lineTo(1070,500);X.moveTo(995,338);X.lineTo(1145,338);X.stroke();R(140,1000,1640,80,'#6a6255')},
s5(u,d,t){// janela vista de fora: moldura de pedra, vidro, reflexo das tochas, ele atrás do vidro
 bg('#3a3550','#2a2638');cam(1+0.02*u/d);R(0,0,W,H,'#8f8676');R(300,40,1320,1040,'#7a7264',8);
 const f=0.85+0.15*Math.sin(t*10);R(380,110,1160,900,`rgb(${246*f|0},${190*f|0},${110*f|0})`);glow(960,450,700,'rgba(255,230,170,0.5)');
 X.fillStyle='#8a2e22';X.fillRect(380,110,170,900);X.fillRect(1370,110,170,900);// cortinas por dentro
 X.save();X.beginPath();X.rect(380,110,1160,900);X.clip();fig(HB({x:940,y:1330,s:2.6,dir:1,a1:0.1}));X.restore();
 X.fillStyle='rgba(180,210,255,0.12)';X.fillRect(380,110,1160,900);// vidro
 for(let i=0;i<7;i++){const rx=420+i*165+Math.sin(t*0.6+i)*14,ry=760+rnd(i)*120;X.globalAlpha=0.35+0.2*Math.sin(t*12+i);X.fillStyle='#ffb050';X.beginPath();X.ellipse(rx,ry,10,26,0,0,7);X.fill();X.globalAlpha=1}// reflexo das tochas
 X.fillStyle='rgba(255,255,255,0.18)';X.beginPath();X.moveTo(420,110);X.lineTo(560,110);X.lineTo(400,560);X.lineTo(380,560);X.fill();
 X.strokeStyle='#4a3a2c';X.lineWidth=34;X.strokeRect(380,110,1160,900);X.lineWidth=22;X.beginPath();X.moveTo(960,110);X.lineTo(960,1010);X.moveTo(380,470);X.lineTo(1540,470);X.stroke();
 R(330,1000,1260,70,'#a49a88',6);R(300,40,1320,60,'#a49a88',6)},
s6(u,d,t){bg('#2c3c5c','#4c4a62');R(0,0,W,H,'#3a4664');const ph=u*6.2;for(let r=0;r<6;r++)for(let i=0;i<20;i++){const x=((i*110+u*90+r*50)%(W+200))-100,y=150+r*150+Math.abs(Math.sin(ph+i*0.1))*4;circ(x,y,22,'#6a4c30');torch(x+24,y-10,0.8,t,i+r*40)}
 X.fillStyle='rgba(120,80,40,0.5)';X.fillRect(0,0,W,H);X.strokeStyle='#5a3a26';X.lineWidth=60;X.strokeRect(0,0,W,H);X.lineWidth=30;X.beginPath();X.moveTo(W/2,0);X.lineTo(W/2,H);X.stroke();
 const tap=Math.max(0,Math.sin(t*Math.PI*1.8));X.save();X.translate(-90,140);fig(HB({x:430,y:1400,s:2.2,dir:1,a1:0.25+tap*0.06,hold:(hx,hy)=>{R(hx-6,hy,12,200,'#3a2414',5)}}));X.restore()},
s7(u,d,t){bg('#c49a6c','#9e7450');cam(1.03);R(1450,140,320,560,'#2b2420',6);X.fillStyle='rgba(0,0,0,0.6)';X.beginPath();X.arc(1610,330,52,0,7);X.fill();X.fillRect(1550,385,120,320);
 R(-300,680,W+600,500,C.wood);R(-300,680,W+600,20,'#7a5230');R(640,740,560,320,C.cream,6);for(let i=0;i<7;i++)R(690,790+i*36,460*(i==6?0.45:1),7,'#c2b49a',3);
 const p=ease(u/(d*0.85));X.strokeStyle='#1d2a55';X.lineWidth=5;X.beginPath();for(let k=0;k<=60*p;k++){const xx=860+k*4,yy=1010+Math.sin(k*0.7)*12;k?X.lineTo(xx,yy):X.moveTo(xx,yy)}X.stroke();const px=860+240*p,py=1010+Math.sin(60*p*0.7)*12;
 R(px+40,py-190,90,130,'#6f7768',30);circ(px+40,py-60,26,C.skin);X.save();X.translate(px,py);X.rotate(-0.6);R(-6,-150,12,150,'#1c1c20',4);R(-9,-12,18,14,C.gold,3);X.restore()},
s8(u,d,t){bg('#5e3a2e','#2c2026');glow(W/2,560,700,'rgba(255,130,60,0.35)');const a=back(u/0.45);X.save();X.translate(W/2,1080);X.scale(a,a);X.translate(-W/2,-1080);fig(HITLER({x:W/2-120,y:1400,s:2.7,dir:1,a1:0.05}));X.restore()},
s9(u,d,t){bg('#cfd9e0','#eef0ea');city(t,false,820);R(-300,820,W+600,300,'#c8c2b4');R(1350,420,520,400,'#a39a88',4);R(1380,380,460,60,'#8a826f',4);
 for(let i=0;i<13;i++){const x=1300-i*95,step=i===12?u*6:null;fig({x:x+(i===12?-300+u*90:0),y:960+((i%2)*14),s:0.62,dir:1,walk:step,body:['#6a5a48','#4a5a6a','#7a4a3a','#5a6a4a'][i%4],hair:'short',hat:i%3==0?'top':(i%3==1?'cap':null),hatC:'#5a5048',must:i%2?'thin':null,mustC:'#4a3020',a1:-0.7,hold:(hx,hy)=>circ(hx,hy+4,7,C.gold)})}},
s10(u,d,t){bg('#cfd9e0','#f0ede4');push(lerp(1.12,1.0,ease(u/d)),W/2,560);R(-300,940,W+600,300,'#bfb8a8');R(560,260,800,600,'#b9b0a0',4);
 X.save();X.translate(W/2,960);X.scale(2.2,2.2);X.translate(-W/2,-960);fig(HB({x:W/2,y:960,s:0.95,dir:1,body:'#a0703c',legs:'#8a5e30',skin:'#c08850',hairC:'#8a5e30',mustC:'#7a5028',medals:false,buttons:false}));X.restore();
 for(let i=0;i<160;i++){if(rnd(i+3)>0.15){circ(W/2-150+rnd(i)*300,380+rnd(i+1)*520,3.2,rnd(i+2)>0.92?C.gold:'#4a3826')}}
 for(let i=0;i<6;i++){const x=560+i*160+(i>2?120:0),hit=Math.sin(t*9+i);fig({x,y:990,s:0.5,dir:i>2?-1:1,body:['#5a6a7a','#7a5a48','#4a4a5a'][i%3],hair:'short',a1:-1.2-hit*0.5,hold:(hx,hy)=>{R(hx-4,hy-40,8,44,'#5a3a22',3);R(hx-14,hy-48,28,12,'#555',3)}})}},
s11(u,d,t){bg('#e8c68a','#c98f4e');X.save();X.translate(W/2,H*0.75);X.rotate(t*0.05);for(let i=0;i<24;i++){X.rotate(Math.PI/12);X.fillStyle=i%2?'rgba(255,240,200,0.28)':'rgba(255,255,255,0.05)';X.beginPath();X.moveTo(0,0);X.lineTo(1800,-120);X.lineTo(1800,120);X.fill()}X.restore();
 const a=back(u/0.5);X.save();X.translate(W/2,1080);X.scale(a,a);X.translate(-W/2,-1080);fig(HB({x:W/2,y:1500,s:2.9,dir:1,hat:'pickel'}));X.restore()},
s12(u,d,t){R(0,0,W/2,H,'#9aa08a');R(W/2,0,W/2,H,'#d8cdb8');for(let i=0;i<5;i++)circ(80+i*200,620+rnd(i)*60,70+rnd(i+1)*30,'rgba(90,90,80,0.35)');R(0,880,W/2,200,'#6a6a52');
 fig(HB({x:480,y:1300,s:2.0,dir:1,hat:'pickel'}));const fl=Math.sin(t*2.5)*14;['#1a1a1a','#c0392b','#e2b04a'].forEach((col,i)=>{X.fillStyle=col;X.beginPath();X.moveTo(1560,190+i*80);X.quadraticCurveTo(1680,180+i*80+fl,1800,195+i*80);X.lineTo(1800,275+i*80);X.quadraticCurveTo(1680,260+i*80+fl,1560,270+i*80);X.fill()});R(1550,180,12,800,'#6a4a2a');
 R(W/2,880,W/2,200,'#a89a80');fig(HB({x:1380,y:1300,s:2.0,dir:-1,body:'#26262c',legs:'#1e1e22',medals:false,buttons:false,coat:true}));R(W/2-4,0,8,H,'#fff')},
s13(u,d,t){bg('#4a5a7a','#2a3048');cam(1+0.03*u/d);R(500,120,920,1000,'#8a8f9a',10);R(560,170,800,40,'#6a707c');X.fillStyle='#10131c';X.beginPath();X.moveTo(700,1080);X.lineTo(700,440);X.arc(960,440,260,Math.PI,0);X.lineTo(1220,1080);X.fill();
 const o=ease(u/(d*0.7));glow(960,760,500*o,'rgba(170,200,255,0.45)');X.save();X.translate(700,0);X.scale(1-0.88*o,1);X.fillStyle='#5a4a3a';X.fillRect(0,440,520,640);X.beginPath();X.arc(260,440,260,Math.PI,0);X.fill();for(let k=0;k<5;k++)R(30,500+k*110,460,12,'#4a3a2a',4);circ(440,760,16,C.gold);X.restore();
 R(450,1010,1020,70,'#6a707c');['#1a1a1a','#c0392b','#e2b04a'].forEach((col,i)=>R(820,1030+i*12,300,12,col))},
s14(u,d,t){bg('#e8dcc4','#cdbb98');circ(W/2,H/2+40,330,'#b8893c');circ(W/2,H/2+40,295,'#fbf5e8');for(let k=0;k<12;k++){const a=k/12*6.283;R(W/2+Math.cos(a)*250-7,H/2+40+Math.sin(a)*250-7,14,14,'#3a2a1a',3)}
 R(W/2-28,H/2-330,56,70,'#b8893c',8);X.strokeStyle='#b8893c';X.lineWidth=16;X.beginPath();X.arc(W/2,H/2-340,42,0,7);X.stroke();
 const a1=-t*10,a2=-t*0.9;X.lineCap='round';X.strokeStyle='#22201c';X.lineWidth=18;X.beginPath();X.moveTo(W/2,H/2+40);X.lineTo(W/2+Math.sin(a2)*160,H/2+40-Math.cos(a2)*160);X.stroke();X.lineWidth=10;X.beginPath();X.moveTo(W/2,H/2+40);X.lineTo(W/2+Math.sin(a1)*240,H/2+40-Math.cos(a1)*240);X.stroke();X.lineCap='butt';circ(W/2,H/2+40,16,'#22201c')},
s15(u,d,t){bg('#b9c3cc','#dfe3e2');R(-100,260,W+200,560,'#9a5a44');R(-100,230,W+200,40,'#7a4434');for(let r=0;r<3;r++)for(let k=0;k<11;k++)R(40+k*175,320+r*160,80,110,'#4a3a40',4);R(-300,800,W+600,300,'#b8b4a8');
 const ph=u*6.2;for(let i=0;i<6;i++){fig({x:120+i*140+u*60,y:950,s:0.6,dir:1,body:'#2a3a6a',legs:'#1e2a4a',hat:'cadet',buttons:true,walk:ph})}
 const adj=Math.max(0,Math.sin(u*3.2));fig({x:1350,y:1060,s:1.3,dir:-1,body:'#2a3a6a',legs:'#1e2a4a',bw:84,hat:'cadet',hair:'short',headR:44,buttons:true,a1:-2.4+adj*0.4,sweat:true})}
};
