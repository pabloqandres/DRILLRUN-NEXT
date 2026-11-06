import {hsecSymbol} from '../hsec/icons.mjs';
const paths={time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 wrench:'<path d="M14.7 3.3a6 6 0 0 0-7.4 8.4L3 16a2 2 0 0 0 0 3l2 2a2 2 0 0 0 3 0l4.3-4.3a6 6 0 0 0 8.4-7.4l-3.5 3.5-2.8-2.8 3.3-3.7Z"/>',
 geology:'<path d="m3 18 5-12 7-3 6 15-6 3H7l-4-3Zm5-12 4 7 3-10m-3 10 9 5M3 18l9-5 3 8"/>',

 build:'<path d="M14.7 6.3a4.5 4.5 0 0 0-5.4 5.4l-5.5 5.5a1.5 1.5 0 0 0 2.1 2.1l5.5-5.5a4.5 4.5 0 0 0 5.4-5.4L14.5 10.7 13.3 9.5Z"/><path d="m18 2 2 2-3 3m-2-2 3-3"/>',
 camp:'<path d="M2 21h20M4 21V10h16v11M4 10l8-7 8 7M9 21v-7h6v7m-3-7v7m5-5h2m-2 3h2M3 15h2m-2 3h2"/>',
 machine:'<path d="M7 21H3V14l3-5h8l3 5v7h-4m-2 0v-5h4v5m-4-5h4M14 9V4h6v5M3 14h14m1-5 3 5m-6-4h5"/>',

 player:'<path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M8 6h8M9 4a3 3 0 0 1 6 0"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 6h4m-2 11h.01"/>',
 wallet:'<path d="M20 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9H6a2 2 0 0 1 0-4h14"/><circle cx="16" cy="14" r="1.5"/>',
 energy:'<path d="M13 3 5 13h7l-1 8 10-12h-7l1-6Z"/>',
 boost:'<path d="m5 6 6 6-6 6m8-12 6 6-6 6"/>',
 messages:'<path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1Z"/>',
 bank:'<path d="M3 9h18M4 9V21m4-12v12m4-12v12m4-12v12m4-12v12M12 3 2 9h20L12 3ZM3 21h18"/>',
 store:'<path d="M3 6h18l-1.5 7H4.5L3 6Zm0 0V4h18v2M6 13v8h12v-8m-7 0v8m-5 0h12M6 17h12"/>',
 inventory:'<path d="M2 8l10-5 10 5v10l-10 5L2 18V8Zm10-5v15m-10-5 10-5 10 5m-15-7.5 10 5"/>',
 objectives:'<rect x="6" y="3" width="13" height="18" rx="2"/><path d="M9 3v3h7V3M9 12l2 2 4-5m-6 7h5"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>',
 desk:'<path d="M2 8h20v4H2zm2 4v8m16-8v8M7 12v4h10v-4m-8 8h6"/>',
 chair:'<path d="M8 4h8v8H8zm-2 8h12v4H6zm6 4v5m-4 1h8M5 10v4m14-4v4"/>',
 computer:'<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8m-4-5v5M5 7h9m-9 3h6"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 back:'<path d="m15 6-6 6 6 6"/>',
 check:'<path d="m4 13 5 5L20 6"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 3v3"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-6.5a1.5 1.5 0 0 1 3 0V12m0-5.5a1.5 1.5 0 0 1 3 0V12m0-2a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.2-2.3L4.5 16A1.5 1.5 0 0 1 7 15l1 1"/>',
 rotate:'<path d="M4 10a8 8 0 1 1 .6 5M4 4v6h6"/>',
 camera:'<path d="M2 9a2 2 0 0 1 2-2h1.5l2-3h9l2 3H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z"/><circle cx="12" cy="14" r="3"/>',
 location:'<path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"/><circle cx="12" cy="9" r="2.5"/>',
 star:'<path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.8L12 18l-6.3 3 1.2-6.8-5-4.9 7-1L12 2Z"/>',
 leaf:'<path d="M21 3C10 3 3 10 6 17s15 2 15-14ZM3 21l13-11"/>',
 rock:'<path d="M7 4h7l5 7-3 9H8L3 11l4-7Zm5-1 4 8-2 9M7 4 5 12l5 8m2-16-3 8 2 8"/>',
 metal:'<path d="M3 6h18v3H3zm0 0v3h5v6H3v3h18v-3h-5V9h5V6"/><path d="M8 9h8v6H8z"/>',
 bell:'<path d="M6 17h12l-2-4V9a4 4 0 0 0-8 0v4l-2 4Zm4 3a2 2 0 0 0 4 0m-2-17v2"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 light:'<path d="M9 18a3 3 0 0 0 6 0M9 18h6m-5-3a5 5 0 0 1-2-4 5 5 0 0 1 10 0 5 5 0 0 1-2 4m-6 0h6"/><path d="M12 2v2m-7 2 1.4 1.4M3 12H2m20 0h-1m-1.4-6L18.2 7.4"/>',
 storage:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M4 8h16M4 14h16m-9-8v6m0 2v6m-5-3h4m4 0h4m-8-8h4"/>',
 decoration:'<path d="M12 21V9m0 0C12 4 7 3 5 6c2 0 4 1 7 3Zm0 0c0-5 5-6 7-3-2 0-4 1-7 3ZM9 22h6m-3-5c-3 0-5-2-5-5h10c0 3-2 5-5 5Z"/>',
 finishes:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18m6-18v18"/>',
 google:'<path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5Z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.6-2.3l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" stroke="none"/><path d="M6.5 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 9l3.4-2.6Z" fill="#FBBC05" stroke="none"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A10 10 0 0 0 3.1 7.6l3.4 2.6C7.3 7.7 9.4 5.9 12 5.9Z" fill="#EA4335" stroke="none"/>',
};
export function icon(name,cls=''){if(name?.startsWith('hsec:'))return hsecSymbol(name.slice(5),'uiIcon hsecIcon '+cls,true);return `<svg class="uiIcon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.inventory}</svg>`;}
export function workerAvatar(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#283e48" d="M3 64c0-18 12-25 29-25s29 7 29 25"/><path fill="#ef8b3e" d="m16 44 9-4 7 9 7-9 9 4 4 20H12Z"/><path stroke="#e1e2d6" stroke-width="4" d="M19 45v19m26-19v19M14 57h36"/><path fill="#bd8c68" d="M22 25h20v12c-1 7-6 11-10 11s-9-4-10-11Z"/><path fill="#6d5544" d="M22 25h20v6H22Z"/><path fill="#eae7d9" d="M16 27C16 9 22 5 32 5s16 4 16 22Z"/><path stroke="#b9bdb4" stroke-width="3" d="M26 8v17m12-17v17"/><path fill="#fff8e7" d="M12 24h40v6H12Z"/><path fill="#607c80" d="M21 31h10v5H21zm12 0h10v5H33Z"/><path stroke="#6a7776" stroke-width="2" d="M31 33h2"/></svg>';}
// Character avatars — colored circle + role icon for narrative system
const CHAR_AVATARS={
 'avatar-benefactor':{color:'#f6c56d',bg:'#3d3221',icon:'<path d="M8 4h8l1 3H7l1-3Zm-1 3v2h10V7ZM6 11h12v3H6z"/><rect x="5" y="14" width="14" height="6" rx="1"/><path d="M9 14v6m6-6v6"/>'},
 'avatar-safety':{color:'#8bd9cf',bg:'#1e3533',icon:'<path d="M5 13a7 7 0 0 1 14 0v2a7 7 0 0 1-14 0v-2Z"/><path d="M5 11c0-5 3.1-8 7-8s7 3 7 8"/><path d="M3 13h18"/><path d="M12 13v5"/>'},
 'avatar-contract':{color:'#e8a87c',bg:'#3a2a20',icon:'<rect x="6" y="3" width="12" height="17" rx="1.5"/><path d="M9 7h6m-6 3h6m-6 3h4"/><path d="M6 3h3v3H6z"/>'},
};
export function characterAvatar(charId){
 const a=CHAR_AVATARS[charId];if(!a)return icon('messages');
 return `<svg class="charAvatar" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${a.bg}" stroke="${a.color}" stroke-width="1.2"/><g transform="translate(0,0)" stroke="${a.color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none">${a.icon}</g></svg>`;
}
