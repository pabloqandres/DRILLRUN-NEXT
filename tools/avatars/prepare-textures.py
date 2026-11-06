"""Extract original GLB maps and create validated mobile copies, atomically."""
from pathlib import Path
from PIL import Image
import struct,json,io,os,sys
source,dest=map(Path,sys.argv[1:3]);b=source.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];m=d['materials'][0];dest.mkdir(parents=True,exist_ok=True)
for name,texture,limit,fmt in [('base-color.jpg',m['pbrMetallicRoughness']['baseColorTexture'],2048,'JPEG'),('normal-mobile.png',m['normalTexture'],1024,'PNG'),('pbr-mobile.png',m['pbrMetallicRoughness']['metallicRoughnessTexture'],1024,'PNG')]:
 image=d['images'][d['textures'][texture['index']]['source']];v=d['bufferViews'][image['bufferView']];raw=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']];im=Image.open(io.BytesIO(raw)).convert('RGB');im.thumbnail((limit,limit),Image.Resampling.LANCZOS);p=dest/name;tmp=dest/(name+'.partial');im.save(tmp,format=fmt,**({'quality':92} if fmt=='JPEG' else {}));Image.open(tmp).verify();os.replace(tmp,p)
