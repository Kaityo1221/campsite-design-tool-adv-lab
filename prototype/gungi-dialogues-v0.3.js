(() => {
  'use strict';

  const D = (riku, cuts) => ({ riku, cuts });

  window.GUNGI_DIALOGUES_V03 = {
    DENSITY_01: D('surprised', [
      { speaker: 'system', text: 'POIが集中している地点があります。' },
      { speaker: 'riku', text: 'ここに人が集中するな。滞留が生まれるかもしれない。' },
      { speaker: 'mina', text: 'でも、人が集まるってことはさ！それだけ魅力があるってことじゃん！' }
    ]),
    DENSITY_REST_01: D('normal', [
      { speaker: 'system', text: '密集地点の周辺に休憩・支援設備があります。' },
      { speaker: 'riku', text: '条件は悪くない。近くに休憩できる場所がある。長時間でも立て直せる。' },
      { speaker: 'mina', text: 'おおっ、ここなら休みながら遊べるね！' }
    ]),
    ENTRANCE_01: D('normal', [
      { speaker: 'system', text: '入口付近に追加POIが集まっています。' },
      { speaker: 'riku', text: 'アクセスはいい。だが、入口の人流とぶつかる可能性がある。' },
      { speaker: 'mina', text: '初めて来る人にはめっちゃ分かりやすいよ！' }
    ]),
    LOOP_01: D('curious', [
      { speaker: 'system', text: '複数のPOIが周回しやすい形でつながっています。' },
      { speaker: 'riku', text: '周回できる。参加者を一か所に留めずに済みそうだ。' },
      { speaker: 'mina', text: 'いいじゃん！ぐるっと歩いて遊べるよ！' }
    ]),
    NARROW_PATH_01: D('surprised', [
      { speaker: 'system', text: '狭い通路・橋・木道などに関係する可能性がある候補があります。' },
      { speaker: 'riku', text: '地図上では狭い通路に関係しそうだ。実際にここを通るのか、立ち止まるのか確認したい。' },
      { speaker: 'mina', text: '近くにあるだけかもしれないしね。現地の動き方を見て決めよう！' }
    ]),
    PARKING_01: D('surprised', [
      { speaker: 'system', text: '駐車場・ロータリー・車両動線に近い可能性がある候補があります。' },
      { speaker: 'riku', text: '地図上では車両動線に近いな。実際の歩行ルートや滞留位置を確認しておこうか。' },
      { speaker: 'mina', text: '気をつけて歩いてね⭐︎右見て左' }
    ]),
    PLAYGROUND_01: D('curious', [
      { speaker: 'system', text: '遊具に関係するPOIがまとまっています。' },
      { speaker: 'riku', text: '遊具の周りは子どもや家族が長く使う。POIを置くなら、その流れを塞がない配置にしたい。' },
      { speaker: 'mina', text: 'でも遊具がまとまってるのは強いよ！歩いて来た先に、ちゃんと遊ぶ理由がある！' }
    ]),
    PARK_PLAZA_01: D('normal', [
      { speaker: 'system', text: '公園・広場・芝生に関係する候補があります。' },
      { speaker: 'riku', text: '広さはある。集合と移動を分けやすそうだ。' },
      { speaker: 'mina', text: 'こういう余白がある場所、みんなで動きやすいね！' }
    ]),
    REST_01: D('normal', [
      { speaker: 'system', text: '休憩・支援設備の候補があります。' },
      { speaker: 'riku', text: '休める場所があるのは大きい。長く歩く設計でも途中で立て直せる。' },
      { speaker: 'mina', text: '休憩できるなら、もう一周いける人も増えそう！' }
    ]),
    REST_SHORTAGE_01: D('surprised', [
      { speaker: 'system', text: '活動候補に対して休憩・支援候補が少ない可能性があります。' },
      { speaker: 'riku', text: '活動候補は多いのに休憩が見当たらない。長時間運用では弱点になる。' },
      { speaker: 'mina', text: '楽しくても休めないと疲れちゃうね。途中で一息つける場所を探そ！' }
    ]),
    TRANSIT_01: D('normal', [
      { speaker: 'system', text: '駅・停留所など交通アクセスの候補があります。' },
      { speaker: 'riku', text: 'アクセスは強い。ただし駅や停留所の人流とはぶつけたくない。' },
      { speaker: 'mina', text: '来やすいのは最高！集合場所とのつなぎ方を考えよう！' }
    ]),
    LANDMARK_CLUSTER_01: D('curious', [
      { speaker: 'system', text: 'ランドマーク候補が複数あります。' },
      { speaker: 'riku', text: '目印が複数ある。集合やルート説明に使いやすい。' },
      { speaker: 'mina', text: '「あれの前集合！」ができるの、めっちゃ分かりやすい！' }
    ]),
    ART_CLUSTER_01: D('curious', [
      { speaker: 'system', text: 'アート・彫刻などの候補が複数あります。' },
      { speaker: 'riku', text: 'アートが連続しているな。点ではなく、歩く理由としてつなげられそうだ。' },
      { speaker: 'mina', text: '作品を順番に見て回るだけで、小さな散策コースになるね！' }
    ]),
    HISTORY_CLUSTER_01: D('curious', [
      { speaker: 'system', text: '歴史・文化に関係する候補が複数あります。' },
      { speaker: 'riku', text: '歴史・文化のPOIがまとまっている。場所の背景まで含めてルートにできる。' },
      { speaker: 'mina', text: 'ただ歩くだけじゃなくて、この街の物語を拾えるね！' }
    ]),
    RELIGIOUS_01: D('normal', [
      { speaker: 'system', text: '寺社・宗教施設に関係する候補があります。' },
      { speaker: 'riku', text: '寺社や宗教施設は空間の使われ方が独特だ。滞留やイベント利用は慎重に見たい。' },
      { speaker: 'mina', text: '静かに楽しむ場所なら、その雰囲気を壊さない歩き方にしよう。' }
    ]),
    COMMERCIAL_CLUSTER_01: D('normal', [
      { speaker: 'system', text: '商業施設の候補が複数あります。' },
      { speaker: 'riku', text: '一般利用者の流れが強い。混雑時間と導線の重なりは確認したい。' },
      { speaker: 'mina', text: 'お店が多いなら寄り道も楽しいね。遊ぶ人と買い物する人が共存できる形にしよ！' }
    ]),
    FOOD_SUPPLY_01: D('normal', [
      { speaker: 'system', text: '飲食・補給に使えそうな候補があります。' },
      { speaker: 'riku', text: '補給できる場所がある。長時間の回遊を支える条件になる。' },
      { speaker: 'mina', text: '食べたり飲んだりできるなら、休憩も含めて楽しめるね！' }
    ]),
    LARGE_COMMERCIAL_01: D('surprised', [
      { speaker: 'system', text: '大型商業施設内に関係する可能性があります。' },
      { speaker: 'riku', text: '大型商業施設内なら営業時間や施設ルールの影響が大きい。屋外と同じ感覚では見ない方がいい。' },
      { speaker: 'mina', text: 'でも天気に左右されにくいのは魅力だね。施設のルールを守って使えたら強い！' }
    ]),
    WATER_01: D('curious', [
      { speaker: 'system', text: '水辺・噴水・井戸などに関係する候補があります。' },
      { speaker: 'riku', text: '水辺は魅力がある分、安全と通行条件を確認したい。' },
      { speaker: 'mina', text: '景色が変わるポイントだ！歩いてて「来た！」って感じが出るね！' }
    ]),
    TOURIST_CLUSTER_01: D('curious', [
      { speaker: 'system', text: '観光性の高いPOIが複数あります。' },
      { speaker: 'riku', text: '観光POIが集中している。来訪者の波が大きい時間帯は注意したい。' },
      { speaker: 'mina', text: '見どころが続くなら、初めて来た人にもワクワクするルートになる！' }
    ]),
    SAME_TYPE_BURST_01: D('curious', [
      { speaker: 'system', text: '同じ種類のPOIがまとまっています。' },
      { speaker: 'riku', text: 'おい！この辺は［{category}］が多いぞ。これは地域の特色として使えるかもしれない。' },
      { speaker: 'mina', text: 'ほんとだ！同じ系統が続くなら、テーマを決めて歩くのも楽しそう！' }
    ]),
    ATTRIBUTE_SKEW_01: D('curious', [
      { speaker: 'system', text: 'POI属性に大きな偏りがあります。' },
      { speaker: 'riku', text: '構成がかなり片寄っているな。特色なのか、単調さにつながるのか見たい。' },
      { speaker: 'mina', text: '偏ってるなら逆に「ここはこれが主役！」って見せ方もできそう！' }
    ]),
    LANDMARK_SHORTAGE_01: D('surprised', [
      { speaker: 'system', text: '活動候補に対して集合時の目印が少ない可能性があります。' },
      { speaker: 'riku', text: '活動候補はあるのに、集合の目印が弱い。初参加の人が迷うかもしれない。' },
      { speaker: 'mina', text: 'じゃあ「ここを目印にする！」って場所を一つ決めようよ！' }
    ]),
    FAVORABLE_COMPOSITE_01: D('curious', [
      { speaker: 'system', text: '回遊・休憩・アクセスなど複数の好条件がそろっています。' },
      { speaker: 'riku', text: '回遊、休憩、アクセス、目印。条件がかなり揃っている。' },
      { speaker: 'mina', text: 'これは強い！歩いて、休んで、また遊べる流れが作れそう！' }
    ])
  };
})();
