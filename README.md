# Rails Docker

RailsをDocker環境で構築する。  
Nginx + PUMA + PostgreSQL + pgAdmin + Vite + Vue + TailWindCss

## 前提

- ホストにdocker,gitが導入済みであること  
- webとnpm run devが同一環境であること  
  viteが別コンテナの場合はうまく行かない可能性があります。

## 環境概要

本アプリケーションは、以下の技術スタックおよびDockerを用いた仮想環境で構築されています。

### アプリケーション構成

- ruby 3.4.2
- Rails 8.0.2
- postgres 17.5
- pgAdmin 9.4
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
# 再生性後、必要なgemを追記してbundle installを行う

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
- pgAdmin
http://localhost:8081/browser/
- Vite
http://localhost:3036/vite-dev/

## .env設定例

.env（compose用）

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

# --- pgAdmin ---
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
VITE_RUBY_PORT=3036
VITE_RUBY_TEST_PORT=3037

```

project/.env（app用）

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
VITE_RUBY_PORT=3036
VITE_RUBY_TEST_PORT=3037

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
設定の詳細と期待される結果は以下に記載する。

### config/vite.json

設定例

ポイントは
`sourceCodeDir` をassetsを配置している箇所に設定する。  
`additionalEntrypoints` にビルドしたいファイルを指定する。

developmentのhost、autoBuildの設定を確認する。  
今回、app/frontend以下にcss,js,imagesが存在し、さらにその中にurl単位のディレクトリが存在する。  
その場合は明示的に読まないとビルド対象とならない。

```

{
  "all": {
    "sourceCodeDir": "app/frontend",
    "watchAdditionalPaths": [
      "app/frontend",
      "vendor/assets"
    ],
    "entrypointsDir": "app/frontend",
    "additionalEntrypoints": [
      "~/js/**/*",
      "~/css/**/*",
      "~/images/**/*"
    ]
  },
  "development": {
    "host": "0.0.0.0",
    "autoBuild": true,
    "publicOutputDir": "vite-dev",
    "port": 3036
  },
  "test": {
    "autoBuild": true,
    "publicOutputDir": "vite-test",
    "port": 3037
  }
}


```


### vite.config.ts

tailwindcssのバージョンがv4だと別途パッケージ追加が必要になりますが、ここでは省略します。  
npm installして以下のようにimportすればいいはずです。  

*ポイント*

1. serverのhost,portをconfig/vite.jsonと合わせる。  
2. resolveのaliasにvueを設定する。  
3. pluginsにRubyPlugin(),vue()を設定する。  

*注意点：*

serverのhost,portは環境変数にVITE_RUBY_HOST、VITE_RUBY_PORTが設定されていると  
vite.config.tsに値を設定しても使用されない。  

正確にはViteはvite.config.tsよりも.envで定義されたVITE_RUBY_HOST/VITE_RUBY_PORTを優先して読み取る為、結果として設定した値が使用されない現象が起きる。

気づきにくい仕様があるので環境変数の設定をしている人は注意が必要。

また、defineConfigにbuildの設定が可能ですが、今回はconfig/vite.jsonに集約しています。  

```

import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import vue from  '@vitejs/plugin-vue'
import path from 'path'
// import tailwindcss from "@tailwindcss/vite"; // v4用

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3036,
    strictPort: true,
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, 'app/frontend/js'),
      '@components': path.resolve(__dirname, 'app/frontend/js/components'),
      '@css': path.resolve(__dirname, 'app/frontend/css'),
    },
  },
  plugins: [
    RubyPlugin(),
    vue(),
    // tailwindcss() // v4用
  ],
})


```

## tailwind

設定例  
application.cssをapplication.jsからimportすることで利用される。  

```

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  
    content: [
    './app/views/**/*.{html,erb,haml,slim}',                // Rails のビューファイル
    './app/helpers/**/*.rb',                                // helper 内でHTMLタグを返すことがある場合
    './app/frontend/js/**/*.{js,ts,jsx,tsx,vue}',           // Viteで読み込むフロントエンドコード
    './app/frontend/css/**/*.{css,sass}',                   // Viteで読み込むフロントエンドコード
    './app/components/**/*.{erb,html,rb}',                  // ViewComponent
  ],
  
  theme: {
    extend: {
        fontFamily: {
            sans: ['Figtree', ...defaultTheme.fontFamily.sans],
        },
    },
  },

  plugins: [forms],
}


```



### 動作確認

```bash
bin/vite dev

# 以下のようなログが出力される
# Local+Network両方出ていればOK  

appuser@0663c0951aeb:/app/project$ bin/vite dev

  VITE v5.4.19  ready in 248 ms

  ➜  Local:   http://localhost:3036/vite-dev/
  ➜  Network: http://172.18.0.3:3036/vite-dev/

# NGパターン
# Networkが表示されないとホットリロードされない。

```

続いてビルドも試す

```bash
bin/vite build


# 以下のようなログが出力される

appuser@5cf2c67b9d69:/app/project$ bin/vite build
Building with Vite ⚡
vite v5.4.19 building for development...
transforming...
✓ 2 modules transformed.
rendering chunks...
computing gzip size...
../../public/vite-dev/.vite/manifest-assets.json         0.13 kB │ gzip:  0.11 kB
../../public/vite-dev/assets/Test-m7WPhM6X.vue           0.29 kB
../../public/vite-dev/.vite/manifest.json                0.82 kB │ gzip:  0.27 kB
../../public/vite-dev/assets/application-BLDWVu3h.css   13.32 kB │ gzip:  3.10 kB
../../public/vite-dev/assets/index-l0sNRNKZ.js           0.00 kB │ gzip:  0.02 kB
../../public/vite-dev/assets/application-D0qSg-6n.js     0.06 kB │ gzip:  0.07 kB
../../public/vite-dev/assets/index-ufHPCSAQ.js         170.64 kB │ gzip: 63.84 kB
✓ built in 1.84s
Build with Vite complete: /app/project/public/vite-dev


