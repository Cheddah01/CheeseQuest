/* The Eighth Place: character conversations, evidence, and the playable interlude. */
(() => {
'use strict';
const opening=window.CheeseStory;
const choice=(label,action,hint)=>({label,action,hint});
const voice=(id,text)=>({id,text});
const names={brie:'Brie',guard:'Sir Curdle',nella:'Nella',marn:'Marn',pip:'Sir Pip',hollis:'Hollis',gert:'Gert'};
function conversation(id,pages,choices=[]){return {id,pages,choices};}
function followup(id,pages,choices=[]){return conversation(id,pages,[...choices,choice('Ask something else.',`topics:${id}`),choice('Back to the road.','close')]);}
function questions(data,s){
 if(data.id==='brie'&&!s.metBrie)return data;
 const choices=data.choices?.length?[...data.choices]:[choice('Back to the road.','close')];
 choices.push(choice(`Ask ${names[data.id]||'a question'} about something else.`,`topics:${data.id}`));
 return {...data,choices};
}
window.CheeseStory={...opening,totalSteps:14,
 objective(s){
  if(!s.chapterDone)return opening.objective(s);
  if(!s.ledgerRead)return {title:'The fourth wheel',text:'Find the dispatch ledger at the writing desk in the tollhouse cellar.',pin:'tollhouse',step:9};
  if(!s.ledgerDecoded)return {title:'A very expensive nothing',text:'Take the dispatch ledger to Gouda Gert in Little Whey.',pin:'village',npc:'gert',step:10};
  if(!s.brieTruth)return {title:'The fox on the form',text:'Ask Brie at the shrine about his signature.',pin:'shrine',step:11};
  if(!s.feastHeld)return {title:'The eighth place',text:'Join Marn at the supper table outside the Little Whey inn.',pin:'village',object:'feast',step:12};
  if(!s.interludeDone)return {title:'The patient is hungry',text:'Read the second letter on the northeast road to Wheybridge.',pin:'road',step:13};
  return {title:'A promise worth keeping',text:'Interlude complete. Finish favors, revisit friends, and explore the Marches.',pin:'village',step:14};
 },
 talk(id,s,bag){
  let data;
  if(id==='guard'&&s.letterReply&&!s.letterHelped)data=conversation(id,[
   'Curdle turns the blue ribbon over in his hands. It has been tied into a spectacularly bad sailor’s knot.\n\n“She never could do that bit.”',
   'He reads Fenn’s reply twice.\n\n“Dad. I am an apprentice, not a hostage. They taught me to mend a sail. I taught them your stew. Everyone survived. Please write again.”',
   '“I kept drafting orders to bring her home. Not once did I ask if she was happy.”\n\nHe folds the letter carefully. “Thank you for delivering something I couldn’t command.”'
  ],[choice('Give him Fenn’s ribbon.','finishLetter','Completes A Letter Without a Flag; remembered at supper.')]);
  else if(id==='nella'&&s.letterAccepted&&!s.letterReply)data=conversation(id,[
   'Nella recognizes the handwriting before she sees the address.\n\n“For Fenn? Curdle’s kid is repairing our west boat. Best apprentice we’ve had. Worst knots in recorded history.”',
   '“He told the checkpoint she’d been recruited against her will. She told us she wanted to see a river that didn’t end at a gate.”\n\nNella does not open the letter. She calls a runner.',
   'The runner returns with a folded reply and a blue ribbon.\n\n“Deliver these to her dad,” Nella says. “And tell him the Mozza Gang does not steal children. We have an extremely demanding apprenticeship form.”'
  ],[choice('Take Fenn’s reply back to Curdle.','takeReply')]);
  else if(id==='gert'){
   if(s.ledgerRead&&!s.ledgerDecoded)data=conversation(id,[
    'Gert puts your ledger beside his certificate. Three ordinary wheels. One shipment billed as a fourth.\n\n“Here’s your problem. An empty crate doesn’t require a feeding schedule.”',
    'He taps the small print.\n\nCULTURE TRANSFER. KEEP WARM. KEEP ALIVE.\nRELIQUARY DISPLAY WEIGHT: ZERO.\nCARETAKER: B. RINDLE.\n\nThe dispatch is dated twenty-seven days before the announced theft.',
    '“Brie Rindle. The fox at your shrine.”\n\nGert stops smiling. “I charged a premium to move this quietly. I thought it was another ceremonial fraud.”',
    '“Take the original. If anyone asks, I gave it to you. A reputation for honesty would ruin me, but I’m prepared to branch out.”'
   ],[choice('Keep the original ledger. Ask Brie for the truth.','decodeLedger','The fourth shipment carried something alive. Gert becomes a witness.')]);
   else if(!s.gertMet)data=conversation(id,[
    '“Gouda Gert. Legitimate business. Aggressively legitimate.”\n\nHis stall holds three wheels of cheese and a certificate insisting there are four.',
    '“The fourth was a special temple dispatch. No price. No weight. Very expensive insurance. Then the Great Cheese vanished and all my questions became a licensing issue.”',
    '“The receiving ledger is at the writing desk in the old tollhouse cellar. Bring it here and I’ll translate the figures. Suspicious arithmetic is my second language.”'
   ],[choice('I’ll look for your missing fourth wheel.','meetGert','Investigation · Can be solved during the food rescue or afterward.')]);
   else data=conversation(id,[s.ledgerDecoded?'“I’ve put a fourth plate on the stall. For anyone who can’t pay.”\n\nGert frowns at it. “Horrendous margins. Surprisingly good foot traffic.”':'“The ledger is in the western room of the tollhouse cellar. Look for a book on a writing desk. Nella has the key to the cellar.”']);
  }
  else if(id==='brie'&&s.chapterDone&&s.ledgerDecoded&&!s.brieTruth)data=this.confession();
  else if(id==='brie'&&s.brieTruth)data=conversation(id,[s.brieStance==='accountable'?'“I told Marn. All of it. She asked me to wash the bowls.”\n\nBrie looks at his raw paws. “I think that was kinder than forgiving me immediately.”':'“You trusted me with another chance. I won’t mistake that for being let off.”\n\nBrie has written his full name beneath the ledger. He has stopped hiding the signature.',s.feastHeld?'“A Guest’s duty is to leave a chair for the next Guest. Not become the only person allowed to sit in it.”\n\nHe hands you a packed lunch. “Wheybridge is northeast. Beware anyone who offers an explanation before a meal.”':'“Marn is setting a proper table outside the inn. She said to bring you, my apology, and a clean towel. Apparently two flags make dreadful napkins.”']);
  else if(id==='marn'&&s.brieTruth&&!s.feastHeld)data=conversation(id,[
   '“Enough interviewing the soup. Come and sit.”\n\nMarn has set eight places outside the inn. Curdle and Nella are trying to measure whether their chairs are equally important.',
   '“Seven nations, one place for whoever the road brings. That’s how my grandmother set a table. Before everyone decided their cheese needed its own border.”'
  ],[...(!s.mealDonated?[choice(bag.meals?'Share one woodland stew before supper.':'How do I make that woodland stew?',bag.meals?'donateMeal':'cookHint','Optional favor · A bowl for someone else')]:[]),choice('Sit down with everyone.','beginFeast','A story scene; your favors and choices are remembered.')]);
  else if(id==='pip'&&s.pipHelped)data=conversation(id,[
   '“Sir Pip. Knight of the Red Wax. Defender of the Vulnerable. Recently Dressed.”\n\nHe salutes so hard his helmet rotates.',
   '“I discovered why the slime took my shell. Someone had used it to carry broth to a sick pilgrim.”\n\nHe looks down at the dent. “My armor protected someone without me inside it. That is… extremely efficient knighthood.”',
   s.feastHeld?'“The children have made me Captain of Bowls. The promotion came with a spoon. I shall wield it responsibly.”':'“If Marn ever needs a guard for her table, tell her I am available. Even for people with no heraldry.”'
  ]);
  else data=opening.talk(id,s,bag);
  return questions(data,s);
 },
 topics(id,s){
  const entries={
   brie:[['What is a Guest, exactly?','guest'],['How did I get to the shrine?','arrival'],['What did you do before this?','past']],
   guard:[['The letter in your pocket.','letter'],['Why stay at this checkpoint?','oath'],['What happens after our agreement?','accord']],
   nella:[['Why help a Cheddar village?','family'],['What do you think of Curdle?','curdle'],['What does the Gang believe?','faith']],
   marn:[['Who gets the eighth place?','table'],['Where did you learn to cook?','kitchen'],['Can I have your old recipe?','recipe']],
   pip:[['What are you actually sworn to protect?','oath'],['Is the red wax compulsory?','wax']],
   hollis:[['What do the seven pipes mean?','pipes'],['Your theory about the moon.','moon']],
   gert:[['Where might I find useful gear?','gear'],['How can a shipment weigh nothing?','fourth'],['Why risk your business for us?','cost']]
  };
  return conversation(id,['There is a little time before the road calls again.'],[...(entries[id]||[]).map(([label,key])=>choice(label,`topic:${id}:${key}`)),choice('Back to our conversation.',`talk:${id}`),choice('Back to the road.','close')]);
 },
 topic(id,key,s){
  const say=(pages,choices=[])=>followup(id,Array.isArray(pages)?pages:[pages],choices);
  if(id==='brie'&&key==='guest')return say([
   '“Not a bloodline. Not a prophecy. A legal nuisance.”\n\nBrie turns over your map. An old seal shows seven chairs around an eighth.',
   '“When the nations made their treaty, they left one seat for someone with no flag. A Guest could ask the questions rulers agreed not to ask one another.”',
   '“Then they made belonging compulsory. No more Guests. Very convenient.”\n\nHe pats the map. “You don’t have to save everybody because a piece of paper says so. It just means they can’t legally stop you trying.”'
  ]);
  if(id==='brie'&&key==='arrival')return say([
   '“I found you on the south road, exhausted, clutching nothing at all. No badge. No papers. I brought you somewhere warm.”',
   '“The slab was the only free bed. I moved the cheese. Then the congregation moved it back.”\n\nHe winces. “Your past is yours to tell when it comes back. I won’t invent a destiny to fill the silence.”'
  ]);
  if(id==='brie'&&key==='past')return say(s.brieTruth?'“Brie Rindle. Assistant Keeper of the Mother Culture. Resigned without completing the appropriate forms.”\n\nHe tries a smile. “Perhaps that is hereditary.”':[
   '“Paperwork. A great deal of paperwork.”\n\nBrie rubs a pale band of fur on his wrist, where a keeper’s seal might once have sat.',
   '“I left because I kept counting wheels of cheese and forgetting to count the people who needed them.”\n\nHe looks at the shrine. “I am still learning the difference.”'
  ]);
  if(id==='guard'&&key==='letter'){
   if(s.letterHelped)return say('“Fenn wrote again. Three pages about a knot. I understood none of it.”\n\nCurdle smiles. “Best report I’ve had all year.”');
   if(s.letterReply)return this.talk(id,s,{});
   if(s.letterAccepted)return say('“Nella at Mozza Landing will know where to find Fenn. Please keep it sealed. It’s a father’s letter, not an order.”');
   if(!s.commissioned)return say('“An undelivered letter is not a border matter.”\n\nHe almost puts it away. “Perhaps ask me again after we’ve discussed the missing shipment.”');
   return say([
    'Curdle hides the envelope behind his inspection clipboard.\n\n“It has been returned six times. IMPROPER DESTINATION. My daughter lives across the river. Apparently that is improper.”',
    '“Fenn joined Nella’s boat crew. I called it a kidnapping because it was easier than admitting she left.”\n\nHe studies the road. “Would you deliver this? Sealed. Just tell her I’d like to know if she’s all right.”'
   ],[choice('Carry the sealed letter to Nella.','acceptLetter','Favor · A Letter Without a Flag')]);
  }
  if(id==='guard'&&key==='oath')return say([
   '“My first posting was a flood. No flags on the people in the water. We pulled out whoever floated past.”',
   '“Then I was promoted. More authority, fewer opportunities to be useful.”\n\nHe taps his badge. “I keep telling myself the next order will be the one that makes sense.”'
  ]);
  if(id==='guard'&&key==='accord')return say(!s.accord?'“An open road needs someone willing to keep it open tomorrow. Heroic speeches do not cover the morning shift.”':s.accord==='public'?'“They’ve ordered me to retract the notice. I sent them a copy with better handwriting. The truth needs witnesses. I intend to remain one.”':'“The relief charter expires unless we renew it together. Nella insists every renewal include lunch. I have accepted this terrifying concession.”');
  if(id==='nella'&&key==='family')return say([
   '“Little Whey is full of Mozza cousins, Cheddar spouses, and children who have never once asked a sandwich for its papers.”',
   '“My first smuggling job was my grandmother’s medicine. They taxed it at both banks. By the time it crossed, I owed them another grandmother.”\n\nNella shrugs. “We found a different crossing.”'
  ]);
  if(id==='nella'&&key==='curdle')return say(s.letterHelped?'“Fenn’s dad is learning the difference between keeping someone safe and keeping them still. Give him time. And possibly a diagram.”':s.accord==='public'?'“He put his own name under the order. That matters. A conscience without a signature is just a very private hobby.”':s.accord==='joint'?'“He renewed the food permits before I asked. I dislike having to update a perfectly good opinion of someone.”':'“He thinks if he follows every rule, nobody can blame him for what happens. Very comforting. Particularly if you’re not the person it happens to.”');
  if(id==='nella'&&key==='faith')return say('“Pull apart a ball of Mozza and it makes strings. Pull the strings together and you’ve got dinner.”\n\nShe grins. “Our priests get another six hours out of that. I charge less.”');
  if(id==='marn'&&key==='table')return say([
   '“Seven places for the nations. An eighth for a stranger. Nobody owned that one. That was the point.”',
   '“When I was small, the Great Cheese was something we made together. Now they talk about it like a crown that fell behind a cupboard.”\n\nShe sets another bowl down. “Funny what people forget when remembering would cost them something.”'
  ]);
  if(id==='marn'&&key==='kitchen')return say([
   '“The cathedral. Thirty years ago. They dismissed me for feeding a Blue Communion courier before the inspection bell.”',
   '“He was seventeen. They called him a contamination risk. I called him a second helping.”\n\nShe hands you a cloth. “You can be angry and dry a bowl at the same time. I recommend it.”'
  ]);
  if(id==='marn'&&key==='recipe'){
   if(!s.mealDonated)return say('“Bring a bowl to someone who needs it first. Then I’ll know you understand the important part of the recipe.”');
   return say([
    'Marn tears a page from a much-repaired cookbook. The heading says MOTHER CULTURE — FEED TOGETHER.',
    '“One spoon from each household. Keep it warm. Let it change. Never throw away the last spoon.”\n\nSeven ingredient columns have been crossed out. Someone has written, in a child’s hand: EVERYONE BRINGS SOMETHING.',
    '“My grandmother’s handwriting. This was a recipe before it was a religion. You can keep the copy.”'
   ],[choice('Keep the family recipe.','takeRecipe','Adds evidence to your journal; changes the supper conversation.')]);
  }
  if(id==='pip'&&key==='oath')return say(s.pipHelped?'“Protect the small. Keep the warmth. Make room.”\n\nSir Pip has crossed out the old final line, MAINTAIN AN APPROPRIATE SHEEN.':'“The vulnerable. The sacred. The shine.”\n\nA thoughtful silence from the bush. “The training spent an unusual amount of time on the shine.”');
  if(id==='pip'&&key==='wax')return say('“Technically we are all ordained in red wax. Mine is extra virgin.”\n\nHe waits. “That joke is excellent among my people.”');
  if(id==='hollis'&&key==='pipes')return say(s.ventFound?[
   '“Seven channels. Seven nations. But they aren’t drains. Look at the valves: things went both ways.”',
   '“I thought the temple was taking something from everyone. Maybe everyone was meant to be giving something.”\n\nHe grimaces. “Much harder to fit on a protest sign.”'
  ]:'“An ordinary tax office needs a cash box. This one needs seven insulated culture pipes. Either that is suspicious, or accounting has changed dramatically.”');
  if(id==='hollis'&&key==='moon')return say('“I have withdrawn the egg hypothesis. Birds refuse to comment.”\n\nHe produces a diagram labeled POSSIBLY A MOON.\n\n“Peer review is brutal.”');
  if(id==='gert'&&key==='gear')return say('“Courier boots: the southern dead end. A pilgrim’s heart: the southeast loop. Sir Pip’s shell: a chest north of his bush.”\n\nHe sighs. “Free advice. Please imagine I charged for it.”');
  if(id==='gert'&&key==='fourth')return say(s.ledgerDecoded?'“The zero was the weight left in the reliquary. The shipment itself needed warmth, food, and a caretaker. Someone wanted an empty display and a living secret.”':'“In trade, zero can mean empty, exempt, or please stop reading. The tollhouse ledger should tell us which sort of zero this is.”');
  if(id==='gert'&&key==='cost')return say(s.ledgerDecoded?'“I profited from keeping quiet. I can’t sell that back as a misunderstanding.”\n\nHe turns his license face down. “If the temple wants a witness, they can find me here.”':'“No customers if everybody starves. That is my official position.”\n\nUnder the counter, Gert is wrapping a small wheel for a child with no coins.');
  return say('“Ask me again when the road has given us something new to talk about.”');
 },
 ledger(){return {speaker:'The fourth shipment',title:'TOLLHOUSE DISPATCH LEDGER',pages:[
  'Three wheels of ordinary cheese appear on the receiving page. A fourth entry has been squeezed between the lines. The ink is newer. The date is not.',
  'SPECIAL CULTURE TRANSFER\nDISPLAY WEIGHT REMAINING: 0\nKEEP WARM. DO NOT SALT.\nASSIGNED KEEPER: B. RINDLE\nDESTINATION: WHEYBRIDGE / LOWER CHAMBER\n\nA feeding schedule occupies the next page.',
  'The dispatch predates the announced theft by twenty-seven days. You copy the page, then notice the binding is already loose. Someone wanted this record removable.\n\nGouda Gert could explain the merchant codes.'
 ],choices:[choice('Take the dispatch ledger.','takeLedger','Evidence · The Fourth Wheel')]};},
 confession(){return conversation('brie',[
  'Brie reads his old name on the dispatch. His ears lower.\n\n“I should have told you before you ever set foot in that cellar.”',
  '“The Great Cheese is alive. A mother culture. For generations, all seven nations sent a little of their own starter to keep it growing. Different tastes. One living thing.”',
  '“When the borders closed, they stopped mixing. Every nation called its own culture pure. The Mother began to fail. We moved it below the cathedral to keep it alive.”',
  '“The High Pasteur asked for a temporary separation order. I signed it. I thought it would protect the Mother while we found a cure.”\n\nHe touches the ledger. “That seal is on the order to destroy Marn’s food.”',
  '“Then the temple announced a theft. A missing treasure was easier to explain than a dying thing we all depended on.”\n\nHis voice catches. “I left. I didn’t tell anyone why. Running away felt a great deal like refusing.”',
  '“I don’t know if the High Pasteur is protecting it, protecting himself, or both. I know I let the villages pay for our secret.”\n\nBrie looks up. “What do I do now?”'
 ],[
  choice('Help me put it right. I’ll trust you to tell them.','brieTrust','Brie chooses to speak at supper; your trust is remembered.'),
  choice('Tell Marn yourself. She deserves the whole truth.','brieAccountable','Brie makes a public apology; Marn decides how to answer.')
 ]);},
 feast(s){
  const pages=[
   voice('marn','“Sit where you like. If the chairs have a dispute, the chairs can go hungry.”\n\nMarn sets eight bowls on the table. Curdle removes his helmet. Nella moves a flag so everyone can see the bread.'),
   voice('guard',s.accord==='public'?'“My superiors demanded a correction. I have posted one: the food was fit to eat. The order was unfit to follow.”\n\nHe puts the notice beside his bowl.':'“The new relief charter requires a Cheddar signature, a Mozza signature, and a meal shared by both signatories.”\n\nHe clears his throat. “I added the last clause.”'),
   voice('nella',s.accord==='public'?'“His notice is already in every boat crew’s window. Hard to erase something when people keep making copies.”\n\nShe raises her bowl. “To very inconvenient witnesses.”':'“For the record, I proposed monthly meals. He negotiated me down to weekly.”\n\nNella raises her bowl. “A terrifying opponent.”')
  ];
  if(s.letterHelped)pages.push(voice('guard','Curdle lays Fenn’s ribbon beside his plate.\n\n“She says she can visit on rest days. If the checkpoint remains open.”\n\nNella smiles. “Well. Better keep it open.”'));
  if(s.pipHelped)pages.push(voice('pip','Sir Pip arrives carrying bread in his polished shell.\n\n“Multipurpose ceremonial equipment. Please take two.”\n\nThe children appoint him Captain of Bowls. He accepts with dangerous solemnity.'));
  else pages.push(voice('marn','Marn sets a bowl beside the road for the little knight still hiding in the woods.\n\n“No one misses supper over a wardrobe problem.”'));
  pages.push(voice('brie',s.brieStance==='accountable'?'“My name is on the separation order. I helped make the rules that emptied this table. I owe you the truth before I ask to sit at it.”\n\nFor once, nobody interrupts.':'“The Guest trusted me to say this myself. I signed the separation order. I hid behind a shrine while you paid for it.”\n\nBrie keeps his paws on the table so they cannot disappear into his sleeves.'));
  pages.push(voice('marn','“You’ll wash up,” says Marn. “Tomorrow you can help unload the flour. After that, we’ll see.”\n\nShe puts a bowl in front of him. “Supper isn’t a pardon. It is supper.”'));
  if(s.mealDonated)pages.push(voice('marn','“Before there were crates or charters, you brought one bowl.”\n\nMarn taps your spoon. “Remember that in Wheybridge. People will tell you nothing counts until it fixes everything. That is a very comfortable way to do nothing.”'));
  if(s.recipeRead)pages.push(voice('marn','You unfold the family recipe: KEEP IT WARM. LET IT CHANGE.\n\nBrie stares at the seven crossed-out columns.\n\n“My first lesson in the culture room,” he whispers. “We made a doctrine out of it and lost the instructions.”'));
  if(s.hollisHelped)pages.push(voice('hollis','“Those pipes carried starter in both directions. A system for sharing, later repurposed as a system for taking.”\n\nHollis pauses. “I am revising my diagram. This may take several diagrams.”'));
  pages.push(voice('gert','“I’ve made copies of the ledger. One per nation. No charge.”\n\nEveryone looks at Gert.\n\n“For postage, obviously. Don’t make this weird.”'));
  pages.push(voice('brie','“The Mother didn’t vanish because one nation stole it. It began dying when they all stopped sharing.”\n\nHe looks at the eight places. “We can’t put that right with a sharper knife.”'));
  pages.push(voice('marn','“Then take something else with you.”\n\nMarn wraps bread for the road. “What are you going to ask of them, Guest?”'));
  return {scene:'supper',title:'THE EIGHTH PLACE · A SHARED SUPPER',pages,choices:[
   choice('The truth. No more villages paying for secrets.','vowTruth','Your promise will appear in the farewell and journal.'),
   choice('A place at the table. Even for people they disagree with.','vowTable','Your promise will appear in the farewell and journal.')
  ]};
 },
 farewell(s){return {speaker:'A letter from below',title:'ON THE ROAD TO WHEYBRIDGE',pages:[
  'A second letter waits beneath the road marker. The wax is still warm. A smaller note says: PLEASE STOP DELIVERING THESE TO THE CHEESE.',
  '“Dear Guest,\n\nI hear there were eight places at supper. Good. You have understood a tradition my colleagues prefer to display behind glass.”',
  '“Come to the cathedral’s service door. Bring the ledger. Bring your questions. Bring no banners.\n\nThe patient is hungry.\n\n— The High Pasteur”',
  s.vow==='truth'?'You fold the letter around your promise: no more villages paying for secrets. Somewhere below Wheybridge, a living thing is waiting. So is someone who has been lying about it.':'You fold the letter around your promise: a place at the table, even for people who disagree. Somewhere below Wheybridge, a living thing needs seven nations to remember how to share.',
  `Behind you, the Marches have an open road, ${s.accord==='public'?'a truth nobody can quietly erase':'a charter that makes rivals share responsibility'}, and a table that can fit one more chair.\n\nAhead: Wheybridge, the city of seven locked doors.`,
  'THE EIGHTH PLACE — COMPLETE\n\nThe next chapter will take the Guest into Wheybridge. For now, the Marches remain open: finish favors, revisit your friends, and read the evidence in your journal.'
 ],choices:[choice('Keep exploring the Marches.','finishInterlude')]};},
 favors(s){return [
  {title:'A knight in need',done:s.pipHelped,text:s.pipHelped?'Waxguard earned. Pip has found a use for his armor beyond looking heroic.':s.armor?'Return the red-wax shell to Sir Pip.':'Find Sir Pip on the western path. His shell is in the chest farther north.'},
  {title:'A bowl for someone else',done:s.mealDonated,text:s.mealDonated?'Marn remembers your first bowl. Ask her about her old recipe.':'Cook a mushroom and a berry at a hearth, then share the stew with Marn.'},
  {title:'Below the blessing line',done:s.hollisHelped,text:s.hollisHelped?'Knife sharpened. Hollis’s seven pipes connect to the greater mystery.':s.ventFound?'Bring the cellar vent rubbing to Hollis outside the tollhouse.':'Inspect the hidden vent in the southeast corner of the tollhouse cellar.'},
  {title:'A Letter Without a Flag',done:s.letterHelped,text:s.letterHelped?'Curdle received Fenn’s reply. A personal reason to keep the border open.':s.letterReply?'Take Fenn’s reply and blue ribbon back to Sir Curdle.':s.letterAccepted?'Carry Curdle’s sealed letter to Nella at Mozza Landing.':'After accepting the investigation, ask Curdle about the letter in his pocket.'},
  {title:'The Fourth Wheel',done:s.ledgerDecoded,text:s.ledgerDecoded?'Gert decoded the dispatch. The fourth shipment was alive.':s.ledgerRead?'Bring the dispatch ledger to Gouda Gert in Little Whey.':s.gertMet?'Find the writing desk in the western room of the tollhouse cellar.':'Ask Gouda Gert why his certificate lists one more wheel than his stall holds.'}
 ];},
 evidence(s){return [
  ['The destruction order',s.manifest,'The shipment was condemned for lacking a blessing, not for being spoiled. The temple’s seal authorized its destruction.'],
  ['The eighth place',s.treatyRead,'The old mile marker names seven nations and an eighth seat for an unclaimed Guest. The role predates compulsory national allegiance.'],
  ['Fenn’s ribbon',s.letterHelped,'Curdle’s daughter chose a Mozza apprenticeship. A letter crossed the border that his orders could not.'],
  ['Seven culture pipes',s.ventFound,'The tollhouse pipes lead to a lower chamber beneath Wheybridge Cathedral. Their valves permit flow in both directions.'],
  ['The dispatch ledger',s.ledgerRead,'A culture transfer needed warmth and feeding. It left the reliquary empty twenty-seven days before the announced theft.'],
  ['Gert’s testimony',s.ledgerDecoded,'B. Rindle is Brie. Gert arranged the secret transport and will testify about it, even at the cost of his license.'],
  ['A family recipe',s.recipeRead,'Keep it warm. Let it change. Never throw away the last spoon. Every household brings something to the mother culture.'],
  ['Brie’s confession',s.brieTruth,'The Great Cheese is a living mother culture. Separated national starters made it fail. Brie signed the order that became the food ban; the temple disguised the crisis as a theft.'],
  ['The Guest’s promise',s.feastHeld,s.vow==='truth'?'No more villages paying for secrets.':'A place at the table, even for people who disagree.'],
  ['A letter from below',s.interludeDone,'The High Pasteur asks for the ledger at the cathedral’s service door. “The patient is hungry.” His motives remain unproven.']
 ].filter(([,known])=>known).map(([title,,text])=>({title,text}));}
};
})();
