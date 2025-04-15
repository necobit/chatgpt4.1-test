#!/bin/bash
# Windsurf+GTP-4.1 コーディングテスト用 ぷよぷよ風パズルゲーム サーバ起動スクリプト
# Mac/Linux用。Windows非対応

PORT=8888

# Python3チェック
type python3 >/dev/null 2>&1 || { echo >&2 "Python3が見つかりません。インストールしてください。"; exit 1; }

# サーバ起動
echo "\n==============================="
echo "  ローカルWebサーバを起動します  "
echo "===============================\n"
echo "ブラウザで http://localhost:$PORT を開いてください。"
echo "サーバ停止は Ctrl+C で行えます。"

python3 -m http.server $PORT
