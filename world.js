/* World and story facts are data so new chapters can grow without rewriting the engine. */
window.CheeseWorld = {
  width:2200, height:1500,
  start:{x:345,y:1190}, camp:{x:440,y:1040}, shrine:{x:330,y:1140},
  paths:[[[330,1230],[345,1165],[440,1040],[490,905],[650,790],[840,820],[1120,850],[1300,810],[1500,720],[1650,565],[1750,470],[2020,300]],[[490,905],[380,770],[510,650],[650,560],[815,520],[1040,520],[1270,460],[1450,350]],[[1040,520],[1090,650],[1120,850]],[[1270,460],[1450,580],[1650,565]],[[650,790],[740,1000],[690,1190]],[[1300,810],[1380,1060],[1670,990],[1840,790],[1750,470]]],
  npcs:[
    {id:'brie',name:'Brie',title:'JUNIOR SHRINE KEEPER',x:300,y:1192,type:'fox',color:'#b28251',region:'shrine'},
    {id:'guard',name:'Sir Curdle',title:'CHEDDAR BORDER AUTHORITY',x:1650,y:575,type:'knight',color:'#bc7950',region:'border'},
    {id:'nella',name:'Nella String',title:'MOZZA GANG · UNLICENSED GOOD SAMARITAN',x:1040,y:545,type:'human',color:'#5e9a91',region:'dock'},
    {id:'marn',name:'Auntie Marn',title:'THE EMPTY LADLE · PROPRIETOR',x:1120,y:876,type:'human',color:'#b38aab',region:'village'},
    {id:'pip',name:'Sir Pip',title:'CULT OF THE BABYBEL · CURRENTLY UNWRAPPED',x:414,y:779,type:'tiny',color:'#cfa66a',region:'woods'},
    {id:'hollis',name:'Hollis',title:'HALLOUMINATI · INDEPENDENT THINKER',x:1280,y:480,type:'human',color:'#c4a860',region:'tollhouse'},
    {id:'gert',name:'Gouda Gert',title:'A LEGITIMATE TRAVELLING BUSINESS',x:1320,y:861,type:'human',color:'#a2a26b',region:'village'}
  ],
  objects:[
    {id:'wedge',kind:'wedge',x:330,y:1162,label:'Inspect the extremely important cheese'},
    {id:'camp',kind:'camp',x:440,y:1040,label:'Rest & cook'},
    {id:'hearth',kind:'camp',x:997,y:860,label:'Rest & cook at the village hearth'},
    {id:'feast',kind:'feast',x:1170,y:915,label:'Sit at the eighth place'},
    {id:'sign',kind:'sign',x:670,y:794,label:'Read the disputed sign'},
    {id:'wagon',kind:'wagon',x:1485,y:707,label:'Investigate the overturned wagon'},
    {id:'door',kind:'door',x:1450,y:350,label:'Enter the old tollhouse'},
    {id:'armor',kind:'chest',x:550,y:652,label:'Open the red-wax chest'},
    {id:'boots',kind:'chest',x:690,y:1192,label:'Open the overgrown chest'},
    {id:'heart',kind:'chest',x:1680,y:998,label:'Open the pilgrim’s chest'},
    {id:'letter',kind:'letter',x:2020,y:302,label:'Take the road to Wheybridge'},
    {id:'plaque',kind:'plaque',x:1860,y:798,label:'Read the old mile marker'}
  ],
  pins:[
    {id:'shrine',name:'Forgotten Shrine',x:330,y:1185,icon:'✦'},
    {id:'camp',name:'Brie’s Camp',x:440,y:1040,icon:'♨'},
    {id:'village',name:'Little Whey',x:1140,y:850,icon:'⌂'},
    {id:'dock',name:'Mozza Landing',x:1040,y:545,icon:'≋'},
    {id:'border',name:'Cheddar Checkpoint',x:1650,y:575,icon:'⚑'},
    {id:'tollhouse',name:'Old Tollhouse',x:1450,y:350,icon:'▥'},
    {id:'road',name:'Road to Wheybridge',x:2020,y:302,icon:'↗'}
  ],
  enemies:[
    {id:'s1',x:596,y:849,type:'slime'}, {id:'s2',x:646,y:620,type:'slime'},
    {id:'b1',x:929,y:795,type:'beetle'}, {id:'s3',x:1404,y:757,type:'slime'},
    {id:'b2',x:1250,y:435,type:'beetle'}, {id:'b3',x:1560,y:991,type:'beetle'},
    {id:'s4',x:742,y:1103,type:'slime'}, {id:'s5',x:1794,y:896,type:'slime'},
    {id:'c1',x:300,y:467,type:'slime',scene:'cellar'}, {id:'c2',x:514,y:420,type:'beetle',scene:'cellar'},
    {id:'boss',x:680,y:190,type:'boss',scene:'cellar'}
  ],
  ingredients:[
    [384,1080,'mushroom'],[508,1035,'berry'],[514,842,'mushroom'],[410,847,'berry'],[566,690,'mushroom'],[721,760,'berry'],[975,585,'mushroom'],[1100,615,'berry'],[1208,814,'mushroom'],[1383,865,'berry'],[1420,456,'mushroom'],[1544,536,'berry'],[719,1110,'mushroom'],[634,1190,'berry'],[1752,972,'mushroom'],[1820,754,'berry']
  ],
  nations:[
    ['The Cheddar Crown','Your Royal Sharpness','Aged nobility. Red-wax banners. A monarchy that considers “mild” a personal insult. Sir Curdle’s checkpoint is its smallest, most argumentative outpost.','#be8156'],
    ['The Mozza Gang','Nobody breaks the family. We stretch.','Canal crews, rooftop gardens, and hospitality delivered with suspicious threats. Nella believes feeding a village is worth breaking a few laws.','#70a699'],
    ['The Brieaucracy','Council of Soft Affairs','Their laws once protected the powerless. Now even an emergency needs six to eight winters for approval.','#b6a18f'],
    ['The Holy Swiss Empire','Blessed are the missing pieces.','Mountain monasteries preserve the gaps in official history. Several of those gaps are large enough to walk through.','#d1b977'],
    ['The Gouda Fellas','A legitimate trading culture.','Merchant princes who charge extra for priceless objects. Their caravans keep rival nations alive. Gert’s tiny stall is their local embassy, allegedly.','#a7a66d'],
    ['The Blue Communion','All things become something else.','Mold gardeners and healers beneath the continent. Feared as corrupted by people who have never visited their luminous gardens.','#819caf'],
    ['The Parmesan Order','Hard cheese. Harder vows.','Warrior-monks of the Grate Bastion. Former protectors of travelers who now guard the borders against them.','#b6b293']
  ]
};
