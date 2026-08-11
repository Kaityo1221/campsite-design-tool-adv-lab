# ADV 軍議データ接続設計 v0.1

## 目的
既存の距離チェック・POI辞書・設計ルールを、軍議イベントの事実判定へ接続する。
キャラクターのセリフを判定ロジックそのものにしない。

## 現在利用できる主なカテゴリ
- `STAY`: 滞在・交流系
- `STAY_RISK`: 滞留注意系
- `REST`: 休憩系
- `SAFE`: 滞在支援・安全補助系
- `TRANSIT`: アクセス・接続系
- `FLOW_RISK`: 動線干渉系
- `LOOP`: 回遊系
- `DISC`: 発見・文化系
- `NATURE`: 自然・景観系
- `SPORT`: 運動系

## 現在利用できる主な現地ルール
- `vehicle_parking_rotary_caution`: 駐車場・車両動線・ロータリーは注意または除外
- `narrow_path_bridge_cycle_road_caution`: 狭い道・橋・サイクリングロード上は注意
- `restricted_or_inaccessible_exclude`: 立入禁止・通常アクセスできない場所は除外
- `other_user_purpose_caution`: 他利用者の目的を妨げる場所は注意
- `missing_or_removed_poi_exclude`: 現物がない・見当たらないPOIは除外
- `exhibit_or_description_noise`: 展示物・説明物は設計利用価値で判断
- `cafe_vs_hotel_rest_rule`: カフェ等は休憩候補、ホテル等の目的外利用は案内しない

## レイヤー分離

### 1. Fact Layer
距離、位置、カテゴリ、現地ルールなどの客観データ。

### 2. Event Layer
Fact Layerを組み合わせて軍議イベントを発火する。

例:
- 半径40m以内に追加POIが6件以上 → `DENSITY_01`
- `DENSITY_01` ＋ 100m以内にREST/SAFE → `DENSITY_REST_01`
- TRANSIT付近に追加POI集中 → `ENTRANCE_01`
- LOOP要素が連続 → `LOOP_01`
- `narrow_path_bridge_cycle_road_caution` 一致 → `NARROW_PATH_01`
- `vehicle_parking_rotary_caution` 一致 → `PARKING_01`

### 3. Dialogue Layer
イベントIDからリク／ミナのセリフを選ぶ。

### 4. Presentation Layer
地図ズーム、対象ハロー、キャラ明暗、表情、会話枠を制御する。

## 優先順位
安全側ルールを魅力評価より優先する。

暫定優先順位:
1. 立入禁止・アクセス不可
2. 車両動線
3. 狭路・橋・サイクリングロード
4. 強い滞留リスク
5. 動線干渉
6. 回遊・休憩・景観などのプラス評価

## 本体接続時の方針
既存の `js/distance-core.js` には距離リスク分類、POI間距離計算、距離チェック状態などが存在する。
ADV側ではこれらを直接書き換えるのではなく、距離チェック完了後に読み取れる結果オブジェクトへ変換して受け取る構造を目標とする。

想定インターフェース:

```js
{
  points: [],
  warnings: [],
  categories: [],
  localRules: [],
  supportFacilities: [],
  stats: {
    addedPoiCount: 0,
    existingPoiCount: 0
  }
}
```

軍議エンジンはこのオブジェクトだけを入力にしてイベントを生成する。
