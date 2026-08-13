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
    narrow: /(狭路|狭い道|細い道|橋|bridge|木道|boardwalk|サイクリング|cycling|cycle road|自転車道)/i,
    entrance: /(入口|出入口|entrance|ゲート|gate|門|改札|駅前|station entrance)/i,
    loop: /(周回|回遊|loop|遊歩道|promenade|園路|trail|散策路)/i
  };

  const EVENT_DEFS = {
    DENSITY_01: {
      id: 'DENSITY_01',
      title: '密集地点',
      type: '対立型',
      priority: 50,
      cuts: [
        { speaker: 'system', text: 'POIが集中している地点があります。' },
        { speaker: 'riku', text: 'ここに人が集中するな。滞留が生まれるかもしれない。' },
        { speaker: 'mina', text: 'でも、人が集まるってことはさ！それだけ魅力があるってことじゃん！' }
      ]
    },
    DENSITY_REST_01: {
      id: 'DENSITY_REST_01',
      title: '密集＋休憩支援',
      type: '補完型',
      priority: 60,
      cuts: [
        { speaker: 'system', text: '密集地点の周辺に休憩・支援設備があります。' },
        { speaker: 'riku', text: '条件は悪くない。近くに休憩できる場所がある。長時間でも立て直せる。' },
        { speaker: 'mina', text: 'おおっ、ここなら休みながら遊べるね！' }
      ]
    },
    ENTRANCE_01: {
      id: 'ENTRANCE_01',
      title: '入口・集合導線',
      type: '対立型',
      priority: 80,
      cuts: [
        { speaker: 'system', text: '入口付近に追加POIまたは集合候補があります。' },
        { speaker: 'riku', text: 'アクセスはいい。だが、入口の人流とぶつかる可能性がある。' },
        { speaker: 'mina', text: '初めて来る人にはめっちゃ分かりやすいよ！' }
      ]
    },
    LOOP_01: {
      id: 'LOOP_01',
      title: '回遊導線',
      type: '補完型',
      priority: 40,
      cuts: [
        { speaker: 'system', text: '周回・散策導線として使えそうなPOIが複数あります。' },
        { speaker: 'riku', text: '周回できる。参加者を一か所に留めずに済みそうだ。' },
        { speaker: 'mina', text: 'いいじゃん！ぐるっと歩いて遊べるよ！' }
      ]
    },
    NARROW_PATH_01: {
      id: 'NARROW_PATH_01',
      title: '狭路・橋・木道',
      type: '全会一致型',
      priority: 90,
      cuts: [
        { speaker: 'system', text: '狭い通路・橋・木道などに関係する候補があります。' },
        { speaker: 'riku', text: 'ここで人を止めるべきじゃない。通行を妨げる。' },
        { speaker: 'mina', text: 'じゃあ、ここは通るだけにしよ！' }
      ]
    },
    PARKING_01: {
      id: 'PARKING_01',
      title: '駐車場・車両動線',
      type: '確認型',
      priority: 70,
      cuts: [
        { speaker: 'system', text: '駐車場・ロータリー・車両動線に近い可能性がある候補があります。' },
        { speaker: 'riku', text: '地図上では車両動線に近いな。実際の歩行ルートや滞留位置を確認したい。' },
        { speaker: 'mina', text: '近いだけなら通らないこともあるよね。現地を見て決めよう！' }
      ]
    }
  };

  const sourceText = point => `${point?.folder || ''} ${point?.name || ''}`.trim();

  function distanceMeters(a, b) {
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const q = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
  }

  function normalizePoint(point, index) {
    const text = sourceText(point);
    const isAdded = typeof point.isAdded === 'boolean' ? point.isAdded : RX.added.test(text);
    const isExisting = typeof point.isExisting === 'boolean' ? point.isExisting : RX.existing.test(text);
    const isSupport = typeof point.isSupport === 'boolean' ? point.isSupport : RX.support.test(text);
    return {
      ...point,
      id: point.id || `p${index + 1}`,
      isAdded,
      isExisting,
      isSupport,
      _text: text
    };
  }

  function eventResult(id, payload = {}) {
    const def = EVENT_DEFS[id];
    return {
      ...def,
      ...payload,
      cuts: def.cuts.map(cut => ({ ...cut }))
    };
  }

  function keywordEvent(points, id, regex, options = {}) {
    const candidates = points.filter(p => {
      if (options.addedOnly && !p.isAdded) return false;
      if (options.targetOnly && !(p.isAdded || p.isExisting)) return false;
      return regex.test(p._text);
    });
    if (candidates.length < (options.minCount || 1)) return null;
    return eventResult(id, {
      confidence: options.confidence || 'medium',
      reason: options.reason || `名称・フォルダ名から ${EVENT_DEFS[id].title} を検出`,
      center: candidates[0],
      matchedPoints: candidates,
      metrics: { matchedCount: candidates.length }
    });
  }

  function detectDensity(points) {
    const added = points.filter(p => p.isAdded);
    const existing = points.filter(p => p.isExisting);
    let best = null;

    for (const center of added) {
      const nearbyExisting = existing
        .map(p => ({ point: p, distance: distanceMeters(center, p) }))
        .filter(x => x.distance <= DENSITY_RADIUS_M)
        .sort((a, b) => a.distance - b.distance);
      if (!best || nearbyExisting.length > best.nearbyExisting.length) {
        best = { center, nearbyExisting };
      }
    }

    if (!best || best.nearbyExisting.length < DENSITY_MIN_EXISTING) return [];

    const support = points
      .filter(p => p.isSupport && p.id !== best.center.id)
      .map(p => ({ point: p, distance: distanceMeters(best.center, p) }))
      .filter(x => x.distance <= SUPPORT_RADIUS_M)
      .sort((a, b) => a.distance - b.distance);

    const common = {
      confidence: 'high',
      center: best.center,
      matchedPoints: [best.center, ...best.nearbyExisting.map(x => x.point)],
      supportPoints: support.map(x => x.point),
      metrics: {
        radiusM: DENSITY_RADIUS_M,
        nearbyExistingCount: best.nearbyExisting.length,
        supportCount: support.length
      }
    };

    const results = [eventResult('DENSITY_01', {
      ...common,
      reason: `追加POIの100m以内に既存POIが${best.nearbyExisting.length}件`
    })];

    if (support.length) {
      results.push(eventResult('DENSITY_REST_01', {
        ...common,
        reason: `密集地点の100m以内に休憩・支援候補が${support.length}件`
      }));
    }

    return results;
  }

  function detectAll(input = {}) {
    const points = (input.points || []).map(normalizePoint).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const found = [];

    const parking = keywordEvent(points, 'PARKING_01', RX.parking, {
      targetOnly: true,
      confidence: 'medium',
      reason: '名称またはフォルダ名から駐車場・ロータリー・車両動線への近接可能性を検出。地図上の近さだけでは除外せず、実際の歩行・滞留との重なりを現地確認する'
    });
    if (parking) found.push(parking);

    const narrow = keywordEvent(points, 'NARROW_PATH_01', RX.narrow, {
      targetOnly: true,
      confidence: 'high',
      reason: '候補POIの名称またはフォルダ名に狭路・橋・木道・自転車道を示す語を検出'
    });
    if (narrow) found.push(narrow);

    const entrance = keywordEvent(points, 'ENTRANCE_01', RX.entrance, {
      addedOnly: true,
      confidence: 'medium',
      reason: '追加POIの名称またはフォルダ名に入口・ゲート・改札を示す語を検出'
    });
    if (entrance) found.push(entrance);

    const loop = keywordEvent(points, 'LOOP_01', RX.loop, {
      targetOnly: true,
      minCount: 2,
      confidence: 'medium',
      reason: '周回・遊歩道・園路を示す候補が複数あるため回遊導線候補として検出'
    });
    if (loop) found.push(loop);

    found.push(...detectDensity(points));

    return found.sort((a, b) => b.priority - a.priority);
  }

  function detect(input = {}) {
    return detectAll(input)[0] || null;
  }

  window.GungiAutoEvents = {
    version: '0.1.1',
    constants: {
      densityRadiusM: DENSITY_RADIUS_M,
      densityMinExisting: DENSITY_MIN_EXISTING,
      supportRadiusM: SUPPORT_RADIUS_M
    },
    eventDefs: EVENT_DEFS,
    detect,
    detectAll,
    distanceMeters
  };
})();
