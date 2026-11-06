import * as T from '../dist/vendor/three.module.js';
import {sourceMotion,readGLB} from './source-motion.mjs';
import {CandidateRig} from '../dist/assets3d/worker-candidate.mjs';
const file=new URL('../dist/assets3d/operator-candidate.glb',import.meta.url),g=readGLB(file),src=sourceMotion(file),doc=g.json,primitive=doc.meshes[0].primitives[0],geo=new T.BufferGeometry();for(const[name,attr,size]of[['position','POSITION',3],['normal','NORMAL',3],['uv','TEXCOORD_0',2],['skinIndex','JOINTS_0',4],['skinWeight','WEIGHTS_0',4]])geo.setAttribute(name,new T.BufferAttribute(g.array(primitive.attributes[attr]),size));geo.setIndex(new T.BufferAttribute(g.array(primitive.indices),1));const bones=doc.skins[0].joints.map(i=>src.nodes[i]),ib=g.array(doc.skins[0].inverseBindMatrices),skel=new T.Skeleton(bones,Array.from({length:bones.length},(_,i)=>new T.Matrix4().fromArray(ib,i*16))),mesh=new T.SkinnedMesh(geo,new T.MeshBasicMaterial());src.nodes[0].add(mesh);mesh.bind(skel,new T.Matrix4());const root=new T.Group();root.add(src.group);root.updateMatrixWorld(true);const rig=new CandidateRig(root,src.group,[mesh],src.clips,doc.extras),p=geo.attributes.position,soles=[];for(let i=0;i<p.count;i++)if(p.getY(i)<.035)soles.push(i);let min=1,maxGap=-1,maxBoneDelta=0;const v=new T.Vector3();const boneLengths=bones.map(b=>b.position.length());
for(let frame=0;frame<900;frame++){let t=frame/60;if(t>2&&t<5)root.position.z+=1.45/60;if(t>6&&t<7.4)root.rotation.y+=(Math.PI/1.4)/60;if(t>8&&t<11)root.position.z-=.8/60;if(t>12&&t<14)root.rotation.y+=3.7/60;rig.update(1/60,()=>0,t);if(frame%6===0){let lo=Infinity;for(const i of soles){mesh.getVertexPosition(i,v).applyMatrix4(mesh.matrixWorld);if(!Number.isFinite(v.y))throw Error('Nonfinite skin');lo=Math.min(lo,v.y);}min=Math.min(min,lo);maxGap=Math.max(maxGap,lo);bones.forEach((b,i)=>{if(i>0)maxBoneDelta=Math.max(maxBoneDelta,Math.abs(b.position.length()-boneLengths[i]));});}}
let maxSurfaceEdgeExpansion=0,maxSurfaceEdgeRatio=0;
const edgeIndex=geo.index.array;
for(let sample=0;sample<12;sample++){
 root.position.z+=rig.cycleDistance/12;rig.update(1/30,()=>0,sample/30);
 const posed=Array.from({length:p.count},(_,i)=>mesh.getVertexPosition(i,new T.Vector3()));
 for(const v of posed)if(!Number.isFinite(v.lengthSq()))throw Error('Nonfinite animated vertex');
 for(let i=0;i<edgeIndex.length;i+=3)for(let k=0;k<3;k++){
 const a=edgeIndex[i+k],b=edgeIndex[i+(k+1)%3],original=new T.Vector3().fromBufferAttribute(p,a).distanceTo(new T.Vector3().fromBufferAttribute(p,b)),deformed=posed[a].distanceTo(posed[b]);
 maxSurfaceEdgeExpansion=Math.max(maxSurfaceEdgeExpansion,deformed-original);if(original>.002)maxSurfaceEdgeRatio=Math.max(maxSurfaceEdgeRatio,deformed/original);
 }
}
const result={triangles:geo.index.count/3,vertices:p.count,bones:bones.length,clips:src.clips.map(c=>c.name),allSoleVertices:soles.length,runtimeProbes:rig.probes.length,minSoleY:min,maxLowestSoleY:maxGap,maxBoneLengthDelta:maxBoneDelta,maxSurfaceEdgeExpansion,maxSurfaceEdgeRatio,metrics:rig.metrics};console.log(JSON.stringify(result,null,2));
if(min<-.005||maxGap>.005||maxBoneDelta>1e-6||maxSurfaceEdgeExpansion>.03||p.count>35000||geo.index.count/3>32000)throw Error('Character validation failed');
