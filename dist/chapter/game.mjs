import {ConstructionCallout} from './construction-callout.mjs';
import {tickMission3,restoreMission3} from '../mission3/tick.mjs';
import {tickMission4,restoreMission4} from '../mission4/tick.mjs';
import {canStartMission4,startMission4,updateMission4Phase,mission4Phase,mission4Objectives} from '../mission4/mission4-state.mjs';
import {purchaseDthDrill,installDthTool,assignDthDrillToZone,DTH_DRILLS,DTH_HAMMERS,DTH_BITS,dthHammerDefinition,dthBitDefinition} from '../mission4/drills-dth.mjs';
import {purchaseDrillTruck,drillTruckInfo,DRILLTRUCK_COST} from '../mission4/drilltruck.mjs';
import {convertBoreholeToZone,assignTruckToZone} from '../mission4/zones.mjs';
import {buildParking} from '../mission4/parking.mjs';
import {startMaintenance,advanceMaintenancePhase} from '../mission4/maintenance.mjs';
import {startProductionCycle,firstProductionCycleStatus,dthReplacementAvailable} from '../mission4/production.mjs';
import {dthRigInspection} from '../mission4/rig-inspection.mjs';
import {initTruckRouteState,startTruckRoute,updateTruckRoute,truckRouteActive} from '../mission4/truck-routes.mjs';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {DRACOLoader} from '../vendor/DRACOLoader.js';
import {addToInventory} from '../mission3/inventory.mjs';
import {hirePersonnel} from '../mission3/personnel.mjs';
import {acceptContract,startDrilling,completeContract,contractDeadline,isContractComplete,drillingCompletedAt} from '../mission3/contracts.mjs';
import {toolCondition} from '../mission3/wear.mjs';
import {drillDefinition,bitDefinition,hammerDefinition,HAMMERS,BITS} from '../mission3/drills.mjs';
import {requestAnalysis,accelerateAnalysis,technicianArrives,startAnalysisTimer} from '../mission3/geology.mjs';
import {purchaseDrill,installTool} from '../mission3/drills.mjs';
import {placeOrder,placeMachineryOrder,reconcileDeliveredMachinery} from '../mission3/headquarters.mjs';
import {buildWorkshop,finishWorkshopConstruction,upgradeWorkshop,workshopLevel,workshopCapacity,workshopUsed,workshopFree,WORKSHOP_LEVELS,workshopUpgradeJob,workshopUpgradeProgress,finishWorkshopUpgrade,accelerateWorkshop,canDemolishWorkshop,demolishWorkshop} from '../mission3/inventory.mjs';
import {canStartMission3,startMission3,updateMission3Phase} from '../mission3/mission3-state.mjs';
import {mission3Readout} from '../mission3/mission-readout.mjs';
import {mission2Readout} from '../hsec/mission-readout.mjs';
import {createDrillModel,animateDrill} from '../mission3/drill-models.mjs';
import {createDthProductionRig,animateDthRig,createMachineryStaging,RC_RESERVE,DTH_RESERVE} from '../graphics/production-dth-rig.mjs';
import {mission4Readout} from '../mission4/operations-guide.mjs';
import {PATIO_L1,PATIO_FUTURE,patioState,patioUnlocked,patioProgress,startPatio,finishPatio} from '../mission5/patio-state.mjs';
import {createPatioWorld} from '../mission5/patio-world.mjs';
import {createBoreholeMarker,updateMarkerProgress} from '../mission3/borehole-marker.mjs';
import {createDeliveryVehicle,startDelivery,updateDelivery,departDelivery} from '../mission3/delivery-vehicle.mjs';
import {createDrillingEffects,updateDrillingEffects} from '../mission3/drilling-effects.mjs';
import {BOREHOLE_SITES} from '../mission3/contracts.mjs';
import {HsecWorld} from '../hsec/world.mjs';
import {HsecUI} from '../hsec/ui.mjs';
import {ensureHsec,restoreHsec,active as hsecActive,tickHsec,moveNpc,evaluation,missionStep,assignOrder,upgradeAsset,retireAsset,inspectAsset} from '../hsec/state.mjs';
import {suggestedPose} from '../hsec/layout.mjs';
import {buildAsset} from '../hsec/state.mjs';
import {HSEC_STEPS,HSEC_BALANCE as B} from '../hsec/catalog.mjs';
import {applyQuality,loadQuality} from '../graphics/quality.mjs';
import {syncOfficeAccess} from './office-access.mjs';
import {ObjectiveGuide} from './guidance.mjs';
import {CAMERA_KEY,cameraSettings} from '../camera/config.mjs';
import {installWorldGestures} from '../camera/gestures.mjs';
import {CinematicDirector} from '../camera/cinematic.mjs';
import {CameraDebug} from '../camera/debug.mjs';
import {CinematicRecorder} from '../camera/recorder.mjs';
import {DesertWind} from '../camera/ambient.mjs';
import {WorksiteAudio} from '../audio/worksite-audio.mjs';
import {SiteCinematics} from '../graphics/site-cinematics.mjs';
import * as T from '../vendor/three.module.js';
import {World} from '../scene.mjs';
import {createMotion,moveController} from '../animation/movement.mjs';
import {installCameraDrag,rotateOrbit,resetOrbit,cameraRelativeIntent} from '../animation/camera-controls.mjs';
import {CONFIG,CLEARABLES,PRODUCTS,CATEGORIES,INTRO_SHOTS,INTRO_VARIANTS} from './config.mjs';
import {newGame,setPlayerIdentity,restore,tick,startModule,useOfficeComputer,constructionSeconds,clearObject,landReady,transfer,startOffice,accelerate,purchase,placeItem,validatePlacement,objective,progress} from './state.mjs';
import {LANGUAGES,deviceLanguage,translator} from './i18n.mjs';
import {ChapterScene} from './world.mjs';
import {prepareAuth} from './auth.mjs';
import {initCloudSave,cloudSave,cloudTakeControl,cloudUserId,cloudFlushNow,cloudStartNewGame,cloudGeneration} from './cloud-save.mjs';
import {LocomotionReview} from './review-locomotion.mjs';
import {AvatarRoster} from './avatar-roster.mjs';
import {avatarDefinition} from './avatars.mjs';
import {BuilderUI} from './builder-ui.mjs';
import {MODULES,moduleDefinition,pendingConstruction,moduleAvailability} from './module-catalog.mjs';
import {ProductPreview,officeThumbnail} from './product-preview.mjs';
import {CharacterStage} from './selector-stage.mjs';
import {renderPlayerPortrait} from './portrait.mjs';
import {reviewPath} from './qa-path.mjs';
import {PhoneUI} from './phone-ui.mjs';
import {NotificationSystem} from './notifications.mjs';
import {icon,workerAvatar} from './icons.mjs';
import {unreadMessages,collectUIEvents} from './ui-state.mjs';
import {pendingMessage,deliverMessage,acceptMission,confirmCompletion,isMissionAccepted,isMissionCollected,activeNarrativeMission,ensureNarrative,narrativeUnread,MISSION_NARRATIVES} from './narrative.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],hidden=(el,v)=>el.classList.toggle('hidden',v);
let prefs={lang:deviceLanguage(navigator.language),sound:true};try{prefs={...prefs,...JSON.parse(localStorage.getItem('drillrun-preferences')||'{}')};}catch{}
if(!LANGUAGES.some(([l])=>l===prefs.lang))prefs.lang='es';let t=translator(prefs.lang),s=null,hasSave=false;
function readSave(){try{const raw=localStorage.getItem(CONFIG.saveKey),data=JSON.parse(raw||'null');if(data&&data.schema!=='modular-1'&&!localStorage.getItem(CONFIG.saveKey+'-before-modular'))localStorage.setItem(CONFIG.saveKey+'-before-modular',raw);const value=restore(data);if(value){restoreHsec(value);restoreMission3(value);reconcileDeliveredMachinery(value);restoreMission4(value);finishPatio(value);}return value;}catch{return null;}}
s=readSave();hasSave=!!s;if(s)prefs.lang=s.lang;t=translator(prefs.lang);
let hsecWorld=null,hsecUI=null,hsecElapsed=0,hsecLastSignature='',hsecFollow=false,hsecRecorder=null;
let constructionCallout=null,guidance=null,cinematic=null,cameraDebug=null,cinemaRecorder=null,reviewBackup=null,cinemaReview=false,locomotionReview=null,qaComputerPath=null,qaWalkRoute=null,characterStage=null,avatars=null,builderOpen=false,managingOffice=false,officePanelPreview=null,selectedBuildModule=null,lastPortraitId=null,selectedAvatar='operator01';
let m3DrillModel=null,m3BoreholeMarkers=[],m3DeliveryVehicle=null,m3DrillingFx=null,m3VisualsReady=false;
let m4DrillTruckModel=null,m4ParkingSpot=null,m4VisualsReady=false,m4TruckLoading=false,m4TruckCollider=null;
let m4DthModel=null,m4DthCollider=null,m4Staging=null;
let m5World=null,patioOverviewUntil=0;
let siteCinematics=null;
let world,scene,phase='start',phoneApp=null,phoneOpen=false,category='desks',modalOpen=false,blueprint=false,placement=null,busy=null,keys={},joy={x:0,y:0},pointer=null,target=null,auth={configured:false},account=null,audioContext=null,last=performance.now(),clock=0,lastSave=0,lastHud=0,introAt=0,lastObjective='',qaRoute=false;
let cloudSyncing=true,cloudLocked=false,cloudStatus='Verificando Google…',cloudEpoch=0;
let freshGameRequested=false,previousCloudGeneration=0;
const motion=createMotion(),qa=new URLSearchParams(location.search).has('chapterqa'),cameraDev=new URLSearchParams(location.search).get('dev')==='camera';
function loadCameraSettings(){try{return cameraSettings(JSON.parse(localStorage.getItem(CAMERA_KEY)));}catch{return cameraSettings();}}
function persistCamera(){try{localStorage.setItem(CAMERA_KEY,JSON.stringify(world.cameraRig.settings));}catch{}}
const getGameAudioContext=()=>{audioContext??=new (window.AudioContext||window.webkitAudioContext)();return audioContext;};
const wind=new DesertWind(getGameAudioContext);
const worksiteAudio=new WorksiteAudio(getGameAudioContext);
document.documentElement.style.setProperty('--cover',`url('${new URL(CONFIG.cover,document.baseURI).href}')`);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setText(el,value){const text=String(value);if(el.textContent!==text)el.textContent=text;}
const notices=new NotificationSystem($('#toast')),rewardQueue=[];
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));$('#playerAvatar').innerHTML=workerAvatar();
const money=value=>new Intl.NumberFormat(prefs.lang).format(Math.floor(value));
function toast(key){notices.push({title:t(key),symbol:['noMoney','noEnergy','invalid','outside','accessBlocked','overlap'].includes(key)?'lock':'bell'});}
function persistPrefs(){try{localStorage.setItem('drillrun-preferences',JSON.stringify(prefs));}catch{}}
function save(){if(!s||!hasSave||phase==='character'||reviewBackup!==null||cloudSyncing||cloudLocked)return;try{s.savedAt=Date.now();localStorage.setItem(CONFIG.saveKey,JSON.stringify(s));cloudSave(CONFIG.saveKey);setText($('#saveStatus'),t('saved'));}catch{setText($('#saveStatus'),t('saveError'));}}
function language(value){prefs.lang=value;t=translator(value);if(s)s.lang=value;persistPrefs();applyText();save();if(phoneOpen)renderPhone();}
function languageOptions(){return LANGUAGES.map(([l,name])=>`<option value="${l}" ${l===prefs.lang?'selected':''}>${name}</option>`).join('');}
function updateLangDropdown(){const toggle=$('#langToggle'),opts=$('#langOptions');if(!toggle||!opts)return;const cur=LANGUAGES.find(([l])=>l===prefs.lang);toggle.textContent=cur?cur[1]:'Español';opts.innerHTML=LANGUAGES.map(([l,name])=>`<button data-lang="${l}" class="${l===prefs.lang?'active':''}">${name}</button>`).join('');opts.querySelectorAll('[data-lang]').forEach(b=>b.onclick=e=>{e.stopPropagation();language(b.dataset.lang);$('#startLanguage').classList.remove('open');});}
function applyText(){document.documentElement.lang=prefs.lang;$$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));updateLangDropdown();setText($('#play'),t(hasSave?'continue':'play'));hidden($('#newGame'),!hasSave);for(const [id,key]of[['phoneButton','phone'],['settingsButton','settings'],['cameraHome','home'],['handButton','hand'],['joystick','controls'],['menuButton','player'],['closePhone','close'],['phoneBack','back'],['backStart','back']])$('#'+id).setAttribute('aria-label',t(key));$('#energyValue').parentElement.title=t('energy');$('#boostValue').parentElement.title=t('boosters');$('#money').title=t('cash');updateStartAccount();updateStartCard();if(s)renderHUD();}
function updateStartCard(){
 const card=$('.startCard'),brand=$('.startBrand');if(!card||!brand)return;
 const m3On=s?.mission3&&s.mission3.phase!=='inactive';
 const hsecDone=!!s?.hsec?.completedAt;
 const chapterDone=!!s?.chapterCompletedAt;
 // Dynamic eyebrow + title based on progress
 const eyebrow=card.querySelector('.eyebrow');
 const heading=card.querySelector('h2');
 const brandP=brand.querySelector('p');
 const m4On=s?.mission4&&s.mission4.phase!=='inactive';
 if(m4On&&eyebrow&&heading){eyebrow.textContent='MISIÓN 4';heading.textContent='Automatiza tu operación';if(brandP)brandP.textContent='Producción DTH automatizada';}
 else if(m3On&&eyebrow&&heading){eyebrow.textContent='MISIÓN 3';heading.textContent='Tu Primer Contrato';if(brandP)brandP.textContent='Exploración RC · 90 metros';}
 else if(hsecDone&&eyebrow&&heading){eyebrow.textContent='MISIÓN 2 · COMPLETADA';heading.textContent='Prepara tu operación';if(brandP)brandP.textContent='Operación lista';}
 else if(chapterDone&&eyebrow&&heading){eyebrow.textContent='CAPÍTULO 01 · COMPLETADO';heading.textContent=t('firstSteps');if(brandP)brandP.textContent=t('firstSteps');}
}

