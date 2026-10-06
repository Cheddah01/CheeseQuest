window.CheeseStory = {
  objective(s){
    if(!s.metBrie)return {title:'A very peculiar awakening',text:'Talk to Brie at the shrine.',pin:'shrine',step:0};
    if(!s.commissioned)return {title:'A matter of taste',text:'Find Sir Curdle at the Cheddar checkpoint.',pin:'border',step:1};
    if(!s.manifest)return {title:'The missing shipment',text:'Inspect the overturned wagon south of the checkpoint.',x:1485,y:707,step:2};
    if(!s.cellarKey)return {title:'Unblessed goods',text:'Show the destruction order to Nella at Mozza Landing.',pin:'dock',step:3};
    if(!s.metMarn)return {title:'A village between borders',text:'Meet Auntie Marn in Little Whey.',pin:'village',step:4};
    if(!s.supplies)return {title:s.bossDefeated?'The collector’s stores':'The old tollhouse',text:s.bossDefeated?'Collect the relief crate in the tollhouse cellar.':'Recover the food from the old tollhouse cellar.',pin:'tollhouse',step:5};
    if(!s.delivered)return {title:'Something worth sharing',text:'Bring the relief supplies to Auntie Marn.',pin:'village',step:6};
    if(!s.accord)return {title:'Two flags, one table',text:'Settle the dispute with Sir Curdle.',pin:'border',step:7};
    if(!s.chapterDone)return {title:'The Guest of the Marches',text:'Follow the northeast road toward Wheybridge.',pin:'road',step:8};
    return {title:'A place at the table',text:'Chapter complete. Explore, help your friends, or revisit the road.',pin:'village',step:9};
  },
  talk(id,s,bag){
    const D=(pages,choices=[],title)=>({id,pages,choices,title});
    if(id==='brie'){
      if(!s.metBrie)return D(['“Oh, thank goodness. You’re awake.”\n\nA fox in threadbare robes helps you off a stone slab. A dozen candles surround a wedge of cheddar beside your head.','“Were you praying to me?” you ask.\n\nBrie looks horrified. “To the cheese. You were blocking the light.”','“The Great Cheese has vanished from Wheybridge. Cheddar blames Mozza. Mozza blames Cheddar. I blame a catastrophic shortage of lunch.”','“You have no nation? Then, technically, you’re a Guest. The old treaty says they must hear you out.”\n\nHe gives you a worn cheese knife and a map. “Find Sir Curdle at the northeast checkpoint. Please try diplomacy before the knife.”'],[{label:'Take the knife and map. Let’s find some answers.',action:'meetBrie'}]);
      if(s.chapterDone)return D(['“You brought two flags to one table. Imagine what you might do with seven.”\n\nBrie pushes a warm bowl toward you. “Also imagine eating before you do it. Heroism is dreadful on an empty stomach.”']);
      if(s.delivered)return D(['“People keep asking which nation fed them.”\n\nBrie smiles. “I told them a hungry one.”\n\nFor a moment his expression turns distant, as if he has had this conversation before.']);
      return D(['“Sir Curdle is northeast, past Little Whey. The map will help. The village inn has a warm hearth, and my camp is just up this path.”','“Use your knife on the sour creatures. Roll out of the way when they wind up an attack. Gather mushrooms and berries for stew.”\n\nHe glances at the sacred wedge. “And do leave that one. It has a congregation.”']);
    }
    if(id==='guard'){
      if(!s.commissioned)return D(['“Halt. State your nation, your business, and your preferred maturity.”\n\nSir Curdle is guarding a gate with a sign reading BOTH SIDES ARE THE WRONG SIDE.','“A Guest? We haven’t processed one since the treaty. I have a spoon for this somewhere.”\n\nHe searches his pockets with increasing concern.','“Mozza has stolen a temple shipment. Find the wagon south of here and bring me the truth. Recover the supplies, and I’ll reopen the road.”'],[{label:'I’ll investigate the shipment.',action:'commission'}]);
      if(s.accord)return D([s.accord==='public'?'“The destruction order is on the noticeboard. I’ve signed it myself. Yes, I expect trouble.”\n\nHe adjusts his badge. “The road stays open. Let them argue with me.”':'“A joint Cheddar–Mozza relief operation. Entirely official.”\n\nHe lowers his voice. “Nella wrote the announcement. I removed three threats and a heart.”','“Your Guest charter is ready. Follow the road northeast. Wheybridge has heard about you.”']);
      if(s.delivered)return D(['“I’ve seen the children eating. Nella’s people unloading crates. My own soldiers asking why we were guarding an empty road.”','“The order says destroy the food. The treaty says protect the people.”\n\nHe takes off his helmet. “How do we tell them what happened?”'],[
        {label:'Publish the order. Let everyone see the truth.',action:'accordPublic',hint:'Nella backs you. Curdle publicly challenges his superiors.'},
        {label:'Announce a joint rescue. Give them a way to cooperate.',action:'accordJoint',hint:'Curdle takes responsibility. Nella earns official access.'}
      ]);
      if(s.supplies)return D(['“You found it? Good. Bring it to Marn first.”\n\nHe looks at the destruction seal, then deliberately looks away. “I appear to be facing the wrong direction.”']);
      if(s.manifest)return D(['“Marked for destruction? That cannot be right.”\n\nHe studies the seal. “No. It is precisely right. That is the problem.”','“Nella String runs Mozza Landing, west across the Marches. Ask her what happened. I’ll… read the treaty again.”']);
      return D(['“The wagon is southwest along the road. Look closely. Mozza leaves a calling card.”\n\nHe pauses. “Usually several. They’re very proud of the typography.”']);
    }
    if(id==='nella'){
      if(s.delivered)return D([s.accord==='public'?'“A knight with a conscience. Dangerous development for the entire profession.”\n\nNella grins. “I’ve sent boats with more flour. Tell Marn we’re staying for supper.”':'“Look at that. Food moving across a border. Nobody struck by lightning.”\n\nNella pats your shoulder. “You’re welcome at our table, Guest.”']);
      if(!s.manifest)return D(['“Stolen food? We moved people. Hungry people. We went back for the shipment and the temple’s tin collector dragged it away.”','“Find the overturned wagon east of Little Whey. Read the order yourself. Then tell me who’s stealing from whom.”']);
      if(!s.cellarKey)return D(['Nella reads the manifest. “UNBLESSED. UNFIT FOR DISTRIBUTION. DESTROY.”\n\nShe laughs once, without much humor. “Nothing wrong with the food. Wrong stamp.”','“Their collection machine hauled it into the old tollhouse cellar, north of here. I have the service key.”','“Meet Marn in Little Whey before you go. See who’s waiting for those crates. And if the collector asks you to pay a processing fee, hit it with something heavy.”'],[{label:'Take the service key.',action:'getKey'}]);
      return D(['“The old tollhouse is north of the landing. Its machine runs on three aging valves. There should be an instruction plaque inside.”','“Bring Marn the supplies. We can argue flags over a full bowl afterward.”']);
    }
    if(id==='marn'){
      if(s.supplies&&!s.delivered)return D(['Marn lifts the lid of the relief crate. Flour. Beans. Medicine. A perfectly ordinary cheese.','“Unblessed,” she reads.\n\nThen she begins setting the table. “We’ll manage.”','Nella’s crew and two Cheddar soldiers carry the food inside. Nobody is quite sure who should thank whom. A child solves this by taking a bowl from both.'],[{label:'Help serve the first meal.',action:'deliver'}]);
      if(!s.metMarn)return D(['“Welcome to Little Whey. Cheddar claims us at tax time. Mozza claims us at recruiting time. The bridge belongs to nobody when it breaks.”','“The children are hungry. I have a pot, a fire, and eighteen varieties of explanation.”\n\nShe wipes an already clean bowl. “I could use ingredients. Or fewer explanations.”'],[{label:'I’ll find the missing food.',action:'meetMarn'}]);
      const options=[];
      if(!s.mealDonated)options.push({label:bag.meals?'Share one woodland stew.':'I’ll bring you a woodland stew.',action:bag.meals?'donateMeal':'cookHint',hint:'Optional favor · A bowl for someone else'});
      options.push({label:'Leave the table for now.',action:'close'});
      return D([s.delivered?'The inn smells of broth and fresh bread. Someone has put both nations’ flags in a flowerpot.\n\n“Much better use for them,” says Marn.':s.mealDonated?'“Your stew bought us a little time. The tollhouse supplies would buy us a future.”':'“A mushroom and a berry make a decent woodland stew. Use the hearth beside the inn, or Brie’s camp. A single bowl helps.”'],options);
    }
    if(id==='pip'){
      if(s.pipHelped)return D(['“Sir Pip. Knight of the Red Wax. Defender of the Vulnerable. Recently Dressed.”\n\nHe salutes so hard his helmet rotates. “When you need me, I shall be appropriately attired.”']);
      if(s.armor)return D(['“My ceremonial shell!”\n\nThe tiny knight emerges from the bush and wrestles his armor into place.','“You have preserved my dignity. Accept this Waxguard charm. It grants one additional heart.”\n\nHe salutes. “If anyone asks, you encountered me during a tactical ventilation exercise.”'],[{label:'Return the armor. Accept the Waxguard.',action:'returnArmor'}]);
      return D(['A voice comes from the bush. “Do not approach! I am… doctrinally incomplete.”','Sir Pip, a knight of the Babybel, has lost his red wax shell. A slime carried it toward a chest north along the wooded path.','“My order forbids public unwrapping. Could you fetch it? Please do not describe my circumstances to history.”'],[{label:'I’ll look for the red-wax chest.',action:'meetPip'}]);
    }
    if(id==='hollis'){
      if(s.hollisHelped)return D(['“A BASEMENT beneath the BASEMENT. I knew it.”\n\nHollis adds seventeen arrows to a diagram. “Now we establish the role of the moon. Could be a cheese. Could be an egg. I refuse to rush the science.”']);
      if(s.ventFound)return D(['Hollis studies your rubbing of the cellar vent. Seven channels converging under Wheybridge.','“Why would an abandoned tollhouse connect to the cathedral? Why seal it? Why label it LEVEL MINUS TWO?”','“Take my whetstone. You’ll want a sharper knife before asking that sort of question.”'],[{label:'Share the rubbing. Sharpen the knife.',action:'helpHollis'}]);
      return D(['“People say the tollhouse has a basement. Sheep. It has a basement UNDER the basement.”','“The Hallouminati have traced pipes running all the way to the cathedral. Bring me a rubbing from a hidden vent inside. Your reward will be knowledge. And a genuinely useful whetstone.”'],[{label:'I’ll inspect the cellar walls.',action:'meetHollis'}]);
    }
    if(id==='gert')return D(['“Gouda Gert. Legitimate business. Extremely legitimate.”\n\nHis stall sells three wheels of cheese and a certificate asserting there are four.','“Need travel advice? The southeast loop has an old pilgrim’s cache. The southern dead end hides a pair of courier boots. Neither costs anything, which deeply troubles me.”','“Beyond Wheybridge? Seven nations, seven versions of the truth. Read your atlas. And remember: a closed border is just a business opportunity with a spear.”']);
    return D(['The Marches are full of unfinished conversations.']);
  }
};
