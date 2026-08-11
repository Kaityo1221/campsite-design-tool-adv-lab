(() => {
  'use strict';

  const DENSITY_RADIUS_M = 40;
  const DENSITY_MIN_POI = 6;
  const SUPPORT_RADIUS_M = 100;

  const map = L.map('map', { zoomControl: true }).setView([35.6812, 139.7671], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

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
    mina: document.getElementById('actorMina')
  };

  let points = [];
  let density = null;
  let sequence = [];
  let stepIndex = 0;

  const supportRegex = /(トイレ|便所|restroom|toilet|水飲|給水|water fountain|休憩|ベンチ|bench|東屋|あずまや|四阿|売店|カフェ|cafe|案内所|information)/i;
  const explicitAddedRegex = /(追加|希望|add|proposed|candidate)/i;

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

      result.push({
        id: `p${index + 1}`,
        lat,
        lng,
        name,
        folder,
        isAdded: explicitAddedRegex.test(folder),
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
    const candidates = Object.values(zip.files).filter(entry => !entry.dir && entry.name.toLowerCase().endsWith('.kml'));
    if (!candidates.length) throw new Error('KMZ内にKMLが見つかりません。');

    candidates.sort((a, b) => {
      const adoc = /(^|\/)doc\.kml$/i.test(a.name) ? 0 : 1;
      const bdoc = /(^|\/)doc\.kml$/i.test(b.name) ? 0 : 1;
      return adoc - bdoc;
    });
    return await candidates[0].async('text');
  }

  function candidatePoints(allPoints) {
    const explicit = allPoints.filter(p => p.isAdded);
    return explicit.length >= 2 ? explicit : allPoints;
  }

  function findBestDensity(allPoints) {
    const candidates = candidatePoints(allPoints);
    if (!candidates.length) return null;

    let best = null;
    candidates.forEach(center => {
      const members = candidates.filter(p => distanceMeters(center, p) <= DENSITY_RADIUS_M);
      if (!best || members.length > best.members.length) {
        best = { center, members };
      }
    });

    if (!best || best.members.length < DENSITY_MIN_POI) return null;

    const centroid = best.members.reduce((acc, p) => {
      acc.lat += p.lat;
      acc.lng += p.lng;
      return acc;
    }, { lat: 0, lng: 0 });
    centroid.lat /= best.members.length;
    centroid.lng /= best.members.length;

    const support = allPoints
      .filter(p => p.isSupport)
      .map(p => ({ ...p, distance: distanceMeters(centroid, p) }))
      .filter(p => p.distance <= SUPPORT_RADIUS_M)
      .sort((a, b) => a.distance - b.distance);

    return { ...best, centroid, support };
  }

  function drawAllPoints(allPoints) {
    poiLayer.clearLayers();
    highlightLayer.clearLayers();

    const bounds = [];
    allPoints.forEach(p => {
      const color = p.isSupport ? '#22c55e' : (p.isAdded ? '#f59e0b' : '#60a5fa');
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.isSupport ? 7 : 6,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: .72
      });
      marker.bindTooltip(`<strong>${escapeHtml(p.name)}</strong>${p.folder ? `<br>${escapeHtml(p.folder)}` : ''}`);
      marker.addTo(poiLayer);
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  }

  function focusDensity(result) {
    highlightLayer.clearLayers();
    if (!result) return;

    L.circle([result.centroid.lat, result.centroid.lng], {
      radius: DENSITY_RADIUS_M,
      color: '#ef4444',
      weight: 3,
      dashArray: '7 6',
      fillColor: '#f97316',
      fillOpacity: .16
    }).addTo(highlightLayer);

    result.members.forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 9,
        color: '#ef4444',
        weight: 3,
        fillColor: '#fb923c',
        fillOpacity: .9
      }).addTo(highlightLayer);
    });

    result.support.slice(0, 4).forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 10,
        color: '#16a34a',
        weight: 3,
        fillColor: '#4ade80',
        fillOpacity: .9
      }).bindTooltip(`支援候補: ${escapeHtml(p.name)} / 約${Math.round(p.distance)}m`).addTo(highlightLayer);
    });

    map.flyTo([result.centroid.lat, result.centroid.lng], 18, { duration: .9 });
  }

  function buildSequence(result) {
    if (!result) {
      return [
        { speaker: 'system', text: `半径${DENSITY_RADIUS_M}m以内に${DENSITY_MIN_POI}件以上集まる密集地点は見つかりませんでした。` },
        { speaker: 'riku', text: '少なくとも、この基準では極端な集中は見えない。次は動線を見たい。' },
        { speaker: 'mina', text: 'いい感じ！ でも、歩いて楽しいかも見てみたいね！' }
      ];
    }

    const base = [
      { speaker: 'system', text: `密集地点を検出しました。\n半径${DENSITY_RADIUS_M}m以内に ${result.members.length} POI あります。`, focus: true },
      { speaker: 'riku', text: 'ここに人が集中するな。\n長く留まれば、動線が詰まる可能性がある。' },
      { speaker: 'mina', text: 'でも、人が集まるってことはさ！\nそれだけ魅力があるってことじゃん！' }
    ];

    if (result.support.length) {
      const nearest = result.support[0];
      base.push(
        { speaker: 'riku', text: `条件は悪くない。\n約${Math.round(nearest.distance)}m先に「${nearest.name}」がある。立て直せる場所が近い。` },
        { speaker: 'mina', text: 'おおっ、ここなら休みながら遊べるね！' },
        { speaker: 'system', text: '軍議メモ：魅力は残しつつ、密集地点だけに滞留が固定されない設計を検討。' }
      );
    } else {
      base.push(
        { speaker: 'riku', text: '近くに休憩・支援候補も見当たらない。\nこの密集は少し分散させた方がいい。' },
        { speaker: 'mina', text: '魅力は残したいな。じゃあ、周りに少し広げよっか！' },
        { speaker: 'system', text: '軍議メモ：密集の魅力を残しながら、周辺への分散を検討。' }
      );
    }
    return base;
  }

  function renderFacts() {
    if (!points.length) {
      el.facts.innerHTML = '';
      return;
    }
    const candidates = candidatePoints(points);
    const explicit = points.filter(p => p.isAdded).length;
    const supportCount = points.filter(p => p.isSupport).length;
    const rows = [
      `読み込みPOI：${points.length}件`,
      explicit ? `追加POI候補：${explicit}件（フォルダ名から判定）` : `追加POIレイヤー判定なし：全POI ${candidates.length}件で仮解析`,
      `休憩・支援候補：${supportCount}件`,
      density ? `最大密集：${density.members.length}件 / ${DENSITY_RADIUS_M}m` : `最大密集：基準未満`
    ];
    el.facts.innerHTML = rows.map(x => `<div class="fact">${escapeHtml(x)}</div>`).join('');
  }

  function setActiveActor(speaker) {
    el.riku.classList.toggle('active', speaker === 'riku');
    el.mina.classList.toggle('active', speaker === 'mina');
  }

  function renderStep(index) {
    const step = sequence[index];
    if (!step) return;
    stepIndex = index;
    setActiveActor(step.speaker);
    el.speaker.textContent = step.speaker === 'riku' ? 'リク' : step.speaker === 'mina' ? 'ミナ' : 'SYSTEM';
    el.dialog.textContent = step.text;
    if (step.focus && density) focusDensity(density);
    el.next.disabled = index >= sequence.length - 1;
    el.restart.disabled = sequence.length === 0;
  }

  async function handleFile(file) {
    setStatus('KMZを解析しています…');
    el.next.disabled = true;
    el.restart.disabled = true;
    el.dialog.textContent = '地図を読み込んでいます。';
    setActiveActor('system');

    const kml = await readKmlFromFile(file);
    points = parseKml(kml);
    if (!points.length) throw new Error('Point形式のPOIを取得できませんでした。');

    drawAllPoints(points);
    density = findBestDensity(points);
    sequence = buildSequence(density);
    renderFacts();

    const explicit = points.filter(p => p.isAdded).length;
    const mode = explicit >= 2 ? `追加POIレイヤー ${explicit}件を解析` : '追加POIレイヤーを識別できなかったため全POIで仮解析';
    setStatus(`<strong class="ok">✓ ${escapeHtml(file.name)} を読み込みました。</strong><br>${escapeHtml(mode)}。ファイルはブラウザ内だけで処理し、外部へ送信しません。`);
    renderStep(0);
  }

  el.file.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await handleFile(file);
    } catch (error) {
      console.error(error);
      points = [];
      density = null;
      sequence = [];
      renderFacts();
      poiLayer.clearLayers();
      highlightLayer.clearLayers();
      setStatus(`<strong class="warn">⚠ ${escapeHtml(error.message || '読み込みに失敗しました。')}</strong>`);
      el.speaker.textContent = 'SYSTEM';
      el.dialog.textContent = '別のKMZ / KMLで試してください。';
      setActiveActor('system');
    }
  });

  el.next.addEventListener('click', () => {
    if (stepIndex < sequence.length - 1) renderStep(stepIndex + 1);
  });

  el.restart.addEventListener('click', () => {
    if (!sequence.length) return;
    if (density) focusDensity(density);
    renderStep(0);
  });
})();
