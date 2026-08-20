/* ======================================================
   Final KMZ circle output fix
   - New KMZ: always 50m, plus only selected 40m/30m
   - Every real POI type (Pokestop/Gym/Power Spot) gets circles
   - Completed KMZ: preserve exactly the circle radii it already has
====================================================== */
(() => {
  'use strict';

  const KML_NS = 'http://www.opengis.net/kml/2.2';
  const WRAPPED = '__poiCircleOutputFixWrapped';
  const KNOWN_RADII = [50, 40, 30];

  const localName = node => String(node?.localName || node?.tagName || '').toLowerCase();

  function directChildText(element, tagName) {
    const target = String(tagName || '').toLowerCase();
    const child = Array.from(element?.children || []).find(node => localName(node) === target);
    return child?.textContent?.trim() || '';
  }

  function parseXml(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    if (xml.getElementsByTagName('parsererror').length) {
      throw new Error('KMLの解析に失敗しました');
    }
    return xml;
  }

  function folderRadius(folder) {
    const name = directChildText(folder, 'name');
    if (!name.includes('円')) return null;
    const match = name.match(/(?:^|[^0-9])(50|40|30)m/i);
    return match ? Number(match[1]) : null;
  }

  function knownRadiiInXml(xml) {
    const found = new Set();
    Array.from(xml.getElementsByTagName('Folder')).forEach(folder => {
      const radius = folderRadius(folder);
      if (radius) found.add(radius);
    });
    return found;
  }

  async function readKmlFromFile(file) {
    if (!file) return null;
    const name = String(file.name || '').toLowerCase();

    if (name.endsWith('.kml')) {
      return file.text();
    }

    if (name.endsWith('.kmz') || name.endsWith('.zip')) {
      if (!window.JSZip) return null;
      const zip = await window.JSZip.loadAsync(file);
      const kmlName = Object.keys(zip.files).find(key =>
        key.toLowerCase().endsWith('.kml') && !zip.files[key].dir
      );
      return kmlName ? zip.files[kmlName].async('text') : null;
    }

    return null;
  }

  async function inspectSourceRadii(inputId) {
    const files = Array.from(document.getElementById(inputId)?.files || []);
    if (files.length !== 1) return new Set();

    try {
      const text = await readKmlFromFile(files[0]);
      if (!text) return new Set();
      return knownRadiiInXml(parseXml(text));
    } catch (error) {
      console.warn('既存円の確認をスキップしました。', error);
      return new Set();
    }
  }

  function selectedRadii(groupName) {
    const set = new Set();
    document.querySelectorAll(`input[name="${groupName}"]:checked`).forEach(input => {
      const radius = Number(input.value);
      if (KNOWN_RADII.includes(radius)) set.add(radius);
    });
    return set;
  }

  function parentFolderName(element) {
    let current = element?.parentElement || null;
    while (current) {
      if (localName(current) === 'folder') return directChildText(current, 'name');
      current = current.parentElement;
    }
    return '';
  }

  function parseCoordinate(text) {
    const [lngRaw, latRaw] = String(text || '').trim().split(',');
    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }

  function centerKey(point) {
    return `${point.lat.toFixed(7)},${point.lng.toFixed(7)}`;
  }

  function collectPointCenters(xml) {
    const centers = [];
    const seen = new Set();

    Array.from(xml.getElementsByTagName('Placemark')).forEach(placemark => {
      const point = placemark.getElementsByTagName('Point')[0];
      if (!point) return;
      if (/円|30m|40m|50m/i.test(parentFolderName(placemark))) return;

      const name = directChildText(placemark, 'name');
      const description = directChildText(placemark, 'description');
      if (name.startsWith('ここに追加') || /ダミーポイント|レイヤー保持用/.test(description)) return;

      const coordinateText = point.getElementsByTagName('coordinates')[0]?.textContent || '';
      const center = parseCoordinate(coordinateText.trim().split(/\s+/)[0]);
      if (!center) return;

      const key = centerKey(center);
      if (seen.has(key)) return;
      seen.add(key);
      centers.push({ ...center, name: name || 'POI' });
    });

    return centers;
  }

  function polygonCenter(placemark) {
    const text = placemark.getElementsByTagName('Polygon')[0]
      ?.getElementsByTagName('coordinates')[0]?.textContent || '';
    const points = text.trim().split(/\s+/).map(parseCoordinate).filter(Boolean);
    if (points.length < 3) return null;

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });
    if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) return null;
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }

  function findFolders(xml, radius) {
    return Array.from(xml.getElementsByTagName('Folder')).filter(folder => folderRadius(folder) === radius);
  }

  function labelFor(radius) {
    return radius === 50 ? '50m円（目安）' : `${radius}m円（参考距離）`;
  }

  function createFolder(xml, documentNode, radius) {
    const folder = xml.createElementNS(KML_NS, 'Folder');
    const name = xml.createElementNS(KML_NS, 'name');
    name.textContent = labelFor(radius);
    folder.appendChild(name);
    documentNode.appendChild(folder);
    return folder;
  }

  function circleCoordinates(lat, lng, radius, steps = 36) {
    const earthRadius = 6378137;
    const lat1 = lat * Math.PI / 180;
    const lng1 = lng * Math.PI / 180;
    const angular = radius / earthRadius;
    const coordinates = [];

    for (let i = 0; i <= steps; i++) {
      const bearing = i / steps * Math.PI * 2;
      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(angular) +
        Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing)
      );
      const lng2 = lng1 + Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
      );
      coordinates.push(`${(lng2 * 180 / Math.PI).toFixed(7)},${(lat2 * 180 / Math.PI).toFixed(7)},0`);
    }

    return coordinates.join(' ');
  }

  function createCirclePlacemark(xml, point, radius) {
    const placemark = xml.createElementNS(KML_NS, 'Placemark');
    const name = xml.createElementNS(KML_NS, 'name');
    name.textContent = `${point.name || 'POI'}_${radius}m円`;
    placemark.appendChild(name);

    const polygon = xml.createElementNS(KML_NS, 'Polygon');
    const outer = xml.createElementNS(KML_NS, 'outerBoundaryIs');
    const ring = xml.createElementNS(KML_NS, 'LinearRing');
    const coordinates = xml.createElementNS(KML_NS, 'coordinates');
    coordinates.textContent = circleCoordinates(point.lat, point.lng, radius);
    ring.appendChild(coordinates);
    outer.appendChild(ring);
    polygon.appendChild(outer);
    placemark.appendChild(polygon);
    return placemark;
  }

  function ensureAllPoiCircles(xml, allowedRadii) {
    const documentNode = xml.getElementsByTagName('Document')[0];
    if (!documentNode) return;
    const centers = collectPointCenters(xml);
    if (!centers.length) return;

    KNOWN_RADII.forEach(radius => {
      const folders = findFolders(xml, radius);

      if (!allowedRadii.has(radius)) {
        folders.forEach(folder => folder.remove());
        return;
      }

      const folder = folders[0] || createFolder(xml, documentNode, radius);
      folders.slice(1).forEach(extra => extra.remove());

      const existing = new Set();
      Array.from(folder.getElementsByTagName('Placemark')).forEach(placemark => {
        const center = polygonCenter(placemark);
        if (center) existing.add(centerKey(center));
      });

      centers.forEach(point => {
        if (!existing.has(centerKey(point))) {
          folder.appendChild(createCirclePlacemark(xml, point, radius));
        }
      });
    });
  }

  function preserveSourceCircleSet(xml, sourceRadii) {
    KNOWN_RADII.forEach(radius => {
      if (!sourceRadii.has(radius)) {
        findFolders(xml, radius).forEach(folder => folder.remove());
      }
    });
  }

  function reorder(xml) {
    const documentNode = xml.getElementsByTagName('Document')[0];
    if (!documentNode) return;
    const circleFolders = Array.from(documentNode.children || [])
      .map((node, index) => ({ node, index, radius: folderRadius(node) }))
      .filter(item => item.radius !== null);
    if (circleFolders.length < 2) return;

    const firstIndex = Math.min(...circleFolders.map(item => item.index));
    circleFolders.forEach(item => item.node.remove());
    const ref = Array.from(documentNode.children || [])[firstIndex] || null;
    circleFolders.sort((a, b) => b.radius - a.radius).forEach(item => {
      documentNode.insertBefore(item.node, ref);
    });
  }

  function installZipPatch({ completed, sourceRadii, allowedRadii }) {
    const prototype = window.JSZip?.prototype;
    if (!prototype || typeof prototype.generateAsync !== 'function') return () => {};
    const original = prototype.generateAsync;

    prototype.generateAsync = async function (...args) {
      for (const name of Object.keys(this.files || {})) {
        if (!name.toLowerCase().endsWith('.kml') || this.files[name].dir) continue;
        const entry = this.file(name);
        if (!entry) continue;
        const xml = parseXml(await entry.async('string'));

        if (completed) {
          preserveSourceCircleSet(xml, sourceRadii);
        } else {
          ensureAllPoiCircles(xml, allowedRadii);
        }
        reorder(xml);
        this.file(name, new XMLSerializer().serializeToString(xml));
      }
      return original.apply(this, args);
    };

    return () => {
      if (prototype.generateAsync === prototype.generateAsync) {
        prototype.generateAsync = original;
      }
    };
  }

  function wrap(name, inputId, groupName, force50) {
    const original = window[name];
    if (typeof original !== 'function' || original[WRAPPED]) return;

    const wrapped = async function (...args) {
      const sourceRadii = await inspectSourceRadii(inputId);
      const completed = sourceRadii.size > 0;
      const allowed = completed ? new Set(sourceRadii) : selectedRadii(groupName);
      if (!completed && force50) allowed.add(50);

      const restore = installZipPatch({ completed, sourceRadii, allowedRadii: allowed });
      try {
        return await original.apply(this, args);
      } finally {
        restore();
      }
    };

    Object.defineProperty(wrapped, WRAPPED, { value: true });
    window[name] = wrapped;
  }

  function apply() {
    wrap('generateKMZ', 'fileInput', 'radius', true);
    wrap('generateCircleOnlyKMZ', 'circleOnlyFileInput', 'circleOnlyRadius', false);
  }

  apply();
})();
