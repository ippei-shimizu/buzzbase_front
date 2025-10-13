.PHONY: dev build start lint lint-fix format check postbuild install test test-watch test-coverage test-ci help

help:
	@echo "使用可能なコマンド:"
	@echo "  make dev             - 開発サーバーを起動"
	@echo "  make build           - 本番用ビルド"
	@echo "  make start           - 本番サーバーを起動"
	@echo "  make lint            - ESLintでコードをチェック"
	@echo "  make lint-fix        - ESLintでコードをチェック&自動修正"
	@echo "  make format          - Prettierでコードフォーマット"
	@echo "  make check           - TypeScriptの型チェックを実行"
	@echo "  make postbuild       - next-sitemapを実行"
	@echo "  make install         - 依存関係をインストール"
	@echo "  make test            - 全テストを実行"
	@echo "  make test-watch      - watchモードでテストを実行"
	@echo "  make test-coverage   - カバレッジ付きでテストを実行"
	@echo "  make test-ci         - CI用のテスト実行（カバレッジ付き）"

dev:
	yarn dev

build:
	yarn build

start:
	yarn start

lint:
	yarn lint

lint-fix:
	yarn lint:fix

format:
	yarn format

check:
	yarn check

postbuild:
	yarn postbuild

install:
	yarn install

test:
	yarn test

test-watch:
	yarn test:watch

test-coverage:
	yarn test:coverage

test-ci:
	yarn test:ci
