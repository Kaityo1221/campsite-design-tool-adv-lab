(() => {
  'use strict';

  const EARTH_RADIUS_M = 6371000;
  const DENSITY_RADIUS_M = 100;
  const DENSITY_MIN_EXISTING = 6;
  const SUPPORT_RADIUS_M = 100;

  function distanceMeters(a, b) {
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const q = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
  }

  function validPoint(point) {
    return point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
  }

  function normalizePoint(point, index) {
    return {
      ...point,
      id: point.id || `p${index + 1}`,
      isAdded: Boolean(point.isAdded),
      isExisting: Boolean(point.isExisting),
      isTarget: typeof point.isTarget === 'boolean' ? point.isTarget : Boolean(point.isAdded || point.isExisting),
      isSupport: Boolean(point.isSupport)
    };
  }

  function normalizeWarning(warning, index) {
    const distance = Number(warning?.distance);
    return {
      id: warning?.id || `distance-${index + 1}`,
      kind: 'DISTANCE_PAIR',
      source: warning?.source || 'distance-check',
      confidence: warning?.confidence || 'confirmed',
      a: warning?.a || null,
      b: warning?.b || null,
      distanceM: Number.isFinite(distance) ? distance : null,
      severity: warning?.type || warning?.severity || null,
      referenceOnly: Boolean(warning?.referenceOnly)
    };
  }

  function buildDensityFacts(points) {
    const added = points.filter(point => point.isAdded);
    const existing = points.filter(point => point.isExisting);
    return added.map(center => {
      const nearbyExisting = existing
        .map(point => ({ point, distanceM: distanceMeters(center, point) }))
        .filter(item => item.distanceM <= DENSITY_RADIUS_M)
        .sort((a, b) => a.distanceM - b.distanceM);
      return {
        id: `density:${center.id}`,
        kind: 'DENSITY_EXISTING_100M',
        source: 'geometry',
        confidence: 'confirmed',
        center,
        radiusM: DENSITY_RADIUS_M,
        existingCount: nearbyExisting.length,
        threshold: DENSITY_MIN_EXISTING,
        triggered: nearbyExisting.length >= DENSITY_MIN_EXISTING,
        nearbyExisting
      };
    });
  }

  function buildSupportFacts(points, densityFacts) {
    const supportPoints = points.filter(point => point.isSupport);
    return densityFacts.filter(fact => fact.triggered).map(fact => {
      const nearbySupport = supportPoints
        .filter(point => point.id !== fact.center.id)
        .map(point => ({ point, distanceM: distanceMeters(fact.center, point) }))
        .filter(item => item.distanceM <= SUPPORT_RADIUS_M)
        .sort((a, b) => a.distanceM - b.distanceM);
      return {
        id: `support:${fact.center.id}`,
        kind: 'SUPPORT_NEARBY_100M',
        source: 'geometry',
        confidence: 'confirmed',
        center: fact.center,
        radiusM: SUPPORT_RADIUS_M,
        supportCount: nearbySupport.length,
        triggered: nearbySupport.length > 0,
        nearbySupport
      };
    });
  }

  function build(input = {}) {
    const points = (input.points || []).map(normalizePoint).filter(validPoint);
    const activeWarnings = (input.warnings?.active || input.activeWarnings || []).map(normalizeWarning);
    const referenceWarnings = (input.warnings?.reference || input.referenceWarnings || []).map((warning, index) => normalizeWarning({ ...warning, referenceOnly: true }, index));
    const warnings = [...activeWarnings, ...referenceWarnings];
    const densityFacts = buildDensityFacts(points);
    const supportFacts = buildSupportFacts(points, densityFacts);
    return {
      schemaVersion: '0.1.0',
      generatedAt: new Date().toISOString(),
      points,
      warnings,
      categories: Array.isArray(input.categories) ? [...input.categories] : [],
      localRules: Array.isArray(input.localRules) ? [...input.localRules] : [],
      supportFacilities: points.filter(point => point.isSupport),
      facts: { distance: warnings, density: densityFacts, support: supportFacts },
      stats: {
        pointCount: points.length,
        addedPoiCount: points.filter(point => point.isAdded).length,
        existingPoiCount: points.filter(point => point.isExisting).length,
        supportPoiCount: points.filter(point => point.isSupport).length,
        activeDistanceWarningCount: activeWarnings.length,
        referenceDistanceWarningCount: referenceWarnings.length,
        densityCandidateCount: densityFacts.filter(fact => fact.triggered).length,
        densitySupportCandidateCount: supportFacts.filter(fact => fact.triggered).length
      }
    };
  }

  window.GungiFacts = {
    version: '0.1.0-demo',
    constants: { densityRadiusM: DENSITY_RADIUS_M, densityMinExisting: DENSITY_MIN_EXISTING, supportRadiusM: SUPPORT_RADIUS_M },
    build,
    distanceMeters
  };
})();