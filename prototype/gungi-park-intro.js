(() => {
  'use strict';

  const VERSION = '0.3.0';
  const VALID_CONFIDENCE = new Set(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
  const HIGHLIGHT_ICONS = {
    AQUARIUM: '🐧',
    FERRIS_WHEEL: '🎡',
    BIRD_SANCTUARY: '🦆',
    VIEWPOINT: '🔭',
    NATURE: '🌿',
    FEATURE: '✨'
  };

  const text = value => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return normalized || null;
  };

  const finiteNumber = value => {
    const candidate = Number(value);
    return Number.isFinite(candidate) ? candidate : null;
  };

  function pointFrom(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const lat = finiteNumber(raw.lat);
    const lon = finiteNumber(raw.lon ?? raw.lng);
    if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return {
      lat,
      lon,
      role: text(raw.role) || 'DISPLAY_POINT',
      confidence: VALID_CONFIDENCE.has(String(raw.confidence || '').toUpperCase()) ? String(raw.confidence).toUpperCase() : 'UNKNOWN',
      displayOnly: raw.display_only !== false,
      notIdentityEvidence: raw.not_identity_evidence !== false,
      source: raw.source || null
    };
  }

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
      target: { lat: 35.6420254, lon: 139.8606395 },
      adv: {
        schema_version: '0.3.0',
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
            park_area_m2: 816177.05,
            inside_park: true
          },
          narration_policy: {
            start_adv_with_park_description: true,
            allow_assertive_park_name: true,
            address_is_disambiguation_not_ownership: true,
            do_not_claim_manager_owner_permission_safety: true
          }
        },
        park_story: {
          event_id: 'PARK_STORY_01',
          status: 'READY',
          description: {
            text: '東京湾に面し、緑・水・人のふれあいをテーマに複数のゾーンが広がる大規模な臨海公園です。',
            confidence: 'HIGH',
            source: {
              provider: '東京都公園協会',
              source_title: '葛西臨海公園 公式案内',
              source_url: 'https://www.tokyo-park.or.jp/park/kasairinkai/index.html',
              source_date: '2026-09-03',
              source_authority_class: 'PARK_MANAGER_OFFICIAL'
            }
          },
          highlights: [
            {
              highlight_id: 'PARK_HIGHLIGHT_01',
              kind: 'AQUARIUM',
              title: '葛西臨海水族園',
              summary: '2,200トンのドーナツ型大水槽を泳ぐクロマグロや、国内最大級のペンギン展示場など、600種を超える世界の海の生き物を楽しめます。',
              confidence: 'HIGH',
              location: {
                lat: 35.640083,
                lon: 139.862167,
                geometry_type: 'POINT',
                role: 'DISPLAY_POINT',
                confidence: 'MEDIUM',
                review_status: 'VERIFIED',
                display_only: true,
                not_identity_evidence: true,
                source: {
                  provider: 'secondary coordinate cross-check',
                  source_title: '葛西臨海水族園 coordinate reference',
                  source_url: 'https://www.wikidata.org/wiki/Q1151559',
                  source_authority_class: 'SECONDARY_MAP'
                }
              },
              source: {
                provider: '東京都公園協会',
                source_title: '葛西臨海公園 施設について',
                source_url: 'https://www.tokyo-park.or.jp/park/kasairinkai/facility/index.html',
                source_date: '2026-09-03',
                source_authority_class: 'PARK_MANAGER_OFFICIAL'
              }
            },
            {
              highlight_id: 'PARK_HIGHLIGHT_02',
              kind: 'FERRIS_WHEEL',
              title: 'ダイヤと花の大観覧車',
              summary: '高さ117mの大観覧車。晴れた日には東京のランドマークや海側の景色を広く見渡せます。',
              confidence: 'HIGH',
              location: {
                lat: 35.6439793,
                lon: 139.8570808,
                geometry_type: 'POINT',
                role: 'DISPLAY_POINT',
                confidence: 'MEDIUM',
                review_status: 'VERIFIED',
                display_only: true,
                not_identity_evidence: true,
                source: {
                  provider: 'MapFan',
                  source_title: 'ダイヤと花の大観覧車 地図',
                  source_url: 'https://mapfan.com/spots/SC54Q%2CJ%2CRY',
                  source_authority_class: 'SECONDARY_MAP'
                }
              },
              source: {
                provider: '東京都公園協会',
                source_title: '葛西臨海公園 施設について',
                source_url: 'https://www.tokyo-park.or.jp/park/kasairinkai/facility/index.html',
                source_date: '2026-09-03',
                source_authority_class: 'PARK_MANAGER_OFFICIAL'
              }
            },
            {
              highlight_id: 'PARK_HIGHLIGHT_03',
              kind: 'BIRD_SANCTUARY',
              title: '鳥類園',
              summary: '二つの池や観察施設があり、野鳥などの自然観察ができるゾーンです。',
              confidence: 'HIGH',
              location: {
                lat: 35.6398294,
                lon: 139.8655679,
                geometry_type: 'POINT',
                role: 'DISPLAY_POINT',
                confidence: 'MEDIUM',
                review_status: 'VERIFIED',
                display_only: true,
                not_identity_evidence: true,
                source: {
                  provider: 'secondary coordinate cross-check',
                  source_title: '葛西臨海公園 鳥類園 coordinate reference',
                  source_url: 'https://zoopicker.com/en/places/109',
                  source_authority_class: 'SECONDARY_MAP'
                }
              },
              source: {
                provider: '東京都公園協会',
                source_title: '葛西臨海公園 公式案内',
                source_url: 'https://www.tokyo-park.or.jp/park/kasairinkai/index.html',
                source_date: '2026-09-03',
                source_authority_class: 'PARK_MANAGER_OFFICIAL'
              }
            }
          ],
          current_notices: [
            {
              notice_id: 'PARK_NOTICE_01',
              title: 'ペンギン展示の最新案内',
              summary: 'オウサマペンギンとミナミイワトビペンギンは展示休止中です。ペンギンの「エサの時間」ガイドは2026年9月15日まで中止予定です。',
              status: 'ACTIVE',
              as_of: '2026-08-18',
              valid_until: '2026-09-15',
              confidence: 'HIGH',
              source: {
                provider: '葛西臨海水族園',
                source_title: '展示休止やイベント中止などのお知らせ',
                source_url: 'https://www.tokyo-zoo.net/kasai/news/4184/index.html',
                source_date: '2026-08-18',
                source_authority_class: 'FACILITY_OFFICIAL'
              }
            }
          ],
          narration_policy: {
            authoritative_evidence_required: true,
            separate_evergreen_story_from_current_notices: true,
            do_not_infer_attractions_from_name_geometry_or_administration: true,
            current_notice_should_include_as_of_when_available: true,
            highlight_location_is_display_only: true,
            do_not_geocode_missing_highlight_location: true
          }
        },
        poi_category_summary: {
          total: 24,
          confidence_counts: { HIGH: 9, MEDIUM: 10, LOW: 3, UNKNOWN: 2 }
        },
        points: [],
        limitations: [
          'DEMO payload for visual preview only. It is not a live Campsite AI lookup.',
          'DEMO highlight coordinates are reviewed display points from secondary coordinate references and are not facility identity or boundary evidence.'
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
    const parkFocus = pointFrom(payload?.target);

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
      parkFocus,
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

  function storyFromResolved(resolved) {
    const payload = normalizePayload(resolved?.payload);
    const story = payload?.adv?.park_story;
    if (!story || typeof story !== 'object') return null;
    const descriptionText = text(story?.description?.text);
    const highlights = Array.isArray(story?.highlights)
      ? story.highlights.filter(item => item && text(item.title) && text(item.summary)).map(item => ({
          id: text(item.highlight_id),
          kind: text(item.kind) || 'FEATURE',
          title: text(item.title),
          summary: text(item.summary),
          confidence: VALID_CONFIDENCE.has(String(item.confidence || '').toUpperCase()) ? String(item.confidence).toUpperCase() : 'UNKNOWN',
          location: pointFrom(item.location),
          source: item.source || null
        }))
      : [];
    const notices = Array.isArray(story?.current_notices)
      ? story.current_notices.filter(item => item && ['ACTIVE', 'CURRENT'].includes(String(item.status || '').toUpperCase()) && text(item.title) && text(item.summary)).map(item => ({
          id: text(item.notice_id),
          title: text(item.title),
          summary: text(item.summary),
          asOf: text(item.as_of),
          validUntil: text(item.valid_until),
          confidence: VALID_CONFIDENCE.has(String(item.confidence || '').toUpperCase()) ? String(item.confidence).toUpperCase() : 'UNKNOWN',
          source: item.source || null
        }))
      : [];
    if (!descriptionText && !highlights.length && !notices.length) return null;
    return {
      status: text(story.status) || 'PARTIAL',
      description: descriptionText ? {
        text: descriptionText,
        confidence: VALID_CONFIDENCE.has(String(story?.description?.confidence || '').toUpperCase()) ? String(story.description.confidence).toUpperCase() : 'UNKNOWN',
        source: story?.description?.source || null
      } : null,
      highlights,
      notices
    };
  }

  function sourceLabel(source) {
    return text(source?.provider) || text(source?.source_title) || '公式情報';
  }

  function panel(base, overrides = {}) {
    return { ...base, ...overrides };
  }

  function mapFocus(location, title, icon, confidence) {
    if (!location) return null;
    return {
      kind: 'PARK_HIGHLIGHT',
      lat: location.lat,
      lon: location.lon,
      title,
      icon: icon || '✨',
      confidence: location.confidence || confidence || 'UNKNOWN',
      displayOnly: location.displayOnly !== false,
      notIdentityEvidence: location.notIdentityEvidence !== false,
      source: location.source || null
    };
  }

  function buildSequence(resolved) {
    const model = modelFromResolved(resolved);
    if (!model) return [];
    const story = storyFromResolved(resolved);

    const sourceSuffix = model.demo ? '\n※ 画面確認用DEMOデータ' : '';
    const systemText = `公園情報を読み込みました。\n${model.parkName}${model.displayAddress ? `\n${model.displayAddress}` : ''}${sourceSuffix}`;
    const rikuText = model.assertive
      ? `ここは${model.parkName}。\nまず、どんな場所なのか全体像を見てみよう。`
      : `${model.parkName}の候補情報がある。\n断定せず、公園全体の情報から順に確認しよう。`;
    const banner = `PARK INFO · ${model.confidence}${model.demo ? ' · DEMO' : ''}`;
    const parkCenterFocus = model.parkFocus ? {
      kind: 'PARK_CENTER',
      lat: model.parkFocus.lat,
      lon: model.parkFocus.lon,
      title: model.parkName,
      icon: '🌳',
      confidence: model.confidence,
      displayOnly: true,
      notIdentityEvidence: true
    } : null;
    const out = [
      { kind: 'park-intro', speaker: 'system', text: systemText, parkIntro: model, mapFocus: parkCenterFocus, rikuExpression: 'normal', banner },
      { kind: 'park-intro', speaker: 'riku', text: rikuText, parkIntro: model, mapFocus: parkCenterFocus, rikuExpression: 'normal', banner },
      { kind: 'park-intro', speaker: 'mina', text: 'どんな公園なんだろう？\n見どころも見てみたい！', parkIntro: model, mapFocus: parkCenterFocus, rikuExpression: 'normal', banner }
    ];

    if (story?.description) {
      const source = sourceLabel(story.description.source);
      out.push({
        kind: 'park-story',
        speaker: 'system',
        text: story.description.text,
        parkIntro: panel(model, {
          panelKind: 'PARK STORY',
          panelTitle: 'この公園について',
          panelSubtitle: model.parkName,
          panelEvidence: `${source} · ${story.description.confidence}`
        }),
        mapFocus: parkCenterFocus,
        rikuExpression: 'curious',
        banner: `PARK STORY · ${story.description.confidence}${model.demo ? ' · DEMO' : ''}`
      });
    }

    (story?.highlights || []).forEach((item, index) => {
      const icon = HIGHLIGHT_ICONS[item.kind] || HIGHLIGHT_ICONS.FEATURE;
      const source = sourceLabel(item.source);
      const focus = mapFocus(item.location, item.title, icon, item.confidence);
      out.push({
        kind: 'park-highlight',
        speaker: index % 2 === 0 ? 'mina' : 'riku',
        text: `${item.title}。\n${item.summary}`,
        parkIntro: panel(model, {
          panelKind: `PARK HIGHLIGHT ${index + 1}`,
          panelTitle: `${icon} ${item.title}`,
          panelSubtitle: focus ? '地図上の見どころを表示中' : model.parkName,
          panelEvidence: `${source} · ${item.confidence}${focus ? ` · MAP ${focus.confidence}` : ' · MAP位置なし'}`
        }),
        mapFocus: focus,
        rikuExpression: index % 2 === 0 ? 'curious' : 'normal',
        banner: `PARK HIGHLIGHT ${index + 1}/${story.highlights.length} · ${item.confidence}${model.demo ? ' · DEMO' : ''}`
      });
    });

    (story?.notices || []).forEach(item => {
      const source = sourceLabel(item.source);
      const asOf = item.asOf ? ` · ${item.asOf}時点` : '';
      out.push({
        kind: 'park-notice',
        speaker: 'system',
        text: `${item.title}\n${item.summary}${asOf}\n※ 現在情報は公式案内も確認してください。`,
        parkIntro: panel(model, {
          panelKind: 'CURRENT NOTICE',
          panelTitle: `📢 ${item.title}`,
          panelSubtitle: item.asOf ? `${item.asOf}時点` : model.parkName,
          panelEvidence: `${source} · ${item.confidence}`
        }),
        mapFocus: parkCenterFocus,
        rikuExpression: 'normal',
        banner: `PARK NOTICE · ${item.confidence}${model.demo ? ' · DEMO' : ''}`
      });
    });

    if (story) {
      out.push(
        { kind: 'park-story-end', speaker: 'riku', text: '公園の特徴はつかめた。\n次は、この舞台の中でPOIがどう配置されているか見よう。', parkIntro: model, restorePoiMap: true, rikuExpression: 'normal', banner },
        { kind: 'park-story-end', speaker: 'mina', text: 'よーし！\nここからPOIを見ながら歩き方を考えていこう！', parkIntro: model, restorePoiMap: true, rikuExpression: 'normal', banner }
      );
    } else {
      out.push({ kind: 'park-intro', speaker: 'mina', text: '公園紹介の公式データはまだ少ないみたい。\nじゃあ、分かっているPOIから見ていこう！', parkIntro: model, restorePoiMap: true, rikuExpression: 'normal', banner });
    }

    return out;
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
    storyFromResolved,
    buildSequence,
    poiEvidence
  };
})();
