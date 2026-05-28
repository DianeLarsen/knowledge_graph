import type { Editor } from "@tiptap/react";

type RichNoteEditorToolbarProps = {
  editor: Editor;
};

export default function RichNoteEditorToolbar({
  editor,
}: RichNoteEditorToolbarProps) {
  const buttonClass =
    "rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--input))] px-2 py-1 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card-muted))] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--card-muted))] p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass}
      >
        Bold
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass}
      >
        Italic
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={buttonClass}
      >
        Highlight
      </button>
    </div>
  );
}
