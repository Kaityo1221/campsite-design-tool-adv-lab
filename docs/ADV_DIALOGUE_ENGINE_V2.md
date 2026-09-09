# ADV Dialogue Engine V2

## 目的

ADVの固定セリフ方式を維持したまま、同じイベントでも周囲の状況に応じて会話を変化させる。

自由生成AIは使用しない。キャラクター性・安全性・説明内容を監修可能な状態に保つ。

## 構成

- `prototype/gungi-dialogues-v0.3.js`
  - 現行24イベントの基準セリフ
- `prototype/gungi-dialogue-engine-v1.js`
  - イベント別の言い回し候補
  - 履歴による直近重複回避
- `prototype/gungi-dialogue-engine-v2.js`
  - 周囲イベント、進行位置、解析強度からシチュエーションを判定
  - V1をフォールバックとして利用
- `prototype/gungi-dialogue-engine-test.html`
  - V2確認用テスト画面

## V2で見るコンテキスト

`resolve(event, basePresentation, context)` に以下を渡す。

```js
{
  eventIds: ['ENTRANCE_01', 'TRANSIT_01', 'LANDMARK_CLUSTER_01'],
  eventIndex: 0,
  eventTotal: 6
}
```

`event` 側の `metrics` も利用する。

- `nearbyExistingCount >= 10` → `very-dense`
- `supportCount >= 2` → `rest-rich`
- `ratio >= 0.7` → `extreme-skew`
- `favorableConditions >= 5` → `favorable-rich`
- `confidence === high` → `high-confidence`

## シチュエーション例

- 入口 + 交通
- 入口 + ランドマーク
- 入口 + 密集
- 密集 + 回遊
- 密集 + 休憩
- 狭路 + 入口
- 狭路 + 密集
- 狭路 + 水辺
- 駐車場 + 入口
- 遊具 + 広場
- 休憩 + 回遊
- 休憩 + 補給
- 商業 + 交通
- 商業 + 飲食
- 水辺 + 回遊
- 観光 + ランドマーク
- 同種POI + 属性偏り
- 属性偏り + 休憩不足
- 集合目印不足 + 交通
- 複合好条件 + 観光
- 序盤 / 中盤 / 終盤
- 強い密集 / 休憩候補複数 / 極端な偏り / 好条件5つ以上

## 現在の規模

- V1追加セリフ: 144
- V2シチュエーション: 66
- V2状況別セリフ: 264
- V1 + V2 合計監修セリフ: 408

V2では複数タグの組み合わせで同じ監修セリフ群の選ばれ方も変化するため、実際の会話パターン数は固定セリフ数より多くなる。

## 接続方針

本番ADVへ接続する際は、`eventSequence()` で各イベントを解決する直前に、現在のイベント一覧を `eventIds` としてV2へ渡す。

```js
const resolved = window.GungiDialogueEngineV2.resolve(
  event,
  presentation,
  {
    eventIds: events.map(item => item.id),
    eventIndex: idx,
    eventTotal: events.length
  }
);
```

その後は `resolved.cuts` を既存のADV表示へ渡す。

## 安全方針

- 現在は `feature/adv-dialogue-engine-v1` のみで作業
- `main` は未変更
- 現行 `gungi-auto-room.html` へは未接続
- V2テスト確認後に接続する
