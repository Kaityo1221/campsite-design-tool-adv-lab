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
- `vehicle_parking_rotary_caution`: 駐車場・車両動線・ロータリーは注意。Waymapや地図上の近接だけでは除外せず、実際の歩行・滞留との重なりを現地確認して判断する
- `narrow_path_bridge_cycle_road_caution`: 狭い道・橋・サイクリングロード上は注意。Waymapや地図上の関係推定だけでは通過扱い・除外にせず、実際に通行・滞留するかを現地確認して判断する
- `restricted_or_inaccessible_exclude`: 立入禁止・通常アクセスできない場所は除外
- `other_user_purpose_caution`: 他利用者の目的を妨げる場所は注意
- `missing_or_removed_poi_exclude`: 現物がない・見当たらないPOIは除外
- `exhibit_or_description_noise`: 展示物・説明物は設計利用価値で判断
- `cafe_vs_hotel_rest_rule`: カフェ等は休憩候補、ホテル等の目的外利用は案内しない

## レイヤー分離

### 1. Fact Layer
距離、位置、カテゴリ、現地ルールなどの客観データ。

地図・名称・フォルダ名などから得た情報は、現地状況が確定していない場合は「推定Fact」として扱う。
推定Factだけを根拠に自動除外・自動通過扱いしない。

### 2. Event Layer
Fact Layerを組み合わせて軍議イベントを発火する。

例:
- 半径40m以内に追加POIが6件以上 → `DENSITY_01`
- `DENSITY_01` ＋ 100m以内にREST/SAFE → `DENSITY_REST_01`
- TRANSIT付近に追加POI集中 → `ENTRANCE_01`
- LOOP要素が連続 → `LOOP_01`
- `narrow_path_bridge_cycle_road_caution` 一致、または狭路・橋・木道との関係可能性を検出 → `NARROW_PATH_01`。推定だけなら確認型として扱う
- `vehicle_parking_rotary_caution` 一致、または車両動線への近接可能性を検出 → `PARKING_01`。近接推定だけなら確認型として扱う

### 3. Dialogue Layer
イベントIDからリク／ミナのセリフを選ぶ。

### 4. Presentation Layer
地図ズーム、対象ハロー、キャラ明暗、表情、会話枠を制御する。

## 優先順位
安全側ルールを魅力評価より優先する。
ただし、地図上の近接や名称判定などの推定情報は、現地確認済みの安全Factと同じ強さでは扱わない。

暫定優先順位:
1. 立入禁止・アクセス不可など現地で確定した強い安全条件
2. 現地で確認された車両動線・狭路・橋・サイクリングロード
3. 強い滞留リスク
4. 動線干渉
5. Waymap・名称・フォルダ名から推定された車両動線・狭路などの確認事項
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
