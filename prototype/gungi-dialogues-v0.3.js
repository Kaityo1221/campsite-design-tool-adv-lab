(() => {
  'use strict';

  const D = (riku, cuts) => ({ riku, cuts });

  window.GUNGI_DIALOGUES_V03 = {
    DENSITY_01: D('surprised', [
      { speaker: 'system', text: 'POIが集中している地点があります。' },
      { speaker: 'riku', text: 'ここに人が集中するな。滞留が生まれるかもしれない。' },
      { speaker: 'mina', text: 'でも、人が集まるってことはさ！それだけ魅力があるってことじゃん！' }
    ]),
    DENSITY_REST_01: D('normal', [
      { speaker: 'system', text: '密集地点の周辺に休憩・支援設備があります。' },
      { speaker: 'riku', text: '条件は悪くない。近くに休憩できる場所がある。長時間でも立て直せる。' },
      { speaker: 'mina', text: 'おおっ、ここなら休みながら遊べるね！' }
    ]),
    ENTRANCE_01: D('normal', [
      { speaker: 'system', text: '入口付近に追加POIが集まっています。' },
      { speaker: 'riku', text: 'アクセスはいい。だが、入口の人流とぶつかる可能性がある。' },
      { speaker: 'mina', text: '初めて来る人にはめっちゃ分かりやすいよ！' }
    ]),
    LOOP_01: D('curious', [
      { speaker: 'system', text: '複数のPOIが周回しやすい形でつながっています。' },
      { speaker: 'riku', text: '周回できる。参加者を一か所に留めずに済みそうだ。' },
      { speaker: 'mina', text: 'いいじゃん！ぐるっと歩いて遊べるよ！' }
    ]),
    NARROW_PATH_01: D('surprised', [
      { speaker: 'system', text: '狭い通路・橋・木道などに関係する可能性がある候補があります。' },
      { speaker: 'riku', text: '地図上では狭い通路に関係しそうだ。実際にここを通るのか、立ち止まるのか確認したい。' },
      { speaker: 'mina', text: '近くにあるだけかもしれないしね。現地の動き方を見て決めよう！' }
    ]),
    PARKING_01: D('surprised', [
      { speaker: 'system', text: '駐車場・ロータリー・車両動線に近い可能性がある候補があります。' },
      { speaker: 'riku', text: '地図上では車両動線に近いな。実際の歩行ルートや滞留位置を確認しておこうか。' },
      { speaker: 'mina', text: '気をつけて歩いてね⭐︎右見て左' }
    ]),
    PLAYGROUND_01: D('curious', [
      { speaker: 'system', text: '遊具に関係するPOIがまとまっています。' },
      { speaker: 'riku', text: '遊具の周りは子どもや家族が長く使う。POIを置くなら、その流れを塞がない配置にしたい。' },
      { speaker: 'mina', text: 'でも遊具がまとまってるのは強いよ！歩いて来た先に、ちゃんと遊ぶ理由がある！' }
    ]),
    PARK_PLAZA_01: D('normal', [
      { speaker: 'system', text: '公園・広場・芝生に関係する候補があります。' },
      { speaker: 'riku', text: '広さはある。集合と移動を分けやすそうだ。' },
      { speaker: 'mina', text: 'こういう余白がある場所、みんなで動きやすいね！' }
    ]),
    REST_01: D('normal', [
      { speaker: 'system', text: '休憩・支援設備の候補があります。' },
      { speaker: 'riku', text: '休める場所があるのは大きい。長く歩く設計でも途中で立て直せる。' },
      { speaker: 'mina', text: '休憩できるなら、もう一周いける人も増えそう！' }
    ]),
    REST_SHORTAGE_01: D('surprised', [
      { speaker: 'system', text: '活動候補に対して休憩・支援候補が少ない可能性があります。' },
      { speaker: 'riku', text: '活動候補は多いのに休憩が見当たらない。長時間運用では弱点になる。' },
      { speaker: 'mina', text: '楽しくても休めないと疲れちゃうね。途中で一息つける場所を探そ！' }
    ]),
    TRANSIT_01: D('normal', [
      { speaker: 'system', text: '駅・停留所など交通アクセスの候補があります。' },
      { speaker: 'riku', text: 'アクセスは強い。ただし駅や停留所の人流とはぶつけたくない。' },
      { speaker: 'mina', text: '来やすいのは最高！集合場所とのつなぎ方を考えよう！' }
    ]),
    LANDMARK_CLUSTER_01: D('curious', [
      { speaker: 'system', text: 'ランドマーク候補が複数あります。' },
      { speaker: 'riku', text: '目印が複数ある。集合やルート説明に使いやすい。' },
      { speaker: 'mina', text: '「あれの前集合！」ができるの、めっちゃ分かりやすい！' }
    ]),
    ART_CLUSTER_01: D('curious', [
      { speaker: 'system', text: 'アート・彫刻などの候補が複数あります。' },
      { speaker: 'riku', text: 'アートが連続しているな。点ではなく、歩く理由としてつなげられそうだ。' },
      { speaker: 'mina', text: '作品を順番に見て回るだけで、小さな散策コースになるね！' }
    ]),
    HISTORY_CLUSTER_01: D('curious', [
      { speaker: 'system', text: '歴史・文化に関係する候補が複数あります。' },
      { speaker: 'riku', text: '歴史・文化のPOIがまとまっている。場所の背景まで含めてルートにできる。' },
      { speaker: 'mina', text: 'ただ歩くだけじゃなくて、この街の物語を拾えるね！' }
    ]),
    RELIGIOUS_01: D('normal', [
      { speaker: 'system', text: '寺社・宗教施設に関係する候補があります。' },
      { speaker: 'riku', text: '寺社や宗教施設は空間の使われ方が独特だ。滞留やイベント利用は慎重に見たい。' },
      { speaker: 'mina', text: '静かに楽しむ場所なら、その雰囲気を壊さない歩き方にしよう。' }
    ]),
    COMMERCIAL_CLUSTER_01: D('normal', [
      { speaker: 'system', text: '商業施設の候補が複数あります。' },
      { speaker: 'riku', text: '一般利用者の流れが強い。混雑時間と導線の重なりは確認したい。' },
      { speaker: 'mina', text: 'お店が多いなら寄り道も楽しいね。遊ぶ人と買い物する人が共存できる形にしよ！' }
    ]),
    FOOD_SUPPLY_01: D('normal', [
      { speaker: 'system', text: '飲食・補給に使えそうな候補があります。' },
      { speaker: 'riku', text: '補給できる場所がある。長時間の回遊を支える条件になる。' },
      { speaker: 'mina', text: '食べたり飲んだりできるなら、休憩も含めて楽しめるね！' }
    ]),
    LARGE_COMMERCIAL_01: D('surprised', [
      { speaker: 'system', text: '大型商業施設内に関係する可能性があります。' },
      { speaker: 'riku', text: '大型商業施設内なら営業時間や施設ルールの影響が大きい。屋外と同じ感覚では見ない方がいい。' },
      { speaker: 'mina', text: 'でも天気に左右されにくいのは魅力だね。施設のルールを守って使えたら強い！' }
    ]),
    WATER_01: D('curious', [
      { speaker: 'system', text: '水辺・噴水・井戸などに関係する候補があります。' },
      { speaker: 'riku', text: '水辺は魅力がある分、安全と通行条件を確認したい。' },
      { speaker: 'mina', text: '景色が変わるポイントだ！歩いてて「来た！」って感じが出るね！' }
    ]),
    TOURIST_CLUSTER_01: D('curious', [
      { speaker: 'system', text: '観光性の高いPOIが複数あります。' },
      { speaker: 'riku', text: '観光POIが集中している。来訪者の波が大きい時間帯は注意したい。' },
      { speaker: 'mina', text: '見どころが続くなら、初めて来た人にもワクワクするルートになる！' }
    ]),
    SAME_TYPE_BURST_01: D('curious', [
      { speaker: 'system', text: '同じ種類のPOIがまとまっています。' },
      { speaker: 'riku', text: 'おい！この辺は［{category}］が多いぞ。これは地域の特色として使えるかもしれない。' },
      { speaker: 'mina', text: 'ほんとだ！同じ系統が続くなら、テーマを決めて歩くのも楽しそう！' }
    ]),
    ATTRIBUTE_SKEW_01: D('curious', [
      { speaker: 'system', text: 'POI属性に大きな偏りがあります。' },
      { speaker: 'riku', text: '構成がかなり片寄っているな。特色なのか、単調さにつながるのか見たい。' },
      { speaker: 'mina', text: '偏ってるなら逆に「ここはこれが主役！」って見せ方もできそう！' }
    ]),
    LANDMARK_SHORTAGE_01: D('surprised', [
      { speaker: 'system', text: '活動候補に対して集合時の目印が少ない可能性があります。' },
      { speaker: 'riku', text: '活動候補はあるのに、集合の目印が弱い。初参加の人が迷うかもしれない。' },
      { speaker: 'mina', text: 'じゃあ「ここを目印にする！」って場所を一つ決めようよ！' }
    ]),
    FAVORABLE_COMPOSITE_01: D('curious', [
      { speaker: 'system', text: '回遊・休憩・アクセスなど複数の好条件がそろっています。' },
      { speaker: 'riku', text: '回遊、休憩、アクセス、目印。条件がかなり揃っている。' },
      { speaker: 'mina', text: 'これは強い！歩いて、休んで、また遊べる流れが作れそう！' }
    ])
  };

  function installInteractiveMapOverlayPatch(){
    if(!window.L || window.__ADV_INTERACTIVE_OVERLAYS_V034__) return;
    window.__ADV_INTERACTIVE_OVERLAYS_V034__=true;
    L.Map.addInitHook(function(){ window.__ADV_ACTIVE_MAP__=this; });
    const originalAddLayer=L.LayerGroup.prototype.addLayer;
    const isCircleLayer=layer=>layer instanceof L.CircleMarker;
    const currentEventLabel=()=>{
      const raw=(document.getElementById('eventBanner')?.textContent||'ADV EVENT').trim();
      return raw.replace(/^EVENT\s+\d+\/\d+\s*·\s*/i,'')||'ADV EVENT';
    };
    const nearestNamedMarker=(map,anchor,ignore)=>{
      let best=null,bestDistance=Infinity;
      map.eachLayer(candidate=>{
        if(candidate===ignore || !(candidate instanceof L.CircleMarker)) return;
        const tooltip=candidate.getTooltip?.(),ll=candidate.getLatLng?.();
        if(!tooltip||!ll) return;
        const d=map.distance(anchor,ll);
        if(d<bestDistance){best=candidate;bestDistance=d;}
      });
      return bestDistance<=45?best:null;
    };
    const popupOptions=()=>({closeButton:true,autoPan:true,keepInView:true,offset:[0,-6],minWidth:190,maxWidth:240,className:'adv-poi-popup'});
    const popupCard=(sourceHtml,kind,eventLabel)=>`<div class="adv-popup-card"><div class="adv-popup-source">${sourceHtml}</div><hr><div class="adv-popup-meta"><strong>表示</strong>：${kind}</div>${eventLabel?`<div class="adv-popup-meta"><strong>ピックアップ理由</strong>：${eventLabel}</div>`:''}</div>`;
    const openInfo=(layer,e,kind)=>{
      const map=layer._map||window.__ADV_ACTIVE_MAP__;
      if(!map) return;
      const anchor=layer.getLatLng?.()||e?.latlng;
      const source=anchor?nearestNamedMarker(map,anchor,layer):null;
      const sourceHtml=source?.getTooltip?.()?.getContent?.()||'<strong>イベント判定エリア</strong>';
      L.popup(popupOptions()).setLatLng(e?.latlng||anchor).setContent(popupCard(sourceHtml,kind,currentEventLabel())).openOn(map);
    };
    const attachNormalMarker=layer=>{
      if(!isCircleLayer(layer)||layer.__advNormalClickBound__) return;
      const tooltip=layer.getTooltip?.();
      if(!tooltip) return;
      layer.__advNormalClickBound__=true;
      layer.on('click',e=>{
        const map=layer._map||window.__ADV_ACTIVE_MAP__;
        if(!map) return;
        const sourceHtml=tooltip.getContent?.()||'<strong>POI</strong>';
        L.popup(popupOptions()).setLatLng(e.latlng).setContent(popupCard(sourceHtml,'POI','')).openOn(map);
      });
    };
    const attachOverlay=layer=>{
      if(!isCircleLayer(layer)||layer.__advOverlayClickBound__||layer.getTooltip?.()||layer.getPopup?.()) return;
      layer.__advOverlayClickBound__=true;
      const isArea=layer instanceof L.Circle;
      if(!isArea && typeof layer.getRadius==='function' && typeof layer.setRadius==='function'){
        const r=Number(layer.getRadius());
        if(Number.isFinite(r)&&r<8) layer.setRadius(8);
      }
      layer.options.interactive=true;
      layer.on('click',e=>openInfo(layer,e,isArea?'判定エリア／中心地点':'イベントでピックアップされたPOI'));
      layer.on('add',()=>{
        const node=layer.getElement?.();
        if(node){node.style.cursor='pointer';node.style.pointerEvents='auto';}
      });
    };
    L.LayerGroup.prototype.addLayer=function(layer){
      const result=originalAddLayer.call(this,layer);
      attachNormalMarker(layer);
      attachOverlay(layer);
      return result;
    };
  }

  function installCompactPopupStyle(){
    if(document.getElementById('advCompactPopupStyle')) return;
    const style=document.createElement('style');
    style.id='advCompactPopupStyle';
    style.textContent=`
      #map .adv-poi-popup .leaflet-popup-content-wrapper{border-radius:10px}
      #map .adv-poi-popup .leaflet-popup-content{width:210px!important;max-width:210px!important;margin:8px 10px;line-height:1.38;font-size:11px}
      #map .adv-popup-card,#map .adv-popup-source,#map .adv-popup-source *{writing-mode:horizontal-tb!important;text-orientation:mixed!important;white-space:normal!important}
      #map .adv-popup-card{width:210px;max-width:210px;overflow-wrap:anywhere;word-break:normal}
      #map .adv-popup-source strong{display:block;font-size:12px;line-height:1.35;margin-bottom:2px}
      #map .adv-popup-card hr{border:0;border-top:1px solid #d1d5db;margin:6px 0}
      #map .adv-popup-meta{margin-top:2px}
      @media(max-width:760px){
        #map .adv-poi-popup{min-width:210px!important;max-width:230px!important}
        #map .adv-poi-popup .leaflet-popup-content-wrapper{min-width:210px!important;max-width:230px!important;border-radius:9px}
        #map .adv-poi-popup .leaflet-popup-content{width:190px!important;max-width:190px!important;max-height:118px;overflow-y:auto;margin:7px 10px;padding-right:2px;font-size:10.5px;line-height:1.36}
        #map .adv-popup-card{width:190px;max-width:190px;min-width:190px;writing-mode:horizontal-tb!important}
        #map .adv-popup-source{display:block;width:190px;max-width:190px;writing-mode:horizontal-tb!important}
        #map .adv-popup-source strong{display:block;width:100%;font-size:12px;line-height:1.35;writing-mode:horizontal-tb!important;white-space:normal!important}
        #map .leaflet-popup-close-button{width:22px;height:22px;font-size:17px;line-height:20px}
      }
    `;
    document.head.appendChild(style);
  }

  function installMobileMapScreenFit(){
    const scene=document.getElementById('strategyScene');
    const mapEl=document.getElementById('map');
    if(!scene||!mapEl) return;
    const sync=()=>{
      const mobile=window.matchMedia('(max-width:760px)').matches;
      if(!mobile){
        ['left','top','width','height'].forEach(prop=>mapEl.style.removeProperty(prop));
      }else{
        const rect=scene.getBoundingClientRect();
        if(rect.width>0&&rect.height>0){
          const backgroundAspect=1.5;
          const bgWidth=rect.height*backgroundAspect;
          const cropX=(bgWidth-rect.width)/2;
          const rawLeft=bgWidth*0.293-cropX;
          const rawRight=rawLeft+bgWidth*0.403;
          const left=Math.max(0,rawLeft);
          const right=Math.min(rect.width,rawRight);
          const width=Math.max(1,right-left);
          mapEl.style.setProperty('left',`${left}px`,'important');
          mapEl.style.setProperty('top',`${rect.height*0.158}px`,'important');
          mapEl.style.setProperty('width',`${width}px`,'important');
          mapEl.style.setProperty('height',`${rect.height*0.372}px`,'important');
        }
      }
      requestAnimationFrame(()=>window.__ADV_ACTIVE_MAP__?.invalidateSize?.({pan:false}));
    };
    sync();
    window.addEventListener('resize',sync,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(sync,120),{passive:true});
    if('ResizeObserver' in window)new ResizeObserver(sync).observe(scene);
  }

  function installMobileCouncilImmersiveMode(){
    if(window.__ADV_MOBILE_IMMERSIVE_V034__) return;
    window.__ADV_MOBILE_IMMERSIVE_V034__=true;
    const mobile=()=>window.matchMedia('(max-width:760px)').matches;
    const scene=document.getElementById('strategyScene');
    const banner=document.getElementById('eventBanner');
    const file=document.getElementById('kmzFile');
    const controls=document.querySelector('.controls');
    if(!scene||!banner||!controls) return;

    const style=document.createElement('style');
    style.id='advMobileImmersiveStyle';
    style.textContent=`
      #advMobileControlsToggle,#advMobileExit{display:none}
      @media(max-width:760px){
        html.adv-mobile-council,body.adv-mobile-council{margin:0;width:100%;height:100%;overflow:hidden!important;overscroll-behavior:none;background:#050a11}
        body.adv-mobile-council .page{position:fixed;inset:0;z-index:2147483000;width:100vw;height:100dvh;max-width:none;margin:0;padding:0;display:flex;flex-direction:column;background:#050a11;overflow:hidden}
        body.adv-mobile-council .labbar,body.adv-mobile-council .status,body.adv-mobile-council .debug{display:none!important}
        body.adv-mobile-council .strategy-scene{flex:1 1 auto;width:100%;height:auto;min-height:0;aspect-ratio:auto;border:0;border-radius:0;margin:0;background-size:auto 100%;background-repeat:no-repeat;background-position:center center}
        body.adv-mobile-council .controls{position:relative;z-index:2147483010;flex:0 0 auto;margin:0;padding:7px max(8px,env(safe-area-inset-right)) max(7px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));background:linear-gradient(180deg,rgba(4,10,18,.2),rgba(4,10,18,.96));transition:transform .22s ease,opacity .18s ease,max-height .22s ease,padding .22s ease;max-height:90px;overflow:hidden}
        body.adv-mobile-council .controls button{padding:10px 7px;font-size:12px;border-radius:11px}
        body.adv-mobile-council.adv-controls-hidden .controls{position:absolute;left:0;right:0;bottom:0;opacity:0;pointer-events:none;transform:translateY(115%);max-height:0;padding-top:0;padding-bottom:0}
        #advMobileControlsToggle,#advMobileExit{position:fixed;z-index:2147483020;border:1px solid rgba(191,219,254,.3);background:rgba(4,12,22,.78);color:#e5eef7;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 5px 18px rgba(0,0,0,.3);font-weight:800;line-height:1;cursor:pointer}
        body.adv-mobile-council #advMobileControlsToggle,body.adv-mobile-council #advMobileExit{display:flex;align-items:center;justify-content:center}
        #advMobileControlsToggle{right:10px;bottom:max(94px,calc(env(safe-area-inset-bottom) + 76px));min-width:72px;height:32px;padding:0 9px;border-radius:999px;font-size:10px}
        body.adv-mobile-council.adv-controls-hidden #advMobileControlsToggle{bottom:max(12px,env(safe-area-inset-bottom))}
        #advMobileExit{left:10px;top:max(10px,env(safe-area-inset-top));width:34px;height:34px;border-radius:50%;font-size:18px}
      }
    `;
    document.head.appendChild(style);

    const toggle=document.createElement('button');
    toggle.id='advMobileControlsToggle';
    toggle.type='button';
    toggle.textContent='操作を隠す';
    toggle.setAttribute('aria-label','進む・戻るボタンの表示を切り替える');
    document.body.appendChild(toggle);

    const exit=document.createElement('button');
    exit.id='advMobileExit';
    exit.type='button';
    exit.textContent='×';
    exit.setAttribute('aria-label','全画面表示を終了');
    document.body.appendChild(exit);

    const requestNativeFullscreen=()=>{
      const root=document.documentElement;
      const fn=root.requestFullscreen||root.webkitRequestFullscreen;
      if(typeof fn==='function'){
        try{const result=fn.call(root);result?.catch?.(()=>{});}catch(_e){}
      }
    };
    const enter=()=>{
      if(!mobile()||document.body.classList.contains('adv-mobile-council')) return;
      document.documentElement.classList.add('adv-mobile-council');
      document.body.classList.add('adv-mobile-council');
      document.body.classList.remove('adv-controls-hidden');
      toggle.textContent='操作を隠す';
      requestAnimationFrame(()=>window.__ADV_ACTIVE_MAP__?.invalidateSize?.({pan:false}));
    };
    const leave=()=>{
      document.documentElement.classList.remove('adv-mobile-council');
      document.body.classList.remove('adv-mobile-council','adv-controls-hidden');
      toggle.textContent='操作を隠す';
      if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
      requestAnimationFrame(()=>window.__ADV_ACTIVE_MAP__?.invalidateSize?.({pan:false}));
    };
    const updateFromBanner=()=>{
      const text=(banner.textContent||'').trim();
      if(/^EVENT\s+\d+\/\d+/i.test(text)||/^DISTANCE CHECK/i.test(text))enter();
    };

    toggle.addEventListener('click',()=>{
      if(!document.body.classList.contains('adv-mobile-council')) return;
      const hidden=document.body.classList.toggle('adv-controls-hidden');
      toggle.textContent=hidden?'操作を表示':'操作を隠す';
      setTimeout(()=>window.__ADV_ACTIVE_MAP__?.invalidateSize?.({pan:false}),240);
    });
    exit.addEventListener('click',leave);
    new MutationObserver(updateFromBanner).observe(banner,{childList:true,characterData:true,subtree:true});
    file?.addEventListener('change',()=>{if(mobile())requestNativeFullscreen();},{capture:true});
    window.addEventListener('orientationchange',()=>setTimeout(()=>window.__ADV_ACTIVE_MAP__?.invalidateSize?.({pan:false}),180),{passive:true});
    updateFromBanner();
  }

  installInteractiveMapOverlayPatch();
  installCompactPopupStyle();
  installMobileMapScreenFit();
  installMobileCouncilImmersiveMode();
})();

