// Original cel-shaded personnel portraits for narrative phone contacts.
// No third-party marks, external images or asset downloads.
const portraits={
 'avatar-benefactor':{
  base:'#d1a66c',jacket:'#6c2940',shirt:'#f0dec2',hair:'#432b29',
  face:'<path d="M19 28Q15 11 29 9Q48 8 47 28L44 40H20Z" fill="#432b29"/><ellipse cx="32" cy="30" rx="13" ry="16" fill="#e2b489"/><path d="M20 26Q23 12 35 15Q39 23 45 23Q40 12 29 12Q20 15 20 26" fill="#432b29"/><path d="M20 31Q16 42 20 48L24 48L23 33Z" fill="#432b29"/><path d="M44 30Q48 41 45 48L41 48L42 33Z" fill="#432b29"/>'
 },
 'avatar-safety':{
  base:'#b88462',jacket:'#d76b35',shirt:'#c4d8d3',hair:'#302c2b',
  face:'<path d="M20 27Q19 13 32 13Q46 13 44 29L43 39H21Z" fill="#302c2b"/><ellipse cx="32" cy="31" rx="12" ry="15" fill="#c98f6b"/><path d="M20 19Q21 9 32 9Q44 9 44 19L48 21V24H16V21Z" fill="#eee7d6" stroke="#778c90" stroke-width="1"/><path d="M25 9V16M39 9V16" stroke="#cbd0ca" stroke-width="1.6"/><path d="M24 40Q32 45 40 40Q37 49 32 49Q27 49 24 40" fill="#4c332e" opacity=".75"/>'
 },
 'avatar-contract':{
  base:'#be8d72',jacket:'#284e69',shirt:'#f2e1d7',hair:'#252733',
  face:'<path d="M18 31Q17 9 32 8Q50 11 46 33L45 45H19Z" fill="#252733"/><ellipse cx="32" cy="30" rx="13" ry="16" fill="#d9a182"/><path d="M18 25Q24 9 44 20Q37 20 31 17Q28 24 18 28" fill="#252733"/><path d="M19 31L16 45L23 48L22 31M45 31L48 45L41 48L42 31" fill="#252733"/>'
 }
};
export function narrativePortrait(avatarId){
 const p=portraits[avatarId]||portraits['avatar-benefactor'];
 return `<svg viewBox="0 0 64 64" role="img" aria-label="Retrato ilustrado del remitente" xmlns="http://www.w3.org/2000/svg">
 <defs><clipPath id="portraitClip"><circle cx="32" cy="32" r="31"/></clipPath></defs>
 <g clip-path="url(#portraitClip)">
 <rect width="64" height="64" fill="#26495c"/>
 <circle cx="48" cy="15" r="27" fill="#567e8a" opacity=".25"/>
 <path d="M5 66Q10 47 25 47L39 47Q54 47 60 66Z" fill="${p.jacket}"/>
 <path d="M24 48L32 61L40 48Z" fill="${p.shirt}"/>
 <rect x="29" y="40" width="6" height="10" rx="2" fill="${p.base}"/>
 ${p.face}
 <path d="M24 30L29 30M35 30L40 30" stroke="#3a2d2c" stroke-width="1.6" stroke-linecap="round"/>
 <path d="M31.5 31L30.4 37L33 37" stroke="#986d57" stroke-width="1" fill="none"/>
 <path d="M28 41Q32 43.5 36 41" stroke="#8f514a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
 </g><circle cx="32" cy="32" r="30.7" fill="none" stroke="#c3dce4" stroke-width="1.2"/></svg>`;
}
