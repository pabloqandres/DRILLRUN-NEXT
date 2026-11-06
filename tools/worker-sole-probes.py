"""Extreme points of each rigid boot sole, for exact flat-ground height correction."""
import sys,json,numpy as np
from scipy.spatial import ConvexHull
from pathlib import Path
r=Path(sys.argv[1]);p=np.fromfile(r/'position.bin',dtype='<f4').reshape(-1,3)
v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344
out=[]
for side in [1,-1]:
 ids=np.flatnonzero((v[:,1]<.035)&(v[:,0]*side>0));out.extend(ids[ConvexHull(v[ids]).vertices].tolist())
(r/'sole-probes.json').write_text(json.dumps(out))
