// Narrative UI — phone conversation rendering and typing animation
import {CHARACTERS,activeCharacters,characterConversation,characterUnread,narrativeUnread} from './narrative.mjs';
import {narrativePortrait} from '../assets/narrative-portraits.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Same player-name interpolation for inbox previews, toast notifications,
// mission conversation bubbles and animated text (M1 through M5).
export function resolveNarrativeText(text,playerName){
 const name=String(playerName||'').trim()||'Operador';
 return String(text??'').replace(/\\n/g,'\n').replace(/\{name\}/g,name);
}

// ─── Contact list (messages home screen) ────────────────

export function renderContactList(s,t,icon){
 const chars=activeCharacters(s);
 if(!chars.length)return `<div class="emptyState">${icon('messages')}<p>${esc(t('narr_newMessage')||'Sin mensajes')}</p></div>`;
 let html=`<div class="sectionHeading">${esc(t('narr_conversations'))}<span>${narrativeUnread(s)||''}</span></div>`;
 for(const ch of chars){
  const unread=characterUnread(s,ch.id);
  const preview=resolveNarrativeText(t(ch.lastBodyKey)||'',s.playerName);
  const previewShort=preview.replace(/\s+/g,' ').slice(0,60);
  html+=`<button class="narrativeContactCard" data-narrative-char="${ch.id}">
   <span class="narrativeAvatar" style="--char-color:${ch.color};--char-bg:${CHARACTERS[ch.id]?.color||'#888'}55">${narrativePortrait(ch.avatarIcon)}</span>
   <span class="narrativeContactInfo">
    <b>${esc(t(ch.nameKey))}</b>
    <small>${esc(t(ch.roleKey)||'')}</small>
    <em>${esc(previewShort)}${preview.length>60?'…':''}</em>
   </span>
   ${unread?`<i class="unreadDot">${unread}</i>`:`<span class="readCheck">${icon('check')}</span>`}
  </button>`;
 }
 return html;
}

// ─── Conversation thread ────────────────────────────────

export function renderConversation(s,charId,t,icon,playerName){
 const ch=CHARACTERS[charId];
 if(!ch)return '';
 const msgs=characterConversation(s,charId);
 let html=`<div class="conversationHeader">
  <span class="narrativeAvatar" style="--char-color:${ch.color};--char-bg:${ch.color}55">${narrativePortrait(ch.avatarIcon)}</span>
  <span><b>${esc(t(ch.nameKey))}</b><small>${esc(t(ch.roleKey)||'')}</small></span>
 </div><div class="messageThread">`;

 for(let i=0;i<msgs.length;i++){
  const m=msgs[i];
  const body=t(m.bodyKey)||m.bodyKey;
  const resolved=resolveNarrativeText(body,playerName);
  const isLast=i===msgs.length-1;
  const isUnread=!m.readAt;
  const needsTyping=isLast&&isUnread;

  html+=`<div class="narrativeBubble${needsTyping?' narrativeTypingTarget':''}" data-msg-id="${esc(m.id)}">
   <div class="narrativeBubbleSender">
    <span class="narrativeAvatar narrativeBubbleAvatar" style="--char-color:${ch.color};--char-bg:${ch.color}33">${narrativePortrait(ch.avatarIcon)}</span>
    <span class="narrativeSenderIdentity"><b>${esc(t(ch.nameKey))}</b><small>${esc(t(ch.roleKey)||'')}</small></span>
   </div>
   <div class="narrativeBody">${needsTyping?'':formatBody(resolved)}</div>
   <span class="readState">${icon('check')} ${m.readAt?timeStr(m.readAt):''}</span>`;

  // Action buttons (shown after text is complete)
  if(m.actions?.length&&!m.actionTaken){
   const hidden=needsTyping?' hidden':'';
   for(const act of m.actions){
    const label=t(act.labelKey)||act.labelKey;
    if(act.type==='accept')
     html+=`<button class="narrativeAction${hidden}" data-narrative-accept="${m.missionId}">${icon('arrow')} ${esc(label)}</button>`;
    else if(act.type==='collect')
     html+=`<button class="narrativeAction${hidden}" data-narrative-collect="${m.missionId}">${icon('star')} ${esc(label)}</button>`;
   }
  }else if(m.actionTaken){
   const doneLabel=m.actionTaken==='accept'?'Aceptado':'Completado';
   html+=`<span class="narrativeActionDone">${icon('check')} ${doneLabel}</span>`;
  }

  html+=`</div>`;
 }
 html+=`</div>`;
 return html;
}

function formatBody(text){
 return text.split('\n').filter(l=>l.trim()).map(p=>`<p>${esc(p)}</p>`).join('');
}

function timeStr(ts){
 if(!ts)return '';
 const d=new Date(ts);
 return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}

// ─── Typing animation controller ────────────────────────

export class NarrativeTyping{
 constructor(container,fullText,onComplete){
  this.container=container;
  this.fullText=String(fullText);
  this.characters=Array.from(this.fullText);
  this.charIndex=0;
  this.done=false;
  this.onComplete=onComplete;
  this.speed=22;
  this.startedAt=0;
  this._tick=this._tick.bind(this);
  this._skipHandler=e=>{
   // A real tap on the message reveals all text; other controls keep working.
   if(e.target.closest('.narrativeAction'))return;
   this.skip();
  };
  this.container.classList.add('narrativeTyping');
  this.phoneContent=this.container.closest('#phoneContent');
  this.phoneContent?.addEventListener('pointerdown',this._skipHandler);
  this.raf=requestAnimationFrame(this._tick);
 }
 _tick(now){
  if(this.done)return;
  if(!this.startedAt)this.startedAt=now;
  const next=Math.min(this.characters.length,Math.floor((now-this.startedAt)/this.speed)+1);
  if(next!==this.charIndex){
   this.charIndex=next;
   this.container.innerHTML=formatBody(this.characters.slice(0,next).join(''));
  }
  if(next>=this.characters.length){this._finish();return;}
  this.raf=requestAnimationFrame(this._tick);
 }
 skip(){
  if(this.done)return;
  this.charIndex=this.characters.length;
  this._finish();
 }
 _finish(){
  if(this.done)return;
  this.done=true;
  cancelAnimationFrame(this.raf);
  this.phoneContent?.removeEventListener('pointerdown',this._skipHandler);
  this.container.classList.remove('narrativeTyping');
  this.container.innerHTML=formatBody(this.fullText);
  const bubble=this.container.closest('.narrativeBubble');
  bubble?.querySelectorAll('.narrativeAction.hidden').forEach(b=>b.classList.remove('hidden'));
  this.onComplete?.();
 }
 dispose(){
  if(this.done)return;
  this.done=true;
  cancelAnimationFrame(this.raf);
  this.phoneContent?.removeEventListener('pointerdown',this._skipHandler);
 }
}
