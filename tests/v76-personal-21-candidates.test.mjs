import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {EMPLOYEES} from '../dist/hsec/catalog.mjs';
import {CANDIDATES,CANDIDATE_BY_ID,ROLE_GROUPS,ROLE_BY_ID,SKILLS,candidatesForRole,
 candidateBlockReason,hireCandidate,activeTeam,teamCapacity,missionIndex,priorityRole,hiredForRole} from '../dist/people/personnel-candidates-v76.mjs';
import {SKILL_CAP,SKILL_XP_REQUIREMENTS,GAMEPLAY_SKILL_EFFECTS,PLAYER_SKILL_BLUEPRINT,profileSkillSnapshot,skillTreeForRole,nextSkillMilestone} from '../dist/people/skill-tree-v76.mjs';
import {renderPersonalConsole} from '../dist/chapter/personal-console-v76.mjs';
import {CharacterSelectFeedback} from '../dist/audio/character-select-feedback-v68.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fixture=()=>{
 const s=newGame('es','operator01');
 s.office={...(s.office||{}),level:2,status:'built'};
 s.hsec={assets:[{id:'shed-01',type:'shed',status:'built'}]};
 s.mission3={phase:'workshop'};s.cash=20000;return s;
};
test('V76: exactly seven real hiring groups, 21 unique candidates and 21 brand-free artworks',()=>{
 assert.equal(ROLE_GROUPS.length,7);
 assert.equal(CANDIDATES.length,21);
 assert.equal(new Set(CANDIDATES.map(c=>c.id)).size,21);
 assert.equal(new Set(CANDIDATES.map(c=>c.name)).size,21);
 for(const role of ROLE_GROUPS){
  const options=candidatesForRole(role.id);
  assert.equal(options.length,3,role.label);
  assert(new Set(options.map(c=>c.hireCost)).size===3,'costs must differ: '+role.id);
 }
 for(const c of CANDIDATES){
  assert(ROLE_BY_ID[c.roleId]);
  assert(CANDIDATE_BY_ID[c.id]===c);
  assert(c.hireCost>0);
  assert.equal(Object.keys(c.skills).length,3);
  assert(c.skills && Object.values(c.skills).every(v=>Number.isInteger(v)&&v>=1&&v<=5));
  for(const k of Object.keys(c.skills))assert(SKILLS[k],k);
  const path='dist/assets/people/v76/'+c.id+'.svg';
  assert(existsSync(new URL('../'+path,import.meta.url)),path);
  const svg=read(path);
  assert.match(svg,/viewBox="0 0 320 400"/);
  assert.match(svg,/role="img"/);
  assert.match(svg,/reflective|#ffe5af/i);
  assert.doesNotMatch(svg,/<text\b|<image\b|drillco|puma|®|company logo|trademark|watermark/i);
 }
});
test('V76: one eligible candidate actually hires, bills exact price once and saves skills',()=>{
 const s=fixture(),before=s.cash,count=s.ledger.length,at=Date.UTC(2026,10,11,12);
 assert.equal(candidateBlockReason(s,'adm-matias'),null);
 const hired=hireCandidate(s,'adm-matias',at);
 assert.equal(hired.candidateId,'adm-matias');
 assert.equal(hired.displayName,'Matías Torres');
 assert.equal(hired.role,'admin');
 assert.equal(hired.hireCost,1050);
 assert.equal(hired.profileSkillsVersion,1);
 assert.equal(hired.skillsGameplayActive,false);
 assert.equal(hired.profileSkills.efficiency,5);
 assert.equal(s.cash,before-1050);
 assert.equal(s.ledger.length,count+2);
 assert.equal(s.ledger.at(-1).key,'candidatePremium');
 assert.equal(s.ledger.at(-1).amount,-250);
 const after=JSON.parse(JSON.stringify(s));
 assert.equal(after.personnel[0].candidateId,'adm-matias');
 assert.equal(after.personnel[0].profileSkills.efficiency,5);
 assert.equal(candidateBlockReason(s,'adm-camila'),'roleFull');
 assert.throws(()=>hireCandidate(s,'adm-camila'),/roleFull/);
 assert.equal(s.cash,before-1050);
});
test('V76: HSEC M2 employee is not lost nor rehired, candidate 03 supported',()=>{
 const s=fixture();
 s.hsec.employee={id:'hsec02',gender:'woman',state:'idle'};
 assert.equal(hiredForRole(s,'hsec').length,1);
 assert.equal(activeTeam(s).filter(p=>p.role==='hsec').length,1);
 assert.equal(candidateBlockReason(s,'hsec03'),'roleFull');
 assert(EMPLOYEES.find(e=>e.id==='hsec03'));
 assert.equal(teamCapacity(s),4);
});
test('V76: M5 Guard/Patio candidate charges once and uses original staff slots',()=>{
 const s=fixture();
 s.mission4={phase:'complete'};
 s.mission5={status:'operational',staff:{}};
 s.narrative={accepted:['m5']};
 const cash=s.cash;
 assert.equal(missionIndex(s),5);
 assert.equal(teamCapacity(s),8);
 assert.equal(candidateBlockReason(s,'grd-daniela'),null);
 const guard=hireCandidate(s,'grd-daniela',1000);
 assert.equal(s.cash,cash-2200);
 assert.equal(guard.candidateId,'grd-daniela');
 assert.equal(s.mission5.staff['m5-gate-security'].candidateId,'grd-daniela');
 assert.equal(candidateBlockReason(s,'grd-oscar'),'alreadyHired');
 assert.equal(candidateBlockReason(s,'pat-rocio'),null);
 const tech=hireCandidate(s,'pat-rocio',1002);
 assert.equal(tech.candidateId,'pat-rocio');
 assert.equal(s.cash,cash-4400);
 assert.equal(activeTeam(s).length,2);
 assert.throws(()=>hireCandidate(s,'pat-paula'),/alreadyHired/);
});
test('V76: dynamic capacity follows mission and is never a hidden hiring gate',()=>{
 const s=fixture();
 assert.equal(missionIndex(s),3);
 assert.equal(teamCapacity(s),4);
 assert.equal(priorityRole(s).id,'admin');
 s.mission4={phase:'working'};
 assert.equal(missionIndex(s),4);
 assert.equal(teamCapacity(s),6);
 s.mission5={status:'operational',staff:{}};
 s.narrative={accepted:['m5']};
 assert.equal(missionIndex(s),5);
 assert.equal(teamCapacity(s),8);
 assert.equal(priorityRole(s).id,'m5-gate-security');
});
test('V76: skills have a versioned future tree but no active money or output effects',()=>{
 assert.equal(SKILL_CAP,5);
 assert.equal(SKILL_XP_REQUIREMENTS.length,5);
 assert.equal(GAMEPLAY_SKILL_EFFECTS.enabled,false);
 assert.equal(GAMEPLAY_SKILL_EFFECTS.perShiftIncome,0);
 assert(PLAYER_SKILL_BLUEPRINT.length>=4);
 assert(skillTreeForRole('admin').some(s=>s.id==='negotiation'));
 const s=fixture(),person=hireCandidate(s,'adm-camila');
 const snapshot=profileSkillSnapshot(person);
 assert.equal(snapshot.active,false);
 assert.equal(snapshot.skills.negotiation.level,5);
 assert.equal(nextSkillMilestone(person,'negotiation').maxed,true);
});
test('V76: renderer shows three selectable candidates, six visual systems and mission jump',()=>{
 const s=fixture(),html=renderPersonalConsole(s,{icon:k=>'<svg data-icon="'+k+'"></svg>'});
 assert.match(html,/data-p76-mission/);
 assert.equal((html.match(/data-p76-candidate="/g)||[]).length,3);
 assert.equal((html.match(/data-p76-role="/g)||[]).length,7);
 assert.match(html,/data-p76-hire="adm-camila"/);
 assert.match(html,/data-p76-volume/);
 assert.match(html,/p76TeamRail/);
 assert.match(html,/p76Pips/);
 assert.match(html,/Los atributos quedan registrados/);
 assert(!html.includes('12.000')&& !html.includes('15%'));
});
test('V76: independent Personal is the only hiring screen, game has one new safe callback',()=>{
 const view=read('dist/chapter/faena-center.mjs'),game=read('dist/chapter/game.mjs'),css=read('dist/chapter/personal-console-v76.css'),index=read('dist/index.html');
 assert(view.includes("return renderPersonalConsole(s,{roleId:this.personalRole,candidateId:this.personalCandidate,icon})"));
 assert(view.includes('onHireCandidate?.(b.dataset.p76Hire)'));
 assert(view.includes("priorityRole(this.state()).id"));
 assert(game.includes("import {hireCandidate}"));
 assert(game.includes("onHireCandidate:candidateId=>"));
 assert(game.includes('save();renderHUD();renderPhone()'));
 assert(!css.includes('.faenaDialog{width:100vw'));
 assert(css.includes('height:min(658px,88dvh)!important'));
 assert(css.includes('(max-height:480px)'));
 assert(index.includes('personal-console-v76.css?v=76'));
});
test('V76: optional sound volume is shared with character selector and Personal without overwriting games',()=>{
 const game=read('dist/chapter/game.mjs');
 const audio=read('dist/audio/character-select-feedback-v68.mjs');
 assert(game.includes('uiVolume:1.5'));
 assert(game.includes('volume:()=>prefs.uiVolume'));
 assert(game.includes('id="uiVolumeToggle"'));
 assert(game.includes("onUISoundVolume:value=>"));
 assert(audio.includes('Math.min(2.5,Number(this.volume())||0)'));
 const muted=new CharacterSelectFeedback({context:()=>{throw Error('muted must not initialize')},enabled:()=>false,haptics:()=>false,volume:()=>0});
 assert.doesNotThrow(()=>muted.play('select'));
 assert.doesNotThrow(()=>muted.play('confirm'));
});
