// Mission 4 — DTH (Down The Hole) drill catalog
// Production drills — larger, used after sondaje to extract from explored zones.
// Pipeline: RC (sondaje/exploration) → DTH (production/extraction)

const fail=msg=>{throw new Error(msg);};

export const DTH_DRILLS=[
 {id:'rig_dth_production',nameKey:'rigDthProduction',labelKey:'Perforadora DTH Producción',type:'dth',
  maxDepth:800,bitDiameter:8,price:28000,
  compatibleBits:['dth-button-6','dth-button-8','dth-tricon-8'],
  compatibleHammers:['puma-dth-6','puma-dth-8'],
  advantages:['highProduction','deepReach','automated'],
  limitations:['requiresExploredZone','highCost']}
];

// PUMA DTH hammers — down-the-hole hammers for production
export const DTH_HAMMERS=[
 {id:'puma-dth-6',nameKey:'pumaDth6',diameter:6,rockRange:'hard',
  lifeTotal:2000,price:6500,label:'PUMA DTH 6"'},
 {id:'puma-dth-8',nameKey:'pumaDth8',diameter:8,rockRange:'veryHard',
  lifeTotal:2800,price:9000,label:'PUMA DTH 8"'}
];

// DTH bits — button and tricone types for production drilling
export const DTH_BITS=[
 {id:'dth-button-6',nameKey:'dthButton6',type:'button',diameter:6,
  rockSuit:'hard-abrasive',lifeTotal:300,price:800,label:'Bit Botones DTH 6"'},
 {id:'dth-button-8',nameKey:'dthButton8',type:'button',diameter:8,
  rockSuit:'hard-veryAbrasive',lifeTotal:350,price:1100,label:'Bit Botones DTH 8"'},
 {id:'dth-tricon-8',nameKey:'dthTricon8',type:'tricone',diameter:8,
  rockSuit:'veryHard-abrasive',lifeTotal:400,price:1400,label:'Tricónico DTH 8"'}
];

export function dthDrillDefinition(id){return DTH_DRILLS.find(d=>d.id===id);}
export function dthHammerDefinition(id){return DTH_HAMMERS.find(h=>h.id===id);}
export function dthBitDefinition(id){return DTH_BITS.find(b=>b.id===id);}

export function compatibleDthHammers(drillId){
 const drill=dthDrillDefinition(drillId);
 return drill?DTH_HAMMERS.filter(h=>drill.compatibleHammers.includes(h.id)):[];
}

export function compatibleDthBits(drillId){
 const drill=dthDrillDefinition(drillId);
 return drill?DTH_BITS.filter(b=>drill.compatibleBits.includes(b.id)):[];
}

export function canPurchaseDthDrill(s,drillId){
 if(s.mission4?.productionDrill)return 'dthDrillOwned';
 const drill=dthDrillDefinition(drillId);
 if(!drill)return 'invalidDrill';
 if(s.cash<drill.price)return 'noMoney';
 // Requires workshop Nv.2 and completed boreholes
 if((s.workshop?.level||1)<2)return 'needsWorkshopNv2';
 if(!(s.boreholes||[]).some(b=>b.status==='completed'))return 'needsCompletedBoreholes';
 return null;
}

export function purchaseDthDrill(s,drillId,paid=false,now=Date.now()){
 if(!paid){
  const blocked=canPurchaseDthDrill(s,drillId);
  if(blocked)fail(blocked);
  const drill=dthDrillDefinition(drillId);
  s.cash-=drill.price;
  s.ledger.push({id:s.nextId++,key:'dthDrillPurchase',amount:-drill.price,at:now});
 }
 if(s.mission4?.productionDrill)return s.mission4.productionDrill;
 s.mission4.productionDrill={
  id:drillId,
  purchasedAt:now,
  position:null,
  state:'idle',
  assignedZone:null,
  installedHammer:null,
  installedBit:null
 };
 return s.mission4.productionDrill;
}

export function canInstallDthTool(s,toolId){
 if(!s.mission4?.productionDrill)return 'noDthDrill';
 const tool=(s.toolInventory||[]).find(t=>t.id===toolId);
 if(!tool)return 'toolNotFound';
 if(tool.status!=='new'&&tool.status!=='worn')return 'toolNotAvailable';
 const drill=dthDrillDefinition(s.mission4.productionDrill.id);
 if(tool.type==='hammer'&&!drill.compatibleHammers.includes(tool.model))return 'incompatible';
 if(tool.type==='bit'&&!drill.compatibleBits.includes(tool.model))return 'incompatible';
 return null;
}

export function installDthTool(s,toolId){
 const blocked=canInstallDthTool(s,toolId);
 if(blocked)fail(blocked);
 const tool=(s.toolInventory||[]).find(t=>t.id===toolId);
 const drill=s.mission4.productionDrill;
 if(tool.type==='hammer'){
  if(drill.installedHammer){
   const old=(s.toolInventory||[]).find(t=>t.id===drill.installedHammer);
   if(old){old.status=old.lifeRemaining>0?'worn':'spent';old.installedAt=null;}
  }
  drill.installedHammer=toolId;
 }else if(tool.type==='bit'){
  if(drill.installedBit){
   const old=(s.toolInventory||[]).find(t=>t.id===drill.installedBit);
   if(old){old.status=old.lifeRemaining>0?'worn':'spent';old.installedAt=null;}
  }
  drill.installedBit=toolId;
 }else fail('invalidToolType');
 tool.status='installed';
 tool.installedAt=Date.now();
 return tool;
}

export function assignDthDrillToZone(s,zoneId,now=Date.now()){
 if(!s.mission4?.productionDrill)fail('noDthDrill');
 const drill=s.mission4.productionDrill;
 if(!drill.installedHammer||!drill.installedBit)fail('needsDthTools');
 const zone=s.mission4.zones.find(z=>z.id===zoneId);
 if(!zone)fail('zoneNotFound');
 drill.assignedZone=zoneId;
 drill.position={x:zone.position.x,z:zone.position.z};
 drill.state='producing';
 return drill;
}

export function dthDrillEquipped(s){
 const d=s.mission4?.productionDrill;
 return !!(d&&d.installedHammer&&d.installedBit);
}

export function dthDrillAssigned(s){
 const d=s.mission4?.productionDrill;
 return !!(d&&d.assignedZone);
}
