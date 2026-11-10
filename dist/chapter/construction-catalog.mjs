import {MODULES,moduleDefinition,BUILD_ZONES,pendingConstruction} from './module-catalog.mjs';
import {constructionSeconds,landReady} from './state.mjs';
import {HSEC_ASSETS,HSEC_CATEGORIES} from '../hsec/catalog.mjs';
import {workshopLevel,workshopUpgradeJob,WORKSHOP_LEVELS,canUpgradeWorkshop,canBuildWorkshop,WORKSHOP_L1_COST,WORKSHOP_L1_SECONDS} from '../mission3/inventory.mjs';
import {DRILLS,canPurchaseDrill} from '../mission3/drills.mjs';
import {ROLES,personnelByRole,canHire} from '../mission3/personnel.mjs';
import {DTH_DRILLS,canPurchaseDthDrill} from '../mission4/drills-dth.mjs';
import {DRILLTRUCK_COST,canPurchaseDrillTruck,drillTruckState} from '../mission4/drilltruck.mjs';
import {pendingOrders} from '../mission3/headquarters.mjs';
import {PATIO_L1,PATIO_FUTURE,patioState,patioUnlocked} from '../mission5/patio-state.mjs';

const ES={catalog:'Catálogo',infrastructure:'Edificios',equipment:'Equipos',vehicles:'Vehículos',furniture:'Mobiliario',mobility:'Caminos',boundaries:'Delimitación',lighting:'Iluminación',emergencies:'Seguridad',management:'Personal',available:'Disponible',locked:'Bloqueado',future:'Próximamente',installed:'Instalado',ordered:'En pedido',building:'En construcción',insufficient:'Saldo insuficiente',level:'Nivel',price:'Costo',time:'Tiempo',area:'Superficie',height:'Altura',width:'Ancho',capacity:'Capacidad',units:'unidades',benefit:'Función principal',requirements:'Requisitos',details:'Ficha técnica',preview:'Previsualizar en terreno',manage:'Gestionar',viewWork:'Ver construcción',back:'Volver al catálogo',close:'Cerrar catálogo',previous:'Productos anteriores',next:'Más productos',noCharge:'Sin cobro hasta confirmar en el terreno',chapter:'Completa el capítulo 1',later:'Disponible en una etapa posterior',free:'Sin costo · kit',staff:'Ver candidatos',staffHint:'Contratación y estado del prevencionista',empty:'Sin elementos disponibles en esta categoría',zone:'Zona asignada',cancel:'Cancelar',build:'Construir',perMeter:'/m',costHint:'Precio por metro · total según trazado',ready:'Ubicación asignada válida',included:'Incluido en el módulo',constructionPending:'Termina la obra en curso',clearPlot:'Despeja el terreno primero',owned:'Adquirido',hired:'Contratado',depth:'Profundidad máx.',diameter:'Diámetro',life:'Vida útil',needsAdmin:'Requiere administrador',needsDrill:'Requiere perforadora',needsOffice:'Requiere oficina Nv.2',needsWorkshop:'Requiere galpón',needsWorkshopNv2:'Requiere taller Nv.2',needsBoreholes:'Requiere sondajes completados',roleFull:'Cupo completo',drillOwned:'Ya tienes una perforadora RC',dthOwned:'Ya tienes una perforadora DTH',truckOwned:'Ya tienes un DrillTruck',needsParking:'Requiere estacionamiento (taller Nv.2)',needsTecnico:'Requiere Técnico DRILLCO® contratado',requiresOffice:'Requiere oficina construida',meters:'m'};
const EN={catalog:'Catalog',infrastructure:'Buildings',equipment:'Equipment',vehicles:'Vehicles',furniture:'Furniture',mobility:'Paths',boundaries:'Boundaries',lighting:'Lighting',emergencies:'Safety',management:'Staff',available:'Available',locked:'Locked',future:'Coming later',installed:'Installed',building:'Under construction',insufficient:'Insufficient funds',level:'Level',price:'Cost',time:'Time',area:'Floor area',height:'Height',width:'Width',capacity:'Capacity',units:'units',benefit:'Main function',requirements:'Requirements',details:'Technical sheet',preview:'Preview on site',manage:'Manage',viewWork:'View construction',back:'Back to catalog',close:'Close catalog',previous:'Previous products',next:'More products',noCharge:'No charge until you confirm on site',chapter:'Complete chapter 1',later:'Available in a later stage',free:'Free · kit',staff:'View candidates',staffHint:'Safety professional recruitment and status',empty:'No items in this category',zone:'Assigned zone',cancel:'Cancel',build:'Build',perMeter:'/m',costHint:'Price per meter · total follows the route',ready:'Assigned location is valid',included:'Included in this module',constructionPending:'Finish the current construction',clearPlot:'Clear the plot first',owned:'Owned',hired:'Hired',depth:'Max depth',diameter:'Diameter',life:'Tool life',needsAdmin:'Requires administrator',needsDrill:'Requires drill',needsOffice:'Requires office Lv.2',needsWorkshop:'Requires maintenance shed',needsWorkshopNv2:'Requires workshop Lv.2',needsBoreholes:'Requires completed boreholes',roleFull:'Position filled',drillOwned:'You already own an RC drill',dthOwned:'You already own a DTH drill',truckOwned:'You already own a DrillTruck',requiresOffice:'Requires built office',meters:'m'};
const LOCALES={es:ES,en:EN,pt:{...EN,catalog:'Catálogo',infrastructure:'Edifícios',equipment:'Equipamentos',vehicles:'Veículos',furniture:'Mobiliário',mobility:'Caminhos',boundaries:'Delimitação',lighting:'Iluminação',emergencies:'Segurança',management:'Pessoal',available:'Disponível',locked:'Bloqueado',future:'Em breve',installed:'Instalado',building:'Em construção',insufficient:'Saldo insuficiente',level:'Nível',price:'Custo',time:'Tempo',area:'Área',height:'Altura',width:'Largura',capacity:'Capacidade',units:'unidades',preview:'Pré-visualizar no terreno',manage:'Gerir',back:'Voltar ao catálogo',close:'Fechar catálogo',noCharge:'Sem cobrança até confirmar no terreno',chapter:'Conclua o capítulo 1',later:'Disponível em uma etapa posterior',cancel:'Cancelar',build:'Construir',owned:'Adquirido',hired:'Contratado'},it:{...EN,catalog:'Catalogo',infrastructure:'Edifici',equipment:'Attrezzatura',vehicles:'Veicoli',furniture:'Arredamento',mobility:'Percorsi',boundaries:'Delimitazione',lighting:'Illuminazione',emergencies:'Sicurezza',management:'Personale',available:'Disponibile',locked:'Bloccato',future:'Prossimamente',installed:'Installato',building:'In costruzione',insufficient:'Saldo insufficiente',level:'Livello',price:'Costo',time:'Tempo',area:'Superficie',height:'Altezza',width:'Larghezza',capacity:'Capacità',units:'unità',preview:'Anteprima sul terreno',manage:'Gestisci',back:'Torna al catalogo',close:'Chiudi catalogo',noCharge:'Addebito solo alla conferma sul terreno',cancel:'Annulla',build:'Costruisci',owned:'Acquisito',hired:'Assunto'},'zh-Hant':{...EN,catalog:'目錄',infrastructure:'建築',equipment:'設備',vehicles:'車輛',furniture:'家具',mobility:'道路',boundaries:'邊界',lighting:'照明',emergencies:'安全',management:'人員',available:'可用',locked:'未解鎖',future:'即將推出',installed:'已安裝',building:'施工中',insufficient:'餘額不足',level:'等級',price:'費用',time:'時間',area:'面積',height:'高度',width:'寬度',capacity:'容量',units:'單位',preview:'在場地預覽',manage:'管理',back:'返回目錄',close:'關閉目錄',noCharge:'確認場地位置後才扣款',cancel:'取消',build:'建造',owned:'已擁有',hired:'已雇用'}};
const ACTIONS={es:{collapse:'Contraer ficha',expand:'Expandir ficha',buy:'Comprar',place:'Ubicar',noCharge:'Compra directa · ubicación asignada'},en:{collapse:'Collapse panel',expand:'Expand panel',buy:'Buy',place:'Place',noCharge:'Direct purchase · assigned location'},pt:{collapse:'Recolher ficha',expand:'Expandir ficha',buy:'Comprar',place:'Posicionar',details:'Ficha técnica',noCharge:'Compra direta · local atribuído'},it:{collapse:'Comprimi scheda',expand:'Espandi scheda',buy:'Acquista',place:'Posiziona',details:'Scheda tecnica',noCharge:'Acquisto diretto · posizione assegnata'},'zh-Hant':{collapse:'收合面板',expand:'展開面板',buy:'購買',place:'放置',details:'技術資料',noCharge:'直接購買 · 指定位置'}};
export const catalogCopy=lang=>({...LOCALES[lang]||ES,...ACTIONS[lang]||ACTIONS.es});
export const catalogDuration=seconds=>seconds>=60?`${Math.floor(seconds/60)} min${seconds%60?' '+Math.round(seconds%60)+' s':''}`:`${Math.round(seconds)} s`;
export function catalogCategories(lang){const c=catalogCopy(lang);return HSEC_CATEGORIES.map(d=>({id:d.id,label:c[d.id],icon:'hsec:'+d.id}));}

