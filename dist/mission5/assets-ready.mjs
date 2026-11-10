// M5 narrative is enabled only when BOTH real user-approved GLB assets
// are deployed. Prevents charging for invisible staff in a live save.
export let m5AssetsReady=false;
export const M5_ASSET_PATHS=[
 new URL('../assets3d/npc-library/npc-m5-gate-security.glb',import.meta.url).href,
 new URL('../assets3d/npc-library/npc-m5-warehouse-tech.glb',import.meta.url).href
];
export async function probeM5Assets(){
 const files=await Promise.all(M5_ASSET_PATHS.map(async url=>{
  try{
   const r=await fetch(url,{method:'HEAD',cache:'no-store'});
   const type=r.headers.get('content-type')||'';
   const len=Number(r.headers.get('content-length')||'0');
   return r.ok&&!type.includes('text/html')&&(len===0||len>150000);
  }catch{return false;}
 }));
 m5AssetsReady=files.every(Boolean);
 if(!m5AssetsReady)console.info('[M5] NPC visual assets not deployed — mission start remains safely gated');
 return m5AssetsReady;
}
