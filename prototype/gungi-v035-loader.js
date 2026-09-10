(() => {
  'use strict';

  const frame = document.getElementById('advRoom');
  if (!frame) return;

  function injectScript(doc, src, marker) {
    return new Promise((resolve, reject) => {
      if (doc.querySelector(`script[data-adv-ext="${marker}"]`)) return resolve();
      const script = doc.createElement('script');
      script.src = src;
      script.dataset.advExt = marker;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      doc.head.appendChild(script);
    });
  }

  frame.addEventListener('load', () => {
    const w = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!w || !doc) return;

    let tries = 0;
    const install = async () => {
      if (!w.GungiAutoEvents || !w.GUNGI_DIALOGUES_V03 || !(w.GungiDialogueEngineV2 || w.GungiDialogueEngineV1)) {
        if (++tries < 100) setTimeout(install, 50);
        return;
      }

      try {
        await injectScript(doc, './gungi-events-v035-extension.js?v=0.3.5', 'events-v035');
        await injectScript(doc, './gungi-dialogue-events-v035.js?v=2.1.0-alpha.1', 'dialogue-events-v035');
        w.__ADV_EVENTS_V035_LOADED__ = true;
      } catch (error) {
        console.error('[ADV v0.3.5 extension]', error);
      }
    };

    install();
  });
})();
