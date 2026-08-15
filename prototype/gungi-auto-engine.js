(() => {
  'use strict';

  const EARTH_RADIUS_M = 6371000;
  const DENSITY_RADIUS_M = 100;
  const DENSITY_MIN_EXISTING = 6;
  const SUPPORT_RADIUS_M = 100;

  const RX = {
    added: /(追加|追加希望|希望|新規|候補|add|addition|proposed|candidate|new|cagym|capokestop|capowerspot)/i,
    existing: /(既存|existing|current)/i,
    support: /(トイレ|便所|restroom|toilet|水飲|給水|water fountain|休憩|ベンチ|bench|東屋|あずまや|四阿|売店|カフェ|cafe|案内所|information)/i,
    parking: /(駐車場|parking|ロータリー|rotary|車寄せ|車道|車両|vehicle)/i,
    narrow: /(狭路|狭い道|細い道|木道|boardwalk|サイクリング|cycling|cycle road|自転車道)/i,
    bridge: /(橋|bridge|跨線橋|歩道橋)/i,
    entrance: /(入口|出入口|entrance|ゲート|gate|門|改札|駅前|station entrance)/i,
    loop: /(周回|回遊|loop|遊歩道|promenade|園路|trail|散策路)/i,
    playground: /(遊具|ブランコ|すべり台|滑り台|鉄棒|ジャングルジム|playground|athletic)/i,
    openSpace: /(公園|広場|芝生|原っぱ|グラウンド|park|square|lawn|plaza)/i,
    water: /(噴水|水飲|給水|池|pond|川|river|水辺|waterfront|滝|waterfall|井戸|well)/i,
    art: /(アート|壁画|mural|彫刻|sculpture|銅像|statue|モニュメント|monument|シーサー|art)/i,
    history: /(史跡|遺跡|跡$|歴史|由来|文化財|旧.*住宅|ruins|historic|history)/i,
    religious: /(神社|寺院|寺$|教会|church|shrine|temple|薬師堂|不動尊|大神宮|八幡宮|お堂|お社)/i,
    transit: /(駅$|駅前|station|改札|バス停|bus stop|タクシー|taxi|乗り場)/i,
    commercial: /(売店|商店|ショップ|shop|store|カフェ|cafe|restaurant|レストラン|market|mart|ホテル|hotel)/i,
    landmark: /(ランドマーク|landmark|塔|タワー|tower|記念碑|碑|時計台|シンボル|symbol)/i,
    shelter: /(東屋|あずまや|四阿|休憩所|屋根|シェルター|shelter|gazebo|pavilion)/i
  };

  function eventDef(id, title, type, priority, story, systemText, suppress = []) {
    return { id, title, type, priority, story, suppress, cuts: [{ speaker: 'system', text: systemText }] };
  }

  const EVENT_DEFS = {
    DENSITY_01: eventDef('DENSITY_01','密集地点','対立型',50,['発見','滞留リスクを読む','魅力との両立を考える'],'POIが集中している地点があります。'),
    DENSITY_REST_01: eventDef('DENSITY_REST_01','密集＋休憩支援','補完型',80,['密集を発見','近くの支援設備を確認','休憩を含めた運用を考える'],'密集地点の周辺に休憩・支援設備があります。',['DENSITY_01']),
    ENTRANCE_01: eventDef('ENTRANCE_01','入口・集合導線','対立型',70,['入口を発見','分かりやすさを評価','人流との衝突を考える'],'入口付近に追加POIまたは集合候補があります。'),
    LOOP_01: eventDef('LOOP_01','回遊導線','補完型',45,['複数の導線候補を発見','周回性を読む','滞留分散へつなげる'],'周回・散策導線として使えそうなPOIが複数あります。'),
    NARROW_PATH_01: eventDef('NARROW_PATH_01','狭路・木道','確認型',75,['狭い導線候補を発見','通過か滞留かを分ける','現地確認へ送る'],'狭い通路・木道などに関係する可能性がある候補があります。'),
    PARKING_01: eventDef('PARKING_01','駐車場・車両動線','確認型',76,['車両動線候補を発見','歩行との重なりを読む','現地確認へ送る'],'駐車場・ロータリー・車両動線に近い可能性がある候補があります。'),
    PLAYGROUND_01: eventDef('PLAYGROUND_01','遊具エリア','補完型',48,['遊具を発見','滞在型の魅力を読む','周囲の余白を見る'],'遊具に関係するPOIがまとまっています。'),
    OPEN_SPACE_01: eventDef('OPEN_SPACE_01','広場・芝生','補完型',42,['広い空間候補を発見','集合・分散の余地を見る','導線との接続を考える'],'広場・芝生・公園空間に関係する候補があります。'),
    REST_SUPPORT_01: eventDef('REST_SUPPORT_01','休憩・支援拠点','補完型',55,['支援設備を発見','長時間滞在への効きを読む','周辺イベントを補完する'],'休憩・支援設備の候補があります。'),
    WATER_01: eventDef('WATER_01','水辺・水場','確認型',46,['水場を発見','魅力と安全の両面を見る','現地状況を確認する'],'水辺・水場に関係する候補があります。'),
    ART_01: eventDef('ART_01','アート散策','発見型',38,['アートPOIを発見','連続性を見る','歩く理由へ変える'],'アート・彫刻・壁画などの候補があります。'),
    HISTORY_01: eventDef('HISTORY_01','歴史・文化','発見型',39,['歴史POIを発見','地域性を読む','散策テーマへ変える'],'歴史・文化に関係する候補があります。'),
    RELIGIOUS_01: eventDef('RELIGIOUS_01','寺社・宗教施設','確認型',44,['寺社等を発見','空間の性格を読む','滞留可否を現地確認する'],'寺社・宗教施設に関係する候補があります。'),
    TRANSIT_01: eventDef('TRANSIT_01','交通アクセス','補完型',58,['駅・停留所を発見','アクセス性を評価','集合導線との関係を見る'],'駅・バス停など交通アクセスに関係する候補があります。'),
    COMMERCIAL_01: eventDef('COMMERCIAL_01','商業・補給','補完型',41,['商業施設を発見','補給可能性を見る','主導線への影響を見る'],'売店・店舗・カフェなど商業施設の候補があります。'),
    LANDMARK_01: eventDef('LANDMARK_01','ランドマーク','発見型',37,['目印を発見','集合時の分かりやすさを見る','ルートの節目へ使う'],'ランドマーク・記念碑などの候補があります。'),
    BRIDGE_01: eventDef('BRIDGE_01','橋・横断導線','確認型',72,['橋を発見','通過導線を読む','滞留を避ける設計を考える'],'橋・歩道橋など横断導線に関係する候補があります。'),
    SHELTER_01: eventDef('SHELTER_01','屋根・退避地点','補完型',57,['屋根付き地点を発見','天候対応力を見る','休憩支援へつなげる'],'東屋・シェルターなど屋根付き候補があります。'),
    FAMILY_01: eventDef('FAMILY_01','遊具＋休憩','複合型',69,['遊具を発見','休憩設備との組み合わせを見る','滞在しやすさを考える'],'遊具の近くに休憩・支援候補があります。',['PLAYGROUND_01','REST_SUPPORT_01']),
    CULTURE_WALK_01: eventDef('CULTURE_WALK_01','文化散策ルート','複合型',64,['文化系POIを複数発見','点を線につなぐ','散策テーマを作る'],'アートと歴史・文化の候補が組み合わさっています。',['ART_01','HISTORY_01']),
    WATER_REST_01: eventDef('WATER_REST_01','水辺＋休憩','複合型',63,['水辺を発見','休憩地点との近さを見る','滞在場所として評価する'],'水辺の近くに休憩・支援候補があります。',['WATER_01','REST_SUPPORT_01']),
    ENTRANCE_DENSITY_01: eventDef('ENTRANCE_DENSITY_01','入口密集','対立型',90,['入口周辺の集中を発見','アクセス利点と滞留リスクを並べる','分散案を考える'],'入口周辺にPOIが集中しています。',['ENTRANCE_01','DENSITY_01']),
    SUPPORT_GAP_01: eventDef('SUPPORT_GAP_01','支援空白','確認型',67,['活動候補の集中を発見','支援設備の不足を見る','現地の代替手段を探す'],'活動候補がある一方、近くに休憩・支援候補が見つかりません。'),
    MIXED_ATTRACTION_01: eventDef('MIXED_ATTRACTION_01','多様な見どころ','発見型',60,['異なるカテゴリを発見','偏りの少なさを見る','複数テーマの回遊へつなげる'],'異なる種類の見どころが複数そろっています。')
  };

  const sourceText = point => `${point?.folder || ''} ${point?.name || ''}`.trim();
  const toRad = deg => deg * Math.PI / 180;
  function distanceMeters(a,b){const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng),lat1=toRad(a.lat),lat2=toRad(b.lat);const q=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 2*EARTH_RADIUS_M*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}

  function normalizePoint(point,index){
    const text=sourceText(point);
    const categories={};
    for(const [key,rx] of Object.entries(RX)) categories[key]=rx.test(text);
    return {...point,id:point.id||`p${index+1}`,_text:text,categories,
      isAdded:typeof point.isAdded==='boolean'?point.isAdded:categories.added,
      isExisting:typeof point.isExisting==='boolean'?point.isExisting:categories.existing,
      isSupport:typeof point.isSupport==='boolean'?point.isSupport:categories.support};
  }

  function eventResult(id,payload={}){const def=EVENT_DEFS[id];return {...def,...payload,cuts:def.cuts.map(x=>({...x})),story:[...def.story],suppress:[...def.suppress]};}
  function categoryPoints(points,key){return points.filter(p=>p.categories[key]);}
  function categoryEvent(points,id,key,minCount=1,confidence='medium'){
    const matched=categoryPoints(points,key); if(matched.length<minCount)return null;
    return eventResult(id,{confidence,reason:`${EVENT_DEFS[id].title} に関係するPOIを${matched.length}件検出`,center:matched[0],matchedPoints:matched,metrics:{matchedCount:matched.length}});
  }
  function nearPairs(a,b,radius){const pairs=[];for(const x of a)for(const y of b){if(x.id===y.id)continue;const d=distanceMeters(x,y);if(d<=radius)pairs.push({a:x,b:y,distance:d});}return pairs.sort((x,y)=>x.distance-y.distance);}

  function detectDensity(points){
    const added=points.filter(p=>p.isAdded),existing=points.filter(p=>p.isExisting);let best=null;
    for(const center of added){const nearbyExisting=existing.map(p=>({point:p,distance:distanceMeters(center,p)})).filter(x=>x.distance<=DENSITY_RADIUS_M).sort((a,b)=>a.distance-b.distance);if(!best||nearbyExisting.length>best.nearbyExisting.length)best={center,nearbyExisting};}
    if(!best||best.nearbyExisting.length<DENSITY_MIN_EXISTING)return [];
    const support=points.filter(p=>p.isSupport&&p.id!==best.center.id).map(p=>({point:p,distance:distanceMeters(best.center,p)})).filter(x=>x.distance<=SUPPORT_RADIUS_M);
    const common={confidence:'high',center:best.center,matchedPoints:[best.center,...best.nearbyExisting.map(x=>x.point)],supportPoints:support.map(x=>x.point),metrics:{radiusM:DENSITY_RADIUS_M,nearbyExistingCount:best.nearbyExisting.length,supportCount:support.length}};
    const out=[eventResult('DENSITY_01',{...common,reason:`追加POIの100m以内に既存POIが${best.nearbyExisting.length}件`})];
    if(support.length)out.push(eventResult('DENSITY_REST_01',{...common,reason:`密集地点の100m以内に休憩・支援候補が${support.length}件`}));
    else out.push(eventResult('SUPPORT_GAP_01',{...common,reason:'密集地点の100m以内に休憩・支援候補なし'}));
    const entrances=categoryPoints(points,'entrance');
    if(entrances.some(e=>distanceMeters(e,best.center)<=100))out.push(eventResult('ENTRANCE_DENSITY_01',{...common,reason:'密集地点が入口・ゲート候補の100m以内'}));
    return out;
  }

  function detectComposite(points){
    const out=[];
    const playground=categoryPoints(points,'playground'),support=points.filter(p=>p.isSupport),water=categoryPoints(points,'water'),art=categoryPoints(points,'art'),history=categoryPoints(points,'history');
    const family=nearPairs(playground,support,100); if(family.length)out.push(eventResult('FAMILY_01',{confidence:'high',reason:'遊具と休憩・支援候補が100m以内',center:family[0].a,matchedPoints:[family[0].a,family[0].b],metrics:{distanceM:Math.round(family[0].distance)}}));
    const wr=nearPairs(water,support,100); if(wr.length)out.push(eventResult('WATER_REST_01',{confidence:'high',reason:'水辺・水場と休憩・支援候補が100m以内',center:wr[0].a,matchedPoints:[wr[0].a,wr[0].b],metrics:{distanceM:Math.round(wr[0].distance)}}));
    if(art.length&&history.length)out.push(eventResult('CULTURE_WALK_01',{confidence:'medium',reason:`アート${art.length}件＋歴史文化${history.length}件`,center:art[0],matchedPoints:[...art,...history]}));
    const attractionKeys=['playground','water','art','history','religious','landmark','openSpace'];
    const present=attractionKeys.filter(k=>categoryPoints(points,k).length>0);
    if(present.length>=3)out.push(eventResult('MIXED_ATTRACTION_01',{confidence:'medium',reason:`見どころカテゴリが${present.length}種類`,matchedPoints:points.filter(p=>present.some(k=>p.categories[k])),metrics:{categories:present}}));
    return out;
  }

  function applySuppression(events){
    const suppressed=new Set();
    for(const e of events)for(const id of e.suppress||[])suppressed.add(id);
    return events.filter(e=>!suppressed.has(e.id));
  }

  function detectAll(input={}){
    const points=(input.points||[]).map(normalizePoint).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
    const found=[];
    const simple=[
      ['PARKING_01','parking',1],['NARROW_PATH_01','narrow',1],['BRIDGE_01','bridge',1],['ENTRANCE_01','entrance',1],['LOOP_01','loop',2],
      ['PLAYGROUND_01','playground',2],['OPEN_SPACE_01','openSpace',1],['REST_SUPPORT_01','support',1],['WATER_01','water',1],['ART_01','art',2],
      ['HISTORY_01','history',1],['RELIGIOUS_01','religious',1],['TRANSIT_01','transit',1],['COMMERCIAL_01','commercial',1],['LANDMARK_01','landmark',1],['SHELTER_01','shelter',1]
    ];
    for(const [id,key,min] of simple){const e=categoryEvent(points,id,key,min);if(e)found.push(e);}
    found.push(...detectDensity(points),...detectComposite(points));
    const unique=[...new Map(found.map(e=>[e.id,e])).values()];
    return applySuppression(unique).sort((a,b)=>b.priority-a.priority);
  }

  function detect(input={}){return detectAll(input)[0]||null;}
  window.GungiAutoEvents={version:'0.2.0',constants:{densityRadiusM:DENSITY_RADIUS_M,densityMinExisting:DENSITY_MIN_EXISTING,supportRadiusM:SUPPORT_RADIUS_M,eventCount:Object.keys(EVENT_DEFS).length},eventDefs:EVENT_DEFS,detect,detectAll,distanceMeters};
})();
