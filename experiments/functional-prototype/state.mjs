export const VERSION=1;
export const CONTRACTS=[{id:'pilot',name:'Primeros metros',client:'Exploración · Sector A',rock:'Roca de dureza media',depth:40,reward:420,xp:80,description:'Abre un pozo piloto de 40 metros. Controla la temperatura y completa el trabajo con tu equipo DTH.'},{id:'water',name:'Agua para la faena',client:'Abastecimiento · Sector B',rock:'Roca fracturada',depth:60,reward:560,xp:110,description:'Ejecuta una perforación de reconocimiento. Disponible al ampliar la oficina.'}];
export const snap=(n,step=0.3)=>Math.round(n/step)*step;
export function initialState(now=Date.now()){return {version:VERSION,coins:180,xp:0,tool:100,active:null,completed:[],build:null,office:1,position:{x:0,z:5.5},savedAt:now,sound:true,character:'gaspar'};}
export function restoreState(data,now=Date.now()){
 if(!data||data.version!==VERSION||!Number.isFinite(data.coins)||data.coins<0)return initialState(now);
 const s={...initialState(now),...data};s.tool=Math.max(0,Math.min(100,Number(s.tool)||0));s.completed=Array.isArray(s.completed)?s.completed:[];
 if(s.active&&!CONTRACTS.some(c=>c.id===s.active.id))s.active=null;
 if(s.active){s.active.depth=Math.max(0,Math.min(CONTRACTS.find(c=>c.id===s.active.id).depth,Number(s.active.depth)||0));s.active.heat=Math.max(0,Math.min(100,Number(s.active.heat)||0));}
 if(!s.position||!Number.isFinite(s.position.x)||!Number.isFinite(s.position.z))s.position={x:0,z:8};
 return s;
}
export function acceptContract(s,id){const c=CONTRACTS.find(x=>x.id===id);if(!c)throw Error('Contrato desconocido');if(s.active)throw Error('Termina primero tu contrato actual.');if(id==='water'&&s.office<2)throw Error('Amplía la oficina para desbloquear este contrato.');if(s.tool<25)throw Error('Realiza mantenimiento en el taller.');s.active={id,depth:0,heat:0,ready:false};return c;}
export function drillStep(s,dt,working){if(!s.active||s.active.ready)return;const c=CONTRACTS.find(x=>x.id===s.active.id);const a=s.active;if(a.overheated&&a.heat<35)a.overheated=false;if(working&&!a.overheated){a.depth=Math.min(c.depth,a.depth+4.8*dt);a.heat=Math.min(100,a.heat+15*dt);if(a.heat>=100)a.overheated=true;}else a.heat=Math.max(0,a.heat-24*dt);if(a.depth>=c.depth)a.ready=true;}
export function claimContract(s){if(!s.active?.ready)throw Error('El trabajo aún no está terminado.');const c=CONTRACTS.find(x=>x.id===s.active.id);s.coins+=c.reward;s.xp+=c.xp;s.tool=Math.max(0,s.tool-28);s.completed.push({id:c.id,at:Date.now(),reward:c.reward});s.active=null;return c;}
export function startBuild(s,position,now=Date.now()){if(s.office>=2||s.build)throw Error('Ya existe una ampliación.');if(s.coins<450)throw Error('Necesitas 450 créditos.');if(!position||!Number.isFinite(position.x)||!Number.isFinite(position.z))throw Error('Selecciona una ubicación válida.');s.coins-=450;s.build={x:snap(position.x),z:snap(position.z),started:now,ends:now+45000};return s.build;}
export function finishBuild(s,now=Date.now()){if(s.build&&now>=s.build.ends&&s.office<2){s.office=2;s.xp+=50;return true;}return false;}
export function maintenance(s){s.tool=100;if(s.active){s.active.heat=0;s.active.overheated=false;}}
export function constructionProgress(s,now=Date.now()){if(!s.build)return 0;return Math.max(0,Math.min(1,(now-s.build.started)/(s.build.ends-s.build.started)));}
export function overlaps(a,b,pad=0){return Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad;}
export function validExtension(p,obstacles=[]){const a={...p,w:3.6,d:4.2};if(p.x<-.5||p.x>.9||p.z<-2.7||p.z>2.7)return false;return !obstacles.some(b=>overlaps(a,b,.08));}
