// Personagens da época a partir do X Bot (Mixamo): cores por região do corpo + peças presas aos ossos
const OUTFITS = {
  frogman: { torso:0x1a1c1e, legs:0x1a1c1e, arms:0x1a1c1e, hands:0x101112, feet:0x101112, head:0x141516, skin:0xc99a78, hood:true, goggles:true, rebreather:true },
  sailor_it: { torso:0xe9e6dc, legs:0x1d2b4a, arms:0xe9e6dc, hands:0xc99a78, feet:0x15171a, head:0xc99a78, skin:0xc99a78, cap:'white', collar:0x1d2b4a },
  officer_it: { torso:0x1d2b4a, legs:0x1d2b4a, arms:0x1d2b4a, hands:0xc99a78, feet:0x0e0f11, head:0xc99a78, skin:0xc99a78, cap:'peaked', stripes:true },
  sailor_uk: { torso:0x1c2433, legs:0x1c2433, arms:0x1c2433, hands:0xc99a78, feet:0x0e0f11, head:0xc99a78, skin:0xc99a78, cap:'uk', collar:0xdfe3e8 },
  officer_uk: { torso:0x171f2e, legs:0x171f2e, arms:0x171f2e, hands:0xc99a78, feet:0x0e0f11, head:0xc99a78, skin:0xc99a78, cap:'peaked', stripes:true },
  officer_white: { torso:0xe8e5da, legs:0xe8e5da, arms:0xe8e5da, hands:0xc99a78, feet:0x15171a, head:0xc99a78, skin:0xc99a78, cap:'peakedwhite', stripes:true }
};
function dressBot(root, key){
  const o = OUTFITS[key]; const col = new THREE.Color();
  root.traverse(m=>{
    if(!m.isSkinnedMesh) return;
    const g = m.geometry.clone(); m.geometry = g; const p = g.attributes.position; const n = p.count, c = new Float32Array(n*3);
    for(let i=0;i<n;i++){ const x=p.getX(i), y=p.getY(i); const ax=Math.abs(x); let hex;
      if(y>158) hex = o.head;                       // cabeça
      else if(y>148 && ax<10) hex = o.skin;         // pescoço
      else if(ax>62 && y>85) hex = o.hands;         // mãos
      else if(ax>22 && y>95) hex = o.arms;          // braços
      else if(y>95) hex = o.torso;                  // tronco
      else if(y<9) hex = o.feet;                    // pés
      else hex = o.legs;                            // pernas
      col.set(hex); c[i*3]=col.r; c[i*3+1]=col.g; c[i*3+2]=col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c,3));
    m.material = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.8, metalness:.02, flatShading:false, skinning:true});
    m.castShadow = true;
  });
  // acessórios: posicionados em coordenadas do mundo na pose-T (x lateral, y cima, z frente) e depois presos ao osso
  root.updateMatrixWorld(true);
  const B=n=>root.getObjectByName('mixamorig'+n)||root.getObjectByName('mixamorig:'+n);
  const wp=b=>b.getWorldPosition(new THREE.Vector3());
  const mat=(c,r=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
  const hb=B('Head'); const K=wp(hb).y>20?1:0.01; console.log('K',K,wp(hb).y);
  const put=(bone,geo,m,off,rot,sc)=>{const me=new THREE.Mesh(geo,m);const p=wp(bone).add(new THREE.Vector3(...off).multiplyScalar(K));me.position.copy(root.worldToLocal(p.clone()));if(rot)me.rotation.set(...rot);me.scale.set(...(sc||[1,1,1])).multiplyScalar(K);root.add(me);bone.attach(me);me.castShadow=true;return me;};
  const head=B('Head'), chest=B('Spine2');
  if(head){
    if(o.hood){ put(head,new THREE.SphereGeometry(11.4,18,14),mat(0x111213),[0,10,0],0,[.88,1.05,.98]); put(head,new THREE.SphereGeometry(5.6,12,10),mat(o.skin),[0,9.2,8.6],0,[.95,1.15,.42]); }
    if(o.goggles){ for(const sx of[-3.4,3.4]) put(head,new THREE.CylinderGeometry(2.5,2.5,1.4,12),mat(0x0a0a0a,.3),[sx,11,10.4],[Math.PI/2,0,0]); put(head,new THREE.BoxGeometry(12,1,1),mat(0x0a0a0a),[0,11,9.8]); }
    if(o.cap==='white'||o.cap==='uk'){ put(head,new THREE.CylinderGeometry(10.8,11.4,4.6,18),mat(o.cap==='white'?0xf0eee6:0x14181f),[0,17.5,0]); put(head,new THREE.CylinderGeometry(11.3,11.3,1.1,18),mat(o.cap==='white'?0x1d2b4a:0xefefef),[0,15.4,0]); }
    if(o.cap==='peaked'||o.cap==='peakedwhite'){ const cc=o.cap==='peaked'?0x131a2a:0xf0eee6; put(head,new THREE.CylinderGeometry(10.8,11.6,6,18),mat(cc),[0,18,0]); put(head,new THREE.CylinderGeometry(11.5,11.5,1.5,18),mat(0x0b0b0c),[0,15,0]); put(head,new THREE.BoxGeometry(12,.7,7),mat(0x0b0b0c),[0,15.4,9]); put(head,new THREE.SphereGeometry(1.4,8,6),mat(0xd4ab4f),[0,17,11.4]); }
  }
  if(chest){
    if(o.rebreather){ put(chest,new THREE.BoxGeometry(20,13,7),mat(0x2b2f2a),[0,-2,12.5]); put(chest,new THREE.CylinderGeometry(1.3,1.3,18,8),mat(0x555b55),[-7,6,12.5]); put(chest,new THREE.CylinderGeometry(1.3,1.3,18,8),mat(0x555b55),[7,6,12.5]); }
    if(o.collar){ put(chest,new THREE.BoxGeometry(27,.9,17),mat(o.collar),[0,15,-3]); put(chest,new THREE.BoxGeometry(10,.9,9),mat(o.collar),[0,14.5,8]); }
  }
  if(o.stripes){ for(const side of['Left','Right']){ const fa=B(side+'ForeArm'),hd=B(side+'Hand'); if(!fa||!hd) continue; const a=wp(fa),b=wp(hd),dir=b.clone().sub(a);
      for(let k=0;k<3;k++){ const me=new THREE.Mesh(new THREE.CylinderGeometry(5.4,5.4,.9,14),mat(0xd4ab4f,.4)); me.position.copy(root.worldToLocal(a.clone().add(dir.clone().multiplyScalar(.55+k*.06)))); me.rotation.z=Math.PI/2; me.scale.multiplyScalar(K); root.add(me); fa.attach(me); } } }
}
