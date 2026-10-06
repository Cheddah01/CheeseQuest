/* CheeseQuest — an original, dependency-free woodland adventure. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const W = 1200, H = 900, SAVE_KEY = 'cheesequest-v1';
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  let seed=94723;
  function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const paths=[[[160,760],[270,700],[390,650],[470,570],[540,500],[520,400],[640,320],[750,235],[950,185]],[[540,500],[700,520],[890,520],[995,450],[1040,330],[950,185]],[[180,700],[160,560],[330,490],[520,400]]];
  const camp={x:244,y:675}, fox={x:184,y:706}, shrine={x:954,y:157};
  function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
  function pathDistance(x,y){let d=9999;for(const p of paths)for(let i=1;i<p.length;i++)d=Math.min(d,segmentDistance(x,y,p[i-1],p[i]));return d;}
  function inPond(x,y){return ((x-814)/144)**2+((y-565)/109)**2<1;}
  function onBridge(x,y){return x>659&&x<969&&y>502&&y<539;}
  const trees=[], rocks=[], grass=[], flowers=[], particles=[];
  for(let i=0;i<280;i++){
    const x=35+rand()*(W-70), y=45+rand()*(H-80);
    const border=x<105||x>1110||y<90||y>830;
    if((border||pathDistance(x,y)>74)&&!inPond(x,y)&&dist({x,y},camp)>110&&dist({x,y},fox)>85&&dist({x,y},shrine)>100)trees.push({x,y,scale:.75+rand()*.55,tint:Math.floor(rand()*3)});
  }
  for(let i=0;i<40;i++){const x=100+rand()*1000,y=110+rand()*670;if(pathDistance(x,y)>45&&!inPond(x,y)&&dist({x,y},shrine)>90)rocks.push({x,y,size:6+rand()*8});}
  for(let i=0;i<2500;i++){const x=rand()*W,y=rand()*H;if(!inPond(x,y)&&pathDistance(x,y)>23)grass.push({x,y,s:rand()*8,c:Math.floor(rand()*4)});}
  for(let i=0;i<190;i++){const x=100+rand()*1000,y=100+rand()*730;if(!inPond(x,y)&&pathDistance(x,y)>28)flowers.push({x,y,c:Math.floor(rand()*3)});}
  const nodes=[{x:310,y:670,type:'mushroom'},{x:362,y:710,type:'berry'},{x:207,y:591,type:'mushroom'},{x:375,y:520,type:'berry'},{x:471,y:432,type:'mushroom'},{x:604,y:378,type:'berry'},{x:685,y:247,type:'mushroom'},{x:763,y:203,type:'berry'},{x:953,y:438,type:'mushroom'},{x:1037,y:470,type:'berry'},{x:1010,y:252,type:'mushroom'},{x:845,y:284,type:'berry'}].map((n,i)=>({...n,id:i,taken:false}));
  // Keep every objective approachable, including when tree placement changes.
  const starts=[{x:478,y:574},{x:657,y:299},{x:1015,y:394}];
  for(let i=trees.length-1;i>=0;i--)if([...nodes,...starts].some(n=>dist(n,trees[i])<42))trees.splice(i,1);
  for(let i=rocks.length-1;i>=0;i--)if([...nodes,...starts].some(n=>dist(n,rocks[i])<32))rocks.splice(i,1);
  const enemies=starts.map((p,i)=>({...p,homeX:p.x,homeY:p.y,id:i,hp:3,hit:0,attack:0,phase:i*2}));
  const player={x:312,y:680,hp:5,stamina:100,dir:1,walk:0,moving:false,attack:0,cooldown:0,hurt:0};
  const bag={mushrooms:0,berries:0,meals:0};
  let won=false,started=false,paused=false,journalOpen=false,dialogOpen=false,storageOK=true;
  let time=0,saveTimer=0,toastTimer=0,shake=0,nearest=null,keys=new Set(),cam={x:0,y:0},viewW=576,viewH=360;
  let audio=null,soundOn=false,lastChirp=0,lastStamp=0;
  function blocked(x,y){
    if(x<35||y<50||x>W-35||y>H-35)return true;
    if(inPond(x,y)&&!onBridge(x,y))return true;
    if(x>906&&x<1002&&y>94&&y<166)return true;
    if(trees.some(t=>Math.hypot(x-t.x,y-t.y)<12*t.scale+5))return true;
    return rocks.some(r=>Math.hypot(x-r.x,y-r.y)<r.size+5);
  }
  function move(body,dx,dy){if(!blocked(body.x+dx,body.y))body.x+=dx;if(!blocked(body.x,body.y+dy))body.y+=dy;}
  function save(){
    try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,x:player.x,y:player.y,hp:player.hp,bag,defeated:enemies.filter(e=>e.hp<=0).map(e=>e.id),gathered:nodes.filter(n=>n.taken).map(n=>n.id),won,soundOn}));}
    catch{storageOK=false;$('saveNote').textContent='Device storage is unavailable. Progress lasts for this visit.';$('pause').querySelector('p').textContent='Progress will last for this visit.';}
  }
  function load(){
    try{
      const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s||s.version!==1)return false;
      if(Number.isFinite(s.x)&&Number.isFinite(s.y)&&!blocked(s.x,s.y)){player.x=s.x;player.y=s.y;}
      player.hp=Number.isFinite(s.hp)?clamp(Math.round(s.hp),1,5):5;
      for(const k of Object.keys(bag))bag[k]=Number.isFinite(s.bag?.[k])?clamp(Math.floor(s.bag[k]),0,99):0;
      for(const e of enemies)if(Array.isArray(s.defeated)&&s.defeated.includes(e.id))e.hp=0;
      for(const n of nodes)if(Array.isArray(s.gathered)&&s.gathered.includes(n.id))n.taken=true;
      won=s.won===true&&enemies.every(e=>e.hp<=0);soundOn=s.soundOn===true;return true;
    }catch{return false;}
  }
  const hasSave=load();
  function tone(freq,duration=.13,type='sine',volume=.035,delay=0){
    if(!soundOn)return;
    try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.01);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+duration+.02);}catch{}
  }
  function chime(){[523.25,659.25,783.99].forEach((n,i)=>tone(n,.35,'sine',.04,i*.09));}
  function notify(message){$('toast').textContent=message;$('toast').classList.add('show');toastTimer=3.3;}
  function burst(x,y,color,count=13){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*80,vy:-20-Math.random()*60,life:.5+Math.random()*.5,max:1,color,size:1+Math.floor(Math.random()*3)});}
  function fragments(){return enemies.filter(e=>e.hp<=0).length;}
  function syncHud(){
    $('hearts').innerHTML=Array.from({length:5},(_,i)=>`<span class="${i<player.hp?'':'empty-heart'}">♥</span>`).join('');$('hearts').setAttribute('aria-label',`${player.hp} of 5 hearts`);
    $('stamina').style.width=`${player.stamina}%`;
    for(const k of Object.keys(bag))$(k).textContent=bag[k];
    $('eat').disabled=bag.meals<1;
    [...$('sparks').children].forEach((el,i)=>el.classList.toggle('found',i<fragments()));
    $('questText').textContent=won?'The Great Cheese is yours!':fragments()===3?'Unseal the northern shrine':'Find the three golden rinds';
    $('sparks').setAttribute('aria-label',`${fragments()} of 3 golden rinds found`);
    $('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent=soundOn?'Sound on':'Sound off';
  }
  function showDialog(eyebrow,title,text){dialogOpen=true;keys.clear();$('dialogEyebrow').textContent=eyebrow;$('dialogTitle').textContent=title;$('dialogText').textContent=text;$('dialog').hidden=false;$('dialogClose').focus();}
  function closeDialog(){dialogOpen=false;$('dialog').hidden=true;canvas.focus();}
  function running(){return started&&!paused&&!journalOpen&&!dialogOpen;}
  function attack(){
    if(!running()||player.cooldown>0)return;
    player.attack=.24;player.cooldown=.38;tone(170,.1,'triangle',.035);
    const facing=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}][player.dir];
    for(const e of enemies){
      if(e.hp<=0||dist(player,e)>49)continue;
      const dx=e.x-player.x,dy=e.y-player.y,len=Math.hypot(dx,dy)||1;
      if((dx*facing.x+dy*facing.y)/len<-.25)continue;
      e.hp--;e.hit=.25;const knock=12;move(e,dx/len*knock,dy/len*knock);burst(e.x,e.y-8,'#e4e89a',8);tone(e.hp>0?260:740,.18,'triangle');
      if(e.hp<=0){burst(e.x,e.y-13,'#ffe298',28);chime();notify(`${fragments()}/3 golden rinds found${fragments()===3?' · The cheese shrine is ready!':''}`);save();}
    }
    syncHud();
  }
  function eat(){if(!running()||bag.meals<1)return;if(player.hp===5){notify('Already full of courage. Save that stew for later.');return;}bag.meals--;player.hp=Math.min(5,player.hp+3);burst(player.x,player.y-15,'#e6e89d');chime();notify('Woodland stew · 3 hearts restored');syncHud();save();}
  function findInteraction(){
    const choices=[];
    for(const n of nodes)if(!n.taken&&dist(player,n)<35)choices.push({target:n,kind:'gather',label:n.type==='mushroom'?'Gather mushroom':'Pick berry sprig'});
    if(dist(player,fox)<45)choices.push({target:fox,kind:'fox',label:'Talk to Brie'});
    if(dist(player,camp)<47)choices.push({target:camp,kind:'camp',label:'Cook woodland stew'});
    if(dist(player,{x:shrine.x,y:shrine.y+38})<51)choices.push({target:shrine,kind:'shrine',label:won?'Admire the Great Cheese':fragments()===3?'Unseal the Great Cheese':'Inspect cheese shrine'});
    return choices.sort((a,b)=>dist(player,a.target)-dist(player,b.target))[0]||null;
  }
  function interact(){
    if(dialogOpen){closeDialog();return;}if(!running())return;
    nearest=findInteraction();if(!nearest)return;
    const {kind,target}=nearest;
    if(kind==='gather'){target.taken=true;bag[target.type==='mushroom'?'mushrooms':'berries']++;burst(target.x,target.y-7,'#f4d994',8);tone(660,.15);notify(target.type==='mushroom'?'+1 woodland mushroom':'+1 red berry sprig');}
    if(kind==='fox')showDialog('BRIE · CAMPFIRE CONNOISSEUR',won?'You absolute legend.':'You smell that, wanderer?',won?'The Great Cheese! Nutty. Golden. Aged for a thousand naps. I knew following you would pay off. There’s always a seat by my fire.':'The Great Cheese rests in the northeast shrine. Three moss slimes stole its golden rind keys. Give them a few sword swipes, then follow the path north. And do gather a mushroom and a berry — my fire makes an excellent stew.');
    if(kind==='camp'){
      if(bag.mushrooms&&bag.berries){bag.mushrooms--;bag.berries--;bag.meals++;burst(camp.x,camp.y-15,'#ffc978',23);chime();notify('Cooked woodland stew · Press Q when you need hearts');}
      else{player.hp=5;notify('A quiet rest restores your hearts. Cooking needs 1 mushroom + 1 berry.');tone(440,.3);}
    }
    if(kind==='shrine'){
      if(won)showDialog('THE GREAT CHEESE','A legend worth the walk.','The wheel glows softly. The woods smell faintly of toasted butter. You may keep exploring, pick the remaining ingredients, or tell Brie the good news.');
      else if(fragments()<3)showDialog('THE SHRINE OF THE GOLDEN RIND','A very ancient snack.',`An inscription reads: “Only the bravest, hungriest heart may claim the Great Cheese.” Three rind-shaped hollows wait in the stone. You have found ${fragments()} of 3. Look for moss slimes along the woodland paths.`);
      else{won=true;burst(shrine.x,shrine.y-28,'#ffdf7e',70);[523,659,784,1047].forEach((f,i)=>tone(f,.8,'sine',.06,i*.18));showDialog('QUEST COMPLETE · A LEGEND, WELL AGED','The Great Cheese is yours.','The seals crumble. A magnificent golden wheel rises from the shrine. Notes of hazelnut. Hints of adventure. An unbelievably good finish. You came. You wandered. You cheddar. The woods are yours to explore.');}
    }
    syncHud();save();
  }
  function setPaused(value){if(!started)return;paused=value;keys.clear();$('pause').hidden=!value;$('resetConfirm').hidden=true;if(value){save();$('resume').focus();}else canvas.focus();}
  function setJournal(value){if(!started)return;journalOpen=value;keys.clear();$('journal').hidden=!value;$('journalButton').setAttribute('aria-expanded',String(value));if(value)$('journalClose').focus();else canvas.focus();}
  function start(){started=true;$('welcome').hidden=true;canvas.focus();tone(523,.3);notify(hasSave?'Welcome back, cheese seeker.':'Find Brie by the fire, or follow your nose.');save();}
  function tick(dt){
    time+=dt;
    if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;if(p.life<=0)particles.splice(i,1);}
    if(!running())return;
    player.attack=Math.max(0,player.attack-dt);player.cooldown=Math.max(0,player.cooldown-dt);player.hurt=Math.max(0,player.hurt-dt);shake=Math.max(0,shake-dt*18);
    let dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);
    player.moving=!!(dx||dy);
    if(player.moving){const length=Math.hypot(dx,dy);dx/=length;dy/=length;const sprint=keys.has('Shift')&&player.stamina>1;const speed=sprint?132:82;move(player,dx*speed*dt,dy*speed*dt);player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?0:1);player.walk+=dt*(sprint?14:10);player.stamina=clamp(player.stamina+(sprint?-28:16)*dt,0,100);}
    else player.stamina=clamp(player.stamina+25*dt,0,100);
    for(const e of enemies){
      if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,e.attack-dt);e.phase+=dt*3;
      let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);
      if(d<125&&d>17&&e.hit<=0){move(e,dx/d*28*dt,dy/d*28*dt);}
      else if(d>=125){dx=e.homeX-e.x;dy=e.homeY-e.y;d=Math.hypot(dx,dy);if(d>5)move(e,dx/d*20*dt,dy/d*20*dt);}
      if(dist(e,player)<20&&e.attack<=0&&player.hurt<=0&&e.hit<=0){player.hp--;player.hurt=1.25;e.attack=1.3;shake=3;burst(player.x,player.y-9,'#edb083',9);tone(100,.25,'triangle',.07);const len=dist(e,player)||1;move(player,(player.x-e.x)/len*15,(player.y-e.y)/len*15);
        if(player.hp<=0){player.x=312;player.y=680;player.hp=5;player.hurt=2;for(const slime of enemies){slime.x=slime.homeX;slime.y=slime.homeY;if(slime.hp>0)slime.hp=3;}notify('Brie brought you back to camp. Your rinds and supplies are safe.');}save();
      }
    }
    nearest=findInteraction();$('interaction').hidden=!nearest;if(nearest)$('interaction').innerHTML=`<kbd>E</kbd>${nearest.label}`;
    const region=player.y<285&&player.x>790?'THE CHEESE SHRINE':inPond(player.x,player.y)?'WILLOW POND':player.x<390&&player.y>580?'BRIE’S CAMPSITE':'FERNWOOD GLADE';
    const sub=region==='THE CHEESE SHRINE'?'Something extraordinary is aging':region==='WILLOW POND'?'Mind the lily pads':region==='BRIE’S CAMPSITE'?'A warm fire. A familiar fox.':'Follow your nose';
    $('area').innerHTML=`${region}<span>${sub}</span>`;
    saveTimer+=dt;if(saveTimer>3){saveTimer=0;save();}
    if(time-lastChirp>12){lastChirp=time;tone(1320,.08,'sine',.008);tone(1760,.13,'sine',.008,.12);}
    syncHud();
  }
  function rect(x,y,w,h,color,c=ctx){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function oval(x,y,rx,ry,color,c=ctx){for(let yy=-ry;yy<=ry;yy+=2){const width=Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)))*rx;rect(x-width,y+yy,width*2,2,color,c);}}
  function polygon(points,color,c=ctx){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
  function shadow(x,y,rx=12,ry=4){oval(x,y,rx,ry,'#244d444a');}
  const ground=document.createElement('canvas');ground.width=W;ground.height=H;const gc=ground.getContext('2d');
  rect(0,0,W,H,'#72975e',gc);
  const groundColors=['#759860','#799c62','#6f945b','#779b61','#70955b'];
  for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)rect(x,y,16,16,groundColors[Math.floor(rand()*groundColors.length)],gc);
  for(let i=0;i<65;i++){const x=rand()*W,y=rand()*H;oval(x,y,22+rand()*50,10+rand()*35,rand()>.5?'#82a168':'#698e5a',gc);}
  for(const p of paths){
    gc.lineCap='round';gc.lineJoin='round';
    for(const [width,color] of [[48,'#879d64'],[35,'#b3b37c'],[27,'#c2bb86']]){gc.beginPath();gc.moveTo(...p[0]);for(let i=1;i<p.length;i++)gc.lineTo(...p[i]);gc.lineWidth=width;gc.strokeStyle=color;gc.stroke();}
  }
  oval(camp.x+15,camp.y+6,77,47,'#a9aa72',gc);oval(camp.x+15,camp.y+6,60,34,'#bcaf7d',gc);
  oval(shrine.x,shrine.y+16,86,65,'#7c9760',gc);oval(shrine.x,shrine.y+21,66,51,'#9ba378',gc);
  for(let i=0;i<2300;i++){const x=rand()*W,y=rand()*H;if(pathDistance(x,y)<20)rect(x,y,rand()>.8?3:1,1,rand()>.5?'#d1c391':'#acac78',gc);}
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
    for(const side of [-1,1]){const px=x+side*37-8;rect(px-3,y-61,23,6,'#7c9180');rect(px,y-55,17,63,'#acb59a');rect(px+3,y-53,4,58,'#c6c7a5');rect(px+13,y-49,4,57,'#8d9c86');rect(px-3,y+4,23,6,'#c3c7a6');rect(px-4,y-64,25,5,'#c4c6a6');rect(px+1,y-22,8,2,'#7f987a');rect(px+7,y-42,8,3,'#789875');}
    rect(x-47,y-73,94,10,'#94a68b');rect(x-40,y-79,80,8,'#b8bf9b');rect(x-29,y-84,58,5,'#c8cbaa');rect(x-21,y-78,7,2,'#78986c');rect(x+13,y-70,19,3,'#678f62');
    rect(x-18,y-15,36,16,'#859880');rect(x-22,y-18,44,6,'#bfc29a');
    if(won){ctx.save();ctx.globalAlpha=.11;polygon([[x-20,y-100],[x+20,y-100],[x+47,y+15],[x-47,y+15]],'#ffe099');ctx.restore();drawCheese(x,y-25+Math.sin(time*1.4)*3,1.4,true);}
    else{
      drawCheese(x,y-23,1.1,false);ctx.save();ctx.globalAlpha=.65;rect(x-24,y-51,48,39,'#3c645b');ctx.restore();
      for(let i=0;i<3;i++){const px=x-17+i*17;rect(px-3,y-42,7,12,i<fragments()?'#f5d887':'#81917b');rect(px-1,y-39,3,5,i<fragments()?'#fff0b8':'#506d5f');}
    }
    rect(x-49,y+23,15,3,'#779866');rect(x+28,y+16,18,3,'#719064');rect(x+39,y-52,6,8,'#62895e');rect(x+42,y-44,4,8,'#729b69');
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
  function drawEnemy(e){
    if(e.hp<=0)return;const bob=Math.sin(e.phase)*2,x=e.x,y=e.y;shadow(x,y,14,5);
    const p=e.hit>0?['#f4e3ac','#fff2c5','#fff8e2']:['#4e7250','#8ba565','#bfd083'];
    oval(x,y-7+bob,14,10-bob/2,p[0]);oval(x,y-10+bob,12,9,p[1]);rect(x-8,y-15+bob,6,2,p[2]);rect(x-6,y-8+bob,2,3,'#354b3d');rect(x+5,y-8+bob,2,3,'#354b3d');rect(x-1,y-4+bob,3,1,'#56704c');rect(x-10,y-4+bob,3,1,'#c9ac7c');rect(x+8,y-4+bob,3,1,'#c9ac7c');
    const sy=y-28+Math.sin(time*2+e.id)*2;polygon([[x-5,sy+3],[x-5,sy-4],[x+6,sy+1],[x+6,sy+5]],'#f5d783');rect(x-3,sy,2,2,'#b28b43');rect(x+2,sy+2,2,2,'#cc9b43');
    if(e.hp<3){rect(x-10,y+7,20,2,'#3f5d4544');rect(x-10,y+7,20*e.hp/3,2,'#ebd297');}
  }
  const playerSprite=[
    '......hhhhh.....','....hhhhhhhh....','...hhHHHHHHhh...','..hhHHHHHHHHh...','..hHHHHHHHHHHh..','..hhhhhhhhhhhhh.','....aaaaffff....','...aafffffffa...','...aaffeffefa...','....afffffff....','.....ffrrff.....','...bbrrrrrrbb...','..bbBrrrhhhBbb..','..fbBhhHHhhBbf..','..ffBhhHHhhBff..','....BhhhhhhB....','....bbbbbbbb....','.....pp..pp.....','.....pp..pp.....','....ddd..ddd....'
  ];
  function drawPlayer(){
    const x=Math.round(player.x),y=Math.round(player.y),bob=player.moving?Math.sin(player.walk)*1.2:Math.sin(time*2)*.3;shadow(x,y+1,10,4);
    if(player.hurt>0&&Math.floor(player.hurt*12)%2===0)ctx.globalAlpha=.45;
    const palette={h:'#426c50',H:'#75995e',a:'#966547',f:'#f5d5a2',e:'#3b4a3e',r:'#cf8f63',b:'#574f3d',B:'#bba170',p:'#8d8c68',d:'#4c5141'};
    if(player.dir===0){palette.f='#ac784d';palette.e='#ac784d';palette.r='#c09562';}
    playerSprite.forEach((row,yy)=>[...row].forEach((ch,xx)=>{if(palette[ch])rect(x-8+xx,y-21+yy+bob+(yy>16&&player.moving?(xx<8?Math.sin(player.walk):Math.sin(player.walk+Math.PI)):0),1,1,palette[ch]);}));
    if(player.dir===0){rect(x-5,y-12+bob,10,9,'#b99764');rect(x-4,y-11+bob,8,2,'#d0b47c');rect(x-1,y-7+bob,2,2,'#e4c791');}
    if(player.attack>0){
      const angles=[-Math.PI/2,Math.PI/2,Math.PI,0],progress=1-player.attack/.24,angle=angles[player.dir]-.95+progress*1.9;
      ctx.save();ctx.translate(x,y-10);ctx.strokeStyle='#fcf1bf99';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,30,angle-.55,angle+.12);ctx.stroke();ctx.rotate(angle);rect(7,-2,9,4,'#987b48');rect(14,-5,3,10,'#e4bf71');rect(17,-2,21,4,'#e9edca');rect(18,-2,19,1,'#ffffff');polygon([[38,-2],[43,0],[38,2]],'#e9edca');ctx.restore();
    }else{rect(x+9,y-12+bob,2,13,'#9fae9a');rect(x+7,y-3+bob,6,2,'#d8bd7a');rect(x+9,y-1+bob,2,5,'#826c45');}
    ctx.globalAlpha=1;
  }
  function drawSign(x,y){shadow(x,y,13,3);rect(x-2,y-21,4,23,'#766c46');rect(x-14,y-28,28,13,'#9b8654');rect(x-13,y-28,26,2,'#c3ad72');rect(x-10,y-22,15,2,'#e0ce97');polygon([[x+3,y-25],[x+9,y-21],[x+3,y-18]],'#e0ce97');}
  function draw(){
    const targetX=clamp(player.x-viewW/2,0,W-viewW),targetY=clamp(player.y-viewH/2,0,H-viewH);cam.x=targetX;cam.y=targetY;
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,viewW,viewH);ctx.save();ctx.translate(-Math.floor(cam.x)+(shake?Math.round(Math.sin(time*77)*shake):0),-Math.floor(cam.y));ctx.drawImage(ground,0,0);drawWater();drawBridge();
    const items=[];
    for(const t of trees)if(t.x>cam.x-70&&t.x<cam.x+viewW+70&&t.y>cam.y-10&&t.y<cam.y+viewH+115)items.push({y:t.y,draw:()=>drawTree(t)});
    for(const r of rocks)items.push({y:r.y,draw:()=>drawRock(r)});
    for(const n of nodes)if(!n.taken)items.push({y:n.y,draw:()=>drawNode(n)});
    items.push({y:camp.y,draw:drawCamp},{y:fox.y,draw:drawFox},{y:shrine.y+16,draw:drawShrine},{y:player.y,draw:drawPlayer},{y:389,draw:()=>drawSign(553,389)});
    for(const e of enemies)if(e.hp>0)items.push({y:e.y,draw:()=>drawEnemy(e)});
    items.sort((a,b)=>a.y-b.y);for(const item of items)item.draw();
    for(const p of particles){ctx.globalAlpha=clamp(p.life*2,0,1);rect(p.x,p.y,p.size,p.size,p.color);}ctx.globalAlpha=1;
    for(let i=0;i<25;i++){const x=170+(i*179)%930+Math.sin(time*.25+i)*13,y=130+(i*127)%640+Math.cos(time*.45+i)*9;const a=(Math.sin(time*1.3+i*4)+1)/2;ctx.globalAlpha=a*.75;rect(x,y,1,2,'#f8e6a0');if(a>.8){ctx.globalAlpha=.13;rect(x-2,y-2,5,6,'#f9e9a6');}}ctx.globalAlpha=1;
    // Slow drifting sun patches, clipped by the viewport.
    ctx.globalAlpha=.045;for(let i=0;i<5;i++){const x=130+i*260+Math.sin(time*.05)*25;polygon([[x,-40],[x+65,-40],[x+370,H],[x+260,H]],'#ffffc2');}ctx.globalAlpha=1;ctx.restore();
    if(fragments()===3&&!won&&running()&&dist(player,shrine)>230){const dx=shrine.x-player.x,dy=shrine.y-player.y,a=Math.atan2(dy,dx),r=Math.min(viewW*.38,viewH*.35),x=viewW/2+Math.cos(a)*r,y=viewH/2+Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a);polygon([[7,0],[-4,-4],[-2,0],[-4,4]],'#ffe19a');ctx.restore();}
  }
  function frame(stamp){const dt=Math.min((stamp-lastStamp)/1000||0,.04);lastStamp=stamp;tick(dt);draw();requestAnimationFrame(frame);}
  function resize(){const r=canvas.getBoundingClientRect();viewW=576;viewH=Math.round(576*r.height/r.width);canvas.width=viewW;canvas.height=viewH;ctx.imageSmoothingEnabled=false;}
  $('start').addEventListener('click',start);$('resume').addEventListener('click',()=>setPaused(false));$('pauseButton').addEventListener('click',()=>setPaused(!paused));$('journalButton').addEventListener('click',()=>setJournal(!journalOpen));$('journalClose').addEventListener('click',()=>setJournal(false));$('dialogClose').addEventListener('click',closeDialog);$('eat').addEventListener('click',eat);
  $('sound').addEventListener('click',()=>{soundOn=!soundOn;tone(659,.2);syncHud();if(started)save();});
  $('restart').addEventListener('click',()=>{$('resetConfirm').hidden=false;});$('cancelReset').addEventListener('click',()=>{$('resetConfirm').hidden=true;});
  $('confirmReset').addEventListener('click',()=>{try{localStorage.removeItem(SAVE_KEY);}catch{}player.x=312;player.y=680;player.hp=5;player.stamina=100;player.attack=0;player.hurt=0;player.cooldown=0;for(const k of Object.keys(bag))bag[k]=0;for(const e of enemies){e.hp=3;e.x=e.homeX;e.y=e.homeY;}for(const n of nodes)n.taken=false;won=false;setPaused(false);syncHud();save();notify('A fresh start. The Great Cheese awaits.');});
  const gameKeys=new Set(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift',' ','j','e','q','m','Escape']);
  window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!gameKeys.has(k))return;if(!started){if(k===' '&&e.target===canvas){e.preventDefault();start();}return;}if(e.target instanceof HTMLButtonElement&&k===' ')return;e.preventDefault();if(e.repeat&&[' ','j','e','q','m','Escape'].includes(k))return;if(k==='Escape'){if(dialogOpen)closeDialog();else if(journalOpen)setJournal(false);else setPaused(!paused);return;}if(k==='m'){setJournal(!journalOpen);return;}if(k==='e'){interact();return;}if(k===' '||k==='j'){attack();return;}if(k==='q'){eat();return;}if(running())keys.add(k);});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  window.addEventListener('blur',()=>{keys.clear();if(running())setPaused(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(started)save();if(running())setPaused(true);}});
  canvas.addEventListener('pointerdown',()=>{canvas.focus();attack();});
  document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(running())keys.add(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key));});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();b.dataset.action==='attack'?attack():interact();}));
  window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>{if(started)save();});
  if(hasSave){$('start').innerHTML='Continue the cheese hunt <span>↗</span>';$('welcome').querySelector('h2').textContent=won?'A very fine aftertaste.':'The cheese is still out there.';}
  resize();syncHud();requestAnimationFrame(frame);
})();
