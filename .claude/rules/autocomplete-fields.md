# Autocomplete（allowsCustomValue）で id を扱うルール

HeroUI（React Aria）の `Autocomplete` を「既存候補から選ぶ / 無ければ手入力して新規作成する」用途で使う欄の規約。同じクラスのバグが issue #548・#549 で2回出ているため定型化する。

対象は `front/app/(app)/game-result/record/page.tsx` の自チーム / 相手チーム / 球場 / 大会 / シーズン欄のように、**表示名の state と id の state を併せ持つ**フィールド。

## ライブラリの前提（依存している挙動）

- `selectedKey` が自動で null になるのは **入力を空にしたときだけ**。選択済みの状態から別名へ打ち替えても id は解除されない
- blur / Escape / Enter では `commitCustomValue` が走り `onSelectionChange(null)` が飛ぶ。これは「クリア」ではなく「custom value の確定」なので、名前を消してはいけない

## 実装ルール

- **id の確定・解除は `onInputChange` に一本化する**。`onSelectionChange` の null は無視する（`if (key == null) return;`）。逆にすると、打ち替え後も古い id が残って**別のレコードの id で保存される**
- **`inputValue` を controlled にする**（`inputValue={name}`）。uncontrolled のままだと、state が空になっても入力欄には文字が見えたままという食い違いが起きる
- **名前の比較は保存時と同じ `trim()` 後の基準で行う**。保存側だけ trim していると、末尾スペース付き入力で id が未確定に落ちて不要な作成リクエストが飛ぶ
- **確定済み id の名前と入力が一致する間はその id を維持する**。名前だけで引き直すと同名レコードで先頭の id にすり替わる（チーム名の重複は実在する）
- **id を数値化する位置を揃え、ガードは正規化後の値に掛ける**（`opponentTeamId = Number(res.data.id)` → `if (!id || Number.isNaN(id))`）
- 編集時に id だけ先に確定する画面では、候補一覧が揃ってから表示名を解決する（一覧の到着タイミングは不定）

```tsx
const resolveTeamIdByName = (teams, confirmedId, value) => {
  const name = value.trim();
  const confirmed =
    confirmedId === null
      ? undefined
      : teams.find((team) => String(team.id) === String(confirmedId));
  if (confirmed && confirmed.name === name) return confirmedId;
  const matched = teams.find((team) => team.name === name);
  return matched ? Number(matched.id) : null;
};
```

## 対になるフィールドは同時に直す

同一フォームに同種の欄が複数ある場合（自チームと相手チーム）、**片方だけ直すと非対称が残り、それがそのまま次のバグになる**。issue #549 は #548 で自チームだけ直したことが原因だった。1つ直したら、同じファイルの同種の欄を grep して同じ形に揃える。

## 回帰テストで固定する操作

id の解除は上記のライブラリ挙動に依存しているため、次の経路はテストで固定する。

- 候補選択後に打ち替えて保存 → 打ち替えた名前で新規作成した id が送られる
- 候補選択のまま保存 → 新規作成が走らず選んだ id が送られる
- 候補選択後に入力を全消し → 未入力として弾かれる
- 候補選択後に打ち替えて blur → 入力欄の名前が消えない
- 編集モードで開く → id から表示名が復元される

テスト中は候補リストが開いている間 React Aria が他要素を aria-hidden にするため、保存操作の前に `{Escape}` でリストを閉じる。combobox の参照は先にまとめて取得しておく。
