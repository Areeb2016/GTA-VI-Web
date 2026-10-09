const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const state={theme:localStorage.getItem('vi-theme')||'sunset',heat:0,zone:localStorage.getItem('vi-zone')||'vice',approach:'Quiet',crew:'Driver',radio:false,station:0,deck:0,frame:0};
document.documentElement.dataset.theme=state.theme;

// Cinematic boot
const boot=$('#boot'),bootBar=$('#bootBar'),bootPercent=$('#bootPercent'),bootStatus=$('#bootStatus');
const bootSteps=['Waking the coast','Checking bridges','Tuning the radio','Painting the sunset','Opening Vice City'];
let bootValue=0,bootTimer;
function finishBoot(){clearInterval(bootTimer);bootValue=100;bootBar.style.width='100%';bootPercent.textContent='100%';boot.classList.add('done');setTimeout(()=>boot.remove(),850)}
if(localStorage.getItem('vi-seen-intro')==='1'){bootValue=82;bootStatus.textContent='Welcome back';}
bootTimer=setInterval(()=>{bootValue=Math.min(100,bootValue+Math.ceil(Math.random()*9));bootBar.style.width=bootValue+'%';bootPercent.textContent=String(bootValue).padStart(2,'0')+'%';bootStatus.textContent=bootSteps[Math.min(4,Math.floor(bootValue/21))];if(bootValue>=100){localStorage.setItem('vi-seen-intro','1');setTimeout(finishBoot,250)}},110);
$('#bootSkip').onclick=()=>{localStorage.setItem('vi-seen-intro','1');finishBoot()};

// Page motion
const nav=$('#nav'),progress=$('#scrollProgress'),heroBg=$('#heroBg'),cursor=$('#cursorOrbit');
function scrollUI(){const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;nav.classList.toggle('scrolled',y>24);progress.style.width=(max?y/max*100:0)+'%';if(heroBg)heroBg.style.transform=`scale(1.06) translate3d(0,${Math.min(y*.08,58)}px,0)`}
addEventListener('scroll',scrollUI,{passive:true});scrollUI();
addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});$$('.reveal').forEach(el=>revealObserver.observe(el));

// Magnetic buttons
$$('.magnetic').forEach(btn=>{btn.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=btn.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;btn.style.transform=`translate(${x*.12}px,${y*.16}px) scale(1.02)`});btn.addEventListener('pointerleave',()=>btn.style.transform='')});

// Tilt cards
$$('[data-tilt]').forEach(card=>{const power=Number(card.dataset.tilt)||8;card.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=card.getBoundingClientRect(),rx=((e.clientY-r.top)/r.height-.5)*-power,ry=((e.clientX-r.left)/r.width-.5)*power;card.style.transform=`perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) ${card.classList.contains('character')&&!card.classList.contains('active')?'scale(.94)':''}`});card.addEventListener('pointerleave',()=>card.style.transform='')});

// Clock / mood
function updateClock(){const now=new Date(),formatter=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false});const t=formatter.format(now);$('#viceTime').textContent=t;$('#phoneTime').textContent=t;const hour=Number(t.split(':')[0]);let mood='GOLDEN HOUR',weather='31° · HUMID';if(hour<6){mood='AFTER HOURS';weather='27° · COASTAL HAZE'}else if(hour<12){mood='MORNING HEAT';weather='29° · BRIGHT'}else if(hour<18){mood='HIGH SUN';weather='33° · HUMID'}else if(hour<21){mood='GOLDEN HOUR'}else{mood='NEON HOURS';weather='29° · WARM'}$('#viceMood').textContent=mood;$('#hudWeather').textContent=weather}
updateClock();setInterval(updateClock,30000);

