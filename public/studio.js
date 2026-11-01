import { generateContentPackage, formatPublishingPack } from "./studio-engine.js?v=2.2.0";
(()=>{
"use strict";
const $=s=>document.querySelector(s),form=$("#studio-form"),out=$("#studio-output"),status=$("#studio-status");
if(!form||!out)return;
let project=null;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(message){
  if(window.GhostToast)window.GhostToast(message);
  else if(status)status.textContent=message;
  else {const el=$("#studio-feedback");if(el)el.textContent=message;}
}
function download(name,text){
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function copy(text,label){
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
    else {const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();const ok=document.execCommand("copy");area.remove();if(!ok)throw new Error("copy unavailable");}
    toast(label+" copied.");
  }catch{toast("Copy is unavailable in this browser. Use Download content package instead.");}
}
function build(){
  const topic=$("#studio-topic").value.trim();
  if(!topic){$("#studio-topic").focus();toast("Enter a topic or paste a trend title first.");return;}
  try{
    project=generateContentPackage({
      topic,
      platform:$("#studio-platform").value,
      format:$("#studio-format").value,
      tone:$("#studio-tone").value,
      duration:Number($("#studio-duration").value),
      category:window.GhostStudio?.selectedCategory||"Culture"
    });
    render();
  }catch(error){toast(error.message||"The content package could not be generated.");}
}
function render(){
  if(!project)return;
  const p=project;
  out.innerHTML=`
    <div class="studio-result-head">
      <div><span class="studio-kicker">CONTENT PACKAGE DRAFT · STORY ENGINE 2.2.0</span><h3>${esc(p.topic)}</h3><p>${esc(p.platform)} · ${p.duration} seconds · ${p.scenes.length} scenes</p></div>
      <span class="studio-ready">● DRAFT CREATED</span>
    </div>
    <div class="studio-preview"><span class="preview-brand">GHOST MODE / STUDIO</span><strong>${esc(p.scenes[0].text)}</strong><small>HOOK / SCENE 01</small></div>
    <div class="studio-direction"><b>CREATIVE DIRECTION · ${esc(p.format.toUpperCase())}</b><p>${esc(p.platformDirection)} ${esc(p.voiceDirection)}</p></div>
    <div class="studio-action-row">
      <button class="primary-button" id="studio-download">↓ Download full package</button>
      <button class="subtle-button" id="studio-copy-pack">Copy full package</button>
      <button class="subtle-button" id="studio-copy-script">Copy script</button>
      <button class="subtle-button" id="studio-copy-caption">Copy caption</button>
    </div>
    <div class="studio-columns">
      <section><div class="studio-section-label">SCRIPT & SCENE PLAN</div><div class="studio-scenes">${p.scenes.map(s=>`
        <article class="studio-scene"><span>${String(s.number).padStart(2,"0")}</span><div><b>${esc(s.label)} · ${s.seconds}s</b><p>${esc(s.text)}</p><small>VISUAL: ${esc(s.visual)}</small></div></article>`).join("")}</div></section>
      <section><div class="studio-section-label">PUBLISHING PACK</div><div class="studio-copy-card"><b>CAPTION</b><p>${esc(p.caption)}</p><b>HASHTAGS</b><p class="studio-hashtags">${esc(p.tags.join(" "))}</p><b>VOICEOVER TRANSCRIPT</b><p>${esc(p.script)}</p></div></section>
    </div>
    <p class="studio-editorial-note">${esc(p.editorialNote)} Verify names, dates, statistics, claims and original sources before publishing. This draft does not guarantee reach or virality.</p>
  `;
  $("#studio-download").addEventListener("click",()=>download("ghost-mode-content-package.txt",formatPublishingPack(p)));
  $("#studio-copy-pack").addEventListener("click",()=>copy(formatPublishingPack(p),"Full content package"));
  $("#studio-copy-script").addEventListener("click",()=>copy(p.script,"Script"));
  $("#studio-copy-caption").addEventListener("click",()=>copy(p.caption+"\n\n"+p.tags.join(" "),"Caption and hashtags"));
}
form.addEventListener("submit",event=>{event.preventDefault();build();});
const studioNav=document.querySelector('[data-view="studio"]');
window.GhostStudio={
  openWithTrend(trend){
    const value=typeof trend==="string"?trend:trend?.title||trend?.topic||"";
    $("#studio-topic").value=value;
    this.selectedCategory=typeof trend==="object"&&trend?.category?trend.category:"Culture";
    studioNav?.click();
    build();
  },
  generate:build
};
})();