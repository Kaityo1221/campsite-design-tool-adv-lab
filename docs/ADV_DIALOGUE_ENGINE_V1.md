# ADV Dialogue Engine V1

## 目的

既存の24イベント判定と監修済みADVセリフを残したまま、同じイベントでも毎回まったく同じ言い回しにならない会話層を追加する。

## 方針

- 自由生成AIは使用しない。
- キャラクター設定を崩さない。
- 判定ロジックは変更しない。
- `gungi-dialogues-v0.3.js` を基準文として残す。
- 状況・履歴・イベント順から監修済み候補を選択する。
- 直近で使用した文は優先的に避ける。

## V1構成

`prototype/gungi-dialogue-engine-v1.js`

- 対象: 24イベント
- 追加候補: リク3本 + ミナ3本 / イベント
- 合計追加候補: 144本
- 選択方式: curated-context-selection
- 履歴: 直近10文 / 10イベント
- 状況タグ: `first`, `late`, `repeat-event`, `strong-signal`, `caution`, `positive`
- プレースホルダ `{category}` は既存方式を継承

## 役割

リク:
- ルール・事実・リスク・配置を確認する。
- 案を否定して終わらず、実現可能な形へ整える。

ミナ:
- 参加者目線・楽しさ・体験を拾う。
- 明るく短く、場を前へ動かす。

## テスト

`prototype/gungi-dialogue-engine-test.html`

イベントを選び、「別の言い回しを見る」で候補選択を確認できる。

## 既存ADVへの接続案

既存 `eventSequence(events)` 内で、

```js
const base = window.GUNGI_DIALOGUES_V03?.[event.id];
const presentation = window.GungiDialogueEngineV1?.resolve(
  event,
  base,
  { eventIndex: idx, eventTotal: events.length }
) || base;
```

とし、ページ側で `gungi-dialogue-engine-v1.js` を `gungi-dialogues-v0.3.js` の後に読み込む。

## 次段階

1. 実際の自動軍議画面へ接続する。
2. イベントごとの発火データを使って状況タグを増やす。
3. `初回 / 再登場 / 強い判定 / 弱い判定 / 他イベントとの複合` で候補群を分ける。
4. セリフ候補を500本規模へ拡張する。
5. 会長レビューでNG表現・キャラずれを除外する。
