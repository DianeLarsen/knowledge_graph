"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";

type ReadOnlyNoteContentProps = {
  content: string | null;
};

export default function ReadOnlyNoteContent({
  content,
}: ReadOnlyNoteContentProps) {
    console.log(content)
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        link: false,
      }),

      Highlight,
      TagMark,
      ReferenceMark,
      Link.configure({
        openOnClick: true,
      }),

      Mention.extend({
        addAttributes() {
          return {
            id: {
              default: null,
            },
            label: {
              default: null,
            },
            tagName: {
              default: null,
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class:
            "mention inline-flex cursor-help rounded bg-blue-100 px-1 text-blue-700 align-baseline leading-none dark:bg-blue-900/40 dark:text-blue-200",
        },

        renderText({ node }) {
          return node.attrs.label || "🏷";
        },

        renderHTML({ node }) {
          const tagName = node.attrs.tagName ?? "";

          return [
            "span",
            {
              class:
                "mention inline-flex cursor-help rounded bg-blue-100 px-1 text-blue-700 align-baseline leading-none dark:bg-blue-900/40 dark:text-blue-200",
              title: tagName ? `#${tagName}` : "Tag",
              "data-tag-name": tagName,
            },
            "🏷",
          ];
        },
      }),
    ],

    content: getInitialEditorContent(content),
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <EditorContent
      editor={editor}
      className="
    min-h-40 px-3 py-2
    text-sm text-gray-900 dark:text-gray-100

    [&_.ProseMirror]:min-h-40
    [&_.ProseMirror]:outline-none
    [&_.ProseMirror_p]:my-2

    [&_.ProseMirror_a]:rounded
    [&_.ProseMirror_a]:px-1
    [&_.ProseMirror_a]:underline

    [&_.tag-mark]:rounded
    [&_.tag-mark]:bg-blue-50
    [&_.tag-mark]:px-1
    [&_.tag-mark]:text-blue-700
    [&_.tag-mark]:underline
    [&_.tag-mark]:decoration-dotted
    [&_.tag-mark]:underline-offset-2
    dark:[&_.tag-mark]:bg-blue-900/30
    dark:[&_.tag-mark]:text-blue-200

    [&_.reference-mark]:rounded
    [&_.reference-mark]:bg-amber-50
    [&_.reference-mark]:px-1
    [&_.reference-mark]:text-amber-800
    [&_.reference-mark]:underline
    [&_.reference-mark]:decoration-dotted
    [&_.reference-mark]:underline-offset-2
    dark:[&_.reference-mark]:bg-amber-900/30
    dark:[&_.reference-mark]:text-amber-200
  "
    />
  );
}

function getInitialEditorContent(content?: string | null) {
  if (!content) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "No content yet." }],
        },
      ],
    };
  }

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}