// Theme
function applyTheme(){document.documentElement.dataset.theme=state.theme;$('#themeState').textContent=state.theme==='night'?'NIGHT':'DAY';$('#themeToggle span').textContent=state.theme==='night'?'☾':'☼';localStorage.setItem('vi-theme',state.theme);$('#phoneWeather').textContent=state.theme==='night'?'Warm · Neon':'Humid · Sunset'}
function toggleTheme(){state.theme=state.theme==='night'?'sunset':'night';applyTheme();toast(state.theme==='night'?'NIGHT MODE':'SUNSET MODE',state.theme==='night'?'Neon has taken over the coast.':'Golden hour restored.','☼')}
$('#themeToggle').onclick=toggleTheme;applyTheme();

// Procedural ambient radio — original synthesis, no copyrighted tracks
let audioCtx,radioNodes=[];
const stations=[{name:'PALM 88.3',sub:'sunset synth',freq:[110,164.81,220],wave:'sine'},{name:'VICE FM',sub:'night pulse',freq:[82.41,123.47,164.81],wave:'triangle'},{name:'COAST TALK',sub:'late signal',freq:[98,147,196],wave:'sine'}];
function stopRadio(){radioNodes.forEach(n=>{try{n.stop?.()}catch{}try{n.disconnect?.()}catch{}});radioNodes=[];state.radio=false;$('#soundState').textContent='OFF';$('#soundToggle span').textContent='◖'}
function startRadio(index=state.station){stopRadio();state.station=index;if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const master=audioCtx.createGain();master.gain.value=.035;master.connect(audioCtx.destination);const st=stations[index];st.freq.forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=st.wave;o.frequency.value=f;g.gain.value=i===0?.52:.18;o.connect(g);g.connect(master);o.start();radioNodes.push(o,g)});const lfo=audioCtx.createOscillator(),lfoGain=audioCtx.createGain();lfo.frequency.value=.12;lfoGain.gain.value=.012;lfo.connect(lfoGain);lfoGain.connect(master.gain);lfo.start();radioNodes.push(lfo,lfoGain,master);state.radio=true;$('#soundState').textContent=st.name.split(' ')[0];$('#soundToggle span').textContent='♫';toast(st.name,st.sub+' · original procedural ambience','♫')}
function toggleRadio(){state.radio?stopRadio():startRadio()}
$('#soundToggle').onclick=toggleRadio;

// Heat system
function renderHeat(){const stars='★★★★★'.split('').map((s,i)=>i<state.heat?'★':'☆').join('');$('#stars').textContent=stars;const labels=['CLEAN','NOTICED','WATCHED','WANTED','HUNTED','LOCKDOWN'];$('#heatLabel').textContent=labels[state.heat];$('#wanted').classList.toggle('show',state.heat>0);$('#wanted').classList.toggle('hot',state.heat>=3);$('#scanner').classList.toggle('active',state.heat>=4);setTimeout(()=>{if(state.heat>0){state.heat--;renderHeat()}},state.heat?18000:0)}
function addHeat(amount=1){state.heat=Math.min(5,state.heat+amount);renderHeat();toast('HEAT '+state.heat+'/5',state.heat>=4?'Air unit is searching. Keep moving.':'Attention is building around your last move.','★')}
renderHeat();let logoHits=0;$('#brandTrigger').addEventListener('click',()=>{logoHits++;if(logoHits===5){addHeat(5);logoHits=0}});

// Toast events
let toastTimer;function toast(title,text,icon='✦',type='LEONIDA LIVE'){clearTimeout(toastTimer);$('#eventTitle').textContent=title;$('#eventText').textContent=text;$('#eventIcon').textContent=icon;$('#eventType').textContent=type;$('#eventToast').classList.add('show');toastTimer=setTimeout(()=>$('#eventToast').classList.remove('show'),4200)}
const randomEvents=[['ALLIGATOR DELAY','Traffic stopped near Grassrivers. Nobody is volunteering to move it.','◉'],['COAST STORM','A warm wall of rain is moving over Vice City. Visibility dropping.','☂'],['BRIDGE JAM','The Keys route is glowing red. Local radio says “good luck.”','≋'],['NIGHT MARKET','A pop-up market just lit up under the freeway.','✦'],['STATE AIR UNIT','Something loud happened three blocks away. Definitely not you.','⌁']];
$('#randomEventBtn').onclick=()=>{const e=randomEvents[Math.floor(Math.random()*randomEvents.length)];toast(...e);if(Math.random()>.62)addHeat(1)};

