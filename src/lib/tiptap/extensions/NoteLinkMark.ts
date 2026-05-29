import { Mark, mergeAttributes } from "@tiptap/core";

export const NoteLinkMark = Mark.create({
  name: "noteLinkMark",

  addAttributes() {
    return {
      noteId: {
        default: null,
      },
      noteTitle: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-note-link-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-note-link-mark": "true",
        "data-note-link-id": HTMLAttributes.noteId,
        "data-note-link-title": HTMLAttributes.noteTitle,
        class:
          "note-link-mark cursor-pointer rounded bg-purple-100 px-1 font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
      }),
      0,
    ];
  },
});
