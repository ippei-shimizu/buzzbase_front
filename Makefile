.PHONY: dev build start lint format check postbuild install help

help:
	@echo "使用可能なコマンド:"
	@echo "  make dev        - 開発サーバーを起動"
	@echo "  make build      - 本番用ビルド"
	@echo "  make start      - 本番サーバーを起動"
	@echo "  make lint       - リンターを実行"
	@echo "  make format     - コードフォーマットを実行"
	@echo "  make check      - TypeScriptの型チェックを実行"
	@echo "  make postbuild  - next-sitemapを実行"
	@echo "  make install    - 依存関係をインストール"

dev:
	yarn dev

build:
	yarn build

start:
	yarn start

lint:
	yarn lint

format:
	yarn format

check:
	yarn check

postbuild:
	yarn postbuild

install:
	yarn install
