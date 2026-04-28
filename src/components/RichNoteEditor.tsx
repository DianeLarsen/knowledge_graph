"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";

type EditorTag = {
  id: string;
  name: string;
};

type RichNoteEditorProps = {
  initialContent?: string;
  tags: EditorTag[];
  onChange: (data: { plainText: string; json: string }) => void;
  onTagUsed?: (tagName: string) => void;
};

export default function RichNoteEditor({
  initialContent,
  tags,
  onChange,
  onTagUsed,
}: RichNoteEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
        }),
        Highlight,
        Link.configure({
          openOnClick: false,
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
              "inline-flex cursor-help rounded bg-blue-100 px-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
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
                  "inline-flex cursor-help rounded bg-blue-100 px-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
                title: tagName ? `#${tagName}` : "Tag",
                "data-tag-name": tagName,
              },
              "🏷",
            ];
          },

          suggestion: {
            char: "#",

            items: ({ query }) => {
              const cleanQuery = query.trim();

              const matches = tags
                .filter((tag) =>
                  tag.name.toLowerCase().startsWith(cleanQuery.toLowerCase()),
                )
                .slice(0, 5)
                .map((tag) => ({
                  id: tag.id,
                  label: tag.name,
                }));

              if (
                cleanQuery.length > 0 &&
                !matches.some(
                  (tag) => tag.label.toLowerCase() === cleanQuery.toLowerCase(),
                )
              ) {
                matches.push({
                  id: `new:${cleanQuery}`,
                  label: `Create "${cleanQuery}"`,
                });
              }

              return matches;
            },

            render: () => {
              let popup: HTMLDivElement;

              function update(props: any) {
                if (!popup) return;

                popup.innerHTML = props.items
                  .map(
                    (item: any, index: number) => `
          <div
            class="px-3 py-1 text-sm cursor-pointer text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            data-index="${index}"
          >
            ${item.label}
          </div>
        `,
                  )
                  .join("");

                const rect = props.clientRect?.();

                if (rect) {
                  popup.style.left = `${rect.left}px`;
                  popup.style.top = `${rect.bottom + 6}px`;
                }

                popup.querySelectorAll("[data-index]").forEach((el) => {
                  el.addEventListener("click", () => {
                    const index = Number(el.getAttribute("data-index"));
                    props.command(props.items[index]);
                  });
                });
              }

              return {
                onStart: (props) => {
                  popup = document.createElement("div");

                  popup.className =
                    "fixed z-[9999] min-w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900";

                  document.body.appendChild(popup);

                  update(props);
                },

                onUpdate: update,

                onKeyDown(props) {
                  if (props.event.key === "Escape") {
                    popup.remove();
                    return true;
                  }

                  return false;
                },

                onExit() {
                  popup.remove();
                },
              };
            },

            command: ({ editor, range, props }) => {
              const isNew = String(props.id).startsWith("new:");
              const tagName = isNew
                ? String(props.id).replace("new:", "")
                : String(props.label);

              editor
                .chain()
                .focus()
                .insertContentAt(range, [
                  {
                    type: "mention",
                    attrs: {
                      id: props.id,
                      label: "🏷",
                      tagName,
                    },
                  },
                  { type: "text", text: " " },
                ])
                .run();

              onTagUsed?.(tagName);
            },
          },
        }),
      ],
      content: getInitialEditorContent(initialContent),
      immediatelyRender: false,
      onUpdate({ editor }) {
        onChange({
          plainText: editor.getText(),
          json: JSON.stringify(editor.getJSON()),
        });
      },
    },
    [tags],
  );

  if (!editor) {
    return null;
  }
  function getInitialEditorContent(initialContent?: string) {
    if (!initialContent) {
      return "<p></p>";
    }

    try {
      return JSON.parse(initialContent);
    } catch {
      return initialContent;
    }
  }
  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-950">
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

      <EditorContent
        editor={editor}
        className="
          min-h-40 px-3 py-2
          text-sm text-gray-900 dark:text-gray-100

          [&_.ProseMirror]:min-h-40
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-2
        "
      />
    </div>
  );
}
