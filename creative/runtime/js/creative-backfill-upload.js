(() => {
  "use strict";

  const SUPABASE_URL = "https://azkshxjgsbtjgwbapcfw.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rWbeIqdWJJHHBtphER8bdg__CaS_xGK";
  const FUNCTION_NAME = "upload-campsite-file";
  const ACTION_TYPE = "creative_mode";
  const KMZ_MIME = "application/vnd.google-earth.kmz";
  const KML_MIME = "application/vnd.google-earth.kml+xml";

  let clientPromise = null;
  let uploadRunning = false;

  function loadSupabaseClient() {
    if (window.campsiteSupabase?.functions) {
      return Promise.resolve(window.campsiteSupabase);
    }
    if (clientPromise) return clientPromise;

    clientPromise = new Promise((resolve, reject) => {
      const ready = () => {
        if (!window.supabase?.createClient) {
          reject(new Error("Supabase SDKを初期化できませんでした。"));
          return;
        }
        window.campsiteSupabase = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        );
        resolve(window.campsiteSupabase);
      };

      if (window.supabase?.createClient) {
        ready();
        return;
      }

      const existing = document.querySelector('script[data-creative-supabase="1"]');
      if (existing) {
        existing.addEventListener("load", ready, { once: true });
        existing.addEventListener("error", () => reject(new Error("Supabase SDKを読み込めませんでした。")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.dataset.creativeSupabase = "1";
      script.addEventListener("load", ready, { once: true });
      script.addEventListener("error", () => reject(new Error("Supabase SDKを読み込めませんでした。")), { once: true });
      document.head.appendChild(script);
    });

    return clientPromise;
  }

  function getAnonymousDeviceId() {
    const key = "campsiteUserId";
    let value = localStorage.getItem(key);
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(key, value);
    }
    return value;
  }

  function normalizeFileName(value, fallback = "creative_mode.kmz") {
    return String(value || fallback)
      .normalize("NFKC")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^\.+/, "")
      .slice(0, 120) || fallback;
  }

  function inferParkName() {
    let name = String(typeof sourceName === "string" ? sourceName : "")
      .normalize("NFKC")
      .replace(/\.(kmz|kml)$/i, "")
      .replace(/^推定_?/i, "")
      .replace(/^(KMZ作成|距離チェック)_?/i, "")
      .replace(/_CREATIVE$/i, "")
      .replace(/_?\d{8}_?\d{6}.*$/i, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .trim();
    return name || "公園名不明";
  }

  async function buildCreativeFile() {
    if (typeof rebuildKml !== "function" || typeof sourceText !== "string" || !sourceText) {
      throw new Error("Creative Modeの設計データがありません。" );
    }

    const kml = rebuildKml();
    const baseName = normalizeFileName(
      `${String(sourceName || "campsite").replace(/\.[^.]+$/, "")}_CREATIVE`
    );

    if (sourceIsKmz) {
      const sourceBlob = await sourceZip.generateAsync({ type: "blob" });
      const zip = await JSZip.loadAsync(sourceBlob);
      zip.file(sourceKmlPath, kml);
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      return {
        blob: new Blob([blob], { type: KMZ_MIME }),
        fileName: `${baseName}.kmz`,
      };
    }

    return {
      blob: new Blob([kml], { type: KML_MIME }),
      fileName: `${baseName}.kml`,
    };
  }

  function getPoiCounts() {
    const active = Array.isArray(records) ? records.filter((r) => !r.deleted) : [];
    return {
      poiCount: active.length,
      existingPoiCount: active.filter((r) => !r.added).length,
      addedPoiCount: active.filter((r) => r.added).length,
    };
  }

  async function uploadCreativeSnapshot() {
    if (uploadRunning) return;
    uploadRunning = true;

    try {
      const client = await loadSupabaseClient();
      const { blob, fileName } = await buildCreativeFile();
      const counts = getPoiCounts();
      const formData = new FormData();
      formData.append("file", new File([blob], fileName, { type: blob.type || KMZ_MIME }));
      formData.append("original_file_name", fileName);
      formData.append("anonymous_device_id", getAnonymousDeviceId());
      formData.append("action_type", ACTION_TYPE);
      formData.append("park_name", inferParkName());
      formData.append("poi_count", String(counts.poiCount));
      formData.append("existing_poi_count", String(counts.existingPoiCount));
      formData.append("added_poi_count", String(counts.addedPoiCount));

      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: formData });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "バックフィル保存に失敗しました。");

      console.log("Creative Mode -> POI backfill queued", data.record_id);
      if (typeof fileStatus !== "undefined" && fileStatus) {
        fileStatus.textContent = "書き出し完了。バックフィルにも保存しました。";
      }
    } catch (error) {
      console.warn("Creative Modeのバックフィル送信に失敗しました。", error);
      if (typeof fileStatus !== "undefined" && fileStatus) {
        fileStatus.textContent = "書き出し完了。※バックフィル送信だけ失敗しました。";
      }
    } finally {
      uploadRunning = false;
    }
  }

  function install() {
    const button = document.getElementById("export");
    if (!button || button.dataset.creativeBackfillInstalled === "1") return;
    button.dataset.creativeBackfillInstalled = "1";
    button.addEventListener("click", () => {
      if (typeof sourceText !== "string" || !sourceText) return;
      void uploadCreativeSnapshot();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
