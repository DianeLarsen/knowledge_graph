"use client";

import { EditorContent } from "@tiptap/react";
import { Tag, Reference } from "@/db/schema";
import { useState, useEffect, useRef, useMemo } from "react";
import { colorClassMap } from "@/lib/tagColorClasses";
import { useRichNoteEditor } from "@/components/notes/editor/useRichNoteEditor";
import type {
  ContextMenuReference,
  ContextMenuState,
  ContextMenuTag,
  RichNoteEditorProps,
  InlineMentionRange,
} from "@/components/notes/editor/editorTypes";
import RichNoteEditorToolbar from "@/components/notes/editor/RichNoteEditorToolbar";
import {
  editorHeights,
  markStyles,
  proseStyles,
} from "@/components/notes/editor/richNoteEditorStyles";
import { TagColor } from "@/lib/types/tags/tagColors";
import {
  getReferenceColorByIndex,
  referenceColorClassMap,
} from "@/lib/referenceColorClasses";
import type { Mark as ProseMirrorMark } from "prosemirror-model";
import RichNoteContextMenu from "./RichNoteContextMenu";
import { createPortal } from "react-dom";

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

type InlineHoverTag = {
  id: string;
  name: string;
};

type InlineHoverReference = {
  id: string;
  title: string;
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

const inlineConnectionSelector =
  "[data-reference-mark], [data-reference-id], [data-tag-mark], [data-inline-tag-id], .mention";

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
  openConfirmDialog,
}: RichNoteEditorProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectedText, setSelectedText] = useState("");
  const [hoverPreview, setHoverPreview] = useState<{
    x: number;
    y: number;
    tags: InlineHoverTag[];
    references: InlineHoverReference[];
  } | null>(null);

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

  function applyInlineReferenceColors() {
    const root = editorWrapperRef.current;
    if (!root) return;

    const allColorClasses = Object.values(referenceColorClassMap).flat();

    const elements = root.querySelectorAll("[data-reference-id]");

    elements.forEach((element) => {
      const referenceId = element.getAttribute("data-reference-id");

      if (!referenceId) return;

      const index = referencesRef.current.findIndex(
        (reference) => reference.id === referenceId,
      );

      const color = getReferenceColorByIndex(index >= 0 ? index : 0);
      const classes = referenceColorClassMap[color];

      element.classList.remove(...allColorClasses);
      element.classList.add(...classes);

      element.setAttribute("data-reference-color-applied", color);
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

  const hydratedInitialContent = useMemo(() => {
    return hydrateInitialContent(initialContent, tagColorMap);
  }, [initialContent, tagColorMap]);

  function scheduleInlineStyles() {
    requestAnimationFrame(() => {
      applyInlineTagColors();
      applyInlineReferenceColors();
    });
  }

  const editor = useRichNoteEditor({
    initialContent: hydratedInitialContent,
    tags,
    onChange,
    onTagUsed,
    applyInlineTagColors: scheduleInlineStyles,
  });

  useEffect(() => {
    scheduleInlineStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tagColorMap, tags, references]);

  if (!editor) {
    return null;
  }

function getInlineConnectionsFromTarget(target: HTMLElement) {
  const foundTags = new Map<string, InlineHoverTag>();
  const foundReferences = new Map<string, InlineHoverReference>();

  let current: HTMLElement | null = target;

  while (current && current !== editorWrapperRef.current) {
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
        foundTags.set(tag.id, {
          id: tag.id,
          name: tag.name,
        });
      }
    }

    const referenceId = current.dataset.referenceId;

    if (
      (current.matches("[data-reference-mark]") ||
        current.hasAttribute("data-reference-id")) &&
      referenceId
    ) {
      const reference = references.find((item) => item.id === referenceId);

      if (reference) {
        foundReferences.set(reference.id, {
          id: reference.id,
          title: getReferenceLabel(reference),
        });
      }
    }

    current = current.parentElement;
  }

  return {
    tags: Array.from(foundTags.values()),
    references: Array.from(foundReferences.values()),
  };
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
        const referenceTitle = mark.attrs.referenceTitle as string | undefined;
        const key = referenceId || referenceTitle;

        if (key) {
          foundReferences.set(key, { referenceId, referenceTitle });
        }
      }
    });
  });

  editor?.state.doc.nodesBetween(from, to, (node) => {
    if (node.type.name !== "mention") return;

    const tagId = typeof node.attrs.id === "string" ? node.attrs.id : undefined;

    const tagName =
      typeof node.attrs.tagName === "string"
        ? node.attrs.tagName
        : typeof node.attrs.label === "string"
          ? node.attrs.label
          : undefined;

    const key = tagId || tagName;

    if (key) {
      foundTags.set(key, { tagId, tagName });
    }
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

    const tagLabel = tagToRemove.tagName
      ? `#${tagToRemove.tagName}`
      : "this tag";

    openConfirmDialog({
      title: "Remove inline tag?",
      message: `Remove ${tagLabel} from the selected text?\n\nThe text will stay.`,
      confirmLabel: "Remove tag",
      cancelLabel: "Keep tag",
      variant: "danger",
      onConfirm: () => {
        removeInlineTagFromEditorSelection(tagToRemove);
      },
    });
  }

  function removeInlineTagFromEditorSelection(tagToRemove: ContextMenuTag) {
    if (!editor || !contextMenu) return;

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === "mention") {
            const mentionTagId =
              typeof node.attrs.id === "string" ? node.attrs.id : undefined;

            const mentionTagName =
              typeof node.attrs.tagName === "string"
                ? node.attrs.tagName
                : typeof node.attrs.label === "string"
                  ? node.attrs.label
                  : undefined;

            const sameMentionTag =
              (tagToRemove.tagId && mentionTagId === tagToRemove.tagId) ||
              (tagToRemove.tagName &&
                mentionTagName?.toLowerCase() ===
                  tagToRemove.tagName.toLowerCase());

            if (sameMentionTag) {
              tr.delete(pos, pos + node.nodeSize);
            }

            return;
          }

          if (!node.isText) return;

          node.marks.forEach((mark) => {
            if (mark.type.name !== "tagMark") return;

            const markTagId = mark.attrs.tagId as string | undefined;
            const markTagName = mark.attrs.tagName as string | undefined;

            const sameTag =
              (tagToRemove.tagId && markTagId === tagToRemove.tagId) ||
              (tagToRemove.tagName &&
                markTagName?.toLowerCase() ===
                  tagToRemove.tagName.toLowerCase());

            if (!sameTag) return;

            const markFrom = Math.max(pos, from);
            const markTo = Math.min(pos + node.nodeSize, to);

            tr.removeMark(markFrom, markTo, mark.type);
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

    scheduleInlineStyles();
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

    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .setMark("tagMark", {
        tagId: tag.id,
        tagName: tag.name,
        color: tag.color ?? "blue",
      })
      .run();

    onTagUsed?.(tag.name);

    requestAnimationFrame(() => {
      onChange({
        plainText: editor.getText(),
        json: JSON.stringify(editor.getJSON()),
      });

      scheduleInlineStyles();
    });

    closeContextMenu();
  }

  function createTagFromSelection() {
    if (!editor || !selectedText || !contextMenu) return;

    const tagName = selectedText.trim().replace(/^#/, "").toLowerCase();
    const { from, to } = contextMenu;

    editor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .setMark("tagMark", {
        tagId: `new:${tagName}`,
        tagName,
        color: tagColorMapRef.current[tagName] ?? "blue",
      })
      .run();

    onTagUsed?.(tagName);

    requestAnimationFrame(() => {
      onChange({
        plainText: editor.getText(),
        json: JSON.stringify(editor.getJSON()),
      });

      scheduleInlineStyles();
    });

    closeContextMenu();
  }

  function getSafeContextMenuPosition(
    x: number,
    y: number,
    menuMode: "full" | "removeOnly" = "full",
  ) {
    const menuWidth = 256;

    const estimatedMenuHeight = menuMode === "removeOnly" ? 110 : 420;

    const padding = 12;
    const gap = 6;

    let safeX = x;

    if (safeX + menuWidth > window.innerWidth - padding) {
      safeX = window.innerWidth - menuWidth - padding;
    }

    let safeY = y - estimatedMenuHeight - gap;

    if (safeY < padding) {
      safeY = y + gap;
    }

    if (safeY + estimatedMenuHeight > window.innerHeight - padding) {
      safeY = window.innerHeight - estimatedMenuHeight - padding;
    }

    return {
      x: Math.max(padding, safeX),
      y: Math.max(padding, safeY),
    };
  }

  function getMarkRangeAtPosition(
    pos: number,
    markName: "tagMark" | "referenceMark",
  ): {
    from: number;
    to: number;
    mark: ProseMirrorMark;
  } | null {
    if (!editor) return null;

    const { doc, schema } = editor.state;
    const markType = schema.marks[markName];

    if (!markType) return null;

    const resolvedPos = doc.resolve(pos);
    const parent = resolvedPos.parent;
    const parentStart = resolvedPos.start();

    let found: {
      from: number;
      to: number;
      mark: ProseMirrorMark;
    } | null = null;

    parent.forEach((node, offset) => {
      if (found || !node.isText) return;

      const from = parentStart + offset;
      const to = from + node.nodeSize;

      if (pos < from || pos > to) return;

      const mark = node.marks.find((item) => item.type === markType);

      if (!mark) return;

      let rangeFrom = from;
      let rangeTo = to;

      parent.forEach((sibling, siblingOffset) => {
        if (!sibling.isText) return;

        const siblingFrom = parentStart + siblingOffset;
        const siblingTo = siblingFrom + sibling.nodeSize;

        const hasSameMark = sibling.marks.some(
          (siblingMark) =>
            siblingMark.type === markType &&
            JSON.stringify(siblingMark.attrs) === JSON.stringify(mark.attrs),
        );

        if (hasSameMark && siblingTo <= from) {
          rangeFrom = Math.min(rangeFrom, siblingFrom);
        }

        if (hasSameMark && siblingFrom >= to) {
          rangeTo = Math.max(rangeTo, siblingTo);
        }
      });

      found = {
        from: rangeFrom,
        to: rangeTo,
        mark,
      };
    });

    return found;
  }

  function getMentionRangeAtPosition(pos: number): InlineMentionRange | null {
    if (!editor) return null;

    const { doc } = editor.state;

    let found: InlineMentionRange | null = null;

    doc.descendants((node, nodePos) => {
      if (found) return false;

      if (node.type.name !== "mention") return true;

      const from = nodePos;
      const to = nodePos + node.nodeSize;

      if (pos < from - 1 || pos > to + 1) return true;

      const tagId =
        typeof node.attrs.id === "string" ? node.attrs.id : undefined;

      const tagName =
        typeof node.attrs.tagName === "string"
          ? node.attrs.tagName
          : typeof node.attrs.label === "string"
            ? node.attrs.label
            : undefined;

      found = {
        from,
        to,
        tagId,
        tagName,
      };

      return false;
    });

    return found;
  }

  function removeReferenceEverywhere(referenceToRemove: ContextMenuReference) {
    if (!editor) return;

    const label = referenceToRemove.referenceTitle
      ? ` (${referenceToRemove.referenceTitle})`
      : "";

    const confirmed = window.confirm(
      `Remove this reference${label} from all linked text in this note? The text will stay.`,
    );

    if (!confirmed) return;

    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (!node.isText) return;

          node.marks.forEach((mark) => {
            if (mark.type.name !== "referenceMark") return;

            const sameReference =
              (referenceToRemove.referenceId &&
                mark.attrs.referenceId === referenceToRemove.referenceId) ||
              (referenceToRemove.referenceTitle &&
                mark.attrs.referenceTitle === referenceToRemove.referenceTitle);

            if (!sameReference) return;

            tr.removeMark(
              pos,
              pos + node.nodeSize,
              state.schema.marks.referenceMark,
            );
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

    scheduleInlineStyles();
    closeContextMenu();
  }

  const hasRemoveActions =
    contextMenu &&
    (contextMenu.hasTagMark ||
      contextMenu.hasReferenceMark ||
      contextMenu.tags.length > 0 ||
      contextMenu.references.length > 0);

  return (
    <div
      className="
    overflow-hidden rounded-xl
    border border-[rgb(var(--border))]
    bg-[rgb(var(--card))]
    shadow-sm
  "
    >
      <RichNoteEditorToolbar editor={editor} />

      <div
        ref={editorWrapperRef}
        className="relative"
        onMouseMove={(event) => {
          const target = event.target as HTMLElement;

          const inlineElement = target.closest(inlineConnectionSelector);

          if (!inlineElement) {
            setHoverPreview(null);
            return;
          }

          const connections = getInlineConnectionsFromTarget(target);

          if (
            connections.tags.length === 0 &&
            connections.references.length === 0
          ) {
            setHoverPreview(null);
            return;
          }

          setHoverPreview({
            x: event.clientX,
            y: event.clientY,
            tags: connections.tags,
            references: connections.references,
          });
        }}
        onMouseLeave={() => {
          setHoverPreview(null);
        }}
        onContextMenu={(event) => {
          event.preventDefault();

          const position = getSafeContextMenuPosition(
            event.clientX,
            event.clientY,
          );

          const view = editor.view;
          const posAtCoords = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (posAtCoords) {
            const mentionRange = getMentionRangeAtPosition(posAtCoords.pos);
            const tagRange = getMarkRangeAtPosition(posAtCoords.pos, "tagMark");
            const referenceRange = getMarkRangeAtPosition(
              posAtCoords.pos,
              "referenceMark",
            );

            const isRemoveOnly = !!mentionRange;

            const position = getSafeContextMenuPosition(
              event.clientX,
              event.clientY,
              isRemoveOnly ? "removeOnly" : "full",
            );

            if (mentionRange) {
              const from = mentionRange.from;
              const to = mentionRange.to;
              const tagName = mentionRange.tagName ?? "";
              const tagId = mentionRange.tagId;

              setSelectedText(tagName ? `#${tagName}` : "");

              setContextMenu({
                x: position.x,
                y: position.y,
                from,
                to,
                mode: "removeOnly",
                tags: tagName || tagId ? [{ tagId, tagName }] : [],
                references: [],
                hasTagMark: !!(tagName || tagId),
                hasReferenceMark: false,
              });

              return;
            }

            const markRange = tagRange ?? referenceRange;

            if (markRange) {
              const from = markRange.from;
              const to = markRange.to;

              const text = editor.state.doc.textBetween(from, to, " ");
              const markInfo = getSelectedMarkInfo(from, to);

              setSelectedText(text.trim());

              setContextMenu({
                x: position.x,
                y: position.y,
                from,
                to,
                mode: "full",
                ...markInfo,
              });

              return;
            }
          }

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
            mode: "full",
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

  min-h-[260px]
  bg-[rgb(var(--card))]
  px-4 py-4
  text-sm text-[rgb(var(--text))]
`}
        />

        {contextMenu && (
          <RichNoteContextMenu
            menuRef={menuRef}
            contextMenu={contextMenu}
            selectedText={selectedText}
            tags={tags}
            references={references}
            selectedReferenceIds={selectedReferenceIds}
            inlineReferenceIds={inlineReferenceIds}
            hasRemoveActions={!!hasRemoveActions}
            getReferenceLabel={getReferenceLabel}
            onHighlightSelection={highlightSelection}
            onCreateTagFromSelection={createTagFromSelection}
            onTagSelection={tagSelection}
            onLinkSelectionToReference={linkSelectionToReference}
            onRemoveTag={removeSpecificTagFromSelection}
            onRemoveReference={removeSpecificReferenceFromSelection}
            onRemoveReferenceEverywhere={removeReferenceEverywhere}
          />
        )}
        {typeof document !== "undefined" &&
          hoverPreview &&
          !contextMenu &&
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
                        {reference.title}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
