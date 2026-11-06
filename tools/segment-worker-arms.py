import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
import sys
r=sys.argv[1].rstrip('/')+'/'
p=np.fromfile(r+'position.bin',dtype='<f4').reshape(-1,3);v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344
idx=np.fromfile(r+'index.bin',dtype='<u4').reshape(-1,3)
unique,inv=np.unique(np.round(v,5),axis=0,return_inverse=True)
tri=inv[idx];tri=tri[np.all(unique[tri,1]<1.12,axis=1)]
a=np.concatenate([tri[:,0],tri[:,1],tri[:,2]]);b=np.concatenate([tri[:,1],tri[:,2],tri[:,0]])
mat=coo_matrix((np.ones(len(a)*2),(np.r_[a,b],np.r_[b,a])),shape=(len(unique),len(unique))).tocsr();n,label=connected_components(mat)
vl=label[inv];mask=np.zeros(len(v),dtype='u1')
for k in np.unique(vl[v[:,1]<1.12]):
 ids=np.flatnonzero(vl==k);mean=v[ids].mean(0)
 if len(ids)>20:print('component',k,len(ids),mean.round(3))
 if abs(mean[0])>.24:mask[ids]=1
mask.tofile(r+'arm-region.bin')
print('arm verts',mask.sum())
