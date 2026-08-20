/* Shared POI spacing policy used by the main tool and field mode. */
(() => {
  'use strict';

  if (!window.CampsitePoiSpacingPolicy) {
    const targetMeters = 50;
    const referenceMeters = Object.freeze([30, 40]);

    function distanceBand(meters) {
      const distance = Number(meters);
      if (!Number.isFinite(distance)) return 'waiting';
      if (distance < referenceMeters[0]) return 'danger';
      if (distance < referenceMeters[1]) return 'caution';
      if (distance < targetMeters) return 'near';
      return 'ok';
    }

    window.CampsitePoiSpacingPolicy = Object.freeze({
      targetMeters,
      referenceMeters,
      distanceBand,
      publicLead: 'POI間隔は50mを目安に設計してください。',
      referenceNote: '30m・40mは参考距離です。',
      targetCircleFolder: '50m円（目安）',
      referenceCircleFolders: Object.freeze({
        30: '30m円（参考距離）',
        40: '40m円（参考距離）'
      })
    });
  }

  /*
   * Load the final circle-output guard after legacy KMZ wrappers have settled.
   * This keeps the completed KMZ's existing radii exactly as-is, while a new
   * KMZ always receives 50m circles for every real POI, including Power Spots.
   */
  const loadCircleOutputFix = () => {
    if (window.__poiCircleOutputFixLoading) return;
    window.__poiCircleOutputFixLoading = true;
    import('./poi-circle-output-fix.js?v=1').catch(error => {
      window.__poiCircleOutputFixLoading = false;
      console.warn('円生成の最終補正を読み込めませんでした。', error);
    });
  };

  if (document.readyState === 'complete') {
    loadCircleOutputFix();
  } else {
    window.addEventListener('load', loadCircleOutputFix, { once: true });
  }
})();
