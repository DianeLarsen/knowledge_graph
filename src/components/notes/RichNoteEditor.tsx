"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { Tag, Reference } from "@/db/schema";
import { useState, useEffect, useRef } from "react";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";

type MentionSuggestionItem = {
  id: string;
  label: string;
};

type MentionSuggestionProps = {
  items: MentionSuggestionItem[];
  clientRect?: (() => DOMRect | null) | null;
  command: (item: MentionSuggestionItem) => void;
};

type ContextMenuTag = {
  tagId?: string;
  tagName?: string;
};

type ContextMenuReference = {
  referenceId?: string;
  referenceTitle?: string;
};
type ContextMenuState = {
  x: number;
  y: number;
  from: number;
  to: number;
  hasTagMark: boolean;
  hasReferenceMark: boolean;
  tagName?: string;
  referenceTitle?: string;
  tags: ContextMenuTag[];
  references: ContextMenuReference[];
} | null;
type RichNoteEditorProps = {
  initialContent: string;
  tags: Tag[];
  references?: Reference[];
  onTagUsed?: (tagName: string) => void;
  onReferenceUsed?: (referenceId: string) => void;
  onChange: (data: { plainText: string; json: string }) => void;
  getReferenceLabel: (reference: Reference) => string;
  onReferenceRemoved?: (referenceId: string) => void;
  onTagRemoved?: (tagName: string) => void;
  inlineReferenceIds: string[];
  selectedReferenceIds: string[];
};

