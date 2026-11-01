const STOP = new Set("about after again also and are back been before being best between but can could day did does each from have here into just like many more most new not now only other our over people really said see some than that their them then there these they this those through time today very was what when where which who why will with you your".split(" "));
const PLATFORM = {
  "TikTok": { opener:"Open with the strongest curiosity gap. Keep the delivery conversational.", cta:"Follow for more signals worth checking.", caption:"TikTok caption" },
  "Instagram Reels": { opener:"Lead with a clear visual idea and a concise first line.", cta:"Save this for your next deep dive.", caption:"Reels caption" },
  "YouTube Shorts": { opener:"State the subject clearly, then give viewers a reason to stay.", cta:"Subscribe for more concise trend breakdowns.", caption:"Shorts description" },
  "Facebook Reels": { opener:"Make the subject immediately understandable and invite discussion.", cta:"What are you seeing? Share your take below.", caption:"Reels caption" }
};
const TONE = {
  cinematic:{voice:"Use vivid but restrained language, short sentences, and deliberate reveals.",intro:"The signal is easy to miss. The pattern behind it is worth a closer look."},
  educational:{voice:"Explain the idea plainly. Define the key point and give viewers a practical way to assess it.",intro:"Here is what to know, what to check, and what not to assume."},
  story:{voice:"Build curiosity in stages. Do not invent events, statistics, quotes, or outcomes.",intro:"At first, it looks like one more thing passing through the feed. Then you notice the pattern."},
  direct:{voice:"Use short, concrete sentences. Remove filler and get to the point quickly.",intro:"Here is the topic. Here is why people may be paying attention. Here is what to check."}
};
const FORMAT = {
  explainer:["THE HOOK","THE CONTEXT","WHAT TO LOOK FOR","THE TAKEAWAY","THE CTA"],
  story:["THE HOOK","THE SETUP","THE TURN","THE QUESTION","THE CTA"]
};
const clean = value => String(value ?? "").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,180);
function wordsFor(topic){
  return topic.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)&&!/^\d+$/.test(w));
}
function hashtags(topic, category){
  const words=wordsFor(topic), tags=[];
  const add=v=>{const t="#"+v.toLowerCase().replace(/[^a-z0-9]/g,"");if(t.length>2&&!tags.includes(t))tags.push(t);};
  words.slice(0,3).forEach(add);
  const categoryTags={Technology:["tech","technology","innovation"],Entertainment:["entertainment","popculture","creatornews"],Sports:["sports","sportsnews","culture"],Gaming:["gaming","gamer","gamingnews"],Business:["business","industry","marketwatch"],World:["worldnews","currentevents","news"],Culture:["culture","internetculture","trendwatch"]};
  (categoryTags[category]||categoryTags.Culture).forEach(add);
  ["ghostmode","trendwatch"].forEach(add);
  return tags.slice(0,5);
}
function allocateSeconds(total,count){
  const base=Math.floor(total/count),extra=total%count;
  return Array.from({length:count},(_,i)=>base+(i<extra?1:0));
}
export function generateContentPackage(input={}){
  const topic=clean(input.topic);
  if(!topic) throw new Error("Enter a topic or paste a trend title first.");
  const platform=PLATFORM[input.platform]?input.platform:"TikTok";
  const format=input.format==="story"?"story":"explainer";
  const tone=TONE[input.tone]?input.tone:"cinematic";
  const duration=[15,30,45,60].includes(Number(input.duration))?Number(input.duration):30;
  const category=String(input.category||"Culture");
  const p=PLATFORM[platform],t=TONE[tone],tags=hashtags(topic,category);
  const subject=topic.replace(/[.!?]+$/,"");
  const beats=format==="story" ? [
    ["THE HOOK",`What if ${subject} is more than a passing moment? Here's the detail worth paying attention to.`],
    ["THE SETUP",`Start with the observable fact: ${subject}. Separate what is confirmed from what people are speculating about.`],
    ["THE TURN","The important question is not simply how many people are talking. It is what is driving the conversation, and whether independent sources support the same picture."],
    ["THE QUESTION","Look for the original source, the date, and the context. If those do not hold up, the story does not either."],
    ["THE CTA",p.cta]
  ] : [
    ["THE HOOK",`Why is ${subject} getting attention? The useful answer is more specific than just calling it a trend.`],
    ["THE CONTEXT",`First, define ${subject} in one clear sentence. Then show the original post, report, product, event, or discussion that started the conversation—if you can verify it.`],
    ["WHAT TO LOOK FOR","Check three things: when the conversation started, whether unrelated sources are discussing the same subject, and what people are actually responding to. A spike in attention alone does not prove lasting momentum."],
    ["THE TAKEAWAY",`The signal to watch is whether interest keeps spreading beyond its first audience. Treat unverified claims as questions, not facts. ${t.intro}`],
    ["THE CTA",p.cta]
  ];
  const seconds=allocateSeconds(duration,beats.length);
  const scenes=beats.map(([label,text],i)=>({number:i+1,label,text,seconds:seconds[i],visual:[
    "Full-screen title; make the subject readable immediately.",
    "Show the original source or a clearly attributed example.",
    "Use two or three concise on-screen points; avoid unsupported numbers.",
    "Close with a practical takeaway and source context.",
    "Simple end card with one clear call to action."
  ][i]}));
  const script=scenes.map(s=>s.text).join("\n\n");
  const caption = platform==="YouTube Shorts"
    ? `${subject}\n\nA quick breakdown of what to check, what is confirmed, and what is still speculation.\n\n${p.cta}`
    : platform==="Facebook Reels"
      ? `Let's look at ${subject}. The key is to separate the original information from the reactions and speculation. What have you noticed?\n\n${p.cta}`
      : platform==="Instagram Reels"
        ? `${subject} — here's the part worth looking at. Check the source, the timing, and whether the conversation is spreading beyond its original audience.\n\n${p.cta}`
        : `The conversation around ${subject} deserves a closer look. Here's what to verify before calling it the next big thing.\n\n${p.cta}`;
  return {topic,platform,format,tone,duration,category,scenes,script,caption,tags,voiceDirection:t.voice,platformDirection:p.opener,createdAt:new Date().toISOString()};
}
export function formatPublishingPack(p){
  return [
    "GHOST MODE STUDIO — CONTENT PACKAGE",
    "TOPIC: "+p.topic,
    "PLATFORM: "+p.platform+" | FORMAT: "+p.format+" | TARGET: "+p.duration+" seconds",
    "",
    "CREATIVE DIRECTION",
    p.platformDirection,
    p.voiceDirection,
    "",
    "SCRIPT / VOICEOVER TRANSCRIPT",
    p.script,
    "",
    "SCENE PLAN",
    ...p.scenes.map(s=>`Scene ${s.number} — ${s.label} (${s.seconds}s)\nVoiceover: ${s.text}\nVisual: ${s.visual}`),
    "",
    "CAPTION",
    p.caption,
    "",
    "HASHTAGS",
    p.tags.join(" "),
    "",
    "EDITORIAL CHECK",
    "Verify names, dates, statistics, claims, and original sources before publishing. This is a draft content package, not a guarantee of reach or virality."
  ].join("\n");
}
