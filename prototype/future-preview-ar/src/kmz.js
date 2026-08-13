import JSZip from 'jszip';

const ACTIVITY_REGEX = /(活動範囲|activity\s*area|activity\s*range|play\s*area)/i;

function directChildText(node, localName) {
  return Array.from(node?.children || []).find(child => child.localName === localName)?.textContent?.trim() || '';
}

function ancestorFolderNames(node) {
  const names = [];
  let current = node?.parentElement;
  while (current) {
    if (current.localName === 'Folder') {
      const name = directChildText(current, 'name');
      if (name) names.unshift(name);
    }
    current = current.parentElement;
  }
  return names;
}

function parseCoordinateText(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .map(token => {
      const [lngRaw, latRaw] = token.split(',');
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    })
    .filter(Boolean);
}

function polygonAreaApprox(points) {
  if (points.length < 3) return 0;
  const lat0 = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cos = Math.cos(lat0 * Math.PI / 180);
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[(i + 1) % points.length];
    const x1 = lng1 * cos;
    const y1 = lat1;
    const x2 = lng2 * cos;
    const y2 = lat2;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function parseActivityPolygons(kmlText) {
  const xml = new DOMParser().parseFromString(kmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('KMLを解析できませんでした。');

  const polygons = [];
  const placemarks = Array.from(xml.getElementsByTagNameNS('*', 'Placemark'));

  placemarks.forEach((placemark, placemarkIndex) => {
    const placemarkName = directChildText(placemark, 'name');
    const folders = ancestorFolderNames(placemark);
    const sourceLabel = [...folders, placemarkName].filter(Boolean).join(' / ');
    const isActivity = ACTIVITY_REGEX.test(sourceLabel);

    Array.from(placemark.getElementsByTagNameNS('*', 'Polygon')).forEach((polygon, polygonIndex) => {
      const outer = polygon.getElementsByTagNameNS('*', 'outerBoundaryIs')[0];
      const ring = outer?.getElementsByTagNameNS('*', 'LinearRing')[0];
      const coordinates = ring?.getElementsByTagNameNS('*', 'coordinates')[0];
      const points = parseCoordinateText(coordinates?.textContent);
      if (points.length < 3) return;

      if (points.length > 3) {
        const first = points[0];
        const last = points[points.length - 1];
        if (first[0] === last[0] && first[1] === last[1]) points.pop();
      }

      polygons.push({
        id: `polygon-${placemarkIndex + 1}-${polygonIndex + 1}`,
        name: placemarkName || `Polygon ${polygons.length + 1}`,
        folders,
        sourceLabel,
        points,
        isActivity,
        area: polygonAreaApprox(points)
      });
    });
  });

  if (!polygons.length) throw new Error('Polygon形式の範囲が見つかりませんでした。');

  const labelled = polygons.filter(polygon => polygon.isActivity);
  if (labelled.length) {
    return { polygons: labelled, selection: 'labelled', allPolygonCount: polygons.length };
  }

  if (polygons.length === 1) {
    return { polygons, selection: 'single-fallback', allPolygonCount: 1 };
  }

  throw new Error('活動範囲を特定できません。KMZ内のPolygonを「活動範囲」フォルダへ入れてください。');
}

async function readKml(file) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.kml')) return file.text();
  if (!lower.endsWith('.kmz')) throw new Error('KMZまたはKMLを選択してください。');

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const candidates = Object.values(zip.files).filter(entry => !entry.dir && entry.name.toLowerCase().endsWith('.kml'));
  if (!candidates.length) throw new Error('KMZ内にKMLが見つかりません。');

  candidates.sort((a, b) => {
    const aDoc = /(^|\/)doc\.kml$/i.test(a.name) ? 0 : 1;
    const bDoc = /(^|\/)doc\.kml$/i.test(b.name) ? 0 : 1;
    return aDoc - bDoc;
  });

  return candidates[0].async('text');
}

export async function loadActivityAreas(file) {
  const kmlText = await readKml(file);
  return parseActivityPolygons(kmlText);
}
