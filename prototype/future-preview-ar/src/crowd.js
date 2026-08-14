import * as THREE from 'three';

const METERS_PER_DEGREE_LAT = 111320;
const MIN_RADIUS_M = 8;
const MAX_RADIUS_M = 50;

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

function sampleNearbyPoint(polygons, origin, seed) {
  for (let attempt = 0; attempt < 260; attempt += 1) {
    const radius01 = hash01(seed + attempt * 3.17 + 11);
    const angle01 = hash01(seed + attempt * 5.73 + 29);
    const radius = MIN_RADIUS_M + Math.sqrt(radius01) * (MAX_RADIUS_M - MIN_RADIUS_M);
    const bearing = angle01 * Math.PI * 2;
    const point = offsetFrom(origin, radius, bearing);
    if (insideAnyPolygon(point.lat, point.lng, polygons)) return point;
  }
  return null;
}

function material(color) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false });
}

function makePerson(index) {
  const group = new THREE.Group();
  const hue = hash01(index * 6.73 + 2.1);
  const shirt = new THREE.Color().setHSL(hue, 0.45, 0.58);
  const pants = new THREE.Color().setHSL((hue + 0.57) % 1, 0.22, 0.28);
  const skin = new THREE.Color().setHSL(0.08 + hash01(index + 5) * 0.04, 0.36, 0.72);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), material(skin));
  head.position.y = 1.68;
  group.add(head);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.62, 4, 8), material(shirt));
  body.position.y = 1.06;
  group.add(body);

  const legGeometry = new THREE.CapsuleGeometry(0.075, 0.48, 3, 6);
  const leftLeg = new THREE.Mesh(legGeometry, material(pants));
  const rightLeg = new THREE.Mesh(legGeometry, material(pants));
  leftLeg.position.set(-0.095, 0.42, 0);
  rightLeg.position.set(0.095, 0.42, 0);
  group.add(leftLeg, rightLeg);

  if (index % 4 === 0) {
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.13, 0.015), material(0x1f2937));
    phone.position.set(0.28, 1.16, -0.08);
    phone.rotation.z = -0.25;
    group.add(phone);
  }

  const scale = 0.88 + hash01(index * 13.1) * 0.22;
  group.scale.setScalar(scale);
  group.rotation.y = hash01(index * 4.3) * Math.PI * 2;
  group.userData.previewPerson = true;
  return group;
}

export function clearCrowd(locar, crowd) {
  crowd.forEach(person => {
    person.traverse(node => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach(item => item.dispose?.());
      else node.material?.dispose?.();
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
  let placed = 0;

  for (let i = 0; i < count; i += 1) {
    const position = sampleNearbyPoint(polygons, origin, i * 19.17 + count * 0.71);
    if (!position) continue;

    const person = makePerson(i);
    locar.add(person, position.lng, position.lat);
    crowd.push(person);
    placed += 1;
  }

  return {
    placed,
    requested: count,
    radiusMinM: MIN_RADIUS_M,
    radiusMaxM: MAX_RADIUS_M,
    originInside
  };
}
