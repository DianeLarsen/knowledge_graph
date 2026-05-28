"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { TagMark } from "@/lib/tiptap/extensions/TagMark";
import { ReferenceMark } from "@/lib/tiptap/extensions/ReferenceMark";
import { useState, useEffect, useRef, useCallback } from "react";
import { TagColor } from "@/lib/types/tags/tagColors";
import ApaCitationPanel from "@/components/references/ApaCitationPanel";
import { createPortal } from "react-dom";
import {
  getReferenceColorByIndex,
  referenceColorClassMap,
} from "@/lib/referenceColorClasses";

type ReadOnlyReference = {
  id: string;
  type: string;
  title: string | null;
  author: string | null;
  url: string | null;
  publisher: string | null;
  publishedDate: string | null;
  citation: string | null;
  notes: string | null;
};

type ReadOnlyTag = {
  id: string;
  name: string;
};

type ReadOnlyNoteContentProps = {
  content: string | null;
  references?: ReadOnlyReference[];
  tags?: ReadOnlyTag[];
  tagColorMap?: Record<string, TagColor>;
};

const colorClassMap: Record<TagColor, string[]> = {
  blue: [
    "bg-blue-100",
    "text-blue-700",
    "dark:bg-blue-900/40",
    "dark:text-blue-200",
  ],
  sky: [
    "bg-sky-100",
    "text-sky-700",
    "dark:bg-sky-900/40",
    "dark:text-sky-200",
  ],
  cyan: [
    "bg-cyan-100",
    "text-cyan-700",
    "dark:bg-cyan-900/40",
    "dark:text-cyan-200",
  ],
  teal: [
    "bg-teal-100",
    "text-teal-700",
    "dark:bg-teal-900/40",
    "dark:text-teal-200",
  ],
  emerald: [
    "bg-emerald-100",
    "text-emerald-700",
    "dark:bg-emerald-900/40",
    "dark:text-emerald-200",
  ],
  green: [
    "bg-green-100",
    "text-green-700",
    "dark:bg-green-900/40",
    "dark:text-green-200",
  ],
  lime: [
    "bg-lime-100",
    "text-lime-700",
    "dark:bg-lime-900/40",
    "dark:text-lime-200",
  ],
  amber: [
    "bg-amber-100",
    "text-amber-700",
    "dark:bg-amber-900/40",
    "dark:text-amber-200",
  ],
  orange: [
    "bg-orange-100",
    "text-orange-700",
    "dark:bg-orange-900/40",
    "dark:text-orange-200",
  ],
  rose: [
    "bg-rose-100",
    "text-rose-700",
    "dark:bg-rose-900/40",
    "dark:text-rose-200",
  ],
  pink: [
    "bg-pink-100",
    "text-pink-700",
    "dark:bg-pink-900/40",
    "dark:text-pink-200",
  ],
  purple: [
    "bg-purple-100",
    "text-purple-700",
    "dark:bg-purple-900/40",
    "dark:text-purple-200",
  ],
  violet: [
    "bg-violet-100",
    "text-violet-700",
    "dark:bg-violet-900/40",
    "dark:text-violet-200",
  ],
  indigo: [
    "bg-indigo-100",
    "text-indigo-700",
    "dark:bg-indigo-900/40",
    "dark:text-indigo-200",
  ],
};

