"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

type RichNoteEditorProps = {
  initialContent?: string;
  onChange: (data: { plainText: string; json: string }) => void;
};

export default function RichNoteEditor({
  initialContent,
  onChange,
}: RichNoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange({
        plainText: editor.getText(),
        json: JSON.stringify(editor.getJSON()),
      });
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-950">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-2 dark:border-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:text-gray-100"
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:text-gray-100"
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className="rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:text-gray-100"
        >
          Highlight
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="
          min-h-40 px-3 py-2
          text-sm text-gray-900 dark:text-gray-100

          [&_.ProseMirror]:min-h-40
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-2
        "
      />
    </div>
  );
}
