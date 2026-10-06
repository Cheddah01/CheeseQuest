/* CheeseQuest · Chapter I: A Matter of Taste. Original canvas art; no runtime dependencies. */
(() => {
'use strict';
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d'),D=window.CheeseWorld,Story=window.CheeseStory;
const W=D.width,H=D.height,SAVE_KEY='cheesequest-chapter1-v2',camp=D.camp,shrine=D.shrine,fox=D.npcs[0];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
let seed=94723;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const paths=D.paths,trees=[],rocks=[],grass=[],flowers=[],particles=[],projectiles=[];
const flags=['metBrie','commissioned','manifest','cellarKey','metMarn','valvesSolved','bossDefeated','supplies','delivered','chapterDone','pipMet','armor','pipHelped','mealDonated','hollisMet','ventFound','hollisHelped','boots','heart','wedgeRead'];
const freshState=()=>Object.assign(Object.fromEntries(flags.map(k=>[k,false])),{accord:'',defeated:[],opened:[],gathered:[],discovered:['shrine'],playTime:0});
let state=freshState();const bag={mushrooms:0,berries:0,meals:0};
const player={...D.start,hp:5,stamina:100,dir:1,walk:0,moving:false,attack:0,cooldown:0,hurt:0,roll:0,rollCooldown:0,rollX:0,rollY:1};
const structures=[{id:'inn',x:1120,y:802,w:140,h:94},{id:'cottage',x:942,y:747,w:73,h:60},{id:'shop',x:1315,y:786,w:86,h:66},{id:'tollhouse',x:1450,y:311,w:142,h:114}];
const nodes=D.ingredients.map(([x,y,type],i)=>({x,y,type,id:i,taken:false}));
const enemies=D.enemies.map(e=>({...e,scene:e.scene||'world',homeX:e.x,homeY:e.y,hp:e.type==='boss'?16:e.type==='beetle'?4:3,maxHp:e.type==='boss'?16:e.type==='beetle'?4:3,hit:0,phase:rand()*6,mode:'idle',timer:.8,dx:0,dy:0,attack:0}));
const cellarObjects=[{id:'exit',x:106,y:556,kind:'exit',label:'Return to the Marches'},{id:'instructions',x:100,y:412,kind:'plaque',label:'Read the aging instructions'},{id:'milk',x:133,y:215,kind:'valve',label:'Turn the milk valve'},{id:'culture',x:261,y:215,kind:'valve',label:'Turn the culture valve'},{id:'time',x:363,y:215,kind:'valve',label:'Turn the time valve'},{id:'vent',x:746,y:493,kind:'vent',label:'Inspect the hidden vent'},{id:'supplies',x:754,y:128,kind:'supplies',label:'Collect the relief supplies'}];
let scene='world',started=false,paused=false,panelOpen=false,dialogOpen=false,endingOpen=false,storageOK=true,saveConflict=false;
let time=0,saveTimer=0,toastTimer=0,shake=0,keys=new Set(),cam={x:0,y:0},viewW=576,viewH=360,nearest=null,waypoint=null,valveOrder=[],lastStamp=0;
let dialog=null,dialogPage=0,hudMemo='',audio=null,soundOn=false,lastChirp=0,panelTab='quests',hasSave=false;
const maxHp=()=>5+Number(state.heart)+Number(state.pipHelped),maxStamina=()=>state.mealDonated?125:100;
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
function pathDistance(x,y){let d=9999;for(const p of paths)for(let i=1;i<p.length;i++)d=Math.min(d,segmentDistance(x,y,p[i-1],p[i]));return d;}
function inPond(x,y){return ((x-814)/144)**2+((y-565)/109)**2<1;}
function onBridge(x,y){return x>659&&x<969&&y>502&&y<539;}
function worldBlocked(x,y){
 if(x<40||y<70||x>W-40||y>H-45)return true;
 if(inPond(x,y)&&!onBridge(x,y))return true;
 if(x>shrine.x-49&&x<shrine.x+49&&y>shrine.y-84&&y<shrine.y+12)return true;
 if(structures.some(b=>x>b.x-b.w/2-5&&x<b.x+b.w/2+5&&y>b.y-b.h-4&&y<b.y+4))return true;
 if(!state.accord&&x>1694&&x<1798&&y>484&&y<498)return true;
 if(trees.some(t=>Math.hypot(x-t.x,y-t.y)<12*t.scale+5))return true;
 return rocks.some(r=>Math.hypot(x-r.x,y-r.y)<r.size+5);
}
function cellarBlocked(x,y){if(x<38||y<62||x>842||y>595)return true;if(x>416&&x<442&&(y<227||y>304||!state.valvesSolved))return true;if(x>88&&x<340&&y>77&&y<132)return true;return [{x:550,y:347},{x:755,y:345}].some(p=>Math.abs(x-p.x)<17&&Math.abs(y-p.y)<19);}
function blocked(x,y,which=scene){return which==='cellar'?cellarBlocked(x,y):worldBlocked(x,y);}
function move(body,dx,dy,which=scene){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));for(let i=0;i<steps;i++){if(!blocked(body.x+dx/steps,body.y,which))body.x+=dx/steps;if(!blocked(body.x,body.y+dy/steps,which))body.y+=dy/steps;}}
// Reserve approaches to every quest object, actor, and building before placing scenery.
const reserved=[...D.npcs,...D.objects,...nodes,...D.enemies.filter(e=>!e.scene),...D.pins];
function clearSite(x,y){return reserved.some(n=>dist({x,y},n)<65)||structures.some(b=>Math.abs(x-b.x)<b.w/2+55&&y>b.y-b.h-55&&y<b.y+65)||dist({x,y},shrine)<100;}
for(let i=0;i<750;i++){const x=35+rand()*(W-70),y=55+rand()*(H-90),border=x<105||x>W-100||y<100||y>H-100;if((border||pathDistance(x,y)>70)&&!inPond(x,y)&&!clearSite(x,y))trees.push({x,y,scale:.75+rand()*.5,tint:Math.floor(rand()*3)});}
for(let i=0;i<78;i++){const x=100+rand()*(W-200),y=120+rand()*(H-250);if(pathDistance(x,y)>49&&!inPond(x,y)&&!clearSite(x,y))rocks.push({x,y,size:6+rand()*8});}
for(let i=0;i<6300;i++){const x=rand()*W,y=rand()*H;if(!inPond(x,y)&&pathDistance(x,y)>24)grass.push({x,y,s:rand()*8,c:Math.floor(rand()*4)});}
for(let i=0;i<500;i++){const x=100+rand()*(W-200),y=100+rand()*(H-200);if(!inPond(x,y)&&pathDistance(x,y)>29)flowers.push({x,y,c:Math.floor(rand()*3)});}
function applyWorldState(){for(const n of nodes)n.taken=state.gathered.includes(n.id);for(const e of enemies){e.x=e.homeX;e.y=e.homeY;e.hp=state.defeated.includes(e.id)||(e.id==='boss'&&state.bossDefeated)?0:e.maxHp;e.mode='idle';e.timer=.8;}}
function save(){if(saveConflict)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,state,bag,scene,x:player.x,y:player.y,hp:player.hp,soundOn}));}catch{storageOK=false;$('saveNote').textContent='Storage is unavailable. Progress lasts for this visit.';}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s||s.version!==2||!s.state)return false;const clean=freshState();for(const k of flags)clean[k]=s.state[k]===true;clean.accord=['public','joint'].includes(s.state.accord)?s.state.accord:'';for(const [k,valid]of [['defeated',enemies.map(e=>e.id)],['opened',['armor','boots','heart']],['gathered',nodes.map(n=>n.id)],['discovered',D.pins.map(n=>n.id)]])clean[k]=Array.isArray(s.state[k])?[...new Set(s.state[k].filter(v=>valid.includes(v)))]:clean[k];clean.playTime=Number.isFinite(s.state.playTime)?clamp(s.state.playTime,0,1e7):0;
 state=clean;for(const k of Object.keys(bag))bag[k]=Number.isFinite(s.bag?.[k])?clamp(Math.floor(s.bag[k]),0,99):0;
 scene=s.scene==='cellar'&&state.cellarKey?'cellar':'world';const fallback=scene==='cellar'?{x:106,y:532}:D.start;player.x=fallback.x;player.y=fallback.y;if(Number.isFinite(s.x)&&Number.isFinite(s.y)&&!blocked(s.x,s.y)){player.x=s.x;player.y=s.y;}player.hp=Number.isFinite(s.hp)?clamp(Math.round(s.hp),1,maxHp()):maxHp();player.stamina=maxStamina();soundOn=s.soundOn===true;applyWorldState();return true;
 }catch{return false;}}
