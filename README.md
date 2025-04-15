# Windsurf+GTP-4.1のコーディングテスト

## ぷよぷよ風落ちものパズルゲーム

このリポジトリは「Windsurf+GTP-4.1のコーディングテスト」として作成された、シンプルなぷよぷよ風落ちものパズルゲームです。

### ゲーム概要
- ブラウザ上で動作するHTML/CSS/JavaScript製のパズルゲームです。
- 6列×12行のフィールドに2つ1組の「ぷよ」が上から落ちてきます。
- プレイヤーは左右・回転操作でぷよを動かし、同じ色を4つ以上つなげて消すことを目指します。
- スコア表示・リスタート機能付き。
- ページ初回表示時は「何かキーを押すとゲーム開始」となり、キー入力でゲームが始まります。

### 操作方法
- ← → ：ぷよの左右移動
- ↓ ：ぷよの落下加速
- ↑ または Z/X ：ぷよの回転
- Rキー またはリスタートボタン：ゲームリスタート

### ファイル構成
- `index.html` : ゲーム画面・UI
- `main.js` : ゲームロジック
- `style.css` : スタイルシート

### 実行方法
1. 本リポジトリをクローン
2. 任意のWebサーバ（例: Pythonのhttp.server）でプロジェクトディレクトリを公開
3. ブラウザで`http://localhost:8888`等にアクセス

---

ご質問・ご要望はIssueまたはPRでお願いします。
