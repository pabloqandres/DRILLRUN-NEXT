// Mission 3 — Contract system ("Tu Primer Contrato")
// Manages the exploration contract lifecycle.

const fail=msg=>{throw new Error(msg);};
// Fractional metres (3000/3600 per second) produce 89.99999999999997.
// Treat only sub-millimetre floating-point discrepancies as exact completion.
const METRE_EPSILON=1e-6;
export function drilledMetres(s){
 return (s.boreholes||[]).reduce((sum,b)=>sum+Math.min(b.depthTarget||0,Math.max(0,b.depthDrilled||0)),0);
}
export function drillingComplete(s){
 const c=s.contract;
 if(!c||!Number.isFinite(c.totalMeters)||c.totalMeters<=0)return false;
 const holes=s.boreholes||[];
 if(!holes.length||!holes.every(b=>b.status==='completed'&&(b.depthDrilled||0)+METRE_EPSILON>=(b.depthTarget||0)))return false;
 return drilledMetres(s)+METRE_EPSILON>=c.totalMeters;
}
export function drillingCompletedAt(s){
 if(!drillingComplete(s))return null;
 const times=(s.boreholes||[]).map(b=>b.completedAt).filter(v=>Number.isFinite(v)&&v>0);
 return s.contract.drillingCompletedAt|| (times.length?Math.max(...times):null);
}


// Borehole site positions in the expanded east zone
export const BOREHOLE_SITES=[
 {id:'BH-01',x:20,z:4,depthTarget:30},
 {id:'BH-02',x:23,z:1,depthTarget:30},
 {id:'BH-03',x:26,z:-2,depthTarget:30},
 {id:'BH-04',x:23,z:-5,depthTarget:30},
 {id:'BH-05',x:20,z:-8,depthTarget:30},
 {id:'BH-06',x:26,z:-8,depthTarget:30}
];

export const CONTRACT_TEMPLATES=[
 {id:'first-contract',nameKey:'firstContract',descriptionKey:'firstContractDesc',
  type:'exploration',totalMeters:90,boreholeCount:3,
  duration:180, // 3 minutes for the introductory exploration contract
  reward:60000,bonusUnderBudget:8000,bonusSpeed:5000,
  requirements:['admin','geoAnalysis','drill']}
];

export function contractTemplate(id){return CONTRACT_TEMPLATES.find(c=>c.id===id);}

export function canAcceptContract(s,contractId){
 const tpl=contractTemplate(contractId);
 if(!tpl)return 'invalidContract';
 if(s.contract)return 'contractActive';
 if(!s.geoAnalysis?.completed)return 'needsGeoAnalysis';
 if(!(s.personnel||[]).some(p=>p.role==='admin'))return 'needsAdmin';
 if(!s.drill)return 'needsDrill';
 return null;
}

export function acceptContract(s,contractId,now=Date.now()){
 const blocked=canAcceptContract(s,contractId);
 if(blocked)fail(blocked);
 const tpl=contractTemplate(contractId);
 // Create boreholes
 s.boreholes=BOREHOLE_SITES.slice(0,tpl.boreholeCount).map(site=>({
  id:site.id,
  position:{x:site.x,z:site.z},
  depthTarget:site.depthTarget,
  depthDrilled:0,
  status:'pending',
  startedAt:null,
  completedAt:null,
  geology:null, // filled from geoAnalysis per site
  toolsUsed:[]
 }));
 s.contract={
  id:contractId+'-'+now,
  templateId:contractId,
  type:tpl.type,
  status:'accepted',
  acceptedAt:now,
  drillingStartedAt:null, // timer starts when drilling begins, not acceptance
  duration:tpl.duration,
  totalMeters:tpl.totalMeters,
  metersCompleted:0,
  reward:tpl.reward,
  bonusUnderBudget:tpl.bonusUnderBudget,
  bonusSpeed:tpl.bonusSpeed,
  activeBoreholeIndex:0,
  deliveredAt:null,
  paidAt:null,
  expenses:0
 };
 // Apply negotiator bonus (operator01)
 const bonus=s.bonuses?.contractIncome||0;
 if(bonus>0)s.contract.reward=Math.round(s.contract.reward*(1+bonus));
 s.ledger.push({id:s.nextId++,key:'contractAccepted',amount:0,at:now});
 return s.contract;
}