function running(){return started&&!paused&&!panelOpen&&!dialogOpen&&!endingOpen;}
function tone(freq,duration=.13,type='sine',volume=.028,delay=0){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.01);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+duration+.02);}catch{}}
function chime(){[523,659,784].forEach((f,i)=>tone(f,.35,'sine',.03,i*.1));}
function notify(text){$('toast').textContent=text;$('toast').classList.add('show');toastTimer=4.2;}
function burst(x,y,color,count=13){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*80,vy:-20-Math.random()*60,life:.5+Math.random()*.5,color,size:1+Math.floor(Math.random()*3)});}
function objective(){return Story.objective(state);}
function objectiveTarget(){const o=objective();return o.pin?D.pins.find(p=>p.id===o.pin):o;}
function currentTarget(){return waypoint?D.pins.find(p=>p.id===waypoint):objectiveTarget();}
function syncHud(){
 const o=objective(),data=JSON.stringify([player.hp,maxHp(),Math.round(player.stamina),maxStamina(),bag,o.step,soundOn,scene,state.hollisHelped,scene==='cellar'&&player.x>450&&state.valvesSolved]);if(data===hudMemo)return;hudMemo=data;
 $('hearts').innerHTML=Array.from({length:maxHp()},(_,i)=>`<span class="${i<player.hp?'':'empty-heart'}">♥</span>`).join('');$('hearts').setAttribute('aria-label',`${player.hp} of ${maxHp()} hearts`);$('stamina').style.width=`${player.stamina/maxStamina()*100}%`;
 for(const k of Object.keys(bag))$(k).textContent=bag[k];$('eat').disabled=!bag.meals;$('questText').textContent=o.title;$('questDetail').textContent=o.text;$('questProgress').style.width=`${o.step/9*100}%`;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent=soundOn?'Sound on':'Sound off';
 const boss=enemies.find(e=>e.id==='boss');$('bossHud').hidden=!(scene==='cellar'&&boss.hp>0&&state.valvesSolved&&player.x>450);$('bossHealth').style.width=`${boss.hp/boss.maxHp*100}%`;
}
function openDialog(data){keys.clear();dialogOpen=true;dialog=data;dialogPage=0;$('dialog').hidden=false;renderDialog();}
function renderDialog(){const npc=D.npcs.find(n=>n.id===dialog.id);$('dialogEyebrow').textContent=dialog.title||npc?.title||'FIELD NOTES';$('dialogTitle').textContent=dialog.speaker||npc?.name||'The Unclaimed Marches';$('dialogText').textContent=dialog.pages[dialogPage];$('dialogPage').textContent=dialog.pages.length>1?`${dialogPage+1} / ${dialog.pages.length}`:'';const choices=dialogPage<dialog.pages.length-1?[{label:'Continue',action:'next'}]:dialog.choices?.length?dialog.choices:[{label:'Keep wandering',action:dialog.complete||'close'}];const container=$('dialogChoices');container.replaceChildren();for(const choice of choices){const b=document.createElement('button');b.className='dialog-choice';b.textContent=choice.label;if(choice.hint){const small=document.createElement('small');small.textContent=choice.hint;b.append(small);}b.addEventListener('click',()=>choose(choice.action));container.append(b);}container.querySelector('button')?.focus();}
function closeDialog(){dialogOpen=false;dialog=null;$('dialog').hidden=true;canvas.focus();}
function choose(action){if(action==='next'){dialogPage++;renderDialog();return;}closeDialog();applyAction(action);syncHud();save();}
function talk(id){openDialog(Story.talk(id,state,bag));}
function note(title,text){openDialog({speaker:title,pages:Array.isArray(text)?text:[text]});}
function applyAction(action){
 const former=objective().step;
 if(action==='meetBrie'){state.metBrie=true;notify('Received: cheese knife, Guest’s map · M opens the map');chime();}
 if(action==='commission'){state.commissioned=true;notify('Quest updated · Investigate the overturned wagon');}
 if(action==='getKey'){state.cellarKey=true;notify('Received: old tollhouse service key');chime();}
 if(action==='meetMarn'){state.metMarn=true;notify('Little Whey is counting on you.');}
 if(action==='meetPip')state.pipMet=true;
 if(action==='returnArmor'){state.pipHelped=true;state.armor=false;player.hp=maxHp();notify('Waxguard charm · Maximum hearts +1');chime();}
 if(action==='meetHollis')state.hollisMet=true;
 if(action==='helpHollis'){state.hollisHelped=true;notify('Knife sharpened · Sword damage doubled');chime();}
 if(action==='cookHint')note('A bowl for someone else','Gather a mushroom and a berry. Cook at Brie’s camp or the hearth west of the inn, then offer Marn a stew.');
 if(action==='donateMeal'&&bag.meals>0&&!state.mealDonated){bag.meals--;state.mealDonated=true;player.stamina=maxStamina();notify('Marn’s herb charm · Maximum stamina +25');chime();}
 if(action==='deliver'&&state.supplies){state.delivered=true;player.hp=maxHp();notify('Little Whey has food again · Return to Sir Curdle');burst(player.x,player.y-14,'#ffe09b',40);chime();}
 if((action==='accordPublic'||action==='accordJoint')&&state.delivered){state.accord=action==='accordPublic'?'public':'joint';notify('Guest charter granted · The road to Wheybridge is open');chime();note('Two flags, one table',state.accord==='public'?'Sir Curdle pins the destruction order to the checkpoint wall and signs his name beneath it. Nella stands beside him. Whatever comes next, the truth is public.':'Sir Curdle and Nella sign a joint relief charter. The food crossed the border first. The paperwork finally catches up.');}
 if(action==='rest'){player.hp=maxHp();player.stamina=maxStamina();state.gathered=[];for(const n of nodes)n.taken=false;notify('Rested · Hearts restored; woodland ingredients have regrown');chime();}
 if(action==='cook'){if(bag.mushrooms>0&&bag.berries>0){bag.mushrooms--;bag.berries--;bag.meals++;notify('Woodland stew cooked · Q restores 3 hearts');chime();}else notify('Cooking needs 1 mushroom and 1 berry.');}
 if(action==='explore'){$('ending').hidden=true;endingOpen=false;canvas.focus();}
 if(objective().step!==former)waypoint=null;
}
function hitEnemy(e,damage){e.hp=Math.max(0,e.hp-damage);e.hit=.25;burst(e.x,e.y-10,e.type==='boss'?'#f2cb83':'#d5dfa1',9);tone(e.hp?240:680,.15,'triangle');if(e.hp<=0){if(!state.defeated.includes(e.id))state.defeated.push(e.id);if(e.id==='boss'){state.bossDefeated=true;projectiles.length=0;notify('The Tithe Collector is defeated · Open the relief crate');chime();burst(e.x,e.y-20,'#ffe49b',55);}save();}hudMemo='';}
function attack(){if(!running()||!state.metBrie||player.cooldown>0||player.roll>0)return;player.attack=.24;player.cooldown=.36;tone(160,.1,'triangle');const f=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}][player.dir];for(const e of enemies){if(e.scene!==scene||e.hp<=0||dist(player,e)>(e.type==='boss'?65:49))continue;const dx=e.x-player.x,dy=e.y-player.y,len=Math.hypot(dx,dy)||1;if((dx*f.x+dy*f.y)/len<-.25)continue;if(e.id==='boss'&&(!state.valvesSolved||e.mode==='windup')){notify('The collector is braced. Dodge its charge, then strike!');tone(320,.1,'square',.008);continue;}hitEnemy(e,state.hollisHelped?2:1);if(e.type!=='boss')move(e,dx/len*12,dy/len*12);}syncHud();}
function dodge(){if(!running()||!state.metBrie||player.stamina<28||player.rollCooldown>0)return;let dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);if(!dx&&!dy)[dx,dy]=[[0,-1],[0,1],[-1,0],[1,0]][player.dir];const len=Math.hypot(dx,dy);player.rollX=dx/len;player.rollY=dy/len;player.roll=.28;player.rollCooldown=state.boots?.58:.85;player.stamina-=28;player.attack=0;tone(220,.08,'triangle');}
function eat(){if(!running()||!bag.meals)return;if(player.hp>=maxHp()){notify('Already healthy. Save that stew for later.');return;}bag.meals--;player.hp=Math.min(maxHp(),player.hp+3);burst(player.x,player.y-15,'#e8e29b');notify('Woodland stew · 3 hearts restored');chime();syncHud();save();}
function takeDamage(amount,from){if(player.hurt>0||player.roll>0)return;player.hp-=amount;player.hurt=1.15;shake=3;tone(100,.18,'triangle',.04);burst(player.x,player.y-10,'#efbd96',9);if(from){const d=dist(player,from)||1;move(player,(player.x-from.x)/d*12,(player.y-from.y)/d*12);}if(player.hp<=0){scene='world';player.x=camp.x+42;player.y=camp.y+8;player.hp=maxHp();player.stamina=maxStamina();player.hurt=2;player.roll=0;projectiles.length=0;particles.length=0;applyWorldState();notify('Brie brought you to camp. Your discoveries and supplies are safe.');}hudMemo='';save();}
function campMenu(){openDialog({speaker:'A place by the fire',title:'REST · COOK · CARRY ON',pages:[`A warm hearth, a clean pot, and a little time.\n\nYour supplies: ${bag.mushrooms} mushrooms · ${bag.berries} berry sprigs · ${bag.meals} stews`],choices:[{label:'Rest and restore all hearts.',action:'rest'},{label:'Cook woodland stew · 1 mushroom + 1 berry',action:'cook'},{label:'Back to the road.',action:'close'}]});}
function objectsHere(){return scene==='cellar'?cellarObjects:D.objects;}
function findInteraction(){const choices=[];if(scene==='world'){for(const n of nodes)if(!n.taken&&dist(player,n)<31)choices.push({target:n,kind:'gather',label:n.type==='mushroom'?'Gather mushroom':'Pick berry sprig'});for(const n of D.npcs)if(dist(player,n)<43)choices.push({target:n,kind:'npc',label:`Talk to ${n.name}`});}for(const o of objectsHere()){if(o.kind==='chest'&&state.opened.includes(o.id))continue;if(o.id==='supplies'&&state.supplies)continue;if(dist(player,o)<43)choices.push({target:o,kind:o.kind,label:o.label});}return choices.sort((a,b)=>dist(player,a.target)-dist(player,b.target))[0]||null;}
function enterCellar(){scene='cellar';player.x=106;player.y=532;player.dir=0;player.hurt=1;projectiles.length=0;particles.length=0;waypoint=null;notify('The Old Tollhouse · Below the blessing line');save();}
function leaveCellar(){scene='world';player.x=1450;player.y=366;player.dir=1;projectiles.length=0;particles.length=0;save();}
function turnValve(id){if(state.valvesSolved){notify('The aging circuit is already open.');return;}const sequence=['milk','culture','time'];if(id!==sequence[valveOrder.length]){valveOrder=[];notify('The valves reset. Read the instructions by the entrance.');tone(140,.2);return;}valveOrder.push(id);tone(350+valveOrder.length*110,.2);if(valveOrder.length===3){state.valvesSolved=true;notify('Milk → Culture → Time · The collector’s chamber is open');chime();save();}else notify(`${valveOrder.length}/3 valves aligned`);}
function interact(){if(dialogOpen){const choices=dialogPage<dialog.pages.length-1?[{action:'next'}]:dialog.choices?.length?dialog.choices:[{action:dialog.complete||'close'}];if(choices.length===1)choose(choices[0].action);return;}if(!running())return;const entry=findInteraction();if(!entry)return;const {kind,target:o}=entry;const previous=objective().step;
 if(kind==='npc'){talk(o.id);return;}
 if(kind==='gather'){o.taken=true;state.gathered.push(o.id);bag[o.type==='mushroom'?'mushrooms':'berries']++;burst(o.x,o.y-6,'#efdb98',7);tone(660,.1);notify(o.type==='mushroom'?'+1 woodland mushroom':'+1 berry sprig');}
 if(kind==='camp')campMenu();
 if(kind==='wedge'){state.wedgeRead=true;note('An extremely important cheese','A respectable wedge of cheddar rests on velvet. The plaque reads:\n\nDO NOT TOUCH.\nDO NOT QUESTION.\nDO NOT PAIR WITH RED WINE.\n\nSomeone has scratched a smaller message below: “May all be fed.”');}
 if(kind==='sign')note('The Unclaimed Marches','CHEDDAR SOVEREIGN TERRITORY\nA Mozza sticker covers the last word: ALLEGEDLY.\n\nEast → Little Whey & Cheddar checkpoint\nNorth → Mozza Landing & old tollhouse\nSouth → Shrine & camp');
 if(kind==='wagon'){state.manifest=true;note('The missing shipment',['The wagon has been dragged off the road. Its lock is cut, but no food remains. Deep metal tracks lead northwest toward the tollhouse.','Under a broken wheel you find the official order:\n\nUNBLESSED GOODS.\nUNFIT FOR DISTRIBUTION.\nDESTROY UPON COLLECTION.\n\nThe food was never spoiled. Someone simply refused to stamp it.']);notify('Evidence found · Temple destruction order');}
 if(kind==='door'){if(!state.cellarKey)note('Sealed by the temple','The old tollhouse is locked. A notice cites sixty-three regulations and a processing surcharge. Nella at Mozza Landing may know another way in.');else if(!state.metMarn)note('Before you go below','Nella asked you to meet Auntie Marn in Little Whey. It is worth seeing who is waiting for these supplies.');else enterCellar();}
 if(kind==='chest'){state.opened.push(o.id);if(o.id==='armor'){state.armor=true;notify('Found: Sir Pip’s red-wax shell');}if(o.id==='boots'){state.boots=true;notify('Courier boots · Faster walking and quicker dodge recovery');}if(o.id==='heart'){state.heart=true;player.hp=maxHp();notify('Pilgrim’s heart · Maximum hearts +1');}chime();burst(o.x,o.y-10,'#ffe5a2',24);}
 if(kind==='plaque')note(o.id==='instructions'?'The proper order of aging':'An old mile marker',o.id==='instructions'?'FIRST, THE MILK.\nTHEN, THE LIVING CULTURE.\nLAST, GIVE IT TIME.\n\nTurn the three valves in that order. The old machine cannot resist a properly filed process.':'WHEYBRIDGE · WHERE SEVEN ROADS MEET\n\n“Leave a place for a stranger.”\n\nThe carving is older than the nations’ border markers.');
 if(kind==='valve')turnValve(o.id);
 if(kind==='exit')leaveCellar();
 if(kind==='vent'){state.ventFound=true;note('A basement beneath the basement','Behind the grate, seven pipes converge into a single tunnel. A corroded plate reads:\n\nWHEYBRIDGE CATHEDRAL\nCULTURE TRANSFER · LEVEL −2\n\nYou take a rubbing for Hollis. One of his theories may, unfortunately, be correct.');}
 if(kind==='supplies'){if(!state.bossDefeated)notify('The collector guards this crate. Defeat it first.');else{state.supplies=true;note('Perfectly ordinary food','Flour. Beans. Medicine. And a cheese bearing the offending lack of a blessing.\n\nYou secure the crate to the cellar’s delivery trolley. These supplies belong at Auntie Marn’s table.');chime();}}
 if(kind==='letter'){if(!state.accord)note('The road to Wheybridge','The checkpoint must issue your Guest charter before you can travel. There is unfinished business in the Marches.');else completeChapter();}
 if(previous!==objective().step)waypoint=null;syncHud();save();
}
function completeChapter(){state.chapterDone=true;endingOpen=true;keys.clear();$('ending').hidden=false;$('endingChoice').textContent=state.accord==='public'?'The truth is public. Curdle stands by it.':'Cheddar and Mozza signed a joint relief charter.';$('endingFriends').textContent=[state.pipHelped?'Sir Pip found his courage.':'Sir Pip still awaits his armor.',state.mealDonated?'Marn remembers your first bowl.':'Little Whey has food again.',state.hollisHelped?'Hollis has a troubling lead.':'The cathedral keeps its secrets.'].join(' ');chime();save();$('keepExploring').focus();}
function region(){if(scene==='cellar')return ['THE OLD TOLLHOUSE','Below the blessing line'];if(player.y>1060&&player.x<530)return ['THE FORGOTTEN SHRINE','A very peculiar awakening'];if(dist(player,camp)<180)return ['BRIE’S CAMP','A warm fire. A familiar fox.'];if(player.x>1540&&player.y<680)return ['CHEDDAR CHECKPOINT',state.accord?'The road is open':'Both sides are the wrong side'];if(player.x>1260&&player.y<490)return ['THE OLD TOLLHOUSE','All claims subject to processing'];if(player.x>840&&player.x<1210&&player.y<660)return ['MOZZA LANDING','Nobody breaks the family'];if(player.x>880&&player.y>700&&player.y<1050)return ['LITTLE WHEY',state.delivered?'There is enough for supper':'Two nations. One empty pot.'];return ['THE UNCLAIMED MARCHES','Follow the road. Question the signs.'];}
function updateEnemy(e,dt){if(e.hp<=0||e.scene!==scene)return;e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,e.attack-dt);e.phase+=dt*3;if(e.id==='boss'&&(!state.valvesSolved||player.x<460))return;const d=dist(player,e),range=e.type==='boss'?330:145;
 if(e.mode==='windup'){e.timer-=dt;if(e.timer<=0){e.mode='charge';e.timer=e.type==='boss'?.62:.38;const n=dist(player,e)||1;e.dx=(player.x-e.x)/n;e.dy=(player.y-e.y)/n;tone(130,.1,'triangle');}}
 else if(e.mode==='charge'){move(e,e.dx*(e.type==='boss'?230:155)*dt,e.dy*(e.type==='boss'?230:155)*dt,e.scene);e.timer-=dt;if(e.timer<=0){e.mode='recover';e.timer=e.type==='boss'?1.35:1;if(e.type==='boss'&&e.hp<=e.maxHp/2){for(let i=0;i<8;i++){const a=i*Math.PI/4;projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*85,vy:Math.sin(a)*85,life:2});}}}}
 else if(e.mode==='recover'){e.timer-=dt;if(e.timer<=0){e.mode='idle';e.timer=.5;}}
 else if(d<range&&e.hit<=0){e.timer-=dt;if(d>37){const speed=e.type==='slime'?31:e.type==='boss'?23:24;move(e,(player.x-e.x)/d*speed*dt,(player.y-e.y)/d*speed*dt,e.scene);}if(e.timer<=0&&d<(e.type==='boss'?260:90)){e.mode='windup';e.timer=e.type==='boss'?.85:.65;}}
 else if(d>=range&&dist(e,{x:e.homeX,y:e.homeY})>5){const home={x:e.homeX,y:e.homeY},n=dist(e,home);move(e,(home.x-e.x)/n*22*dt,(home.y-e.y)/n*22*dt,e.scene);}
 if(dist(e,player)<(e.type==='boss'?29:19)&&e.mode!=='windup'&&e.mode!=='recover'&&e.hit<=0&&e.attack<=0){takeDamage(e.type==='boss'?2:1,e);e.attack=1;}
}
function tick(dt){time+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}if(!running())return;state.playTime+=dt;player.attack=Math.max(0,player.attack-dt);player.cooldown=Math.max(0,player.cooldown-dt);player.hurt=Math.max(0,player.hurt-dt);player.rollCooldown=Math.max(0,player.rollCooldown-dt);shake=Math.max(0,shake-dt*18);
 let dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);player.moving=!!(dx||dy);
 if(player.roll>0){player.roll-=dt;move(player,player.rollX*240*dt,player.rollY*240*dt);player.walk+=dt*22;}
 else if(player.moving){const len=Math.hypot(dx,dy);dx/=len;dy/=len;const sprint=keys.has('Shift')&&player.stamina>2,speed=sprint?145:state.boots?105:91;move(player,dx*speed*dt,dy*speed*dt);player.dir=Math.abs(dx)>Math.abs(dy)?dx<0?2:3:dy<0?0:1;player.walk+=dt*(sprint?14:10);player.stamina=clamp(player.stamina+(sprint?-25:17)*dt,0,maxStamina());}else player.stamina=clamp(player.stamina+29*dt,0,maxStamina());
 for(const e of enemies)updateEnemy(e,dt);
 for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(dist(p,player)<11){takeDamage(1,p);p.life=0;}if(p.life<=0||blocked(p.x,p.y))projectiles.splice(i,1);}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;if(p.life<=0)particles.splice(i,1);}
 if(scene==='world')for(const p of D.pins)if(dist(player,p)<145&&!state.discovered.includes(p.id)){state.discovered.push(p.id);notify(`Discovered · ${p.name}`);}
 nearest=findInteraction();$('interaction').hidden=!nearest;if(nearest)$('interaction').innerHTML=`<kbd>E</kbd>${nearest.label}`;const [name,sub]=region();if($('area').dataset.region!==name+sub){$('area').dataset.region=name+sub;$('area').innerHTML=`${name}<span>${sub}</span>`;}
 saveTimer+=dt;if(saveTimer>4){saveTimer=0;save();}if(time-lastChirp>14){lastChirp=time;if(scene==='world'){tone(1320,.08,'sine',.006);tone(1760,.12,'sine',.006,.1);}}syncHud();
}

  function rect(x,y,w,h,color,c=ctx){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function oval(x,y,rx,ry,color,c=ctx){for(let yy=-ry;yy<=ry;yy+=2){const width=Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)))*rx;rect(x-width,y+yy,width*2,2,color,c);}}
  function polygon(points,color,c=ctx){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
  function shadow(x,y,rx=12,ry=4){oval(x,y,rx,ry,'#244d444a');}
  const ground=document.createElement('canvas');ground.width=W;ground.height=H;const gc=ground.getContext('2d');
  rect(0,0,W,H,'#72975e',gc);
  const groundColors=['#759860','#799c62','#6f945b','#779b61','#70955b'];
  for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)rect(x,y,16,16,groundColors[Math.floor(rand()*groundColors.length)],gc);
  for(let i=0;i<180;i++){const x=rand()*W,y=rand()*H;oval(x,y,22+rand()*50,10+rand()*35,rand()>.5?'#82a168':'#698e5a',gc);}
  for(const p of paths){
    gc.lineCap='round';gc.lineJoin='round';
    for(const [width,color] of [[48,'#879d64'],[35,'#b3b37c'],[27,'#c2bb86']]){gc.beginPath();gc.moveTo(...p[0]);for(let i=1;i<p.length;i++)gc.lineTo(...p[i]);gc.lineWidth=width;gc.strokeStyle=color;gc.stroke();}
  }
  oval(camp.x+15,camp.y+6,77,47,'#a9aa72',gc);oval(camp.x+15,camp.y+6,60,34,'#bcaf7d',gc);
  oval(shrine.x,shrine.y+16,86,65,'#7c9760',gc);oval(shrine.x,shrine.y+21,66,51,'#9ba378',gc);
  for(let i=0;i<6300;i++){const x=rand()*W,y=rand()*H;if(pathDistance(x,y)<20)rect(x,y,rand()>.8?3:1,1,rand()>.5?'#d1c391':'#acac78',gc);}
  // An irregular, stepped shoreline keeps the pond in the same pixel language as the sprites.
  oval(814,569,155,117,'#5d8659',gc);oval(814,568,151,113,'#9ea977',gc);oval(814,565,145,109,'#416f68',gc);oval(817,566,137,101,'#527e78',gc);oval(826,574,118,81,'#5b8981',gc);oval(831,579,97,62,'#629189',gc);
  for(let i=0;i<30;i++){const x=680+rand()*269,y=475+rand()*186;if(inPond(x,y))rect(x,y,4+rand()*11,1,'#80aba066',gc);}
  for(const g of grass){const cols=['#5e874f','#83a46a','#91aa72','#6b9053'];rect(g.x,g.y,1,3,cols[g.c],gc);rect(g.x-2,g.y-1,1,2,cols[g.c],gc);if(g.s>4)rect(g.x+2,g.y-2,1,3,cols[g.c],gc);}
  for(const f of flowers){const color=['#ead6a1','#c5c0c2','#e4aa86'][f.c];rect(f.x,f.y-3,1,5,'#50774b',gc);rect(f.x-1,f.y-4,3,2,color,gc);rect(f.x,f.y-5,1,4,color,gc);rect(f.x,f.y-4,1,1,'#efe7bc',gc);}
  const treeSprites=[];
  for(let t=0;t<3;t++){
    const im=document.createElement('canvas');im.width=92;im.height=106;const c=im.getContext('2d');
    const palettes=[['#294d42','#396549','#4a7a50','#648c56','#83a461'],['#2f5545','#43724d','#5b8654','#75965c','#90ab67'],['#305347','#3e6a4e','#4e7b56','#608d5b','#7ba165']],p=palettes[t];
    oval(47,96,32,8,'#28544444',c);rect(40,62,13,36,'#665c3e',c);rect(43,65,5,33,'#938052',c);rect(49,75,3,21,'#544f38',c);rect(36,97,10,3,'#5e593b',c);rect(51,96,8,4,'#5e593b',c);
    oval(46,63,37,24,p[0],c);oval(27,55,22,22,p[1],c);oval(67,54,23,24,p[1],c);oval(47,40,32,33,p[1],c);
    oval(24,48,20,19,p[2],c);oval(47,27,25,23,p[2],c);oval(66,43,20,22,p[2],c);oval(46,55,28,19,p[2],c);
    oval(31,34,17,16,p[3],c);oval(48,22,21,16,p[3],c);oval(64,36,15,15,p[3],c);oval(26,45,11,8,p[3],c);oval(49,50,13,10,p[3],c);
    rect(31,20,12,3,p[4],c);rect(29,24,6,3,p[4],c);rect(52,13,8,3,p[4],c);rect(56,31,7,2,p[4],c);rect(16,38,7,2,p[4],c);rect(41,44,8,2,p[4],c);rect(63,53,8,3,p[1],c);rect(28,61,9,3,p[1],c);rect(47,70,7,2,p[0],c);
    treeSprites.push(im);
  }
  function drawTree(t){const im=treeSprites[t.tint],s=t.scale;const coversPlayer=player.y<t.y+3&&player.y>t.y-92*s&&Math.abs(player.x-t.x)<38*s;ctx.globalAlpha=coversPlayer?.35:1;ctx.drawImage(im,Math.round(t.x-46*s),Math.round(t.y-98*s),Math.round(92*s),Math.round(106*s));ctx.globalAlpha=1;}
  function drawRock(r){shadow(r.x,r.y,r.size+3,4);polygon([[r.x-r.size,r.y-2],[r.x-r.size+2,r.y-r.size],[r.x-3,r.y-r.size-5],[r.x+r.size-3,r.y-r.size+1],[r.x+r.size,r.y-1]],'#7c8c7b');polygon([[r.x-r.size+2,r.y-r.size],[r.x-3,r.y-r.size-5],[r.x+r.size-3,r.y-r.size+1],[r.x+2,r.y-6],[r.x-r.size,r.y-2]],'#a6ac8c');rect(r.x-5,r.y-r.size,7,2,'#c1bea0');rect(r.x-r.size,r.y-3,5,3,'#5f8454');}
  function drawBridge(){
    shadow(815,542,157,4);rect(665,505,296,31,'#655d43');
    for(let x=665;x<961;x+=13){rect(x,506,11,28,'#ac8c59');rect(x,506,11,3,'#c8ab71');rect(x+3,511,1,20,'#93774e');rect(x+1,532,9,2,'#8b7047');rect(x+8,510,1,1,'#665841');}
    for(let x=665;x<966;x+=58){rect(x,496,4,43,'#675a42');rect(x,496,4,3,'#c2a476');rect(x+1,499,2,6,'#9e855b');}
    rect(665,501,299,3,'#bd9b64');rect(665,537,299,3,'#8e744e');
  }
  function drawWater(){
    for(let i=0;i<21;i++){const x=702+(i*41)%231,y=478+(i*37)%174;if(inPond(x,y)&&!onBridge(x,y)){const bob=Math.sin(time*1.2+i)*3;rect(x+bob,y,7+(i%3)*3,1,'#a3c4ab66');rect(x-2+bob,y+3,5,1,'#81b2a66b');}}
    for(const [x,y] of [[736,586],[861,621],[906,556],[777,491],[773,636]]){oval(x,y+1,9,4,'#3d7564');oval(x,y,8,3,'#9aaf70');rect(x,y-1,7,1,'#bdd08a');rect(x,y,2,3,'#5b8981');if(x===861||x===777){rect(x-2,y-3,4,3,'#f4cbba');rect(x-1,y-5,2,3,'#f8dec4');}}
    for(const [x,y] of [[692,595],[911,630],[747,459],[932,483]]){rect(x,y-10,2,12,'#466f4d');rect(x+4,y-15,1,17,'#466f4d');rect(x-2,y-16,3,7,'#988251');rect(x+3,y-20,3,7,'#aa9360');}
  }
  function drawCheese(x,y,size=1,glow=false){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(size,size);
    if(glow){ctx.globalAlpha=.1+.04*Math.sin(time*2);oval(0,-9,26,22,'#ffe59b');ctx.globalAlpha=1;}
    oval(0,-5,12,6,'#bf8337');rect(-12,-11,24,7,'#e6ad4e');oval(0,-11,12,6,'#ffe293');rect(-10,-8,19,2,'#f0bf5c');oval(-4,-13,2,1,'#d49f48');oval(5,-10,2,1,'#d49f48');rect(7,-6,2,2,'#ba8234');rect(-7,-6,2,2,'#c38d3e');ctx.restore();
  }
  function drawShrine(){
    const x=shrine.x,y=shrine.y;shadow(x,y+23,59,16);
    rect(x-54,y+17,108,12,'#637970');rect(x-50,y+12,100,12,'#a8b299');rect(x-42,y+8,84,9,'#c2c6a7');rect(x-34,y-57,68,68,'#647e72');rect(x-28,y-52,56,58,'#45665c');
    for(const side of [-1,1]){const px=x+side*37-8;rect(px-3,y-61,23,6,'#7c9180');rect(px,y-55,17,63,'#acb59a');rect(px+3,y-53,4,58,'#c6c7a5');rect(px+13,y-49,4,57,'#8d9c86');rect(px-3,y+4,23,6,'#c3c7a6');rect(px-4,y-64,25,5,'#c4c6a6');rect(px+1,y-22,8,2,'#7f987a');}
    rect(x-47,y-73,94,10,'#94a68b');rect(x-40,y-79,80,8,'#b8bf9b');rect(x-29,y-84,58,5,'#c8cbaa');rect(x-18,y-15,36,16,'#859880');rect(x-22,y-18,44,6,'#bfc29a');drawCheese(x,y-24,1,false);
    rect(x-49,y+23,15,3,'#779866');rect(x+28,y+16,18,3,'#719064');rect(x+39,y-52,6,8,'#62895e');rect(x+42,y-44,4,8,'#729b69');
    for(const cx of [x-30,x+30]){rect(cx,y-10,3,12,'#e7d7a4');rect(cx,y-14,2,4,'#ffc971');}
  }
  function drawCamp(){
    const x=camp.x,y=camp.y;
    // A canvas tent, a travel pack, and a fire small enough to feel like home.
    shadow(x-57,y-15,36,8);polygon([[x-85,y-17],[x-59,y-67],[x-27,y-17]],'#8c9a6b');polygon([[x-59,y-67],[x-37,y-60],[x-8,y-18],[x-27,y-17]],'#b8b688');polygon([[x-78,y-18],[x-59,y-55],[x-36,y-18]],'#d8c899');polygon([[x-70,y-18],[x-59,y-46],[x-47,y-18]],'#4d6350');rect(x-60,y-68,2,51,'#ead5a0');rect(x-83,y-17,64,3,'#8a885f');rect(x-90,y-13,3,6,'#796b46');
    rect(x+41,y+11,24,7,'#715f42');rect(x+43,y+9,20,4,'#9e8658');rect(x+43,y+16,4,4,'#645a3e');rect(x+59,y+16,4,4,'#645a3e');
    shadow(x,y+3,20,7);for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(x+Math.cos(a)*14,y+Math.sin(a)*6,4,3,'#8d9981');rect(x+Math.cos(a)*14-2,y+Math.sin(a)*6-2,4,1,'#bbc1a0');}
    rect(x-8,y,16,4,'#6c5940');polygon([[x-10,y+3],[x+7,y-5],[x+10,y-2],[x-6,y+6]],'#917247');
    const f=Math.sin(time*13)*2;polygon([[x-9,y],[x-7,y-10],[x-3,y-7],[x+1,y-23-f],[x+5,y-11],[x+8,y-14],[x+10,y],[x+3,y+4],[x-4,y+3]],'#e8a05c');polygon([[x-5,y],[x-2,y-10],[x+1,y-8],[x+3,y-16+f],[x+5,y],[x,y+3]],'#ffe29a');rect(x-2,y-2,4,5,'#fff1bf');
    for(let i=0;i<4;i++){const rise=(time*13+i*9)%40;rect(x+Math.sin(time+i)*5,y-12-rise,2,2,`rgba(255,226,165,${(1-rise/40)*.7})`);}
    rect(x+19,y-14,3,16,'#5c5940');rect(x-19,y-14,3,16,'#5c5940');rect(x-19,y-15,41,2,'#5c5940');oval(x,y-9,9,5,'#394e43');rect(x-8,y-12,16,4,'#526252');rect(x-6,y-12,12,1,'#b1ac7c');
  }
  function drawFox(){
    const x=fox.x,y=fox.y,b=Math.sin(time*2)*.5;shadow(x,y+1,13,4);polygon([[x+3,y-5],[x+18,y-9],[x+16,y-18],[x+12,y-13],[x+5,y-13]],'#c1854d');rect(x+14,y-18,4,6,'#eee0b0');rect(x-8,y-11+b,17,12,'#c88a52');rect(x-10,y-20+b,18,13,'#d89a61');polygon([[x-11,y-17+b],[x-10,y-28+b],[x-3,y-20+b]],'#d9a166');polygon([[x+2,y-21+b],[x+9,y-28+b],[x+9,y-16+b]],'#d79758');rect(x-9,y-24+b,3,5,'#7a6545');rect(x+5,y-23+b,3,5,'#7a6545');rect(x-8,y-12+b,14,5,'#f1d9aa');rect(x-7,y-17+b,2,2,'#3e4539');rect(x+3,y-17+b,2,2,'#3e4539');rect(x-2,y-12+b,3,2,'#4c4c3b');rect(x-6,y+1,4,2,'#776346');rect(x+4,y+1,4,2,'#776346');
    if(dist(player,fox)<100){ctx.font='7px monospace';ctx.textAlign='center';ctx.fillStyle='#fff0c0';ctx.fillText('BRIE',x,y-36);}
  }
  function drawNode(n){
    if(n.taken)return;const x=n.x,y=n.y;shadow(x,y,9,3);
    if(n.type==='mushroom'){rect(x-2,y-9,4,9,'#e4d8a7');rect(x+5,y-4,3,5,'#e4d8a7');oval(x,y-10,8,5,'#ad6550');rect(x-6,y-10,12,4,'#d5956b');rect(x-4,y-13,3,2,'#f1d3a0');rect(x+2,y-11,2,2,'#e9c693');oval(x+7,y-5,5,3,'#bc7555');}
    else{oval(x,y-5,10,7,'#4c7751');oval(x-3,y-11,7,6,'#5d8857');rect(x-6,y-12,3,3,'#e5ac86');rect(x+1,y-8,3,3,'#c97967');rect(x+5,y-6,3,3,'#e8a986');rect(x-4,y-3,3,3,'#bc6859');}
    if(Math.sin(time*2+n.id)>0.7){rect(x+10,y-16,1,5,'#f6df9e');rect(x+8,y-14,5,1,'#f6df9e');}
  }
  const playerSprite=[
    '......hhhhh.....','....hhhhhhhh....','...hhHHHHHHhh...','..hhHHHHHHHHh...','..hHHHHHHHHHHh..','..hhhhhhhhhhhhh.','....aaaaffff....','...aafffffffa...','...aaffeffefa...','....afffffff....','.....ffrrff.....','...bbrrrrrrbb...','..bbBrrrhhhBbb..','..fbBhhHHhhBbf..','..ffBhhHHhhBff..','....BhhhhhhB....','....bbbbbbbb....','.....pp..pp.....','.....pp..pp.....','....ddd..ddd....'
  ];
  function drawPlayer(){
    const x=Math.round(player.x),y=Math.round(player.y),bob=player.moving?Math.sin(player.walk)*1.2:Math.sin(time*2)*.3;shadow(x,y+1,10,4);
    if((player.hurt>0&&Math.floor(player.hurt*12)%2===0)||player.roll>0)ctx.globalAlpha=.55;
    const palette={h:'#426c50',H:'#75995e',a:'#966547',f:'#f5d5a2',e:'#3b4a3e',r:'#cf8f63',b:'#574f3d',B:'#bba170',p:'#8d8c68',d:'#4c5141'};
    if(player.dir===0){palette.f='#ac784d';palette.e='#ac784d';palette.r='#c09562';}
    playerSprite.forEach((row,yy)=>[...row].forEach((ch,xx)=>{if(palette[ch])rect(x-8+xx,y-21+yy+bob+(yy>16&&player.moving?(xx<8?Math.sin(player.walk):Math.sin(player.walk+Math.PI)):0),1,1,palette[ch]);}));
    if(player.dir===0){rect(x-5,y-12+bob,10,9,'#b99764');rect(x-4,y-11+bob,8,2,'#d0b47c');rect(x-1,y-7+bob,2,2,'#e4c791');}
    if(player.attack>0){
      const angles=[-Math.PI/2,Math.PI/2,Math.PI,0],progress=1-player.attack/.24,angle=angles[player.dir]-.95+progress*1.9;
      ctx.save();ctx.translate(x,y-10);ctx.strokeStyle='#fcf1bf99';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,30,angle-.55,angle+.12);ctx.stroke();ctx.rotate(angle);rect(7,-2,9,4,'#987b48');rect(14,-5,3,10,'#e4bf71');rect(17,-2,21,4,'#e9edca');rect(18,-2,19,1,'#ffffff');polygon([[38,-2],[43,0],[38,2]],'#e9edca');ctx.restore();
    }else if(state.metBrie){rect(x+9,y-12+bob,2,13,'#9fae9a');rect(x+7,y-3+bob,6,2,'#d8bd7a');rect(x+9,y-1+bob,2,5,'#826c45');}
    ctx.globalAlpha=1;
  }
  function drawSign(x,y){shadow(x,y,13,3);rect(x-2,y-21,4,23,'#766c46');rect(x-14,y-28,28,13,'#9b8654');rect(x-13,y-28,26,2,'#c3ad72');rect(x-10,y-22,15,2,'#e0ce97');polygon([[x+3,y-25],[x+9,y-21],[x+3,y-18]],'#e0ce97');}
