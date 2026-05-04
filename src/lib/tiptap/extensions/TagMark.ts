import { Mark, mergeAttributes } from "@tiptap/core";

export const TagMark = Mark.create({
  name: "tagMark",

  addAttributes() {
    return {
      tagId: {
        default: null,
      },
      tagName: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-tag-mark]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const tagId = HTMLAttributes.tagId ?? "";
    const tagName = HTMLAttributes.tagName ?? "";

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-tag-mark": "",
        "data-tag-id": tagId,
        "data-tag-name": tagName,
        class:
          "tag-mark rounded bg-blue-50 px-1 text-blue-700 underline decoration-dotted underline-offset-2 dark:bg-blue-900/30 dark:text-blue-200",
        title: tagName ? `#${tagName}` : "Tagged text",
      }),
      0,
    ];
  },
});
