
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Ghost Score logic', ()=>{
  it('calculates score within bounds', ()=>{
    const scoreFor = (item,sources,rank)=>{
      const parsed=item.publishedAt?new Date(item.publishedAt).getTime():NaN;
      const recency=Number.isFinite(parsed)?Math.max(0,1-(Date.now()-parsed)/(72*3600*1000)):.35;
      const engagement=Math.log10(1+Math.max(0,Number(item.engagement)||0))/5;
      return Math.max(12,Math.min(99,Math.round(32+Math.min(3,sources-1)*10+recency*20+Math.min(1,engagement)*18+Math.max(0,16-rank)*1.2)));
    };
    const s=scoreFor({publishedAt:new Date().toISOString(), engagement:100},2,0);
    assert.ok(s>=12 && s<=99);
  });
});

describe('URL validation', ()=>{
  it('rejects javascript urls', ()=>{
    const safe = (raw)=>{ try{ const u=new URL(raw); if(!['http:','https:'].includes(u.protocol)) return null; return u.href; }catch{return null;} };
    assert.equal(safe('javascript:alert(1)'), null);
    assert.ok(safe('https://example.com'));
  });
});

describe('Sanitization', ()=>{
  it('escapes html', ()=>{
    const escapeHTML=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    assert.equal(escapeHTML('<script>'), '&lt;script&gt;');
  });
});
