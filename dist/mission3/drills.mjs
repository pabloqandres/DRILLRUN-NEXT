// Mission 3 — Drill catalog and selection
// Both drills are RC (Reverse Circulation) — EXPLORA® compatible.

const fail=msg=>{throw new Error(msg);};

export const DRILLS=[
 {id:'rig_rc_compact',nameKey:'rigRcCompact',labelKey:'perforadoraRcCompacta',type:'rc',
  maxDepth:400,bitDiameter:6.5,price:12000,
  compatibleBits:['dome-4','ballistic-4','flatface-4.5'],
  compatibleHammers:['explora-4.0','explora-4.5'],
  advantages:['economical','versatile'],
  limitations:['lowerHardRock']},
 {id:'rig_rc_advanced',nameKey:'rigRcAdvanced',labelKey:'perforadoraRcAltaCapacidad',type:'rc',
  maxDepth:600,bitDiameter:6.5,price:22000,
  compatibleBits:['dome-4','ballistic-4','flatface-4.5','dome-5','conic-5'],
  compatibleHammers:['explora-4.0','explora-4.5','explora-5.0','explora-5.1'],
  advantages:['deeperReach','hardRock','higherCapacity'],
  limitations:['higherCost']}
];

// EXPLORA products catalog
export const HAMMERS=[
 {id:'explora-4.0',nameKey:'explora40',diameter:4,rockRange:'medium-hard',
  lifeTotal:800,price:3500},
 {id:'explora-4.5',nameKey:'explora45',diameter:4.5,rockRange:'hard',
  lifeTotal:1000,price:4200},
 {id:'explora-5.0',nameKey:'explora50',diameter:5,rockRange:'veryHard',
  lifeTotal:1200,price:5000},
 {id:'explora-5.1',nameKey:'explora51',diameter:5,rockRange:'veryHard',
  lifeTotal:1400,price:5800}
];

export const BITS=[
 {id:'dome-4',nameKey:'dome4',type:'dome',diameter:4,
  rockSuit:'hard-abrasive',lifeTotal:120,price:450},
 {id:'ballistic-4',nameKey:'ballistic4',type:'ballistic',diameter:4,
  rockSuit:'medium-lowAbrasion',lifeTotal:100,price:380},
 {id:'flatface-4.5',nameKey:'flatface45',type:'flatface',diameter:4.5,
  rockSuit:'fractured-regular',lifeTotal:110,price:420},
 {id:'dome-5',nameKey:'dome5',type:'dome',diameter:5,
  rockSuit:'veryHard-abrasive',lifeTotal:130,price:550},
 {id:'conic-5',nameKey:'conic5',type:'conic',diameter:5,
  rockSuit:'hard-veryAbrasive',lifeTotal:140,price:600}
];

export function drillDefinition(id){return DRILLS.find(d=>d.id===id);}
export function hammerDefinition(id){return HAMMERS.find(h=>h.id===id);}
export function bitDefinition(id){return BITS.find(b=>b.id===id);}

export function compatibleHammers(drillId){
 const drill=drillDefinition(drillId);
 return drill?HAMMERS.filter(h=>drill.compatibleHammers.includes(h.id)):[];
}

export function compatibleBits(drillId){
 const drill=drillDefinition(drillId);
 return drill?BITS.filter(b=>drill.compatibleBits.includes(b.id)):[];
}

export function canPurchaseDrill(s,drillId){
 if(s.drill)return 'drillOwned';
 const drill=drillDefinition(drillId);
 if(!drill)return 'invalidDrill';
 if(s.cash<drill.price)return 'noMoney';
 if(!(s.personnel||[]).some(p=>p.role==='admin'))return 'needsAdmin';
 return null;
}

export function purchaseDrill(s,drillId,paid=false,now=Date.now()){
 if(!paid){
  const blocked=canPurchaseDrill(s,drillId);
  if(blocked)fail(blocked);
 }
 const drill=drillDefinition(drillId);
 if(!paid){
  s.cash-=drill.price;
  if(s.contract)s.contract.expenses=(s.contract.expenses||0)+drill.price;
  s.ledger.push({id:s.nextId++,key:'drillPurchase-'+drillId,amount:-drill.price,at:now});
 }
 if(s.drill)return s.drill; // already owned (edge case)
 s.drill={
  id:drillId,
  purchasedAt:now,
  position:{x:20,z:4},
  state:'idle',
  assignedOperator:null,
  currentBorehole:null,
  installedHammer:null,
  installedBit:null
 };
 return s.drill;
}

export function currentDrill(s){return s.drill?drillDefinition(s.drill.id):null;}

export function installTool(s,toolId){
 if(!s.drill)fail('noDrill');
 const tool=(s.toolInventory||[]).find(t=>t.id===toolId);
 if(!tool)fail('toolNotFound');
 if(tool.status!=='new'&&tool.status!=='worn')fail('toolNotAvailable');
 const drill=drillDefinition(s.drill.id);
 if(tool.type==='hammer'){
  if(!drill.compatibleHammers.includes(tool.model))fail('incompatible');
  // Uninstall current hammer first
  if(s.drill.installedHammer){
   const old=(s.toolInventory||[]).find(t=>t.id===s.drill.installedHammer);
   if(old){old.status=old.lifeRemaining>0?'worn':'spent';old.installedAt=null;}
  }
  s.drill.installedHammer=toolId;
 }else if(tool.type==='bit'){
  if(!drill.compatibleBits.includes(tool.model))fail('incompatible');
  if(s.drill.installedBit){
   const old=(s.toolInventory||[]).find(t=>t.id===s.drill.installedBit);
   if(old){old.status=old.lifeRemaining>0?'worn':'spent';old.installedAt=null;}
  }
  s.drill.installedBit=toolId;
 }else fail('invalidToolType');
 tool.status='installed';
 tool.installedAt=Date.now();
 return tool;
}
