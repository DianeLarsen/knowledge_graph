import type { Tag } from "@/db/schema";
import type { TagColor } from "@/lib/types/tags/tagColors";
import type { AiSuggestedTag } from "../editorTypes";

export type EditorJsonMark = {
  type?: string;
  attrs?: {
    tagId?: string;
    tagName?: string;
  };
};

export type EditorJsonNode = {
  type?: string;
  attrs?: {
    tagName?: string;
    label?: string;
    id?: string;
    [key: string]: unknown;
  };
  marks?: EditorJsonMark[];
  content?: EditorJsonNode[];
  text?: string;
};

export function normalizeTagName(value: string) {
  return value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function extractTagNamesFromContentJson(contentJson: string | null) {
  if (!contentJson) return [];

  try {
    const parsed = JSON.parse(contentJson) as EditorJsonNode;
    const tagNames = new Set<string>();

    function walk(node: EditorJsonNode) {
      node.marks?.forEach((mark) => {
        if (mark.type === "tagMark" && mark.attrs?.tagName) {
          tagNames.add(normalizeTagName(mark.attrs.tagName));
        }
      });

      if (node.type === "mention") {
        const tagName =
          typeof node.attrs?.tagName === "string"
            ? node.attrs.tagName
            : typeof node.attrs?.label === "string"
              ? node.attrs.label
              : "";

        if (tagName) {
          tagNames.add(normalizeTagName(tagName));
        }
      }

      node.content?.forEach(walk);
    }

    walk(parsed);

    return Array.from(tagNames);
  } catch {
    return [];
  }
}

export function removeInlineTagMarksFromContentJson({
  contentJson,
  tagName,
  mode = "keepText",
}: {
  contentJson: string;
  tagName: string;
  mode?: "keepText" | "removeText";
}) {
  if (!contentJson) return contentJson;

  try {
    const parsed = JSON.parse(contentJson) as EditorJsonNode;
    const normalizedTarget = normalizeTagName(tagName);

    function walk(node: EditorJsonNode): EditorJsonNode | null {
      if (node.type === "mention") {
        const mentionTagName =
          typeof node.attrs?.tagName === "string"
            ? node.attrs.tagName
            : typeof node.attrs?.label === "string"
              ? node.attrs.label
              : "";

        const mentionTagId =
          typeof node.attrs?.id === "string" ? node.attrs.id : "";

        const normalizedMentionName = normalizeTagName(mentionTagName);
        const normalizedMentionId = normalizeTagName(
          mentionTagId.replace(/^new:/, ""),
        );

        if (
          normalizedMentionName === normalizedTarget ||
          normalizedMentionId === normalizedTarget
        ) {
          if (mode === "removeText") {
            return null;
          }

          return {
            type: "text",
            text: mentionTagName ? `#${normalizeTagName(mentionTagName)}` : "",
          };
        }
      }

      const next: EditorJsonNode = { ...node };

      if (Array.isArray(next.marks)) {
        const hasMatchingTagMark = next.marks.some((mark) => {
          if (mark.type !== "tagMark") return false;

          const markTagName = normalizeTagName(mark.attrs?.tagName ?? "");
          const markTagId = normalizeTagName(mark.attrs?.tagId ?? "");

          return (
            markTagName === normalizedTarget || markTagId === normalizedTarget
          );
        });

        if (hasMatchingTagMark && mode === "removeText") {
          return null;
        }

        next.marks = next.marks.filter((mark) => {
          if (mark.type !== "tagMark") return true;

          const markTagName = normalizeTagName(mark.attrs?.tagName ?? "");
          const markTagId = normalizeTagName(mark.attrs?.tagId ?? "");

          return (
            markTagName !== normalizedTarget && markTagId !== normalizedTarget
          );
        });

        if (next.marks.length === 0) {
          delete next.marks;
        }
      }

      if (Array.isArray(next.content)) {
        next.content = next.content
          .map(walk)
          .filter((child): child is EditorJsonNode => child !== null);
      }

      return next;
    }

    const updated = walk(parsed);

    return JSON.stringify(updated);
  } catch {
    return contentJson;
  }
}

export function buildTagColorMap(tags: Tag[]) {
  return Object.fromEntries(
    tags.flatMap((tag) => {
      const color = (tag.color ?? "blue") as TagColor;

      return [
        [tag.id, color],
        [tag.name.toLowerCase(), color],
      ];
    }),
  ) as Record<string, TagColor>;
}

export function sameStringSetRaw(a: string[], b: string[]) {
  const aSet = new Set(a.filter(Boolean));
  const bSet = new Set(b.filter(Boolean));

  if (aSet.size !== bSet.size) return false;

  return Array.from(aSet).every((item) => bSet.has(item));
}

export function sameStringSetNormalized(
  a: string[],
  b: string[],
  normalize: (value: string) => string,
) {
  const aSet = new Set(a.map(normalize).filter(Boolean));
  const bSet = new Set(b.map(normalize).filter(Boolean));

  if (aSet.size !== bSet.size) return false;

  return Array.from(aSet).every((item) => bSet.has(item));
}

export function getInitialSelectedReferenceIds(
  noteReferences: { id: string }[],
) {
  return noteReferences.map((reference) => reference.id);
}

export function getInitialSelectedTagNames(noteTags: { name: string }[]) {
  return noteTags.map((tag) => normalizeTagName(tag.name));
}

export function getInitialInlineTagNames(contentJson: string | null) {
  return extractTagNamesFromContentJson(contentJson).map(normalizeTagName);
}
export function getCurrentTags({
  tags,
  selectedTagNames,
}: {
  tags: Tag[];
  selectedTagNames: string[];
}) {
  const selectedTagNameSet = new Set(selectedTagNames.map(normalizeTagName));

  return tags.filter((tag) =>
    selectedTagNameSet.has(normalizeTagName(tag.name)),
  );
}

export function getSelectedNewTagNames({
  tags,
  selectedTagNames,
}: {
  tags: Tag[];
  selectedTagNames: string[];
}) {
  return selectedTagNames.filter(
    (tagName) =>
      !tags.some(
        (tag) => normalizeTagName(tag.name) === normalizeTagName(tagName),
      ),
  );
}

export function getOtherTags({
  tags,
  selectedTagNames,
  inlineTagNames,
}: {
  tags: Tag[];
  selectedTagNames: string[];
  inlineTagNames: string[];
}) {
  const selectedTagNameSet = new Set(selectedTagNames.map(normalizeTagName));
  const inlineTagNameSet = new Set(inlineTagNames.map(normalizeTagName));

  return tags.filter((tag) => {
    const tagName = normalizeTagName(tag.name);

    return !selectedTagNameSet.has(tagName) && !inlineTagNameSet.has(tagName);
  });
}

export function buildAiSuggestedTags({
  existingTagNames,
  newTagNames,
}: {
  existingTagNames: string[];
  newTagNames: string[];
}): AiSuggestedTag[] {
  const existingSuggestions = existingTagNames.map((name) => ({
    name: normalizeTagName(name),
    exists: true,
  }));

  const newSuggestions = newTagNames.map((name) => ({
    name: normalizeTagName(name),
    exists: false,
  }));

  return [...existingSuggestions, ...newSuggestions]
    .filter((tag) => tag.name)
    .filter(
      (tag, index, array) =>
        array.findIndex((item) => item.name === tag.name) === index,
    );
}

export function getFinalReferenceIds({
  selectedReferenceIds,
  inlineReferenceIds,
}: {
  selectedReferenceIds: string[];
  inlineReferenceIds: string[];
}) {
  return Array.from(new Set([...selectedReferenceIds, ...inlineReferenceIds]));
}

export function getFinalTagNames({
  selectedTagNames,
  contentJson,
}: {
  selectedTagNames: string[];
  contentJson: string;
}) {
  const inlineTagNamesFromContent = extractTagNamesFromContentJson(contentJson);

  return Array.from(
    new Set(
      [...selectedTagNames, ...inlineTagNamesFromContent]
        .map(normalizeTagName)
        .filter(Boolean),
    ),
  );
}