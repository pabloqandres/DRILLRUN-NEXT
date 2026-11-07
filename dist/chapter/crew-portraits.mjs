// Original character portraits for DRILL RUN's fictitious hired personnel.
// These are authored vector assets, not substituted photos or outside brands.
// The in-world 3D NPCs remain a distinct modeling/integration workstream.
const LOOKS={
 admin:{skin:'#c99a78',shadow:'#9f654c',hair:'#302c2b',vest:'#d87534',shirt:'#34485b',accent:'#f1c16e',brows:'soft'},
 driller:{skin:'#9a674c',shadow:'#754535',hair:'#181f27',vest:'#d57b30',shirt:'#244154',accent:'#f3cc6a',brows:'strong'},
 helper:{skin:'#d8ae89',shadow:'#a67556',hair:'#50372b',vest:'#e3842e',shirt:'#4c5666',accent:'#efcf71',brows:'soft'},
 hsec:{skin:'#ae8568',shadow:'#75543c',hair:'#26282b',vest:'#e27d2f',shirt:'#314a5b',accent:'#a0edcf',brows:'strong'},
 techVisit:{skin:'#e4c8a7',shadow:'#ad8668',hair:'#3b3030',vest:'#dc7c35',shirt:'#435365',accent:'#92c5ed',brows:'soft'},
 tecnicoDrillco:{skin:'#c39879',shadow:'#8d654d',hair:'#252632',vest:'#bd6d30',shirt:'#263c4b',accent:'#f4d16b',brows:'strong'}
};
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
export function crewPortrait(role='helper',id=''){
 const p=LOOKS[role]||LOOKS.helper;
 const seed=hash(id||role),n=seed%5,face=n===0?2:n===1?-1:0,eyes=n===2?1.6:0,chin=n===4?2:0;
 const bg=['#1c4153','#34495b','#294c51','#364c58','#283c50'][n];
 const hair=n%2?'<path d="M26 47q-3-26 14-29 21-2 20 27l-5-10-6-7-17 7z" fill="'+p.hair+'"/>':'<path d="M26 41q-2-18 12-23 19-3 22 23l-7-11-22 5z" fill="'+p.hair+'"/>';
 return `<svg class="crewPortraitSvg" viewBox="0 0 80 94" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Retrato ilustrado de personal de faena">
 <rect width="80" height="94" rx="11" fill="${bg}"/>
 <path d="M0 78L80 35V94H0Z" fill="#103144" opacity=".65"/>
 <path d="M9 94q3-30 23-34h17q20 5 22 34z" fill="${p.shirt}"/>
 <path d="M14 94q2-23 17-30l8 9 8-9q15 6 19 30z" fill="${p.vest}"/>
 <path d="M24 68L30 65 39 77 48 65 54 68 43 91 36 91Z" fill="#f2f2cf" opacity=".9"/>
 <path d="M14 84h19l3 5H14zm33 0h20v5H45Z" fill="#eff5cb" opacity=".84"/>
 <path d="M33 62h15v11l-7 5-8-5z" fill="${p.shadow}"/>
 ${hair}
 <path d="M26 ${38+face}q0-15 14-16 15 0 15 16v12q-2 14-15 16-14-3-14-17Z" fill="${p.skin}"/>
 <path d="M25 43q-4-1-4 5t5 6m29-11q4-1 4 5t-5 6" fill="${p.skin}"/>
 <path d="M30 42q4-3 9-1M44 41q5-2 9 1" fill="none" stroke="${p.hair}" stroke-width="${p.brows==='strong'?2.5:1.6}" stroke-linecap="round"/>
 <path d="M33 47h5m10 0h5" stroke="#182836" stroke-width="2" stroke-linecap="round"/>
 <circle cx="${35+eyes*.2}" cy="47" r=".8" fill="#fff" opacity=".8"/>
 <circle cx="49" cy="47" r=".8" fill="#fff" opacity=".8"/>
 <path d="M41 47l-1 8 3 1" fill="none" stroke="${p.shadow}" stroke-width="1.5" stroke-linecap="round"/>
 <path d="M36 59q5 ${2+chin} 10 0" stroke="${p.shadow}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
 <path d="M22 31q0-15 18-18 19 0 19 18l5 5-2 6H19l-3-6Z" fill="#f3f5ed" stroke="#a8bac1" stroke-width="1.4"/>
 <path d="M23 29h34l3 7H21Z" fill="#dce7e4"/>
 <path d="M18 35h44l2 6H16Z" fill="#f7faf2" stroke="#b2c4c6" stroke-width="1"/>
 <rect x="37" y="17" width="7" height="13" rx="2" fill="${p.accent}" opacity=".85"/>
 <path d="M26 74l6 7M54 74l-6 7" stroke="#f8eece" stroke-width="1.5" opacity=".9"/>
 <path d="M5 86h7m55 0h8" stroke="#82c2c7" stroke-width="1.8" opacity=".5"/>
 </svg>`;
}
