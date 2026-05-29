import { type RelationshipType } from "@/db/schema";
import { getRelationshipLabel } from "@/lib/entityRelationships";
import type {
  LinkedEventSummary,
  LinkedTaskSummary,
  Backlink,
  OutgoingLink,
  SharedTagNote,
} from "./noteCardTypes";

type RichTextNode = {
  type?: string;
  attrs?: {
    tagId?: string;
    id?: string;
    tagName?: string;
  };
  marks?: {
    type?: string;
    attrs?: {
      tagId?: string;
      tagName?: string;
    };
  }[];
  content?: RichTextNode[];
};

export function getInlineTagInfo(contentJson: string | null) {
  const ids = new Set<string>();
  const names = new Set<string>();

  if (!contentJson) {
    return { ids, names };
  }

  try {
    const doc: RichTextNode = JSON.parse(contentJson);

    function walk(node: RichTextNode) {
      if (!node) return;

      node.marks?.forEach((mark) => {
        if (mark.type === "tagMark") {
          if (mark.attrs?.tagId) ids.add(mark.attrs.tagId);

          if (mark.attrs?.tagName) {
            names.add(mark.attrs.tagName.toLowerCase());
          }
        }
      });

      if (node.type === "mention") {
        if (node.attrs?.id) ids.add(node.attrs.id);

        if (node.attrs?.tagName) {
          names.add(node.attrs.tagName.toLowerCase());
        }
      }

      node.content?.forEach(walk);
    }

    walk(doc);
  } catch {
    return { ids, names };
  }

  return { ids, names };
}

export function getLinkedItemLabel(link: {
  relationshipType: RelationshipType;
}) {
  return getRelationshipLabel(link.relationshipType);
}

export function getTaskStatusLabel(status: LinkedTaskSummary["status"]) {
  if (status === "done") return "Complete";
  if (status === "in_progress") return "In progress";
  if (status === "awaiting") return "Awaiting";
  if (status === "archived") return "Archived";

  return "To do";
}

export function getEventStatusLabel(status: LinkedEventSummary["status"]) {
  if (status === "done") return "Past";
  if (status === "cancelled") return "Cancelled";

  return "Planned";
}

export function getEventDateLabel(event: LinkedEventSummary) {
  if (!event.endDate || event.endDate === event.startDate) {
    return event.startDate;
  }

  return `${event.startDate} → ${event.endDate}`;
}

export function getLinkPillClass({
  itemType,
  taskStatus,
  eventStatus,
  direction,
}: {
  itemType: string;
  taskStatus?: LinkedTaskSummary["status"];
  eventStatus?: LinkedEventSummary["status"];
  direction: "outgoing" | "backlink";
}) {
  if (itemType === "task") {
    if (taskStatus === "done") {
      return "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-200";
    }

    return "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200";
  }

  if (itemType === "event") {
    if (eventStatus === "done") {
      return "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
    }

    return "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200";
  }

  if (direction === "backlink") {
    return "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300";
  }

  return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
}

export function noteContentHasInlineTag({
  contentJson,
  tagId,
  tagName,
}: {
  contentJson: string | null;
  tagId: string;
  tagName: string;
}) {
  if (!contentJson) return false;

  try {
    const parsed = JSON.parse(contentJson) as RichTextNode;
    const targetName = tagName.toLowerCase();

    function walk(node: RichTextNode): boolean {
      if (Array.isArray(node.marks)) {
        const hasTag = node.marks.some((mark) => {
          if (mark.type !== "tagMark") return false;

          const markTagId = mark.attrs?.tagId;
          const markTagName = mark.attrs?.tagName?.toLowerCase();

          return markTagId === tagId || markTagName === targetName;
        });

        if (hasTag) return true;
      }

      if (Array.isArray(node.content)) {
        return node.content.some(walk);
      }

      return false;
    }

    return walk(parsed);
  } catch {
    return false;
  }
}

export function isOutgoingLink(
  link: OutgoingLink | Backlink,
): link is OutgoingLink {
  return "targetTitle" in link;
}

export function getPopupPosition(x: number, y: number) {
  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 260;
  const GAP = 12;
  const PADDING = 16;

  if (typeof window === "undefined") {
    return {
      left: x + GAP,
      top: y + GAP,
    };
  }

  let left = x + GAP;
  let top = y + GAP;

  if (left + CARD_WIDTH > window.innerWidth - PADDING) {
    left = x - CARD_WIDTH - GAP;
  }

  if (top + CARD_HEIGHT > window.innerHeight - PADDING) {
    top = window.innerHeight - CARD_HEIGHT - PADDING;
  }

  left = Math.max(PADDING, left);
  top = Math.max(PADDING, top);

  return { left, top };
}
export function filterOutgoingLinks(
  outgoingLinks: OutgoingLink[],
  search: string,
) {
  if (!search) return outgoingLinks;

  return outgoingLinks.filter((link) => {
    const title = link.targetTitle ?? "";
    const label = getLinkedItemLabel(link);
    const type = link.targetType;

    return `${title} ${label} ${type}`.toLowerCase().includes(search);
  });
}

export function filterBacklinks(backlinks: Backlink[], search: string) {
  if (!search) return backlinks;

  return backlinks.filter((link) => {
    const title = link.sourceTitle ?? "";
    const label = getRelationshipLabel(link.relationshipType);
    const type = link.sourceType;

    return `${title} ${label} ${type}`.toLowerCase().includes(search);
  });
}

export function filterSharedTags(sharedTags: SharedTagNote[], search: string) {
  if (!search) return sharedTags;

  return sharedTags.filter((related) => {
    return `${related.title} ${related.sharedTagName}`
      .toLowerCase()
      .includes(search);
  });
}