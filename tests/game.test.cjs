const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
function boot(saved,failStorage=false){
 const elements=new Map(),store=new Map(saved?[['cheesequest-chapter1-v2',saved]]:[]);
 const context=new Proxy({},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const el=id=>{if(!elements.has(id))elements.set(id,{id,style:{},dataset:{},hidden:false,children:[],classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},append(child){this.children.push(child)},replaceChildren(){this.children=[]},getContext:()=>context,getBoundingClientRect:()=>({width:960,height:600}),querySelector:()=>el(id+'_child'),querySelectorAll:()=>[]});return elements.get(id)};
 const listeners={},window={addEventListener:(type,fn)=>listeners[type]=fn};const sandbox={console,Math,Set,Map,JSON,Number,String,Array,Object,HTMLButtonElement:class{},document:{getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}},window,localStorage:{getItem:k=>{if(failStorage)throw Error('blocked');return store.get(k)??null},setItem:(k,v)=>{if(failStorage)throw Error('blocked');store.set(k,v)},removeItem:k=>store.delete(k)},requestAnimationFrame(){}};
 vm.createContext(sandbox);for(const file of ['world.js','story.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8').replace(/\}\)\(\);\s*$/,'globalThis.test={player,bag,enemies,nodes,keys,D,blocked,move,load,save,start,tick,attack,dodge,takeDamage,interact,eat,closeDialog,choose,talk,applyAction,setPaused,setPanel,draw,resetAdventure,turnValve,objective,enterCellar,leaveCellar,hitEnemy,updateEnemy,get state(){return state},get scene(){return scene},get dialog(){return dialog},get valveOrder(){return valveOrder},get saveConflict(){return saveConflict},get storageOK(){return storageOK},maxHp,maxStamina};})();');
 vm.runInContext(source,sandbox);return{t:sandbox.test,elements,store,listeners};
}
const checks=[];function check(name,fn){fn();checks.push(name)}
const {t,store}=boot();
function at(p){t.player.x=p.x;t.player.y=p.y;}
function talk(id,action){t.talk(id);while(t.dialog&&t.dialog.pages.length>1){for(let i=1;i<t.dialog.pages.length;i++)t.choose('next');break;}t.choose(action||'close');}
function object(id){return t.D.objects.find(o=>o.id===id)}
check('every world objective is reachable on the collision map',()=>{
 const step=8,q=[[Math.round(t.player.x/step),Math.round(t.player.y/step)]],seen=new Set([q[0].join(',')]);
 for(let i=0;i<q.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const [x,y]=q[i],nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&!t.blocked(nx*step,ny*step,'world')){seen.add(k);q.push([nx,ny]);}}
 for(const p of [...t.D.npcs,...t.D.objects,...t.nodes])assert(q.some(([x,y])=>Math.hypot(x*step-p.x,y*step-p.y)<27),`Unreachable: ${p.id??p.type} at ${p.x},${p.y}`);
 assert(t.blocked(814,580,'world'));assert(!t.blocked(814,520,'world'));
});
check('opening dialogue grants equipment and quest only on acceptance',()=>{t.start();assert.equal(t.state.metBrie,false);assert.equal(t.dialog.id,'brie');for(let i=0;i<3;i++)t.choose('next');t.choose('meetBrie');assert(t.state.metBrie);assert.equal(t.objective().pin,'border')});
check('movement, sprint, pause and dodge cost',()=>{const x=t.player.x;t.keys.add('d');t.tick(.1);t.keys.clear();assert(t.player.x>x);t.setPaused(true);const xx=t.player.x;t.keys.add('d');t.tick(.1);assert.equal(t.player.x,xx);t.keys.clear();t.setPaused(false);t.player.stamina=100;t.dodge();assert.equal(t.player.stamina,72);const hp=t.player.hp;t.takeDamage(2);assert.equal(t.player.hp,hp);t.player.roll=0;});
check('exploration rewards and side quest equipment persist',()=>{
 at(object('boots'));t.interact();assert(t.state.boots);at(object('heart'));t.interact();assert(t.state.heart);assert.equal(t.maxHp(),6);
 at(object('armor'));t.interact();assert(t.state.armor);talk('pip','returnArmor');assert(t.state.pipHelped);assert.equal(t.maxHp(),7);
});
check('gather, cook, share and heal',()=>{for(const n of [t.nodes[0],t.nodes[1]]){at(n);t.interact();}assert.equal(t.bag.mushrooms,1);assert.equal(t.bag.berries,1);t.applyAction('cook');assert.equal(t.bag.meals,1);t.applyAction('donateMeal');assert(t.state.mealDonated);assert.equal(t.maxStamina(),125);t.bag.meals=1;t.player.hp=2;t.eat();assert.equal(t.player.hp,5);t.applyAction('rest');assert.equal(t.player.hp,7);assert(t.nodes.every(n=>!n.taken));});
check('investigation connects the checkpoint, wagon, landing and village',()=>{
 talk('guard','commission');assert(t.state.commissioned);assert.equal(t.objective().step,2);at(object('wagon'));t.interact();assert(t.state.manifest);t.closeDialog();talk('nella','getKey');assert(t.state.cellarKey);talk('marn','meetMarn');assert(t.state.metMarn);assert.equal(t.objective().pin,'tollhouse');at(object('door'));t.interact();assert.equal(t.scene,'cellar');
});
check('cellar puzzle locks the boss area and recovers after a wrong sequence',()=>{
 assert(t.blocked(429,264,'cellar'));t.turnValve('time');assert.equal(t.valveOrder.length,0);t.turnValve('milk');t.turnValve('time');assert.equal(t.valveOrder.length,0);['milk','culture','time'].forEach(t.turnValve);assert(t.state.valvesSolved);assert(!t.blocked(429,264,'cellar'));
 const q=[[13,66]],seen=new Set(['13,66']);for(let i=0;i<q.length;i++)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const[x,y]=q[i],nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&!t.blocked(nx*8,ny*8,'cellar')){seen.add(k);q.push([nx,ny]);}}for(const p of [{x:754,y:128},{x:746,y:493}])assert(q.some(([x,y])=>Math.hypot(x*8-p.x,y*8-p.y)<20));
});
check('boss telegraphs, becomes vulnerable, and guards the supplies',()=>{
 const boss=t.enemies.find(e=>e.id==='boss');at({x:680,y:225});boss.mode='windup';boss.timer=.8;t.player.cooldown=0;t.player.dir=0;t.attack();assert.equal(boss.hp,16);t.player.cooldown=0;boss.mode='recover';t.attack();assert.equal(boss.hp,15);at({x:754,y:128});t.interact();assert.equal(t.state.supplies,false);boss.hp=1;t.hitEnemy(boss,1);assert(t.state.bossDefeated);t.interact();assert(t.state.supplies);t.closeDialog();
});
check('hidden discovery gives the Hallouminati favor a real reward',()=>{at({x:746,y:493});t.interact();assert(t.state.ventFound);t.closeDialog();t.leaveCellar();talk('hollis','helpHollis');assert(t.state.hollisHelped);});
check('food delivery and each diplomatic choice can complete the chapter',()=>{
 talk('marn','deliver');assert(t.state.delivered);t.save();const before=store.get('cheesequest-chapter1-v2');
 for(const choice of ['accordPublic','accordJoint']){const branch=boot(before).t;branch.start();branch.applyAction(choice);assert.equal(branch.state.accord,choice==='accordPublic'?'public':'joint');branch.closeDialog();branch.player.x=2020;branch.player.y=302;branch.interact();assert(branch.state.chapterDone);}
 talk('guard','accordPublic');t.closeDialog();at(object('letter'));t.interact();assert(t.state.chapterDone);
});
check('save restores a completed world, side quests, upgrades and resources',()=>{t.save();const r=boot(store.get('cheesequest-chapter1-v2')).t;assert(r.state.chapterDone);assert.equal(r.state.accord,'public');assert(r.state.hollisHelped);assert(r.state.pipHelped);assert(r.state.boots);assert.equal(r.maxHp(),7);assert(r.enemies.find(e=>e.id==='boss').hp===0);r.draw();});
check('defeat returns to camp while retaining discoveries',()=>{const d=boot().t;d.start();d.closeDialog();d.state.metBrie=true;d.state.manifest=true;d.player.hp=1;d.takeDamage(1,{x:0,y:0});assert.equal(d.scene,'world');assert.equal(d.player.hp,5);assert(d.state.manifest);assert.equal(d.player.x,d.D.camp.x+42);});
check('invalid or unavailable saves do not break play',()=>{const r=boot(JSON.stringify({version:2,state:{metBrie:true,accord:'evil',gathered:'bad'},x:814,y:580,hp:-99,bag:{meals:99999,berries:-1,mushrooms:'no'}})).t;assert.equal(r.player.x,r.D.start.x);assert.equal(r.player.hp,1);assert.equal(r.bag.meals,99);assert.equal(r.bag.berries,0);assert.equal(r.state.accord,'');const blocked=boot(null,true).t;blocked.start();assert(!blocked.storageOK);blocked.closeDialog();blocked.draw();});
check('another tab cannot silently overwrite newer progress',()=>{const a=boot();a.t.start();a.t.closeDialog();a.listeners.storage({key:'cheesequest-chapter1-v2',newValue:'newer'});assert(a.t.saveConflict);const old=a.store.get('cheesequest-chapter1-v2');a.t.save();assert.equal(a.store.get('cheesequest-chapter1-v2'),old);});
check('a confirmed fresh start resets chapter state, not unrelated storage',()=>{const a=boot();a.store.set('cheesequest-v1','original demo');a.t.state.chapterDone=true;a.t.resetAdventure();assert(!a.t.state.chapterDone);assert.equal(a.store.get('cheesequest-v1'),'original demo');});
console.log(JSON.stringify({passed:true,checks:checks.length,details:checks},null,2));
