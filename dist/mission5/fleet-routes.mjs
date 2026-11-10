// M5 · Physical, deterministic driving routes for idle drill rigs.
// Both paths CROSS the same east gate at (-24,-14); machines are never
// teleported through fences. Only models already owned by the player move.
import {FLEET_BAYS,FLEET_GATE} from './fleet-base.mjs';

const p=(x,z)=>({x,z});
export function rigRouteToPatio(start,kind){
 const bay=FLEET_BAYS[kind];
 if(!bay||!['rc','dth'].includes(kind))return null;
 return [
  {...start},p(start.x,-14),p(-13.5,-14),{...FLEET_GATE},
  p(-31,-14),p(bay.x,-14),{x:bay.x,z:bay.z}
 ].filter((v,i,a)=>i===0||Math.hypot(v.x-a[i-1].x,v.z-a[i-1].z)>.05);
}
export function rigRouteFromPatio(start,site){
 if(!site)return null;
 return [
  {...start},p(start.x,-14),p(-31,-14),{...FLEET_GATE},
  p(-13.5,-14),p(-4,-14),p(12,-10),p(16,-6),
  p(site.x-4,site.z-4),{x:site.x,z:site.z}
 ].filter((v,i,a)=>i===0||Math.hypot(v.x-a[i-1].x,v.z-a[i-1].z)>.05);
}
export function advanceRigRoute(model,route,dt,speed=4.5){
 if(!model||!route?.length)return false;
 let budget=Math.max(0,Math.min(.1,Number(dt)||0))*speed;
 if(!Number.isInteger(route.index))route.index=1;
 while(route.index<route.length&&budget>=0){
  const next=route[route.index];
  const dx=next.x-model.position.x,dz=next.z-model.position.z;
  const len=Math.hypot(dx,dz);
  if(len<=.0001){route.index++;continue;}
  model.rotation.y=Math.atan2(dx,dz);
  const d=Math.min(len,budget);
  model.position.x+=dx/len*d;model.position.z+=dz/len*d;
  budget-=d;
  if(d>=len-.0001){model.position.x=next.x;model.position.z=next.z;route.index++;}
  else break;
 }
 return route.index>=route.length;
}
