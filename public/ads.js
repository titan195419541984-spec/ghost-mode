const Ads={
  enabled:false,
  clientId:'',
  slots:{},
  _loaded:false,
  _pushed:new WeakSet(),
  async init(){
    try{
      const r=await fetch('/api/config',{cache:'no-store'});
      if(!r.ok)throw Error('config');
      const c=await r.json();
      this.clientId=String(c.adClientId||'');
      this.slots=c.adSlots||{};
      const hasSlot=Object.values(this.slots).some(v=>/^\\d+$/.test(String(v||'')));
      this.enabled=!!c.adsEnabled&&/^ca-pub-\\d{10,}$/.test(this.clientId)&&hasSlot;
      this.refresh();
      if(this.enabled)this.loadScript();
    }catch{
      this.enabled=false;
      this.refresh();
    }
  },
  refresh(){
    // Advertising is permitted only in the live Pulse feed. Never reserve
    // space or display an inactive placeholder in Radar, Studio, or Rewards.
    document.querySelectorAll('#view-pulse .ad-container').forEach(el=>{
      const slot=String(this.slots[el.dataset.slot]||'');
      const ins=el.querySelector('ins.adsbygoogle');
      const active=this.enabled&&/^\\d+$/.test(slot)&&!!ins;
      el.dataset.enabled=String(active);
      el.hidden=!active;
      if(active&&ins){
        ins.dataset.adClient=this.clientId;
        ins.dataset.adSlot=slot;
        ins.style.display='block';
      }
    });
    if(this.enabled&&this._loaded)this.pushReady();
  },
  loadScript(){
    if(this._loaded||!this.enabled)return;
    this._loaded=true;
    const s=document.createElement('script');
    s.async=true;
    s.crossOrigin='anonymous';
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(this.clientId);
    s.onload=()=>this.pushReady();
    s.onerror=()=>{this._loaded=false;console.warn('AdSense script failed to load');};
    document.head.appendChild(s);
  },
  pushReady(){
    document.querySelectorAll('#view-pulse .ad-container[data-enabled="true"] ins.adsbygoogle').forEach(ins=>{
      if(this._pushed.has(ins)||!ins.dataset.adClient||!ins.dataset.adSlot)return;
      try{
        (window.adsbygoogle=window.adsbygoogle||[]).push({});
        this._pushed.add(ins);
      }catch(e){console.warn('AdSense slot could not be initialized',e);}
    });
  }
};
document.addEventListener('DOMContentLoaded',()=>Ads.init());
window.GhostAds=Ads;