function sound(kind){if(!prefs.sound)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const at=audioContext.currentTime,tones=kind==='ring'?[620,800,620,800]:kind==='build'?[210,145,320]:kind==='finish'?[330,440,660]:kind==='transition'?[140,210]:[180];tones.forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=kind==='finish'?'sine':'triangle';o.frequency.setValueAtTime(freq,at+i*.10);o.frequency.exponentialRampToValueAtTime(freq*.65,at+i*.10+.10);g.gain.setValueAtTime(kind==='transition'?.025:kind==='ring'?.042:.07,at+i*.10);g.gain.exponentialRampToValueAtTime(.001,at+i*.10+.13);o.connect(g);g.connect(audioContext.destination);o.start(at+i*.10);o.stop(at+i*.10+.14);o.onended=()=>{o.disconnect();g.disconnect();};});}catch{}}
function resetJoy(){joy={x:0,y:0};pointer=null;$('#joyKnob').style.transform='translate(0,0)';}
function stop(){resetJoy();keys={};target=null;motion.vx=motion.vz=motion.speed=0;}
function closeModal(){if(hsecUI)hsecUI.panelOpen=false;$('#modalCard').classList.remove('hsecModal');officePanelPreview?.dispose();officePanelPreview=null;scene?.setUpgradePreview(null);managingOffice=false;hidden($('#modal'),true);$('#modal').classList.remove('buildPreview','moduleSheet','upgradeSheet','officeQuick');modalOpen=false;blueprint=builderOpen&&!!selectedBuildModule;}
function modal(html){$('#modalCard').classList.remove('hsecModal');$('#modal').classList.remove('buildPreview');hsecWorld?.showAssetCard(null);stop();modalOpen=true;hidden($('#modal'),false);$('#modalCard').innerHTML=`<button id="modalDismiss" class="modalDismiss" aria-label="${esc(t('close'))}">${icon('close')}</button>`+html;$('#modalDismiss').onclick=closeModal;$('#modalCard').scrollTop=0;$('#modalCard').setAttribute('role','dialog');$('#modalCard').setAttribute('aria-modal','true');const heading=$('#modalCard h2');if(heading){heading.id='modalHeading';$('#modalCard').setAttribute('aria-labelledby','modalHeading');}}
function button(key,id,primary=false){return `<button id="${id}" class="${primary?'primary':'secondary'}">${esc(t(key))}</button>`;}
function showSettings(){const curLang=LANGUAGES.find(([l])=>l===prefs.lang);const curQ=loadQuality();const qLabels={low:t('quality_low'),balanced:t('quality_balanced'),high:t('quality_high')};modal(`<span class="eyebrow">${esc(t('settings'))}</span><h2>${esc(t('settings'))}</h2><div class="selectRow"><label for="profileName">${esc(t('yourName'))}</label><input id="profileName" maxlength="20" value="${esc(s?.playerName||'')}" placeholder="${esc(t('operatorName'))}"></div><div class="selectRow"><label>${esc(t('language'))}</label><div class="langDropdown" id="settingsLangDrop"><div class="langToggle" id="settingsLangToggle">${curLang?curLang[1]:'Español'}</div><div class="langOptions" id="settingsLangOpts">${LANGUAGES.map(([l,name])=>`<button data-lang="${l}" class="${l===prefs.lang?'active':''}">${name}</button>`).join('')}</div></div></div><div class="selectRow"><label>${esc(t('sound'))}</label><input id="soundToggle" type="checkbox" ${prefs.sound?'checked':''}></div><div class="selectRow"><label>${esc(t('graphicsQuality'))}</label><div class="langDropdown" id="settingsQualityDrop"><div class="langToggle" id="settingsQualityToggle">${esc(qLabels[curQ]||qLabels.balanced)}</div><div class="langOptions" id="settingsQualityOpts">${['low','balanced','high'].map(id=>`<button data-quality="${id}" class="${curQ===id?'active':''}">${esc(qLabels[id])}</button>`).join('')}</div></div></div><small class="qualityReadout">${esc(t('qualityHelp'))}</small><p>${esc(t('controls'))}</p><button id="resetCamera" class="textButton">${esc(t('home'))}</button><p>${esc(account?t('linked')+' · '+(account.email||''):t('guestNote'))}</p>${auth.configured?button('google','googleLink'): `<small>${esc(t('googleOff'))}</small>`}${account?'<button id="cloudSyncNow" class="secondary" type="button">Sincronizar partida ahora</button><small id="cloudSyncNowStatus"></small>':''}<div class="modalActions">${button('titleScreen','goTitle')}${button('close','closeSettings',true)}</div>`);$('#profileName').onchange=e=>{if(!s||phase!=='play')return;try{setPlayerIdentity(s,s.character,e.target.value);save();renderHUD();if(phoneOpen)renderPhone();}catch(err){toast(err.key);}};$('#settingsLangToggle').onclick=e=>{e.stopPropagation();$('#settingsLangDrop').classList.toggle('open');$('#settingsQualityDrop')?.classList.remove('open');};$('#settingsLangOpts').querySelectorAll('[data-lang]').forEach(b=>b.onclick=e=>{e.stopPropagation();language(b.dataset.lang);showSettings();});$('#settingsQualityToggle').onclick=e=>{e.stopPropagation();$('#settingsQualityDrop').classList.toggle('open');$('#settingsLangDrop')?.classList.remove('open');};$('#settingsQualityOpts').querySelectorAll('[data-quality]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(world)applyQuality(world,b.dataset.quality);else try{localStorage.setItem('drillrun-graphics-v1',b.dataset.quality);}catch{}$('#settingsQualityDrop').classList.remove('open');$('#settingsQualityToggle').textContent=b.textContent;$('#settingsQualityOpts').querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');});$('#soundToggle').onchange=e=>{prefs.sound=e.target.checked;wind.set(prefs.sound&&phase==='play');worksiteAudio.set(prefs.sound&&phase==='play');if(s)s.sound=prefs.sound;persistPrefs();save();};$('#closeSettings').onclick=closeModal;$('#resetCamera').onclick=()=>{world&&(world.zoom=1,resetOrbit(world.orbit),world.cameraRig.reset(),persistCamera());closeModal();};$('#goTitle').onclick=()=>{closeModal();stop();save();phase='start';worksiteAudio.set(false);wind.set(false);closePhone();closeBuilder();hidden($('#hud'),true);hidden($('#startScreen'),false);applyText();};if($('#googleLink'))$('#googleLink').onclick=async()=>{try{await auth.signIn();showSettings();}catch(err){cloudStatus='Google: '+(err.code||err.message||'error');updateStartAccount();toast('authError');}};
if($('#cloudSyncNow'))$('#cloudSyncNow').onclick=async()=>{
 const status=$('#cloudSyncNowStatus');
 if(cloudSyncing||cloudLocked){if(status)status.textContent='Esta sesión todavía no puede guardar en la nube';return;}
 if(status)status.textContent='Sincronizando…';
 if(s?.cloudResetPending){
  // Retry the transactional promotion of a deliberately restarted game.
  // A normal autosave must never overwrite the official generation blindly.
  await reconcileGoogleSave();
  if(status)status.textContent=cloudStatus;
  return;
 }
 save();
 const ok=await cloudFlushNow(CONFIG.saveKey);
 cloudStatus=ok?'Partida sincronizada con Google':'No se pudo subir · comprueba la conexión y la cuenta';
 if(status)status.textContent=cloudStatus;
 updateStartAccount();
}; document.querySelector('#modalCard')?.addEventListener('click',()=>{$('#settingsLangDrop')?.classList.remove('open');$('#settingsQualityDrop')?.classList.remove('open');});}
$('#langToggle').onclick=e=>{e.stopPropagation();$('#startLanguage').classList.toggle('open');};document.addEventListener('click',()=>$('#startLanguage')?.classList.remove('open'));$('#startSettings').onclick=$('#settingsButton').onclick=showSettings;
function updateStartAccount(){
 const info=$('#startAccountInfo'),btn=$('#startGoogle');
 if(account){info.textContent=t('linked')+' · '+(account.email||'');hidden(btn,true);}
 else if(auth.configured){info.textContent=t('guestNote');hidden(btn,false);}
 else{info.textContent=t('guestNote');hidden(btn,true);}
 $('#play').disabled=cloudSyncing||cloudLocked;
 let status=$('#cloudStatus');
 if(!status){status=document.createElement('small');status.id='cloudStatus';status.style.cssText='display:block;margin:7px 0;color:#afd5e5';info.insertAdjacentElement('afterend',status);}
 status.textContent=cloudStatus;
}
function cloudLock(){
 if(cloudLocked)return;
 cloudLocked=true;cloudSyncing=false;cloudStatus='Partida activa en otro dispositivo';
 stop();
 if(phase==='play'){closePhone();closeBuilder();hidden($('#hud'),true);}
 phase='cloud-locked';hidden($('#startScreen'),false);
 showCloudLock();applyText();
}
function showCloudLock(){
 let box=$('#cloudLockPanel');
 if(!box){
  box=document.createElement('div');box.id='cloudLockPanel';box.style.cssText='padding:12px;margin-top:12px;border-radius:12px;border:1px solid #87b3c9;background:#123149;color:white';
  $('.startCard').append(box);
 }
 hidden(box,!cloudLocked);
 if(!cloudLocked)return;
 box.innerHTML='<b>Sesión abierta en otro dispositivo</b><p>Este dispositivo dejó de guardar. Puedes retomar el control aquí.</p><button id="takeCloudControl" class="primary" type="button">Jugar aquí</button>';
 $('#takeCloudControl').onclick=()=>{void reconcileGoogleSave();};
}
async function reconcileGoogleSave(){
 const attempt=++cloudEpoch;
 cloudSyncing=true;cloudStatus='Sincronizando partida…';updateStartAccount();
 if(!cloudUserId()){
  cloudSyncing=false;cloudLocked=false;cloudStatus='Partida local · Conecta Google';showCloudLock();updateStartAccount();return;
 }
 const result=await cloudTakeControl(s,cloudLock);
 if(attempt!==cloudEpoch)return;
 if(result.status!=='ready'){
  cloudSyncing=false;cloudLocked=true;cloudStatus='No se pudo sincronizar · No se sobrescribió la partida';
  phase='cloud-locked';hidden($('#startScreen'),false);hidden($('#hud'),true);showCloudLock();updateStartAccount();return;
 }
 const changed=(result.source==='cloud'||result.source==='new-game')&&!!result.state;
 if(changed){
  localStorage.setItem(CONFIG.saveKey,result.raw);
  s=readSave();hasSave=!!s;
  if(s?.lang){prefs.lang=s.lang;t=translator(prefs.lang);}
 }
 cloudLocked=false;cloudSyncing=false;showCloudLock();
 cloudStatus=result.source==='device'?'Partida del PC sincronizada con Google':result.source==='cloud'?'Partida de Google recuperada':'Cuenta Google vinculada';
 if(phase==='cloud-locked')phase='start';
 applyText();
 if(changed&&world&&phase==='play'){location.reload();return;}
 if(changed&&phase==='play')scene?.update(s,0,Date.now());
 if(s&&hasSave)save();
}

$('#startGoogle').onclick=async()=>{try{await auth.signIn();}catch(err){cloudStatus='Google: '+(err.code||err.message||'error');updateStartAccount();toast('authError');}};
prepareAuth(user=>{account=user;updateStartAccount();}).then(async value=>{
 auth=value;updateStartAccount();
 if(!value.configured){cloudSyncing=false;cloudStatus='Partida local · Google no disponible';updateStartAccount();return;}
 await initCloudSave(value,async user=>{account=user;updateStartAccount();await reconcileGoogleSave();});
}).catch(e=>{console.error('[CloudSave] setup:',e);cloudSyncing=false;cloudStatus='Google no disponible · Partida local';updateStartAccount();});
function loadingProgress(done,total){$('#loadProgress').value=done/total;setText($('#loadStage'),new Intl.NumberFormat(prefs.lang,{style:'percent',maximumFractionDigits:0}).format(done/total));}
async function ensureWorld(forSelection=false){
 if(world){if(forSelection){hidden($('#loading'),false);await avatars.loadAll((n,total)=>{loadingProgress(n,total);});hidden($('#loading'),true);}return;}
 hidden($('#loading'),false);loadingProgress(0,forSelection?4:2);
 world=new World($('#world'),{chapter:true,cameraSettings:loadCameraSettings()});scene=new ChapterScene(world);
 siteCinematics?.dispose();siteCinematics=new SiteCinematics(world);hsecWorld=new HsecWorld(world);hsecWorld.onBuilt=a=>{scene.burst(a.x,a.z);sound('finish');};hsecWorld.onAlert=(text,sym)=>{notices.push({title:text,symbol:sym||'bell'});};
 hsecWorld.onRepair=(orderId)=>{const h=ensureHsec(s);const o=h.orders.find(o=>o.id===orderId);if(!o)return;try{assignOrder(s,orderId,'player');save();renderHUD();notices.push({title:'Reparación iniciada',symbol:'🔧'});}catch(e){notices.push({title:e.message,symbol:'⚠️'});}};
 hsecWorld.onInspect=(assetId)=>{try{const h=ensureHsec(s),before=h.orders.filter(o=>o.assetId===assetId&&o.status==='pending').length;inspectAsset(s,assetId);save();renderHUD();const after=h.orders.filter(o=>o.assetId===assetId&&o.status==='pending').length,created=after-before;notices.push({title:created>0?`${created} reparación${created>1?'es':''} detectada${created>1?'s':''} — toca para reparar`:'Sin problemas detectados',symbol:'🔍'});}catch(e){notices.push({title:e.message,symbol:'⚠️'});}};
 hsecWorld.onUpgrade=(assetId)=>{try{upgradeAsset(s,assetId);save();renderHUD();notices.push({title:'Superficie mejorada',symbol:'⬆'});}catch(e){notices.push({title:e.message,symbol:'⚠️'});}};
 hsecWorld.onRemove=(assetId)=>{try{retireAsset(s,assetId);save();renderHUD();notices.push({title:'Activo retirado',symbol:'🗑'});}catch(e){notices.push({title:e.message,symbol:'⚠️'});};};hsecUI=new HsecUI({state:()=>s,world:hsecWorld,format:money,onSave:()=>{scene.update(s,0,Date.now());hsecWorld.update(s,0,'play');ensureSafe();save();renderHUD();},onStop:stop,notify:text=>notices.push({title:text,symbol:'bell'}),showModal:modal,hideModal:closeModal,openBuilder,closeBuilder,manageOffice,onGoto:p=>{target={x:p.x,z:p.z};}});builderUI.hsec=hsecUI;guidance=new ObjectiveGuide(world,$('#hud'),()=>t);constructionCallout=new ConstructionCallout(world,$('#buildHud'));characterStage=new CharacterStage(world);await world.characterReady;avatars=new AvatarRoster(world);loadingProgress(1,forSelection?4:2);
 if(forSelection)await avatars.loadAll((done,total)=>{loadingProgress(done,total);});else await avatars.load(s?.character||'operator01');
 avatars.activate(s?.character||'operator01');builderUI.world=world;builderUI.thumbnail=officeThumbnail(world);world.inspect=false;motion.turnBeforeMove=true;world.player.userData.validationCanvas=world.renderer.domElement;
 installWorldGestures(world.renderer.domElement,{canLook:()=>phase==='character'||phase==='play'&&!locomotionReview?.active&&(!modalOpen||managingOffice)&&!phoneOpen&&!busy,dragAnywhere:()=>builderOpen||managingOffice,onLook:(dx,dy)=>{if(phase!=='play')return;target=null;if(builderOpen&&(hsecUI?.drawing||hsecUI?.coneZone)){
  // Move the aerial camera independently; do not move the placement asset.
  const zoom=world.cameraRig.builderZoom||22,panScale=zoom*.0018;
  const pan=cameraRelativeIntent(-dx*panScale,dy*panScale,world.cameraRig.heading);
  world.cameraRig.panBuilder(pan.x,pan.z);
  return;
 }if(!world.orbit.manual)world.orbit.yaw=world.cameraRig.heading;rotateOrbit(world.orbit,dx*world.cameraRig.settings.controls.touchSensitivity,dy*world.cameraRig.settings.controls.touchSensitivity);},onZoom:delta=>{if(phase==='play')world.cameraRig.zoomBy(delta);},onEnd:persistCamera,onTap:(x,y)=>{if(phase==='character'){const id=avatars?.pickSelector(x,y);if(id)selectAvatar(id);return;}if(phase==='play'&&hsecUI?.drawing&&!modalOpen&&!phoneOpen){const p=world.pick(x,y,0);if(p)hsecUI.pick(p);return;}if(phase!=='play'||builderOpen||modalOpen||phoneOpen||busy)return;const p=world.pick(x,y,placement?.42:0);if(!s.inside&&s.office.status==='built'&&world.office.visible&&world.ray.intersectObject(world.office,true).some(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;})){manageOffice();return;}// Touch/click on the actual 3D DTH model opens its tool card.
 // Test the mesh ray first, then a narrow ground footprint for small screens.
 if(!s.inside&&m4DthModel&&s.mission4?.productionDrill&&
    (world.ray.intersectObject(m4DthModel,true).length>0||
     (p&&Math.hypot(p.x-m4DthModel.position.x,p.z-m4DthModel.position.z)<2.25))){
   target=null;hideDrillCard();hideWorkshopCard();showDthDrillCard();return;
 }
 if(!p)return;if(placement){placement.pose.x=Math.round((p.x+6)/CONFIG.grid)*CONFIG.grid;placement.pose.z=Math.round(p.z/CONFIG.grid)*CONFIG.grid;renderPlacement();}else if(hsecActive(s)&&hsecWorld){const hitAsset=hsecWorld.hitTestAsset(p.x,p.z);if(hitAsset){hsecWorld.showAssetCard(hitAsset);return;}}if(m3DrillModel&&s.drill&&Math.hypot(p.x-m3DrillModel.position.x,p.z-m3DrillModel.position.z)<3.5&&Math.hypot(s.position.x-m3DrillModel.position.x,s.position.z-m3DrillModel.position.z)<6){hideDrillCard();hideWorkshopCard();showDrillCard();return;}if(s.workshop?.status!=='building'&&s.workshop&&s.mission3&&s.mission3.phase!=='inactive'&&Math.hypot(p.x+7.6,p.z+9.3)<6&&Math.hypot(s.position.x+7.6,s.position.z+9.3)<9){hideDrillCard();hideWorkshopCard();showWorkshopCard();return;}if(drillCardOpen)hideDrillCard();if(workshopCardOpen)hideWorkshopCard();if(!world.isBlocked(p.x,p.z,avatarDefinition(s.character).radius))target={x:p.x,z:p.z};}});
 cinematic=new CinematicDirector({world,host:$('#intro'),translate:()=>t,sound:()=>prefs.sound,onSound:()=>{sound('transition');wind.set(prefs.sound);},onComplete:()=>{beginPlay(cinemaReview);if(cinemaRecorder)setTimeout(()=>cinemaRecorder.stop(),500);}});
 if(cameraDev){cameraDebug=new CameraDebug({onOfficeThumbnail:()=>builderUI.thumbnail,onRecordGraphics:()=>{cinemaRecorder.start();setTimeout(()=>cinemaRecorder.stop(),12000);},rig:world.cameraRig,world,onPreset:()=>{stop();world.snapCamera=true;resetOrbit(world.orbit);},onFreeze:stop,onReplay:(orbitOnly,record)=>replayCinematic(orbitOnly,record),onFixture:cameraReviewScene,onRestore:restoreReviewScene,onCapture:id=>{world.cameraRig.setPreset(id);world.snapCamera=true;resetOrbit(world.orbit);world.update(s,0,clock,false);world.renderer.last=0;world.renderer.render(world.scene,world.camera);return world.renderer.domElement.toDataURL('image/png');}});cinemaRecorder=new CinematicRecorder(world,cinematic,cameraDebug.host);}
 if(qa)installQA();last=performance.now();if(qa)setInterval(()=>frame(performance.now()),1000/30);else requestAnimationFrame(frame);loadingProgress(1,1);hidden($('#loading'),true);
}
async function chooseCharacter(fresh=false){try{await ensureWorld(true);freshGameRequested=!!fresh;previousCloudGeneration=cloudGeneration(readSave());s=newGame(prefs.lang,'operator01');selectedAvatar='operator01';avatars.activate(selectedAvatar);world.playerGround=0;$('#playerNameInput').value='';s.sound=prefs.sound;notices.clear();rewardQueue.length=0;phase='character';world.inspect=true;world.inspectMode='worker';world.inspectAngle='three';world.zoom=.8;world.player.rotation.y=0;motion.yaw=0;hidden($('#startScreen'),true);hidden($('#characterScreen'),false);renderCharacters();}catch(e){console.error(e);setText($('#loadStage'),t('invalid'));}}
// Cards and visible 3D characters share exactly one selection flow.
function selectAvatar(id){
 if(phase!=='character'||!avatars?.entries.has(id))return false;
 selectedAvatar=id;avatars.activate(id);renderCharacters();return true;
}
// The selector overlay is pointer-transparent by design. 3D avatar taps are handled
// by the canvas gesture handler, while roster buttons call selectAvatar directly.
function renderCharacters(){const node=$('#characterSlots');node.innerHTML=CONFIG.protagonists.map((p,i)=>`<button data-character="${p.id}" class="avatarChoice ${selectedAvatar===p.id?'selected':''}" aria-pressed="${selectedAvatar===p.id}"><span class="avatarThumb">${avatars.portrait(p.id)||icon('player')}</span><span><b>${esc(t(p.roleKey))}</b><small>${esc(t(p.labelKey))}</small></span><i>${String(i+1).padStart(2,'0')}</i></button>`).join('');node.querySelectorAll('button').forEach(b=>b.onclick=()=>selectAvatar(b.dataset.character));const p=avatarDefinition(selectedAvatar);setText($('#avatarTitle'),t(p.roleKey));setText($('#avatarDetail'),t(p.summaryKey));$('#avatarPerk').innerHTML=`<span class="perkSymbol">${icon(p.perkIcon)}</span><div><span class="perkHeading">${esc(t('specialtyBonus'))}</span><strong>${esc(t(p.perkKey))}</strong><small class="perkStatus">${icon(p.id==='operator04'?'check':'lock')}${esc(t(p.id==='operator04'?'bonusActive':'bonusFuture'))}</small></div>`;$('#startAdventure').disabled=!avatars.entries.has(p.id)||$('#playerNameInput').value.trim().length<2;hidden($('#provisionalNote'),true);}
$('#playerNameInput').oninput=renderCharacters;
$('#play').onclick=async()=>{if(cloudSyncing||cloudLocked)return;if(!hasSave)return chooseCharacter(true);try{requestImmersive();await ensureWorld();s=readSave();if(!s){hasSave=false;return chooseCharacter();}prefs.lang=s.lang;prefs.sound=s.sound;t=translator(s.lang);applyText();hasSave=true;beginPlay(true);}catch(e){console.error(e);toast('invalid');}};
$('#newGame').onclick=()=>{if(cloudSyncing||cloudLocked)return;modal(`<h2>${esc(t('newGame'))}</h2><p>${esc(t('resetAsk'))}</p><div class="modalActions">${button('cancel','keepSave')}${button('confirm','replaceSave',true)}</div>`);$('#keepSave').onclick=closeModal;$('#replaceSave').onclick=()=>{closeModal();void chooseCharacter(true);};};
$('#backStart').onclick=()=>{freshGameRequested=false;phase='start';hidden($('#characterScreen'),true);hidden($('#startScreen'),false);s=readSave();hasSave=!!s;applyText();};
$('#startAdventure').onclick=async()=>{
 if(cloudSyncing||cloudLocked)return;
 try{setPlayerIdentity(s,selectedAvatar,$('#playerNameInput').value);}
 catch(e){toast(e.key);return;}
 const button=$('#startAdventure');button.disabled=true;
 if(freshGameRequested){
  s.cloudGeneration=previousCloudGeneration+1;
  s.cloudResetPending=true;
  s.cloudGameId=crypto.randomUUID();
  cloudSyncing=true;cloudStatus='Activando nueva partida oficial…';
  updateStartAccount();
  if(cloudUserId()){
   const synced=await cloudStartNewGame(s);
   if(synced.status==='ready'){s=synced.state;cloudStatus='Nueva partida oficial sincronizada con Google';}
   else cloudStatus='Partida nueva local; sincronización Google pendiente';
  }else cloudStatus='Partida nueva local; conecta Google para sincronizar';
  cloudSyncing=false;
  s.savedAt=Date.now();
  localStorage.setItem(CONFIG.saveKey,JSON.stringify(s));
  freshGameRequested=false;
 }
 hasSave=true;avatars.activate(s.character);world.setCharacter(s.character);
 world.inspect=false;hidden($('#characterScreen'),true);hidden($('#provisionalNote'),true);
 s.facing=Math.PI;s.position={...CONFIG.spawn};requestImmersive();
 startCinematic(false,false);save();updateStartAccount();
};
function requestImmersive(){const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
function startCinematic(orbitOnly=false,review=false){stop();phase='intro';cinemaReview=review;blueprint=false;world.inspect=false;world.chapterCamera=null;world.avatarHeight=avatarDefinition(s.character).height;world.player.rotation.y=s.facing;motion.yaw=s.facing;world.worker.reset();resetOrbit(world.orbit);world.orbit.yaw=s.facing-Math.PI;hidden($('#hud'),true);hidden($('#characterScreen'),true);hidden($('#startScreen'),true);notices.clear();wind.set(false);worksiteAudio.set(false);cinematic.start(s.character,{orbitOnly});}
async function cameraReviewScene(id,mode=null){if(!world)return;cinematic.stop();cinemaRecorder?.stop();if(!reviewBackup)reviewBackup={state:s?JSON.parse(JSON.stringify(s)):null,hasSave};await avatars.load(id);s=newGame(prefs.lang,id);s.character=id;s.playerName='Revisión';s.facing=Math.PI;s.position={...CONFIG.spawn};s.introSeen=true;s.messageReads=['welcome'];if(mode==='office'){s.cleared=CLEARABLES.map(o=>o.id);startOffice(s,'office01');accelerate(s);s.position={...CONFIG.officeSlot.access};s.uiEvents=['message:welcome','mission:clear','mission:office','message:office-store'];}hasSave=true;avatars.activate(id);world.playerGround=0;world.worker.reset();rewardQueue.length=0;beginPlay(true);notices.clear();}
function restoreReviewScene(){if(!reviewBackup)return;rewardQueue.length=0;closeModal();notices.clear();cinematic.stop();cinemaRecorder?.stop();const backup=reviewBackup;reviewBackup=null;s=backup.state;hasSave=backup.hasSave;if(s){avatars.activate(s.character);world.playerGround=0;beginPlay(true);}else{phase='start';hidden($('#hud'),true);hidden($('#startScreen'),false);applyText();}}
function initM3Visuals(){
 if(m3VisualsReady||!world||!s?.mission3||s.mission3.phase==='inactive')return;
 // Borehole markers
 if(!m3BoreholeMarkers.length){for(const site of BOREHOLE_SITES.slice(0,s.contract?.boreholeCount||s.boreholes?.length||3)){const marker=createBoreholeMarker(site.id,site.x,site.z);world.scene.add(marker);m3BoreholeMarkers.push(marker);}}
 // Delivery vehicle
 if(!m3DeliveryVehicle){m3DeliveryVehicle=createDeliveryVehicle();world.scene.add(m3DeliveryVehicle);}
 // Drilling effects
 if(!m3DrillingFx){m3DrillingFx=createDrillingEffects();world.scene.add(m3DrillingFx);}
 m3VisualsReady=true;
}
let m3DrillCollider=null,m3TruckCollider=null;
function spawnM3Drill(drillId){
 if(m3DrillModel){world.scene.remove(m3DrillModel);m3DrillModel=null;}
 m3DrillModel=createDrillModel(drillId);
 const activeBH=s.contract?.activeBoreholeIndex!=null?BOREHOLE_SITES[s.contract.activeBoreholeIndex]:null;
 const dx=activeBH?.x||22,dz=activeBH?.z||0;
 m3DrillModel.position.set(dx,0,dz);
 world.scene.add(m3DrillModel);
 // Dynamic collider for drill rig
 if(!m3DrillCollider){m3DrillCollider={x:dx,z:dz,w:3.6,d:4.5};world.colliders.push(m3DrillCollider);}
 m3DrillCollider.x=dx;m3DrillCollider.z=dz;
}
function updateM3Visuals(dt){
 if(!m3VisualsReady||!s?.mission3)return;
 // Ensure drill model exists if player owns a drill
 if(s.drill&&!m3DrillModel)spawnM3Drill(s.drill.id);
 // After the exploration contract is delivered, RC returns to an actual
 // visible reserve bay; M4 production uses a separate physical DTH rig.
 if(m3DrillModel){
  const parked=s.contract?.status==='delivered'&&s.mission4?.phase&&s.mission4.phase!=='inactive';
  const site=parked?RC_RESERVE:s.contract?.activeBoreholeIndex!=null?BOREHOLE_SITES[s.contract.activeBoreholeIndex]:null;
  if(site){
   m3DrillModel.position.x+=(site.x-m3DrillModel.position.x)*Math.min(1,dt*2);
   m3DrillModel.position.z+=(site.z-m3DrillModel.position.z)*Math.min(1,dt*2);
  }
 }
 // Sync drill collider position
 if(m3DrillCollider&&m3DrillModel){m3DrillCollider.x=m3DrillModel.position.x;m3DrillCollider.z=m3DrillModel.position.z;}
 // Sync truck collider position
 if(m3DeliveryVehicle){
  // The delivery model is created hidden at (0,0,0) before its first dispatch.
  // Registering a collider unconditionally there created a large invisible wall
  // between the office and maintenance facilities. An inactive truck is not solid.
  const truckPresent=m3DeliveryVehicle.visible&&m3DeliveryVehicle.parent===world.scene;
  if(truckPresent){
   if(!m3TruckCollider)m3TruckCollider={x:0,z:0,w:2.4,d:5,_m3Delivery:true};
   m3TruckCollider.x=m3DeliveryVehicle.position.x;
   m3TruckCollider.z=m3DeliveryVehicle.position.z;
   if(!world.colliders.includes(m3TruckCollider))world.colliders.push(m3TruckCollider);
  }else if(m3TruckCollider){
   const idx=world.colliders.indexOf(m3TruckCollider);
   if(idx!==-1)world.colliders.splice(idx,1);
  }
 }
 // Animate drill
 const drilling=s.drill?.state==='drilling';
 animateDrill(m3DrillModel,dt,drilling);
 // Update borehole markers
 for(let i=0;i<m3BoreholeMarkers.length;i++){
  const bh=s.boreholes?.[i],marker=m3BoreholeMarkers[i];
  if(!bh){updateMarkerProgress(marker,0,'idle');continue;}
  const progress=(bh.depthDrilled||0)/(bh.depthTarget||30);
  const status=bh.status==='completed'?'complete':s.contract?.activeBoreholeIndex===i&&drilling?'active':'idle';
  updateMarkerProgress(marker,progress,status);
 }
 // Drilling effects at active borehole
 if(m3DrillingFx&&drilling&&s.contract?.activeBoreholeIndex!=null){
  const site=BOREHOLE_SITES[s.contract.activeBoreholeIndex];
  if(site){m3DrillingFx.position.set(site.x,0,site.z);}
 }
 updateDrillingEffects(m3DrillingFx,dt,drilling);
 // Delivery vehicle animation
 updateDelivery(m3DeliveryVehicle,dt);
}
function initM5Visuals(now=Date.now()){
 if(!world||!s?.mission4||s.mission4.phase!=='complete')return;
 if(!m5World)m5World=createPatioWorld(world);
 m5World.update(s,now);
}
function initM4Visuals(){
 if(m4VisualsReady||!world||!s?.mission4||s.mission4.phase==='inactive')return;
 // Parking spot — exterior left side of workshop
 if(!m4ParkingSpot&&s.mission4.parkingBuilt){
  const g=new T.Group();g.name='parking-spot';
  const ground=new T.Mesh(new T.BoxGeometry(4,0.02,5),new T.MeshToonMaterial({color:0x3a3a3a}));
  ground.position.set(-13.5,0.12,-9.3);ground.receiveShadow=true;g.add(ground);
  // Yellow border lines
  for(const z of [-1,1]){const line=new T.Mesh(new T.BoxGeometry(3.6,0.03,0.08),new T.MeshToonMaterial({color:0xf6bc43}));line.position.set(-13.5,0.14,-9.3+z*2.2);g.add(line);}
  for(const x of [-1,1]){const line=new T.Mesh(new T.BoxGeometry(0.08,0.03,4.4),new T.MeshToonMaterial({color:0xf6bc43}));line.position.set(-13.5+x*1.8,0.14,-9.3);g.add(line);}
  world.scene.add(g);m4ParkingSpot=g;
  // Add walk surface for parking area
  world.walkSurfaces.push({x:-13.5,z:-9.3,w:4,d:5,y:0.12});
 }
 // DrillTruck model — load GLB
 if(!m4DrillTruckModel&&!m4TruckLoading&&s.mission4.drillTruck){
  m4TruckLoading=true;
  const draco=new DRACOLoader();draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  loader.loadAsync(new URL('../assets3d/DRILLTRUCK_optimized.glb',import.meta.url).href).then(gltf=>{
   const mdl=gltf.scene;mdl.name='drilltruck';
   // Measure bounding box to auto-scale
   const box=new T.Box3().setFromObject(mdl);const sz=new T.Vector3();box.getSize(sz);
   console.log('DrillTruck GLB loaded, size:',sz.x.toFixed(2),sz.y.toFixed(2),sz.z.toFixed(2));
   // Target ~5m long truck (real pickup scale)
   const maxDim=Math.max(sz.x,sz.y,sz.z);if(maxDim>0){const scale=5/maxDim;mdl.scale.setScalar(scale);console.log('DrillTruck scale:',scale.toFixed(3));}
   // Re-center so bottom sits on ground at parking surface y=0.12
   const box2=new T.Box3().setFromObject(mdl);mdl.position.y=-box2.min.y;
   mdl.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
   const wrapper=new T.Group();wrapper.name='drilltruck-wrapper';wrapper.add(mdl);
   m4DrillTruckModel=wrapper;
   initTruckRouteState(m4DrillTruckModel);
   // Position at saved truck position or parking
   const truckPos=s.mission4?.drillTruck?.position||{x:-13.5,z:-9.3};
   m4DrillTruckModel.position.set(truckPos.x,0.12,truckPos.z);
   world.scene.add(m4DrillTruckModel);
   // If truck was dispatched/in maintenance, restart route animation
   if(s.mission4?.drillTruck?.maintenancePhase==='dispatch'){
    const zone=s.mission4.drillTruck.maintenanceZone;
    if(zone)startTruckRoute(m4DrillTruckModel,zone,'out',!!s.mission5?.truckRelocated);
   }else if(s.mission4?.drillTruck?.maintenancePhase==='return'){
    const zone=s.mission4.drillTruck.maintenanceZone;
    if(zone)startTruckRoute(m4DrillTruckModel,zone,'return',!!s.mission5?.truckRelocated);
   }
   // Dynamic collider for truck
   m4TruckCollider={x:truckPos.x,z:truckPos.z,w:2.5,d:5,_truck:true};
   world.colliders.push(m4TruckCollider);
  }).catch(e=>{console.error('DrillTruck GLB load failed, using procedural:',e);m4DrillTruckModel=createProceduralTruck();initTruckRouteState(m4DrillTruckModel);const tp=s.mission4?.drillTruck?.position||{x:-13.5,z:-9.3};m4DrillTruckModel.position.set(tp.x,0.12,tp.z);world.scene.add(m4DrillTruckModel);if(s.mission4?.drillTruck?.maintenancePhase==='dispatch'){const z2=s.mission4.drillTruck.maintenanceZone;if(z2)startTruckRoute(m4DrillTruckModel,z2,'out',!!s.mission5?.truckRelocated);}else if(s.mission4?.drillTruck?.maintenancePhase==='return'){const z2=s.mission4.drillTruck.maintenanceZone;if(z2)startTruckRoute(m4DrillTruckModel,z2,'return',!!s.mission5?.truckRelocated);}m4TruckCollider={x:tp.x,z:tp.z,w:2.5,d:5,_truck:true};world.colliders.push(m4TruckCollider);});
 }
 m4VisualsReady=true;
}
function createProceduralTruck(){
 const g=new T.Group();g.name='drilltruck';
 const body=new T.Mesh(new T.BoxGeometry(2.2,1.4,4.5),new T.MeshToonMaterial({color:0xf6bc43}));
 body.position.set(0,0.9,0);body.castShadow=true;g.add(body);
 const cab=new T.Mesh(new T.BoxGeometry(2,1,1.5),new T.MeshToonMaterial({color:0x233c53}));
 cab.position.set(0,1.7,1.8);cab.castShadow=true;g.add(cab);
 for(const z of [1.5,0,-1.5])for(const x of [-1.1,1.1]){
  const wh=new T.Mesh(new T.CylinderGeometry(0.35,0.35,0.18,10),new T.MeshToonMaterial({color:0x222222}));
  wh.position.set(x,0.35,z);wh.rotation.z=Math.PI/2;wh.castShadow=true;g.add(wh);
 }
 return g;
}
function updateM4Visuals(dt){
 if(!m4VisualsReady||!s?.mission4)return;
 // Staging is visual only. The real protected machinery yard is a separate
 // proposed M5 build; never grant its safety score before construction.
 if(!m4Staging){m4Staging=createMachineryStaging();world.scene.add(m4Staging);}
 if(s.mission4.productionDrill&&!m4DthModel){
  m4DthModel=createDthProductionRig();
  const initialZone=s.mission4?.zones?.find(z=>z.id===s.mission4.productionDrill?.assignedZone);
  const p=initialZone?.position||DTH_RESERVE;
  m4DthModel.position.set(p.x,0,p.z);
  world.scene.add(m4DthModel);
  m4DthCollider={x:m4DthModel.position.x,z:m4DthModel.position.z,w:3.2,d:4.5,_dth:true};
  world.colliders.push(m4DthCollider);
 }
 if(m4DthModel){
  const drill=s.mission4.productionDrill;
  const assigned=drill?.assignedZone;
  const zone=assigned?s.mission4.zones.find(z=>z.id===assigned):null;
  const target=zone?.position||DTH_RESERVE;
  // On reload and delivery, never leave the model at origin or invisible.
  m4DthModel.position.x+=(target.x-m4DthModel.position.x)*Math.min(1,dt*3);
  m4DthModel.position.z+=(target.z-m4DthModel.position.z)*Math.min(1,dt*3);
  if(m4DthCollider){m4DthCollider.x=m4DthModel.position.x;m4DthCollider.z=m4DthModel.position.z;}
  // Drill animation runs only at the assigned site, never during relocation.
  const atSite=Math.hypot(target.x-m4DthModel.position.x,target.z-m4DthModel.position.z)<0.25;
  animateDthRig(m4DthModel,dt,atSite&&drill?.state==='producing');
 }
 // Ensure parking and truck are initialized on state change
 if(s.mission4.parkingBuilt&&!m4ParkingSpot)initM4Visuals();
 if(s.mission4.drillTruck&&!m4DrillTruckModel){m4VisualsReady=false;initM4Visuals();}
 // Animate truck route
 if(m4DrillTruckModel&&truckRouteActive(m4DrillTruckModel)){
  const routeEvent=updateTruckRoute(m4DrillTruckModel,dt);
  if(routeEvent==='arrived'){
   advanceMaintenancePhase(s);
  }else if(routeEvent==='returned'){
   advanceMaintenancePhase(s);
   autoDispatchTruck(s);
  }else if(routeEvent==='yard-arrived'){
   if(s.mission5){s.mission5.truckRelocated=true;s.mission5.truckRelocatedAt=Date.now();}
   if(s.mission4?.drillTruck)s.mission4.drillTruck.position={x:PATIO_L1.truckBay.x,z:PATIO_L1.truckBay.z};
   notices.push({title:'DrillTruck® · Patio L1',detail:'Vehículo resguardado en estacionamiento techado',symbol:'bell'});
   save();
  }
 }
 // Fix stuck: dispatch/return phase but no visual route → advance past it
 if(m4DrillTruckModel&&s.mission4.drillTruck?.maintenancePhase==='dispatch'&&!truckRouteActive(m4DrillTruckModel)){
  const zone=s.mission4.drillTruck.maintenanceZone;
  if(zone)startTruckRoute(m4DrillTruckModel,zone,'out',!!s.mission5?.truckRelocated);
 }
 if(m4DrillTruckModel&&s.mission4.drillTruck?.maintenancePhase==='return'&&!truckRouteActive(m4DrillTruckModel)){
  const zone=s.mission4.drillTruck.maintenanceZone;
  if(zone)startTruckRoute(m4DrillTruckModel,zone,'return',!!s.mission5?.truckRelocated);
 }
 // On M5 completion, drive the real DrillTruck from its M4 parking
 // into the roofed light-vehicle bay through the SINGLE permanent gate.
 if(s.mission5?.status==='operational'&&!s.mission5.truckRelocated&&
    s.mission4?.drillTruck?.state==='parked'&&!s.mission4.drillTruck.maintenancePhase&&
    m4DrillTruckModel&&!truckRouteActive(m4DrillTruckModel)){
   startTruckRoute(m4DrillTruckModel,null,'relocate');
 }
 // Auto-dispatch idle zones
 if(s.mission4.drillTruck&&!s.mission4.drillTruck.maintenancePhase&&s.mission4.drillTruck.state==='parked'&&
    !(s.mission5?.status==='operational'&&!s.mission5.truckRelocated)){
  autoDispatchTruck(s);
 }
 // Sync truck collider position
 if(m4TruckCollider&&m4DrillTruckModel){
  m4TruckCollider.x=m4DrillTruckModel.position.x;
  m4TruckCollider.z=m4DrillTruckModel.position.z;
  if(s.mission4?.drillTruck&&truckRouteActive(m4DrillTruckModel)){
   s.mission4.drillTruck.position={x:m4DrillTruckModel.position.x,z:m4DrillTruckModel.position.z};
  }
 }
}
function autoDispatchTruck(s){
 if(!s.mission4?.drillTruck||s.mission4.drillTruck.state!=='parked')return;
 // Permanent automation dispatches only when a tool has exhausted and stock exists.
 if(s.mission4.productionMode==='single-dth-v2'){
  if(!s.mission4.serviceRequested||!dthReplacementAvailable(s))return;
  const active=s.mission4.zones.find(z=>z.id===s.mission4.productionDrill?.assignedZone);
  if(!active)return;
  try{assignTruckToZone(s,active.id);startMaintenance(s,active.id);}
  catch(e){console.error('auto DTH service:',e);}
  return;
 }
 let nextZone=s.mission4.zones.find(z=>z.status==='idle');
 // If no idle zones but mission complete, cycle through producing zones for ongoing maintenance rounds
 if(!nextZone&&s.mission4.phase==='complete'){
  const producing=s.mission4.zones.filter(z=>z.status==='producing');
  if(producing.length){
   // Round-robin: pick zone with oldest lastCycleAt
   producing.sort((a,b)=>(a.lastMaintenanceAt||0)-(b.lastMaintenanceAt||0));
   nextZone=producing[0];
  }
 }
 if(!nextZone)return;
 try{assignTruckToZone(s,nextZone.id);startMaintenance(s,nextZone.id);nextZone.lastMaintenanceAt=Date.now();if(nextZone.status!=='maintenance')return;/* Routine automatic rounds do not need repeated toast messages. */}catch(e){console.error('autoDispatch:',e);}
}
async function replayCinematic(orbitOnly,record){if(!s)return;if(!orbitOnly&&!reviewBackup)await cameraReviewScene(s.character);closeModal();closePhone();closeBuilder();startCinematic(orbitOnly,true);if(record||orbitOnly){scene.update(s,0,Date.now());world.update(s,0,clock,false);world.renderer.last=0;world.renderer.render(world.scene,world.camera);const a=document.createElement('a');a.id='handoffDownload';a.download='DrillRun_Primer_Frame_3D.png';a.textContent='Descargar primer frame 3D';const data=world.renderer.domElement.toDataURL('image/png').split(',')[1],bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));a.href=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));cameraDebug.host.querySelector('#handoffDownload')?.remove();cameraDebug.host.append(a);if(record)cinemaRecorder.start();}}
function beginPlay(resuming=false){phase='play';blueprint=false;world.inspect=false;world.chapterCamera=null;world.zoom=1;resetOrbit(world.orbit);avatars.activate(s.character);world.setCharacter(s.character);motion.yaw=Number.isFinite(s.facing)?s.facing:Math.PI;world.player.rotation.y=motion.yaw;world.worker.reset();hidden($('#startScreen'),true);hidden($('#characterScreen'),true);hidden($('#intro'),true);hidden($('#hud'),false);world.avatarHeight=avatarDefinition(s.character).height;world.orbit.yaw=motion.yaw-Math.PI;world.snapCamera=true;world.cameraRig.finishEntrance();document.body.classList.remove('hudReveal');void $('#hud').offsetWidth;document.body.style.setProperty('--hud-duration',world.cameraRig.settings.transition.hudSeconds+'s');document.body.classList.add('hudReveal');wind.set(prefs.sound);worksiteAudio.set(prefs.sound);s.introSeen=true;stop();scene.update(s,0,Date.now());hsecWorld?.update(s,0,'play');initM3Visuals();ensureSafe();save();if(!resuming){hidden($('#chapterBanner'),false);setTimeout(()=>hidden($('#chapterBanner'),true),2600);}else toast('resumeNote');syncUIEvents();renderHUD();}
$('#skipIntro').onclick=()=>{if(phase!=='intro')return;cinematic.stop();world.cameraRig.reset();beginPlay(cinemaReview);cinemaRecorder?.stop();};$('#menuButton').onclick=showSettings;
function ensureSafe(){syncOfficeAccess(s);scene.state=s;const r=avatarDefinition(s.character).radius;if(!world.isBlocked(s.position.x,s.position.z,r))return;if(s.inside){for(const z of[-.65,.1,.65])for(const x of[-1.9,-1.1,0,1,2.2])if(!world.isBlocked(-6+x,z,r)){s.position={x:-6+x,z};world.worker.reset();return;}}const cx=s.position.x,cz=s.position.z;for(let d=.5;d<=10;d+=.5)for(let a=0;a<16;a++){const angle=a*Math.PI/8,tx=cx+Math.cos(angle)*d,tz=cz+Math.sin(angle)*d;if(!world.isBlocked(tx,tz,r)){s.position={x:tx,z:tz};s.inside=false;world.worker.reset();return;}}s.position={...CONFIG.officeSlot.access};s.inside=false;world.worker.reset();}
// ─── Narrative tick & actions ────────────────────────────
function pendingMissionReply(){
 return s?.narrative?.messages?.find(m=>!m.actionTaken&&
  m.actions?.some(a=>a.type==='accept'||a.type==='collect'))||null;
}
function showPendingMissionMessage(){
 const m=pendingMissionReply();if(!m)return false;
 phoneUI.narrativeCharacter=m.characterId;phoneUI.conversation=true;
 openPhone('messages');return true;
}
let narrativeTimer=0;
function narrativeTick(dt){
 // Let the player read the completion/reward overlay before the next briefing.
 if(!s||phase!=='play'||document.querySelector('.missionCompleteOverlay'))return;
 narrativeTimer+=dt;if(narrativeTimer<1.5)return;narrativeTimer=0;
 ensureNarrative(s);
 // Repair already-paid saves from previous versions: the end SMS may have
 // arrived silently while the Contract app was open. Show it exactly once
 // while unread; PhoneUI marks it read when Camila's thread is opened.
 const missedM3End=s.narrative.messages.find(m=>['n:m3:end','n:m4:end'].includes(m.id)&&!m.readAt&&!m.actionTaken);
 if(missedM3End&&!modalOpen&&!builderOpen&&!busy){
  phoneUI.narrativeCharacter=missedM3End.characterId;
  phoneUI.conversation=true;
  openPhone('messages');
  return;
 }
 const msg=pendingMessage(s);
 if(msg&&deliverMessage(s,msg.id)){
  const char=MISSION_NARRATIVES[msg.missionId]?.character;
  const charName=char?t(MISSION_NARRATIVES[msg.missionId].character==='benefactor'?'char_benefactor':char==='safetySpecialist'?'char_safety':'char_contract'):'';
  notices.push({title:charName||'Nuevo mensaje',detail:t(msg.bodyKey)?.slice(0,60)+'…',symbol:'messages',action:()=>{phoneUI.narrativeCharacter=msg.characterId;phoneUI.conversation=true;openPhone('messages');}});
  sound('ring');save();
  renderHUD();
  // M3 has already paid in completeContract(); its closing Camila message
  // must open by itself even if the player is still viewing the Contract app.
  // This only switches the phone view and never collects/pays a reward.
  const isM3Closing=msg.id==='n:m3:end'||msg.id==='n:m4:end';
  if((isM3Closing||msg.id.endsWith(':start'))&&!modalOpen&&!builderOpen&&!busy&&(!phoneOpen||isM3Closing)){
   phoneUI.narrativeCharacter=msg.characterId;
   phoneUI.conversation=true;
   openPhone('messages');
  }else if(phoneOpen&&phoneApp==='messages'&&!phoneUI.conversation)renderPhone();
 }
}
function handleNarrativeAction(actionType,missionId){
 if(!s)return;
 if(actionType==='accept'){
  if(acceptMission(s,missionId)){
   $('#objective').classList.remove('collapsed');
   sound('build');
   // Start the actual mission system
   if(missionId==='m2'&&s.hsec){/* HSEC already active from beginPlay or restore */}
   if(missionId==='m3'&&canStartMission3(s)&&(!s.mission3||s.mission3.phase==='inactive')){
    startMission3(s);notices.push({title:'Misión 3 desbloqueada — Tu primer contrato',symbol:'bell'});
   }
   if(missionId==='m4'&&canStartMission4(s)&&(!s.mission4||s.mission4.phase==='inactive')){
    startMission4(s);notices.push({title:'Misión 4 desbloqueada — Automatiza tu operación',symbol:'bell'});
   }
   save();if(phoneOpen)closePhone();renderHUD();
  }
 }else if(actionType==='collect'){
  const result=confirmCompletion(s,missionId);
  if(result){
   sound('finish');
   const paidContract=(s.ledger||[]).filter(e=>e.key==='contractPayment').at(-1)?.amount||0;
   showMissionComplete(t(result.name)||'Misión completada',
    missionId==='m3'?paidContract:result.cash,result.boosters,
    missionId==='m3'?'Pago ya acreditado al entregar el contrato':
    missionId==='m4'?'Producción automatizada habilitada':'');
   save();if(phoneOpen)closePhone();renderHUD();
  }
 }
}
function syncUIEvents(){
 if(!s)return;for(const event of collectUIEvents(s)){
  if(event.reward){if(event.id==='mission:clear'){s.boosters+=3;}rewardQueue.push(event);}
  else notices.push({id:event.id,title:t(event.title),detail:t(event.detail),symbol:event.icon,action:()=>{phoneUI.conversation=false;openPhone('messages');}});
 }save();
}
function showNextReward(){
 if(!rewardQueue.length||modalOpen||phoneOpen||placement||builderOpen||busy||phase!=='play')return;
 const event=rewardQueue.shift();
 // Subobjectives give a notice, not a premature mission completion modal.
 notices.push({title:t(event.detail),detail:event.id==='mission:clear'?'3 aceleradores disponibles':'Objetivo preparado',symbol:event.icon});
}
function showMissionComplete(name,cash,boosters,detail=''){
 document.querySelectorAll('.missionCompleteOverlay').forEach(el=>el.remove());
 const overlay=document.createElement('div');overlay.className='missionCompleteOverlay';
 overlay.innerHTML=`<div class="missionCompleteContent"><span class="missionCompleteLabel">COMPLETADO</span><span class="missionCompleteName">${esc(name)}</span><div class="missionCompleteRewards">${Number.isFinite(cash)&&cash>0?`<span>${icon('wallet')} +${money(cash)}</span>`:''}${boosters?`<span>${icon('boost')} +${boosters} Acelerador</span>`:''}${detail?`<span>${esc(detail)}</span>`:''}</div></div>`;
 document.body.append(overlay);requestAnimationFrame(()=>overlay.classList.add('visible'));
 const dismiss=()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),600);};
 setTimeout(dismiss,4000);
 overlay.onclick=dismiss;
}
function action(fn){const oldBuilt=s.office.status==='built',oldLevel=s.office.level;try{fn();scene.update(s,0,Date.now());ensureSafe();syncUIEvents();save();renderHUD();if(phoneOpen)renderPhone();if(!oldBuilt&&s.office.status==='built')onBuilt();if(oldLevel&&s.office.level>oldLevel)toast('upgradeComplete');if(builderOpen)builderUI.render();return true;}catch(e){toast(e.key||'invalid');return false;}}
function onBuilt(){scene.builtAt=Date.now();scene.burst(-6,0);sound('finish');}
function transition(key){setText($('#transitionText'),t(key));hidden($('#entryTransition'),false);clearTimeout(transition.timer);transition.timer=setTimeout(()=>hidden($('#entryTransition'),true),550);}
function nearInteraction(){if(!s)return null;
 if(!isMissionAccepted(s,'m1')&&!isMissionCollected(s,'m1'))return null;const nearest=CLEARABLES.filter(o=>!s.cleared.includes(o.id)).map(o=>({...o,distance:Math.hypot(o.x-s.position.x,o.z-s.position.z)})).filter(o=>o.distance<1.6).sort((a,b)=>a.distance-b.distance)[0];if(nearest)return {kind:'clear',object:nearest,label:'clearAction',blocked:s.energy<CONFIG.clearCost};
 if(!s.inside&&Math.hypot(s.position.x+7.99,s.position.z-2.9)<1.55)return pendingConstruction(s)?{kind:'boost',label:'accelerate'}:{kind:s.office.status==='built'?'enter':'build',label:s.office.status==='built'?'enter':'buildAction'};
 if(!s.inside&&s.workshop?.status!=='building'&&s.workshop&&Math.hypot(s.position.x+6.8,s.position.z+5.4)<2.5)return {kind:'workshop',label:'TALLER'};
 if(s.inside){if(Math.hypot(s.position.x+7.99,s.position.z-.8)<1.0)return {kind:'exit',label:'exit'};const computer=s.furniture.find(f=>s.inventory.find(v=>v.id===f.id)?.product==='computer');if(computer&&Math.hypot(s.position.x+6-computer.x,s.position.z-computer.z)<1.5)return {kind:'computer',label:'useComputer'};}
 if(hsecActive(s)&&!s.inside){const h=ensureHsec(s);if(h.employee&&Math.hypot(s.position.x-h.employee.position.x,s.position.z-h.employee.position.z)<1.8)return {kind:'hsecStaff',label:'Prevencionista HSEC',object:{...h.employee.position,id:h.employee.id,r:.5},category:'main'};const a=h.assets.filter(a=>!['vehicle','pedestrian','marking'].includes(a.type)&&Math.hypot(a.x-s.position.x,a.z-s.position.z)<2.8).sort((a,b)=>Math.hypot(a.x-s.position.x,a.z-s.position.z)-Math.hypot(b.x-s.position.x,b.z-s.position.z))[0];if(a)return {kind:'hsecAsset',label:'Inspeccionar activo',object:{...a,r:.6},category:'main'};}
 return null;
}
$('#handButton').onclick=()=>{if(busy||modalOpen||phoneOpen||builderOpen||placement)return;const a=phase==='play'?nearInteraction():null;if(!a)return;if(a.kind==='hsecStaff'){hsecUI.open('staff');return;}if(a.kind==='hsecAsset'){hsecUI.open('assets');return;}if(a.kind==='clear'){if(s.energy<CONFIG.clearCost)return toast('noEnergy');busy={object:a.object,elapsed:0};stop();sound('clear');}else if(a.kind==='build')showBuild();else if(a.kind==='boost')action(()=>accelerate(s));else if(a.kind==='workshop'){showWorkshopCard();return;}else if(a.kind==='enter')enterOffice();else if(a.kind==='exit'){transition('exitTransition');s.inside=false;s.position={...CONFIG.officeSlot.access};world.worker.reset();stop();save();}else if(a.kind==='computer'){if(!s.chapterCompletedAt){action(()=>useOfficeComputer(s));sound('finish');/* reward modal deferred to narrative confirmCompletion */return;}hsecUI.open();return;modal(`<span class="eyebrow">${esc(t('computer'))}</span><h2>${esc(t('next'))}</h2><p>${esc(t('nextDetail'))}</p><div class="modalActions">${button('close','closeComputer',true)}</div>`);$('#closeComputer').onclick=closeModal;}};
function openBuilder(){if(phase!=='play'||placement||busy)return;
 if(!isMissionAccepted(s,'m1')&&!isMissionCollected(s,'m1')){
  showPendingMissionMessage();return;
 }stop();closePhone();hsecWorld?.showAssetCard(null);builderOpen=true;hidden($('#builderPanel'),false);document.body.classList.add('builderOpen');if(hsecUI)hsecUI.mode=hsecActive(s);builderUI.open();}
