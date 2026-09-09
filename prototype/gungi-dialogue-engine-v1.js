(() => {
  'use strict';

  const VERSION = '1.0.0-alpha.1';
  const HISTORY_LIMIT = 10;

  const BANK = {
    DENSITY_01: {
      riku: [
        'ここはかなり集まっているな。人が止まる場所と通る場所を分けて見たい。',
        'POIの密度は高い。魅力はあるが、滞留が一か所に寄りすぎないか確認しよう。',
        '集まり方が強いな。実際の人流まで重なると詰まりやすくなる。'
      ],
      mina: [
        'わ、ここ賑やか！でも、みんなが同じ場所に固まりすぎない工夫は欲しいね。',
        '人が集まる理由はちゃんとありそう！あとは動きやすくできるかだね。',
        'ここ人気スポットになりそう！少し散らせたらもっと遊びやすそう。'
      ]
    },
    DENSITY_REST_01: {
      riku: [
        '密集はしているが、近くに休める場所がある。長時間運用では助かる条件だ。',
        '人が集まりやすい場所に休憩候補もあるな。滞留の逃がし先として使えるかもしれない。',
        '密度は高い。ただ、休憩できる余白があるなら設計の自由度は上がる。'
      ],
      mina: [
        'ここなら遊んで、疲れたらすぐ休めるね！',
        'にぎやかだけど休める場所もある！バランスいいかも。',
        '休憩ポイントが近いの強いね。もう一周する人も出そう！'
      ]
    },
    ENTRANCE_01: {
      riku: [
        '入口は分かりやすい。その分、通行と集合が重ならない配置にしたい。',
        'アクセスは強いな。最初に人が溜まる場所だから、入口そのものは塞ぎたくない。',
        '集合地点としては説明しやすい。ただし出入りの流れは優先して残そう。'
      ],
      mina: [
        '初めて来た人でも見つけやすそう！',
        '「ここ集合！」って言いやすい場所だね。入口を邪魔しない形にできたら最高！',
        '迷いにくいのは大きいね！最初の一歩が分かりやすい。'
      ]
    },
    LOOP_01: {
      riku: [
        '周回できる形になっている。人を一か所に留めず流せそうだ。',
        '行って戻るだけじゃなく、回れるな。滞留を分散しやすい構成だ。',
        'ルートとしてつながっている。途中で詰まらないか現地で見れば、かなり使いやすそうだ。'
      ],
      mina: [
        'ぐるっと回れる！歩くこと自体が遊びになりそう。',
        'いいね、次の場所が自然につながってる！',
        '一本道じゃないの楽しいね。気づいたら一周してそう！'
      ]
    },
    NARROW_PATH_01: {
      riku: [
        'この区間は狭そうだ。立ち止まる場所にはせず、通過前提で考えたい。',
        '幅が取れない可能性がある。人が増えた時のすれ違いを確認しよう。',
        'ここは地図だけでは決めにくいな。現地で道幅と通行量を見たい。'
      ],
      mina: [
        'ここはサッと通る感じがよさそうだね。',
        '細いなら、みんなで固まらないようにしたいね。',
        '近くにあるだけかも！現地で「止まれる場所か」を見よう。'
      ]
    },
    PARKING_01: {
      riku: [
        '車の動線に近いな。歩行ルートと交差しないかを優先して確認しよう。',
        '駐車場まわりは見た目以上に車が動く。滞留地点には慎重になりたい。',
        'アクセスには使えるが、遊ぶ場所とは分けて考えた方がいい。'
      ],
      mina: [
        '車が来る場所なら、遊ぶ場所はちゃんと離したいね。',
        '来やすいのはいいけど、安全第一でいこう！',
        'ここは歩く人と車の道を分けて見よう。'
      ]
    },
    PLAYGROUND_01: {
      riku: [
        '遊具の利用者が優先だ。周囲の動線を塞がない配置にしたい。',
        '家族利用が長く続く場所だな。POI目的の滞留とぶつからないか見よう。',
        '遊具がまとまっている。近づけすぎず、少し外側から活かす方が安全かもしれない。'
      ],
      mina: [
        '子どもたちが使う場所だもんね。遊具の邪魔はしたくない！',
        'ここ自体は楽しい場所！周りからうまくつなげたいね。',
        '家族で来ても楽しめそう。みんなが使いやすい距離感にしよ！'
      ]
    },
    PARK_PLAZA_01: {
      riku: [
        '余白がある。集合と移動を分けやすそうだ。',
        '広場として使えるなら、人の流れを逃がしやすい。',
        '面で使える場所だな。入口と出口を分ける設計もできそうだ。'
      ],
      mina: [
        '広い！ここならみんな動きやすそう。',
        '余白があるっていいね。集合してから散る流れも作れそう！',
        'こういう場所が一つあると安心感あるね。'
      ]
    },
    REST_01: {
      riku: [
        '休憩できる場所がある。長時間の回遊には重要だ。',
        '途中で立て直せる地点があるな。ルートに組み込みやすい。',
        '休憩候補を確保できている。暑さや疲労を考えると大きい。'
      ],
      mina: [
        'ここで一息つけるね！',
        '休める場所があると安心して歩けるね。',
        'ちょっと座って、また出発できる。いい流れ！'
      ]
    },
    REST_SHORTAGE_01: {
      riku: [
        '活動候補に対して休憩地点が弱い。長時間運用なら補いたい。',
        '歩ける場所はあるが、休む場所が見えないな。ここは課題として残る。',
        '動線は作れても、休憩がないと持続しない。別の候補を探そう。'
      ],
      mina: [
        '楽しく歩けても、ずっと休めないのはつらいね。',
        'どこかに「ここで一息！」って場所が欲しいな。',
        '休憩ポイント、一個でも見つけたいね！'
      ]
    },
    TRANSIT_01: {
      riku: [
        '交通アクセスは強い。ただし駅や停留所の通行を塞がないことが前提だ。',
        '来場しやすさは十分ある。集合地点は交通動線から少し外したい。',
        '入口としては優秀だな。到着後に自然に公園側へ流せるか見よう。'
      ],
      mina: [
        '来やすいのはめちゃくちゃ大事！',
        '駅から分かりやすいなら、初参加の人も安心だね。',
        '着いてすぐ迷わない流れにできたらいいね！'
      ]
    },
    LANDMARK_CLUSTER_01: {
      riku: [
        '目印が複数ある。集合案内やルート説明に使いやすい。',
        '視認できる基準点が多いな。初参加者への説明が楽になる。',
        'ランドマークを順番に使えば、現在地を見失いにくいルートにできる。'
      ],
      mina: [
        '「あれの前！」って言える場所がいっぱいある！',
        '目印があると迷子になりにくいね。',
        '説明しやすい場所って、参加する側も安心するよね！'
      ]
    },
    ART_CLUSTER_01: {
      riku: [
        'アートが連続している。POI同士をテーマでつなげられそうだ。',
        '作品が点ではなく並びになっているな。歩く理由として使える。',
        '同じ系統の見どころが続く。ルートに物語を持たせやすい。'
      ],
      mina: [
        '作品を見ながら歩けるの楽しそう！',
        'これ、ちょっとしたアート散歩にできるね。',
        '次は何があるんだろうって進みたくなる！'
      ]
    },
    HISTORY_CLUSTER_01: {
      riku: [
        '歴史・文化の候補がまとまっている。場所の背景も含めて案内できる。',
        '地域の文脈が見えるな。単なるPOI巡り以上の意味を持たせられる。',
        '文化的な地点が続いている。ルートのテーマを作りやすい。'
      ],
      mina: [
        'この街のことを知りながら歩けるね！',
        'ただ通るだけじゃなくて、ちょっと発見があるのいいな。',
        'ここなら「街を知る散歩」っぽくできそう！'
      ]
    },
    RELIGIOUS_01: {
      riku: [
        '寺社・宗教施設は利用目的が明確な場所だ。イベント側が前に出すぎないようにしたい。',
        '静けさを優先したい場所だな。滞留や大人数の動きは慎重に見よう。',
        '使えるかどうかより、まず通常利用を妨げないことを確認したい。'
      ],
      mina: [
        'ここは雰囲気を大事にしたいね。',
        '静かに歩く場所なら、その空気を壊さないようにしよう。',
        '遊ぶ側が場所に合わせる感じだね。'
      ]
    },
    COMMERCIAL_CLUSTER_01: {
      riku: [
        '一般利用者の流れが強い場所だ。混雑時間帯を確認したい。',
        '店舗利用とイベント参加の動線が重なる可能性がある。通路幅を見よう。',
        '商業エリアは便利だが、占有しているように見えない設計が必要だ。'
      ],
      mina: [
        '寄り道できるの楽しそう！でも買い物する人の邪魔はしないようにね。',
        'お店があると休憩もできそう。混む時間だけ気をつけたい！',
        '街歩き感が出るね。自然に通れるルートにしよ！'
      ]
    },
    FOOD_SUPPLY_01: {
      riku: [
        '補給できる場所がある。長時間運用を支える条件になる。',
        '飲食や給水の候補があるな。休憩地点と合わせて見たい。',
        '途中で補給できるなら、ルート全体の負担を下げられる。'
      ],
      mina: [
        '飲み物買えるの助かる！',
        '歩いたあとにちょっと補給できるのいいね。',
        '休憩とセットにしたら使いやすそう！'
      ]
    },
    LARGE_COMMERCIAL_01: {
      riku: [
        '大型施設内なら営業時間と施設ルールの影響が大きい。屋外と同じ扱いにはできない。',
        '天候には強いが、運用条件は施設側に左右される。確認事項が多い場所だ。',
        '使える時間と通行ルールを先に押さえたい。そこが成立条件になる。'
      ],
      mina: [
        '雨でも動けるのはいいね！でも施設のルール優先だね。',
        '便利そう！ちゃんと使える時間を確認しておこう。',
        '屋内って強いけど、自由に使えるとは限らないもんね。'
      ]
    },
    WATER_01: {
      riku: [
        '水辺は魅力がある。足元と柵、通行条件を現地で確認したい。',
        '景観は強いが、安全面の確認が必要だ。特に夜間や雨天は見ておこう。',
        'ルートの変化としては良い。ただし水際に人を溜めない設計にしたい。'
      ],
      mina: [
        '景色が変わると歩いてて楽しいね！',
        '水辺って「ここまで来た！」感があるね。',
        '写真撮りたくなる場所かも。安全な位置から楽しみたい！'
      ]
    },
    TOURIST_CLUSTER_01: {
      riku: [
        '観光性の高い地点がまとまっている。来訪者の波を考えたい。',
        '見どころは十分ある。混雑時間だけ外せれば強いルートになりそうだ。',
        '初訪問の人には魅力的だな。一般観光客との共存を前提に設計しよう。'
      ],
      mina: [
        '初めて来た人でも楽しめそう！',
        '見どころが続くと歩くの楽しいよね。',
        '観光しながら遊べる感じ、いいね！'
      ]
    },
    SAME_TYPE_BURST_01: {
      riku: [
        'この辺は［{category}］が多い。地域の特色として使えるかもしれない。',
        '［{category}］が連続しているな。単調さではなくテーマとして成立するか見たい。',
        '同じ属性が目立つ。［{category}］を軸にルートを組む選択肢もある。'
      ],
      mina: [
        'ほんとだ、［{category}］だらけ！テーマ散歩にできそう。',
        'ここまで揃うと逆に個性だね！',
        '［{category}］を探しながら歩くのも楽しそう！'
      ]
    },
    ATTRIBUTE_SKEW_01: {
      riku: [
        '属性がかなり偏っている。特色なのか不足なのか、全体で判断したい。',
        '構成に偏りがあるな。足りない役割がないか確認しよう。',
        '同じ性格のPOIが多い。回遊・休憩・目印のバランスも見たい。'
      ],
      mina: [
        '偏ってるなら「ここはこれ！」って個性にもできるね。',
        '同じ感じが続くなら、途中に違う要素も欲しいかも！',
        '強みとして使うか、バランスを足すかだね。'
      ]
    },
    LANDMARK_SHORTAGE_01: {
      riku: [
        '活動候補はあるが、集合の目印が弱い。初参加者が迷う可能性がある。',
        '現在地を説明する基準点が少ないな。集合場所は別途決めたい。',
        'ルートは作れても入口説明が難しい。分かりやすい目印を一つ確保しよう。'
      ],
      mina: [
        '「ここ集合！」って言えるもの、一つ欲しいね。',
        '初めての人が迷わない目印を探そう！',
        '分かりやすい場所を一個決めるだけでも安心感ぜんぜん違うよ。'
      ]
    },
    FAVORABLE_COMPOSITE_01: {
      riku: [
        '回遊、休憩、アクセス、目印。複数の条件が揃っている。かなり組みやすい。',
        '必要な要素が一つだけでなく重なっている。全体設計の自由度が高い。',
        '条件の噛み合わせがいいな。現地確認で大きな問題がなければ有力だ。'
      ],
      mina: [
        'これ強い！歩いて、休んで、また遊べる流れが作れそう！',
        'いろんな条件がちゃんとつながってるね！',
        'ここ、かなり楽しそうな形にできそう！'
      ]
    }
  };

  let recentTexts = [];
  let recentEvents = [];
  let sessionSeed = Date.now() >>> 0;

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(list, key) {
    if (!Array.isArray(list) || !list.length) return null;
    const unseen = list.filter(text => !recentTexts.includes(text));
    const pool = unseen.length ? unseen : list;
    const index = hash(`${sessionSeed}:${key}:${recentTexts.length}`) % pool.length;
    const text = pool[index];
    recentTexts.push(text);
    if (recentTexts.length > HISTORY_LIMIT) recentTexts.shift();
    return text;
  }

  function getTags(event, context = {}) {
    const tags = [];
    const index = Number(context.eventIndex || 0);
    const total = Number(context.eventTotal || 0);
    const metrics = event?.metrics || {};
    if (index === 0) tags.push('first');
    if (total > 0 && index >= total - 2) tags.push('late');
    if (recentEvents.includes(event?.id)) tags.push('repeat-event');
    if (Number(metrics.count || metrics.total || 0) >= 8) tags.push('strong-signal');
    if (/SHORTAGE|NARROW|PARKING|RELIGIOUS|LARGE_COMMERCIAL/.test(String(event?.id || ''))) tags.push('caution');
    if (/FAVORABLE|REST|LOOP|PARK_PLAZA|LANDMARK_CLUSTER/.test(String(event?.id || ''))) tags.push('positive');
    return tags;
  }

  function replaceSpeakerCut(baseCuts, speaker, text) {
    let replaced = false;
    const cuts = (baseCuts || []).map(cut => {
      if (!replaced && cut?.speaker === speaker && text) {
        replaced = true;
        return { ...cut, text };
      }
      return { ...cut };
    });
    return cuts;
  }

  function resolve(event, basePresentation, context = {}) {
    const eventId = event?.id;
    if (!eventId || !basePresentation) return basePresentation;
    const bank = BANK[eventId];
    if (!bank) return basePresentation;

    const tags = getTags(event, context);
    let cuts = (basePresentation.cuts || []).map(cut => ({ ...cut }));
    const riku = pick(bank.riku, `${eventId}:riku:${tags.join(',')}:${context.eventIndex || 0}`);
    const mina = pick(bank.mina, `${eventId}:mina:${tags.join(',')}:${context.eventIndex || 0}`);
    cuts = replaceSpeakerCut(cuts, 'riku', riku);
    cuts = replaceSpeakerCut(cuts, 'mina', mina);

    recentEvents.push(eventId);
    if (recentEvents.length > HISTORY_LIMIT) recentEvents.shift();

    return {
      ...basePresentation,
      cuts,
      dialogueMeta: {
        engine: VERSION,
        eventId,
        tags,
        variantMode: 'curated-context-selection'
      }
    };
  }

  function reset(seed) {
    recentTexts = [];
    recentEvents = [];
    sessionSeed = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Date.now() >>> 0;
  }

  window.GungiDialogueEngineV1 = Object.freeze({
    version: VERSION,
    mode: 'curated-context-selection',
    resolve,
    reset,
    getTags,
    bankSize: Object.values(BANK).reduce((sum, item) => sum + (item.riku?.length || 0) + (item.mina?.length || 0), 0)
  });
})();
