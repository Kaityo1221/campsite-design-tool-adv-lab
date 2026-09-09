# ADV Dialogue Engine Live Integration

## 接続先

- 表示入口: `prototype/index.html`
- approved wrapper: `prototype/gungi-auto-room-approved.html`
- 実ADV本体: `prototype/gungi-auto-room.html`

`prototype/index.html` は approved wrapper を開き、approved wrapper は `gungi-auto-room.html` を iframe で表示する。

## 2026-09-10 接続内容

`gungi-auto-room.html` に以下を追加した。

1. `gungi-dialogue-engine-v1.js` を読み込む
2. `gungi-dialogue-engine-v2.js` を読み込む
3. 24イベントの `eventSequence()` 生成時に Dialogue Engine V2 を呼ぶ
4. V2が利用できない場合は V1、さらに利用できない場合は従来の `GUNGI_DIALOGUES_V03` をそのまま使用する
5. Dialogue Engine 内で例外が起きた場合もイベント単位で従来セリフへフォールバックする
6. KMZ/KMLを新しく読み込むたびに会話履歴とseedをリセットする
7. 現在成立しているイベントID一覧をV2へ渡し、複合シチュエーション判定に利用する
8. 解析情報へ会話エンジンのバージョンを表示する

## approved セリフとの関係

`gungi-auto-room-approved.html` が iframe 読み込み後に `GUNGI_DIALOGUES_V03` へ適用する承認済みパッチは維持する。

Dialogue Engine は、その時点の `GUNGI_DIALOGUES_V03[event.id]` をベースとして受け取る。したがって承認済みの複数カット構成や掛け合いは保持し、主に最初のリク／ミナの発言を状況別候補へ差し替える。

## 安全設計

- mainは未変更
- 作業ブランチ: `feature/adv-dialogue-engine-v1`
- 判定エンジン `GungiAutoEvents` は変更しない
- 24イベントの成立条件は変更しない
- approved wrapper の既存パッチは変更しない
- 会話エンジンのみ追加する

## 会話選択コンテキスト

V2へ渡す主な値:

- `eventIndex`
- `eventTotal`
- `events`
- `eventIds`
- 各イベントの `metrics`
- `confidence`

これにより、入口＋交通、入口＋密集、休憩＋回遊、終盤の総合評価など、同じイベントでも周辺状況によって異なる監修済みセリフを選択できる。

## フォールバック順

`GungiDialogueEngineV2`
→ `GungiDialogueEngineV1`
→ `GUNGI_DIALOGUES_V03`
→ イベント側の `cuts`

自由生成AIは使用しない。
