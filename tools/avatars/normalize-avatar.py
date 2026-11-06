"""Canonicalize only coordinate units for the shared, existing Artlist rig pipeline."""
from pathlib import Path
import json,sys,numpy as np
from PIL import Image,ImageDraw
r=Path(sys.argv[1]);p=np.fromfile(r/'attribute0.bin',dtype='<f4').reshape(-1,3).copy();uv=np.fromfile(r/'attribute2.bin',dtype='<f4').reshape(-1,2)
height=float(p[:,2].max()-p[:,2].min());center=float((p[:,0].min()+p[:,0].max())/2);k=1.11373603344/height
p[:,0]=(p[:,0]-center)*k-.008172497;p[:,1]*=k;p[:,2]=(p[:,2]-p[:,2].max())*k;p.tofile(r/'attribute0.bin')
v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344
# Technical front preview from the source surface/UVs; not a new art asset.
base=Image.open(r/'base-color.jpg').convert('RGB');pix=np.array(base);out=Image.new('RGB',(650,1050),'#d0d4d0');d=ImageDraw.Draw(out)
for i in np.argsort(v[:,2])[::2]:
 x,y,z=v[i];u,w=uv[i];color=tuple(int(c) for c in pix[min(base.height-1,max(0,int(w*base.height))),min(base.width-1,max(0,int(u*base.width)))])
 xx=325+x*450;yy=990-y*480;d.ellipse((xx-1,yy-1,xx+1,yy+1),fill=color)
out.save(r/'surface-front.png')
for y in [.12,.5,.84,1.09,1.36,1.5,1.6]:
 q=v[np.abs(v[:,1]-y)<.025];print(r.name,round(y,2),'range',q.min(0).round(3).tolist(),q.max(0).round(3).tolist(),'side mean',q[q[:,0]>0].mean(0).round(3).tolist())
(r/'normalization.json').write_text(json.dumps({'inputHeight':height,'xCenter':center,'canonicalScale':k,'canonicalHeight':1.85}))
