(() => {
  'use strict';

  const SUPABASE_URL = 'https://azkshxjgsbtjgwbapcfw.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rWbeIqdWJJHHBtphER8bdg__CaS_xGK';
  const RPC_NAME = 'campsite_adv_published_event_scripts';

  const normalizeSpeaker = value => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'システム' || raw === 'system') return 'system';
    if (raw === 'リク' || raw === 'riku') return 'riku';
    if (raw === 'ミナ' || raw === 'mina') return 'mina';
    if (raw === 'レン' || raw === 'ren') return 'ren';
    return raw || 'system';
  };

  const normalizeScenes = scenes => {
    if (!Array.isArray(scenes)) return [];
    return scenes
      .map(scene => ({
        order: Number(scene?.order || 0),
        speaker: normalizeSpeaker(scene?.speaker),
        text: String(scene?.dialogue || ''),
        image: String(scene?.image || '自動（現行設定）'),
        imageUrl: String(scene?.image_url || ''),
        stage: String(scene?.stage || ''),
        note: String(scene?.note || '')
      }))
      .filter(scene => Number.isFinite(scene.order) && scene.order > 0 && scene.text)
      .sort((a, b) => a.order - b.order);
  };

  async function loadPublishedDialogues() {
    if (!window.GUNGI_DIALOGUES_V03) {
      return { success: false, applied: 0, reason: 'bundled dialogues unavailable' };
    }
    if (!window.supabase?.createClient) {
      console.warn('ADV published dialogues: Supabase SDK unavailable, bundled v0.3 will be used.');
      return { success: false, applied: 0, reason: 'supabase sdk unavailable' };
    }

    try {
      const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        }
      );
      const { data, error } = await client.rpc(RPC_NAME);
      if (error) throw error;

      let applied = 0;
      for (const row of data || []) {
        const eventId = String(row?.event_id || '');
        const target = window.GUNGI_DIALOGUES_V03[eventId];
        if (!target) continue;
        const cuts = normalizeScenes(row?.scenes);
        if (!cuts.length) continue;

        target.cuts = cuts;
        target.releaseId = String(row?.release_id || '');
        target.publishedAt = String(row?.created_at || '');
        applied += 1;
      }

      window.__ADV_PUBLISHED_DIALOGUES_COUNT__ = applied;
      window.__ADV_PUBLISHED_DIALOGUES_LOADED__ = true;
      console.info(`ADV published dialogues: ${applied} event override(s) loaded.`);
      return { success: true, applied };
    } catch (error) {
      window.__ADV_PUBLISHED_DIALOGUES_LOADED__ = false;
      console.warn('ADV published dialogues load failed. Bundled v0.3 will be used.', error);
      return { success: false, applied: 0, reason: String(error?.message || error) };
    }
  }

  window.ADV_PUBLISHED_DIALOGUES_READY = loadPublishedDialogues();
})();
