# 軍議システム移管メモ

## 正式な開発場所
軍議システムの今後の開発は `Kaityo1221/campsite-design-tool-adv-lab` を正式な作業場所とする。

## 今回の移管元
- Repository: `Kaityo1221/Campsite-Design-Tool-JP`
- Branch: `agent/gungi-news-map-story-01`
- Head: `d27be1a73c3e346b36835bb6df26bdb50555b2bd`

## ADV Lab側の土台
- Branch: `lab/dialog-layout-fix`
- Head: `e78c4e812ea7ad7d3552b11af4ddabc16589e496`

## 移管したもの
- `prototype/gungi/gungi-runtime.js`
  - CAMP SITE NEWS型の軍議ストーリー
  - レンの臨時ニュース
  - 全景、レイヤー、活動範囲、確認件数、距離確認、フィナーレ
- `prototype/gungi/gungi-character-roles.js`
  - ミナ、リク、ハル、レンの軍議役割
  - 質問フロー
  - 固定選択肢ポリシー
  - 提出条件・距離診断ルール

## 接続方針
本体側の距離チェック実装をADV Labへ丸ごと持ち込まない。
軍議側は Fact / Event / Dialogue / Presentation を分離し、ADV Labの既存KMZプロトタイプとアダプターで接続する。

現時点の `gungi-runtime.js` は本体側の `distanceMap`、`latestDistanceWarnings`、`window._layerPoints` などを参照するため、移管直後は原型保存を優先し、ADV Labの `map` / `points` / `analysis` へ直接結線しない。

## 次の作業
1. ADV Lab用アダプターを作る。
2. `dialog-layout-fix` の完成した会話レイアウトへニュース型ストーリーを載せる。
3. KMZ読込後の `points` / `analysis` を軍議Factへ変換する。
4. レン → ミナ / リク → レンの一連のストーリーをADV画面で通し確認する。
5. iPhone Safariを含む実機確認後、本体へ逆輸入する。