export default function RichNoteEditor({
  initialContent,
  tags,
  onChange,
  onTagUsed,
  onReferenceUsed,
  references = [],
  getReferenceLabel,
  onReferenceRemoved,
  onTagRemoved,
  inlineReferenceIds,
  selectedReferenceIds,
}: RichNoteEditorProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    }

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

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
            allowedPrefixes: null,
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

              function update(props: MentionSuggestionProps) {
                if (!popup) return;

                popup.innerHTML = props.items
                  .map(
                    (item: MentionSuggestionItem, index: number) => `
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

  function getSelectedMarkInfo(from: number, to: number) {
    const foundTags = new Map<string, ContextMenuTag>();
    const foundReferences = new Map<string, ContextMenuReference>();

    editor?.state.doc.nodesBetween(from, to, (node) => {
      node.marks.forEach((mark) => {
        if (mark.type.name === "tagMark") {
          const tagId = mark.attrs.tagId as string | undefined;
          const tagName = mark.attrs.tagName as string | undefined;
          const key = tagId || tagName;

          if (key) {
            foundTags.set(key, { tagId, tagName });
          }
        }

        if (mark.type.name === "referenceMark") {
          const referenceId = mark.attrs.referenceId as string | undefined;
          const referenceTitle = mark.attrs.referenceTitle as
            | string
            | undefined;
          const key = referenceId || referenceTitle;

          if (key) {
            foundReferences.set(key, { referenceId, referenceTitle });
          }
        }
      });
    });

    const tagMarks = Array.from(foundTags.values());
    const referenceMarks = Array.from(foundReferences.values());

    return {
      tags: tagMarks,
      references: referenceMarks,
      hasTagMark: tagMarks.length > 0,
      hasReferenceMark: referenceMarks.length > 0,
    };
  }

  function removeSpecificTagFromSelection(tagToRemove: ContextMenuTag) {
    if (!editor || !contextMenu) return;

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.nodesBetween(from, to, (node, pos) => {
          node.marks.forEach((mark) => {
            if (
              mark.type.name === "tagMark" &&
              mark.attrs.tagId === tagToRemove.tagId &&
              mark.attrs.tagName === tagToRemove.tagName
            ) {
              const markFrom = Math.max(pos, from);
              const markTo = Math.min(pos + node.nodeSize, to);

              tr.removeMark(markFrom, markTo, mark);
            }
          });
        });

        return true;
      })
      .run();

    if (tagToRemove.tagName) {
      onTagRemoved?.(tagToRemove.tagName);
    }

    closeContextMenu();
  }

  function removeSpecificReferenceFromSelection(
    referenceToRemove: ContextMenuReference,
  ) {
    if (!editor || !contextMenu) return;

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.nodesBetween(from, to, (node, pos) => {
          node.marks.forEach((mark) => {
            if (
              mark.type.name === "referenceMark" &&
              mark.attrs.referenceId === referenceToRemove.referenceId &&
              mark.attrs.referenceTitle === referenceToRemove.referenceTitle
            ) {
              const markFrom = Math.max(pos, from);
              const markTo = Math.min(pos + node.nodeSize, to);

              tr.removeMark(markFrom, markTo, mark);
            }
          });
        });

        return true;
      })
      .run();
    if (referenceToRemove.referenceId) {
      onReferenceRemoved?.(referenceToRemove.referenceId);
    }
    closeContextMenu();
  }

  function highlightSelection() {
    if (!editor) return;

    editor.chain().focus().toggleHighlight().run();
    closeContextMenu();
  }

  function linkSelectionToReference(reference: Reference) {
    if (!editor || !contextMenu) return;
    const alreadyHasReference = contextMenu.references.some(
      (item) => item.referenceId === reference.id,
    );

    if (alreadyHasReference) {
      closeContextMenu();
      return;
    }
    editor
      .chain()
      .focus()
      .setTextSelection({
        from: contextMenu.from,
        to: contextMenu.to,
      })
      .setMark("referenceMark", {
        referenceId: reference.id,
        referenceTitle: getReferenceLabel(reference),
      })
      .run();

    onReferenceUsed?.(reference.id);
    closeContextMenu();
  }

  function tagSelection(tag: Tag) {
    if (!editor || !contextMenu) return;
    const alreadyHasTag = contextMenu.tags.some(
      (item) => item.tagId === tag.id || item.tagName === tag.name,
    );

    if (alreadyHasTag) {
      closeContextMenu();
      return;
    }
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
      .setMark("tagMark", {
        tagId: `new:${tagName}`,
        tagName,
      })
      .run();

    onTagUsed?.(tagName);
    closeContextMenu();
  }

  function getSafeContextMenuPosition(x: number, y: number) {
    const menuWidth = 256;
    const padding = 12;
    const offset = 12;

    const safeX =
      x + offset + menuWidth > window.innerWidth
        ? window.innerWidth - menuWidth - padding
        : x + offset;

    const maxMenuHeight = Math.floor(window.innerHeight * 0.8);
    const safeY =
      y + maxMenuHeight > window.innerHeight
        ? window.innerHeight - maxMenuHeight - padding
        : y;

    return {
      x: Math.max(padding, safeX),
      y: Math.max(padding, safeY),
    };
  }

const editorHeights = "min-h-[220px] md:min-h-[260px] xl:min-h-[300px]";

const proseStyles = `
  [&_.ProseMirror]:min-h-[220px]
  md:[&_.ProseMirror]:min-h-[260px]
  xl:[&_.ProseMirror]:min-h-[300px]
  [&_.ProseMirror]:outline-none
  [&_.ProseMirror_p]:my-2
`;

const markStyles = `
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
`;

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
        onContextMenu={(event) => {
          event.preventDefault();
          const position = getSafeContextMenuPosition(
            event.clientX,
            event.clientY,
          );
          if (editor.state.selection.empty) {
            closeContextMenu();
            return;
          }

          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to, " ");
          const markInfo = getSelectedMarkInfo(from, to);

          setSelectedText(text.trim());

          setContextMenu({
            x: position.x,
            y: position.y,
            from,
            to,
            ...markInfo,
          });
        }}
      >
        <EditorContent
          editor={editor}
          className={`
    ${editorHeights}
    ${proseStyles}
    ${markStyles}

    px-4 py-3
    text-sm text-[rgb(var(--text))]
  `}
        />

        {contextMenu && (
          <div
            ref={menuRef}
            className="fixed z-[9999] flex max-h-[80vh] w-64 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
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
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
              {(contextMenu.hasTagMark || contextMenu.hasReferenceMark) && (
                <div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Existing inline connections
                  </p>

                  {contextMenu.tags.map((tag) => (
                    <button
                      key={tag.tagId || tag.tagName}
                      type="button"
                      onClick={() => removeSpecificTagFromSelection(tag)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Remove tag {tag.tagName ? `#${tag.tagName}` : ""}
                    </button>
                  ))}

                  {contextMenu.references.map((reference) => (
                    <button
                      key={reference.referenceId || reference.referenceTitle}
                      type="button"
                      onClick={() =>
                        removeSpecificReferenceFromSelection(reference)
                      }
                      className="block w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Remove reference{" "}
                      {reference.referenceTitle
                        ? `(${reference.referenceTitle})`
                        : ""}
                    </button>
                  ))}
                </div>
              )}
              {tags.length > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {contextMenu.hasTagMark
                      ? "Change tag"
                      : "Tag selected text"}
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
                    {contextMenu.hasReferenceMark
                      ? "Change reference"
                      : "Link selected text to reference"}
                  </p>

                  <div className="max-h-40 overflow-y-auto">
                    {references.map((reference) => {
                      const selected = selectedReferenceIds.includes(
                        reference.id,
                      );
                      const isInline = inlineReferenceIds.includes(
                        reference.id,
                      );
                      return (
                        <button
                          key={reference.id}
                          type="button"
                          onClick={() => linkSelectionToReference(reference)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                          title={getReferenceLabel(reference)}
                        >
                          <span className="block font-medium">
                            {getReferenceLabel(reference)}
                          </span>

                          <span className="block text-xs opacity-75">
                            {isInline
                              ? "Used in text"
                              : selected
                                ? "Attached to note"
                                : "Not attached"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
