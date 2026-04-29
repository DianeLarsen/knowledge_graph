"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";

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
 font-['Comic_Sans_MS','Bradley_Hand',cursive]
    text-lg text-gray-900 dark:text-gray-100

    [&_.ProseMirror]:outline-none
    [&_.ProseMirror]:whitespace-pre-wrap
    [&_.ProseMirror]:leading-[32px]
    [&_.ProseMirror]:pt-[7px]

    [&_.ProseMirror_p]:my-0
    [&_.ProseMirror_p]:leading-[32px]

    [&_mark]:rounded
    [&_mark]:bg-yellow-200
    [&_mark]:px-1
    dark:[&_mark]:bg-yellow-800

    [&_.mention]:align-baseline
    [&_.mention]:leading-none
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
