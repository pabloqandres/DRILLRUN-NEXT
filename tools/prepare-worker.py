"""Prepare the supplied single-mesh Artlist GLB without changing its surface or UVs."""
from pathlib import Path
import sys,json,struct,io
import numpy as np
from PIL import Image
source,destination=map(Path,sys.argv[1:3]);destination.mkdir(parents=True,exist_ok=True)
b=source.read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);binary=b[28+n:]
for i in range(4):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];dtype={5126:'<f4',5125:'<u4'}[a['componentType']];count=a['count']*{'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
 arr=np.frombuffer(binary,dtype=dtype,count=count,offset=v.get('byteOffset',0)+a.get('byteOffset',0));arr.tofile(destination/f'attribute{i}.bin')
for i,name,size in [(1,'base-color.jpg',2048),(0,'normal-mobile.png',1024),(2,'pbr-mobile.png',1024)]:
 v=j['bufferViews'][j['images'][i]['bufferView']];im=Image.open(io.BytesIO(binary[v['byteOffset']:v['byteOffset']+v['byteLength']])).convert('RGB').resize((size,size),Image.Resampling.LANCZOS)
 im.save(destination/name,**({'quality':94,'subsampling':0} if name.endswith('jpg') else {'optimize':True}))
