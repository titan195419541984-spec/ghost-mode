import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateContentPackage, formatPublishingPack } from "../public/studio-engine.js";

describe("Ghost Studio content engine",()=>{
  it("requires a real topic",()=>{
    assert.throws(()=>generateContentPackage({topic:"   "}),/Enter a topic/);
  });
  it("creates five scenes whose timing exactly matches the selected duration",()=>{
    for(const duration of [15,30,45,60]){
      const result=generateContentPackage({topic:"AI search trends",duration});
      assert.equal(result.scenes.length,5);
      assert.equal(result.scenes.reduce((sum,scene)=>sum+scene.seconds,0),duration);
      assert.ok(result.scenes.every(scene=>scene.seconds>=3));
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
  it("keeps spoken script length proportionate to the selected duration",()=>{\n    for(const duration of [15,30,45,60]){\n      const result=generateContentPackage({topic:"AI search trends",duration});\n      const count=result.script.trim().split(/\\s+/).length;\n      assert.ok(count<=duration*2.6,`${duration}s script is too long: ${count} words`);\n      assert.ok(count>=duration*0.8,`${duration}s script is too short: ${count} words`);\n    }\n  });\n  it("changes the hook when creative direction changes",()=>{\n    const cinematic=generateContentPackage({topic:"AI search trends",tone:"cinematic"});\n    const direct=generateContentPackage({topic:"AI search trends",tone:"direct"});\n    assert.notEqual(cinematic.scenes[0].text,direct.scenes[0].text);\n  });\n  it("keeps unsupported claims out of the generated editorial guidance",()=>{
    const result=generateContentPackage({topic:"New social media trend"});
    const pack=formatPublishingPack(result);
    assert.match(pack,/Verify names, dates, statistics, claims, and original sources/);
    assert.match(pack,/does not guarantee reach or virality/);
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
