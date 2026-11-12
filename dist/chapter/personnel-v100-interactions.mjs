// V100 · Personnel viewport-only interactions. Does not change game state.
// Loaded by the existing Personnel renderer; delegates across DOM re-renders
// so the game can preserve its V81 no-flicker rendering and native scroll.
export const staffPageSize=3;
export const staffPageTotal=count=>Math.max(1,Math.ceil(Math.max(0,Number(count)||0)/staffPageSize));
export const staffCurrentPage=(scrollLeft,viewportWidth,total)=>
 Math.min(staffPageTotal(total),Math.max(1,Math.round((Number(scrollLeft)||0)/Math.max(1,Number(viewportWidth)||1))+1));

export function refreshStaffPager(list){
 const footer=list?.closest?.('.pvTeam--v100');
 if(!footer)return;
 const total=list.querySelectorAll('.pvTeamSlot').length;
 const pages=staffPageTotal(total);
 const page=staffCurrentPage(list.scrollLeft,list.clientWidth,total);
 const label=footer.querySelector('.pvTeamPage');
 if(label)label.textContent=page+' / '+pages;
 const prev=footer.querySelector('[data-pv-team-scroll="-1"]');
 const next=footer.querySelector('[data-pv-team-scroll="1"]');
 if(prev)prev.disabled=page<=1;
 if(next)next.disabled=page>=pages;
}
export function pageStaffStrip(button){
 const footer=button?.closest?.('.pvTeam--v100');
 const list=footer?.querySelector?.('.pvTeamList');
 if(!list)return false;
 const total=list.querySelectorAll('.pvTeamSlot').length;
 const current=staffCurrentPage(list.scrollLeft,list.clientWidth,total);
 const direction=Math.sign(Number(button.dataset.pvTeamScroll)||0);
 const target=Math.max(1,Math.min(staffPageTotal(total),current+direction));
 if(target!==current){
  const left=(target-1)*list.clientWidth;
  if(typeof list.scrollTo==='function')list.scrollTo({left,behavior:'smooth'});
  else list.scrollLeft=left;
 }
 refreshStaffPager(list);
 return true;
}
if(typeof document!=='undefined'){
 document.addEventListener('click',event=>{
  const button=event.target?.closest?.('[data-pv-team-scroll]');
  if(!button)return;
  if(pageStaffStrip(button)){event.preventDefault();event.stopPropagation();}
 },true);
 document.addEventListener('scroll',event=>{
  if(event.target?.matches?.('.pvTeam--v100 .pvTeamList'))refreshStaffPager(event.target);
 },true);
}
