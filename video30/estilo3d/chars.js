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
  // acessórios presos ao osso da cabeça / peito
  const head = root.getObjectByName('mixamorigHead')||root.getObjectByName('mixamorig:Head'), chest = root.getObjectByName('mixamorigSpine2')||root.getObjectByName('mixamorig:Spine2');
  const mat=(c,r=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
  if(head){ const S=100; // osso em unidades do FBX (cm)
    const add=(geo,m,pos,rot)=>{const me=new THREE.Mesh(geo,m);me.position.set(...pos);if(rot)me.rotation.set(...rot);head.add(me);return me;};
    if(o.hood){ add(new THREE.SphereGeometry(12.6,16,12),mat(0x111213),[0,10,1]); add(new THREE.SphereGeometry(6.4,12,10),mat(o.skin),[0,9.5,9.6]).scale.set(1,1.15,.5); }
    if(o.goggles){ for(const sx of[-3.6,3.6]) add(new THREE.CylinderGeometry(2.7,2.7,1.6,12),mat(0x0a0a0a,.3),[sx,11,13.2],[Math.PI/2,0,0]); add(new THREE.BoxGeometry(14,1.3,1),mat(0x0a0a0a),[0,11,12.6]); }
    if(o.cap==='white'||o.cap==='uk'){ add(new THREE.CylinderGeometry(11.5,12.6,5,16),mat(o.cap==='white'?0xf0eee6:0x14181f),[0,19,1]); add(new THREE.CylinderGeometry(12.2,12.2,1.2,16),mat(o.cap==='white'?0x1d2b4a:0xefefef),[0,16.6,1]); }
    if(o.cap==='peaked'||o.cap==='peakedwhite'){ const cc=o.cap==='peaked'?0x131a2a:0xf0eee6; add(new THREE.CylinderGeometry(12,12.8,6.5,16),mat(cc),[0,19.5,1]); add(new THREE.CylinderGeometry(12.2,12.2,1.6,16),mat(0x0b0b0c),[0,16.6,1]); add(new THREE.BoxGeometry(14,.8,8),mat(0x0b0b0c),[0,17,10]); add(new THREE.SphereGeometry(1.6,8,6),mat(0xd4ab4f),[0,18,12.2]); }
  }
  if(chest){ const add=(geo,m,pos,rot)=>{const me=new THREE.Mesh(geo,m);me.position.set(...pos);if(rot)me.rotation.set(...rot);chest.add(me);return me;};
    if(o.rebreather){ add(new THREE.BoxGeometry(24,16,9),mat(0x2b2f2a),[0,8,13]).scale.set(1,1,1); add(new THREE.CylinderGeometry(2,2,26,8),mat(0x444a44),[0,12,-14],[0,0,0]); }
    if(o.collar){ add(new THREE.BoxGeometry(26,1.2,18),mat(o.collar),[0,16,3]); }
    if(o.stripes){ for(const s of[-1,1]) for(let k=0;k<3;k++) add(new THREE.BoxGeometry(.9,.8,9.5),mat(0xd4ab4f),[s*34,-16-k*2,0]); }
  }
}
