// V68 · Cinematic character selector UI. Read-only presentation of AVATARS.bonuses.
// No game-state writes, no new skill effects, no generated avatar art.
import {icon} from './icons.mjs';

const DOMAINS=[
 {id:'contract',label:'CONTRATOS',symbol:'wallet',keys:['contractIncome']},
 {id:'maintenance',label:'MANTENIMIENTO',symbol:'wrench',keys:['maintenanceCost','maintenanceTime']},
 {id:'geology',label:'GEOLOGÍA',symbol:'geology',keys:['geologyCost']},
 {id:'construction',label:'CONSTRUCCIÓN',symbol:'build',keys:['constructionTime']}
];
const FACTS={
 contractIncome:{title:'NEGOCIACIÓN DE CONTRATOS',text:value=>`Ingresos por contrato ${percent(value)}. Bonificación real de esta especialidad.`},
 maintenanceCost:{title:'MANTENIMIENTO EFICIENTE',text:value=>`Costo de mantenimiento ${percent(value)}.`},
 maintenanceTime:{title:'SERVICIO MÁS RÁPIDO',text:value=>`Tiempo de mantenimiento ${percent(value)}.`},
 geologyCost:{title:'ANÁLISIS GEOLÓGICO',text:value=>`Costo del análisis geológico ${percent(value)}.`},
 constructionTime:{title:'CONSTRUCCIÓN EFICIENTE',text:value=>`Tiempo de construcción ${percent(value)}.`}
};
const percent=n=>`${n>0?'+':''}${Math.round(Number(n||0)*100)}%`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export class CinematicCharacterSelector{
 constructor(screen,{onInteraction=()=>{}}={}){
  this.screen=screen;this.onInteraction=onInteraction;
  this.skill='contract';
  const identity=screen.querySelector('.characterIdentity');
  const label=identity.querySelector('label[for="playerNameInput"]');
  const name=identity.querySelector('#playerNameInput');
  const help=identity.querySelector('small[data-i18n="nameHelp"]');
  const title=identity.querySelector('#avatarTitle'),detail=identity.querySelector('#avatarDetail');
  const start=identity.querySelector('#startAdventure');
  if(!identity||!label||!name||!title||!start)throw Error('Selector base incompleto');

  const head=document.createElement('div');
  head.className='v68HeroDetails';
  head.append(title,detail);
  const nameRow=document.createElement('div');
  nameRow.className='v68Name';
  nameRow.append(label,name);
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

  // Keep real imported GLB thumbnails in existing 4 selectable buttons.
  this.rail.addEventListener('click',event=>{
   const button=event.target.closest('[data-v68-skill]');
   if(!button)return;
   this.skill=button.dataset.v68Skill;
   this.renderSkills();
   this.onInteraction('skill');
  });
 }
 update({avatar,label,description,figure}){
  if(!avatar)return;
  if(this.currentId!==avatar.id){
   this.currentId=avatar.id;
   this.bonuses=avatar.bonuses||{};
   this.skill=DOMAINS.find(domain=>domain.keys.some(k=>Number(this.bonuses[k])!==0))?.id||'contract';
   this.identity.dataset.avatar=avatar.id;
   this.screen.dataset.avatar=avatar.id;
   this.figureArt.innerHTML=figure||'<span class="v68FigureFallback">MODELO 3D</span>';
   this.figureArt.querySelector('img')?.setAttribute('loading','eager');
   this.figureArt.querySelector('img')?.setAttribute('draggable','false');
  }
  this.stats.innerHTML=DOMAINS.map(domain=>{
   const values=domain.keys.map(key=>Number(this.bonuses[key])||0).filter(Boolean);
   const active=values.some(v=>Math.abs(v)>.00001);
   const strongest=Math.max(0,...values.map(v=>Math.abs(v)));
   const segments=Math.min(5,Math.round(strongest*100));
   const val=active?values.map(percent).join(' / '):'—';
   return `<div class="v68Stat ${active?'hasBonus':''}"><span class="v68StatName">${esc(domain.label)}</span><span class="v68StatBars" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<segments?'lit':''}"></i>`).join('')}</span><b>${esc(val)}</b></div>`;
  }).join('');
  this.renderSkills();
 }
 renderSkills(){
  const domains=DOMAINS;
  this.rail.innerHTML=domains.map(domain=>{
   const hasBonus=domain.keys.some(k=>Number(this.bonuses?.[k])!==0);
   return `<button type="button" data-v68-skill="${domain.id}" class="${this.skill===domain.id?'active':''} ${hasBonus?'unlocked':'neutral'}" title="${domain.label}" aria-label="Ver ${domain.label.toLowerCase()}" aria-pressed="${this.skill===domain.id?'true':'false'}">${icon(domain.symbol)}</button>`;
  }).join('');
  const domain=domains.find(d=>d.id===this.skill)||domains[0];
  const items=domain.keys.map(key=>({key,value:Number(this.bonuses?.[key])||0})).filter(i=>i.value!==0);
  if(!items.length){
   this.explanation.innerHTML=`<span class="v68SkillKicker">PERFIL DEL OPERADOR</span><h3>${esc(domain.label)}</h3><p>Este personaje no tiene una bonificación adicional en esta área.</p>`;
  }else{
   const heading=items.length>1?'ESPECIALIDAD OPERATIVA':FACTS[items[0].key].title;
   this.explanation.innerHTML=`<span class="v68SkillKicker">VENTAJA REAL EN EL JUEGO</span><h3>${esc(heading)}</h3>${items.map(item=>`<p>${esc(FACTS[item.key].text(item.value))}</p>`).join('')}`;
  }
 }
}
