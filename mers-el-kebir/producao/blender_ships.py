import bpy,math,sys,os
from mathutils import Vector
out='/tmp/mers/icons/'
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=24; sc.cycles.use_denoising=False
    sc.render.film_transparent=True; sc.render.resolution_x=sc.render.resolution_y=520; sc.render.image_settings.file_format='PNG'; sc.render.image_settings.color_mode='RGBA'
    sc.view_settings.view_transform='Standard'
    w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; bg=w.node_tree.nodes['Background']; bg.inputs[0].default_value=(0.75,0.78,0.82,1); bg.inputs[1].default_value=0.55
    bpy.ops.object.light_add(type='SUN'); s=bpy.context.object; s.data.energy=2.4; s.data.color=(1,0.93,0.82); s.rotation_euler=(math.radians(48),math.radians(8),math.radians(-35))
    return sc
def mat(col,rough=0.6,metal=0.0,emit=0.0):
    m=bpy.data.materials.new('m'); m.use_nodes=True; b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=tuple(col)+(1,); b.inputs['Roughness'].default_value=rough; b.inputs['Metallic'].default_value=metal
    if emit: b.inputs['Emission Color'].default_value=tuple(col)+(1,); b.inputs['Emission Strength'].default_value=emit
    return m
def box(loc,size,m,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot); o=bpy.context.object; o.scale=(size[0]/2,size[1]/2,size[2]/2); o.data.materials.append(m); return o
def cyl(loc,r,h,m,rot=(0,0,0),v=24):
    bpy.ops.mesh.primitive_cylinder_add(location=loc,radius=r,depth=h,rotation=rot,vertices=v); o=bpy.context.object; o.data.materials.append(m); return o
