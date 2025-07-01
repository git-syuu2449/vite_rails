# Rails Docker

RailsをDocker環境で構築する。  
Nginx + PUMA + PostgreSQL + PGAdmin + Vue + Vite

## 前提

ホストにdocker,gitが導入済みであること

## 機能概要

追記

## 環境概要

本アプリケーションは、以下の技術スタックおよびDockerを用いた仮想環境で構築されています。

### アプリケーション構成

- ruby 3.4.2
- Rails 8.0.2
- postgres 17.5
- PGA 9.4
- Bundler version 2.6.9
- puma version 6.6.0
- node.js v20.19.3
- npm 11.4.2
- nginx version: nginx/1.27.5

## 環境構築について

```bash
git clone git@github.com:git-syuu2449/vite_rails.git

# 初回かつdocker compose up後（gitにrailsが含まれていない場合）
# gitの多重構造になるのでnewした先の.gitはつくらない。
rails new アプリ名 --skip-git --database=postgresql

# rails newをすると初期配置したGemfile,Gemfile.lockが上書きされ再生性される。
# 再生生後、必要なgemを追記してbundle installを行う

# ---------------

# もしくはdocker runでrails newだけ先行する（初回のみ）
# rails new . としているのはDockerfile内でWORKDIR /app/projectとすでにしている為。それがない場合は上書きされるため注意。
docker compose run --rm --no-deps  web rails new . --force --database=postgresql --skip-git

# 改めてビルド
docker compose --env-file .env up -d --build

# webが立ち上がらない場合があるのでログチェック
docker ps
docker ps -a
docker compose logs web

# ---------------

# どちらも試した所感、sleep infinity で止めて exec bashして中で作業をした方が分かりやすい。
# rails new時の--skip-gitの注意点：.gitignoreも作られない為、rails newしたディレクトリに配置が必要。

```


## docker起動

先に.envの配置をする  
下記.envの設定例を参照

```bash
# compose.yamlがいる階層に移動
cd ../
# docker compose up -d --build
docker compose --env-file .env up -d --build
# アタッチ
# web
docker compose exec web bash
# nginx
docker compose exec nginx bash

```

## ブラウザアクセス先

事前に必要なDBをpgAdmin上から作成しておく。

- web
http://localhost:3000/
- PGAdimin
http://localhost:8081/browser/
- Vite
http://localhost:3036/vite-dev/

## .env設定例

.env

```

# ---  UID/GID ---
U_ID=1000
G_ID=1000
USERNAME=appuser
GROUPNAME=appgroup

# --- POSTGRES ---
POSTGRES_USER=root
POSTGRES_PASSWORD=password
POSTGRES_DB=rails_db

PG_TEST_DATABASE=test_db

# --- PGAdmin ---
PGA_USER=root
PGA_EMAIL=admin@test.com
PGA_PASSWORD=password

# --- PORT設定 ---
APP_PORT=3000
POSTGRES_PORT=5432
NGINX_PORT=9300
PGA_PORT=8081

# --- Rails ---
RAILS_ENV=development
VITE_RUBY_HOST=0.0.0.0
VITE_RUBY_PORT=3306
VITE_RUBY_TEST_PORT=3307

```

project/.env

```
# --- POSTGRES ---
POSTGRES_USER=root
POSTGRES_PASSWORD=password
POSTGRES_DB=rails_db
POSTGRES_HOST=db

PG_TEST_DATABASE=test_db

# --- PORT設定 ---
APP_PORT=3000
POSTGRES_PORT=5432
NGINX_PORT=9300
PGA_PORT=8081

# --- Rails ---
RAILS_MAX_THREADS=5
RAILS_ENV=development
VITE_RUBY_HOST=0.0.0.0
VITE_RUBY_PORT=3306
VITE_RUBY_TEST_PORT=3307

```

## 導入

### gem

- dotenv-rails
- vite_rails


## vite導入

これらの導入は`setup.sh`にて行う。
```bash
appuser@0663c0951aeb:/app/project$ ./setup.sh 
```

1. gem追加  
Gemfileに`vite_rails`を追加  
```bash
bundle install
```

2. vite初期化  
```bash
bundle exec vite install
# 以下はどちらか使用する場合実行。今回のsetup.shではvueを導入
bundle exec vite install vue # vue
bundle exec vite install react # react
```

3. パッケージインストール  
```bash
npm install
```

## tailwind導入
```bash
# viteを使用するのでgemも不要
```

## vite関連の設定変更箇所

viteの初期設定(bundle exec vite install後)に以下のファイルが作成される  
1. config/vite.json
2. vite.config.ts
3. procfile.dev

1と2+.envの設定が必要になる。  
まずは初期状態で以下コマンドを実行してみる。
```bash
bin/vite dev

# 以下のログが出力される

appuser@0663c0951aeb:/app/project$ bin/vite dev

  VITE v5.4.19  ready in 248 ms

  ➜  Local:   http://localhost:3306/vite-dev/
  ➜  Network: http://172.18.0.3:3306/vite-dev/



```


### config/vite.json





## トラブルシューティング

- webが立ち上がらない

webのdocker logsを参照する  
docker compose logs rails_web

  - サービスの確認

  docker compose ps  
  docker compose ps -a


- 環境変数が反映されない

webをrestart

- bundle installでエラー

permissionエラーなら一度インストール先のディレクトリを削除の上bundle installし直すか、chown -Rで権限を変える。  
→rootでbundle installし、作業用ユーザーでbundle installした時に発生する。  
　作業用ユーザーに変更する