const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8');
function boot(stored){
 const elements=new Map(), store=new Map(stored?[[ 'cheesequest-v1',stored ]]:[]);
 const context=new Proxy({},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const el=id=>{if(!elements.has(id))elements.set(id,{id,style:{},hidden:true,dataset:{},children:[0,1,2].map(()=>({classList:{toggle(){}}})),classList:{add(){},remove(){}},setAttribute(){},addEventListener(){},focus(){},getContext:()=>context,getBoundingClientRect:()=>({width:960,height:600}),querySelector:()=>el(id+'_child')});return elements.get(id)};
 const win={addEventListener(){}};
 const sandbox={console,Math,Set,Map,JSON,Number,String,Array,Object,HTMLButtonElement:class{},document:{getElementById:el,createElement:()=>el(Math.random()),querySelectorAll:()=>[],addEventListener(){}},window:win,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},requestAnimationFrame(){}};
 vm.createContext(sandbox);
 vm.runInContext(source.replace(/\}\)\(\);\s*$/,'globalThis.test={player,bag,enemies,nodes,keys,blocked,move,load,save,start,tick,attack,interact,eat,closeDialog,setPaused,setJournal,draw,fragments,findInteraction,won:()=>won,storeOK:()=>storageOK};})();'),sandbox);
 return {t:sandbox.test,elements,store};
}
const {t,store}=boot();t.start();
// Reachability through the real collision map, not an assumed path.
const step=5, start=[Math.round(t.player.x/step),Math.round(t.player.y/step)], queue=[start],seen=new Set([start.join(',')]);
for(let index=0;index<queue.length;index++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const [x,y]=queue[index],nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&!t.blocked(nx*step,ny*step)){seen.add(k);queue.push([nx,ny]);}}
const objectives=[...t.nodes,...t.enemies,{x:184,y:706},{x:244,y:675},{x:954,y:195},{x:810,y:520}];
for(const p of objectives)assert(queue.some(([x,y])=>Math.hypot(x*step-p.x,y*step-p.y)<20),`Unreachable objective ${JSON.stringify(p)}`);
assert(t.blocked(814,580),'Pond must block walking');assert(!t.blocked(814,520),'Bridge must allow walking');
const initial=t.player.x;t.keys.add('d');t.tick(.1);t.keys.clear();assert(t.player.x>initial,'Movement responds to keys');
const still=t.player.x;t.setPaused(true);t.keys.add('d');t.tick(.1);assert.equal(t.player.x,still,'Pause freezes movement');t.keys.clear();t.setPaused(false);
for(const n of [t.nodes[0],t.nodes[1]]){t.player.x=n.x;t.player.y=n.y;t.interact();assert(n.taken)}
assert.equal(t.bag.mushrooms,1);assert.equal(t.bag.berries,1);
t.player.x=244;t.player.y=685;t.interact();assert.equal(t.bag.meals,1);assert.equal(t.bag.berries,0);t.player.hp=2;t.eat();assert.equal(t.player.hp,5);assert.equal(t.bag.meals,0);
t.player.x=954;t.player.y=190;t.interact();assert.equal(t.won(),false);t.closeDialog();
for(const enemy of t.enemies){
 for(let i=0;i<3;i++){t.player.x=enemy.x;t.player.y=enemy.y+27;t.player.dir=0;t.player.cooldown=0;t.attack();}
 assert.equal(enemy.hp,0,'Three sword swings defeat each slime');
}
assert.equal(t.fragments(),3);t.player.x=954;t.player.y=190;t.interact();assert(t.won(),'Shrine completes the quest');t.closeDialog();t.draw();
const saved=store.get('cheesequest-v1'),reloaded=boot(saved).t;assert(reloaded.won());assert.equal(reloaded.fragments(),3);assert(reloaded.nodes[0].taken);assert.equal(reloaded.player.hp,5);
const bad=boot(JSON.stringify({version:1,x:814,y:580,hp:-40,bag:{mushrooms:'oops',berries:-1,meals:9999},defeated:'oops',gathered:null,won:true})).t;
assert.equal(bad.player.x,312);assert.equal(bad.player.hp,1);assert.equal(bad.bag.mushrooms,0);assert.equal(bad.bag.berries,0);assert.equal(bad.bag.meals,99);assert.equal(bad.won(),false);
const death=boot().t;death.start();death.player.hp=1;death.player.x=death.enemies[0].x;death.player.y=death.enemies[0].y;death.tick(.01);assert.equal(death.player.hp,5);assert.equal(death.player.x,312);assert.equal(death.player.y,680);
console.log(JSON.stringify({passed:true,reachableCells:seen.size,objectives:objectives.length,checks:['all objectives reachable','pond collision and bridge','movement and pause','gather, cook, heal','shrine locked until three rinds','combat and victory','save and reload','invalid save recovery','defeat returns to camp','render runs']},null,2));
