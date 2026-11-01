import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateContentPackage, formatPublishingPack } from "../public/studio-engine.js";

describe("Ghost Studio content engine",()=>{
  it("requires a real topic",()=>{
    assert.throws(()=>generateContentPackage({topic:"   "}),/Enter a topic/);
  });
  it("creates five or six scenes whose timing exactly matches the selected duration",()=>{
    for(const duration of [15,30,45,60]){
      const result=generateContentPackage({topic:"AI search trends",duration});
      assert.ok(result.scenes.length>=5&&result.scenes.length<=6);
      assert.equal(result.scenes.reduce((sum,scene)=>sum+scene.seconds,0),duration);
      assert.ok(result.scenes.every(scene=>scene.seconds>=3));
    }
  });
  it("generates a real story arc for story format instead of a trend-analysis checklist",()=>{
    const result=generateContentPackage({topic:"Haunted places",format:"story",duration:30});
    assert.match(result.scenes[0].text,/creepiest part/i);
    assert.match(result.script,/legend/i);
    assert.doesNotMatch(result.script,/first credible source, then check when the conversation began/i);
    assert.match(result.editorialNote,/No specific haunting or incident is asserted as verified/);
    assert.ok(result.tags.includes("#hauntedplaces"));
    assert.ok(result.tags.includes("#paranormal"));
    assert.ok(!result.tags.includes("#places"));
  });
  it("keeps 15-second story and explainer scripts concise",()=>{
    for(const format of ["story","explainer"]){
      const result=generateContentPackage({topic:"Haunted places",format,duration:15});
      const count=result.script.trim().split(/\\s+/).length;
      assert.ok(count<=39,`${format} 15s script is too long: ${count} words`);
    }
  });
  it("changes copy for the selected platform",()=>{
    const topic="AI search trends";
    const tiktok=generateContentPackage({topic,platform:"TikTok"});
    const shorts=generateContentPackage({topic,platform:"YouTube Shorts"});
    assert.notEqual(tiktok.caption,shorts.caption);
    assert.match(shorts.caption,/AI search trends/);
  });
  it("creates topic-related hashtags instead of only generic tags",()=>{
    const result=generateContentPackage({topic:"Electric vehicle battery research",category:"Technology"});
    assert.ok(result.tags.length>=4&&result.tags.length<=5);
    assert.ok(result.tags.some(tag=>/electric|vehicle|battery|research/.test(tag)));
    assert.ok(result.tags.every(tag=>/^#[a-z0-9]+$/.test(tag)));
  });
  it("keeps spoken script length proportionate to the selected duration",()=>{
    for(const duration of [15,30,45,60]){
      const result=generateContentPackage({topic:"AI search trends",duration});
      const count=result.script.trim().split(/\s+/).length;
      assert.ok(count<=duration*2.6,`${duration}s script is too long: ${count} words`);
      assert.ok(count>=duration*0.8,`${duration}s script is too short: ${count} words`);
    }
  });
  it("changes the hook when creative direction changes",()=>{
    const cinematic=generateContentPackage({topic:"AI search trends",tone:"cinematic"});
    const direct=generateContentPackage({topic:"AI search trends",tone:"direct"});
    assert.notEqual(cinematic.scenes[0].text,direct.scenes[0].text);
  });
  it("keeps unsupported claims out of the generated editorial guidance",()=>{
    const result=generateContentPackage({topic:"New social media trend"});
    const pack=formatPublishingPack(result);
    assert.match(pack,/Verify names, dates, statistics, claims, quotations, and original sources/);
    assert.match(pack,/not a guarantee of reach or virality/);
  });
  it("includes complete scenes, caption, and hashtags in the downloadable pack",()=>{
    const result=generateContentPackage({topic:"Creator economy"});
    const pack=formatPublishingPack(result);
    assert.match(pack,/SCRIPT \/ VOICEOVER TRANSCRIPT/);
    assert.match(pack,/SCENE PLAN/);
    assert.match(pack,/CAPTION/);
    assert.match(pack,/HASHTAGS/);
    assert.ok(result.scenes.every(scene=>pack.includes(scene.visual)));
  });
});
