import { Mark, mergeAttributes } from "@tiptap/core";
import { colorClassMap } from "@/lib/tagColorClasses";
import { TagColor } from "@/lib/types/tags/tagColors";

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
      color: {
        default: "blue",
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
    const color = (HTMLAttributes.color as TagColor | undefined) ?? "blue";

    const { class: _className, ...safeAttributes } = HTMLAttributes;

    return [
      "span",
      mergeAttributes(safeAttributes, {
        "data-tag-mark": "",
        "data-inline-tag-id": tagId,
        "data-tag-id": tagId,
        "data-tag-name": tagName,
        "data-tag-color": color,
        class: `tag-mark rounded px-1 underline decoration-dotted underline-offset-2 ${colorClassMap[
          color
        ].join(" ")}`,
        title: tagName ? `#${tagName}` : "Tagged text",
      }),
      0,
    ];
  },
});
