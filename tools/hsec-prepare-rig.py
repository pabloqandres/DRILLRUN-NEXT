"""Measure limb centres on the canonical surface; keep the approved rig's topology/clip system."""
from pathlib import Path
import numpy as np,json,sys
r=Path(sys.argv[1]);key=r.name;p=np.fromfile(r/'position.bin',dtype='<f4').reshape(-1,3);v=np.column_stack([p[:,0]+.008172497,-p[:,2],p[:,1]])*1.85/1.11373603344;arm=np.fromfile(r/'arm-region.bin',dtype='u1')
base=[['Hips',-1,[0,.95,0]],['Spine',0,[0,1.09,0]],['Chest',1,[0,1.31,0]],['Neck',2,[0,1.48,-.015]],['Head',3,[0,1.56,-.01]],['LeftShoulder',2,[.155,1.39,0]],['LeftArm',5,[.235,1.36,0]],['LeftForeArm',6,[.302,1.09,.015]],['LeftHand',7,[.345,.865,.03]],['RightShoulder',2,[-.155,1.39,0]],['RightArm',9,[-.223,1.36,0]],['RightForeArm',10,[-.292,1.09,.015]],['RightHand',11,[-.331,.865,.03]],['LeftUpLeg',0,[.123,.92,0]],['LeftLeg',13,[.164,.51,.01]],['LeftFoot',14,[.244,.13,.01]],['LeftToe',15,[.254,.045,.16]],['RightUpLeg',0,[-.123,.92,0]],['RightLeg',17,[-.153,.51,.01]],['RightFoot',18,[-.23,.13,.01]],['RightToe',19,[-.242,.045,.16]]]
for side,leg,shoulder in [(1,13,5),(-1,17,9)]:
 for index,height in [(leg,.81),(leg+1,.51),(leg+2,.13),(leg+3,.045)]:
  mask=(v[:,0]*side>.015)&(abs(v[:,1]-height)<.025)&(arm==0);points=v[mask];x,z=np.median(points[:,[0,2]],axis=0)
  if index==leg+3:z=float(np.quantile(points[:,2],.9))
  base[index][2]=[float(x),.92 if index==leg else height,float(z)]
 for index,height in [(shoulder+2,1.09),(shoulder+3,.84)]:
  points=v[(arm==1)&(v[:,0]*side>0)&(abs(v[:,1]-height)<.045)];x,z=np.median(points[:,[0,2]],axis=0);base[index][2]=[float(x),height,float(z)]
 fore=base[shoulder+2][2];base[shoulder+1][2]=[fore[0]*.82,1.40,fore[2]*.4];base[shoulder][2]=[fore[0]*.51,1.40,0]
config={'id':key,'output':'dist/assets3d/'+key+'.glb','report':'validation/'+key+'.json','joints':base,'armEdges':[.245,.275,.31] if key=='02' else [.195,.225,.26],'armMaxY':1.49,'height':1.82}
(r/'rig-config.json').write_text(json.dumps(config,indent=2));print(json.dumps(config))
