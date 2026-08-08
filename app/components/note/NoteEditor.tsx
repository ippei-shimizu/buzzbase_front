"use client";
import type { NoteEditorProps } from "@app/interface";
import { useState } from "react";
import { createEditor, type BaseEditor, type Descendant } from "slate";
import { Slate, Editable, withReact, type ReactEditor } from "slate-react";
import { parseMemoToSlateValue } from "@app/utils/noteMemo";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export default function NoteEditor({ memo, setMemo }: NoteEditorProps) {
  const [editor] = useState(() => withReact(createEditor()));

  // 旧データ（プレーンテキスト）や壊れた JSON でも Slate に不正な値を渡さない。
  const initialValue: Descendant[] = parseMemoToSlateValue(memo);

  const handleChange = (value: Descendant[]) => {
    setMemo(JSON.stringify(value));
  };

  return (
    <>
      <div className="border-2 border-zinc-700 rounded-md w-full">
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={handleChange}
        >
          <Editable
            className="p-2 focus:outline-none h-full !min-h-[140px] text-sm leading-6"
            placeholder="メモする...."
          />
        </Slate>
      </div>
    </>
  );
}
