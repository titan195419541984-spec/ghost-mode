
// Ghost Mode Ads Module — configurable, non-overlay, privacy-aware
// No fake impressions. Disabled by default until AD_CLIENT_ID + approval.

const Ads = {
  enabled: false,
  clientId: '',
  slots: {},
  _loaded: false,
  async init(){
    try{
      const r = await fetch('/api/config', {cache:'no-store'});
      if(!r.ok) throw new Error('config');
      const cfg = await r.json();
      this.enabled = !!cfg.adsEnabled && !!cfg.adClientId;
      this.clientId = cfg.adClientId || '';
      this.slots = cfg.adSlots || {};
      this.renderPlaceholders();
      if(this.enabled){
        this.loadScript();
      }
    }catch(e){
      this.enabled=false;
      this.renderPlaceholders();
    }
  },
  renderPlaceholders(){
    document.querySelectorAll('.ad-container').forEach(el=>{
      const slot = el.dataset.slot;
      el.setAttribute('data-enabled', this.enabled ? 'true' : 'false');
      const placeholder = el.querySelector('.ad-placeholder');
      if(!placeholder) return;
      if(this.enabled && this.clientId){
        placeholder.innerHTML = `<strong>SPONSORED</strong> Loading ad — Ghost Mode keeps ads out of your flow.`;
      }else{
        placeholder.innerHTML = `<strong>SPONSORED AREA</strong> Ad space reserved. No ad requests in this build. <br><small style="opacity:.7">Enable with AD_CLIENT_ID after AdSense approval.</small>`;
      }
    });
  },
  loadScript(){
    if(this._loaded) return;
    if(!this.clientId) return;
    this._loaded=true;
    const s=document.createElement('script');
    s.async=true;
    s.crossOrigin='anonymous';
    s.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(this.clientId)}`;
    s.onerror=()=>console.warn('AdSense script failed to load');
    document.head.appendChild(s);
    // After script, push ads
    s.onload=()=>{
      document.querySelectorAll('.ad-container[data-enabled="true"] ins.adsbygoogle').forEach(ins=>{
        try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch{}
      });
    };
  }
};

document.addEventListener('DOMContentLoaded', ()=>Ads.init());
window.GhostAds = Ads;
