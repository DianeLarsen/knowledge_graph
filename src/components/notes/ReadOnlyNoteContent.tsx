"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";
import { useState } from "react";

type ReadOnlyReference = {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  notes: string | null;
};

type ReadOnlyNoteContentProps = {
  content: string | null;
  references?: ReadOnlyReference[];
};

export default function ReadOnlyNoteContent({
  content,
  references = [],
}: ReadOnlyNoteContentProps) {
  const [preview, setPreview] = useState<{
    x: number;
    y: number;
    reference: ReadOnlyReference;
  } | null>(null);
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
    <div className="relative" onClick={() => setPreview(null)}>
      <EditorContent
        editor={editor}
        onClick={(event) => {
          const target = event.target as HTMLElement;

          const referenceElement = target.closest(
            "[data-reference-mark]",
          ) as HTMLElement | null;

          if (!referenceElement) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          const referenceId = referenceElement.dataset.referenceId;

          if (!referenceId) {
            return;
          }

          const reference = references.find((item) => item.id === referenceId);

          if (!reference) {
            return;
          }

          setPreview({
            x: event.clientX,
            y: event.clientY,
            reference,
          });
        }}
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

        [&_.reference-mark]:cursor-pointer
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

      {preview && (
        <div
          className="fixed z-[9999] w-80 rounded-xl border border-amber-200 bg-white p-3 text-sm shadow-lg dark:border-amber-800 dark:bg-gray-950"
          style={{
            left: preview.x,
            top: preview.y + 12,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {preview.reference.title}
              </p>

              {preview.reference.author && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {preview.reference.author}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPreview(null)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>

          {preview.reference.notes && (
            <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
              {preview.reference.notes}
            </p>
          )}

          {preview.reference.url && (
            <a
              href={preview.reference.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-blue-600 underline dark:text-blue-300"
            >
              Open source
            </a>
          )}
        </div>
      )}
    </div>
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
