import { redirect } from "next/navigation";
import { NOTE_LIST_PATH } from "@app/constants/note";

/**
 * 野球ノート一覧は練習記録一覧のノートタブへ統合済み。
 * 既存のブックマーク・外部リンクを生かすためリダイレクトだけ残す。
 */
export default function NoteList() {
  redirect(NOTE_LIST_PATH);
}
