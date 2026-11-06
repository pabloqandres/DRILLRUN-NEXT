import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readGLB} from '../tools/source-motion.mjs';
import {AVATARS} from '../dist/chapter/avatars.mjs';
test('the original approved avatar file remains byte-for-byte unchanged',()=>{const bytes=fs.readFileSync(new URL('../dist/assets3d/operator-candidate.glb',import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'6a5e43129f7030acf496b06cb5004fcbd3733699c3b9dea8cc1e3046ed10c126');});
test('three new optimized copies carry the same 21-bone topology and Idle/Walk/Turn clips',()=>{for(const avatar of AVATARS.slice(1)){const g=readGLB(new URL('../dist/assets3d/'+avatar.asset,import.meta.url)),j=g.json,p=j.meshes[0].primitives[0];assert.equal(j.skins[0].joints.length,21);assert.deepEqual(j.animations.map(a=>a.name),['Idle','Walk','Turn']);assert.equal(j.extras.avatar,avatar.id);assert.equal(j.extras.height,avatar.height);assert(g.array(p.indices).length/3<=30000);assert(j.extras.stats.originalTriangles>490000);assert(j.extras.stats.normalizedError<.0011);assert.equal(j.images.length,3);assert(j.extras.motionStats.Walk.cycleDistance>1);assert(j.extras.soleProbes.length<400);const indices=g.array(p.attributes.JOINTS_0),weights=g.array(p.attributes.WEIGHTS_0);for(let i=0;i<weights.length;i+=4){assert(Math.abs(weights[i]+weights[i+1]+weights[i+2]+weights[i+3]-1)<1e-5);for(let k=0;k<4;k++)assert(indices[i+k]<21);}}});
test('embedded mobile maps are complete, with valid PNG chunk checksums',()=>{
 const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 const crc=bytes=>{let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
 for(const a of AVATARS.slice(1)){const bytes=fs.readFileSync(new URL('../dist/assets3d/'+a.asset,import.meta.url)),length=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+length)),binary=bytes.subarray(28+length);
 for(const image of doc.images){const v=doc.bufferViews[image.bufferView],raw=binary.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);if(image.mimeType==='image/jpeg'){assert.equal(raw.readUInt16BE(raw.length-2),0xffd9);continue;}
 assert.equal(raw.subarray(0,8).toString('hex'),'89504e470d0a1a0a');let offset=8,end=false;while(offset<raw.length){const n=raw.readUInt32BE(offset),type=raw.subarray(offset+4,offset+8).toString();assert(offset+12+n<=raw.length,a.id+' truncated '+type);assert.equal(crc(raw.subarray(offset+4,offset+8+n)),raw.readUInt32BE(offset+8+n),a.id+' corrupt '+type);offset+=12+n;if(type==='IEND')end=true;}assert(end,a.id+' PNG missing IEND');assert.equal(offset,raw.length);}
 }
});
