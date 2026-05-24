# ライブ会場抽選システム 仕様書

このHTMLファイルはライブ会場で使う抽選システムです。
以下の仕様を理解した上で編集・機能追加をお願いします。

---

## 技術構成

- 単一HTMLファイル（HTML / CSS / Vanilla JS）
- 外部ライブラリなし
- データ永続化：LocalStorage（キー名 `roulette_app`）
- フォント：Google Fonts（Nunito / Zen Maru Gothic）

---

## 画面構成

画面は `page` クラスを持つdivで管理し、`active` クラスで表示を切り替えています。

| ページID | 画面名 | 説明 |
|----------|--------|------|
| `page-main` | 抽選メイン画面 | チケット入力・ルーレット・残り当選数表示 |
| `page-soldout` | 受付終了画面 | 残り当選数が0になると自動表示 |
| `page-login` | 管理画面ログイン | パスワード認証 |
| `page-admin` | 管理画面 | 4タブ構成（基本設定・商品設定・チケット管理・当選履歴） |

**オーバーレイ（固定表示）**

| オーバーレイID | 内容 |
|---------------|------|
| `overlay-win` | 当選結果 |
| `overlay-lose` | ハズレ結果 |
| `overlay-error` | エラー（未登録・使用済み・異常状態） |
| `confirm-overlay` | リセット確認モーダル |

---

## LocalStorage データ構造

```json
{
  "settings": {
    "eventName": "ライブ抽選システム",
    "totalWinners": 10,
    "remainingWinners": 10,
    "loseMessage": "残念！またチャレンジしてね！",
    "adminPassword": "1234",
    "lastInputMethod": "text"
  },
  "prizes": [
    {
      "id": "prize-001",
      "name": "サイン入りポスター",
      "imageUrl": null,
      "winMessage": "サイン入りポスターが当たりました！",
      "totalWinners": 5,
      "remainingWinners": 5,
      "winners": []
    }
  ],
  "design": {
    "backgroundColor": "#FFF5F9",
    "backgroundPattern": "none",
    "fontFamily": "Nunito"
  },
  "tickets": [
    {
      "id": "A-001",
      "used": false,
      "usedAt": null,
      "result": null
    }
  ]
}
```

### result フィールドの値

| 値 | 意味 |
|----|------|
| `null` | 未抽選 |
| `"lose"` | ハズレ |
| `"prize-001"` など（商品ID） | 該当商品が当選 |

---

## 主要な関数一覧

| 関数名 | 役割 |
|--------|------|
| `loadData()` | LocalStorageからデータ読み込み。データがない場合はデフォルト値を返す |
| `saveData(d)` | LocalStorageへデータ保存 |
| `getDefault()` | デフォルトデータを返す（初期チケット・商品・設定を含む） |
| `showPage(page)` | 指定ページを表示。`'main'`を指定すると残り当選数が0なら受付終了画面に自動切替 |
| `renderMain(data)` | 抽選メイン画面のUI更新 |
| `startRoulette()` | 抽選処理のメイン関数 |
| `showWin(prize)` | 当選オーバーレイを表示 |
| `showLose(msg)` | ハズレオーバーレイを表示 |
| `showError(title, msg)` | エラーオーバーレイを表示 |
| `closeOverlay(type)` | オーバーレイを閉じてルーレットをREADY状態に戻す |
| `launchConfetti()` | 当選時のコンフェッティアニメーションを生成 |
| `doLogin()` | 管理画面のパスワード認証 |
| `renderAdmin()` | 管理画面全体を現在のデータで再描画 |
| `saveSettings()` | 管理画面の基本設定・デザイン設定を保存 |
| `applyDesign(design)` | CSS変数を更新してデザイン設定を即時反映 |
| `renderPrizeList()` | 管理画面の商品一覧を描画 |
| `openAddPrize()` | 商品追加（promptダイアログ使用） |
| `deletePrize(id)` | 指定IDの商品を削除し残り当選数を調整 |
| `importTickets()` | テキストエリアのチケット番号を一括インポート |
| `renderTicketList()` | 管理画面のチケット一覧を描画 |
| `renderHistory()` | 当選履歴タブを描画 |
| `exportCSV()` | 当選履歴をCSVファイルとしてダウンロード |
| `confirmReset(type)` | リセット確認モーダルを表示（`'all'` または `'tickets'`） |

---

## 抽選ロジック

### 当選確率

```
当選確率 = 残り当選数 ÷ 未使用チケット数
```

確率方式（毎回ランダム判定）を採用しています。確定方式（事前に当たりを割り当てる）ではありません。

### 抽選処理の順番（クラッシュ対策）

データの整合性を保つために以下の順番でLocalStorageに保存しています。

```
① ticket.used = true を保存
② ticket.usedAt にタイムスタンプを保存
③ prizes[該当商品].winners にチケットIDを追記   ← ここまでで当選の事実を両側から確認可能
④ ticket.result に結果（商品ID or "lose"）を保存
⑤ prizes[該当商品].remainingWinners を -1 して保存
⑥ settings.remainingWinners を -1 して保存
```

### チケットの使用済み判定

```javascript
const isUsed = ticket.used === true
            || ticket.usedAt !== null
            || ticket.result !== null
// いずれか1つでも該当すれば使用済みと判定
```

### 異常状態の検知

```javascript
// used=true なのに usedAt or result が null の場合は異常状態
const isAnomaly = ticket.used && (ticket.usedAt === null || ticket.result === null)
// → 専用エラーメッセージを表示してスタッフ対応を促す
```

---

## CSS設計

CSS変数でカラーテーマを管理しています。

```css
:root {
  --pink: #FF6B9D;
  --yellow: #FFD93D;
  --mint: #6BCFB5;
  --purple: #C084FC;
  --coral: #FF8C69;
  --bg: #FFF5F9;
  --card: #FFFFFF;
  --text: #2D1B33;
  --text-muted: #9B7FA8;
  --border: #F0D6E8;
  --shadow: rgba(255,107,157,0.15);
}
```

`--bg` はデザイン設定で動的に変更されます（`applyDesign()`関数）。

---

## 今後の拡張予定

- [ ] QRコード読み取り対応（`jsQR` または `html5-qrcode` ライブラリを使用予定）
- [ ] バーコード読み取り対応（`ZXing` ライブラリを使用予定）
- [ ] 商品画像のアップロード・表示（Firebase Storage連携予定）
- [ ] 当選確率ロジックの切替（確率方式 / 確定方式）
- [ ] 商品編集機能（現在は追加・削除のみ）

---

## 注意事項

- デフォルトの管理パスワードは `1234`
- LocalStorageの容量上限は約5MB。画像データは保存しない設計
- 商品画像は将来的にFirebase StorageのURLのみをLocalStorageに保存する予定（`imageUrl`フィールドは現在`null`）
- `prompt()` ダイアログを使用している箇所あり（商品追加）。UIに組み込んだフォームへの変更を検討中
