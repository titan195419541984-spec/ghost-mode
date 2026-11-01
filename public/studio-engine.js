const STOP = new Set("about after again also and are back been before being best between but can could day did does each from have here into just like many more most new not now only other our over people really said see some than that their them then there these they this those through time today very was what when where which who why will with you your".split(" "));
const PLATFORM = {
 "TikTok":{opener:"Hook viewers in the first line. Use conversational pacing and a clear payoff.",cta:"Follow for more stories worth staying up for."},
 "Instagram Reels":{opener:"Lead with a strong visual and concise, save-worthy storytelling.",cta:"Save this and send it to someone who loves a good mystery."},
 "YouTube Shorts":{opener:"Make the premise instantly clear, then deliver a satisfying payoff.",cta:"Subscribe for more short stories and strange discoveries."},
 "Facebook Reels":{opener:"Keep the setup easy to follow and finish with a question people can answer.",cta:"Would you go? Tell us in the comments."}
};
const TONE = {
 cinematic:{voice:"Atmospheric, vivid, restrained. Use contrast and deliberate reveals.",storyLead:"Listen closely: ",explainerLead:"Here's the detail most people miss: "},
 educational:{voice:"Clear, grounded, useful. Explain the context without dramatizing uncertain claims.",storyLead:"Here's what makes this worth examining: ",explainerLead:"Let's break down what matters: "},
 story:{voice:"Build a beginning, escalation, turn, and payoff. Never invent real events or present folklore as verified fact.",storyLead:"It begins with: ",explainerLead:"Start with the question everyone should ask: "},
 direct:{voice:"Short, concrete sentences. Remove filler. Deliver the payoff quickly.",storyLead:"The strange part: ",explainerLead:"Here's the point: "}
};
const clean=value=>String(value??"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,180);
const titleCase=s=>s.replace(/\b[a-z]/g,m=>m.toUpperCase());
function wordsFor(topic){return topic.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)&&!/^\d+$/.test(w));}
function hashtags(topic,category){
 const text=topic.toLowerCase(),tags=[],add=v=>{const t="#"+v.toLowerCase().replace(/[^a-z0-9]/g,"");if(t.length>2&&!tags.includes(t))tags.push(t);};
 const groups=[
  [/haunt|ghost|paranormal|spirit|haunted|creep|eerie|supernatural|abandon(ed)? place/ ,["hauntedplaces","ghoststories","paranormal","creepytok","unexplained"]],
  [/psycholog|mind|behavior|brain|memory|dream|illusion/ ,["psychology","humanbehavior","mindset","brainfacts","psychologytok"]],
  [/mystery|unexplained|conspiracy|strange|weird|unsolved/ ,["unsolvedmysteries","mysterytok","unexplained","strangestories","deepdive"]],
  [/horror|scary|fear|thriller|dark stor/ ,["horrortok","scarystories","darkstories","creepytok","thriller"]],
  [/ai|artificial intelligence|robot|machine learn|software|app|tech|gadget/ ,["technology","aitools","technews","innovation","futuretech"]],
  [/game|gaming|xbox|playstation|nintendo|minecraft/ ,["gaming","gametok","gamer","gamingnews","videogames"]],
  [/music|song|singer|album|artist/ ,["music","newmusic","musictok","musicnews","nowplaying"]],
  [/movie|film|tv show|series|actor|celebrity|entertainment/ ,["movies","filmtok","popculture","entertainment","tvshows"]],
  [/sport|football|basketball|baseball|soccer|nfl|nba|mlb/ ,["sports","sportsnews","fans","highlights","sportsdebate"]],
  [/business|money|market|brand|startup|economy|finance/ ,["business","entrepreneur","markets","industrynews","moneytalk"]],
  [/travel|hotel|city|country|destination|places|landmark/ ,["travel","placestovisit","explore","hiddenplaces","travelguide"]]
 ];
 const group=groups.find(([re])=>re.test(text));
 if(group)group[1].forEach(add);
 else {
  const words=wordsFor(topic);
  if(words.length>=2)add(words.slice(0,2).join(""));
  else if(words.length===1)add(words[0]+"stories");
  ({"Technology":["tech","innovation","futuretech"],Entertainment:["popculture","entertainment","creatornews"],Sports:["sports","sportsnews","sportsfans"],Gaming:["gaming","gametok","gamingnews"],Business:["business","industrynews","entrepreneur"],World:["worldnews","currentevents","globalnews"],Culture:["culture","internetculture","trendwatch"]}[category]||["culture","internetculture","trendwatch"]).forEach(add);
 }
 add("ghostmode");
 return tags.slice(0,5);
}
function allocateSeconds(total,weights){
 const sum=weights.reduce((a,b)=>a+b,0),raw=weights.map(w=>total*w/sum),out=raw.map(Math.floor);
 let left=total-out.reduce((a,b)=>a+b,0);
 const order=raw.map((v,i)=>({i,frac:v-out[i]})).sort((a,b)=>b.frac-a.frac);
 for(let i=0;i<left;i++)out[order[i%order.length].i]++;
 return out;
}
function hashText(value){
 let h=2166136261;
 for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function storyBlueprint(subject){
 const s=subject.toLowerCase(),seed=hashText(s)%3;
 if(/haunt|ghost|paranormal|spirit|abandon|eerie|supernatural|creep|horror/.test(s)){
  const options=[
   {who:"Nora",place:"the old hotel",object:"room 214 standing open",clue:"the room's curtains moving",proof:"the security monitor",reveal:"the camera showed Nora standing inside 214 while she watched from the desk",ending:"the guest ledger listed one new arrival: Nora"},
   {who:"Eli",place:"the closed railway station",object:"platform three lit up",clue:"a train announcement for a service cancelled decades ago",proof:"the station's departure board",reveal:"the board displayed Eli's name as the next arrival",ending:"the platform clock stopped at the exact minute he disappeared from the camera"},
   {who:"Mara",place:"the lighthouse",object:"the locked lantern room glowing",clue:"a second beam sweeping across the sea",proof:"the keeper's logbook",reveal:"the final page was dated tomorrow and signed in Mara's handwriting",ending:"outside, a fresh set of footprints led up the tower"}
  ];
  return {...options[seed],subject,kind:"haunting"};
 }
 if(/mystery|unsolved|strange|missing|disappear|secret|hidden|unexplained/.test(s)){
  const options=[
   {who:"June",place:"a town archive",object:"a photograph with one blank face",clue:"the same stranger appeared in pictures taken thirty years apart",proof:"the archive's oldest contact sheet",reveal:"someone had scratched June's name into the negative",ending:"the photograph was filed under tomorrow's date"},
   {who:"Cal",place:"a roadside diner",object:"a receipt for a meal never ordered",clue:"the receipt carried tomorrow's date",proof:"the till record",reveal:"the order was placed by a customer whose face appeared on no camera",ending:"the receipt was still warm when Cal found it"},
   {who:"Rae",place:"an empty apartment",object:"a key taped beneath the sink",clue:"every door opened onto the same hallway",proof:"a floor plan hidden behind the wallpaper",reveal:"the plan showed one extra room—and Rae was standing inside it",ending:"the building manager insisted that apartment did not exist"}
  ];
  return {...options[seed],subject,kind:"mystery"};
 }
 if(/psycholog|memory|dream|mind|brain|behavior|illusion|perception/.test(s)){
  const options=[
   {who:"Mina",place:"a quiet research lab",object:"a voice memo she did not remember recording",clue:"the memo described a choice she had not made yet",proof:"the timestamp and the lab's paper log",reveal:"the recording ended with Mina answering a question nobody had asked",ending:"then the same question came through the speaker"},
   {who:"Theo",place:"his childhood home",object:"a family photo",clue:"one small detail changed every time he looked away",proof:"a second photograph taken minutes later",reveal:"both images showed Theo holding the camera—even though he was not there",ending:"the photograph was different when he looked again"},
   {who:"Ava",place:"a crowded train",object:"a stranger's familiar warning",clue:"the stranger knew a sentence Ava had only thought",proof:"the message saved on Ava's phone",reveal:"it had been sent from Ava's own number one minute in the future",ending:"would you open the next message?"}
  ];
  return {...options[seed],subject,kind:"psychology"};
 }
 if(/ai|technology|tech|phone|app|internet|computer|robot|digital|software|algorithm|device/.test(s)){
  const options=[
   {who:"Dev",place:"his apartment",object:"a notification from an app he had deleted",clue:"it described the room behind him",proof:"the phone's offline activity log",reveal:"the final alert read 'Don't turn around'—then the screen went dark",ending:"the app had no network connection"},
   {who:"Leah",place:"a nearly empty office",object:"a file named with tomorrow's date",clue:"it contained a recording of the meeting she was about to enter",proof:"the file's creation history",reveal:"the last voice on the recording was Leah saying 'I already heard this'",ending:"would you play the file again?"},
   {who:"Omar",place:"a late-night bus",object:"a smart assistant waking without a command",clue:"it answered a question nobody had spoken aloud",proof:"the device's local transcript",reveal:"the transcript showed Omar asking the question twelve minutes later",ending:"who—or what—started the recording?"}
  ];
  return {...options[seed],subject,kind:"tech"};
 }
 const options=[
  {who:"Alex",place:"a nearly empty building",object:"a message slipped beneath the door",clue:"it described an event that had not happened yet",proof:"the timestamp on the message",reveal:"the handwriting matched Alex's, down to a mistake made years earlier",ending:"would you follow the instruction?"},
  {who:"Sam",place:"a quiet late-night shop",object:"a package with no return address",clue:"inside was an object Sam had lost as a child",proof:"a note folded beneath it",reveal:"the note said 'You left this here tomorrow'",ending:"what would you do next?"},
  {who:"Riley",place:"an unfamiliar hotel room",object:"a second key on the bedside table",clue:"the key opened a door that was not on the floor plan",proof:"the hotel's printed map",reveal:"behind the door was the same room, with Riley already inside",ending:"would you step through?"}
 ];
 return {...options[seed],subject,kind:"fiction"};
}
function storyBeats(subject,seconds,tone,cta){
 const seed=hashText(subject)%3;
 const haunted=/haunt|ghost|paranormal|spirit|abandon|eerie|supernatural|creep|horror/i.test(subject);
 let scenes;
 if(haunted){
  const arcs=[
   [["THE HOOK","At midnight, Nora saw a light switch on inside the abandoned hotel."],["THE SETUP","Every room was dark. Then room 214's curtains moved, although its window was sealed."],["THE BUILD","Nora checked the security monitor. It showed someone standing in room 214."],["THE TWIST","The figure on the screen was Nora. She was still standing at the front desk."],["THE CTA","A new entry appeared in the guest ledger: Nora, checked in at midnight. Would you go upstairs?"]],
   [["THE HOOK","At the closed railway station, Eli heard a train announced for platform three."],["THE SETUP","The station had been shut for decades. No trains were scheduled, and the tracks were empty."],["THE BUILD","The departure board flickered on. One arrival appeared, with Eli's name beside it."],["THE TWIST","A train horn sounded underground. The platform clock stopped, but the arrival time kept counting down."],["THE CTA","Then the loudspeaker whispered, 'Eli, your train is here.' Would you stay on the platform?"]],
   [["THE HOOK","At midnight, Mara saw the abandoned lighthouse switch on."],["THE SETUP","Its doors were chained shut. Then a second beam swept across the sea—from inside the tower."],["THE BUILD","Through a broken window, Mara spotted the keeper's logbook open on a desk. A fresh page had appeared."],["THE TWIST","The final page was dated tomorrow—and signed with Mara's full name."],["THE CTA","Behind her, the lighthouse door slowly creaked open. Would you step inside?"]]
  ];
  scenes=arcs[seed];
 }else{
  const x=storyBlueprint(subject);
  scenes=[["THE HOOK",x.who+" found "+x.object+" at "+x.place+"."],["THE SETUP","At first, it seemed harmless. Then "+x.clue+"."],["THE BUILD",x.who+" checked "+x.proof+" and found one detail that made no sense."],["THE TWIST",x.reveal+"."],["THE CTA",x.ending+". What would you do?"]];
 }
 if(seconds<=15)scenes=[scenes[0],scenes[1],scenes[3],["THE CTA","Would you have kept going? Comment below."]];
 else if(seconds>30)scenes=[...scenes.slice(0,4),["THE ESCALATION","The room fell silent. The details were checked again, but nothing explained what had happened."],scenes[4],["THE CTA",cta]];
 const lead=tone==="direct"?"Here's the strange part: ":tone==="educational"?"Imagine this fictional scene: ":tone==="story"?"The story begins here: ":"Listen closely: ";
 scenes[0][1]=lead+scenes[0][1];
 return scenes;
}
function explainerBeats(subject,seconds,tone,cta){
 const medium=seconds<=30;
 const beats=seconds<=15?[
  ["THE HOOK",`What should you know about ${subject.toLowerCase()}?`],
  ["THE CONTEXT","Start with the original source."],
  ["THE CHECK","Look for independent evidence."],
  ["THE TAKEAWAY","Separate fact from speculation."],
  ["THE CTA",cta]
 ]:medium?[
  ["THE HOOK",`What should you actually know about ${subject.toLowerCase()}?`],
  ["THE CONTEXT","Start with the original source. Check who made the claim and when."],
  ["THE CHECK","Look for independent confirmation. Repeated posts are not separate evidence."],
  ["THE TAKEAWAY","Keep confirmed facts separate from speculation. That is how you avoid repeating a bad signal."],
  ["THE CTA",cta]
 ]:[
  ["THE HOOK",`There is more to ${subject.toLowerCase()} than the headline. Here's how to look closer.`],
  ["THE CONTEXT","Find the earliest available source. Check its date, the person or organization behind it, and exactly what it claims."],
  ["THE CHECK","Look for independent reporting or primary evidence. Several accounts repeating one post do not count as several confirmations."],
  ["THE SIGNAL","Ask what has changed, who is affected, and whether the interest is reaching audiences beyond the original source."],
  ["THE TAKEAWAY","Separate what is confirmed from what is still uncertain. If the evidence is thin, say so. Accuracy is more useful than hype."],
  ["THE CTA",cta]
 ];
 beats[0][1]=TONE[tone].explainerLead+beats[0][1];
 return beats;
}
function visualFor(label,format,index){
 if(format==="story"){
  return ["Open on a striking atmospheric detail; reveal the subject in the first second.","Show an empty location or a close-up detail. Avoid implying this is documentary footage.","Build tension with a slow reveal, restrained movement, and minimal text.","Hold on the key question. Label folklore or dramatization clearly.","End on a clean question card and one call to action.","Use a quiet final image with no new factual claims."][index]||"Use a restrained atmospheric visual that supports the narration.";
 }
 return ["Show the subject clearly with a bold, readable opening line.","Display the original source, its date, and who published it.","Use two or three short points with source labels; do not invent metrics.","Show the evidence or comparison being discussed.","Summarize the verified takeaway in one sentence.","End with one clear call to action."][index]||"Use a clean visual that supports the spoken point.";
}
export function generateContentPackage(input={}){
 const topic=clean(input.topic);if(!topic)throw new Error("Enter a topic or paste a trend title first.");
 const platform=PLATFORM[input.platform]?input.platform:"TikTok",format=input.format==="story"?"story":"explainer",tone=TONE[input.tone]?input.tone:"cinematic";
 const duration=[15,30,45,60].includes(Number(input.duration))?Number(input.duration):30,category=String(input.category||"Culture"),subject=topic.replace(/[.!?]+$/,"");
 const beats=format==="story"?storyBeats(subject,duration,tone,PLATFORM[platform].cta):explainerBeats(subject,duration,tone,PLATFORM[platform].cta);
 const seconds=allocateSeconds(duration,beats.map((_,i)=>[1.3,1.15,1.1,1.1,1][i]||1));
 const scenes=beats.map(([label,text],i)=>({number:i+1,label,text,seconds:seconds[i],visual:visualFor(label,format,i)}));
 const storyCaption=format==="story"
  ?`A fictional ${subject.toLowerCase()} suspense story. What would you do if you found this?`
  :`Before you believe the conversation around ${subject}, check the original source, the date, and what independent evidence actually confirms.`;
 const caption=platform==="YouTube Shorts"
  ?`${titleCase(subject)} | ${format==="story"?"A short mystery":"What to know"}\n\n${storyCaption}\n\n${PLATFORM[platform].cta}`
  :platform==="Facebook Reels"
   ?`${storyCaption}\n\n${PLATFORM[platform].cta}`
   :platform==="Instagram Reels"
    ?`${storyCaption}\n\nSave this for later.\n\n${PLATFORM[platform].cta}`
    :`${storyCaption}\n\n${PLATFORM[platform].cta}`;
 const tags=hashtags(topic,category);
 const editorialNote=format==="story"
  ?"Fictional dramatization: the characters, setting details, and events in this story are invented. Do not present the narration, generated visuals, or props as real evidence. If adapting a real location or person, verify every claim and clearly separate documented facts from invented scenes."
  :"This is a general explainer draft, not a sourced report. Add primary sources and verify each factual claim before publishing.";
 return {topic,platform,format,tone,duration,category,scenes,script:scenes.map(s=>s.text).join("\n\n"),caption,tags,voiceDirection:TONE[tone].voice,platformDirection:PLATFORM[platform].opener,editorialNote,createdAt:new Date().toISOString()};
}
export function formatPublishingPack(p){
 return ["GHOST MODE STUDIO — CONTENT PACKAGE","TOPIC: "+p.topic,"PLATFORM: "+p.platform+" | FORMAT: "+p.format+" | TARGET: "+p.duration+" seconds","","CREATIVE DIRECTION",p.platformDirection,p.voiceDirection,"","SCRIPT / VOICEOVER TRANSCRIPT",p.script,"","SCENE PLAN",...p.scenes.map(s=>`Scene ${s.number} — ${s.label} (${s.seconds}s)\nVoiceover: ${s.text}\nVisual: ${s.visual}`),"","CAPTION",p.caption,"","HASHTAGS",p.tags.join(" "),"","EDITORIAL CHECK",p.editorialNote,"Verify names, dates, statistics, claims, quotations, and original sources before publishing. This is a draft content package, not a guarantee of reach or virality."].join("\n");
}