export default function ReadOnlyNoteContent({
  content,
  references = [],
  tags = [],
  tagColorMap = {},
}: ReadOnlyNoteContentProps) {
  const [preview, setPreview] = useState<
    | {
        type: "reference";
        x: number;
        y: number;
        reference: ReadOnlyReference;
      }
    | {
        type: "tag";
        x: number;
        y: number;
        tag: ReadOnlyTag;
      }
    | null
  >(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preview) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (popupRef.current?.contains(target)) return;

      const clickedReferenceOrTag =
        target instanceof Element &&
        target.closest("[data-reference-mark], [data-tag-mark]");

      if (clickedReferenceOrTag) return;

      setPreview(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [preview]);

  function getTagColorClasses(tagId?: string | null) {
    if (!tagId) return colorClassMap.blue.join(" ");
    return colorClassMap[tagColorMap[tagId] ?? "blue"].join(" ");
  }

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
            "mention inline cursor-help rounded bg-blue-100 px-1 text-blue-700 align-baseline leading-[inherit] dark:bg-blue-900/40 dark:text-blue-200",
        },

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
              class: `mention inline cursor-help rounded px-1 align-baseline leading-[inherit] ${getTagColorClasses(
                tagId,
              )}`,
              title: tagName ? `#${tagName}` : "Tag",
              "data-inline-tag-id": tagId,
              "data-tag-name": tagName,
            },
            tagName ? `#${tagName}` : "#tag",
          ];
        },
      }),
    ],

    content: getInitialEditorContent(content),
    immediatelyRender: false,
  });

  const getReferenceColorClasses = useCallback(
    (referenceId?: string | null) => {
      if (!referenceId) return referenceColorClassMap.slate.join(" ");

      const index = references.findIndex(
        (reference) => reference.id === referenceId,
      );
      const color = getReferenceColorByIndex(index >= 0 ? index : 0);

      return referenceColorClassMap[color].join(" ");
    },
    [references],
  );

  useEffect(() => {
    if (!editor) return;

    const allColorClasses = Object.values(colorClassMap).flat();

    const elements =
      contentRef.current?.querySelectorAll("[data-inline-tag-id]") ?? [];

    elements.forEach((element) => {
      const tagId = element.getAttribute("data-inline-tag-id");
      const color = tagColorMap[tagId ?? ""] ?? "blue";

      element.classList.remove(...allColorClasses);
      element.classList.add(...colorClassMap[color]);
    });
  }, [editor, tagColorMap]);

  useEffect(() => {
    if (!editor) return;

    const allColorClasses = Object.values(referenceColorClassMap).flat();

    const elements =
      contentRef.current?.querySelectorAll("[data-reference-mark]") ?? [];

    elements.forEach((element) => {
      const referenceId = element.getAttribute("data-reference-id");
      const classes = getReferenceColorClasses(referenceId).split(" ");

      element.classList.remove(...allColorClasses);
      element.classList.add(...classes);
    });
  }, [editor, getReferenceColorClasses]);

  if (!editor) return null;

  return (
    <div ref={contentRef} className="relative" onClick={() => setPreview(null)}>
      <EditorContent
        editor={editor}
        onClick={(event) => {
          const target = event.target as HTMLElement;

          const referenceElement = target.closest(
            "[data-reference-mark]",
          ) as HTMLElement | null;

          if (referenceElement) {
            event.preventDefault();
            event.stopPropagation();

            const referenceId = referenceElement.dataset.referenceId;

            if (!referenceId) return;

            const reference = references.find(
              (item) => item.id === referenceId,
            );

            if (!reference) return;

            setPreview({
              type: "reference",
              x: event.clientX,
              y: event.clientY,
              reference,
            });

            return;
          }

          const tagElement = target.closest(
            "[data-tag-mark]",
          ) as HTMLElement | null;

          if (tagElement) {
            event.preventDefault();
            event.stopPropagation();

            const tagId = tagElement.dataset.tagId;
            const tagName = tagElement.dataset.tagName;

            const tag =
              tags.find((item) => item.id === tagId) ??
              tags.find((item) => item.name === tagName);

            if (!tag && tagName) {
              setPreview({
                type: "tag",
                x: event.clientX,
                y: event.clientY,
                tag: {
                  id: tagId ?? tagName,
                  name: tagName,
                },
              });
              return;
            }

            if (!tag) return;

            setPreview({
              type: "tag",
              x: event.clientX,
              y: event.clientY,
              tag,
            });

            return;
          }
        }}
        className="
        px-3 text-sm leading-[30px] text-gray-900 dark:text-gray-100

        [&_.ProseMirror]:leading-[30px]
        [&_.ProseMirror_p]:m-0
        [&_.ProseMirror_p]:min-h-[30px]
        [&_.ProseMirror_p]:leading-[30px]

        [&_.ProseMirror_a]:align-baseline
        [&_.ProseMirror_a]:leading-[inherit]

        [&_mark]:align-baseline
        [&_mark]:leading-[inherit]

        [&_.mention]:inline
        [&_.mention]:align-baseline
        [&_.mention]:leading-[inherit]

        [&_.tag-mark]:inline
        [&_.tag-mark]:align-baseline
        [&_.tag-mark]:leading-[inherit]

        [&_.reference-mark]:inline
        [&_.reference-mark]:align-baseline
        [&_.reference-mark]:leading-[inherit]

        [&_.ProseMirror_a]:rounded
        [&_.ProseMirror_a]:px-1
        [&_.ProseMirror_a]:underline

        [&_.tag-mark]:rounded
        [&_.tag-mark]:px-1
        [&_.tag-mark]:underline
        [&_.tag-mark]:decoration-dotted
        [&_.tag-mark]:underline-offset-2
        [&_.tag-mark]:cursor-pointer

        [&_.reference-mark]:cursor-pointer
        [&_.reference-mark]:rounded
        [&_.reference-mark]:px-1
        [&_.reference-mark]:underline
        [&_.reference-mark]:decoration-dotted
        [&_.reference-mark]:underline-offset-2
      "
      />

      {typeof document !== "undefined" &&
        preview &&
        createPortal(
          <div
            ref={popupRef}
            className={`fixed z-[9999] w-80 rounded-xl border bg-white p-3 text-sm shadow-lg dark:bg-gray-950 ${
              preview.type === "reference"
                ? "border-amber-200 dark:border-amber-800"
                : "border-blue-200 dark:border-blue-800"
            }`}
            style={{
              left: preview.x,
              top: preview.y + 12,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                {preview.type === "reference" ? (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {preview.reference.title}
                    </p>

                    {preview.reference.author && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {preview.reference.author}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      #{preview.tag.name}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tagged text
                    </p>
                  </>
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

            {preview.type === "reference" ? (
              <>
                {preview.reference.notes && (
                  <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    {preview.reference.notes}
                  </p>
                )}

                <ApaCitationPanel reference={preview.reference} />

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
              </>
            ) : (
              <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                This text is connected to the tag{" "}
                <span className="font-semibold">#{preview.tag.name}</span>.
              </p>
            )}
          </div>,
          document.body,
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
