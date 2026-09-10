(() => {
  'use strict';

  const base = window.GungiDialogueEngineV2 || window.GungiDialogueEngineV1;
  if (!base || window.__ADV_DIALOGUE_EVENTS_V035__) return;

  const VERSION = '2.1.0-alpha.1';
  const HISTORY_LIMIT = 12;

  const BANK = Object.freeze({
    SHADE_01: {
      riku: ['ここ、日差しを避けられそうだな。', '屋根があるなら休みやすそうだ。', '暑い日はこういう場所が助かるな。'],
      mina: ['ちょっと休むのにも良さそうだね！', '日差しを避けられると安心だね！', 'ここなら少し涼めそう！']
    },
    TOILET_01: {
      riku: ['トイレの場所は押さえておこう。', '長く遊ぶなら、ここは覚えておきたいな。', 'トイレがあるのは安心材料だ。'],
      mina: ['先に分かってると安心だね！', 'これは覚えておきたい！', '長く遊ぶ時に助かるね！']
    },
    WATER_SUPPLY_01: {
      riku: ['飲み物を補給できそうだな。', 'ここで水分を確保できそうだ。', '補給場所があるのは助かるな。'],
      mina: ['飲み物切れた時に助かるね！', 'ここで水分補給できそう！', '暑い日にはありがたいね！']
    },
    DEAD_END_01: {
      riku: ['この先、行き止まりかもしれないな。', 'ここは抜けられるか確認したいな。', '終点っぽい。現地で見ておこう。'],
      mina: ['ここは現地で確認したいね。', 'ちゃんと抜けられるか見ておこう！', '戻るルートも考えておくと安心だね。']
    },
    LONG_GAP_01: {
      riku: ['次まで少し間があるな。', 'ここは次のPOIまで距離があるな。', 'この区間、少し間が空いているな。'],
      mina: ['途中に楽しみを入れられるといいね！', '間にひとつ楽しみがあると良さそう！', '途中にも寄れる場所があると楽しいね！']
    },
    REST_BALANCE_01: {
      riku: ['途中にも休める場所があるな。', '休憩場所が散っているのはいいな。', '途中で休める場所を選べそうだ。'],
      mina: ['疲れる前に休めるのいいね！', '好きなところで休めそう！', '途中でひと息つけるね！']
    },
    TRANSIT_ENTRANCE_01: {
      riku: ['交通拠点から入口まで分かりやすそうだ。', '着いてから入口まで迷いにくそうだな。', 'アクセスから入口までつながっているな。'],
      mina: ['着いて、そのまま入れるのいいね！', '初めてでも分かりやすそう！', '集合まで迷いにくそうだね！']
    },
    LANDMARK_ENTRANCE_01: {
      riku: ['入口の近くに分かりやすい目印があるな。', '入口と目印が近い。案内しやすそうだ。', 'ここなら集合場所を説明しやすいな。'],
      mina: ['集合場所を伝えやすそう！', '「あの目印の近く！」って言えるね！', '初めてでも見つけやすそう！']
    },
    PLAYGROUND_DENSITY_01: {
      riku: ['遊具の近くにPOIが集まっているな。', '遊具まわりは人が集まりやすそうだ。', 'ここは子どもの動きも見ておきたいな。'],
      mina: ['子どもたちの動く場所は空けておきたいね。', '遊具の近くでは広がりすぎないようにしよ！', '遊んでる子の邪魔にならないようにしたいね！']
    },
    PARKING_ENTRANCE_01: {
      riku: ['入口の近くに車の動線があるな。', '入口と駐車場が近いな。', 'ここは人と車の流れを分けたいな。'],
      mina: ['集まる場所は少し離した方が安心だね。', '車の出入りには気をつけたいね！', '歩く場所はちゃんと確保したいね！']
    },
    LOOP_REST_01: {
      riku: ['途中で休むなら、ここが良さそうだな。', '一周の途中で休むならここだな。', 'ここを休憩ポイントにできそうだ。'],
      mina: ['ひと休みする場所にちょうどいいね！', 'ここでちょっと休めるね！', '一周の途中で休めるのいいね！']
    }
  });

  let recent = [];
  let seed = Date.now() >>> 0;

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(list, key) {
    const unseen = list.filter(text => !recent.includes(text));
    const pool = unseen.length ? unseen : list;
    const text = pool[hash(`${seed}:${key}:${recent.length}`) % pool.length];
    recent.push(text);
    if (recent.length > HISTORY_LIMIT) recent.shift();
    return text;
  }

  function replaceFirst(cuts, speaker, text) {
    let done = false;
    return (cuts || []).map(cut => {
      if (!done && cut?.speaker === speaker) {
        done = true;
        return { ...cut, text };
      }
      return { ...cut };
    });
  }

  function resolve(event, basePresentation, context = {}) {
    const eventId = event?.id;
    const bank = BANK[eventId];
    if (!bank) return base.resolve ? base.resolve(event, basePresentation, context) : basePresentation;
    if (!basePresentation) return basePresentation;

    let cuts = (basePresentation.cuts || []).map(cut => ({ ...cut }));
    cuts = replaceFirst(cuts, 'riku', pick(bank.riku, `${eventId}:riku:${context.eventIndex || 0}`));
    cuts = replaceFirst(cuts, 'mina', pick(bank.mina, `${eventId}:mina:${context.eventIndex || 0}`));

    return {
      ...basePresentation,
      cuts,
      dialogueMeta: {
        engine: VERSION,
        eventId,
        tags: ['events-v035'],
        variantMode: 'curated-event-extension'
      }
    };
  }

  function reset(nextSeed) {
    recent = [];
    seed = Number.isFinite(Number(nextSeed)) ? Number(nextSeed) >>> 0 : Date.now() >>> 0;
    base.reset?.(nextSeed);
  }

  const extensionBankSize = Object.values(BANK)
    .reduce((sum, item) => sum + item.riku.length + item.mina.length, 0);

  window.GungiDialogueEngineV2 = Object.freeze({
    ...base,
    version: VERSION,
    mode: 'curated-situation-selection+events-v035',
    resolve,
    reset,
    extensionBankSize,
    totalCuratedLines: Number(base.totalCuratedLines || 0) + extensionBankSize
  });
  window.__ADV_DIALOGUE_EVENTS_V035__ = true;
})();
