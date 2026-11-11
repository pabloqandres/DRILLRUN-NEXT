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

// V57: One canonical playable area for walking, driving and save restoration.
// The rendered desert is a 240 x 240 m mesh (±120 m). Maintain a 12 m safety
// margin so the player and all vehicle-footprint probes remain on visible land.
export const PLAYABLE_TERRAIN=Object.freeze({
 halfSize:120,edgeMargin:12,bound:108
});
export function isPlayableTerrain(x,z,radius=0){
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(radius))return false;
 const limit=PLAYABLE_TERRAIN.bound-Math.max(0,radius);
 return limit>=0&&Math.abs(x)<=limit&&Math.abs(z)<=limit;
}