function label(text,x,y,color='#fff0c6',size=7){ctx.font=`${size}px monospace`;ctx.textAlign='center';ctx.fillStyle='#263f3755';ctx.fillText(text,x+1,y+1);ctx.fillStyle=color;ctx.fillText(text,x,y);}
function drawBuilding(b){
 const {x,y,w,h}=b,toll=b.id==='tollhouse',roof=toll?'#788882':b.id==='inn'?'#a77958':'#81945d';shadow(x,y+4,w*.6,12);
 rect(x-w/2,y-h,w,h,toll?'#99a38b':'#d0bd91');rect(x-w/2+5,y-h+5,w-10,h-5,toll?'#879b88':'#dccca7');rect(x-w/2,y-5,w,8,'#7b8163');
 for(let px=x-w/2+8;px<x+w/2;px+=25)rect(px,y-h,4,h,'#887950');
 polygon([[x-w/2-9,y-h+13],[x,y-h-32],[x+w/2+9,y-h+13]],roof);rect(x-w/2-9,y-h+13,w+18,7,toll?'#506b63':'#697554');
 for(let i=0;i<4;i++)rect(x-w/2+6+i*8,y-h+4-i*6,w-12-i*16,2,toll?'#a5afa0':'#c2a571');
 rect(x-13,y-34,26,34,'#546c59');rect(x-9,y-30,18,30,'#3f564a');rect(x+7,y-15,2,3,'#e5c77e');
 for(const sign of [-1,1]){const wx=x+sign*w*.3;rect(wx-10,y-48,20,20,'#786f50');rect(wx-8,y-46,16,16,toll?'#526e66':'#e9ca84');rect(wx-1,y-46,2,17,'#88794f');rect(wx-8,y-39,16,2,'#88794f');}
 if(b.id==='inn'){rect(x-37,y-68,74,13,'#69775c');label('THE EMPTY LADLE',x,y-59,'#f0dfaa',6);rect(x+w*.28,y-h-30,13,31,'#8c8b6b');for(let i=0;i<3;i++){const rise=(time*8+i*11)%40;ctx.globalAlpha=(1-rise/40)*.25;oval(x+w*.28+6+Math.sin(time+i)*3,y-h-33-rise,5+rise*.16,3+rise*.1,'#e4dec2');}ctx.globalAlpha=1;}
 if(toll){rect(x-26,y-h-15,52,26,'#acb599');drawCheese(x,y-h+1,.6);label('TOLL & BLESSING',x,y-57,'#e8dfb8',6);}
 if(b.id==='shop'){for(let i=0;i<6;i++)rect(x-w/2+i*w/6,y-43,w/6,14,i%2?'#d9c58d':'#72957b');rect(x-w/2,y-29,w,4,'#63765a');}
}
function drawNPC(n){if(n.type==='fox'){drawFox();return;}const x=n.x,y=n.y,b=Math.sin(time*2+n.x)*.5;shadow(x,y,9,3);
 if(n.type==='tiny'){if(!state.pipHelped){oval(x,y-8,12,10,'#4d7650');oval(x-5,y-11,9,7,'#6a9259');rect(x-3,y-9,2,2,'#fff0bc');rect(x+3,y-9,2,2,'#fff0bc');}else{oval(x,y-9,10,11,'#bf6856');oval(x,y-10,7,8,'#e9c694');rect(x-4,y-15,8,4,'#ca7864');rect(x-4,y-10,2,2,'#374c40');rect(x+3,y-10,2,2,'#374c40');rect(x+10,y-16,2,19,'#b9c9b2');}return;}
 rect(x-6,y-13,12,12,n.color);rect(x-7,y-11,3,7,'#edc995');rect(x+5,y-11,3,7,'#edc995');rect(x-5,y-1,4,4,'#4f5645');rect(x+2,y-1,4,4,'#4f5645');rect(x-7,y-25+b,14,13,'#eccfa1');rect(x-7,y-27+b,14,5,n.type==='knight'?'#a0ada1':'#695a43');rect(x-4,y-20+b,2,2,'#344e40');rect(x+3,y-20+b,2,2,'#344e40');rect(x-2,y-15+b,4,1,'#bd956c');
 if(n.type==='knight'){rect(x-10,y-25+b,20,5,'#b9c2aa');rect(x-2,y-33+b,4,8,'#d59b6b');rect(x+12,y-28,2,31,'#806c49');polygon([[x+9,y-28],[x+13,y-34],[x+16,y-28]],'#d1d4b6');rect(x-7,y-10,14,3,'#d3ac66');}
 if(n.id==='marn'){rect(x-5,y-12,10,11,'#e8dcb7');rect(x-9,y-28,18,4,'#d7c7a7');}
 if(n.id==='nella'){rect(x-8,y-28,16,4,'#b8d1bc');rect(x-9,y-24,3,8,'#426d65');rect(x+4,y-10,5,10,'#d8cba3');}
 if(n.id==='hollis'){polygon([[x-11,y-26],[x,y-40],[x+11,y-26]],'#bab796');rect(x-6,y-21,5,4,'#5b755f');rect(x+2,y-21,5,4,'#5b755f');}
}
function drawQuestMark(x,y,symbol='!'){const bob=Math.sin(time*3)*2;oval(x,y-38+bob,6,7,'#344e4277');label(symbol,x,y-35+bob,'#ffe29a',10);}
function drawChest(o){const open=state.opened.includes(o.id);shadow(o.x,o.y,14,4);rect(o.x-12,o.y-14,24,15,open?'#685c42':'#9d7950');rect(o.x-12,o.y-17,24,6,o.id==='armor'?'#bd7461':'#c09d61');rect(o.x-12,o.y-5,24,3,'#c5ad72');rect(o.x-9,o.y-14,3,14,'#d2b881');rect(o.x+6,o.y-14,3,14,'#d2b881');rect(o.x-2,o.y-10,5,6,'#e8d69b');if(open)rect(o.x-9,o.y-16,18,8,'#3b4d3d');else if(Math.sin(time*2)>0.2)drawQuestMark(o.x,o.y,'✦');}
function drawWagon(){const x=1485,y=707;shadow(x,y+7,36,10);ctx.save();ctx.translate(x,y);ctx.rotate(-.25);rect(-30,-18,60,27,'#826b48');for(let i=0;i<5;i++)rect(-28+i*12,-16,10,23,'#aa8958');rect(-32,-9,64,3,'#c2a374');oval(-23,13,9,9,'#525541');oval(23,13,9,9,'#525541');oval(-23,13,5,5,'#a18b60');oval(23,13,5,5,'#a18b60');rect(-8,-15,15,19,'#e5d6b0');rect(-5,-12,9,2,'#ba7b65');rect(-5,-7,9,1,'#9b9978');ctx.restore();if(!state.manifest)drawQuestMark(x,y-17,'?');}
function drawBorder(){for(const x of [1675,1811]){rect(x-15,455,30,62,'#8e8c68');rect(x-18,449,36,8,'#b0aa82');rect(x-11,461,6,49,'#b7b092');rect(x+16,441,2,43,'#786a48');polygon([[x+18,442],[x+42,449],[x+18,463]],'#ba7355');rect(x+23,449,8,3,'#e9c884');}if(!state.accord){rect(1695,487,102,7,'#88744f');for(let x=1700;x<1796;x+=14)rect(x,479,5,24,'#ba9967');}else{rect(1695,481,6,26,'#ba9967');rect(1701,485,25,5,'#ba9967');}}
function drawHearth(x,y){shadow(x,y,17,6);oval(x,y,16,7,'#77866a');oval(x,y,12,5,'#5c634b');const f=Math.sin(time*12)*2;polygon([[x-7,y],[x-4,y-13],[x,y-9],[x+4,y-21+f],[x+7,y],[x,y+2]],'#edb375');polygon([[x-3,y],[x,y-13],[x+4,y],[x,y+2]],'#ffe6a3');}
function drawWorldDetails(){drawWater();drawBridge();drawBorder();for(let x=977;x<1080;x+=11){rect(x,518,9,30,'#a78e61');rect(x,518,9,2,'#c8b182');}rect(976,548,106,3,'#7b7050');
 for(const [x,y]of [[1080,900],[1170,900],[1170,848]]){rect(x-12,y-4,24,7,'#9e8559');rect(x-9,y+3,3,4,'#685e44');rect(x+7,y+3,3,4,'#685e44');if(state.delivered){drawCheese(x-5,y-4,.4);oval(x+5,y-6,4,2,'#e2d6ad');}}
 if(state.delivered){for(let i=0;i<8;i++){const x=990+i*35,y=818+Math.sin(i*.5)*8;rect(x,y,30,1,'#7d805e');polygon([[x+3,y],[x+16,y],[x+10,y+13]],i%2?'#82ad9a':'#d0a16c');}}
}
function drawEnemy(e){if(e.hp<=0)return;const x=e.x,y=e.y,bob=Math.sin(e.phase)*2;
 if(e.mode==='windup'){ctx.globalAlpha=.24;oval(x,y,e.type==='boss'?42:23,10,'#ed9b6e');ctx.globalAlpha=1;label('!',x,y-(e.type==='boss'?59:38),'#ffe0a0',12);}
 if(e.type==='boss'){
  shadow(x,y,29,10);rect(x-26,y-28,52,28,e.hit?'#ffe2a1':'#6d7765');rect(x-20,y-47,40,29,e.hit?'#fff0be':'#b7ab77');rect(x-24,y-43,48,9,'#d3c392');rect(x-17,y-31,34,8,'#4b6054');rect(x-11,y-29,5,3,e.mode==='windup'?'#f08c64':'#e6d28c');rect(x+7,y-29,5,3,e.mode==='windup'?'#f08c64':'#e6d28c');rect(x-10,y-17,20,9,'#ead6a3');rect(x-7,y-14,14,2,'#9b976f');rect(x-33,y-22,10,25,'#9d946c');rect(x+23,y-22,10,25,'#9d946c');rect(x-21,y,13,8,'#455749');rect(x+9,y,13,8,'#455749');drawCheese(x,y-45,.55);if(e.mode==='recover'){label('OVERDUE',x,y-62,'#e6dbaa',7);}return;
 }
 if(e.type==='beetle'){shadow(x,y,13,5);for(const sign of [-1,1])for(let i=0;i<3;i++)rect(x+sign*12-2,y-10+i*5+Math.sin(e.phase+i),5,2,'#58694d');oval(x,y-8+bob,13,12,e.hit?'#ffe9b3':'#a58c5c');oval(x-2,y-12+bob,9,8,'#c2ab70');rect(x,y-22+bob,2,20,'#796c4e');rect(x-5,y-7+bob,2,3,'#364c3c');rect(x+5,y-7+bob,2,3,'#364c3c');}
 else{shadow(x,y,14,5);oval(x,y-7+bob,14,10-bob/2,e.hit?'#fff0bf':'#4e7250');oval(x,y-10+bob,12,9,e.hit?'#fff2c5':'#8ba565');rect(x-8,y-15+bob,6,2,'#bfd083');rect(x-6,y-8+bob,2,3,'#354b3d');rect(x+5,y-8+bob,2,3,'#354b3d');rect(x-1,y-4+bob,3,1,'#56704c');}
 if(e.hp<e.maxHp){rect(x-10,y+7,20,2,'#304b4055');rect(x-10,y+7,20*e.hp/e.maxHp,2,'#ebd297');}
}
const cellarGround=document.createElement('canvas');cellarGround.width=880;cellarGround.height=640;const cc=cellarGround.getContext('2d');rect(0,0,880,640,'#263f3b',cc);rect(26,42,830,574,'#6a7662',cc);for(let y=48;y<610;y+=24)for(let x=32;x<854;x+=32){rect(x+(y%48?0:8),y,30,22,rand()>.5?'#75806a':'#6d7a65',cc);if(rand()>.8)rect(x+10,y+8,12,1,'#939a7b',cc);}rect(29,45,824,15,'#475b50',cc);rect(29,600,824,16,'#4b5f50',cc);rect(27,43,10,570,'#455b4f',cc);rect(844,43,14,570,'#40584d',cc);
function drawCellar(){ctx.drawImage(cellarGround,0,0);drawCellarDetails();rect(416,55,26,172,'#344f46');rect(416,304,26,300,'#344f46');rect(414,56,30,8,'#9da58a');if(!state.valvesSolved){rect(420,226,17,80,'#6b8069');for(let y=228;y<303;y+=12)rect(418,y,21,4,'#b0ad7d');}for(const p of [{x:550,y:347},{x:755,y:345}]){shadow(p.x,p.y,23,7);rect(p.x-17,p.y-55,34,58,'#899b82');rect(p.x-12,p.y-50,7,50,'#b3b799');rect(p.x-20,p.y-59,40,9,'#bbc1a0');rect(p.x-20,p.y-3,40,8,'#a3b295');}
 for(const o of cellarObjects){if(o.kind==='valve'){rect(o.x-9,o.y-28,18,28,'#3d6359');rect(o.x-4,o.y-39,8,14,'#a1ac88');oval(o.x,o.y-18,13,11,state.valvesSolved||valveOrder.includes(o.id)?'#d5c783':'#a4ad91');oval(o.x,o.y-18,8,6,'#557563');rect(o.x-1,o.y-28,3,22,'#d0c798');rect(o.x-12,o.y-19,24,3,'#d0c798');label(o.id.toUpperCase(),o.x,o.y+13,'#e1ddbe',7);}if(o.kind==='supplies'){rect(o.x-20,o.y-17,40,20,state.supplies?'#58624c':'#ad9564');rect(o.x-20,o.y-18,40,4,'#d1b986');rect(o.x-3,o.y-15,7,16,'#d6c29b');if(state.bossDefeated&&!state.supplies)drawQuestMark(o.x,o.y,'!');}if(o.kind==='vent'){rect(o.x-20,o.y-16,40,18,'#2c493f');for(let x=-17;x<20;x+=7)rect(o.x+x,o.y-16,3,18,'#869981');}if(o.kind==='plaque'){rect(o.x-18,o.y-24,36,25,'#b3b799');for(let i=0;i<3;i++)rect(o.x-12,o.y-19+i*5,24,2,'#74836b');}if(o.kind==='exit'){rect(o.x-21,o.y-12,42,34,'#a2a68a');for(let i=0;i<4;i++)rect(o.x-21,o.y-12+i*8,42,2,'#d1ceb0');label('EXIT',o.x,o.y+36,'#ede2bb');}}
 for(const [x,y]of [[72,80],[360,80],[490,80],[810,80],[490,570],[810,570]]){ctx.globalAlpha=.08;oval(x,y,37,32,'#ffe19b');ctx.globalAlpha=1;rect(x-3,y-9,6,15,'#b09763');rect(x-2,y-17+Math.sin(time*9),4,9,'#ffd48b');}
}
function drawCellarDetails(){
 // Aging shelves, copper conduits, and discarded forms tell the room's history.
 rect(94,83,240,48,'#465b4a');rect(92,80,244,7,'#9d966b');rect(92,126,244,7,'#9d966b');
 for(let x=105;x<330;x+=37){drawCheese(x,112,.85);rect(x-14,133,3,8,'#676d50');}
 rect(122,158,258,5,'#a89968');rect(123,160,257,2,'#d0bd83');
 for(const x of [133,261,363]){rect(x-3,162,6,27,'#a89968');rect(x-1,162,2,27,'#d6c48a');}
 rect(459,109,255,6,'#a79561');rect(461,111,253,2,'#d1ba7d');rect(711,108,6,44,'#a79561');
 for(const [x,y]of [[193,331],[624,542],[800,422]]){rect(x-6,y-7,13,10,'#c7c2a0');rect(x-3,y-4,8,1,'#939b7c');rect(x-3,y-1,6,1,'#939b7c');}
 for(const [x,y]of [[475,540],[801,540]]){oval(x,y,16,7,'#465b49');rect(x-14,y-22,28,22,'#8f8259');oval(x,y-23,14,6,'#b6a879');rect(x-15,y-16,30,3,'#64755a');rect(x-15,y-4,30,3,'#64755a');}
 label('TEMPLE STORES · DO NOT DISTRIBUTE',663,90,'#bfc5a4',7);
}
function draw(){const mw=scene==='world'?W:880,mh=scene==='world'?H:640;cam.x=clamp(player.x-viewW/2,0,Math.max(0,mw-viewW));cam.y=clamp(player.y-viewH/2,0,Math.max(0,mh-viewH));ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,viewW,viewH);ctx.fillStyle=scene==='cellar'?'#263f3b':'#72975e';ctx.fillRect(0,0,viewW,viewH);ctx.save();ctx.translate(-Math.floor(cam.x)+(shake?Math.round(Math.sin(time*77)*shake):0),-Math.floor(cam.y));const items=[];
 if(scene==='world'){
  ctx.drawImage(ground,0,0);drawWorldDetails();
  for(const t of trees)if(t.x>cam.x-75&&t.x<cam.x+viewW+75&&t.y>cam.y-10&&t.y<cam.y+viewH+120)items.push({y:t.y,draw:()=>drawTree(t)});
  for(const r of rocks)if(r.x>cam.x-20&&r.x<cam.x+viewW+20&&r.y>cam.y-20&&r.y<cam.y+viewH+20)items.push({y:r.y,draw:()=>drawRock(r)});
  for(const n of nodes)if(!n.taken)items.push({y:n.y,draw:()=>drawNode(n)});
  for(const b of structures)items.push({y:b.y,draw:()=>drawBuilding(b)});
  for(const n of D.npcs)items.push({y:n.y,draw:()=>drawNPC(n)});
  for(const o of D.objects)if(o.kind==='chest')items.push({y:o.y,draw:()=>drawChest(o)});
  items.push({y:camp.y,draw:drawCamp},{y:shrine.y+16,draw:drawShrine},{y:707,draw:drawWagon},{y:794,draw:()=>drawSign(670,794)},{y:860,draw:()=>drawHearth(997,860)},{y:302,draw:()=>{drawSign(2020,302);rect(2015,277,10,13,'#ede0b8');}},{y:798,draw:()=>drawSign(1860,798)});
 }else drawCellar();
 for(const e of enemies)if(e.hp>0&&e.scene===scene)items.push({y:e.y,draw:()=>drawEnemy(e)});items.push({y:player.y,draw:drawPlayer});items.sort((a,b)=>a.y-b.y);for(const item of items)item.draw();
 if(scene==='world'){
  const o=objective(),q=o.pin==='shrine'?'brie':o.pin==='border'?'guard':o.pin==='dock'?'nella':o.pin==='village'?'marn':null;if(q){const n=D.npcs.find(n=>n.id===q);drawQuestMark(n.x,n.y,'!');}
  if(!state.pipHelped)drawQuestMark(414,779,state.armor?'!':'?');if(!state.hollisHelped)drawQuestMark(1280,480,state.ventFound?'!':'?');
  if(state.pipHelped&&state.delivered){const x=1207,y=900;oval(x,y-8,9,10,'#bf6f5c');rect(x-4,y-12,8,7,'#f1d9a8');}
  for(let i=0;i<36;i++){const x=150+(i*179)%1950+Math.sin(time*.25+i)*12,y=120+(i*127)%1200+Math.cos(time*.4+i)*8;ctx.globalAlpha=(Math.sin(time*1.3+i*4)+1)*.3;rect(x,y,1,2,'#f8e6a0');}ctx.globalAlpha=1;
  ctx.globalAlpha=.035;for(let i=0;i<7;i++){const x=130+i*320+Math.sin(time*.05)*20;polygon([[x,-40],[x+55,-40],[x+420,H],[x+300,H]],'#ffffc2');}ctx.globalAlpha=1;
 }
 for(const p of particles){ctx.globalAlpha=clamp(p.life*2,0,1);rect(p.x,p.y,p.size,p.size,p.color);}ctx.globalAlpha=1;for(const p of projectiles){oval(p.x,p.y,4,4,'#ecd08e');rect(p.x-1,p.y-1,2,2,'#fff3c1');}ctx.restore();
 if(running()&&scene==='world'){const p=currentTarget();if(p&&dist(player,p)>170){const a=Math.atan2(p.y-player.y,p.x-player.x),r=Math.min(viewW*.4,viewH*.34),x=viewW/2+Math.cos(a)*r,y=viewH/2+Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a);polygon([[7,0],[-4,-4],[-2,0],[-4,4]],'#ffdfa0');ctx.restore();}}
}
function sideSummary(){return [state.pipHelped,state.mealDonated,state.hollisHelped].filter(Boolean).length;}
function drawMap(){const m=$('mapCanvas'),c=m.getContext('2d');m.width=660;m.height=450;c.fillStyle='#e6ddbb';c.fillRect(0,0,660,450);const sx=660/W,sy=450/H;c.save();c.scale(sx,sy);c.globalAlpha=.44;c.drawImage(ground,0,0);c.globalAlpha=1;for(const path of paths){c.strokeStyle='#a19165';c.lineWidth=8;c.beginPath();path.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}c.restore();for(const p of D.pins){const x=p.x*sx,y=p.y*sy,known=state.discovered.includes(p.id),selected=(waypoint||objective().pin)===p.id;c.fillStyle=selected?'#9b663b':known?'#547052':'#8c9575';c.beginPath();c.arc(x,y,selected?7:5,0,Math.PI*2);c.fill();c.font='14px Georgia';c.textAlign=p.x>1900?'right':'center';c.fillStyle='#3b5640';c.fillText(p.name,p.x>1900?x-9:x,y-12);}c.fillStyle='#f8edc4';c.strokeStyle='#385542';c.lineWidth=2;c.beginPath();const px=(scene==='world'?player.x:1450)*sx,py=(scene==='world'?player.y:350)*sy;c.arc(px,py,5,0,Math.PI*2);c.fill();c.stroke();c.font='12px Georgia';c.fillStyle='#6b785a';c.textAlign='left';c.fillText('N ↑',24,29);c.textAlign='right';c.font='italic 12px Georgia';c.fillText('Disputed by everyone. Maintained by no one.',642,432);}
function renderPanel(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===panelTab)));const body=$('panelBody');
 if(panelTab==='map'){body.innerHTML='<div class="map-intro"><span class="eyebrow">THE UNCLAIMED MARCHES</span><p>Select a destination to point your compass toward it.</p></div><canvas id="mapCanvas" aria-label="Regional map showing landmarks and your current position"></canvas><div class="map-pins">'+D.pins.map(p=>`<button data-pin="${p.id}" class="${waypoint===p.id?'selected':''}"><b>${p.icon}</b>${p.name}</button>`).join('')+'</div><button id="trackQuest" class="small-button">Follow the current quest</button>';drawMap();body.querySelectorAll('[data-pin]').forEach(b=>b.addEventListener('click',()=>{waypoint=b.dataset.pin;renderPanel();}));$('trackQuest').addEventListener('click',()=>{waypoint=null;renderPanel();});}
 if(panelTab==='quests'){const o=objective(),side=[['A knight in need',state.pipHelped?'Complete · Waxguard charm earned':state.armor?'Return the red-wax shell to Sir Pip.':'Find Sir Pip on the western woodland path. His shell is in a chest farther north.'],['A bowl for someone else',state.mealDonated?'Complete · Marn’s stamina charm earned':'Cook a mushroom and a berry into stew, then share a bowl with Marn in Little Whey.'],['Below the blessing line',state.hollisHelped?'Complete · Knife sharpened':state.ventFound?'Bring the hidden-vent rubbing to Hollis outside the tollhouse.':'Hollis suspects a second basement. Look for a vent in the tollhouse cellar’s southeast corner.']];body.innerHTML=`<div class="panel-intro"><span class="eyebrow">CHAPTER I · A MATTER OF TASTE</span><h2>Your field notes</h2><p>The road is made of people you meet along the way.</p></div><article class="active-quest"><span class="eyebrow">${state.chapterDone?'CHAPTER COMPLETE':'THE MAIN INVESTIGATION'} · ${o.step}/9</span><h3>${o.title}</h3><p>${o.text}</p></article><div class="section-label">SMALL FAVORS · ${sideSummary()}/3 COMPLETE</div>${side.map(([title,text])=>`<article class="quest-card"><h3>${title}</h3><p>${text}</p></article>`).join('')}<p class="panel-footnote">Golden markers follow the main story. Side favors unlock permanent rewards and change the people at the chapter’s ending.</p>`;}
 if(panelTab==='satchel'){const equipment=[['Cheese knife',state.metBrie?(state.hollisHelped?'Hollis sharpened it. Deals 2 damage.':'Worn, but surprisingly persuasive. Deals 1 damage.'):'Brie has something for you.'],['Courier boots',state.boots?'Equipped · Faster walking, faster dodge recovery.':'Unfound · Explore the southern dead-end trail.'],['Waxguard charm',state.pipHelped?'Equipped · +1 maximum heart.':'Unearned · Help Sir Pip.'],['Pilgrim’s heart',state.heart?'Equipped · +1 maximum heart.':'Unfound · Search the southeast loop.'],['Marn’s herb charm',state.mealDonated?'Equipped · +25 maximum stamina.':'Unearned · Share a woodland stew.']];const clues=[state.manifest?'Temple destruction order':null,state.cellarKey?'Tollhouse service key':null,state.supplies&&!state.delivered?'Relief supplies':null,state.ventFound?'Cathedral pipe rubbing':null,state.accord?'Guest charter':null].filter(Boolean);body.innerHTML=`<div class="panel-intro"><span class="eyebrow">SMALL THINGS. USEFUL THINGS.</span><h2>Your satchel</h2><p>Gear equips automatically. Your quest supplies are kept safe.</p></div><div class="inventory-counts"><div>🍄<strong>${bag.mushrooms}</strong>Mushrooms</div><div>❧<strong>${bag.berries}</strong>Berry sprigs</div><div>♨<strong>${bag.meals}</strong>Woodland stews</div></div><p class="recipe">1 mushroom + 1 berry → woodland stew. Cook at a hearth. Press Q to restore 3 hearts.</p>${equipment.map(([name,description])=>`<article class="quest-card"><h3>${name}</h3><p>${description}</p></article>`).join('')}<div class="section-label">DOCUMENTS & CURIOSITIES</div><p>${clues.length?clues.join(' · '):'A pocket full of questions.'}</p>`;}
 if(panelTab==='atlas')body.innerHTML='<div class="panel-intro"><span class="eyebrow">SEVEN NATIONS. ONE MISSING CHEESE.</span><h2>The wider world</h2><p>Rumors from beyond the Marches. This chapter begins between Cheddar and Mozza.</p></div><div class="nation-grid">'+D.nations.map(([name,motto,description,color])=>`<article class="nation-card" style="--nation:${color}"><span class="nation-seal">✦</span><h3>${name}</h3><i>${motto}</i><p>${description}</p></article>`).join('')+'</div><p class="panel-footnote">Wheybridge sits at the meeting of seven roads. Every nation has a seat at its table. Lately, most of those seats have been empty.</p>';
}
function setPanel(value,tab=panelTab){if(!started||endingOpen)return;if(dialogOpen)closeDialog();panelOpen=value;panelTab=tab;keys.clear();$('panel').hidden=!value;$('journalButton').setAttribute('aria-expanded',String(value));if(value){renderPanel();$('panelClose').focus();}else canvas.focus();}
function setPaused(value){if(!started||dialogOpen||endingOpen)return;paused=value;keys.clear();$('pause').hidden=!value;$('resetConfirm').hidden=true;if(value){save();$('pauseDescription').textContent=saveConflict?'Another tab has newer progress. Resume to load that adventure.':storageOK?'Your adventure is saved on this device.':'Storage is unavailable. Progress lasts for this visit.';$('resume').focus();}else{if(saveConflict){load();saveConflict=false;syncHud();}canvas.focus();}}
function start(){started=true;$('welcome').hidden=true;canvas.focus();if(!state.metBrie)talk('brie');else notify('Welcome back, Guest. The Marches remember.');save();}
function resetAdventure(){try{localStorage.removeItem(SAVE_KEY);}catch{}state=freshState();for(const k of Object.keys(bag))bag[k]=0;scene='world';Object.assign(player,{...D.start,hp:5,stamina:100,dir:1,attack:0,hurt:0,cooldown:0,roll:0,rollCooldown:0});valveOrder=[];projectiles.length=0;particles.length=0;waypoint=null;saveConflict=false;endingOpen=false;$('ending').hidden=true;applyWorldState();paused=false;panelOpen=false;$('panel').hidden=true;$('pause').hidden=true;$('resetConfirm').hidden=true;hudMemo='';syncHud();talk('brie');save();}
function resize(){const r=canvas.getBoundingClientRect();viewW=576;viewH=Math.round(576*r.height/r.width);canvas.width=viewW;canvas.height=viewH;ctx.imageSmoothingEnabled=false;}
function frame(stamp){const dt=Math.min((stamp-lastStamp)/1000||0,.045);lastStamp=stamp;tick(dt);draw();requestAnimationFrame(frame);}
$('start').addEventListener('click',start);$('resume').addEventListener('click',()=>setPaused(false));$('pauseButton').addEventListener('click',()=>setPaused(!paused));$('eat').addEventListener('click',eat);$('journalButton').addEventListener('click',()=>setPanel(!panelOpen,'quests'));$('mapButton').addEventListener('click',()=>setPanel(!panelOpen,'map'));$('panelClose').addEventListener('click',()=>setPanel(false));document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{panelTab=b.dataset.tab;renderPanel();}));
$('sound').addEventListener('click',()=>{soundOn=!soundOn;tone(659,.2);syncHud();if(started)save();});$('restart').addEventListener('click',()=>{$('resetConfirm').hidden=false;});$('cancelReset').addEventListener('click',()=>{$('resetConfirm').hidden=true;});$('confirmReset').addEventListener('click',resetAdventure);$('keepExploring').addEventListener('click',()=>applyAction('explore'));
const gameKeys=new Set(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift',' ','j','e','q','r','m','i','l','Escape']);
window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!gameKeys.has(k)||!started)return;if(e.target instanceof HTMLButtonElement&&k===' ')return;e.preventDefault();if(e.repeat&&[' ','j','e','q','r','m','i','l','Escape'].includes(k))return;if(k==='Escape'){if(endingOpen)applyAction('explore');else if(dialogOpen)closeDialog();else if(panelOpen)setPanel(false);else setPaused(!paused);return;}if(['m','i','l'].includes(k)){if(paused||endingOpen)return;setPanel(!panelOpen,k==='m'?'map':k==='i'?'satchel':'quests');return;}if(k==='e'){interact();return;}if(k===' '||k==='j'){attack();return;}if(k==='r'){dodge();return;}if(k==='q'){eat();return;}if(running())keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();if(running())setPaused(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(started)save();if(running())setPaused(true);}});window.addEventListener('storage',e=>{if(e.key===SAVE_KEY&&started&&e.newValue){saveConflict=true;keys.clear();if(dialogOpen)closeDialog();panelOpen=false;endingOpen=false;$('panel').hidden=true;$('ending').hidden=true;paused=true;$('pause').hidden=false;$('pauseDescription').textContent='Another tab has newer progress. Resume to load that adventure.';$('resume').focus();}});
canvas.addEventListener('pointerdown',()=>{canvas.focus();attack();});document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(running())keys.add(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key));});document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();({attack,interact,dodge})[b.dataset.action]();}));
window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>{if(started)save();});hasSave=load();if(hasSave){$('start').innerHTML='Continue your adventure <span>↗</span>';$('welcome').querySelector('h2').textContent=state.chapterDone?'A place at the table.':'The Marches remember.';}$('saveNote').textContent='Progress saves automatically on this device.';resize();syncHud();requestAnimationFrame(frame);
})();
