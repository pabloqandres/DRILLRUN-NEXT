import fs from 'node:fs';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;
const d=process.argv[2];if(!d)throw Error('Provide a prepared geometry directory ending in /');
const read=(n,Type)=>{const b=fs.readFileSync(d+'attribute'+n+'.bin');return new Type(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const p=read(0,Float32Array),normal=read(1,Float32Array),uv=read(2,Float32Array),idx=read(3,Uint32Array),attr=new Float32Array(p.length/3*5);
for(let i=0;i<p.length/3;i++){attr.set(normal.subarray(i*3,i*3+3),i*5);attr.set(uv.subarray(i*2,i*2+2),i*5+3);}
const [out,error]=MeshoptSimplifier.simplifyWithAttributes(idx,p,3,attr,5,[.04,.04,.04,.7,.7],null,30000*3,.005,['Permissive','RegularizeLight']);
const [remap,count]=MeshoptSimplifier.compactMesh(out);
for(const[name,src,stride]of[['position',p,3],['normal',normal,3],['uv',uv,2]]){const dst=new Float32Array(count*stride);for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff)dst.set(src.subarray(i*stride,i*stride+stride),remap[i]*stride);fs.writeFileSync(d+name+'.bin',new Uint8Array(dst.buffer));}
fs.writeFileSync(d+'index.bin',new Uint8Array(out.buffer));
fs.writeFileSync(d+'simplify.json',JSON.stringify({vertices:count,triangles:out.length/3,normalizedError:error,originalVertices:p.length/3,originalTriangles:idx.length/3},null,2));console.log(fs.readFileSync(d+'simplify.json','utf8'));
