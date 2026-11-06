import {insideOffice,circleHitsRect,doorShape,OFFICE} from '../assets3d/office-layout.mjs';
// Occupancy is based on the physical module, including its entrance landing.
// An existing save made after walking in freely is repaired without moving the player.
export function syncOfficeAccess(s){
 const before=!!s.inside;
 if(s.office.status!=='built'||s.office.upgrade)s.inside=false;
 else if(insideOffice(s.position.x+6,s.position.z)){s.inside=true;s.hasEntered=true;}
 else if(s.inside){const x=s.position.x+6,z=s.position.z;if(!(x>-2.63&&x<-1.29&&z>=1.16&&z<2.78))s.inside=false;}
 return before!==s.inside;
}
export function entranceLocked(s,x,z,r){return s.office.status==='built'&&!s.inside&&circleHitsRect(x+6,z,r,doorShape(OFFICE.doors[0],0));}
