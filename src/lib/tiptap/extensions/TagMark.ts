import { Mark, mergeAttributes } from "@tiptap/core";

export const TagMark = Mark.create({
  name: "tagMark",
  excludes: "",
  inclusive: false,
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
        "data-inline-tag-id": tagId,
        "data-tag-id": tagId,
        "data-tag-name": tagName,
        class:
          "tag-mark rounded px-1 underline decoration-dotted underline-offset-2",
        title: tagName ? `#${tagName}` : "Tagged text",
      }),
      0,
    ];
  },
});
