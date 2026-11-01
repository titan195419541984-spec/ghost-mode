const STOP = new Set("about after again also and are back been before being best between but can could day did does each from have here into just like many more most new not now only other our over people really said see some than that their them then there these they this those through time today very was what when where which who why will with you your".split(" "));
const PLATFORM = {
 "TikTok":{opener:"Hook viewers in the first line. Use conversational pacing and a clear payoff.",cta:"Follow for more stories worth staying up for."},
 "Instagram Reels":{opener:"Lead with a strong visual and concise, save-worthy storytelling.",cta:"Save this and send it to someone who loves a good mystery."},
 "YouTube Shorts":{opener:"Make the premise instantly clear, then deliver a satisfying payoff.",cta:"Subscribe for more short stories and strange discoveries."},
 "Facebook Reels":{opener:"Keep the setup easy to follow and finish with a question people can answer.",cta:"Would you go? Tell us in the comments."}
};
const TONE = {
 cinematic:{voice:"Atmospheric, vivid, restrained. Use contrast and deliberate reveals.",storyLead:"The unsettling part is this: ",explainerLead:"Here's the detail most people miss: "},
 educational:{voice:"Clear, grounded, useful. Explain the context without dramatizing uncertain claims.",storyLead:"Here's what makes the story interesting: ",explainerLead:"Let's break down what matters: "},
 story:{voice:"Build a beginning, escalation, turn, and payoff. Never invent real events or present folklore as verified fact.",storyLead:"It starts with one strange detail: ",explainerLead:"Start with the question everyone should ask: "},
 direct:{voice:"Short, concrete sentences. Remove filler. Deliver the payoff quickly.",storyLead:"Here's the strange part: ",explainerLead:"Here's the point: "}
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
function storyBeats(subject,seconds,tone,cta){
 const short=seconds<=15,medium=seconds<=30;
 const beats=short?[
  ["THE HOOK",`The strangest thing about ${subject.toLowerCase()} isn't always what people see.`],
  ["THE BUILD","It's the detail that makes the story hard to forget."],
  ["THE TURN","But a chilling story and a confirmed event are not the same thing."],
  ["THE PAYOFF","Sometimes the mystery is how the legend began."],
  ["THE CTA",cta]
 ]:medium?[
  ["THE HOOK",`The creepiest part of ${subject.toLowerCase()} isn't always what people claim to have seen.`],
  ["THE SETUP","It starts with a place, a strange detail, and a story people keep passing along."],
  ["THE TURN","Then the details shift. One person tells it one way. The next adds something new."],
  ["THE PAYOFF","Soon, separating the original account from the legend becomes the real mystery."],
  ["THE CTA",cta]
 ]:seconds<=45?[
  ["THE HOOK",`Some stories about ${subject.toLowerCase()} stay with you long after you hear them.`],
  ["THE SETUP","Picture an empty hallway, a light where no one should be, and a sound that stops the moment someone turns around."],
  ["THE BUILD","A story like that gets retold. Each version adds a detail, removes another, and makes the place feel a little more unsettling."],
  ["THE TURN","But what was actually witnessed? What came from local legend? And what can anyone verify?"],
  ["THE PAYOFF", "That gap between the account and the legend is where the mystery lives."],
  ["THE CTA",cta]
 ]:[
  ["THE HOOK",`The stories surrounding ${subject.toLowerCase()} often begin with one detail nobody can explain.`],
  ["THE SETUP","Imagine arriving after dark. The building is quiet. Then comes a sound from somewhere you cannot see."],
  ["THE BUILD","The first account is passed to someone else. The next version adds a shadow, a voice, or a room people avoid."],
  ["THE TURN","Soon the story becomes bigger than the original account. Memory, rumor, and local folklore start to overlap."],
  ["THE PAYOFF","That does not make every detail true. It makes the question more interesting: where did the story begin, and what evidence survived?"],
  ["THE CTA",cta]
 ];
 beats[0][1]=TONE[tone].storyLead+beats[0][1];
 return beats;
}
function explainerBeats(subject,seconds,tone,cta){
 const medium=seconds<=30;
 const beats=medium?[
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
  ?`Some stories about ${subject.toLowerCase()} blur the line between memory and legend. Which detail would make you turn around?`
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
  ?"Story framing uses atmosphere and folklore-style language. No specific haunting or incident is asserted as verified. If you name a real location or person, verify the account and label dramatization."
  :"This is a general explainer draft, not a sourced report. Add primary sources and verify each factual claim before publishing.";
 return {topic,platform,format,tone,duration,category,scenes,script:scenes.map(s=>s.text).join("\n\n"),caption,tags,voiceDirection:TONE[tone].voice,platformDirection:PLATFORM[platform].opener,editorialNote,createdAt:new Date().toISOString()};
}
export function formatPublishingPack(p){
 return ["GHOST MODE STUDIO — CONTENT PACKAGE","TOPIC: "+p.topic,"PLATFORM: "+p.platform+" | FORMAT: "+p.format+" | TARGET: "+p.duration+" seconds","","CREATIVE DIRECTION",p.platformDirection,p.voiceDirection,"","SCRIPT / VOICEOVER TRANSCRIPT",p.script,"","SCENE PLAN",...p.scenes.map(s=>`Scene ${s.number} — ${s.label} (${s.seconds}s)\nVoiceover: ${s.text}\nVisual: ${s.visual}`),"","CAPTION",p.caption,"","HASHTAGS",p.tags.join(" "),"","EDITORIAL CHECK",p.editorialNote,"Verify names, dates, statistics, claims, quotations, and original sources before publishing. This is a draft content package, not a guarantee of reach or virality."].join("\n");
}
