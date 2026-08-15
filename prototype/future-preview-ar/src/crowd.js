import * as THREE from 'three';
import { TAKETZZO_SILHOUETTE_URL } from './silhouette.js';

const METERS_PER_DEGREE_LAT = 111320;
const PREVIEW_RADIUS_M = 50;
const BANDS = {
  near: { min: 4, max: 10 },
  mid: { min: 10, max: 24 },
  far: { min: 24, max: 45 }
};

const SECTORS = {
  near: [-64, 58, -40, 36, -82, 78, -22, 20],
  mid: [-58, -34, -12, 14, 36, 60, -76, 76, -104, 104],
  far: [-70, -46, -22, 0, 24, 48, 72, -96, 96, -132, 132, 180]
};

let sharedTexture = null;

function getSilhouetteTexture() {
  if (!sharedTexture) {
    sharedTexture = new THREE.TextureLoader().load(TAKETZZO_SILHOUETTE_URL);
    sharedTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return sharedTexture;
}

function hash01(seed) {
  const x = Math.sin(seed * 91.731 + 17.117) * 43758.5453;
  return x - Math.floor(x);
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function pointInPolygon(lat, lng, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const yi = points[i][0];
    const xi = points[i][1];
    const yj = points[j][0];
    const xj = points[j][1];
    const intersects = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function insideAnyPolygon(lat, lng, polygons) {
  return polygons.some(polygon => pointInPolygon(lat, lng, polygon.points));
}

function offsetFrom(origin, distanceM, bearingRad) {
  const latRad = origin.lat * Math.PI / 180;
  const northM = Math.cos(bearingRad) * distanceM;
  const eastM = Math.sin(bearingRad) * distanceM;
  const lat = origin.lat + northM / METERS_PER_DEGREE_LAT;
  const lngScale = METERS_PER_DEGREE_LAT * Math.max(0.15, Math.cos(latRad));
  const lng = origin.lng + eastM / lngScale;
  return { lat, lng };
}

function offsetLocal(origin, forwardM, sideM, bearingRad) {
  const forward = offsetFrom(origin, forwardM, bearingRad);
  return offsetFrom(forward, sideM, bearingRad + Math.PI / 2);
}

function distanceMeters(a, b) {
  const lat0 = ((a.lat + b.lat) / 2) * Math.PI / 180;
  const dy = (b.lat - a.lat) * METERS_PER_DEGREE_LAT;
  const dx = (b.lng - a.lng) * METERS_PER_DEGREE_LAT * Math.cos(lat0);
  return Math.sqrt(dx * dx + dy * dy);
}

function bandKeyForIndex(index, count) {
  const ratio = index / Math.max(1, count);
  if (ratio < 0.42) return 'near';
  if (ratio < 0.80) return 'mid';
  return 'far';
}

function preferredBearingForCluster(clusterIndex, bandKey, headingDeg) {
  if (!Number.isFinite(headingDeg)) {
    return hash01(clusterIndex * 17.41 + 9.3) * Math.PI * 2;
  }

  const offsets = SECTORS[bandKey];
  const offset = offsets[clusterIndex % offsets.length];
  const jitter = (hash01(clusterIndex * 7.13 + bandKey.length * 2.9) - 0.5) * 12;
  return degreesToRadians(normalizeDegrees(headingDeg + offset + jitter));
}

function sampleBandPoint(polygons, origin, seed, band, preferredBearing) {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const radius01 = hash01(seed + attempt * 3.17 + 11);
    const radius = band.min + Math.sqrt(radius01) * (band.max - band.min);
    const angularSpreadDeg = Math.min(85, 6 + attempt * 0.42);
    const angularOffsetDeg = (hash01(seed + attempt * 5.73 + 29) - 0.5) * angularSpreadDeg * 2;
    const bearing = preferredBearing + degreesToRadians(angularOffsetDeg);
    const point = offsetFrom(origin, radius, bearing);
    if (insideAnyPolygon(point.lat, point.lng, polygons)) return { point, bearing };
  }
  return null;
}

function makeClusterPlan(count) {
  const plan = [];
  let remaining = count;
  let seed = 1;

  while (remaining > 0) {
    const roll = hash01(seed * 7.31 + count);
    let size = roll < 0.30 ? 1 : roll < 0.62 ? 2 : roll < 0.84 ? 3 : roll < 0.96 ? 4 : 5;
    size = Math.min(size, remaining);
    plan.push(size);
    remaining -= size;
    seed += 1;
  }
  return plan;
}

function clusterPattern(size, variant) {
  const mirror = variant > 0.5 ? -1 : 1;
  if (size === 1) return [{ side: 0, forward: 0 }];
  if (size === 2) return [
    { side: -0.72 * mirror, forward: -0.10 },
    { side: 0.72 * mirror, forward: 0.18 }
  ];
  if (size === 3) return [
    { side: -0.92 * mirror, forward: -0.15 },
    { side: 0.90 * mirror, forward: -0.05 },
    { side: 0.12 * mirror, forward: 0.82 }
  ];
  if (size === 4) return [
    { side: -1.25 * mirror, forward: -0.18 },
    { side: -0.35 * mirror, forward: 0.32 },
    { side: 0.62 * mirror, forward: -0.08 },
    { side: 1.32 * mirror, forward: 0.55 }
  ];
  return [
    { side: -1.55 * mirror, forward: 0.02 },
    { side: -0.72 * mirror, forward: -0.42 },
    { side: 0.05 * mirror, forward: 0.55 },
    { side: 0.85 * mirror, forward: -0.18 },
    { side: 1.55 * mirror, forward: 0.38 }
  ];
}

function makeSilhouetteSprite(index, distanceM) {
  const texture = getSilhouetteTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0x101010,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    alphaTest: 0.08,
    toneMapped: false
  });

  const sprite = new THREE.Sprite(material);
  const height = distanceM <= 10
    ? 1.95 + hash01(index * 2.7) * 0.20
    : distanceM <= 24
      ? 1.78 + hash01(index * 2.7) * 0.16
      : 1.70 + hash01(index * 2.7) * 0.14;

  const aspect = 210 / 512;
  sprite.scale.set(height * aspect, height, 1);
  sprite.position.y = height / 2;
  sprite.center.set(0.5, 0.0);
  sprite.userData.previewPerson = true;
  sprite.userData.sharedTexture = true;

  const widthVariation = 0.90 + hash01(index * 4.91) * 0.20;
  const flip = hash01(index * 8.11) > 0.5 ? -1 : 1;
  sprite.scale.x *= widthVariation * flip;

  return sprite;
}

