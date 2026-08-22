/* ======================================================
   POI Master -> existing name dictionary -> ADV bridge
   - 新しい辞書は作らない
   - 既存の alias_master / dictionary_master を classifyPoiName() 経由で利用
   - LabEngine Brainで未判定だったPOIだけを補完する
====================================================== */
(() => {
  "use strict";

  let installed = false;

  function getPointName(point) {
    return String(
      point?.name ||
      point?.title ||
      point?.poi_name ||
      point?.displayName ||
      ""
    );
  }

  function categoryToLab(categoryId) {
    if (typeof window.convertPoiCategoryToLabKey === "function") {
      return {
        key: window.convertPoiCategoryToLabKey(categoryId),
        label: typeof window.convertPoiCategoryToLabLabel === "function"
          ? window.convertPoiCategoryToLabLabel(categoryId)
          : categoryId
      };
    }

    const id = String(categoryId || "UNKNOWN").toUpperCase();
    if (["REST", "SAFE"].includes(id)) return { key: "rest", label: "休憩・支援" };
    if (["STAY", "SPORT", "FAM"].includes(id)) return { key: "stay", label: "滞在" };
    if (["LOOP", "TRANSIT", "DISC", "NATURE"].includes(id)) return { key: "loop", label: "回遊・発見" };
    if (["STAY_RISK", "FLOW_RISK"].includes(id)) return { key: "caution", label: "注意" };
    return { key: "unknown", label: "未分類" };
  }

  async function enrichUnmatchedWithExistingDictionary(points) {
    if (typeof window.classifyPoiName !== "function") return points;

    const output = [];
    let matchedCount = 0;

    for (const point of points || []) {
      if (point?._labEngineBrainMatched === true) {
        output.push(point);
        continue;
      }

      const name = getPointName(point);
      if (!name) {
        output.push(point);
        continue;
      }

      let classification = null;
      try {
        classification = await window.classifyPoiName(name);
      } catch (error) {
        console.warn("POI名称辞書のADV補完をスキップしました:", error);
      }

      if (!classification?.matched) {
        output.push(point);
        continue;
      }

      const lab = categoryToLab(classification.categoryId);
      matchedCount += 1;

      const enriched = {
        ...point,
        _labCategoryKey: lab.key,
        _labCategoryLabel: lab.label,
        _poiClassification: classification,
        _labEngineBrainMatched: true,
        _labEngineBrainSource: "poi_name_databank",
        _labEngineBrainName: classification.canonicalName || name,
        _labEngineBrainDictionaryId: classification.dictionaryId || null,
        _labEngineBrainConfidenceScore: classification.matchedBy === "alias" ? 0.94 : 0.90,
        _labCanonicalName: classification.canonicalName || null,
        _labRiskTag: classification.riskTag || null,
        _labReportPhrase: classification.reportPhrase || null
      };

      window.LabEngineLearningStats?.recordDecision?.(enriched);
      output.push(enriched);
    }

    if (matchedCount > 0) {
      console.log(`ADV名称辞書補完: ${matchedCount}件を既存POI名称辞書から推定しました。`);
    }

    return output;
  }

  function install() {
    if (installed) return true;

    const original = window.enrichLabPointsWithLabEngineBrain;
    if (typeof original !== "function") return false;
    if (original.__poiMasterNameDictionaryBridge === true) {
      installed = true;
      return true;
    }

    const wrapped = async function(points, ...args) {
      const brainResult = await original.call(this, points, ...args);
      return enrichUnmatchedWithExistingDictionary(brainResult);
    };

    Object.defineProperty(wrapped, "__poiMasterNameDictionaryBridge", { value: true });
    window.enrichLabPointsWithLabEngineBrain = wrapped;
    window.enrichAdvWithExistingPoiNameDictionary = enrichUnmatchedWithExistingDictionary;
    installed = true;
    console.log("ADV <- 既存POI名称辞書 bridge ready");
    return true;
  }

  const timer = setInterval(() => {
    if (install()) clearInterval(timer);
  }, 100);

  setTimeout(() => clearInterval(timer), 10000);
  window.addEventListener("load", install, { once: true });
})();
