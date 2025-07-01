#!/bin/bash

set -e

echo "bundle install 開始" # dockerfileで実施済みだが再度実施しておく
bundle install

echo "必要な npm パッケージをインストール（開発依存）"

npm install -D \
  tailwindcss@3.4.1 \
  @tailwindcss/forms \
  postcss \
  autoprefixer \
  vue \
  vite \
  @vitejs/plugin-vue \
  axios

# tailwind v4以降を使うなら以下が必要
# @tailwindcss/vite \
# @tailwindcss/cli \

if [ ! -f tailwind.config.js ]; then
  echo "Tailwind 初期設定"
  npx tailwindcss init -p
fi

echo "Rails の初期設定"
# migrate,seed実行が必要なら追加

echo "セットアップ完了"
