import numpy as np
from scipy.sparse import coo_matrix,diags
import sys,json
from pathlib import Path
r=sys.argv[1].rstrip('/')+'/'
p=np.fromfile(r+'position.bin',dtype='<f4').reshape(-1,3);v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344
ind=np.fromfile(r+'index.bin',dtype='<u4').reshape(-1,3);ji=np.fromfile(r+'initial-joints.bin',dtype='<u2').reshape(-1,4);w=np.fromfile(r+'initial-weights.bin',dtype='<f4').reshape(-1,4)
u,inv=np.unique(np.round(v,5),axis=0,return_inverse=True);dense=np.zeros((len(v),21))
for k in range(4):dense[np.arange(len(v)),ji[:,k]]+=w[:,k]
base=np.zeros((len(u),21));np.add.at(base,inv,dense);base/=np.bincount(inv)[:,None]
t=inv[ind];a=np.r_[t[:,0],t[:,1],t[:,2]];b=np.r_[t[:,1],t[:,2],t[:,0]];m=coo_matrix((np.ones(len(a)*2),(np.r_[a,b],np.r_[b,a])),shape=(len(u),len(u))).tocsr();m.data[:]=1;m=diags(1/np.maximum(1,np.asarray(m.sum(1)).ravel()))@m
# Diffusion removes abrupt influence changes across individual triangles. Protect hard equipment and fingertips.
lock=(u[:,1]<.09)|(u[:,1]>1.56)
arm=np.fromfile(r+'arm-region.bin',dtype='u1');uniarm=np.zeros(len(u));np.maximum.at(uniarm,inv,arm);lock|=(uniarm>0)&(u[:,1]<.84)
profile=json.loads(Path(r+'rig-config.json').read_text()) if Path(r+'rig-config.json').exists() else {}
if profile.get('torsoLockHalfWidth'):lock|=(u[:,1]>.98)&(u[:,1]<1.28)&(abs(u[:,0])<profile['torsoLockHalfWidth'])
welded=base.copy()
for i in range(int(sys.argv[2]) if len(sys.argv)>2 else 65):
 welded=welded*.5+(m@welded)*.5;welded[lock]=base[lock]
values=welded[inv]
if profile.get('crotchAnchor'):
 rise=np.clip((v[:,1]-.60)/.28,0,1);rise=rise*rise*(3-2*rise);centre=np.clip((.13-abs(v[:,0]))/.11,0,1);centre=centre*centre*(3-2*centre);amount=rise*centre*.65;values*=1-amount[:,None];values[:,0]+=amount
if profile.get('torsoHipFade'):
 lo,hi=profile['torsoHipFade'];fade=np.clip((v[:,1]-lo)/(hi-lo),0,1);fade=fade*fade*(3-2*fade);amount=values[:,0]*fade;values[:,0]-=amount;values[:,1]+=amount
top=np.argsort(values,axis=1)[:,-4:];out=np.take_along_axis(values,top,axis=1);out/=out.sum(1)[:,None];top.astype('<u2').tofile(r+'smoothed-joints.bin');out.astype('<f4').tofile(r+'smoothed-weights.bin')
print('Smoothed weights on welded surface',len(u))