export function clearCrowd(locar, crowd) {
  crowd.forEach(person => {
    person.traverse(node => {
      if (Array.isArray(node.material)) node.material.forEach(item => item.dispose?.());
      else node.material?.dispose?.();
      if (node.geometry && !node.userData?.sharedTexture) node.geometry.dispose?.();
    });
    person.removeFromParent();
  });
  crowd.length = 0;
}

export function renderCrowd({ locar, polygons, count, crowd, origin, headingDeg = null }) {
  clearCrowd(locar, crowd);

  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    throw new Error('現在地を取得できていません。');
  }

  const originInside = insideAnyPolygon(origin.lat, origin.lng, polygons);
  const clusterPlan = makeClusterPlan(count);
  let placed = 0;
  let personIndex = 0;
  let nearPlaced = 0;
  let midPlaced = 0;
  let farPlaced = 0;
  let soloClusters = 0;
  let socialClusters = 0;

  clusterPlan.forEach((clusterSize, clusterIndex) => {
    if (personIndex >= count) return;

    const bandKey = bandKeyForIndex(personIndex, count);
    const band = BANDS[bandKey];
    const preferredBearing = preferredBearingForCluster(clusterIndex, bandKey, headingDeg);
    const sampled = sampleBandPoint(
      polygons,
      origin,
      clusterIndex * 29.37 + count * 0.71,
      band,
      preferredBearing
    );

    if (!sampled) {
      personIndex += clusterSize;
      return;
    }

    if (clusterSize === 1) soloClusters += 1;
    else socialClusters += 1;

    const pattern = clusterPattern(clusterSize, hash01(clusterIndex * 13.17 + count));

    for (let member = 0; member < clusterSize && personIndex < count; member += 1) {
      const layout = pattern[member] || { side: 0, forward: 0 };
      const spacingScale = bandKey === 'near' ? 1.0 : bandKey === 'mid' ? 1.25 : 1.5;
      const sideJitter = (hash01(personIndex * 5.19 + 1.7) - 0.5) * 0.35;
      const forwardJitter = (hash01(personIndex * 7.73 + 4.1) - 0.5) * 0.45;
      const candidate = offsetLocal(
        sampled.point,
        (layout.forward + forwardJitter) * spacingScale,
        (layout.side + sideJitter) * spacingScale,
        sampled.bearing
      );

      const position = insideAnyPolygon(candidate.lat, candidate.lng, polygons)
        ? candidate
        : sampled.point;

      const distanceM = distanceMeters(origin, position);
      if (distanceM > PREVIEW_RADIUS_M) {
        personIndex += 1;
        continue;
      }

      const person = makeSilhouetteSprite(personIndex, distanceM);
      locar.add(person, position.lng, position.lat);
      crowd.push(person);
      placed += 1;

      if (distanceM <= BANDS.near.max) nearPlaced += 1;
      else if (distanceM <= BANDS.mid.max) midPlaced += 1;
      else farPlaced += 1;

      personIndex += 1;
    }
  });

  return {
    placed,
    requested: count,
    radiusMinM: BANDS.near.min,
    radiusMaxM: PREVIEW_RADIUS_M,
    originInside,
    headingUsed: Number.isFinite(headingDeg),
    bands: { near: nearPlaced, mid: midPlaced, far: farPlaced },
    clusters: { solo: soloClusters, social: socialClusters }
  };
}