(() => {
  'use strict';
  if(document.getElementById('advSideNavPatchV035')) return;
  const style=document.createElement('style');
  style.id='advSideNavPatchV035';
  style.textContent=`
    @media(max-width:760px){
      body.adv-mobile-council #advMobileControlsToggle{display:none!important}
      body.adv-mobile-council .controls{
        position:fixed!important;
        inset:0!important;
        z-index:2147483015!important;
        display:block!important;
        margin:0!important;
        padding:0!important;
        max-height:none!important;
        overflow:visible!important;
        background:none!important;
        pointer-events:none!important;
        transform:none!important;
        opacity:1!important;
      }
      body.adv-mobile-council .controls button{
        position:absolute!important;
        flex:none!important;
        pointer-events:auto!important;
        margin:0!important;
        box-shadow:0 5px 18px rgba(0,0,0,.36)!important;
      }
      body.adv-mobile-council #backBtn,
      body.adv-mobile-council #nextBtn{
        top:56%!important;
        width:42px!important;
        min-width:42px!important;
        max-width:42px!important;
        height:118px!important;
        padding:9px 7px!important;
        border-radius:999px!important;
        transform:translateY(-50%)!important;
        writing-mode:vertical-rl!important;
        text-orientation:upright!important;
        letter-spacing:.12em!important;
        font-size:0!important;
        line-height:1!important;
        background:rgba(9,24,42,.9)!important;
        color:#e7f1ff!important;
        border:1px solid rgba(147,197,253,.42)!important;
        backdrop-filter:blur(8px);
        -webkit-backdrop-filter:blur(8px);
      }
      body.adv-mobile-council #backBtn{left:max(6px,env(safe-area-inset-left))!important}
      body.adv-mobile-council #nextBtn{right:max(6px,env(safe-area-inset-right))!important}
      body.adv-mobile-council #backBtn::before,
      body.adv-mobile-council #nextBtn::before{
        display:block;
        font-size:13px;
        font-weight:900;
        writing-mode:vertical-rl;
        text-orientation:upright;
        letter-spacing:.12em;
      }
      body.adv-mobile-council #backBtn::before{content:'戻る'}
      body.adv-mobile-council #nextBtn::before{content:'進む'}
      body.adv-mobile-council #restartBtn{
        left:50%!important;
        bottom:max(8px,env(safe-area-inset-bottom))!important;
        width:auto!important;
        min-width:84px!important;
        height:30px!important;
        padding:0 12px!important;
        border-radius:999px!important;
        transform:translateX(-50%)!important;
        writing-mode:horizontal-tb!important;
        font-size:10px!important;
        opacity:.72;
      }
    }
  `;
  document.head.appendChild(style);
  requestAnimationFrame(()=>{
    const toggle=document.getElementById('advMobileControlsToggle');
    if(toggle) toggle.style.setProperty('display','none','important');
  });
})();