import * as T from '../vendor/three.module.js';
import {CONFIG} from './config.mjs';
import {batchModel} from './furniture.mjs';
// Selection-screen set only. Hidden during gameplay; it never registers a collider or property.
export class CharacterStage{
 constructor(world){
  this.world=world;this.group=new T.Group();this.group.position.set(CONFIG.spawn.x,0,CONFIG.spawn.z);world.scene.add(this.group);
  const set=new T.Group(),machine=new T.Group();machine.position.set(4.2,0,-6.5);machine.rotation.y=-.45;set.add(machine);
  const box=(w,h,d,x,y,z,c)=>world.box(machine,w,h,d,x,y,z,c),beam=(a,b,r,c)=>world.beam(machine,a,b,r,c);
  for(const x of[-.7,.7]){box(.4,.42,2.2,x,.25,0,0x35444a);for(let z=-.85;z<=.9;z+=.27)box(.43,.05,.12,x,.47,z,0x6b7370);}
  box(1.65,.3,2,0,.58,0,0x6d6456);box(1.35,.83,1.3,0,1.1,.3,0xae743e);box(.8,.7,.9,-.25,1.56,.3,0x55747a);box(.9,.08,1,-.25,1.98,.3,0x9b6b40);
  for(const x of[.35,.9])box(.12,4.4,.2,x,2.7,-.8,0xa97747);
  for(let y=.65;y<5;y+=.38)beam([.35,y,-.8],[.9,y,-.8],.018,0x4e5d61);
  beam([.61,.5,-.56],[.61,4.8,-.56],.055,0x586a6d);box(.8,.17,.5,.63,4.95,-.8,0xb88952);beam([-.6,.7,.5],[.9,2,-.8],.05,0x4e5b5f);
  for(const x of[-3.1,-1.3]){world.cyl(set,.035,2.1,x,1.05,-4,0x596968);world.box(set,.7,.13,.17,x,2.1,-4,0x505c5f);}
  const batched=batchModel(set);this.group.add(batched);
  const ring=new T.Mesh(new T.RingGeometry(.52,.56,64),new T.MeshBasicMaterial({color:0xe5c28a,transparent:true,opacity:.7,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;this.group.add(ring);this.selectionRing=ring;
  // V68: warm key + cool rim on the actual playable model, never new artwork.
  const key=new T.PointLight(0xffdfad,4.4,6.5,1.6);key.position.set(-1.9,2.5,2.0);this.group.add(key);
  const rim=new T.PointLight(0x53caf4,3.2,5.5,1.7);rim.position.set(1.55,2.1,-.9);this.group.add(rim);
  this.dust=new T.Group();this.dust.userData.isWorker=true;this.group.add(this.dust);for(let i=0;i<8;i++){const p=new T.Mesh(new T.IcosahedronGeometry(.28,1),new T.MeshBasicMaterial({color:0xd5c5a1,transparent:true,opacity:.09,depthWrite:false}));p.position.set(i*.65-2.2,.3+(i%3)*.16,-2-i*.4);p.scale.set(1.7,.55,1.2);this.dust.add(p);}this.group.visible=false;
 }
 update(visible,time,avatar='operator01'){if(this.group.visible!==visible){this.group.visible=visible;this.world.renderer.staticFrame=null;}if(!visible)return;const index=Number(avatar.slice(-2))-1;this.selectionRing.position.x=0;this.selectionRing.position.z=.48;if(this.lastAvatar!==avatar){this.lastAvatar=avatar;this.world.renderer.staticFrame=null;}this.dust.children.forEach((p,i)=>{p.position.x=((time*.11+i*.8)%7)-3.5;p.position.y=.35+Math.sin(time*.4+i)*.13;});}
}
