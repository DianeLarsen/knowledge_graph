"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { Tag } from "@/db/schema";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";
import type {
  MentionSuggestionItem,
  MentionSuggestionProps,
} from "@/components/notes/editor/editorTypes";

type UseRichNoteEditorArgs = {
  initialContent: string | object;
  tags: Tag[];
  onChange: (data: { plainText: string; json: string }) => void;
  onTagUsed?: (tagName: string) => void;
  applyInlineTagColors: () => void;
};

export function useRichNoteEditor({
  initialContent,
  tags,
  onChange,
  onTagUsed,
  applyInlineTagColors,
}: UseRichNoteEditorArgs) {
  const tagSuggestionKey = tags.map((tag) => `${tag.id}:${tag.name}`).join("|");
  return useEditor(
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
              id: { default: null },
              label: { default: null },
              tagName: { default: null },
            };
          },
        }).configure({
          HTMLAttributes: {
            class: "inline-flex rounded px-1",
          },
          deleteTriggerWithBackspace: true,
          renderText({ node }) {
            const tagName = node.attrs.tagName || node.attrs.label;

            return tagName ? `#${tagName}` : "#tag";
          },

          renderHTML({ node }) {
            const tagId = node.attrs.id ?? "";
            const tagName = node.attrs.tagName || node.attrs.label || "";

            return [
              "span",
              {
                class: "mention inline-flex rounded px-1",
                title: tagName ? `#${tagName}` : "Tag",
                "data-inline-tag-id": tagId,
                "data-tag-name": tagName,
              },
              tagName ? `#${tagName}` : "#tag",
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
                      label: tagName,
                      tagName,
                    },
                  },
                  { type: "text", text: " " },
                ])
                .run();

              onTagUsed?.(tagName);
              queueMicrotask(applyInlineTagColors);
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

        queueMicrotask(applyInlineTagColors);
      },
    },
    [tagSuggestionKey],
  );
}

function getInitialEditorContent(initialContent?: string | object) {
  if (!initialContent) return "<p></p>";

  if (typeof initialContent !== "string") {
    return initialContent;
  }

  try {
    return JSON.parse(initialContent);
  } catch {
    return initialContent;
  }
}
