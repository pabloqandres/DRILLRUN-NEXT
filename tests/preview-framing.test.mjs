import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {fitPreviewCamera} from '../dist/chapter/preview-framing.mjs';
import {markerClearance} from '../dist/chapter/guidance.mjs';

test('the whole office, including AC and access stairs, fits every thumbnail aspect and orbit',()=>{
 const bounds=new T.Box3(new T.Vector3(-3.7,.08,-1.4),new T.Vector3(3.2,3,2.8));
 for(const aspect of[.65,1,1.6,2.8,4])for(const angle of[-2,-.65,0,1.6,3]){
  const camera=new T.PerspectiveCamera(36);fitPreviewCamera(camera,bounds,aspect,angle);
  for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
   const p=new T.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.9,`${aspect}, ${angle}: cropped corner`);assert(p.z>-1&&p.z<1);
  }
 }
});
test('a raised target glyph clears the mission card instead of covering its text',()=>{
 const rect={left:22,right:226,top:86,bottom:147},p=markerClearance(192,148,844,390,[rect]);
 assert(p.x-22>=rect.right+8||p.y-54>=rect.bottom+8||p.y<=rect.top-8);assert(p.x<844-34);assert(p.y<390-14);
 assert.deepEqual(markerClearance(430,210,844,390,[rect]),{x:430,y:210});
});
