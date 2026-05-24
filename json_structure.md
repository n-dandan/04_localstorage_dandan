# ライブ会場抽選システム｜LocalStorage JSON構造（確定版）

---

## 全体構造

```json
{
  "settings": { ... },
  "prizes": [ ... ],
  "design": { ... },
  "tickets": [ ... ]
}
```

---

## 1. settings（イベント設定）

```json
"settings": {
  "eventName": "Summer Live 2025",
  "totalWinners": 10,
  "remainingWinners": 7,
  "loseMessage": "残念！またチャレンジしてね！",
  "adminPassword": "1234",
  "lastInputMethod": "text"
}
```

| キー | 型 | 説明 |
|------|----|------|
| eventName | string | 抽選イベント名（ライブタイトル） |
| totalWinners | number | 総当選数 |
| remainingWinners | number | 残り当選数 |
| loseMessage | string | ハズレ時の掲出コメント（全体共通） |
| adminPassword | string | 管理画面のパスワード |
| lastInputMethod | string | 最後に使用したチケット入力方式（"text" / "qr" / "barcode"） |

---

## 2. prizes（商品設定）

```json
"prizes": [
  {
    "id": "prize-001",
    "name": "サイン入りポスター",
    "imageUrl": "https://firebasestorage.googleapis.com/...",
    "winMessage": "サイン入りポスターが当たりました！",
    "totalWinners": 5,
    "remainingWinners": 4,
    "winners": ["A-002"]
  },
  {
    "id": "prize-002",
    "name": "チェキ",
    "imageUrl": null,
    "winMessage": "チェキが当たりました！",
    "totalWinners": 3,
    "remainingWinners": 3,
    "winners": []
  }
]
```

| キー | 型 | 説明 |
|------|----|------|
| id | string | 商品ID（一意） |
| name | string | 商品名 |
| imageUrl | string \| null | 商品画像URL（Firebase Storage）。未設定時はnull |
| winMessage | string | 当選時の掲出コメント（商品ごとに設定） |
| totalWinners | number | 商品ごとの総当選数 |
| remainingWinners | number | 商品ごとの残り当選数 |
| winners | string[] | 当選チケットIDの一覧 |

---

## 3. design（画面デザイン設定）

```json
"design": {
  "backgroundColor": "#1a1a2e",
  "backgroundPattern": "pattern-01",
  "fontFamily": "Noto Sans JP"
}
```

| キー | 型 | 説明 |
|------|----|------|
| backgroundColor | string | 背景色（16進数カラーコード） |
| backgroundPattern | string | 背景画像（模様）の識別子 |
| fontFamily | string | フォント名 |

> ※ 背景画像本体はアプリ側で用意するため、識別子のみ保存。

---

## 4. tickets（チケット一覧）

```json
"tickets": [
  {
    "id": "A-001",
    "used": false,
    "usedAt": null,
    "result": null
  },
  {
    "id": "A-002",
    "used": true,
    "usedAt": "2025-05-25T10:30:00",
    "result": "prize-001"
  },
  {
    "id": "A-003",
    "used": true,
    "usedAt": "2025-05-25T10:45:00",
    "result": "lose"
  }
]
```

| キー | 型 | 説明 |
|------|----|------|
| id | string | チケット管理番号 |
| used | boolean | 使用済みフラグ |
| usedAt | string \| null | 抽選日時（タイムスタンプ）。未抽選時はnull |
| result | string \| null | 抽選結果。未抽選時はnull |

### result の値

| 値 | 意味 |
|----|------|
| null | 未抽選 |
| "lose" | ハズレ |
| "prize-001"（商品ID） | 該当商品が当選 |

### 使用済み判定ロジック

```javascript
const isUsed = ticket.used === true
            || ticket.usedAt !== null
            || ticket.result !== null
// いずれか1つでも該当すれば使用済みと判定
```

### 保存の順番（クラッシュ対策）

```
① ticket.used = true を保存
② ticket.usedAt にタイムスタンプを保存
③ prizes[該当商品].winners にチケットIDを追記     ← ここまでで当選の事実を両側から参照可能
④ ticket.result に結果（商品ID or "lose"）を保存
⑤ prizes[該当商品].remainingWinners を -1 して保存
⑥ settings.remainingWinners を -1 して保存
```

---

## 5. 異常状態のケースと対応

| used | usedAt | result | 判定 | 対応 |
|------|--------|--------|------|------|
| false | null | null | 未使用 | 通常通り抽選へ |
| true | あり | あり | 使用済み（正常） | エラー画面（2重抽選） |
| true | あり | null | 使用済み（異常） | エラー画面（スタッフ対応） |
| true | null | あり | 使用済み（異常） | エラー画面（スタッフ対応） |

---

## 6. LocalStorage への保存イメージ

```javascript
// 保存
const data = { settings, prizes, design, tickets }
localStorage.setItem("roulette_app", JSON.stringify(data))

// 読み出し
const data = JSON.parse(localStorage.getItem("roulette_app"))
```

---

## 7. ストレージの役割分担

| 保存先 | 保存するもの |
|--------|-------------|
| LocalStorage | 設定・商品情報・チケット・抽選結果などのテキストデータ |
| Firebase Storage | 商品画像ファイル本体 |

> ※ Firebase Storageのセットアップ手順は別ドキュメントで管理。
