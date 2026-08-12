(() => {
  'use strict';

  const DISTANCE_LIMIT_M = 40;
  const DENSE_LIMIT_M = 20;
  const STAY_LIMIT_M = 30;
  const CONTEXT_RADIUS_M = 100;
  const CONTEXT_MIN_EXISTING = 6;
  const SUPPORT_RADIUS_M = 100;

  const map = L.map('map', { zoomControl: true }).setView([35.6812, 139.7671], 13);

  const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileOptions = {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors'
  };

  const isIOSWebKit = /iP(?:ad|hone|od)/.test(navigator.userAgent);
  let baseMapLayer;

  if (isIOSWebKit) {
    const CanvasTileLayer = L.TileLayer.extend({
      createTile(coords, done) {
        const overlap = 2;
        const tileSize = this.getTileSize();
        const canvas = document.createElement('canvas');
        const width = tileSize.x + overlap * 2;
        const height = tileSize.y + overlap * 2;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.marginLeft = `-${overlap}px`;
        canvas.style.marginTop = `-${overlap}px`;
        canvas.style.border = '0';
        canvas.style.outline = '0';

        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#e8eef2';
        ctx.fillRect(0, 0, width, height);

        const img = new Image();
        img.onload = () => {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, overlap, overlap, tileSize.x, tileSize.y);

          ctx.drawImage(img, 0, 0, 1, tileSize.y, 0, overlap, overlap, tileSize.y);
          ctx.drawImage(img, tileSize.x - 1, 0, 1, tileSize.y, overlap + tileSize.x, overlap, overlap, tileSize.y);
          ctx.drawImage(img, 0, 0, tileSize.x, 1, overlap, 0, tileSize.x, overlap);
          ctx.drawImage(img, 0, tileSize.y - 1, tileSize.x, 1, overlap, overlap + tileSize.y, tileSize.x, overlap);

          ctx.drawImage(img, 0, 0, 1, 1, 0, 0, overlap, overlap);
          ctx.drawImage(img, tileSize.x - 1, 0, 1, 1, overlap + tileSize.x, 0, overlap, overlap);
          ctx.drawImage(img, 0, tileSize.y - 1, 1, 1, 0, overlap + tileSize.y, overlap, overlap);
          ctx.drawImage(img, tileSize.x - 1, tileSize.y - 1, 1, 1, overlap + tileSize.x, overlap + tileSize.y, overlap, overlap);

          done(null, canvas);
        };
        img.onerror = error => done(error, canvas);
        img.src = this.getTileUrl(coords);
        return canvas;
      },

      _initTile(tile) {
        L.GridLayer.prototype._initTile.call(this, tile);
        const overlap = 2;
        const tileSize = this.getTileSize();
        tile.style.width = `${tileSize.x + overlap * 2}px`;
        tile.style.height = `${tileSize.y + overlap * 2}px`;
        tile.style.marginLeft = `-${overlap}px`;
        tile.style.marginTop = `-${overlap}px`;
      }
    });

    baseMapLayer = new CanvasTileLayer(OSM_URL, tileOptions);
  } else {
    baseMapLayer = L.tileLayer(OSM_URL, tileOptions);
  }

  baseMapLayer.addTo(map);

  const poiLayer = L.layerGroup().addTo(map);
  const highlightLayer = L.layerGroup().addTo(map);

  const el = {
    file: document.getElementById('kmzFile'),
    status: document.getElementById('status'),
    facts: document.getElementById('facts'),
    speaker: document.getElementById('speaker'),
    dialog: document.getElementById('dialogText'),
    next: document.getElementById('nextBtn'),
    restart: document.getElementById('restartBtn'),
    riku: document.getElementById('actorRiku'),
    mina: document.getElementById('actorMina'),
    scene: document.getElementById('strategyScene')
  };

  const controls = el.next?.parentElement;
  const backBtn = document.createElement('button');
  backBtn.id = 'backBtn';
  backBtn.type = 'button';
  backBtn.textContent = '◀ 戻る';
  backBtn.disabled = true;
  controls?.insertBefore(backBtn, el.next);
  el.next.textContent = '次へ ▶';

  const desktopNav = document.createElement('div');
  desktopNav.className = 'desktop-hover-nav';
  const desktopBackBtn = document.createElement('button');
  desktopBackBtn.type = 'button';
  desktopBackBtn.className = 'desktop-nav-btn desktop-nav-back';
  desktopBackBtn.setAttribute('aria-label', '前の会話へ戻る');
  desktopBackBtn.textContent = '‹';
  desktopBackBtn.disabled = true;
  const desktopNextBtn = document.createElement('button');
  desktopNextBtn.type = 'button';
  desktopNextBtn.className = 'desktop-nav-btn desktop-nav-next';
  desktopNextBtn.setAttribute('aria-label', '次の会話へ進む');
  desktopNextBtn.textContent = '›';
  desktopNextBtn.disabled = true;
  desktopNav.append(desktopBackBtn, desktopNextBtn);
  el.scene?.appendChild(desktopNav);

  const mobileGate = document.createElement('div');
  mobileGate.className = 'mobile-focus-gate';
  mobileGate.innerHTML = `
    <div class="mobile-focus-card">
      <div class="mobile-focus-title">🎬 作戦会議を開始</div>
      <div class="mobile-focus-copy">スマホでは集中モードで表示します。<br>横画面にすると会話が読みやすくなります。</div>
      <button type="button" class="mobile-focus-start">集中モードで開始</button>
    </div>`;
  el.scene?.appendChild(mobileGate);
  const mobileStartBtn = mobileGate.querySelector('.mobile-focus-start');

  const style = document.createElement('style');
  style.textContent = `
    .strategy-scene[data-speaker="mina"] .dialog-text{
      left:55%!important;
      right:13%!important;
      text-align:left!important;
      margin-left:auto;
    }

    .controls #backBtn{background:#17263a;color:#dbeafe;border:1px solid rgba(148,163,184,.25)}

    .desktop-hover-nav{display:none}

    .mobile-focus-gate{
      display:none;
      position:absolute;
      inset:0;
      z-index:28;
      align-items:center;
      justify-content:center;
      padding:18px;
      background:rgba(2,8,18,.46);
      backdrop-filter:blur(3px);
    }
    .mobile-focus-card{
      width:min(88%,420px);
      padding:18px 16px;
      border-radius:18px;
      background:rgba(7,17,30,.94);
      border:1px solid rgba(125,211,252,.34);
      box-shadow:0 18px 54px rgba(0,0,0,.48);
      text-align:center;
      color:#e5eef7;
    }
    .mobile-focus-title{font-size:18px;font-weight:900;margin-bottom:8px}
    .mobile-focus-copy{font-size:12px;line-height:1.6;color:#b8c7d8;margin-bottom:14px}
    .mobile-focus-start{
      width:100%;
      border:0;
      border-radius:999px;
      padding:12px 16px;
      font-weight:900;
      color:#102033;
      background:linear-gradient(135deg,#dbeafe,#bfdbfe);
      box-shadow:0 8px 24px rgba(0,0,0,.28);
      cursor:pointer;
    }
    body.mobile-adv-gated:not(.focus-mode) .mobile-focus-gate{display:flex}
    body.mobile-adv-gated:not(.focus-mode) .controls #backBtn,
    body.mobile-adv-gated:not(.focus-mode) .controls #nextBtn{display:none!important}
    body.focus-mode .mobile-focus-gate{display:none!important}

    @media (hover:hover) and (pointer:fine) and (min-width:761px){
      body:not(.focus-mode) .controls #backBtn,
      body:not(.focus-mode) .controls #nextBtn{display:none}

      body:not(.focus-mode) .desktop-hover-nav{
        display:block;
        position:absolute;
        inset:0;
        z-index:26;
        pointer-events:none;
        opacity:0;
        transition:opacity .18s ease;
      }

      body:not(.focus-mode) .strategy-scene:hover .desktop-hover-nav,
      body:not(.focus-mode) .desktop-hover-nav:focus-within{
        opacity:1;
      }

      body:not(.focus-mode) .desktop-nav-btn{
        position:absolute;
        top:58%;
        transform:translateY(-50%);
        width:52px;
        height:82px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.28);
        background:rgba(4,12,22,.58);
        color:#fff;
        font-size:48px;
        font-weight:300;
        line-height:1;
        cursor:pointer;
        pointer-events:auto;
        backdrop-filter:blur(12px);
        box-shadow:0 10px 28px rgba(0,0,0,.32);
        transition:background .16s ease,transform .16s ease,opacity .16s ease;
      }

      body:not(.focus-mode) .desktop-nav-btn:hover{
        background:rgba(13,34,56,.88);
        transform:translateY(-50%) scale(1.04);
      }

      body:not(.focus-mode) .desktop-nav-btn:disabled{
        opacity:.18;
        cursor:default;
        transform:translateY(-50%);
      }

      body:not(.focus-mode) .desktop-nav-back{left:18px}
      body:not(.focus-mode) .desktop-nav-next{right:18px}
    }

    body.focus-mode .desktop-hover-nav{display:none!important}

    body.focus-mode .controls{
      left:50%!important;
      right:auto!important;
      bottom:calc(env(safe-area-inset-bottom) + 18px)!important;
      transform:translateX(-50%);
      gap:12px!important;
    }
    body.focus-mode .controls #backBtn,
    body.focus-mode .controls #nextBtn{
      display:block!important;
      min-width:132px!important;
      padding:13px 22px!important;
      border-radius:999px!important;
      font-size:15px!important;
      font-weight:900!important;
      box-shadow:0 8px 28px rgba(0,0,0,.45)!important;
      backdrop-filter:blur(12px);
    }
    body.focus-mode .controls #backBtn{
      background:rgba(15,23,42,.88)!important;
      color:#f8fafc!important;
      border:1px solid rgba(255,255,255,.32)!important;
    }
    body.focus-mode .controls #nextBtn{
      background:rgba(239,246,255,.96)!important;
      color:#0f172a!important;
      border:2px solid rgba(255,255,255,.85)!important;
    }
    body.focus-mode .controls #restartBtn{display:none!important}
    body.focus-mode.focus-ui-hidden .controls{opacity:.18!important;pointer-events:auto!important}
  `;
  document.head.appendChild(style);

  let points = [];
  let analysis = null;
  let sequence = [];
  let stepIndex = 0;

  const isMobileADV = () => window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const focusModeActive = () => document.body.classList.contains('focus-mode');
  const showMobileGate = () => {
    if (!isMobileADV() || !sequence.length || focusModeActive()) return false;
    document.body.classList.add('mobile-adv-gated');
    return true;
  };
  const clearMobileGate = () => document.body.classList.remove('mobile-adv-gated');

  mobileStartBtn?.addEventListener('click', () => {
    clearMobileGate();
    const focusBtn = document.getElementById('focusBtn');
    focusBtn?.click();
  });

  const supportRegex = /(トイレ|便所|restroom|toilet|水飲|給水|water fountain|休憩|ベンチ|bench|東屋|あずまや|四阿|売店|カフェ|cafe|案内所|information)/i;
  const addedRegex = /(追加|追加希望|希望|新規|候補|add|addition|proposed|candidate|new|cagym|capokestop|capowerspot)/i;
  const existingRegex = /(既存|existing|current)/i;
  const auxiliaryRegex = /(40m|30m|円|buffer|100ft|100feet|100フィート|ダミー)/i;

  function setStatus(html) {
    el.status.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const q = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
  }

  function directChildText(node, tagName) {
    const children = Array.from(node.children || []);
    const target = children.find(child => child.localName === tagName || child.tagName === tagName);
    return target ? (target.textContent || '').trim() : '';
  }

  function nearestFolderName(placemark) {
    let node = placemark.parentElement;
    const names = [];
    while (node) {
      if (node.localName === 'Folder' || node.tagName === 'Folder') {
        const name = directChildText(node, 'name');
        if (name) names.unshift(name);
      }
      node = node.parentElement;
    }
    return names.join(' / ');
  }

  function parseKml(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    const parseError = xml.querySelector('parsererror');
    if (parseError) throw new Error('KMLを解析できませんでした。');

    const placemarks = Array.from(xml.getElementsByTagNameNS('*', 'Placemark'));
    const result = [];

    placemarks.forEach((placemark, index) => {
      const point = placemark.getElementsByTagNameNS('*', 'Point')[0];
      if (!point) return;
      const coordinates = point.getElementsByTagNameNS('*', 'coordinates')[0];
      if (!coordinates) return;
      const first = (coordinates.textContent || '').trim().split(/\s+/)[0];
      const [lngRaw, latRaw] = first.split(',');
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const nameNode = placemark.getElementsByTagNameNS('*', 'name')[0];
      const name = (nameNode?.textContent || `POI ${index + 1}`).trim();
      const folder = nearestFolderName(placemark);
      const sourceText = `${folder} ${name}`;
      const isAuxiliary = auxiliaryRegex.test(folder);
      const isAdded = !isAuxiliary && addedRegex.test(folder);
      const isExisting = !isAuxiliary && existingRegex.test(folder);

      result.push({
        id: `p${index + 1}`,
        lat,
        lng,
        name,
        folder,
        isAdded,
        isExisting,
        isTarget: isAdded || isExisting,
        isSupport: supportRegex.test(sourceText)
      });
    });

    return result;
  }

  async function readKmlFromFile(file) {
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.kml')) return await file.text();
    if (!lower.endsWith('.kmz')) throw new Error('KMZまたはKMLを選択してください。');

    const zip = await JSZip.loadAsync(file);
    const candidates = Object.values(zip.files)
      .filter(entry => !entry.dir && entry.name.toLowerCase().endsWith('.kml'));

    if (!candidates.length) throw new Error('KMZ内にKMLが見つかりません。');

    candidates.sort((a, b) => {
      const adoc = /(^|\/)doc\.kml$/i.test(a.name) ? 0 : 1;
      const bdoc = /(^|\/)doc\.kml$/i.test(b.name) ? 0 : 1;
      return adoc - bdoc;
    });

    return await candidates[0].async('text');
  }

  function classifyRisk(distance) {
    if (distance < DENSE_LIMIT_M) return '密集';
    if (distance < STAY_LIMIT_M) return '滞留';
    if (distance < DISTANCE_LIMIT_M) return '軽微';
    return null;
  }

  function getTargetPoints(allPoints) {
    return allPoints.filter(p => p.isTarget);
  }

  function findDistanceWarnings(allPoints) {
    const target = getTargetPoints(allPoints);
    const warnings = [];

    for (let i = 0; i < target.length; i++) {
      for (let j = i + 1; j < target.length; j++) {
        const a = target[i];
        const b = target[j];
        const distance = distanceMeters(a, b);
        if (distance >= DISTANCE_LIMIT_M) continue;
        warnings.push({
          a,
          b,
          distance,
          type: classifyRisk(distance),
          referenceOnly: a.isExisting && b.isExisting
        });
      }
    }

    warnings.sort((a, b) => a.distance - b.distance);
    return {
      all: warnings,
      active: warnings.filter(w => !w.referenceOnly),
      reference: warnings.filter(w => w.referenceOnly)
    };
  }

  function findContextHotspot(allPoints) {
    const added = allPoints.filter(p => p.isAdded);
    const existing = allPoints.filter(p => p.isExisting);
    if (!added.length || !existing.length) return null;

    let best = null;
    added.forEach(center => {
      const nearbyExisting = existing
        .map(p => ({ ...p, distance: distanceMeters(center, p) }))
        .filter(p => p.distance <= CONTEXT_RADIUS_M)
        .sort((a, b) => a.distance - b.distance);

      if (!best || nearbyExisting.length > best.nearbyExisting.length) {
        best = { center, nearbyExisting };
      }
    });

    if (!best || best.nearbyExisting.length < CONTEXT_MIN_EXISTING) return null;

    const support = allPoints
      .filter(p => p.isSupport && p.id !== best.center.id)
      .map(p => ({ ...p, distance: distanceMeters(best.center, p) }))
      .filter(p => p.distance <= SUPPORT_RADIUS_M)
      .sort((a, b) => a.distance - b.distance);

    return { ...best, support };
  }

  function analyze(allPoints) {
    const distanceWarnings = findDistanceWarnings(allPoints);
    const contextHotspot = findContextHotspot(allPoints);
    return { distanceWarnings, contextHotspot };
  }

  function drawAllPoints(allPoints) {
    poiLayer.clearLayers();
    highlightLayer.clearLayers();

    const bounds = [];
    allPoints.forEach(p => {
      const color = p.isAdded ? '#f59e0b' : (p.isExisting ? '#60a5fa' : (p.isSupport ? '#22c55e' : '#64748b'));
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.isAdded ? 7 : 5,
        color,
        weight: p.isAdded ? 3 : 2,
        fillColor: color,
        fillOpacity: p.isTarget ? .76 : .35
      });
      marker.bindTooltip(`<strong>${escapeHtml(p.name)}</strong>${p.folder ? `<br>${escapeHtml(p.folder)}` : ''}`);
      marker.addTo(poiLayer);
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  }

  function focusWarning(warning) {
    highlightLayer.clearLayers();
    if (!warning) return;

    [warning.a, warning.b].forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 11,
        color: '#ef4444',
        weight: 4,
        fillColor: '#fb923c',
        fillOpacity: .92
      }).addTo(highlightLayer);
    });

    L.polyline([[warning.a.lat, warning.a.lng], [warning.b.lat, warning.b.lng]], {
      color: '#ef4444',
      weight: 4,
      dashArray: '8 6'
    }).bindTooltip(`${warning.distance.toFixed(1)}m / ${warning.type}`).addTo(highlightLayer);

    map.fitBounds([[warning.a.lat, warning.a.lng], [warning.b.lat, warning.b.lng]], {
      padding: [90, 90],
      maxZoom: 19
    });
  }

  function focusContext(context) {
    highlightLayer.clearLayers();
    if (!context) return;

    L.circle([context.center.lat, context.center.lng], {
      radius: CONTEXT_RADIUS_M,
      color: '#f97316',
      weight: 3,
      dashArray: '8 6',
      fillColor: '#fb923c',
      fillOpacity: .12
    }).addTo(highlightLayer);

    L.circleMarker([context.center.lat, context.center.lng], {
      radius: 12,
      color: '#f59e0b',
      weight: 4,
      fillColor: '#fbbf24',
      fillOpacity: .96
    }).bindTooltip(`追加POI: ${escapeHtml(context.center.name)}`).addTo(highlightLayer);

    context.nearbyExisting.forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 8,
        color: '#2563eb',
        weight: 2,
        fillColor: '#60a5fa',
        fillOpacity: .86
      }).addTo(highlightLayer);
    });

    context.support.slice(0, 4).forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 10,
        color: '#16a34a',
        weight: 3,
        fillColor: '#4ade80',
        fillOpacity: .92
      }).bindTooltip(`支援候補: ${escapeHtml(p.name)} / 約${Math.round(p.distance)}m`).addTo(highlightLayer);
    });

    map.flyTo([context.center.lat, context.center.lng], 17, { duration: .9 });
  }

  function buildWarningSequence(warning) {
    const d = warning.distance;
    const rounded = d.toFixed(1);
    let rikuText = '';
    let minaText = '';

    if (d < DENSE_LIMIT_M) {
      rikuText = `ここは ${rounded}m。かなり近い。\nまず配置を調整した方がいい。`;
      minaText = '魅力は残したいけど、ここは少し離した方が良さそうだね。';
    } else if (d < STAY_LIMIT_M) {
      rikuText = `ここは ${rounded}m。30mを切っている。\n滞留の影響を強く見たい。`;
      minaText = 'じゃあ、どっちかを少し動かして使いやすくしよ！';
    } else {
      rikuText = `ここは ${rounded}m。40mには届いていない。\nただし、調整候補として扱える距離だ。`;
      minaText = 'あとちょっとなら、雰囲気を壊さず調整できそう！';
    }

    return [
      {
        speaker: 'system',
        text: `追加POIに関係する距離注意を検出しました。\n${warning.a.name} × ${warning.b.name}：${rounded}m（${warning.type}）`,
        focus: 'warning'
      },
      { speaker: 'riku', text: rikuText },
      { speaker: 'mina', text: minaText },
      { speaker: 'system', text: '軍議メモ：距離条件を優先しつつ、場所の魅力を失わない調整案を検討。' }
    ];
  }

  function buildContextSequence(context, referenceCount) {
    const count = context.nearbyExisting.length;
    const base = [
      {
        speaker: 'system',
        text: `追加POIに関係する40m未満の要調整はありません。\nただし、周辺密度が高い傾向にあります。`,
        focus: 'context'
      },
      {
        speaker: 'riku',
        text: `距離条件は守れている。\nただ、この追加地点の100m以内には既存POIが ${count}件ある。人が集まりやすい場所だ。`
      },
      {
        speaker: 'mina',
        text: 'それって、人気の中心になりそうってことじゃん！\nにぎわいを作れる場所かも！'
      }
    ];

    if (context.support.length) {
      const nearest = context.support[0];
      base.push(
        {
          speaker: 'riku',
          text: `さらに、約${Math.round(nearest.distance)}m先に「${nearest.name}」。\n休憩・支援候補として拾える。条件は悪くない。`
        },
        { speaker: 'mina', text: 'おおっ、ここなら休みながら遊べそうだね！' }
      );
    }

    base.push({
      speaker: 'system',
      text: `軍議メモ：距離判定は良好。周辺の既存密度は「設計ミス」ではなく参考情報として扱う。\n既存POI同士の40m未満：${referenceCount}件（参考）`
    });

    return base;
  }

  function buildCleanSequence(referenceCount) {
    return [
      {
        speaker: 'system',
        text: '追加POIに関係する40m未満の要調整はありません。'
      },
      {
        speaker: 'riku',
        text: '距離条件はよく整理されている。\nこの段階で無理に触る必要はない。'
      },
      {
        speaker: 'mina',
        text: 'よしっ！ 次は「歩いて楽しいか」を見てみよう！'
      },
      {
        speaker: 'system',
        text: `軍議メモ：距離チェックは良好。既存POI同士の40m未満 ${referenceCount}件は参考表示のみ。`
      }
    ];
  }

  function buildSequence(result) {
    const active = result.distanceWarnings.active;
    const referenceCount = result.distanceWarnings.reference.length;

    if (active.length) return buildWarningSequence(active[0]);
    if (result.contextHotspot) return buildContextSequence(result.contextHotspot, referenceCount);
    return buildCleanSequence(referenceCount);
  }

  function renderFacts() {
    if (!points.length || !analysis) {
      el.facts.innerHTML = '';
      return;
    }

    const target = getTargetPoints(points);
    const existing = points.filter(p => p.isExisting).length;
    const added = points.filter(p => p.isAdded).length;
    const activeWarnings = analysis.distanceWarnings.active.length;
    const referenceWarnings = analysis.distanceWarnings.reference.length;
    const context = analysis.contextHotspot;

    const rows = [
      `読み込みPoint：${points.length}件`,
      `距離判定対象：${target.length}件（既存 ${existing} / 追加 ${added}）`,
      `追加POI関連の40m未満：${activeWarnings}件`,
      `既存POI同士の40m未満：${referenceWarnings}件（参考）`,
      context
        ? `最大周辺密度：追加POIの100m以内に既存 ${context.nearbyExisting.length}件`
        : `最大周辺密度：軍議発火基準（既存${CONTEXT_MIN_EXISTING}件 / 100m）未満`
    ];

    el.facts.innerHTML = rows.map(x => `<div class="fact">${escapeHtml(x)}</div>`).join('');
  }

  function setActiveActor(speaker) {
    el.riku.classList.toggle('active', speaker === 'riku');
    el.mina.classList.toggle('active', speaker === 'mina');
  }

  function syncNavButtons(index) {
    const atStart = index <= 0;
    const atEnd = index >= sequence.length - 1;
    backBtn.disabled = atStart;
    el.next.disabled = atEnd;
    desktopBackBtn.disabled = atStart;
    desktopNextBtn.disabled = atEnd;
  }

  function renderStep(index) {
    const step = sequence[index];
    if (!step) return;
    stepIndex = index;
    setActiveActor(step.speaker);
    el.speaker.textContent = step.speaker === 'riku' ? 'リク' : step.speaker === 'mina' ? 'ミナ' : 'SYSTEM';
    el.dialog.textContent = step.text;

    if (step.focus === 'warning') focusWarning(analysis?.distanceWarnings?.active?.[0]);
    if (step.focus === 'context') focusContext(analysis?.contextHotspot);

    syncNavButtons(index);
    el.restart.disabled = sequence.length === 0;
  }

  async function handleFile(file) {
    clearMobileGate();
    setStatus('KMZを解析しています…');
    backBtn.disabled = true;
    desktopBackBtn.disabled = true;
    el.next.disabled = true;
    desktopNextBtn.disabled = true;
    el.restart.disabled = true;
    el.dialog.textContent = '地図を読み込んでいます。';
    setActiveActor('system');

    const kml = await readKmlFromFile(file);
    points = parseKml(kml);
    if (!points.length) throw new Error('Point形式のPOIを取得できませんでした。');

    drawAllPoints(points);
    analysis = analyze(points);
    sequence = buildSequence(analysis);
    renderFacts();

    const added = points.filter(p => p.isAdded).length;
    const existing = points.filter(p => p.isExisting).length;
    const activeWarnings = analysis.distanceWarnings.active.length;

    setStatus(
      `<strong class="ok">✓ ${escapeHtml(file.name)} を読み込みました。</strong><br>` +
      `既存 ${existing}件 / 追加 ${added}件。追加POI関連の40m未満：${activeWarnings}件。` +
      ' ファイルはブラウザ内だけで処理し、外部へ送信しません。'
    );

    renderStep(0);
    showMobileGate();
  }

  el.file.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await handleFile(file);
    } catch (error) {
      console.error(error);
      clearMobileGate();
      points = [];
      analysis = null;
      sequence = [];
      renderFacts();
      poiLayer.clearLayers();
      highlightLayer.clearLayers();
      setStatus(`<strong class="warn">⚠ ${escapeHtml(error.message || '読み込みに失敗しました。')}</strong>`);
      el.speaker.textContent = 'SYSTEM';
      el.dialog.textContent = '別のKMZ / KMLで試してください。';
      setActiveActor('system');
      backBtn.disabled = true;
      desktopBackBtn.disabled = true;
      desktopNextBtn.disabled = true;
    }
  });

  const goBack = () => {
    if (showMobileGate()) return;
    if (stepIndex > 0) renderStep(stepIndex - 1);
  };

  const goNext = () => {
    if (showMobileGate()) return;
    if (stepIndex < sequence.length - 1) renderStep(stepIndex + 1);
  };

  backBtn.addEventListener('click', goBack);
  desktopBackBtn.addEventListener('click', goBack);
  el.next.addEventListener('click', goNext);
  desktopNextBtn.addEventListener('click', goNext);

  el.restart.addEventListener('click', () => {
    if (!sequence.length) return;
    if (showMobileGate()) return;
    drawAllPoints(points);
    renderStep(0);
  });

  document.addEventListener('fullscreenchange', () => {
    if (!focusModeActive() && isMobileADV() && sequence.length) showMobileGate();
  });
})();