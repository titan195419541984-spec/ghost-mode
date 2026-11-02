/* HilltopAds Video VAST 3.0 — zone 7588957, Google IMA invocation. */
(() => {
  const AD_TAG_URL = "https://realisticreply.com/dRm/F.zJdqGWNfvFZTGiUh/kewmJ9/unZGUSlpkoPPTpc/1fOyDugu5/NxTwc/tkNLz-U/4/OADDkv2/MeSaZAs/a/WT1upRdbD_0hxE";
  let active = false;
  function ensureOverlay() {
    let root = document.getElementById('gm-reward-ad-overlay');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'gm-reward-ad-overlay';
    root.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(4,6,12,.96);display:none;align-items:center;justify-content:center;padding:18px';
    root.innerHTML = '<div style="width:min(94vw,720px);color:#fff;font:14px system-ui;text-align:center"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong>GHOST MODE · REWARD VIDEO</strong><span id="gm-reward-ad-status">Ad loading…</span></div><div id="gm-reward-ad-container" style="position:relative;width:100%;aspect-ratio:16/9;background:#000;overflow:hidden"><video id="gm-reward-content-video" playsinline muted style="width:100%;height:100%;display:block"></video><div id="gm-reward-ad-slot" style="position:absolute;inset:0"></div></div><p style="color:#aeb4c5">Keep this window open and watch the complete ad to earn 5 points.</p><button id="gm-reward-ad-cancel" type="button" style="padding:10px 18px;border:1px solid #657087;border-radius:8px;background:#171c29;color:#fff">Cancel — no points</button></div>';
    document.body.appendChild(root);
    root.querySelector('#gm-reward-ad-cancel').addEventListener('click', () => {
      if (active) { root.dispatchEvent(new CustomEvent('gm-reward-cancel')); }
    });
    return root;
  }
  function showRewardedAd() {
    return new Promise((resolve, reject) => {
      if (active) return reject(new Error('An ad is already active.'));
      if (!window.google?.ima) return reject(new Error('Google IMA SDK did not load.'));
      active = true;
      const root = ensureOverlay(), slot = root.querySelector('#gm-reward-ad-slot');
      const video = root.querySelector('#gm-reward-content-video');
      const status = root.querySelector('#gm-reward-ad-status');
      root.style.display = 'flex'; slot.innerHTML = '';
      let manager, completed = false, settled = false;
      const finish = value => {
        if (settled) return; settled = true; active = false;
        try { manager?.destroy(); } catch {}
        root.style.display = 'none'; slot.innerHTML = '';
        resolve({completed:value});
      };
      root.addEventListener('gm-reward-cancel', () => { try{manager?.stop();}catch{} finish(false); }, {once:true});
      const display = new google.ima.AdDisplayContainer(slot, video);
      const loader = new google.ima.AdsLoader(display);
      loader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, event => {
        try {
          manager = event.getAdsManager(video);
          manager.addEventListener(google.ima.AdEvent.Type.LOADED, () => { status.textContent='Video ad playing'; });
          manager.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => { completed = true; });
          manager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => { completed = false; });
          manager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => finish(completed));
          manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, () => finish(false));
          manager.init(640, 360, google.ima.ViewMode.NORMAL);
          manager.start();
        } catch (error) { finish(false); }
      }, false);
      loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, () => finish(false), false);
      display.initialize();
      const request = new google.ima.AdsRequest();
      request.adTagUrl = AD_TAG_URL;
      request.linearAdSlotWidth = Math.max(320, Math.min(window.innerWidth-36, 720));
      request.linearAdSlotHeight = Math.max(180, Math.min(window.innerHeight-180, 405));
      request.nonLinearAdSlotWidth = request.linearAdSlotWidth;
      request.nonLinearAdSlotHeight = 150;
      request.setAdWillAutoPlay(true);
      request.setAdWillPlayMuted(false);
      loader.requestAds(request);
      setTimeout(() => { if(!settled && !manager) finish(false); }, 25000);
    });
  }
  window.GhostRewardsProvider = {showRewardedAd, zoneId:'7588957', format:'VAST 3.0'};
})();