function closeBuilder(){builderUI.close();if(hsecUI?.drawing)hsecUI.cancelDraft();builderUI.close();builderOpen=false;blueprint=false;hidden($('#builderPanel'),true);document.body.classList.remove('builderOpen');if(world)world.chapterCamera=null;}
function showBuild(){openBuilder();}
function buildTime(seconds){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
function confirmModule(m,zone){if(m.locked)return;if(action(()=>startModule(s,m.id,zone))){closeBuilder();sound('build');}}
function inspectModule(m,zone){modal(`<span class="eyebrow">${esc(t('technicalSheet'))}</span><h2>${esc(t(m.nameKey))}</h2><p>${esc(t(m.descriptionKey))}</p>${m.locked?`<p>${esc(t('futureChapter'))}</p>`:`<div class="moduleFacts"><span>${esc(t('cost'))}<b>${money(m.price)}</b></span><span>${esc(t('duration'))}<b>${buildTime(constructionSeconds(s,m))}</b></span><span>${esc(t('dimensions'))}<b>${m.width} × ${m.depth} m</b></span><span>${esc(t('capacity'))}<b>${m.capacity} ${esc(t(m.capacityKey))}</b></span></div><h3>${esc(t('includes'))}</h3><p>${m.components.map(k=>esc(t(k))).join(' · ')}</p><h3>${esc(t('benefits'))}</h3><p>${esc(t(m.benefitKey))}</p><small>${m.attributes.map(k=>esc(t(k))).join(' · ')}</small><h3>${esc(t('requirements'))}</h3><p>${m.requirements.map(k=>esc(t(k))).join(' · ')}</p><small>${esc(t('nextUpgrade'))}: ${esc(t(moduleDefinition(m.next)?.nameKey||'futureChapter'))}</small>`}<div class="modalActions">${button('close','closeModuleInfo',true)}</div>`);$('#modal').classList.add('moduleSheet');$('#closeModuleInfo').onclick=closeModal;}
function officeQuickCard(module,{upgrade=false}={}){
 const job=pendingConstruction(s),next=moduleDefinition(module.next),canUpgrade=next&&!next.locked;
 const lvlLabel=upgrade?t('upgradePreview'):`OFICINA · ${t('level').toUpperCase()} ${module.level||s.office.level||1}`;
 const price=upgrade?`<span class="buildCost">${icon('wallet')}<b>${money(module.price)}</b></span><span class="buildDuration">${icon('time')}${buildTime(constructionSeconds(s,module))}</span>`:'';
 modal(`<div class="officeQuickLayout"><div id="officePanelPreview" class="officePanelPreview" data-preview-label="${esc(t(module.nameKey))}"></div><div class="officeQuickInfo"><span class="eyebrow">${esc(lvlLabel)}</span><h2>${esc(t(module.nameKey))}</h2><p>${esc(t(module.benefitKey))}</p>${price}${job?`<small>${esc(t('constructionPending'))}</small>`:''}</div><div class="officeQuickActions">${upgrade?`<button id="buyOfficeUpgrade" class="primary" ${job||s.cash<module.price?'disabled':''}>${icon('wallet')}${esc(t('buyUpgrade'))}</button>${s.cash<module.price?`<small>${esc(t('noMoney'))}</small>`:''}${button('cancel','cancelOfficeUpgrade')}`:`${canUpgrade&&!job?`<button id="officeUpgrade">${icon('boost')}${esc(t('upgrade'))} · ${esc(t('level'))} ${next.level}</button>`:''}<button id="officeQuickEnter">${icon('arrow')}${esc(t(s.inside?'close':'enter'))}</button>${!canUpgrade?`<small>${esc(t('futureChapter'))}</small>`:''}`}</div></div>`);
 managingOffice=true;$('#modal').classList.add('officeQuick');if(upgrade)$('#modal').classList.add('upgradeSheet');
 officePanelPreview=new ProductPreview($('#officePanelPreview'),world,{transparent:true});officePanelPreview.setModule(module,true);
 $('#officeUpgrade')?.addEventListener('click',()=>{closeModal();previewOfficeUpgrade(next);});
 $('#officeQuickEnter')?.addEventListener('click',()=>{const inside=s.inside;closeModal();if(!inside)enterOffice();});
 $('#cancelOfficeUpgrade')?.addEventListener('click',()=>{closeModal();manageOffice();});
 $('#buyOfficeUpgrade')?.addEventListener('click',()=>{if(action(()=>startModule(s,module.id,'office01'))){closeModal();sound('build');}});
}
function manageOffice(){
 if(s.office.status!=='built')return;closePhone();closeBuilder();stop();officeQuickCard(moduleDefinition('office-l'+s.office.level));
}
function previewOfficeUpgrade(next){
 officeQuickCard(next,{upgrade:true});scene.setUpgradePreview(next.level);
}
function openPatioPanel(){
 if(!s||phase!=='play')return;
 closeBuilder();
 const status=patioState(s),allowed=patioUnlocked(s),info=patioProgress(s);
 const time=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 const stateLabel=status==='operational'?'OPERATIVO · HSEC APROBADO':
  status==='building'?'OBRA EN EJECUCIÓN · '+Math.round(info.progress*100)+'% · '+time(info.remainingSeconds):
  allowed?'DESBLOQUEADO · M4 COMPLETADA':'BLOQUEADO · COMPLETA M4';
 const modules=PATIO_L1.modules.map(x=>'<div class="patioModule">'+icon('check')+' '+esc(x)+'</div>').join('');
 const future=PATIO_FUTURE.map(x=>'<small class="patioFuture">'+icon('lock')+' Patio L'+x.level+' · ampliación bloqueada</small>').join('');
 const disabled=status!=='locked'||!allowed||s.cash<PATIO_L1.price;
 modal('<span class="eyebrow">MISIÓN 5 · EXPANSIÓN</span>'+
  '<h2>PATIO DE MAQUINARIAS L1</h2><p>Gran explanada fija en el noroeste de la faena. Único acceso controlado, vehículos ligeros bajo techo y RC, DTH y futuros CAEX menores a cielo abierto.</p>'+
  '<b class="patioStatus">'+stateLabel+'</b>'+
  '<div class="moduleFacts"><span>Inversión<b>🪙 '+money(PATIO_L1.price)+'</b></span><span>Construcción<b>20:00</b></span><span>Terreno<b>'+PATIO_L1.width+' × '+PATIO_L1.depth+'</b></span></div>'+
  (status==='building'?'<div class="patioModalTrack"><i style="width:'+Math.round(info.progress*100)+'%"></i></div><p>Fase actual: '+esc(info.label||'Preparación')+'</p>':'')+
  '<div class="patioModalModules">'+modules+'</div>'+
  '<p>Los módulos, señalización y rutas vienen incluidos. El taller existente se conserva. L2 y L3 quedan reservados.</p>'+
  '<div class="patioFutureList">'+future+'</div>'+
  '<div class="modalActions"><button id="m5Overview">'+icon('location')+' Ver terreno</button>'+
  (status==='locked'?'<button id="m5Confirm" class="primary" '+(disabled?'disabled':'')+'>'+icon('build')+' Construir L1</button>':'')+
  '<button id="m5Close">'+icon('close')+' Cerrar</button></div>');
 $('#m5Close').onclick=closeModal;
 $('#m5Overview').onclick=()=>{patioOverviewUntil=Date.now()+15000;closeModal();};
 $('#m5Confirm')?.addEventListener('click',()=>{
  try{
   startPatio(s,Date.now());
   save();closeModal();initM5Visuals();
   patioOverviewUntil=Date.now()+15000;
   renderHUD();sound('build');
   notices.push({title:'Patio L1 · Blueprint aprobado',detail:'Comienza obra de 20 minutos',symbol:'build'});
  }catch(e){notices.push({title:e.message==='noMoney'?'Saldo insuficiente':e.message,symbol:'lock'});}
 });
}
function showMission(){if(s?.mission5&&s.mission5.status!=='locked'){openPhone('m5-patio');return;}const m4On=s.mission4&&s.mission4.phase!=='inactive';const m3On=s.mission3&&s.mission3.phase!=='inactive';if(m4On){openPhone('m4-operaciones');return;}if(hsecActive(s)&&!(s.hsec.completedAt&&m3On)){hsecUI.open();return;}if(m3On){openPhone('m3-objectives');return;}const obj=objective(s);modal(`<span class="eyebrow">${esc(t('chapter'))}</span><h2>${esc(t(obj))}</h2><p>${esc(t(obj+'Detail'))}</p><div class="modalActions">${button('close','closeMission',true)}</div>`);$('#closeMission').onclick=closeModal;}
$('#boostButton').onclick=()=>action(()=>accelerate(s));
function enterOffice(){if(s.office.status!=='built'||pendingConstruction(s))return;transition('entryTransition');stop();world.office.userData.api.opened.entry=true;world.office.userData.api.angles.entry=Math.PI/2;s.position={x:-7.99,z:-.5};s.inside=true;s.hasEntered=true;world.worker.reset();$('#shade').classList.remove('entryFade');void $('#shade').offsetWidth;$('#shade').classList.add('entryFade');resetOrbit(world.orbit);syncUIEvents();save();renderHUD();}
function playerLevel(s){let lvl=1;if(s.cleared.length>=16)lvl=2;if(s.office.status==='built')lvl=3;if(s.chapterCompletedAt)lvl=4;if(s.hsec?.completedAt)lvl=5;if(s.mission3&&s.mission3.phase!=='inactive')lvl=6;if(s.mission3?.phase==='drilling'||s.mission3?.phase==='delivery')lvl=7;if(s.mission3?.phase==='complete')lvl=8;if(s.mission4&&s.mission4.phase!=='inactive')lvl=9;if(s.mission4?.phase==='complete')lvl=10;return lvl;}
/* Drill status card — shown on tap */
let drillCardOpen=false,drillCardMode='rc',dthCardLastRender=0;
function showDrillCard(){
 const dc=$('#drillCard');if(!dc||!s?.drill)return;
 dc.classList.remove('dthInspect');drillCardMode='rc';
 const d=s.drill,def=drillDefinition(d.id);
 const state=d.state||'idle';
 const stateLabel=state==='drilling'?'Perforando':state==='moving'?'Reposicionando':'Inactiva';
 const stateClass=state;
 const bhi=s.contract?.activeBoreholeIndex||0;
 const bh=s.boreholes?.[bhi];
 const depth=bh?Math.round(bh.depthDrilled):0;
 const target=bh?bh.depthTarget:0;
 const totalM=s.contract?Math.round(s.contract.metersCompleted):0;
 const totalT=s.contract?s.contract.totalMeters:90;
 // Tool conditions
 const bit=d.installedBit?(s.toolInventory||[]).find(t=>t.id===d.installedBit):null;
 const hammer=d.installedHammer?(s.toolInventory||[]).find(t=>t.id===d.installedHammer):null;
 const bitPct=bit?Math.round(toolCondition(bit)):0;
 const hamPct=hammer?Math.round(toolCondition(hammer)):0;
 const barClass=v=>v>40?'good':v>15?'warn':'crit';
 const bitName=bit?bitDefinition(bit.model)?.nameKey||bit.model:'—';
 const hamName=hammer?hammerDefinition(hammer.model)?.nameKey||hammer.model:'—';
 dc.innerHTML=`<button class="dcClose" id="drillCardClose">${icon('close')}</button>`
  +`<div class="dcHead">${icon('drill')||icon('build')}<div><b>${def?.labelKey?'Perforadora RC':'Perforadora'}</b><small>${def?.id==='rig_rc_advanced'?'Alta Capacidad':'Compacta'} · ${def?.bitDiameter||6.5}" Ø</small></div></div>`
  +`<span class="dcState ${stateClass}">${stateLabel}</span>`
  +`<div class="dcGrid"><div class="dcStat"><span>Sondaje</span><b>${bh?bh.id.replace('BH-','#'):'—'}</b></div><div class="dcStat"><span>Profundidad</span><b>${depth}/${target}m</b></div><div class="dcStat"><span>Total avance</span><b>${totalM}/${totalT}m</b></div><div class="dcStat"><span>Progreso</span><b>${totalT>0?Math.round(totalM/totalT*100):0}%</b></div></div>`
  +`<div class="dcTool">${icon('wrench')}<span>Bit</span><div class="dcTrack"><div class="dcFill ${barClass(bitPct)}" style="width:${bitPct}%"></div></div><b>${bitPct}%</b></div>`
  +`<div class="dcTool">${icon('wrench')}<span>Martillo</span><div class="dcTrack"><div class="dcFill ${barClass(hamPct)}" style="width:${hamPct}%"></div></div><b>${hamPct}%</b></div>`;
 dc.querySelector('#drillCardClose').onclick=e=>{e.stopPropagation();hideDrillCard();};
 dc.hidden=false;drillCardOpen=true;
}
function hideDrillCard(){const dc=$('#drillCard');if(dc){dc.hidden=true;dc.classList.remove('dthInspect');}drillCardOpen=false;drillCardMode='rc';}

function showDthDrillCard(){
 const dc=$('#drillCard'),report=dthRigInspection(s);
 if(!dc||!report)return;
 const states={producing:'Perforando',moving:'Cambiando de punto',paused:'Detenida · requiere consumibles',idle:'En espera',maintenance:'Mantenimiento'};
 const toolState=tool=>tool.status==='spent'?'AGOTADO':tool.status==='missing'?'SIN INSTALAR':tool.remaining<=0?'AGOTADO':'INSTALADO';
 const barClass=p=>p>40?'good':p>15?'warn':'crit';
 const fmtMeters=n=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(Math.max(0,n||0));
 const toolRow=(label,tool)=>`<section class="dthInspectTool">
  <div class="dthInspectToolHeader"><b>${esc(label)}</b><span class="${tool.remaining>0?'':'dthInspectEmpty'}">${toolState(tool)}</span></div>
  <strong>${esc(tool.name)}</strong><div class="dthInspectLife"><span>Vida útil restante</span><b>${fmtMeters(tool.remaining)} / ${fmtMeters(tool.total)} m</b></div>
  <div class="dthInspectTrack"><div class="dcFill ${barClass(tool.percent)}" style="width:${tool.percent}%"></div></div>
  <small>${tool.percent}% disponible · ${fmtMeters(tool.used)} m utilizados</small>
 </section>`;
 const clock=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 const previousScroll=drillCardMode==='dth'?dc.scrollTop:0;
 dc.classList.add('dthInspect');
 dc.innerHTML=`<button class="dcClose" id="drillCardClose" aria-label="Cerrar ficha DTH">${icon('close')}</button>
  <div class="dcHead">${icon('machine')}<div><b>PERFORADORA DTH · PRODUCCIÓN</b><small>PUMA® BY DRILLCO® · Ficha de consumibles</small></div></div>
  <span class="dcState ${report.state==='producing'?'drilling':report.state==='moving'?'moving':'idle'}">${esc(states[report.state]||report.state)}</span>
  <div class="dcGrid">
    <div class="dcStat"><span>Punto activo</span><b>${esc(report.zoneId||'—')}</b></div>
    <div class="dcStat"><span>Ciclos registrados</span><b>${fmtMeters(report.cycleCount)}</b></div>
  </div>
  ${toolRow('BIT DTH',report.bit)}
  ${toolRow('MARTILLO PUMA®',report.hammer)}
  <div class="dthInspectFooter"><b>Avance productivo: ${fmtMeters(report.metersProduced)} m</b>
   <small>${report.nextSeconds===null?report.state==='paused'?'Producción detenida. Revisa stock y servicio DrillTruck®.':report.state==='moving'?'DTH trasladándose al siguiente punto.':'Esperando próximo ciclo de producción.':'Próximo ciclo: '+clock(report.nextSeconds)}</small>
  </div>`;
 dc.querySelector('#drillCardClose').onclick=e=>{e.stopPropagation();hideDrillCard();};
 dc.hidden=false;dc.scrollTop=previousScroll;drillCardOpen=true;drillCardMode='dth';dthCardLastRender=Date.now();
}

/* Workshop status card — shown on tap */
let workshopCardOpen=false,workshopDemolishPending=false;
function showWorkshopCard(){
 const wc=$('#workshopCard');if(!wc||!s)return;
 const lvl=workshopLevel(s),cap=workshopCapacity(s),used=workshopUsed(s),free=workshopFree(s);
 const lvlDef=WORKSHOP_LEVELS.find(w=>w.level===lvl);
 const nextDef=WORKSHOP_LEVELS.find(w=>w.level===lvl+1);
 const pct=cap>0?Math.round(used/cap*100):0;
 const barColor=pct>85?'#ef5350':pct>60?'#ffb74d':'#4caf50';
 const bits=(s.toolInventory||[]).filter(t=>t.type==='bit'&&t.status!=='spent').length;
 const hammers=(s.toolInventory||[]).filter(t=>t.type==='hammer'&&t.status!=='spent').length;
 const spent=(s.spentMaterials||[]).length;
 const job=workshopUpgradeJob(s);
 const buildPct=job?Math.round((workshopUpgradeProgress(s)||0)*100):0;
 const buildTime=v=>{const m=Math.floor(v/60),ss=v%60;return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0');};
 const canDemolish=canDemolishWorkshop(s)===null;
 const canUpgrade=!job&&nextDef&&s.cash>=nextDef.upgradeCost;
 wc.innerHTML=`<button class="dcClose" id="workshopCardClose">${icon('close')}</button>`
  +`<div class="dcHead">${icon('wrench')}<div><b>TALLER</b><small>Nv.${lvl} · ${lvlDef?.label||'Básico'}</small></div><span class="dcLevel">Nv.${lvl}</span></div>`
  +`<div class="dcGrid"><div class="dcStat"><span>Capacidad</span><b>${used}/${cap}</b></div><div class="dcStat"><span>Libres</span><b>${free}</b></div><div class="dcStat"><span>Bits</span><b>${bits}</b></div><div class="dcStat"><span>Martillos</span><b>${hammers}</b></div></div>`
  +`<div class="dcTool">${icon('store')}<span>Ocupación</span><div class="dcTrack"><div class="dcFill" style="width:${pct}%;background:${barColor}"></div></div><b>${pct}%</b></div>`
  +(spent?`<div style="font-size:9px;color:#9ec5dd;margin-top:4px;text-align:center">${spent} material${spent>1?'es':''} usado${spent>1?'s':''}</div>`:'')
  +(job?`<div class="dcConstruction"><div class="dcConstructLabel">${icon('time')} Ampliación a Nv.${job.targetLevel} en curso</div><div class="dcTrack"><div class="dcFill" style="width:${buildPct}%;background:#64b5f6"></div></div><b>${buildPct}%</b><small>Restante: ${buildTime(Math.max(0,Math.ceil((job.ends-Date.now())/1000)))}</small><button class="dcBoost" id="workshopBoost" ${(s.boosters||0)<1||Date.now()>=job.ends?'disabled':''} title="Consume 1 acelerador y reduce hasta 60 segundos">${icon('boost')} Acelerar 1 min · ${s.boosters||0} disponible${s.boosters===1?'':'s'}</button></div>`:'')
  +(s.mission4?.phase&&s.mission4.phase!=='inactive'?`<div class="dcTool" style="margin-top:9px"><b>MAQUINARIA Y HERRAMIENTAS</b><small>RC: ${s.drill?'En resguardo':'Sin máquina'} · DTH: ${s.mission4.productionDrill?(s.mission4.productionDrill.assignedZone?'En zona '+s.mission4.productionDrill.assignedZone:'En resguardo'):'Sin recibir'}</small><button id="workshopDthManage" class="dcBoost">${icon('inventory')} Ver stock · Instalar herramientas en DTH</button></div>`:'' )
  +`<div class="dcActions">`
  +(canUpgrade&&!job?`<button class="dcUpgrade" id="workshopUpgradeBtn">${icon('boost')} Ampliar a Nv.${nextDef.level}<small>${money(nextDef.upgradeCost)} · ${buildTime(nextDef.constructionSeconds)}</small></button>`:'')
  +(!nextDef&&!job?`<small class="dcMaxLevel">${icon('check')} Nivel máximo alcanzado</small>`:'')
  +(job?'':(canDemolish?`<button class="dcDemolish" id="workshopDemolishBtn">${icon('close')} Demoler</button>`:''))
  +`</div>`;
 wc.querySelector('#workshopCardClose').onclick=e=>{e.stopPropagation();hideWorkshopCard();};
 wc.querySelector('#workshopDthManage')?.addEventListener('click',()=>{hideWorkshopCard();openPhone('m4-workshop');});
 wc.querySelector('#workshopUpgradeBtn')?.addEventListener('click',()=>{workshopStartUpgrade();});
 wc.querySelector('#workshopBoost')?.addEventListener('click',()=>{
  try{
   const boost=accelerateWorkshop(s,60);
   save();renderHUD();showWorkshopCard();
   notices.push({title:'Taller acelerado · -'+Math.ceil(boost.secondsReduced)+' s',detail:boost.boostersLeft+' acelerador(es) disponibles',symbol:'boost'});
   if(boost.remainingSeconds<=0){
    finishWorkshopUpgrade(s);
    save();renderHUD();showWorkshopCard();
    updateMission4Phase(s);
    world.updateWorkshop(s.workshop);
    notices.push({title:'Taller ampliado a Nv.'+workshopLevel(s),symbol:'bell'});
    sound('finish');
   }
  }catch(e){
   showWorkshopCard();
   notices.push({title:e.message==='noBoosters'?'Sin aceleradores disponibles':e.message==='constructionFinished'?'La ampliación ya terminó':'No se pudo acelerar la construcción',symbol:'lock'});
  }
 });
 wc.querySelector('#workshopDemolishBtn')?.addEventListener('click',()=>{workshopConfirmDemolish();});
 wc.hidden=false;workshopCardOpen=true;
}
function detectWorkshopObstacles(){
 // Only actual SAVED, BUILT HSEC installations can be reported. Walking over
 // the entire 3D render scene previously mislabelled every mesh above 2m
 // (including workshop walls, scenery and light fixtures) as a "light post".
 const staticTypes={
  tower:'Torre de iluminación',
  post:'Poste de iluminación',
  sign:'Señal HSEC',
  extinguisher:'Extintor',
  fence:'Cierre perimetral',
  railing:'Baranda',
  bollard:'Bolardo',
  cone:'Cono de seguridad'
 };
 return (s.hsec?.assets||[])
  .filter(a=>a.status==='built'&&staticTypes[a.type]&&Number.isFinite(a.x)&&Number.isFinite(a.z)
   &&a.x>-4.5&&a.x<0&&a.z>-12.5&&a.z<-6.2)
  .map(a=>({id:a.id,x:a.x,z:a.z,type:staticTypes[a.type],icon:['tower','post'].includes(a.type)?'light':'lock'}));
}
function workshopStartUpgrade(){
 const nextDef=WORKSHOP_LEVELS.find(w=>w.level===workshopLevel(s)+1);
 if(!nextDef)return;
 const buildTime=v=>{const m=Math.floor(v/60),ss=v%60;return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0');};
 const obstacles=detectWorkshopObstacles();
 const obstacleHtml=obstacles.length?`<div style="margin:10px 0;padding:8px 12px;background:#ff980015;border:1px solid #ff980044;border-radius:10px"><small style="color:#ffb74d;font-weight:600">Instalaciones HSEC registradas cerca de la ampliación (no se eliminan automáticamente):</small>${obstacles.map(o=>`<div style="font-size:11px;color:#fff;margin-top:4px">${icon(o.icon)} ${esc(o.type)} (${o.x.toFixed(1)}, ${o.z.toFixed(1)})</div>`).join('')}</div>`:'';
 modal(`<span class="eyebrow">TALLER · AMPLIACIÓN</span><h2>Ampliar a Nv.${nextDef.level} — ${nextDef.label}</h2><p>Aumenta la capacidad del taller de ${workshopCapacity(s)} a ${nextDef.capacity} espacios para herramientas.</p>${obstacleHtml}<div class="moduleFacts"><span>Costo<b>${money(nextDef.upgradeCost)}</b></span><span>Duración<b>${buildTime(nextDef.constructionSeconds)}</b></span><span>Capacidad<b>${nextDef.capacity} espacios</b></span></div><div class="modalActions"><button id="cancelWsUpgrade">${icon('close')} Cancelar</button><button id="confirmWsUpgrade" class="primary" ${s.cash<nextDef.upgradeCost?'disabled':''}>${icon('wallet')} Confirmar ampliación</button></div>${s.cash<nextDef.upgradeCost?'<small style="color:#ef5350;text-align:center;display:block;margin-top:8px">Fondos insuficientes</small>':''}`);
 $('#cancelWsUpgrade').onclick=closeModal;
 $('#confirmWsUpgrade')?.addEventListener('click',()=>{try{upgradeWorkshop(s);save();closeModal();hideWorkshopCard();showWorkshopCard();scene.update(s,0,Date.now());renderHUD();sound('build');notices.push({title:`Ampliación a Nv.${nextDef.level} iniciada`,symbol:'bell'});}catch(e){notices.push({title:e.message==='noMoney'?'Fondos insuficientes':e.message,symbol:'lock'});}});
}
function workshopConfirmDemolish(){
 modal(`<span class="eyebrow" style="color:#ef5350">⚠ DEMOLICIÓN</span><h2>¿Demoler taller?</h2><p>El taller volverá a Nv.1 (${WORKSHOP_LEVELS[0].capacity} espacios). Las herramientas excedentes se perderán. Esta acción <b>no tiene reembolso</b>.</p><div class="modalActions"><button id="cancelWsDemolish">${icon('close')} Cancelar</button><button id="confirmWsDemolish" style="background:#ef5350;color:white">${icon('close')} Confirmar demolición</button></div>`);
 $('#cancelWsDemolish').onclick=closeModal;
 $('#confirmWsDemolish')?.addEventListener('click',()=>{
  closeModal();
  // Second confirmation
  modal(`<span class="eyebrow" style="color:#ef5350">⚠ CONFIRMACIÓN FINAL</span><h2>¿Estás seguro?</h2><p>Esta acción es irreversible. El taller volverá a nivel básico.</p><div class="modalActions"><button id="cancelWsDemolish2">${icon('close')} No, cancelar</button><button id="finalWsDemolish" style="background:#ef5350;color:white">Sí, demoler</button></div>`);
  $('#cancelWsDemolish2').onclick=closeModal;
  $('#finalWsDemolish')?.addEventListener('click',()=>{try{demolishWorkshop(s);save();closeModal();hideWorkshopCard();showWorkshopCard();scene.update(s,0,Date.now());renderHUD();notices.push({title:'Taller demolido a Nv.1',symbol:'bell'});}catch(e){notices.push({title:e.message,symbol:'lock'});}});
 });
}
function hideWorkshopCard(){const wc=$('#workshopCard');if(wc)wc.hidden=true;workshopCardOpen=false;workshopDemolishPending=false;}
function renderHUD(){if(!s)return;
 // The last mission remains visible until its narrative closing message is confirmed.
 // Once confirmed, retire the objective card; keep production, saves and HSEC data intact.
 const narrativeMission=activeNarrativeMission(s);
 // Mission objectives appear only after the opening message is accepted.
 hidden($('#objective'),!narrativeMission);
 $('#phoneButton').classList.toggle('missionAwaiting',!!pendingMissionReply());
 setText($('#cashValue'),money(s.cash));setText($('#energyValue'),Math.floor(s.energy)+' / '+CONFIG.maxEnergy);setText($('#boostValue'),s.boosters);const unread=unreadMessages(s).length;hidden($('#phoneBadge'),!unread);setText($('#phoneBadge'),unread);if(avatars&&lastPortraitId!==s.character){lastPortraitId=s.character;$('#playerAvatar').innerHTML=avatars.portrait(s.character);}$('#hud').dataset.avatar=s.character;setText($('#playerName'),s.playerName||t('operatorName'));const lvl=playerLevel(s);setText($('#levelValue'),lvl);const m3On=s.mission3&&s.mission3.phase!=='inactive';const m4HudOn=s.mission4&&s.mission4.phase!=='inactive';const missionSub=s.mission5?(s.mission5.status==='operational'?'Misión 5 · Patio operativo':'Misión 5 · Patio de Maquinarias'):m4HudOn?(s.mission4.phase==='complete'?'Misión 4 · Completada':'Misión 4 · Automatiza tu operación'):m3On?(s.mission3.phase==='complete'?'Misión 3 · Completada':'Misión 3 · Tu primer contrato'):s.hsec?.completedAt?'Misión 2 · Completada':s.chapterCompletedAt?'Misión 1 · Completada':'Misión 1 · '+t('firstSteps');setText($('#playerMission'),
 !isMissionAccepted(s,'m1')&&!isMissionCollected(s,'m1')?'Esperando mensaje de bienvenida':
 !narrativeMission?'Esperando nueva misión':missionSub);$('#playerProgress').style.width=(s.chapterCompletedAt?100:s.office.status==='built'?66:s.cleared.length===16?33:Math.round(s.cleared.length/16*33))+'%';
 /* Geo analysis floating card */
 const geo=s.geoAnalysis;const geoCard=$('#geoCard');if(geoCard){const geoActive=!!(geo&&geo.requested&&!geo.completed);const geoDone=!!(geo&&geo.completed);const m3DrillingOrLater=s.mission3&&['drilling','delivery','complete'].includes(s.mission3.phase);const geoDismissed=!!(geo&&geo.cardDismissed)||!!(s.mission3?.reportRead)||m3DrillingOrLater;const showCard=(geoActive||(geoDone&&!s.mission3?.reportRead))&&!geoDismissed;if(geoCard._shown!==showCard){geoCard._shown=showCard;hidden(geoCard,!showCard);}if(showCard){hidden($('#geoDismiss'),!geoDone);if(geoActive){const elapsed=(Date.now()-(geo.analysisStartedAt||Date.now()))/1000;const dur=geo.analysisDuration||75;const pct=Math.min(1,elapsed/dur);setText($('#geoTitle'),'Análisis geológico');setText($('#geoDetail'),Math.round(pct*100)+'% completado');$('#geoProgressBar').style.width=(pct*100)+'%';geoCard.classList.remove('complete');}else if(geoDone){setText($('#geoTitle'),'Informe disponible');setText($('#geoDetail'),'Toca para revisar');$('#geoProgressBar').style.width='100%';geoCard.classList.add('complete');}}}const obj=objective(s);const objectiveEyebrow=$('#objective .eyebrow');if(objectiveEyebrow)objectiveEyebrow.textContent=narrativeMission==='m1'?'MISIÓN 1':'MISIÓN ACTUAL';setText($('#objectiveTitle'),t(obj));setText($('#objectiveDetail'),t(obj+'Detail'));let value=0,count='';if(obj==='clear'){value=s.cleared.length/CLEARABLES.length;count=s.cleared.length+' / '+CLEARABLES.length;}else if(obj==='admin'){value=s.chapterCompletedAt?1:s.hasEntered?.75:0;count='';}else value=obj==='next'?1:progress(s);$('#objectiveProgress').style.width=(value*100)+'%';setText($('#objectiveCount'),count);
 // M1 presentation only: show live removal totals; no mutation of mission state.
 if(narrativeMission==='m1'){
  const detail=$('#objectiveDetail');
  if(detail){
   detail.classList.remove('hidden');
   const translated=t(obj+'Detail');
   detail.textContent=obj==='clear'
    ?'Obstáculos retirados: '+s.cleared.length+' de '+CLEARABLES.length+'. '+translated
    :translated;
  }
 }
 const m3Active=s.mission3&&s.mission3.phase!=='inactive';
 if(narrativeMission==='m2'&&hsecActive(s)){
  const checklist=mission2Readout(s);
  const completed=!!s.hsec?.completedAt;
  const eyebrow=$('#objective .eyebrow');
  if(eyebrow)eyebrow.textContent=completed?'MISIÓN COMPLETADA':'MISIÓN 2';
  const title=$('#objectiveTitle');
  if(title)title.textContent=completed?'Operación preparada':'Prepara tu operación';
  const detail=$('#objectiveDetail');
  if(detail){
   detail.classList.remove('hidden');
   const next=checklist.pending;
   detail.textContent=next?next.name+(next.value?' · '+next.value:''):'Requisitos HSEC cumplidos';
   detail.title=next?next.hint:'Todos los requisitos HSEC se han cumplido.';
  }
  setText($('#objectiveCount'),completed?'✓':checklist.done+'/'+checklist.total);
  $('#objectiveProgress').style.width=(checklist.done/checklist.total*100)+'%';
}
 if(narrativeMission==='m3'&&m3Active){
  const checklist=mission3Readout(s);
  const eyebrow=$('#objective .eyebrow');
  if(eyebrow)eyebrow.textContent='MISIÓN 3';
  const title=$('#objectiveTitle');
  if(title)title.textContent='Tu Primer Contrato';
  const detail=$('#objectiveDetail');
  if(detail){
   detail.classList.remove('hidden');
   const next=checklist.pending;
   detail.textContent=next?next.name+(next.value?' · '+next.value:''):'Todos los objetivos completados. Revisa el mensaje final.';
   detail.title=next?next.hint:'Todos los requisitos del contrato están cumplidos.';
  }
  $('#objectiveProgress').style.width=(checklist.progress*100)+'%';
  setText($('#objectiveCount'),s.mission3.phase==='complete'?'✓':checklist.done+'/'+checklist.total);
}
 /* Mission 3 contract timer: freeze upon physical drilling completion.
    A previously completed 90/90 contract must not display a misleading
    expired 00:00 while waiting for the user to submit from the phone. */
 const timerEl=$('#missionTimer');
 if(timerEl){
  const contract=s.contract;
  const showTimer=!!(m3Active&&contract?.drillingStartedAt&&['active','completed'].includes(contract.status));
  hidden(timerEl,!showTimer);
  if(showTimer){
   const done=isContractComplete(s);
   const finishedAt=done?drillingCompletedAt(s):null;
   const deadline=contractDeadline(s);
   const measuredAt=finishedAt||Date.now();
   const remaining=Math.max(0,(deadline||measuredAt)-measuredAt);
   const totalDur=contract.duration*1000;
   const secs=Math.ceil(remaining/1000);
   const mins=Math.floor(secs/60),ss=secs%60;
   const bh=(s.boreholes||[]).filter(b=>b.status==='completed').length;
   const totalHoles=(s.boreholes||[]).length;
   $('#timerTitle').textContent=done?'PERFORACIÓN COMPLETA':'TIEMPO RESTANTE';
   $('#timerValue').textContent=done?'LISTO':String(mins).padStart(2,'0')+':'+String(ss).padStart(2,'0');
   const pct=done?1:totalDur>0?remaining/totalDur:0;
   $('#timerProgress').style.width=(pct*100)+'%';
   $('#timerDetail').textContent=done
    ?'Sondajes '+bh+'/'+totalHoles+' · '+contract.totalMeters+'/'+contract.totalMeters+' m · Entregar contrato'
    :'Sondaje '+Math.min(bh+1,totalHoles)+'/'+totalHoles+' · '+Math.round(contract.metersCompleted)+'/'+contract.totalMeters+' m';
   timerEl.classList.toggle('complete',done);
   timerEl.classList.toggle('warning',!done&&pct<.3&&pct>=.1);
   timerEl.classList.toggle('danger',!done&&pct<.1);
  }else{
   timerEl.classList.remove('complete','warning','danger');
  }
 }
 // Real first DTH production-cycle countdown (M4): right-side compact card.
 // Reads the persisted zone.lastCycleAt, the same timestamp that grants income.
 const cycleEl=$('#productionCycleTimer');
 if(cycleEl){
  const cycle=firstProductionCycleStatus(s,Date.now());
  const show=phase==='play'&&cycle.visible;
  hidden(cycleEl,!show);
  if(show){
   const seconds=cycle.remainingSeconds;
   const title=cycle.phase==='producing'?'PRIMER CICLO DTH':
    cycle.phase==='maintenance'?'MANTENIMIENTO DTH':
    cycle.phase==='waiting'?'DTH EN ESPERA':'INGRESO EN PROCESO';
   $('#productionCycleTitle').textContent=title;
   $('#productionCycleValue').textContent=Number.isFinite(seconds)?
    String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'):
    cycle.phase==='maintenance'?'EN SERVICIO':'PENDIENTE';
   $('#productionCycleProgress').style.width=(100*cycle.progress)+'%';
   $('#productionCycleDetail').textContent=cycle.phase==='producing'?
    'Zona '+cycle.zoneId+' · ingreso al finalizar':
    cycle.phase==='maintenance'?'Zona '+cycle.zoneId+' · esperando habilitación':
    cycle.phase==='waiting'?'Zona '+cycle.zoneId+' · requiere DrillTruck':
    'Validando ingreso de producción';
   cycleEl.classList.toggle('cycleReady',cycle.phase==='finishing');
  }else cycleEl.classList.remove('cycleReady');
 }
 // M4 objective panel — same ordered checks as the operations workbench.
 const m4Active=s.mission4&&s.mission4.phase!=='inactive';
 if(narrativeMission==='m4'&&m4Active){
  const view=mission4Readout(s);
  const phase4=s.mission4.phase;
  const eyebrow=$('#objective .eyebrow');
  if(eyebrow)eyebrow.textContent=phase4==='complete'?'MISIÓN COMPLETADA':'MISIÓN 4';
  const title=$('#objectiveTitle');
  if(title)title.textContent=phase4==='complete'?'Operación automatizada':'Automatiza tu operación';
  const detail=$('#objectiveDetail');
  if(detail){
   detail.classList.remove('hidden');
   detail.textContent=view.next?view.next.label:'Todos los requisitos de producción completados';
   detail.title=view.next?view.next.description:'Misión completada';
  }
  $('#objectiveProgress').style.width=(view.progress*100)+'%';
  setText($('#objectiveCount'),phase4==='complete'?'✓':view.done+'/'+view.total);
 }
 // Status pill is derived from real mission state, never hardcoded.
 const missionDone=narrativeMission==='m4'?s.mission4?.phase==='complete':narrativeMission==='m3'?s.mission3?.phase==='complete':narrativeMission==='m2'?!!s.hsec?.completedAt:narrativeMission==='m1'?!!s.chapterCompletedAt:false;
 const missionStage=$('#missionStage');
 if(missionStage)missionStage.textContent=missionDone?'COMPLETADA':'EN CURSO';
 $('#objective').classList.toggle('missionDone',missionDone);
 const m4Playing=m4Active&&s.mission4.phase!=='complete';const m3Playing=m3Active&&s.mission3.phase!=='complete';
 hsecUI?.update();
  // Permanent, useful navigation in gameplay — not dependent on an unfinished mission.
  // Keep original game/phone/HSEC actions; the six destinations simply expose them.
  hidden($('#bottomNav'),phase!=='play');
  // One contextual fifth dock slot: HSEC until M3, Operaciones from M4 onward.
  // The upper HSEC control and phone app remain available throughout.
  const m4DockUnlocked=!!(s.mission4&&s.mission4.phase!=='inactive');
  const operationsNav=$('#bottomNav [data-nav="m4-operations"]');
  if(operationsNav)hidden(operationsNav,!m4DockUnlocked);
  const hsecNav=$('#bottomNav [data-nav="hsec"]');
  if(hsecNav)hidden(hsecNav,m4DockUnlocked);
 const job=pendingConstruction(s),building=!!job;hidden($('#buildHud'),!building);if(building){const seconds=Math.max(0,Math.ceil((job.ends-Date.now())/1000));setText($('#buildTime'),String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'));$('#buildProgress').value=progress(s);$('#boostButton').disabled=s.boosters<1;}
 const pBuild=$('#patioBuildHud'),m5Job=s?.mission5?.status==='building';
 if(pBuild){hidden(pBuild,!m5Job);if(m5Job){const p=patioProgress(s);setText($('#patioBuildTime'),String(Math.floor(p.remainingSeconds/60)).padStart(2,'0')+':'+String(p.remainingSeconds%60).padStart(2,'0'));setText($('#patioBuildPhase'),p.label||'En construcción');$('#patioBuildProgress').style.width=(p.progress*100)+'%';}}
 const a=phase==='play'?nearInteraction():null;$('#handButton').disabled=!a||!!busy||!!a?.blocked;$('#handButton').classList.toggle('available',!!a&&!a.blocked);$('#handButton').classList.toggle('blocked',!!a?.blocked);scene?.setInteraction(a,s);$('#handButton').setAttribute('aria-label',a?t(a.blocked?'noEnergy':a.kind==='boost'?'boostAction':a.label):t('hand'));$('#handButton').style.setProperty('--action-progress',busy?Math.min(1,busy.elapsed/CONFIG.clearSeconds):0);$('#handButton').style.opacity=a||busy?'1':'.45';document.body.classList.toggle('interior',s.inside);if(obj!==lastObjective){lastObjective=obj;$('#hud').dataset.objective=obj;}$('#hud').dataset.cleared=s.cleared.length;$('#hud').dataset.chapterComplete=String(!!s.chapterCompletedAt);
}
function openPhone(app='home'){if(placement||phase!=='play')return;stop();closeBuilder();hsecWorld?.showAssetCard(null);hideDrillCard();hideWorkshopCard();if(!['home','messages','bank','inventory','objectives'].includes(app)&&!app.startsWith('m3-')&&!app.startsWith('m4-')&&!app.startsWith('m5-'))app='messages';stop();phoneApp=app;phoneOpen=true;hidden($('#phone'),false);hidden($('#phoneShade'),false);document.body.classList.add('phoneOpen');renderPhone();}
function closePhone(){stop();phoneUI.release();phoneOpen=false;hidden($('#phoneShade'),true);hidden($('#phone'),true);document.body.classList.remove('phoneOpen');}
const phoneUI=new PhoneUI({shell:$('#phone'),content:$('#phoneContent'),title:$('#phoneTitle'),back:$('#phoneBack'),state:()=>s,translate:()=>t,format:money,getWorld:()=>world,onSave:save,onHUD:renderHUD,onNavigate:app=>{if(app==='builder'){openBuilder();return;}phoneApp=app;renderPhone();},onClose:closePhone,onTransfer:(direction,amount)=>{if(action(()=>transfer(s,direction,amount)))notices.push({title:t('transactionDone'),detail:money(s.cash),symbol:'bank'});},
onM3Action:(type,data)=>{try{
 if(type==='hire'){hirePersonnel(s,data,data+'-01');notices.push({title:'Personal contratado',symbol:'bell'});}
 else if(type==='buyDrill'){const d=drillDefinition(data);if(d){placeMachineryOrder(s,'drill',data,d.price);notices.push({title:'Perforadora solicitada · en camino',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}}
 else if(type==='acceptContract'){acceptContract(s,data);notices.push({title:'Contrato aceptado',symbol:'bell'});}
 else if(type==='completeContract'){const result=completeContract(s);notices.push({title:'Contrato entregado · espera confirmación',detail:money(result.reward),symbol:'messages'});}
 else if(type==='requestGeo'){requestAnalysis(s);technicianArrives(s);startAnalysisTimer(s);notices.push({title:'Análisis geológico solicitado',symbol:'bell'});}
 else if(type==='accelerateGeo'){accelerateAnalysis(s);notices.push({title:'Análisis acelerado',symbol:'bell'});}
 else if(type==='addToCart'){const [type,model,price]=data.split(':');placeOrder(s,[{type,model,qty:1,unitPrice:Number(price)}]);notices.push({title:'Pedido enviado a Casa Matriz',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='installTool'){installTool(s,data);notices.push({title:'Herramienta instalada',symbol:'bell'});}
 else if(type==='startDrilling'){startDrilling(s);notices.push({title:'Perforación iniciada',symbol:'bell'});}
 else if(type==='upgradeWorkshop'){upgradeWorkshop(s);notices.push({title:'Ampliación del taller iniciada',symbol:'bell'});}
 else if(type==='locateMachinery'){closePhone();const pos=data==='drill'&&m3DrillModel?{x:m3DrillModel.position.x,z:m3DrillModel.position.z}:data==='drillTruck'&&s.mission4?.drillTruck?s.mission4.drillTruck.position:null;if(pos)target={x:pos.x,z:pos.z};return;}
 updateMission3Phase(s);save();renderHUD();renderPhone();
 // Deliver Camila's closing message immediately on contract submission;
 // the 1.5s background poll remains a safe fallback on existing saves.
 if(type==='completeContract'&&s.mission3?.phase==='complete')narrativeTick(1.5);
}catch(e){const msg=e.message==='noCapacity'?'Sin espacio en el taller — amplía capacidad':e.message==='noMoney'?'Fondos insuficientes':e.message==='constructionPending'?'Ampliación en curso':e.message;notices.push({title:msg,symbol:'lock'});}},
onM4Action:(type,data)=>{try{
 if(type==='buyDthDrill'){placeMachineryOrder(s,'dthDrill',data||'rig_dth_production',DTH_DRILLS[0]?.price||28000);notices.push({title:'Perforadora DTH solicitada · 3 min de entrega',detail:'Llegará a resguardo junto al taller',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='orderDthTool'){const h=dthHammerDefinition(data);const b=dthBitDefinition(data);const def=h||b;if(!def)throw new Error('invalid');placeOrder(s,[{type:h?'hammer':'bit',model:def.id,qty:1,unitPrice:def.price}]);notices.push({title:(def.label||def.id)+' solicitado a Casa Matriz',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='installDthTool'){installDthTool(s,data);notices.push({title:'Herramienta DTH instalada',detail:'Revisa martillo y bit en Taller',symbol:'bell'});}
 else if(type==='convertZone'){convertBoreholeToZone(s,data);notices.push({title:data+' convertido a zona',symbol:'bell'});}
 else if(type==='assignDthDrill'){assignDthDrillToZone(s,data);notices.push({title:'DTH desplegada en zona',detail:'El DrillTruck debe realizar mantenimiento antes de iniciar producción',symbol:'bell'});}
 else if(type==='buyTruck'){placeMachineryOrder(s,'drillTruck','drilltruck',DRILLTRUCK_COST);notices.push({title:'DrillTruck solicitado · en camino',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='linkTruck'){assignTruckToZone(s,data);startMaintenance(s,data);notices.push({title:'DrillTruck vinculado a '+data,symbol:'bell'});}
 else if(type==='buildParking'){buildParking(s);notices.push({title:'Estacionamiento construido',symbol:'bell'});m4VisualsReady=false;initM4Visuals();}
 else if(type==='upgradeWorkshop'){upgradeWorkshop(s);notices.push({title:'Ampliación del taller iniciada',symbol:'bell'});}
 else if(type==='hireTecnico'){hirePersonnel(s,'tecnicoDrillco','tecnico-01');notices.push({title:'Técnico DRILLCO contratado',symbol:'bell'});}
 updateMission4Phase(s);save();renderHUD();renderPhone();
}catch(e){const msg=e.message==='noMoney'?'Fondos insuficientes':e.message;notices.push({title:msg,symbol:'lock'});}},
onNarrativeAction:handleNarrativeAction,
});
$('#builderButton').onclick=openBuilder;
$('#patioBuildHud')?.addEventListener('click',()=>{if(phase==='play')openPatioPanel();});
$('#patioBuildHud')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(phase==='play')openPatioPanel();}});
 $$('#bottomNav [data-nav]').forEach(b=>b.onclick=()=>{
  const nav=b.dataset.nav;
  if(nav==='builder'){openBuilder();return;}
  if(nav==='hsec'){if(!isMissionAccepted(s,'m2')&&!isMissionCollected(s,'m2')){if(!showPendingMissionMessage())openPhone('objectives');return;}if(hsecUI&&s?.hsec)hsecUI.open();else openPhone('objectives');return;}
  if(nav==='m4-operations'){if(s?.mission4&&s.mission4.phase!=='inactive')openPhone('m4-operaciones');return;}
  if(nav==='m4-zones'){openPhone(s?.mission4?.phase&&s.mission4.phase!=='inactive'?'m4-zones':'objectives');return;}
  if(nav==='m3-contract'){openPhone(s?.mission3?.phase&&s.mission3.phase!=='inactive'?'m3-contract':'objectives');return;}
  if(nav==='m3-inventory'){openPhone(s?.mission4?.phase&&s.mission4.phase!=='inactive'?'m4-workshop':s?.mission3?.phase&&s.mission3.phase!=='inactive'?'m3-inventory':'inventory');return;}
  if(nav==='m3-personnel'){openPhone(s?.mission3?.phase&&s.mission3.phase!=='inactive'?'m3-personnel':'home');return;}
  openPhone(nav);
 });$('#phoneButton').onclick=()=>{if(phoneOpen)closePhone();else if(!showPendingMissionMessage())openPhone();};$('#closePhone').onclick=$('#phoneShade').onclick=closePhone;$('#phoneBack').onclick=()=>phoneUI.backApp();$('#money').onclick=()=>notices.push({title:t('cash'),detail:money(s.cash),symbol:'wallet'});
$('#objective').onclick=e=>{if(e.target.closest('#objToggle'))return;showMission();};$('#objective').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showMission();}};
$('#objToggle').onclick=e=>{e.stopPropagation();$('#objective').classList.toggle('collapsed');const gc=$('#geoCard');if(gc&&gc._shown===false)gc.classList.add('hidden');};
$('#geoDismiss').onclick=e=>{e.stopPropagation();if(s?.geoAnalysis){s.geoAnalysis.cardDismissed=true;save();renderHUD();}};
$('#geoCard').onclick=()=>{if(s?.geoAnalysis?.completed){openPhone('m3-geology');if(s.geoAnalysis){s.geoAnalysis.cardDismissed=true;save();}}};
$('#hsecInline').onclick=e=>{e.stopPropagation();if(hsecUI)hsecUI.open();};
let geoRefreshTimer=0;
const builderUI=new BuilderUI({host:$('#builderPanel'),state:()=>s,translate:()=>t,format:money,onClose:closeBuilder,onSelection:m=>{selectedBuildModule=m;blueprint=!!m;},onConfirm:confirmModule,onInspect:inspectModule,onManage:manageOffice,onWorkshopManage:()=>{showWorkshopCard();},
onPhoneNav:app=>{closeBuilder();openPhone(app);},
onPatioAction:()=>openPatioPanel(),
onCatalogAction:(type,data)=>{try{
 if(type==='buildWorkshop'){buildWorkshop(s);notices.push({title:'Construcción del taller L1 iniciada · 30 s',symbol:'build'});}
 else if(type==='buyDrill'){const d=drillDefinition(data);if(!d)throw new Error('invalid');placeMachineryOrder(s,'drill',data,d.price);notices.push({title:'Perforadora solicitada · en camino',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='buyDthDrill'){const id=data||'rig_dth_production';placeMachineryOrder(s,'dthDrill',id,DTH_DRILLS[0]?.price||28000);notices.push({title:'Perforadora DTH solicitada · 3 min de entrega',detail:'Llegará a resguardo junto al taller',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='buyTruck'){placeMachineryOrder(s,'drillTruck','drilltruck',DRILLTRUCK_COST);notices.push({title:'DrillTruck solicitado · en camino',symbol:'bell'});if(m3DeliveryVehicle)departDelivery(m3DeliveryVehicle);}
 else if(type==='hire'){if(data==='tecnicoDrillco'){hirePersonnel(s,'tecnicoDrillco','tecnico-01');updateMission4Phase(s);}else{hirePersonnel(s,data,data+'-01');updateMission3Phase(s);}notices.push({title:'Personal contratado',symbol:'bell'});}
 save();renderHUD();builderUI.render();
}catch(e){const msg=e.message==='noMoney'?'Fondos insuficientes':e.message==='noCapacity'?'Sin espacio en el taller':e.message;notices.push({title:msg,symbol:'lock'});}}
});
function renderPhone(){if(s){phoneUI.render(phoneApp);if(phoneApp==='m3-geology'&&s.mission3?.reportRead){updateMission3Phase(s);save();renderHUD();}}}
// Legacy furniture placement is retired. Keep Escape/scene cleanup safe for older sessions.
function cancelPlacement(){placement=null;scene?.cancelPlacement();document.body.classList.remove('placing');hidden($('#placementBar'),true);}
function renderPlacement(){} // No manual placement in prefab construction mode.
function joyMove(e){const r=$('#joystick').getBoundingClientRect(),max=r.width*.30;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,l=Math.hypot(x,y);if(l>max){x*=max/l;y*=max/l;}joy={x:x/max,y:y/max};$('#joyKnob').style.transform=`translate(${x}px,${y}px)`;}
$('#joystick').onpointerdown=e=>{pointer=e.pointerId;e.currentTarget.setPointerCapture(pointer);target=null;joyMove(e);};$('#joystick').onpointermove=e=>{if(pointer===e.pointerId)joyMove(e);};$('#joystick').onpointerup=$('#joystick').onpointercancel=$('#joystick').onlostpointercapture=resetJoy;
$('#cameraHome').onclick=()=>{world.zoom=1;resetOrbit(world.orbit);world.cameraRig.reset();persistCamera();};
// Input focus belongs to foreground UI: do not steal arrow keys, scrolling
// or movement keys when the player is reading or purchasing from the phone.
addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeModal();closePhone();closeBuilder();if(placement)cancelPlacement();stop();return;}
 if(phoneOpen||modalOpen||e.target.closest?.('#phone,#modal,input,select,textarea,[contenteditable]'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
 keys[e.key.toLowerCase()]=true;
 if(e.key.toLowerCase()==='e'&&!e.repeat&&phase==='play')$('#handButton').click();
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',()=>{stop();save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
document.addEventListener('pointercancel',()=>{if(pointer!==null)resetJoy();});
addEventListener('pagehide',()=>{stop();save();void cloudFlushNow(CONFIG.saveKey);});
function move(dt){let x=joy.x,y=joy.y;if(keys.w||keys.arrowup)y--;if(keys.s||keys.arrowdown)y++;if(keys.a||keys.arrowleft)x--;if(keys.d||keys.arrowright)x++;const len=Math.hypot(x,y);x/=Math.max(1,len);y/=Math.max(1,len);let intent=cameraRelativeIntent(x,y,world.cameraRig.heading);
 if(len>.025)target=null;else if(target){const dx=target.x-s.position.x,dz=target.z-s.position.z,d=Math.hypot(dx,dz);if(d<.08)target=null;else intent={x:dx/d*Math.min(1,d/.3),z:dz/d*Math.min(1,d/.3)};}
 return applyMovement(intent,dt);
}
function applyMovement(intent,dt){
 const result=moveController(s.position,motion,intent,dt,(xx,zz)=>world.isBlocked(xx,zz,avatarDefinition(s.character).radius+.045));world.player.rotation.y=result.yaw;s.facing=result.yaw;if(target&&result.speed<.01&&Math.hypot(intent.x,intent.z)>.1&&Math.cos(Math.atan2(intent.x,intent.z)-result.yaw)>.95)target=null;return result.speed>.025;
}
function frame(now){if(!qa)requestAnimationFrame(frame);const dt=Math.min(.08,Math.max(0,(now-last)/1000));last=now;clock+=dt;if(document.body.dataset.phase!==phase)document.body.dataset.phase=phase;if(!s)return;const wall=Date.now(),result=phase==='play'?tick(s,wall):{};if(result.built||result.upgraded){if(result.built)onBuilt();if(result.upgraded){scene.burst(-6,0);toast('upgradeComplete');}syncUIEvents();if(phoneOpen)renderPhone();if(builderOpen)builderUI.render();}
 if(phase==='intro')cinematic.update(dt);
 if(phase==='play'&&hsecActive(s)&&isMissionAccepted(s,'m2')&&!document.hidden){ensureHsec(s);hsecElapsed+=dt;if(hsecElapsed>=1){tickHsec(s,hsecElapsed);if(!s.hsec.grantNotified){s.hsec.grantNotified=true;notices.push({title:'Misión 2 · Prepara tu operación',detail:`Capital de desarrollo: ${money(B.startingGrant)} · abre el panel HSEC para comenzar.`,symbol:'hsec:management'});}hsecElapsed=0;hsecUI.cachedEval=evaluation(s);const signature=[s.hsec.revision,s.hsec.orders.map(o=>o.status).join(','),s.hsec.inspection?.id,s.hsec.employee?.blocked,s.hsec.completedAt].join('|');if(signature!==hsecLastSignature){hsecLastSignature=signature;if(s.hsec.employee?.blocked)notices.push({title:'Prevencionista detenido',detail:s.hsec.employee.blocked,symbol:'lock'});if(hsecUI.panelOpen)hsecUI.refresh();if(s.hsec.completedAt&&!s.hsec.completionNotified){s.hsec.completionNotified=true;/* reward modal deferred to narrative confirmCompletion */}
 if(s.hsec.completedAt&&isMissionAccepted(s,'m3')&&canStartMission3(s)&&(!s.mission3||s.mission3.phase==='inactive')){startMission3(s);notices.push({title:'Misión 3 desbloqueada — Tu primer contrato',symbol:'bell'});save();}save();}}moveNpc(s,dt);}
 if(phase==='play'){narrativeTick(dt);/* Workshop L1 construction tick */if(finishWorkshopConstruction(s,Date.now())){save();renderHUD();notices.push({title:'Taller L1 construido',symbol:'bell'});sound('finish');updateMission3Phase(s);}
 /* M5 fixed modular yard real-time construction. No reward is minted on completion. */
  if(finishPatio(s,wall)){save();renderHUD();if(phoneOpen)renderPhone();notices.push({title:'Misión 5 · Patio L1 operativo',detail:'Inspección HSEC finalizada · acceso habilitado',symbol:'bell'});sound('finish');}
 /* Workshop upgrade construction tick */const wsJob=workshopUpgradeJob(s);if(wsJob&&Date.now()>=wsJob.ends){finishWorkshopUpgrade(s);save();renderHUD();if(workshopCardOpen)showWorkshopCard();notices.push({title:`Taller ampliado a Nv.${workshopLevel(s)}`,symbol:'bell'});sound('finish');updateMission4Phase(s);}if(workshopCardOpen&&wsJob)showWorkshopCard();world.updateWorkshop(s.workshop);
 initM3Visuals();const m3events=tickMission3(s,dt,wall);if(m3events){for(const e of m3events){if(typeof e==='object'&&e.type==='machineryDelivered'){
  const m=e.machinery;
  if(m.type==='drill'){try{purchaseDrill(s,m.model,true);spawnM3Drill(m.model);notices.push({title:'Perforadora entregada',detail:'Localizar en faena',symbol:'bell',action:()=>{if(m3DrillModel){target={x:m3DrillModel.position.x-2.5,z:m3DrillModel.position.z+3.8};closePhone();closeBuilder();}}});updateMission3Phase(s);}catch(err){console.error('drill delivery:',err);}}
  else if(m.type==='dthDrill'){try{purchaseDthDrill(s,m.model,true);notices.push({title:'Perforadora DTH entregada',detail:'En resguardo junto al taller · Equípala en Taller',symbol:'bell'});updateMission4Phase(s);}catch(err){console.error('dth delivery:',err);}}
  else if(m.type==='drillTruck'){try{purchaseDrillTruck(s,true);m4VisualsReady=false;initM4Visuals();notices.push({title:'DrillTruck entregado',detail:'Ubicar en faena',symbol:'bell',action:'locateTruck'});updateMission4Phase(s);}catch(err){console.error('truck delivery:',err);}}
  if(m3DeliveryVehicle)startDelivery(m3DeliveryVehicle,'in');
 }else if(e==='deliveryArrived'){notices.push({title:'Pedido entregado',symbol:'bell'});if(m3DeliveryVehicle)startDelivery(m3DeliveryVehicle,'in');}else if(e==='analysisComplete'){notices.push({title:'Informe geológico disponible',symbol:'bell'});if(phoneOpen)renderPhone();}else if(e==='bitExhausted')notices.push({title:'Bit agotado — requiere recambio',symbol:'lock'});else if(e==='hammerExhausted')notices.push({title:'Martillo agotado — requiere recambio',symbol:'lock'});else if(e==='contractReady')notices.push({title:'Contrato completado — entrega disponible',symbol:'bell'});}save();}updateM3Visuals(dt);
  /* Refresh phone geo/contract every ~2s while open */
  if(phoneOpen&&(phoneApp==='m3-geology'||phoneApp==='m3-contract'||phoneApp==='m3-catalog'||phoneApp==='m3-orders'||phoneApp==='m4-drilltruck'||phoneApp==='m4-zones'||phoneApp==='m4-operaciones'||phoneApp==='m4-workshop'||phoneApp==='m4-dth-catalog')){geoRefreshTimer=(geoRefreshTimer||0)+dt;const deliveryView=phoneApp==='m3-orders'||phoneApp==='m3-catalog';if(geoRefreshTimer>=(deliveryView?1:2)){geoRefreshTimer=0;const c=$('#phoneContent');const scrollTop=c?.scrollTop||0;renderPhone();if(c)c.scrollTop=scrollTop;}}else geoRefreshTimer=0;
  if(drillCardOpen){if(drillCardMode==='dth'){if(wall-dthCardLastRender>=350)showDthDrillCard();}else showDrillCard();}
  // === M4 tick ===
  initM4Visuals();const m4events=tickMission4(s,dt,wall);if(m4events){for(const e of m4events){if(e==='incomeGenerated'){/* Auto-credit silently. The wallet and production report display actual funds. */}else if(e==='maintenanceComplete'){notices.push({title:'Mantenimiento completado',symbol:'bell'});if(phoneOpen)renderPhone();}else if(e==='truckDispatch'&&m4DrillTruckModel){const zone=s.mission4.drillTruck?.maintenanceZone;if(zone)startTruckRoute(m4DrillTruckModel,zone,'out',!!s.mission5?.truckRelocated);}else if(e==='truckReturn'&&m4DrillTruckModel){const zone=s.mission4.drillTruck?.maintenanceZone;if(zone)startTruckRoute(m4DrillTruckModel,zone,'return',!!s.mission5?.truckRelocated);}else if(e==='missionComplete'){
   // The first actual production income completed M4. Keep the DTH running
   // and deliver the benefactor's closing message instead of showing a
   // premature 4-second overlay before narrative confirmation.
   sound('finish');
   notices.push({title:'Primer ciclo DTH completado',detail:'Ingresos acreditados · confirma el cierre de Misión 4 en Mensajes',symbol:'bell'});
   narrativeTick(1.5);
  }}save();}
  updateM4Visuals(dt);
  initM5Visuals(wall);
  // Auto-start M4 when M3 completes
  if(s.mission3?.phase==='complete'&&s.contract?.status==='delivered'&&isMissionAccepted(s,'m4')&&canStartMission4(s)&&(!s.mission4||s.mission4.phase==='inactive')){startMission4(s);notices.push({title:'Misión 4 desbloqueada — Automatiza tu operación',symbol:'bell'});save();}
  }
 avatars?.updateSelector(phase==='character',selectedAvatar,s,dt,clock);characterStage?.update(phase==='character',clock,selectedAvatar);
 if(phase==='character'){world.chapterCamera={target:new T.Vector3(-4.55+Math.max(0,Math.min(.5,(730-innerWidth)/324)),1.0,5.35),offset:new T.Vector3(0,.55,6.1)};}
 else if(phase==='play'&&patioOverviewUntil>wall)world.chapterCamera={target:new T.Vector3(PATIO_L1.center.x,1,PATIO_L1.center.z),offset:new T.Vector3(39,42,44)};
 else world.chapterCamera=null;
 world.avatarHeight=avatarDefinition(s.character).height;
// Catalog browsing (including collapsing) is UI-only: do not force a builder camera.
// Only an actual HSEC in-world placement/drawing or office preview uses the overhead view.
const inWorldConstruction=builderOpen&&!!(hsecUI?.drawing||hsecUI?.coneZone);
world.cameraMode=inWorldConstruction||managingOffice?'builder':s.inside?'interior':'explore';
world.cameraFocus=inWorldConstruction?hsecUI.focus():managingOffice?{x:-6,z:0}:null;
 // While drafting an HSEC construction, the SAME joystick now navigates the
 // overhead camera. It never moves the avatar or changes placed geometry.
 if(inWorldConstruction&&!phoneOpen&&!modalOpen&&!busy){
  let px=joy.x,py=joy.y;
  if(keys.w||keys.arrowup)py--;
  if(keys.s||keys.arrowdown)py++;
  if(keys.a||keys.arrowleft)px--;
  if(keys.d||keys.arrowright)px++;
  const mag=Math.hypot(px,py);
  if(mag>.08){
   px/=Math.max(1,mag);py/=Math.max(1,mag);
   const relative=cameraRelativeIntent(px,py,world.cameraRig.heading);
   const speed=Math.max(7,Math.min(35,(world.cameraRig.builderZoom||22)*.72));
   world.cameraRig.panBuilder(relative.x*speed*dt,relative.z*speed*dt);
  }
 }
 if(qa&&hsecFollow&&s.hsec?.employee){const n=s.hsec.employee;world.chapterCamera={target:new T.Vector3(n.position.x,.95,n.position.z),offset:new T.Vector3(-Math.sin(n.yaw)*4.75,1.65,-Math.cos(n.yaw)*4.75)};}
 if(managingOffice){world.chapterCamera={target:new T.Vector3(-3.9,1,0),offset:world.chapterUpgradePreview?new T.Vector3(2.7,5.6,6.1):new T.Vector3(6.5,4.5,8.5)};}
 const movable=!cameraDebug?.freeze&&phase==='play'&&!builderOpen&&!modalOpen&&!phoneOpen&&!placement&&!busy&&innerWidth>innerHeight;let walking=false;if(movable)walking=locomotionReview?.active?locomotionReview.step(dt):move(dt);else motion.vx=motion.vz=motion.speed=0;
 if(phase==='play'&&busy){busy.elapsed+=dt;if(busy.elapsed>=CONFIG.clearSeconds){const obj=busy.object;busy=null;if(action(()=>clearObject(s,obj.id,wall))){scene.burst(obj.x,obj.z);if(s.cleared.length===CLEARABLES.length){qaRoute=false;qaWalkRoute=null;target=null;}}}}
 if(phase==='play'&&syncOfficeAccess(s)){syncUIEvents();save();}
 // Auto-dismiss cards when player walks away from objects
 if(phase==='play'){
  if(drillCardOpen&&drillCardMode==='rc'&&m3DrillModel&&Math.hypot(s.position.x-m3DrillModel.position.x,s.position.z-m3DrillModel.position.z)>8)hideDrillCard();
  if(workshopCardOpen&&s.workshop&&Math.hypot(s.position.x+7.6,s.position.z+9.3)>11)hideWorkshopCard();
  if(hsecWorld&&hsecWorld.assetCardId&&s.hsec){const _ac=s.hsec.assets?.find(a=>a.id===hsecWorld.assetCardId);if(_ac){const _ad=Math.hypot(s.position.x-_ac.x,s.position.z-_ac.z);if(_ad>8)hsecWorld.showAssetCard(null);}}
 }
 if(world.worker)world.worker.clearing=busy?1:0;
 scene.update(s,dt,wall,{blueprint,interactive:phase==='play'});hsecWorld?.update(s,dt,phase);if(phase==='play'&&world.isBlocked(s.position.x,s.position.z,avatarDefinition(s.character).radius))ensureSafe();world.update(s,dt,clock,walking,false,false);
 // Environmental spectacle + sound read the actual saved/world state only.
 // They never write mission, contract, economy or placement data.
 const activeRC=!!s.drill&&s.drill.state==='drilling';
 const activeDTH=s.mission4?.productionDrill?.state==='producing';
 const movingTruck=!!m4DrillTruckModel&&truckRouteActive(m4DrillTruckModel);
 const siteInputs={drill:activeDTH?m4DthModel:m3DrillModel,truck:m4DrillTruckModel,drilling:activeRC||activeDTH,truckMoving:movingTruck,playing:phase==='play'&&!document.hidden};
 siteCinematics?.update(s,dt,clock,siteInputs);
 worksiteAudio.update(s,dt,{...siteInputs,
  drill:activeRC?m3DrillModel:activeDTH?m4DthModel:null,
  drilling:activeRC||activeDTH,
  position:s.position,moving:walking&&!builderOpen&&!phoneOpen&&!modalOpen,
  walkSurfaces:world.walkSurfaces||[]
 });
 constructionCallout?.update(s,phase==='play'&&!builderOpen&&!modalOpen&&!phoneOpen,t);world.player.visible=phase!=='start'&&(phase!=='character'||!!CONFIG.protagonists.find(p=>p.id===selectedAvatar)?.available);
 guidance?.update(s,phase==='play'&&!builderOpen&&!modalOpen&&!phoneOpen&&!placement);if(phase==='play')showNextReward();
 if(now-lastHud>150){renderHUD();cameraDebug?.update();lastHud=now;}if(now-lastSave>2000){save();lastSave=now;}
 if(qaComputerPath&&phase==='play'&&!phoneOpen&&!modalOpen){while(qaComputerPath.length&&Math.hypot(qaComputerPath[0].x-s.position.x,qaComputerPath[0].z-s.position.z)<.12)qaComputerPath.shift();if(qaComputerPath.length)target={...qaComputerPath[0]};else qaComputerPath=null;}
 if(qaRoute&&phase==='play'&&!busy&&!phoneOpen&&!modalOpen){
  const obj=CLEARABLES.filter(o=>!s.cleared.includes(o.id)).sort((a,b)=>Math.hypot(a.x-s.position.x,a.z-s.position.z)-Math.hypot(b.x-s.position.x,b.z-s.position.z))[0];
  if(!obj){qaRoute=false;qaWalkRoute=null;target=null;}
  else if(Math.hypot(s.position.x-obj.x,s.position.z-obj.z)<1.5){qaWalkRoute=null;$('#handButton').click();}
  else {if(qaWalkRoute?.id!==obj.id)qaWalkRoute={id:obj.id,path:reviewPath(s.position,obj,(x,z)=>world.isBlocked(x,z,.33),1.25)};while(qaWalkRoute.path.length&&Math.hypot(qaWalkRoute.path[0].x-s.position.x,qaWalkRoute.path[0].z-s.position.z)<.12)qaWalkRoute.path.shift();if(qaWalkRoute.path.length)target={...qaWalkRoute.path[0]};}
 }

}
function installQA(){
 const bar=document.createElement('div');bar.id='chapterQA';bar.style.cssText='position:absolute;z-index:95;bottom:12px;left:145px;display:flex;gap:6px';
 bar.innerHTML='<button id="qaHide">Ocultar revisión</button><button id="qaHsecSave">QA · guardar muestra</button><button id="qaHsecRestore">QA · recuperar muestra</button><button id="qaHsecFollow">QA · seguir prevencionista</button><button id="qaHsecRecord">QA · grabar recorrido 12 s</button><button id="qaHsec">QA · comenzar Misión 2</button><button id="qaHsecSetup">QA · montar infraestructura</button><button id="qaHsecWear">QA · desgaste barrera</button><button id="qaHsecNight">QA · noche</button><button id="qaClear">QA · recorrido de limpieza</button><button id="qaBuild">QA · punto de obra</button><button id="qaComputer">QA · computador</button><select id="qaAvatar" aria-label="Avatar de revisión">'+CONFIG.protagonists.map(p=>`<option value="${p.id}">${p.id}</option>`).join('')+'</select><button id="qaWalk">QA · grabar caminata 4 m</button>';
 document.body.append(bar);$('#qaHide').onclick=()=>bar.classList.add('hidden');locomotionReview=new LocomotionReview({world,state:()=>s,avatars,motion,applyMovement,onChange:id=>{s.specialty=avatarDefinition(id).roleKey;s.bonuses={...avatarDefinition(id).bonuses};renderHUD();}});
 $('#qaHsecSave').onclick=()=>{if(hsecActive(s)){localStorage.setItem(CONFIG.saveKey+'-hsec-review',JSON.stringify(s));notices.push({title:'Muestra guardada por separado',symbol:'check'});}};
 $('#qaHsecRestore').onclick=async()=>{const recovered=restore(JSON.parse(localStorage.getItem(CONFIG.saveKey+'-hsec-review')||'null'));if(!recovered)return;if(!reviewBackup)reviewBackup={state:s?JSON.parse(JSON.stringify(s)):null,hasSave};restoreHsec(recovered);s=recovered;await avatars.load(s.character);beginPlay(true);hsecUI.open();};
 $('#qaHsecFollow').onclick=()=>{hsecFollow=!hsecFollow;};
 $('#qaHsecRecord').onclick=()=>{hsecRecorder??=new CinematicRecorder(world,cinematic,bar);hsecFollow=true;hsecRecorder.start();setTimeout(()=>hsecRecorder.stop(),12000);};
 $('#qaHsec').onclick=async()=>{await cameraReviewScene(s.character,'office');s.inside=true;useOfficeComputer(s);s.inside=false;s.position={...CONFIG.officeSlot.access};tickHsec(s,0);hsecUI.open();};
 $('#qaHsecSetup').onclick=()=>{if(!hsecActive(s))return;const first=!s.hsec.assets.length;if(!first)return;if(s.office.level<2){startModule(s,'office-l2','office01');accelerate(s);}for(const type of ['shed','vehicle','pedestrian','crossing','railing','tower','tower','tower','tower','cone','cone','cone','cone','cone','cone','sign','extinguisher']){buildAsset(s,type,suggestedPose(s,type));tickHsec(s,26);}hsecUI.refresh();};
 $('#qaHsecWear').onclick=()=>{const a=s.hsec?.assets.find(a=>a.type==='railing');if(a){a.condition.visual=35;s.position={x:a.x-1,z:a.z+1};s.hsec.revision++;hsecUI.open('assets');}};
 $('#qaHsecNight').onclick=()=>{if(s.hsec){const day=Math.floor(s.hsec.time/600);s.hsec.time=day*600+300;hsecUI.refresh();}};
 $('#qaClear').onclick=()=>{qaRoute=true;};$('#qaBuild').onclick=()=>{qaRoute=false;target={...CONFIG.officeSlot.access};};$('#qaComputer').onclick=()=>{const f=s.furniture.find(f=>s.inventory.find(i=>i.id===f.id)?.product==='computer');if(!f||!s.inside)return;qaComputerPath=reviewPath(s.position,{x:-6+f.x,z:f.z},(x,z)=>world.isBlocked(x,z,avatarDefinition(s.character).radius),1.4);};
 $('#qaWalk').onclick=()=>{stop();locomotionReview.start($('#qaAvatar').value,true);};
}

function rotateHint(){hidden($('#rotateHint'),!(innerHeight>innerWidth&&innerWidth<900));}addEventListener('resize',rotateHint);rotateHint();applyText();
