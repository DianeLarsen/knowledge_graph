import type { Editor } from "@tiptap/react";

type RichNoteEditorToolbarProps = {
  editor: Editor;
};

export default function RichNoteEditorToolbar({
  editor,
}: RichNoteEditorToolbarProps) {
  return (
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
  );
}
