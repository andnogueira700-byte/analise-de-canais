import bpy,math,sys,os
sys.path.insert(0,'/home/user/analise-de-canais/mers-el-kebir/producao')
exec(open('/home/user/analise-de-canais/mers-el-kebir/producao/blender_ships.py').read().split('def build_all')[0])
OUT='/tmp/alex/icons/'
R=math.radians
def cam(loc,look,lens=50,res=(900,520),ortho=None):
    sc=bpy.context.scene; sc.render.resolution_x,sc.render.resolution_y=res
    bpy.ops.object.camera_add(location=loc); c=bpy.context.object; c.data.lens=lens
    if ortho: c.data.type='ORTHO'; c.data.ortho_scale=ortho
    from mathutils import Vector
    d=Vector(look)-Vector(loc); c.rotation_euler=d.to_track_quat('-Z','Y').to_euler(); sc.camera=c; return c
def render(name):
    bpy.context.scene.render.filepath=OUT+name+'.png'; bpy.ops.render.render(write_still=True)
def diver(x,z,m,k,sk):
    # seated operator in rubber suit with breathing set, leaning forward
    cyl((x,0,z+0.45),0.2,0.75,m,(0,R(-20),0),14)            # torso
    sph((x+0.18,0,z+0.95),0.17,m)                              # hooded head
    box((x+0.3,0,z+0.95),(0.08,0.24,0.14),k)                   # mask
    box((x-0.12,0,z+0.5),(0.16,0.32,0.4),k)                    # breathing bag/back
    for y in (-0.2,0.2):
        cyl((x+0.25,y,z+0.1),0.09,0.6,m,(0,R(80),0),10)        # thighs
        cyl((x+0.3,y,z+0.5),0.07,0.5,m,(0,R(60),0),10)         # arms
def slc(parts=False,riders=True):
    gr=mat((0.20,0.24,0.22),0.55,0.3); dk=mat((0.08,0.09,0.09),0.6,0.4); br=mat((0.55,0.42,0.2),0.4,0.8)
    cH=mat((0.85,0.25,0.18),0.5,0.2) if parts else gr      # testa (warhead)
    cB=mat((0.95,0.70,0.15),0.5,0.2) if parts else gr      # batterie/posti
    cM=mat((0.25,0.55,0.85),0.5,0.2) if parts else gr      # motore
    r=0.27
    # warhead (x 2.0..3.65) with rounded nose
    cyl((2.75,0,0),r,1.5,cH,(0,R(90),0),32); sph((3.5,0,0),r,cH,(1.0,1,1))
    box((2.02,0,0),(0.04,0.56,0.56),dk)  # joint ring
    cyl((2.02,0,0),r+0.015,0.05,dk,(0,R(90),0),32)
    # middle (x -1.6..2.0)
    cyl((0.2,0,0),r,3.6,cB,(0,R(90),0),32)
    # aft (x -3.6..-1.6) tapering
    cyl((-2.2,0,0),r,1.2,cM,(0,R(90),0),32); cone((-3.15,0,0),r,0.1,0.7,cM,(0,R(-90),0))
    # propeller guard + prop + rudders
    cyl((-3.55,0,0),0.24,0.12,dk,(0,R(90),0),24)
    for a in range(4): box((-3.55,0,0),(0.03,0.42,0.06),br,(R(45*a),0,0))
    box((-3.3,0,0),(0.35,0.02,0.75),dk); box((-3.3,0,0),(0.35,0.75,0.02),dk)
    # forward screen (paraonde) + instrument panel
    box((1.25,0,0.42),(0.06,0.5,0.32),dk,(0,R(-25),0)); box((1.1,0,0.3),(0.18,0.42,0.16),dk)
    # seat backs / tool locker
    box((0.15,0,0.36),(0.12,0.4,0.28),dk); box((-0.95,0,0.33),(0.5,0.38,0.24),dk)
    # handle/keel rail
    box((0.2,0,-0.29),(3.4,0.05,0.04),dk)
    if riders:
        sk=mat((0.8,0.6,0.5)); m=mat((0.07,0.07,0.08),0.45,0.0); k=mat((0.2,0.22,0.24),0.3,0.6)
        diver(0.75,0.22,m,k,sk); diver(-0.45,0.22,m,k,sk)
def base():
    sc=reset(); return sc
what=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'all'
if what in('all','slc'):
    base(); slc(); cam((3,-12,4),(0,0,0.2),50,(1000,520),8.6); render('slc')
if what in('all','slc_parts'):
    base(); slc(parts=True,riders=False); cam((0.5,-12,3),(0,0,0),50,(1200,420),8.2); render('slc_parts')
if what in('all','slc_side'):
    base(); slc(riders=True); cam((0,-12,0.6),(0,0,0.3),50,(1200,420),8.2); render('slc_side')
if what in('all','scire'):
    base(); m=mat((0.32,0.34,0.36),0.6); d=mat((0.12,0.13,0.14),0.6)
    hull(30,3.2,2.2,m) if False else None
    cyl((0,0,0),1.6,26,m,(0,R(90),0),32); sph((13,0,0),1.6,m,(1.6,1,1)); cone((-15,0,0),1.6,0.3,4,m,(0,R(-90),0))
    box((0,0,1.3),(27,2.0,0.4),m)                          # deck
    box((3,0,2.6),(4,1.4,2.4),m); box((3.3,0,4.0),(1.8,0.9,0.8),d); cyl((3.5,0,5.2),0.06,2.2,d,v=8)
    for x in (9,-4,-10): cyl((x,0,2.3),1.0,5.2,m,(0,R(90),0),28); sph((x+2.6,0,2.3),1.0,d,(0.2,1,1))  # SLC cylinders
    cam((12,-60,18),(0,0,1.5),50,(1000,520),36); render('scire')
if what in('all','tanker'):
    base(); m=mat((0.30,0.30,0.28),0.7); w=mat((0.75,0.72,0.66),0.7); k=mat((0.1,0.1,0.1),0.7)
    box((0,0,1.5),(30,5.5,3),m); sph((15,0,1.5),2.75,m,(1.6,1,0.55)); box((-11,0,4.2),(6,5,2.4),w); box((4,0,3.6),(3,4.6,1.4),w)
    cyl((-12,0,6.4),0.9,2.4,k); 
    for x in range(-6,14,3): cyl((x,0,3.1),0.15,0.3,k,v=8)
    box((0,0,3.05),(26,0.4,0.2),k)
    cam((14,-60,20),(1,0,2),50,(1000,520),40); render('tanker')
if what in('all','net'):
    base(); b=mat((0.85,0.55,0.15),0.5); n=mat((0.15,0.15,0.15),0.6)
    for i in range(9):
        x=(i-4)*3.0; sph((x,0,0.3),0.55,b,(1,1,0.7))
        if i<8:
            for j in range(6): box((x+1.5,0,-0.4-j*0.6),(3.0,0.03,0.03),n)
    for i in range(25): box(((i-12)*1.0,0,-1.8),(0.03,0.03,3.2),n)
    cam((0,-30,7),(0,0,-0.8),50,(1000,520),30); render('net')