def sph(loc,r,m,sc=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc,radius=r,segments=24,ring_count=14); o=bpy.context.object; o.scale=sc; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o
def cone(loc,r1,r2,h,m,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(location=loc,radius1=r1,radius2=r2,depth=h,rotation=rot,vertices=24); o=bpy.context.object; o.data.materials.append(m); return o
def tank(c=(0.22,0.31,0.17)):
    m=mat(c,0.7); d=mat([x*0.55 for x in c],0.8); k=mat((0.08,0.08,0.08),0.9)
    box((0,0,1.0),(6.0,3.0,1.1),m); box((2.6,0,1.35),(1.6,2.6,0.8),m,(0,math.radians(-18),0))
    for y in (-1.75,1.75):
        box((0,y,0.75),(6.4,0.8,1.3),k)
        for x in (-2.4,-1.2,0,1.2,2.4): cyl((x,y*1.0,0.75),0.55,0.9,d,(math.radians(90),0,0),16)
    cyl((-0.3,0,1.95),1.35,1.0,m); box((-0.3,0,2.5),(1.1,1.1,0.3),d); cyl((2.9,0,2.05),0.17,3.6,d,(0,math.radians(90),0),12)
    cyl((-1.2,0,2.7),0.35,0.5,d,v=12)
def soldier(body=(0.25,0.32,0.2),helmet=(0.2,0.25,0.16),gun=True):
    s=mat((0.86,0.68,0.55),0.7); b=mat(body,0.8); h=mat(helmet,0.5); k=mat((0.12,0.1,0.08),0.8)
    for y in (-0.22,0.22): cyl((0,y,0.55),0.17,1.1,b,v=12); box((0.12,y,0.08),(0.5,0.3,0.16),k)
    box((0,0,1.5),(0.55,0.85,1.0),b); sph((0,0,2.25),0.3,s); sph((0,0,2.36),0.34,h,(1,1,0.7))
    for y in (-0.55,0.55): cyl((0.05,y,1.5),0.12,0.95,b,(0,math.radians(15),0),10)
    if gun: box((0.6,0.35,1.55),(1.6,0.1,0.14),k,(0,math.radians(-8),0))
def civ(c=(0.45,0.3,0.2),dress=False):
    s=mat((0.86,0.68,0.55),0.7); b=mat(c,0.8); k=mat((0.15,0.12,0.1),0.8)
    if dress: cone((0,0,0.8),0.55,0.28,1.6,b)
    else:
        for y in (-0.22,0.22): cyl((0,y,0.55),0.17,1.1,mat((0.2,0.2,0.24)),v=12)
    box((0,0,1.55),(0.5,0.8,0.95),b); sph((0,0,2.25),0.3,s); sph((-0.05,0,2.33),0.32,k,(1,1,0.6))
    for y in (-0.52,0.52): cyl((0,y,1.5),0.11,0.9,b,v=10)
def car(c=(0.35,0.37,0.3)):
    m=mat(c,0.5); g=mat((0.55,0.7,0.8),0.1); k=mat((0.04,0.04,0.04),0.9)
    box((0,0,1.0),(4.4,1.9,0.9),m); box((-0.3,0,1.75),(2.2,1.7,0.8),m); box((-0.3,0,1.78),(2.25,1.5,0.5),g)
    for x in (-1.4,1.4):
        for y in (-0.95,0.95): cyl((x,y,0.5),0.5,0.4,k,(math.radians(90),0,0),20)
    box((2.25,0,1.1),(0.1,1.5,0.35),mat((0.9,0.9,0.7),0.2,0,2))
def howitzer():
    m=mat((0.27,0.3,0.22),0.6); k=mat((0.06,0.06,0.06),0.9)
    box((0,0,1.1),(1.6,2.6,0.2),m); cyl((0,0,1.4),0.6,0.5,m); cyl((2.0,0,1.95),0.32,5.5,m,(0,math.radians(-14),0)  if False else (0,math.radians(90)-math.radians(14),0),16)
    box((0,0,1.9),(0.4,2.0,1.4),m,(0,0,0))
    for y in (-1.5,1.5): cyl((0,y,0.9),0.9,0.3,k,(math.radians(90),0,0),20)
    box((-2.2,0,0.7),(3,0.25,0.25),m)
def flak():
    m=mat((0.35,0.37,0.38),0.5); d=mat((0.12,0.12,0.12),0.4)
    cyl((0,0,0.5),1.2,1.0,mat((0.4,0.38,0.34),0.9)); box((0,0,1.4),(1.8,2.2,0.8),m)
    for y in (-0.5,0.5): cyl((2.0,y,2.0),0.2,4.4,d,(0,math.radians(90)-math.radians(28),0),12)
    box((0.3,0,2.0),(0.2,2.4,1.5),m)
def building(floors=6,wd=4,c=(0.8,0.74,0.62)):
    m=mat(c,0.9); g=mat((0.12,0.16,0.2),0.2); r=mat((0.45,0.2,0.15),0.8)
    H=floors*1.0; box((0,0,H/2),(wd,wd*0.9,H),m); box((0,0,H+0.2),(wd+0.2,wd*0.9+0.2,0.4),r)
    for i in range(floors):
        for j in range(-int(wd//1.2),int(wd//1.2)+1):
            box((j*0.9,-wd*0.45-0.03,i+0.55),(0.5,0.08,0.55),g); box((wd/2+0.03,j*0.9,i+0.55),(0.08,0.5,0.55),g)
def reichstag():
    m=mat((0.62,0.58,0.5),0.9); g=mat((0.6,0.75,0.85),0.2); k=mat((0.2,0.2,0.2),0.9)
    box((0,0,1.5),(9,4.4,3),m); box((0,-2.4,1.2),(9,0.8,0.3),m)
    for x in (-3.5,-2,-0.5,1,2.5,4): cyl((x-0.25,-2.55,1.4),0.28,2.6,m,v=12)
    box((0,-2.6,3.1),(5,0.5,0.7),m); box((0,0,3.6),(6,3,1.2),m); sph((0,0,4.3),1.8,g,(1,1,0.8))
    for t in (-4.2,4.2): box((t,0,3.5),(1.0,4.2,1.4),m)
def tower():
    m=mat((0.5,0.49,0.46),0.95); mo=mat((1.0,0.35,0.12),0.5,0,0.6); d=mat((0.1,0.1,0.1),0.4)
    box((0,0,3.5),(8,8,7),m)
    for x in (-3,3):
        for y in (-3,3):
            cyl((x,y,7.3),1.0,0.6,m)
            for o in (-0.25,0.25): cyl((x+1.2,y+o,7.9),0.1,2.4,d,(0,math.radians(90)-math.radians(30),0),10)
    for z in (1.5,3.2,4.9): 
        for x in (-2.5,0,2.5): box((x,-4.02,z),(1.0,0.06,0.5),d)
def plane():
    m=mat((0.62,0.65,0.68),0.4,0.5); d=mat((0.12,0.12,0.12),0.5)
    cyl((0,0,1),0.55,6,m,(0,math.radians(90),0),20); cone((3.4,0,1),0.55,0.01,1.2,m,(0,math.radians(90),0)); 
    box((0.2,0,1),(1.6,8,0.15),m); box((-2.7,0,1.1),(0.9,3,0.12),m); box((-2.7,0,1.6),(0.9,0.12,1.1),m)
    for y in (-1.6,1.6): cyl((0.9,y,1),0.28,1.0,d,(0,math.radians(90),0),12)
def vase(c=(0.9,0.68,0.12)):
    m=mat(c,0.25,1.0)
    cyl((0,0,0.1),0.55,0.2,m); sph((0,0,0.95),0.85,m,(1,1,1.0)); cyl((0,0,1.9),0.4,0.7,m); cyl((0,0,2.3),0.62,0.15,m)
    for y in (-0.95,0.95): sph((0,y,1.35),0.28,m,(0.5,0.3,1))
def bed():
    w=mat((0.9,0.9,0.86),0.9); f=mat((0.3,0.3,0.32),0.5)
    box((0,0,0.55),(3.0,1.5,0.18),f); box((0,0,0.75),(2.9,1.4,0.3),w); box((1.1,0,0.95),(0.6,1.0,0.2),mat((1,1,1),0.9))
    for x in (-1.4,1.4):
        for y in (-0.7,0.7): cyl((x,y,0.25),0.06,0.5,f,v=8)

def hull(L,Wd,H,m,bow=0.28):
    box((0,0,H/2),(L*(1-bow),Wd,H),m)
    x0=L*(1-bow)/2; bl=L*bow*1.1; t=Wd*0.12
    vs=[(x0,-Wd/2,0),(x0,Wd/2,0),(x0+bl,t,0),(x0+bl,-t,0),(x0,-Wd/2,H),(x0,Wd/2,H),(x0+bl,t,H),(x0+bl,-t,H)]
    fs=[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
    me=bpy.data.meshes.new('bow'); me.from_pydata(vs,[],fs); me.update(); o=bpy.data.objects.new('bow',me); bpy.context.collection.objects.link(o); o.data.materials.append(m)
def turret(x,z,m,d,twin=True,r=0.9):
    cyl((x,0,z),r,0.5,m,v=20)
    for y in ((-0.28,0.28) if twin else (0,)): cyl((x+1.6,y*r*1.5,z+0.25),0.12,3.2,d,(0,math.radians(90),0),10)
def ship(col,nt=4,L=30,kind='bb',funnels=2,flag=None):
    m=mat(col,0.6); d=mat([c*0.45 for c in col],0.7); k=mat((0.05,0.05,0.05),0.8); w=mat((0.85,0.85,0.8),0.8)
    H=2.4 if kind!='dd' else 1.7; Wd=4.2 if kind in('bb','bc') else (3.0 if kind=='dd' else 4.6)
    hull(L,Wd,H,m)
    # deck
    box((0,0,H+0.05),(L*0.72,Wd*0.8,0.12),mat((0.32,0.26,0.19),0.9))
    xs=[L*0.36,L*0.22,-L*0.22,-L*0.36][:nt]
    for i,x in enumerate(xs): turret(x if i<nt/2 else x, H+0.25, m, d, True, 1.0 if kind!='dd' else 0.65)
    box((L*0.02,0,H+1.3),(L*0.16,Wd*0.45,2.4),m); box((L*0.02,0,H+3.1),(L*0.08,Wd*0.3,1.6),d)
    cyl((L*0.0,0,H+4.4),0.12,2.2,k,v=8)
    for i in range(funnels): cyl((-L*0.10-i*L*0.11,0,H+2.1),0.8,3.2,k if kind!='sub' else m,v=16)
def sub():
    m=mat((0.12,0.14,0.16),0.5,0.2); cyl((0,0,1.4),1.5,26,m,(0,math.radians(90),0),24); box((2,0,2.9),(5,1.4,2.6),m); cyl((2,0,4.6),0.12,2.4,m,v=8)
    sph((13,0,1.4),1.5,m,(1.2,1,1)); sph((-13,0,1.4),1.5,m,(1.4,1,1))
def swordfish():
    m=mat((0.42,0.46,0.5),0.5); d=mat((0.08,0.08,0.08),0.6); r=mat((0.7,0.1,0.08),0.6)
    cyl((0,0,1.6),0.6,5.8,m,(0,math.radians(90),0),16); sph((2.9,0,1.6),0.6,m); cyl((3.4,0,1.6),0.1,0.15,d,(0,math.radians(90),0))
    box((0.4,0,0.9),(1.4,7.0,0.12),m); box((0.4,0,2.5),(1.4,7.0,0.12),m)
    for y in (-2.4,2.4):
        box((0.4,y,1.7),(0.1,0.1,1.6),d)
    box((-2.7,0,1.9),(0.9,2.4,0.1),m); box((-2.7,0,2.4),(0.9,0.1,1.1),m); cyl((3.6,0,1.6),1.3,0.06,d,(0,math.radians(90),0),20)
    cyl((0,0,0.95),0.25,2.4,r,(0,math.radians(90),0),12)
def carrier():
    m=mat((0.2,0.24,0.29),0.6); box((0,0,1.2),(36,5.6,2.4),m); box((0,0,2.5),(35,5.4,0.2),mat((0.18,0.2,0.22),0.8)); box((2,2.2,4.4),(5,1.6,4),m); cyl((2,2.2,6.9),0.7,2.4,mat((0.05,0.05,0.05)),v=16)
    for x in (-10,-3,6,12): box((x,0,2.75),(2.4,1.8,0.12),mat((0.7,0.7,0.65),0.6))
def water_marker():
    pass
def build_all():
    UK=(0.16,0.21,0.29); FR=(0.34,0.40,0.48); FRD=(0.27,0.33,0.40)
    items=[('ship_hood',lambda:ship((0.13,0.17,0.24),4,34,'bc',2)),('ship_uk_bb',lambda:ship(UK,4,28,'bb',2)),('ship_fr_bb',lambda:ship(FR,2,31,'bb',1)),('ship_fr_old',lambda:ship(FRD,4,25,'bb',2)),
      ('ship_dd_uk',lambda:ship(UK,2,16,'dd',2)),('ship_dd_fr',lambda:ship(FR,2,17,'dd',2)),('carrier',carrier),('sub',sub),('swordfish',swordfish),
      ('ship_fr_burn',lambda:ship((0.25,0.24,0.23),2,31,'bb',1)),('ship_uk_old',lambda:ship((0.2,0.24,0.3),4,24,'bb',2))]
    only=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    for name,fn in items:
        if only and name not in only: continue
        sc=reset(); fn()
        objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
        mn=Vector((1e9,)*3); mx=Vector((-1e9,)*3)
        for o in objs:
            for v in o.bound_box:
                w=o.matrix_world@Vector(v); mn=Vector(map(min,mn,w)); mx=Vector(map(max,mx,w))
        ctr=(mn+mx)/2; ext=max((mx-mn).x,(mx-mn).y,(mx-mn).z)
        bpy.ops.object.camera_add(); cam=bpy.context.object; sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=ext*1.15
        az=math.radians(-135); el=math.radians(24)
        cam.location=ctr+Vector((math.cos(az)*math.cos(el),math.sin(az)*math.cos(el),math.sin(el)))*ext*3
        d=ctr-cam.location; cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
        bpy.ops.mesh.primitive_plane_add(size=200,location=(ctr.x,ctr.y,mn.z-0.01)); p=bpy.context.object; p.is_shadow_catcher=True
        sc.render.resolution_x=640; sc.render.resolution_y=360
        sc.render.filepath=out+name+'.png'; bpy.ops.render.render(write_still=True); print('ok',name,flush=True)
build_all()
