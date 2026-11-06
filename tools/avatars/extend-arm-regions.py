"""Follow source surface topology above the forearms instead of a torso-width threshold."""
import numpy as np,json,sys
from pathlib import Path
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
r=Path(sys.argv[1]);p=np.fromfile(r/'position.bin',dtype='<f4').reshape(-1,3);v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344;ind=np.fromfile(r/'index.bin',dtype='<u4').reshape(-1,3);region=np.fromfile(r/'arm-region.bin',dtype='u1')
u,inv=np.unique(np.round(v,5),axis=0,return_inverse=True);arm=np.zeros(len(u));np.maximum.at(arm,inv,region);t=inv[ind];a=np.r_[t[:,0],t[:,1],t[:,2]];b=np.r_[t[:,1],t[:,2],t[:,0]];weights=np.linalg.norm(u[a]-u[b],axis=1)+1e-6;graph=coo_matrix((np.r_[weights,weights],(np.r_[a,b],np.r_[b,a])),shape=(len(u),len(u))).tocsr();seed=(u[:,1]>.94)&(u[:,1]<1.10)
da=dijkstra(graph,indices=np.flatnonzero(seed&(arm>0)),min_only=True);db=dijkstra(graph,indices=np.flatnonzero(seed&(arm==0)),min_only=True)
arm[(u[:,1]>=1.10)&(u[:,1]<1.49)]=(da<db)[(u[:,1]>=1.10)&(u[:,1]<1.49)];arm[inv].astype('u1').tofile(r/'arm-region.bin')
profile=json.loads((r/'rig-config.json').read_text());profile.pop('torsoLockHalfWidth',None);profile['geodesicArms']=True;(r/'rig-config.json').write_text(json.dumps(profile));print('geodesic arm vertices',int(arm[inv].sum()))
