# front E2E（Playwright / ゴールデンパス）

画面遷移・打席記録ウィザード・集計表示の結合バグを E2E で守る。mobile の Maestro（#380）に
対応する Web 版。ゴールデンパスは結合の主導線と後方互換に絞る（3〜5 本）。

## フロー構成

| ファイル                         | 目的                                      | 守るリスク                   |
| -------------------------------- | ----------------------------------------- | ---------------------------- |
| `01-smoke.spec.ts`               | signin 画面の表示                         | 起動・土台の疎通（認証不要） |
| `02-existing-user-stats.spec.ts` | 既存ユーザーでログイン → 成績画面表示     | v2 リファクタの後方互換      |
| `03-record-new-game.spec.ts`     | 記録 → 試合情報フォーム・記録パターン分岐 | 新仕様の主導線の結合         |
| `helpers/auth.ts`                | signin 経由のログイン共通処理             | -                            |

## ローカル実行

```bash
# 初回のみブラウザを取得
npx playwright install chromium

# 稼働中の front とテストユーザーを指定して実行
E2E_BASE_URL=http://localhost:8100 \
E2E_EMAIL=<test-user@example.com> E2E_PASSWORD=<password> \
  yarn e2e

# UI モード（flow 作成・デバッグに便利）
yarn e2e:ui

# 疎通だけ（認証・バックエンド不要）
E2E_BASE_URL=http://localhost:8100 yarn e2e e2e/01-smoke.spec.ts
```

## 前提

- **対象環境**: `E2E_BASE_URL` に稼働中の front（ローカル docker は `http://localhost:8100`、CI はステージング等）。
- **テストユーザー**: バックエンドに v1 データを seed 済みのアカウント。`E2E_EMAIL` / `E2E_PASSWORD` で渡す（認証フローはこのユーザーでログインする）。

## CI

`.github/workflows/playwright-e2e.yml`。ログインに稼働バックエンドが必要なため、デプロイ済み
環境（`E2E_BASE_URL`）に対して実行する。重いので `workflow_dispatch` と `release/**` PR に限定。
安定 green 後に通常 PR トリガを有効化する。

## セレクタ方針と今後の拡張

- 現状はロール / テキスト / placeholder セレクタ中心。
- 打席記録ウィザードの深い導線（グラウンドタップ等の座標・動的要素）は、対象要素に
  `data-testid` を付与してから段階的に伸ばすのが安定する（`03` の TODO 参照）。
- `yarn e2e:ui` で実セレクタを確認しながら追加する。
