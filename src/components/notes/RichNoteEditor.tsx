"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { Tag, Reference } from "@/db/schema";
import { useState } from "react";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";

type EditorTag = {
  id: string;
  name: string;
};
type ContextMenuState = {
  x: number;
  y: number;
  from: number;
  to: number;
} | null;
type RichNoteEditorProps = {
  initialContent: string;
  tags: Tag[];
  references?: Reference[];
  onTagUsed?: (tagName: string) => void;
  onReferenceUsed?: (referenceId: string) => void;
  onChange: (data: { plainText: string; json: string }) => void;
};

export default function RichNoteEditor({
  initialContent,
  tags,
  onChange,
  onTagUsed,
  onReferenceUsed,
  references = [],
}: RichNoteEditorProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectedText, setSelectedText] = useState("");

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
        }),
        TagMark,
        ReferenceMark,
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

  function closeContextMenu() {
    setContextMenu(null);
  }

  function highlightSelection() {
    if (!editor) return;

    editor.chain().focus().toggleHighlight().run();
    closeContextMenu();
  }

function linkSelectionToReference(reference: Reference) {
  if (!editor || !contextMenu) return;

  editor
    .chain()
    .focus()
    .setTextSelection({
      from: contextMenu.from,
      to: contextMenu.to,
    })
    .setMark("referenceMark", {
      referenceId: reference.id,
      referenceTitle: reference.title,
    })
    .run();

  onReferenceUsed?.(reference.id);
  closeContextMenu();
}

function tagSelection(tag: Tag) {
  if (!editor || !contextMenu) return;

  editor
    .chain()
    .focus()
    .setTextSelection({
      from: contextMenu.from,
      to: contextMenu.to,
    })
    .setMark("tagMark", {
      tagId: tag.id,
      tagName: tag.name,
    })
    .run();

  onTagUsed?.(tag.name);
  closeContextMenu();
}

function createTagFromSelection() {
  if (!editor || !selectedText || !contextMenu) return;

  const tagName = selectedText.trim().replace(/^#/, "").toLowerCase();

  editor
    .chain()
    .focus()
    .setTextSelection({
      from: contextMenu.from,
      to: contextMenu.to,
    })
    .insertContent([
      {
        type: "mention",
        attrs: {
          id: `new:${tagName}`,
          label: "🏷",
          tagName,
        },
      },
      { type: "text", text: " " },
    ])
    .run();

  onTagUsed?.(tagName);
  closeContextMenu();
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

      <div
        className="relative"
        onClick={closeContextMenu}
        onContextMenu={(event) => {
          event.preventDefault();

          if (!editor.state.selection.empty) {
            const { from, to } = editor.state.selection;

            const text = editor.state.doc.textBetween(from, to, " ");

            setSelectedText(text.trim());

            setContextMenu({
              x: event.clientX,
              y: event.clientY,
              from,
              to,
            });
          }
        }}
      >
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

        {contextMenu && (
          <div
            className="fixed z-[9999] w-64 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              Selected:{" "}
              <span className="font-semibold">
                {selectedText.length > 40
                  ? `${selectedText.slice(0, 40)}...`
                  : selectedText}
              </span>
            </div>
            <button
              type="button"
              onClick={highlightSelection}
              className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Highlight selected text
            </button>
            {selectedText && (
              <button
                type="button"
                onClick={createTagFromSelection}
                className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Create tag: #
                {selectedText.trim().replace(/^#/, "").toLowerCase()}
              </button>
            )}
            {tags.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Tag selected text
                </p>

                <div className="max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => tagSelection(tag)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {references.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Link selected text to reference
                </p>

                <div className="max-h-40 overflow-y-auto">
                  {references.map((reference) => (
                    <button
                      key={reference.id}
                      type="button"
                      onClick={() => linkSelectionToReference(reference)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                      title={reference.title}
                    >
                      {reference.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
