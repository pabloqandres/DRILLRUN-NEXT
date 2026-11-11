// V69 · Cinematic selector presentation. All gameplay bonuses remain in
// AVATARS[].bonuses. The two visible stats per skill are future-facing
// PRESENTATION attributes: they do not modify missions, economy or saves.
import {icon} from './icons.mjs';

const DOMAINS=[
 {id:'contract',label:'CONTRATOS',symbol:'wallet',keys:['contractIncome'],
  stats:[{name:'NEGOCIACIÓN',base:3,boost:true},{name:'GESTIÓN',base:2}]},
 {id:'maintenance',label:'MANTENIMIENTO',symbol:'wrench',keys:['maintenanceCost','maintenanceTime'],
  stats:[{name:'TÉCNICA',base:3,boost:true},{name:'EFICIENCIA',base:2}]},
 {id:'geology',label:'GEOLOGÍA',symbol:'geology',keys:['geologyCost'],
  stats:[{name:'ANÁLISIS',base:3,boost:true},{name:'PRECISIÓN',base:2}]},
 {id:'construction',label:'CONSTRUCCIÓN',symbol:'build',keys:['constructionTime'],
  stats:[{name:'PLANIFICACIÓN',base:3,boost:true},{name:'EJECUCIÓN',base:2}]}
];
const MESSAGES={
 contract:'Mejores ingresos cuando completas contratos.',
 maintenance:'Menor costo y tiempo de mantenimiento.',
 geology:'Menor costo de análisis geológico.',
 construction:'Menos tiempo para desarrollar construcciones.'
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Number(undefined) is NaN; checking it with !==0 formerly selected *every*
// category as boosted. Normalize missing values to zero before comparison.
export const hasActualBonus=(bonuses,domain)=>domain.keys.some(k=>Math.abs(Number(bonuses?.[k])||0)>1e-7);
export const starterSkillLevel=(stat,boosted=false)=>Math.min(5,Math.max(0,stat.base+(boosted&&stat.boost?1:0)));
const pips=(count,cls='')=>Array.from({length:5},(_,i)=>`<i class="${i<count?'lit':''} ${i===count-1&&cls==='bonus'?'bonusPip':''}"></i>`).join('');

export class CinematicCharacterSelector{
 constructor(screen,{onInteraction=()=>{}}={}){
  this.screen=screen;this.onInteraction=onInteraction;
  this.skill='contract';
  const identity=screen.querySelector('.characterIdentity');
  if(!identity)throw Error('Selector base incompleto');
  const label=identity.querySelector('label[for="playerNameInput"]');
  const name=identity.querySelector('#playerNameInput');
  const help=identity.querySelector('small[data-i18n="nameHelp"]');
  const title=identity.querySelector('#avatarTitle'),detail=identity.querySelector('#avatarDetail');
  const start=identity.querySelector('#startAdventure');
  if(!label||!name||!title||!start)throw Error('Selector base incompleto');

  const head=document.createElement('div');head.className='v68HeroDetails';head.append(title,detail);
  const nameRow=document.createElement('div');nameRow.className='v68Name';nameRow.append(label,name);
  if(help)nameRow.append(help);
  this.stats=document.createElement('div');this.stats.className='v68Stats';
  const skills=document.createElement('div');skills.className='v68Skills';
  this.rail=document.createElement('div');this.rail.className='v68SkillRail';
  this.explanation=document.createElement('section');this.explanation.className='v68SkillCard';
  this.explanation.setAttribute('aria-live','polite');
  skills.append(this.rail,this.explanation);
  identity.prepend(head,nameRow,this.stats,skills);
  identity.append(start);

  this.figure=document.createElement('div');this.figure.className='v68Figure';
  this.figure.innerHTML='<div class="v68FigureLabel">MODELO REAL EN EL JUEGO <b>3D</b></div><div class="v68FigureArt" aria-hidden="true"></div>';
  screen.append(this.figure);
  this.figureArt=this.figure.querySelector('.v68FigureArt');
  screen.dataset.selectorV68='true';
  this.identity=identity;

  this.rail.addEventListener('click',event=>{
   const button=event.target.closest('[data-v68-skill]');
   if(!button)return;
   this.skill=button.dataset.v68Skill;
   this.renderSkills();
   this.onInteraction('skill');
  });
 }
 update({avatar,figure}){
  if(!avatar)return;
  if(this.currentId!==avatar.id){
   this.currentId=avatar.id;
   this.bonuses=avatar.bonuses||{};
   // Open the actual specialty automatically on character change.
   this.skill=DOMAINS.find(domain=>hasActualBonus(this.bonuses,domain))?.id||'contract';
   this.identity.dataset.avatar=avatar.id;
   this.screen.dataset.avatar=avatar.id;
   this.figureArt.innerHTML=figure||'<span class="v68FigureFallback">MODELO 3D</span>';
   this.figureArt.querySelector('img')?.setAttribute('loading','eager');
   this.figureArt.querySelector('img')?.setAttribute('draggable','false');
  }
  // Four overview skills: baseline 3/5; the ONE gameplay specialty gets
  // exactly one extra golden square. No confusing +/-4% sign labels.
  this.stats.innerHTML=DOMAINS.map(domain=>{
   const boosted=hasActualBonus(this.bonuses,domain);
   const level=boosted?4:3;
   return `<div class="v68Stat ${boosted?'hasBonus':''}"><span class="v68StatName">${esc(domain.label)}</span><span class="v68StatBars" aria-label="${level} de 5">${pips(level,boosted?'bonus':'')}</span><b>${boosted?'★':'·'}</b></div>`;
  }).join('');
  this.renderSkills();
 }
 renderSkills(){
  this.rail.innerHTML=DOMAINS.map(domain=>{
   const bonus=hasActualBonus(this.bonuses,domain);
   const active=this.skill===domain.id;
   return `<button type="button" data-v68-skill="${domain.id}" class="${active?'active':''} ${bonus?'unlocked':'neutral'}" title="${domain.label}" aria-label="Ver ${domain.label.toLowerCase()}" aria-pressed="${active?'true':'false'}">${icon(domain.symbol)}</button>`;
  }).join('');
  const domain=DOMAINS.find(d=>d.id===this.skill)||DOMAINS[0];
  const bonus=hasActualBonus(this.bonuses,domain);
  const caption=bonus?MESSAGES[domain.id]:'Área del perfil que podrás desarrollar más adelante.';
  this.explanation.innerHTML=`<span class="v68SkillKicker">${bonus?'FORTALEZA DEL PERSONAJE':'ATRIBUTOS INICIALES'}</span><h3>${esc(domain.label)}</h3><p class="v69SkillDescription">${esc(caption)}</p><div class="v69SkillMetrics">${domain.stats.map(stat=>{
   const value=starterSkillLevel(stat,bonus);
   const upgraded=bonus&&stat.boost;
   return `<div class="v69SkillMetric"><span>${esc(stat.name)}</span><span class="v69Pips" aria-label="${value} de 5">${pips(value,upgraded?'bonus':'')}</span></div>`;
  }).join('')}</div>`;
 }
}
