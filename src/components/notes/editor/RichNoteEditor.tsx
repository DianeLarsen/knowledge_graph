"use client";

import { EditorContent } from "@tiptap/react";
import { Tag, Reference } from "@/db/schema";
import { useState, useEffect, useRef } from "react";
import { colorClassMap } from "@/lib/tagColorClasses";
import { useRichNoteEditor } from "@/components/notes/editor/useRichNoteEditor";
import type {
  ContextMenuReference,
  ContextMenuState,
  ContextMenuTag,
  RichNoteEditorProps,
} from "@/lib/types/editorTypes";
import RichNoteEditorToolbar from "@/components/notes/editor/RichNoteEditorToolbar";
import {
  editorHeights,
  markStyles,
  proseStyles,
} from "@/components/notes/editor/richNoteEditorStyles";
import { TagColor } from "@/lib/types/tags/tagColors";

type HydratableMark = {
  type?: string;
  attrs?: {
    tagId?: string;
    tagName?: string;
    color?: TagColor;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type HydratableNode = {
  content?: HydratableNode[];
  marks?: HydratableMark[];
  [key: string]: unknown;
};

function hydrateTagColors(
  node: HydratableNode,
  tagMap: Record<string, TagColor>,
): HydratableNode {
  if (Array.isArray(node.content)) {
    node.content = node.content.map((child) => hydrateTagColors(child, tagMap));
  }

  if (Array.isArray(node.marks)) {
    node.marks = node.marks.map((mark) => {
      if (mark.type === "tagMark") {
        const tagId = mark.attrs?.tagId;
        const tagName = mark.attrs?.tagName?.toLowerCase();

        return {
          ...mark,
          attrs: {
            ...mark.attrs,
            color:
              mark.attrs?.color ??
              tagMap[tagId ?? ""] ??
              tagMap[tagName ?? ""] ??
              "blue",
          },
        };
      }

      return mark;
    });
  }

  return node;
}

function hydrateInitialContent(
  initialContent: string,
  tagMap: Record<string, TagColor>,
) {
  if (!initialContent) return "<p></p>";

  try {
    const parsed = JSON.parse(initialContent);
    return hydrateTagColors(parsed, tagMap);
  } catch {
    return initialContent;
  }
}

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
  tagColorMap = {},
}: RichNoteEditorProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tagColorMapRef = useRef(tagColorMap);
  function applyInlineTagColors() {
    const root = editorWrapperRef.current;
    if (!root) return;

    const allColorClasses = Object.values(colorClassMap).flat();

    const elements = root.querySelectorAll(
      "[data-tag-id], [data-inline-tag-id], [data-tag-name]",
    );

    elements.forEach((element) => {
      const tagId =
        element.getAttribute("data-tag-id") ??
        element.getAttribute("data-inline-tag-id");

      const tagName = element.getAttribute("data-tag-name");

      const tag = tags.find(
        (item) =>
          item.id === tagId ||
          item.name.toLowerCase() === tagName?.toLowerCase(),
      );

      const cleanTagId = tagId?.replace(/^new:/, "");
      const cleanTagName = tagName?.toLowerCase();

      const color =
        tagColorMapRef.current[tagId ?? ""] ??
        tagColorMapRef.current[cleanTagId ?? ""] ??
        tagColorMapRef.current[cleanTagName ?? ""] ??
        (tag ? tagColorMapRef.current[tag.id] : undefined) ??
        "blue";

      const classes = colorClassMap[color];

      element.classList.remove(...allColorClasses);
      element.classList.add(...classes);

      element.setAttribute("data-tag-color-applied", color);
    });
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      applyInlineTagColors();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagColorMap]);

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

  const referencesRef = useRef(references);
  const selectedReferenceIdsRef = useRef(selectedReferenceIds);
  const inlineReferenceIdsRef = useRef(inlineReferenceIds);
  const editorWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    tagColorMapRef.current = tagColorMap;
  }, [tagColorMap]);

  useEffect(() => {
    referencesRef.current = references;
  }, [references]);

  useEffect(() => {
    selectedReferenceIdsRef.current = selectedReferenceIds;
  }, [selectedReferenceIds]);

  useEffect(() => {
    inlineReferenceIdsRef.current = inlineReferenceIds;
  }, [inlineReferenceIds]);

  const hydratedInitialContent = hydrateInitialContent(
    initialContent,
    tagColorMap,
  );

  function scheduleInlineTagColors() {
    requestAnimationFrame(() => {
      applyInlineTagColors();
    });
  }

  const editor = useRichNoteEditor({
    initialContent: hydratedInitialContent,
    tags,
    onChange,
    onTagUsed,
    applyInlineTagColors: scheduleInlineTagColors,
  });

  useEffect(() => {
    scheduleInlineTagColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tagColorMap, tags]);

  if (!editor) {
    return null;
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

    const confirmed = window.confirm(
      "Remove this inline tag from the selected text? The text will stay.",
    );

    if (!confirmed) return;

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.isText) return;

          node.marks.forEach((mark) => {
            if (mark.type.name !== "tagMark") return;

            const sameTag =
              (tagToRemove.tagId && mark.attrs.tagId === tagToRemove.tagId) ||
              (tagToRemove.tagName &&
                mark.attrs.tagName === tagToRemove.tagName);

            if (!sameTag) return;

            const markFrom = Math.max(pos, from);
            const markTo = Math.min(pos + node.nodeSize, to);

            tr.removeMark(markFrom, markTo, state.schema.marks.tagMark);
          });
        });

        return true;
      })
      .run();

    onChange({
      plainText: editor.getText(),
      json: JSON.stringify(editor.getJSON()),
    });

    if (tagToRemove.tagName) {
      onTagRemoved?.(tagToRemove.tagName);
    }

    closeContextMenu();
  }

  function removeSpecificReferenceFromSelection(
    referenceToRemove: ContextMenuReference,
  ) {
    if (!editor || !contextMenu) return;

    const confirmed = window.confirm(
      "Remove this inline reference from the selected text? The text will stay.",
    );

    if (!confirmed) return;

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.isText) return;

          node.marks.forEach((mark) => {
            if (mark.type.name !== "referenceMark") return;

            const sameReference =
              (referenceToRemove.referenceId &&
                mark.attrs.referenceId === referenceToRemove.referenceId) ||
              (referenceToRemove.referenceTitle &&
                mark.attrs.referenceTitle === referenceToRemove.referenceTitle);

            if (!sameReference) return;

            const markFrom = Math.max(pos, from);
            const markTo = Math.min(pos + node.nodeSize, to);

            tr.removeMark(markFrom, markTo, state.schema.marks.referenceMark);
          });
        });

        return true;
      })
      .run();

    onChange({
      plainText: editor.getText(),
      json: JSON.stringify(editor.getJSON()),
    });

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
        color: tag.color ?? "blue",
      })
      .run();

    onTagUsed?.(tag.name);
    scheduleInlineTagColors();
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
        color: tagColorMapRef.current[tagName] ?? "blue",
      })
      .run();

    onTagUsed?.(tagName);
    scheduleInlineTagColors();
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

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-950">
      <RichNoteEditorToolbar editor={editor} />

      <div
        ref={editorWrapperRef}
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
                    {tags
                      .filter(
                        (tag) =>
                          !contextMenu.tags.some(
                            (inlineTag) =>
                              inlineTag.tagId === tag.id ||
                              inlineTag.tagName === tag.name,
                          ),
                      )
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => tagSelection(tag)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          #{tag.name}
                        </button>
                      ))}
                    {tags.every((tag) =>
                      contextMenu.tags.some(
                        (inlineTag) =>
                          inlineTag.tagId === tag.id ||
                          inlineTag.tagName === tag.name,
                      ),
                    ) && (
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        All available tags are already applied to this
                        selection.
                      </p>
                    )}
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
                    {references
                      .filter(
                        (reference) =>
                          !contextMenu.references.some(
                            (inlineReference) =>
                              inlineReference.referenceId === reference.id,
                          ),
                      )
                      .map((reference) => {
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
                    {references.every((reference) =>
                      contextMenu.references.some(
                        (inlineReference) =>
                          inlineReference.referenceId === reference.id,
                      ),
                    ) && (
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        All available references are already linked to this
                        selection.
                      </p>
                    )}
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
