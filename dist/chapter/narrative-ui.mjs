// Narrative UI — phone conversation rendering and typing animation
import {CHARACTERS,activeCharacters,characterConversation,characterUnread,narrativeUnread} from './narrative.mjs';
import {characterAvatar} from './icons.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ─── Contact list (messages home screen) ────────────────

export function renderContactList(s,t,icon){
 const chars=activeCharacters(s);
 if(!chars.length)return `<div class="emptyState">${icon('messages')}<p>${esc(t('narr_newMessage')||'Sin mensajes')}</p></div>`;
 let html=`<div class="sectionHeading">${esc(t('narr_conversations'))}<span>${narrativeUnread(s)||''}</span></div>`;
 for(const ch of chars){
  const unread=characterUnread(s,ch.id);
  const preview=t(ch.lastBodyKey)||'';
  const previewShort=preview.replace(/\{name\}/g,'').replace(/\n/g,' ').slice(0,60);
  html+=`<button class="narrativeContactCard" data-narrative-char="${ch.id}">
   <span class="narrativeAvatar" style="--char-color:${ch.color};--char-bg:${CHARACTERS[ch.id]?.color||'#888'}55">${characterAvatar(ch.avatarIcon)}</span>
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
  <span class="narrativeAvatar" style="--char-color:${ch.color};--char-bg:${ch.color}55">${characterAvatar(ch.avatarIcon)}</span>
  <span><b>${esc(t(ch.nameKey))}</b><small>${esc(t(ch.roleKey)||'')}</small></span>
 </div><div class="messageThread">`;

 for(let i=0;i<msgs.length;i++){
  const m=msgs[i];
  const body=t(m.bodyKey)||m.bodyKey;
  const resolved=body.replace(/\{name\}/g,esc(playerName||'Operador'));
  const isLast=i===msgs.length-1;
  const isUnread=!m.readAt;
  const needsTyping=isLast&&isUnread;

  html+=`<div class="narrativeBubble${needsTyping?' narrativeTypingTarget':''}" data-msg-id="${m.id}">
   <small>${esc(t(ch.nameKey))}</small>
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
 return text.split('\n').filter(l=>l.trim()).map(p=>`<p>${p}</p>`).join('');
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
  this.fullText=fullText;
  this.charIndex=0;
  this.done=false;
  this.onComplete=onComplete;
  this.speed=18; // ms per character
  this.lastTick=0;
  this.container.classList.add('narrativeTyping');
  this.raf=requestAnimationFrame(this._tick.bind(this));
  this._skipHandler=()=>this.skip();
  container.closest('#phoneContent')?.addEventListener('pointerdown',this._skipHandler,{once:true});
 }
 _tick(now){
  if(this.done)return;
  if(!this.lastTick)this.lastTick=now;
  if(now-this.lastTick<this.speed){this.raf=requestAnimationFrame(this._tick.bind(this));return;}
  this.lastTick=now;
  // Reveal multiple chars per frame for speed
  const batch=Math.max(1,Math.floor((now-this.lastTick)/this.speed)+1);
  this.charIndex=Math.min(this.charIndex+Math.max(batch,2),this.fullText.length);
  this.container.innerHTML=formatBody(this.fullText.slice(0,this.charIndex));
  if(this.charIndex>=this.fullText.length){this._finish();return;}
  this.raf=requestAnimationFrame(this._tick.bind(this));
 }
 skip(){
  if(this.done)return;
  this.charIndex=this.fullText.length;
  this._finish();
 }
 _finish(){
  this.done=true;
  cancelAnimationFrame(this.raf);
  this.container.classList.remove('narrativeTyping');
  this.container.innerHTML=formatBody(this.fullText);
  // Show action buttons
  const bubble=this.container.closest('.narrativeBubble');
  if(bubble)bubble.querySelectorAll('.narrativeAction.hidden').forEach(b=>b.classList.remove('hidden'));
  this.onComplete?.();
 }
 dispose(){
  this.done=true;
  cancelAnimationFrame(this.raf);
  this.container.closest('#phoneContent')?.removeEventListener('pointerdown',this._skipHandler);
 }
}