// Character deck
const chars=$$('.character'),deck=$('#characterDeck');
function setDeck(i){state.deck=(i+chars.length)%chars.length;chars.forEach((c,n)=>c.classList.toggle('active',n===state.deck));const base=chars[0].getBoundingClientRect().width,gap=18;deck.style.transform=`translateX(-${state.deck*(base+gap)}px)`;$('#deckProgress').style.width=((state.deck+1)/chars.length*100)+'%'}
$('#deckPrev').onclick=()=>setDeck(state.deck-1);$('#deckNext').onclick=()=>setDeck(state.deck+1);chars.forEach((c,i)=>c.addEventListener('click',e=>{if(!e.target.closest('.profile-btn'))setDeck(i)}));
$$('.profile-btn').forEach(btn=>btn.onclick=e=>{const c=e.currentTarget.closest('.character');toast(c.dataset.name,c.dataset.quote,'◆',c.dataset.role)});
addEventListener('resize',()=>setDeck(state.deck));

// World map
const zones={vice:{num:'01 / 04',type:'NEON CAPITAL',title:'VICE CITY',text:'Glass towers, heat haze, beaches and streets that get stranger after midnight.',coords:'25.7617° N / 80.1918° W',energy:94,risk:78,escape:63,dest:'VICE CITY'},keys:{num:'02 / 04',type:'ISLAND CHAIN',title:'LEONIDA KEYS',text:'Turquoise water, long bridges and tiny islands where the horizon looks innocent.',coords:'24.5551° N / 81.7800° W',energy:66,risk:52,escape:84,dest:'LEONIDA KEYS'},grass:{num:'03 / 04',type:'WETLANDS',title:'GRASSRIVERS',text:'Low roads, dark water and wildlife close enough to hear before you see it.',coords:'26.1423° N / 80.6251° W',energy:48,risk:87,escape:46,dest:'GRASSRIVERS'},port:{num:'04 / 04',type:'OLD COAST',title:'PORT GELLHORN',text:'Motels, strip malls, freight yards and miles of coast with nowhere to disappear.',coords:'27.4870° N / 82.5724° W',energy:58,risk:69,escape:72,dest:'PORT GELLHORN'}};
function setZone(key,announce=false){state.zone=key;const z=zones[key];localStorage.setItem('vi-zone',key);$$('.hotspot').forEach(x=>x.classList.toggle('active',x.dataset.zone===key));$('#zoneNumber').textContent=z.num;$('#zoneType').textContent=z.type;$('#zoneTitle').textContent=z.title;$('#zoneText').textContent=z.text;$('#worldCoords').textContent=z.coords;$('#worldZone').textContent=z.title;$('#energyBar').style.width=z.energy+'%';$('#riskBar').style.width=z.risk+'%';$('#escapeBar').style.width=z.escape+'%';$('#missionDestination').textContent=z.dest;if(announce)toast('DESTINATION // '+z.title,z.text,'⌖')}
$$('.hotspot').forEach(h=>h.onclick=()=>setZone(h.dataset.zone,true));setZone(state.zone);
$('#setRoute').onclick=()=>{$('#mapCanvas').classList.remove('route-on');void $('#mapCanvas').offsetWidth;$('#mapCanvas').classList.add('route-on');toast('ROUTE SET','Destination synced to VICE/LINK.','⌖');setTimeout(()=>$('#mapCanvas').classList.remove('route-on'),4800)};

