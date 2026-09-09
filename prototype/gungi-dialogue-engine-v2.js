(() => {
  'use strict';

  const VERSION = '2.0.0-alpha.1';
  const HISTORY_LIMIT = 14;

  const EVENT_TAGS = Object.freeze({
    DENSITY_01: 'with-density',
    DENSITY_REST_01: 'with-density-rest',
    ENTRANCE_01: 'with-entrance',
    LOOP_01: 'with-loop',
    NARROW_PATH_01: 'with-narrow',
    PARKING_01: 'with-parking',
    PLAYGROUND_01: 'with-playground',
    PARK_PLAZA_01: 'with-plaza',
    REST_01: 'with-rest',
    REST_SHORTAGE_01: 'with-rest-shortage',
    TRANSIT_01: 'with-transit',
    LANDMARK_CLUSTER_01: 'with-landmark',
    ART_CLUSTER_01: 'with-art',
    HISTORY_CLUSTER_01: 'with-history',
    RELIGIOUS_01: 'with-religious',
    COMMERCIAL_CLUSTER_01: 'with-commercial',
    FOOD_SUPPLY_01: 'with-food',
    LARGE_COMMERCIAL_01: 'with-large-commercial',
    WATER_01: 'with-water',
    TOURIST_CLUSTER_01: 'with-tourist',
    SAME_TYPE_BURST_01: 'with-same-type',
    ATTRIBUTE_SKEW_01: 'with-skew',
    LANDMARK_SHORTAGE_01: 'with-landmark-shortage',
    FAVORABLE_COMPOSITE_01: 'with-favorable'
  });

  const S = (key, requires, riku, mina) => ({ key, requires, riku, mina });

  const SCENARIOS = Object.freeze({
    DENSITY_01: [
      S('entrance-crowd', ['with-entrance'], [
        '入口と密集が重なっている。集合地点を少し外へ逃がした方が流れはきれいだ。',
        '入口で人が止まる形になりそうだ。入る人と待つ人を分けたい。'
      ], [
        '入口がそのまま人だまりになるのは避けたいね。ちょっと横に逃がそ！',
        '分かりやすい場所だけど、入口はちゃんと空けておきたいね。'
      ]),
      S('loop-relief', ['with-loop'], [
        '密集は強いが周回先がある。次の地点へ自然に流せれば滞留を減らせる。',
        'ここで集まっても、回遊導線へ送れるなら一か所に固定されにくい。'
      ], [
        'ここで集まって、そこからぐるっと流せるなら良さそう！',
        '混む場所をスタートにして、次へ動かす感じだね！'
      ]),
      S('very-dense', ['very-dense'], [
        '密集度がかなり高い。魅力より先に、立ち止まり方を確認したい。',
        'ここは強い密集だ。全員が同じ地点を目指す設計にはしない方がいい。'
      ], [
        'かなり集まってるね！遊ぶ場所を少し散らした方が気持ちよさそう。',
        'ここだけ人気者すぎる！周りにも役割を分けたいね。'
      ])
    ],
    DENSITY_REST_01: [
      S('rest-loop', ['with-loop'], [
        '密集、休憩、回遊がそろっている。休んだ人を次のルートへ戻しやすい。',
        '休憩地点が回遊の途中にあるなら、滞留の終点ではなく中継点にできる。'
      ], [
        '休んで終わりじゃなくて、また歩き出せる形だね！',
        'ここで一息ついて、次へ行けるのすごく自然！'
      ]),
      S('rest-transit', ['with-transit'], [
        '交通拠点の近くで休憩も取れる。集合直後の待機場所として使えるか確認したい。',
        '到着後すぐ休めるのは強い。ただし交通動線からは少し外したい。'
      ], [
        '着いてすぐ休める場所があるの安心だね！',
        '待ち合わせもしやすそう。通る人の邪魔だけしないようにしよ！'
      ]),
      S('rest-rich', ['rest-rich'], [
        '休憩候補が複数ある。人を一つの設備へ集中させずに済みそうだ。',
        '休める選択肢が複数あるなら、混雑時の逃げ道として使える。'
      ], [
        '休める場所が何個かある！好きなところで一息つけるね。',
        '休憩まで分散できるのいいね。みんな同じ場所に集まらなくて済む！'
      ])
    ],
    ENTRANCE_01: [
      S('transit-gateway', ['with-transit'], [
        '交通拠点から入口までつながっている。到着後の導線を短く説明できそうだ。',
        '駅や停留所から入口が分かりやすい。集合は通行帯から外して設けたい。'
      ], [
        '着いたらそのまま入口へ行ける！初参加でも迷いにくそう。',
        '駅からの説明がすごく簡単になりそうだね！'
      ]),
      S('landmark-gateway', ['with-landmark'], [
        '入口の近くに目印がある。集合案内の基準点として使いやすい。',
        '入口だけでなく視認できる目印もある。初参加者への説明がしやすい。'
      ], [
        '「入口のあの目印！」って言えるの強いね！',
        'これなら初めて来る人にも場所を伝えやすそう！'
      ]),
      S('crowded-gateway', ['with-density'], [
        '入口と密集が近い。集合地点を入口そのものに置くのは避けたい。',
        'アクセスは良いが、人が止まる場所を少し奥へずらした方が安全だ。'
      ], [
        '入口は分かりやすいけど、ここで全員止まるのは避けたいね。',
        '集合は入口のちょっと先にした方がスムーズかも！'
      ])
    ],
    LOOP_01: [
      S('loop-rest', ['with-rest'], [
        '回遊の途中に休憩を挟める。長時間でもペースを崩しにくい。',
        '歩く導線と休む地点がつながっている。運用しやすい構成だ。'
      ], [
        '歩いて、休んで、また歩ける！いいリズムだね。',
        '一周の途中でちゃんと休めるの助かるね！'
      ]),
      S('loop-landmark', ['with-landmark'], [
        '周回ルートに目印がある。分岐や折り返しの説明に使えそうだ。',
        '目印を節目にすれば、初参加者でも周回方向を理解しやすい。'
      ], [
        '目印を順番にたどれば迷いにくそう！',
        '「次はあそこ！」って見える周回、楽しそうだね。'
      ]),
      S('loop-density', ['with-density'], [
        '密集地点から回遊へ抜けられる。人をその場に留めない設計にできる。',
        '集まる場所と動く場所がつながっている。流れを作れば強い。'
      ], [
        '集まったら、そのまま次へ動かせるね！',
        'ここで止まりっぱなしじゃなくて、自然に一周へ入れる！'
      ])
    ],
    NARROW_PATH_01: [
      S('narrow-entrance', ['with-entrance'], [
        '入口直後が狭いなら、集合はここに置かない方がいい。通過帯として空けよう。',
        '出入りが集中する場所で幅が取れない。立ち止まりは禁止寄りで考えたい。'
      ], [
        '入口ですぐ細くなるなら、ここは止まらず通りたいね。',
        '集合はもっと広いところにしよ！ここは通る場所だね。'
      ]),
      S('narrow-density', ['with-density'], [
        '狭路の近くでPOIも密集している。人が止まる理由を減らしたい。',
        '密集と狭さが重なるのは注意だ。対象POIを少し散らせるか見よう。'
      ], [
        '細いところに人気が集まるのは怖いね。別の場所にも分けたい！',
        'ここは人を集めるより、サッと通れる形にしたいね。'
      ]),
      S('narrow-water', ['with-water'], [
        '狭い導線に水辺条件も重なる。現地の柵、路面、すれ違い幅まで確認したい。',
        '景観は良くても安全余白が少ない可能性がある。通過前提で見よう。'
      ], [
        '景色は良さそうだけど、足元と幅はちゃんと見たいね。',
        '水辺で細いなら、立ち止まる場所は別にしよう！'
      ])
    ],
    PARKING_01: [
      S('parking-entrance', ['with-entrance'], [
        '入口と駐車場動線が近い。歩行者が車路を横切らない集合位置を選びたい。',
        '到着はしやすいが、車から降りる人と徒歩参加者の流れを分けたい。'
      ], [
        '来やすいけど、車と歩く人の道はちゃんと分けようね。',
        '集合場所は駐車場の出口から少し離した方が安心！'
      ]),
      S('parking-transit', ['with-transit'], [
        '車と公共交通の両方から人が来る。合流点を安全な歩行空間に置きたい。',
        '複数の到着手段がある。入口前で交差させず、広い場所で合流させよう。'
      ], [
        '車組と電車組が同じところに集まれる場所を作りたいね！',
        'みんなの到着ルートが違うなら、最後だけ安全に合流しよ！'
      ]),
      S('parking-density', ['with-density'], [
        '車両動線の近くで密集している。滞留地点としては優先度を下げたい。',
        '人が集まる条件と車が動く条件が重なる。ここは分離を優先しよう。'
      ], [
        '人が集まるなら、車からもっと離したいね。',
        '便利でもここで固まるのは避けたい！'
      ])
    ],
    PLAYGROUND_01: [
      S('play-rest', ['with-rest'], [
        '遊具と休憩が近い。家族利用の滞在を邪魔しない外側の導線を作りたい。',
        '長く滞在する人が多い場所だ。休憩設備を占有しない配置にしよう。'
      ], [
        '家族でゆっくり使う場所だね。外側から楽しくつなげたい！',
        '遊具も休憩も使う人が多そう。みんなの場所として空けておこうね。'
      ]),
      S('play-density', ['with-density'], [
        '遊具周辺に密集が重なる。子どもの動線へ参加者を寄せすぎない方がいい。',
        '遊具利用とPOI目的の滞留がぶつかりそうだ。少し外周へ逃がしたい。'
      ], [
        '遊具の真ん中に人が集まる形は避けたいね。',
        '子どもたちが走る場所はちゃんと空けておこう！'
      ]),
      S('play-plaza', ['with-plaza'], [
        '遊具の近くに広場があるなら、集合は広場側へ分離できる。',
        '滞在は遊具、集合は広場。役割を分ければ使いやすい。'
      ], [
        '遊具で遊ぶ場所と、みんなが集まる場所を分けられるね！',
        '広場があるなら集合はそっちがよさそう！'
      ])
    ],
    PARK_PLAZA_01: [
      S('plaza-entrance', ['with-entrance'], [
        '入口の先に広い空間がある。集合を入口から一段奥へ逃がせる。',
        '入口を空けたまま集合できる余白がある。運用しやすい。'
      ], [
        '入口を塞がずに、その先で集まれるのいいね！',
        '入ってちょっと進んだところで集合できそう！'
      ]),
      S('plaza-rest', ['with-rest'], [
        '広場と休憩が近い。集合後の待機や離脱もしやすい。',
        '面で使える場所に休憩条件もある。長時間運用に向いている。'
      ], [
        '広くて休める！集合場所としてかなり使いやすそう。',
        '待ってる人も休めるなら安心だね。'
      ]),
      S('plaza-density', ['with-density'], [
        '密集していても広場なら逃がし方を作れる。中心一点に寄せない設計にしたい。',
        '空間はある。POI配置を面に散らせれば密集を和らげられる。'
      ], [
        '広いなら、みんなを一か所に固めなくて済みそう！',
        '人気ポイントを広場の中で散らせたらいいね。'
      ])
    ],
    REST_01: [
      S('rest-loop', ['with-loop'], [
        '休憩地点が回遊の途中にある。折り返さずに流れへ戻れる。',
        '休憩がルートから外れていない。歩行のリズムを崩しにくい。'
      ], [
        '休んだあと、そのまま続きへ行けるのいいね！',
        '一周の途中に休憩があると安心だね。'
      ]),
      S('rest-density', ['with-density'], [
        '密集地点に休憩がある。設備利用者とイベント滞留を重ねすぎないようにしたい。',
        '休めるのは強いが、全員をここへ集める設計にはしない方がいい。'
      ], [
        '休めるけど、ここだけ大集合にはしない方がよさそう！',
        '使う人が多そうだから、休憩スペースはちゃんと残そうね。'
      ]),
      S('rest-food', ['with-food'], [
        '休憩と補給が同じ区間にある。長時間活動の中継点として使いやすい。',
        '座る、飲む、再出発が一か所で完結する。運用上かなり強い。'
      ], [
        '休んで飲んで、また出発！いい中継地点だね。',
        'ここで回復してもう一周できそう！'
      ])
    ],
    REST_SHORTAGE_01: [
      S('shortage-loop', ['with-loop'], [
        '回遊できる分、歩行量は増える。休憩地点がないまま一周させるのは避けたい。',
        'ルートは作れるが休む場所がない。周回距離を短くする案も必要だ。'
      ], [
        'ぐるっと歩けるなら、途中で休める場所も欲しいね。',
        '一周が楽しくても休めないとつらい！休憩候補を探そ。'
      ]),
      S('shortage-play', ['with-playground'], [
        '遊具は休憩設備ではない。家族利用の場所を休憩代わりに扱わない方がいい。',
        '滞在場所はあるが、イベント参加者向けの休憩余地とは分けて考えよう。'
      ], [
        '遊具があるから休める、とは限らないもんね。',
        '家族の場所を借りるんじゃなくて、別の休憩先を探そう！'
      ]),
      S('shortage-late', ['late'], [
        '全体を見ても休憩候補が出てこない。これは最後まで残る設計課題だ。',
        '終盤まで確認したが休憩が弱い。提出前に現地で補完候補を探したい。'
      ], [
        '最後まで休憩場所が見つからないね。現地でもう一回探したい！',
        'ここだけは宿題として残しておこう。休める場所、見つけたいね。'
      ])
    ],
    TRANSIT_01: [
      S('transit-entrance', ['with-entrance'], [
        '交通拠点から入口までの流れが見える。初参加者向け案内は作りやすい。',
        '到着地点と入口がつながっている。途中の横断や混雑だけ確認しよう。'
      ], [
        '駅から入口まで一本で説明できそう！',
        '初めて来る人にも案内しやすそうだね。'
      ]),
      S('transit-landmark', ['with-landmark'], [
        '交通拠点の近くに目印がある。待ち合わせ案内の精度が上がる。',
        '「駅を出て目印へ」で説明できる。集合導線として強い。'
      ], [
        '駅を出て「あれ！」って言えるの、めっちゃ分かりやすい！',
        '待ち合わせ説明が短くできるね！'
      ]),
      S('transit-density', ['with-density'], [
        '交通拠点付近で密集している。一般利用者の流れと分ける必要がある。',
        'アクセスは良いが、駅前滞留にならないよう集合地点をずらしたい。'
      ], [
        '来やすいけど、駅前で固まるのは避けたいね。',
        '集合は少し歩いた先の広いところが良さそう！'
      ])
    ],
    LANDMARK_CLUSTER_01: [
      S('landmark-entrance', ['with-entrance'], [
        '入口と目印がセットになっている。集合案内の基準点としてかなり使いやすい。',
        '入口の位置をランドマークで説明できる。初参加者向けに強い。'
      ], [
        '入口の場所を目印で説明できる！これは迷いにくいね。',
        '「あれのところから入る！」で通じそう！'
      ]),
      S('landmark-loop', ['with-loop'], [
        'ランドマークを周回の節目にできる。方向転換や分岐の説明に使いやすい。',
        '目印を順番に結べば、ルート自体が覚えやすくなる。'
      ], [
        '目印を追って一周できるの楽しそう！',
        '「次はあれ！」って見ながら歩けるね。'
      ])
    ],
    ART_CLUSTER_01: [
      S('art-loop', ['with-loop'], [
        'アートが周回上に並ぶなら、作品を見ながら歩くテーマを作れる。',
        '回遊と作品鑑賞を重ねられる。POIが移動の理由になる。'
      ], [
        '作品を順番に見ながら一周できる！ちょっとした展覧会みたい。',
        '次の作品を探しながら歩くの楽しそう！'
      ]),
      S('art-tourist', ['with-tourist'], [
        '観光性とアートが重なる。一般来訪者の鑑賞動線を邪魔しない配置にしたい。',
        '見どころとして強い分、人が止まりやすい。滞留位置は少し外へ置こう。'
      ], [
        '見に来る人も多そう！作品の前はちゃんと空けておきたいね。',
        '人気スポットなら、見る人の邪魔にならない場所で遊ぼう！'
      ])
    ],
    HISTORY_CLUSTER_01: [
      S('history-landmark', ['with-landmark'], [
        '歴史POIと目印が重なる。地域の背景を説明する節目として使える。',
        '目印そのものに歴史性があるなら、ルートの物語を作りやすい。'
      ], [
        '目印を見ながら街の話もできるのいいね！',
        'ここ、ただの集合場所じゃなくて物語の入口にもできそう。'
      ]),
      S('history-tourist', ['with-tourist'], [
        '観光客も来る歴史地点なら、通常の見学動線を優先したい。',
        '魅力は強いが立ち止まりも多い。イベント側は少し控えめに使おう。'
      ], [
        '見に来る人の時間も大事にしたいね。',
        '人気の歴史スポットなら、ちょっと離れて楽しむのが良さそう！'
      ])
    ],
    RELIGIOUS_01: [
      S('religious-density', ['with-density'], [
        '寺社周辺で密集が起きるなら、通常参拝の流れを最優先にしたい。',
        '静けさが必要な場所に人を集める設計は避けよう。通過寄りで考えたい。'
      ], [
        'ここで大人数が固まるのは避けたいね。静かに通ろう。',
        '場所の空気を大事にして、集まるのは別のところにしよ。'
      ]),
      S('religious-transit', ['with-transit'], [
        '交通導線と寺社利用が重なる場所だ。イベント側の滞留余地は小さく見積もりたい。',
        '人の流れが複数ある。通行と参拝の両方を妨げないことが前提だ。'
      ], [
        'いろんな人が通る場所なら、こっちはコンパクトに動こう。',
        '参拝する人も通る人もいるね。止まらない方が良さそう！'
      ])
    ],
    COMMERCIAL_CLUSTER_01: [
      S('commercial-transit', ['with-transit'], [
        '交通と商業が重なる。時間帯による人流変化が大きそうだ。',
        '駅前商業ならピーク時は別物になる。混雑時間を現地確認したい。'
      ], [
        '時間で混み方が変わりそう！平日と休日も違いそうだね。',
        '駅とお店が近いなら、人が多い時間だけ気をつけたい！'
      ]),
      S('commercial-food', ['with-food'], [
        '飲食補給は強いが、店舗前を待機場所にしないようにしたい。',
        '補給先として使える。ただし買い物客の出入りを塞がない配置が必要だ。'
      ], [
        '寄り道できるのは楽しい！でもお店の入口は空けようね。',
        '休憩に使えそうだけど、買う人の邪魔はしないようにしよ！'
      ]),
      S('commercial-density', ['with-density'], [
        '商業エリアで密集が重なる。一般客の滞留と区別できる余白が必要だ。',
        '人が多い場所にさらに集める形は避けたい。回遊へ流そう。'
      ], [
        'ここは元から人が多そう。立ち止まらず次へ流れる方がよさそう！',
        '人気エリアなら、みんなを一か所に集めない方がいいね。'
      ])
    ],
    FOOD_SUPPLY_01: [
      S('food-rest', ['with-rest'], [
        '補給と休憩が近い。長時間活動の中継地点として成立しやすい。',
        '飲食と休憩を一つの区間で処理できる。参加者の負担を下げられる。'
      ], [
        '飲んで休んで、また出発できる！いい中継地点だね。',
        'ここで回復できるなら安心して歩けそう！'
      ]),
      S('food-loop', ['with-loop'], [
        '回遊の途中に補給地点がある。ルートから外れずに立て直せる。',
        '一周の途中で飲食できるなら、長めの導線も組みやすい。'
      ], [
        '一周の途中で飲み物買えるの助かる！',
        '歩きながら補給できるルート、かなりいいね。'
      ]),
      S('food-commercial', ['with-commercial'], [
        '商業エリアの補給候補だ。店舗利用者の流れを邪魔しない使い方に限定したい。',
        '便利だがイベント側の占有感は出したくない。短時間利用が前提だ。'
      ], [
        '買ったらサッと次へ、くらいが気持ちよさそう！',
        'お店はみんなの場所だから、長居しすぎないようにしよ。'
      ])
    ],
    LARGE_COMMERCIAL_01: [
      S('large-transit', ['with-transit'], [
        '大型施設と交通拠点が直結している可能性がある。施設ルールの影響が大きい。',
        'アクセスは非常に強いが、営業時間と館内導線を前提に設計する必要がある。'
      ], [
        '来やすさは最高だけど、施設のルール確認は必須だね。',
        '駅直結なら便利！でも営業時間に左右されるね。'
      ]),
      S('large-density', ['with-density'], [
        '館内で密集するなら、一般客との分離が難しい。ピーク時運用は避けたい。',
        '大型商業施設内の高密度は慎重に扱う。広く見えても通路は共有だ。'
      ], [
        '中が広くても、みんな同じ通路を使うもんね。',
        '混む時間は避けた方がよさそう。施設の人の流れを優先しよ！'
      ])
    ],
    WATER_01: [
      S('water-loop', ['with-loop'], [
        '水辺を周回の景観ポイントにできる。安全な通過導線が取れるか確認したい。',
        '景色の変化としては強い。滞留ではなくルートの節目として使うのがよさそうだ。'
      ], [
        '一周の途中で景色が変わるのいいね！',
        '水辺は「ここまで来た！」って感じが出るね。'
      ]),
      S('water-density', ['with-density'], [
        '水辺近くで密集するなら安全余白を大きく取りたい。',
        '魅力がある分、人が止まりやすい。縁や柵の近くへ集めないようにしよう。'
      ], [
        '景色が良くても、端っこにみんな集まるのは避けたいね。',
        '水辺はちょっと広めに距離を取って楽しもう！'
      ]),
      S('water-rest', ['with-rest'], [
        '水辺と休憩が近い。景観を楽しめる一方、設備利用者の占有は避けたい。',
        '休憩ポイントとして魅力はある。イベント専用の場所にはしないことが前提だ。'
      ], [
        '景色を見ながら休めるのいいね！でもみんなで占領はしないようにね。',
        'ここで一息つけたら気持ちよさそう！'
      ])
    ],
    TOURIST_CLUSTER_01: [
      S('tourist-transit', ['with-transit'], [
        '観光POIと交通拠点が近い。来訪者の波が大きい時間帯を見たい。',
        'アクセスが強い観光地だ。通常観光客とイベント参加者を分けて考えよう。'
      ], [
        '人が一気に来る時間がありそうだね。',
        '観光の人もたくさん来そう！こっちは流れを邪魔しないようにしよ。'
      ]),
      S('tourist-landmark', ['with-landmark'], [
        '観光ランドマークは集合説明に使いやすいが、その前での滞留は避けたい。',
        '目印としては強い。集合地点は少し外した位置に置くのがよさそうだ。'
      ], [
        '目印には最高！集合するのはちょっと横が良さそうだね。',
        '「あれ集合！」じゃなくて「あれの近く集合！」くらいがいいかも。'
      ]),
      S('tourist-density', ['with-density'], [
        '観光地の密集は一般来訪者由来の可能性もある。イベントでさらに寄せないようにしたい。',
        '元から滞留が起きる場所なら、通過型の設計へ寄せよう。'
      ], [
        'ここは元から人気なんだね。こっちはサッと通るくらいが良さそう！',
        '人気スポットはみんなで譲り合って使おう。'
      ])
    ],
    SAME_TYPE_BURST_01: [
      S('same-loop', ['with-loop'], [
        '同種POIが周回上に並ぶなら、テーマとして成立しやすい。',
        '偏りではあるが回遊性がある。連続体験として活かせる可能性がある。'
      ], [
        '同じテーマを探しながら一周できる！これは遊びに変えられそう。',
        '揃ってるなら、逆にそれを主役にしちゃえるね！'
      ]),
      S('same-skew', ['with-skew'], [
        '同種連続と属性偏りが同時に出ている。テーマ性と単調さの両方を見たい。',
        '特色は明確だ。ただし休憩や目印など別役割が不足していないか確認しよう。'
      ], [
        '個性は強い！でもずっと同じ感じにならない工夫も欲しいね。',
        'テーマは見えたね。途中に違う役割も入れたいかも！'
      ])
    ],
    ATTRIBUTE_SKEW_01: [
      S('skew-same', ['with-same-type'], [
        '同種POIの連続が偏りの主因だ。意図したテーマかどうかを確認したい。',
        '偏り方が明確だ。テーマとして使うなら不足役割を別地点で補おう。'
      ], [
        '同じものが多いから偏ってるんだね。テーマにするならアリかも！',
        '主役は見えた！あとは足りないものを足したいね。'
      ]),
      S('skew-shortage', ['with-rest-shortage'], [
        '属性偏りに加えて休憩不足もある。構成上の弱点として優先して直したい。',
        '特色より先に機能不足が出ている。休憩役割を追加できるか探そう。'
      ], [
        '個性はあるけど、休めないのは困るね。まずそこを補いたい！',
        'テーマより先に、ちゃんと休める場所を作ろう。'
      ]),
      S('extreme-skew', ['extreme-skew'], [
        '偏りがかなり大きい。意図的でなければ設計全体を見直す価値がある。',
        '一属性へ寄りすぎている。別の役割がほぼ見えない状態だ。'
      ], [
        'かなり一色だね！狙ってないなら少し変化が欲しいかも。',
        'ここまで偏ると、途中で違う楽しみも入れたくなるね。'
      ])
    ],
    LANDMARK_SHORTAGE_01: [
      S('shortage-transit', ['with-transit'], [
        '交通拠点はあるが集合目印が弱い。出口番号や施設名など補助情報が必要だ。',
        '来場はしやすいが、着いてから迷う可能性がある。現地で基準点を一つ決めよう。'
      ], [
        '駅までは来られるけど、そこから迷いそうだね。目印を一個決めよう！',
        '到着後に「どこ？」ってならないようにしたいね。'
      ]),
      S('shortage-loop', ['with-loop'], [
        '回遊はできるがスタート地点の説明が弱い。最初の一点だけ明確にしたい。',
        'ルートはある。問題は入口だ。集合基準点を一つ決めれば改善できる。'
      ], [
        '一周はできるのに、スタートが分かりにくいんだね。',
        '最初の集合場所だけ決めれば、ぐっと分かりやすくなりそう！'
      ]),
      S('shortage-late', ['late'], [
        '全体を見ても強い目印が出てこない。現地で視認性の高い一点を選びたい。',
        '終盤まで目印不足が残った。初参加者目線で集合説明を作り直そう。'
      ], [
        '最後まで目印が弱いね。現地で「これ！」って一個探そう。',
        '初めて来る人になったつもりで集合場所を見直したいね。'
      ])
    ],
    FAVORABLE_COMPOSITE_01: [
      S('favorable-rich', ['favorable-rich'], [
        '好条件が五つ以上そろっている。大きな欠点がなければ設計自由度はかなり高い。',
        '回遊、休憩、アクセス、目印などが複数成立している。全体として強い。'
      ], [
        'かなり揃ってる！あとは現地で気になるところを潰せばよさそう。',
        'これ、選べる設計だね！いろんな遊び方を作れそう。'
      ]),
      S('favorable-tourist', ['with-tourist'], [
        '好条件に観光性も加わっている。魅力は強いが一般来訪者との共存を優先したい。',
        '使いやすさと見どころが両立している。混雑時間だけ慎重に見よう。'
      ], [
        '遊びやすくて見どころもある！あとは混む時間だけ気をつけたいね。',
        '初めて来る人にも「来てよかった」って思ってもらえそう！'
      ]),
      S('favorable-late', ['late'], [
        '最後まで見た上で好条件が重なっている。候補地としてかなり有力だ。',
        '個別条件だけでなく全体の噛み合わせも良い。現地確認へ進める価値がある。'
      ], [
        '最後まで見てもいい感じ！現地で歩くの楽しみになってきた。',
        '全体でちゃんとつながってるね。かなり良さそう！'
      ])
    ]
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
    if (!Array.isArray(list) || !list.length) return null;
    const fresh = list.filter(text => !recent.includes(text));
    const pool = fresh.length ? fresh : list;
    const text = pool[hash(`${seed}:${key}:${recent.length}`) % pool.length];
    recent.push(text);
    if (recent.length > HISTORY_LIMIT) recent.shift();
    return text;
  }

  function eventIdsFromContext(event, context = {}) {
    const values = [];
    if (Array.isArray(context.eventIds)) values.push(...context.eventIds);
    if (Array.isArray(context.events)) values.push(...context.events.map(item => typeof item === 'string' ? item : item?.id));
    if (event?.id) values.push(event.id);
    return [...new Set(values.filter(Boolean).map(String))];
  }

  function deriveTags(event, context = {}) {
    const tags = new Set(window.GungiDialogueEngineV1?.getTags?.(event, context) || []);
    const ids = eventIdsFromContext(event, context);
    ids.forEach(id => {
      const tag = EVENT_TAGS[id];
      if (tag) tags.add(tag);
    });

    const metrics = event?.metrics || {};
    const index = Number(context.eventIndex ?? 0);
    const total = Number(context.eventTotal ?? ids.length ?? 0);
    if (index <= 1) tags.add('early');
    if (total > 4 && index >= 2 && index < total - 2) tags.add('middle');
    if (total > 0 && index >= total - 2) tags.add('late');
    if (Number(metrics.nearbyExistingCount || 0) >= 10) tags.add('very-dense');
    if (Number(metrics.supportCount || 0) >= 2) tags.add('rest-rich');
    if (Number(metrics.ratio || 0) >= 0.7) tags.add('extreme-skew');
    if (Number(metrics.favorableConditions || 0) >= 5) tags.add('favorable-rich');
    if (String(event?.confidence || '').toLowerCase() === 'high') tags.add('high-confidence');
    return [...tags];
  }

  function scoreScenario(scenario, tags) {
    if (!scenario?.requires?.every(tag => tags.includes(tag))) return -1;
    return scenario.requires.length;
  }

  function selectScenario(eventId, tags) {
    const list = SCENARIOS[eventId] || [];
    let best = null;
    let bestScore = -1;
    list.forEach(item => {
      const score = scoreScenario(item, tags);
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return bestScore >= 0 ? best : null;
  }

  function replaceFirstSpeaker(cuts, speaker, text) {
    let done = false;
    return (cuts || []).map(cut => {
      if (!done && cut?.speaker === speaker && text) {
        done = true;
        return { ...cut, text };
      }
      return { ...cut };
    });
  }

  function resolve(event, basePresentation, context = {}) {
    const baseEngine = window.GungiDialogueEngineV1;
    const v1 = baseEngine?.resolve ? baseEngine.resolve(event, basePresentation, context) : basePresentation;
    if (!event?.id || !v1) return v1;

    const tags = deriveTags(event, context);
    const scenario = selectScenario(event.id, tags);
    if (!scenario) {
      return {
        ...v1,
        dialogueMeta: {
          ...(v1.dialogueMeta || {}),
          engine: VERSION,
          situationEngine: VERSION,
          tags,
          scenario: null,
          variantMode: 'curated-situation-selection'
        }
      };
    }

    let cuts = (v1.cuts || []).map(cut => ({ ...cut }));
    const riku = pick(scenario.riku, `${event.id}:${scenario.key}:riku:${tags.join(',')}`);
    const mina = pick(scenario.mina, `${event.id}:${scenario.key}:mina:${tags.join(',')}`);
    cuts = replaceFirstSpeaker(cuts, 'riku', riku);
    cuts = replaceFirstSpeaker(cuts, 'mina', mina);

    return {
      ...v1,
      cuts,
      dialogueMeta: {
        ...(v1.dialogueMeta || {}),
        engine: VERSION,
        situationEngine: VERSION,
        tags,
        scenario: scenario.key,
        variantMode: 'curated-situation-selection'
      }
    };
  }

  function reset(nextSeed) {
    recent = [];
    seed = Number.isFinite(Number(nextSeed)) ? Number(nextSeed) >>> 0 : Date.now() >>> 0;
    window.GungiDialogueEngineV1?.reset?.(seed);
  }

  const scenarioLineCount = Object.values(SCENARIOS).reduce((sum, scenarios) => sum + scenarios.reduce((n, s) => n + s.riku.length + s.mina.length, 0), 0);
  const scenarioCount = Object.values(SCENARIOS).reduce((sum, scenarios) => sum + scenarios.length, 0);

  window.GungiDialogueEngineV2 = Object.freeze({
    version: VERSION,
    mode: 'curated-situation-selection',
    resolve,
    reset,
    deriveTags,
    selectScenario,
    scenarioCount,
    scenarioLineCount,
    inheritedBankSize: window.GungiDialogueEngineV1?.bankSize || 0,
    totalCuratedLines: (window.GungiDialogueEngineV1?.bankSize || 0) + scenarioLineCount
  });
})();
