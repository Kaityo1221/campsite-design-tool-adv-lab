import * as THREE from 'three';

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

function bbox(points) {
  return points.reduce((box, [lat, lng]) => ({
    minLat: Math.min(box.minLat, lat),
    maxLat: Math.max(box.maxLat, lat),
    minLng: Math.min(box.minLng, lng),
    maxLng: Math.max(box.maxLng, lng)
  }), { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity });
}

function choosePolygon(polygons, seed) {
  const weights = polygons.map(polygon => Math.max(polygon.area, 1e-12));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let cursor = hash01(seed) * total;
  for (let i = 0; i < polygons.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return polygons[i];
  }
  return polygons[polygons.length - 1];
}

function samplePointInPolygon(polygon, seed) {
  const box = bbox(polygon.points);
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const a = hash01(seed + attempt * 2.13);
    const b = hash01(seed + attempt * 3.79 + 41);
    const lat = box.minLat + (box.maxLat - box.minLat) * a;
    const lng = box.minLng + (box.maxLng - box.minLng) * b;
    if (pointInPolygon(lat, lng, polygon.points)) return { lat, lng };
  }

  const lat = polygon.points.reduce((sum, point) => sum + point[0], 0) / polygon.points.length;
  const lng = polygon.points.reduce((sum, point) => sum + point[1], 0) / polygon.points.length;
  return { lat, lng };
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

export function renderCrowd({ locar, polygons, count, crowd }) {
  clearCrowd(locar, crowd);

  for (let i = 0; i < count; i += 1) {
    const polygon = choosePolygon(polygons, i + 1);
    const position = samplePointInPolygon(polygon, i * 19.17 + count * 0.71);
    const person = makePerson(i);
    locar.add(person, position.lng, position.lat);
    crowd.push(person);
  }

  return crowd;
}
