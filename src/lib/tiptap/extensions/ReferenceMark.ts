import { Mark, mergeAttributes } from "@tiptap/core";

export const ReferenceMark = Mark.create({
  name: "referenceMark",

  addAttributes() {
    return {
      referenceId: {
        default: null,
      },
      referenceTitle: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-reference-mark]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const referenceTitle = HTMLAttributes.referenceTitle ?? "";

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-reference-mark": "",
        class:
          "reference-mark rounded bg-amber-50 px-1 text-amber-800 underline decoration-dotted underline-offset-2 dark:bg-amber-900/30 dark:text-amber-200",
        title: referenceTitle || "Referenced text",
      }),
      0,
    ];
  },
});
