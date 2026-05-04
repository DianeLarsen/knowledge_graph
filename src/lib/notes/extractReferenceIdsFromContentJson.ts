type TipTapNode = {
  type?: string;
  text?: string;
  marks?: {
    type?: string;
    attrs?: {
      referenceId?: string | null;
    };
  }[];
  content?: TipTapNode[];
};

export function extractReferenceIdsFromContentJson(contentJson: string) {
  if (!contentJson) return [];

  try {
    const parsed = JSON.parse(contentJson) as TipTapNode;

    const referenceIds = new Set<string>();

    function walk(node: TipTapNode) {
      node.marks?.forEach((mark) => {
        if (mark.type === "referenceMark" && mark.attrs?.referenceId) {
          referenceIds.add(mark.attrs.referenceId);
        }
      });

      node.content?.forEach(walk);
    }

    walk(parsed);

    return Array.from(referenceIds);
  } catch {
    return [];
  }
}