// Reason text for blocked purchase
function blockReason(code,c){
 const map={drillOwned:c.drillOwned,dthDrillOwned:c.dthOwned,noMoney:c.insufficient,needsAdmin:c.needsAdmin,needsDrill:c.needsDrill,needsOfficeL2:c.needsOffice,needsWorkshop:c.needsWorkshop,needsWorkshopNv2:c.needsWorkshopNv2,needsCompletedBoreholes:c.needsBoreholes,roleFull:c.roleFull,truckOwned:c.truckOwned,alreadyOwned:c.truckOwned,needsParking:c.needsParking,needsTecnico:c.needsTecnico,missionNotActive:c.later,needsGeoRequest:c.chapter,invalidRole:''};
 return map[code]||'';
}

// Temporary generic labels only; any commercial names and brand-specific artwork
// require explicit approval. DRILLCO® does not sell these unbranded machines.
const EQUIPMENT_DISPLAY_NAMES={
 rig_rc_compact:'Perforadora RC · Sondaje',
 rig_rc_advanced:'Perforadora RC · Alta capacidad',
 rig_dth_production:'Perforadora DTH · Producción'
};

// Read-only projections of the existing economy. Browsing must never create HSEC state or a ledger entry.
export function catalogProducts(s,t){
 const c=catalogCopy(s.lang),base=MODULES[0],installed=s.office.status==='built',module=installed?moduleDefinition('office-l'+s.office.level)||base:base,job=pendingConstruction(s);
 const officeStatus=job?'building':installed?'installed':!landReady(s)?'locked':'available';
 const products=[{id:'office',kind:'module',category:'infrastructure',title:t(module.nameKey).replace(/\s*[·—-]\s*(Nivel|Level|Nível|Livello)\s*\d+$/i,''),level:module.level,description:t(module.descriptionKey),benefit:t(module.benefitKey),price:installed?null:module.price,seconds:installed?null:constructionSeconds(s,module),w:module.width,d:module.depth,h:module.height,capacity:module.capacity+' '+t(module.capacityKey),status:officeStatus,reason:job?c.constructionPending:!installed&&!landReady(s)?c.clearPlot:'',model:module,zone:BUILD_ZONES[0].id,canStart:officeStatus==='available',action:installed||job?'manage':'buy'}];
 // Workshop entry in catalog
 const wsLvl=workshopLevel(s),wsBuilding=s.workshop?.status==='building',wsJob=workshopUpgradeJob(s),wsDef=WORKSHOP_LEVELS.find(w=>w.level===wsLvl),wsNext=WORKSHOP_LEVELS.find(w=>w.level===wsLvl+1);
 const wsStatus=wsBuilding||wsJob?'building':wsLvl?'installed':canBuildWorkshop(s)===null?'available':'locked';
 const wsDescs={1:'Almacenamiento de herramientas y mantenimiento básico',2:'Mayor capacidad + estacionamiento DrillTruck',3:'Capacidad industrial para operaciones a gran escala'};
 products.push({id:'workshop',kind:'workshop',category:'infrastructure',title:'Taller',level:wsLvl,description:wsDescs[wsLvl]||'',benefit:`Capacidad: ${wsDef?.capacity||8} herramientas`,price:wsLvl?(wsNext?wsNext.upgradeCost:null):WORKSHOP_L1_COST,seconds:wsLvl?(wsNext?wsNext.constructionSeconds:null):WORKSHOP_L1_SECONDS,w:7.2,d:5.4,h:4.5,capacity:(wsDef?.capacity||8)+' herramientas',status:wsStatus,reason:wsBuilding||wsJob?c.constructionPending:!wsLvl&&canBuildWorkshop(s)?c.later:'',model:{id:'workshop-l'+(wsLvl||1),level:wsLvl||1,nameKey:'workshop'},canStart:wsStatus==='available',action:wsLvl||wsBuilding?'manage':'buy',insufficient:!wsLvl?s.cash<WORKSHOP_L1_COST:wsNext?s.cash<wsNext.upgradeCost:false});
 // M5 · Fixed large yard unlocked as soon as M4 is complete.
 // Browsing is read-only; the explicit construction confirmation pays once.
 const m5Status=patioState(s);
 const patioStatus=!patioUnlocked(s)?'locked':m5Status==='operational'?'installed':
  m5Status==='building'?'building':'available';
 products.push({
  id:PATIO_L1.id,kind:'patio',category:'infrastructure',title:PATIO_L1.name,
  level:1,description:'Gran explanada industrial · acceso único fijo · galpón logístico · combustible protegido · estacionamiento techado ligero · zonas abiertas para RC, DTH y CAEX menores',
  benefit:'Patio modular real, seguridad HSEC y circulación para flota pesada',
  price:m5Status==='building'||m5Status==='operational'?null:PATIO_L1.price,
  seconds:patioStatus==='available'?PATIO_L1.constructionSeconds:null,
  w:PATIO_L1.width,d:PATIO_L1.depth,h:5.5,capacity:'6 vehículos ligeros · 3 perforadoras · 4 equipos pesados',
  status:patioStatus,
  reason:!patioUnlocked(s)?'Completa Misión 4':patioStatus==='building'?'Obra en ejecución · 20 minutos':'',
  model:PATIO_L1,canStart:patioStatus==='available',action:patioStatus==='available'?'buy':'manage',
  insufficient:patioStatus==='available'&&s.cash<PATIO_L1.price
 });
 for(const plan of PATIO_FUTURE){
  products.push({
   id:plan.id,kind:'patioFuture',category:'infrastructure',title:'Patio de Maquinarias · L'+plan.level,
   level:plan.level,description:'Reserva territorial predefinida · ampliación de flota futura',
   benefit:'Reservado para próximas misiones',price:null,seconds:null,
   w:54,d:44,h:0,capacity:'Expansión bloqueada',status:'locked',
   reason:'Se desbloqueará en una misión futura',model:plan,canStart:false,action:'manage',insufficient:false
  });
 }
 // HSEC assets
 for(const d of HSEC_ASSETS){
  const existing=d.id==='shed'?s.hsec?.assets?.find(a=>a.type===d.id):null;
  const status=d.future?'future':!s.chapterCompletedAt?'locked':existing?.status==='building'?'building':existing?'installed':'available';
  const price=status==='installed'||status==='building'?null:d.id==='cone'&&s.hsec?.kitCones>0?0:d.price;
  products.push({id:d.id,kind:'hsec',category:d.category,title:d.name,level:existing?.level||d.level,description:d.benefit,benefit:d.benefit,price,seconds:d.future||existing?null:d.seconds,w:d.w,d:d.d,h:d.h,capacity:d.capacity?d.capacity+' '+c.units:null,status,reason:d.future?c.later:!s.chapterCompletedAt?c.chapter:'',model:d,route:!!d.route,canStart:status==='available',action:existing?'manage':d.fixed?'buy':'place',insufficient:Number.isFinite(price)&&price>s.cash});
 }

 // ── Equipment: RC Drills ──
 try{
 const m3On=s.mission3&&s.mission3.phase!=='inactive';
 const pending=pendingOrders(s);
 const hasPendingMachinery=(type)=>pending.some(o=>o.items.some(i=>i.category==='machinery'&&i.type===type));
 // Two primary machines in the Catalog: one exploration RC and one production DTH.
 // Preserve the legacy RC PRO definition and show it in the same single RC slot
 // whenever an existing save owns it or the higher-capacity model is on order.
 const rcOrderedAdvanced=pending.some(o=>o.items?.some(i=>i.category==='machinery'&&i.type==='drill'&&i.model==='rig_rc_advanced'));
 const visibleRcId=s.drill?.id==='rig_rc_advanced'||rcOrderedAdvanced?'rig_rc_advanced':'rig_rc_compact';
 for(const d of DRILLS){
  if(d.id!==visibleRcId)continue;
  const owned=s.drill?.id===d.id;const blocked=canPurchaseDrill(s,d.id);
  const onOrder=hasPendingMachinery('drill');
  const status=!m3On?'locked':owned?'installed':onOrder?'building':blocked==='drillOwned'?'installed':blocked?'locked':'available';
  products.push({id:d.id,kind:'drill',category:'equipment',title:EQUIPMENT_DISPLAY_NAMES[d.id]||d.labelKey||d.nameKey,level:1,description:`${c.depth}: ${d.maxDepth}${c.meters} · Ø ${d.bitDiameter}"`,benefit:`RC · ${d.maxDepth}${c.meters}`,price:owned||onOrder?null:d.price,seconds:null,w:3,d:2,h:6,capacity:d.maxDepth+c.meters,status,reason:!m3On?c.chapter:onOrder?c.ordered:blockReason(blocked,c),model:d,canStart:status==='available',action:owned?'manage':onOrder?'manage':'buy',insufficient:status==='available'&&s.cash<d.price});
 }
 const m4On=s.mission4&&s.mission4.phase!=='inactive';
 for(const d of DTH_DRILLS){
  const owned=s.mission4?.productionDrill?.id===d.id;const blocked=canPurchaseDthDrill(s,d.id);
  const onOrder=hasPendingMachinery('dthDrill');
  const status=!m4On?'locked':owned?'installed':onOrder?'building':blocked?'locked':'available';
  products.push({id:d.id,kind:'dthDrill',category:'equipment',title:EQUIPMENT_DISPLAY_NAMES[d.id]||d.labelKey||d.nameKey,level:2,description:`${c.depth}: ${d.maxDepth}${c.meters} · Ø ${d.bitDiameter}"`,benefit:`DTH · ${d.maxDepth}${c.meters}`,price:owned||onOrder?null:d.price,seconds:null,w:4,d:2.5,h:8,capacity:d.maxDepth+c.meters,status,reason:!m4On?c.later:onOrder?c.ordered:blockReason(blocked,c),model:d,canStart:status==='available',action:owned?'manage':onOrder?'manage':'buy',insufficient:status==='available'&&s.cash<d.price});
 }

 // ── Vehicles ──
 const truckBlocked=canPurchaseDrillTruck(s);
 const truckOwned=!!s.mission4?.drillTruck;
 const truckOnOrder=hasPendingMachinery('drillTruck');
 const truckStatus=!m4On?'locked':truckOwned?'installed':truckOnOrder?'building':truckBlocked?'locked':'available';
 products.push({id:'drilltruck',kind:'vehicle',category:'vehicles',title:'DrillTruck',level:1,description:'Vehículo autónomo de mantenimiento en terreno',benefit:'Mantenimiento automatizado de sondajes',price:truckOwned||truckOnOrder?null:DRILLTRUCK_COST,seconds:null,w:5.5,d:2.2,h:2.8,capacity:'1 zona',status:truckStatus,reason:!m4On?c.later:truckOnOrder?c.ordered:blockReason(truckBlocked,c),model:{id:'drilltruck'},canStart:truckStatus==='available',action:truckOwned?'manage':truckOnOrder?'manage':'buy',insufficient:truckStatus==='available'&&s.cash<DRILLTRUCK_COST});

 // ── Management / Personnel ──
 const ROLE_NAMES={hsec:'Profesional HSEC',admin:'Administrador',driller:'Perforista',helper:'Ayudante',techVisit:'Visita Técnica',tecnicoDrillco:'Técnico DRILLCO'};
 const ROLE_DESCS={hsec:'Inspección y mantenimiento HSEC',admin:'Logística y planificación',driller:'Operación de perforadora',helper:'Apoyo en faenas',techVisit:'Geólogo temporal',tecnicoDrillco:'Automatización y mantenimiento avanzado'};
 for(const r of ROLES){
  const hired=personnelByRole(s,r.id);const blocked=canHire(s,r.id);
  const isFull=hired.length>=r.limit;
  const status=isFull?'installed':blocked&&blocked!=='noMoney'?'locked':'available';
  products.push({id:'role-'+r.id,kind:'personnel',category:'management',title:ROLE_NAMES[r.id]||r.id,level:1,description:ROLE_DESCS[r.id]||'',benefit:ROLE_DESCS[r.id]||'',price:isFull?null:r.hireCost,seconds:null,w:0,d:0,h:1.75,capacity:r.limit+' '+c.units,status,reason:blockReason(blocked,c),model:r,canStart:status==='available'&&!blocked,action:isFull?'manage':'buy',insufficient:status==='available'&&s.cash<r.hireCost});
 }
 }catch(e){console.error('catalogProducts extended:',e);}

 products[0].insufficient=Number.isFinite(products[0].price)&&products[0].price>s.cash;
 return products;
}
