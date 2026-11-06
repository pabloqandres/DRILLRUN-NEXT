// Mission 3 — Tool & material inventory
// Tracks DRILLCO bits, hammers, consumables and their wear state.

const fail=msg=>{throw new Error(msg);};

// Workshop capacity by level
export const WORKSHOP_LEVELS=[
 {level:1,capacity:8,upgradeCost:0,label:'Básico',constructionSeconds:0},
 {level:2,capacity:14,upgradeCost:8000,label:'Ampliado',constructionSeconds:300},
 {level:3,capacity:22,upgradeCost:6000,label:'Industrial',constructionSeconds:480}
];

export function workshopLevel(s){return s.workshop?.level||1;}
export function workshopCapacity(s){
 const lvl=workshopLevel(s);
 return (WORKSHOP_LEVELS.find(w=>w.level===lvl)||WORKSHOP_LEVELS[0]).capacity;
}
export function workshopUsed(s){
 return (s.toolInventory||[]).filter(t=>t.status!=='spent').length;
}
export function workshopFree(s){return Math.max(0,workshopCapacity(s)-workshopUsed(s));}

export function canUpgradeWorkshop(s){
 const lvl=workshopLevel(s);
 const next=WORKSHOP_LEVELS.find(w=>w.level===lvl+1);
 if(!next)return 'maxLevel';
 if(s.cash<next.upgradeCost)return 'noMoney';
 return null;
}

export function upgradeWorkshop(s,now=Date.now()){
 const blocked=canUpgradeWorkshop(s);
 if(blocked)fail(blocked);
 if(workshopUpgradeJob(s))fail('constructionPending');
 const lvl=workshopLevel(s);
 const next=WORKSHOP_LEVELS.find(w=>w.level===lvl+1);
 s.cash-=next.upgradeCost;
 if(!s.workshop)s.workshop={level:1};
 s.workshop.upgrade={
  targetLevel:next.level,
  started:now,
  ends:now+next.constructionSeconds*1000,
  paid:next.upgradeCost
 };
 s.ledger.push({id:s.nextId++,key:'workshopUpgrade',amount:-next.upgradeCost,at:now});
 return s.workshop;
}

// Check if workshop has a pending construction job
export function workshopUpgradeJob(s){return s.workshop?.upgrade||null;}

// Construction progress 0..1
export function workshopUpgradeProgress(s,now=Date.now()){
 const job=workshopUpgradeJob(s);
 if(!job)return null;
 const total=job.ends-job.started;
 if(total<=0)return 1;
 return Math.min(1,(now-job.started)/total);
}

// Finish the upgrade (called when timer completes)
export function finishWorkshopUpgrade(s){
 const job=workshopUpgradeJob(s);
 if(!job)return null;
 s.workshop.level=job.targetLevel;
 delete s.workshop.upgrade;
 // Parking is included with Nv.2 — auto-build when upgrade completes
 if(job.targetLevel>=2&&s.mission4&&!s.mission4.parkingBuilt){
  s.mission4.parkingBuilt=true;
  s.mission4.parkingPosition={x:-9.2,z:-9.3};
 }
 return s.workshop;
}

// Accelerate workshop construction (boost)
export function accelerateWorkshop(s,seconds=60){
 const job=workshopUpgradeJob(s);
 if(!job)return;
 job.ends=Math.max(job.started,job.ends-seconds*1000);
}

// Demolish workshop (resets to level 1, no refund)
export function canDemolishWorkshop(s){
 if(workshopLevel(s)<=1)return 'alreadyBasic';
 if(workshopUpgradeJob(s))return 'constructionPending';
 // Cannot demolish if tools installed in drill
 const installed=(s.toolInventory||[]).filter(t=>t.status==='installed');
 if(installed.length>0)return 'toolsInstalled';
 return null;
}

export function demolishWorkshop(s,now=Date.now()){
 const blocked=canDemolishWorkshop(s);
 if(blocked)fail(blocked);
 const oldLevel=workshopLevel(s);
 s.workshop.level=1;
 // Remove excess tools if over new capacity
 const cap=workshopCapacity(s);
 const used=workshopUsed(s);
 if(used>cap){
  const excess=used-cap;
  const removable=(s.toolInventory||[]).filter(t=>t.status==='new'||t.status==='worn');
  for(let i=0;i<excess&&i<removable.length;i++){
   removable[i].status='spent';
   removable[i].spentAt=now;
  }
 }
 s.ledger.push({id:s.nextId++,key:'workshopDemolish',amount:0,at:now});
 return s.workshop;
}

export function inventoryByType(s,type){
 return (s.toolInventory||[]).filter(i=>i.type===type);
}

export function inventoryByStatus(s,status){
 return (s.toolInventory||[]).filter(i=>i.status===status);
}

export function availableTools(s,type){
 return (s.toolInventory||[]).filter(i=>i.type===type&&(i.status==='new'||i.status==='worn')&&i.lifeRemaining>0);
}

export function installedTools(s){
 return (s.toolInventory||[]).filter(i=>i.status==='installed');
}

export function totalStock(s,model){
 return (s.toolInventory||[]).filter(i=>i.model===model&&(i.status==='new'||i.status==='worn')).reduce((n,i)=>n+1,0);
}

export function addToInventory(s,item){
 s.toolInventory.push({
  id:'tool-'+(s.nextId++),
  type:item.type,
  model:item.model,
  name:item.name||item.model,
  status:'new',
  lifeTotal:item.lifeTotal||100,
  lifeRemaining:item.lifeTotal||100,
  purchasedAt:Date.now(),
  installedAt:null,
  spentAt:null,
  metersUsed:0,
  boreholeId:null
 });
}

export function removeFromInventory(s,toolId){
 const idx=(s.toolInventory||[]).findIndex(i=>i.id===toolId);
 if(idx===-1)fail('toolNotFound');
 const tool=s.toolInventory[idx];
 if(tool.status==='installed')fail('toolInstalled');
 s.toolInventory.splice(idx,1);
 return tool;
}

// Move spent tool to spentMaterials
export function retireTool(s,toolId,now=Date.now()){
 const tool=(s.toolInventory||[]).find(t=>t.id===toolId);
 if(!tool)fail('toolNotFound');
 tool.status='spent';
 tool.spentAt=now;
 s.spentMaterials.push({
  id:'spent-'+(s.nextId++),
  originalToolId:tool.id,
  model:tool.model,
  type:tool.type,
  metersUsed:tool.metersUsed,
  recoveredAt:now
 });
 return tool;
}

// Summary for UI
export function inventorySummary(s){
 const tools=s.toolInventory||[];
 return {
  hammers:{new:tools.filter(t=>t.type==='hammer'&&t.status==='new').length,
           installed:tools.filter(t=>t.type==='hammer'&&t.status==='installed').length,
           worn:tools.filter(t=>t.type==='hammer'&&t.status==='worn').length,
           spent:tools.filter(t=>t.type==='hammer'&&t.status==='spent').length},
  bits:{new:tools.filter(t=>t.type==='bit'&&t.status==='new').length,
        installed:tools.filter(t=>t.type==='bit'&&t.status==='installed').length,
        worn:tools.filter(t=>t.type==='bit'&&t.status==='worn').length,
        spent:tools.filter(t=>t.type==='bit'&&t.status==='spent').length},
  spentMaterials:(s.spentMaterials||[]).length,
  totalValue:tools.reduce((n,t)=>n+(t.lifeRemaining/t.lifeTotal),0)
 };
}
