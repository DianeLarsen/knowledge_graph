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
import { NoteLinkMark } from "@/lib/tiptap/extensions/NoteLinkMark";

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

type ReadOnlyNoteLink = {
  id: string;
  title: string;
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

const inlineConnectionSelector =
  "[data-reference-mark], [data-tag-mark], [data-inline-tag-id], [data-note-link-mark], [data-note-link-id], .mention";

export default function ReadOnlyNoteContent({
  content,
  references = [],
  tags = [],
  tagColorMap = {},
}: ReadOnlyNoteContentProps) {
  const [preview, setPreview] = useState<{
    x: number;
    y: number;
    tags: ReadOnlyTag[];
    references: ReadOnlyReference[];
    noteLinks: ReadOnlyNoteLink[];
  } | null>(null);

  const [hoverPreview, setHoverPreview] = useState<{
    x: number;
    y: number;
    tags: ReadOnlyTag[];
    references: ReadOnlyReference[];
    noteLinks: ReadOnlyNoteLink[];
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preview) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (popupRef.current?.contains(target)) return;

      const clickedReferenceOrTag =
        target instanceof Element && target.closest(inlineConnectionSelector);

      if (clickedReferenceOrTag) return;

      setPreview(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [preview]);

  function getInlineConnectionsFromTarget(target: HTMLElement) {
    const foundTags = new Map<string, ReadOnlyTag>();
    const foundReferences = new Map<string, ReadOnlyReference>();
    const foundNoteLinks = new Map<string, ReadOnlyNoteLink>();
    let current: HTMLElement | null = target;

    while (current && current !== contentRef.current) {
      const tagId =
        current.dataset.tagId ??
        current.getAttribute("data-inline-tag-id") ??
        current.getAttribute("data-id");

      const tagName =
        current.dataset.tagName ??
        current.getAttribute("data-tag-name") ??
        current.dataset.label ??
        current.getAttribute("data-label");

      if (
        (current.matches("[data-tag-mark]") ||
          current.hasAttribute("data-inline-tag-id") ||
          current.classList.contains("mention")) &&
        (tagId || tagName)
      ) {
        const tag =
          tags.find((item) => item.id === tagId) ??
          tags.find((item) => item.name === tagName) ??
          (tagId || tagName
            ? {
                id: tagId ?? tagName ?? "unknown-tag",
                name: tagName ?? tagId ?? "unknown",
              }
            : null);

        if (tag) {
          foundTags.set(tag.id, tag);
        }
      }
      const noteLinkId = current.dataset.noteLinkId;
      const noteLinkTitle = current.dataset.noteLinkTitle;

      if (
        (current.matches("[data-note-link-mark]") ||
          current.hasAttribute("data-note-link-id")) &&
        noteLinkId
      ) {
        foundNoteLinks.set(noteLinkId, {
          id: noteLinkId,
          title: noteLinkTitle ?? "Untitled note",
        });
      }
      const referenceId = current.dataset.referenceId;

      if (current.matches("[data-reference-mark]") && referenceId) {
        const reference = references.find((item) => item.id === referenceId);

        if (reference) {
          foundReferences.set(reference.id, reference);
        }
      }

      current = current.parentElement;
    }

    return {
      tags: Array.from(foundTags.values()),
      references: Array.from(foundReferences.values()),
      noteLinks: Array.from(foundNoteLinks.values()),
    };
  }

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
      NoteLinkMark,
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
            "mention inline rounded bg-blue-100 px-1 text-blue-700 align-baseline leading-[inherit] dark:bg-blue-900/40 dark:text-blue-200",
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
              class: `mention inline rounded px-1 align-baseline leading-[inherit] ${getTagColorClasses(
                tagId,
              )}`,
              "data-inline-tag-id": tagId,
              "data-tag-id": tagId,
              "data-id": tagId,
              "data-tag-name": tagName,
              "data-label": tagName,
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

  useEffect(() => {
    if (!editor) return;

    const elements =
      contentRef.current?.querySelectorAll(
        "[data-inline-tag-id], [data-tag-mark], [data-reference-mark]",
      ) ?? [];

    elements.forEach((element) => {
      element.removeAttribute("title");
    });
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div ref={contentRef} className="relative" onClick={() => setPreview(null)}>
      <EditorContent
        editor={editor}
        onClick={(event) => {
          const target = event.target as HTMLElement;

          const clickedInlineMark = target.closest(inlineConnectionSelector);

          if (!clickedInlineMark) return;

          event.preventDefault();
          event.stopPropagation();

          const connections = getInlineConnectionsFromTarget(target);

          if (
            connections.tags.length === 0 &&
            connections.references.length === 0 &&
            connections.noteLinks.length === 0
          ) {
            return;
          }

          setPreview({
            x: event.clientX,
            y: event.clientY,
            tags: connections.tags,
            references: connections.references,
            noteLinks: connections.noteLinks,
          });
        }}
        onMouseMove={(event) => {
          const target = event.target as HTMLElement;

          const clickedInlineMark = target.closest(inlineConnectionSelector);

          if (!clickedInlineMark) {
            setHoverPreview(null);
            return;
          }

          const connections = getInlineConnectionsFromTarget(target);

          if (
            connections.tags.length === 0 &&
            connections.references.length === 0 &&
            connections.noteLinks.length === 0
          ) {
            setHoverPreview(null);
            return;
          }

          setHoverPreview({
            x: event.clientX,
            y: event.clientY,
            tags: connections.tags,
            references: connections.references,
            noteLinks: connections.noteLinks,
          });
        }}
        onMouseLeave={() => {
          setHoverPreview(null);
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
        [&_.mention]:cursor-pointer

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

        [&_.note-link-mark]:cursor-pointer
        [&_.note-link-mark]:rounded
        [&_.note-link-mark]:px-1
        [&_.note-link-mark]:font-semibold
        [&_.note-link-mark]:underline
        [&_.note-link-mark]:decoration-dotted
        [&_.note-link-mark]:underline-offset-2
        [&_.note-link-mark]:bg-purple-100
        [&_.note-link-mark]:text-purple-700
        dark:[&_.note-link-mark]:bg-purple-900/40
        dark:[&_.note-link-mark]:text-purple-200
      "
      />

      {typeof document !== "undefined" &&
        preview &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[9999] w-80 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-800 dark:bg-gray-950"
            style={{
              left: preview.x,
              top: preview.y + 12,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Inline connections
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {preview.tags.length} tag
                  {preview.tags.length === 1 ? "" : "s"} ·{" "}
                  {preview.references.length} reference
                  {preview.references.length === 1 ? "" : "s"} ·{" "}
                  {preview.noteLinks.length} note link
                  {preview.noteLinks.length === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>

            {preview.tags.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Tags
                </p>

                <div className="flex flex-wrap gap-2">
                  {preview.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {preview.noteLinks.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Note links
                </p>

                <div className="space-y-2">
                  {preview.noteLinks.map((note) => (
                    <a
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="block rounded-lg border border-purple-200 bg-purple-50 p-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-200 dark:hover:bg-purple-900/40"
                    >
                      {note.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {preview.references.length > 0 && (
              <div className="mt-3 space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  References
                </p>

                {preview.references.map((reference) => (
                  <div
                    key={reference.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {reference.title}
                    </p>

                    {reference.author && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {reference.author}
                      </p>
                    )}

                    {reference.notes && (
                      <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                        {reference.notes}
                      </p>
                    )}

                    <ApaCitationPanel reference={reference} />

                    {reference.url && (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-blue-600 underline dark:text-blue-300"
                      >
                        Open source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
      {typeof document !== "undefined" &&
        hoverPreview &&
        !preview &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9998] max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-950"
            style={{
              left: hoverPreview.x + 12,
              top: hoverPreview.y + 12,
            }}
          >
            {hoverPreview.tags.length > 0 && (
              <div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">
                  Tags
                </p>

                <div className="mt-1 flex flex-wrap gap-1">
                  {hoverPreview.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hoverPreview.references.length > 0 && (
              <div className={hoverPreview.tags.length > 0 ? "mt-2" : ""}>
                <p className="font-semibold text-gray-500 dark:text-gray-400">
                  References
                </p>

                <div className="mt-1 space-y-1">
                  {hoverPreview.references.map((reference) => (
                    <p
                      key={reference.id}
                      className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                    >
                      {reference.title ?? "Untitled reference"}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {hoverPreview.noteLinks.length > 0 && (
              <div
                className={
                  hoverPreview.tags.length > 0 ||
                  hoverPreview.references.length > 0
                    ? "mt-2"
                    : ""
                }
              >
                <p className="font-semibold text-gray-500 dark:text-gray-400">
                  Note links
                </p>

                <div className="mt-1 space-y-1">
                  {hoverPreview.noteLinks.map((note) => (
                    <p
                      key={note.id}
                      className="rounded bg-purple-100 px-2 py-0.5 font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200"
                    >
                      {note.title}
                    </p>
                  ))}
                </div>
              </div>
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
