# 環境構築手順（Qiitaのコピペも多いので精査の必要あり）

# WSLをインストール
wsl --install -d Ubuntu-24.04

# パッケージリスト更新
sudo apt update
sudo apt upgrade -y

# 基本ツール
sudo apt install -y curl git unzip ca-certificates gnupg lsb-release

# Apache、PHP、PostgreSQL、Composer等をインストール
sudo apt install -y apache2 php libapache2-mod-php php-pgsql php-mbstring php-xml php-curl php-zip php-intl
sudo apt install -y postgresql postgresql-contrib
sudo apt install -y composer

# Apacheの設定バックアップ（念のため）
sudo cp /etc/apache2/ports.conf /etc/apache2/ports.conf.bak
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/000-default.conf.bak

# ports.confを編集してポートを8080にする（ほかのWSLとの競合が怖いので設定）
sudo sed -i "s/Listen 80/Listen 8080/g" /etc/apache2/ports.conf

# HTTPS用設定を追加
echo "Listen 8443" | sudo tee -a /etc/apache2/ports.conf >/dev/null

# VirtualHostを8080に変更
sudo sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:8080>/g" /etc/apache2/sites-available/000-default.conf

# Apacheの再起動
sudo systemctl restart apache2

# 起動状態確認
sudo systemctl status apache2 --no-pager

# postgresのインストール
sudo apt install -y postgresql postgresql-contrib

# PostgreSQLのバージョンディレクトリを検出
PGVER_DIR=$(ls /etc/postgresql) || { echo "Postgres config dir not found"; exit 1; }
echo "Postgres version dir: $PGVER_DIR"

# postgresql.confのポートとlisten_addressesを変更（バックアップ後に編集）
sudo cp /etc/postgresql/"$PGVER_DIR"/main/postgresql.conf /etc/postgresql/"$PGVER_DIR"/main/postgresql.conf.bak

# コメントアウトされている可能性があるためsedで置換し、なければ追記する
sudo sed -i "s/^#\?\s*port\s*=.*/port = 5433/" /etc/postgresql/"$PGVER_DIR"/main/postgresql.conf
sudo sed -i "s/^#\?\s*listen_addresses\s*=.*/listen_addresses = '*'/" /etc/postgresql/"$PGVER_DIR"/main/postgresql.conf

# pg_hba.confにWindows(ローカル) からの接続許可（127.0.0.1）を追加（バックアップ）
sudo cp /etc/postgresql/"$PGVER_DIR"/main/pg_hba.conf /etc/postgresql/"$PGVER_DIR"/main/pg_hba.conf.bak

# 既にある場合を考慮しつつ、下行を追加（パスワード認証）
echo "host    all     all     127.0.0.1/32    md5" | sudo tee -a /etc/postgresql/"$PGVER_DIR"/main/pg_hba.conf >/dev/null
echo "host    all     all     ::1/128         md5" | sudo tee -a /etc/postgresql/"$PGVER_DIR"/main/pg_hba.conf >/dev/null

# PostgreSQLを再起動して設定反映（公開するときはIPアドレスは*ではなく指定のアドレスにする！）
sudo systemctl restart postgresql
sudo systemctl status postgresql --no-pager

# 再起動後、Postgresが5433でリッスンしているか確認
ss -ltnp | grep 5433

# postgresユーザーでpsqlに入ってユーザーとDBを作成
sudo -u postgres psql -c "CREATE ROLE ejima WITH LOGIN PASSWORD 'ejima0902' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE \"Matu\" OWNER ejima;"

# 確認
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"

# /var/www/htmlを準備
sudo mkdir -p /var/www/html
sudo chown -R $USER:www-data /var/www/html
sudo chmod -R 775 /var/www/html

# プロジェクトをクローン
cd /var/www/html
git clone https://github.com/ejimasyota/MProject.git

# 所有者をwww-dataにする
sudo chown -R www-data:www-data /var/www/html/MProject
sudo find /var/www/html/MProject -type d -exec chmod 755 {} \;
sudo find /var/www/html/MProject -type f -exec chmod 644 {} \;

# サービスの自動起動
sudo systemctl enable --now postgresql
sudo systemctl enable --now apache2

# テーブル作成
psql -U ejima -d Matu -p 5433
-- 1.プレイヤーテーブル
CREATE TABLE PlayerInfo (
  playerid UUID PRIMARY KEY,                         -- プレイヤーID
  playername VARCHAR(20) NOT NULL,                   -- プレイヤー名
  registdate TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP  -- 登録年月日
);

-- 2.セーブテーブル
CREATE TABLE SaveInfo (
  saveid SERIAL NOT NULL PRIMARY KEY,                 -- セーブID
  saveslotid INTEGER NOT NULL,                        -- セーブスロットID
  playerid UUID NOT NULL,                             -- プレイヤーID(外部キーとして利用はしない)
  storyid INTEGER NOT NULL,                           -- ストーリーID
  registdate TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,  -- 登録年月日
  updatedate TIMESTAMP(3)                             -- 更新年月日
);

-- 3.バックログテーブル
CREATE TABLE BackLogInfo (
  logid SERIAL NOT NULL,                              -- バックログID
  saveslotid INTEGER NOT NULL,                        -- セーブスロットID(外部キーとして利用はしない)
  playerid UUID NOT NULL,                             -- プレイヤーID(外部キーとして利用はしない)
  narrator VARCHAR(50),                               -- 語り手
  storytext TEXT,                                     -- ストーリー内容
  PRIMARY KEY (logid, saveslotid, playerid)
);

# 確認
\dt

# 終了
\q

# SERIAL型があるのに複合主キーを設定するのは無駄なので取り除く
ALTER TABLE SaveInfo
DROP CONSTRAINT saveinfo_pkey;

ALTER TABLE BackLogInfo
DROP CONSTRAINT backloginfo_pkey;

ALTER TABLE SaveInfo
ADD CONSTRAINT saveinfo_pkey PRIMARY KEY (saveid);

ALTER TABLE BackLogInfo
ADD CONSTRAINT backloginfo_pkey PRIMARY KEY (logid);
  
# 所有者確認（git pull時のエラー発生時に行う) 
ls -ld /var/www/html/MProject

# リポジトリの所有者と実行ユーザーを一致させる
git config --global --add safe.directory /var/www/html/MProject

# 権限を設定
sudo chown -R $USER:$USER /var/www/html/MProject
l
# 下記を実行してApache2の設定ファイルを開く
sudo nano /etc/apache2/sites-available/000-default.conf

# ドキュメントルートを下記に設定（コマンドではないので注意！！！！）
DocumentRoot /var/www/html/MProject

# 保存後に再起動
sudo systemctl restart apache2

# ドキュメントルートを確認
sudo grep -R "DocumentRoot" /etc/apache2/sites-enabled/

# サイトを起動（IPはテスト端末のWSLのものなので本番では別のIPを利用する）
http://172.20.14.20:8080/frontend/pages/Start.php

