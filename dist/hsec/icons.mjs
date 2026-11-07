// V5 — 5 scoring categories for HSEC v2. Builder icons kept in ICON_SHAPES.
export const HSEC_ICON_VERSION=5;

// Shapes for all known category IDs (scoring + builder + legacy).
// DRILL RUN HSEC visual V3: consistent 32px construction/safety pictograms.
// Category IDs, scoring logic, colors and helper APIs remain unchanged.
const ICON_SHAPES={
 infrastructure:{color:'#FFC83D',shape:"<path d=\"M4 12 16 5l12 7v16H4V12Z\"/><path d=\"M11 28v-9h10v9M3 12h26M8 16h2m12 0h2\"/>"},
 mobility:{color:'#2CDCF1',shape:"<circle cx=\"16\" cy=\"5.5\" r=\"2.5\"/><path d=\"m16 8.5-4 7 7 3 3 9m-8-12-5 5-5 1m11-2-5 9\"/><path d=\"M3 30h26\" stroke-dasharray=\"3 4\"/>"},
 boundaries:{color:'#FF756C',shape:"<path d=\"M3 12h26v10H3zM7 22v7m18-7v7M3 29h8m10 0h8m-19-17 7 10m1-10 7 10\"/>"},
 lighting:{color:'#B891FF',shape:"<path d=\"M4 8h10v7H4zM18 8h10v7H18zM9 15l2 5h10l2-5M16 20v9m-5 0h10M5 18l-2 3m24-3 2 3\"/>"},
 emergencies:{color:'#40E4A3',shape:"<path d=\"M16 3 27 8v9c0 6-5.5 10-11 12C10.5 27 5 23 5 17V8L16 3Z\"/><path d=\"M16 10v12m-6-6h12\"/>"},
 management:{color:'#FF9B51',shape:"<rect x=\"7\" y=\"6\" width=\"18\" height=\"23\" rx=\"2\"/><path d=\"M12 6V4h8v2M11 15l3 3 6-6M11 24h10\"/>"},
 fire:{color:'#FF9B51',shape:"<rect x=\"11\" y=\"11\" width=\"11\" height=\"18\" rx=\"2\"/><path d=\"M14 11V7h6m-4-1V3m4 10h-9M10 19h13M22 16l5 2v5M15 25h3\"/>"},
 roads:{color:'#2CDCF1',shape:"<path d=\"M10 3 5 29m17-26 5 26M16 4v5m0 5v5m0 5v5\" stroke-linecap=\"round\"/>"},
 protection:{color:'#FF756C',shape:"<path d=\"M16 3 27 8v9c0 6-4.5 10-11 12C9.5 27 5 23 5 17V8L16 3Z\"/><path d=\"m10.5 16.5 3.5 3.5 7.5-8\"/>"},
 signage:{color:'#40E4A3',shape:"<path d=\"M7 5h18l4 6-4 6H7V5ZM7 5v24M12 11h11\"/>"},
 equipment:{color:'#E8A040',shape:"<path d=\"M5 29h22M14 29 16 4l3 25M11 13h10M9 20h14M13 4h6M5 23v6m22-6v6\"/><path d=\"M16 4v25\"/>"},
 vehicles:{color:'#5B9FE8',shape:"<path d=\"M4 11h16v12H4V11Zm16 5h5l4 5v2h-9m-10-12V7h5v4M9 23a3 3 0 1 0 6 0m8 0a3 3 0 1 0 6 0\"/>"},
 furniture:{color:'#C896E8',shape:"<path d=\"M4 14h24v4H4v-4Zm3 4v11m18-11v11M10 14V8h12v6M11 24h10\"/>"},
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
