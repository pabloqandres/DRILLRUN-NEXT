// DRILL RUN NEXT GENERATION · shared physical traversal regions.
// Exactly the same limits apply to live movement and restored Cloud Saves.
// The link intentionally begins beside Office L1 and covers the full
// unobstructed walk to M5; no invisible map edge between office and patio.
export const M5_PLOT=Object.freeze({minX:-79,maxX:-22,minZ:-40,maxZ:6});
export const OFFICE_PATIO_LINK=Object.freeze({minX:-34,maxX:-4,minZ:-23,maxZ:14});
const within=(x,z,b)=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ;
export function isM5FreeWalkArea(x,z){
 return Number.isFinite(x)&&Number.isFinite(z)&&
  (within(x,z,M5_PLOT)||within(x,z,OFFICE_PATIO_LINK));
}
export function canWalkM5Area(x,z,unlocked){
 return !!unlocked&&isM5FreeWalkArea(x,z);
}