// Planner
let approach={name:'Quiet',heat:1,cut:42,time:'06:40'},crew={name:'Driver',bonus:8};
function renderMission(){let heat=approach.heat-(crew.name==='Lookout'?1:0);heat=Math.max(1,heat);let cut=Math.min(88,approach.cut+(crew.name==='Hacker'?4:0));$('#missionHeat').textContent='★'.repeat(heat)+'☆'.repeat(5-heat);$('#missionTime').textContent=approach.time;$('#missionCut').textContent=cut;const detail=approach.name==='Quiet'?'Low profile route':approach.name==='Fast'?'Aggressive escape window':'Everything becomes the distraction';$('#missionNote').textContent=`${detail}. ${crew.name} assigned. Destination: ${zones[state.zone].title}.`}
$$('#approachChoices .choice').forEach(btn=>btn.onclick=()=>{$$('#approachChoices .choice').forEach(x=>x.classList.remove('active'));btn.classList.add('active');approach={name:btn.dataset.approach,heat:+btn.dataset.heat,cut:+btn.dataset.cut,time:btn.dataset.time};renderMission()});
$$('#crewChoices .crew').forEach(btn=>btn.onclick=()=>{$$('#crewChoices .crew').forEach(x=>x.classList.remove('active'));btn.classList.add('active');crew={name:btn.dataset.crew,bonus:+btn.dataset.bonus};renderMission()});renderMission();
$('#launchMission').onclick=()=>{const card=$('#missionCard');card.classList.add('running');$('#missionStatus').textContent='RUNNING';addHeat(Math.min(3,Math.ceil(approach.heat/2)));toast('SIMULATION LIVE',`${approach.name} approach · ${crew.name} crew · ${zones[state.zone].title}`,'▶','SUNSET RUN');setTimeout(()=>{card.classList.remove('running');$('#missionStatus').textContent='COMPLETE';$('#missionNote').textContent=approach.name==='Chaos'?'Simulation complete. The plan technically worked. Leonida noticed.':'Simulation complete. Exit route held together.';setTimeout(()=>$('#missionStatus').textContent='READY',2800)},1800)};

