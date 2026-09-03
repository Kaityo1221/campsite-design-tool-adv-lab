(() => {
  'use strict';

  const VERSION = '0.1.0';
  const VALID_CONFIDENCE = new Set(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);

  const text = value => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return normalized || null;
  };

  const params = () => {
    try { return new URLSearchParams(window.location?.search || ''); }
    catch (_) { return new URLSearchParams(); }
  };

  function isDemoMode() {
    return params().get('demoParkIntro') === '1';
  }

  function demoPayload() {
    return {
      status: 'READY',
      target: { lat: 35.64, lon: 139.86 },
      adv: {
        schema_version: '0.1.0',
        target_system: 'ADV',
        source_system: 'Campsite AI / FACILITY',
        read_only: true,
        park_intro: {
          event_id: 'PARK_INTRO_01',
          status: 'READY',
          park_identity: {
            park_name: '葛西臨海公園',
            display_name: '葛西臨海公園｜東京都江戸川区臨海町6丁目',
            identity_key: 'park-adv-demo-kasai-rinkai',
            identity_confidence: 'HIGH',
            display_address: {
              label: '東京都江戸川区臨海町6丁目',
              address_type: 'AUTHORITATIVE_FACILITY_ADDRESS',
              confidence: 'HIGH'
            },
            administrative_address: {
              label: '東京都 江戸川区',
              address_type: 'ADMINISTRATIVE_AREA_LABEL',
              confidence: 'HIGH'
            },
            park_area_m2: null,
            inside_park: true
          },
          narration_policy: {
            start_adv_with_park_description: true,
            allow_assertive_park_name: true,
            address_is_disambiguation_not_ownership: true,
            do_not_claim_manager_owner_permission_safety: true
          }
        },
        poi_category_summary: {
          total: 24,
          confidence_counts: { HIGH: 9, MEDIUM: 10, LOW: 3, UNKNOWN: 2 }
        },
        points: [],
        limitations: [
          'DEMO payload for visual preview only. It is not a live Campsite AI lookup.'
        ]
      }
    };
  }

  function normalizePayload(candidate) {
    if (!candidate || typeof candidate !== 'object') return null;
    if (candidate.adv?.park_intro) return candidate;
    if (candidate.park_intro) {
      return { status: candidate.park_intro.status || 'PARTIAL', adv: candidate };
    }
    return null;
  }

  function representativePoint(input = {}) {
    const points = Array.isArray(input.points) ? input.points : [];
    const preferred = points.filter(p => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)) && (p.isAdded || p.isExisting || p.isTarget));
    const usable = preferred.length ? preferred : points.filter(p => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)));
    if (!usable.length) return null;
    const total = usable.reduce((acc, p) => ({ lat: acc.lat + Number(p.lat), lon: acc.lon + Number(p.lng) }), { lat: 0, lon: 0 });
    return { lat: total.lat / usable.length, lon: total.lon / usable.length };
  }

  async function resolve(input = {}) {
    const injected = normalizePayload(window.CAMPSITE_AI_ADV_STARTUP);
    if (injected) return { payload: injected, source: 'INJECTED_AI_PAYLOAD', error: null };

    if (typeof window.CAMPSITE_AI_ADV_FETCHER === 'function') {
      const target = representativePoint(input);
      if (target) {
        try {
          const fetched = normalizePayload(await window.CAMPSITE_AI_ADV_FETCHER({
            lat: target.lat,
            lon: target.lon,
            fileName: input.fileName || null,
            points: Array.isArray(input.points) ? input.points : [],
            activityPolygon: Array.isArray(input.activityPolygon) ? input.activityPolygon : null
          }));
          if (fetched) return { payload: fetched, source: 'LIVE_AI_FETCHER', error: null };
          return { payload: null, source: 'LIVE_AI_FETCHER_EMPTY', error: 'Fetcher returned no PARK_INTRO_01 payload.' };
        } catch (error) {
          console.warn('[PARK_INTRO_01] Campsite AI fetcher failed.', error);
          return { payload: null, source: 'LIVE_AI_FETCHER_ERROR', error: String(error?.message || error) };
        }
      }
    }

    if (isDemoMode()) return { payload: demoPayload(), source: 'DEMO', error: null };
    return { payload: null, source: 'NOT_CONNECTED', error: null };
  }

  function modelFromResolved(resolved) {
    const payload = normalizePayload(resolved?.payload);
    const intro = payload?.adv?.park_intro;
    const identity = intro?.park_identity;
    const parkName = text(identity?.park_name);
    if (!parkName) return null;

    const confidenceRaw = String(identity?.identity_confidence || 'UNKNOWN').toUpperCase();
    const confidence = VALID_CONFIDENCE.has(confidenceRaw) ? confidenceRaw : 'UNKNOWN';
    const displayAddress = text(identity?.display_address?.label) || text(identity?.administrative_address?.label);
    const displayName = text(identity?.display_name) || [parkName, displayAddress].filter(Boolean).join('｜');
    const counts = payload?.adv?.poi_category_summary?.confidence_counts || {};
    const totalPoi = Number(payload?.adv?.poi_category_summary?.total || 0);
    const assertive = Boolean(intro?.narration_policy?.allow_assertive_park_name) && ['HIGH', 'MEDIUM'].includes(confidence);

    return {
      eventId: 'PARK_INTRO_01',
      status: text(intro?.status) || 'PARTIAL',
      parkName,
      displayName,
      displayAddress,
      addressType: text(identity?.display_address?.address_type) || text(identity?.administrative_address?.address_type) || 'UNKNOWN',
      confidence,
      identityKey: text(identity?.identity_key),
      assertive,
      source: resolved?.source || 'UNKNOWN',
      demo: resolved?.source === 'DEMO',
      poiSummary: {
        total: totalPoi,
        HIGH: Number(counts.HIGH || 0),
        MEDIUM: Number(counts.MEDIUM || 0),
        LOW: Number(counts.LOW || 0),
        UNKNOWN: Number(counts.UNKNOWN || 0)
      }
    };
  }

  function buildSequence(resolved) {
    const model = modelFromResolved(resolved);
    if (!model) return [];

    const sourceSuffix = model.demo ? '\n※ 画面確認用DEMOデータ' : '';
    const systemText = `公園情報を読み込みました。\n${model.parkName}${model.displayAddress ? `\n${model.displayAddress}` : ''}${sourceSuffix}`;
    const rikuText = model.assertive
      ? `ここは${model.parkName}。\nまず公園全体を見てから、各ポイントを確認していこう。`
      : `${model.parkName}の候補情報がある。\n断定せず、公園全体の情報から順に確認しよう。`;
    const minaText = 'よーし！\nじゃあ、この公園を歩いて見てみよう！';
    const banner = `PARK INFO · ${model.confidence}${model.demo ? ' · DEMO' : ''}`;

    return [
      { kind: 'park-intro', speaker: 'system', text: systemText, parkIntro: model, rikuExpression: 'normal', banner },
      { kind: 'park-intro', speaker: 'riku', text: rikuText, parkIntro: model, rikuExpression: 'normal', banner },
      { kind: 'park-intro', speaker: 'mina', text: minaText, parkIntro: model, rikuExpression: 'normal', banner }
    ];
  }

  function poiEvidence(resolved) {
    const payload = normalizePayload(resolved?.payload);
    const points = payload?.adv?.points;
    return Array.isArray(points) ? points : [];
  }

  window.GungiParkIntro = {
    version: VERSION,
    isDemoMode,
    demoPayload,
    representativePoint,
    resolve,
    modelFromResolved,
    buildSequence,
    poiEvidence
  };
})();
