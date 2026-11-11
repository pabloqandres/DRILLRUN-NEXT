// V76 · 21 original fictional candidates in seven real operational roles.
// Skills are persisted identity data for future progression, NEVER active
// economy modifiers until explicitly designed and approved.
// No external brands, logos or identifying emblems on portraits or uniform.
export const PERSONNEL_SKILL_LABELS=Object.freeze({
  "negotiation": "Negociación",
  "planning": "Planificación",
  "reporting": "Reportes",
  "efficiency": "Eficiencia",
  "coordination": "Coordinación",
  "drilling": "Perforación",
  "rigging": "Maniobras",
  "precision": "Precisión",
  "support": "Apoyo",
  "teamwork": "Trabajo en equipo",
  "safety": "Seguridad",
  "inspection": "Inspecciones",
  "compliance": "Normativa",
  "maintenance": "Mantenimiento",
  "automation": "Automatización",
  "repair": "Reparación",
  "vigilance": "Vigilancia",
  "response": "Respuesta",
  "logistics": "Logística",
  "inventory": "Inventario",
  "fleet": "Flota",
  "analysis": "Análisis"
});
export const PERSONNEL_GROUPS=Object.freeze([
  {
    "id": "admin",
    "label": "Administrador de contrato",
    "short": "Administración",
    "icon": "clipboard-list",
    "unlock": 3,
    "description": "Negociación, control de costos y seguimiento contractual"
  },
  {
    "id": "driller",
    "label": "Operador de perforación",
    "short": "Perforación",
    "icon": "hard-hat",
    "unlock": 3,
    "description": "Operación y rendimiento de perforadoras"
  },
  {
    "id": "helper",
    "label": "Ayudante de perforación",
    "short": "Apoyo operativo",
    "icon": "users",
    "unlock": 3,
    "description": "Apoyo seguro a equipos y maniobras"
  },
  {
    "id": "hsec",
    "label": "Prevencionista HSEC",
    "short": "Seguridad HSEC",
    "icon": "shield-check",
    "unlock": 2,
    "description": "Inspecciones, prevención y controles de seguridad"
  },
  {
    "id": "tecnicoDrillco",
    "label": "Técnico de taller",
    "short": "Mantenimiento",
    "icon": "wrench",
    "unlock": 4,
    "description": "Reparaciones, automatización y cuidado de herramientas"
  },
  {
    "id": "m5-gate-security",
    "label": "Guardia de acceso",
    "short": "Control de acceso",
    "icon": "shield",
    "unlock": 5,
    "description": "Vigilancia, control de portón y respuesta"
  },
  {
    "id": "m5-warehouse-tech",
    "label": "Técnico de patio y bodega",
    "short": "Patio y bodega",
    "icon": "truck",
    "unlock": 5,
    "description": "Inventario, circulación y soporte logístico"
  }
].map(g=>Object.freeze(g)));
export const PERSONNEL_CANDIDATES=Object.freeze([
  {
    "id": "adm-camila-rojas",
    "role": "admin",
    "name": "Camila Rojas",
    "gender": "woman",
    "hireCost": 800,
    "grade": 3,
    "description": "Especialista en negociación de contratos y acuerdos de suministro.",
    "portrait": "./assets/npc-portraits-v76/adm-camila-rojas.svg",
    "skills": {
      "negotiation": 2,
      "efficiency": 2,
      "planning": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 140,
    "payrollStatus": "planned"
  },
  {
    "id": "adm-matias-torres",
    "role": "admin",
    "name": "Matías Torres",
    "gender": "man",
    "hireCost": 950,
    "grade": 4,
    "description": "Ordena entregables y reduce fricciones entre equipos.",
    "portrait": "./assets/npc-portraits-v76/adm-matias-torres.svg",
    "skills": {
      "efficiency": 3,
      "coordination": 2,
      "reporting": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 165,
    "payrollStatus": "planned"
  },
  {
    "id": "adm-sofia-ibarra",
    "role": "admin",
    "name": "Sofía Ibarra",
    "gender": "woman",
    "hireCost": 740,
    "grade": 3,
    "description": "Planifica hitos y documenta avances con precisión.",
    "portrait": "./assets/npc-portraits-v76/adm-sofia-ibarra.svg",
    "skills": {
      "planning": 2,
      "negotiation": 1,
      "reporting": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 125,
    "payrollStatus": "planned"
  },
  {
    "id": "op-diego-arancibia",
    "role": "driller",
    "name": "Diego Arancibia",
    "gender": "man",
    "hireCost": 600,
    "grade": 3,
    "description": "Operador centrado en rendimiento y control de maniobras.",
    "portrait": "./assets/npc-portraits-v76/op-diego-arancibia.svg",
    "skills": {
      "drilling": 2,
      "precision": 2,
      "safety": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 130,
    "payrollStatus": "planned"
  },
  {
    "id": "op-renato-paredes",
    "role": "driller",
    "name": "Renato Paredes",
    "gender": "man",
    "hireCost": 700,
    "grade": 4,
    "description": "Destaca coordinando instalación y operación en terreno.",
    "portrait": "./assets/npc-portraits-v76/op-renato-paredes.svg",
    "skills": {
      "rigging": 3,
      "drilling": 2,
      "coordination": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 155,
    "payrollStatus": "planned"
  },
  {
    "id": "op-valentina-soto",
    "role": "driller",
    "name": "Valentina Soto",
    "gender": "woman",
    "hireCost": 540,
    "grade": 3,
    "description": "Operación de bajo riesgo y lectura cuidadosa del terreno.",
    "portrait": "./assets/npc-portraits-v76/op-valentina-soto.svg",
    "skills": {
      "precision": 2,
      "safety": 1,
      "drilling": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 115,
    "payrollStatus": "planned"
  },
  {
    "id": "aux-nicolas-vera",
    "role": "helper",
    "name": "Nicolás Vera",
    "gender": "man",
    "hireCost": 250,
    "grade": 3,
    "description": "Apoyo ágil y constante al equipo de perforación.",
    "portrait": "./assets/npc-portraits-v76/aux-nicolas-vera.svg",
    "skills": {
      "support": 2,
      "teamwork": 2,
      "safety": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 65,
    "payrollStatus": "planned"
  },
  {
    "id": "aux-tomas-leiva",
    "role": "helper",
    "name": "Tomás Leiva",
    "gender": "man",
    "hireCost": 290,
    "grade": 4,
    "description": "Se especializa en preparar herramientas y maniobras.",
    "portrait": "./assets/npc-portraits-v76/aux-tomas-leiva.svg",
    "skills": {
      "rigging": 3,
      "support": 2,
      "efficiency": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 75,
    "payrollStatus": "planned"
  },
  {
    "id": "aux-javiera-silva",
    "role": "helper",
    "name": "Javiera Silva",
    "gender": "woman",
    "hireCost": 210,
    "grade": 3,
    "description": "Cuida los protocolos y trabaja muy bien en equipo.",
    "portrait": "./assets/npc-portraits-v76/aux-javiera-silva.svg",
    "skills": {
      "safety": 2,
      "teamwork": 1,
      "support": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 60,
    "payrollStatus": "planned"
  },
  {
    "id": "hsec01",
    "role": "hsec",
    "name": "Alonso Morales",
    "gender": "man",
    "hireCost": 350,
    "grade": 3,
    "description": "Prevencionista experto en inspecciones preventivas.",
    "portrait": "./assets/npc-portraits-v76/hsec01.svg",
    "skills": {
      "inspection": 2,
      "safety": 2,
      "compliance": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 95,
    "payrollStatus": "planned"
  },
  {
    "id": "hsec02",
    "role": "hsec",
    "name": "Isidora Reyes",
    "gender": "woman",
    "hireCost": 390,
    "grade": 4,
    "description": "Orientada a normas, señalética y cumplimiento HSEC.",
    "portrait": "./assets/npc-portraits-v76/hsec02.svg",
    "skills": {
      "compliance": 3,
      "safety": 2,
      "inspection": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 115,
    "payrollStatus": "planned"
  },
  {
    "id": "hsec03",
    "role": "hsec",
    "name": "María Paz Herrera",
    "gender": "woman",
    "hireCost": 330,
    "grade": 3,
    "description": "Destaca en prevención y respuesta temprana.",
    "portrait": "./assets/npc-portraits-v76/hsec03.svg",
    "skills": {
      "safety": 2,
      "response": 1,
      "inspection": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 90,
    "payrollStatus": "planned"
  },
  {
    "id": "tall-lucas-medina",
    "role": "tecnicoDrillco",
    "name": "Lucas Medina",
    "gender": "man",
    "hireCost": 5000,
    "grade": 3,
    "description": "Experiencia en mantenimiento y recuperación de herramientas.",
    "portrait": "./assets/npc-portraits-v76/tall-lucas-medina.svg",
    "skills": {
      "maintenance": 2,
      "repair": 2,
      "automation": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 270,
    "payrollStatus": "planned"
  },
  {
    "id": "tall-antonia-fuentes",
    "role": "tecnicoDrillco",
    "name": "Antonia Fuentes",
    "gender": "woman",
    "hireCost": 5700,
    "grade": 4,
    "description": "Especialista en automatización y diagnóstico técnico.",
    "portrait": "./assets/npc-portraits-v76/tall-antonia-fuentes.svg",
    "skills": {
      "automation": 3,
      "analysis": 2,
      "maintenance": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 310,
    "payrollStatus": "planned"
  },
  {
    "id": "tall-rodrigo-salinas",
    "role": "tecnicoDrillco",
    "name": "Rodrigo Salinas",
    "gender": "man",
    "hireCost": 4600,
    "grade": 3,
    "description": "Reparaciones robustas y trabajo seguro en el taller.",
    "portrait": "./assets/npc-portraits-v76/tall-rodrigo-salinas.svg",
    "skills": {
      "repair": 2,
      "maintenance": 1,
      "efficiency": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 250,
    "payrollStatus": "planned"
  },
  {
    "id": "acc-oscar-pena",
    "role": "m5-gate-security",
    "name": "Óscar Peña",
    "gender": "man",
    "hireCost": 1800,
    "grade": 3,
    "description": "Control de accesos con especial cuidado de la seguridad.",
    "portrait": "./assets/npc-portraits-v76/acc-oscar-pena.svg",
    "skills": {
      "vigilance": 2,
      "safety": 2,
      "response": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 85,
    "payrollStatus": "planned"
  },
  {
    "id": "acc-carolina-munoz",
    "role": "m5-gate-security",
    "name": "Carolina Muñoz",
    "gender": "woman",
    "hireCost": 2000,
    "grade": 4,
    "description": "Respuesta rápida ante situaciones operativas.",
    "portrait": "./assets/npc-portraits-v76/acc-carolina-munoz.svg",
    "skills": {
      "response": 3,
      "vigilance": 2,
      "coordination": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 100,
    "payrollStatus": "planned"
  },
  {
    "id": "acc-patricio-figueroa",
    "role": "m5-gate-security",
    "name": "Patricio Figueroa",
    "gender": "man",
    "hireCost": 1650,
    "grade": 3,
    "description": "Verificación rigurosa de procedimientos y permisos.",
    "portrait": "./assets/npc-portraits-v76/acc-patricio-figueroa.svg",
    "skills": {
      "compliance": 2,
      "vigilance": 1,
      "safety": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 80,
    "payrollStatus": "planned"
  },
  {
    "id": "pat-catalina-herrera",
    "role": "m5-warehouse-tech",
    "name": "Catalina Herrera",
    "gender": "woman",
    "hireCost": 2200,
    "grade": 3,
    "description": "Orden y control del stock en el patio de vehículos.",
    "portrait": "./assets/npc-portraits-v76/pat-catalina-herrera.svg",
    "skills": {
      "inventory": 2,
      "logistics": 2,
      "fleet": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 1,
    "salaryPerShift": 110,
    "payrollStatus": "planned"
  },
  {
    "id": "pat-ignacio-rivas",
    "role": "m5-warehouse-tech",
    "name": "Ignacio Rivas",
    "gender": "man",
    "hireCost": 2500,
    "grade": 4,
    "description": "Especialista en circulación y disponibilidad de flota.",
    "portrait": "./assets/npc-portraits-v76/pat-ignacio-rivas.svg",
    "skills": {
      "fleet": 3,
      "maintenance": 2,
      "logistics": 2
    },
    "skillEffectStatus": "reserved",
    "rank": 2,
    "salaryPerShift": 125,
    "payrollStatus": "planned"
  },
  {
    "id": "pat-florencia-nunez",
    "role": "m5-warehouse-tech",
    "name": "Florencia Núñez",
    "gender": "woman",
    "hireCost": 2050,
    "grade": 3,
    "description": "Organización de recepción, inventario y abastecimiento.",
    "portrait": "./assets/npc-portraits-v76/pat-florencia-nunez.svg",
    "skills": {
      "logistics": 2,
      "inventory": 1,
      "safety": 1
    },
    "skillEffectStatus": "reserved",
    "rank": 3,
    "salaryPerShift": 100,
    "payrollStatus": "planned"
  }
].map(c=>Object.freeze({...c,skills:Object.freeze(c.skills)})));
export const candidateById=id=>PERSONNEL_CANDIDATES.find(c=>c.id===id)||null;
export const candidatesForRole=role=>PERSONNEL_CANDIDATES.filter(c=>c.role===role);
export const groupForRole=role=>PERSONNEL_GROUPS.find(g=>g.id===role)||null;
export const skillSnapshot=id=>{const c=candidateById(id);return c?{candidateId:c.id,skills:{...c.skills},skillLevel:1,skillPoints:0,progressionVersion:1,effectsEnabled:false}:null;};
export const personnelUnlockMission=s=>s?.mission5?.status&&s.mission5.status!=='locked'?5:s?.mission4?.phase&&s.mission4.phase!=='inactive'?4:s?.mission3?.phase&&s.mission3.phase!=='inactive'?3:2;
export const activePersonnelCount=s=>(s?.personnel?.length||0)+(s?.hsec?.employee&&!s.personnel?.some(p=>p.role==='hsec')?1:0)+Object.values(s?.mission5?.staff||{}).filter(p=>p?.hiredAt).length;
export const personnelCapacity=s=>{
 const unlocked=personnelUnlockMission(s);
 // The user's available slots grow BEFORE M3, M4 and M5 staff requirements.
 // This UI capacity mirrors the total allowed role limits; no new hiring block.
 return 1+(unlocked>=3?4:0)+(unlocked>=4?1:0)+(unlocked>=5?2:0);
};
export const candidateHirePrice=(role,candidateId,fallback)=>{
 const c=candidateById(candidateId);
 return c?.role===role?c.hireCost:fallback;
};

// V79: read-only payroll proposal, not an economic or time-driven system.
export const PERSONNEL_PAYROLL_POLICY=Object.freeze({cycleCountPerTurn:4,automaticDebitsEnabled:false,offlineDebitsEnabled:false,trainingEffectsEnabled:false});
