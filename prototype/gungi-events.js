window.GUNGI_EVENTS = [
  {
    id: "DENSITY_01",
    title: "密集地点",
    type: "対立型",
    result: "魅力を残しつつ分散を検討",
    mapPreset: "density",
    cuts: [
      { speaker: "system", text: "POIが集中している地点があります。", highlight: "neutral" },
      { speaker: "riku", text: "ここに人が集中するな。滞留が生まれるかもしれない。", highlight: "risk" },
      { speaker: "mina", text: "でも、人が集まるってことはさ！それだけ魅力があるってことじゃん！", highlight: "benefit" }
    ]
  },
  {
    id: "DENSITY_REST_01",
    title: "密集＋休憩支援",
    type: "補完型",
    result: "密集リスクを残しつつ支援条件を加点",
    mapPreset: "densityRest",
    cuts: [
      { speaker: "system", text: "密集地点の周辺に休憩・支援設備があります。", highlight: "neutral" },
      { speaker: "riku", text: "条件は悪くない。近くに休憩できる場所がある。長時間でも立て直せる。", highlight: "benefit" },
      { speaker: "mina", text: "おおっ、ここなら休みながら遊べるね！", highlight: "benefit" }
    ]
  },
  {
    id: "ENTRANCE_01",
    title: "入口・集合導線",
    type: "対立型",
    result: "集合の分かりやすさを活かし固定滞留は避ける",
    mapPreset: "entrance",
    cuts: [
      { speaker: "system", text: "入口付近に追加POIが集まっています。", highlight: "neutral" },
      { speaker: "riku", text: "アクセスはいい。だが、入口の人流とぶつかる可能性がある。", highlight: "risk" },
      { speaker: "mina", text: "初めて来る人にはめっちゃ分かりやすいよ！", highlight: "benefit" }
    ]
  },
  {
    id: "LOOP_01",
    title: "回遊導線",
    type: "補完型",
    result: "回遊性を高評価",
    mapPreset: "loop",
    cuts: [
      { speaker: "system", text: "複数のPOIが周回しやすい形でつながっています。", highlight: "neutral" },
      { speaker: "riku", text: "周回できる。参加者を一か所に留めずに済みそうだ。", highlight: "benefit" },
      { speaker: "mina", text: "いいじゃん！ぐるっと歩いて遊べるよ！", highlight: "benefit" }
    ]
  },
  {
    id: "NARROW_PATH_01",
    title: "狭路・橋・木道",
    type: "全会一致型",
    result: "滞留地点から外して通過導線へ",
    mapPreset: "narrow",
    cuts: [
      { speaker: "system", text: "狭い通路上にPOIがあります。", highlight: "risk" },
      { speaker: "riku", text: "ここで人を止めるべきじゃない。通行を妨げる。", highlight: "risk" },
      { speaker: "mina", text: "じゃあ、ここは通るだけにしよ！", highlight: "risk" }
    ]
  },
  {
    id: "PARKING_01",
    title: "駐車場・車両動線",
    type: "確認型",
    result: "実際の歩行・滞留と車両動線の重なりを現地確認して判断",
    mapPreset: "parking",
    cuts: [
      { speaker: "system", text: "駐車場・ロータリー・車両動線に近い可能性がある候補があります。", highlight: "risk" },
      { speaker: "riku", text: "地図上では車両動線に近いな。実際の歩行ルートや滞留位置を確認したい。", highlight: "risk" },
      { speaker: "mina", text: "近いだけなら通らないこともあるよね。現地を見て決めよう！", highlight: "neutral" }
    ]
  }
];

window.GUNGI_MAP_PRESETS = {
  density: [
    [32, 30, "existing"], [39, 34, "added"], [45, 38, "added"], [50, 43, "added"],
    [53, 48, "added"], [46, 51, "added"], [39, 47, "added"], [34, 41, "existing"],
    [69, 29, "existing"], [74, 62, "existing"]
  ],
  densityRest: [
    [32, 30, "existing"], [39, 34, "added"], [45, 38, "added"], [50, 43, "added"],
    [53, 48, "added"], [46, 51, "added"], [39, 47, "added"], [34, 41, "existing"],
    [58, 54, "support"], [61, 58, "support"], [72, 30, "existing"]
  ],
  entrance: [
    [20, 45, "risk"], [25, 44, "added"], [30, 42, "added"], [35, 41, "added"],
    [40, 39, "existing"], [62, 55, "existing"], [72, 32, "existing"]
  ],
  loop: [
    [24, 27, "existing"], [35, 20, "added"], [52, 24, "added"], [66, 37, "added"],
    [68, 58, "added"], [52, 70, "added"], [34, 64, "added"], [22, 48, "added"]
  ],
  narrow: [
    [27, 67, "existing"], [36, 59, "risk"], [45, 51, "added"], [54, 43, "added"], [63, 35, "existing"]
  ],
  parking: [
    [25, 47, "risk"], [33, 48, "added"], [41, 50, "added"], [65, 28, "existing"], [72, 62, "existing"]
  ]
};
