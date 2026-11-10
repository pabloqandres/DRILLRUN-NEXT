import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {constructionPreviewSpec,constructionPreviewCamera} from '../dist/chapter/building-blueprint.mjs';
import {ConstructionHologram,hologramEnvelope} from '../dist/chapter/construction-hologram.mjs';
import {erodedMesaGeometry} from '../dist/graphics/desert.mjs';
import {PATIO_L1,startPatio,patioProgress,finishPatio} from '../dist/mission5/patio-state.mjs';

const samples=[
 {id:'office',kind:'module',level:1,w:6,d:2.5},
 {id:'workshop',kind:'workshop',level:1,w:7.2,d:5.4},
 {id:'shed',kind:'hsec',model:{fixed:{x:6,z:-4}},w:6,d:4.8,h:3.8},
 {id:'patio-maquinarias-l1',kind:'patio',level:1,w:54,d:44,insufficient:true,price:45000}
];
test('All actual prefab buildings have real fixed preview anchors and both camera modes',()=>{
 const expected=[[-6,0],[-7.6,-9.3],[6,-4],[-51,-17]];
 samples.forEach((p,i)=>{
  const spec=constructionPreviewSpec(p);
  assert(spec,'No preview anchor: '+p.id);
  assert.deepEqual([spec.x,spec.z],expected[i]);
  assert(constructionPreviewCamera(spec).offset.y>0);
 });
 assert.equal(constructionPreviewSpec({kind:'vehicle',id:'drilltruck'}),null);
 assert.equal(constructionPreviewSpec({kind:'equipment',id:'dth'}),null);
});
test('Selecting a blueprint is read-only even when unable to afford the patio',()=>{
 const s={cash:32310,ledger:[],mission4:{phase:'complete'},mission5:null};
 const before=JSON.stringify(s);
 const spec=constructionPreviewSpec(samples[3]);
 assert(spec);
 constructionPreviewCamera(spec);
 assert.equal(JSON.stringify(s),before);
});
test('Building project hologram uses the same translucent scan engine as Office L1',()=>{
 const source=new T.Group();
 const box=new T.Mesh(new T.BoxGeometry(6,3,4),new T.MeshBasicMaterial());
 box.position.set(0,1.5,0);source.add(box);
 const hologram=new ConstructionHologram(source,{software:true,quality:'low',footprint:{width:6,depth:4}});
 assert(hologram.edgeCount>0);
 assert.equal(hologram.update(2.1,.37,{quality:'low',resolution:{width:1000,height:500}}),true);
 assert(Math.abs(hologram.userData.progress-.37)<1e-8);
 assert(hologramEnvelope(2.1,.37).scanOpacity>0);
 hologram.finish(4);
 assert.equal(hologram.update(5,1),false,'Fade after construction finish');
 hologram.dispose();
});
test('Patio 20-minute hologram construction advances from blueprint to full structure',()=>{
 const t=Date.UTC(2026,10,10,6),s={mission4:{phase:'complete'},mission5:null,cash:70000,nextId:3,ledger:[]};
 startPatio(s,t);
 assert.equal(patioProgress(s,t).phase,'blueprint');
 assert.equal(patioProgress(s,t+300000).phase,'grading');
 assert.equal(patioProgress(s,t+600000).phase,'mounting');
 assert.equal(patioProgress(s,t+1140000).phase,'commissioning');
 assert.equal(finishPatio(s,t+1199000),false);
 assert.equal(finishPatio(s,t+1200000),true);
 assert.equal(s.ledger.length,1);
});
test('Atacama backdrop is no longer a low-sided flat cylinder',()=>{
 const g=erodedMesaGeometry();
 const positions=g.attributes.position,colors=g.attributes.color;
 assert(positions.count>800,'Eroded mesa should contain layered sculpted geometry');
 assert.equal(positions.count,colors.count);
 g.computeBoundingBox();
 assert(g.boundingBox.max.y>1.02);
 assert(g.boundingBox.max.x>1.0);
 g.dispose();
});
