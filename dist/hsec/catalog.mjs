export const HSEC_BALANCE={version:3,startingGrant:10500,daySeconds:600,threshold:80,inspectionDays:3,maxOfflineSeconds:0,buildSeconds:25,vehicleRoadMeters:12,repairSeconds:8,weights:[25,25,20,20,10],mobility:{vehicle:8,pedestrian:8,crossings:5,separation:4}};
export {HSEC_CATEGORIES,HSEC_SCORING,hsecIcon} from './icons.mjs';
export const HSEC_ANCHORS={officePed:{x:-7.99,z:2.9},officeLog:{x:-1.2,z:3.5},shedPed:{x:3.8,z:-1.05},shedLog:{x:6,z:-.75}};
export const HSEC_ZONE={id:'yard',name:'Zona de mantenimiento',x:8,z:-9,w:8,d:6};
const def=(id,name,category,price,w,d,h,extra={})=>({id,name,category,price,w,d,h,seconds:HSEC_BALANCE.buildSeconds,level:1,maxLevel:10,lifeDays:120,wear:{physical:.6,visual:1.5,functional:.55},maintenance:'Inspeccionar y conservar',...extra});
export const HSEC_ASSETS=[
 def('shed','Galpón de mantenimiento','infrastructure',2600,6,4.8,3.8,{seconds:60,fixed:{x:6,z:-4},capacity:40,benefit:'Acceso peatonal, acceso logístico e inventario de 40 unidades',maintenance:'Revisar estructura y reparar instalaciones'}),
 def('vehicle','Camino vehicular','mobility',65,2.8,1,.08,{route:'vehicle',benefit:'Construye al menos 12 m de camino vehicular para la misión 2',maintenance:'Reparar superficie',wear:{physical:1,visual:1,functional:.75}}),
 def('pedestrian','Sendero peatonal','mobility',40,1.25,1,.06,{route:'pedestrian',benefit:'Red transitable independiente para personas; 8 puntos de movilidad',maintenance:'Regularizar superficie y renovar demarcación'}),
 def('crossing','Cruce peatonal','mobility',120,3.8,1.8,.025,{benefit:'Habilita un cruce controlado entre redes',maintenance:'Repintar paso y verificar visibilidad'}),
 def('railing','Baranda industrial','boundaries',48,2,.13,1.05,{route:'linear',solid:true,lightRepair:true,benefit:'Separa rutas y protege zonas de riesgo',maintenance:'Repintar y reparar fijaciones'}),
 def('barrier','Barrera New Jersey','boundaries',60,2,.42,.8,{route:'linear',solid:true,lightRepair:true,benefit:'Protección física y control de acceso',maintenance:'Repintar; reparar estructura dañada'}),
 def('cone','Cono de seguridad','boundaries',25,.38,.38,.75,{solid:true,disposable:true,benefit:'Delimita el perímetro de mantenimiento',maintenance:'Reemplazar si se deteriora',wear:{physical:0,visual:0,functional:0}}),
 def('bollard','Bolardo de protección','boundaries',55,.17,.17,.9,{solid:true,lightRepair:true,benefit:'Segregación de accesos peatonales',maintenance:'Restituir reflectantes y fijaciones'}),
 def('fence','Cerco perimetral','boundaries',55,2,.12,1.8,{route:'linear',solid:true,benefit:'Control de paso y navegación',maintenance:'Reparar malla y apoyos'}),
 def('tower','Torre de iluminación','lighting',450,.75,.75,4.5,{solid:true,range:6.5,benefit:'Cobertura efectiva de 6,5 m sobre caminos y accesos',maintenance:'Limpiar y reparar luminarias',wear:{physical:.35,visual:1,functional:1}}),
 def('post','Poste peatonal','lighting',230,.25,.25,2.5,{solid:true,range:4.8,benefit:'Ilumina circulación peatonal',maintenance:'Revisar luminaria y conexiones'}),
 def('sign','Señalética de seguridad','emergencies',75,.5,.12,1.6,{solid:true,lightRepair:true,benefit:'Advierte el riesgo junto a rutas y cruces',maintenance:'Limpiar o reemplazar señal'}),
 def('extinguisher','Extintor y gabinete','emergencies',150,.4,.25,1.25,{solid:true,benefit:'Equipo de emergencia en un acceso transitable',maintenance:'Verificar equipo y sustituir componente'}),
 def('marking','Demarcación de piso','mobility',35,2,.13,.01,{lightRepair:true,benefit:'Identificación visible de la ruta',maintenance:'Renovar pintura y reflectantes'}),
 ...[['control','Caseta de control',2,2,2.5],['speedbump','Lomo de toro',2.8,.45,.1],['mirror','Espejo convexo',.5,.2,2],['recycling','Punto limpio',1.4,.7,1.2],['spill','Contención de derrames',1.2,.8,.25],['shower','Ducha de emergencia',.8,.8,2.4],['cable','Protector de cables',1,.3,.07],['drain','Rejilla de drenaje',1,.5,.02],['handrail','Pasamanos peatonal',2,.12,1]].map(([id,name,w,d,h])=>def(id,name,['mirror','speedbump','cable','drain'].includes(id)?'mobility':['handrail','control'].includes(id)?'boundaries':'emergencies',null,w,d,h,{future:true,benefit:'Registrado para una etapa posterior',maintenance:'Según ficha de conservación'}))
];
export const assetDefinition=id=>HSEC_ASSETS.find(d=>d.id===id);
export const EMPLOYEES=[{id:'hsec01',name:'Profesional HSEC · Candidato 01',gender:'man',asset:'hsec-npc1.glb',salary:0,hireCost:350,level:1},{id:'hsec02',name:'Profesional HSEC · Candidata 02',gender:'woman',asset:'hsec-npc2.glb',salary:0,hireCost:350,level:1}];
export const HSEC_STEPS=['Mejora la oficina a nivel 2','Construye el galpón de mantenimiento','Construye al menos 12 m de camino vehicular y conecta senderos peatonales','Ilumina rutas e instala extintores','Alcanza 80 puntos HSEC'];

// Ten data levels are prepared; only the playable variants are exposed.
export const HSEC_LEVELS=Array.from({length:10},(_,i)=>({level:i+1,durability:1+i*.3,available:i<3,next:i<9?i+2:null}));

export const HSEC_SHED_WALLS=[{x:0,z:-2.4,w:6,d:.14},{x:-3,z:0,w:.14,d:4.8},{x:3,z:0,w:.14,d:4.8},{x:-2.8,z:2.4,w:.4,d:.14},{x:-1.48,z:2.4,w:.65,d:.14},{x:2.75,z:2.4,w:.5,d:.14},{x:0,z:-1.85,w:4.8,d:.7}];
