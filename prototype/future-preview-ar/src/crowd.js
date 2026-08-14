import * as THREE from 'three';
import { TAKETZZO_SILHOUETTE_URL } from './silhouette.js';

const METERS_PER_DEGREE_LAT = 111320;
const PREVIEW_RADIUS_M = 50;
const BANDS = {
  near: { min: 4, max: 12 },
  mid: { min: 12, max: 25 },
  far: { min: 25, max: 45 }
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

function distanceMeters(a, b) {
  const lat0 = ((a.lat + b.lat) / 2) * Math.PI / 180;
  const dy = (b.lat - a.lat) * METERS_PER_DEGREE_LAT;
  const dx = (b.lng - a.lng) * METERS_PER_DEGREE_LAT * Math.cos(lat0);
  return Math.sqrt(dx * dx + dy * dy);
}

function bandForIndex(index, count) {
  const ratio = index / Math.max(1, count);
  // 近景を必ず多めに確保して「人がいる」と分かるようにする。
  if (ratio < 0.28) return BANDS.near;
  if (ratio < 0.70) return BANDS.mid;
  return BANDS.far;
}

function sampleBandPoint(polygons, origin, seed, band) {
  for (let attempt = 0; attempt < 220; attempt += 1) {
    const radius01 = hash01(seed + attempt * 3.17 + 11);
    const angle01 = hash01(seed + attempt * 5.73 + 29);
    const radius = band.min + Math.sqrt(radius01) * (band.max - band.min);
    const bearing = angle01 * Math.PI * 2;
    const point = offsetFrom(origin, radius, bearing);
    if (insideAnyPolygon(point.lat, point.lng, polygons)) return point;
  }
  return null;
}

function makeClusterPlan(count) {
  const plan = [];
  let remaining = count;
  let seed = 1;

  while (remaining > 0) {
    const roll = hash01(seed * 7.31 + count);
    let size = roll < 0.34 ? 1 : roll < 0.67 ? 2 : roll < 0.88 ? 3 : 4;
    size = Math.min(size, remaining);
    plan.push(size);
    remaining -= size;
    seed += 1;
  }
  return plan;
}

function makeSilhouetteSprite(index, distanceM) {
  const texture = getSilhouetteTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0x111111,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    alphaTest: 0.08,
    toneMapped: false
  });

  const sprite = new THREE.Sprite(material);

  // 実寸の人間に近い高さ。近景だけ少し強調し、遠景は自然な実寸へ寄せる。
  const height = distanceM <= 12
    ? 1.90 + hash01(index * 2.7) * 0.16
    : 1.72 + hash01(index * 2.7) * 0.14;
  const aspect = 210 / 512;
  sprite.scale.set(height * aspect, height, 1);

  // 足元がLocARの地面に乗るよう、中心を身長の半分だけ上げる。
  sprite.position.y = height / 2;
  sprite.center.set(0.5, 0.0);
  sprite.userData.previewPerson = true;
  sprite.userData.sharedTexture = true;

  // 同じシルエットでも少しだけ幅・左右反転を混ぜる。
  const widthVariation = 0.92 + hash01(index * 4.91) * 0.16;
  const flip = hash01(index * 8.11) > 0.5 ? -1 : 1;
  sprite.scale.x *= widthVariation * flip;

  return sprite;
}

export function clearCrowd(locar, crowd) {
  crowd.forEach(person => {
    person.traverse(node => {
      if (Array.isArray(node.material)) node.material.forEach(item => item.dispose?.());
      else node.material?.dispose?.();
      // 共有テクスチャは破棄しない。
      if (node.geometry && !node.userData?.sharedTexture) node.geometry.dispose?.();
    });
    person.removeFromParent();
  });
  crowd.length = 0;
}

export function renderCrowd({ locar, polygons, count, crowd, origin }) {
  clearCrowd(locar, crowd);

  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    throw new Error('現在地を取得できていません。');
  }

  const originInside = insideAnyPolygon(origin.lat, origin.lng, polygons);
  const clusterPlan = makeClusterPlan(count);
  let placed = 0;
  let personIndex = 0;

  clusterPlan.forEach((clusterSize, clusterIndex) => {
    if (personIndex >= count) return;

    const band = bandForIndex(personIndex, count);
    const center = sampleBandPoint(
      polygons,
      origin,
      clusterIndex * 29.37 + count * 0.71,
      band
    );
    if (!center) {
      personIndex += clusterSize;
      return;
    }

    for (let member = 0; member < clusterSize && personIndex < count; member += 1) {
      let position = center;

      if (member > 0) {
        const spacing = 0.8 + hash01(personIndex * 3.41) * 1.3;
        const bearing = hash01(personIndex * 5.19) * Math.PI * 2;
        const candidate = offsetFrom(center, spacing, bearing);
        if (insideAnyPolygon(candidate.lat, candidate.lng, polygons)) position = candidate;
      }

      const distanceM = distanceMeters(origin, position);
      if (distanceM > PREVIEW_RADIUS_M) {
        personIndex += 1;
        continue;
      }

      const person = makeSilhouetteSprite(personIndex, distanceM);
      locar.add(person, position.lng, position.lat);
      crowd.push(person);
      placed += 1;
      personIndex += 1;
    }
  });

  return {
    placed,
    requested: count,
    radiusMinM: BANDS.near.min,
    radiusMaxM: PREVIEW_RADIUS_M,
    originInside
  };
}
