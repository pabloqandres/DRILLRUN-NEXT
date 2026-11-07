import {CONFIG} from './config.mjs';
import {landReady} from './state.mjs';
import {narrativeUnread} from './narrative.mjs';
export const availableMessages=s=>CONFIG.mentor.messages.filter(m=>!m.requires||s.office.status==='built');
export const unreadMessages=s=>availableMessages(s).filter(m=>!(s.messageReads||[]).includes(m.id));
export function readMessage(s,id){if(!availableMessages(s).some(m=>m.id===id))return false;s.messageReads??=[];if(!s.messageReads.includes(id))s.messageReads.push(id);s.messageRead=s.messageReads.includes('welcome');return true;}
// Persistent event identities, independent of economy transactions. Reopening a save never re-awards anything.
export function collectUIEvents(s){
 s.uiEvents??=[];const events=[];
 const once=(id,title,detail,icon,reward=false)=>{if(s.uiEvents.includes(id))return;s.uiEvents.push(id);events.push({id,title,detail,icon,reward});};
 for(const m of availableMessages(s))once('message:'+m.id,'newMessage','welcomePreview','messages');
 if(landReady(s))once('mission:clear','missionCompleted','landCleared','leaf',true);
 if(s.office.status==='built')once('mission:office','built','officeUnlocked','camp',true);
 if(s.chapterCompletedAt)once('mission:chapter','missionCompleted','workstationReady','computer',true);
 return events;
}
export function totalUnread(s){return unreadMessages(s).length+narrativeUnread(s);}
