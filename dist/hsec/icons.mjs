// V5 — 5 scoring categories for HSEC v2. Builder icons kept in ICON_SHAPES.
export const HSEC_ICON_VERSION=5;

// Shapes for all known category IDs (scoring + builder + legacy).
const ICON_SHAPES={
 infrastructure:{color:'#FFC83D',shape:'<path d="M4 8h24v18H4Z"/><path d="M3 5h26v3H3M8 26v2m16-2v2M8 26V14h6v12"/><rect x="18" y="13" width="6" height="6" rx=".5"/>'},
 mobility:{color:'#2CDCF1',shape:'<path d="M5 28 9 4m18 24L23 4M16 5v4m0 5v4m0 5v5"/>'},
 boundaries:{color:'#FF756C',shape:'<rect x="4" y="10" width="24" height="9" rx="1"/><path d="m8 10 6 9m3-9 6 9M7 19v9m18-9v9M4 28h6m12 0h6"/>'},
 lighting:{color:'#B891FF',shape:'<rect x="4" y="5" width="10" height="8" rx="1.5"/><rect x="18" y="5" width="10" height="8" rx="1.5"/><path d="M9 13v3h14v-3m-7 3v12m-5 0h10M5 17l-2 3m24-3 2 3"/>'},
 emergencies:{color:'#40E4A3',shape:'<path d="M8 24v-9a8 8 0 0 1 16 0v9M16 11v6M16 2v2M5 7l2 2m18 0 2-2M2 17h3m22 0h3"/><rect x="5" y="24" width="22" height="5" rx="1.5"/>'},
 management:{color:'#FF9B51',shape:'<path d="M10 6H6a2 2 0 0 0-2 2v19a2 2 0 0 0 2 2h9M18 6h4a2 2 0 0 1 2 2v3"/><rect x="10" y="3" width="8" height="5" rx="1.5"/><path d="m9 15 3 3 5-5m-8 11h5M25 14a4 4 0 0 0-5 5l-4 4a2 2 0 0 0 3 3l4-4a4 4 0 0 0 5-5l-2 2-3-3 2-2Z"/>'},
 fire:{color:'#FF9B51',shape:'<path d="M16 3c0 5-6 8-6 14a6 6 0 0 0 12 0c0-3-2-5-3-7s-1-4 1-7h-1"/><circle cx="16" cy="22" r="2.5"/>'},
 roads:{color:'#2CDCF1',shape:'<path d="M5 28 9 4m18 24L23 4M16 5v4m0 5v4m0 5v5"/>'},
 protection:{color:'#FF756C',shape:'<rect x="4" y="10" width="24" height="9" rx="1"/><path d="m8 10 6 9m3-9 6 9M7 19v9m18-9v9M4 28h6m12 0h6"/>'},
 signage:{color:'#40E4A3',shape:'<path d="M8 4h16l3 6-3 6H8V4Z"/><path d="M8 4v24"/>'},
 equipment:{color:'#E8A040',shape:'<path d="M16 4v7m0 0-3 3h6l-3-3Z"/><rect x="14" y="14" width="4" height="12" rx=".5"/><path d="M10 26h12"/><circle cx="16" cy="8" r="2.5"/><path d="M8 18h3m9 0h3"/>'},
 vehicles:{color:'#5B9FE8',shape:'<rect x="3" y="14" width="26" height="10" rx="2"/><path d="M7 14V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/><circle cx="9" cy="24" r="2.5"/><circle cx="23" cy="24" r="2.5"/><path d="M12 10h8"/>'},
 furniture:{color:'#C896E8',shape:'<rect x="5" y="14" width="22" height="2" rx=".5"/><path d="M7 16v8m18-8v8M8 14v-4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4"/><path d="M10 24h12"/>'}
};

// 5 scoring categories (HSEC v2) — displayed in the overview panel.
export const HSEC_SCORING=[
 {id:'lighting',name:'Iluminación',color:'#B891FF',max:25},
 {id:'fire',name:'Protección contra incendios',color:'#FF9B51',max:25},
 {id:'roads',name:'Vialidad',color:'#2CDCF1',max:20},
 {id:'protection',name:'Protección y delimitación',color:'#FF756C',max:20},
 {id:'signage',name:'Señalética',color:'#40E4A3',max:10}
];

// Builder category tabs — keep original asset categories for the construction catalog.
export const HSEC_CATEGORIES=[
 {id:'infrastructure',name:'Infraestructura operativa',color:'#FFC83D',max:15},
 {id:'equipment',name:'Equipos de perforación',color:'#E8A040',max:0},
 {id:'vehicles',name:'Vehículos y maquinaria',color:'#5B9FE8',max:0},
 {id:'furniture',name:'Mobiliario de oficina',color:'#C896E8',max:0},
 {id:'mobility',name:'Movilidad y tránsito seguro',color:'#2CDCF1',max:25},
 {id:'boundaries',name:'Delimitación y control de riesgos',color:'#FF756C',max:20},
 {id:'lighting',name:'Iluminación y visibilidad',color:'#B891FF',max:15},
 {id:'emergencies',name:'Señalización y emergencias',color:'#40E4A3',max:10},
 {id:'management',name:'Inspecciones y mantenimiento',color:'#FF9B51',max:15}
];
export function hsecSymbol(category,cls='uiIcon hsecIcon',white=true){
 const c=ICON_SHAPES[category];if(!c)return '';
 return `<svg class="${cls}" data-hsec-icon="${category}" data-icon-version="5" viewBox="0 0 32 32" fill="none" stroke="${white?'#F8FBFF':c.color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c.shape}</svg>`;
}
export const hsecIcon=(category,white=false)=>hsecSymbol(category,'uiIcon hsecIcon',white);
