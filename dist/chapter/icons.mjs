import {hsecSymbol} from '../hsec/icons.mjs';
// DRILL RUN visual iconography V3: one consistent 24px, rounded-line pictogram set.
// Keep all keys, signatures and semantics. No third-party font/assets or scripts.
const paths={
 "interact-focus":'<path d="M12 3.3v3.2m0 11v3.2M3.3 12h3.2m11 0h3.2"/><path d="M7 7a7 7 0 0 1 10 0m0 10a7 7 0 0 1-10 0"/><circle cx="12" cy="12" r="3.1"/><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none"/>',
 // Unified five-item gameplay dock icon set (24px rounded-line)
 "dock-package":'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/>',
 "dock-clipboard":'<rect x="5.5" y="4" width="13" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
 "dock-hard-hat":'<path d="M4 14v-2a8 8 0 0 1 16 0v2M3 14h18v3H3zM9 5V3m6 2V3M8 20h8"/>',
 "dock-users":'<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 "dock-gauge":'<path d="M3.3 17a9 9 0 1 1 17.4 0"/><path d="M12 17l4.5-6.5"/><circle cx="12" cy="17" r="1.5"/><path d="M6.2 15.1 5 14m2.7-5.5L6.6 7.4M12 6v-2m5.5 4.5 1.1-1.1"/>',
 "dock-catalog":"<path d=\"m12 2 8.5 5-8.5 5L3.5 7 12 2Z\"/><path d=\"M3.5 7v9.5L12 22l8.5-5.5V7M12 12v10\"/><path d=\"m8 12 3 3 5-5\"/>",
 "dock-contract":"<rect x=\"5.5\" y=\"4\" width=\"13\" height=\"18\" rx=\"1.5\"/><path d=\"M9 4V2h6v2M9 10h6M9 14h6M9 18h4\"/>",
 "dock-equipment":"<path d=\"M3 18h18M5 18v-5l3-5h8l3 5v5M8 8V5.5h8V8M8 13h8M9 18v3m6-3v3\"/><path d=\"M12 2v3\"/>",
 "dock-personnel":"<circle cx=\"9\" cy=\"7\" r=\"3\"/><path d=\"M2.5 20v-2.5c0-3.5 2.7-5.5 6.5-5.5s6.5 2 6.5 5.5V20H2.5Z\"/><circle cx=\"18\" cy=\"8\" r=\"2.5\"/><path d=\"M18 13c2.4.3 3.5 1.8 3.5 4V20h-4\"/>",
 "dock-hsec":"<path d=\"M4 13.5h16M6 13.5v-2.2a6 6 0 0 1 12 0v2.2M3 14.5h18v2H3zM9 5.3V3.5M15 5.3V3.5M7 20h10\"/><path d=\"M12 6v7\"/>",
 "dock-zones":"<path d=\"M12 22s7.5-7.8 7.5-13a7.5 7.5 0 1 0-15 0C4.5 14.2 12 22 12 22Z\"/><circle cx=\"12\" cy=\"9\" r=\"2.7\"/>",
 // Dedicated intuitive driver pictograms, not status words or external fonts.
 "truck-headlamp":'<path d="M14 5.1c4.2 0 7 2.7 7 6.9s-2.8 6.9-7 6.9h-2.2V5.1H14Z"/><path d="M9 7H3m6 5H2m7 5H3"/>',
 "truck-brake":'<circle cx="12" cy="12" r="5.7"/><path d="M12 8.7v4.7m0 2v.1M4.5 5.8a9.5 9.5 0 0 0 0 12.4m15-12.4a9.5 9.5 0 0 1 0 12.4"/>',

 time:"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 6.5V12l3.5 2\"/>",
 wrench:"<path d=\"M20.2 7.5a6.5 6.5 0 0 1-8.7 7.8l-6.2 6.1a2.1 2.1 0 0 1-3-3l6.1-6.2A6.5 6.5 0 0 1 16.2 3l-4.3 4.3 3.1 3.1 5.2-2.9Z\"/>",
 geology:"<path d=\"m2 18 4-11 6-4 8 5 2 11-7 3H8l-6-4Z\"/><path d=\"m6 7 7 5 7-4m-7 4 2 10M2 18l11-6\"/>",
 build:"<path d=\"m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10\"/>",
 camp:"<path d=\"M3 10 12 3l9 7v11H3V10Z\"/><path d=\"M9 21v-8h6v8m-9-8h.01m12 0h.01\"/><path d=\"M2 10h20\"/>",
 machine:"<path d=\"M6 21h12M9 21 12 4l3 17M8 10h8M7 15h10M11 4h2M3 21v-5h4M17 16h4v5\"/><path d=\"M12 4v17\"/>",
 player:"<path d=\"M5 10a7 7 0 0 1 14 0M4 10h16M9 5v5m6-5v5\"/><circle cx=\"12\" cy=\"13.5\" r=\"3.5\"/><path d=\"M4.5 22c.9-3.2 3.2-4.9 7.5-4.9s6.6 1.7 7.5 4.9\"/>",
 phone:"<rect x=\"6.5\" y=\"2\" width=\"11\" height=\"20\" rx=\"2.6\"/><path d=\"M10 5h4M11.5 18.4h1\"/>",
 wallet:"<ellipse cx=\"9\" cy=\"5.5\" rx=\"6\" ry=\"2.5\"/><path d=\"M3 5.5v4C3 11 5.7 12 9 12c2 0 3.7-.4 4.8-1.1M3 9.5v4C3 15 5.7 16 9 16h1M3 13.5v4C3 19 5.7 20 9 20h1\"/><ellipse cx=\"16.5\" cy=\"15.5\" rx=\"5.5\" ry=\"2.5\"/><path d=\"M11 15.5v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4\"/>",
 energy:"<path d=\"m13.5 2-9 11H12l-1 9 9-12h-7l.5-8Z\"/>",
 boost:"<path d=\"m4 7 5 5-5 5m7-10 5 5-5 5m3-10 3 5-3 5\"/>",
 messages:"<path d=\"M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2Z\"/><path d=\"M8 10h8M8 14h5\"/>",
 bank:"<path d=\"m3 9 9-6 9 6H3ZM4 21h16M6 11v8m4-8v8m4-8v8m4-8v8\"/>",
 store:"<path d=\"M4 8V5h16v3m-16 0-2 5h20l-2-5H4ZM5 13v8h14v-8M9 21v-5h6v5\"/>",
 inventory:"<path d=\"m12 2 9 5v10l-9 5-9-5V7l9-5Z\"/><path d=\"m3 7 9 5 9-5M12 12v10\"/>",
 objectives:"<rect x=\"5.5\" y=\"4\" width=\"13\" height=\"17\" rx=\"2\"/><path d=\"M9 4V2h6v2M9 11l2.3 2.2L15 9M9 17h6\"/>",
 settings:"<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M9.5 3h5l.7 2.2 2 1.1 2.2-.6 2.3 4-1.7 1.7v2.2l1.7 1.7-2.3 4-2.2-.6-2 1.1-.7 2.2h-5l-.7-2.2-2-1.1-2.2.6-2.3-4L4 13.6v-2.2L2.3 9.7l2.3-4 2.2.6 2-1.1L9.5 3Z\"/>",
 desk:"<path d=\"M3 8h18v4H3V8Zm2 4v9m14-9v9M7.5 17h9m-3-5v5\"/>",
 chair:"<rect x=\"7\" y=\"3\" width=\"10\" height=\"10\" rx=\"2\"/><path d=\"M5 13h14v4H5v-4Zm7 4v4M8 22h8M6 7v5m12-5v5\"/>",
 computer:"<rect x=\"3\" y=\"3.5\" width=\"18\" height=\"12\" rx=\"1.8\"/><path d=\"M12 15.5V20m-5 1h10M7 8h10\"/>",
 close:"<path d=\"M5 5 19 19M19 5 5 19\"/>",
 back:"<path d=\"m15 5-7 7 7 7\"/>",
 check:"<path d=\"m4 12.5 5 5L20 6\"/>",
 lock:"<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"11\" rx=\"2.1\"/><path d=\"M8 10.5V7a4 4 0 0 1 8 0v3.5m-4 4v2.5\"/>",
 hand:"<path d=\"M8 12V5a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V11m0-3.5a1.5 1.5 0 0 1 3 0V12m0-2a1.5 1.5 0 0 1 3 0v5.2c0 4.1-2.7 6.8-6.8 6.8h-1.4c-2.4 0-4.3-.9-5.7-2.7L4 16a1.6 1.6 0 0 1 2.4-2.1L8 16\"/>",
 rotate:"<path d=\"M20 7v5h-5M20 12a8 8 0 1 0-2.2 5.5\"/>",
 camera:"<path d=\"M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z\"/><circle cx=\"12\" cy=\"14\" r=\"3.5\"/>",
 location:"<path d=\"M12 22s7-8 7-13a7 7 0 1 0-14 0c0 5 7 13 7 13Z\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/>",
 star:"<path d=\"m12 2.5 2.9 6.2 6.9.9-5 4.9 1.1 7-5.9-3.2-6 3.2 1.2-7-5-4.9 6.9-.9L12 2.5Z\"/>",
 leaf:"<path d=\"M21 3C10 3 4 7 4 14a7 7 0 0 0 7 7c7 0 11-7 10-18ZM4 21l13-12\"/>",
 rock:"<path d=\"m7 3 8-1 7 9-3 10H6L2 12 7 3Zm0 0 5 9 10-1M12 12l-6 9m6-9 7 9\"/>",
 metal:"<path d=\"M3 5h18v4H3V5Zm4 4v6H3v4h18v-4h-4V9M7 15h10\"/>",
 bell:"<path d=\"M6 18h12l-2-3V10a4 4 0 0 0-8 0v5l-2 3Zm4.5 3h3M12 3v2\"/>",
 arrow:"<path d=\"M4 12h16m-6-6 6 6-6 6\"/>",
 light:"<path d=\"M8 14a6 6 0 1 1 8 0l-1.5 2.2h-5L8 14ZM9 19h6m-5 3h4M12 1v2M3 12H1m22 0h-2M4.5 4.5l1.6 1.6m11.8 0 1.6-1.6\"/>",
 storage:"<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1.8\"/><path d=\"M4 10h16M4 15.5h16M9 5.5h6M9 13h6M9 18h6\"/>",
 decoration:"<path d=\"M12 22v-12M12 10C8 10 6 8 6 4c4 0 6 2 6 6Zm0 0c0-4 2-6 6-6 0 4-2 6-6 6ZM6 17c0 3 2 5 6 5s6-2 6-5H6Z\"/>",
 finishes:"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1.4\"/><path d=\"M3 10h18M3 16h18M10 3v7m5 6v5\"/>",
 google:"<path d=\"M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5Z\" fill=\"#4285F4\" stroke=\"none\"/><path d=\"M12 22c2.7 0 5-.9 6.6-2.3l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z\" fill=\"#34A853\" stroke=\"none\"/><path d=\"M6.5 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 9l3.4-2.6Z\" fill=\"#FBBC05\" stroke=\"none\"/><path d=\"M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A10 10 0 0 0 3.1 7.6l3.4 2.6C7.3 7.7 9.4 5.9 12 5.9Z\" fill=\"#EA4335\" stroke=\"none\"/>",
};
export function icon(name,cls=''){if(name?.startsWith('hsec:'))return hsecSymbol(name.slice(5),'uiIcon hsecIcon '+cls,true);return `<svg class="uiIcon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.inventory}</svg>`;}
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