# NGパターン
# 以下のログが出たらjsやvue側に問題がある。ログを確認して対処する

Build with Vite failed! ❌


```

続いてbin/vite devをし、viteサーバーを立ち上げた状態でブラウザから画面にアクセスする。  
コンソールにエラーが出ておらず、ネットワークで各種js,vueが読み込まれていることを確認する。

コンソールには以下のように出力される  
[vite] connected.


## トラブルシューティング

コンソールに出力される情報、ネットワーク情報、ログ（tail -f log/development.log）に出力される情報は重点的に確認をします。  
特に、F12のコンソールと要素の確認は必須です。  
わざとエラーが起きるようにしましたが、別なエラーもあると思います。  
その際は情報共有もらえると助かります。


- webが立ち上がらない

webのdocker logsを参照する  
docker compose logs rails_web

  - サービスの確認

  docker compose ps  
  docker compose ps -a


- 環境変数が反映されない

rails cしてENVの中身をみて変わっていても実際には変わらない。  

webをrestartする  

```bash
# puma使用かつ環境変数レベルであれば以下でOK
docker compose exec web pkill -USR2 -f puma
# Railsの設定ファイル系を変えた際は念の為サーバーを落としてから再スタートする
docker compose stop web
docker compose start web
```

- bundle installでエラー

今回あまり関係ないが起こり得る問題として。  
permissionエラーなら一度インストール先のディレクトリを削除の上bundle installし直すか、chown -Rで権限を変える。  
→rootでbundle installし、作業用ユーザーでbundle installした時に発生する。  
　基本的にはrootでbundle installはNGなので作業用ユーザーに変更する  
  初回のrails newの時くらい。

- bin/vite dev時のエラー

1. (!) Could not auto-determine entry point from rollupOptions or html files and there are no explicit optimizeDeps.include patterns. Skipping dependency pre-bundling.

ビルド対象のファイルがエントリーポイントにいないという警告。  
config/vite.jsonの`sourceCodeDir`、`additionalEntrypoints`あたりを重点的に確認する。  
bin/vite build時のエラーで、ビルド対象がいない場合も同様の対応をする。


2. @vite/clientが生成されない

めちゃくちゃ詰まりポイント  

本来、application.html.erbにて、<%= vite_client_tag %>をすると以下のタグが出力される。  
<script src="/vite-dev/@vite/client" crossorigin="anonymous" type="module"></script>

それが生成されず、コンソールにもエラーが起きない現象が起きる。

bin/vite devをした際に、  
Local:   http://localhost:3036/vite-dev/  
これのみだと起こる模様。  

原因として、vite.jsonとvite.config.tsの設定に不整合があると発生する。  
他の原因もありそうだが確定なのはこれ。 
私もこれが起きて、一回環境をリセットしてやり直したレベルで原因がわからなかった。  
他にも、.envの以下の項目に値がセットされていると最優先される(gemのruby_viteが内部的に参照している値)のが気が付かないポイント  
- VITE_RUBY_HOST 
- VITE_RUBY_PORT

この設定があるせいで不整合が起きていた。  
多分おそらく確認はしていないが、.envに記載がなく、compose.yamlにも設定がなければ素直にvite関連の設定変更箇所の設定が使われると思う。  

3. hmrされない  

監視対象になっていない可能性があるので、bin/vite buildした時のパスに含まれているか(manifest.json)を確認する。  
含まれていなければconfig/vite.jsonを確認する。

問題なければブラウザ側のコンソールを確認し、@vite/clientがあるか等を確認する。  

4. wsのサーバーへの接続ができない

ws://localhost:3036/vite-dev/?token=Tlqw8-MMN3ud のサーバーへの接続を確立できませんでした。

とでる。  

config/vite.jsonとvite.config.tsの設定の不整合があると発生する。  
クロスオリジン系の問題が出ている場合は、ホストに0.0.0.0を設定してしまう。


修正後、bin/vite devの実行コンソールに

  ➜  press h + enter to show help
1:52:40 PM [vite] page reload /app/project/app/views/layouts/application.html.erb
1:53:28 PM [vite] page reload /app/project/app/views/layouts/application.html.erb (x2)
1:55:36 PM [vite] page reload js/samples/index.js

このようなログが出るようになればOK。

5. パスの参照エラー

MIME タイプ (“”) が許可されていないため、“http://localhost:3000/vite-dev/@fs/app/project/application.js” からのモジュールの読み込みがブロックされました。  
のようなエラーが出る。

vite_javascript_tagなどにmanifest.jsonに存在しないパスを指定した場合発生する  
パスを確認の上修正をする。

6. ViteRuby::MissingEntrypointError

ブラウザアクセス時、ViteRuby::MissingEntrypointErrorが発生する。  

Vite Ruby can't find js/samples/index.js in the manifests.  
のように原因が表示されているので対応する。  

7. Vueがbuildされない

vite.config.tsのresolveのailiasにvueが抜けていると発生する。  
設定を追加する。



以上。