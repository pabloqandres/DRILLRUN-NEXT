// V103 — Pure, testable Workshop world access. Both doorways belong to ONE
// existing workshop. No colliders, purchases, save fields or progression added.
// Coordinates are grounded in dist/scene.mjs makeWorkshop/updateWorkshop L2.
export const WORKSHOP_DOORS=Object.freeze({
 base:Object.freeze({x:-6.8,z:-5.4}),
 extension:Object.freeze({x:-2.45,z:-6.05})
});
export const WORKSHOP_L2_FOOTPRINT=Object.freeze({minX:-4.35,maxX:-.25,minZ:-12.3,maxZ:-6.0});

const distance=(a,b)=>Math.hypot(Number(a.x)-b.x,Number(a.z)-b.z);
export function workshopReady(s){
 return !!s?.workshop&&s.workshop.status!=='building';
}
export function workshopHasExtension(s){
 return workshopReady(s)&&Number(s.workshop.level)>=2;
}
export function nearWorkshopDoor(s,pos,radius=2.7){
 if(!workshopReady(s)||!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z))return null;
 if(workshopHasExtension(s)&&distance(pos,WORKSHOP_DOORS.extension)<radius)return 'extension';
 if(distance(pos,WORKSHOP_DOORS.base)<radius)return 'base';
 return null;
}
export function workshopTapZone(s,ground,player,{extensionMeshHit=false}={}){
 if(!workshopReady(s)||!player)return null;
 if(workshopHasExtension(s)){
  const r=WORKSHOP_L2_FOOTPRINT;
  const extGround=ground&&ground.x>=r.minX&&ground.x<=r.maxX&&
   ground.z>=r.minZ&&ground.z<=r.maxZ;
  const nearExtension=distance(player,WORKSHOP_DOORS.extension)<10;
  // Check the new actual bay FIRST: the old 6m circular click radius
  // overlaps its footprint and used to claim taps on the new door.
  if(nearExtension&&(extGround||extensionMeshHit))return 'extension';
 }
 const baseCenter={x:-7.6,z:-9.3};
 const baseHit=ground&&ground.x<=-3.75&&distance(ground,baseCenter)<6;
 const closeBase=distance(player,baseCenter)<9;
 if(baseHit&&closeBase)return 'base';
 return null;
}
