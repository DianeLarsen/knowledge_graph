export type TipTapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export function textNode(text: string, marks?: TipTapMark[]) {
  return {
    type: "text",
    text,
    ...(marks?.length ? { marks } : {}),
  };
}

export function paragraph(content: ReturnType<typeof textNode>[]) {
  return {
    type: "paragraph",
    content,
  };
}

export function makeContentJson(content: unknown[]) {
  return JSON.stringify({
    type: "doc",
    content,
  });
}

export function tagMark(tagId: string, tagName: string): TipTapMark {
  return {
    type: "tagMark",
    attrs: {
      tagId,
      tagName,
    },
  };
}

export function referenceMark(referenceId: string, label: string): TipTapMark {
  return {
    type: "referenceMark",
    attrs: {
      referenceId,
      label,
    },
  };
}

export function highlightMark(): TipTapMark {
  return {
    type: "highlight",
  };
}

export function requireSeedValue<T>(
  value: T | null | undefined,
  label: string,
): T {
  if (!value) {
    throw new Error(`Failed to create seed value: ${label}`);
  }

  return value;
}
