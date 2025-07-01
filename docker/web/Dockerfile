FROM ruby:3.4.2

# UID/GIDを引数(yamlのargs)で受け取る（デフォルト1000）
ARG U_ID=1000
ARG G_ID=1000
ARG USERNAME=appuser
ARG GROUPNAME=appgroup

# 必要なパッケージをインストール（PostgreSQL向け）
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  yarn \
  bash \
  git \
  curl \
  sudo \
  && rm -rf /var/lib/apt/lists/*

# nodejsを別途インストール(apt-getは古い為)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs \
 && npm install -g npm vite vue


# ユーザー作成 + sudo権限付与
RUN groupadd -g ${U_ID} ${GROUPNAME} \
 && useradd -u ${G_ID} -g ${GROUPNAME} -m ${USERNAME} \
 && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

 # ------------------------------

# 作業ディレクトリ(Docker関連がある場所) docker/web/Dockerfile
# /app/作成するプロジェクト/appが階層となる
WORKDIR /app

# 作業ディレクトリとGemfileの事前コピー
WORKDIR /app/project
COPY project/Gemfile project/Gemfile.lock ./
RUN gem install bundler && bundle install --verbose

# entrypointのコピー
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# アプリ全体をコピー（初期rails new後用）
COPY project/ ./

# ソケット用ディレクトリを作成（Pumaで使用する場合）
RUN sudo mkdir -p /app/rails_app/tmp/sockets

# アプリケーションファイル全体をコピー
COPY project ./

# ------------------------------

# 実行ユーザー切替
USER ${USERNAME}

# rails new後に使用可能。初回(rails new前)はsleep infinityする
# CMD ["bash", "-c", "bundle install && bin/rails s -p 3000 -b '0.0.0.0'"]
CMD ["rails", "server", "-b", "0.0.0.0"]
