// DRILL RUN NEXT GENERATION · Night driving illumination for personal truck 02.
// This visual component attaches only to the second, player-controlled model.
// No shadow maps, no external assets or edits to M4 automated maintenance truck.
import * as T from '../vendor/three.module.js';

export function installPersonalTruckHeadlights(root){
 const lights=new T.Group();
 lights.name='DRILLTRUCK personal 02 · headlights';
 root.add(lights);
 const sources=[];
 for(const side of [-1,1]){
  const x=side*.73;
  const lamp=new T.SpotLight(0xfff2d4,0,35,Math.PI/7,.65,1.3);
  lamp.position.set(x,1.10,2.18);
  lamp.target.position.set(x*1.7,-.35,17);
  lamp.castShadow=false;
  lamp.name='Faro delantero '+(side<0?'izquierdo':'derecho');
  lights.add(lamp,lamp.target);
  sources.push(lamp);
  const lens=new T.Mesh(new T.BoxGeometry(.35,.17,.055),
   new T.MeshBasicMaterial({color:0x554f42}));
  lens.name='Faro DRILLTRUCK sin marca externa';
  lens.position.set(x,1.10,2.27);
  lights.add(lens);
  sources.push(lens);
 }
 const frontFill=new T.PointLight(0xffeac7,0,9,2);
 frontFill.position.set(0,1.02,2.35);
 frontFill.castShadow=false;lights.add(frontFill);
 return {
  set(enabled,quality='balanced'){
   const on=!!enabled;
   for(const item of sources){
    if(item.isSpotLight)item.intensity=on?(quality==='low'?17:27):0;
    else item.material.color.setHex(on?0xfff4d9:0x554f42);
   }
   frontFill.intensity=on?3:0;
  },
  dispose(){
   lights.removeFromParent();
   lights.traverse(o=>{o.geometry?.dispose?.();if(o.isMesh)o.material?.dispose?.();});
  }
 };
}