// Gallery focus mode
const frames=$$('.frame'),viewer=$('#focusViewer'),viewerImg=$('#viewerImg');
function showFrame(i){state.frame=(i+frames.length)%frames.length;const f=frames[state.frame],img=$('img',f),title=$('b',f).textContent;viewerImg.src=img.src;viewerImg.alt=img.alt;$('#viewerTitle').textContent=title;$('#viewerIndex').textContent=String(state.frame+1).padStart(3,'0')+' / '+String(frames.length).padStart(3,'0')}
function openViewer(i){showFrame(i);viewer.classList.add('open');viewer.setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeViewer(){viewer.classList.remove('open');viewer.setAttribute('aria-hidden','true');document.body.classList.remove('locked')}
frames.forEach((f,i)=>f.onclick=()=>openViewer(i));$('#viewerClose').onclick=closeViewer;$('#viewerPrev').onclick=()=>showFrame(state.frame-1);$('#viewerNext').onclick=()=>showFrame(state.frame+1);

// Phone OS
const phoneWrap=$('#phoneWrap'),appView=$('#phoneAppView'),appContent=$('#appContent');
function openPhone(){phoneWrap.classList.add('open');phoneWrap.setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closePhone(){phoneWrap.classList.remove('open');phoneWrap.setAttribute('aria-hidden','true');document.body.classList.remove('locked');appView.classList.remove('open')}
function homePhone(){appView.classList.remove('open')}
$('#phoneLaunch').onclick=openPhone;$('#phoneScrim').onclick=closePhone;$('#phoneHomebar').onclick=homePhone;$('#appBack').onclick=homePhone;
function appHTML(name){if(name==='messages')return `<div class="app-content"><div class="message"><small>LUCIA · NOW</small><b>Route changed.</b><p>Meet closer to the water. Less cameras, more exits.</p></div><div class="message"><small>JASON · 4 MIN</small><b>Car is ready.</b><p>Try not to trigger half the state before I get there.</p></div><button class="phone-action" data-phone-action="heat">Reply with “too late” ★</button></div>`;if(name==='jobs')return `<div class="app-content"><div class="message"><small>ACTIVE SIMULATION</small><b>SUNSET RUN</b><p>${approach.name} approach · ${crew.name} crew · Destination: ${zones[state.zone].title}</p></div><button class="phone-action" data-phone-action="planner">Open mission planner</button></div>`;if(name==='radio')return `<div class="app-content"><div class="radio-list">${stations.map((s,i)=>`<button class="radio-station" data-station="${i}"><i>♫</i><span><b>${s.name}</b><small>${s.sub}</small></span></button>`).join('')}</div><button class="phone-action" data-phone-action="radio-off">Radio off</button></div>`;if(name==='map')return `<div class="app-content"><div class="phone-map-mini"><i class="mini-pin"></i></div><div class="message"><small>CURRENT ROUTE</small><b>${zones[state.zone].title}</b><p>${zones[state.zone].coords}</p></div><button class="phone-action" data-phone-action="world">Open full state map</button></div>`;if(name==='camera')return `<div class="app-content"><div class="message"><small>VICE/LINK CAMERA</small><b>Cinematic archive</b><p>Four captured moments are loaded into the fan experience.</p></div><button class="phone-action" data-phone-action="camera">Open archive</button></div>`;return `<div class="app-content"><div class="settings-row"><span>Night mode</span><button class="switch ${state.theme==='night'?'on':''}" data-setting="night"></button></div><div class="settings-row"><span>Ambient radio</span><button class="switch ${state.radio?'on':''}" data-setting="radio"></button></div><div class="settings-row"><span>Reduce heat</span><button class="switch ${state.heat===0?'on':''}" data-setting="clean"></button></div><div class="message"><small>PRIVACY</small><b>Local-only fan settings</b><p>Theme and last map zone are stored only in your browser via localStorage.</p></div></div>`}
function openApp(name){$('#appTitle').textContent=name.toUpperCase();appContent.innerHTML=appHTML(name);appView.classList.add('open');$$('[data-station]',appContent).forEach(b=>b.onclick=()=>startRadio(+b.dataset.station));$$('[data-phone-action]',appContent).forEach(b=>b.onclick=()=>{const a=b.dataset.phoneAction;if(a==='heat')addHeat(1);if(a==='planner'){closePhone();location.hash='planner'}if(a==='world'){closePhone();location.hash='world'}if(a==='camera'){closePhone();openViewer(0)}if(a==='radio-off')stopRadio()});$$('[data-setting]',appContent).forEach(b=>b.onclick=()=>{const s=b.dataset.setting;if(s==='night')toggleTheme();if(s==='radio')toggleRadio();if(s==='clean'){state.heat=0;renderHeat();toast('HEAT CLEARED','Back under the radar.','○')}openApp('settings')})}
$$('[data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app));

// Countdown in Pakistan view uses fixed launch date at start of day ET only as a visual counter.
const launchDate=new Date('2026-11-19T00:00:00-05:00');
function tickCountdown(){let ms=Math.max(0,launchDate-Date.now());const d=Math.floor(ms/86400000);ms%=86400000;const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);$('#days').textContent=String(d).padStart(3,'0');$('#hours').textContent=String(h).padStart(2,'0');$('#minutes').textContent=String(m).padStart(2,'0');$('#seconds').textContent=String(s).padStart(2,'0')}
tickCountdown();setInterval(tickCountdown,1000);

// Keyboard controls
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;const k=e.key.toLowerCase();if(k==='m'){phoneWrap.classList.contains('open')?closePhone():openPhone()}if(k==='r')toggleRadio();if(k==='n')toggleTheme();if(k==='h')addHeat(1);if(e.key==='Escape'){closePhone();closeViewer()}if(viewer.classList.contains('open')&&e.key==='ArrowLeft')showFrame(state.frame-1);if(viewer.classList.contains('open')&&e.key==='ArrowRight')showFrame(state.frame+1)});

// Small first-use hint after intro
setTimeout(()=>{if(!sessionStorage.getItem('vi-hint')){toast('INTERACTION UNLOCKED','Try M for phone · R for radio · N for night · H for heat.','⌘','CONTROLS');sessionStorage.setItem('vi-hint','1')}},3600);
