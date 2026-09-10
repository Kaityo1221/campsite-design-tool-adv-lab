(() => {
  'use strict';

  const base = window.GungiAutoEvents;
  if (!base || window.__ADV_EVENTS_V035__) return;

  const VERSION = '0.3.5';
  const LONG_GAP_M = 150;
  const REST_BALANCE_M = 80;
  const TRANSIT_ENTRANCE_M = 100;
  const LANDMARK_ENTRANCE_M = 80;
  const PARKING_ENTRANCE_M = 80;

  const RX = {
    shade: /(東屋|あずまや|四阿|屋根付き休憩所|屋根付き|シェルター|shelter|日除け|日よけ|ひさし|庇|パーゴラ|pergola)/i,
    toilet: /(公衆トイレ|多目的トイレ|お手洗い|便所|トイレ|\bWC\b|restroom|toilet)/i,
    waterSupply: /(水飲み場|水飲|給水所|給水|飲料水|水道|自動販売機|自販機|drinking fountain|water fountain|vending machine)/i,
    deadEnd: /(行き止まり|行止まり|袋小路|終点|dead[\s-]?end|cul[\s-]?de[\s-]?sac)/i,
    playground: /(遊具|ブランコ|すべり台|滑り台|鉄棒|ジャングルジム|playground|athletic)/i
  };

  const def = (id, title, type, priority, story, systemText) => ({
    id, title, type, priority, story, systemText, suppress: [],
    cuts: [{ speaker: 'system', text: systemText }]
  });

  const EXTRA_DEFS = Object.freeze({
    SHADE_01: def('SHADE_01', '日陰・屋根', '補完型', 59,
      ['日陰・屋根候補を発見', '暑さや日差しへの備えを見る'],
      '日差しを避けられそうな設備があります。'),
    TOILET_01: def('TOILET_01', 'トイレ確保', '補完型', 64,
      ['トイレ候補を発見', '長時間開催の支援条件を見る'],
      '活動範囲内にトイレ候補があります。'),
    WATER_SUPPLY_01: def('WATER_SUPPLY_01', '給水・自販機', '補完型', 60,
      ['飲料補給候補を発見', '暑さや長時間活動への備えを見る'],
      '給水・飲料購入に使えそうな候補があります。'),
    DEAD_END_01: def('DEAD_END_01', '行き止まり候補', '確認型', 77,
      ['行き止まりを示す名称・属性を発見', '現地確認へ送る'],
      '行き止まりの可能性を示す候補があります。'),
    LONG_GAP_01: def('LONG_GAP_01', 'POI空白区間', '分析型', 66,
      ['POI間の大きな間隔を発見', '途中の楽しみを考える'],
      'POI配置の途中に大きな間隔があります。'),
    REST_BALANCE_01: def('REST_BALANCE_01', '休憩配置バランス良好', '補完型', 69,
      ['複数の休憩候補を確認', '分散配置を評価する'],
      '休憩候補が分散して配置されています。'),
    TRANSIT_ENTRANCE_01: def('TRANSIT_ENTRANCE_01', '交通アクセス＋入口', '補完型', 76,
      ['交通拠点と入口を確認', '初参加者の入りやすさを見る'],
      '交通アクセスと入口が近くにあります。'),
    LANDMARK_ENTRANCE_01: def('LANDMARK_ENTRANCE_01', '目印＋入口', '補完型', 75,
      ['目印と入口を確認', '集合案内の分かりやすさを見る'],
      '入口の近くに集合の目印に使えそうな候補があります。'),
    PLAYGROUND_DENSITY_01: def('PLAYGROUND_DENSITY_01', '遊具＋密集', '確認型', 83,
      ['遊具周辺の密集を確認', '通常利用者との共存を見る'],
      '遊具周辺にPOIの密集があります。'),
    PARKING_ENTRANCE_01: def('PARKING_ENTRANCE_01', '駐車場＋入口', '確認型', 84,
      ['駐車場と入口の近接を確認', '歩行者と車両の動線を見る'],
      '入口の近くに駐車場・車両動線があります。'),
    LOOP_REST_01: def('LOOP_REST_01', '回遊＋休憩', '補完型', 70,
      ['回遊と休憩の両条件を確認', '周回途中の休憩候補を見る'],
      '回遊の途中で休憩に使えそうな候補があります。')
  });

  const BASE_DIALOGUES = Object.freeze({
    SHADE_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '日差しを避けられそうな設備があります。' },
      { speaker: 'riku', text: 'ここ、日差しを避けられそうだな。' },
      { speaker: 'mina', text: 'ちょっと休むのにも良さそうだね！' }
    ]},
    TOILET_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '活動範囲内にトイレ候補があります。' },
      { speaker: 'riku', text: 'トイレの場所は押さえておこう。' },
      { speaker: 'mina', text: '先に分かってると安心だね！' }
    ]},
    WATER_SUPPLY_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '給水・飲料購入に使えそうな候補があります。' },
      { speaker: 'riku', text: '飲み物を補給できそうだな。' },
      { speaker: 'mina', text: '飲み物切れた時に助かるね！' }
    ]},
    DEAD_END_01: { riku: 'surprised', cuts: [
      { speaker: 'system', text: '行き止まりの可能性を示す候補があります。' },
      { speaker: 'riku', text: 'この先、行き止まりかもしれないな。' },
      { speaker: 'mina', text: 'ここは現地で確認したいね。' }
    ]},
    LONG_GAP_01: { riku: 'curious', cuts: [
      { speaker: 'system', text: 'POI配置の途中に大きな間隔があります。' },
      { speaker: 'riku', text: '次まで少し間があるな。' },
      { speaker: 'mina', text: '途中に楽しみを入れられるといいね！' }
    ]},
    REST_BALANCE_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '休憩候補が分散して配置されています。' },
      { speaker: 'riku', text: '途中にも休める場所があるな。' },
      { speaker: 'mina', text: '疲れる前に休めるのいいね！' }
    ]},
    TRANSIT_ENTRANCE_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '交通アクセスと入口が近くにあります。' },
      { speaker: 'riku', text: '交通拠点から入口まで分かりやすそうだ。' },
      { speaker: 'mina', text: '着いて、そのまま入れるのいいね！' }
    ]},
    LANDMARK_ENTRANCE_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '入口の近くに集合の目印に使えそうな候補があります。' },
      { speaker: 'riku', text: '入口の近くに分かりやすい目印があるな。' },
      { speaker: 'mina', text: '集合場所を伝えやすそう！' }
    ]},
    PLAYGROUND_DENSITY_01: { riku: 'surprised', cuts: [
      { speaker: 'system', text: '遊具周辺にPOIの密集があります。' },
      { speaker: 'riku', text: '遊具の近くにPOIが集まっているな。' },
      { speaker: 'mina', text: '子どもたちの動く場所は空けておきたいね。' }
    ]},
    PARKING_ENTRANCE_01: { riku: 'surprised', cuts: [
      { speaker: 'system', text: '入口の近くに駐車場・車両動線があります。' },
      { speaker: 'riku', text: '入口の近くに車の動線があるな。' },
      { speaker: 'mina', text: '集まる場所は少し離した方が安心だね。' }
    ]},
    LOOP_REST_01: { riku: 'normal', cuts: [
      { speaker: 'system', text: '回遊の途中で休憩に使えそうな候補があります。' },
      { speaker: 'riku', text: '途中で休むなら、ここが良さそうだな。' },
      { speaker: 'mina', text: 'ひと休みする場所にちょうどいいね！' }
    ]}
  });

  const sourceText = p => `${p?.folder || ''} ${p?.name || ''}`.trim();
  const finalCategory = p => String(p?.finalCategory || p?.poiCategory || p?.category || '').toUpperCase();
  const isExcluded = p => finalCategory(p) === 'EXCLUDE';
  const matchRaw = (points, rx) => points.filter(p => rx.test(sourceText(p)));

  function scopedPoints(input) {
    const raw = (input?.points || []).map((p, i) => ({ ...p, id: p?.id || `p${i + 1}` }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const scoped = typeof base.scopePoints === 'function' ? base.scopePoints(raw, input || {}) : raw;
    return { raw, scoped, points: scoped.filter(p => !isExcluded(p)) };
  }

  const cloneDef = id => {
    const d = EXTRA_DEFS[id];
    return { ...d, story: [...d.story], suppress: [], cuts: d.cuts.map(c => ({ ...c })) };
  };

  function makeEvent(id, matchedPoints, reason, confidence = 'medium', metrics = {}, center = null) {
    const d = cloneDef(id);
    return { ...d, confidence, reason, matchedPoints: matchedPoints || [], metrics, center: center || matchedPoints?.[0] || null };
  }

  function pointsForEvent(events, id) {
    return events.find(e => e.id === id)?.matchedPoints || [];
  }

  function eventById(events, id) {
    return events.find(e => e.id === id) || null;
  }

  function closestPair(a, b, limitM) {
    let best = null;
    for (const x of a) for (const y of b) {
      const distance = base.distanceMeters(x, y);
      if (distance <= limitM && (!best || distance < best.distance)) best = { a: x, b: y, distance };
    }
    return best;
  }

  function widestMstEdge(points) {
    if (points.length < 2) return null;
    const used = new Set([0]);
    let widest = null;
    while (used.size < points.length) {
      let bestEdge = null;
      for (const i of used) {
        for (let j = 0; j < points.length; j += 1) {
          if (used.has(j)) continue;
          const distance = base.distanceMeters(points[i], points[j]);
          if (!bestEdge || distance < bestEdge.distance) bestEdge = { from: i, to: j, distance };
        }
      }
      if (!bestEdge) break;
      used.add(bestEdge.to);
      if (!widest || bestEdge.distance > widest.distance) widest = bestEdge;
    }
    return widest ? { a: points[widest.from], b: points[widest.to], distance: widest.distance } : null;
  }

  function detectExtra(input, baseEvents) {
    const { raw, scoped, points } = scopedPoints(input);
    const out = [];

    const shade = matchRaw(points, RX.shade);
    if (shade.length) out.push(makeEvent('SHADE_01', shade, `日陰・屋根候補を${shade.length}件検出`, 'medium', { matchedCount: shade.length }));

    const toilet = matchRaw(points, RX.toilet);
    if (toilet.length) out.push(makeEvent('TOILET_01', toilet, `トイレ候補を${toilet.length}件検出`, 'high', { matchedCount: toilet.length }));

    const waterSupply = matchRaw(points, RX.waterSupply);
    if (waterSupply.length) out.push(makeEvent('WATER_SUPPLY_01', waterSupply, `給水・飲料購入候補を${waterSupply.length}件検出`, 'high', { matchedCount: waterSupply.length }));

    const deadEnd = matchRaw(points, RX.deadEnd);
    if (deadEnd.length) out.push(makeEvent('DEAD_END_01', deadEnd, `行き止まりを示す名称・属性を${deadEnd.length}件検出`, 'medium', { matchedCount: deadEnd.length }));

    const gap = widestMstEdge(points);
    if (gap && gap.distance >= LONG_GAP_M) {
      out.push(makeEvent('LONG_GAP_01', [gap.a, gap.b], `POI配置をつなぐ区間に約${Math.round(gap.distance)}mの間隔`, 'medium',
        { gapM: Math.round(gap.distance), thresholdM: LONG_GAP_M }));
    }

    const restPoints = pointsForEvent(baseEvents, 'REST_01');
    let restPair = null;
    for (let i = 0; i < restPoints.length; i += 1) {
      for (let j = i + 1; j < restPoints.length; j += 1) {
        const distance = base.distanceMeters(restPoints[i], restPoints[j]);
        if (distance >= REST_BALANCE_M && (!restPair || distance > restPair.distance)) restPair = { a: restPoints[i], b: restPoints[j], distance };
      }
    }
    if (restPair) out.push(makeEvent('REST_BALANCE_01', restPoints,
      `休憩候補が${REST_BALANCE_M}m以上離れて分散`, 'medium',
      { restCount: restPoints.length, spreadM: Math.round(restPair.distance), thresholdM: REST_BALANCE_M }));

    const transitPair = closestPair(pointsForEvent(baseEvents, 'TRANSIT_01'), pointsForEvent(baseEvents, 'ENTRANCE_01'), TRANSIT_ENTRANCE_M);
    if (transitPair) out.push(makeEvent('TRANSIT_ENTRANCE_01', [transitPair.a, transitPair.b],
      `交通アクセスと入口が約${Math.round(transitPair.distance)}m`, 'high',
      { distanceM: Math.round(transitPair.distance), thresholdM: TRANSIT_ENTRANCE_M }));

    const landmarkPair = closestPair(pointsForEvent(baseEvents, 'LANDMARK_CLUSTER_01'), pointsForEvent(baseEvents, 'ENTRANCE_01'), LANDMARK_ENTRANCE_M);
    if (landmarkPair) out.push(makeEvent('LANDMARK_ENTRANCE_01', [landmarkPair.a, landmarkPair.b],
      `ランドマークと入口が約${Math.round(landmarkPair.distance)}m`, 'high',
      { distanceM: Math.round(landmarkPair.distance), thresholdM: LANDMARK_ENTRANCE_M }));

    const density = eventById(baseEvents, 'DENSITY_01') || eventById(baseEvents, 'DENSITY_REST_01');
    const playground = matchRaw(points, RX.playground);
    if (density && playground.length) {
      const densityPoints = density.matchedPoints || [];
      const matched = playground.filter(p => densityPoints.some(dp => String(dp.id) === String(p.id)) ||
        (density.center && base.distanceMeters(density.center, p) <= (base.constants?.densityRadiusM || 100)));
      if (matched.length) out.push(makeEvent('PLAYGROUND_DENSITY_01', matched,
        `密集エリア内に遊具POIを${matched.length}件検出`, 'high',
        { playgroundCount: matched.length, densityRadiusM: base.constants?.densityRadiusM || 100 }, density.center));
    }

    const parkingPair = closestPair(pointsForEvent(baseEvents, 'PARKING_01'), pointsForEvent(baseEvents, 'ENTRANCE_01'), PARKING_ENTRANCE_M);
    if (parkingPair) out.push(makeEvent('PARKING_ENTRANCE_01', [parkingPair.a, parkingPair.b],
      `駐車場・車両動線と入口が約${Math.round(parkingPair.distance)}m`, 'high',
      { distanceM: Math.round(parkingPair.distance), thresholdM: PARKING_ENTRANCE_M }));

    if (eventById(baseEvents, 'LOOP_01') && eventById(baseEvents, 'REST_01')) {
      const matched = [...pointsForEvent(baseEvents, 'LOOP_01'), ...pointsForEvent(baseEvents, 'REST_01')];
      out.push(makeEvent('LOOP_REST_01', matched, '同じ活動範囲で回遊候補と休憩候補が成立', 'high',
        { loopCount: pointsForEvent(baseEvents, 'LOOP_01').length, restCount: restPoints.length }));
    }

    const scopeMetrics = {
      inputCount: raw.length,
      scopedCount: scoped.length,
      excludedCount: scoped.filter(isExcluded).length,
      holdCount: scoped.filter(p => finalCategory(p) === 'HOLD').length,
      reviewedCount: scoped.filter(p => finalCategory(p)).length
    };
    out.forEach(e => { e.scopeMetrics = scopeMetrics; });
    return out;
  }

  const originalDetectAll = base.detectAll.bind(base);
  function detectAll(input = {}) {
    const original = originalDetectAll(input);
    const extra = detectExtra(input, original);
    const byId = new Map();
    [...original, ...extra].forEach(e => {
      const prev = byId.get(e.id);
      if (!prev || Number(e.priority || 0) > Number(prev.priority || 0)) byId.set(e.id, e);
    });
    return [...byId.values()].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
  }

  function detect(input = {}) {
    return detectAll(input)[0] || null;
  }

  if (window.GUNGI_DIALOGUES_V03) Object.assign(window.GUNGI_DIALOGUES_V03, BASE_DIALOGUES);

  window.GungiAutoEvents = {
    ...base,
    version: VERSION,
    constants: {
      ...(base.constants || {}),
      longGapM: LONG_GAP_M,
      restBalanceM: REST_BALANCE_M,
      transitEntranceM: TRANSIT_ENTRANCE_M,
      landmarkEntranceM: LANDMARK_ENTRANCE_M,
      parkingEntranceM: PARKING_ENTRANCE_M
    },
    eventDefs: { ...(base.eventDefs || {}), ...EXTRA_DEFS },
    detect,
    detectAll,
    extensionEventCount: Object.keys(EXTRA_DEFS).length
  };
  window.__ADV_EVENTS_V035__ = true;
})();
