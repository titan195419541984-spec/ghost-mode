const STOP = new Set("about after again also and are back been before being best between but can could day did does each from have here into just like many more most new not now only other our over people really said see some than that their them then there these they this those through time today very was what when where which who why will with you your".split(" "));
const PLATFORM = {
 "TikTok":{opener:"Open with the strongest curiosity gap. Keep the delivery conversational.",cta:"Follow for more signals worth checking."},
 "Instagram Reels":{opener:"Lead with a clear visual idea and a concise first line.",cta:"Save this for your next deep dive."},
 "YouTube Shorts":{opener:"State the subject clearly, then give viewers a reason to stay.",cta:"Subscribe for more concise trend breakdowns."},
 "Facebook Reels":{opener:"Make the subject immediately understandable and invite discussion.",cta:"What are you seeing? Share your take below."}
};
const TONE={
 cinematic:{voice:"Vivid but restrained language. Short sentences. Deliberate reveals."},
 educational:{voice:"Plain explanations, useful context, and a practical way to assess the subject."},
 story:{voice:"Build curiosity in stages. Never invent events, statistics, quotes, or outcomes."},
 direct:{voice:"Short, concrete sentences. Remove filler and get to the point quickly."}
};
const clean=value=>String(value??"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,180);
function wordsFor(topic){return topic.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)&&!/^\d+$/.test(w));}
function hashtags(topic,category){
 const words=wordsFor(topic),tags=[],add=v=>{const t="#"+v.toLowerCase().replace(/[^a-z0-9]/g,"");if(t.length>2&&!tags.includes(t))tags.push(t);};
 words.slice(0,3).forEach(add);
 const map={Technology:["tech","technology","innovation"],Entertainment:["entertainment","popculture","creatornews"],Sports:["sports","sportsnews","culture"],Gaming:["gaming","gamer","gamingnews"],Business:["business","industry","marketwatch"],World:["worldnews","currentevents","news"],Culture:["culture","internetculture","trendwatch"]};
 (map[category]||map.Culture).forEach(add);["ghostmode","trendwatch"].forEach(add);return tags.slice(0,5);
}
function allocateSeconds(total,count){const base=Math.floor(total/count),extra=total%count;return Array.from({length:count},(_,i)=>base+(i<extra?1:0));}
function buildBeats(subject,format,duration,cta){
 const short=duration<=15,medium=duration<=30;
 if(format==="story"){
  if(short)return [
   ["THE HOOK",`Why is ${subject} suddenly on your radar?`],
   ["THE SETUP","Start with the original source."],
   ["THE TURN","Separate facts from online reactions."],
   ["THE QUESTION","Is interest spreading—or just repeating?"],
   ["THE CTA",cta]
  ];
  if(medium)return [
   ["THE HOOK",`Why is ${subject} suddenly getting attention? Here's what matters.`],
   ["THE SETUP","Find the first credible source, then check when the conversation began."],
   ["THE TURN","A busy comment section is not proof of a lasting trend. Look for independent coverage and real context."],
   ["THE QUESTION","Is interest reaching new audiences, or looping through the same feed? That distinction matters."],
   ["THE CTA",cta]
  ];
  return [
   ["THE HOOK",`Something about ${subject} is catching attention. But the first version of a story is rarely the whole story.`],
   ["THE SETUP","Start at the source. Find the original post, report, product announcement, event, or discussion. Check its date and what it actually says."],
   ["THE TURN","Then look beyond the reaction. Are independent communities discussing it? Are credible outlets adding new information? Or are people repeating the same unverified claim? Those are very different signals."],
   ["THE QUESTION","The question is whether interest is spreading to new audiences and whether the underlying information holds up. A fast-moving conversation can still be misleading, recycled, or short-lived."],
   ["THE CTA",cta]
  ];
 }
 if(short)return [
  ["THE HOOK",`Why is ${subject} getting attention?`],
  ["THE CONTEXT","Find the original source and date."],
  ["WHAT TO CHECK","Look for independent coverage."],
  ["THE TAKEAWAY","Attention alone does not prove momentum."],
  ["THE CTA",cta]
 ];
 if(medium)return [
  ["THE HOOK",`Why is ${subject} getting attention? The useful answer is more than just calling it a trend.`],
  ["THE CONTEXT","Find the original source, check the date, and identify what people are actually responding to."],
  ["WHAT TO CHECK","Look for independent sources, new audiences, and evidence beyond likes or repeated headlines. Separate confirmed facts from speculation."],
  ["THE TAKEAWAY","A spike can fade quickly. Watch whether interest keeps spreading and whether the information stands up to checking."],
  ["THE CTA",cta]
 ];
 return [
  ["THE HOOK",`Why is ${subject} getting attention—and what does that attention actually tell us?`],
  ["THE CONTEXT","First, define the subject in one clear sentence. Find the original post, report, product, event, or discussion that started the conversation. Check when it appeared and what the source can actually confirm."],
  ["WHAT TO CHECK","Next, look for three signals. Are unrelated sources discussing the same subject? Is the conversation reaching audiences beyond its starting point? And are people responding to new information, or simply repeating the same headline? These checks help separate a real developing story from a temporary burst of noise."],
  ["THE TAKEAWAY","Do not treat a high level of attention as proof that something will last. Look for sustained interest, credible context, and a clear reason people care. If the evidence is thin, say so. That makes the breakdown more useful—and more trustworthy."],
  ["THE CTA",cta]
 ];
}
export function generateContentPackage(input={}){
 const topic=clean(input.topic);if(!topic)throw new Error("Enter a topic or paste a trend title first.");
 const platform=PLATFORM[input.platform]?input.platform:"TikTok",format=input.format==="story"?"story":"explainer",tone=TONE[input.tone]?input.tone:"cinematic";
 const duration=[15,30,45,60].includes(Number(input.duration))?Number(input.duration):30,category=String(input.category||"Culture"),subject=topic.replace(/[.!?]+$/,"");
 const beats=buildBeats(subject,format,duration,PLATFORM[platform].cta),seconds=allocateSeconds(duration,beats.length);
 const scenes=beats.map(([label,text],i)=>({number:i+1,label,text,seconds:seconds[i],visual:[
 "Full-screen title; make the subject readable immediately.",
 "Show the original source or a clearly attributed example.",
 "Use two or three concise on-screen points; avoid unsupported numbers.",
 "Close with a practical takeaway and source context.",
 "Simple end card with one clear call to action."
 ][i]}));
 const caption=platform==="YouTube Shorts"
  ? `${subject}\n\nA concise breakdown of what to check, what is confirmed, and what is still speculation.\n\n${PLATFORM[platform].cta}`
  :platform==="Facebook Reels"
   ?`Let's look at ${subject}. Separate the original information from reactions and speculation. What have you noticed?\n\n${PLATFORM[platform].cta}`
   :platform==="Instagram Reels"
    ?`${subject} — here's the part worth checking. Look at the source, the timing, and whether the conversation is spreading beyond its original audience.\n\n${PLATFORM[platform].cta}`
    :`The conversation around ${subject} deserves a closer look. Here's what to verify before calling it the next big thing.\n\n${PLATFORM[platform].cta}`;
 return {topic,platform,format,tone,duration,category,scenes,script:scenes.map(s=>s.text).join("\n\n"),caption,tags:hashtags(topic,category),voiceDirection:TONE[tone].voice,platformDirection:PLATFORM[platform].opener,createdAt:new Date().toISOString()};
}
export function formatPublishingPack(p){
 return ["GHOST MODE STUDIO — CONTENT PACKAGE","TOPIC: "+p.topic,"PLATFORM: "+p.platform+" | FORMAT: "+p.format+" | TARGET: "+p.duration+" seconds","","CREATIVE DIRECTION",p.platformDirection,p.voiceDirection,"","SCRIPT / VOICEOVER TRANSCRIPT",p.script,"","SCENE PLAN",...p.scenes.map(s=>`Scene ${s.number} — ${s.label} (${s.seconds}s)\nVoiceover: ${s.text}\nVisual: ${s.visual}`),"","CAPTION",p.caption,"","HASHTAGS",p.tags.join(" "),"","EDITORIAL CHECK","Verify names, dates, statistics, claims, quotations, and original sources before publishing. This is a draft content package, not a guarantee of reach or virality."].join("\n");
}
