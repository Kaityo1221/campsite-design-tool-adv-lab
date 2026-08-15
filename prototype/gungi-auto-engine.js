(() => {
  'use strict';

  const EARTH_RADIUS_M = 6371000;
  const DENSITY_RADIUS_M = 100;
  const DENSITY_MIN_EXISTING = 6;
  const SUPPORT_RADIUS_M = 100;
  const CLUSTER_RADIUS_M = 140;

  const RX = {
    added: /(追加|追加希望|希望|新規|候補|add|addition|proposed|candidate|new|cagym|capokestop|capowerspot)/i,
    existing: /(既存|existing|current)/i,
    entrance: /(入口|出入口|entrance|ゲート|gate|門|改札)/i,
    loop: /(周回|回遊|loop|遊歩道|promenade|園路|trail|散策路|道標|案内図|案内板|map)/i,
    narrow: /(狭路|狭い道|細い道|木道|boardwalk|橋|bridge|歩道橋|サイクリング|cycling|自転車道)/i,
    parking: /(駐車場|parking|ロータリー|rotary|車寄せ|車道|車両|vehicle)/i,
    playground: /(遊具|ブランコ|すべり台|滑り台|鉄棒|ジャングルジム|playground|athletic)/i,
    openSpace: /(公園|広場|芝生|原っぱ|グラウンド|park|square|lawn|plaza)/i,
    rest: /(トイレ|便所|restroom|toilet|水飲|給水|休憩|ベンチ|bench|東屋|あずまや|四阿|休憩所|レストハウス|案内所|information)/i,
    transit: /(改札|バス停|bus stop|タクシー乗り場|taxi stand|乗り場|船乗場|フェリー乗り場)/i,
    landmark: /(ランドマーク|landmark|塔|タワー|tower|記念碑|石碑|時計台|シンボル|symbol|モニュメント|monument|観覧車)/i,
    art: /(壁画|mural|彫刻|sculpture|銅像|statue|モニュメント|monument|オブジェ|アート作品|アート広場|アートギャラリー|アートセンター|アートパーク|アートミュージアム)/i,
    history: /(史跡|遺跡|歴史|由来|文化財|旧.*住宅|ruins|historic|history|記念碑|石碑)/i,
    religious: /(神社|寺院|寺$|教会|church|shrine|temple|薬師堂|不動尊|大神宮|八幡宮|お堂|お社)/i,
    commercial: /(売店|商店|ショップ|shop|store|カフェ|cafe|restaurant|レストラン|market|mart|ホテル|hotel)/i,
    food: /(カフェ|cafe|restaurant|レストラン|食堂|売店|コンビニ|convenience|market|mart|自販機|vending|bbq|バーベキュー)/i,
    largeCommercial: /(モール|mall|ショッピングセンター|shopping center|百貨店|デパート|marketplace|商業施設)/i,
    water: /(噴水|水飲|給水|池|pond|川|river|水辺|waterfront|滝|waterfall|井戸|well|渚|海岸|海浜)/i,
    tourist: /(展望|view|観覧車|museum|博物館|水族館|aquarium|庭園|garden|記念|名所|観光|ビューポイント|viewpoint)/i
  };

  function eventDef(id, title, type, priority, story, systemText, suppress = []) {
    return { id, title, type, priority, story, systemText, suppress, cuts: [{ speaker: 'system', text: systemText }] };
  }

  // 2026-08-14 agreed 24-event set. Dialogue is intentionally left to the user.
  const EVENT_DEFS = {
    DENSITY_01: eventDef('DENSITY_01','密集地点','対立型',60,['密集を発見','滞留リスクを読む','魅力との両立を考える'],'POIが集中している地点があります。'),
    DENSITY_REST_01: eventDef('DENSITY_REST_01','密集＋休憩','補完型',82,['密集を発見','近くの休憩条件を確認','運用上の救いを評価する'],'密集地点の周辺に休憩・支援候補があります。',['DENSITY_01']),
    ENTRANCE_01: eventDef('ENTRANCE_01','入口・集合','対立型',72,['入口を発見','集合の分かりやすさを見る','人流との衝突を考える'],'入口・集合導線に関係する候補があります。'),
    LOOP_01: eventDef('LOOP_01','回遊導線','補完型',56,['回遊候補を発見','点を線につなぐ','滞留分散へつなげる'],'回遊に使えそうなPOIが複数あります。'),
    NARROW_PATH_01: eventDef('NARROW_PATH_01','狭路・橋・木道','確認型',78,['狭い導線を発見','通過か滞留かを分ける','現地確認へ送る'],'狭路・橋・木道に関係する可能性があります。'),
    PARKING_01: eventDef('PARKING_01','駐車場・車両','確認型',79,['車両動線を発見','歩行との重なりを見る','現地確認へ送る'],'駐車場・車両動線に関係する可能性があります。'),
    PLAYGROUND_01: eventDef('PLAYGROUND_01','遊具集中','発見型',50,['遊具POIを発見','集中度を見る','滞在型エリアとして読む'],'遊具に関係するPOIがまとまっています。'),
    PARK_PLAZA_01: eventDef('PARK_PLAZA_01','公園・広場','発見型',46,['広い空間を発見','集合と分散の余地を見る','導線との接続を考える'],'公園・広場・芝生に関係する候補があります。'),
    REST_01: eventDef('REST_01','休憩設備','補完型',58,['休憩候補を発見','長時間滞在への効きを見る','周辺イベントを補完する'],'休憩・支援設備の候補があります。'),
    REST_SHORTAGE_01: eventDef('REST_SHORTAGE_01','休憩不足','確認型',68,['活動候補の多さを見る','休憩候補の少なさを確認','代替手段を探す'],'活動候補に対して休憩・支援候補が少ない可能性があります。'),
    TRANSIT_01: eventDef('TRANSIT_01','駅・交通アクセス','補完型',61,['交通拠点を発見','アクセス性を評価','集合導線との関係を見る'],'駅・停留所など交通アクセスの候補があります。'),
    LANDMARK_CLUSTER_01: eventDef('LANDMARK_CLUSTER_01','ランドマーク集中','発見型',52,['目印を複数発見','集合の分かりやすさを見る','ルートの節目へ使う'],'ランドマーク候補が複数あります。'),
    ART_CLUSTER_01: eventDef('ART_CLUSTER_01','アート集中','発見型',43,['アートPOIを複数発見','連続性を見る','歩く理由へ変える'],'アート・彫刻などの候補が複数あります。'),
    HISTORY_CLUSTER_01: eventDef('HISTORY_CLUSTER_01','歴史・文化集中','発見型',44,['歴史文化POIを複数発見','地域性を読む','散策テーマへ変える'],'歴史・文化に関係する候補が複数あります。'),
    RELIGIOUS_01: eventDef('RELIGIOUS_01','寺社・宗教周辺','確認型',55,['寺社等を発見','空間の性格を読む','滞留可否を確認する'],'寺社・宗教施設に関係する候補があります。'),
    COMMERCIAL_CLUSTER_01: eventDef('COMMERCIAL_CLUSTER_01','商業集中','確認型',54,['商業POIを複数発見','一般利用者の人流を見る','イベント導線との重なりを考える'],'商業施設の候補が複数あります。'),
    FOOD_SUPPLY_01: eventDef('FOOD_SUPPLY_01','飲食・補給','補完型',57,['飲食・補給候補を発見','長時間活動への効きを見る','休憩条件と組み合わせる'],'飲食・補給に使えそうな候補があります。'),
    LARGE_COMMERCIAL_01: eventDef('LARGE_COMMERCIAL_01','大型商業施設内','確認型',74,['大型商業施設を発見','屋内人流を意識','利用条件を確認する'],'大型商業施設内に関係する可能性があります。'),
    WATER_01: eventDef('WATER_01','水辺・噴水・井戸','確認型',48,['水辺候補を発見','魅力と安全の両面を見る','現地状況を確認する'],'水辺・噴水・井戸などに関係する候補があります。'),
    TOURIST_CLUSTER_01: eventDef('TOURIST_CLUSTER_01','観光POI集中','発見型',51,['観光性の高いPOIを発見','来訪者の集中を読む','回遊テーマへつなげる'],'観光性の高いPOIが複数あります。'),
    SAME_TYPE_BURST_01: eventDef('SAME_TYPE_BURST_01','同種POI連続','分析型',63,['同種POIの連続を発見','偏りか特色かを判断','配置の意味を読む'],'同じ種類のPOIが多くまとまっています。'),
    ATTRIBUTE_SKEW_01: eventDef('ATTRIBUTE_SKEW_01','POI属性偏り','分析型',62,['POI構成を集計','一属性への偏りを見る','回遊の単調さを検討する'],'POI属性に大きな偏りがあります。'),
    LANDMARK_SHORTAGE_01: eventDef('LANDMARK_SHORTAGE_01','集合目印不足','確認型',59,['活動候補を確認','集合目印の不足を見る','入口や目印候補を探す'],'活動候補に対して集合時の目印が少ない可能性があります。'),
    FAVORABLE_COMPOSITE_01: eventDef('FAVORABLE_COMPOSITE_01','複合好条件','総合型',85,['回遊性を確認','休憩・補給を確認','目印やアクセスを確認','総合的な使いやすさを評価する'],'回遊・休憩・アクセスなど複数の好条件がそろっています。',['REST_SHORTAGE_01','LANDMARK_SHORTAGE_01'])
  };

  const sourceText = point => `${point?.folder || ''} ${point?.name || ''}`.trim();
  const toRad = deg => deg * Math.PI / 180;
  function distanceMeters(a,b){const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng),lat1=toRad(a.lat),lat2=toRad(b.lat);const q=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 2*EARTH_RADIUS_M*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}

  function isTransitName(name){
    const value=String(name||'').trim();
    if(!value)return false;
    return /駅$/.test(value)||/\bstation\b/i.test(value)||RX.transit.test(value);
  }

  function isArtName(name){
    const value=String(name||'').trim();
    if(!value||/ヴィアート/i.test(value))return false;
    if(RX.art.test(value))return true;
    return /(?:^|[\s/・「」（）()【】])アート(?:$|[\s/・「」（）()【】])/.test(value);
  }

  function pointInPolygon(point,polygon){
    if(!Array.isArray(polygon)||polygon.length<3)return true;
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const xi=Number(polygon[i]?.lng),yi=Number(polygon[i]?.lat),xj=Number(polygon[j]?.lng),yj=Number(polygon[j]?.lat);
      if(![xi,yi,xj,yj].every(Number.isFinite))continue;
      const intersects=((yi>point.lat)!==(yj>point.lat))&&(point.lng<(xj-xi)*(point.lat-yi)/((yj-yi)||Number.EPSILON)+xi);
      if(intersects)inside=!inside;
    }
    return inside;
  }

  function scopePoints(points,input){
    let scoped=points;
    if(Array.isArray(input.scopePointIds)&&input.scopePointIds.length){
      const ids=new Set(input.scopePointIds.map(String));
      scoped=scoped.filter(p=>ids.has(String(p.id)));
    }
    if(Array.isArray(input.activityPolygon)&&input.activityPolygon.length>=3){
      scoped=scoped.filter(p=>pointInPolygon(p,input.activityPolygon));
    }
    if(input.activityBounds){
      const {north,south,east,west}=input.activityBounds;
      if([north,south,east,west].every(Number.isFinite))scoped=scoped.filter(p=>p.lat<=north&&p.lat>=south&&p.lng<=east&&p.lng>=west);
    }
    return scoped;
  }

  function normalizePoint(point,index){
    const text=sourceText(point);
    const finalCategory=String(point.finalCategory || point.poiCategory || point.category || '').toUpperCase();
    const categories={};
    for(const [key,rx] of Object.entries(RX)) categories[key]=rx.test(text);
    categories.transit=isTransitName(point?.name);
    categories.art=isArtName(point?.name);
    if(finalCategory==='LOOP') categories.loop=true;
    if(finalCategory==='REST') categories.rest=true;
    if(finalCategory==='STAY') categories.stay=true;
    if(finalCategory==='CAUTION') categories.caution=true;
    return {...point,id:point.id||`p${index+1}`,_text:text,finalCategory,categories,
      isAdded:typeof point.isAdded==='boolean'?point.isAdded:categories.added,
      isExisting:typeof point.isExisting==='boolean'?point.isExisting:categories.existing,
      isSupport:typeof point.isSupport==='boolean'?point.isSupport:categories.rest};
  }

  function eventResult(id,payload={}){const def=EVENT_DEFS[id];return {...def,...payload,cuts:def.cuts.map(x=>({...x})),story:[...def.story],suppress:[...def.suppress]};}
  function cat(points,key){return points.filter(p=>p.categories[key]);}
  function categoryEvent(points,id,key,minCount=1,confidence='medium'){
    const matched=cat(points,key); if(matched.length<minCount)return null;
    return eventResult(id,{confidence,reason:`${EVENT_DEFS[id].title} に関係するPOIを${matched.length}件検出`,center:matched[0],matchedPoints:matched,metrics:{matchedCount:matched.length}});
  }
  function nearPairs(a,b,radius){const pairs=[];for(const x of a)for(const y of b){if(x.id===y.id)continue;const d=distanceMeters(x,y);if(d<=radius)pairs.push({a:x,b:y,distance:d});}return pairs.sort((x,y)=>x.distance-y.distance);}

  function detectDensity(points){
    const added=points.filter(p=>p.isAdded),existing=points.filter(p=>p.isExisting);let best=null;
    for(const center of added){const nearby=existing.map(p=>({point:p,distance:distanceMeters(center,p)})).filter(x=>x.distance<=DENSITY_RADIUS_M);if(!best||nearby.length>best.nearby.length)best={center,nearby};}
    if(!best||best.nearby.length<DENSITY_MIN_EXISTING)return [];
    const support=points.filter(p=>p.isSupport&&p.id!==best.center.id).map(p=>({point:p,distance:distanceMeters(best.center,p)})).filter(x=>x.distance<=SUPPORT_RADIUS_M);
    const common={confidence:'high',center:best.center,matchedPoints:[best.center,...best.nearby.map(x=>x.point)],supportPoints:support.map(x=>x.point),metrics:{radiusM:DENSITY_RADIUS_M,nearbyExistingCount:best.nearby.length,supportCount:support.length}};
    const out=[eventResult('DENSITY_01',{...common,reason:`追加POIの100m以内に既存POIが${best.nearby.length}件`})];
    if(support.length)out.push(eventResult('DENSITY_REST_01',{...common,reason:`密集地点の100m以内に休憩候補が${support.length}件`}));
    return out;
  }

  function detectComposition(points){
    const keys=['playground','openSpace','rest','transit','landmark','art','history','religious','commercial','food','largeCommercial','water','tourist','loop'];
    const counts=Object.fromEntries(keys.map(k=>[k,cat(points,k).length]));
    const active=keys.filter(k=>counts[k]>0);
    const totalTagged=active.reduce((n,k)=>n+counts[k],0);
    const maxEntry=active.map(k=>[k,counts[k]]).sort((a,b)=>b[1]-a[1])[0]||[null,0];
    const out=[];
    if(maxEntry[1]>=8) out.push(eventResult('SAME_TYPE_BURST_01',{confidence:'medium',reason:`${maxEntry[0]} 系POIを${maxEntry[1]}件検出`,matchedPoints:cat(points,maxEntry[0]),metrics:{category:maxEntry[0],count:maxEntry[1]}}));
    if(totalTagged>=10 && maxEntry[1]/totalTagged>=0.55) out.push(eventResult('ATTRIBUTE_SKEW_01',{confidence:'medium',reason:`分類可能POIの${Math.round(maxEntry[1]/totalTagged*100)}%が${maxEntry[0]}系`,matchedPoints:cat(points,maxEntry[0]),metrics:{category:maxEntry[0],ratio:maxEntry[1]/totalTagged}}));
    const activityCount=counts.loop+counts.openSpace+counts.playground+cat(points,'stay').length;
    if(activityCount>=4 && counts.rest===0) out.push(eventResult('REST_SHORTAGE_01',{confidence:'medium',reason:`活動候補${activityCount}件に対して休憩候補を検出できず`,matchedPoints:points.filter(p=>p.categories.loop||p.categories.openSpace||p.categories.playground||p.categories.stay)}));
    if(activityCount>=4 && counts.landmark===0 && counts.entrance===0) out.push(eventResult('LANDMARK_SHORTAGE_01',{confidence:'medium',reason:`活動候補${activityCount}件に対して集合目印候補を検出できず`,matchedPoints:points.filter(p=>p.categories.loop||p.categories.openSpace||p.categories.playground||p.categories.stay)}));
    const favorable=(counts.loop>=2?1:0)+(counts.rest>=1?1:0)+(counts.transit>=1?1:0)+(counts.landmark>=1?1:0)+(counts.food>=1?1:0)+(counts.openSpace>=1?1:0);
    if(favorable>=4) out.push(eventResult('FAVORABLE_COMPOSITE_01',{confidence:'medium',reason:`回遊・休憩・交通・目印・補給・広場のうち${favorable}条件を確認`,matchedPoints:points,metrics:{favorableConditions:favorable}}));
    return out;
  }

  function detectAll(input={}){
    const normalized=(input.points||[]).map(normalizePoint).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
    const points=scopePoints(normalized,input);
    const found=[];
    const push=e=>{if(e)found.push(e);};

    push(categoryEvent(points,'ENTRANCE_01','entrance',1));
    push(categoryEvent(points,'LOOP_01','loop',2));
    push(categoryEvent(points,'NARROW_PATH_01','narrow',1));
    push(categoryEvent(points,'PARKING_01','parking',1));
    push(categoryEvent(points,'PLAYGROUND_01','playground',2));
    push(categoryEvent(points,'PARK_PLAZA_01','openSpace',2));
    push(categoryEvent(points,'REST_01','rest',1));
    push(categoryEvent(points,'TRANSIT_01','transit',1));
    push(categoryEvent(points,'LANDMARK_CLUSTER_01','landmark',2));
    push(categoryEvent(points,'ART_CLUSTER_01','art',2));
    push(categoryEvent(points,'HISTORY_CLUSTER_01','history',2));
    push(categoryEvent(points,'RELIGIOUS_01','religious',1));
    push(categoryEvent(points,'COMMERCIAL_CLUSTER_01','commercial',2));
    push(categoryEvent(points,'FOOD_SUPPLY_01','food',1));
    push(categoryEvent(points,'LARGE_COMMERCIAL_01','largeCommercial',1));
    push(categoryEvent(points,'WATER_01','water',1));
    push(categoryEvent(points,'TOURIST_CLUSTER_01','tourist',2));
    found.push(...detectDensity(points));
    found.push(...detectComposition(points));

    const byId=new Map();
    for(const event of found){const prev=byId.get(event.id);if(!prev||event.priority>prev.priority)byId.set(event.id,event);}
    const suppressed=new Set();
    for(const event of byId.values())for(const id of event.suppress||[])suppressed.add(id);
    return [...byId.values()].filter(e=>!suppressed.has(e.id)).sort((a,b)=>b.priority-a.priority);
  }

  function detect(input={}){return detectAll(input)[0]||null;}

  window.GungiAutoEvents={
    version:'0.2.2',
    constants:{densityRadiusM:DENSITY_RADIUS_M,densityMinExisting:DENSITY_MIN_EXISTING,supportRadiusM:SUPPORT_RADIUS_M,clusterRadiusM:CLUSTER_RADIUS_M},
    eventDefs:EVENT_DEFS,
    detect,detectAll,distanceMeters,pointInPolygon,scopePoints
  };
})();