export function contractProgress(s){
 if(!s.contract)return null;
 return {
  accepted:true,
  status:s.contract.status,
  metersCompleted:drillingComplete(s)?s.contract.totalMeters:s.contract.metersCompleted,
  totalMeters:s.contract.totalMeters,
  progress:s.contract.totalMeters>0?Math.min(1,(drillingComplete(s)?s.contract.totalMeters:s.contract.metersCompleted)/s.contract.totalMeters):0,
  boreholesDone:(s.boreholes||[]).filter(b=>b.status==='completed').length,
  totalBoreholes:(s.boreholes||[]).length,
  activeBoreholeIndex:s.contract.activeBoreholeIndex,
  timeElapsed:s.contract.drillingStartedAt?Date.now()-s.contract.drillingStartedAt:0,
  duration:s.contract.duration*1000
 };
}

export function startDrilling(s,now=Date.now()){
 if(!s.contract||s.contract.status!=='accepted')fail('noContract');
 if(!(s.personnel||[]).some(p=>p.role==='driller'))fail('needsDriller');
 if(!s.drill)fail('needsDrill');
 // Check drill has bit + hammer installed
 if(!s.drill.installedBit||!s.drill.installedHammer)fail('needsTools');
 s.contract.status='active';
 s.contract.drillingStartedAt=now;
 // Activate first borehole
 const bh=s.boreholes[s.contract.activeBoreholeIndex];
 if(bh){bh.status='active';bh.startedAt=now;}
 // Position drill at first borehole
 if(bh)s.drill.position={x:bh.position.x,z:bh.position.z};
 s.drill.state='drilling';
 s.drill.currentBorehole=bh?.id||null;
 return s.contract;
}

export function advanceMeters(s,meters,now=Date.now()){
 if(!s.contract||s.contract.status!=='active')return 0;
 const bhi=s.contract.activeBoreholeIndex;
 const bh=s.boreholes[bhi];
 if(!bh||bh.status==='completed')return 0;
 const remaining=bh.depthTarget-bh.depthDrilled;
 const actual=Math.min(meters,remaining);
 bh.depthDrilled+=actual;
 s.contract.metersCompleted+=actual;
 // Check borehole completion
 if(bh.depthDrilled>=bh.depthTarget){
  bh.status='completed';
  bh.completedAt=now;
  // Move to next borehole
  const nextIdx=bhi+1;
  if(nextIdx<s.boreholes.length){
   s.contract.activeBoreholeIndex=nextIdx;
   const next=s.boreholes[nextIdx];
   next.status='active';
   next.startedAt=now;
   s.drill.currentBorehole=next.id;
   s.drill.position={x:next.position.x,z:next.position.z};
   s.drill.state='moving';
  }else{
   s.drill.state='idle';
   s.drill.currentBorehole=null;
   // Snap the accumulated metres to the contractual total when the actual
   // borehole depths prove completion. This is NOT additional drilling.
   if(drillingComplete(s)){
    s.contract.metersCompleted=s.contract.totalMeters;
    s.contract.drillingCompletedAt=now;
   }
  }
 }
 return actual;
}

export function isContractComplete(s){
 if(!s.contract)return false;
 // Existing saves may already contain all 3 completed holes but a fractional
 // total slightly below 90. Recognize them without rewriting save history.
 return s.contract.metersCompleted>=s.contract.totalMeters||drillingComplete(s);
}

export function completeContract(s,now=Date.now()){
 if(!s.contract||!isContractComplete(s))fail('notComplete');
 if(s.contract.status==='completed'||s.contract.status==='delivered')fail('alreadyComplete');
 s.contract.status='completed';
 s.contract.deliveredAt=now;
 // Calculate reward
 let reward=s.contract.reward;
 // Speed bonus: completed within duration
 // Award the time bonus when the final hole was drilled, NOT when the
 // player later opens the phone and submits the already-finished contract.
 const actualFinish=drillingCompletedAt(s)||now;
 const elapsed=actualFinish-(s.contract.drillingStartedAt||actualFinish);
 const earnedSpeed=elapsed<=s.contract.duration*1000;
 if(earnedSpeed)reward+=s.contract.bonusSpeed;
 // Under-budget bonus: expenses < 70% of reward
 if(s.contract.expenses<s.contract.reward*0.7)reward+=s.contract.bonusUnderBudget;
 s.cash+=reward;
 s.contract.paidAt=now;
 s.contract.status='delivered';
 s.ledger.push({id:s.nextId++,key:'contractPayment',amount:reward,at:now});
 return {reward,speedBonus:earnedSpeed,budgetBonus:s.contract.expenses<s.contract.reward*0.7};
}

export function contractDeadline(s){
 if(!s.contract?.drillingStartedAt)return null;
 return s.contract.drillingStartedAt+s.contract.duration*1000;
}
