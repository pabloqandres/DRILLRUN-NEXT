import {CONFIG,CLEARABLES,PRODUCTS} from './config.mjs';
import {avatarDefinition} from './avatars.mjs';
import {moduleDefinition,MODULES,BUILD_ZONES,moduleFixtures,pendingConstruction,moduleAvailability} from './module-catalog.mjs';
import {migrateNarrative,ensureNarrative} from './narrative.mjs';
import {isPlayableTerrain} from './navigation-areas.mjs';
export class GameError extends Error{constructor(key){super(key);this.key=key;}}
const fail=key=>{throw new GameError(key);},finite=n=>Number.isFinite(n),product=id=>PRODUCTS.find(p=>p.id===id);
export function newGame(lang='es',character='operator01',now=Date.now()){
 return {version:6,schema:'modular-1',lang,character:CONFIG.protagonists.some(p=>p.id===character&&p.available)?character:'operator01',playerName:'',specialty:avatarDefinition(character).roleKey,bonuses:{...avatarDefinition(character).bonuses},position:{...CONFIG.spawn},inside:false,introSeen:false,bank:CONFIG.bank,cash:CONFIG.cash,energy:CONFIG.maxEnergy,energyAt:now,boosters:CONFIG.boosters,cleared:[],office:{status:'unbuilt'},inventory:[],furniture:[],nextId:1,ledger:[{id:0,key:'capital',amount:CONFIG.cash,at:now}],bankViewed:false,messageRead:false,hasEntered:false,chapterCompletedAt:null,sound:true,facing:Math.PI,savedAt:now,messageReads:[],uiEvents:[],
  /* M3 fields */ personnel:[],contract:null,boreholes:[],geoAnalysis:null,toolInventory:[],spentMaterials:[],orders:[],drill:null,drillRunSessions:[],mission3:null,knowledgeAccelerators:0,workshop:null,
  /* M4 fields */ mission4:null,
  /* M5 fields · single modular machinery patio */ mission5:null,
  /* Narrative */ narrative:{messages:[],accepted:[],rewardsCollected:[]}};
}
export const cleanPlayerName=value=>Array.from(String(value).normalize('NFKC').replace(/[<>\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim()).slice(0,20).join('');
export function setPlayerIdentity(s,avatar,name){const p=CONFIG.protagonists.find(p=>p.id===avatar);if(!p?.available)fail('avatarPending');const value=cleanPlayerName(name);if(Array.from(value).length<2)fail('nameRequired');s.character=avatar;s.playerName=value;s.specialty=p.roleKey;s.bonuses={...p.bonuses};s.introVariant='intro-'+avatar;}
export function installModuleFixtures(s){
 if(s.office.status!=='built')return;const level=s.office.level||1,fixtures=moduleFixtures(level);
 s.inventory=fixtures.map(f=>({id:'office01-'+f.id,product:f.product,variant:f.variant,included:true}));
 s.furniture=fixtures.map(f=>({id:'office01-'+f.id,x:f.x,z:f.z,rotation:f.rotation,y:f.host?1.17:.42,...(f.host?{host:'office01-'+f.host}:{})}));s.furniture.sort((a,b)=>Number(!!a.host)-Number(!!b.host));s.office.fixturesLevel=level;
}
function finishConstruction(s){const job=pendingConstruction(s);if(!job)return null;const upgrade=!!s.office.upgrade;if(upgrade){s.office.level=job.targetLevel;delete s.office.upgrade;}else{s.office.status='built';s.office.level=1;}installModuleFixtures(s);return upgrade?'upgraded':'built';}
export function constructionSeconds(s,module){return Math.ceil(module.seconds*(1+(avatarDefinition(s.character).bonuses.constructionTime||0)));}
export function tick(s,now=Date.now()){
 const elapsed=Math.max(0,now-s.energyAt)/1000;s.energy=Math.min(CONFIG.maxEnergy,s.energy+elapsed/CONFIG.regenSeconds);s.energyAt=now;
 const result={built:false,upgraded:false},job=pendingConstruction(s);if(job&&now>=job.ends)result[finishConstruction(s)]=true;return result;
}
export function restore(data,now=Date.now()){
 if(!data||(data.version!==5&&data.version!==6)||!['bank','cash','energy','energyAt','boosters','nextId'].every(k=>finite(data[k]))||data.bank<0||data.cash<0||data.boosters<0||!['unbuilt','building','built'].includes(data.office?.status))return null;
 const s={...newGame(data.lang,data.character,now),...data};const migrating=data.schema!=='modular-1';if(migrating){s.cash=data.cash+data.bank;s.bank=0;s.schema='modular-1';s.migratedFrom='005.5';}
 if(data.version===5){s.version=6;s.migratedFrom=s.migratedFrom||'v5';/* migrate HSEC employee to personnel */ if(s.hsec?.employee&&!s.personnel?.length){s.personnel=[{id:s.hsec.employee.id,role:'hsec',hiredAt:now,source:'m2-migration'}];}}
 /* M5 is optional in earlier saved games. Never retroactively charge. */
 s.mission5=s.mission5&&typeof s.mission5==='object'?s.mission5:null;
 /* ensure M3 defaults exist */ s.personnel=Array.isArray(s.personnel)?s.personnel:[];s.contract=s.contract||null;s.boreholes=Array.isArray(s.boreholes)?s.boreholes:[];s.geoAnalysis=s.geoAnalysis||null;s.toolInventory=Array.isArray(s.toolInventory)?s.toolInventory:[];s.spentMaterials=Array.isArray(s.spentMaterials)?s.spentMaterials:[];s.orders=Array.isArray(s.orders)?s.orders:[];s.drill=s.drill||null;s.drillRunSessions=Array.isArray(s.drillRunSessions)?s.drillRunSessions:[];s.mission3=s.mission3||null;s.knowledgeAccelerators=Math.max(0,Math.floor(Number(s.knowledgeAccelerators)||0));
 /* M3 funds safety net — one-time top-up for existing saves with low cash */
 if(s.mission3&&s.mission3.phase!=='inactive'&&!s.mission3.fundingV2){const total=(s.cash||0)+(s.bank||0);const min=25000;if(total<min){const bonus=min-total;s.cash+=bonus;s.ledger.push({id:s.nextId++,key:'Subsidio operacional · Misión 3',amount:bonus,at:now});}s.mission3.fundingV2=true;}
 /* Preserve saved contract terms. Older contracts keep their original 15-minute/6-site rules; new contracts use 180s/3 sites. */
 /* Reset drilling timer for saves where deadline already passed */
 if(s.contract&&s.contract.duration!==180&&s.contract.drillingStartedAt&&!s.contract._timerReset4){const deadline=s.contract.drillingStartedAt+s.contract.duration*1000;if(deadline<now){s.contract.drillingStartedAt=now;}s.contract._timerReset4=true;}
 // Repair the early-game legacy default workshop without affecting legitimately built properties.
 if(!s.chapterCompletedAt&&!s.mission3&&s.workshop?.level===1&&!s.workshop?.upgrade&&
    !s.ledger?.some(l=>l.key==='workshopBuild')&&!(s.toolInventory||[]).length){
  s.workshop=null;
 }
 // Workshop is never auto-created: a new player must build its prefabricated Level 1 module.
 /* M4 defaults */ s.mission4=s.mission4||null;
 /* M1 mission rewards are confirmed by narrative; restore never pays before confirmation. */
 /* M4 stuck zones fix */
 if(s.mission4?.drillTruck&&!s.mission4.drillTruck.maintenancePhase){for(const z of s.mission4?.zones||[]){if(z.status==='maintenance')z.status='idle';}}
 /* Only historical saves without a narrative record need backfill.
    Never auto-confirm a mission from a modern, unconfirmed save. */
 if(!data.narrative)migrateNarrative(s,now);
 else ensureNarrative(s);
 if(s.chapterCompletedAt&&s.narrative?.rewardsCollected?.includes('m1')&&!s.ledger?.some(l=>l.key==='missionReward')){
  s.cash+=5000;
  s.ledger.push({id:s.nextId++,key:'missionReward',label:'Recompensa · Misión 1 (recuperada)',amount:5000,at:now});
 }
 s.specialty=avatarDefinition(s.character).roleKey;s.bonuses={...avatarDefinition(s.character).bonuses};
 if(!['es','en','pt','it','zh-Hant'].includes(s.lang))s.lang='es';if(!CONFIG.protagonists.some(p=>p.id===s.character&&p.available))s.character='operator01';s.playerName=cleanPlayerName(data.playerName||'');
 s.energy=Math.max(0,Math.min(CONFIG.maxEnergy,s.energy));s.boosters=Math.floor(s.boosters);
 s.cleared=[...new Set((Array.isArray(s.cleared)?s.cleared:[]).filter(id=>CLEARABLES.some(o=>o.id===id)))];
 s.inventory=(Array.isArray(s.inventory)?s.inventory:[]).filter((o,i,a)=>product(o.product)&&typeof o.id==='string'&&a.findIndex(v=>v.id===o.id)===i);
 s.furniture=(Array.isArray(s.furniture)?s.furniture:[]).filter((o,i,a)=>s.inventory.some(v=>v.id===o.id)&&[o.x,o.z,o.rotation].every(finite)&&Math.abs(o.x)<2.9&&Math.abs(o.z)<1.2&&a.findIndex(v=>v.id===o.id)===i);
 s.inventory=s.inventory.map(item=>({...item,variant:product(item.product).variants.find(v=>v.id===item.variant)?.id||product(item.product).variants[0].id}));
 s.messageReads=Array.isArray(data.messageReads)?[...new Set(data.messageReads.filter(v=>CONFIG.mentor.messages.some(m=>m.id===v)))]:data.messageRead?['welcome']:[];
 s.uiEvents=Array.isArray(data.uiEvents)?[...new Set(data.uiEvents.filter(v=>typeof v==='string'))].slice(-100):['message:welcome',...(landReady(s)?['mission:clear']:[]),...(s.office.status==='built'?['mission:office','message:office-store']:[]),...(s.chapterCompletedAt?['mission:chapter']:[])];
 s.nextId=Math.max(1,Math.floor(s.nextId),...s.inventory.map(o=>Number(o.id.split('-')[1])+1||1));
 s.ledger=(Array.isArray(s.ledger)?s.ledger:[]).filter(o=>finite(o.amount)&&finite(o.at)).slice(-100);
 {
  // V57: preserve legal positions anywhere on the 240 m map across all
  // mission stages. Discard only corrupt/outside-terrain saved positions.
  const pos=s.position;
  if(!isPlayableTerrain(pos?.x,pos?.z))s.position={...CONFIG.spawn};
 }
 if(s.office.status==='building'&&(!finite(s.office.started)||!finite(s.office.ends)||s.office.ends<s.office.started))return null;
 if(s.office.status==='built'){s.office.level=s.office.level===2?2:1;installModuleFixtures(s);}else s.inside=false;
 if(s.office.upgrade&&(!finite(s.office.upgrade.started)||!finite(s.office.upgrade.ends)||s.office.upgrade.targetLevel!==2||s.office.upgrade.ends<s.office.upgrade.started))delete s.office.upgrade;
 const candidates=s.furniture;s.furniture=[];candidates.sort((a,b)=>Number(product(s.inventory.find(v=>v.id===a.id)?.product)?.layer==='surface')-Number(product(s.inventory.find(v=>v.id===b.id)?.product)?.layer==='surface'));
 for(const f of candidates){const valid=validatePlacement(s,f.id,f);if(valid.valid)s.furniture.push({id:f.id,x:f.x,z:f.z,rotation:f.rotation,y:valid.y,...(valid.host?{host:valid.host}:{})});}
 // Mission completion depends on using the included workstation, never furniture purchases.
 tick(s,now);return s;
}
export function clearObject(s,id,now=Date.now()){
 tick(s,now);const obj=CLEARABLES.find(o=>o.id===id);if(!obj)fail('invalid');if(s.cleared.includes(id))return false;
 if(Math.hypot(s.position.x-obj.x,s.position.z-obj.z)>1.6)fail('comeCloser');if(s.energy<CONFIG.clearCost)fail('noEnergy');
 s.energy-=CONFIG.clearCost;s.cleared.push(id);return true;
}
export const landReady=s=>CLEARABLES.every(o=>s.cleared.includes(o.id));
export function transfer(s,direction,amount,now=Date.now()){
 if(!finite(amount)||amount<=0||!Number.isInteger(amount))fail('invalidAmount');
 const from=direction==='withdraw'?'bank':direction==='deposit'?'cash':null;if(!from)fail('invalid');const to=from==='bank'?'cash':'bank';
 if(s[from]<amount)fail('noMoney');s[from]-=amount;s[to]+=amount;s.ledger.push({id:s.nextId++,key:direction,amount,at:now});
}
export function startModule(s,moduleId,zoneId,now=Date.now()){
 const module=moduleDefinition(moduleId),zone=BUILD_ZONES.find(z=>z.id===zoneId);if(!module||!zone||!zone.types.includes(module.type)||module.level>zone.maxLevel)fail('invalidZone');
 const unavailable=moduleAvailability(s,module);if(unavailable)fail(unavailable);if(!landReady(s))fail('clearFirst');if(module.width>zone.width||module.depth>zone.depth)fail('invalidZone');if(s.cash<module.price)fail('noMoney');
 const seconds=constructionSeconds(s,module),job={module:module.id,slot:zone.id,started:now,ends:now+seconds*1000,paid:module.price};
 s.cash-=module.price;if(module.level===1)s.office={status:'building',...job};else s.office.upgrade={...job,targetLevel:module.level};
 s.ledger.push({id:s.nextId++,key:module.level===1?'officePurchase':'officeUpgrade',amount:-module.price,at:now});
 if(s.inside||Math.abs(s.position.x-CONFIG.officeSlot.x)<3.6&&Math.abs(s.position.z)<2.5){s.position={...CONFIG.officeSlot.access};s.inside=false;}
 return job;
}
export function startOffice(s,slot,now=Date.now()){return startModule(s,'office-l1',slot,now);}
export function accelerate(s,now=Date.now()){
 tick(s,now);if(!pendingConstruction(s))fail('noBuild');if(s.boosters<1)fail('noBoost');s.boosters--;pendingConstruction(s).ends=now;finishConstruction(s);
}
export function useOfficeComputer(s,now=Date.now()){if(s.office.status!=='built'||!s.inside||pendingConstruction(s))fail('enterFirst');if(!s.chapterCompletedAt){s.chapterCompletedAt=now;/* reward deferred to narrative confirmCompletion('m1') */}s.computerUsed=true;return s.chapterCompletedAt;}
export function purchase(s,sku,now=Date.now(),variant){
 const p=product(sku);if(!p)fail('invalid');const finish=p.variants.find(v=>v.id===(variant||p.variants[0].id));if(!finish)fail('invalid');if(s.office.status!=='built'||!s.hasEntered)fail('enterFirst');
 if(!s.chapterCompletedAt&&s.inventory.some(v=>v.product===sku))fail('alreadyOwned');if(s.cash<p.price)fail('noMoney');
 s.cash-=p.price;const item={id:'item-'+s.nextId++,product:sku,variant:finish.id};s.inventory.push(item);s.ledger.push({id:s.nextId++,key:p.nameKey,amount:-p.price,at:now});return item;
}
export function footprint(item,pose){const p=product(item.product),r=Math.round(pose.rotation/(Math.PI/2)),swap=Math.abs(r)%2===1;return {x:pose.x,z:pose.z,w:swap?p.d:p.w,d:swap?p.w:p.d};}
const overlaps=(a,b,pad=.025)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad;
export function validatePlacement(s,id,pose){
 const item=s.inventory.find(o=>o.id===id);if(!item||![pose.x,pose.z,pose.rotation].every(finite)||Math.abs(pose.rotation/(Math.PI/2)-Math.round(pose.rotation/(Math.PI/2)))>1e-6)return {valid:false,key:'invalid'};
 const p=product(item.product),box=footprint(item,pose);
 if(Math.abs(box.x)+box.w/2>2.82||Math.abs(box.z)+box.d/2>1.10)return {valid:false,key:'outside'};
 if(p.layer==='surface'){
  const host=s.furniture.find(o=>{const inv=s.inventory.find(v=>v.id===o.id);if(inv?.product!=='desk')return false;const b=footprint(inv,o);return Math.abs(box.x-b.x)+box.w/2<=b.w/2-.025&&Math.abs(box.z-b.z)+box.d/2<=b.d/2-.025;});
  if(!host)return {valid:false,key:'needsDesk'};
  if(s.furniture.some(o=>o.id!==id&&o.host===host.id&&overlaps(box,footprint(s.inventory.find(v=>v.id===o.id),o))))return {valid:false,key:'overlap'};
  return {valid:true,host:host.id,y:.42+.75};
 }
 if(overlaps(box,{x:-2,z:.68,w:1.12,d:1.02},.04))return {valid:false,key:'accessBlocked'};
 if(s.furniture.some(o=>o.id!==id&&product(s.inventory.find(v=>v.id===o.id)?.product)?.layer==='floor'&&overlaps(box,footprint(s.inventory.find(v=>v.id===o.id),o))))return {valid:false,key:'overlap'};
 return {valid:true,y:.42};
}
export function placeItem(s,id,pose,now=Date.now()){
 const result=validatePlacement(s,id,pose);if(!result.valid)fail(result.key);const old=s.furniture.find(o=>o.id===id),next={id,x:pose.x,z:pose.z,rotation:pose.rotation,y:result.y,...(result.host?{host:result.host}:{})};
 if(old){const delta=next.rotation-old.rotation,c=Math.cos(delta),sn=Math.sin(delta);for(const child of s.furniture.filter(o=>o.host===id)){const dx=child.x-old.x,dz=child.z-old.z;child.x=next.x+dx*c+dz*sn;child.z=next.z-dx*sn+dz*c;child.rotation+=delta;}Object.assign(old,next);}else s.furniture.push(next);
 if(s.schema!=='modular-1'&&CONFIG.requiredProducts.every(sku=>s.furniture.some(o=>s.inventory.find(v=>v.id===o.id)?.product===sku))&&!s.chapterCompletedAt)s.chapterCompletedAt=now;
 return next;
}
export function objective(s){if(s.chapterCompletedAt)return 'next';if(!landReady(s))return 'clear';if(s.office.status==='unbuilt')return 'build';if(pendingConstruction(s))return 'speed';if(!s.hasEntered)return 'enter';return 'admin';}
export function progress(s,now=Date.now()){const job=pendingConstruction(s);return job?Math.max(0,Math.min(1,(now-job.started)/(job.ends-job.started||1))):s.office.status==='built'?1:0;}
